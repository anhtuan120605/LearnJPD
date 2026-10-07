import json
import sys
import glob

sys.stdout.reconfigure(encoding='utf-8')

bad_terms = ['THÁI GIÀM', 'MẶC TRÀNG', 'CỐI XÃ', 'THÁI HỌC', 'BÔN', 'XUÝ', 'SANH', 'GIAO SƯ', 'TÂN THÁI', 'GIÀM']

for fp in sorted(glob.glob('src/data/kanji/*.json')):
    with open(fp, 'r', encoding='utf-8') as f:
        data = json.load(f)
    found = []
    for item in data:
        k = item.get('kanji')
        hv = item.get('hanviet', '')
        for b in bad_terms:
            if b in hv:
                found.append((k, hv, 'top-level'))
        for ex in item.get('examples', []):
            ex_hv = ex.get('hanviet', '')
            for b in bad_terms:
                if b in ex_hv:
                    found.append((ex.get('word'), ex_hv, f"in example of {k}"))
    if found:
        print(f"{fp}: {len(found)} bad items: {found[:5]}")
    else:
        print(f"{fp}: All clean.")
