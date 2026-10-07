import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('src/data/minna_lessons.json', 'r', encoding='utf-8') as f:
    minna = json.load(f)

for l in minna:
    for w in l.get('words', []):
        if '大阪' in w.get('kanji', ''):
            print(f"Lesson {l.get('lesson')}: id={w.get('id')}, kanji={w.get('kanji')}, hanviet='{w.get('hanviet')}', meaning={w.get('meaning')}")
