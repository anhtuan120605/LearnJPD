import json
import sys
import glob
import re
from collections import defaultdict, Counter

sys.stdout.reconfigure(encoding='utf-8')

# Let's inspect single-kanji words to see their hanviet readings
kanji_readings = defaultdict(Counter)

files = ['src/data/minna_lessons.json'] + glob.glob('src/data/vocab/*.json')

for fp in files:
    with open(fp, 'r', encoding='utf-8') as f:
        data = json.load(f)
    for l in data:
        for w in l.get('words', []):
            k = w.get('kanji', '').strip()
            hv = w.get('hanviet', '').strip()
            # If word is a single kanji
            if len(k) == 1 and re.match(r'[\u4e00-\u9faf]', k) and hv:
                kanji_readings[k][hv] += 1

# Print kanji with multiple readings or surprising readings
print("Single kanji readings found:")
for k, counter in sorted(kanji_readings.items()):
    if len(counter) > 1:
        print(f"  {k}: {dict(counter)}")
