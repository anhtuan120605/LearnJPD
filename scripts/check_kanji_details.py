import json
import sys
import glob

sys.stdout.reconfigure(encoding='utf-8')

for fp in glob.glob('src/data/kanji/*.json'):
    with open(fp, 'r', encoding='utf-8') as f:
        kd = json.load(f)
    for item in kd:
        k = item.get('kanji')
        hv = item.get('hanviet', '')
        m = item.get('meaning', '')
        if k in ['城', '阪', '込', '匂']:
            print(f"{fp}: kanji={k}, hanviet='{hv}', meaning='{m}'")
