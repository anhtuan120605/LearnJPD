import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

files = [
    'src/data/minna_lessons.json',
    'src/data/vocab/n5_lessons.json',
    'src/data/vocab/n4_lessons.json',
    'src/data/vocab/n3_lessons.json',
    'src/data/vocab/n2_lessons.json',
    'src/data/vocab/n1_lessons.json',
]

for fp in files:
    with open(fp, 'r', encoding='utf-8') as f:
        data = json.load(f)
    untranslated = []
    for l in data:
        l_num = l.get('lesson', 0)
        for w in l.get('words', []):
            m = w.get('meaning', '').strip()
            k = w.get('kanji', '').strip()
            kana = w.get('kana', '').strip()
            # If meaning is empty, or identical to kanji or kana, or only ASCII English words (without Vietnamese)
            if not m or m == k or m == kana:
                untranslated.append((l_num, k, kana, m, w.get('meaning_en', '')))
    print(f"{fp}: {len(untranslated)} untranslated / identical words.")
    for item in untranslated[:5]:
        print(f"  Lesson {item[0]}: kanji={item[1]}, kana={item[2]}, meaning={item[3]}, en={item[4]}")
