import urllib.request
import json
import re

print("=== Đang tải từ vựng Minna no Nihongo (vitto4/MinnaNoDS) ===")
url = "https://raw.githubusercontent.com/vitto4/MinnaNoDS/master/minna-no-ds.yaml"
req = urllib.request.urlopen(url)
content = req.read().decode('utf-8')

# Parser đơn giản cho cấu trúc yaml của minna-no-ds
lessons = {}
current_lesson = None
current_word = {}

lines = content.split('\n')
i = 0
while i < len(lines):
    line = lines[i]
    m_lesson = re.match(r'^(lesson-\d+):', line)
    if m_lesson:
        current_lesson = m_lesson.group(1)
        lessons[current_lesson] = []
        i += 1
        continue
    
    if current_lesson and line.startswith('  - id:'):
        # bắt đầu từ mới
        word = {}
        # parse block word
        while i < len(lines):
            l = lines[i]
            if l.startswith('  - id:') and len(word) > 0:
                break
            if re.match(r'^(lesson-\d+):', l):
                break
            
            m_id = re.search(r'id:\s*\[(\d+),\s*(\d+)\]', l)
            if m_id:
                word['lesson_num'] = int(m_id.group(1))
                word['word_num'] = int(m_id.group(2))
            
            m_kanji = re.search(r'kanji:\s*(.*)', l)
            if m_kanji:
                v = m_kanji.group(1).strip().strip('"').strip("'")
                word['kanji'] = "" if v == "~" else v
            
            m_kana = re.search(r'kana:\s*(.*)', l)
            if m_kana:
                word['kana'] = m_kana.group(1).strip().strip('"').strip("'")
                
            m_romaji = re.search(r'romaji:\s*(.*)', l)
            if m_romaji:
                word['romaji'] = m_romaji.group(1).strip().strip('"').strip("'")
                
            m_en = re.search(r'en:\s*(.*)', l)
            if m_en:
                word['meaning_en'] = m_en.group(1).strip().strip('"').strip("'")
                
            i += 1
            if i < len(lines) and (lines[i].startswith('  - id:') or re.match(r'^(lesson-\d+):', lines[i])):
                break
        
        if 'kana' in word:
            lessons[current_lesson].append(word)
        continue
    i += 1

print(f"Đã parse thành công {len(lessons)} bài học Minna no Nihongo.")

