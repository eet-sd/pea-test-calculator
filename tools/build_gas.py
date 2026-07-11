# -*- coding: utf-8 -*-
"""Generate the Apps Script UI files from the canonical sources:

  index.html  ->  gas/index.html   (data/rules script tags -> GAS includes,
                                    MATERIALS loaded live via google.script.run)
  rules.js    ->  gas/rules.html   (wrapped in <script>)

Run after every change to index.html or rules.js, then `clasp push` in gas/.
Each replacement asserts its marker exists so UI refactors fail loudly here
instead of silently shipping a broken GAS build.
"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GAS = ROOT / "gas"

BOOTSTRAP = """
  // --- GAS bootstrap (injected by tools/build_gas.py) ---
  var loading = document.createElement("div");
  loading.className = "panel";
  loading.id = "loading";
  loading.textContent = "กำลังโหลดข้อมูลจากชีต…";
  result.parentNode.insertBefore(loading, result);
  google.script.run
    .withSuccessHandler(function (rows) {
      MATS = buildMaterials(rows);
      loading.remove();
    })
    .withFailureHandler(function (err) {
      loading.textContent = "โหลดข้อมูลไม่สำเร็จ: " + err;
    })
    .getSheetRows();
})();"""


def replace_once(text, old, new, label):
    if text.count(old) != 1:
        sys.exit(f"build_gas: marker not found exactly once: {label} ({text.count(old)} hits)")
    return text.replace(old, new)


def main():
    html = (ROOT / "index.html").read_text(encoding="utf-8")

    html = replace_once(
        html,
        '<script src="data.js"></script>\n<script src="rules.js"></script>',
        "<?!= include('rules') ?>\n<?!= include('parser') ?>",
        "data/rules script tags",
    )
    html = replace_once(
        html,
        "const MATS = window.MATERIALS || [];",
        "let MATS = [];",
        "MATS declaration",
    )
    html = replace_once(
        html,
        '  document.getElementById("snap").textContent = window.DATA_SNAPSHOT || "-";\n',
        "",
        "snapshot assignment",
    )
    # GAS reads the sheet live, so the as-of date is dropped entirely
    html = replace_once(
        html,
        '(ข้อมูล ณ วันที่ <span id="snap"></span>) ',
        "",
        "footer snapshot",
    )
    html = replace_once(html, "})();", BOOTSTRAP, "IIFE close / bootstrap")

    GAS.mkdir(exist_ok=True)
    (GAS / "index.html").write_text(html, encoding="utf-8")

    rules = (ROOT / "rules.js").read_text(encoding="utf-8")
    (GAS / "rules.html").write_text("<script>\n" + rules + "\n</script>\n", encoding="utf-8")

    print("built gas/index.html and gas/rules.html")


if __name__ == "__main__":
    main()
