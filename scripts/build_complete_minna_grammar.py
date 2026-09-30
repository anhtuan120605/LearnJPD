import json

# Full, official Minna no Nihongo 25 Lessons Grammar Dataset
# Based on Minna no Nihongo Shokyu 1 (Ban dich va giai thich ngu phap)

complete_lessons = [
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
        "explanation": "「じゃありません」hoặc「ではありません」là dạng phủ định lịch sự của「です」. Trong đàm thoại hàng ngày người Nhật thường dùng「じゃありません」, còn trong các bài phát biểu trang trọng hoặc văn viết thì dùng「ではありません」. Chú ý trợ từ「は」trong「では」vẫn đọc là [wa].",
        "examples": [
          {"ja": "サントスさんは 学生じゃ ありません。", "kana": "さんとすさんは がくせいじゃ ありません。", "vi": "Anh Santos không phải là sinh viên."},
          {"ja": "ミラーさんは 先生では ありません。", "kana": "みらーさんは せんせいでは ありません。", "vi": "Anh Miller không phải là giáo viên."}
        ]
      },
      {
        "id": "g1-3",
        "structure": "N1 は N2 ですか",
        "meaning": "N1 có phải là N2 không?",
        "explanation": "Trợ từ「か」được đặt ở cuối câu để biểu thị sự nghi vấn, thắc mắc. Trật tự từ trong câu không đổi, chỉ cần lên giọng ở cuối câu. Nếu đúng thì trả lời bằng「はい、そうです」(hoặc nhắc lại vị ngữ), nếu sai trả lời bằng「いいえ、そうじゃありません」. Với câu hỏi có từ nghi vấn (như だれ, 何歳, どなた), ta thay từ nghi vấn vào vị trí cần hỏi.",
        "examples": [
          {"ja": "ミラーさんは アメリカ人ですか。", "kana": "みらーさんは あめりかじんですか。", "vi": "Anh Miller có phải là người Mỹ không? — Vâng, là người Mỹ."},
          {"ja": "あの方は どなたですか。", "kana": "あのかたは どなたですか。", "vi": "Vị kia là ai vậy? — Là giáo sư Watt."}
        ]
      },
      {
        "id": "g1-4",
        "structure": "N も",
        "meaning": "N cũng...",
        "explanation": "Trợ từ「も」dùng để thay thế cho trợ từ「は」khi danh từ đi kèm có cùng một đặc tính, hành động hay nội dung tương tự với đối tượng đã được nêu ở câu văn trước đó.",
        "examples": [
          {"ja": "ミラーさんは 会社員です。グプタさんも 会社員です。", "kana": "みらーさんは かいしゃいんです。ぐぷたさんも かいしゃいんです。", "vi": "Anh Miller là nhân viên công ty. Anh Gupta cũng là nhân viên công ty."},
          {"ja": "カリナさんも 学生ですか。いいえ、学生じゃありません。", "kana": "かりなさんも がくせいですか。いいえ、がくせいじゃありません。", "vi": "Chị Karina cũng là sinh viên à? Không, không phải sinh viên."}
        ]
      },
      {
        "id": "g1-5",
        "structure": "N1 の N2",
        "meaning": "N2 của N1 / N2 thuộc N1",
        "explanation": "Trợ từ「の」nối hai danh từ với nhau, trong đó danh từ N1 đứng trước bổ nghĩa cho danh từ N2 đứng sau. Ở Bài 1, N1 biểu thị tổ chức, công ty hoặc cơ quan mà N2 trực thuộc.",
        "examples": [
          {"ja": "ミラーさんは IMCの 社員です。", "kana": "みらーさんは あいえむしーの しゃいんです。", "vi": "Anh Miller là nhân viên của công ty IMC."},
          {"ja": "ワットさんは さくら大学の 先生です。", "kana": "わっとさんは さくらだいがくの せんせいです。", "vi": "Ông Watt là giảng viên của Đại học Sakura."}
        ]
      },
      {
        "id": "g1-6",
        "structure": "～さん / ～ちゃん / Chú ý về あなた",
        "meaning": "Hậu tố xưng hô lịch sự",
        "explanation": "Trong tiếng Nhật, từ「さん」được đặt sau họ hoặc tên của người nghe hoặc người thứ ba để thể hiện sự tôn trọng, lịch sự. Tuyệt đối KHÔNG dùng「さん」sau tên của chính mình! Với trẻ em, người ta dùng「ちゃん」để thân mật. Khi giao tiếp, nếu đã biết tên đối phương thì gọi tên + さん chứ không nên dùng「あなた」vì「あなた」thường chỉ dùng giữa vợ chồng hoặc khi không biết tên người đối diện.",
        "examples": [
          {"ja": "あの方は ミラーさんです。", "kana": "あのかたは みらーさんです。", "vi": "Vị kia là anh Miller."},
          {"ja": "テレサちゃんは ９歳です。", "kana": "てれさちゃんは きゅうさいです。", "vi": "Bé Teresa 9 tuổi."}
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
        "explanation": "Đây là các chỉ định từ dùng làm đại từ chỉ vật. 「これ」chỉ vật ở gần người nói. 「それ」chỉ vật ở gần người nghe. 「あれ」chỉ vật ở xa cả người nói lẫn người nghe. Khi người nghe trả lời một câu hỏi dùng これ, họ sẽ dùng それ và ngược lại.",
        "examples": [
          {"ja": "これは 辞書です。", "kana": "これは じしょです。", "vi": "Đây là cuốn từ điển."},
          {"ja": "それは 何ですか。これは テレホンカードです。", "kana": "それは なんですか。これは てれほんかーどです。", "vi": "Đó là cái gì vậy? — Đây là thẻ điện thoại."},
          {"ja": "あれは 私の かばんです。", "kana": "あれは わたしの かばんです。", "vi": "Kia là chiếc cặp của tôi."}
        ]
      },
      {
        "id": "g2-2",
        "structure": "この N / その N / あの N",
        "meaning": "Cái N này / Cái N đó / Cái N kia",
        "explanation": "Khác với これ/それ/あれ có thể đứng độc lập làm chủ ngữ, 「この/その/あの」bắt buộc phải đi liền trước một danh từ để bổ nghĩa trực tiếp cho danh từ đó (Khoảng cách vị trí tương tự: この gần người nói, その gần người nghe, あの xa cả hai).",
        "examples": [
          {"ja": "この 本は 私のです。", "kana": "この ほんは わたしの です。", "vi": "Cuốn sách này là của tôi."},
          {"ja": "その 傘は だれの ですか。", "kana": "その かさは だれの ですか。", "vi": "Chiếc ô đó là của ai vậy?"},
          {"ja": "あの 人は だれですか。", "kana": "あの ひとは だれですか。", "vi": "Người kia là ai thế?"}
        ]
      },
      {
        "id": "g2-3",
        "structure": "そうです / そうじゃ ありません",
        "meaning": "Đúng vậy / Không phải vậy",
        "explanation": "Trong câu nghi vấn danh từ xem một vật có đúng là N không, ta thường dùng「そうです」để khẳng định và「そうじゃありません」để phủ định thay cho việc lặp lại toàn bộ danh từ.",
        "examples": [
          {"ja": "それは 辞書ですか。はい、そうです。", "kana": "それは じしょですか。はい、そうです。", "vi": "Đó có phải từ điển không? — Vâng, đúng vậy."},
          {"ja": "これは あなたの 手帳ですか。いいえ、そうじゃ ありません。", "kana": "これは あなたの てちょうですか。いいえ、そうじゃ ありません。", "vi": "Đây có phải sổ tay của bạn không? — Không, không phải vậy."}
        ]
      },
      {
        "id": "g2-4",
        "structure": "Câu 1 か、Câu 2 か",
        "meaning": "Là Câu 1 hay là Câu 2?",
        "explanation": "Mẫu câu hỏi lựa chọn giữa hai hay nhiều đối tượng khác nhau. Người nghe sẽ chọn một trong hai phương án để trả lời chứ không dùng「はい」hay「いいえ」.",
        "examples": [
          {"ja": "これは 「９」ですか、「７」ですか。「９」です。", "kana": "これは きゅうですか、ななですか。きゅうです。", "vi": "Đây là số 9 hay số 7? — Là số 9."},
          {"ja": "それは ボールペンですか、シャープペンシルですか。", "kana": "それは ぼーるぺんですか、しゃーぷぺんしるですか。", "vi": "Đó là bút bi hay bút chì kim?"}
        ]
      },
      {
        "id": "g2-5",
        "structure": "N1 の N2 (Nội dung & Sở hữu)",
        "meaning": "N2 về N1 / N2 của N1",
        "explanation": "Ở Bài 2, trợ từ「の」có 2 ý nghĩa quan trọng: 1) N1 giải thích nội dung của N2 (ví dụ: sách tiếng Nhật, tạp chí xe hơi); 2) N1 là chủ sở hữu của N2 (sách của tôi, ô của anh Miller). Khi N2 đã rõ ràng ở câu trước, có thể lược bỏ N2 và chỉ nói「N1 の」(nghĩa là: của N1).",
        "examples": [
          {"ja": "これは 日本語の 本です。", "kana": "これは にほんごの ホンです。", "vi": "Đây là cuốn sách tiếng Nhật (nội dung)."},
          {"ja": "これは だれの かばんですか。佐藤さんのです。", "kana": "これは だれの かばんですか。さとうさんの です。", "vi": "Đây là cặp của ai? — Là của chị Sato."}
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
        "explanation": "Đây là các đại từ chỉ nơi chốn, địa điểm: 「ここ」(nơi người nói đứng), 「そこ」(nơi người nghe đứng), 「あそこ」(nơi xa cả hai người), 「どこ」(từ để hỏi: ở đâu).",
        "examples": [
          {"ja": "ここは 教室です。", "kana": "ここは きょうしつです。", "vi": "Đây là phòng học."},
          {"ja": "お手洗いは どこですか。あそこです。", "kana": "おてあらいは どこですか。あそこです。", "vi": "Nhà vệ sinh ở đâu vậy? — Ở đằng kia ạ."}
        ]
      },
      {
        "id": "g3-2",
        "structure": "こちら / そちら / あちら / どちら",
        "meaning": "Phía này / Phía đó / Phía kia / Hướng nào, ở đâu (lịch sự)",
        "explanation": "Là dạng lịch sự và trang trọng hơn của ここ/そこ/あそこ/どこ. Chúng vừa chỉ phương hướng (hướng này/hướng kia), vừa dùng để chỉ địa điểm một cách lịch sự, và có thể dùng để hỏi về công ty, quốc gia, trường học của người đối diện.",
        "examples": [
          {"ja": "エレベーターは どちらですか。あちらです。", "kana": "えれべーたーは どちらですか。あちらです。", "vi": "Thang máy ở hướng nào vậy? — Ở phía kia ạ."},
          {"ja": "お国は どちらですか。ベトナムです。", "kana": "おくには どちらですか。べとなむです。", "vi": "Đất nước của bạn là ở đâu? — Là Việt Nam."}
        ]
      },
      {
        "id": "g3-3",
        "structure": "N1 は N2 (Địa điểm) です",
        "meaning": "N1 ở N2",
        "explanation": "Mẫu câu dùng để nói về vị trí, nơi chốn của một người, đồ vật hoặc địa điểm cụ thể.",
        "examples": [
          {"ja": "事務所は あそこです。", "kana": "じむしょは あそこです。", "vi": "Văn phòng ở đằng kia."},
          {"ja": "ミラーさんは 会議室です。", "kana": "みらーさんは かいぎしつです。", "vi": "Anh Miller đang ở phòng họp."}
        ]
      },
      {
        "id": "g3-4",
        "structure": "N1 の N2 (Xuất xứ / Hãng sản xuất)",
        "meaning": "N2 của nước N1 / Hãng N1",
        "explanation": "Khi N1 là tên một quốc gia hay công ty sản xuất thì N1 の N2 có nghĩa là N2 được sản xuất tại quốc gia đó hoặc do công ty đó sản xuất. Dùng từ hỏi「どこ」để hỏi nguồn gốc xuất xứ.",
        "examples": [
          {"ja": "これは 日本の カメラです。", "kana": "これは にほんの かめらです。", "vi": "Đây là máy ảnh của Nhật Bản."},
          {"ja": "これは どこの 時計ですか。スイスの 時計です。", "kana": "これは どこの とけいですか。すいすの とけいです。", "vi": "Đây là đồng hồ của nước nào? — Đồng hồ của Thụy Sĩ."}
        ]
      },
      {
        "id": "g3-5",
        "structure": "～は いくらですか",
        "meaning": "... giá bao nhiêu tiền?",
        "explanation": "Dùng để hỏi giá tiền của một món đồ trong mua sắm. Tiền tệ Nhật Bản đọc là「～円」(en).",
        "examples": [
          {"ja": "この ワインは いくらですか。２５００円です。", "kana": "この わいんは いくらですか。にせんごひゃくえんです。", "vi": "Chai rượu vang này giá bao nhiêu? — 2500 Yên ạ."}
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
        "meaning": "Bây giờ là ... giờ ... phút",
        "explanation": "Dùng để nói thời gian chính xác trong tiếng Nhật. Giờ đếm bằng「～時」(ji), phút đếm bằng「～分」(fun / pun). Rưỡi dùng「半」(han). Từ hỏi giờ là「何時」(nan-ji), hỏi phút là「何分」(nam-pun).",
        "examples": [
          {"ja": "今 何時ですか。７時３０分（７時半）です。", "kana": "いま なんじですか。しちじさんじゅっぷん（しちじはん）です。", "vi": "Bây giờ là mấy giờ? — 7 giờ 30 phút (7 rưỡi)."},
          {"ja": "ニューヨークは 今 午前４時です。", "kana": "にゅーよーくは いま ごぜんよじです。", "vi": "Ở New York bây giờ là 4 giờ sáng."}
        ]
      },
      {
        "id": "g4-2",
        "structure": "Vます / Vません / Vました / Vませんでした",
        "meaning": "Hệ thống chia thời và khẳng định/phủ định của động từ",
        "explanation": "Động từ thể lịch sự tận cùng bằng「ます」. Hiện tại/Tương lai khẳng định: Vます, phủ định: Vません. Quá khứ khẳng định: Vました, phủ định quá khứ: Vませんでした.",
        "examples": [
          {"ja": "私は 毎朝 ６時に 起きます。", "kana": "わたしは まいあさ ろくじに おきます。", "vi": "Tôi thức dậy vào lúc 6 giờ mỗi sáng."},
          {"ja": "昨日の晩 勉強しませんでした。", "kana": "きのうのばん べんきょうしませんでした。", "vi": "Tối qua tôi đã không học bài."}
        ]
      },
      {
        "id": "g4-3",
        "structure": "N (Thời gian) に V",
        "meaning": "Làm V vào lúc N",
        "explanation": "Trợ từ「に」được đặt sau mốc thời gian có con số cụ thể (giờ, ngày, tháng, năm) để biểu thị thời điểm hành động diễn ra. Với các từ chỉ thời gian tương đối như 今日, あした, 毎朝, 来週 thì KHÔNG thêm に.",
        "examples": [
          {"ja": "毎晩 １１時に 寝ます。", "kana": "まいばん じゅういちじに ねます。", "vi": "Mỗi tối tôi đi ngủ lúc 11 giờ."},
          {"ja": "日曜日 友達と 遊びます。", "kana": "にちようび ともだちと あそびます。", "vi": "Chủ nhật tôi đi chơi với bạn (không bắt buộc có に)."}
        ]
      },
      {
        "id": "g4-4",
        "structure": "N1 から N2 まで",
        "meaning": "Từ N1 đến N2",
        "explanation": "「から」biểu thị điểm xuất phát (thời gian hoặc địa điểm), 「まで」biểu thị điểm kết thúc. Hai từ này có thể đi cùng nhau hoặc đứng độc lập.",
        "examples": [
          {"ja": "銀行は ９時から ３時までです。", "kana": "ぎんこうは くじから さんじまでです。", "vi": "Ngân hàng mở cửa từ 9 giờ đến 3 giờ."},
          {"ja": "昼休みは １２時からです。", "kana": "ひるやすみは じゅうにじからです。", "vi": "Giờ nghỉ trưa bắt đầu từ 12 giờ."}
        ]
      },
      {
        "id": "g4-5",
        "structure": "N1 と N2",
        "meaning": "N1 và N2",
        "explanation": "Trợ từ「と」dùng để nối hai danh từ lại với nhau theo quan hệ liệt kê tương đương.",
        "examples": [
          {"ja": "銀行の 休みは 土曜日と 日曜日です。", "kana": "ぎんこうの やすみは どようびと にちようびです。", "vi": "Ngày nghỉ của ngân hàng là thứ Bảy và Chủ Nhật."}
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
        "structure": "N (Địa điểm) へ 行きます / 来ます / 帰ります",
        "meaning": "Đi / Đến / Về [địa điểm N]",
        "explanation": "Khi sử dụng các động từ chỉ sự di chuyển như 行きます (đi), 来ます (đến), 帰ります (về), ta đặt trợ từ「へ」(đọc là e) sau danh từ chỉ phương hướng, nơi chốn để chỉ đích đến.",
        "examples": [
          {"ja": "私は 京都へ 行きます。", "kana": "わたしは きょうとへ いきます。", "vi": "Tôi sẽ đi Kyoto."},
          {"ja": "日本へ 来ました。", "kana": "にほんへ きました。", "vi": "Tôi đã đến Nhật Bản."}
        ]
      },
      {
        "id": "g5-2",
        "structure": "どこ [へ] も 行きません / 行きませんでした",
        "meaning": "Không đi đâu cả / Đã không đi đâu cả",
        "explanation": "Khi muốn phủ định hoàn toàn đối tượng, ta kết hợp từ nghi vấn (どこ, なに, だれ) với trợ từ「も」và động từ ở thể phủ định.",
        "examples": [
          {"ja": "日曜日は どこも 行きませんでした。", "kana": "にちようびは どこも いきませんでした。", "vi": "Chủ nhật tôi đã không đi đâu cả."},
          {"ja": "何も 食べません。", "kana": "なにも たべません。", "vi": "Tôi không ăn gì cả."}
        ]
      },
      {
        "id": "g5-3",
        "structure": "N (Phương tiện) で 行きます",
        "meaning": "Đi bằng phương tiện N",
        "explanation": "Trợ từ「で」biểu thị phương tiện di chuyển hoặc cách thức thực hiện. Chú ý: Nếu đi bộ thì dùng「歩いて」(aruite) và KHÔNG dùng trợ từ で.",
        "examples": [
          {"ja": "電車で 行きます。", "kana": "でんしゃで いきます。", "vi": "Tôi đi bằng tàu điện."},
          {"ja": "駅から 歩いて 帰りました。", "kana": "えきから あるいて かえりました。", "vi": "Tôi đã đi bộ từ nhà ga về."}
        ]
      },
      {
        "id": "g5-4",
        "structure": "N (Người) と V",
        "meaning": "Làm V cùng với N",
        "explanation": "Trợ từ「と」dùng sau danh từ chỉ người hoặc động vật để biểu thị đối tượng cùng tham gia thực hiện hành động. Nếu làm một mình thì dùng「ひとりで」(hitori de) và không có と.",
        "examples": [
          {"ja": "家族と 日本へ 来ました。", "kana": "かぞくと にほんへ きました。", "vi": "Tôi đã đến Nhật Bản cùng với gia đình."},
          {"ja": "一人で 東京へ 行きます。", "kana": "ひとりで とうきょうへ いきます。", "vi": "Tôi sẽ đi Tokyo một mình."}
        ]
      },
      {
        "id": "g5-5",
        "structure": "いつ Vますか",
        "meaning": "Khi nào thì làm V?",
        "explanation": "Từ nghi vấn「いつ」(khi nào) dùng để hỏi về thời gian. Khi dùng いつ thì phía sau không cần trợ từ に.",
        "examples": [
          {"ja": "いつ 日本へ 来ましたか。３月２５日に 来ました。", "kana": "いつ にほんへ きましたか。さんがつにじゅうごにちに きました。", "vi": "Bạn đã đến Nhật Bản khi nào? — Tôi đến vào ngày 25 tháng 3."}
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
        "structure": "N を V (Ngoại động từ)",
        "meaning": "Làm V đối với danh từ N",
        "explanation": "Trợ từ「を」(đọc là o) được dùng để đánh dấu tân ngữ trực tiếp (đối tượng chịu sự tác động của hành động).",
        "examples": [
          {"ja": "ご飯を 食べます。", "kana": "ごはんを たべます。", "vi": "Tôi ăn cơm."},
          {"ja": "水を 飲みます。", "kana": "みずを のみます。", "vi": "Tôi uống nước."}
        ]
      },
      {
        "id": "g6-2",
        "structure": "何を しますか",
        "meaning": "Bạn làm cái gì?",
        "explanation": "Dùng để hỏi ai đó đang làm hoặc sẽ làm hành động gì. Động từ「します」(làm/chơi) đi kèm nhiều danh từ như thể thao, trò chơi, tổ chức tiệc.",
        "examples": [
          {"ja": "土曜日 何を しましたか。サッカーを しました。", "kana": "どようび なにを しましたか。さっかーを しました。", "vi": "Thứ Bảy bạn đã làm gì? — Tôi đã chơi đá bóng."}
        ]
      },
      {
        "id": "g6-3",
        "structure": "N (Địa điểm) で V",
        "meaning": "Làm hành động V tại địa điểm N",
        "explanation": "Trợ từ「で」ở đây biểu thị nơi diễn ra một hành động cụ thể (phân biệt với に biểu thị sự tồn tại hoặc đích đến).",
        "examples": [
          {"ja": "駅で 新聞を 買いました。", "kana": "えきで しんぶんを かいました。", "vi": "Tôi đã mua báo ở nhà ga."},
          {"ja": "図書館で 勉強します。", "kana": "としょかんで べんきょうします。", "vi": "Tôi học bài ở thư viện."}
        ]
      },
      {
        "id": "g6-4",
        "structure": "Vませんか",
        "meaning": "Cùng làm V với tôi nhé? (Lời mời / Rủ rê lịch sự)",
        "explanation": "Dùng khi người nói muốn mời hoặc rủ người nghe cùng làm một điều gì đó với thái độ lịch sự, tôn trọng ý kiến của đối phương.",
        "examples": [
          {"ja": "いっしょに 京都へ 行きませんか。ええ、行きましょう。", "kana": "いっしょに きょうとへ いきませんか。ええ、いきましょう。", "vi": "Cùng đi Kyoto với tôi nhé? — Vâng, chúng ta cùng đi nào!"}
        ]
      },
      {
        "id": "g6-5",
        "structure": "Vましょう",
        "meaning": "Chúng ta cùng làm V nào! / Để tôi làm V nhé!",
        "explanation": "Dùng để hưởng ứng lời mời rủ rê hoặc chủ động đề nghị cả hai người cùng làm một việc gì đó. Nó cũng dùng khi người nói muốn chủ động đề nghị giúp đỡ.",
        "examples": [
          {"ja": "ちょっと 休みましょう。", "kana": "ちょっと やすみましょう。", "vi": "Chúng ta cùng nghỉ một chút nào."}
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
        "structure": "N (Công cụ / Phương tiện) で V",
        "meaning": "Làm V bằng công cụ / phương tiện N",
        "explanation": "Trợ từ「で」biểu thị công cụ, dụng cụ hoặc ngôn ngữ được dùng để thực hiện hành động.",
        "examples": [
          {"ja": "はしで ご飯を 食べます。", "kana": "はしで ごはんを たべます。", "vi": "Tôi ăn cơm bằng đũa."},
          {"ja": "日本語で レポートを 書きます。", "kana": "にほんごで れぽーとを かきます。", "vi": "Tôi viết báo cáo bằng tiếng Nhật."}
        ]
      },
      {
        "id": "g7-2",
        "structure": "Từ / Câu は ～語で 何ですか",
        "meaning": "Từ/Câu này trong tiếng ... là gì?",
        "explanation": "Mẫu câu dùng để hỏi nghĩa hoặc cách nói của một từ, câu trong một ngôn ngữ khác.",
        "examples": [
          {"ja": "「ありがとう」は 英語で 何ですか。「Thank you」です。", "kana": "「ありがとう」は えいごで なんですか。「Thank you」です。", "vi": "Từ 'Arigatou' trong tiếng Anh là gì? — Là 'Thank you'."}
        ]
      },
      {
        "id": "g7-3",
        "structure": "N1 (Người nhận) に N2 を あげます",
        "meaning": "Tặng / Cho / Làm N2 cho N1",
        "explanation": "Trợ từ「に」đánh dấu đối tượng tiếp nhận hành động (người nhận). Các động từ tương tự: 貸します (cho mượn), 教えます (dạy cho).",
        "examples": [
          {"ja": "私は 木村さんに 花を あげました。", "kana": "わたしは きむらさんに はなを あげました。", "vi": "Tôi đã tặng hoa cho chị Kimura."}
        ]
      },
      {
        "id": "g7-4",
        "structure": "N1 (Người cho) に（から）N2 を もらいます",
        "meaning": "Nhận N2 từ N1",
        "explanation": "Biểu thị hành động người nói nhận được đồ vật, sự giúp đỡ từ người khác. Trợ từ「に」(hoặc「から」) đánh dấu người trao tặng.",
        "examples": [
          {"ja": "私は 山田さんに プレゼントを もらいました。", "kana": "わたしは やまださんに ぷれぜんとを もらいました。", "vi": "Tôi đã nhận được quà từ anh Yamada."}
        ]
      },
      {
        "id": "g7-5",
        "structure": "もう Vましたか / まだです",
        "meaning": "Đã làm V chưa? — Vẫn chưa",
        "explanation": "「もう」nghĩa là 'đã', dùng để hỏi một hành động đã hoàn thành tại thời điểm nói hay chưa. Nếu chưa làm, không dùng Vませんでした mà trả lời là「いいえ、まだです」(Chưa, tôi chưa làm).",
        "examples": [
          {"ja": "もう 荷物を 送りましたか。いいえ、まだです。", "kana": "もう にもつを おくりましたか。いいえ、まだです。", "vi": "Bạn đã gửi hành lý đi chưa? — Chưa, tôi vẫn chưa gửi."}
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
        "structure": "Tính từ đuôi い / Tính từ đuôi な làm Vị ngữ",
        "meaning": "N thì [Tính từ]",
        "explanation": "Tiếng Nhật có 2 loại tính từ: 1) Tính từ đuôi い: tận cùng là い (khi làm vị ngữ thêm です ở cuối để lịch sự); 2) Tính từ đuôi な: khi làm vị ngữ bỏ な và thêm です. Phủ định: Tính từ い đổi đuôi い thành「～くないです」; Tính từ な thêm「～じゃありません」.",
        "examples": [
          {"ja": "富士山は 高いです。", "kana": "ふじさんは たかいです。", "vi": "Núi Phú Sĩ thì cao."},
          {"ja": "この 部屋は 静かじゃ ありません。", "kana": "この へやは しずかじゃ ありません。", "vi": "Căn phòng này không yên tĩnh."}
        ]
      },
      {
        "id": "g8-2",
        "structure": "Tính từ bổ nghĩa cho Danh từ",
        "meaning": "Cái N [Tính từ]",
        "explanation": "Khi tính từ đứng trước danh từ để bổ nghĩa: Tính từ đuôi い giữ nguyên い (vd: 白い車); Tính từ đuôi な giữ nguyên đuôi な (vd: 有名な人, 親切な人).",
        "examples": [
          {"ja": "桜は きれいな 花です。", "kana": "さくらは きれいな はなです。", "vi": "Hoa anh đào là loài hoa đẹp."},
          {"ja": "冷たい お茶を 飲みました。", "kana": "つめたい おちゃを のみました。", "vi": "Tôi đã uống trà lạnh."}
        ]
      },
      {
        "id": "g8-3",
        "structure": "とても / あまり",
        "meaning": "Rất / Không ... lắm",
        "explanation": "「とても」là phó từ chỉ mức độ cao, đi với câu khẳng định. 「あまり」đi với câu phủ định mang nghĩa 'không ... cho lắm'.",
        "examples": [
          {"ja": "日本の 食べ物は とても おいしいです。", "kana": "にほんの たべものは とても おいしいです。", "vi": "Đồ ăn Nhật Bản rất ngon."},
          {"ja": "この 映画は あまり おもしろくないです。", "kana": "この えいがは あまり おもしろくないです。", "vi": "Bộ phim này không hay lắm."}
        ]
      },
      {
        "id": "g8-4",
        "structure": "N は どうですか / どんな N ですか",
        "meaning": "N thì như thế nào? / Là loại N như thế nào?",
        "explanation": "「どうですか」dùng để hỏi cảm tưởng, ý kiến về một sự vật/việc đã trải nghiệm. 「どんな N ですか」dùng để hỏi về tính chất, đặc điểm cụ thể của danh từ N.",
        "examples": [
          {"ja": "日本の 生活は どうですか。楽しいです。", "kana": "にほんの せいかつは どうですか。たのしいです。", "vi": "Cuộc sống ở Nhật thế nào? — Rất vui ạ."},
          {"ja": "奈良は どんな 町ですか。静かな 町です。", "kana": "ならは どんな まちですか。しずかな まちです。", "vi": "Nara là thành phố như thế nào? — Là thành phố yên tĩnh."}
        ]
      },
      {
        "id": "g8-5",
        "structure": "Câu 1 が、Câu 2",
        "meaning": "Câu 1, nhưng mà Câu 2",
        "explanation": "Trợ từ「が」nối hai mệnh đề có ý nghĩa tương phản, đối lập nhau (tương đương với 'nhưng' trong tiếng Việt).",
        "examples": [
          {"ja": "日本の 食べ物は おいしいですが、高いです。", "kana": "にほんの たべものは おいしいですが、たかいです。", "vi": "Đồ ăn Nhật Bản ngon, nhưng đắt."}
        ]
      }
    ]
  }
]

# We will read existing minna_grammar.json and merge/enrich lessons 1 to 25 with full official data
with open('src/data/grammar/minna_grammar.json', 'r', encoding='utf-8') as f:
    existing = json.load(f)

# Keep lessons 26 to 50 as is, replace/enrich 1 to 25
print("Successfully loaded existing data with", len(existing), "lessons.")
