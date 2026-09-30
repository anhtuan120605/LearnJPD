import urllib.request
import json
import os

print("=== Đang tải và biên soạn dữ liệu Kanji N5 -> N1 ===")

# 1. Tải kanji data (readings, jlpt levels, strokes)
url_kanji = "https://raw.githubusercontent.com/davidluzgouveia/kanji-data/master/kanji.json"
req = urllib.request.urlopen(url_kanji)
raw_kanji = json.loads(req.read().decode('utf-8'))

# 2. Tải KanjiDictVN (Hán Việt và giải nghĩa tiếng Việt)
url_vn1 = "https://raw.githubusercontent.com/trungnt2910/KanjiDictVN/master/out_vn/kanji_bank_1.json"
url_vn2 = "https://raw.githubusercontent.com/trungnt2910/KanjiDictVN/master/out_vn/kanji_bank_2.json"

vn_data = {}
for u in [url_vn1, url_vn2]:
    req = urllib.request.urlopen(u)
    bank = json.loads(req.read().decode('utf-8'))
    for item in bank:
        # item: [kanji, hanviet, "", "", [meanings...], metadata]
        char = item[0]
        hv = item[1].upper()
        meanings = item[4]
        meta = item[5] if len(item) > 5 else {}
        clean_meanings = []
        for m in meanings:
            clean_meanings.append(m.replace("[", "").replace("]", ": "))
        vn_data[char] = {
            "hanviet": hv,
            "meanings_vn": clean_meanings[:3], # Lấy 3 nghĩa chính
            "radical": meta.get("Radical", "")
        }

print(f"Đã load {len(vn_data)} bản ghi Hán Việt từ KanjiDictVN.")

# 3. Phân chia theo cấp độ N5, N4, N3, N2, N1
levels = {5: [], 4: [], 3: [], 2: [], 1: []}

for char, info in raw_kanji.items():
    lvl = info.get("jlpt_new")
    if lvl in levels:
        vn_info = vn_data.get(char, {
            "hanviet": "",
            "meanings_vn": info.get("meanings", []),
            "radical": ""
        })
        
        entry = {
            "id": f"kanji-{char}",
            "kanji": char,
            "hanviet": vn_info["hanviet"],
            "strokes": info.get("strokes", 0),
            "jlpt": f"N{lvl}",
            "onyomi": info.get("readings_on", []),
            "kunyomi": info.get("readings_kun", []),
            "meanings_vi": vn_info["meanings_vn"] if vn_info["meanings_vn"] else info.get("meanings", []),
            "meanings_en": info.get("meanings", []),
            "radical": vn_info["radical"]
        }
        levels[lvl].append(entry)

out_dir = "/Users/ghan81/Downloads/LearnJPD/src/data/kanji"
os.makedirs(out_dir, exist_ok=True)

for lvl, kanjis in levels.items():
    path = os.path.join(out_dir, f"n{lvl}.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(kanjis, f, ensure_ascii=False, indent=2)
    print(f"-> Đã xuất N{lvl}: {len(kanjis)} chữ vào {path}")

print("=== Hoàn tất biên soạn Kanji! ===")
