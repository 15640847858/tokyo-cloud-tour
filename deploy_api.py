#!/usr/bin/env python3
"""deploy.py twin that talks to the Vercel REST API directly, using the
custom.vercel-api token connection (the bundled MCP connector cannot grant
team access — every team-scoped call 403s). Assembly logic mirrors deploy.py
exactly: same minification, same file set; only the transport differs."""
import subprocess, json, pathlib, hashlib, re, sys, glob as _glob
sys.path.insert(0, "/home/hatch/workspace/custom-connectors/custom.vercel-api/bin")
from vercel_api import request

TEAM = "team_PSusFXj3qORSysou0scjfPcY"
Q = "?teamId=" + TEAM
base = pathlib.Path(__file__).parent


def upload_blob(blob, dg):
    status, payload = request("POST", "/v2/files" + Q, raw=blob,
                              extra_headers={"x-vercel-digest": dg,
                                             "Content-Type": "application/octet-stream"})
    assert status == 200, "upload failed %s: %s" % (status, str(payload)[:300])
    return status


html = (base / "index.html").read_text()
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
subprocess.run(["node", "--check", "/tmp/app_min.mjs"], check=True)
_minjs_blob = pathlib.Path("/tmp/app_min.mjs").read_bytes()
assert len(_minjs_blob) < 98000, "main.js too big: %d" % len(_minjs_blob)
_minjs_dg = hashlib.sha1(_minjs_blob).hexdigest()
upload_blob(_minjs_blob, _minjs_dg)
print("module upload main.js ok, bytes:", len(_minjs_blob))
MAINJS_REF = {"file": "main.js", "sha": _minjs_dg, "size": len(_minjs_blob)}
deploy_html = html[:mm.start()] + '<script type="module" src="main.js"></script>' + html[mm.end():]
print("deploy html bytes:", len(deploy_html.encode()))

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
    upload_blob(_blob, _dg)
    print("info upload ok, bytes:", len(_blob))

ASSETS = [("cabin.html", "cabin.html"), ("cabin.html", "cabin/index.html"), ("data/kaedena.jpg", "kaedena.jpg"), ("data/favicon.svg", "favicon.svg"), ("data/apple-touch-icon.png", "apple-touch-icon.png"), ("data/favicon-32.png", "favicon-32.png"), ("data/torii_quaternius.glb", "torii_quaternius.glb"), ("data/news.json", "news.json")]
for _p in sorted(_glob.glob(str(base / "data" / "info_*.json"))) + [str(base / "data" / "i18n_ui.js"), str(base / "data" / "narr_ui.js")]:
    ASSETS.append(("data/" + pathlib.Path(_p).name, pathlib.Path(_p).name))
asset_refs = []
_mb = re.search(r"const BUILD='([^']+)'", pathlib.Path('index.html').read_text())
pathlib.Path('build.txt').write_text(_mb.group(1) if _mb else 'dev')
ASSETS.append(('build.txt', 'build.txt'))
for src, name in ASSETS:
    blob = (base / src).read_bytes()
    dg = hashlib.sha1(blob).hexdigest()
    upload_blob(blob, dg)
    print("asset upload ok:", name)
    asset_refs.append({"file": name, "sha": dg, "size": len(blob)})

files_extra = []
for _src, _name in (("builders_src.js", "builders.js"), ("builders2_src.js", "builders2.js"), ("airports_src.js", "airports.js"), ("audio_src.js", "audio.js"), ("news_src.js", "news.js")):
    subprocess.run(["npx", "-y", "esbuild@0.20.2", str(base / _src), "--minify", "--charset=utf8",
                    "--outfile=/tmp/mod_min.js"], check=True, capture_output=True, text=True)
    subprocess.run(["node", "--check", "/tmp/mod_min.js"], check=True)
    _blob = pathlib.Path("/tmp/mod_min.js").read_bytes()
    _dg = hashlib.sha1(_blob).hexdigest()
    upload_blob(_blob, _dg)
    print("module upload ok:", _name, "bytes:", len(_blob))
    files_extra.append({"file": _name, "sha": _dg, "size": len(_blob)})

manifest = json.loads((base / "data/upload_manifest.json").read_text())
files = [{"file": "index.html", "data": deploy_html, "encoding": "utf-8"},
         {"file": "info.json", "sha": digest, "size": len(info)},
         {"file": "info2.json", "sha": digest2, "size": len(info2)}]
files.append(MAINJS_REF)
files.extend(files_extra)
files.extend(asset_refs)
for name, m in sorted(manifest.items()):
    files.append({"file": name, "sha": m["sha"], "size": m["size"]})
body = {"name": "tokyo-cloud-tour", "target": "production", "files": files,
        "projectSettings": {"framework": None, "buildCommand": None, "devCommand": None}}
status, payload = request("POST", "/v13/deployments" + Q, body=body)
if status not in (200, 201):
    print("create_deployment failed:", status, json.dumps(payload, ensure_ascii=False)[:600])
    sys.exit(1)
print("deploy:", payload.get("id"), payload.get("readyState"), payload.get("url"))
