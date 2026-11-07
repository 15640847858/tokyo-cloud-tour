#!/usr/bin/env python3
"""Split the Tokyo Tower voxel GLB into 64KB chunks for deployment.

data/tokyo_tower_voxel.glb is 188,500 bytes — over the single-file
upload limit of the deploy pipeline (same limit that split
buildings.bin). Following the buildings.bin precedent, the GLB is
served as tt0.bin/tt1.bin/tt2.bin (referenced in
data/upload_manifest.json, uploaded by digest) and reassembled at
runtime by the swap code in index.html before GLTFLoader.parse().

Run from the project root:  python3 data/split_glb.py
The chunk blobs must be uploaded once with the vercel upload_file
tool (digest = sha1 of each chunk) before a deployment can reference
them — same one-time step the bldg*.bin chunks went through.
"""
import hashlib, json, pathlib

base = pathlib.Path(__file__).parent.parent
src = base / "data" / "tokyo_tower_voxel.glb"
CHUNK = 65536

blob = src.read_bytes()
names = []
manifest_path = base / "data" / "upload_manifest.json"
manifest = json.loads(manifest_path.read_text())
for i in range(0, len(blob), CHUNK):
    part = blob[i:i + CHUNK]
    name = f"tt{i // CHUNK}.bin"
    (base / "data" / name).write_bytes(part)
    manifest[name] = {"sha": hashlib.sha1(part).hexdigest(), "size": len(part)}
    names.append(name)
manifest_path.write_text(json.dumps(manifest, indent=1))
print("wrote", names, "total", len(blob), "bytes")
