import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('src/data/minna_lessons.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

targets = ['あすか', 'アップル銀行', 'みどり図書館', '大阪デパート']

for lesson in data:
    for word in lesson.get('words', []):
        kana = word.get('kana', '')
        kanji = word.get('kanji', '')
        if any(t in kana or t in kanji for t in targets):
            print(f"Lesson {lesson.get('lesson')}: kanji={kanji}, kana={kana}, meaning={word.get('meaning')}, meaning_en={word.get('meaning_en')}")
