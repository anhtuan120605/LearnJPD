import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('src/data/minna_lessons.json', 'r', encoding='utf-8') as f:
    minna = json.load(f)

for lesson in minna:
    l_num = lesson['lesson']
    words = lesson['words']
    print(f"=== BÀI {l_num}: {len(words)} từ ===")
    lines = []
    for w in words:
        lines.append(f"{w.get('kanji') or w.get('kana')} [{w.get('kana')}]: {w.get('meaning')}")
    # print first 5 and last 3
    for line in lines[:5]:
        print("  ", line)
    print("   ...")
    for line in lines[-3:]:
        print("  ", line)
