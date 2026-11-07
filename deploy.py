#!/usr/bin/env python3
"""Build (minify module JS) + deploy to Vercel production.
Master source stays readable in index.html; the deployed copy is minified
to stay under the create_deployment argument-size limit."""
import subprocess, json, pathlib, hashlib, re, sys, base64

base = pathlib.Path(__file__).parent
html = (base / "index.html").read_text()
# minify the <style> block too — the create_deployment argv limit (128KB)
# was exceeded once the module JS grew; CSS minification restores headroom
sm = re.search(r'<style>(.*?)</style>', html, re.S)
if sm:
    pathlib.Path("/tmp/app_style.css").write_text(sm.group(1))
    subprocess.run(["npx", "-y", "esbuild@0.20.2", "/tmp/app_style.css", "--minify",
                    "--outfile=/tmp/app_style_min.css"], check=True, capture_output=True, text=True)
    html = html[:sm.start(1)] + pathlib.Path("/tmp/app_style_min.css").read_text() + html[sm.end(1):]
mm = re.search(r'<script type="module">(.*?)</script>', html, re.S)
assert mm, "module script not found"
pathlib.Path("/tmp/app_src.mjs").write_text(mm.group(1))
subprocess.run(["npx", "-y", "esbuild@0.20.2", "/tmp/app_src.mjs", "--minify", "--charset=utf8",
                "--outfile=/tmp/app_min.mjs"], check=True, capture_output=True, text=True)
minjs = pathlib.Path("/tmp/app_min.mjs").read_text()
subprocess.run(["node", "--check", "/tmp/app_min.mjs"], check=True)
deploy_html = html[:mm.start(1)] + minjs + html[mm.end(1):]
print("deploy html bytes:", len(deploy_html.encode()))

# info.json outgrew the single-argument upload cap (~128KB): the master file
# stays whole locally; deploy uploads it as two halves (info.json + info2.json)
# and the page merges them at runtime.
_master = json.loads((base / "data/info.json").read_text())
_keys = list(_master.keys())
_half = (_len + 1) // 2 if (_len := len(_keys)) else 0
def _dump(keys):
    return json.dumps({k: _master[k] for k in keys}, ensure_ascii=False, separators=(',', ':')).encode()
info = _dump(_keys[:_half])
info2 = _dump(_keys[_half:])
digest = hashlib.sha1(info).hexdigest()
digest2 = hashlib.sha1(info2).hexdigest()
for _blob, _dg in ((info, digest), (info2, digest2)):
    up = {"xVercelDigest": _dg, "contentLength": len(_blob),
          "requestBody": base64.b64encode(_blob).decode()}
    r = subprocess.run(["/opt/hatch/bin/vercel", "call-tool", "--name", "upload_file",
                        "--arguments-json", json.dumps(up)], capture_output=True, text=True, timeout=180)
    print("info upload rc:", r.returncode, "bytes:", len(_blob))

# extra static assets (e.g. user-supplied photos) deployed alongside the site;
# each must be uploaded by digest and referenced in every deployment
ASSETS = [("data/kaedena.jpg", "kaedena.jpg"), ("data/favicon.svg", "favicon.svg"), ("data/apple-touch-icon.png", "apple-touch-icon.png"), ("data/favicon-32.png", "favicon-32.png"), ("data/torii_quaternius.glb", "torii_quaternius.glb")]
# i18n: UI dictionary script + per-language content files (globbed so new
# languages are picked up automatically; each must stay under ~95KB)
import glob as _glob
for _p in sorted(_glob.glob(str(base / "data" / "info_*.json"))) + [str(base / "data" / "i18n_ui.js")]:
    ASSETS.append(("data/" + pathlib.Path(_p).name, pathlib.Path(_p).name))
asset_refs = []
for src, name in ASSETS:
    blob = (base / src).read_bytes()
    dg = hashlib.sha1(blob).hexdigest()
    upa = {"xVercelDigest": dg, "contentLength": len(blob),
           "requestBody": base64.b64encode(blob).decode()}
    ra = subprocess.run(["/opt/hatch/bin/vercel", "call-tool", "--name", "upload_file",
                         "--arguments-json", json.dumps(upa)], capture_output=True, text=True, timeout=180)
    print("asset upload", name, "rc:", ra.returncode)
    asset_refs.append({"file": name, "sha": dg, "size": len(blob)})

# builders.js + airports.js: modules split out of the inline script (the
# inline deployment payload hit the argv cap); each minified + uploaded by
# digest like info.json, each kept under the ~95KB upload cap
files_extra = []
for _src, _name in (("builders_src.js", "builders.js"), ("builders2_src.js", "builders2.js"), ("airports_src.js", "airports.js"), ("audio_src.js", "audio.js")):
    subprocess.run(["npx", "-y", "esbuild@0.20.2", str(base / _src), "--minify", "--charset=utf8",
                    "--outfile=/tmp/mod_min.js"], check=True, capture_output=True, text=True)
    subprocess.run(["node", "--check", "/tmp/mod_min.js"], check=True)
    _blob = pathlib.Path("/tmp/mod_min.js").read_bytes()
    _dg = hashlib.sha1(_blob).hexdigest()
    _up = {"xVercelDigest": _dg, "contentLength": len(_blob),
           "requestBody": base64.b64encode(_blob).decode()}
    _r = subprocess.run(["/opt/hatch/bin/vercel", "call-tool", "--name", "upload_file",
                         "--arguments-json", json.dumps(_up)], capture_output=True, text=True, timeout=180)
    print("module upload", _name, "rc:", _r.returncode, "bytes:", len(_blob))
    files_extra.append({"file": _name, "sha": _dg, "size": len(_blob)})

manifest = json.loads((base / "data/upload_manifest.json").read_text())
files = [{"file": "index.html", "data": deploy_html, "encoding": "utf-8"},
         {"file": "info.json", "sha": digest, "size": len(info)},
         {"file": "info2.json", "sha": digest2, "size": len(info2)},
]
files.extend(files_extra)
files.extend(asset_refs)
for name, m in sorted(manifest.items()):
    files.append({"file": name, "sha": m["sha"], "size": m["size"]})
args = {"requestBody": {"name": "tokyo-cloud-tour", "target": "production", "files": files,
        "projectSettings": {"framework": None, "buildCommand": None, "devCommand": None}}}
r = subprocess.run(["/opt/hatch/bin/vercel", "call-tool", "--name", "create_deployment",
                    "--arguments-json", json.dumps(args, ensure_ascii=False)],
                   capture_output=True, text=True, timeout=180)
out = r.stdout
try:
    inner = json.loads(json.loads(out)["result"]["content"][0]["text"])
    d = inner["result"]["deployment"]
    print("deploy:", d["id"], d["state"])
except Exception:
    print(out[:900]); sys.exit(1)
