import json
import sys
import glob
import re
from collections import defaultdict, Counter

sys.stdout.reconfigure(encoding='utf-8')

char_map = defaultdict(Counter)
files = ['src/data/minna_lessons.json'] + glob.glob('src/data/vocab/*.json')

for fp in files:
    with open(fp, 'r', encoding='utf-8') as f:
        data = json.load(f)
    for l in data:
        for w in l.get('words', []):
            k = w.get('kanji', '').strip()
            hv = w.get('hanviet', '').strip()
            if not k or not hv:
                continue
            kanjis = re.findall(r'[\u4e00-\u9faf]', k)
            hv_syllables = hv.split()
            if len(kanjis) == len(hv_syllables) and len(kanjis) > 0:
                for kj, syl in zip(kanjis, hv_syllables):
                    char_map[kj][syl] += 1

# Check each kanji against standard dictionary in kanji/*.json
kanji_std = {}
for fp in sorted(glob.glob('src/data/kanji/*.json')):
    with open(fp, 'r', encoding='utf-8') as f:
        kd = json.load(f)
    for item in kd:
        k = item.get('kanji')
        hv = item.get('hanviet', '').strip().upper()
        if k and hv:
            kanji_std[k] = hv

# Correct known exceptions
kanji_std['城'] = 'THÀNH'
kanji_std['阪'] = 'PHẢN'
kanji_std['大'] = 'ĐẠI'
kanji_std['本'] = 'BẢN'
kanji_std['会'] = 'HỘI'
kanji_std['生'] = 'SINH'
kanji_std['出'] = 'XUẤT'
kanji_std['休'] = 'HƯU'
kanji_std['卒'] = 'TỐT'
kanji_std['教'] = 'GIÁO'
kanji_std['万'] = 'VẠN'
kanji_std['不'] = 'BẤT'
kanji_std['何'] = 'HÀ'
kanji_std['行'] = 'HÀNH'
kanji_std['重'] = 'TRỌNG'

mismatches = []
for kj, counts in sorted(char_map.items()):
    std = kanji_std.get(kj)
    if std:
        for reading, freq in counts.items():
            if reading != std:
                mismatches.append((kj, std, reading, freq))

print(f"Total mismatching kanji readings found: {len(mismatches)}")
print("Sample mismatches (kanji, standard, current_in_words, freq):")
for m in mismatches[:40]:
    print(f"  {m[0]}: standard '{m[1]}' vs word '{m[2]}' ({m[3]} occurrences)")
