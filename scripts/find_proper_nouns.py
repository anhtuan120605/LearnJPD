import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('src/data/minna_lessons.json', 'r', encoding='utf-8') as f:
    minna = json.load(f)

proper_nouns = []
for l in minna:
    l_num = l['lesson']
    for w in l['words']:
        k = w.get('kanji') or w.get('kana')
        kn = w.get('kana', '')
        m = w.get('meaning', '')
        me = w.get('meaning_en', '')

        # Check conditions
        is_suspicious = False
        if m == k or m == kn:
            is_suspicious = True
        elif 'hư cấu' in m or 'fictitious' in me:
            is_suspicious = True
        elif 'tiêu đề' in m or 'école' in m:
            is_suspicious = True
        elif any(c in m for c in ['Ghi chú', 'nước Sing-ga-po', 'nước Ý; nước Italia', 'băng cốc', 'béc linh', 'nữu ước']):
            is_suspicious = True
        elif m in ['nam pla', 'châu Âu', 'thụy sĩ']:
            is_suspicious = True

        if is_suspicious:
            proper_nouns.append((l_num, k, kn, m, me))

print(f"Total found: {len(proper_nouns)}")
for item in proper_nouns:
    print(f"Bài {item[0]}: [{item[1]}] ({item[2]}) -> vi: '{item[3]}' | en: '{item[4]}'")
