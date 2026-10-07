import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

# Let's inspect kanji to Sino-Vietnamese (Hán Việt) mapping in kanji data
# Let's check src/data/kanji/ to see if there is an authoritative Kanji dictionary
kanji_dict = {}
try:
    with open('src/data/kanji/kanji_all.json', 'r', encoding='utf-8') as f:
        kd = json.load(f)
        for item in kd:
            k = item.get('kanji')
            hv = item.get('hanviet')
            if k and hv:
                kanji_dict[k] = hv
except Exception as e:
    print("Could not load kanji_all.json:", e)

print(f"Loaded {len(kanji_dict)} kanji from dictionary.")
if '大' in kanji_dict:
    print(f"大: {kanji_dict['大']}")
if '阪' in kanji_dict:
    print(f"阪: {kanji_dict['阪']}")
if '城' in kanji_dict:
    print(f"城: {kanji_dict['城']}")
