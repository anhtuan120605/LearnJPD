# -*- coding: utf-8 -*-
"""
Scan and fix machine translation errors and corrupted definitions across ALL vocabulary files:
- minna_lessons.json
- vocab/n5_lessons.json
- vocab/n4_lessons.json
- vocab/n3_lessons.json
- vocab/n2_lessons.json
- vocab/n1_lessons.json
"""
import json
import sys
import os
import re

sys.stdout.reconfigure(encoding='utf-8')

# Global corrections map for JLPT files & Minna
CORRECTIONS_DICT = {
    # Từ sai nghiêm trọng
    ("会う", "đón"): "Gặp gỡ, gặp",
    ("あう", "đón"): "Gặp gỡ, gặp",
    ("作法", "ái độ; phép xã giao"): "Thái độ; lễ nghi, phép xã giao",
    ("財布", "bao tượng"): "Ví tiền, bóp tiền",
    ("さいふ", "bao tượng"): "Ví tiền, bóp tiền",
    ("植える", "thực vật"): "Trồng (cây)",
    ("うえる", "thực vật"): "Trồng (cây)",
    ("植えます", "thực vật"): "Trồng (cây)",
    ("うえます", "thực vật"): "Trồng (cây)",
    ("二次会", "bên thứ hai"): "Tăng hai (tiệc tiếp theo sau tiệc chính)",
    ("入管", "Sự nhập quan (cho vào áo quan)"): "Cục quản lý xuất nhập cảnh (viết tắt của 出入国在留管理局)",
    ("暗い", "dâm"): "Tối, tối tăm, u ám",
    ("何番", "người Nam man"): "Số mấy, số bao nhiêu",
    ("普通", "nôm na"): "Bình thường, thông thường / Tàu thường",
    ("転勤", "sự mạ vàng (sách)"): "Chuyển công tác (chi nhánh khác)",
    ("君", "Chúc mừng sinh nhật em, Jim!"): "Cậu, bạn, em (ngôi thứ hai thân mật)",
    ("うん", "vận mệnh; vận số"): "Ừ, vâng (thể thông thường)",
    ("～しか", "khoa răng; nha khoa"): "Chỉ ~ (đi kèm với phủ định)",
    ("自由に", "tự tiện"): "Tự do, thoải mái",
    ("まじめ", "nghiêm trọng"): "Nghiêm túc, chăm chỉ, đứng đắn",
    ("歌手", "ca kỹ"): "Ca sĩ",
    ("息子", "Cậu con trai còn bám váy mẹ"): "Con trai (của mình)",
    ("お先に どうぞ。", "Mời bạn đi sau./Xin hãy tiếp tục"): "Xin mời anh/chị cứ đi trước ạ.",
    ("ミーティング", "mít tinh; cuộc họp; hội nghị"): "Cuộc họp (Meeting)",
    ("廊下", "gác"): "Hành lang",
    ("池", "bàu"): "Cái ao, hồ nước",
    ("晴れます", "dọn dẹp"): "Nắng, trời quang đãng",
    ("冷やします", "tuyệt vời"): "Làm lạnh, chườm mát",
    ("太陽", "biển cả"): "Mặt trời",
    ("ボール", "bát to"): "Quả bóng",
    ("募集中", "Ứng dụng mong muốn"): "Đang tuyển dụng",
    ("組み立てます", "tập hợp"): "Lắp ráp",
    ("ソース", "nguồn; khởi nguồn"): "Nước xốt Sauce",
    ("さっき", "sát khí"): "Vừa rồi, ban nãy",
    ("入力します", "đầu vào"): "Nhập dữ liệu (vào máy tính)",
    ("水泳", "lội"): "Môn bơi lội",
    ("埋め立てます", "đòi lại"): "San lấp đất, lấp biển",
    ("手袋", "bít tất tay"): "Găng tay, bao tay",
    ("温度", "độ ẩm"): "Nhiệt độ",
    ("バッグ", "rệp; con rệp"): "Túi xách (Bag)",
    ("ふろしき", "áo choàng (khi tắm xong)"): "Khăn bọc đồ Furoshiki",
    ("めん", "bông; tơ sống"): "Mì sợi, mì",
    ("まずい", "dại dột; không thận trọng"): "Dở, không ngon",
    ("涙", "châu lệ"): "Nước mắt",
    ("床", "giường"): "Sàn nhà",
    ("実験", "kinh nghiệm thực tế"): "Thí nghiệm, thực nghiệm",
    ("科学", "hóa học"): "Khoa học",
    ("化粧", "hóa trang"): "Trang điểm, son phấn",
    ("－パーセント", "chiết suất"): "Phần trăm (%)",
    ("心", "bụng dạ"): "Trái tim, tấm lòng, tâm hồn",
    ("郊外", "đồng nội"): "Khu vực ngoại ô",
    ("ひとこと よろしいでしょうか。", "Tôi có thể nói một từ được không?"): "Tôi xin phép nói đôi lời được không ạ?",
    ("フリーマーケット", "thị trường tự do"): "Chợ đồ cũ, chợ trời (Flea market)",
}

def clean_meaning(m):
    if not m:
        return ""
    # Remove # ?ADD comments
    m = re.sub(r"#.*$", "", m).strip()
    # Strip quotes
    m = m.strip("\"'“””")
    # Clean trailing comma
    m = m.rstrip(",").strip()
    return m

def process_file(file_path):
    if not os.path.exists(file_path):
        return
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    changed = 0
    for lesson in data:
        for w in lesson.get("words", []):
            k = (w.get("kanji") or "").strip()
            kn = (w.get("kana") or "").strip()
            m = w.get("meaning", "")

            # 1. Clean garbage syntax
            cleaned = clean_meaning(m)
            if cleaned != m:
                w["meaning"] = cleaned
                m = cleaned
                changed += 1

            if "meaning_en" in w:
                clean_en = clean_meaning(w["meaning_en"])
                if clean_en != w["meaning_en"]:
                    w["meaning_en"] = clean_en
                    changed += 1

            # 2. Check corrections dict
            for (ck_k, ck_old), ck_new in CORRECTIONS_DICT.items():
                if (k == ck_k or kn == ck_k) and (ck_old.lower() in m.lower() or m == ck_old):
                    w["meaning"] = ck_new
                    changed += 1
                    break

            # 3. Hamburger / Coca artifact
            if "Hamburger" in w.get("meaning", "") or "Coca" in w.get("meaning", ""):
                if k in ["3つ", "３つ", "三つ"] or kn == "みっつ":
                    w["meaning"] = "Ba cái (số đếm đồ vật)"
                    changed += 1

            # 4. Repeated phrase artifact e.g. "x, x"
            parts = [p.strip() for p in w.get("meaning", "").split(",") if p.strip()]
            if len(parts) >= 2 and parts[0].lower() == parts[1].lower():
                w["meaning"] = parts[0]
                changed += 1

    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"File {file_path}: Đã dọn dẹp và sửa {changed} vị trí!")

def main():
    files = [
        "src/data/minna_lessons.json",
        "src/data/vocab/n5_lessons.json",
        "src/data/vocab/n4_lessons.json",
        "src/data/vocab/n3_lessons.json",
        "src/data/vocab/n2_lessons.json",
        "src/data/vocab/n1_lessons.json",
    ]
    for fp in files:
        process_file(fp)

if __name__ == "__main__":
    main()
