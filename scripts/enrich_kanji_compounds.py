import json, re

print("=== Đang tổng hợp từ vựng ghép chuẩn JLPT cho Kanji N5 & N4 ===")

# Danh mục từ vựng ghép chuẩn cho toàn bộ 79 Kanji N5
N5_COMPOUNDS = {
    '一': [
        ('一', 'いち', 'số 1', 'NHẤT'),
        ('一日', 'いちにち', '1 ngày, trong ngày, cả ngày', 'NHẤT NHẬT'),
        ('一日', 'ついたち', 'ngày mùng 1 (đầu tháng)', 'NHẤT NHẬT'),
        ('一月', 'いちがつ', 'tháng 1', 'NHẤT NGUYỆT'),
        ('一人', 'ひとり', '1 người, một mình', 'NHẤT NHÂN'),
        ('一つ', 'ひとつ', '1 cái (đếm đồ vật)', 'NHẤT'),
        ('一番', 'いちばん', 'nhất, số 1', 'NHẤT PHIÊN'),
        ('一時', 'いちじ', '1 giờ', 'NHẤT THỜI'),
        ('一年', 'いちねん', '1 năm', 'NHẤT NIÊN'),
        ('一分', 'いっぷん', '1 phút', 'NHẤT PHÂN'),
        ('一緒', 'いっしょ', 'cùng nhau', 'NHẤT TỰ'),
        ('一度', 'いちど', 'một lần', 'NHẤT ĐỘ'),
        ('一昨日', 'おととい', 'hôm kia', 'NHẤT TÁC NHẬT'),
        ('一昨年', 'おととし', 'năm kia', 'NHẤT TÁC NIÊN'),
        ('一杯', 'いっぱい', '1 ly, đầy', 'NHẤT BÔI')
    ],
    '二': [
        ('二', 'に', 'số 2', 'NHỊ'),
        ('二日', 'ふつか', 'ngày mùng 2, 2 ngày', 'NHỊ NHẬT'),
        ('二月', 'にがつ', 'tháng 2', 'NHỊ NGUYỆT'),
        ('二人', 'ふたり', '2 người', 'NHỊ NHÂN'),
        ('二つ', 'ふたつ', '2 cái (đếm đồ vật)', 'NHỊ'),
        ('二十日', 'はつか', 'ngày 20, 20 ngày', 'NHỊ THẬP NHẬT'),
        ('二十歳', 'はたち', '20 tuổi', 'NHỊ THẬP TUẾ'),
        ('二時', 'にじ', '2 giờ', 'NHỊ THỜI'),
        ('二年', 'にねん', '2 năm', 'NHỊ NIÊN'),
        ('二階', 'にかい', 'tầng 2', 'NHỊ GIAI'),
        ('二分', 'にふん', '2 phút', 'NHỊ PHÂN')
    ],
    '三': [
        ('三', 'さん', 'số 3', 'TAM'),
        ('三日', 'みっか', 'ngày mùng 3, 3 ngày', 'TAM NHẬT'),
        ('三月', 'さんがつ', 'tháng 3', 'TAM NGUYỆT'),
        ('三人', 'さんにん', '3 người', 'TAM NHÂN'),
        ('三つ', 'みっつ', '3 cái (đếm đồ vật)', 'TAM'),
        ('三時', 'さんじ', '3 giờ', 'TAM THỜI'),
        ('三年', 'さんねん', '3 năm', 'TAM NIÊN'),
        ('三角', 'さんかく', 'tam giác', 'TAM GIÁC'),
        ('三階', 'さんがい', 'tầng 3', 'TAM GIAI'),
        ('三分', 'さんぷん', '3 phút', 'TAM PHÂN'),
        ('三日月', 'みかづき', 'trăng lưỡi liềm', 'TAM NHẬT NGUYỆT')
    ],
    '四': [
        ('四', 'よん', 'số 4', 'TỨ'),
        ('四日', 'よっか', 'ngày mùng 4, 4 ngày', 'TỨ NHẬT'),
        ('四月', 'しがつ', 'tháng 4', 'TỨ NGUYỆT'),
        ('四人', 'よにん', '4 người', 'TỨ NHÂN'),
        ('四つ', 'よっつ', '4 cái (đếm đồ vật)', 'TỨ'),
        ('四時', 'よじ', '4 giờ', 'TỨ THỜI'),
        ('四年', 'よねん', '4 năm', 'TỨ NIÊN'),
        ('四季', 'しき', 'bốn mùa', 'TỨ QUÝ'),
        ('四角', 'しかく', 'hình vuông, tứ giác', 'TỨ GIÁC'),
        ('四分', 'よんぷん', '4 phút', 'TỨ PHÂN')
    ],
    '五': [
        ('五', 'ご', 'số 5', 'NGŨ'),
        ('五日', 'いつか', 'ngày mùng 5, 5 ngày', 'NGŨ NHẬT'),
        ('五月', 'ごがつ', 'tháng 5', 'NGŨ NGUYỆT'),
        ('五人', 'ごにん', '5 người', 'NGŨ NHÂN'),
        ('五つ', 'いつつ', '5 cái (đếm đồ vật)', 'NGŨ'),
        ('五時', 'ごじ', '5 giờ', 'NGŨ THỜI'),
        ('五年', 'ごねん', '5 năm', 'NGŨ NIÊN'),
        ('五分', 'ごふん', '5 phút', 'NGŨ PHÂN'),
        ('五十', 'ごじゅう', '50', 'NGŨ THẬP'),
        ('五円', 'ごえん', '5 yên', 'NGŨ YÊN')
    ],
    '六': [
        ('六', 'ろく', 'số 6', 'LỤC'),
        ('六日', 'むいか', 'ngày mùng 6, 6 ngày', 'LỤC NHẬT'),
        ('六月', 'ろくがつ', 'tháng 6', 'LỤC NGUYỆT'),
        ('六人', 'ろくにん', '6 người', 'LỤC NHÂN'),
        ('六つ', 'むっつ', '6 cái (đếm đồ vật)', 'LỤC'),
        ('六時', 'ろくじ', '6 giờ', 'LỤC THỜI'),
        ('六年', 'ろくねん', '6 năm', 'LỤC NIÊN'),
        ('六百', 'ろっぴゃく', '600', 'LỤC BÁCH'),
        ('六分', 'ろっぷん', '6 phút', 'LỤC PHÂN')
    ],
    '七': [
        ('七', 'なな', 'số 7', 'THẤT'),
        ('七日', 'なのか', 'ngày mùng 7, 7 ngày', 'THẤT NHẬT'),
        ('七月', 'しちがつ', 'tháng 7', 'THẤT NGUYỆT'),
        ('七人', 'ななにん', '7 người', 'THẤT NHÂN'),
        ('七つ', 'ななつ', '7 cái (đếm đồ vật)', 'THẤT'),
        ('七時', 'しちじ', '7 giờ', 'THẤT THỜI'),
        ('七年', 'ななねん', '7 năm', 'THẤT NIÊN'),
        ('七夕', 'たなばた', 'lễ Thất tịch', 'THẤT TỊCH'),
        ('七分', 'ななふん', '7 phút', 'THẤT PHÂN')
    ],
    '八': [
        ('八', 'はち', 'số 8', 'BÁT'),
        ('八日', 'ようか', 'ngày mùng 8, 8 ngày', 'BÁT NHẬT'),
        ('八月', 'はちがつ', 'tháng 8', 'BÁT NGUYỆT'),
        ('八人', 'はちにん', '8 người', 'BÁT NHÂN'),
        ('八つ', 'やっつ', '8 cái (đếm đồ vật)', 'BÁT'),
        ('八時', 'はちじ', '8 giờ', 'BÁT THỜI'),
        ('八年', 'はちねん', '8 năm', 'BÁT NIÊN'),
        ('八百', 'はっぴゃく', '800', 'BÁT BÁCH'),
        ('八百屋', 'やおや', 'cửa hàng rau quả', 'BÁT BÁCH ỐC'),
        ('八分', 'はっぷん', '8 phút', 'BÁT PHÂN')
    ],
    '九': [
        ('九', 'きゅう', 'số 9', 'CỬU'),
        ('九日', 'ここのか', 'ngày mùng 9, 9 ngày', 'CỬU NHẬT'),
        ('九月', 'くがつ', 'tháng 9', 'CỬU NGUYỆT'),
        ('九人', 'きゅうにん', '9 người', 'CỬU NHÂN'),
        ('九つ', 'ここのつ', '9 cái (đếm đồ vật)', 'CỬU'),
        ('九時', 'くじ', '9 giờ', 'CỬU THỜI'),
        ('九年', 'きゅうねん', '9 năm', 'CỬU NIÊN'),
        ('九百', 'きゅうひゃく', '900', 'CỬU BÁCH'),
        ('九分', 'きゅうふん', '9 phút', 'CỬU PHÂN'),
        ('九州', 'きゅうしゅう', 'đảo Kyushu', 'CỬU CHÂU')
    ],
    '十': [
        ('十', 'じゅう', 'số 10', 'THẬP'),
        ('十日', 'とおか', 'ngày mùng 10, 10 ngày', 'THẬP NHẬT'),
        ('十月', 'じゅうがつ', 'tháng 10', 'THẬP NGUYỆT'),
        ('十人', 'じゅうにん', '10 người', 'THẬP NHÂN'),
        ('十時', 'じゅうじ', '10 giờ', 'THẬP THỜI'),
        ('十年', 'じゅうねん', '10 năm', 'THẬP NIÊN'),
        ('十分', 'じゅっぷん', '10 phút', 'THẬP PHÂN'),
        ('十分', 'じゅうぶん', 'đầy đủ, thoả đáng', 'THẬP PHÂN'),
        ('二十', 'にじゅう', '20', 'NHỊ THẬP'),
        ('三十', 'さんじゅう', '30', 'TAM THẬP')
    ],
    '百': [
        ('百', 'ひゃく', '100', 'BÁCH'),
        ('三百', 'さんびゃく', '300', 'TAM BÁCH'),
        ('六百', 'ろっぴゃく', '600', 'LỤC BÁCH'),
        ('八百', 'はっぴゃく', '800', 'BÁT BÁCH'),
        ('百科事典', 'ひゃっかじてん', 'từ điển bách khoa', 'BÁCH KHOA SỰ ĐIỂN'),
        ('百円', 'ひゃくえん', '100 yên', 'BÁCH YÊN')
    ],
    '千': [
        ('千', 'せん', '1000', 'THIÊN'),
        ('三千', 'さんぜん', '3000', 'TAM THIÊN'),
        ('八千', 'はっせん', '8000', 'BÁT THIÊN'),
        ('千円', 'せんえん', '1000 yên', 'THIÊN YÊN'),
        ('千葉', 'ちば', 'tỉnh Chiba', 'THIÊN DIỆP')
    ],
    '万': [
        ('万', 'まん', '1 vạn, 10.000', 'VẠN'),
        ('一万', 'いちまん', '1 vạn (10.000)', 'NHẤT VẠN'),
        ('十万', 'じゅうまん', '10 vạn (100.000)', 'THẬP VẠN'),
        ('百万', 'ひゃくまん', '1 triệu', 'BÁCH VẠN'),
        ('万年筆', 'まんねんひつ', 'bút mực, bút máy', 'VẠN NIÊN BÚT'),
        ('万国', 'ばんこく', 'vạn quốc, toàn thế giới', 'VẠN QUỐC')
    ],
    '円': [
        ('円', 'えん', 'yên (tiền Nhật), hình tròn', 'YÊN'),
        ('百円', 'ひゃくえん', '100 yên', 'BÁCH YÊN'),
        ('千円', 'せんえん', '1000 yên', 'THIÊN YÊN'),
        ('一万円', 'いちまんえん', '1 vạn yên (10.000 yên)', 'NHẤT VẠN YÊN'),
        ('円い', 'まるい', 'tròn', 'YÊN'),
        ('円高', 'えんだか', 'đồng yên tăng giá', 'YÊN CAO')
    ],
    '日': [
        ('日', 'ひ', 'ngày, mặt trời', 'NHẬT'),
        ('日本', 'にほん', 'Nhật Bản', 'NHẬT BẢN'),
        ('日曜日', 'にちようび', 'Chủ nhật', 'NHẬT DIỆU NHẬT'),
        ('毎日', 'まいにち', 'mỗi ngày, hằng ngày', 'MỖI NHẬT'),
        ('休日', 'きゅうじつ', 'ngày nghỉ', 'HƯU NHẬT'),
        ('祝日', 'しゅくじつ', 'ngày lễ', 'CHÚC NHẬT'),
        ('日光', 'にっこう', 'ánh nắng mặt trời', 'NHẬT QUANG'),
        ('日記', 'にっき', 'nhật ký', 'NHẬT KÝ'),
        ('記念日', 'きねんび', 'ngày kỷ niệm', 'KỶ NIỆM NHẬT'),
        ('今日', 'きょう', 'hôm nay', 'KIM NHẬT')
    ],
    '月': [
        ('月', 'つき', 'mặt trăng, tháng', 'NGUYỆT'),
        ('月曜日', 'げつようび', 'Thứ 2', 'NGUYỆT DIỆU NHẬT'),
        ('今月', 'こんげつ', 'tháng này', 'KIM NGUYỆT'),
        ('先月', 'せんげつ', 'tháng trước', 'TIÊN NGUYỆT'),
        ('来月', 'らいげつ', 'tháng sau', 'LAI NGUYỆT'),
        ('毎月', 'まいつき', 'mỗi tháng, hằng tháng', 'MỖI NGUYỆT'),
        ('生年月日', 'せいねんがっぴ', 'ngày tháng năm sinh', 'SINH NIÊN NGUYỆT NHẬT'),
        ('正月', 'しょうがつ', 'Tết Nguyên Đán', 'CHÍNH NGUYỆT')
    ],
    '火': [
        ('火', 'ひ', 'lửa', 'HOẢ'),
        ('火曜日', 'かようび', 'Thứ 3', 'HOẢ DIỆU NHẬT'),
        ('火事', 'かじ', 'hoả hoạn, cháy nhà', 'HOẢ SỰ'),
        ('花火', 'はなび', 'pháo hoa', 'HOA HOẢ'),
        ('火山', 'かざん', 'núi lửa', 'HOẢ SƠN'),
        ('火星', 'かせい', 'sao Hoả', 'HOẢ TINH')
    ],
    '水': [
        ('水', 'みず', 'nước', 'THUỶ'),
        ('水曜日', 'すいようび', 'Thứ 4', 'THUỶ DIỆU NHẬT'),
        ('水道', 'すいどう', 'nước máy, hệ thống cấp nước', 'THUỶ ĐẠO'),
        ('水泳', 'すいえい', 'bơi lội', 'THUỶ VỊNH'),
        ('海水浴', 'かいすいよく', 'tắm biển', 'HẢI THUỶ DỤC'),
        ('水着', 'みずぎ', 'đồ bơi', 'THUỶ TRƯỚC')
    ],
    '木': [
        ('木', 'き', 'cây cối', 'MỘC'),
        ('木曜日', 'もくようび', 'Thứ 5', 'MỘC DIỆU NHẬT'),
        ('木綿', 'もめん', 'bông, vải cotton', 'MỘC MIÊN'),
        ('植木', 'うえき', 'cây cảnh', 'THỰC MỘC'),
        ('大木', 'たいぼく', 'cây cổ thụ lớn', 'ĐẠI MỘC')
    ],
    '金': [
        ('金', 'かね', 'tiền, vàng', 'KIM'),
        ('お金', 'おかね', 'tiền bạc', 'KIM'),
        ('金曜日', 'きんようび', 'Thứ 6', 'KIM DIỆU NHẬT'),
        ('料金', 'りょうきん', 'tiền phí, giá cước', 'LIỆU KIM'),
        ('現金', 'げんきん', 'tiền mặt', 'HIỆN KIM'),
        ('金持ち', 'かねもち', 'người giàu có', 'KIM TRÌ'),
        ('金属', 'きんぞく', 'kim loại', 'KIM CHÚC')
    ],
    '土': [
        ('土', 'つち', 'đất cát', 'THỔ'),
        ('土曜日', 'どようび', 'Thứ 7', 'THỔ DIỆU NHẬT'),
        ('土地', 'とち', 'đất đai', 'THỔ ĐỊA'),
        ('お土産', 'おみやげ', 'quà lưu niệm, đặc sản', 'THỔ SẢN'),
        ('粘土', 'ねんど', 'đất sét', 'NIÊM THỔ')
    ],
    '年': [
        ('年', 'とし', 'năm, tuổi tác', 'NIÊN'),
        ('今年', 'ことし', 'năm nay', 'KIM NIÊN'),
        ('去年', 'きょねん', 'năm ngoái', 'KHỨ NIÊN'),
        ('来年', 'らいねん', 'năm sau', 'LAI NIÊN'),
        ('毎年', 'まいとし', 'mỗi năm, hằng năm', 'MỖI NIÊN'),
        ('年末', 'ねんまつ', 'cuối năm', 'NIÊN MẠT'),
        ('年始', 'ねんし', 'đầu năm', 'NIÊN THUỶ'),
        ('年齢', 'ねんれい', 'tuổi tác', 'NIÊN LINH')
    ],
    '今': [
        ('今', 'いま', 'bây giờ, hiện tại', 'KIM'),
        ('今日', 'きょう', 'hôm nay', 'KIM NHẬT'),
        ('今朝', 'けさ', 'sáng nay', 'KIM TRIÊU'),
        ('今晩', 'こんばん', 'tối nay', 'KIM VÃN'),
        ('今月', 'こんげつ', 'tháng này', 'KIM NGUYỆT'),
        ('今年', 'ことし', 'năm nay', 'KIM NIÊN'),
        ('今週', 'こんしゅう', 'tuần này', 'KIM CHU')
    ],
    '時': [
        ('時', 'とき', 'khi, lúc, thời gian', 'THỜI'),
        ('時間', 'じかん', 'thời gian, tiếng đồng hồ', 'THỜI GIAN'),
        ('時計', 'とけい', 'đồng hồ', 'THỜI KẾ'),
        ('一時', 'いちじ', '1 giờ', 'NHẤT THỜI'),
        ('時代', 'じだい', 'thời đại, thời kỳ', 'THỜI ĐẠI'),
        ('時々', 'ときどき', 'thỉnh thoảng, đôi khi', 'THỜI')
    ],
    '半': [
        ('半', 'はん', 'nửa, rưỡi', 'BÁN'),
        ('半分', 'はんぶん', 'một nửa', 'BÁN PHÂN'),
        ('半年', 'はんとし', 'nửa năm', 'BÁN NIÊN'),
        ('半日', 'はんにち', 'nửa ngày', 'BÁN NHẬT'),
        ('一時半', 'いちじはん', '1 giờ rưỡi', 'NHẤT THỜI BÁN'),
        ('半島', 'はんとう', 'bán đảo', 'BÁN ĐẢO')
    ],
    '午': [
        ('午前', 'ごぜん', 'buổi sáng, trước trưa (AM)', 'NGỌ TIỀN'),
        ('午後', 'ごご', 'buổi chiều, sau trưa (PM)', 'NGỌ HẬU'),
        ('正午', 'しょうご', 'chính ngọ, 12 giờ trưa', 'CHÍNH NGỌ')
    ],
    '前': [
        ('前', 'まえ', 'phía trước, trước đây', 'TIỀN'),
        ('名前', 'なまえ', 'tên gọi', 'DANH TIỀN'),
        ('午前', 'ごぜん', 'buổi sáng', 'NGỌ TIỀN'),
        ('駅前', 'えきまえ', 'trước nhà ga', 'DỊCH TIỀN'),
        ('前半', 'ぜんはん', 'nửa đầu, hiệp một', 'TIỀN BÁN'),
        ('以前', 'いぜん', 'trước đây, trước kia', 'DĨ TIỀN')
    ],
    '後': [
        ('後', 'あと', 'sau, đằng sau', 'HẬU'),
        ('後ろ', 'うしろ', 'phía sau lưng', 'HẬU'),
        ('午後', 'ごご', 'buổi chiều', 'NGỌ HẬU'),
        ('後半', 'こうはん', 'nửa sau, hiệp hai', 'HẬU BÁN'),
        ('最後', 'さいご', 'cuối cùng', 'TỐI HẬU'),
        ('以後', 'いご', 'sau đó, từ sau đó', 'DĨ HẬU')
    ],
    '間': [
        ('間', 'あいだ', 'khoảng giữa, trong khi', 'GIAN'),
        ('時間', 'じかん', 'thời gian', 'THỜI GIAN'),
        ('間に合う', 'まにあう', 'kịp giờ', 'GIAN HỢP'),
        ('仲間', 'なかま', 'bạn bè, đồng đội', 'TRỌNG GIAN'),
        ('昼間', 'ひるま', 'ban ngày', 'TRÚ GIAN'),
        ('人間', 'にんげん', 'con người, nhân loại', 'NHÂN GIAN')
    ],
    '毎': [
        ('毎日', 'まいにち', 'mỗi ngày, hằng ngày', 'MỖI NHẬT'),
        ('毎週', 'まいしゅう', 'mỗi tuần, hằng tuần', 'MỖI CHU'),
        ('毎月', 'まいつき', 'mỗi tháng, hằng tháng', 'MỖI NGUYỆT'),
        ('毎年', 'まいとし', 'mỗi năm, hằng năm', 'MỖI NIÊN'),
        ('毎朝', 'まいあさ', 'mỗi sáng', 'MỖI TRIÊU'),
        ('毎晩', 'まいばん', 'mỗi tối', 'MỖI VÃN'),
        ('毎回', 'まいかい', 'mỗi lần', 'MỖI HỒI')
    ],
    '上': [
        ('上', 'うえ', 'phía trên, bên trên', 'THƯỢNG'),
        ('上手', 'じょうず', 'giỏi, khéo léo', 'THƯỢNG THỦ'),
        ('上がる', 'あがる', 'đi lên, tăng lên', 'THƯỢNG'),
        ('上げる', 'あげる', 'nâng lên, tặng', 'THƯỢNG'),
        ('上着', 'うわぎ', 'áo khoác ngoài', 'THƯỢNG TRƯỚC'),
        ('屋上', 'おくじょう', 'sân thượng', 'ỐC THƯỢNG')
    ],
    '下': [
        ('下', 'した', 'phía dưới, bên dưới', 'HẠ'),
        ('下手', 'へた', 'kém, vụng về', 'HẠ THỦ'),
        ('下がる', 'さがる', 'hạ xuống, giảm xuống', 'HẠ'),
        ('下げる', 'さげる', 'hạ bớt, giảm', 'HẠ'),
        ('地下鉄', 'ちかてつ', 'tàu điện ngầm', 'ĐỊA HẠ THIẾT'),
        ('下着', 'したぎ', 'quần áo lót', 'HẠ TRƯỚC')
    ],
    '左': [
        ('左', 'ひだり', 'bên trái', 'TẢ'),
        ('左手', 'ひだりて', 'tay trái', 'TẢ THỦ'),
        ('左側', 'ひだりがわ', 'phía bên trái', 'TẢ TRẮC'),
        ('左右', 'さゆう', 'trái phải, chi phối', 'TẢ HỮU')
    ],
    '右': [
        ('右', 'みぎ', 'bên phải', 'HỮU'),
        ('右手', 'みぎて', 'tay phải', 'HỮU THỦ'),
        ('右側', 'みぎがわ', 'phía bên phải', 'HỮU TRẮC'),
        ('右折', 'うせつ', 'rẽ phải', 'HỮU CHIẾT')
    ],
    '中': [
        ('中', 'なか', 'bên trong, ở giữa', 'TRUNG'),
        ('一日中', 'いちにちじゅう', 'suốt cả ngày', 'NHẤT NHẬT TRUNG'),
        ('中心', 'ちゅうしん', 'trung tâm', 'TRUNG TÂM'),
        ('中学', 'ちゅうがく', 'trường cấp 2', 'TRUNG HỌC'),
        ('中国', 'ちゅうごく', 'Trung Quốc', 'TRUNG QUỐC'),
        ('途中', 'とちゅう', 'giữa đường, giữa chừng', 'ĐỒ TRUNG')
    ],
    '外': [
        ('外', 'そと', 'bên ngoài', 'NGOẠI'),
        ('外国', 'がいこく', 'nước ngoài', 'NGOẠI QUỐC'),
        ('外国人', 'がいこくじん', 'người nước ngoài', 'NGOẠI QUỐC NHÂN'),
        ('外出', 'がいしゅつ', 'ra ngoài', 'NGOẠI XUẤT'),
        ('海外', 'かいがい', 'hải ngoại, nước ngoài', 'HẢI NGOẠI'),
        ('意外', 'いがい', 'bất ngờ, ngoài ý muốn', 'Ý NGOẠI')
    ],
    '東': [
        ('東', 'ひがし', 'hướng Đông, phía Đông', 'ĐÔNG'),
        ('東京', 'とうきょう', 'Tokyo', 'ĐÔNG KINH'),
        ('東口', 'ひがしぐち', 'cửa phía Đông', 'ĐÔNG KHẨU'),
        ('東西', 'とうざい', 'Đông Tây', 'ĐÔNG TÂY'),
        ('中東', 'ちゅうとう', 'Trung Đông', 'TRUNG ĐÔNG')
    ],
    '西': [
        ('西', 'にし', 'hướng Tây, phía Tây', 'TÂY'),
        ('西口', 'にしぐち', 'cửa phía Tây', 'TÂY KHẨU'),
        ('西洋', 'せいよう', 'phương Tây', 'TÂY DƯƠNG'),
        ('関西', 'かんさい', 'vùng Kansai', 'QUAN TÂY')
    ],
    '南': [
        ('南', 'みなみ', 'hướng Nam, phía Nam', 'NAM'),
        ('南口', 'みなみぐち', 'cửa phía Nam', 'NAM KHẨU'),
        ('東南アジア', 'とうなんアジア', 'Đông Nam Á', 'ĐÔNG NAM'),
        ('南北', 'なんぼく', 'Nam Bắc', 'NAM BẮC')
    ],
    '北': [
        ('北', 'きた', 'hướng Bắc, phía Bắc', 'BẮC'),
        ('北口', 'きたぐち', 'cửa phía Bắc', 'BẮC KHẨU'),
        ('北海道', 'ほっかいどう', 'Hokkaido', 'BẮC HẢI ĐẠO'),
        ('東北', 'とうほく', 'vùng Tohoku (Đông Bắc)', 'ĐÔNG BẮC')
    ],
    '人': [
        ('人', 'ひと', 'người', 'NHÂN'),
        ('日本人', 'にほんじん', 'người Nhật Bản', 'NHẬT BẢN NHÂN'),
        ('一人', 'ひとり', '1 người, một mình', 'NHẤT NHÂN'),
        ('二人', 'ふたり', '2 người', 'NHỊ NHÂN'),
        ('三人', 'さんにん', '3 người', 'TAM NHÂN'),
        ('外国人', 'がいこくじん', 'người nước ngoài', 'NGOẠI QUỐC NHÂN'),
        ('大人', 'おとな', 'người lớn', 'ĐẠI NHÂN'),
        ('人気', 'にんき', 'sự yêu thích, nổi tiếng', 'NHÂN KHÍ'),
        ('人口', 'じんこう', 'dân số', 'NHÂN KHẨU')
    ],
    '男': [
        ('男', 'おとこ', 'đàn ông, nam giới', 'NAM'),
        ('男の人', 'おとこのひと', 'người đàn ông', 'NAM NHÂN'),
        ('男の子', 'おとこのこ', 'bé trai', 'NAM TỬ'),
        ('男性', 'だんせい', 'nam giới, phái nam', 'NAM TÍNH'),
        ('長男', 'ちょうなん', 'trưởng nam, con trai cả', 'TRƯỞNG NAM')
    ],
    '女': [
        ('女', 'おんな', 'phụ nữ, nữ giới', 'NỮ'),
        ('女の人', 'おんなのひと', 'người phụ nữ', 'NỮ NHÂN'),
        ('女の子', 'おんなのこ', 'bé gái', 'NỮ TỬ'),
        ('女性', 'じょせい', 'nữ giới, phái nữ', 'NỮ TÍNH'),
        ('長女', 'ちょうじょ', 'trưởng nữ, con gái cả', 'TRƯỞNG NỮ'),
        ('彼女', 'かのじょ', 'cô ấy, bạn gái', 'BỈ NỮ')
    ],
    '子': [
        ('子', 'こ', 'đứa trẻ, con cái', 'TỬ'),
        ('子供', 'こども', 'trẻ con, con nít', 'TỬ CUNG'),
        ('男の子', 'おとこのこ', 'bé trai', 'NAM TỬ'),
        ('女の子', 'おんなのこ', 'bé gái', 'NỮ TỬ'),
        ('様子', 'ようす', 'tình hình, dáng vẻ', 'DẠNG TỬ'),
        ('帽子', 'ぼうし', 'mũ, nón', 'MẠO TỬ')
    ],
    '父': [
        ('父', 'ちち', 'bố (của mình)', 'PHỤ'),
        ('お父さん', 'おとうさん', 'bố (của người khác)', 'PHỤ'),
        ('父親', 'ちちおや', 'người cha', 'PHỤ THÂN'),
        ('祖父', 'そふ', 'ông (nội/ngoại của mình)', 'TỔ PHỤ')
    ],
    '母': [
        ('母', 'はは', 'mẹ (của mình)', 'MẪU'),
        ('お母さん', 'おかあさん', 'mẹ (của người khác)', 'MẪU'),
        ('母親', 'ははおや', 'người mẹ', 'MẪU THÂN'),
        ('祖母', 'そぼ', 'bà (nội/ngoại của mình)', 'TỔ MẪU'),
        ('母国', 'ぼこく', 'quê hương, đất mẹ', 'MẪU QUỐC')
    ],
    '友': [
        ('友', 'とも', 'bạn bè', 'HỮU'),
        ('友達', 'ともだち', 'bạn bè', 'HỮU ĐẠT'),
        ('友人', 'ゆうじん', 'người bạn thân', 'HỮU NHÂN'),
        ('親友', 'しんゆう', 'bạn thân chí cốt', 'THÂN HỮU'),
        ('友情', 'ゆうじょう', 'tình bạn', 'HỮU TÌNH')
    ],
    '名': [
        ('名前', 'なまえ', 'tên gọi', 'DANH TIỀN'),
        ('有名', 'ゆうめい', 'nổi tiếng', 'HỮU DANH'),
        ('名字', 'みょうじ', 'họ (tên họ)', 'DANH TỰ'),
        ('名物', 'めいぶつ', 'đặc sản nổi tiếng', 'DANH VẬT'),
        ('名刺', 'めいし', 'danh thiếp', 'DANH THÍCH'),
        ('名所', 'めいしょ', 'danh lam thắng cảnh', 'DANH SỞ')
    ],
    '本': [
        ('本', 'ほん', 'sách, nguồn gốc', 'BẢN'),
        ('日本', 'にほん', 'Nhật Bản', 'NHẬT BẢN'),
        ('日本語', 'にほんご', 'tiếng Nhật', 'NHẬT BẢN NGỮ'),
        ('本当', 'ほんとう', 'thật sự, thật lòng', 'BẢN ĐƯƠNG'),
        ('本日', 'ほんじつ', 'hôm nay (lịch sự)', 'BẢN NHẬT'),
        ('基本', 'きほん', 'cơ bản', 'CƠ BẢN'),
        ('本店', 'ほんてん', 'trụ sở chính, cửa hàng chính', 'BẢN ĐIẾM')
    ],
    '国': [
        ('国', 'くに', 'đất nước, quốc gia', 'QUỐC'),
        ('外国', 'がいこく', 'nước ngoài', 'NGOẠI QUỐC'),
        ('外国人', 'がいこくじん', 'người nước ngoài', 'NGOẠI QUỐC NHÂN'),
        ('中国', 'ちゅうごく', 'Trung Quốc', 'TRUNG QUỐC'),
        ('韓国', 'かんこく', 'Hàn Quốc', 'HÀN QUỐC'),
        ('国内', 'こくない', 'trong nước, nội địa', 'QUỐC NỘI'),
        ('国際', 'こくさい', 'quốc tế', 'QUỐC TẾ')
    ],
    '先': [
        ('先', 'さき', 'trước đây, điểm đến', 'TIÊN'),
        ('先生', 'せんせい', 'thầy cô giáo, bác sĩ', 'TIÊN SINH'),
        ('先月', 'せんげつ', 'tháng trước', 'TIÊN NGUYỆT'),
        ('先週', 'せんしゅう', 'tuần trước', 'TIÊN CHU'),
        ('先輩', 'せんぱい', 'tiền bối, đàn anh', 'TIÊN BỐI'),
        ('お先に', 'おさきに', 'tôi xin phép về trước', 'TIÊN')
    ],
    '生': [
        ('先生', 'せんせい', 'giáo viên', 'TIÊN SINH'),
        ('学生', 'がくせい', 'học sinh, sinh viên', 'HỌC SINH'),
        ('生まれる', 'うまれる', 'được sinh ra', 'SINH'),
        ('生きる', 'いきる', 'sống, sinh sống', 'SINH'),
        ('生活', 'せいかつ', 'cuộc sống sinh hoạt', 'SINH HOẠT'),
        ('誕生日', 'たんじょうび', 'ngày sinh nhật', 'ĐẢN SINH NHẬT'),
        ('一生懸命', 'いっしょうけんめい', 'hết mình, chăm chỉ', 'NHẤT SINH HUYỀN MỆNH')
    ],
    '学': [
        ('学生', 'がくせい', 'học sinh, sinh viên', 'HỌC SINH'),
        ('大学', 'だいがく', 'trường đại học', 'ĐẠI HỌC'),
        ('学校', 'がっこう', 'trường học', 'HỌC HIỆU'),
        ('学ぶ', 'まなぶ', 'học hỏi', 'HỌC'),
        ('留学', 'りゅうがく', 'du học', 'LƯU HỌC'),
        ('留学生', 'りゅうがくせい', 'du học sinh', 'LƯU HỌC SINH'),
        ('文学', 'ぶんがく', 'văn học', 'VĂN HỌC'),
        ('見学', 'けんがく', 'tham quan học tập', 'KIẾN HỌC')
    ],
    '校': [
        ('学校', 'がっこう', 'trường học', 'HỌC HIỆU'),
        ('小学校', 'しょうがっこう', 'trường tiểu học', 'TIỂU HỌC HIỆU'),
        ('中学校', 'ちゅうがっこう', 'trường trung học cơ sở', 'TRUNG HỌC HIỆU'),
        ('高校', 'こうこう', 'trường cấp 3, trung học phổ thông', 'CAO HIỆU'),
        ('校長', 'こうちょう', 'hiệu trưởng', 'HIỆU TRƯỞNG')
    ],
    '大': [
        ('大きい', 'おおきい', 'to lớn', 'ĐẠI'),
        ('大学', 'だいがく', 'trường đại học', 'ĐẠI HỌC'),
        ('大人', 'おとな', 'người lớn', 'ĐẠI NHÂN'),
        ('大変', 'たいへん', 'vất vả, nghiêm trọng', 'ĐẠI BIẾN'),
        ('大切', 'たいせつ', 'quan trọng, quý giá', 'ĐẠI THIẾT'),
        ('大会', 'たいかい', 'đại hội, cuộc thi lớn', 'ĐẠI HỘI'),
        ('大雨', 'おおあめ', 'mưa lớn', 'ĐẠI VŨ'),
        ('大好きな', 'だいすきな', 'rất thích', 'ĐẠI HẢO')
    ],
    '小': [
        ('小さい', 'ちいさい', 'nhỏ bé', 'TIỂU'),
        ('小学校', 'しょうがっこう', 'trường tiểu học', 'TIỂU HỌC HIỆU'),
        ('小川', 'おがわ', 'con suối nhỏ', 'TIỂU XUYÊN'),
        ('小説', 'しょうせつ', 'tiểu thuyết', 'TIỂU THUYẾT'),
        ('小鳥', 'ことり', 'chim non, chú chim nhỏ', 'TIỂU ĐIỂU')
    ],
    '高': [
        ('高い', 'たかい', 'cao, đắt tiền', 'CAO'),
        ('高校', 'こうこう', 'trường cấp 3', 'CAO HIỆU'),
        ('高校生', 'こうこうせい', 'học sinh cấp 3', 'CAO HIỆU SINH'),
        ('高速道路', 'こうそくどうろ', 'đường cao tốc', 'CAO TỐC ĐẠO LỘ'),
        ('最高', 'さいこう', 'cao nhất, tuyệt nhất', 'TỐI CAO')
    ],
    '白': [
        ('白い', 'しろい', 'màu trắng', 'BẠCH'),
        ('白', 'しろ', 'màu trắng', 'BẠCH'),
        ('白鳥', 'はくちょう', 'thiên nga trắng', 'BẠCH ĐIỂU'),
        ('面白い', 'おもしろい', 'thú vị, hay ho', 'DIỆN BẠCH'),
        ('白黒', 'しろくろ', 'đen trắng', 'BẠCH HẮC')
    ],
    '長': [
        ('長い', 'ながい', 'dài (thời gian, khoảng cách)', 'TRƯỜNG'),
        ('社長', 'しゃちょう', 'giám đốc công ty', 'XÃ TRƯỞNG'),
        ('校長', 'こうちょう', 'hiệu trưởng', 'HIỆU TRƯỞNG'),
        ('部長', 'ぶちょう', 'trưởng phòng', 'BỘ TRƯỞNG'),
        ('長男', 'ちょうなん', 'con trai cả', 'TRƯỞNG NAM'),
        ('長所', 'ちょうしょ', 'sở trường, điểm mạnh', 'TRƯỞNG SỞ')
    ],
    '休': [
        ('休む', 'やすむ', 'nghỉ ngơi, vắng mặt', 'HƯU'),
        ('休み', 'やすみ', 'ngày nghỉ, kỳ nghỉ', 'HƯU'),
        ('休日', 'きゅうじつ', 'ngày nghỉ lễ', 'HƯU NHẬT'),
        ('夏休み', 'なつやすみ', 'kỳ nghỉ hè', 'HẠ HƯU'),
        ('昼休み', 'ひるやすみ', 'nghỉ trưa', 'TRÚ HƯU'),
        ('休憩', 'きゅうけい', 'nghỉ giải lao ngắn', 'HƯU KHẾ')
    ],
    '山': [
        ('山', 'やま', 'ngọn núi', 'SƠN'),
        ('富士山', 'ふじさん', 'núi Phú Sĩ', 'PHÚ SĨ SƠN'),
        ('山登り', 'やまのぼり', 'leo núi', 'SƠN ĐĂNG'),
        ('火山', 'かざん', 'núi lửa', 'HOẢ SƠN'),
        ('山田', 'やまだ', 'họ Yamada', 'SƠN ĐIỀN')
    ],
    '川': [
        ('川', 'かわ', 'con sông', 'XUYÊN'),
        ('ナイル川', 'ナイルがわ', 'sông Nile', 'XUYÊN'),
        ('小川', 'おがわ', 'dòng suối nhỏ', 'TIỂU XUYÊN'),
        ('河川', 'かせん', 'sông ngòi', 'HÀ XUYÊN')
    ],
    '天': [
        ('天気', 'てんき', 'thời tiết', 'THIÊN KHÍ'),
        ('天国', 'てんごく', 'thiên đường', 'THIÊN QUỐC'),
        ('天井', 'てんじょう', 'trần nhà', 'THIÊN TỈNH'),
        ('天才', 'てんさい', 'thiên tài', 'THIÊN TÀI'),
        ('天ぷら', 'てんぷら', 'món tôm chiên Tempura', 'THIÊN')
    ],
    '気': [
        ('気', 'き', 'tâm trạng, không khí', 'KHÍ'),
        ('天気', 'てんき', 'thời tiết', 'THIÊN KHÍ'),
        ('元気', 'げんき', 'khoẻ mạnh, phấn khởi', 'NGUYÊN KHÍ'),
        ('気持ち', 'きもち', 'tâm trạng, cảm giác', 'KHÍ TRÌ'),
        ('気をつける', 'きをつける', 'cẩn thận, chú ý', 'KHÍ'),
        ('気分', 'きぶん', 'tâm trạng, thể trạng', 'KHÍ PHÂN'),
        ('電気', 'でんき', 'điện, đèn điện', 'ĐIỆN KHÍ'),
        ('空気', 'くうき', 'không khí', 'KHÔNG KHÍ')
    ],
    '雨': [
        ('雨', 'あめ', 'cơn mưa', 'VŨ'),
        ('大雨', 'おおあめ', 'mưa to, mưa lớn', 'ĐẠI VŨ'),
        ('雨期', 'うき', 'mùa mưa', 'VŨ KỲ'),
        ('雨具', 'あまぐ', 'áo mưa, đồ đi mưa', 'VŨ CỤ')
    ],
    '行': [
        ('行く', 'いく', 'đi', 'HÀNH'),
        ('旅行', 'りょこう', 'du lịch', 'LỮ HÀNH'),
        ('銀行', 'ぎんこう', 'ngân hàng', 'NGÂN HÀNH'),
        ('行動', 'こうどう', 'hành động', 'HÀNH ĐỘNG'),
        ('行う', 'おこなう', 'tổ chức, tiến hành', 'HÀNH')
    ],
    '来': [
        ('来る', 'くる', 'đến, tới', 'LAI'),
        ('来週', 'らいしゅう', 'tuần sau', 'LAI CHU'),
        ('来月', 'らいげつ', 'tháng sau', 'LAI NGUYỆT'),
        ('来年', 'らいねん', 'năm sau', 'LAI NIÊN'),
        ('将来', 'しょうらい', 'tương lai', 'TƯƠNG LAI'),
        ('未来', 'みらい', 'tương lai xa', 'VỊ LAI')
    ],
    '出': [
        ('出る', 'でる', 'ra ngoài, xuất hiện', 'XUẤT'),
        ('出す', 'だす', 'lấy ra, nộp', 'XUẤT'),
        ('出口', 'でぐち', 'cửa ra', 'XUẤT KHẨU'),
        ('出発', 'しゅっぱつ', 'xuất phát, khởi hành', 'XUẤT PHÁT'),
        ('出席', 'しゅっせき', 'có mặt, tham dự', 'XUẤT TỊCH'),
        ('出張', 'しゅっちょう', 'đi công tác', 'XUẤT TRƯƠNG')
    ],
    '入': [
        ('入る', 'はいる', 'vào, đi vào', 'NHẬP'),
        ('入れる', 'いれる', 'cho vào, bỏ vào', 'NHẬP'),
        ('入口', 'いりぐち', 'lối vào, cửa vào', 'NHẬP KHẨU'),
        ('入学', 'にゅうがく', 'nhập học', 'NHẬP HỌC'),
        ('入院', 'にゅういん', 'nhập viện', 'NHẬP VIỆN'),
        ('輸入', 'ゆにゅう', 'nhập khẩu', 'THÂU NHẬP')
    ],
    '車': [
        ('車', 'くるま', 'xe ô tô, xe cộ', 'XA'),
        ('電車', 'でんしゃ', 'tàu điện', 'ĐIỆN XA'),
        ('自転車', 'じてんしゃ', 'xe đạp', 'TỰ CHUYỂN XA'),
        ('自動車', 'じどうしゃ', 'xe ô tô hơi', 'TỰ ĐỘNG XA'),
        ('車道', 'しゃどう', 'lòng đường xe chạy', 'XA ĐẠO'),
        ('駐車場', 'ちゅうしゃじょう', 'bãi đỗ xe', 'TRÚ XA TRƯỜNG')
    ],
    '食': [
        ('食べる', 'たべる', 'ăn', 'THỰC'),
        ('食べ物', 'たべもの', 'thức ăn, đồ ăn', 'THỰC VẬT'),
        ('食事', 'しょくじ', 'bữa ăn', 'THỰC SỰ'),
        ('食堂', 'しょくどう', 'nhà ăn', 'THỰC ĐƯỜNG'),
        ('朝食', 'ちょうしょく', 'bữa sáng', 'TRIÊU THỰC'),
        ('昼食', 'ちゅうしょく', 'bữa trưa', 'TRÚ THỰC'),
        ('夕食', 'ゆうしょく', 'bữa tối', 'TỊCH THỰC'),
        ('食料品', 'しょくりょうひん', 'thực phẩm', 'THỰC LIỆU PHẨM')
    ],
    '見': [
        ('見る', 'みる', 'nhìn, xem', 'KIẾN'),
        ('見える', 'みえる', 'nhìn thấy, trông thấy', 'KIẾN'),
        ('見せる', 'みせる', 'cho xem, khoe', 'KIẾN'),
        ('意見', 'いけん', 'ý kiến', 'Ý KIẾN'),
        ('見学', 'けんがく', 'tham quan học tập', 'KIẾN HỌC'),
        ('花見', 'はなみ', 'ngắm hoa anh đào', 'HOA KIẾN')
    ],
    '聞': [
        ('聞く', 'きく', 'nghe, hỏi', 'VĂN'),
        ('聞こえる', 'きこえる', 'nghe thấy', 'VĂN'),
        ('新聞', 'しんぶん', 'báo chí', 'TÂN VĂN')
    ],
    '読': [
        ('読む', 'よむ', 'đọc', 'ĐỘC'),
        ('読書', 'どくしょ', 'đọc sách', 'ĐỘC THƯ'),
        ('読者', 'どくしゃ', 'độc giả, bạn đọc', 'ĐỘC GIẢ')
    ],
    '書': [
        ('書く', 'かく', 'viết, vẽ', 'THƯ'),
        ('辞書', 'じしょ', 'từ điển', 'TỪ THƯ'),
        ('図書館', 'としょかん', 'thư viện', 'ĐỒ THƯ QUÁN'),
        ('教科書', 'きょうかしょ', 'sách giáo khoa', 'GIÁO KHOA THƯ'),
        ('読書', 'どくしょ', 'đọc sách', 'ĐỘC THƯ'),
        ('葉書', 'はがき', 'bưu thiếp', 'DIỆP THƯ')
    ],
    '話': [
        ('話す', 'はなす', 'nói chuyện', 'THOẠI'),
        ('話', 'はなし', 'câu chuyện, cuộc trò chuyện', 'THOẠI'),
        ('電話', 'でんわ', 'điện thoại', 'ĐIỆN THOẠI'),
        ('会話', 'かいわ', 'hội thoại', 'HỘI THOẠI'),
        ('世話', 'せわ', 'chăm sóc, giúp đỡ', 'THẾ THOẠI')
    ],
    '語': [
        ('語', 'ご', 'ngôn ngữ, tiếng', 'NGỮ'),
        ('日本語', 'にほんご', 'tiếng Nhật', 'NHẬT BẢN NGỮ'),
        ('英語', 'えいご', 'tiếng Anh', 'ANH NGỮ'),
        ('外国語', 'がいこくご', 'tiếng nước ngoài', 'NGOẠI QUỐC NGỮ'),
        ('単語', 'たんご', 'từ vựng', 'ĐƠN NGỮ'),
        ('言語', 'げんご', 'ngôn ngữ', 'NGÔN NGỮ')
    ],
    '電': [
        ('電気', 'でんき', 'điện, đèn điện', 'ĐIỆN KHÍ'),
        ('電車', 'でんしゃ', 'tàu điện', 'ĐIỆN XA'),
        ('電話', 'でんわ', 'điện thoại', 'ĐIỆN THOẠI'),
        ('電子', 'でんし', 'điện tử', 'ĐIỆN TỬ'),
        ('電力', 'でんりょく', 'điện lực, năng lượng điện', 'ĐIỆN LỰC')
    ],
    '何': [
        ('何', 'なに', 'cái gì', 'HÀ'),
        ('何時', 'なんじ', 'mấy giờ', 'HÀ THỜI'),
        ('何人', 'なんにん', 'mấy người', 'HÀ NHÂN'),
        ('何曜日', 'なんようび', 'thứ mấy', 'HÀ DIỆU NHẬT'),
        ('何年', 'なんねん', 'năm mấy', 'HÀ NIÊN'),
        ('何か', 'なにか', 'cái gì đó', 'HÀ')
    ]
}

# 1. Cập nhật n5.json
with open('src/data/kanji/n5.json', 'r', encoding='utf-8') as f:
    n5 = json.load(f)

for item in n5:
    char = item['kanji']
    compounds = N5_COMPOUNDS.get(char, [])
    examples = []
    for word, reading, meaning, hv in compounds:
        examples.append({
            'word': word,
            'reading': reading,
            'meaning': meaning,
            'hanviet': hv,
            'level': 'N5'
        })
    item['examples'] = examples

with open('src/data/kanji/n5.json', 'w', encoding='utf-8') as f:
    json.dump(n5, f, ensure_ascii=False, indent=2)

print(f"Đã cập nhật từ vựng ghép cho {len(n5)} chữ Kanji N5!")

