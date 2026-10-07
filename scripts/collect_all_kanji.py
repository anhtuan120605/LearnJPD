import json
import sys
import glob
import re

sys.stdout.reconfigure(encoding='utf-8')

kanji_set = set()

# Regex for CJK Unified Ideographs
def extract_kanji(text):
    return re.findall(r'[\u4e00-\u9faf\u3400-\u4dbf]', text)

# 1. Minna
with open('src/data/minna_lessons.json', 'r', encoding='utf-8') as f:
    minna = json.load(f)
for l in minna:
    for w in l.get('words', []):
        for c in extract_kanji(w.get('kanji', '')):
            kanji_set.add(c)

# 2. Vocab
for fp in glob.glob('src/data/vocab/*.json'):
    with open(fp, 'r', encoding='utf-8') as f:
        data = json.load(f)
    for l in data:
        for w in l.get('words', []):
            for c in extract_kanji(w.get('kanji', '')):
                kanji_set.add(c)

# 3. Kanji files
for fp in glob.glob('src/data/kanji/*.json'):
    with open(fp, 'r', encoding='utf-8') as f:
        data = json.load(f)
    for item in data:
        k = item.get('kanji')
        if k:
            kanji_set.add(k)

print(f"Total unique Kanji characters across entire project: {len(kanji_set)}")
