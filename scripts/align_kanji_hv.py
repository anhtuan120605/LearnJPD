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
            # Extract only kanji characters
            kanjis = re.findall(r'[\u4e00-\u9faf]', k)
            hv_syllables = hv.split()
            # If the count of kanji characters equals the count of syllables
            if len(kanjis) == len(hv_syllables) and len(kanjis) > 0:
                for kj, syl in zip(kanjis, hv_syllables):
                    char_map[kj][syl] += 1

print(f"Total kanji aligned: {len(char_map)}")

# Now find anomalies where a kanji has a rare or wrong reading:
for kj, counts in sorted(char_map.items()):
    total = sum(counts.values())
    # If there are multiple readings, let's look at them
    if len(counts) > 1:
        # Check if there is an archaic reading like BÔN, CỐI, SANH, XUÝ, THÁI for 大, etc.
        readings = list(counts.items())
        # Print if any reading has known archaic/weird syllables
        for syl, c in readings:
            if syl in ['BÔN', 'CỐI', 'SANH', 'XUÝ', 'GIÀM', 'THÁI', 'HU', 'THỐT']:
                print(f"Kanji {kj} has readings: {dict(counts)}")
                break
