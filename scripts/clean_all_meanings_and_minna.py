#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Clean all textbook vocabulary meanings across Minna no Nihongo (1-50) and JLPT (N5-N1).
Replaces machine translation errors (giông tố, nghèo ở, thời gian là kẻ cắp, dậy đi, cẩu, thư quán, học đường...)
with standard Minna no Nihongo Vietnamese textbook terminology.
"""

import json
import os
import re

# Từ điển chuẩn giáo trình Minna no Nihongo tiếng Việt (NXB Trẻ / 3A Corporation)
MINNA_TEXTBOOK_MEANINGS = {
    # Bài 1
    "わたし": "Tôi",
    "わたしたち": "Chúng tôi, chúng ta",
    "あなた": "Bạn, anh, chị (ngôi thứ 2)",
    "あの 人（あの 方）": "Người kia, vị kia",
    "あの人": "Người kia, người đó",
    "あの方": "Vị kia (lịch sự)",
    "みなさん": "Các bạn, mọi người",
    "～さん": "Anh, chị, ông, bà (hậu tố lịch sự)",
    "～ちゃん": "Bé (gọi thân mật trẻ em/bạn gái)",
    "～君（～くん）": "Cậu, bạn (gọi bạn nam/người nhỏ tuổi)",
    "～人（～じん）": "Người (nước nào đó)",
    "先生": "Thầy, cô giáo",
    "教師": "Giáo viên, giảng viên (nghề nghiệp)",
    "学生": "Học sinh, sinh viên",
    "会社員": "Nhân viên công ty",
    "社員": "Nhân viên công ty (dùng kèm tên công ty)",
    "銀行員": "Nhân viên ngân hàng",
    "医者": "Bác sĩ",
    "研究者": "Nhà nghiên cứu",
    "エンジニア": "Kỹ sư",
    "大学": "Trường đại học",
    "病院": "Bệnh viện",
    "電気": "Điện, đèn điện",
    "だれ（どなた）": "Ai, vị nào",
    "だれ": "Ai",
    "どなた": "Vị nào (lịch sự)",
    "－歳": "Tuổi",
    "何歳（おいくつ）": "Mấy tuổi, bao nhiêu tuổi",
    "何歳": "Mấy tuổi",
    "おいくつ": "Bao nhiêu tuổi (lịch sự)",
    "はい": "Vâng, dạ, đúng vậy",
    "いいえ": "Không, không phải",
    "初めまして": "Rất vui được làm quen với bạn",
    "～から 来ました。": "Tôi đến từ...",
    "どうぞ よろしく［お願（ねが）いします］": "Rất mong được sự giúp đỡ của bạn",
    "失礼（しつれい）ですが": "Xin lỗi cho tôi hỏi...",
    "お名前は？": "Tên bạn là gì?",
    "こちらは ～さんです。": "Đây là anh/chị...",

    # Bài 2
    "これ": "Cái này (gần người nói)",
    "それ": "Cái đó (gần người nghe)",
    "あれ": "Cái kia (xa cả hai người)",
    "この ～": "Này (~ đứng trước danh từ)",
    "その ～": "Đó, ấy (~ đứng trước danh từ)",
    "あの ～": "Kia (~ đứng trước danh từ)",
    "どの ～": "Nào (~ đứng trước danh từ)",
    "どれ": "Cái nào",
    "本": "Sách",
    "辞書": "Từ điển",
    "雑誌": "Tạp chí",
    "新聞": "Báo, tờ báo",
    "ノート": "Vở, sổ tay",
    "手帳": "Sổ tay cá nhân",
    "名刺": "Danh thiếp",
    "カード": "Thẻ, cạc",
    "鉛筆": "Bút chì",
    "ボールペン": "Bút bi",
    "シャープペンシル": "Bút chì kim",
    "かぎ": "Chìa khóa",
    "時計": "Đồng hồ",
    "傘": "Ô, dù",
    "鞄": "Cặp sách, túi xách",
    "CD": "Đĩa CD",
    "テレビ": "Tivi",
    "ラジオ": "Đài radio",
    "カメラ": "Máy ảnh",
    "コンピューター": "Máy vi tính",
    "車": "Xe hơi, ô tô",
    "机": "Bàn học, bàn làm việc",
    "いす": "Ghế",
    "チョコレート": "Sô-cô-la",
    "コーヒー": "Cà phê",
    "［お］土産": "Quà lưu niệm",
    "英語": "Tiếng Anh",
    "日本語": "Tiếng Nhật",
    "～語": "Tiếng (ngôn ngữ)",
    "何": "Cái gì",
    "そう": "Đúng vậy",
    "ちがいます": "Không phải, sai rồi",
    "そうですか。": "Thế à? / Ra là vậy",
    "あのう": "À, ừm (ngập ngừng khi nói)",
    "ほんの 気持ちです。": "Chút lòng thành của tôi",
    "どうぞ": "Xin mời",
    "どうも": "Cảm ơn",
    "ありがとう ございます": "Xin chân thành cảm ơn",
    "どういたしまして": "Không có chi, đừng bận tâm",

    # Bài 3
    "ここ": "Chỗ này, đây (gần người nói)",
    "そこ": "Chỗ đó, đấy (gần người nghe)",
    "あそこ": "Chỗ kia, đằng kia (xa cả hai)",
    "どこ": "Ở đâu",
    "こちら": "Phía này, hướng này (lịch sự của ここ)",
    "そちら": "Phía đó, hướng đó (lịch sự của そこ)",
    "あちら": "Phía kia, hướng kia (lịch sự của あそこ)",
    "どちら": "Phía nào, hướng nào (lịch sự của どこ)",
    "教室": "Phòng học, lớp học",
    "食堂": "Nhà ăn, căng tin",
    "事務所": "Văn phòng làm việc",
    "会議室": "Phòng họp",
    "受付": "Quầy tiếp tân",
    "ロビー": "Sảnh chờ",
    "部屋": "Căn phòng",
    "トイレ（お手洗い）": "Nhà vệ sinh",
    "お手洗い": "Nhà vệ sinh",
    "階段": "Cầu thang bộ",
    "エレベーター": "Thang máy",
    "エスカレーター": "Thang cuốn",
    "自動販売機": "Máy bán hàng tự động",
    "電話": "Điện thoại",
    "［お］国": "Đất nước, quốc gia",
    "会社": "Công ty",
    "うち": "Nhà (của mình)",
    "靴": "Giày dép",
    "ネクタイ": "Cà vạt",
    "ワイン": "Rượu vang",
    "売り場": "Quầy bán hàng",
    "地下": "Tầng hầm, dưới lòng đất",
    "－階": "Tầng",
    "何階": "Tầng mấy",
    "－円": "Yên Nhật",
    "いくら": "Bao nhiêu tiền",
    "百": "Trăm",
    "千": "Nghìn",
    "万": "Mười nghìn (vạn)",

    # Bài 4
    "起きます": "Thức dậy",
    "寝ます": "Ngủ, đi ngủ",
    "働きます": "Làm việc",
    "休みます": "Nghỉ, nghỉ ngơi",
    "勉強します": "Học, học tập",
    "終わります": "Kết thúc, xong",
    "デパート": "Trung tâm thương mại, bách hóa",
    "銀行": "Ngân hàng",
    "郵便局": "Bưu điện",
    "図書館": "Thư viện",
    "美術館": "Bảo tàng mỹ thuật",
    "今": "Bây giờ",
    "－時": "Giờ",
    "－分": "Phút",
    "半": "Rưỡi, nửa (30 phút)",
    "何時": "Mấy giờ",
    "何分": "Mấy phút",
    "午前": "Buổi sáng (AM)",
    "午後": "Buổi chiều (PM)",
    "朝": "Buổi sáng",
    "昼": "Buổi trưa",
    "晩（夜）": "Buổi tối, ban đêm",
    "おととい": "Hôm kia",
    "きのう": "Hôm qua",
    "きょう": "Hôm nay",
    "あした": "Ngày mai",
    "あさって": "Ngày kìa",
    "けさ": "Sáng nay",
    "こんばん": "Tối nay",
    "休み": "Nghỉ ngơi, ngày nghỉ",
    "昼休み": "Nghỉ trưa",
    "試験": "Bài thi, kỳ thi",
    "会議": "Cuộc họp",
    "映画": "Bộ phim",
    "毎朝": "Mỗi sáng",
    "毎晩": "Mỗi tối",
    "毎日": "Mỗi ngày",
    "月曜日": "Thứ hai",
    "火曜日": "Thứ ba",
    "水曜日": "Thứ tư",
    "木曜日": "Thứ năm",
    "金曜日": "Thứ sáu",
    "土曜日": "Thứ bảy",
    "日曜日": "Chủ nhật",
    "何曜日": "Thứ mấy",
    "～から": "Từ...",
    "～まで": "Đến...",
    "～と～": "Và, với (nối danh từ)",
    "大変ですね": "Vất vả quá nhỉ",

    # Bài 5
    "行きます": "Đi",
    "来ます": "Đến",
    "帰ります": "Về, trở về",
    "学校": "Trường học",
    "スーパー": "Siêu thị",
    "駅": "Nhà ga",
    "飛行機": "Máy bay",
    "船": "Tàu thủy, thuyền",
    "電車": "Tàu điện",
    "地下鉄": "Tàu điện ngầm",
    "新幹線": "Tàu siêu tốc Shinkansen",
    "バス": "Xe buýt",
    "タクシー": "Xe taxi",
    "自転車": "Xe đạp",
    "歩いて": "Đi bộ",
    "人": "Người",
    "友達": "Bạn bè",
    "彼": "Anh ấy, bạn trai",
    "彼女": "Cô ấy, bạn gái",
    "家族": "Gia đình",
    "一人で": "Một mình",
    "先週": "Tuần trước",
    "今週": "Tuần này",
    "来週": "Tuần sau",
    "先月": "Tháng trước",
    "今月": "Tháng này",
    "来月": "Tháng sau",
    "去年": "Năm ngoái",
    "今年": "Năm nay",
    "来年": "Năm sau",
    "－年": "Năm",
    "何年": "Năm nào, mấy năm",
    "－月": "Tháng",
    "何月": "Tháng mấy",
    "一日": "Mùng 1 / một ngày",
    "二日": "Mùng 2 / hai ngày",
    "三日": "Mùng 3 / ba ngày",
    "四日": "Mùng 4 / bốn ngày",
    "五日": "Mùng 5 / năm ngày",
    "六日": "Mùng 6 / sáu ngày",
    "七日": "Mùng 7 / bảy ngày",
    "八日": "Mùng 8 / tám ngày",
    "九日": "Mùng 9 / chín ngày",
    "十日": "Mùng 10 / mười ngày",
    "十四日": "Mùng 14 / mười bốn ngày",
    "二十日": "Ngày 20 / hai mươi ngày",
    "二十四日": "Ngày 24 / hai mươi tư ngày",
    "－日": "Ngày",
    "何日": "Mấy ngày, ngày mấy",
    "いつ": "Khi nào, bao giờ",
    "誕生日": "Sinh nhật",
    "そうですね。": "Đúng thế nhỉ / Để xem nào...",

    # Bài 6
    "食べます": "Ăn",
    "飲みます": "Uống",
    "吸います［たばこを～］": "Hút [thuốc lá]",
    "見ます": "Xem, nhìn",
    "聞きます": "Nghe",
    "読みます": "Đọc",
    "書きます": "Viết, vẽ",
    "買います": "Mua",
    "撮ります［写真を～］": "Chụp [ảnh]",
    "します": "Làm, chơi",
    "会います［友達に～］": "Gặp gỡ [bạn bè]",
    "ご飯": "Cơm, bữa ăn",
    "朝ご飯": "Bữa sáng",
    "昼ご飯": "Bữa trưa",
    "晩ご飯": "Bữa tối",
    "パン": "Bánh mì",
    "卵": "Trứng",
    "肉": "Thịt",
    "魚": "Cá",
    "野菜": "Rau",
    "果物": "Hoa quả, trái cây",
    "水": "Nước",
    "お茶": "Trà, chè xanh",
    "紅茶": "Trà đen, hồng trà",
    "牛乳（ミルク）": "Sữa bò",
    "ジュース": "Nước hoa quả",
    "ビール": "Bia",
    "［お］酒": "Rượu, rượu sake",
    "たばこ": "Thuốc lá",
    "手紙": "Lá thư",
    "レポート": "Báo cáo",
    "写真": "Bức ảnh",
    "ビデオ": "Băng video, video",
    "店": "Cửa hàng, tiệm",
    "レストラン": "Nhà hàng, quán ăn",
    "庭": "Khu vườn",
    "宿題": "Bài tập về nhà",
    "テニス": "Quần vợt, tennis",
    "サッカー": "Bóng đá",
    "［お］花見": "Ngắm hoa anh đào",
    "一緒に": "Cùng nhau",
    "ちょっと": "Một chút, một lát",
    "いつも": "Lúc nào cũng, luôn luôn",
    "ときどき": "Thỉnh thoảng, đôi khi",
    "それから": "Sau đó, tiếp theo",

    # Bài 7
    "切ります": "Cắt, gọt",
    "送ります": "Gửi",
    "あげます": "Cho, tặng",
    "もらいます": "Nhận",
    "貸します": "Cho mượn, cho vay",
    "借ります": "Mượn, vay",
    "教えます": "Dạy, chỉ bảo",
    "習います": "Học tập (từ ai đó)",
    "かけます［電話を～］": "Gọi [điện thoại]",
    "手": "Tay, bàn tay",
    "はし": "Đũa",
    "スプーン": "Thìa, muỗng",
    "ナイフ": "Dao",
    "フォーク": "Nĩa, dĩa",
    "はさみ": "Kéo",
    "ファクス": "Máy fax",
    "ワープロ": "Máy đánh chữ",
    "パソコン": "Máy vi tính cá nhân",
    "パンチ": "Cái bấm lỗ",
    "ホッチキス": "Cái dập ghim",
    "セロテープ": "Băng dính",
    "消しゴム": "Cục tẩy",
    "紙": "Tờ giấy",
    "花": "Bông hoa",
    "シャツ": "Áo sơ mi",
    "プレゼント": "Món quà",
    "荷物": "Hành lý, bưu phẩm",
    "お金": "Tiền bạc",
    "切符": "Vé (tàu, xe)",
    "クリスマス": "Giáng sinh",
    "父": "Bố (của mình)",
    "母": "Mẹ (của mình)",
    "お父さん": "Bố (của người khác)",
    "お母さん": "Mẹ (của người khác)",
    "もう": "Đã, rồi",
    "まだ": "Chưa",
    "これから": "Từ bây giờ, sau đây",
    "失礼します。": "Xin phép (khi vào phòng/ra về)",

    # Bài 8
    "ハンサム［な］": "Đẹp trai",
    "きれい［な］": "Đẹp, sạch sẽ",
    "静か［な］": "Yên tĩnh",
    "にぎやか［な］": "Náo nhiệt, nhộn nhịp",
    "有名［な］": "Nổi tiếng",
    "親切［な］": "Tốt bụng, thân thiện",
    "元気［な］": "Khỏe mạnh",
    "暇［な］": "Rảnh rỗi",
    "便利［な］": "Tiện lợi, thuận tiện",
    "すてき［な］": "Đẹp, tuyệt vời",
    "大きい": "Lớn, to",
    "小さい": "Nhỏ, bé",
    "新しい": "Mới",
    "古い": "Cũ, cổ",
    "いい（よい）": "Tốt, hay",
    "悪い": "Xấu, tồi",
    "暑い、熱い": "Nóng (thời tiết / nhiệt độ)",
    "寒い": "Lạnh (thời tiết)",
    "冷たい": "Lạnh, buốt (cảm giác đồ vật)",
    "難しい": "Khó khăn",
    "易しい": "Dễ dàng",
    "高い": "Cao, đắt",
    "安い": "Rẻ",
    "低い": "Thấp",
    "おもしろい": "Thú vị, hay ho",
    "おいしい": "Ngon miệng",
    "忙しい": "Bận rộn",
    "楽しい": "Vui vẻ",
    "白い": "Trắng",
    "黒い": "Đen",
    "赤い": "Đỏ",
    "青い": "Xanh da trời",
    "桜": "Hoa anh đào",
    "山": "Ngọn núi",
    "町": "Thị trấn, thành phố",
    "食べ物": "Đồ ăn, thức ăn",
    "所": "Nơi chốn, địa điểm",
    "寮": "Ký túc xá",
    "生活": "Cuộc sống, sinh hoạt",
    "［お］仕事": "Công việc",
    "どう": "Thế nào, như thế nào",
    "どんな ～": "Như thế nào (~ đứng trước danh từ)",
    "とても": "Rất",
    "あまり": "Không... lắm (đi với phủ định)",
    "そして": "Và, hơn nữa",
    "～が、～": "...nhưng...",
    "お元気ですか。": "Bạn có khỏe không?",
    "そろそろ 失礼します。": "Đã đến lúc tôi phải xin phép về",
    "また いらっしゃって ください。": "Lần sau lại ghé chơi nhé",

    # Bài 9
    "わかります": "Hiểu, nắm rõ",
    "あります": "Có (sở hữu/tồn tại đồ vật)",
    "好き［な］": "Thích",
    "嫌い［な］": "Ghét, không thích",
    "上手［な］": "Giỏi, khéo",
    "下手［な］": "Kém, dở",
    "飲み物": "Đồ uống",
    "料理": "Món ăn, nấu ăn",
    "スポーツ": "Thể thao",
    "野球": "Bóng chày",
    "ダンス": "Khiêu vũ, nhảy múa",
    "旅行": "Du lịch, chuyến đi",
    "音楽": "Âm nhạc",
    "歌": "Bài hát",
    "クラシック": "Nhạc cổ điển",
    "ジャズ": "Nhạc jazz",
    "コンサート": "Buổi hòa nhạc",
    "カラオケ": "Hát karaoke",
    "歌舞伎": "Kịch Kabuki truyền thống",
    "絵": "Bức tranh, hội họa",
    "字": "Chữ cái, chữ viết",
    "漢字": "Chữ Hán",
    "ひらがな": "Chữ cái Hiragana",
    "かたかな": "Chữ cái Katakana",
    "ローマ字": "Chữ cái La Mã (Romaji)",
    "細かい お金": "Tiền lẻ",
    "チケット": "Vé",
    "時間": "Thời gian",
    "用事": "Việc bận",
    "約束": "Lời hẹn, cuộc hẹn",
    "アルバイト": "Công việc làm thêm",
    "ご主人": "Chồng (người khác)",
    "夫 / 主人": "Chồng (của mình)",
    "奥さん": "Vợ (người khác)",
    "妻 / 家内": "Vợ (của mình)",
    "子ども": "Con cái, trẻ con",
    "よく": "Thường xuyên, rõ ràng",
    "だいたい": "Đại khái, khoảng",
    "たくさん": "Nhiều",
    "少し": "Một ít, một chút",
    "全然": "Hoàn toàn không (đi với phủ định)",
    "早く、速く": "Sớm, nhanh",
    "どうして": "Tại sao, vì sao",

    # Bài 10
    "います": "Có, ở (người, động vật sống)",
    "いろいろ［な］": "Nhiều, phong phú, đa dạng",
    "男の 人": "Người đàn ông",
    "女の 人": "Người phụ nữ",
    "男の 子": "Cậu bé, bé trai",
    "女の 子": "Cô bé, bé gái",
    "犬": "Con chó",
    "猫": "Con mèo",
    "パンダ": "Gấu trúc",
    "象": "Con voi",
    "木": "Cây cối, gỗ",
    "物": "Đồ vật",
    "電池": "Pin",
    "箱": "Cái hộp, thùng",
    "スイッチ": "Công tắc điện",
    "冷蔵庫": "Tủ lạnh",
    "テーブル": "Bàn ăn",
    "ベッド": "Giường ngủ",
    "棚": "Giá sách, kệ tủ",
    "ドア": "Cửa ra vào",
    "窓": "Cửa sổ",
    "ポスト": "Hộp thư",
    "ビル": "Tòa nhà cao tầng",
    "ATM": "Cây rút tiền ATM",
    "コンビニ": "Cửa hàng tiện lợi",
    "公園": "Công viên",
    "喫茶店": "Quán giải khát, quán cà phê",
    "～屋": "Cửa hàng bán...",
    "乗り場": "Điểm đón xe, bến xe",
    "県": "Tỉnh (đơn vị hành chính)",
    "上": "Trên",
    "下": "Dưới",
    "前": "Trước",
    "後ろ": "Sau",
    "右": "Bên phải",
    "左": "Bên trái",
    "中": "Bên trong",
    "外": "Bên ngoài",
    "隣": "Bên cạnh",
    "近く": "Gần",
    "間": "Ở giữa",
    "～や～［など］": "...và... [vân vân]"
}

def clean_meaning_str(text):
    if not text:
        return ""
    # Xóa comment như # ?ADD ...
    t = re.sub(r"#.*$", "", text).strip()
    # Xóa các dấu nháy thừa ở đầu cuối
    t = t.strip("\"'“””")
    # Xóa dấu phẩy thừa cuối câu
    t = t.rstrip(",").strip()
    return t

def main():
    print("=== BẮT ĐẦU CHUẨN HÓA TOÀN DIỆN NGHĨA TỪ VỰNG CHUẨN SÁCH GIÁO TRÌNH ===")
    
    file_path = "src/data/minna_lessons.json"
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    fixed_count = 0
    cleaned_noise_count = 0

    for lesson in data:
        for w in lesson.get("words", []):
            k = (w.get("kanji") or "").strip()
            kn = (w.get("kana") or "").strip()
            curr_m = w.get("meaning", "")

            # 1. Làm sạch rác chuỗi
            cleaned_m = clean_meaning_str(curr_m)
            if cleaned_m != curr_m:
                curr_m = cleaned_m
                cleaned_noise_count += 1

            # 2. Khớp từ điển sách chuẩn
            matched = False
            for key, correct_m in MINNA_TEXTBOOK_MEANINGS.items():
                if k == key or kn == key or k.replace(" ", "") == key.replace(" ", ""):
                    w["meaning"] = correct_m
                    matched = True
                    fixed_count += 1
                    break
            
            if not matched:
                w["meaning"] = clean_meaning_str(curr_m)

    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"-> Đã áp dụng nghĩa chuẩn sách giáo trình Minna cho {fixed_count} từ!")
    print(f"-> Đã làm sạch rác cú pháp / ký tự thừa cho {cleaned_noise_count} từ!")

    # Làm sạch các file N5 - N1
    for vf in [
        "src/data/vocab/n5_lessons.json",
        "src/data/vocab/n4_lessons.json",
        "src/data/vocab/n3_lessons.json",
        "src/data/vocab/n2_lessons.json",
        "src/data/vocab/n1_lessons.json"
    ]:
        if os.path.exists(vf):
            with open(vf, "r", encoding="utf-8") as f:
                vdata = json.load(f)
            vfix = 0
            for l in vdata:
                for w in l.get("words", []):
                    old_m = w.get("meaning", "")
                    clean_m = clean_meaning_str(old_m)
                    if clean_m != old_m:
                        w["meaning"] = clean_m
                        vfix += 1
            with open(vf, "w", encoding="utf-8") as f:
                json.dump(vdata, f, ensure_ascii=False, indent=2)
            print(f"-> Đã làm sạch rác ký tự trong {vf}: {vfix} từ!")

    print("\n=== HOÀN TẤT CHUẨN HÓA BẢN DỊCH TỪ VỰNG CHUẨN SÁCH! ===")

if __name__ == "__main__":
    main()
