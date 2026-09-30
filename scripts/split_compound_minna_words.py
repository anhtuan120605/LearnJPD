#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Split compound vocabulary items in Minna no Nihongo that group two words in parentheses or slashes
(e.g., 'あの 人（あの 方）', 'だれ（どなた）', 'トイレ（お手洗い）', '牛乳（ミルク）', '夫／主人', '妻／家内', etc.)
into separate, distinct, individual vocabulary cards with their own authentic examples, kanji, and kana.
"""

import json

SPLIT_MAP = {
    "あの 人（あの 方）": [
        {
            "kanji": "あの人",
            "kana": "あのひと",
            "romaji": "anohito",
            "hanviet": "NHÂN",
            "meaning": "Người kia, người đó (ngôi thứ 3 thông thường)",
            "meaning_en": "that person",
            "examples": [{
                "ja": "あの人は 田中さんの 友達です。",
                "kana": "あのひとは たなかさんの ともだちです。",
                "vi": "Người kia là bạn của anh Tanaka."
            }]
        },
        {
            "kanji": "あの方",
            "kana": "あのかた",
            "romaji": "anokata",
            "hanviet": "PHƯƠNG",
            "meaning": "Vị kia (cách nói lịch sự của あの人)",
            "meaning_en": "that person (polite)",
            "examples": [{
                "ja": "あの方は 私の 日本語の 先生です。",
                "kana": "あのかたは わたしの にほんごの せんせいです。",
                "vi": "Vị kia là giáo viên tiếng Nhật của tôi."
            }]
        }
    ],
    "だれ（どなた）": [
        {
            "kanji": "だれ",
            "kana": "だれ",
            "romaji": "dare",
            "hanviet": "THÙY",
            "meaning": "Ai (nghi vấn từ thông thường)",
            "meaning_en": "who",
            "examples": [{
                "ja": "教室に だれが いますか。",
                "kana": "きょうしつに だれが いますか。",
                "vi": "Trong phòng học có ai vậy?"
            }]
        },
        {
            "kanji": "どなた",
            "kana": "どなた",
            "romaji": "donata",
            "hanviet": "HÀ PHƯƠNG",
            "meaning": "Vị nào (cách nói lịch sự của だれ)",
            "meaning_en": "who (polite)",
            "examples": [{
                "ja": "あの方は どなたですか。",
                "kana": "あのかたは どなたですか。",
                "vi": "Vị kia là vị nào vậy ạ?"
            }]
        }
    ],
    "さくら大学／富士大学": [
        {
            "kanji": "さくら大学",
            "kana": "さくらだいがく",
            "romaji": "sakuradaigaku",
            "hanviet": "ĐẠI HỌC",
            "meaning": "Trường đại học Sakura (tên trường hư cấu trong giáo trình)",
            "meaning_en": "Sakura University",
            "examples": [{
                "ja": "山田さんは さくら大学の 先生です。",
                "kana": "やまださんは さくらだいがくの せんせいです。",
                "vi": "Thầy Yamada là giáo viên của trường đại học Sakura."
            }]
        },
        {
            "kanji": "富士大学",
            "kana": "ふじだいがく",
            "romaji": "fujidaigaku",
            "hanviet": "PHÚ SĨ ĐẠI HỌC",
            "meaning": "Trường đại học Phú Sĩ (tên trường hư cấu trong giáo trình)",
            "meaning_en": "Fuji University",
            "examples": [{
                "ja": "私は 富士大学の 学生です。",
                "kana": "わたしは ふじだいがくの がくせいです。",
                "vi": "Tôi là sinh viên trường đại học Phú Sĩ."
            }]
        }
    ],
    "IMC／パワー電気／ブラジルエアー": [
        {
            "kanji": "IMC",
            "kana": "アイエムシー",
            "romaji": "aimushi",
            "hanviet": "",
            "meaning": "Công ty IMC (công ty máy tính hư cấu trong giáo trình)",
            "meaning_en": "IMC Company",
            "examples": [{
                "ja": "ミラーさんは IMCの 社員です。",
                "kana": "みらーさんは アイエムシーの しゃいんです。",
                "vi": "Anh Miller là nhân viên công ty IMC."
            }]
        },
        {
            "kanji": "パワー電気",
            "kana": "パワーでんき",
            "romaji": "pawadenki",
            "hanviet": "ĐIỆN KHÍ",
            "meaning": "Công ty Điện lực Power",
            "meaning_en": "Power Electric Company",
            "examples": [{
                "ja": "兄は パワー電気で 働いています。",
                "kana": "あには パワーでんきで はたらいています。",
                "vi": "Anh trai tôi làm việc tại công ty điện lực Power."
            }]
        },
        {
            "kanji": "ブラジルエアー",
            "kana": "ブラジルエアー",
            "romaji": "burajiruea",
            "hanviet": "",
            "meaning": "Hãng hàng không Brazil Air",
            "meaning_en": "Brazil Air",
            "examples": [{
                "ja": "ブラジルエアーの 飛行機に 乗りました。",
                "kana": "ブラジルエアーの ひこうきに のりました。",
                "vi": "Tôi đã đi máy bay của hãng hàng không Brazil Air."
            }]
        }
    ],
    "トイレ（お手洗い）": [
        {
            "kanji": "トイレ",
            "kana": "トイレ",
            "romaji": "toire",
            "hanviet": "",
            "meaning": "Nhà vệ sinh (cách nói thông dụng hàng ngày)",
            "meaning_en": "toilet, restroom",
            "examples": [{
                "ja": "トイレは どこですか。",
                "kana": "といれは どこですか。",
                "vi": "Nhà vệ sinh ở đâu vậy?"
            }]
        },
        {
            "kanji": "お手洗い",
            "kana": "おてあらい",
            "romaji": "otearai",
            "hanviet": "THỦ TẨY",
            "meaning": "Phòng vệ sinh (cách nói lịch sự, tao nhã)",
            "meaning_en": "restroom, washroom (polite)",
            "examples": [{
                "ja": "すみません、お手洗いは どこですか。",
                "kana": "すみません、おてあらいは どこですか。",
                "vi": "Xin lỗi cho tôi hỏi phòng vệ sinh ở đâu ạ?"
            }]
        }
    ],
    "晩（夜）": [
        {
            "kanji": "晩",
            "kana": "ばん",
            "romaji": "ban",
            "hanviet": "VÃN",
            "meaning": "Buổi tối",
            "meaning_en": "evening",
            "examples": [{
                "ja": "晩 ご飯に 魚を 食べました。",
                "kana": "ばん ごはんに さかなを たべました。",
                "vi": "Bữa tối tôi đã ăn cá."
            }]
        },
        {
            "kanji": "夜",
            "kana": "よる",
            "romaji": "yoru",
            "hanviet": "DẠ",
            "meaning": "Ban đêm, buổi tối",
            "meaning_en": "night",
            "examples": [{
                "ja": "夜は 早く 寝るように しています。",
                "kana": "よるは はやく ねるように しています。",
                "vi": "Buổi tối tôi luôn cố gắng đi ngủ sớm."
            }]
        }
    ],
    "牛乳（ミルク）": [
        {
            "kanji": "牛乳",
            "kana": "ぎゅうにゅう",
            "romaji": "gyuunyuu",
            "hanviet": "NGƯU NHŨ",
            "meaning": "Sữa bò (từ gốc Hán)",
            "meaning_en": "milk",
            "examples": [{
                "ja": "毎朝 牛乳を 飲みます。",
                "kana": "まいあさ ぎゅうにゅうを のみます。",
                "vi": "Mỗi sáng tôi đều uống sữa bò."
            }]
        },
        {
            "kanji": "ミルク",
            "kana": "ミルク",
            "romaji": "miruku",
            "hanviet": "",
            "meaning": "Sữa (từ mượn Katakana)",
            "meaning_en": "milk",
            "examples": [{
                "ja": "コーヒーに ミルクを 入れます。",
                "kana": "こーひーに みるくを いれます。",
                "vi": "Cho sữa vào cà phê."
            }]
        }
    ],
    "いい（よい）": [
        {
            "kanji": "いい",
            "kana": "いい",
            "romaji": "ii",
            "hanviet": "",
            "meaning": "Tốt, hay (thường dùng trong khẩu ngữ dạng nguyên thể)",
            "meaning_en": "good",
            "examples": [{
                "ja": "きょうは とても いい 天気ですね。",
                "kana": "きょうは とても いい てんきですね。",
                "vi": "Hôm nay thời tiết rất đẹp nhỉ."
            }]
        },
        {
            "kanji": "よい",
            "kana": "よい",
            "romaji": "yoi",
            "hanviet": "",
            "meaning": "Tốt, hay (dùng khi chia thể: よくない, よかった)",
            "meaning_en": "good (conjugation base)",
            "examples": [{
                "ja": "この 辞書は とても よいです。",
                "kana": "この じしょは とても よいです。",
                "vi": "Cuốn từ điển này rất tốt."
            }]
        }
    ],
    "夫／主人": [
        {
            "kanji": "夫",
            "kana": "おっと",
            "romaji": "otto",
            "hanviet": "PHU",
            "meaning": "Chồng (của mình - từ trung tính)",
            "meaning_en": "my husband",
            "examples": [{
                "ja": "夫は 銀行員です。",
                "kana": "おっとは ぎんこういんです。",
                "vi": "Chồng tôi là nhân viên ngân hàng."
            }]
        },
        {
            "kanji": "主人",
            "kana": "しゅじん",
            "romaji": "shujin",
            "hanviet": "CHỦ NHÂN",
            "meaning": "Chồng (của mình - cách gọi quen thuộc)",
            "meaning_en": "my husband",
            "examples": [{
                "ja": "主人は 今 出張中です。",
                "kana": "しゅじんは いま しゅっちょうちゅうです。",
                "vi": "Nhà tôi hiện đang đi công tác."
            }]
        }
    ],
    "妻／家内": [
        {
            "kanji": "妻",
            "kana": "つま",
            "romaji": "tsuma",
            "hanviet": "THÊ",
            "meaning": "Vợ (của mình - từ trung tính)",
            "meaning_en": "my wife",
            "examples": [{
                "ja": "妻は 料理が 上手です。",
                "kana": "つまは りょうりが じょうずです。",
                "vi": "Vợ tôi nấu ăn rất giỏi."
            }]
        },
        {
            "kanji": "家内",
            "kana": "かない",
            "romaji": "kanai",
            "hanviet": "GIA NỘI",
            "meaning": "Vợ (của mình - cách gọi khiêm tốn)",
            "meaning_en": "my wife (humble)",
            "examples": [{
                "ja": "家内と 買い物を しました。",
                "kana": "かないと かいものを しました。",
                "vi": "Tôi đã đi mua sắm cùng nhà tôi."
            }]
        }
    ],
    "航空便（エアメール）": [
        {
            "kanji": "航空便",
            "kana": "こうくうびん",
            "romaji": "koukuubin",
            "hanviet": "HÀNG KHÔNG TIỆN",
            "meaning": "Thư gửi đường hàng không",
            "meaning_en": "airmail",
            "examples": [{
                "ja": "航空便で 手紙を 送りました。",
                "kana": "こうくうびんで てがみを おくりました。",
                "vi": "Tôi đã gửi thư bằng đường hàng không."
            }]
        },
        {
            "kanji": "エアメール",
            "kana": "エアメール",
            "romaji": "eame-ru",
            "hanviet": "",
            "meaning": "Thư hàng không (Airmail)",
            "meaning_en": "airmail",
            "examples": [{
                "ja": "エアメールは いくらですか。",
                "kana": "エアメールは いくらですか。",
                "vi": "Gửi bằng đường hàng không giá bao nhiêu tiền?"
            }]
        }
    ],
    "おじいさん／おじいちゃん": [
        {
            "kanji": "おじいさん",
            "kana": "おじいさん",
            "romaji": "ojiisan",
            "hanviet": "",
            "meaning": "Ông (của người khác), cụ ông",
            "meaning_en": "grandfather, old man",
            "examples": [{
                "ja": "あのおじいさんは 元気です。",
                "kana": "あのおじいさんは げんきです。",
                "vi": "Cụ ông kia rất khỏe mạnh."
            }]
        },
        {
            "kanji": "おじいちゃん",
            "kana": "おじいちゃん",
            "romaji": "ojiichan",
            "hanviet": "",
            "meaning": "Ông (gọi thân mật trong gia đình)",
            "meaning_en": "grandpa",
            "examples": [{
                "ja": "おじいちゃん、おはようございます。",
                "kana": "おじいちゃん、おはようございます。",
                "vi": "Cháu chào ông buổi sáng ạ."
            }]
        }
    ],
    "おばあさん／おばあちゃん": [
        {
            "kanji": "おばあさん",
            "kana": "おばあさん",
            "romaji": "obaasan",
            "hanviet": "",
            "meaning": "Bà (của người khác), cụ bà",
            "meaning_en": "grandmother, old woman",
            "examples": [{
                "ja": "あのおばあさんは 親切です。",
                "kana": "あのおばあさんは しんせつです。",
                "vi": "Cụ bà kia rất tốt bụng."
            }]
        },
        {
            "kanji": "おばあちゃん",
            "kana": "おばあちゃん",
            "romaji": "obaachan",
            "hanviet": "",
            "meaning": "Bà (gọi thân mật trong gia đình)",
            "meaning_en": "grandma",
            "examples": [{
                "ja": "おばあちゃんの 料理は 美味しいです。",
                "kana": "おばあちゃんの りょうりは おいしいです。",
                "vi": "Món ăn bà nấu rất là ngon."
            }]
        }
    ]
}

def main():
    file_path = "src/data/minna_lessons.json"
    with open(file_path, "r", encoding="utf-8") as f:
        lessons = json.load(f)

    split_occurrences = 0

    for lesson in lessons:
        l_num = lesson.get("lesson", 1)
        lvl = lesson.get("level", "N5" if l_num <= 25 else "N4")
        new_words = []
        word_counter = 1

        for w in lesson.get("words", []):
            k = (w.get("kanji") or "").strip()
            
            if k in SPLIT_MAP:
                items = SPLIT_MAP[k]
                split_occurrences += 1
                for sub in items:
                    new_item = {
                        "id": f"minna-{l_num}-{word_counter}",
                        "lesson": l_num,
                        "level": lvl,
                        "kanji": sub["kanji"],
                        "kana": sub["kana"],
                        "romaji": sub["romaji"],
                        "hanviet": sub["hanviet"],
                        "meaning": sub["meaning"],
                        "meaning_en": sub["meaning_en"],
                        "examples": sub["examples"]
                    }
                    new_words.append(new_item)
                    word_counter += 1
            else:
                w["id"] = f"minna-{l_num}-{word_counter}"
                new_words.append(w)
                word_counter += 1

        lesson["words"] = new_words

    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(lessons, f, ensure_ascii=False, indent=2)

    print(f"=== ĐÃ TÁCH THÀNH CÔNG {split_occurrences} CỤM TỪ GHÉP TRONG MINNA THÀNH CÁC TỪ ĐỘC LẬP! ===")

if __name__ == "__main__":
    main()
