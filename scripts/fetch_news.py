#!/usr/bin/env python3
"""「今日东京」每日告示抓取脚本。

数据源（均为公开源，单源失败容错、跳过并注明，绝不编造）：
  1. 日本气象厅 JMA bosai 警报 JSON（东京都 130000）——东京地方（130010）
     当前发表中的警报→ alert 条目；注意报→ event 条目（cat=气象）。
  2. NHK RSS（cat0 主要 + cat1 社会）——按东京相关关键词筛选头条，
     只取标题 + 链接（不搬正文）→ news 条目。
  3. JR 东日本运行信息页：尝试抓取；被 403/解析失败则跳过并注明（traffic 留空）。
  4. 晴空塔点灯日程：尝试在官网活动页按「今日日期 + 点灯/ライティング」
     匹配；无法稳定解析则跳过并注明（event 中来自此源的条目留空）。

输出 data/news.json：
  {date, updated, items[], yesterday[], notes[]}
  items[]: {id, level: alert|traffic|event|news, cat?, title, desc, source,
            time, spotId, url, expires, titleI18n?, descI18n?}
重跑时：若已有 news.json 且其 date 为昨天，其 items 自动转入 yesterday[]。
"""
import json, re, sys, urllib.request, xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone
from pathlib import Path

JST = timezone(timedelta(hours=9))
BASE = Path(__file__).resolve().parent.parent
OUT = BASE / "data" / "news.json"
UA = {"User-Agent": "Mozilla/5.0 (compatible; TokyoCloudTour/1.0 news fetcher)"}
NOTES = []


def fetch(url, timeout=30):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


# ---------------------------------------------------------------- JMA 警报
JMA_URL = "https://www.jma.go.jp/bosai/warning/data/warning/130000.json"
# bosai 警报代码 → (日文名, 中文名, 是否警报级)
JMA_CODES = {
    "32": ("暴風特別警報", "暴风特别警报", True), "33": ("大雨特別警報", "大雨特别警报", True),
    "34": ("暴風雪特別警報", "暴风雪特别警报", True), "35": ("大雪特別警報", "大雪特别警报", True),
    "36": ("波浪特別警報", "波浪特别警报", True), "37": ("高潮特別警報", "高潮特别警报", True),
    "02": ("暴風雪警報", "暴风雪警报", True), "03": ("大雨警報", "大雨警报", True),
    "04": ("洪水警報", "洪水警报", True), "05": ("暴風警報", "暴风警报", True),
    "06": ("大雪警報", "大雪警报", True), "07": ("波浪警報", "波浪警报", True),
    "08": ("高潮警報", "高潮警报", True),
    "10": ("大雨注意報", "大雨注意报", False), "12": ("大雪注意報", "大雪注意报", False),
    "13": ("風雪注意報", "风雪注意报", False), "14": ("強風注意報", "强风注意报", False),
    "15": ("波浪注意報", "波浪注意报", False), "16": ("雷注意報", "雷注意报", False),
    "17": ("融雪注意報", "融雪注意报", False), "18": ("洪水注意報", "洪水注意报", False),
    "19": ("高潮注意報", "高潮注意报", False), "20": ("濃霧注意報", "浓雾注意报", False),
    "21": ("乾燥注意報", "干燥注意报", False), "22": ("なだれ注意報", "雪崩注意报", False),
    "23": ("低温注意報", "低温注意报", False), "24": ("霜注意報", "霜注意报", False),
    "25": ("着氷注意報", "结冰注意报", False), "26": ("着雪注意報", "积雪注意报", False),
}


def src_jma(now):
    items = []
    raw = fetch(JMA_URL)
    doc = json.loads(raw)
    rdt = doc.get("reportDatetime", "")
    hhmm = rdt[11:16] if len(rdt) >= 16 else ""
    mainland = None
    for at in doc.get("areaTypes", []):
        for area in at.get("areas", []):
            if area.get("code") == "130010":  # 東京地方（本土）
                mainland = area
                break
        if mainland:
            break
    if mainland is None:
        NOTES.append("JMA: 未找到东京地方(130010)区域数据，跳过")
        return items
    active = [w for w in mainland.get("warnings", [])
              if w.get("code") and w.get("status") not in ("解除",)]
    if not active:
        NOTES.append(f"JMA: 东京地方当前无发表中的警报/注意报（数据时间 {rdt}），不生成气象条目")
        return items
    for w in active:
        code = str(w["code"])
        ja, zh, is_warn = JMA_CODES.get(code, (f"気象警報・注意報（コード{code}）", f"气象警报/注意报（代码{code}）", False))
        items.append({
            "id": f"jma-{code}",
            "level": "alert" if is_warn else "event",
            "cat": "气象" if not is_warn else None,
            "title": f"{zh}发布中 · 东京都",
            "desc": "请留意最新气象信息，出行注意安全" if is_warn else "出行前请留意天气变化",
            "titleI18n": {"ja": f"{ja}発表中 · 東京都"},
            "descI18n": {"ja": "最新の気象情報にご注意ください" if is_warn else "お出かけ前に天気の変化にご注意ください"},
            "source": "日本气象厅",
            "time": hhmm,
            "spotId": None, "url": "https://www.jma.go.jp/bosai/warning/", "expires": None,
        })
    NOTES.append(f"JMA: 东京地方发表中 {len(items)} 条（数据时间 {rdt}）")
    return items


