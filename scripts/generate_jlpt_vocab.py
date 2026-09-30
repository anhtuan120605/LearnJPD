import urllib.request
import csv
import io
import json
import os

print("=== Đang tải và phân bài trọn bộ từ vựng JLPT N5 -> N1 ===")

# Đọc map Hán Việt
hv_map = {}
for lvl in [5, 4, 3, 2, 1]:
    p = f"/Users/ghan81/Downloads/LearnJPD/src/data/kanji/n{lvl}.json"
    if os.path.exists(p):
        with open(p, "r", encoding="utf-8") as f:
            for item in json.load(f):
                hv_map[item["kanji"]] = item["hanviet"].split()[0] if item["hanviet"] else ""

def get_hanviet(kanji_str):
    res = []
    for ch in kanji_str:
        if ch in hv_map and hv_map[ch]:
            res.append(hv_map[ch])
    return " ".join(res)

WORDS_PER_LESSON = 25  # Mỗi bài 25 từ để học vừa sức, dễ nhớ

all_jlpt_levels = {}

for lvl in ['n5', 'n4', 'n3', 'n2', 'n1']:
    lvl_upper = lvl.upper()
    url = f"https://raw.githubusercontent.com/jamsinclair/open-anki-jlpt-decks/main/src/{lvl}.csv"
    print(f"Đang tải {lvl_upper} từ {url}...")
    content = urllib.request.urlopen(url).read().decode('utf-8')
    reader = csv.reader(io.StringIO(content))
    
    words = []
    header = next(reader, None)
    
    for row in reader:
        if len(row) < 3:
            continue
        kanji = row[0].strip()
        reading = row[1].strip()
        meaning_en = row[2].strip()
        
        hanviet = get_hanviet(kanji)
        
        words.append({
            "kanji": kanji,
            "kana": reading,
            "romaji": "",
            "hanviet": hanviet,
            "meaning": meaning_en,  # Tạm thời tiếng Anh chuẩn JLPT
            "meaning_en": meaning_en,
            "level": lvl_upper
        })
    
    # Chia danh sách từ thành các Bài học (Lessons)
    lessons = []
    for i in range(0, len(words), WORDS_PER_LESSON):
        lesson_idx = (i // WORDS_PER_LESSON) + 1
        chunk = words[i:i + WORDS_PER_LESSON]
        for w_idx, w in enumerate(chunk):
            w["id"] = f"{lvl}-{lesson_idx}-{w_idx + 1}"
            w["lesson"] = lesson_idx
        lessons.append({
            "lesson": lesson_idx,
            "title": f"Bài {lesson_idx}",
            "level": lvl_upper,
            "words": chunk
        })
    
    all_jlpt_levels[lvl_upper] = lessons
    print(f"-> {lvl_upper}: Tổng {len(words)} từ, chia thành {len(lessons)} bài học.")

# Ghi ra file json theo từng level trong src/data/vocab
vocab_dir = "/Users/ghan81/Downloads/LearnJPD/src/data/vocab"
os.makedirs(vocab_dir, exist_ok=True)

for lvl_upper, lessons in all_jlpt_levels.items():
    file_path = os.path.join(vocab_dir, f"{lvl_upper.lower()}_lessons.json")
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(lessons, f, ensure_ascii=False, indent=2)
    print(f"-> Đã lưu {file_path}")

print("=== Hoàn tất xuất từ vựng JLPT N5 -> N1! ===")
