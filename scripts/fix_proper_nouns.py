# -*- coding: utf-8 -*-
"""
Chuẩn hóa toàn bộ tên riêng, địa danh, tên tổ chức/cửa hàng/chương trình mẫu
trong giáo trình Minna no Nihongo (Bài 1 - 50).
Loại bỏ triệt để các định nghĩa dở như:
- "cửa hàng bách hóa hư cấu"
- "siêu thị hư cấu"
- "tiêu đề của"
- "Ghi chú" (Paris)
- Giữ nguyên tiếng Nhật không dịch (あすか, アップル銀行, みどり図書館, やまと美術館...)
"""
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

PROPER_NOUN_FIXES = {
    # Bài 1
    "AKC": {
        "meaning": "Viện nghiên cứu AKC",
        "meaning_en": "AKC Research Institute"
    },
    "神戸病院": {
        "meaning": "Bệnh viện Kobe",
        "meaning_en": "Kobe Hospital"
    },
    "さくら大学": {
        "meaning": "Trường Đại học Sakura",
        "meaning_en": "Sakura University"
    },
    "富士大学": {
        "meaning": "Trường Đại học Phú Sĩ (Fuji)",
        "meaning_en": "Fuji University"
    },
    "IMC": {
        "meaning": "Công ty máy tính IMC",
        "meaning_en": "IMC Computer Company"
    },
    "パワー電気": {
        "meaning": "Công ty Điện lực Power",
        "meaning_en": "Power Electric Company"
    },
    "ブラジルエアー": {
        "meaning": "Hãng hàng không Brazil Air",
        "meaning_en": "Brazil Air"
    },

    # Bài 3
    "ジャカルタ": {
        "meaning": "Thủ đô Jakarta (Indonesia)",
        "meaning_en": "Jakarta"
    },
    "バンコク": {
        "meaning": "Thủ đô Băng Cốc (Bangkok, Thái Lan)",
        "meaning_en": "Bangkok"
    },
    "ベルリン": {
        "meaning": "Thủ đô Béc-lin (Berlin, Đức)",
        "meaning_en": "Berlin"
    },
    "新大阪": {
        "meaning": "Ga Shin-Osaka (ở Osaka)",
        "meaning_en": "Shin-Osaka Station"
    },
    "MT／ヨーネン／アキックス": {
        "meaning": "Tên các công ty mẫu (MT / Yonen / Akikkusu)",
        "meaning_en": "Sample company names (MT / Yonen / Akics)"
    },

    # Bài 4
    "ニューヨーク": {
        "meaning": "Thành phố New York (Mỹ)",
        "meaning_en": "New York"
    },
    "ペキン": {
        "meaning": "Thủ đô Bắc Kinh (Trung Quốc)",
        "meaning_en": "Beijing"
    },
    "ロサンゼルス": {
        "meaning": "Thành phố Los Angeles (Mỹ)",
        "meaning_en": "Los Angeles"
    },
    "ロンドン": {
        "meaning": "Thủ đô Luân Đôn (London, Anh)",
        "meaning_en": "London"
    },
    "あすか": {
        "meaning": "Nhà hàng Nhật Asuka",
        "meaning_en": "Asuka (Japanese restaurant)"
    },
    "アップル銀行": {
        "meaning": "Ngân hàng Apple",
        "meaning_en": "Apple Bank"
    },
    "みどり図書館": {
        "meaning": "Thư viện Midori",
        "meaning_en": "Midori Library"
    },
    "やまと美術館": {
        "meaning": "Bảo tàng mỹ thuật Yamato",
        "meaning_en": "Yamato Art Museum"
    },
    "大阪デパート": {
        "meaning": "Trung tâm thương mại Osaka (Bách hóa Osaka)",
        "meaning_en": "Osaka Department Store"
    },

    # Bài 5
    "甲子園": {
        "meaning": "Sân vận động Koshien (gần Osaka)",
        "meaning_en": "Koshien Stadium"
    },
    "大阪城": {
        "meaning": "Lâu đài Osaka",
        "meaning_en": "Osaka Castle"
    },
    "博多": {
        "meaning": "Khu thương mại Hakata (ở Fukuoka, Kyushu)",
        "meaning_en": "Hakata (Fukuoka)"
    },
    "伏見": {
        "meaning": "Thị trấn Fushimi (ở Kyoto)",
        "meaning_en": "Fushimi (Kyoto)"
    },

    # Bài 6
    "つるや": {
        "meaning": "Nhà hàng Tsuruya",
        "meaning_en": "Tsuruya Restaurant"
    },
    "フランス屋": {
        "meaning": "Siêu thị Fransu-ya",
        "meaning_en": "Fransu-ya Supermarket"
    },
    "毎日屋": {
        "meaning": "Siêu thị Mainichiya",
        "meaning_en": "Mainichiya Supermarket"
    },
    "大阪城公園": {
        "meaning": "Công viên Lâu đài Osaka",
        "meaning_en": "Osaka Castle Park"
    },

    # Bài 7
    "ヨーロッパ": {
        "meaning": "Châu Âu",
        "meaning_en": "Europe"
    },
    "スペイン": {
        "meaning": "Tây Ban Nha",
        "meaning_en": "Spain"
    },

    # Bài 8
    "シャンハイ": {
        "meaning": "Thượng Hải (Trung Quốc)",
        "meaning_en": "Shanghai"
    },
    "金閣寺": {
        "meaning": "Chùa Vàng Kinkaku-ji (Kyoto)",
        "meaning_en": "Kinkaku-ji Temple (Golden Pavilion)"
    },
    "奈良公園": {
        "meaning": "Công viên Nara",
        "meaning_en": "Nara Park"
    },
    "富士山": {
        "meaning": "Núi Phú Sĩ (Fuji)",
        "meaning_en": "Mt. Fuji"
    },
    "「七人の 侍」": {
        "meaning": "Bộ phim kinh điển 'Bảy võ sĩ đạo' (Seven Samurai)",
        "meaning_en": "'Seven Samurai' (Classic Akira Kurosawa film)"
    },
    "琵琶湖": {
        "meaning": "Hồ Biwa (hồ lớn nhất Nhật Bản)",
        "meaning_en": "Lake Biwa"
    },

    # Bài 9
    "小沢征爾": {
        "meaning": "Nhạc trưởng Ozawa Seiji (1935–2024)",
        "meaning_en": "Seiji Ozawa (Japanese conductor)"
    },

    # Bài 10
    "ナンプラー": {
        "meaning": "Nước mắm Thái Lan (Nam Pla)",
        "meaning_en": "Nam pla (Thai fish sauce)"
    },
    "東京 ディズニーランド": {
        "meaning": "Công viên Tokyo Disneyland",
        "meaning_en": "Tokyo Disneyland"
    },
    "アジアストア": {
        "meaning": "Cửa hàng Asia Store",
        "meaning_en": "Asia Store"
    },
    "ユニューア・ストア": {
        "meaning": "Siêu thị Unyua Store",
        "meaning_en": "Unyua Store"
    },

    # Bài 12
    "ABC ストア": {
        "meaning": "Siêu thị ABC Store",
        "meaning_en": "ABC Store"
    },
    "ジャパン": {
        "meaning": "Siêu thị Japan Store",
        "meaning_en": "Japan Store"
    },

    # Bài 13
    "アキックス": {
        "meaning": "Công ty Akikkusu",
        "meaning_en": "Akics Company"
    },
    "おはようテレビ": {
        "meaning": "Chương trình truyền hình Ohayou TV",
        "meaning_en": "Ohayou TV"
    },

    # Bài 14
    "みどり 町": {
        "meaning": "Thị trấn Midori-cho",
        "meaning_en": "Midori Town"
    },
    "梅田": {
        "meaning": "Khu thương mại Umeda (ở Osaka)",
        "meaning_en": "Umeda (Osaka)"
    },

    # Bài 15
    "日本橋": {
        "meaning": "Khu mua sắm Nipponbashi (ở Osaka)",
        "meaning_en": "Nipponbashi (Osaka)"
    },
    "みんなの インタビュー": {
        "meaning": "Chương trình phỏng vấn 'Phỏng vấn mọi người'",
        "meaning_en": "'Minna no Interview' TV Program"
    },

    # Bài 16
    "大学前": {
        "meaning": "Trạm xe buýt Trước Trường Đại học (Daigaku-mae)",
        "meaning_en": "Daigaku-mae Bus Stop"
    },

    # Bài 21
    "ヨーネン": {
        "meaning": "Công ty Yonen",
        "meaning_en": "Yonen Company"
    },
    "天神祭": {
        "meaning": "Lễ hội Tenjin (ở Osaka)",
        "meaning_en": "Tenjin Festival (Osaka)"
    },
    "吉野山": {
        "meaning": "Núi Yoshino (tỉnh Nara, nổi tiếng hoa anh đào)",
        "meaning_en": "Mt. Yoshino (Nara)"
    },

    # Bài 22
    "パリ": {
        "meaning": "Thủ đô Paris (Pháp)",
        "meaning_en": "Paris"
    },
    "万裏の 長城": {
        "meaning": "Vạn Lý Trường Thành (Trung Quốc)",
        "meaning_en": "The Great Wall of China"
    },
    "みんなの アンケート": {
        "meaning": "Bảng khảo sát 'Ý kiến mọi người'",
        "meaning_en": "'Minna no Questionnaire'"
    },

    # Bài 23
    "元気茶": {
        "meaning": "Trà Genkicha (tên nhãn hiệu trà)",
        "meaning_en": "Genki Tea"
    },
    "本田駅": {
        "meaning": "Ga Honda",
        "meaning_en": "Honda Station"
    },
    "図書館前": {
        "meaning": "Trạm xe buýt Trước Thư viện (Toshokan-mae)",
        "meaning_en": "Toshokan-mae Bus Stop"
    },

    # Bài 26
    "エドアストア": {
        "meaning": "Cửa hàng Edoa Store",
        "meaning_en": "Edoa Store"
    },

    # Bài 35
    "みんなの 学校": {
        "meaning": "Trường học Minna no Gakkou",
        "meaning_en": "'Minna no Gakkou' School"
    },
    "大黒ずし": {
        "meaning": "Quán sushi Daikoku",
        "meaning_en": "Daikoku Sushi"
    },
    "IMCパソコン教室": {
        "meaning": "Lớp học vi tính IMC",
        "meaning_en": "IMC Computer School"
    },
    "母の 味": {
        "meaning": "Cuốn sách 'Hương vị của Mẹ'",
        "meaning_en": "'Mother's Taste' Book"
    },
    "はる": {
        "meaning": "Tiệm làm tóc Haru",
        "meaning_en": "Haru Hair Salon"
    },
    "佐藤歯科": {
        "meaning": "Phòng khám nha khoa Sato",
        "meaning_en": "Sato Dental Clinic"
    },
    "毎日クッキング": {
        "meaning": "Lớp học nấu ăn Mainichi Cooking",
        "meaning_en": "Mainichi Cooking School"
    },

    # Bài 42
    "こどもニュース": {
        "meaning": "Chương trình thời sự trẻ em (Kodomo News)",
        "meaning_en": "Children's News Program"
    },

    # Bài 44
    "ホテルひろしま": {
        "meaning": "Khách sạn Hiroshima",
        "meaning_en": "Hotel Hiroshima"
    },

    # Bài 49
    "ひまわり小学校": {
        "meaning": "Trường tiểu học Himawari",
        "meaning_en": "Himawari Elementary School"
    }
}

def main():
    file_path = "src/data/minna_lessons.json"
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    updated = 0
    for lesson in data:
        for w in lesson.get("words", []):
            k = (w.get("kanji") or "").strip()
            kn = (w.get("kana") or "").strip()

            for key, val in PROPER_NOUN_FIXES.items():
                if k == key or kn == key or k.replace(" ", "") == key.replace(" ", ""):
                    w["meaning"] = val["meaning"]
                    w["meaning_en"] = val["meaning_en"]
                    updated += 1
                    break

    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"-> Đã chuẩn hóa toàn bộ tên riêng, địa danh, cơ sở mẫu: Cập nhật {updated} từ!")

if __name__ == "__main__":
    main()
