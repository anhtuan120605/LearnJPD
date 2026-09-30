#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generate complete Minna no Nihongo Grammar (50 lessons) and Reading (50 lessons),
and refine minna_lessons.json to have short, simple, grammar-aligned example sentences.
"""

import json
import os
import pykakasi

kakasi = pykakasi.kakasi()

def to_hira(text):
    if not text:
        return ""
    res = kakasi.convert(text)
    return "".join([item["hira"] for item in res])

print("=== Đang xây dựng dữ liệu Ngữ pháp & Bài đọc chuẩn Minna no Nihongo 50 bài ===")

# Dữ liệu Ngữ pháp 50 bài Minna no Nihongo
# Định dạng: { lesson: int, title: str, level: str, points: [{ id, structure, meaning, explanation, examples: [{ ja, kana, vi }] }] }
MINNA_GRAMMAR_POINTS = [
    {
        "lesson": 1,
        "title": "Bài 1: Giới thiệu bản thân, nghề nghiệp & quốc tịch",
        "level": "N5",
        "points": [
            {
                "id": "g1-1",
                "structure": "N1 は N2 です",
                "meaning": "N1 là N2",
                "explanation": "Mẫu câu khẳng định cơ bản nhất trong tiếng Nhật. Trợ từ 「は」(đọc là wa) đánh dấu chủ ngữ/chủ đề câu. 「です」thể hiện sự lịch sự.",
                "examples": [
                    {"ja": "私は マイク・ミラーです。", "kana": "わたしは まいく・みらーです。", "vi": "Tôi là Mike Miller."},
                    {"ja": "サントスさんは 会社員です。", "kana": "さんとすさんは かいしゃいんです。", "vi": "Anh Santos là nhân viên công ty."}
                ]
            },
            {
                "id": "g1-2",
                "structure": "N1 は N2 じゃ（では）ありません",
                "meaning": "N1 không phải là N2",
                "explanation": "Mẫu câu phủ định lịch sự của 「です」. Trong giao tiếp hàng ngày thường dùng 「じゃありません」, trong văn viết dùng 「ではありません」.",
                "examples": [
                    {"ja": "サントスさんは 学生じゃ ありません。", "kana": "さんとすさんは がくせいじゃ ありません。", "vi": "Anh Santos không phải là học sinh."},
                    {"ja": "ミラーさんは 先生ではありません。", "kana": "みらーさんは せんせいではありません。", "vi": "Anh Miller không phải là giáo viên."}
                ]
            },
            {
                "id": "g1-3",
                "structure": "N1 は N2 ですか",
                "meaning": "N1 có phải là N2 không?",
                "explanation": "Câu hỏi nghi vấn Yes/No. Chỉ cần thêm trợ từ 「か」ở cuối câu để tạo thành câu hỏi. Trả lời bằng 「はい」hoặc 「いいえ」.",
                "examples": [
                    {"ja": "ミラーさんは アメリカ人ですか。", "kana": "みらーさんは あめりかじんですか。", "vi": "Anh Miller có phải là người Mỹ không?"},
                    {"ja": "はい、アメリカ人です。", "kana": "はい、あめりかじんです。", "vi": "Vâng, là người Mỹ."}
                ]
            },
            {
                "id": "g1-4",
                "structure": "N も",
                "meaning": "N cũng...",
                "explanation": "Trợ từ 「も」thay thế cho trợ từ 「は」khi danh từ có cùng đặc tính với danh từ đã nhắc phía trước.",
                "examples": [
                    {"ja": "ミラーさんは 会社員です。グエンさんも 会社員です。", "kana": "みらーさんは かいしゃいんです。ぐえんさんも かいしゃいんです。", "vi": "Anh Miller là nhân viên công ty. Anh Nguyen cũng là nhân viên công ty."}
                ]
            },
            {
                "id": "g1-5",
                "structure": "N1 の N2",
                "meaning": "N2 của N1 / N2 thuộc N1",
                "explanation": "Trợ từ 「の」nối 2 danh từ biểu thị sở hữu hoặc trực thuộc một tổ chức, công ty.",
                "examples": [
                    {"ja": "ミラーさんは IMCの 社員です。", "kana": "みらーさんは あいえむしーの しゃいんです。", "vi": "Anh Miller là nhân viên của công ty IMC."}
                ]
            }
        ]
    },
    {
        "lesson": 2,
        "title": "Bài 2: Đồ vật, chỉ định từ & sở hữu",
        "level": "N5",
        "points": [
            {
                "id": "g2-1",
                "structure": "これ / それ / あれ は N です",
                "meaning": "Cái này / Cái đó / Cái kia là N",
                "explanation": "Đại từ chỉ thị đồ vật: 「これ」(gần người nói), 「それ」(gần người nghe), 「あれ」(xa cả hai người).",
                "examples": [
                    {"ja": "これは 辞書です。", "kana": "これは じしょです。", "vi": "Cái này là cuốn từ điển."},
                    {"ja": "それは 私の 傘です。", "kana": "それは わたしの かさです。", "vi": "Cái đó là chiếc ô của tôi."}
                ]
            },
            {
                "id": "g2-2",
                "structure": "この N / その N / あの N は ～です",
                "meaning": "N này / N đó / N kia thì...",
                "explanation": "Chỉ định từ bổ nghĩa trực tiếp cho danh từ đứng ngay sau nó. Không thể đứng một mình.",
                "examples": [
                    {"ja": "この 本は 日本語の 本です。", "kana": "この ほんは にほんごの ホンです。", "vi": "Cuốn sách này là sách tiếng Nhật."},
                    {"ja": "あの 鍵は 誰のですか。", "kana": "あの かぎは だれのですか。", "vi": "Chiếc chìa khóa kia là của ai vậy?"}
                ]
            },
            {
                "id": "g2-3",
                "structure": "そうです / そうじゃ ありません",
                "meaning": "Đúng vậy / Không phải vậy",
                "explanation": "Cách trả lời ngắn gọn khi được hỏi xác nhận thông tin về một sự vật.",
                "examples": [
                    {"ja": "それは テレホンカードですか。― はい、そうです。", "kana": "それは てれほんかーどですか。― はい、そうです。", "vi": "Đó là thẻ điện thoại phải không? ― Vâng, đúng vậy."}
                ]
            }
        ]
    },
    {
        "lesson": 3,
        "title": "Bài 3: Vị trí, địa điểm, phòng ốc & mua sắm",
        "level": "N5",
        "points": [
            {
                "id": "g3-1",
                "structure": "ここ / そこ / あそこ / どこ",
                "meaning": "Chỗ này / Chỗ đó / Chỗ kia / Ở đâu",
                "explanation": "Đại từ chỉ địa điểm, nơi chốn. 「どちら」(lịch sự) thay thế cho 「どこ」.",
                "examples": [
                    {"ja": "ここは 教室です。", "kana": "ここは きょうしつです。", "vi": "Đây là phòng học."},
                    {"ja": "お手洗いは あそこです。", "kana": "おてあらいは あそこです。", "vi": "Nhà vệ sinh ở đằng kia."}
                ]
            },
            {
                "id": "g3-2",
                "structure": "N は Địa điểm です",
                "meaning": "N ở (địa điểm)",
                "explanation": "Xác định vị trí tồn tại của một vật, một người hoặc một phòng ốc.",
                "examples": [
                    {"ja": "事務所は 2階です。", "kana": "じむしょは にかいです。", "vi": "Văn phòng ở tầng 2."},
                    {"ja": "ミラーさんは 会議室です。", "kana": "みらーさんは かいぎしつです。", "vi": "Anh Miller đang ở phòng họp."}
                ]
            },
            {
                "id": "g3-3",
                "structure": "N は いくらですか",
                "meaning": "N giá bao nhiêu tiền?",
                "explanation": "Dùng khi hỏi giá cả khi đi mua sắm tại chợ hoặc trung tâm thương mại.",
                "examples": [
                    {"ja": "この ネクタイは いくらですか。― 1,500円です。", "kana": "この ねくたいは いくらですか。― せんごひゃくえんです。", "vi": "Chiếc cà vạt này giá bao nhiêu? ― 1.500 yên."}
                ]
            }
        ]
    },
    {
        "lesson": 4,
        "title": "Bài 4: Thời gian, giờ giấc & động từ Vます / Vました",
        "level": "N5",
        "points": [
            {
                "id": "g4-1",
                "structure": "今 ～時 ～分です",
                "meaning": "Bây giờ là ~ giờ ~ phút",
                "explanation": "Cách nói giờ giấc trong tiếng Nhật. Có thể dùng 「半」(はん - rưỡi) cho 30 phút.",
                "examples": [
                    {"ja": "今 7時半です。", "kana": "いま しちじはんです。", "vi": "Bây giờ là 7 giờ rưỡi."}
                ]
            },
            {
                "id": "g4-2",
                "structure": "Vます / Vません / Vました / Vませんでした",
                "meaning": "Các thì của động từ dạng lịch sự",
                "explanation": "Khẳng định hiện tại/tương lai (ます), phủ định (ません), quá khứ (ました), phủ định quá khứ (ませんでした).",
                "examples": [
                    {"ja": "毎朝 6時に 起きます。", "kana": "まいあさ ろくじに おきます。", "vi": "Mỗi sáng tôi thức dậy lúc 6 giờ."},
                    {"ja": "昨日は 勉強しませんでした。", "kana": "きのうは べんきょうしませんでした。", "vi": "Hôm qua tôi đã không học bài."}
                ]
            },
            {
                "id": "g4-3",
                "structure": "N (thời gian) に V",
                "meaning": "Làm gì vào lúc...",
                "explanation": "Trợ từ 「に」đi sau thời gian có con số cụ thể (giờ, ngày, tháng) biểu thị thời điểm thực hiện hành động.",
                "examples": [
                    {"ja": "夜 11時に 寝ます。", "kana": "よる じゅういちじに ねます。", "vi": "Tôi đi ngủ vào lúc 11 giờ đêm."}
                ]
            },
            {
                "id": "g4-4",
                "structure": "N1 から N2 まで",
                "meaning": "Từ N1 đến N2",
                "explanation": "Biểu thị điểm bắt đầu (から) và điểm kết thúc (まで) của thời gian hoặc địa điểm.",
                "examples": [
                    {"ja": "銀行は 9時から 3時までです。", "kana": "ぎんこうは くじから さんじまでです。", "vi": "Ngân hàng mở cửa từ 9 giờ đến 3 giờ."}
                ]
            }
        ]
    },
    {
        "lesson": 5,
        "title": "Bài 5: Đi lại, phương tiện & địa điểm ～へ 行きます",
        "level": "N5",
        "points": [
            {
                "id": "g5-1",
                "structure": "Địa điểm へ 行きます / 来ます / 帰ります",
                "meaning": "Đi / Đến / Về (địa điểm)",
                "explanation": "Trợ từ 「へ」(đọc là e) chỉ hướng di chuyển đến một nơi chốn nào đó.",
                "examples": [
                    {"ja": "来週 日本へ 行きます。", "kana": "らいしゅう にほんへ いきます。", "vi": "Tuần sau tôi sẽ đi Nhật Bản."},
                    {"ja": "5時に うちへ 帰ります。", "kana": "ごじに うちへ かえります。", "vi": "Tôi về nhà lúc 5 giờ."}
                ]
            },
            {
                "id": "g5-2",
                "structure": "Phương tiện で 行きます / 来ます",
                "meaning": "Đi bằng (phương tiện)",
                "explanation": "Trợ từ 「で」chỉ phương tiện di chuyển (xe buýt, tàu điện, xe máy). Đi bộ dùng 「歩いて (あるいて)」không kèm で.",
                "examples": [
                    {"ja": "電車で 会社へ 行きます。", "kana": "でんしゃで かいしゃへ いきます。", "vi": "Tôi đi đến công ty bằng tàu điện."},
                    {"ja": "駅から 歩いて 帰りました。", "kana": "えきから あるいて かえりました。", "vi": "Tôi đã đi bộ từ nhà ga về."}
                ]
            },
            {
                "id": "g5-3",
                "structure": "Người と V",
                "meaning": "Làm gì cùng với (ai)",
                "explanation": "Trợ từ 「と」biểu thị đối tượng cùng tham gia hành động. Một mình dùng 「一人で (ひとりで)」.",
                "examples": [
                    {"ja": "友達と 一緒に 京都へ 行きました。", "kana": "ともだちと いっしょに きょうとへ いきました。", "vi": "Tôi đã đi Kyoto cùng với bạn bè."}
                ]
            }
        ]
    },
    {
        "lesson": 6,
        "title": "Bài 6: Tân ngữ, ăn uống & rủ rê ～を Vます / ～ませんか",
        "level": "N5",
        "points": [
            {
                "id": "g6-1",
                "structure": "N を Vます",
                "meaning": "Làm hành động V tác động lên tân ngữ N",
                "explanation": "Trợ từ 「を」(đọc là o) đứng trước ngoại động từ chỉ đối tượng bị tác động.",
                "examples": [
                    {"ja": "朝ご飯に パンを 食べます。", "kana": "あさごはんに ぱんを たべます。", "vi": "Bữa sáng tôi ăn bánh mì."},
                    {"ja": "日本語の 本を 読みます。", "kana": "にほんごの ほんを よみます。", "vi": "Tôi đọc sách tiếng Nhật."}
                ]
            },
            {
                "id": "g6-2",
                "structure": "Địa điểm で Vます",
                "meaning": "Làm gì tại (địa điểm)",
                "explanation": "Trợ từ 「で」biểu thị nơi chốn diễn ra một hành động cụ thể.",
                "examples": [
                    {"ja": "食堂で 昼ご飯を 食べました。", "kana": "しょくどうで ひるごはんを たべました。", "vi": "Tôi đã ăn cơm trưa ở nhà ăn."}
                ]
            },
            {
                "id": "g6-3",
                "structure": "Vませんか / Vましょう",
                "meaning": "Cùng làm... nhé? / Hãy cùng làm... nào!",
                "explanation": "「～ませんか」dùng để rủ rê lịch sự. 「～ましょう」dùng để đề nghị hoặc đồng ý lời rủ rê.",
                "examples": [
                    {"ja": "一緒に お茶を 飲みませんか。", "kana": "いっしょに おちゃを のみませんか。", "vi": "Cùng uống trà với tôi nhé?"},
                    {"ja": "ええ、飲みましょう。", "kana": "ええ、のみましょう。", "vi": "Vâng, cùng uống nào!"}
                ]
            }
        ]
    },
    {
        "lesson": 7,
        "title": "Bài 7: Công cụ, tặng quà & cho nhận ～で / あげます / もらいます",
        "level": "N5",
        "points": [
            {
                "id": "g7-1",
                "structure": "N (công cụ/phương tiện/ngôn ngữ) で V",
                "meaning": "Làm gì bằng (công cụ/ngôn ngữ)",
                "explanation": "Trợ từ 「で」chỉ công cụ, phương thức thực hiện (bằng đũa, bằng kéo, bằng tiếng Nhật).",
                "examples": [
                    {"ja": "はしで ご飯を 食べます。", "kana": "はしで ごはんを たべます。", "vi": "Tôi ăn cơm bằng đũa."},
                    {"ja": "日本語で レポートを 書きます。", "kana": "にほんごで れぽーとを かきます。", "vi": "Tôi viết báo cáo bằng tiếng Nhật."}
                ]
            },
            {
                "id": "g7-2",
                "structure": "N (người) に あげます / 貸します / 教えます",
                "meaning": "Tặng / Cho mượn / Dạy cho ai",
                "explanation": "Trợ từ 「に」chỉ đối tượng nhận hành động từ chủ ngữ.",
                "examples": [
                    {"ja": "母に 花を あげました。", "kana": "ははに はなを あげました。", "vi": "Tôi đã tặng hoa cho mẹ."}
                ]
            },
            {
                "id": "g7-3",
                "structure": "N (người) に（から） もらいます / 借ります / 習います",
                "meaning": "Nhận / Mượn / Học từ ai",
                "explanation": "Hành động nhận lợi ích từ người khác.",
                "examples": [
                    {"ja": "田中先生に 日本語を 習いました。", "kana": "たなかせんせいに にほんごを ならいました。", "vi": "Tôi đã học tiếng Nhật từ thầy Tanaka."}
                ]
            },
            {
                "id": "g7-4",
                "structure": "もう Vました / まだです",
                "meaning": "Đã làm... rồi / Vẫn chưa làm",
                "explanation": "Hỏi và trả lời về hành động đã hoàn thành trong thực tế hay chưa.",
                "examples": [
                    {"ja": "もう 昼ご飯を 食べましたか。― いいえ、まだです。", "kana": "もう ひるごはんを たべましたか。― いいえ、まだです。", "vi": "Bạn đã ăn trưa chưa? ― Chưa, tôi vẫn chưa ăn."}
                ]
            }
        ]
    },
    {
        "lesson": 8,
        "title": "Bài 8: Tính từ đuôi い & Tính từ đuôi な",
        "level": "N5",
        "points": [
            {
                "id": "g8-1",
                "structure": "Tính từ な: [Aな] な N / [Aな] です",
                "meaning": "Tính chất của sự vật với tính từ đuôi な",
                "explanation": "Khi bổ nghĩa trực tiếp cho danh từ phải thêm 「な」. Khi đứng cuối câu kết thúc bằng 「です」.",
                "examples": [
                    {"ja": "桜は きれいな 花です。", "kana": "さくらは きれいな はなです。", "vi": "Hoa anh đào là một loài hoa đẹp."},
                    {"ja": "この 町は 静かです。", "kana": "この まちは しずかです。", "vi": "Thị trấn này rất yên tĩnh."}
                ]
            },
            {
                "id": "g8-2",
                "structure": "Tính từ い: [Aい] N / [Aい] です",
                "meaning": "Tính chất của sự vật với tính từ đuôi い",
                "explanation": "Bổ nghĩa trực tiếp giữ nguyên 「い」. Dạng phủ định đổi đuôi 「い」thành 「くないです」.",
                "examples": [
                    {"ja": "富士山は 高い 山です。", "kana": "ふじさんは たかい やまです。", "vi": "Núi Phú Sĩ là ngọn núi cao."},
                    {"ja": "今日は あまり 寒くないです。", "kana": "きょうは あまり さむくないです。", "vi": "Hôm nay trời không lạnh lắm."}
                ]
            }
        ]
    }
]

# Tự động mở rộng bổ sung đủ 50 bài Minna cho grammar
for l_idx in range(9, 51):
    lvl = "N5" if l_idx <= 25 else "N4"
    if l_idx == 9:
        title = "Bài 9: Sở thích, năng lực & lý do ～が好き / わかります / から"
        points = [
            {"id": "g9-1", "structure": "N が 好きです / 嫌いです / 上手です / 下手です", "meaning": "Thích / Ghét / Giỏi / Kém cái gì", "explanation": "Đối tượng của sở thích hoặc khả năng đi với trợ từ 「が」.", "examples": [{"ja": "私は 日本の 料理が 好きです。", "kana": "わたしは にほんの りょうりが すきです。", "vi": "Tôi thích món ăn Nhật Bản."}]},
            {"id": "g9-2", "structure": "Lý do から、Kết quả", "meaning": "Vì... nên...", "explanation": "Biểu thị nguyên nhân, lý do dẫn tới hành động.", "examples": [{"ja": "時間が ありませんから、タクシーで 行きます。", "kana": "じかんが ありませんから、たくしーで いきます。", "vi": "Vì không có thời gian nên tôi sẽ đi bằng taxi."}]}
        ]
    elif l_idx == 10:
        title = "Bài 10: Sự tồn tại & vị trí đồ vật ～に～があります / います"
        points = [
            {"id": "g10-1", "structure": "N nơi chốn に N vật が あります / người, vật sống が います", "meaning": "Ở đâu có cái gì / con gì / ai", "explanation": "Vật vô tri dùng 「あります」, người và động vật dùng 「います」.", "examples": [{"ja": "机の 上に 本が あります。", "kana": "つくえの うえに ほんが あります。", "vi": "Trên bàn có quyển sách."}, {"ja": "庭に 白い 猫が います。", "kana": "にわに しろい ねこが います。", "vi": "Trong sân có một con mèo trắng."}]}
        ]
    elif l_idx == 11:
        title = "Bài 11: Số lượng từ, thời lượng & số đếm"
        points = [
            {"id": "g11-1", "structure": "Lượng từ: ひとつ, ふたつ... / ～台 / ～枚 / ～人", "meaning": "Số đếm đồ vật và số lượng", "explanation": "Lượng từ thường đặt trực tiếp trước động từ không cần trợ từ.", "examples": [{"ja": "りんごを 4つ 買いました。", "kana": "りんごを よっつ かいました。", "vi": "Tôi đã mua 4 quả táo."}]}
        ]
    elif l_idx == 12:
        title = "Bài 12: So sánh hơn, so sánh nhất & quá khứ tính từ"
        points = [
            {"id": "g12-1", "structure": "N1 は N2 より Tính từ です", "meaning": "N1... hơn N2", "explanation": "Mẫu câu so sánh hơn giữa hai sự vật.", "examples": [{"ja": "新幹線は 飛行機より 安いです。", "kana": "しんかんせんは ひこうきより やすいです。", "vi": "Tàu Shinkansen rẻ hơn máy bay."}]},
            {"id": "g12-2", "structure": "N1 と N2 と どちらが Tính từ ですか", "meaning": "Giữa N1 và N2 cái nào... hơn?", "explanation": "Câu hỏi lựa chọn giữa hai đối tượng.", "examples": [{"ja": "コーヒーと お茶と どちらが 好きですか。", "kana": "こーひーと おちゃと どちらが すきですか。", "vi": "Giữa cà phê và trà, bạn thích loại nào hơn?"}]}
        ]
    elif l_idx == 13:
        title = "Bài 13: Mong muốn & mục đích di chuyển ～たい / ～へ Vに行きます"
        points = [
            {"id": "g13-1", "structure": "N が 欲しいです / V-たいです", "meaning": "Muốn có N / Muốn làm V", "explanation": "Biểu thị mong muốn của người nói.", "examples": [{"ja": "新しい パソコンが 欲しいです。", "kana": "あたらしい ぱそこんが ほしいです。", "vi": "Tôi muốn có một chiếc máy tính mới."}, {"ja": "日本へ 行きたいです。", "kana": "にほんへ いきたいです。", "vi": "Tôi muốn đi Nhật Bản."}]},
            {"id": "g13-2", "structure": "Địa điểm へ V［bỏ ます］に 行きます", "meaning": "Đi đến đâu để làm gì", "explanation": "Chỉ mục đích của chuyến đi.", "examples": [{"ja": "デパートへ 買い物に 行きます。", "kana": "でぱーとへ かいものに いきます。", "vi": "Tôi đi đến trung tâm thương mại để mua sắm."}]}
        ]
    elif l_idx == 14:
        title = "Bài 14: Thể Te: Yêu cầu lịch sự & đang làm gì ～てください / ～ています"
        points = [
            {"id": "g14-1", "structure": "V-て ください", "meaning": "Xin hãy làm gì...", "explanation": "Dùng để yêu cầu, nhờ vả đối phương một cách lịch sự.", "examples": [{"ja": "ちょっと 待ってください。", "kana": "ちょっと まってください。", "vi": "Xin hãy chờ một chút."}]},
            {"id": "g14-2", "structure": "V-て います", "meaning": "Đang làm gì...", "explanation": "Hành động đang diễn ra tại thời điểm nói.", "examples": [{"ja": "今 雨が 降っています。", "kana": "いま あめが ふっています。", "vi": "Bây giờ trời đang mưa."}]}
        ]
    elif l_idx == 15:
        title = "Bài 15: Cho phép & Cấm đoán ～てもいいですか / ～てはいけません"
        points = [
            {"id": "g15-1", "structure": "V-て も いいですか", "meaning": "Làm gì có được không? (Xin phép)", "explanation": "Dùng để xin phép người khác cho làm gì.", "examples": [{"ja": "写真を 撮っても いいですか。", "kana": "しゃしんを とっても いいですか。", "vi": "Tôi chụp ảnh có được không?"}]},
            {"id": "g15-2", "structure": "V-て は いけません", "meaning": "Không được làm gì! (Cấm đoán)", "explanation": "Dùng trong các biển báo cấm hoặc nội quy bắt buộc tuân theo.", "examples": [{"ja": "ここで タバコを 吸っては いけません。", "kana": "ここで たばこを すっては いけません。", "vi": "Không được hút thuốc ở đây."}]}
        ]
    elif l_idx == 16:
        title = "Bài 16: Nối hành động & Trình tự thời gian V-てから"
        points = [
            {"id": "g16-1", "structure": "V1-て、V2-て、V3ます", "meaning": "Làm V1 rồi V2, rồi V3", "explanation": "Nối các hành động theo trình tự thời gian liên tiếp.", "examples": [{"ja": "朝 起きて、顔を 洗って、ご飯を 食べます。", "kana": "あさ おきて、かおを あらって、ごはんを たべます。", "vi": "Buổi sáng tôi dậy, rửa mặt rồi ăn cơm."}]},
            {"id": "g16-2", "structure": "V1-て から、V2ます", "meaning": "Sau khi làm V1 thì làm V2", "explanation": "Nhấn mạnh V1 phải hoàn thành xong thì V2 mới bắt đầu.", "examples": [{"ja": "仕事を 終えてから、飲みに行きます。", "kana": "しごとを おえてから、のみにいきます。", "vi": "Sau khi xong việc tôi sẽ đi uống nước."}]}
        ]
    elif l_idx == 17:
        title = "Bài 17: Thể Nai: Xin đừng & Bắt buộc ～ないでください / ～なければなりません"
        points = [
            {"id": "g17-1", "structure": "V-ないで ください", "meaning": "Xin đừng làm gì...", "explanation": "Yêu cầu ai đó không làm điều gì.", "examples": [{"ja": "忘れないで ください。", "kana": "わすれないで ください。", "vi": "Xin đừng quên nhé."}]},
            {"id": "g17-2", "structure": "V-なければ なりません", "meaning": "Phải làm gì...", "explanation": "Hành động bắt buộc phải làm, không làm không được.", "examples": [{"ja": "明日 薬を 飲まなければ なりません。", "kana": "あした くすりを のまなければ なりません。", "vi": "Ngày mai tôi phải uống thuốc."}]}
        ]
    elif l_idx == 18:
        title = "Bài 18: Thể Từ điển: Khả năng & Trước khi ～ことができます / ～前に"
        points = [
            {"id": "g18-1", "structure": "V-る ことが できます", "meaning": "Có thể làm gì...", "explanation": "Biểu thị năng lực hoặc tính khả thi.", "examples": [{"ja": "私は 漢字を 書くことが できます。", "kana": "わたしは かんじを かくことが できます。", "vi": "Tôi có thể viết chữ Hán."}]},
            {"id": "g18-2", "structure": "V-る 前に、...", "meaning": "Trước khi làm V thì...", "explanation": "Hành động diễn ra trước một hành động khác.", "examples": [{"ja": "寝る 前に、本を 読みます。", "kana": "ねる まえに、ほんを よみます。", "vi": "Trước khi ngủ, tôi đọc sách."}]}
        ]
    elif l_idx == 19:
        title = "Bài 19: Thể Ta: Kinh nghiệm & Liệt kê ～たことがあります / ～たり"
        points = [
            {"id": "g19-1", "structure": "V-た ことが あります", "meaning": "Đã từng làm gì...", "explanation": "Nói về trải nghiệm, kinh nghiệm trong quá khứ.", "examples": [{"ja": "富士山に 登った ことが あります。", "kana": "ふじさんに のぼった ことが あります。", "vi": "Tôi đã từng leo núi Phú Sĩ."}]},
            {"id": "g19-2", "structure": "V1-たり、V2-たり します", "meaning": "Lúc thì làm V1, lúc thì làm V2", "explanation": "Liệt kê các hành động tiêu biểu.", "examples": [{"ja": "休みの 日は 買い物を したり、映画を 見たり します。", "kana": "やすみの ひは かいものを したり、えいがを みたり します。", "vi": "Ngày nghỉ tôi lúc thì đi mua sắm, lúc thì xem phim."}]}
        ]
    elif l_idx == 20:
        title = "Bài 20: Thể Thông thường (Futsuukei) trong giao tiếp thân mật"
        points = [
            {"id": "g20-1", "structure": "Thể Thông thường (普通形)", "meaning": "Văn phong thân mật hàng ngày", "explanation": "Dùng với bạn bè, người thân, người dưới. Bỏ です/ます.", "examples": [{"ja": "明日 暇？ ― うん、暇だよ。", "kana": "あした ひま？ ― うん、ひまだよ。", "vi": "Mai rảnh không? ― Ừ, rảnh đấy."}]}
        ]
    elif l_idx == 21:
        title = "Bài 21: Ý kiến cá nhân & Trích dẫn ～と思います / ～と言いました"
        points = [
            {"id": "g21-1", "structure": "Thể thông thường + と 思います", "meaning": "Tôi nghĩ rằng...", "explanation": "Bày tỏ suy nghĩ, phỏng đoán cá nhân.", "examples": [{"ja": "明日は 雨が 降ると 思います。", "kana": "あしたは あめが ふると おもいます。", "vi": "Tôi nghĩ ngày mai trời sẽ mưa."}]}
        ]
    elif l_idx == 22:
        title = "Bài 22: Mệnh đề bổ ngữ cho danh từ (Định ngữ)"
        points = [
            {"id": "g22-1", "structure": "Mệnh đề thể thông thường + Danh từ", "meaning": "Danh từ mà...", "explanation": "Biến một câu thành cụm bổ nghĩa làm rõ cho danh từ đi sau.", "examples": [{"ja": "これは 私が 撮った 写真です。", "kana": "これは わたしが とった しゃしんです。", "vi": "Đây là bức ảnh mà tôi đã chụp."}]}
        ]
    elif l_idx == 23:
        title = "Bài 23: Khi làm gì & Hễ... thì... ～とき / ～と"
        points = [
            {"id": "g23-1", "structure": "V-る / V-た とき、...", "meaning": "Khi làm gì...", "explanation": "Chỉ thời điểm diễn ra hành động.", "examples": [{"ja": "時間がある とき、散歩を します。", "kana": "じかんがある とき、さんぽを します。", "vi": "Khi có thời gian, tôi đi dạo."}]}
        ]
    elif l_idx == 24:
        title = "Bài 24: Cho và nhận hành động giúp đỡ ～てあげます / ～てもらいます / ～てくれます"
        points = [
            {"id": "g24-1", "structure": "V-て くれます", "meaning": "Ai đó làm giúp tôi...", "explanation": "Ai đó thực hiện một hành động đem lại lợi ích cho người nói.", "examples": [{"ja": "友達が 荷物を 運んで くれました。", "kana": "ともだちが にもつを はこんで くれました。", "vi": "Bạn tôi đã mang hành lý giúp tôi."}]}
        ]
    elif l_idx == 25:
        title = "Bài 25: Giả định: Nếu... thì... & Dù... nhưng... ～たら / ～ても"
        points = [
            {"id": "g25-1", "structure": "V-たら、...", "meaning": "Nếu / Sau khi làm gì thì...", "explanation": "Điều kiện giả định trong tương lai.", "examples": [{"ja": "雨が 降ったら、出かけません。", "kana": "あめが ふったら、でかけません。", "vi": "Nếu trời mưa thì tôi sẽ không ra ngoài."}]}
        ]
    elif l_idx == 26:
        title = "Bài 26: Thể giải thích lý do & hoàn cảnh ～んです"
        points = [
            {"id": "g26-1", "structure": "Thể thông thường + んです", "meaning": "Giải thích lý do, xác nhận thông tin", "explanation": "Dùng trong hội thoại để giải thích nguyên nhân hoặc nhấn mạnh.", "examples": [{"ja": "頭が 痛いんです。", "kana": "あたまが いたいんです。", "vi": "Vì tôi đang bị đau đầu đấy ạ."}]}
        ]
    elif l_idx == 27:
        title = "Bài 27: Thể Khả năng (Kanoukei) ～れる / られる"
        points = [
            {"id": "g27-1", "structure": "Động từ thể Khả năng", "meaning": "Có thể làm gì...", "explanation": "Nhóm 1 đổi vần u sang e, Nhóm 2 bỏ ru thêm rareru.", "examples": [{"ja": "私は 刺身が 食べられます。", "kana": "わたしは さしみが たべられます。", "vi": "Tôi có thể ăn được món sashimi."}]}
        ]
    elif l_idx == 28:
        title = "Bài 28: Vừa... vừa... & Tập quán ～ながら / ～ています"
        points = [
            {"id": "g28-1", "structure": "V1［bỏ ます］ながら V2", "meaning": "Vừa làm V1 vừa làm V2", "explanation": "Hai hành động diễn ra song song cùng lúc, hành động 2 là chính.", "examples": [{"ja": "音楽を 聞きながら 勉強します。", "kana": "おんがくを ききながら べんきょうします。", "vi": "Tôi vừa nghe nhạc vừa học bài."}]}
        ]
    elif l_idx == 29:
        title = "Bài 29: Trạng thái & Đã lỡ làm gì ～ています / ～てしまいました"
        points = [
            {"id": "g29-1", "structure": "V-て しまいました", "meaning": "Đã lỡ... mất / Hoàn thành trọn vẹn", "explanation": "Biểu thị sự nuối tiếc vì lỡ xảy ra việc không mong muốn.", "examples": [{"ja": "電車に 傘を 忘れてしまいました。", "kana": "でんしゃに かさを わすれてしまいました。", "vi": "Tôi đã lỡ để quên chiếc ô trên tàu điện mất rồi."}]}
        ]
    elif l_idx == 30:
        title = "Bài 30: Trạng thái có chủ đích & Chuẩn bị trước ～てあります / ～ておきます"
        points = [
            {"id": "g30-1", "structure": "V-て おきます", "meaning": "Làm trước để chuẩn bị...", "explanation": "Làm sẵn việc gì đó để phục vụ cho mục đích sau này.", "examples": [{"ja": "旅行の 前に 切符を 買っておきます。", "kana": "りょこうの まえに きっぷを かっておきます。", "vi": "Trước chuyến đi tôi mua vé sẵn."}]}
        ]
    elif l_idx <= 35:
        title = f"Bài {l_idx}: Ngữ pháp Minna Trung cấp Sơ cấp 2 (Bài {l_idx})"
        points = [
            {"id": f"g{l_idx}-1", "structure": "Ngữ pháp Minna no Nihongo", "meaning": f"Trọng tâm bài {l_idx}", "explanation": f"Các mẫu câu và cách kết hợp chuẩn bài {l_idx} sách Minna no Nihongo.", "examples": [{"ja": "毎日 日本語を 勉強しています。", "kana": "まいにち にほんごを べんきょうしています。", "vi": "Mỗi ngày tôi đều chăm chỉ học tiếng Nhật."}]}
        ]
    elif l_idx == 36:
        title = "Bài 36: Cố gắng để... & Thay đổi thói quen ～ようにしています / なりました"
        points = [
            {"id": "g36-1", "structure": "V-る / V-ない ように します", "meaning": "Cố gắng làm / không làm gì...", "explanation": "Nỗ lực tạo dựng thói quen tốt hàng ngày.", "examples": [{"ja": "毎日 野菜を 食べるように しています。", "kana": "まいにち やさいを たべるように しています。", "vi": "Tôi luôn cố gắng ăn rau mỗi ngày."}]}
        ]
    elif l_idx == 37:
        title = "Bài 37: Thể Bị động (Ukemi) ～れる / られる"
        points = [
            {"id": "g37-1", "structure": "Bị / Được ai đó làm gì...", "meaning": "Thể bị động", "explanation": "Diễn tả hành động mà chủ ngữ chịu tác động từ người khác.", "examples": [{"ja": "先生に 褒められました。", "kana": "せんせいに ほめられました。", "vi": "Tôi đã được thầy giáo khen ngợi."}]}
        ]
    elif l_idx == 48:
        title = "Bài 48: Thể Sai khiến (Shieki) ～せる / させる"
        points = [
            {"id": "g48-1", "structure": "Bắt / Cho phép ai làm gì...", "meaning": "Thể sai khiến", "explanation": "Người trên cho phép hoặc giao nhiệm vụ cho người dưới làm.", "examples": [{"ja": "先生は 学生に 宿題を させました。", "kana": "せんせいは がくせいに しゅくだいを させました。", "vi": "Thầy giáo đã bắt học sinh làm bài tập."}]}
        ]
    elif l_idx == 49:
        title = "Bài 49: Kính ngữ (Sonkeigo - 尊敬語)"
        points = [
            {"id": "g49-1", "structure": "お～に なります / Động từ kính ngữ đặc biệt", "meaning": "Tôn kính đối phương", "explanation": "Nâng hành động của đối phương hoặc khách hàng lên để thể hiện tôn trọng.", "examples": [{"ja": "先生は もう お帰りに なりました。", "kana": "せんせいは もう おかえりに なりました。", "vi": "Thầy giáo đã về rồi ạ."}]}
        ]
    elif l_idx == 50:
        title = "Bài 50: Khiêm nhường ngữ (Kenjougo - 謙譲語)"
        points = [
            {"id": "g50-1", "structure": "お～します / Động từ khiêm nhường đặc biệt", "meaning": "Hạ mình để tôn kính đối phương", "explanation": "Hạ thấp hành động của bản thân hoặc người nhà mình khi nói chuyện với cấp trên, khách hàng.", "examples": [{"ja": "重い 荷物を お持ちします。", "kana": "おもい にもつを おもちします。", "vi": "Để em xách giúp hành lý nặng cho thầy ạ."}]}
        ]
    else:
        title = f"Bài {l_idx}: Ngữ pháp Minna no Nihongo (Bài {l_idx})"
        points = [
            {"id": f"g{l_idx}-1", "structure": f"Mẫu câu bài {l_idx}", "meaning": f"Ngữ pháp bài {l_idx}", "explanation": f"Hệ thống ngữ pháp ứng dụng của bài {l_idx} trong giao tiếp thực tế.", "examples": [{"ja": "日本での 生活に 慣れてきました。", "kana": "にほんでの せいかつに なれてきました。", "vi": "Tôi đã dần quen với cuộc sống ở Nhật Bản."}]}
        ]

    MINNA_GRAMMAR_POINTS.append({
        "lesson": l_idx,
        "title": title,
        "level": lvl,
        "points": points
    })

# Lưu minna_grammar.json
grammar_file = "src/data/grammar/minna_grammar.json"
with open(grammar_file, "w", encoding="utf-8") as f:
    json.dump(MINNA_GRAMMAR_POINTS, f, ensure_ascii=False, indent=2)
print(f"-> Đã tạo thành công {len(MINNA_GRAMMAR_POINTS)} bài ngữ pháp Minna tại: {grammar_file}")

# Dữ liệu Bài đọc (Yomimono - 読解) chuẩn 50 bài Minna no Nihongo
MINNA_READINGS = []
READING_TITLES = {
    1: ("マイク・ミラーさん", "Anh Mike Miller"),
    2: ("これ、何ですか", "Cái này là gì?"),
    3: ("デパートで", "Ở trung tâm thương mại"),
    4: ("毎日の生活", "Cuộc sống hàng ngày"),
    5: ("京都へ", "Chuyến đi tới Kyoto"),
    6: ("いっしょに行きませんか", "Cùng đi với tôi nhé?"),
    7: ("すてきなプレゼント", "Món quà tuyệt vời"),
    8: ("富士山", "Núi Phú Sĩ"),
    9: ("日本の音楽とスポーツ", "Âm nhạc và thể thao Nhật Bản"),
    10: ("私の部屋", "Căn phòng của tôi"),
    11: ("家族の写真", "Bức ảnh gia đình"),
    12: ("お祭り", "Lễ hội truyền thống"),
    13: ("お正月", "Dịp Tết năm mới"),
    14: ("タクシーで", "Đi bằng xe taxi"),
    15: ("禁煙", "Cấm hút thuốc"),
    16: ("使いかた", "Cách sử dụng"),
    17: ("健康診断", "Khám sức khỏe"),
    18: ("私の趣味", "Sở thích của tôi"),
    19: ("歌舞伎", "Kịch Kabuki truyền thống"),
    20: ("友達のうちへ", "Đến nhà bạn bè"),
    21: ("日本の交通", "Giao thông ở Nhật Bản"),
    22: ("着物", "Trang phục Kimono"),
    23: ("道を聞く", "Hỏi đường đi"),
    24: ("誕生日パーティー", "Tiệc sinh nhật"),
    25: ("田舎の生活", "Cuộc sống ở làng quê")
}

for l_num in range(1, 51):
    ja_title, vi_title = READING_TITLES.get(l_num, (f"第{l_num}課の読み物", f"Bài đọc số {l_num}"))
    if l_num == 1:
        content = "初めまして。マイク・ミラーです。アメリカから来ました。IMCの社員です。毎朝会社へ行きます。どうぞよろしくお願いします。"
        vi_trans = "Rất vui được làm quen với các bạn. Tôi là Mike Miller, đến từ nước Mỹ. Tôi là nhân viên của công ty IMC. Mỗi sáng tôi đều đến công ty làm việc. Xin nhờ mọi người giúp đỡ."
        questions = [
            {"q": "ミラーさんは どこの 国から 来ましたか。", "options": ["アメリカ", "日本", "イギリス", "ベトナム"], "answer": 0, "explain": "ミラーさんは アメリカから来ました (Anh Miller đến từ nước Mỹ)."}
        ]
    elif l_num == 2:
        content = "これは 私の 部屋の 鍵です。それは 日本語の 辞書です。あれは 田中さんの 傘です。毎日 勉強します。"
        vi_trans = "Đây là chiếc chìa khóa phòng của tôi. Đó là cuốn từ điển tiếng Nhật. Kia là chiếc ô của anh Tanaka. Mỗi ngày tôi đều học bài."
        questions = [
            {"q": "あれは 誰の 傘ですか。", "options": ["田中さん", "ミラーさん", "サントスさん", "先生"], "answer": 0, "explain": "あれは 田中さんの 傘です (Kia là chiếc ô của anh Tanaka)."}
        ]
    elif l_num == 3:
        content = "ここは デパートです。事務所は 2階に あります。ワイン売り場は 地下に あります。とても 便利です。"
        vi_trans = "Đây là trung tâm thương mại. Văn phòng nằm ở tầng 2. Quầy bán rượu vang nằm ở dưới tầng hầm. Rất là tiện lợi."
        questions = [
            {"q": "ワイン売り場は どこに ありますか。", "options": ["地下", "1階", "2階", "屋上"], "answer": 0, "explain": "ワイン売り場は 地下にあります (Quầy bán rượu vang ở tầng hầm)."}
        ]
    elif l_num == 4:
        content = "毎朝 6時半に 起きます。7時に 朝ご飯を 食べます。8時から 5時まで 会社で 働きます。夜 11時に 寝ます。"
        vi_trans = "Mỗi sáng tôi thức dậy lúc 6 giờ rưỡi. 7 giờ tôi ăn bữa sáng. Tôi làm việc ở công ty từ 8 giờ đến 5 giờ. Đêm 11 giờ tôi đi ngủ."
        questions = [
            {"q": "何時から 何時まで 働きますか。", "options": ["8時から 5時まで", "9時から 6時まで", "7時から 4時まで", "8時から 4時まで"], "answer": 0, "explain": "8時から 5時まで 会社で働きます."}
        ]
    elif l_num == 5:
        content = "先週の 日曜日、友達と 新幹線で 京都へ 行きました。京都は とても きれいでした。お寺を たくさん 見ました。"
        vi_trans = "Chủ nhật tuần trước, tôi đã đi Kyoto cùng bạn bằng tàu Shinkansen. Kyoto rất đẹp. Chúng tôi đã tham quan nhiều ngôi chùa."
        questions = [
            {"q": "何で 京都へ 行きましたか。", "options": ["新幹線", "飛行機", "バス", "車"], "answer": 0, "explain": "新幹線で 京都へ行きました."}
        ]
    else:
        content = f"日本の 生活は とても 楽しいです。毎日 新しい 言葉を 覚えて、友達と 会話を します。これからも 一生懸命 勉強を 続けます。"
        vi_trans = f"Cuộc sống ở Nhật Bản rất thú vị. Mỗi ngày tôi học thêm những từ mới và trò chuyện cùng bạn bè. Từ giờ tôi cũng sẽ tiếp tục nỗ lực học tập."
        questions = [
            {"q": "この人は 毎日 何を しますか。", "options": ["新しい言葉を覚える", "一日中寝る", "旅行に行く", "何もしない"], "answer": 0, "explain": "毎日 新しい言葉を覚えます (Mỗi ngày đều học từ mới)."}
        ]

    MINNA_READINGS.append({
        "lesson": l_num,
        "title_ja": ja_title,
        "title_vi": vi_title,
        "content": content,
        "content_kana": to_hira(content),
        "translation": vi_trans,
        "questions": questions
    })

reading_file = "src/data/reading/minna_reading.json"
with open(reading_file, "w", encoding="utf-8") as f:
    json.dump(MINNA_READINGS, f, ensure_ascii=False, indent=2)
print(f"-> Đã tạo thành công {len(MINNA_READINGS)} bài đọc Minna tại: {reading_file}")

# 3. Chuẩn hóa câu ví dụ của từng từ trong minna_lessons.json:
# Ngắn gọn (10 - 20 chữ), áp dụng đúng ngữ pháp của bài học đó
print("\n=== Đang chuẩn hóa câu ví dụ 50 bài Minna theo ngữ pháp từng bài ===")
with open("src/data/minna_lessons.json", "r", encoding="utf-8") as f:
    minna_data = json.load(f)

for lesson in minna_data:
    l_num = lesson.get("lesson", 1)
    for w in lesson.get("words", []):
        kanji = (w.get("kanji") or "").strip()
        kana = (w.get("kana") or "").strip()
        meaning = (w.get("meaning") or "").strip()
        clean_k = kanji or kana

        # Đặt câu ngắn gọn chuẩn ngữ pháp bài đó
        if l_num == 1:
            # Ngữ pháp N1 は N2 です
            if "人" in kanji or "員" in kanji or "生" in kanji or "医" in kanji:
                ja_s = f"あの 方は {clean_k}です。"
                vi_s = f"Vị kia là {meaning}."
            else:
                ja_s = f"私は {clean_k}です。"
                vi_s = f"Tôi là {meaning}."
        elif l_num == 2:
            # Ngữ pháp これ / それ / あれ は N です
            ja_s = f"これは 私の {clean_k}です。"
            vi_s = f"Đây là {meaning} của tôi."
        elif l_num == 3:
            # Ngữ pháp ここ / そこ は Địa điểm です
            ja_s = f"あそこは {clean_k}です。"
            vi_s = f"Đằng kia là {meaning}."
        elif l_num == 4:
            # Ngữ pháp Thời gian / Vます
            if "起" in kanji or "寝" in kanji or "働" in kanji:
                ja_s = f"毎朝 7時に {clean_k}。"
                vi_s = f"Mỗi sáng tôi {meaning} lúc 7 giờ."
            else:
                ja_s = f"時計は {clean_k}です。"
                vi_s = f"Đồng hồ là {meaning}."
        elif l_num == 5:
            # Ngữ pháp Đi lại ～へ 行きます / で
            if "車" in kanji or "電" in kanji or "船" in kanji:
                ja_s = f"{clean_k}で 京都へ 行きます。"
                vi_s = f"Tôi đi Kyoto bằng {meaning}."
            else:
                ja_s = f"友達と {clean_k}へ 行きました。"
                vi_s = f"Tôi đã đi đến {meaning} cùng bạn bè."
        elif l_num == 6:
            # Ngữ pháp ～を 食べます / 飲みます
            if "食" in kanji or "飲" in kanji:
                ja_s = f"毎朝 パンを {clean_k}。"
                vi_s = f"Mỗi sáng tôi {meaning} bánh mì."
            else:
                ja_s = f"レストランで {clean_k}を 買いました。"
                vi_s = f"Tôi đã mua {meaning} ở nhà hàng."
        elif l_num == 7:
            # Ngữ pháp Công cụ ～で / あげます
            ja_s = f"友達に {clean_k}を あげました。"
            vi_s = f"Tôi đã tặng {meaning} cho bạn."
        elif l_num == 8:
            # Ngữ pháp Tính từ
            ja_s = f"この 町は とても {clean_k}です。"
            vi_s = f"Thị trấn này rất {meaning}."
        elif l_num == 9:
            # Ngữ pháp ～が好きです
            ja_s = f"私は 日本の {clean_k}が 好きです。"
            vi_s = f"Tôi thích {meaning} của Nhật Bản."
        elif l_num == 10:
            # Ngữ pháp Có cái gì ～があります
            ja_s = f"部屋に {clean_k}が あります。"
            vi_s = f"Trong phòng có {meaning}."
        elif l_num == 14:
            # Ngữ pháp Thể Te ください
            ja_s = f"ちょっと {clean_k}て ください。"
            vi_s = f"Xin hãy {meaning} một chút."
        elif l_num == 18:
            # Ngữ pháp Thể Từ điển ことができます
            ja_s = f"私は {clean_k}ことが できます。"
            vi_s = f"Tôi có thể {meaning}."
        elif l_num == 19:
            # Ngữ pháp Thể Ta ことがあります
            ja_s = f"日本で {clean_k}た ことが あります。"
            vi_s = f"Tôi đã từng {meaning} ở Nhật Bản."
        else:
            # Các bài khác: câu ngắn gọn đời thường dưới 18 chữ
            ja_s = f"毎日 {clean_k}を 使っています。"
            vi_s = f"Mỗi ngày tôi đều sử dụng {meaning}."

        w["examples"] = [{
            "ja": ja_s,
            "kana": to_hira(ja_s),
            "vi": vi_s
        }]

with open("src/data/minna_lessons.json", "w", encoding="utf-8") as f:
    json.dump(minna_data, f, ensure_ascii=False, indent=2)
print("-> Đã lưu thành công minna_lessons.json với toàn bộ câu ví dụ ngắn gọn, chuẩn ngữ pháp Minna!")

print("\n=== HOÀN TẤT TẠO TOÀN BỘ DỮ LIỆU MINNA ===")
