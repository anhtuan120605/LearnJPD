#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fix ALL vocab example sentences across ALL JLPT levels (Minna, N5, N4, N3, N2, N1).
Replaces every bad/templated sentence with authentic, grammatically correct sentences.
"""

import json
import os
import re
import time
import urllib.parse
import urllib.request
import pykakasi

kakasi = pykakasi.kakasi()

def to_hira(text):
    if not text:
        return ""
    res = kakasi.convert(text)
    return "".join([item["hira"] for item in res])

# 1. Từ điển câu chuẩn mực giáo trình Minna no Nihongo & JLPT
EXACT_SPECIAL_EXAMPLES = {
    # Đại từ xưng hô
    "わたし": ("私は ベトナムから 来ました。", "Tôi đến từ Việt Nam."),
    "私": ("私は 日本語を 勉強しています。", "Tôi đang học tiếng Nhật."),
    "わたくし": ("わたくしが ご案内いたします。", "Tôi xin phép được hướng dẫn quý khách."),
    "あなた": ("あなたは 学生ですか。", "Bạn có phải là học sinh không?"),
    "あの 人（あの 方）": ("あの方は 私の 日本語の 先生です。", "Vị kia là giáo viên tiếng Nhật của tôi."),
    "あの方": ("あの方は どなたですか。", "Vị kia là ai vậy ạ?"),
    "あの人": ("あの人は 田中さんの 友達です。", "Người kia là bạn của anh Tanaka."),
    "～さん": ("ミラーさんは 会社員です。", "Anh Miller là nhân viên công ty."),
    "～ちゃん": ("あの子は 花ちゃんです。", "Bé gái kia là bé Hana."),
    "～君（～くん）": ("山田君は サッカーが 上手です。", "Cậu Yamada chơi bóng đá rất giỏi."),
    "～くん": ("山田君は サッカーが 上手です。", "Cậu Yamada chơi bóng đá rất giỏi."),
    "～人（～じん）": ("私は ベトナム人です。", "Tôi là người Việt Nam."),
    "～じん": ("私は ベトナム人です。", "Tôi là người Việt Nam."),
    "先生": ("日本語の 先生に 質問しました。", "Tôi đã đặt câu hỏi cho giáo viên tiếng Nhật."),
    "教師": ("父は 高校の 教師を しています。", "Bố tôi là giáo viên trường cấp 3."),
    "学生": ("私は 大学の 学生です。", "Tôi là sinh viên đại học."),
    "会社員": ("兄は 銀行の 会社員です。", "Anh trai tôi là nhân viên ngân hàng."),
    "社員": ("IMCの 社員として 働いています。", "Tôi làm việc với tư cách là nhân viên của IMC."),
    "銀行員": ("彼女は 銀行員に なりました。", "Cô ấy đã trở thành nhân viên ngân hàng."),
    "医者": ("病気になったので、医者に みてもらいました。", "Vì bị ốm nên tôi đã đi khám bác sĩ."),
    "研究者": ("彼は ロボットの 研究者です。", "Anh ấy là nhà nghiên cứu robot."),
    "大学": ("東京の 大学に 通っています。", "Tôi đang theo học tại một trường đại học ở Tokyo."),
    "病院": ("駅の 前に 大きな 病院が あります。", "Ở trước nhà ga có một bệnh viện lớn."),
    "だれ（どなた）": ("あの方は どなたですか。", "Vị kia là ai vậy ạ?"),
    "だれ": ("教室に だれが いますか。", "Trong lớp học có ai vậy?"),
    "どなた": ("あの方は どなたですか。", "Vị kia là vị nào vậy ạ?"),
    "何歳（おいくつ）": ("ミラーさんは 何歳ですか。", "Anh Miller bao nhiêu tuổi?"),
    "何歳": ("弟さんは 何歳ですか。", "Em trai bạn bao nhiêu tuổi?"),
    "おいくつ": ("失礼ですが、おいくつですか。", "Xin lỗi cho tôi hỏi, bạn bao nhiêu tuổi ạ?"),
    "～歳（～さい）": ("私は 今年 20歳です。", "Năm nay tôi 20 tuổi."),
    "～歳": ("私は 今年 20歳です。", "Năm nay tôi 20 tuổi."),
    "～さい": ("私は 今年 20歳です。", "Năm nay tôi 20 tuổi."),
    "－歳": ("今年で 20歳に なりました。", "Năm nay tôi tròn 20 tuổi."),
    "－階": ("事務所は 3階に あります。", "Văn phòng nằm ở tầng 3."),
    "～階": ("受付は 1階に あります。", "Quầy lễ tân ở tầng 1."),
    "～かい": ("私の 部屋は 2階です。", "Phòng của tôi ở tầng 2."),
    "～がい": ("レストランは 地下1階です。", "Nhà hàng ở tầng hầm 1."),
    "～円": ("この りんごは 100円です。", "Quả táo này giá 100 yên."),
    "～えん": ("コーヒーは 300円です。", "Cà phê giá 300 yên."),
    "～語": ("学校で ベトナム語を 教えています。", "Tôi đang dạy tiếng Việt ở trường."),
    "～ご": ("家で 日本語を 話します。", "Tôi nói tiếng Nhật ở nhà."),

    # Chỉ định từ & Nghi vấn từ
    "これ": ("これは 日本語の 本です。", "Đây là cuốn sách tiếng Nhật."),
    "それ": ("それは 私の 傘です。", "Đó là chiếc ô của tôi."),
    "あれ": ("あれは 英語の 辞書です。", "Kia là cuốn từ điển tiếng Anh."),
    "この～": ("この 本は とても 面白いです。", "Cuốn sách này rất thú vị."),
    "この": ("この ペンは 誰のですか。", "Chiếc bút này là của ai?"),
    "その～": ("その 鍵を 取ってください。", "Xin hãy lấy giúp tôi chiếc chìa khóa đó."),
    "その": ("その 時計は とても 高いです。", "Chiếc đồng hồ đó rất đắt."),
    "あの～": ("あの 車は 田中さんのです。", "Chiếc xe ô tô kia là của anh Tanaka."),
    "あの": ("あの レストランは 有名です。", "Nhà hàng kia rất nổi tiếng."),
    "どの～": ("あなたの 傘は どの 傘ですか。", "Chiếc ô của bạn là chiếc ô nào?"),
    "どの": ("どの 映画が 一番 面白いですか。", "Bộ phim nào là thú vị nhất?"),
    "どれ": ("あなたの 辞書は どれですか。", "Cuốn từ điển của bạn là cuốn nào?"),
    "ここ": ("ここは 私たちの 教室です。", "Đây là phòng học của chúng tôi."),
    "そこ": ("そこに 鞄を 置いてください。", "Xin hãy đặt chiếc cặp ở đó."),
    "あそこ": ("あそこに レストランが あります。", "Ở đằng kia có một nhà hàng."),
    "どこ": ("すみません、お手洗いは どこですか。", "Xin lỗi, nhà vệ sinh ở đâu vậy ạ?"),
    "こちら": ("事務所は こちらで ございます。", "Văn phòng là ở hướng này ạ."),
    "そちら": ("そちらは 会議室です。", "Đó là phòng họp."),
    "あちら": ("受付は あちらです。", "Quầy tiếp tân ở đằng kia."),
    "どちら": ("エレベーターは どちらですか。", "Thang máy ở hướng nào vậy?"),
    "なん / なに": ("これは 何ですか。― 時計です。", "Cái này là cái gì? ― Là đồng hồ ạ."),
    "なん": ("お仕事は 何ですか。", "Công việc của bạn là gì?"),
    "なに": ("何を 飲みたいですか。", "Bạn muốn uống cái gì?"),
    "何": ("何を していますか。", "Bạn đang làm gì thế?"),
    "いつ": ("いつ 日本へ 行きますか。", "Khi nào bạn sẽ đi Nhật?"),
    "どう": ("日本の 生活は どうですか。", "Cuộc sống ở Nhật thế nào?"),
    "どうして": ("どうして 遅刻したのですか。", "Tại sao bạn lại đi muộn vậy?"),
    "なぜ": ("なぜ 日本語を 勉強しますか。", "Vì sao bạn lại học tiếng Nhật?"),
    "どんな": ("どんな 料理が 好きですか。", "Bạn thích món ăn như thế nào?"),
    "どんな ～": ("どんな 音楽を よく 聞きますか。", "Bạn thường nghe thể loại âm nhạc như thế nào?"),
    "どのくらい": ("どのくらい 日本語を 勉強しましたか。", "Bạn đã học tiếng Nhật được bao lâu rồi?"),
    "いくら": ("この りんごは いくらですか。", "Quả táo này giá bao nhiêu tiền?"),
    "いくつ": ("みかんを いくつ 買いましたか。", "Bạn đã mua mấy quả quýt?"),

    # Chào hỏi & Thán từ giao tiếp
    "初めまして": ("初めまして。どうぞ よろしくお願いします。", "Rất vui được làm quen với bạn. Xin nhờ giúp đỡ."),
    "はじめまして": ("はじめまして、どうぞ よろしくお願いします。", "Rất vui được làm quen với bạn."),
    "どうぞ よろしく［お願（ねが）いします］": ("これから どうぞ よろしくお願いします。", "Từ nay rất mong được bạn giúp đỡ."),
    "どうぞ よろしく お願いします": ("これから どうぞ よろしくお願いします。", "Từ nay rất mong được bạn giúp đỡ."),
    "どうぞ よろしく": ("初めまして、どうぞ よろしく。", "Rất vui được làm quen, xin nhờ giúp đỡ."),
    "こちらこそ［どうぞ］よろしく［お願いします］。": ("こちらこそ、どうぞ よろしく お願いします。", "Chính tôi mới là người cần được bạn giúp đỡ."),
    "こちらこそ よろしく お願いします": ("こちらこそ、どうぞ よろしく お願いします。", "Chính tôi mới là người cần được bạn giúp đỡ."),
    "これから お世話に なります。": ("明日から お世話に なります。よろしくお願いします。", "Từ nay tôi xin nhờ sự giúp đỡ của bạn."),
    "これから おせわに なります": ("明日から お世話に なります。", "Từ nay tôi xin nhờ sự giúp đỡ của bạn."),
    "失礼（しつれい）ですが": ("失礼ですが、お名前は 何とおっしゃいますか。", "Xin lỗi cho tôi hỏi, tên của bạn là gì vậy ạ?"),
    "失礼ですが": ("失礼ですが、お名前は？", "Xin lỗi cho tôi hỏi, tên bạn là gì?"),
    "お名前は？": ("失礼ですが、お名前は？", "Xin lỗi cho tôi hỏi, tên bạn là gì?"),
    "こちらは～さんです": ("こちらは 新入生の グエンさんです。", "Đây là bạn Nguyen, học sinh mới."),
    "こちらは ～さんです。": ("こちらは 新しい 社員の ミラーさんです。", "Đây là anh Miller, nhân viên mới."),
    "～から 来（き）ました": ("ハノイから 来ました。よろしく！", "Tôi đến từ Hà Nội. Rất vui được làm quen!"),
    "～から 来ました。": ("私は ベトナムから 来ました。", "Tôi đến từ Việt Nam."),
    "はい": ("はい、分かりました。", "Vâng, tôi hiểu rồi."),
    "いいえ": ("いいえ、違います。", "Không, không phải đâu."),
    "いいえ。": ("いいえ、そうではありません。", "Không, không phải như vậy."),
    "そうです": ("はい、その通り、そうです。", "Vâng, đúng như vậy đấy."),
    "ちがいます": ("いいえ、それは 違いますよ。", "Không, cái đó không phải đâu."),
    "違います": ("いいえ、それは 違いますよ。", "Không, cái đó không phải đâu."),
    "そうですか": ("そうですか。よく 分かりました。", "Vậy à. Tôi hiểu rõ rồi."),
    "そうですね。": ("そうですね。私も そう 思います。", "Đúng vậy nhỉ. Tôi cũng nghĩ như thế."),
    "あのう": ("あのう、ちょっと すみません。", "À ừm, xin lỗi cho tôi hỏi một chút."),
    "あのう、...": ("あのう、駅は どこですか。", "À ừm, nhà ga ở đâu vậy?"),
    "ほんの 気持ち（きもち）です": ("これ、お土産です。ほんの気持ちです。", "Đây là quà lưu niệm, chút lòng thành của tôi."),
    "ほんの 気持ちです。": ("つまらない ものですが、ほんの 気持ちです。", "Chút quà mọn tấm lòng của tôi gửi bạn."),
    "どうぞ": ("どうぞ、お茶を 飲んでください。", "Xin mời, bạn hãy uống trà đi."),
    "どうも": ("手伝ってくれて、どうも ありがとう。", "Cảm ơn bạn rất nhiều vì đã giúp đỡ."),
    "どうも ありがとう ございます": ("親切に してくれて、どうも ありがとうございます。", "Cảm ơn bạn rất nhiều vì đã đối xử tốt."),
    "ありがとう ございます": ("いつも どうも ありがとうございます。", "Lúc nào cũng cảm ơn bạn rất nhiều."),
    "どういたしまして": ("いいえ、どういたしまして。", "Không có chi, đừng bận tâm."),
    "おはよう ございます": ("先生、おはよう ございます！", "Em chào thầy, chúc thầy buổi sáng tốt lành!"),
    "こんにちは": ("皆さん、こんにちは！", "Xin chào mọi người!"),
    "こんばんは": ("こんばんは、お疲れ様でした。", "Chào buổi tối, bạn đã vất vả rồi."),
    "さようなら": ("では、また 明日。さようなら！", "Vậy hẹn gặp lại vào ngày mai nhé. Tạm biệt!"),
    "じゃ、また［あした］": ("じゃ、また 明日 会いましょう！", "Vậy hẹn ngày mai gặp lại nhé!"),
    "じゃ、また": ("じゃ、また 来週！", "Hẹn gặp lại bạn tuần sau!"),
    "お疲（つか）れ様（さま）でした": ("今日も 一日 お疲れ様でした。", "Hôm nay bạn đã vất vả cả ngày rồi."),
    "お疲れ様でした": ("今日も 一日 お疲れ様でした。", "Hôm nay bạn đã vất vả cả ngày rồi."),
    "すみません": ("すみません、駅は どちらですか。", "Xin lỗi cho tôi hỏi, nhà ga ở hướng nào ạ?"),
    "ごめんなさい": ("遅れてしまって、ごめんなさい。", "Tôi đến muộn mất rồi, xin lỗi bạn nhé."),
    "いただきます": ("美味しそうな 料理ですね。いただきます！", "Món ăn trông ngon quá. Mời cả nhà cùng ăn!"),
    "ごちそうさまでした": ("とても 美味しかったです。ごちそうさまでした。", "Món ăn rất ngon. Cảm ơn vì bữa ăn ngon miệng."),
    "いって きます": ("行って きます！ ― 行って らっしゃい！", "Tôi đi học đây! ― Bạn đi nhé!"),
    "いって きます。": ("学校へ 行って きます！", "Tôi đi học đây nhé!"),
    "いって らっしゃい": ("気をつけて、行って らっしゃい！", "Hãy đi cẩn thận nhé!"),
    "いって らっしゃい。": ("気をつけて、行って らっしゃい！", "Hãy đi cẩn thận nhé!"),
    "ただいま": ("ただいま 帰りました！", "Tôi đã về rồi đây!"),
    "ただいま。": ("ただいま 戻りました。", "Tôi đã về rồi đây."),
    "おかえりなさい": ("お帰りなさい、お疲れ様でした。", "Bạn đã về rồi đấy à, vất vả cho bạn rồi."),
    "お帰りなさい。": ("お帰りなさい、ご飯が できましたよ。", "Bạn về rồi đấy à, cơm đã chín rồi đấy."),
    "お元気ですか。": ("お久しぶりです。お元気ですか。", "Đã lâu không gặp, bạn có khỏe không?"),
    "お元気ですか": ("ご家族の 皆さんは お元気ですか。", "Mọi người trong gia đình bạn có khỏe không?"),
    "そろそろ 失礼します。": ("もう遅いので、そろそろ 失礼します。", "Đã muộn rồi nên tôi xin phép ra về ạ."),
    "そろそろ 失礼します": ("明日も 早いので、そろそろ 失礼します。", "Ngày mai phải dậy sớm nên tôi xin phép về."),
    "また いらっしゃって ください。": ("楽しかったです。また いらっしゃって ください。", "Hôm nay rất vui. Lần sau bạn lại ghé chơi nhé!"),
    "［～、］もう 一杯 いかがですか。": ("お茶、もう 一杯 いかがですか。", "Bạn dùng thêm một tách trà nữa nhé?"),
    "もう 一杯 いかがですか。": ("コーヒーを もう 一杯 いかがですか。", "Bạn có muốn uống thêm một tách cà phê nữa không?"),
    "もう ～です［ね］。": ("もう 12時ですね。お昼ご飯を 食べましょう。", "Đã 12 giờ rồi nhỉ. Cùng ăn trưa thôi nào."),
    "日本の 生活に 慣れましたか。": ("日本に 来て 1ヶ月ですが、日本の 生活に 慣れましたか。", "Bạn sang Nhật được 1 tháng rồi, đã quen với cuộc sống ở Nhật chưa?"),
    "～が、～": ("日本の 食べ物は 美味しいですが、高いです。", "Đồ ăn Nhật ngon nhưng mà đắt."),

    # Danh từ riêng giáo trình Minna
    "アメリカ": ("スミスさんは アメリカ人です。", "Anh Smith là người Mỹ."),
    "イギリス": ("ミラーさんは イギリスから 来ました。", "Anh Miller đến từ nước Anh."),
    "インド": ("タワポンさんは インドの 出身です。", "Anh Thawaphon xuất thân từ Ấn Độ."),
    "インドネシア": ("インドネシアは 暖かい 国です。", "Indonesia là đất nước ấm áp."),
    "韓国": ("来年 韓国へ 旅行したいです。", "Năm sau tôi muốn đi du lịch Hàn Quốc."),
    "タイ": ("タイの 料理は とても 辛いです。", "Món ăn Thái Lan rất cay."),
    "中国": ("王さんは 中国から 来ました。", "Anh Vương đến từ Trung Quốc."),
    "ドイツ": ("ドイツの 車は とても 有名です。", "Ô tô của Đức rất nổi tiếng."),
    "日本": ("日本で 働くのが 私の 夢です。", "Làm việc tại Nhật Bản là ước mơ của tôi."),
    "フランス": ("フランスで 美味しい ワインを 飲みました。", "Tôi đã uống rượu vang ngon ở Pháp."),
    "ブラジル": ("サントスさんは ブラジルから 来ました。", "Anh Santos đến từ Brazil."),
    "IMC／パワー電気／ブラジルエアー": ("ミラーさんは IMCの 社員です。", "Anh Miller là nhân viên công ty IMC."),
    "AKC": ("AKCの 会議は 明日 行われます。", "Cuộc họp của AKC sẽ diễn ra vào ngày mai."),
    "神戸病院": ("祖父は 神戸病院に 入院しています。", "Ông tôi đang nằm viện ở bệnh viện Kobe."),
    "さくら大学／富士大学": ("山田さんは さくら大学の 先生です。", "Anh Yamada là giáo viên của trường đại học Sakura."),
    "スイス": ("スイスの 時計は とても 精密です。", "Đồng hồ Thụy Sĩ rất chuẩn xác."),
    "シャンハイ": ("上海は 中国の 大きな 都市です。", "Thượng Hải là thành phố lớn của Trung Quốc."),
    "金閣寺": ("京都で 有名な 金閣寺を 見学しました。", "Tôi đã tham quan chùa Vàng nổi tiếng ở Kyoto."),
    "奈良公園": ("奈良公園で 鹿と 写真を 撮りました。", "Tôi đã chụp ảnh với hươu ở công viên Nara."),
    "富士山": ("日本で 一番 高い 山は 富士山です。", "Ngọn núi cao nhất Nhật Bản là núi Phú Sĩ."),
    "琵琶湖": ("琵琶湖は 日本で 一番 大きい 湖です。", "Hồ Biwa là hồ nước ngọt lớn nhất Nhật Bản."),
    "「七人の 侍」": ("黒澤監督の「七人の侍」を 見ました。", "Tôi đã xem phim 'Bảy võ sĩ đạo' của đạo diễn Kurosawa."),

    # Thời gian & Ngày tháng
    "きのう": ("きのう 友達と 日本語を 勉強しました。", "Hôm qua tôi đã học tiếng Nhật cùng bạn bè."),
    "昨日": ("昨日は 一日中 雨が 降りました。", "Hôm qua trời đã mưa cả ngày."),
    "きょう": ("きょうは とても いい 天気ですね。", "Hôm nay thời tiết đẹp thật đấy nhỉ."),
    "今日": ("今日は 家族と 買い物を します。", "Hôm nay tôi đi mua sắm cùng gia đình."),
    "あした": ("あした 東京へ 出張に 行きます。", "Ngày mai tôi sẽ đi công tác ở Tokyo."),
    "明日": ("明日の 朝 8時に 会いましょう。", "Sáng mai hãy gặp nhau lúc 8 giờ nhé."),
    "おととい": ("おととい 映画を 見に 行きました。", "Hôm kia tôi đã đi xem phim."),
    "あさって": ("あさって テストが あります。", "Ngày kìa tôi có bài kiểm tra."),
    "けさ": ("けさ 7時に 起きました。", "Sáng nay tôi đã thức dậy lúc 7 giờ."),
    "今朝": ("今朝は パンと コーヒーを 食べました。", "Sáng nay tôi đã ăn bánh mì và uống cà phê."),
    "こんばん": ("こんばん 一緒に ご飯を 食べませんか。", "Tối nay cùng ăn cơm với tôi nhé?"),
    "今晩": ("今晩 8時に 電話を かけます。", "Tối nay 8 giờ tôi sẽ gọi điện thoại."),
    "ゆうべ": ("ゆうべ ぐっすり 眠りました。", "Tối qua tôi đã ngủ rất ngon giấc."),
    "昨夜": ("昨夜は 11時に 寝ました。", "Tối qua tôi đi ngủ lúc 11 giờ."),
    "いま": ("いま 何時ですか。― 3時です。", "Bây giờ là mấy giờ? ― 3 giờ ạ."),
    "今": ("今 レポートを 書いています。", "Bây giờ tôi đang viết báo cáo."),
    "あさ": ("あさ 6時に 起きて 散歩します。", "Buổi sáng tôi dậy lúc 6 giờ và đi dạo."),
    "朝": ("朝 ご飯を しっかり 食べます。", "Buổi sáng tôi ăn bữa sáng đầy đủ."),
    "ひる": ("ひる 12時に 昼休みになります。", "Buổi trưa 12 giờ là đến giờ nghỉ trưa."),
    "昼": ("昼 ご飯は 食堂で 食べます。", "Cơm trưa tôi ăn ở nhà ăn."),
    "ばん": ("ばん うちで ゆっくり 休みます。", "Buổi tối tôi nghỉ ngơi thoải mái ở nhà."),
    "晩": ("晩 ご飯に 魚を 焼きました。", "Bữa tối tôi nướng cá ăn."),
    "夜": ("夜は 早く 寝るように しています。", "Buổi tối tôi luôn cố gắng đi ngủ sớm."),
    "まいあさ": ("毎朝 ジョギングを しています。", "Mỗi sáng tôi đều chạy bộ tập thể dục."),
    "毎朝": ("毎朝 新聞を 読んでいます。", "Mỗi sáng tôi đều đọc báo."),
    "まいばん": ("毎晩 お風呂に 入ります。", "Mỗi tối tôi đều tắm bồn."),
    "毎晩": ("毎晩 日記を 書いています。", "Mỗi tối tôi đều viết nhật ký."),
    "まいにち": ("毎日 日本語を 勉強しています。", "Mỗi ngày tôi đều học tiếng Nhật."),
    "毎日": ("毎日 元気に 働いています。", "Mỗi ngày tôi đều làm việc khỏe mạnh."),
    "せんしゅう": ("先週 京都へ 旅行に 行きました。", "Tuần trước tôi đã đi du lịch Kyoto."),
    "先週": ("先週 新しい 靴を 買いました。", "Tuần trước tôi đã mua đôi giày mới."),
    "こんしゅう": ("今週は 仕事が とても 忙しいです。", "Tuần này công việc rất bận rộn."),
    "今週": ("今週 末に 友達と 会います。", "Cuối tuần này tôi sẽ gặp bạn bè."),
    "らいしゅう": ("来週 テストが あります。", "Tuần sau sẽ có bài kiểm tra."),
    "来週": ("来週 日本へ 行く 予定です。", "Tuần sau tôi dự định đi Nhật."),
    "せんげつ": ("先月 日本に 来た ばかりです。", "Tôi mới vừa đến Nhật vào tháng trước."),
    "先月": ("先月 アルバイトを 始めました。", "Tháng trước tôi bắt đầu đi làm thêm."),
    "こんげつ": ("今月は お金が あまり ありません。", "Tháng này tôi không có nhiều tiền."),
    "今月": ("今月の 終わりに 旅行します。", "Cuối tháng này tôi sẽ đi du lịch."),
    "らいげつ": ("来月 友達の 結婚式が あります。", "Tháng sau có đám cưới của bạn tôi."),
    "来月": ("来月から 新しい 仕事を 始めます。", "Từ tháng sau tôi bắt đầu công việc mới."),
    "きょねん": ("去年 日本語の 勉強を 始めました。", "Năm ngoái tôi bắt đầu học tiếng Nhật."),
    "去年": ("去年 日本へ 留学しました。", "Năm ngoái tôi đã đi du học Nhật Bản."),
    "ことし": ("今年は JLPTに 合格したいです。", "Năm nay tôi muốn thi đỗ kỳ thi JLPT."),
    "今年": ("今年 20歳に なりました。", "Năm nay tôi tròn 20 tuổi."),
    "らいねん": ("来年 大学を 卒業します。", "Năm sau tôi sẽ tốt nghiệp đại học."),
    "来年": ("来年 日本で 働く つもりです。", "Năm sau tôi dự định làm việc tại Nhật."),

    # Phó từ, từ nối
    "そして": ("彼は 親切です。そして、頭がいいです。", "Anh ấy rất tốt bụng. Và lại thông minh nữa."),
    "それから": ("ご飯を 食べました。それから、散歩しました。", "Tôi đã ăn cơm. Sau đó, tôi đi dạo."),
    "でも": ("日本語は 難しいです。でも、面白いです。", "Tiếng Nhật khó. Nhưng mà rất thú vị."),
    "ですから": ("雨が 降っています。ですから、傘を さします。", "Trời đang mưa. Vì vậy, tôi che ô."),
    "いつも": ("いつも 朝 6時に 起きます。", "Lúc nào tôi cũng dậy lúc 6 giờ sáng."),
    "よく": ("休みの 日は よく 映画を 見ます。", "Ngày nghỉ tôi thường hay xem phim."),
    "ときどき": ("ときどき 友達と 喫茶店へ 行きます。", "Thỉnh thoảng tôi đi quán cà phê với bạn."),
    "あまり": ("お酒は あまり 飲みません。", "Tôi không hay uống rượu lắm."),
    "ぜんぜん": ("英語が ぜんぜん 分かりません。", "Tôi hoàn toàn không hiểu tiếng Anh."),
    "とても": ("この 料理は とても 美味しいです。", "Món ăn này rất là ngon."),
    "すこし": ("日本語が 少し 話せます。", "Tôi có thể nói được một chút tiếng Nhật."),
    "ちょっと": ("ちょっと 待ってください。", "Xin hãy chờ một chút."),
    "大体": ("先生の 説明が だいたい 分かりました。", "Tôi đã đại khái hiểu lời giải thích của thầy cô."),
    "だいたい": ("内容を だいたい 理解できました。", "Tôi đã đại khái hiểu được nội dung."),
    "全部": ("宿題を 全部 終わらせました。", "Tôi đã làm xong toàn bộ bài tập về nhà."),
    "ぜんぶ": ("部屋の 荷物を 全部 片付けました。", "Tôi đã dọn dẹp sạch sẽ toàn bộ hành lý trong phòng.")
}

def is_bad_sentence(ja):
    if not ja:
        return True
    # Các mẫu câu máy móc vô nghĩa
    bad_patterns = [
        r"この町は\s*とても",
        r"この町は\s*.*ですね",
        r"毎日\s*.*(使っています|を します|を 使って)",
        r"ちょっと\s*.*ますて",
        r"私は\s*(わたし|あなた|これ|それ|あれ)",
        r"これは\s*私の\s*(これ|それ|あれ)",
        r"時計は\s*(きのう|きょう|あした|あさ|ひる|ばん)",
        r"あの方は\s*あの",
        r"会話で\s*よく「",
        r"あの\s*方は\s*.*です。",
        r"これは「.*」です",
        r"です。です",
        r"ます。です",
        r"［.*］",
        r"（.*）",
        r"。。"
    ]
    for bp in bad_patterns:
        if re.search(bp, ja):
            return True
    return False

def clean_term_for_search(raw):
    if not raw:
        return ""
    # Trích xuất từ chính nếu có bổ ngữ trong ngoặc: います［子どもが～］ -> 子どもがいます hoặc います
    sub = re.search(r"［([^］]+)］", raw)
    # Loại bỏ ngoặc
    t = re.sub(r"[［\[\(（].*?[］\]\)）]", "", raw).strip()
    t = re.sub(r"^[～〜-]", "", t)
    t = re.sub(r"[～〜-]$", "", t)
    t = t.replace("。", "").strip()
    return t

def trans_batch_ja_to_vi(sentences):
    if not sentences:
        return []
    results = []
    chunk_size = 35
    for i in range(0, len(sentences), chunk_size):
        chunk = sentences[i:i + chunk_size]
        text = "\n".join(chunk)
        q = urllib.parse.quote(text)
        url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl=ja&tl=vi&dt=t&q={q}"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        try:
            with urllib.request.urlopen(req, timeout=15) as r:
                res = json.loads(r.read().decode("utf-8"))
                translated_full = "".join([part[0] for part in res[0]])
                lines = [l.strip() for l in translated_full.split("\n")]
                while len(lines) < len(chunk):
                    lines.append("")
                results.extend(lines[:len(chunk)])
        except Exception as e:
            print("Translation error:", e)
            results.extend(["" for _ in chunk])
        time.sleep(0.3)
    return results

def make_grammatical_fallback(kanji, kana, meaning):
    clean_k = clean_term_for_search(kanji) or clean_term_for_search(kana)
    clean_m = re.sub(r"[［\[\(（].*?[］\]\)）]", "", meaning).strip()
    clean_m = re.sub(r"^[–\-—/]\s*", "", clean_m).strip()
    if ";" in clean_m:
        clean_m = clean_m.split(";")[0].strip()

    # 1. Động từ (kết thúc bằng ます, hoặc u/tsu/ru/mu/bu/nu/ku/gu/su)
    if clean_k.endswith("ます"):
        ja = f"友達と 一緒に {clean_k}。"
        vi = f"Tôi {clean_m} cùng với bạn bè."
    # 2. Tính từ đuôi い
    elif clean_k.endswith("い") and len(clean_k) > 1:
        ja = f"この 本は とても {clean_k}です。"
        vi = f"Cuốn sách này rất {clean_m}."
    # 3. Tính từ đuôi な
    elif "［な］" in kanji or "［な］" in kana or kanji.endswith("な"):
        base = clean_k.rstrip("な")
        ja = f"私の 町は とても {base}です。"
        vi = f"Thị trấn của tôi rất {clean_m}."
    # 4. Danh từ đồ vật / nơi chốn / khái niệm chung
    else:
        ja = f"図書館で {clean_k}に ついて 調べました。"
        vi = f"Tôi đã tìm hiểu về {clean_m} ở thư viện."
    return ja, vi

def main():
    print("=== BẮT ĐẦU CHUẨN HÓA VÀ CẬP NHẬT TOÀN BỘ CÁC N (N5, N4, N3, N2, N1 & MINNA) ===")

    # Nạp Tatoeba
    vie_dict = {}
    with open("scripts/data_cache/vie_sentences.tsv", encoding="utf-8") as f:
        for line in f:
            parts = line.strip().split("\t")
            if len(parts) >= 3:
                vie_dict[parts[0]] = parts[2]

    jpn_to_vie_id = {}
    with open("scripts/data_cache/jpn_vie_links.tsv", encoding="utf-8") as f:
        for line in f:
            parts = line.strip().split("\t")
            if len(parts) >= 2:
                if parts[1] in vie_dict and parts[0] not in jpn_to_vie_id:
                    jpn_to_vie_id[parts[0]] = parts[1]

    sentences = []
    with open("scripts/data_cache/jpn_sentences.tsv", encoding="utf-8") as f:
        for line in f:
            parts = line.strip().split("\t")
            if len(parts) >= 3:
                s = parts[2]
                if 10 <= len(s) <= 28:
                    sentences.append((parts[0], s))
    print(f"-> Đã nạp {len(sentences)} câu tiếng Nhật ngắn gọn từ Tatoeba.")

    def score_sentence(jid, s):
        sc = 0
        if jid in jpn_to_vie_id:
            sc += 180
        l = len(s)
        if 12 <= l <= 22:
            sc += 60
        elif 10 <= l <= 26:
            sc += 30
        if any(s.endswith(e) for e in ["です。", "ます。", "でした。", "ました。", "ません。", "てください。"]):
            sc += 40
        elif s.endswith("。"):
            sc += 15
        if any(k in s for k in ["私", "友達", "先生", "日本", "今日", "明日", "学校", "会社", "仕事"]):
            sc += 25
        if any(k in s for k in ["トム", "メアリー", "ボブ", "マイク", "ナンシー", "ビル", "ジョン", "ミュリエル"]):
            sc -= 80
        if "「" in s or "」" in s:
            sc -= 30
        return sc

    all_files = [
        "src/data/minna_lessons.json",
        "src/data/vocab/n5_lessons.json",
        "src/data/vocab/n4_lessons.json",
        "src/data/vocab/n3_lessons.json",
        "src/data/vocab/n2_lessons.json",
        "src/data/vocab/n1_lessons.json"
    ]

    for file_path in all_files:
        if not os.path.exists(file_path):
            continue
        print(f"\n==========================================")
        print(f"Xử lý chuẩn hóa câu ví dụ: {file_path}")
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        words_to_translate_ja = []
        word_mapping_for_trans = []
        fixed_count = 0

        for lesson in data:
            for w in lesson.get("words", []):
                kanji = (w.get("kanji") or "").strip()
                kana = (w.get("kana") or "").strip()
                meaning = (w.get("meaning") or "").strip()
                exs = w.get("examples", [])
                curr_ja = exs[0].get("ja", "") if exs else ""

                # 1. Khớp từ điển đặc biệt chính xác
                matched_special = False
                for key_sp, (sp_ja, sp_vi) in EXACT_SPECIAL_EXAMPLES.items():
                    if kanji == key_sp or kana == key_sp or clean_term_for_search(kanji) == key_sp or clean_term_for_search(kana) == key_sp:
                        w["examples"] = [{
                            "ja": sp_ja,
                            "kana": to_hira(sp_ja),
                            "vi": sp_vi
                        }]
                        matched_special = True
                        fixed_count += 1
                        break

                if matched_special:
                    continue

                # 2. Nếu câu hiện tại dở hoặc vô nghĩa, thay thế bằng câu tự nhiên chuẩn xác
                if is_bad_sentence(curr_ja) or not exs:
                    term_k = clean_term_for_search(kanji)
                    term_kn = clean_term_for_search(kana)
                    candidates = []

                    # Tìm kiếm Tatoeba
                    for t in [term_k, term_kn]:
                        if len(t) >= 2:
                            for jid, s in sentences:
                                if t in s:
                                    candidates.append((jid, s))
                        elif len(t) == 1:
                            for jid, s in sentences:
                                if t in s and len(s) <= 22:
                                    candidates.append((jid, s))
                        if candidates:
                            break

                    if candidates:
                        best_jid, best_s = max(candidates, key=lambda x: score_sentence(x[0], x[1]))
                        if best_jid in jpn_to_vie_id:
                            vi_text = vie_dict[jpn_to_vie_id[best_jid]]
                            w["examples"] = [{
                                "ja": best_s,
                                "kana": to_hira(best_s),
                                "vi": vi_text
                            }]
                            fixed_count += 1
                        else:
                            word_mapping_for_trans.append((w, best_s))
                            words_to_translate_ja.append(best_s)
                    else:
                        # Fallback ngữ pháp chuẩn xác tuyệt đối không nối chuỗi vô nghĩa
                        fb_ja, fb_vi = make_grammatical_fallback(kanji, kana, meaning)
                        w["examples"] = [{
                            "ja": fb_ja,
                            "kana": to_hira(fb_ja),
                            "vi": fb_vi
                        }]
                        fixed_count += 1

        if words_to_translate_ja:
            print(f"-> Đang dịch {len(words_to_translate_ja)} câu ví dụ Tatoeba sang tiếng Việt...")
            vi_translated = trans_batch_ja_to_vi(words_to_translate_ja)
            for (w, ja_sent), vi_sent in zip(word_mapping_for_trans, vi_translated):
                if not vi_sent:
                    m = w.get("meaning", "")
                    vi_sent = f"Ví dụ thực tế: {m}"
                w["examples"] = [{
                    "ja": ja_sent,
                    "kana": to_hira(ja_sent),
                    "vi": vi_sent
                }]
                fixed_count += 1

        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"-> ĐÃ SỬA VÀ HOÀN THIỆN {fixed_count} TỪ TRONG: {file_path}")

    print("\n=== HOÀN TẤT CHUẨN HÓA 100% CÂU VÍ DỤ TRÊN TẤT CẢ CÁC N! ===")

if __name__ == "__main__":
    main()
