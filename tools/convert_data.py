# -*- coding: utf-8 -*-
"""Regenerate ../data.js from the authoritative sampling sheet
(https://docs.google.com/spreadsheets/d/13-O-DYPJ_T98LJRIByvGRT82gF1lWfpizEcOzvwaOR4).

Sheet columns: รหัสพัสดุ | รายการพัสดุ | เลขที่สเปค | จำนวนสุ่ม | ที่มาของจำนวนสุ่ม |
               หัวข้อทดสอบ | สถาบันทดสอบ | URL สเปค

Accepted input (auto-detected):
  1. JSON {"fileContent": "<markdown table>"} as saved by the Drive MCP tool
  2. Raw markdown table
  3. CSV export of the sheet (same 8 columns, header row required)

Usage:
  python convert_data.py <input_file> [--out ../data.js] [--snapshot "ก.ค. 2026"]

The จำนวนสุ่ม cell is parsed into a structured rule:
  {"type": "tiers", "tiers": [[min, max|null, n], ...]}
  {"type": "fixed", "n": 5}
  {"type": "cbrt"}                      # รากที่ 3 ของจำนวน ปัดขึ้น
  {"type": "pct", "pct": 5, "min": 5}   # ≥5% และไม่น้อยกว่า 5
  {"type": "e1e2", "tiers": [[min, max|null, e1, e2], ...]}
  {"type": "none"}                      # ไม่กำหนด → ผู้ใช้กรอกเอง
Unparseable text falls back to {"type": "none"} with a warning; the raw text is
always kept in "samplingText" and shown in the UI.
"""
import argparse
import csv
import datetime
import io
import json
import math
import re
import sys
from pathlib import Path

THAI_MONTHS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
               "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."]


def thai_snapshot_today():
    d = datetime.date.today()
    return f"{d.day} {THAI_MONTHS[d.month - 1]} {d.year + 543}"

CODE_RE = re.compile(r"^\d{10}$")
TEST_RE = re.compile(r"(.+?)\s*\((\d[\d,]*)\)\s*$")


def unescape_md(s):
    return re.sub(r"\\([\\`*_{}\[\]()#+\-.!&<>])", r"\1", s).strip()


def split_dash_items(cell):
    parts = re.split(r"\s*\\?-\s+", cell.strip())
    return [unescape_md(p) for p in parts if p.strip()]


def normalize_numbers(s):
    # "35,001" -> "35001"
    return re.sub(r"(?<=\d),(?=\d)", "", s)


def parse_sampling(text, warnings, code):
    raw = unescape_md(text)
    t = normalize_numbers(raw)
    low = t.lower()

    if "ไม่กำหนด" in t:
        return {"type": "none"}
    if "sqrt 3" in low or "รากที่ 3" in t or "รากที่สาม" in t:
        return {"type": "cbrt"}
    if "%" in t:
        m = re.search(r"(\d+)\s*%", t)
        m2 = re.search(r"not less than (\d+)\s*(?:set|ตัว|ชุด)", low)
        return {"type": "pct", "pct": int(m.group(1)) if m else 5,
                "min": int(m2.group(1)) if m2 else 5}
    if re.fullmatch(r"\d+", t.strip()):
        return {"type": "fixed", "n": int(t.strip())}

    if "e1" in low:
        # "2 000" -> "2000" (space used as thousands separator in the E1/E2 text)
        low = re.sub(r"(?<=\d) (?=\d{3}\b)", "", low)
        tiers = []
        for m in re.finditer(
            r"(?:n\s*[≤<=]+\s*(\d+)|(\d+)\s*(?:\\?<|<)\s*n\s*[≤<=]+\s*(\d+))\s*e1\s*:\s*(\d+)\s*e2\s*:\s*(\d+)", low
        ):
            if m.group(1):
                lo, hi = 1, int(m.group(1))
            else:
                lo, hi = int(m.group(2)) + 1, int(m.group(3))
            tiers.append([lo, hi, int(m.group(4)), int(m.group(5))])
        if not tiers:
            warnings.append(f"{code}: E1/E2 text not parsed: {raw!r}")
            return {"type": "none"}
        tiers.sort(key=lambda x: x[0])
        tiers[-1][1] = None  # open-ended top tier
        return {"type": "e1e2", "tiers": tiers}

    # generic "range : n" clauses
    tiers = []
    for m in re.finditer(r"([^:]+?)\s*:\s*(\d+)", t):
        desc, n = m.group(1).strip(), int(m.group(2))
        # keep only the trailing range fragment of the descriptor
        d = desc.lower()
        r = None
        m2 = re.search(r"(\d+)\s*(?:ถึง|to|–|-)\s*(\d+)\s*$", d)
        if m2:
            r = [int(m2.group(1)), int(m2.group(2))]
        elif re.search(r"(?:up\s+to|not\s+more\s+than|no\s+more\s+than|ไม่เกิน|not\s+exceeding)\s*(\d+)\s*$", d):
            r = [1, int(re.search(r"(\d+)\s*$", d).group(1))]
        elif re.search(r"(?:under|less\s+than|\\?<)\s*(\d+)\s*$", d):
            r = [1, int(re.search(r"(\d+)\s*$", d).group(1)) - 1]
        elif re.search(r"(?:more\s+than|มากกว่า|over|\\?>)\s*(\d+)\s*$", d):
            r = [int(re.search(r"(\d+)\s*$", d).group(1)) + 1, None]
        elif re.search(r"(\d+)\s*(?:ขึ้นไป|and\s+more|and\s+above)\s*$", d):
            r = [int(re.search(r"(\d+)", d).group(1)), None]
        elif re.search(r"(\d+)\s*$", d):
            v = int(re.search(r"(\d+)\s*$", d).group(1))
            r = [v, v]
        if r is None:
            warnings.append(f"{code}: clause not parsed: {desc!r} : {n}")
            continue
        tiers.append([r[0], r[1], n])

    if not tiers:
        warnings.append(f"{code}: sampling text not parsed: {raw!r}")
        return {"type": "none"}
    tiers.sort(key=lambda x: (x[0], x[1] if x[1] is not None else 10**9))
    if tiers[0][0] > 1:
        tiers[0][0] = 1  # extend first tier down to qty 1
    for i in range(len(tiers) - 1):  # close gaps like "less than 500" + "501 to 1000" (hole at 500)
        if tiers[i][1] is not None and tiers[i + 1][0] > tiers[i][1] + 1:
            tiers[i][1] = tiers[i + 1][0] - 1
    return {"type": "tiers", "tiers": tiers}


