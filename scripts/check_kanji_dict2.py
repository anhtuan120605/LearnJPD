import json
import sys
import glob

sys.stdout.reconfigure(encoding='utf-8')

kanji_dict = {}
for fp in glob.glob('src/data/kanji/*.json'):
    with open(fp, 'r', encoding='utf-8') as f:
        kd = json.load(f)
        for item in kd:
            # item could be dict with kanji and hanviet
            k = item.get('kanji')
            hv = item.get('hanviet')
            if k and hv:
                kanji_dict[k] = hv.upper().strip()

print(f"Loaded {len(kanji_dict)} kanji from kanji/*.json")
for char in ['大', '阪', '城', '京', '都', '東', '北', '南', '西', '館', '銀', '行']:
    print(f"{char}: {kanji_dict.get(char, 'NOT FOUND')}")
