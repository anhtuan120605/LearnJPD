#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Enrich all vocabulary in LearnJPD with:
1. Grammar-aligned example sentences corresponding to that specific lesson's grammar points.
2. Common daily conversational (Kaiwa) sentences.
3. Natural Hiragana furigana/kana reading for TTS audio and phonetic reading.
4. Natural, idiomatic Vietnamese translations.
"""

import json
import os
import re

def get_lesson_grammar_theme(lesson_num, level):
    """Returns general sentence templates based on lesson grammar."""
    if level == 'N5':
        if lesson_num == 1:
            return "N1 は N2 です / じゃありません / ですか (Giới thiệu bản thân, nghề nghiệp, quốc tịch, tuổi tác)"
        elif lesson_num == 2:
            return "これ / それ / あれ / この / その / あの (Chỉ định đồ vật, sở hữu の)"
        elif lesson_num == 3:
            return "ここ / そこ / あそこ / どこ / こちら (Địa điểm, nơi chốn, giá tiền)"
        elif lesson_num == 4:
            return "今～時～分 / Vます / Vません / Vました / ～から～まで (Thời gian, lịch trình hàng ngày)"
        elif lesson_num == 5:
            return "～へ 行きます / 来ます / 帰ります / 乗り物で / 誰かと (Di chuyển, phương tiện, ngày tháng)"
        elif lesson_num == 6:
            return "～を Vます / ～で Vます / ～ませんか / ～ましょう (Tân ngữ, ăn uống, rủ rê, đề nghị)"
        elif lesson_num == 7:
            return "～で Vます / もう～ました / ～にあげます / もらいます (Công cụ, tặng quà, nhận quà)"
        elif lesson_num == 8:
            return "Tính từ đuôi い & な / とても / あまり (Miêu tả tính chất, tính cách, thời tiết)"
        elif lesson_num == 9:
            return "～が好き / 上手 / わかります / あります / ～から (Sở thích, khả năng, lý do)"
        elif lesson_num == 10:
            return "～に～があります / います / 上・下・前・後ろ (Sự tồn tại, vị trí đồ vật, con người)"
        elif lesson_num == 11:
            return "Số lượng từ ひとつ, ふたつ / ～人 / ～台 / どのくらい (Số đếm, lượng từ, thời lượng)"
        elif lesson_num == 12:
            return "Aは Bより Tính từ / Aと Bと どちらが / 一番 (So sánh hơn, so sánh nhất)"
        elif lesson_num == 13:
            return "～が欲しいです / Vたいです / ～へ Vに行きます (Mong muốn, mục đích đi đâu làm gì)"
        elif lesson_num == 14:
            return "Thể Te: Vてください / Vています / Vましょうか (Yêu cầu lịch sự, đang làm gì)"
        elif lesson_num == 15:
            return "Vてもいいですか / Vてはいけません / Vています (Cho phép, cấm đoán, trạng thái)"
        elif lesson_num == 16:
            return "Vて、Vて / Vてから / Aは Bが Tính từ (Nối hành động theo trình tự thời gian)"
        elif lesson_num == 17:
            return "Thể Nai: Vないでください / Vなければなりません / Vなくてもいいです (Cấm chỉ, bắt buộc)"
        elif lesson_num == 18:
            return "Thể Từ điển: Vることができます / 趣味は Vること / Vる前に (Khả năng, sở thích)"
        elif lesson_num == 19:
            return "Thể Ta: Vたことがあります / Vたり、Vたりします / なります (Kinh nghiệm, liệt kê)"
        elif lesson_num == 20:
            return "Thể Thông thường (Futsuukei: Kaiwa thân mật giao tiếp hàng ngày)"
        elif lesson_num == 21:
            return "～と思います / ～と言いました / ～でしょう (Ý kiến cá nhân, trích dẫn lời nói)"
        elif lesson_num == 22:
            return "Mệnh đề bổ ngữ cho danh từ (Định ngữ thể thông thường + N)"
        elif lesson_num == 23:
            return "Vるとき / Vたとき / Vると (Khi làm gì, hễ... thì...)"
        elif lesson_num == 24:
            return "くれます / Vてあげます / もらいます / くれます (Cho nhận ân huệ, giúp đỡ)"
        elif lesson_num == 25:
            return "～たら / ～ても (Giả định: Nếu... thì..., Dù... nhưng vẫn...)"
    elif level == 'N4':
        return "Ngữ pháp Minna Trung cấp Sơ cấp 2 (Thể khả năng, ý chí, mệnh lệnh, bị động, sai khiến, kính ngữ...)"
    elif level == 'N3':
        return "Ngữ pháp Trung cấp JLPT N3"
    elif level == 'N2':
        return "Ngữ pháp Trung Cao cấp JLPT N2"
    elif level == 'N1':
        return "Ngữ pháp Cao cấp JLPT N1"
    return "Ngữ pháp chuẩn giao tiếp tiếng Nhật"

def generate_sentence_for_word(word, lesson_num, level):
    kanji = (word.get('kanji') or '').strip()
    kana = (word.get('kana') or '').strip()
    meaning = (word.get('meaning') or '').strip()
    hanviet = (word.get('hanviet') or '').strip()

    # Làm sạch từ để ghép câu tự nhiên
    clean_k = re.sub(r'[\(\)（）\s/].*$', '', kanji).strip() or kana
    clean_kana = re.sub(r'[\(\)（）\s/].*$', '', kana).strip()
    clean_m = re.sub(r'[\(\)（）/].*$', '', meaning).strip().lower()

    # 1. Các từ giao tiếp chào hỏi đặc biệt (Kaiwa)
    if 'はじめまして' in kana:
        return [{
            "ja": "はじめまして、ナムです。どうぞよろしくおねがいします。",
            "kana": "はじめまして、なむです。どうぞよろしくおねがいします。",
            "vi": "Rất vui được làm quen với bạn, tôi là Nam. Xin nhờ bạn giúp đỡ."
        }]
    elif 'おはよう' in kana:
        return [{
            "ja": "おはようございます。きょうもがんばりましょう！",
            "kana": "おはようございます。きょうもがんばりましょう！",
            "vi": "Chào buổi sáng! Hôm nay cùng cố gắng nhé!"
        }]
    elif 'こんにちは' in kana:
        return [{
            "ja": "こんにちは、いいお天気ですね。",
            "kana": "こんにちは、いいおてんきですね。",
            "vi": "Xin chào bạn, hôm nay thời tiết đẹp quá nhỉ."
        }]
    elif 'こんばんは' in kana:
        return [{
            "ja": "こんばんは、お仕事お疲れ様でした。",
            "kana": "こんばんは、おしごとおつかれさまでした。",
            "vi": "Chào buổi tối, bạn đã vất vả với công việc hôm nay rồi."
        }]
    elif 'さようなら' in kana or 'じゃ、また' in kana or 'またあした' in kana:
        return [{
            "ja": "では、また明日会いましょう。さようなら！",
            "kana": "では、またあしたあいましょう。さようなら！",
            "vi": "Vậy hẹn gặp lại vào ngày mai nhé. Tạm biệt!"
        }]
    elif 'ありがとう' in kana:
        return [{
            "ja": "いつも手伝ってくれて、どうもありがとうございます。",
            "kana": "いつもてつだってくれて、どうもありがとうございます。",
            "vi": "Cảm ơn bạn rất nhiều vì lúc nào cũng giúp đỡ tôi."
        }]
    elif 'すみません' in kana:
        return [{
            "ja": "すみません、駅はどちらでしょうか。",
            "kana": "すみません、えきはどちらでしょうか。",
            "vi": "Xin lỗi cho tôi hỏi, nhà ga ở hướng nào vậy ạ?"
        }]
    elif 'ごめんなさい' in kana:
        return [{
            "ja": "遅れてしまって、本当にごめんなさい。",
            "kana": "おくれてしまって、ほんとうにごめんなさい。",
            "vi": "Tôi đến muộn mất rồi, thực sự xin lỗi bạn."
        }]
    elif 'いただきます' in kana:
        return [{
            "ja": "とてもおいしそうですね。いただきます！",
            "kana": "とてもおいしそうですね。いただきます！",
            "vi": "Món ăn trông ngon quá. Mời cả nhà cùng ăn cơm ạ!"
        }]
    elif 'ごちそうさま' in kana:
        return [{
            "ja": "ごちそうさまでした。とてもおいしかったです。",
            "kana": "ごちそうさまでした。とてもおいしかったです。",
            "vi": "Cảm ơn vì bữa ăn thịnh soạn. Bữa cơm ngon lắm ạ."
        }]
    elif 'いってきます' in kana:
        return [{
            "ja": "学校へ行ってきます！― いってらっしゃい！",
            "kana": "がっこうへいってきます！― いってらっしゃい！",
            "vi": "Con đi học đây ạ! ― Con đi nhé!"
        }]
    elif 'ただいま' in kana:
        return [{
            "ja": "ただいま帰りました。― おかえりなさい！",
            "kana": "ただいまかえりました。― おかえりなさい！",
            "vi": "Tôi đã về rồi đây. ― Mừng bạn đã về nhà!"
        }]
    elif 'おねがい' in kana:
        return [{
            "ja": "これからもどうぞよろしくお願いします。",
            "kana": "これからもどうぞよろしくおねがいします。",
            "vi": "Từ nay về sau cũng rất mong nhận được sự giúp đỡ của bạn."
        }]
    elif 'おめでとう' in kana:
        return [{
            "ja": "お誕生日おめでとうございます！",
            "kana": "おたんじょうびおめでとうございます！",
            "vi": "Chúc mừng sinh nhật bạn!"
        }]
    elif '乾杯' in kanji or 'かんぱい' in kana:
        return [{
            "ja": "みんなの健康のために、乾杯しましょう！",
            "kana": "みんなのけんこうのために、かんぱいしましょう！",
            "vi": "Cùng nâng ly chúc mừng vì sức khỏe của mọi người nào!"
        }]

    # 2. Xử lý theo bài học cụ thể của Minna no Nihongo (Bài 1 - 25)
    if level == 'N5' and lesson_num == 1:
        if 'わたし' in kana:
            return [{"ja": "わたしはマイケルです。学生です。", "kana": "わたしはまいけるです。がくせいです。", "vi": "Tôi là Michael. Tôi là học sinh."}]
        elif 'あなた' in kana:
            return [{"ja": "あなたはベトナム人ですか。― はい、そうです。", "kana": "あなたはべとなむじんですか。― はい、そうです。", "vi": "Bạn có phải người Việt Nam không? ― Vâng, đúng vậy."}]
        elif 'せんせい' in kana or '先生' in kanji:
            return [{"ja": "ワット先生はさくら大学の英語の先生です。", "kana": "わっとせんせいはさくらだいがくのえいごのせんせいです。", "vi": "Thầy Watt là giáo viên tiếng Anh của trường đại học Sakura."}]
        elif 'がくせい' in kana or '学生' in kanji:
            return [{"ja": "ナムさんは日本語学校の学生です。", "kana": "なむさんはにほんごがっこうのがくせいです。", "vi": "Anh Nam là học sinh của trường tiếng Nhật."}]
        elif 'かいしゃいん' in kana or '会社員' in kanji:
            return [{"ja": "ミラーさんはアメリカの会社員です。", "kana": "みらーさんはあめりかのかいしゃいんです。", "vi": "Anh Miller là nhân viên công ty người Mỹ."}]
        elif 'ぎんこういん' in kana or '銀行員' in kanji:
            return [{"ja": "やまださんは銀行員じゃありません。", "kana": "やまださんはぎんこういんじゃありません。", "vi": "Anh Yamada không phải là nhân viên ngân hàng."}]
        elif 'いしゃ' in kana or '医者' in kanji:
            return [{"ja": "あの有名な医者は神戸病院の先生です。", "kana": "あのゆうめいないしゃはこうべびょういんのせんせいです。", "vi": "Vị bác sĩ nổi tiếng đó là bác sĩ của bệnh viện Kobe."}]
        elif 'けんきゅうしゃ' in kana or '研究者' in kanji:
            return [{"ja": "サントスさんは大学の研究者です。", "kana": "さんとすさんはだいがくのけんきゅうしゃです。", "vi": "Anh Santos là nhà nghiên cứu ở trường đại học."}]
        elif 'エンジニア' in kanji or 'えんじにあ' in kana:
            return [{"ja": "カルロスさんはIT企業のエンジニアです。", "kana": "かるろすさんはあいてぃーきぎょうのえんじにあです。", "vi": "Anh Carlos là kỹ sư của doanh nghiệp IT."}]
        elif 'だいがく' in kana or '大学' in kanji:
            return [{"ja": "あそこは東京の有名な大学です。", "kana": "あそこはとうきょうのゆうめいなだいがくです。", "vi": "Đằng kia là một trường đại học nổi tiếng ở Tokyo."}]
        elif 'びょういん' in kana or '病院' in kanji:
            return [{"ja": "駅の近くに新しい病院があります。", "kana": "えきのちかくにあたらしいびょういんがあります。", "vi": "Ở gần nhà ga có một bệnh viện mới."}]

    if level == 'N5' and lesson_num == 2:
        if 'これ' in kana:
            return [{"ja": "これは日本語の辞書です。", "kana": "これはにほんごのじしょです。", "vi": "Đây là cuốn từ điển tiếng Nhật."}]
        elif 'それ' in kana:
            return [{"ja": "それはあなたの傘ですか。― はい、わたしのです。", "kana": "それはあなたのかさですか。― はい、わたしのです。", "vi": "Đó có phải cây dù của bạn không? ― Vâng, của tôi đấy."}]
        elif 'あれ' in kana:
            return [{"ja": "あれは先生の車です。", "kana": "あれはせんせいのくるまです。", "vi": "Kia là chiếc xe hơi của thầy giáo."}]
        elif 'この' in kana:
            return [{"ja": "この本はとても面白いですよ。", "kana": "このほんはとてもおもしろいですよ。", "vi": "Cuốn sách này rất hay và thú vị đấy."}]
        elif 'その' in kana:
            return [{"ja": "その黒い鞄は誰のですか。", "kana": "そのくろいかばんはだれのですか。", "vi": "Chiếc cặp màu đen đó là của ai vậy?"}]
        elif 'あの' in kana:
            return [{"ja": "あの時計はスイスの時計です。", "kana": "あのとけいはすいすのとけいです。", "vi": "Chiếc đồng hồ kia là đồng hồ của Thụy Sĩ."}]
        elif 'じしょ' in kana or '辞書' in kanji:
            return [{"ja": "わからない言葉は辞書で調べます。", "kana": "わからないことばはじしょでしらべます。", "vi": "Từ ngữ nào không hiểu tôi sẽ tra bằng từ điển."}]
        elif 'ほん' in kana or '本' in kanji:
            return [{"ja": "毎晩寝る前に本を読みます。", "kana": "まいばんねるまえにほんをよみます。", "vi": "Mỗi tối trước khi đi ngủ tôi đều đọc sách."}]
        elif 'しんぶん' in kana or '新聞' in kanji:
            return [{"ja": "父は朝ごはんを食べながら新聞を読みます。", "kana": "ちはあさごはんをたべながらしんぶんをよみます。", "vi": "Bố tôi vừa ăn sáng vừa đọc báo."}]

    if level == 'N5' and lesson_num == 3:
        if 'ここ' in kana:
            return [{"ja": "ここは日本語の教室です。", "kana": "ここはにほんごのきょうしつです。", "vi": "Đây là phòng học tiếng Nhật."}]
        elif 'どこ' in kana:
            return [{"ja": "すみません、お手洗いはどこですか。", "kana": "すみません、おてあらいはどこですか。", "vi": "Xin lỗi cho tôi hỏi, nhà vệ sinh ở đâu vậy ạ?"}]
        elif 'いくら' in kana:
            return [{"ja": "このリンゴはいくらですか。― ひとつ150円です。", "kana": "このりんごはいくらですか。― ひとつひゃくごじゅうえんです。", "vi": "Quả táo này giá bao nhiêu tiền? ― 150 yên một quả ạ."}]

    if level == 'N5' and lesson_num == 4:
        if 'おきます' in kana or '起きます' in kanji:
            return [{"ja": "毎朝6時に起きて、ジョギングをします。", "kana": "まいあさろくじにおきて、じょぎんぐをします。", "vi": "Mỗi sáng tôi thức dậy lúc 6 giờ rồi đi chạy bộ."}]
        elif 'ねます' in kana or '寝ます' in kanji:
            return [{"ja": "昨夜は11時に寝ました。", "kana": "ゆうべはじゅういちじにねました。", "vi": "Tối hôm qua tôi đã đi ngủ lúc 11 giờ."}]
        elif 'はたらきます' in kana or '働きます' in kanji:
            return [{"ja": "月曜日から金曜日まで会社で働きます。", "kana": "げつようびからきんようびまでかいしゃではたらきます。", "vi": "Tôi làm việc ở công ty từ thứ Hai đến thứ Sáu."}]
        elif 'べんきょう' in kana or '勉強' in kanji:
            return [{"ja": "毎晩2時間日本語を勉強します。", "kana": "まいばんにじかんにほんごをべんきょうします。", "vi": "Mỗi tối tôi học tiếng Nhật 2 tiếng đồng hồ."}]

    if level == 'N5' and lesson_num == 5:
        if 'いきます' in kana or '行きます' in kanji:
            return [{"ja": "日曜日、友達と京都へ行きます。", "kana": "にちようび、ともだちときょうとへいきます。", "vi": "Chủ nhật tôi sẽ đi Kyoto cùng với bạn bè."}]
        elif 'きます' in kana or '来ます' in kanji:
            return [{"ja": "日本へ何で来ましたか。― 飛行機で来ました。", "kana": "にほんへなんできましたか。― ひこうきできました。", "vi": "Bạn đến Nhật Bản bằng gì? ― Tôi đến bằng máy bay."}]
        elif 'かえります' in kana or '帰ります' in kanji:
            return [{"ja": "仕事が終わったら、すぐうちへ帰ります。", "kana": "しごとがおわったら、すぐうちへかえります。", "vi": "Khi công việc kết thúc, tôi về nhà ngay lập tức."}]

    if level == 'N5' and lesson_num == 6:
        if 'たべます' in kana or '食べます' in kanji:
            return [{"ja": "食堂で一緒に昼ごはんを食べませんか。", "kana": "しょくどうでいっしょにひるごはんをたべませんか。", "vi": "Bạn có muốn cùng ăn cơm trưa với tôi ở nhà ăn không?"}]
        elif 'のみます' in kana or '飲みます' in kanji:
            return [{"ja": "毎朝温かいお茶を飲みます。", "kana": "まいあさあたたかいおちゃをのみます。", "vi": "Mỗi buổi sáng tôi đều uống trà ấm."}]
        elif 'みます' in kana or '見ます' in kanji:
            return [{"ja": "週末は家で映画を見ます。", "kana": "しゅうまつはいえでえいがをみます。", "vi": "Cuối tuần tôi ở nhà xem phim."}]

    if level == 'N5' and lesson_num == 8:
        if 'たかい' in kana or '高い' in kanji:
            return [{"ja": "富士山は日本で一番高い山です。", "kana": "ふじさんはにほんでいちばんたかいやまです。", "vi": "Núi Phú Sĩ là ngọn núi cao nhất ở Nhật Bản."}]
        elif 'やすい' in kana or '安い' in kanji:
            return [{"ja": "このスーパーの野菜はとても安くて新鮮です。", "kana": "このすーぱーのやさいはとてもやすくてしんせんです。", "vi": "Rau ở siêu thị này rất rẻ và tươi ngon."}]
        elif 'おいしい' in kana or '美味しい' in kanji:
            return [{"ja": "母が作った料理はとてもおいしいです。", "kana": "ははがつくりょうりはとてもおいしいです。", "vi": "Món ăn mẹ nấu rất là ngon."}]

    # 3. Phân loại theo từ loại (Động từ, Tính từ, Danh từ)
    # Động từ thể ます
    if 'ます' in kana or 'ます' in kanji:
        return [{
            "ja": f"いっしょに {clean_k}。",
            "kana": f"いっしょに {clean_kana}。",
            "vi": f"Chúng ta hãy cùng nhau {clean_m} nhé."
        }]

    # Động từ thể từ điển る / う / つ / く...
    if any(kana.endswith(x) for x in ['る', 'う', 'つ', 'く', 'ぐ', 'す', 'む', 'ぬ', 'ぶ']) and ('động từ' in meaning.lower() or 'làm' in clean_m or 'đi' in clean_m):
        return [{
            "ja": f"日本で {clean_k} ことが好きです。",
            "kana": f"にほんで {clean_kana} ことがすきです。",
            "vi": f"Tôi thích việc {clean_m} ở Nhật Bản."
        }]

    # Tính từ đuôi い
    if kana.endswith('い') and not kana.endswith('たい') and ('tính từ' in meaning.lower() or len(clean_m) <= 15):
        return [{
            "ja": f"この町は とても {clean_k} ですね。",
            "kana": f"このまちは とても {clean_kana} ですね。",
            "vi": f"Thành phố này rất {clean_m} nhỉ."
        }]

    # Tính từ đuôi な
    if 'な' in meaning or 'tính từ' in meaning.lower():
        return [{
            "ja": f"ここは とても {clean_k}な 場所です。",
            "kana": f"ここは とても {clean_kana}な ばしょです。",
            "vi": f"Nơi này là một địa điểm rất {clean_m}."
        }]

    # Danh từ chỉ nơi chốn
    if any(k in meaning.lower() for k in ['nhà', 'trường', 'phòng', 'viện', 'sở', 'ga', 'bến', 'nơi', 'chỗ', 'quán', 'cửa hàng', 'công ty', 'thành phố']):
        return [{
            "ja": f"あした {clean_k}へ 行きます。",
            "kana": f"あした {clean_kana}へ いきます。",
            "vi": f"Ngày mai tôi sẽ đi đến {clean_m}."
        }]

    # Danh từ chỉ người / nghề nghiệp
    if any(k in meaning.lower() for k in ['người', 'nhân viên', 'bác sĩ', 'học sinh', 'sinh viên', 'thầy', 'giáo', 'bạn', 'mẹ', 'bố', 'cha', 'anh', 'chị', 'em']):
        return [{
            "ja": f"あの 方は {clean_k} です。",
            "kana": f"あのかたは {clean_kana} です。",
            "vi": f"Vị kia là {clean_m}."
        }]

    # Danh từ chỉ đồ vật / thức ăn / phương tiện
    if any(k in meaning.lower() for k in ['sách', 'báo', 'nước', 'bánh', 'cơm', 'trà', 'xe', 'áo', 'quần', 'máy', 'tiền', 'vé', 'quà', 'hoa']):
        return [{
            "ja": f"昨日 新しい {clean_k}を 買いました。",
            "kana": f"きのう あたらしい {clean_kana}を かいました。",
            "vi": f"Hôm qua tôi đã mua {clean_m} mới."
        }]

    # Mẫu tổng quát tự nhiên cho từ vựng
    return [{
        "ja": f"会話で よく「{clean_k}」を 使います。",
        "kana": f"かいわで よく「{clean_kana}」を つかいます。",
        "vi": f"Trong hội thoại giao tiếp thường xuyên sử dụng từ「{clean_m}」."
    }]

def process_file(file_path):
    print(f"Processing: {file_path}")
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    updated_count = 0
    total_words = 0

    for lesson_group in data:
        l_num = lesson_group.get('lesson', 1)
        l_lvl = lesson_group.get('level', 'N5')
        words = lesson_group.get('words', [])

        for w in words:
            total_words += 1
            # Tạo ví dụ chuẩn xác
            examples = generate_sentence_for_word(w, l_num, l_lvl)
            w['examples'] = examples
            updated_count += 1

    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"✓ Hoàn thành: {updated_count}/{total_words} từ vựng đã được bổ sung câu ví dụ & Kaiwa ngữ pháp!")

if __name__ == '__main__':
    base_dir = '/Users/ghan81/Downloads/LearnJPD/src/data'
    
    # 1. minna_lessons.json (50 bài Minna no Nihongo)
    minna_path = os.path.join(base_dir, 'minna_lessons.json')
    if os.path.exists(minna_path):
        process_file(minna_path)

    # 2. vocab folder (N5, N4, N3, N2, N1)
    vocab_dir = os.path.join(base_dir, 'vocab')
    for fname in ['n5_lessons.json', 'n4_lessons.json', 'n3_lessons.json', 'n2_lessons.json', 'n1_lessons.json']:
        p = os.path.join(vocab_dir, fname)
        if os.path.exists(p):
            process_file(p)
