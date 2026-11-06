# 备份与恢复说明 · Backup & Restore

本项目分三处存放：**GitHub 仓库**（源码与文本数据）、**GitHub Release
`backup-0398e05`**（二进制运行资源）、**本地工作区**（大数据源与中间产物）。
线上站点（ibun.fun）由 Vercel 静态部署承载，部署内容与下表“部署文件集”一致；
备份动作不改变任何线上地址。

## 文件清单与用途

| 文件 | 用途 | 存放 |
|---|---|---|
| `index.html` | 主程序（UI、3D 场景、卡片、音频） | 仓库 |
| `builders_src.js` | 景点建模 + 城市建筑生成器源码，部署时压缩为 `builders.js` | 仓库 |
| `data/info.json` | 26 处景点图文主数据（中文），部署时拆成 `info.json` + `info2.json` 两半上传，页面端合并 | 仓库 |
| `data/info_en/ja/ko.json`、`info_hi_1/2.json` | 四种语言的长文译文，切换语言时懒加载 | 仓库 |
| `data/i18n_ui.js` | 五种语言 UI 字符串（由 `i18n/build_ui.py` 生成） | 仓库 |
| `data/upload_manifest.json` | 8 个建筑分片的 SHA1 与大小，deploy.py 按此引用分片 | 仓库 |
| `data/buildings_meta.json` | 建筑数据统计（栋数/字节数） | 仓库 |
| `data/process_buildings.py` | 生成脚本：OSM 原始数据 → `buildings.bin` | 仓库 |
| `data/split_buildings.py` | 切片脚本：`buildings.bin` → `bldg0..7.bin` + manifest | 仓库 |
| `deploy.py` | 部署脚本（压缩 → 按 SHA 上传 → 创建 Vercel 部署） | 仓库 |
| `bldg0.bin`–`bldg7.bin` | **14,000 栋建筑数据**（Int16 流），页面运行时按序 fetch 并拼接 | **Release** |
| `data/buildings.bin` | 上述分片的未切分整体（拼接分片即得到它） | 本地（可由分片/脚本重建） |
| `data/buildings_raw.json` | OSM 原始导出（约 342MB），buildings.bin 的数据源 | 仅本地（待后续镜像） |
| `data/kaedena.jpg` | 镰仓景点照片（站长实拍，EXIF 已清空） | 本地 + 线上部署（待站长确认后进 Release） |
| `data/apple-touch-icon.png`、`data/favicon-32.png`、`data/favicon.svg` | 站点图标 | PNG 在 **Release**，SVG 在仓库 |
| 照片（景点图库） | 130 张景点照片热链 Wikimedia Commons，URL 在 info.json 中 | 外部（Commons） |

建筑数据基准校验值（2026-11-06）：`buildings.bin` 共 506,796 字节，
SHA1 = `fac94192a1d9a56aa209493e3eb89310388126d1`；分片校验值见
`data/upload_manifest.json`。

## 下载 Release 附件

网页：打开仓库的 Releases 页 → 选择 `backup-0398e05` → 在 Assets 中逐个下载。

直链（把 FILENAME 换成附件名）：

```text
https://github.com/15640847858/tokyo-cloud-tour/releases/download/backup-0398e05/FILENAME
```

命令行示例：

```bash
for i in 0 1 2 3 4 5 6 7; do
  curl -LO https://github.com/15640847858/tokyo-cloud-tour/releases/download/backup-0398e05/bldg$i.bin
done
curl -LO https://github.com/15640847858/tokyo-cloud-tour/releases/download/backup-0398e05/apple-touch-icon.png
curl -LO https://github.com/15640847858/tokyo-cloud-tour/releases/download/backup-0398e05/favicon-32.png
```

## 恢复 8 个建筑分片

1. 把 `bldg0.bin`–`bldg7.bin` 放到**项目根目录**（与 index.html 同级——
   页面以相对路径 `bldg{i}.bin` 拉取，deploy.py 也按根目录的 manifest 引用）。
2. 图标 PNG 放回 `data/` 目录。
3. 校验 SHA1（与 `data/upload_manifest.json` 对照）：

