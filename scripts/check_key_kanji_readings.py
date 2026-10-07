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

test_chars = ['大', '本', '会', '生', '出', '城', '休', '卒', '教', '万', '重', '行', '分', '不', '阪']
for c in test_chars:
    print(f"Kanji {c}: {dict(char_map.get(c, {}))}")