# Bảng từ điển dịch tiếng Việt cho các từ thông dụng Minna no Nihongo
vi_dict = {
    "わたし": {"vi": "Tôi", "hv": "TƯ"},
    "わたしたち": {"vi": "Chúng tôi, chúng ta", "hv": "TƯ"},
    "あなた": {"vi": "Bạn, anh, chị, ông, bà", "hv": ""},
    "あのひと": {"vi": "Người kia, người đó", "hv": "NHÂN"},
    "あのかた": {"vi": "Vị kia (lịch sự của あのひと)", "hv": "PHƯƠNG"},
    "みなさん": {"vi": "Các bạn, các anh, các chị, mọi người", "hv": "GIAI"},
    "〜さん": {"vi": "Anh, chị, ông, bà (hậu tố xưng hô)", "hv": ""},
    "〜ちゃん": {"vi": "Bé (gọi thân mật cho trẻ em/bạn bè gái)", "hv": ""},
    "〜くん": {"vi": "Cậu, bạn (gọi thân mật cho bạn nam/người nhỏ tuổi)", "hv": "QUÂN"},
    "〜じん": {"vi": "Người (nước nào đó, vd: ベトナムじん)", "hv": "NHÂN"},
    "せんせい": {"vi": "Thầy, cô giáo (dùng để xưng hô/gọi)", "hv": "TIÊN SINH"},
    "きょうし": {"vi": "Giáo viên (nghề nghiệp của bản thân)", "hv": "GIÁO SƯ"},
    "がくせい": {"vi": "Học sinh, sinh viên", "hv": "HỌC SINH"},
    "かいしゃいん": {"vi": "Nhân viên công ty", "hv": "HỘI XÃ VIÊN"},
    "しゃいん": {"vi": "Nhân viên công ty (dùng kèm tên công ty)", "hv": "XÃ VIÊN"},
    "ぎんこういん": {"vi": "Nhân viên ngân hàng", "hv": "NGÂN HÀNG VIÊN"},
    "いしゃ": {"vi": "Bác sĩ", "hv": "Y GIẢ"},
    "けんきゅうしゃ": {"vi": "Nhà nghiên cứu", "hv": "NGHIÊN CỨU GIẢ"},
    "エンジニア": {"vi": "Kỹ sư", "hv": ""},
    "だいがく": {"vi": "Trường đại học", "hv": "ĐẠI HỌC"},
    "びょういん": {"vi": "Bệnh viện", "hv": "BỆNH VIỆN"},
    "でんき": {"vi": "Điện, đèn điện", "hv": "ĐIỆN KHÍ"},
    "だれ": {"vi": "Ai (hỏi người)", "hv": "THÙY"},
    "どなた": {"vi": "Vị nào (lịch sự của だれ)", "hv": ""},
    "〜さい": {"vi": "Tuổi", "hv": "TUẾ"},
    "なんさい": {"vi": "Mấy tuổi", "hv": "HÀ TUẾ"},
    "おいくつ": {"vi": "Bao nhiêu tuổi (lịch sự)", "hv": ""},
    "はい": {"vi": "Vâng, dạ, đúng vậy", "hv": ""},
    "いいえ": {"vi": "Không, không phải", "hv": ""},
    "これ": {"vi": "Cái này (gần người nói)", "hv": ""},
    "それ": {"vi": "Cái đó (gần người nghe)", "hv": ""},
    "あれ": {"vi": "Cái kia (xa cả hai)", "hv": ""},
    "この": {"vi": "Này (~ đứng trước danh từ)", "hv": ""},
    "その": {"vi": "Đó (~ đứng trước danh từ)", "hv": ""},
    "あの": {"vi": "Kia (~ đứng trước danh từ)", "hv": ""},
    "ほん": {"vi": "Sách", "hv": "BẢN"},
    "じしょ": {"vi": "Từ điển", "hv": "TỪ THƯ"},
    "ざっし": {"vi": "Tạp chí", "hv": "TẠP CHÍ"},
    "しんぶん": {"vi": "Báo", "hv": "TÂN VĂN"},
    "ノート": {"vi": "Vở, sổ tay", "hv": ""},
    "てちょう": {"vi": "Sổ tay cá nhân", "hv": "THỦ TRƯỚNG"},
    "めいし": {"vi": "Danh thiếp", "hv": "DANH THIẾP"},
    "カード": {"vi": "Thẻ (card)", "hv": ""},
    "えんぴつ": {"vi": "Bút chì", "hv": "DUYÊN BÚT"},
    "ボールペン": {"vi": "Bút bi", "hv": ""},
    "かぎ": {"vi": "Chìa khóa", "hv": "TOẢ"},
    "とけい": {"vi": "Đồng hồ", "hv": "THỜI KẾ"},
    "かさ": {"vi": "Ô, dù", "hv": "TẢN"},
    "かばん": {"vi": "Cặp sách, túi xách", "hv": ""},
    "テレビ": {"vi": "Tivi", "hv": ""},
    "ラジオ": {"vi": "Đài radio", "hv": ""},
    "カメラ": {"vi": "Máy ảnh", "hv": ""},
    "コンピューター": {"vi": "Máy vi tính", "hv": ""},
    "くるま": {"vi": "Ô tô, xe hơi", "hv": "XA"},
    "つくえ": {"vi": "Bàn học/làm việc", "hv": "TRỐC"},
    "いす": {"vi": "Ghế", "hv": "Ỷ"},
    "ここ": {"vi": "Chỗ này, đây", "hv": ""},
    "そこ": {"vi": "Chỗ đó, đấy", "hv": ""},
    "あそこ": {"vi": "Chỗ kia, đằng kia", "hv": ""},
    "どこ": {"vi": "Ở đâu", "hv": "HÀ"},
    "きょうしつ": {"vi": "Phòng học, lớp học", "hv": "GIÁO THẤT"},
    "しょくどう": {"vi": "Nhà ăn, căng tin", "hv": "THỰC ĐƯỜNG"},
    "じむしょ": {"vi": "Văn phòng làm việc", "hv": "SỰ VỤ SỞ"},
    "かいぎしつ": {"vi": "Phòng họp", "hv": "HỘI NGHỊ THẤT"},
    "うけつけ": {"vi": "Quầy lễ tân", "hv": "THỤ PHÓ"},
    "へや": {"vi": "Căn phòng", "hv": "BỘ ỐC"},
    "トイレ": {"vi": "Nhà vệ sinh", "hv": ""},
    "かいだん": {"vi": "Cầu thang bộ", "hv": "GIAI ĐOÀN"},
    "エレベーター": {"vi": "Thang máy", "hv": ""},
    "くに": {"vi": "Đất nước, quốc gia", "hv": "QUỐC"},
    "かいしゃ": {"vi": "Công ty", "hv": "HỘI XÃ"},
    "うち": {"vi": "Nhà (của mình)", "hv": "GIA"},
    "でんわ": {"vi": "Điện thoại", "hv": "ĐIỆN THOẠI"},
    "くつ": {"vi": "Giày dép", "hv": "NGOA"},
    "ネクタイ": {"vi": "Cà vạt", "hv": ""},
    "ワイン": {"vi": "Rượu vang", "hv": ""},
    "いくら": {"vi": "Bao nhiêu tiền", "hv": ""}
}