```bash
python3 - <<'EOF'
import hashlib, json, pathlib
man = json.loads(pathlib.Path('data/upload_manifest.json').read_text())
for name, m in sorted(man.items()):
    p = pathlib.Path(name)
    ok = p.exists() and hashlib.sha1(p.read_bytes()).hexdigest() == m['sha'] and p.stat().st_size == m['size']
    print(name, 'OK' if ok else 'MISMATCH')
EOF
```

八个分片按序拼接即等于 `data/buildings.bin`：

```bash
cat bldg0.bin bldg1.bin bldg2.bin bldg3.bin bldg4.bin bldg5.bin bldg6.bin bldg7.bin > data/buildings.bin
sha1sum data/buildings.bin   # 应为 fac94192a1d9a56aa209493e3eb89310388126d1
```

## 从 buildings.bin 重新生成分片

```bash
python3 data/split_buildings.py            # 默认读 data/buildings.bin，输出到项目根目录并重写 manifest
python3 data/split_buildings.py --help     # 可用 --bin / --out-dir / --manifest 覆盖路径
```

脚本按 65,536 字节定长切片（部署上传通道有约 128KB 单参数上限），并断言
分片总字节数与输入一致。生成后按上一节方法校验 SHA1。

## 从 OSM 原始数据重新生成 buildings.bin

```bash
pip install ijson
python3 data/process_buildings.py
```

- 输入 `data/buildings_raw.json`、输出 `data/buildings.bin` 与
  `data/buildings_meta.json`，路径均相对脚本所在目录；
  可用环境变量 `BLDG_SRC` / `BLDG_OUT` 覆盖。
- 处理逻辑：Web Mercator 投影（与页面同一组常数）、按面积与高度打分选取
  14,000 栋、轮廓简化后以 Int16 量化打包。
- 基准数据上全程约 20 秒；结果应与基准 SHA1 完全一致（已于 2026-11-07 验证）。

## 恢复本地开发环境

1. `git clone https://github.com/15640847858/tokyo-cloud-tour`（或下载仓库压缩包）。
2. 按上文恢复 Release 中的分片与图标。
3. （可选）如需重跑数据管线，再取回 `buildings_raw.json`（不在本轮备份范围，
   见“尚未备份”一节）。
4. 本地预览：`python3 -m http.server 8000` 后打开 http://localhost:8000
   （需联网加载 Three.js CDN、地图瓦片与 Commons 照片）。

## 恢复 Vercel 部署所需文件

一次完整部署的文件集（deploy.py 自动组装）：

- `index.html`（内联脚本/样式经 esbuild 压缩）
- `builders.js`（由 builders_src.js 压缩，按 SHA 上传）
- `info.json` + `info2.json`（主数据拆两半，按 SHA 上传，页面端合并）
- `info_*.json` 五个语言文件、`i18n_ui.js`（按 SHA 上传；单文件须 < 约 95KB）
- `kaedena.jpg`、`favicon.svg`、`apple-touch-icon.png`、`favicon-32.png`
- `bldg0.bin`–`bldg7.bin`（按 manifest 的 SHA 引用）

恢复步骤：备齐以上文件 → 在 Muse 中运行 `python3 deploy.py`（经 Vercel
连接器发布），或改用自己的 Vercel 账号以 Vercel CLI/网页导入同一文件集。
注意：deploy.py 目前直发 Production；按项目约定，先发 Preview 验收、
经站长确认后再提升 Production。

## 尚未备份的资源

- `data/kaedena.jpg`：EXIF 已确认清空（无 GPS/设备信息），但属个人照片，
  待站长确认后才进 Release；当前仅存于本地与线上部署。
- `data/buildings_raw.json`（342MB）：待后续单独镜像（对象存储或 Release 附件）。
- `map.jpg`、`tokyo_tower.fbx`、`tower_texture.png`：现行代码零引用的遗留素材，
  不备份亦无影响。
- `data/tokyo_tower_voxel.glb`、`data/torii_quaternius.glb`：搁置中的模型替换
  素材（见 parked/），未启用，未备份。