def sampling_for_qty(rule, qty):
    """Mirror of the JS engine, used for build-time self-check."""
    if rule["type"] == "fixed":
        return rule["n"]
    if rule["type"] == "cbrt":
        return math.ceil(qty ** (1 / 3) - 1e-9)
    if rule["type"] == "pct":
        return max(math.ceil(qty * rule["pct"] / 100), rule["min"])
    if rule["type"] == "tiers":
        for lo, hi, n in rule["tiers"]:
            if qty >= lo and (hi is None or qty <= hi):
                return n
    if rule["type"] == "e1e2":
        for lo, hi, e1, e2 in rule["tiers"]:
            if qty >= lo and (hi is None or qty <= hi):
                return e1 + e2
    return None


def parse_tests(cell, warnings, code):
    cell = cell.strip()
    per_sample = None
    m = re.search(r"ค่าทดสอบตัวอย่างละ\s*([\d,\.]+)\s*บาท", cell)
    if m:
        per_sample = int(float(m.group(1).replace(",", "")))
        cell = cell[m.end():]
    tests = []
    for item in split_dash_items(cell):
        m = TEST_RE.match(item)
        if m:
            tests.append({"name": m.group(1).strip().rstrip(","), "price": int(m.group(2).replace(",", ""))})
        elif item:
            warnings.append(f"{code}: test item without price: {item!r}")
    s = sum(t["price"] for t in tests)
    if per_sample is not None and s != per_sample:
        warnings.append(f"{code}: test prices sum {s} != ค่าทดสอบตัวอย่างละ {per_sample}")
    return tests, per_sample if per_sample is not None else s


def rows_from_markdown(text):
    for line in text.splitlines():
        line = line.strip()
        if not line.startswith("|"):
            continue
        cells = [c.strip() for c in line.strip("|").split("|")]
        if len(cells) >= 7:
            yield cells


def rows_from_csv(text):
    for row in csv.reader(io.StringIO(text)):
        if len(row) >= 7:
            yield [c.strip() for c in row]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("input")
    ap.add_argument("--out", default=str(Path(__file__).resolve().parent.parent / "data.js"))
    ap.add_argument("--snapshot", default=thai_snapshot_today())
    args = ap.parse_args()

    text = Path(args.input).read_text(encoding="utf-8")
    if text.lstrip().startswith("{"):
        text = json.loads(text)["fileContent"]

    first = next((l for l in text.splitlines() if l.strip()), "")
    rows = rows_from_markdown(text) if first.lstrip().startswith("|") else rows_from_csv(text)

    warnings, materials, seen = [], [], {}
    for cells in rows:
        code = cells[0].strip()
        if not CODE_RE.match(code) or code in seen:
            if code in seen:
                warnings.append(f"duplicate code {code} — keeping first")
            continue
        seen[code] = True
        tests, per_sample = parse_tests(cells[5], warnings, code)
        materials.append({
            "code": code,
            "name": unescape_md(cells[1]),
            "spec": unescape_md(cells[2]),
            "samplingText": unescape_md(cells[3]),
            "sampling": parse_sampling(cells[3], warnings, code),
            "samplingSource": " ".join(split_dash_items(cells[4])) or unescape_md(cells[4]),
            "tests": tests,
            "perSample": per_sample,
            "institute": split_dash_items(cells[6]),
            "specUrl": unescape_md(cells[7]) if len(cells) > 7 and cells[7].startswith("http") else "",
        })

    materials.sort(key=lambda m: m["code"])

    # build-time self-check: every rule type produces a number (or is 'none')
    unresolved = [m["code"] for m in materials if m["sampling"]["type"] == "none"]
    for m in materials:
        if m["sampling"]["type"] not in ("none",):
            for q in (1, 50, 500, 5000, 50000):
                if sampling_for_qty(m["sampling"], q) is None:
                    warnings.append(f"{m['code']}: rule gives no result for qty={q}: {m['samplingText']!r}")

    out = Path(args.out)
    out.write_text(
        "// Generated by tools/convert_data.py from the sampling sheet — do not edit by hand.\n"
        "// Source: https://docs.google.com/spreadsheets/d/13-O-DYPJ_T98LJRIByvGRT82gF1lWfpizEcOzvwaOR4\n"
        f'window.DATA_SNAPSHOT = "{args.snapshot}";\n'
        f"window.MATERIALS = {json.dumps(materials, ensure_ascii=False, indent=1)};\n",
        encoding="utf-8",
    )

    print(f"Wrote {len(materials)} materials to {out}")
    print(f"codes with no computable rule (manual input): {len(unresolved)} -> {unresolved}")
    if warnings:
        print(f"\n{len(warnings)} warnings:")
        for w in warnings:
            print("  -", w)


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    main()
