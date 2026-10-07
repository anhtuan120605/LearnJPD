import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('src/data/minna_lessons.json', 'r', encoding='utf-8') as f:
    minna = json.load(f)

# Collect all hanviet entries
hanviet_words = []
for l in minna:
    for w in l.get('words', []):
        if w.get('hanviet'):
            hanviet_words.append((w.get('kanji'), w.get('hanviet'), w.get('meaning')))

print(f"Total words with hanviet in Minna: {len(hanviet_words)}")
for kw, hv, m in hanviet_words[:30]:
    print(f"{kw} -> {hv} ({m})")
