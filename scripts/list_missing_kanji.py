import json
import sys
import os
import glob
import re

sys.stdout.reconfigure(encoding='utf-8')

# Ensure we run from workspace root
WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

def extract_kanji(text):
    return re.findall(r'[\u4e00-\u9faf\u3400-\u4dbf]', text)

# Load from kanji/*.json
kanji_to_hv = {}
for fp in sorted(glob.glob(os.path.join(WORKSPACE_ROOT, 'src/data/kanji/*.json'))):
    with open(fp, 'r', encoding='utf-8') as f:
        kd = json.load(f)
    for item in kd:
        k = item.get('kanji')
        hv = item.get('hanviet', '').strip().upper()
        if k and hv:
            kanji_to_hv[k] = hv

print(f"Loaded {len(kanji_to_hv)} kanji from kanji/*.json")

# Find all unique kanji in workspace
all_kanji = set()
with open(os.path.join(WORKSPACE_ROOT, 'src/data/minna_lessons.json'), 'r', encoding='utf-8') as f:
    minna = json.load(f)
for l in minna:
    for w in l.get('words', []):
        for c in extract_kanji(w.get('kanji', '')):
            all_kanji.add(c)

for fp in glob.glob(os.path.join(WORKSPACE_ROOT, 'src/data/vocab/*.json')):
    with open(fp, 'r', encoding='utf-8') as f:
        data = json.load(f)
    for l in data:
        for w in l.get('words', []):
            for c in extract_kanji(w.get('kanji', '')):
                all_kanji.add(c)

missing_kanji = [k for k in sorted(all_kanji) if k not in kanji_to_hv]
print(f"Total kanji in datasets: {len(all_kanji)}")
print(f"Missing from kanji/*.json: {len(missing_kanji)}")
print("Missing:", "".join(missing_kanji))
