import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('src/data/minna_lessons.json', 'r', encoding='utf-8') as f:
    minna = json.load(f)

# Export all words per lesson as a reference file to examine
with open('scripts/all_minna_words_current.txt', 'w', encoding='utf-8') as out:
    for lesson in minna:
        l_num = lesson['lesson']
        out.write(f"\n==================== BÀI {l_num} ({len(lesson['words'])} từ) ====================\n")
        for w in lesson['words']:
            k = w.get('kanji') or ''
            kn = w.get('kana') or ''
            m = w.get('meaning') or ''
            en = w.get('meaning_en') or ''
            out.write(f"{k}\t{kn}\t{m}\t{en}\n")

print("Exported all current words to scripts/all_minna_words_current.txt")
