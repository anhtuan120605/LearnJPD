import json
import sys
import glob

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
    total_words = sum(len(l.get('words', [])) for l in data)
    
    # check weird words
    issues = []
    for l in data:
        l_num = l.get('lesson', 0)
        for w in l.get('words', []):
            k = w.get('kanji') or w.get('kana')
            m = w.get('meaning', '')
            if 'bao tượng' in m:
                issues.append((k, m, 'bao tượng'))
            elif 'thực vật' in m and k in ['植える', '植えます']:
                issues.append((k, m, 'thực vật'))
            elif 'bên thứ' in m:
                issues.append((k, m, 'bên thứ'))
            elif 'nói đi' in m:
                issues.append((k, m, 'nói đi'))
            elif m.startswith('ái độ'):
                issues.append((k, m, 'mất chữ Th'))
            elif 'đón' == m.strip() and k in ['会う', 'あう']:
                issues.append((k, m, '会う = đón'))
            elif 'Hamburger' in m or 'Coca' in m:
                issues.append((k, m, 'Hamburger/Coca'))
    print(f"File {fp}: {len(data)} bài, {total_words} từ, tìm thấy {len(issues)} lỗi mẫu: {issues[:4]}")
