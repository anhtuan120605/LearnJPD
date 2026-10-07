import json
import sys
import glob

sys.stdout.reconfigure(encoding='utf-8')

# Let's check empty meanings in kanji/*.json
empty_meanings = []
for fp in sorted(glob.glob('src/data/kanji/*.json')):
    with open(fp, 'r', encoding='utf-8') as f:
        kd = json.load(f)
    for item in kd:
        if not item.get('meaning', '').strip():
            empty_meanings.append((fp, item.get('kanji'), item.get('hanviet')))
print(f"Total kanji with empty meaning: {len(empty_meanings)}")
if empty_meanings:
    print("First 10 kanji with empty meaning:")
    for x in empty_meanings[:10]:
        print(f"  {x[0]}: {x[1]} ({x[2]})")
