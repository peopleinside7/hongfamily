# -*- coding: utf-8 -*-
"""
캐릭터.html의 인라인 SVG(히어로 2 + 상황별 14컷)를 재사용 가능한 <symbol> 스프라이트로 추출.
결과: characters.js (self-injecting classic script) - prototype.html에서 <script src="characters.js">로 로드.
재생성: python scripts/build_char_sprite.py
"""
import re, io, os, json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "캐릭터.html")
OUT = os.path.join(ROOT, "characters.js")

html = io.open(SRC, encoding="utf-8").read()

# 1) 그라데이션 defs
defs = re.search(r"<defs>(.*?)</defs>", html, re.S).group(1).strip()

# 2) 캐릭터 SVG (viewBox 0 0 W 200), 문서 순서 유지
svgs = re.findall(r'<svg viewBox="0 0 (\d+) 200">(.*?)</svg>', html, re.S)

ids = [
    "ch-juho-hero", "ch-jua-hero",
    "ch-juho-dawn", "ch-juho-write", "ch-juho-read", "ch-juho-math",
    "ch-juho-clean", "ch-juho-sleep", "ch-juho-done",
    "ch-jua-dawn", "ch-jua-sing", "ch-jua-read", "ch-jua-word",
    "ch-jua-dish", "ch-jua-sleep", "ch-jua-done",
]

assert len(svgs) == len(ids), f"기대 {len(ids)}개, 실제 {len(svgs)}개 추출됨"

symbols = []
for (w, inner), sid in zip(svgs, ids):
    symbols.append(f'<symbol id="{sid}" viewBox="0 0 {w} 200">{inner.strip()}</symbol>')

sprite = (
    '<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" '
    'style="position:absolute" aria-hidden="true"><defs>'
    + defs + "</defs>" + "".join(symbols) + "</svg>"
)

js = (
    "/* 자동 생성 파일 - scripts/build_char_sprite.py 로 재생성 */\n"
    "(function(){\n"
    "  var SPRITE = " + json.dumps(sprite, ensure_ascii=False) + ";\n"
    "  function inject(){\n"
    "    if(document.getElementById('char-sprite-root')) return;\n"
    "    var wrap=document.createElement('div');\n"
    "    wrap.id='char-sprite-root';\n"
    "    wrap.style.cssText='position:absolute;width:0;height:0;overflow:hidden';\n"
    "    wrap.innerHTML=SPRITE;\n"
    "    var host=document.body||document.documentElement;\n"
    "    host.insertBefore(wrap, host.firstChild);\n"
    "  }\n"
    "  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',inject);\n"
    "  else inject();\n"
    "  window.CHAR_SPRITE=SPRITE;\n"
    "})();\n"
)

io.open(OUT, "w", encoding="utf-8").write(js)
print(f"OK: {len(svgs)} symbols -> characters.js ({len(js)} bytes)")