# ---------------------------------------------------------------- NHK RSS
# 2026-11-13: 旧域名 www3.nhk.or.jp/rss/news/cat0.xml 自 2026-08-08 起冻结
# （NHK ONE 改版后 RSS 迁至 www.nhk.or.jp，旧源仍返回 8 月旧条目）。
# 另加 7 天新鲜度 guard：源再冻结时也不再把旧闻当成「今日」头条。
NHK_FEEDS = ["https://www.nhk.or.jp/rss/news/cat0.xml",
             "https://www.nhk.or.jp/rss/news/cat1.xml"]
MAX_AGE_DAYS = 7
KW_STRONG = ["東京", "都内", "都庁", "渋谷", "新宿", "池袋", "浅草", "羽田", "成田"]
KW_REGION = ["首都圏", "関東", "東日本"]


def src_nhk(now):
    seen, scored = set(), []
    for url in NHK_FEEDS:
        try:
            root = ET.fromstring(fetch(url))
        except Exception as e:
            NOTES.append(f"NHK {url.rsplit('/',1)[-1]}: 抓取失败 {e}")
            continue
        for it in root.iter("item"):
            title = (it.findtext("title") or "").strip()
            link = (it.findtext("link") or "").strip()
            pub = (it.findtext("pubDate") or "").strip()
            if not title or title in seen:
                continue
            seen.add(title)
            try:
                dt = datetime.strptime(pub, "%a, %d %b %Y %H:%M:%S %z")
                if (now - dt.astimezone(JST)).days > MAX_AGE_DAYS:
                    NOTES.append(f"NHK: 跳过超 {MAX_AGE_DAYS} 天旧条目「{title[:20]}…」({dt.strftime('%m-%d')})")
                    continue
            except ValueError:
                pass
            score = 2 if any(k in title for k in KW_STRONG) else (1 if any(k in title for k in KW_REGION) else 0)
            if score:
                scored.append((score, title, link, pub))
    scored.sort(key=lambda x: -x[0])
    items = []
    for i, (score, title, link, pub) in enumerate(scored[:3]):
        tm = ""
        try:
            dt = datetime.strptime(pub, "%a, %d %b %Y %H:%M:%S %z")
            tm = dt.astimezone(JST).strftime("%m-%d %H:%M")
        except Exception:
            pass
        items.append({
            "id": f"nhk-{i+1}", "level": "news", "cat": None,
            "title": title, "desc": "", "source": "NHK",
            "time": tm, "spotId": None, "url": link or None, "expires": None,
        })
    NOTES.append(f"NHK: 东京相关头条 {len(items)} 条")
    return items


# ---------------------------------------------------------------- JR 东日本（尝试）
def src_jr(now):
    try:
        fetch("https://www.jreast.co.jp/traininfo/", timeout=20)
        NOTES.append("JR东日本: 页面可达但无稳定结构化运行信息，未解析（traffic 留空）")
    except Exception as e:
        NOTES.append(f"JR东日本: 抓取失败（{str(e)[:60]}），traffic 留空，不编造")
    return []


# ---------------------------------------------------------------- 晴空塔点灯（尝试）
def src_skytree(now):
    try:
        html = fetch("https://www.tokyo-skytree.jp/event/", timeout=20).decode("utf-8", "replace")
        m = re.search(r"ライティング|点灯", html)
        if m and (f"{now.month}月{now.day}日" in html or f"{now.month}/{now.day}" in html):
            NOTES.append("晴空塔: 活动页含点灯字样与今日日期，但无法可靠解析今晚点灯主题，跳过不编造")
        else:
            NOTES.append("晴空塔: 活动页未可靠匹配到今日点灯日程，跳过不编造")
    except Exception as e:
        NOTES.append(f"晴空塔: 抓取失败（{str(e)[:60]}），跳过")
    return []


def main():
    now = datetime.now(JST)
    today = now.strftime("%Y-%m-%d")
    yesterday = (now - timedelta(days=1)).strftime("%Y-%m-%d")
    y_items = []
    if OUT.exists():
        try:
            prev = json.loads(OUT.read_text(encoding="utf-8"))
            if prev.get("date") == yesterday:
                y_items = prev.get("items", [])
            elif prev.get("date") == today:
                y_items = prev.get("yesterday", [])
        except Exception:
            pass
    items = []
    for fn in (src_jma, src_nhk, src_jr, src_skytree):
        try:
            items.extend(fn(now))
        except Exception as e:
            NOTES.append(f"{fn.__name__}: 异常跳过 {str(e)[:80]}")
    order = {"alert": 0, "traffic": 1, "event": 2, "news": 3}
    items.sort(key=lambda x: order.get(x.get("level"), 9))
    doc = {"date": today, "updated": now.strftime("%H:%M"),
           "items": items, "yesterday": y_items, "notes": NOTES}
    OUT.write_text(json.dumps(doc, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"news.json written: date={today} items={len(items)} yesterday={len(y_items)}")
    for n in NOTES:
        print(" -", n)
    for it in items:
        print(f" * [{it['level']}] {it['title']} ({it['source']} {it['time']})")


if __name__ == "__main__":
    main()
