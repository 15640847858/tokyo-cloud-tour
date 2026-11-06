import ijson, math, struct, json, os, pathlib
# Paths are relative to this script's own directory (data/).
# Override with the BLDG_SRC / BLDG_OUT environment variables when needed.
_HERE = pathlib.Path(__file__).resolve().parent
SRC = pathlib.Path(os.environ.get("BLDG_SRC", _HERE/"buildings_raw.json"))
OUT = pathlib.Path(os.environ.get("BLDG_OUT", _HERE/"buildings.bin"))
LAT0, LON0, PR = 35.632, 139.776, 20000.0
def merc(lat):
    r = math.radians(lat); return math.log(math.tan(r) + 1/math.cos(r))
M0 = merc(LAT0); COS0 = math.cos(math.radians(LAT0))
def proj(lon, lat):
    return ((lon-LON0)*math.pi/180*PR*COS0, -(merc(lat)-M0)*PR)
def area_m2(geom):
    pts = [(float(g['lon'])*89600.0, float(g['lat'])*110950.0) for g in geom]
    a = 0.0
    for i in range(len(pts)-1):
        a += pts[i][0]*pts[i+1][1] - pts[i+1][0]*pts[i][1]
    return abs(a)/2
def parse_h(tags):
    h = tags.get('height')
    if h:
        try: return float(str(h).replace('m','').strip())
        except: pass
    lv = tags.get('building:levels')
    if lv:
        try: return float(lv)*3.2
        except: pass
    return None
def world_h(H, real, A):
    if real:
        return max(0.18, min(10.0, H * 0.030))
    est = 5.0 + min(12.0, A/800.0)
    return max(0.14, min(0.30, est * 0.030))
cands = []
n_total = 0
with open(SRC, 'rb') as f:
    for el in ijson.items(f, 'elements.item'):
        if el.get('type') != 'way': continue
        tags = el.get('tags') or {}
        if 'building' not in tags: continue
        geom = el.get('geometry') or []
        if len(geom) < 4: continue
        n_total += 1
        A = area_m2(geom)
        H = parse_h(tags)
        if A < 80 and (H is None or H < 18): continue
        # world coords, simplify: keep points >= 3m apart
        pts = []
        last = None
        for g in geom[:-1]:
            x, z = proj(float(g['lon']), float(g['lat']))
            if last is None or (x-last[0])**2 + (z-last[1])**2 > (3/319.0)**2:
                pts.append((x, z)); last = (x, z)
        if len(pts) < 3: continue
        if len(pts) > 12:
            step = len(pts)/12.0
            pts = [pts[int(i*step)] for i in range(12)]
        real = H is not None
        if H is None:
            H = min(28.0, 6.0 + A/300.0)
        score = A * (1 + H/30.0)
        cands.append((score, A, H, pts, real))
print("total ways:", n_total, "candidates:", len(cands))
cands.sort(key=lambda c: -c[0])
top = cands[:9000]
rest = [c for c in cands[9000:] if c[1] >= 150][::3][:5000]
sel = top + rest
sel.sort(key=lambda c: -c[0])
print("selected:", len(sel))
Q = 20.0  # 1 unit = 20 steps (0.05 unit)
buf = []
for score, A, H, pts, real in sel:
    hw = world_h(H, real, A)
    x0, z0 = pts[0]
    vals = [len(pts), int(round(hw*Q)), int(round((x0+80)*Q)), int(round((z0+80)*Q))]
    px, pz = x0, z0
    for (x, z) in pts[1:]:
        vals.append(int(round((x-px)*Q))); vals.append(int(round((z-pz)*Q)))
        px, pz = x, z
    buf.extend(vals)
data = struct.pack('<%dh' % len(buf), *buf)
OUT.write_bytes(data)
meta = {"buildings": len(sel), "int16_values": len(buf), "bytes": len(data)}
(OUT.parent/"buildings_meta.json").write_text(json.dumps(meta))
print(meta)
