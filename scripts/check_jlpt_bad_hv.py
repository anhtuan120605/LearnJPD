import json
import sys
import glob

sys.stdout.reconfigure(encoding='utf-8')

bad_terms = ['BÔN', 'THÁI HỌC', 'CỐI XÃ', 'GIÀM', 'MẶC TRÀNG', 'THÁI GIÀM', 'XUÝ', 'SANH', 'GIAO SƯ', 'TÂN THÁI']

for fp in sorted(glob.glob('src/data/vocab/*.json')):
    with open(fp, 'r', encoding='utf-8') as f:
        data = json.load(f)
    bad_count = 0
    examples = []
    for l in data:
        for w in l.get('words', []):
            hv = w.get('hanviet', '')
            for b in bad_terms:
                if b in hv:
                    bad_count += 1
                    examples.append((w.get('kanji') or w.get('kana'), hv, b))
                    break
    print(f"{fp}: {bad_count} items with bad Hán Việt patterns. First 5: {examples[:5]}")