# Đọc thêm từ KanjiDictVN để tự động sinh Hán Việt cho Kanji
import os
kanji_n5_file = "/Users/ghan81/Downloads/LearnJPD/src/data/kanji/n5.json"
kanji_n4_file = "/Users/ghan81/Downloads/LearnJPD/src/data/kanji/n4.json"

hv_map = {}
for p in [kanji_n5_file, kanji_n4_file]:
    if os.path.exists(p):
        with open(p, "r", encoding="utf-8") as f:
            for item in json.load(f):
                hv_map[item["kanji"]] = item["hanviet"].split()[0] if item["hanviet"] else ""

def get_hanviet_for_word(kanji_str, kana_str):
    if kana_str in vi_dict and vi_dict[kana_str]["hv"]:
        return vi_dict[kana_str]["hv"]
    res = []
    for ch in kanji_str:
        if ch in hv_map and hv_map[ch]:
            res.append(hv_map[ch])
    return " ".join(res)

all_lessons_output = []

for l_key, words in lessons.items():
    l_num = int(l_key.replace("lesson-", ""))
    lesson_data = {
        "lesson": l_num,
        "title": f"Bài {l_num}",
        "level": "N5" if l_num <= 25 else "N4",
        "words": []
    }
    
    for w in words:
        kana = w.get("kana", "")
        kanji = w.get("kanji", "")
        meaning_en = w.get("meaning_en", "")
        romaji = w.get("romaji", "")
        
        # tra cứu nghĩa tiếng Việt
        vi_entry = vi_dict.get(kana, {})
        meaning_vi = vi_entry.get("vi", meaning_en)
        hanviet = vi_entry.get("hv", "")
        if not hanviet and kanji:
            hanviet = get_hanviet_for_word(kanji, kana)
            
        word_obj = {
            "id": f"minna-{l_num}-{w.get('word_num', 1)}",
            "lesson": l_num,
            "level": "N5" if l_num <= 25 else "N4",
            "kanji": kanji if kanji else kana,
            "kana": kana,
            "romaji": romaji,
            "hanviet": hanviet,
            "meaning": meaning_vi,
            "meaning_en": meaning_en
        }
        lesson_data["words"].append(word_obj)
        
    all_lessons_output.append(lesson_data)

out_file = "/Users/ghan81/Downloads/LearnJPD/src/data/minna_lessons.json"
with open(out_file, "w", encoding="utf-8") as f:
    json.dump(all_lessons_output, f, ensure_ascii=False, indent=2)

print(f"=== Đã xuất thành công {len(all_lessons_output)} bài Minna vào {out_file}! ===")
