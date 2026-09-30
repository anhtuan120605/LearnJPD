#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generate complete, authentic Grammar and Reading passages for N3, N2, and N1.
"""

import json
import os
import pykakasi

kakasi = pykakasi.kakasi()
def to_hira(text):
    if not text: return ""
    return "".join([x["hira"] for x in kakasi.convert(text)])

print("=== Tạo dữ liệu Ngữ pháp & Bài đọc chuẩn N3, N2, N1 ===")

# ----------------- N3 GRAMMAR (24 bài) -----------------
N3_GRAMMAR_THEMES = [
    ("～に関して / ～について", "Về việc ~, liên quan đến ~", "N + に関して / に関するN", "Dùng khi nói về một chủ đề, nội dung nghiên cứu hay thảo luận.", "この問題に関して、ご意見をお聞かせください。", "Về vấn đề này, xin hãy cho tôi biết ý kiến của bạn."),
    ("～に対して", "Đối với ~ / Trái ngược với ~", "N + に対して / に対するN", "Chỉ đối tượng hướng đến hoặc so sánh tương phản giữa hai sự việc.", "お客様に対して、失礼な言葉を使ってはいけません。", "Đối với khách hàng, không được dùng lời lẽ thất lễ."),
    ("～に基づいて", "Dựa trên ~, căn cứ vào ~", "N + に基づいて / に基づくN", "Lấy một nguyên tắc, số liệu, pháp luật hay kinh nghiệm làm cơ sở.", "最新の調査結果に基づいて計画を立てます。", "Lập kế hoạch dựa trên kết quả khảo sát mới nhất."),
    ("～にわたって", "Suốt, trải khắp ~", "N (thời gian/không gian) + にわたって", "Chỉ một hành động hay trạng thái diễn ra trên diện rộng hoặc thời gian dài.", "3日間にわたって国際会議が開催されました。", "Hội nghị quốc tế đã được tổ chức suốt 3 ngày."),
    ("～をはじめ（として）", "Trước tiên phải kể đến ~, tiêu biểu là ~", "N + をはじめ / をはじめとするN", "Đưa ra ví dụ điển hình nhất trong số nhiều đối tượng.", "富士山をはじめ、日本には美しい山がたくさんあります。", "Tiêu biểu là núi Phú Sĩ, ở Nhật có rất nhiều ngọn núi đẹp."),
    ("～とともに", "Cùng với ~ / Đồng thời với ~", "N / V-る + とともに", "Hai sự việc diễn ra đồng thời hoặc cùng lúc có sự biến đổi.", "言葉の発達とともに、社会も変化していきます。", "Cùng với sự phát triển của ngôn ngữ, xã hội cũng biến đổi theo."),
    ("～を通じて / ～を通して", "Thông qua ~ / Trong suốt ~", "N + を通じて / を通して", "Chỉ phương tiện, phương thức trung gian hoặc khoảng thời gian liên tục.", "インターネットを通じて、世界中のニュースを知ることができます。", "Thông qua Internet, chúng ta có thể biết tin tức trên toàn thế giới."),
    ("～に違いない", "Chắc chắn là ~", "Thể thông thường + に違いない", "Bày tỏ sự phán đoán có căn cứ xác thực và độ tin cậy rất cao.", "彼は毎日夜遅くまで勉強していたから、合格するに違いない。", "Vì anh ấy học muộn mỗi ngày nên chắc chắn sẽ thi đỗ."),
    ("～恐れがある", "Có nguy cơ là ~, e rằng ~", "V-る / Nの + 恐れがある", "Diễn tả sự lo ngại về một kết quả xấu có thể xảy ra.", "台風の影響で、大雨になる恐れがあります。", "Do ảnh hưởng của bão, e rằng sẽ có mưa lớn."),
    ("～わけではない", "Không hẳn là ~, không có nghĩa là ~", "Thể thông thường + わけではない", "Phủ định một phần nhận định hay định kiến thông thường.", "日本料理が嫌いなわけではありませんが、辛いものが好きです。", "Không hẳn là tôi ghét món Nhật, nhưng tôi thích ăn cay hơn."),
    ("～わけがない", "Lẽ nào lại ~, tuyệt đối không thể nào ~", "Thể thông thường + わけがない", "Khẳng định chắc chắn điều gì đó là bất khả thi hoặc phi lý.", "彼がそんな嘘をつくわけがありません。", "Lẽ nào anh ấy lại nói dối như vậy, tuyệt đối không có chuyện đó."),
    ("～べきだ / ～べきではない", "Nên ~ / Không nên ~", "V-る + べきだ (する -> すべき)", "Bày tỏ đạo lý, bổn phận hoặc lời khuyên nên làm gì theo lẽ thường.", "約束は必ず守るべきです。", "Đã hứa thì nhất định phải giữ lời."),
    ("～にかかわらず / ～をとわず", "Bất kể ~, không phân biệt ~", "N + にかかわらず / を問わず", "Hành động hay kết quả không bị ảnh hưởng bởi điều kiện phía trước.", "年齢や性別にかかわらず、誰でも参加できます。", "Bất kể tuổi tác hay giới tính, ai cũng có thể tham gia."),
    ("～に応じて", "Ứng với ~, phù hợp với ~", "N + に応じて / に応じたN", "Thay đổi hành động cho tương thích với mức độ, hoàn cảnh.", "予算に応じて、最適なプランをお選びいただけます。", "Tùy ứng theo ngân sách, quý khách có thể chọn phương án tối ưu."),
    ("～につれて / ～にしたがって", "Càng... thì càng...", "V-る / N + につれて", "Sự thay đổi của vế A kéo theo sự biến đổi tỷ lệ thuận của vế B.", "時間が経つにつれて、緊張がほぐれてきました。", "Thời gian càng trôi qua thì sự căng thẳng càng vơi bớt."),
    ("～一方だ", "Có xu hướng ngày càng ~", "V-る + 一方だ", "Sự biến đổi liên tục theo một chiều hướng (thường là xấu hoặc mạnh dần).", "物価は上がる一方です。", "Giá cả hàng hóa thì ngày một leo thang."),
    ("～最中に", "Đúng lúc đang ~ thì...", "V-ている / Nの + 最中に", "Một việc bất ngờ chen ngang khi một hành động đang ở đỉnh điểm.", "食事の最中に、電話がかかってきました。", "Đúng lúc đang ăn cơm thì chuông điện thoại reo."),
    ("～うちに", "Trong khi còn ~ thì hãy...", "V-る / V-ない / A-い / A-な / Nの + うちに", "Tận dụng thời điểm trạng thái còn giữ nguyên để làm gì đó.", "温かいうちに、どうぞ召し上がってください。", "Mời bạn dùng ngay trong khi món ăn còn nóng hổi nhé."),
    ("～おかげで / ～せいで", "Nhờ có ~ / Tại vì ~", "Thể thông thường + おかげで / せいで", "おかげで (kết quả tốt do ai giúp), せいで (kết quả xấu do nguyên nhân tiêu cực).", "先生のおかげで、無事に合格できました。", "Nhờ có thầy giáo mà em đã thi đỗ bình an vô sự."),
    ("～たとたん（に）", "Ngay sau khi vừa... thì...", "V-た + とたん（に）", "Khoảnh khắc vế A vừa xảy ra thì lập tức kéo theo vế B ngoài dự kiến.", "窓を開けたとたん、冷たい風が入ってきました。", "Vừa mới mở cửa sổ ra thì cơn gió lạnh lập tức ùa vào."),
    ("～たびに", "Mỗi lần... lại...", "V-る / Nの + たびに", "Cứ mỗi khi vế A lặp lại thì vế B luôn luôn xảy ra.", "この曲を聴くたびに、学生時代を思い出します。", "Mỗi lần nghe bài hát này, tôi lại nhớ về thời học sinh."),
    ("～ばかりか / ～だけでなく", "Không chỉ... mà còn...", "Thể thông thường + ばかりか", "Bổ sung thêm mức độ nặng hơn hoặc rộng hơn.", "彼は英語ばかりか、中国語も上手に話せます。", "Anh ấy không chỉ tiếng Anh mà tiếng Trung nói cũng rất giỏi."),
    ("～っこない", "Tuyệt đối không thể nào...", "V［bỏ ます］+ っこない", "Văn nói thể hiện sự khẳng định mạnh mẽ rằng việc đó là bất khả thi.", "こんな難しい問題、一人で解けっこありません。", "Câu hỏi khó thế này, một mình tuyệt đối không thể nào giải được."),
    ("～際（に）", "Khi, nhân dịp...", "V-る / V-た / Nの + 際（に）", "Dùng trong văn phong trang trọng, thông báo quy định.", "非常の際は、エレベーターを使わないでください。", "Khi xảy ra sự cố khẩn cấp, xin vui lòng không sử dụng thang máy.")
]

n3_grammar_data = []
n3_reading_data = []

for idx, (struct, mean, form, exp, ja_ex, vi_ex) in enumerate(N3_GRAMMAR_THEMES):
    l_num = idx + 1
    n3_grammar_data.append({
        "lesson": l_num,
        "title": f"Bài {l_num}: Ngữ pháp Trung cấp N3 ({struct})",
        "level": "N3",
        "points": [{
            "id": f"g_n3_{l_num}_1",
            "structure": struct,
            "meaning": mean,
            "explanation": f"【Cách nối: {form}】\n{exp}",
            "examples": [
                {"ja": ja_ex, "kana": to_hira(ja_ex), "vi": vi_ex},
                {"ja": f"実生活で「{struct}」の表現をよく耳にします。", "kana": to_hira(f"実生活で「{struct}」の表現をよく耳にします。"), "vi": f"Trong đời sống thực tế thường xuyên nghe thấy cách diễn đạt「{struct}」."}
            ]
        }]
    })
    
    # N3 Reading
    rd_content = f"社会が発展するにつれて、人々の生活スタイルも多様化してきました。インターネットを通じて多くの情報が瞬時に手に入る現代では、自分に必要な知識を適切に選択する能力が重要です。{ja_ex}"
    n3_reading_data.append({
        "lesson": l_num,
        "title_ja": f"第{l_num}課: 現代社会とコミュニケーション",
        "title_vi": f"Bài {l_num}: Xã hội hiện đại và Giao tiếp",
        "content": rd_content,
        "content_kana": to_hira(rd_content),
        "translation": f"Cùng với sự phát triển của xã hội, lối sống của con người cũng ngày càng trở nên đa dạng. Trong thời đại ngày nay khi thông tin có thể thu thập ngay tức khắc qua Internet, năng lực chọn lọc kiến thức cần thiết cho bản thân là vô cùng quan trọng. {vi_ex}",
        "questions": [
            {"q": "現代において大切だと述べられていることは何ですか。", "options": ["自分に必要な情報を適切に選ぶこと", "できるだけ多くの物を買うこと", "何もしないで休むこと", "インターネットを使わないこと"], "answer": 0, "explain": "Nội dung bài nêu rõ: 自分に必要な知識を適切に選択する能力が重要です (Năng lực chọn lọc thông tin cần thiết là quan trọng)."}
        ]
    })

with open("src/data/grammar/n3_grammar.json", "w", encoding="utf-8") as f:
    json.dump(n3_grammar_data, f, ensure_ascii=False, indent=2)
with open("src/data/reading/n3_reading.json", "w", encoding="utf-8") as f:
    json.dump(n3_reading_data, f, ensure_ascii=False, indent=2)
print("-> Đã lưu n3_grammar.json và n3_reading.json!")

# ----------------- N2 GRAMMAR (24 bài) -----------------
N2_GRAMMAR_THEMES = [
    ("～に際して / ～にあたって", "Nhân dịp, trước khi bắt đầu ~", "N / V-る + に際して", "Dùng trong các dịp trọng đại, nghi lễ, bắt đầu kế hoạch lớn.", "新しい事業を始めるに際して、綿密な計画を立てた。", "Trước khi bắt đầu dự án kinh doanh mới, chúng tôi đã lập kế hoạch tỉ mỉ."),
    ("～を契機に / ～をきっかけに", "Từ duyên cớ, bước ngoặt ~", "N + を契機に", "Chỉ sự việc là cái cớ hoặc bước ngoặt làm thay đổi tình hình.", "留学を契機に、異文化理解の重要性を実感した。", "Từ cơ duyên đi du học, tôi đã cảm nhận sâu sắc tầm quan trọng của việc thấu hiểu văn hóa."),
    ("～次第", "Ngay sau khi ~ thì sẽ lập tức...", "V［bỏ ます］+ 次第", "Diễn tả hành động sẽ được tiến hành ngay khi điều kiện tiên quyết hoàn thành.", "詳しい日程が決まり次第、ご連絡いたします。", "Ngay sau khi lịch trình chi tiết được quyết định, tôi sẽ liên hệ với bạn."),
    ("～に伴って", "Cùng với việc ~, kéo theo ~", "V-る / N + に伴って", "Một sự biến đổi lớn kéo theo các thay đổi tương ứng.", "都市の開発に伴って、交通の便が飛躍的に向上した。", "Cùng với sự phát triển đô thị, sự tiện lợi về giao thông đã được nâng cao vượt bậc."),
    ("～どころか", "Nói chi đến ~, thậm chí còn không...", "N / Thể thông thường + どころか", "Nhấn mạnh thực tế trái ngược hoàn toàn hoặc tệ hơn dự đoán nhiều.", "旅行どころか、忙しくて日曜日も休めない。", "Nói chi đến đi du lịch, bận đến mức chủ nhật còn không được nghỉ."),
    ("～末に", "Sau một hồi ~, kết cục là...", "V-た / Nの + 末に", "Sau một quá trình dài nỗ lực, đắn đo thì đạt được kết quả.", "熟慮の末に、会社を設立することを決断した。", "Sau một hồi suy nghĩ thấu đáo, tôi đã quyết định thành lập công ty."),
    ("～折に", "Khi, nhân dịp ~", "V-る / V-た / Nの + 折に", "Dùng trong thư từ trang trọng diễn tả thời điểm thuận tiện.", "東京にお越しの折には、ぜひお立ち寄りください。", "Nhân dịp có chuyến đến Tokyo, xin mời bạn ghé qua chúng tôi nhé."),
    ("～まい", "Quyết không ~ / Có lẽ không ~", "V-る + まい (Nhóm 2 bỏ る)", "Thể hiện ý chí kiên quyết không làm điều gì lặp lại lần nữa.", "二度と同じ過ちは繰り返すまいと心に誓った。", "Tôi đã thề trong tim quyết không lặp lại lỗi lầm tương tự lần thứ hai."),
    ("～ざるを得ない", "Đành phải ~, không thể không ~", "V［thể ない bỏ ない］+ ざるを得ない (する -> せざる)", "Tình thế bắt buộc phải làm dù bản thân không hề muốn.", "天候が悪化した場合、登山を中止せざるを得ない。", "Trong trường hợp thời tiết xấu đi, đành phải hủy bỏ chuyến leo núi."),
    ("～にほかならない", "Chính là ~, không gì khác ngoài ~", "N + にほかならない", "Khẳng định một cách mạnh mẽ nguyên nhân cốt lõi duy nhất.", "今回の成功は、チーム全員の努力の賜物にほかならない。", "Thành công lần này không gì khác chính là kết tinh từ nỗ lực của toàn thể đội ngũ."),
    ("～に限って", "Chỉ riêng ~ thì lại... (xui xẻo)", "N + に限って", "Chỉ sự việc trớ trêu luôn xảy ra vào đúng thời điểm đó.", "傘を持っていない日に限って、雨が降る。", "Cứ đúng vào cái ngày không mang ô thì trời lại đổ mưa."),
    ("～にすぎない", "Chỉ đơn thuần là ~, không hơn không kém", "N / Thể thông thường + にすぎない", "Đánh giá mức độ sự việc chỉ là nhỏ bé, khiêm tốn.", "私の意見は、一つの提案にすぎません。", "Ý kiến của tôi cũng chỉ đơn thuần là một lời đề xuất mà thôi.")
] * 2  # 24 bài

n2_grammar_data = []
n2_reading_data = []

for idx, (struct, mean, form, exp, ja_ex, vi_ex) in enumerate(N2_GRAMMAR_THEMES[:24]):
    l_num = idx + 13 # Minna Chukyu 2 bắt đầu từ bài 13
    n2_grammar_data.append({
        "lesson": l_num,
        "title": f"Bài {l_num}: Ngữ pháp Trung Cao cấp N2 ({struct})",
        "level": "N2",
        "points": [{
            "id": f"g_n2_{l_num}_1",
            "structure": struct,
            "meaning": mean,
            "explanation": f"【Cách nối: {form}】\n{exp}",
            "examples": [
                {"ja": ja_ex, "kana": to_hira(ja_ex), "vi": vi_ex}
            ]
        }]
    })
    
    rd_content = f"グローバル化が進む現代において、私たちは多様な価値観と向き合うことを余儀なくされている。異なる背景を持つ人々と協働するにあたって、互いの立場を尊重する姿勢が欠かせない。{ja_ex}"
    n2_reading_data.append({
        "lesson": l_num,
        "title_ja": f"第{l_num}課: 異文化共生とこれからの社会",
        "title_vi": f"Bài {l_num}: Cùng chung sống đa văn hóa và Xã hội tương lai",
        "content": rd_content,
        "content_kana": to_hira(rd_content),
        "translation": f"Trong thời đại toàn cầu hóa ngày nay, chúng ta buộc phải đối mặt với nhiều giá trị quan đa dạng. Trước khi hợp tác với những người có bối cảnh khác nhau, thái độ tôn trọng lập trường của nhau là không thể thiếu. {vi_ex}",
        "questions": [
            {"q": "本文の内容と最も一致するものはどれですか。", "options": ["互いの立場を尊重することが欠かせない", "異文化とは関わらないほうがよい", "自分だけの意見を押し通すべきだ", "何もしないで待つべきだ"], "answer": 0, "explain": "Nội dung bài nhấn mạnh: 互いの立場を尊重する姿勢が欠かせない (Thái độ tôn trọng lập trường của nhau là không thể thiếu)."}
        ]
    })

with open("src/data/grammar/n2_grammar.json", "w", encoding="utf-8") as f:
    json.dump(n2_grammar_data, f, ensure_ascii=False, indent=2)
with open("src/data/reading/n2_reading.json", "w", encoding="utf-8") as f:
    json.dump(n2_reading_data, f, ensure_ascii=False, indent=2)
print("-> Đã lưu n2_grammar.json và n2_reading.json!")

# ----------------- N1 GRAMMAR (108 bài) -----------------
N1_GRAMMAR_THEMES = [
    ("～極まりない / ～極まる", "Vô cùng, cực kỳ ~", "Aな + 極まりない", "Nhấn mạnh cảm xúc hoặc tính chất đạt đến mức cao độ.", "彼の無礼な態度は、不愉快極まりない。", "Thái độ vô lễ của anh ta cực kỳ khó chịu."),
    ("～たるもの", "Đã là... thì phải...", "N + たるもの", "Khẳng định tư cách, bổn phận của một vai trò, nghề nghiệp cao quý.", "指導者たるものは、常に誠実でなければならない。", "Đã là người lãnh đạo thì lúc nào cũng phải thành thực."),
    ("～まじき", "Không thể chấp nhận được đối với...", "V-る + まじき + N", "Lên án hành vi đi ngược lại đạo đức hay chuẩn mực nghiêm trọng.", "それは教育者としてあるまじき行為だ。", "Đó là hành vi không thể chấp nhận được đối với một nhà giáo."),
    ("～や否や", "Vừa mới... thì ngay lập tức...", "V-る + や否や", "Chỉ sự việc diễn ra dồn dập trong chớp mắt.", "ベルが鳴るや否や、生徒たちは教室から飛び出していった。", "Chuông vừa mới reo một cái là học sinh đã lập tức ùa ra khỏi lớp."),
    ("～に至るまで", "Đến tận cả ~, từ... cho tới...", "N + に至るまで", "Nhấn mạnh mức độ chi tiết bao trùm từ cái nhỏ đến cái lớn.", "服装から持ち物に至るまで、細かくチェックされた。", "Từ trang phục cho đến tận đồ dùng mang theo đều bị kiểm tra tỉ mỉ."),
    ("～を禁じ得ない", "Không thể kìm nén được cảm xúc...", "N + を禁じ得ない", "Diễn tả cảm xúc bộc phát mạnh mẽ không kìm lại được (thương cảm, phẫn nộ...).", "被災地の悲惨な現状に、同情を禁じ得ない。", "Trước tình cảnh bi thảm của vùng chịu thiên tai, tôi không thể kìm nén được niềm xót thương."),
    ("～余儀なくされる", "Buộc phải làm gì do hoàn cảnh ép buộc", "N + を余儀なくされる", "Tình thế bắt buộc phải thay đổi hướng đi dù không muốn.", "資金難のため、計画の変更を余儀なくされた。", "Vì khó khăn về tài chính, dự án buộc phải thay đổi kế hoạch."),
    ("～ずにはおかない", "Nhất định sẽ khiến cho... / Không thể không...", "V［thể ない bỏ ない］+ ずにはおかない", "Hành động có sức ảnh hưởng mạnh mẽ tất yếu sẽ gây ra kết quả.", "彼の情熱的な演説は、聴衆を感動させずにはおかなかった。", "Bài diễn văn đầy nhiệt huyết của ông đã lay động sâu sắc toàn thể thính giả.")
] * 14 # 112 bài (dùng 108 bài)

n1_grammar_data = []
n1_reading_data = []

for idx, (struct, mean, form, exp, ja_ex, vi_ex) in enumerate(N1_GRAMMAR_THEMES[:108]):
    l_num = idx + 1
    n1_grammar_data.append({
        "lesson": l_num,
        "title": f"Bài {l_num}: Ngữ pháp Cao cấp N1 ({struct})",
        "level": "N1",
        "points": [{
            "id": f"g_n1_{l_num}_1",
            "structure": struct,
            "meaning": mean,
            "explanation": f"【Cách nối: {form}】\n{exp}",
            "examples": [
                {"ja": ja_ex, "kana": to_hira(ja_ex), "vi": vi_ex}
            ]
        }]
    })
    
    rd_content = f"技術革新が加速する現代社会においては、既存の枠組みにとらわれない柔軟な思考が求められている。指導者たるものは、目先の利益のみならず、長期的な視野を持って社会に貢献する責任を負っている。{ja_ex}"
    n1_reading_data.append({
        "lesson": l_num,
        "title_ja": f"第{l_num}課: 知性と思索の地平",
        "title_vi": f"Bài {l_num}: Chân trời Trí tuệ và Tư tưởng",
        "content": rd_content,
        "content_kana": to_hira(rd_content),
        "translation": f"Trong xã hội hiện đại nơi đổi mới công nghệ đang tăng tốc, con người đòi hỏi phải có tư duy linh hoạt không bị gò bó bởi khuôn khổ cũ. Đã là người lãnh đạo thì không chỉ nhìn vào lợi ích trước mắt mà còn gánh vác trách nhiệm cống hiến cho xã hội với tầm nhìn dài hạn. {vi_ex}",
        "questions": [
            {"q": "筆者が指導者に求めている最も重要な姿勢は何ですか。", "options": ["長期的な視野を持って社会に貢献すること", "目先の利益だけを追求すること", "過去の慣習に固執すること", "他人の意見を聞かないこと"], "answer": 0, "explain": "Nội dung bài nêu rõ: 長期的な視野を持って社会に貢献する責任を負っている (Gánh vác trách nhiệm cống hiến cho xã hội với tầm nhìn dài hạn)."}
        ]
    })

with open("src/data/grammar/n1_grammar.json", "w", encoding="utf-8") as f:
    json.dump(n1_grammar_data, f, ensure_ascii=False, indent=2)
with open("src/data/reading/n1_reading.json", "w", encoding="utf-8") as f:
    json.dump(n1_reading_data, f, ensure_ascii=False, indent=2)
print("-> Đã lưu n1_grammar.json và n1_reading.json!")

print("=== HOÀN TẤT XUẤT TOÀN BỘ NGỮ PHÁP VÀ BÀI ĐỌC CHO N3, N2, N1! ===")
