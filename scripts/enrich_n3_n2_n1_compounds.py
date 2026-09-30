import json, re

print("=== Bắt đầu tổng hợp từ vựng ghép theo trình độ cho N3, N2, N1 ===")

# 1. Thu thập kho từ vựng từ các nguồn bài học
vocab_pool = []
seen_words = set()

def add_vocab(w, k, m, hv, lvl):
    w = (w or '').strip()
    k = (k or '').strip()
    m = (m or '').strip()
    hv = (hv or '').strip()
    lvl = (lvl or '').strip().upper()
    if not w or not k or not m:
        return
    # Bỏ các tiền tố hậu tố như ～
    w_clean = w.replace('～', '').replace('~', '').strip()
    k_clean = k.replace('～', '').replace('~', '').strip()
    if not w_clean:
        return
    key = (w_clean, k_clean)
    if key in seen_words:
        return
    seen_words.add(key)
    vocab_pool.append({
        'word': w_clean,
        'reading': k_clean,
        'meaning': m,
        'hanviet': hv,
        'level': lvl
    })

# Đọc các file bài học N5 - N1
for fn in [
    'src/data/vocab/n5_lessons.json',
    'src/data/vocab/n4_lessons.json',
    'src/data/vocab/n3_lessons.json',
    'src/data/vocab/n2_lessons.json',
    'src/data/vocab/n1_lessons.json'
]:
    try:
        with open(fn, 'r', encoding='utf-8') as f:
            lessons = json.load(f)
            for lesson in lessons:
                lvl = lesson.get('level', '')
                for item in lesson.get('words', []):
                    add_vocab(
                        item.get('kanji'),
                        item.get('kana'),
                        item.get('meaning'),
                        item.get('hanviet'),
                        item.get('level') or lvl
                    )
    except Exception as e:
        print(f"Lỗi đọc {fn}: {e}")

# Đọc minna_lessons
try:
    with open('src/data/minna_lessons.json', 'r', encoding='utf-8') as f:
        minna = json.load(f)
        for lesson in minna:
            lvl = lesson.get('level', 'N5')
            for item in lesson.get('words', []):
                add_vocab(
                    item.get('kanji'),
                    item.get('kana'),
                    item.get('meaning'),
                    item.get('hanviet'),
                    lvl
                )
except Exception as e:
    print(f"Lỗi đọc minna_lessons.json: {e}")

print(f"Tổng số từ vựng trong kho: {len(vocab_pool)}")

# 2. Xử lý cho từng file N3, N2, N1
for lvl in ['n3', 'n2', 'n1']:
    filepath = f'src/data/kanji/{lvl}.json'
    with open(filepath, 'r', encoding='utf-8') as f:
        kanji_list = json.load(f)

    target_lvl = lvl.upper()
    updated_count = 0
    total_compounds = 0

    for kj in kanji_list:
        ch = kj['kanji']
        existing_ex = kj.get('examples', [])
        if existing_ex and len(existing_ex) >= 5:
            continue

        # Tìm từ vựng chứa Kanji này
        # Ưu tiên các từ cùng cấp độ hoặc cấp độ gần
        matches = [v for v in vocab_pool if ch in v['word']]
        
        # Sắp xếp ưu tiên:
        # 1. Cùng level
        # 2. Từ ngắn (2-4 ký tự, phổ biến trong thi JLPT)
        # 3. Có Hán Việt
        def sort_key(v):
            lvl_score = 0 if v['level'] == target_lvl else 1
            length_score = len(v['word'])
            hv_score = 0 if v['hanviet'] else 1
            return (lvl_score, length_score, hv_score)

        matches.sort(key=sort_key)

        # Lấy tối đa 10 từ tiêu biểu
        selected = matches[:10]
        
        # Nếu chưa đủ từ ghép, bổ sung bản thân chữ kanji với âm on/kun nếu có
        if len(selected) == 0:
            reading = kj['onyomi'][0] if kj['onyomi'] else (kj['kunyomi'][0].replace('.', '') if kj['kunyomi'] else '')
            selected.append({
                'word': ch,
                'reading': reading,
                'meaning': kj['meanings_vi'][0] if kj['meanings_vi'] else '',
                'hanviet': kj.get('hanviet', ''),
                'level': target_lvl
            })

        # Chuẩn hóa format
        formatted_examples = []
        for s in selected:
            # Tạo hoặc kế thừa Hán Việt
            hv = s['hanviet']
            if not hv:
                hv = kj.get('hanviet', '')
            formatted_examples.append({
                'word': s['word'],
                'reading': s['reading'],
                'meaning': s['meaning'],
                'hanviet': hv,
                'level': s['level'] or target_lvl
            })

        kj['examples'] = formatted_examples
        updated_count += 1
        total_compounds += len(formatted_examples)

    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(kanji_list, f, ensure_ascii=False, indent=2)

    print(f"-> Hoàn tất {lvl.upper()}: cập nhật {updated_count}/{len(kanji_list)} Kanji, tổng cộng {total_compounds} từ vựng ví dụ.")

print("=== Hoàn tất toàn bộ việc tổng hợp từ vựng cho N5, N4, N3, N2, N1! ===")
