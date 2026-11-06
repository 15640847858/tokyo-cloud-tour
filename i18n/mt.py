#!/usr/bin/env python3
"""Machine-translate info.json content + spot descs + route fields into ja/en/ko/hi
via the Google Translate gtx endpoint (build-time only; output is static JSON)."""
import urllib.request, urllib.parse, json, pathlib, re, time, sys

base = pathlib.Path(__file__).parent.parent
SEP = "\n@@\n"

def gtx(text, tl, tries=3):
    for a in range(tries):
        try:
            u = 'https://translate.googleapis.com/translate_a/single?' + urllib.parse.urlencode(
                {'client': 'gtx', 'sl': 'zh-CN', 'tl': tl, 'dt': 't', 'q': text})
            req = urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0'})
            j = json.load(urllib.request.urlopen(req, timeout=40))
            return ''.join(seg[0] for seg in j[0] if seg and seg[0])
        except Exception as e:
            print('  retry', tl, a, e); time.sleep(2 + a * 2)
    raise RuntimeError('gtx failed for ' + tl)

def translate_fields(fields, tl):
    """Translate a list of strings, batched; fall back to per-field on mismatch."""
    flat = [f.replace('\n', ' ') for f in fields]
    joined = SEP.join(flat)
    out = gtx(joined, tl)
    parts = [p.strip() for p in out.split('@@')]
    parts = [p for p in parts if p != '']
    if len(parts) != len(flat):
        # fallback: one by one
        parts = []
        for f in flat:
            parts.append(gtx(f, tl) if f else f)
            time.sleep(0.1)
    return parts

info = json.loads((base / 'data/info.json').read_text())
META = json.loads((pathlib.Path(__file__).parent / 'meta.json').read_text())
html = (base / 'index.html').read_text()

# descs for the 22 spots come from a node dump prepared by the caller (desc.json)
desc = json.loads((pathlib.Path(__file__).parent / 'desc.json').read_text())
# airport descs from source
m = re.findall(r"'((?:位于)[^']{20,120})'", html)
for aid, dtext in zip(['nrt', 'hnd'], m):
    desc[aid] = dtext

# routes fields
seg = html[html.index('const routes=['):]
seg = seg[:seg.index('];')]
routes_zh = []
for obj in re.finditer(r"\{name:'([^']*)', from:'([^']*)', to:'([^']*)', time:'([^']*)', fare:'([^']*)'", seg):
    routes_zh.append(list(obj.groups()))
print('routes found:', len(routes_zh))

IDS = list(info.keys())
print('spots:', len(IDS))

for tl in ['ja', 'en', 'ko', 'hi']:
    out = {}
    for sid in IDS:
        e = info[sid]
        fields = [e.get('facts', ''), e.get('hist', ''), e.get('now', ''), '', '', desc.get(sid, '')]
        # meta comes from index.html META dict — extracted to meta.json by caller
        fields[3], fields[4] = META[sid][0], META[sid][1]
        for d in (e.get('details') or []):
            fields += [d[0], d[1]]
        tr = translate_fields(fields, tl)
        ndet = len(e.get('details') or [])
        entry = {'facts': tr[0], 'hist': tr[1], 'now': tr[2], 'meta': [tr[3], tr[4]], 'desc': tr[5],
                 'details': [[tr[6 + i * 2], tr[7 + i * 2]] for i in range(ndet)]}
        out[sid] = entry
        print(tl, sid, 'ok', len(tr), 'fields')
        time.sleep(0.15)
    rfields = [f for r in routes_zh for f in r]
    rtr = translate_fields(rfields, tl)
    out['_routes'] = [rtr[i * 5:(i + 1) * 5] for i in range(len(routes_zh))]
    p = base / 'data' / f'info_{tl}.json'
    p.write_text(json.dumps(out, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    print('== wrote', p.name, p.stat().st_size, 'bytes')

