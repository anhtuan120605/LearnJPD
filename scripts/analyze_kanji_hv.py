import json
import sys
import glob
import re

sys.stdout.reconfigure(encoding='utf-8')

def extract_kanji(text):
    return re.findall(r'[\u4e00-\u9faf\u3400-\u4dbf]', text)

kanji_to_hv = {}

# 1. From kanji/*.json
for fp in sorted(glob.glob('src/data/kanji/*.json')):
    with open(fp, 'r', encoding='utf-8') as f:
        data = json.load(f)
    for item in data:
        k = item.get('kanji')
        hv = item.get('hanviet', '').strip().upper()
        if k and hv:
            kanji_to_hv[k] = hv

print(f"Kanji with HV from kanji/*.json: {len(kanji_to_hv)}")

# Check known errors in kanji/*.json
known_fixes = {
    '城': 'THÀNH',
    '阪': 'PHẢN',
    '込': 'NHẬP',  # Kokuji: thâm, nhạp
    '咲': 'TIẾU',
    '栃': 'LỆ',
    '畑': 'ĐIỀN',  # Kokuji vạt / điền
    '枠': 'KHUNG', # Kokuji khung
    '峠': 'ĐÈO',  # Kokuji đèo / tạp
    '匂': 'MÙI',  # Kokuji mùi / khứu
}
for k, v in known_fixes.items():
    kanji_to_hv[k] = v

# Collect all 2445 kanji
all_kanji = set()
with open('src/data/minna_lessons.json', 'r', encoding='utf-8') as f:
    minna = json.load(f)
for l in minna:
    for w in l.get('words', []):
        for c in extract_kanji(w.get('kanji', '')):
            all_kanji.add(c)
for fp in glob.glob('src/data/vocab/*.json'):
    with open(fp, 'r', encoding='utf-8') as f:
        data = json.load(f)
    for l in data:
        for w in l.get('words', []):
            for c in extract_kanji(w.get('kanji', '')):
                all_kanji.add(c)
for fp in glob.glob('src/data/kanji/*.json'):
    with open(fp, 'r', encoding='utf-8') as f:
        data = json.load(f)
    for item in data:
        k = item.get('kanji')
        if k:
            all_kanji.add(k)

missing = [k for k in all_kanji if k not in kanji_to_hv]
print(f"Missing HV count out of {len(all_kanji)}: {len(missing)}")
print("Sample missing kanji:", missing[:30])
