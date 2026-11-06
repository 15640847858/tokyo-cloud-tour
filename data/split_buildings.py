#!/usr/bin/env python3
"""Split data/buildings.bin into bldg0.bin..bldgN.bin chunks + upload_manifest.json.

The Vercel upload channel caps a single file argument at ~128KB, so the
building data is deployed as fixed-size chunks (65,536 bytes each) that the
page fetches in order and concatenates at runtime. Each chunk's SHA1 and
size are recorded in data/upload_manifest.json, which deploy.py references
verbatim when creating a deployment.

Defaults match the project layout (this script lives in data/):
  input   : data/buildings.bin
  chunks  : <project root>/bldg{i}.bin
  manifest: data/upload_manifest.json

Override with --bin / --out-dir / --manifest. See docs/backup-and-restore.md.
"""
import argparse, hashlib, json, pathlib

CHUNK = 65536


def main():
    here = pathlib.Path(__file__).resolve().parent
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--bin', default=str(here / 'buildings.bin'))
    ap.add_argument('--out-dir', default=str(here.parent))
    ap.add_argument('--manifest', default=str(here / 'upload_manifest.json'))
    a = ap.parse_args()

    data = pathlib.Path(a.bin).read_bytes()
    out_dir = pathlib.Path(a.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    manifest = {}
    n = (len(data) + CHUNK - 1) // CHUNK
    for i in range(n):
        part = data[i * CHUNK:(i + 1) * CHUNK]
        name = f'bldg{i}.bin'
        (out_dir / name).write_bytes(part)
        manifest[name] = {'sha': hashlib.sha1(part).hexdigest(), 'size': len(part)}

    pathlib.Path(a.manifest).write_text(json.dumps(manifest, indent=1) + '\n')
    total = sum(m['size'] for m in manifest.values())
    print(f'{n} chunks, total {total} bytes (input {len(data)} bytes)')
    assert total == len(data), 'chunk total does not match input size'


if __name__ == '__main__':
    main()
