import json

# Full official grammar points for Minna no Nihongo N5 (Lessons 1-25)
grammar_lessons_n5 = [
  # Lesson 1
  {
    "lesson": 1,
    "title": "Bài 1: Giới thiệu bản thân, nghề nghiệp & quốc tịch",
    "level": "N5",
    "points": [
      {
        "id": "g1-1",
        "structure": "N1 は N2 です",
        "meaning": "N1 là N2",
        "explanation": "Trợ từ 「は」(đọc là wa) biểu thị rằng danh từ đứng trước nó (N1) là chủ đề của câu văn. Người nói đặt は sau chủ đề mà mình muốn nói đến và thêm vị ngữ phía sau để giải thích. 「です」đi sau danh từ N2 để tạo thành vị ngữ, vừa biểu thị sự phán đoán khẳng định, vừa thể hiện thái độ lịch sự với người nghe.",
        "examples": [
          {"ja": "私は マイク・ミラーです。", "kana": "わたしは まいく・みらーです。", "vi": "Tôi là Mike Miller."},
          {"ja": "サントスさんは 会社員です。", "kana": "さんとすさんは かいしゃいんです。", "vi": "Anh Santos là nhân viên công ty."}
        ]
      },
      {
        "id": "g1-2",
        "structure": "N1 は N2 じゃ（では）ありません",
        "meaning": "N1 không phải là N2",
        "explanation": "「じゃありません」hoặc「ではありません」là dạng phủ định lịch sự của「です」. Trong đàm thoại hàng ngày thường dùng「じゃありません」, trong văn viết hoặc diễn văn trang trọng dùng「ではありません」.",
        "examples": [
          {"ja": "サントスさんは 学生じゃ ありません。", "kana": "さんとすさんは がくせいじゃ ありません。", "vi": "Anh Santos không phải là sinh viên."},
          {"ja": "ミラーさんは 先生では ありません。", "kana": "みらーさんは せんせいでは ありません。", "vi": "Anh Miller không phải là giáo viên."}
        ]
      },
      {
        "id": "g1-3",
        "structure": "N1 は N2 ですか",
        "meaning": "N1 có phải là N2 không?",
        "explanation": "Trợ từ「か」ở cuối câu tạo thành câu hỏi nghi vấn. Lên giọng ở cuối câu. Đúng trả lời:「はい、そうです」(hoặc nhắc lại vị ngữ); Sai trả lời:「いいえ、そうじゃありません」.",
        "examples": [
          {"ja": "ミラーさんは アメリカ人ですか。", "kana": "みらーさんは あめりかじんですか。", "vi": "Anh Miller có phải người Mỹ không? — Vâng, là người Mỹ."},
          {"ja": "あの方は どなたですか。", "kana": "あのかたは どなたですか。", "vi": "Vị kia là ai thế? — Là giáo sư Watt."}
        ]
      },
      {
        "id": "g1-4",
        "structure": "N も",
        "meaning": "N cũng...",
        "explanation": "Trợ từ「も」thay thế cho「は」khi danh từ có cùng đặc tính với danh từ đã nhắc phía trước.",
        "examples": [
          {"ja": "ミラーさんは 会社員です。グプタさんも 会社員です。", "kana": "みらーさんは かいしゃいんです。ぐぷたさんも かいしゃいんです。", "vi": "Anh Miller là nhân viên công ty. Anh Gupta cũng là nhân viên công ty."}
        ]
      },
      {
        "id": "g1-5",
        "structure": "N1 の N2",
        "meaning": "N2 của N1 / N2 thuộc N1",
        "explanation": "Trợ từ「の」nối 2 danh từ. N1 bổ nghĩa cho N2, biểu thị sở hữu hoặc trực thuộc một tổ chức, công ty.",
        "examples": [
          {"ja": "ミラーさんは IMCの 社員です。", "kana": "みらーさんは あいえむしーの しゃいんです。", "vi": "Anh Miller là nhân viên công ty IMC."}
        ]
      },
      {
        "id": "g1-6",
        "structure": "～さん / ～ちゃん / Lưu ý về あなた",
        "meaning": "Hậu tố xưng hô lịch sự",
        "explanation": "Dùng「さん」sau tên người khác để lịch sự. Không dùng cho bản thân. Trẻ em dùng「ちゃん」. Tránh lạm dụng「あなた」khi đã biết tên người đối diện.",
        "examples": [
          {"ja": "あの方は ミラーさんです。", "kana": "あのかたは みらーさんです。", "vi": "Vị kia là anh Miller."},
          {"ja": "テレサちゃんは ９歳です。", "kana": "てれさちゃんは きゅうさいです。", "vi": "Bé Teresa 9 tuổi."}
        ]
      }
    ]
  },
  # Lesson 2
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
          {"ja": "これは 辞書です。", "kana": "これは じしょです。", "vi": "Đây là cuốn từ điển."},
          {"ja": "それは 何ですか。これは テレホンカードです。", "kana": "それは なんですか。これは てれほんかーどです。", "vi": "Đó là cái gì? — Đây là thẻ điện thoại."}
        ]
      },
      {
        "id": "g2-2",
        "structure": "この N / その N / あの N",
        "meaning": "Cái N này / Cái N đó / Cái N kia",
        "explanation": "Bắt buộc đi kèm danh từ ngay phía sau để bổ nghĩa cho danh từ đó.",
        "examples": [
          {"ja": "この 本は 私のです。", "kana": "この ほんは わたしの です。", "vi": "Cuốn sách này là của tôi."},
          {"ja": "その 傘は だれの ですか。", "kana": "その かさは だれの ですか。", "vi": "Chiếc ô đó là của ai?"}
        ]
      },
      {
        "id": "g2-3",
        "structure": "そうです / そうじゃ ありません",
        "meaning": "Đúng vậy / Không phải vậy",
        "explanation": "Dùng để trả lời nhanh cho câu hỏi xác nhận danh từ thay cho việc lặp lại toàn bộ câu.",
        "examples": [
          {"ja": "それは 手帳ですか。はい、そうです。", "kana": "それは てちょうですか。はい、そうです。", "vi": "Đó có phải sổ tay không? — Vâng, đúng vậy."},
          {"ja": "これは 鍵ですか。いいえ、そうじゃ ありません。", "kana": "これは かぎですか。いいえ、そうじゃ ありません。", "vi": "Đây có phải chìa khóa không? — Không, không phải."}
        ]
      },
      {
        "id": "g2-4",
        "structure": "Câu 1 か、Câu 2 か",
        "meaning": "Là phương án 1 hay phương án 2?",
        "explanation": "Câu hỏi lựa chọn giữa 2 đối tượng. Trả lời trực tiếp đối tượng được chọn, không dùng はい/いいえ.",
        "examples": [
          {"ja": "これは 「９」ですか、「７」ですか。「９」です。", "kana": "これは きゅうですか、ななですか。きゅうです。", "vi": "Đây là số 9 hay số 7? — Là số 9."}
        ]
      },
      {
        "id": "g2-5",
        "structure": "N1 の N2 (Nội dung & Sở hữu)",
        "meaning": "N2 về N1 / N2 của N1",
        "explanation": "Trợ từ「の」biểu thị nội dung của sách báo hoặc sở hữu của một ai đó.",
        "examples": [
          {"ja": "これは 日本語の 本です。", "kana": "これは にほんごの ほんです。", "vi": "Đây là sách tiếng Nhật."},
          {"ja": "これは だれの 傘ですか。佐藤さんのです。", "kana": "これは だれの かさですか。さとうさんの です。", "vi": "Đây là ô của ai? — Của chị Sato."}
        ]
      }
    ]
  },
  # Lesson 3
  {
    "lesson": 3,
    "title": "Bài 3: Vị trí, địa điểm, phòng ốc & mua sắm",
    "level": "N5",
    "points": [
      {
        "id": "g3-1",
        "structure": "ここ / そこ / あそこ / どこ",
        "meaning": "Chỗ này / Chỗ đó / Chỗ kia / Ở đâu",
        "explanation": "Đại từ chỉ nơi chốn: ここ (gần người nói), そこ (gần người nghe), あそこ (xa cả hai), どこ (ở đâu).",
        "examples": [
          {"ja": "ここは 教室です。", "kana": "ここは きょうしつです。", "vi": "Đây là phòng học."},
          {"ja": "お手洗いは どこですか。あそこです。", "kana": "おてあらいは どこですか。あそこです。", "vi": "Nhà vệ sinh ở đâu vậy? — Ở đằng kia ạ."}
        ]
      },
      {
        "id": "g3-2",
        "structure": "こちら / そちら / あちら / どちら",
        "meaning": "Hướng này / Hướng đó / Hướng kia / Hướng nào, ở đâu (lịch sự)",
        "explanation": "Dạng trang trọng, lịch sự của ここ/そこ/あそこ/どこ, dùng chỉ phương hướng hoặc hỏi về công ty, quê quán đối phương.",
        "examples": [
          {"ja": "エレベーターは どちらですか。あちらです。", "kana": "えれべーたーは どちらですか。あちらです。", "vi": "Thang máy ở hướng nào? — Ở phía kia ạ."},
          {"ja": "お国は どちらですか。ベトナムです。", "kana": "おくには どちらですか。べとなむです。", "vi": "Quê bạn ở đâu? — Là Việt Nam."}
        ]
      },
      {
        "id": "g3-3",
        "structure": "N1 は N2 (Địa điểm) です",
        "meaning": "N1 ở địa điểm N2",
        "explanation": "Mẫu câu chỉ vị trí, nơi chốn của người, đồ vật hoặc cơ quan phòng ban.",
        "examples": [
          {"ja": "ミラーさんは 会議室です。", "kana": "みらーさんは かいぎしつです。", "vi": "Anh Miller đang ở phòng họp."}
        ]
      },
      {
        "id": "g3-4",
        "structure": "N1 の N2 (Xuất xứ / Hãng sản xuất)",
        "meaning": "N2 của hãng N1 / nước N1",
        "explanation": "Biểu thị N2 được sản xuất tại nước N1 hoặc do công ty N1 chế tạo.",
        "examples": [
          {"ja": "これは 日本の カメラです。", "kana": "これは にほんの かめらです。", "vi": "Đây là máy ảnh Nhật Bản."}
        ]
      },
      {
        "id": "g3-5",
        "structure": "～は いくらですか",
        "meaning": "... giá bao nhiêu tiền?",
        "explanation": "Hỏi giá tiền đồ vật trong mua bán. Đơn vị tiền tệ Nhật Bản là 円 (Yên).",
        "examples": [
          {"ja": "この ワインは いくらですか。２５００円です。", "kana": "この わいんは いくらですか。にせんごひゃくえんです。", "vi": "Rượu vang này bao nhiêu tiền? — 2500 Yên."}
        ]
      }
    ]
  },
  # Lesson 4
  {
    "lesson": 4,
    "title": "Bài 4: Thời gian, giờ giấc & động từ Vます / Vました",
    "level": "N5",
    "points": [
      {
        "id": "g4-1",
        "structure": "今 ～時 ～分です",
        "meaning": "Bây giờ là ... giờ ... phút",
        "explanation": "Nói về thời gian. Giờ là「～時」(ji), phút là「～分」(fun/pun), rưỡi là「半」(han). Từ hỏi: 何時, 何分.",
        "examples": [
          {"ja": "今 何時ですか。７時半です。", "kana": "いま なんじですか。しちじはんです。", "vi": "Bây giờ là mấy giờ? — 7 rưỡi."}
        ]
      },
      {
        "id": "g4-2",
        "structure": "Vます / Vません / Vました / Vませんでした",
        "meaning": "Khẳng định, phủ định và quá khứ của động từ",
        "explanation": "Vます (hiện tại/tương lai khẳng định), Vません (phủ định), Vました (quá khứ khẳng định), Vませんでした (quá khứ phủ định).",
        "examples": [
          {"ja": "毎朝 ６時に 起きます。", "kana": "まいあさ ろくじに おきます。", "vi": "Mỗi sáng tôi dậy lúc 6 giờ."},
          {"ja": "昨日の晩 勉強しませんでした。", "kana": "きのうのばん べんきょうしませんでした。", "vi": "Tối qua tôi đã không học bài."}
        ]
      },
      {
        "id": "g4-3",
        "structure": "N (Thời gian) に V",
        "meaning": "Làm V vào lúc N",
        "explanation": "Trợ từ「に」đặt sau mốc thời gian có con số cụ thể (giờ, ngày, tháng). Không dùng に với thời gian tương đối như 今日, 毎朝, 来週.",
        "examples": [
          {"ja": "毎晩 １１時に 寝ます。", "kana": "まいばん じゅういちじに ねます。", "vi": "Mỗi tối tôi đi ngủ lúc 11 giờ."}
        ]
      },
      {
        "id": "g4-4",
        "structure": "N1 から N2 まで",
        "meaning": "Từ N1 đến N2",
        "explanation": "から biểu thị điểm bắt đầu (thời gian hoặc không gian), まで biểu thị điểm kết thúc.",
        "examples": [
          {"ja": "銀行は ９時から ３時までです。", "kana": "ぎんこうは くじから さんじまでです。", "vi": "Ngân hàng mở từ 9 giờ đến 3 giờ."}
        ]
      },
      {
        "id": "g4-5",
        "structure": "N1 と N2",
        "meaning": "N1 và N2",
        "explanation": "Trợ từ「と」nối hai danh từ theo quan hệ liệt kê đầy đủ.",
        "examples": [
          {"ja": "休みは 土曜日と 日曜日です。", "kana": "やすみは どようびと にちようびです。", "vi": "Ngày nghỉ là thứ Bảy và Chủ Nhật."}
        ]
      }
    ]
  },
  # Lesson 5
  {
    "lesson": 5,
    "title": "Bài 5: Đi lại, phương tiện & địa điểm ～へ 行きます",
    "level": "N5",
    "points": [
      {
        "id": "g5-1",
        "structure": "N (Địa điểm) へ 行きます / 来ます / 帰ります",
        "meaning": "Đi / Đến / Về [địa điểm N]",
        "explanation": "Trợ từ「へ」(đọc là e) đặt sau danh từ chỉ nơi chốn để chỉ hướng và đích đến của chuyển động.",
        "examples": [
          {"ja": "私は 京都へ 行きます。", "kana": "わたしは きょうとへ いきます。", "vi": "Tôi đi Kyoto."},
          {"ja": "日本へ 来ました。", "kana": "にほんへ きました。", "vi": "Tôi đã đến Nhật Bản."}
        ]
      },
      {
        "id": "g5-2",
        "structure": "どこ [へ] も 行きません / 行きませんでした",
        "meaning": "Không đi đâu cả",
        "explanation": "Kết hợp từ nghi vấn (どこ, 何, だれ) + も + thể phủ định để phủ định hoàn toàn.",
        "examples": [
          {"ja": "日曜日は どこも 行きませんでした。", "kana": "にちようびは どこも いきませんでした。", "vi": "Chủ nhật tôi đã không đi đâu cả."}
        ]
      },
      {
        "id": "g5-3",
        "structure": "N (Phương tiện) で 行きます",
        "meaning": "Đi bằng phương tiện N",
        "explanation": "Trợ từ「で」chỉ phương tiện di chuyển. Lưu ý: Đi bộ dùng「歩いて」(aruite) và không thêm で.",
        "examples": [
          {"ja": "電車で 行きます。", "kana": "でんしゃで いきます。", "vi": "Tôi đi bằng tàu điện."},
          {"ja": "駅から 歩いて 帰りました。", "kana": "えきから あるいて かえりました。", "vi": "Tôi đã đi bộ từ ga về."}
        ]
      },
      {
        "id": "g5-4",
        "structure": "N (Người) と V",
        "meaning": "Làm V cùng với N",
        "explanation": "Trợ từ「と」chỉ người hoặc động vật cùng làm hành động. Làm một mình dùng「ひとりで」không có と.",
        "examples": [
          {"ja": "家族と 日本へ 来ました。", "kana": "かぞくと にほんへ きました。", "vi": "Tôi đã đến Nhật cùng gia đình."}
        ]
      },
      {
        "id": "g5-5",
        "structure": "いつ Vますか",
        "meaning": "Khi nào làm V?",
        "explanation": "Từ để hỏi thời gian. Phía sau いつ không đi với trợ từ に.",
        "examples": [
          {"ja": "いつ 日本へ 来ましたか。３月に 来ました。", "kana": "いつ にほんへ きましたか。さんがつに きました。", "vi": "Khi nào bạn đến Nhật? — Tôi đến vào tháng 3."}
        ]
      }
    ]
  },
  # Lesson 6
  {
    "lesson": 6,
    "title": "Bài 6: Tân ngữ, ăn uống & rủ rê ～を Vます / ～ませんか",
    "level": "N5",
    "points": [
      {
        "id": "g6-1",
        "structure": "N を V (Ngoại động từ)",
        "meaning": "Làm V đối với N",
        "explanation": "Trợ từ「を」(đọc là o) đánh dấu tân ngữ trực tiếp chịu tác động của hành động.",
        "examples": [
          {"ja": "ご飯を 食べます。", "kana": "ごはんを たべます。", "vi": "Tôi ăn cơm."},
          {"ja": "水を 飲みます。", "kana": "みずを のみます。", "vi": "Tôi uống nước."}
        ]
      },
      {
        "id": "g6-2",
        "structure": "何（なに）を しますか",
        "meaning": "Làm cái gì?",
        "explanation": "Dùng hỏi hành động. Động từ します kết hợp với danh từ thể thao, sự kiện (サッカーをします, パーティーをします).",
        "examples": [
          {"ja": "昨日 何を しましたか。サッカーを しました。", "kana": "きのう なにを しましたか。さっかーを しました。", "vi": "Hôm qua bạn làm gì? — Tôi chơi đá bóng."}
        ]
      },
      {
        "id": "g6-3",
        "structure": "N (Địa điểm) で V",
        "meaning": "Làm V tại địa điểm N",
        "explanation": "Trợ từ「で」chỉ nơi chốn diễn ra một hành động cụ thể.",
        "examples": [
          {"ja": "駅で 新聞を 買いました。", "kana": "えきで しんぶんを かいました。", "vi": "Tôi mua báo ở ga."}
        ]
      },
      {
        "id": "g6-4",
        "structure": "Vませんか",
        "meaning": "Cùng làm V với tôi nhé? (Lời mời / Rủ rê)",
        "explanation": "Dùng mời mọc, rủ người nghe cùng làm một việc gì đó với thái độ lịch sự.",
        "examples": [
          {"ja": "いっしょに 京都へ 行きませんか。ええ、行きましょう。", "kana": "いっしょに きょうとへ いきませんか。ええ、いきましょう。", "vi": "Cùng đi Kyoto với tôi nhé? — Vâng, đi thôi!"}
        ]
      },
      {
        "id": "g6-5",
        "structure": "Vましょう",
        "meaning": "Chúng ta cùng làm V nào!",
        "explanation": "Đồng ý lời rủ hoặc chủ động đề xuất cùng làm.",
        "examples": [
          {"ja": "ちょっと 休みましょう。", "kana": "ちょっと やすみましょう。", "vi": "Nghỉ một chút nào."}
        ]
      }
    ]
  },
  # Lesson 7
  {
    "lesson": 7,
    "title": "Bài 7: Công cụ, tặng quà & cho nhận ～で / あげます / もらいます",
    "level": "N5",
    "points": [
      {
        "id": "g7-1",
        "structure": "N (Công cụ / Phương tiện) で V",
        "meaning": "Làm V bằng công cụ N",
        "explanation": "Trợ từ「で」chỉ công cụ, phương tiện hoặc ngôn ngữ dùng để thực hiện hành động.",
        "examples": [
          {"ja": "はしで 食べます。", "kana": "はしで たべます。", "vi": "Tôi ăn bằng đũa."},
          {"ja": "日本語で レポートを 書きます。", "kana": "にほんごで れぽーとを かきます。", "vi": "Tôi viết báo cáo bằng tiếng Nhật."}
        ]
      },
      {
        "id": "g7-2",
        "structure": "Từ / Câu は ～語で 何ですか",
        "meaning": "Từ/Câu này trong tiếng ... là gì?",
        "explanation": "Hỏi cách nói của một từ, câu trong ngôn ngữ khác.",
        "examples": [
          {"ja": "「ありがとう」は 英語で 何ですか。「Thank you」です。", "kana": "「ありがとう」は えいごで なんですか。「Thank you」です。", "vi": "Từ 'Arigatou' trong tiếng Anh là gì? — Là 'Thank you'."}
        ]
      },
      {
        "id": "g7-3",
        "structure": "N1 (Người nhận) に N2 を あげます",
        "meaning": "Tặng / Cho N2 cho N1",
        "explanation": "Trợ từ「に」chỉ người nhận hành động trao tặng. Các từ tương tự: 貸します (cho mượn), 教えます (dạy cho).",
        "examples": [
          {"ja": "木村さんに 花を あげました。", "kana": "きむらさんに はなを あげました。", "vi": "Tôi tặng hoa cho chị Kimura."}
        ]
      },
      {
        "id": "g7-4",
        "structure": "N1 (Người cho) に（から）N2 を もらいます",
        "meaning": "Nhận N2 từ N1",
        "explanation": "Biểu thị nhận quà tặng hoặc sự giúp đỡ từ người khác. Trợ từ「に」hoặc「から」chỉ người cho.",
        "examples": [
          {"ja": "山田さんに プレゼントを もらいました。", "kana": "やまださんに ぷれぜんとを もらいました。", "vi": "Tôi nhận quà từ anh Yamada."}
        ]
      },
      {
        "id": "g7-5",
        "structure": "もう Vましたか / まだです",
        "meaning": "Đã làm V chưa? — Vẫn chưa",
        "explanation": "Hỏi một hành động đã làm chưa. Nếu chưa làm trả lời là「いいえ、まだです」(không dùng phủ định quá khứ).",
        "examples": [
          {"ja": "もう 荷物を 送りましたか。いいえ、まだです。", "kana": "もう にもつを おくりましたか。いいえ、まだです。", "vi": "Bạn gửi hành lý chưa? — Chưa, tôi vẫn chưa gửi."}
        ]
      }
    ]
  },
  # Lesson 8
  {
    "lesson": 8,
    "title": "Bài 8: Tính từ đuôi い & Tính từ đuôi な",
    "level": "N5",
    "points": [
      {
        "id": "g8-1",
        "structure": "Tính từ đuôi い / Tính từ đuôi な làm Vị ngữ",
        "meaning": "N thì [Tính từ]",
        "explanation": "Tính từ い giữ nguyên い + です. Tính từ な bỏ な + です. Phủ định: Tính từ い đổi い thành「～くないです」; Tính từ な thêm「～じゃありません」.",
        "examples": [
          {"ja": "富士山は 高いです。", "kana": "ふじさんは たかいです。", "vi": "Núi Phú Sĩ cao."},
          {"ja": "この 部屋は 静かじゃ ありません。", "kana": "この へやは しずかじゃ ありません。", "vi": "Phòng này không yên tĩnh."}
        ]
      },
      {
        "id": "g8-2",
        "structure": "Tính từ bổ nghĩa cho Danh từ",
        "meaning": "Cái N [Tính từ]",
        "explanation": "Tính từ đứng trước danh từ: Tính từ い giữ い; Tính từ な giữ な (きれいな花, 有名な人).",
        "examples": [
          {"ja": "桜は きれいな 花です。", "kana": "さくらは きれいな はなです。", "vi": "Hoa anh đào là loài hoa đẹp."},
          {"ja": "冷たい お茶を 飲みました。", "kana": "つめたい おちゃを のみました。", "vi": "Tôi đã uống trà lạnh."}
        ]
      },
      {
        "id": "g8-3",
        "structure": "とても / あまり",
        "meaning": "Rất / Không ... lắm",
        "explanation": "「とても」đi với câu khẳng định. 「あまり」đi với câu phủ định.",
        "examples": [
          {"ja": "日本の 食べ物は とても おいしいです。", "kana": "にほんの たべものは とても おいしいです。", "vi": "Đồ ăn Nhật rất ngon."},
          {"ja": "この 映画は あまり おもしろくないです。", "kana": "この えいがは あまり おもしろくないです。", "vi": "Phim này không hay lắm."}
        ]
      },
      {
        "id": "g8-4",
        "structure": "N は どうですか / どんな N ですか",
        "meaning": "N thế nào? / Là N như thế nào?",
        "explanation": "どうですか hỏi cảm nhận ý kiến. どんな N ですか hỏi tính chất đặc điểm.",
        "examples": [
          {"ja": "日本の 生活は どうですか。楽しいです。", "kana": "にほんの せいかつは どうですか。たのしいです。", "vi": "Cuộc sống ở Nhật thế nào? — Rất vui."},
          {"ja": "奈良は どんな 町ですか。静かな 町です。", "kana": "ならは どんな まちですか。しずかな まちです。", "vi": "Nara là thành phố như thế nào? — Là thành phố yên bình."}
        ]
      },
      {
        "id": "g8-5",
        "structure": "Câu 1 が、Câu 2",
        "meaning": "Câu 1, nhưng mà Câu 2",
        "explanation": "Trợ từ「が」nối hai mệnh đề có ý nghĩa tương phản đối lập.",
        "examples": [
          {"ja": "日本の 食べ物は おいしいですが、高いです。", "kana": "にほんの たべものは おいしいですが、たかいです。", "vi": "Đồ ăn Nhật Bản ngon, nhưng đắt."}
        ]
      }
    ]
  },
  # Lesson 9
  {
    "lesson": 9,
    "title": "Bài 9: Sở thích, năng lực & lý do ～が好き / わかります / から",
    "level": "N5",
    "points": [
      {
        "id": "g9-1",
        "structure": "N が 好きです / 嫌いです / 上手です / 下手です",
        "meaning": "Thích / Ghét / Giỏi / Kém về N",
        "explanation": "Các tính từ chỉ cảm xúc, năng lực, sở thích đi với trợ từ「が」trước đối tượng.",
        "examples": [
          {"ja": "私は 日本料理が 好きです。", "kana": "わたしは にほんりょうりが すきです。", "vi": "Tôi thích món ăn Nhật Bản."},
          {"ja": "マリアさんは 歌が 上手です。", "kana": "まりあさんは うたが じょうずです。", "vi": "Chị Maria hát rất giỏi."}
        ]
      },
      {
        "id": "g9-2",
        "structure": "N が わかります / あります",
        "meaning": "Hiểu N / Có N (sở hữu)",
        "explanation": "Động từ わかります (hiểu) và あります (có sở hữu: tiền, xe, thời gian) đi kèm trợ từ「が」.",
        "examples": [
          {"ja": "私は 日本語が 少し わかります。", "kana": "わたしは にほんごが すこし わかります。", "vi": "Tôi hiểu một chút tiếng Nhật."},
          {"ja": "時間が ありません。", "kana": "じかんが ありません。", "vi": "Tôi không có thời gian."}
        ]
      },
      {
        "id": "g9-3",
        "structure": "Phó từ chỉ mức độ: よく / だいたい / たくさん / 少し / ぜんぜん",
        "meaning": "Rõ, tốt / Đại khái / Nhiều / Một ít / Hoàn toàn không",
        "explanation": "よく, だいたい, たくさん đi với câu khẳng định. ぜんぜん đi với câu phủ định.",
        "examples": [
          {"ja": "英語が よく わかります。", "kana": "えいごが よく わかります。", "vi": "Tôi hiểu rất rõ tiếng Anh."},
          {"ja": "お金が 全然 ありません。", "kana": "おかねが ぜんぜん ありません。", "vi": "Tôi hoàn toàn không có tiền."}
        ]
      },
      {
        "id": "g9-4",
        "structure": "Câu 1 から、Câu 2",
        "meaning": "Vì Câu 1 nên Câu 2",
        "explanation": "Trợ từ「から」đứng sau câu chỉ nguyên nhân, lý do. Câu 2 chỉ kết quả.",
        "examples": [
          {"ja": "時間が ありませんから、タクシーで 行きます。", "kana": "じかんが ありませんから、たくしーで いきます。", "vi": "Vì không có thời gian nên tôi đi bằng taxi."}
        ]
      },
      {
        "id": "g9-5",
        "structure": "どうして ～ですか",
        "meaning": "Tại sao ...?",
        "explanation": "Dùng để hỏi nguyên nhân, lý do. Trả lời bằng đuôi câu「～から」(vì...).",
        "examples": [
          {"ja": "どうして 昨日 休みましたか。病気でしたから。", "kana": "どうして きのう やすみましたか。びょうきでしたから。", "vi": "Tại sao hôm qua bạn nghỉ? — Vì tôi bị ốm."}
        ]
      }
    ]
  },
  # Lesson 10
  {
    "lesson": 10,
    "title": "Bài 10: Sự tồn tại & vị trí đồ vật ～に～があります / います",
    "level": "N5",
    "points": [
      {
        "id": "g10-1",
        "structure": "N (Địa điểm) に N (Vật/Người) が あります / います",
        "meaning": "Ở địa điểm có đồ vật / người, động vật",
        "explanation": "「あります」dùng cho đồ vật, cây cối, sự vật không chuyển động tự ý thức. 「います」dùng cho người và động vật. Nơi chốn có trợ từ「に」, đối tượng có trợ từ「が」.",
        "examples": [
          {"ja": "机の 上に 本が あります。", "kana": "つくえの うえに ほんが あります。", "vi": "Trên bàn có cuốn sách."},
          {"ja": "庭に 犬が います。", "kana": "にわに いぬが います。", "vi": "Trong vườn có con chó."}
        ]
      },
      {
        "id": "g10-2",
        "structure": "N (Vật/Người) は N (Địa điểm) に あります / います",
        "meaning": "N thì ở địa điểm",
        "explanation": "Khi đưa đối tượng lên làm chủ đề câu bằng trợ từ「は」, vị trí địa điểm đi kèm trợ từ「に」.",
        "examples": [
          {"ja": "ミラーさんは 事務所に います。", "kana": "みらーさんは じむしょに います。", "vi": "Anh Miller đang ở trong văn phòng."},
          {"ja": "東京ディズニーランドは 千葉県に あります。", "kana": "とうきょうでぃずにーらんどは ちばけんに あります。", "vi": "Tokyo Disneyland nằm ở tỉnh Chiba."}
        ]
      },
      {
        "id": "g10-3",
        "structure": "Từ chỉ vị trí: 上, 下, 前, 後ろ, 右, 左, 中, 外, 隣, 近く, 間",
        "meaning": "Trên, dưới, trước, sau, phải, trái, trong, ngoài, cạnh, gần, giữa",
        "explanation": "Các từ chỉ vị trí kết hợp bằng trợ từ の: N1 の 上/下/前/後ろ/中... (trên/dưới/trước/sau N1).",
        "examples": [
          {"ja": "箱の 中に 猫が います。", "kana": "はこの なかに ねこが います。", "vi": "Trong hộp có con mèo."},
          {"ja": "銀行と 郵便局の 間に 本屋が あります。", "kana": "ぎんこうと ゆうびんきょくの あいだに ほんやが あります。", "vi": "Ở giữa ngân hàng và bưu điện có hiệu sách."}
        ]
      },
      {
        "id": "g10-4",
        "structure": "N1 や N2 [など]",
        "meaning": "N1 và N2 [v.v...]",
        "explanation": "Trợ từ「や」dùng để liệt kê không đầy đủ một số danh từ tiêu biểu. Có thể thêm「など」(vân vân) ở cuối.",
        "examples": [
          {"ja": "箱の 中に 手紙や 写真などが あります。", "kana": "はこの なかに てがみや しゃしんなどが あります。", "vi": "Trong hộp có thư, ảnh và nhiều thứ khác."}
        ]
      }
    ]
  },
  # Lesson 11
  {
    "lesson": 11,
    "title": "Bài 11: Số lượng từ, thời lượng & số đếm",
    "level": "N5",
    "points": [
      {
        "id": "g11-1",
        "structure": "Cách đếm số lượng từ & vị trí trong câu",
        "meaning": "Làm V với số lượng N",
        "explanation": "Lượng từ (số đếm) thường đứng NGAY TRƯỚC động từ, không cần thêm trợ từ: [Danh từ + を + Lượng từ + Động từ]. Đếm đồ vật chung: ひとつ, ふたつ, みっつ... Đếm người: ひとり, ふたり, さんにん... Đếm máy móc/xe: ～台. Đếm vật mỏng: ～枚.",
        "examples": [
          {"ja": "りんごを ４つ 買いました。", "kana": "りんごを よっつ かいました。", "vi": "Tôi đã mua 4 quả táo."},
          {"ja": "教室に 学生が ５人 います。", "kana": "きょうしつに がくせいが ごにん います。", "vi": "Trong lớp học có 5 sinh viên."}
        ]
      },
      {
        "id": "g11-2",
        "structure": "いくつ / どのくらい (Từ hỏi số lượng)",
        "meaning": "Mấy cái? / Mất khoảng bao lâu, bao nhiêu?",
        "explanation": "「いくつ」dùng hỏi số lượng đồ vật chung. 「どのくらい」dùng hỏi khoảng thời gian hoặc chi phí.",
        "examples": [
          {"ja": "みかんを いくつ 買いましたか。８つ 買いました。", "kana": "みかんを いくつ かいましたか。やっつ かいました。", "vi": "Bạn mua mấy quả quýt? — Mua 8 quả."},
          {"ja": "東京から 京都まで 新幹線で どのくらい かかりますか。２時間半です。", "kana": "とうきょうから きょうとまで しんかんせんで どのくらい かかりますか。にじかんはんです。", "vi": "Từ Tokyo đến Kyoto đi Shinkansen mất khoảng bao lâu? — Mất 2 tiếng rưỡi."}
        ]
      },
      {
        "id": "g11-3",
        "structure": "Lượng từ (Thời gian) に ～回 V",
        "meaning": "... lần trong khoảng thời gian",
        "explanation": "Biểu thị tần suất thực hiện hành động trong một đơn vị thời gian.",
        "examples": [
          {"ja": "１か月に ２回 映画を 見ます。", "kana": "いっかげつに にかい えいがを みます。", "vi": "Một tháng tôi xem phim 2 lần."}
        ]
      },
      {
        "id": "g11-4",
        "structure": "Lượng từ / Danh từ + だけ",
        "meaning": "Chỉ ...",
        "explanation": "Trợ từ「だけ」biểu thị ý nghĩa giới hạn (chỉ bấy nhiêu thôi, không có thêm).",
        "examples": [
          {"ja": "休みは 日曜日だけです。", "kana": "やすみは にちようびだけです。", "vi": "Ngày nghỉ chỉ có Chủ nhật."},
          {"ja": "リンゴが １つだけ あります。", "kana": "りんごが ひとつだけ あります。", "vi": "Chỉ có duy nhất 1 quả táo."}
        ]
      }
    ]
  },
  # Lesson 12
  {
    "lesson": 12,
    "title": "Bài 12: So sánh hơn, so sánh nhất & quá khứ tính từ",
    "level": "N5",
    "points": [
      {
        "id": "g12-1",
        "structure": "Thời quá khứ của Danh từ & Tính từ な: でした / じゃありませんでした",
        "meaning": "Đã từng là / Đã không phải là...",
        "explanation": "Khẳng định quá khứ: Danh từ / Tính từ な + でした. Phủ định quá khứ: Danh từ / Tính từ な + じゃありませんでした.",
        "examples": [
          {"ja": "昨日は 雨でした。", "kana": "きのうは あめでした。", "vi": "Hôm qua trời đã mưa."},
          {"ja": "昨日の 試験は 簡単じゃ ありませんでした。", "kana": "きのうの しけんは かんたんじゃ ありませんでした。", "vi": "Kỳ thi hôm qua đã không hề dễ."}
        ]
      },
      {
        "id": "g12-2",
        "structure": "Thời quá khứ của Tính từ đuôi い: ～かったです / ～くなかったです",
        "meaning": "Đã [Tính từ] / Đã không [Tính từ]",
        "explanation": "Tính từ い bỏ い + かったです (quá khứ khẳng định); bỏ い + くなかったです (quá khứ phủ định). Riêng tính từ いい đổi thành よかったです / よくなかったです.",
        "examples": [
          {"ja": "昨日は 暑かったです。", "kana": "きのうは あつかったです。", "vi": "Hôm qua trời đã rất nóng."},
          {"ja": "旅行は あまり 楽しくなかったです。", "kana": "りょこうは あまり たのしくなかったです。", "vi": "Chuyến du lịch đã không vui lắm."}
        ]
      },
      {
        "id": "g12-3",
        "structure": "N1 は N2 より Tính từ です",
        "meaning": "N1 [Tính từ] hơn N2 (So sánh hơn)",
        "explanation": "So sánh giữa 2 đối tượng N1 và N2. N1 là chủ thể mang tính chất nổi trội hơn N2.",
        "examples": [
          {"ja": "新幹線は 飛行機より 安いです。", "kana": "しんかんせんは ひこうきより やすいです。", "vi": "Tàu Shinkansen rẻ hơn máy bay."},
          {"ja": "北海道は 九州より 大きいです。", "kana": "ほっかいどうは きゅうしゅうより おおきいです。", "vi": "Hokkaido lớn hơn Kyushu."}
        ]
      },
      {
        "id": "g12-4",
        "structure": "N1 と N2 と どちらが Tính từ ですか",
        "meaning": "N1 và N2 cái nào [Tính từ] hơn?",
        "explanation": "Câu hỏi so sánh lựa chọn giữa 2 đối tượng. Trả lời:「N1 のほうが Tính từ です」(N1 hơn) hoặc「どちらも Tính từ です」(cả hai đều...).",
        "examples": [
          {"ja": "サッカーと 野球と どちらが おもしろいですか。サッカーの ほうが おもしろいです。", "kana": "さっかーと やきゅうと どちらが おもしろいですか。さっかーの ほうが おもしろいです。", "vi": "Bóng đá và bóng chày môn nào thú vị hơn? — Bóng đá thú vị hơn."}
        ]
      },
      {
        "id": "g12-5",
        "structure": "N [の中] で 何 / だれ / どこ / いつ が いちばん Tính từ ですか",
        "meaning": "Trong phạm vi N, cái gì/ai/ở đâu/khi nào là [Tính từ] nhất?",
        "explanation": "Mẫu câu so sánh nhất trong một tập thể, phạm vi. Trả lời: [Đối tượng] が いちばん Tính từ です.",
        "examples": [
          {"ja": "１年で いつが いちばん 寒いですか。２月が いちばん 寒いです。", "kana": "いちねんで いつが いちばん さむいですか。にがつが いちばん さむいです。", "vi": "Trong 1 năm khi nào lạnh nhất? — Tháng 2 là lạnh nhất."}
        ]
      }
    ]
  },
  # Lesson 13
  {
    "lesson": 13,
    "title": "Bài 13: Mong muốn & mục đích di chuyển ～たい / ～へ Vに行きます",
    "level": "N5",
    "points": [
      {
        "id": "g13-1",
        "structure": "N が 欲しいです",
        "meaning": "Tôi muốn có danh từ N",
        "explanation": "Dùng để biểu thị nguyện vọng muốn có một đồ vật, thứ gì đó. Đối tượng đi với trợ từ「が」. Phủ định: 欲しくないです. Chỉ dùng cho ngôi thứ nhất (tôi) hoặc khi hỏi người nghe.",
        "examples": [
          {"ja": "私は 新しい 車が 欲しいです。", "kana": "わたしは あたらしい くるまが ほしいです。", "vi": "Tôi muốn có một chiếc ô tô mới."},
          {"ja": "今 何が いちばん 欲しいですか。友達が 欲しいです。", "kana": "いま なにが いちばん ほしいですか。ともだちが ほしいです。", "vi": "Bây giờ bạn muốn có cái gì nhất? — Tôi muốn có bạn bè."}
        ]
      },
      {
        "id": "g13-2",
        "structure": "V [bỏ ます] + たいです",
        "meaning": "Muốn làm hành động V",
        "explanation": "Thể hiện nguyện vọng muốn làm một hành động nào đó. Động từ bỏ ます thêm たいです. Cách chia của たい giống như một tính từ đuôi い (たくないです, たかったです). Tân ngữ có thể dùng を hoặc が.",
        "examples": [
          {"ja": "私は 日本へ 行きたいです。", "kana": "わたしは にほんへ いきたいです。", "vi": "Tôi muốn đi Nhật Bản."},
          {"ja": "おなかが 痛いですから、何も 食べたくないです。", "kana": "おなかが いたいですから、なにも たべたくないです。", "vi": "Vì đau bụng nên tôi không muốn ăn gì cả."}
        ]
      },
      {
        "id": "g13-3",
        "structure": "N (Địa điểm) へ V [bỏ ます] / N に 行きます / 来ます / 帰ります",
        "meaning": "Đi / Đến / Về địa điểm để làm V",
        "explanation": "Biểu thị mục đích của sự di chuyển. Động từ bỏ ます hoặc danh từ chỉ hành động (買い物, 勉強) đặt trước trợ từ「に」.",
        "examples": [
          {"ja": "デパートへ お土産を 買いに 行きます。", "kana": "でぱーとへ おみやげを かいに いきます。", "vi": "Tôi đi đến trung tâm thương mại để mua quà lưu niệm."},
          {"ja": "日本へ 経済の 勉強に 来ました。", "kana": "にほんへ けいざいの べんきょうに きました。", "vi": "Tôi đã đến Nhật Bản để học kinh tế."}
        ]
      },
      {
        "id": "g13-4",
        "structure": "どこか / 何か (Trợ từ bất định)",
        "meaning": "Một nơi nào đó / Một cái gì đó",
        "explanation": "Các từ nghi vấn kết hợp với か biểu thị đối tượng không xác định. Có thể lược bỏ trợ từ へ, を.",
        "examples": [
          {"ja": "冬休み どこかへ 行きましたか。いいえ、どこも 行きませんでした。", "kana": "ふゆやすみ どこかへ いきましたか。いいえ、どこも いきませんでした。", "vi": "Nghỉ đông bạn có đi đâu đó không? — Không, tôi không đi đâu cả."}
        ]
      }
    ]
  },
  # Lesson 14
  {
    "lesson": 14,
    "title": "Bài 14: Thể Te: Yêu cầu lịch sự & đang làm gì ～てください / ～ています",
    "level": "N5",
    "points": [
      {
        "id": "g14-1",
        "structure": "Nhóm động từ & Cách chia thể Te (グループ 1, 2, 3)",
        "meaning": "Quy tắc chia thể て của động từ",
        "explanation": "Nhóm 1 (âm trước ます là cột い): い/ち/り -> って; み/び/に -> んで; き -> いて (riêng 行きます -> 行って); ぎ -> いで; し -> して. Nhóm 2 (âm trước ます là cột え hoặc 1 âm tiết cột い): bỏ ます + て. Nhóm 3: します -> して; 来ます (きます) -> 来て (きて).",
        "examples": [
          {"ja": "買います → 買って / 読みます → 読んで / 行きます → 行って", "kana": "かいます → かって / よみます → よんで / いきます → いって", "vi": "Chia thể Te nhóm 1."},
          {"ja": "食べます → 食べて / 勉強します → 勉強して", "kana": "たべます → たべて / べんきょうします → べんきょうして", "vi": "Chia thể Te nhóm 2 và nhóm 3."}
        ]
      },
      {
        "id": "g14-2",
        "structure": "Vてください",
        "meaning": "Xin hãy làm V (Yêu cầu lịch sự)",
        "explanation": "Dùng khi nhờ vả, sai khiến hoặc khuyên nhủ người nghe làm một việc gì đó một cách lịch sự.",
        "examples": [
          {"ja": "すみませんが、名前を 書いて ください。", "kana": "すみませんが、なまえを かいて ください。", "vi": "Xin lỗi, xin hãy viết tên vào đây."},
          {"ja": "日本語で 話して ください。", "kana": "にほんごで はなして ください。", "vi": "Xin hãy nói bằng tiếng Nhật."}
        ]
      },
      {
        "id": "g14-3",
        "structure": "Vています (Hành động đang tiếp diễn)",
        "meaning": "Đang làm V",
        "explanation": "Biểu thị một hành động đang thực sự diễn ra tại thời điểm nói.",
        "examples": [
          {"ja": "今 雨が 降って います。", "kana": "いま あめが ふって います。", "vi": "Bây giờ trời đang mưa."},
          {"ja": "ミラーさんは 今 電話を かけて います。", "kana": "みらーさんは いま でんわを かけて います。", "vi": "Anh Miller bây giờ đang gọi điện thoại."}
        ]
      },
      {
        "id": "g14-4",
        "structure": "Vましょうか",
        "meaning": "Để tôi làm V giúp bạn nhé?",
        "explanation": "Người nói chủ động đưa ra lời đề nghị giúp đỡ người nghe một việc gì đó.",
        "examples": [
          {"ja": "傘を 貸しましょうか。ありがとうございます。", "kana": "かさを かしましょうか。ありがとうございます。", "vi": "Để tôi cho bạn mượn ô nhé? — Cảm ơn bạn rất nhiều."}
        ]
      }
    ]
  },
  # Lesson 15
  {
    "lesson": 15,
    "title": "Bài 15: Cho phép & Cấm đoán ～てもいいですか / ～てはいけません",
    "level": "N5",
    "points": [
      {
        "id": "g15-1",
        "structure": "Vても いいですか",
        "meaning": "Tôi làm V có được không? (Xin phép)",
        "explanation": "Dùng để xin phép đối phương cho phép mình làm một hành động nào đó. Đồng ý:「ええ、いいですよ」; Từ chối khéo:「すみません、ちょっと...」.",
        "examples": [
          {"ja": "ここで 写真を 撮っても いいですか。ええ、いいですよ。", "kana": "ここで しゃしんを とっても いいですか。ええ、いいですよ。", "vi": "Tôi chụp ảnh ở đây có được không? — Vâng, được chứ ạ."}
        ]
      },
      {
        "id": "g15-2",
        "structure": "Vては いけません",
        "meaning": "Không được làm V (Cấm đoán)",
        "explanation": "Dùng để cấm đoán, biểu thị không được phép làm một hành động nào đó (luật lệ, nội quy, cấm hút thuốc, cấm đỗ xe).",
        "examples": [
          {"ja": "ここで たばこを 吸っては いけません。禁煙ですから。", "kana": "ここで たばこを すっては いけません。きんえんですから。", "vi": "Không được hút thuốc ở đây. Vì là khu vực cấm hút thuốc."}
        ]
      },
      {
        "id": "g15-3",
        "structure": "Vています (Trạng thái kết quả & Nghề nghiệp, nơi ở)",
        "meaning": "Đang trong trạng thái / Làm nghề / Sống ở...",
        "explanation": "Không chỉ mang nghĩa hành động đang diễn ra, Vています còn biểu thị kết quả của một hành động vẫn đang duy trì: 結婚しています (đã kết hôn), 知っています (biết), 住んでいます (đang sinh sống), 持っています (đang sở hữu).",
        "examples": [
          {"ja": "私は ハノイに 住んで います。", "kana": "わたしは はのいに すんで います。", "vi": "Tôi đang sống ở Hà Nội."},
          {"ja": "田中さんの 電話番号を 知って いますか。いいえ、知りません。", "kana": "たなかさんの でんわばんごうを しって いますか。いいえ、しりません。", "vi": "Bạn có biết số điện thoại của anh Tanaka không? — Không, tôi không biết (phủ định dùng 知りません)."}
        ]
      }
    ]
  },
  # Lesson 16
  {
    "lesson": 16,
    "title": "Bài 16: Nối hành động & Trình tự thời gian V-てから",
    "level": "N5",
    "points": [
      {
        "id": "g16-1",
        "structure": "Nối câu Động từ: V1-て、V2-て、... V-ます",
        "meaning": "Làm V1, rồi làm V2, rồi...",
        "explanation": "Dùng để nối các hành động diễn ra theo trình tự thời gian liên tiếp. Thì của cả câu được quyết định bởi động từ cuối cùng.",
        "examples": [
          {"ja": "朝 ジョギングを して、シャワーを 浴びて、会社へ 行きます。", "kana": "あさ じょぎんぐを して、しゃわーを あびて、かいしゃへ いきます。", "vi": "Buổi sáng tôi chạy bộ, tắm vòi sen, rồi đi làm."}
        ]
      },
      {
        "id": "g16-2",
        "structure": "Nối câu Tính từ & Danh từ: ～くて / ～で",
        "meaning": "Vừa ... lại vừa ...",
        "explanation": "Tính từ い bỏ い + くて; Tính từ な bỏ な + で; Danh từ + で. Dùng để liệt kê các đặc điểm cùng tính chất tốt hoặc cùng xấu.",
        "examples": [
          {"ja": "この 部屋は 広くて、明るいです。", "kana": "この へやは ひろくて、あかるいです。", "vi": "Căn phòng này vừa rộng vừa sáng."},
          {"ja": "ミラーさんは 親切で、おもしろい 人です。", "kana": "みらーさんは しんせつで、おもしろい ひとです。", "vi": "Anh Miller là người tốt bụng và thú vị."}
        ]
      },
      {
        "id": "g16-3",
        "structure": "V1-てから、V2",
        "meaning": "Sau khi làm V1 thì làm V2",
        "explanation": "Nhấn mạnh hành động V2 chỉ được tiến hành sau khi hành động V1 đã kết thúc hoàn toàn.",
        "examples": [
          {"ja": "国へ 帰ってから、父の 会社で 働きます。", "kana": "くにへ かえってから、ちちの かいしゃで はたらきます。", "vi": "Sau khi về nước, tôi sẽ làm việc ở công ty của bố."}
        ]
      },
      {
        "id": "g16-4",
        "structure": "N1 は N2 が Tính từ です",
        "meaning": "N1 có đặc điểm N2 thì [Tính từ]",
        "explanation": "Dùng để miêu tả đặc điểm bộ phận của một tổng thể (tóc dài, mắt to, chân dài, đồ ăn ngon).",
        "examples": [
          {"ja": "マリアさんは 髪が 長いです。", "kana": "まりあさんは かみが ながいです。", "vi": "Chị Maria có mái tóc dài."}
        ]
      }
    ]
  },
  # Lesson 17
  {
    "lesson": 17,
    "title": "Bài 17: Thể Nai: Xin đừng & Bắt buộc ～ないでください / ～なければなりません",
    "level": "N5",
    "points": [
      {
        "id": "g17-1",
        "structure": "Quy tắc chia thể Nai (V-ない)",
        "meaning": "Thể phủ định ngắn của động từ",
        "explanation": "Nhóm 1: Chuyển âm trước ます từ hàng い sang hàng あ + ない (riêng い -> わない; 書きます -> 書かない, 買います -> 買わない). Nhóm 2: bỏ ます + ない (食べます -> 食べない). Nhóm 3: します -> しない; 来ます (きます) -> こない.",
        "examples": [
          {"ja": "飲みます → 飲まない / 行きます → 行かない", "kana": "のみます → のまない / いきます → いかない", "vi": "Chia thể Nai nhóm 1."},
          {"ja": "見ます → 見ない / 来ます → こない", "kana": "みます → みない / きます → こない", "vi": "Chia thể Nai nhóm 2 và 3."}
        ]
      },
      {
        "id": "g17-2",
        "structure": "Vないで ください",
        "meaning": "Xin đừng làm V",
        "explanation": "Dùng khi yêu cầu, khuyên bảo đối phương không được thực hiện một hành động nào đó một cách lịch sự.",
        "examples": [
          {"ja": "ここで 写真を 撮らないで ください。", "kana": "ここで しゃしんを とらないで ください。", "vi": "Xin đừng chụp ảnh ở đây."},
          {"ja": "無理を しないで ください。", "kana": "むりを しないで ください。", "vi": "Xin đừng làm việc quá sức."}
        ]
      },
      {
        "id": "g17-3",
        "structure": "Vなければ なりません",
        "meaning": "Phải làm V (Bắt buộc)",
        "explanation": "Biểu thị một hành vi bắt buộc phải làm theo quy định, luật pháp hoặc bổn phận đạo đức (động từ thể ない bỏ い + ければなりません).",
        "examples": [
          {"ja": "薬を 飲まなければ なりません。", "kana": "くすりを のまなければ なりません。", "vi": "Tôi phải uống thuốc."},
          {"ja": "パスポートを 見せなければ なりません。", "kana": "ぱすぽーとを みせなければ なりません。", "vi": "Phải xuất trình hộ chiếu."}
        ]
      },
      {
        "id": "g17-4",
        "structure": "Vなくても いいです",
        "meaning": "Không làm V cũng được (Không bắt buộc)",
        "explanation": "Biểu thị rằng việc không thực hiện hành động đó không có vấn đề gì, đối phương không bị ép buộc (động từ thể ない bỏ い + くてもいいです).",
        "examples": [
          {"ja": "明日は 来なくても いいです。", "kana": "あしたは こなくても いいです。", "vi": "Ngày mai bạn không cần đến cũng được."}
        ]
      }
    ]
  },
  # Lesson 18
  {
    "lesson": 18,
    "title": "Bài 18: Thể Từ điển: Khả năng & Trước khi ～ことができます / ～前に",
    "level": "N5",
    "points": [
      {
        "id": "g18-1",
        "structure": "Thể nguyên dạng (Thể từ điển - 辞書形)",
        "meaning": "Dạng cơ bản của động từ trong từ điển",
        "explanation": "Nhóm 1: Chuyển âm trước ます từ hàng い sang hàng う (書きます -> 書く, 飲みます -> 飲む). Nhóm 2: Bỏ ます + る (食べます -> 食べる, 見ます -> 見る). Nhóm 3: します -> する; 来ます (きます) -> 来る (くる).",
        "examples": [
          {"ja": "話します → 話す / 待ちます → 待つ", "kana": "はなします → はなす / まちます → まつ", "vi": "Thể từ điển nhóm 1."},
          {"ja": "寝ます → 寝る / 勉強します → 勉強する", "kana": "ねます → ねる / べんきょうします → べんきょうする", "vi": "Thể từ điển nhóm 2 và 3."}
        ]
      },
      {
        "id": "g18-2",
        "structure": "Vる ことが できます",
        "meaning": "Có thể làm V (Khả năng)",
        "explanation": "Dùng để biểu thị khả năng (năng lực của bản thân hoặc điều kiện hoàn cảnh cho phép thực hiện việc gì đó).",
        "examples": [
          {"ja": "ミラーさんは 漢字を 読むことが できます。", "kana": "みらーさんは かんじを よむことが できます。", "vi": "Anh Miller có thể đọc được chữ Hán."},
          {"ja": "この ホテルで カードを 使うことが できます。", "kana": "この ほてるで かーどを つかうことが できます。", "vi": "Ở khách sạn này có thể dùng thẻ tín dụng."}
        ]
      },
      {
        "id": "g18-3",
        "structure": "私の 趣味は Vること / N です",
        "meaning": "Sở thích của tôi là việc...",
        "explanation": "Dùng để giới thiệu về sở thích. Biến động từ thành cụm danh từ bằng cách thêm こと vào sau thể từ điển.",
        "examples": [
          {"ja": "私の 趣味は 音楽を 聞くことです。", "kana": "わたしの しゅみは おんがくを きくことです。", "vi": "Sở thích của tôi là nghe nhạc."},
          {"ja": "私の 趣味は 写真です。", "kana": "わたしの しゅみは しゃしんです。", "vi": "Sở thích của tôi là nhiếp ảnh."}
        ]
      },
      {
        "id": "g18-4",
        "structure": "V1る / Nの / Thời lượng + 前に、V2",
        "meaning": "Trước khi làm V1 / danh từ N thì làm V2",
        "explanation": "Biểu thị hành động V2 diễn ra trước hành động V1. Chú ý: Động từ đứng trước 前に LUÔN ở thể từ điển, bất kể câu ở thời hiện tại hay quá khứ.",
        "examples": [
          {"ja": "寝る 前に、本を 読みます。", "kana": "ねる まえに、ほんを よみます。", "vi": "Trước khi ngủ, tôi đọc sách."},
          {"ja": "食事の 前に、手を 洗います。", "kana": "しょくじの まえに、てを あらいます。", "vi": "Trước bữa ăn, tôi rửa tay."}
        ]
      }
    ]
  },
  # Lesson 19
  {
    "lesson": 19,
    "title": "Bài 19: Thể Ta: Kinh nghiệm & Liệt kê ～たことがあります / ～たり",
    "level": "N5",
    "points": [
      {
        "id": "g19-1",
        "structure": "Quy tắc chia thể Ta (V-た)",
        "meaning": "Thể quá khứ ngắn của động từ",
        "explanation": "Cách chia thể Ta hoàn toàn giống hệt thể Te, chỉ cần thay て/で bằng た/だ (買った, 読んだ, 行った, 食べた, した, 来た).",
        "examples": [
          {"ja": "書いて → 書いた / 飲んで → 飲んだ", "kana": "かいて → かいた / のんで → のんだ", "vi": "Quy tắc thể Ta giống hệt thể Te."}
        ]
      },
      {
        "id": "g19-2",
        "structure": "Vた ことが あります",
        "meaning": "Đã từng làm V (Kinh nghiệm trong quá khứ)",
        "explanation": "Dùng để nói về một trải nghiệm, kinh nghiệm đã từng xảy ra trong đời. Phủ định:「一度も ありません」(chưa từng làm lần nào).",
        "examples": [
          {"ja": "富士山に 登った ことが あります。", "kana": "ふじさんに のぼった ことが あります。", "vi": "Tôi đã từng leo núi Phú Sĩ."},
          {"ja": "すしを 食べた ことが ありますか。いいえ、一度も ありません。", "kana": "すしを たべた ことが ありますか。いいえ、いちども ありません。", "vi": "Bạn đã từng ăn Sushi chưa? — Chưa, tôi chưa từng ăn lần nào."}
        ]
      },
      {
        "id": "g19-3",
        "structure": "V1たり、V2たり します",
        "meaning": "Lúc thì làm V1, lúc thì làm V2 (Liệt kê hành động)",
        "explanation": "Khác với thể Te nối hành động theo thứ tự liên tiếp, ～たり～たり dùng để liệt kê vài hành động tiêu biểu đại diện trong số nhiều hành động khác nhau.",
        "examples": [
          {"ja": "日曜日は 買い物を したり、映画を 見たり します。", "kana": "にちようびは かいものを したり、えいがを みたり します。", "vi": "Chủ nhật tôi lúc thì đi mua sắm, lúc thì xem phim."}
        ]
      },
      {
        "id": "g19-4",
        "structure": "Tính từ / Danh từ + に / く なります",
        "meaning": "Trở nên / Trở thành...",
        "explanation": "Biểu thị sự biến đổi trạng thái: Tính từ い bỏ い + くなります; Tính từ な bỏ な + になります; Danh từ + になります.",
        "examples": [
          {"ja": "寒く なりました。", "kana": "さむく なりました。", "vi": "Trời đã trở nên lạnh hơn."},
          {"ja": "元気になりました。", "kana": "げんきに なりました。", "vi": "Tôi đã khỏe trở lại."}
        ]
      }
    ]
  },
  # Lesson 20
  {
    "lesson": 20,
    "title": "Bài 20: Thể Thông thường (Futsuukei) trong giao tiếp thân mật",
    "level": "N5",
    "points": [
      {
        "id": "g20-1",
        "structure": "Thể thông thường (普通形) vs Thể lịch sự (丁寧形)",
        "meaning": "Cách nói thân mật trong tiếng Nhật",
        "explanation": "Động từ: Vます -> Vる; Vません -> Vない; Vました -> Vた; Vませんでした -> Vなかった. Danh từ & Tính từ な: です -> だ; じゃない; だった; じゃなかった. Tính từ い: giữ nguyên tính từ bỏ です. Dùng khi nói chuyện với bạn bè, người thân hoặc cấp dưới.",
        "examples": [
          {"ja": "明日 東京へ 行く？ うん、行く。", "kana": "あした とうきょうへ いく？ うん、いく。", "vi": "Mai đi Tokyo không? — Ừ, có đi."},
          {"ja": "今日は 暇？ ううん、暇じゃない。", "kana": "きょうは ひま？ ううん、ひまじゃない。", "vi": "Hôm nay rảnh không? — Không, không rảnh."}
        ]
      },
      {
        "id": "g20-2",
        "structure": "Hội thoại thân mật: Bỏ trợ từ, lên giọng cuối câu",
        "meaning": "Quy tắc đàm thoại thể ngắn",
        "explanation": "Trong văn nói thân mật, trợ từ「か」ở câu hỏi thường được bỏ đi và thay bằng việc lên giọng ở cuối câu. Các trợ từ は, が, を thường được lược bỏ nếu nghĩa đã rõ.",
        "examples": [
          {"ja": "ご飯 食べた？ うん、もう 食べた。", "kana": "ごはん たべた？ うん、もう たべた。", "vi": "Ăn cơm chưa? — Ừ, ăn rồi."},
          {"ja": "コーヒー 飲む？", "kana": "こーひー のむ？", "vi": "Uống cà phê không?"}
        ]
      }
    ]
  },
  # Lesson 21
  {
    "lesson": 21,
    "title": "Bài 21: Ý kiến cá nhân & Trích dẫn ～と思います / ～と言いました",
    "level": "N5",
    "points": [
      {
        "id": "g21-1",
        "structure": "Thể thông thường + と 思います",
        "meaning": "Tôi nghĩ rằng...",
        "explanation": "Dùng để bày tỏ quan điểm, suy nghĩ, phán đoán chủ quan của bản thân người nói.",
        "examples": [
          {"ja": "明日は いい 天気に なると 思います。", "kana": "あしたは いい てんきに なると おもいます。", "vi": "Tôi nghĩ ngày mai trời sẽ đẹp."},
          {"ja": "日本は 物価が 高いと 思います。", "kana": "にほんは ぶっかが たかいと おもいます。", "vi": "Tôi nghĩ giá cả ở Nhật Bản đắt đỏ."}
        ]
      },
      {
        "id": "g21-2",
        "structure": "Câu / Thể thông thường + と 言いました",
        "meaning": "Ai đó đã nói rằng...",
        "explanation": "Dùng để trích dẫn lời nói của người khác (trích dẫn trực tiếp đặt trong ngoặc vuông「...」, trích dẫn gián tiếp dùng thể thông thường trước と言いました).",
        "examples": [
          {"ja": "田中さんは 「明日 休みます」と 言いました。", "kana": "たなかさんは 「あした やすみます」と いいました。", "vi": "Anh Tanaka đã nói rằng: 'Ngày mai tôi nghỉ'."},
          {"ja": "ミラーさんは 来週 出張すると 言いました。", "kana": "みらーさんは らいしゅう しゅっちょうすると いいました。", "vi": "Anh Miller nói rằng tuần sau anh ấy sẽ đi công tác."}
        ]
      },
      {
        "id": "g21-3",
        "structure": "Thể thông thường + でしょう？",
        "meaning": "... có đúng không? / ... phải không nhỉ?",
        "explanation": "Dùng khi người nói phán đoán điều gì đó và muốn tìm kiếm sự đồng tình, xác nhận từ người nghe (lên giọng ở でしょう).",
        "examples": [
          {"ja": "明日 パーティーに 行くでしょう？ ええ、行きますよ。", "kana": "あした ぱーてぃーに いくでしょう？ ええ、いきますよ。", "vi": "Ngày mai bạn cũng đi dự tiệc đúng không? — Vâng, đi chứ."}
        ]
      }
    ]
  },
  # Lesson 22
  {
    "lesson": 22,
    "title": "Bài 22: Mệnh đề bổ ngữ cho danh từ (Định ngữ)",
    "level": "N5",
    "points": [
      {
        "id": "g22-1",
        "structure": "[Mệnh đề bổ nghĩa (Thể thông thường)] + Danh từ",
        "meaning": "Cái Danh từ mà...",
        "explanation": "Trong tiếng Nhật, mệnh đề bổ nghĩa LUÔN đứng TRƯỚC danh từ được bổ nghĩa. Động từ trong mệnh đề bổ nghĩa bắt buộc phải chia về thể thông thường. Chủ ngữ trong mệnh đề phụ đi với trợ từ「が」thay vì は.",
        "examples": [
          {"ja": "これは ミラーさんが 住んでいた 家です。", "kana": "これは みらーさんが すんでいた いえです。", "vi": "Đây là ngôi nhà mà anh Miller từng sống."},
          {"ja": "あそこで 本を 読んでいる 人は だれですか。", "kana": "あそこで ほんを よんでいる ひとは だれですか。", "vi": "Người đang đọc sách đằng kia là ai thế?"}
        ]
      },
      {
        "id": "g22-2",
        "structure": "Vる 時間 / 約束 / 用事",
        "meaning": "Thời gian / Cuộc hẹn / Việc bận để làm V",
        "explanation": "Dùng thể nguyên dạng của động từ bổ nghĩa cho các danh từ như 時間 (thời gian), 約束 (cuộc hẹn), 用事 (việc bận).",
        "examples": [
          {"ja": "朝 ご飯を 食べる 時間が ありません。", "kana": "あさ ごはんを たべる じかんが ありません。", "vi": "Buổi sáng tôi không có thời gian ăn cơm."},
          {"ja": "今日は 友達と 会う 約束が あります。", "kana": "きょうは ともだちと あう やくそくが あります。", "vi": "Hôm nay tôi có hẹn gặp bạn."}
        ]
      }
    ]
  },
  # Lesson 23
  {
    "lesson": 23,
    "title": "Bài 23: Khi làm gì & Hễ... thì... ～とき / ～と",
    "level": "N5",
    "points": [
      {
        "id": "g23-1",
        "structure": "Vる / Vない / Tính từ / Nの + とき",
        "meaning": "Khi ... / Lúc ...",
        "explanation": "Dùng để biểu thị thời điểm diễn ra một hành động hoặc trạng thái. Nối: Động từ thể từ điển/thể nai + とき; Tính từ い giữ い; Tính từ な giữ な; Danh từ + の + とき.",
        "examples": [
          {"ja": "道を 渡る とき、車に 注意します。", "kana": "みちを わたる とき、くるまに ちゅういします。", "vi": "Khi qua đường, hãy chú ý xe cộ."},
          {"ja": "暇な とき、音楽を 聞きます。", "kana": "ひまな とき、おんがくを ききます。", "vi": "Khi rảnh rỗi, tôi nghe nhạc."}
        ]
      },
      {
        "id": "g23-2",
        "structure": "Vる とき vs Vた とき",
        "meaning": "Trước khi làm V vs Sau khi làm V xong",
        "explanation": "Vる とき: hành động V chưa hoàn thành tại thời điểm hành động chính xảy ra. Vた とき: hành động V đã hoàn thành xong rồi.",
        "examples": [
          {"ja": "国へ 帰る とき、かばんを 買いました。", "kana": "くにへ かえる とき、かばんを かいました。", "vi": "Trước khi về nước, tôi đã mua cặp (mua tại nơi đang ở)."},
          {"ja": "国へ 帰った とき、かばんを 買いました。", "kana": "くにへ かえった とき、かばんを かいました。", "vi": "Sau khi về nước rồi, tôi mới mua cặp (mua ở quê nhà)."}
        ]
      },
      {
        "id": "g23-3",
        "structure": "Vる と、～",
        "meaning": "Hễ làm V thì... (Tự nhiên / Hệ quả tất yếu)",
        "explanation": "Biểu thị rằng hễ hành động V xảy ra thì một kết quả tất yếu, tự nhiên hoặc chỉ dẫn đường sá sẽ lập tức xuất hiện. Vế sau không dùng mệnh lệnh, ý chí.",
        "examples": [
          {"ja": "この ボタンを 押す と、お釣りが 出ます。", "kana": "この ぼたんを おす と、おつりが でます。", "vi": "Hễ bấm nút này thì tiền thừa sẽ chạy ra."},
          {"ja": "右へ 曲がる と、銀行が あります。", "kana": "みぎへ まがる と、ぎんこうが あります。", "vi": "Hễ rẽ phải là thấy ngay ngân hàng."}
        ]
      }
    ]
  },
  # Lesson 24
  {
    "lesson": 24,
    "title": "Bài 24: Cho và nhận hành động giúp đỡ ～てあげます / ～てもらいます / ～てくれます",
    "level": "N5",
    "points": [
      {
        "id": "g24-1",
        "structure": "Vて あげます",
        "meaning": "Làm giúp ai việc gì đó",
        "explanation": "Người nói làm giúp người khác một việc với lòng tốt (chú ý: tránh dùng trực tiếp với người lớn tuổi vì có sắc thái ban ơn).",
        "examples": [
          {"ja": "私は 妹に 宿題を 教えて あげました。", "kana": "わたしは いもうとに しゅくだいを おしえて あげました。", "vi": "Tôi đã chỉ bài tập giúp em gái."}
        ]
      },
      {
        "id": "g24-2",
        "structure": "Vて もらいます",
        "meaning": "Được / Nhận sự giúp đỡ từ ai",
        "explanation": "Chủ ngữ nhận được một hành động có lợi từ người khác (người làm giúp đi với trợ từ に).",
        "examples": [
          {"ja": "私は 山田さんに 駅まで 送って もらいました。", "kana": "わたしは やまださんに えきまで おくって もらいました。", "vi": "Tôi đã được anh Yamada chở ra tận ga."}
        ]
      },
      {
        "id": "g24-3",
        "structure": "Vて くれます",
        "meaning": "Ai đó làm giúp tôi việc gì",
        "explanation": "Chủ ngữ là người khác làm giúp cho người nói (hoặc người trong gia đình người nói) một việc với lòng tốt. Thể hiện sự biết ơn.",
        "examples": [
          {"ja": "佐藤さんが 傘を 貸して くれました。", "kana": "さとうさんが かさを かして くれました。", "vi": "Chị Sato đã cho tôi mượn ô (tôi rất biết ơn)."}
        ]
      }
    ]
  },
  # Lesson 25
  {
    "lesson": 25,
    "title": "Bài 25: Giả định: Nếu... thì... & Dù... nhưng... ～たら / ～ても",
    "level": "N5",
    "points": [
      {
        "id": "g25-1",
        "structure": "Vたら / Tính từ かったら / N だったら、～",
        "meaning": "Nếu ... thì ... (Điều kiện giả định)",
        "explanation": "Động từ thể Ta thêm ら biểu thị điều kiện giả định. Nếu điều kiện ở vế 1 xảy ra thì sẽ thực hiện vế 2.",
        "examples": [
          {"ja": "雨が 降ったら、出かけません。", "kana": "あめが ふったら、でかけません。", "vi": "Nếu trời mưa, tôi sẽ không đi ra ngoài."},
          {"ja": "安かったら、パソコンを 買いたいです。", "kana": "やすかったら、ぱそこんを かいたいです。", "vi": "Nếu rẻ, tôi muốn mua máy tính."}
        ]
      },
      {
        "id": "g25-2",
        "structure": "Vたら (Sau khi làm V thì...)",
        "meaning": "Sau khi làm V thì sẽ làm...",
        "explanation": "Biểu thị một hành động chắc chắn sẽ xảy ra trong tương lai, sau khi hành động đó xảy ra xong thì sẽ làm hành động tiếp theo.",
        "examples": [
          {"ja": "１０時に なったら、出かけましょう。", "kana": "じゅうじに なったら、でかけましょう。", "vi": "Đến 10 giờ thì chúng ta xuất phát nhé."}
        ]
      },
      {
        "id": "g25-3",
        "structure": "Vても / Tính từ くても / N でも、～",
        "meaning": "Dù ... nhưng vẫn ... (Điều kiện nghịch)",
        "explanation": "Biểu thị sự việc ở vế 2 vẫn diễn ra trái ngược với dự đoán thông thường từ điều kiện vế 1.",
        "examples": [
          {"ja": "雨が 降っても、サッカーを します。", "kana": "あめが ふっても、さっかーを します。", "vi": "Dù trời mưa, chúng tôi vẫn chơi bóng đá."},
          {"ja": "高くても、この 車が 買いたいです。", "kana": "たかくても、この くるまが かいたいです。", "vi": "Dù đắt, tôi vẫn muốn mua chiếc xe này."}
        ]
      },
      {
        "id": "g25-4",
        "structure": "もし / いくら (Phó từ nhấn mạnh)",
        "meaning": "Nếu như (giả định) / Dù cho có ... bao nhiêu đi nữa",
        "explanation": "「もし」dùng đầu câu để nhấn mạnh giả định ～たら. 「いくら」nhấn mạnh mức độ trong câu điều kiện nghịch ～ても.",
        "examples": [
          {"ja": "もし １億円 あったら、世界旅行を したいです。", "kana": "もし いちおくえん あったら、せかいりょこうを したいです。", "vi": "Nếu có 100 triệu Yên, tôi muốn đi du lịch vòng quanh thế giới."},
          {"ja": "いくら 考えても、わかりません。", "kana": "いくら かんがえても、わかりません。", "vi": "Dù có nghĩ bao nhiêu đi nữa tôi vẫn không hiểu."}
        ]
      }
    ]
  }
]

# Load existing data (Lessons 1-50)
with open('src/data/grammar/minna_grammar.json', 'r', encoding='utf-8') as f:
    existing_all = json.load(f)

# Keep lessons 26 to 50
lessons_26_to_50 = [item for item in existing_all if item.get('lesson', 0) > 25]

# Merge: new complete N5 lessons (1-25) + remaining lessons (26-50)
final_dataset = grammar_lessons_n5 + lessons_26_to_50

# Sort by lesson number
final_dataset.sort(key=lambda x: x.get('lesson', 0))

# Save back to src/data/grammar/minna_grammar.json
with open('src/data/grammar/minna_grammar.json', 'w', encoding='utf-8') as f:
    json.dump(final_dataset, f, ensure_ascii=False, indent=2)

print(f"Successfully generated {len(final_dataset)} lessons in minna_grammar.json!")
print("N5 lessons (1-25) now have full official grammar points.")
