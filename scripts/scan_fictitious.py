import json
import sys
import glob
import re

sys.stdout.reconfigure(encoding='utf-8')

files = [
    'src/data/minna_lessons.json',
    'src/data/vocab/n5_lessons.json',
    'src/data/vocab/n4_lessons.json',
    'src/data/vocab/n3_lessons.json',
    'src/data/vocab/n2_lessons.json',
    'src/data/vocab/n1_lessons.json',
]

suspicious_terms = ['hư cấu', 'fictitious', 'giả tưởng', 'tưởng tượng', 'ví dụ', 'tên công ty', 'tên cửa hàng', 'tên nhà hàng', 'tên riêng', 'người Nam man']

for fp in files:
    with open(fp, 'r', encoding='utf-8') as f:
        data = json.load(f)
    found = []
    for l in data:
        l_num = l.get('lesson', 0)
        for w in l.get('words', []):
            m = w.get('meaning', '')
            men = w.get('meaning_en', '')
            k = w.get('kanji') or w.get('kana')
            for term in suspicious_terms:
                if term in m.lower():
                    found.append((l_num, k, m, men))
                    break
    if found:
        print(f"File {fp} has {len(found)} suspicious items:")
        for item in found[:10]:
            print(f"  Lesson {item[0]}: {item[1]} -> VI: '{item[2]}' | EN: '{item[3]}'")
    else:
        print(f"File {fp}: ALL CLEAN regarding suspicious terms.")
