import json

lesson_1_full = {
  "lesson": 1,
  "title": "Bài 1: Giới thiệu bản thân, nghề nghiệp & quốc tịch",
  "level": "N5",
  # II. PHẦN DỊCH: MẪU CÂU (文型 - Bunkei)
  "bunkei": [
    {
      "id": "bk-1-1",
      "ja": "わたしは マイク・ミラーです。",
      "kana": "わたしは まいく・みらーです。",
      "vi": "1. Tôi là Mike Miller."
    },
    {
      "id": "bk-1-2",
      "ja": "サントスさんは 学生じゃ ありません。",
      "kana": "さんとすさんは がくせいじゃ ありません。",
      "vi": "2. Anh Santos không phải là sinh viên."
    },
    {
      "id": "bk-1-3",
      "ja": "ミラーさんは 会社員ですか。",
      "kana": "みらーさんは かいしゃいんですか。",
      "vi": "3. Anh Miller có phải là nhân viên công ty không?"
    },
    {
      "id": "bk-1-4",
      "ja": "サントスさんも 会社員です。",
      "kana": "さんとすさんも かいしゃいんです。",
      "vi": "4. Anh Santos cũng là nhân viên công ty."
    }
  ],
  # II. PHẦN DỊCH: VÍ DỤ (例文 - Reibun)
  "reibun": [
    {
      "id": "rb-1-1",
      "ja": "［あなたは］マイク・ミラーさんですか。…はい、［私は］マイク・ミラーです。",
      "kana": "［あなたは］まいく・みらーさんですか。…はい、［わたしは］まいく・みらーです。",
      "vi": "1. Anh có phải là anh Mike Miller không?\n…Vâng, tôi là Mike Miller."
    },
    {
      "id": "rb-1-2",
      "ja": "ミラーさんは 学生ですか。…いいえ、［私は］学生じゃ ありません。会社員です。",
      "kana": "みらーさんは がくせいですか。…いいえ、［わたしは］がくせいじゃ ありません。かいしゃいんです。",
      "vi": "2. Anh Miller, anh có phải là sinh viên không?\n…Không, tôi không phải là sinh viên. Tôi là nhân viên công ty."
    },
    {
      "id": "rb-1-3",
      "ja": "ワンさんは 銀行員ですか。…いいえ、ワンさんは 銀行員じゃ ありません。医者です。",
      "kana": "わんさんは ぎんこういんですか。…いいえ、わんさんは ぎんこういんじゃ ありません。いしゃです。",
      "vi": "3. Ông Wang có phải là nhân viên ngân hàng không?\n…Không, ông Wang không phải là nhân viên ngân hàng. Ông ấy là bác sĩ."
    },
    {
      "id": "rb-1-4",
      "ja": "あの方は どなたですか。…［あの方は］ワットさんです。さくら大学の 先生です。",
      "kana": "あのかたは どなたですか。…［あのかたは］わっとさんです。さくらだいがくの せんせいです。",
      "vi": "4. Vị kia là ai?\n…Đó là ông Watt. Ông ấy là giảng viên của Trường Đại học Sakura."
    },
    {
      "id": "rb-1-5",
      "ja": "グプタさんは 会社員ですか。…はい、会社員です。カリナさんも 会社員ですか。…いいえ、カリナさんは 学生です。",
      "kana": "ぐぷたさんは かいしゃいんですか。…はい、かいしゃいんです。かりなさんも かいしゃいんですか。…いいえ、かりなさんは がくせいです。",
      "vi": "5. Anh Gupta có phải là nhân viên công ty không?\n…Vâng, (anh ấy) là nhân viên công ty.\nChị Karina cũng là nhân viên công ty à?\n…Không, (chị Karina) là sinh viên."
    },
    {
      "id": "rb-1-6",
      "ja": "テレサちゃんは 何歳ですか。…９歳です。",
      "kana": "てれさちゃんは なんさいですか。…きゅうさいです。",
      "vi": "6. Em Teresa mấy tuổi?\n…(Em ấy) 9 tuổi."
    }
  ],
  # II. PHẦN DỊCH: HỘI THOẠI (会話 - Kaiwa)
  "kaiwa": {
    "title": "初めまして (Rất vui được làm quen với chị)",
    "lines": [
      {
        "speaker": "佐藤 (Sato)",
        "ja": "おはようございます。",
        "kana": "おはようございます。",
        "vi": "Chào anh!"
      },
      {
        "speaker": "山田 (Yamada)",
        "ja": "おはようございます。佐藤さん、こちらは マイク・ミラーさんです。",
        "kana": "おはようございます。さとうさん、こちらは まいく・みらーさんです。",
        "vi": "Chào chị! Chị Sato, đây là anh Mike Miller."
      },
      {
        "speaker": "ミラー (Miller)",
        "ja": "初めまして。マイク・ミラーです。アメリカから 来ました。どうぞ よろしく。",
        "kana": "はじめまして。まいく・みらーです。あめりかから きました。どうぞ よろしく。",
        "vi": "Rất vui được làm quen với chị. Tôi là Mike Miller. Tôi đến từ Mỹ. Rất mong sẽ nhận được sự giúp đỡ của chị."
      },
      {
        "speaker": "佐藤 (Sato)",
        "ja": "佐藤けい子です。どうぞ よろしく。",
        "kana": "さとうけいこです。どうぞ よろしく。",
        "vi": "Tôi là Sato Keiko. Rất vui được làm quen với anh."
      }
    ]
  },
  # III. TỪ VÀ THÔNG TIN THAM KHẢO (参考語彙 - Sankou Goi)
  "referenceInfo": {
    "title": "Nước, Người & Ngôn ngữ (国、人、ことば)",
    "description": "Bảng tra cứu quốc gia, quốc tịch (thêm 人 - jin) và ngôn ngữ (thêm 語 - go) chuẩn theo sách Minna no Nihongo Tập 1:",
    "items": [
      {"ja": "アメリカ", "kana": "あめりか", "vi": "Mỹ", "extra": "アメリカ人 (Người Mỹ) • 英語 (Tiếng Anh)"},
      {"ja": "イギリス", "kana": "いぎりす", "vi": "Anh", "extra": "イギリス人 (Người Anh) • 英語 (Tiếng Anh)"},
      {"ja": "イタリア", "kana": "いたりあ", "vi": "Ý", "extra": "イタリア人 (Người Ý) • イタリア語 (Tiếng Ý)"},
      {"ja": "イラン", "kana": "いらん", "vi": "Iran", "extra": "イラン人 (Người Iran) • ペルシア語 (Tiếng Ba Tư)"},
      {"ja": "インド", "kana": "いんど", "vi": "Ấn Độ", "extra": "インド人 (Người Ấn Độ) • ヒンディー語 (Tiếng Hindi)"},
      {"ja": "インドネシア", "kana": "いんどねしあ", "vi": "Indonesia", "extra": "インドネシア人 • インドネシア語"},
      {"ja": "エジプト", "kana": "えじぷと", "vi": "Ai Cập", "extra": "エジプト人 • アラビア語 (Tiếng Ả Rập)"},
      {"ja": "オーストラリア", "kana": "おーすとらりあ", "vi": "Úc", "extra": "オーストラリア人 • 英語 (Tiếng Anh)"},
      {"ja": "カナダ", "kana": "かなだ", "vi": "Canada", "extra": "カナダ人 • 英語 / フランス語"},
      {"ja": "韓国", "kana": "かんこく", "vi": "Hàn Quốc", "extra": "韓国人 • 韓国語 (Tiếng Hàn)"},
      {"ja": "サウジアラビア", "kana": "さうじあらびあ", "vi": "Ả-rập Xê-út", "extra": "サウジアラビア人 • アラビア語"},
      {"ja": "シンガポール", "kana": "しんがぽーる", "vi": "Singapore", "extra": "シンガポール人 • 英語"},
      {"ja": "スペイン", "kana": "すぺいん", "vi": "Tây Ban Nha", "extra": "スペイン人 • スペイン語"},
      {"ja": "タイ", "kana": "たい", "vi": "Thái Lan", "extra": "タイ人 • タイ語 (Tiếng Thái)"},
      {"ja": "中国", "kana": "ちゅうごく", "vi": "Trung Quốc", "extra": "中国人 • 中国語 (Tiếng Trung)"},
      {"ja": "ドイツ", "kana": "どいつ", "vi": "Đức", "extra": "ドイツ人 • ドイツ語 (Tiếng Đức)"},
      {"ja": "日本", "kana": "にほん", "vi": "Nhật Bản", "extra": "日本人 • 日本語 (Tiếng Nhật)"},
      {"ja": "フランス", "kana": "ふらんす", "vi": "Pháp", "extra": "フランス人 • フランス語 (Tiếng Pháp)"},
      {"ja": "フィリピン", "kana": "ふぃりぴん", "vi": "Philippines", "extra": "フィリピン人 • フィリピノ語"},
      {"ja": "ブラジル", "kana": "ぶらじる", "vi": "Brazil", "extra": "ブラジル人 • ポルトガル語 (Tiếng Bồ Đào Nha)"},
      {"ja": "ベトナム", "kana": "べとなむ", "vi": "Việt Nam", "extra": "ベトナム人 • ベトナム語 (Tiếng Việt)"},
      {"ja": "マレーシア", "kana": "まれーしあ", "vi": "Malaysia", "extra": "マレーシア人 • マレーシア語"},
      {"ja": "メキシコ", "kana": "めきしこ", "vi": "Mexico", "extra": "メキシコ人 • スペイン語"},
      {"ja": "ロシア", "kana": "ろしあ", "vi": "Nga", "extra": "ロシア人 • ロシア語 (Tiếng Nga)"}
    ]
  },
  # IV. GIẢI THÍCH NGỮ PHÁP (文法解説 - Bunpou Kaisetsu - Y hệt từng câu chữ sách Minna)
  "points": [
    {
      "id": "g1-1",
      "structure": "1. Danh từ 1 は Danh từ 2 です",
      "meaning": "Danh từ 1 là Danh từ 2",
      "explanation": "Cấu trúc khẳng định cơ bản nhất trong tiếng Nhật, dùng để nêu tên, nghề nghiệp, quốc tịch của một người.",
      "subPoints": [
        {
          "title": "1) Trợ từ は (wa)",
          "explanation": "Trợ từ は biểu thị rằng danh từ đứng trước nó là chủ đề của câu văn (xem Column 1: Chủ đề và chủ ngữ). Người nói đặt は sau chủ đề mà mình muốn nói đến và xây dựng thành câu văn bằng cách thêm vào phía sau は những thông tin trần thuật vị ngữ.\n\n[Chú ý]: Trợ từ は khi làm trợ từ bắt buộc phải phát âm là [wa], không đọc là [ha].",
          "examples": [
            {
              "ja": "わたしは マイク・ミラーです。",
              "kana": "わたしは まいく・みらーです。",
              "vi": "① Tôi là Mike Miller."
            }
          ]
        },
        {
          "title": "2) です (desu)",
          "explanation": "Danh từ đi cùng です để tạo thành vị ngữ. です vừa biểu thị ý nghĩa phán đoán, khẳng định, vừa biểu thị thái độ lịch sự đối với người nghe. です biến đổi hình thức trong câu phủ định (xem mục 2) và trong biểu thị thì quá khứ (xem Bài 12).",
          "examples": [
            {
              "ja": "わたしは 会社員です。",
              "kana": "わたしは かいしゃいんです。",
              "vi": "② Tôi là nhân viên công ty."
            }
          ]
        }
      ],
      "notes": [
        "Trợ từ は phát âm là [wa].",
        "です đặt ở cuối câu để tạo vị ngữ lịch sự cho câu danh từ."
      ],
      "examples": [
        {
          "ja": "わたしは マイク・ミラーです。",
          "kana": "わたしは まいく・みらーです。",
          "vi": "Tôi là Mike Miller."
        },
        {
          "ja": "わたしは 会社員です。",
          "kana": "わたしは かいしゃいんです。",
          "vi": "Tôi là nhân viên công ty."
        }
      ]
    },
    {
      "id": "g1-2",
      "structure": "2. Danh từ 1 は Danh từ 2 じゃ（では）ありません",
      "meaning": "Danh từ 1 không phải là Danh từ 2",
      "explanation": "「じゃ（では）ありません」là thể phủ định của「です」.\n\n•「じゃ ありません」thường được sử dụng trong hội thoại hàng ngày.\n•「では ありません」được sử dụng trong các bài phát biểu trang trọng hay trong văn viết.",
      "notes": [
        "[Chú ý]: Trợ từ は trong「では」được phát âm là [wa]."
      ],
      "examples": [
        {
          "ja": "サントスさんは 学生じゃ ありません。（では ありません）",
          "kana": "さんとすさんは がくせいじゃ ありません。（では ありません）",
          "vi": "③ Anh Santos không phải là sinh viên."
        }
      ]
    },
    {
      "id": "g1-3",
      "structure": "3. Danh từ 1 は Danh từ 2 ですか (Câu nghi vấn)",
      "meaning": "Danh từ 1 có phải là Danh từ 2 không?",
      "explanation": "Cách dùng câu hỏi trong tiếng Nhật và cách trả lời:",
      "subPoints": [
        {
          "title": "1) Trợ từ か",
          "explanation": "Trợ từ か được dùng để biểu thị sự không chắc chắn, sự nghi vấn của người nói. Câu nghi vấn được tạo thành bằng cách thêm か vào cuối câu. Trong câu nghi vấn, phần cuối câu được đọc với giọng cao hơn.",
          "examples": []
        },
        {
          "title": "2) Câu nghi vấn để xác nhận xem nội dung của câu văn là đúng hay sai",
          "explanation": "Tạo thành câu nghi vấn bằng cách dùng trợ từ か ở cuối câu mà không thay đổi trật tự từ trong câu. Câu nghi vấn loại này xác nhận xem nội dung của câu văn là đúng hay sai; trường hợp đúng thì trả lời là「はい」, không đúng thì trả lời là「いいえ」.",
          "examples": [
            {
              "ja": "ミラーさんは アメリカ人ですか。…はい、アメリカ人です。",
              "kana": "みらーさんは あめりかじんですか。…はい、あめりかじんです。",
              "vi": "④ Anh Miller có phải là người Mỹ không? — …Vâng, anh ấy là người Mỹ."
            },
            {
              "ja": "ミラーさんは 先生ですか。…いいえ、先生じゃ ありません。",
              "kana": "みらーさんは せんせいですか。…いいえ、せんせいじゃ ありません。",
              "vi": "⑤ Anh Miller có phải là giáo viên không? — …Không, anh ấy không phải là giáo viên."
            }
          ]
        },
        {
          "title": "3) Câu nghi vấn có từ nghi vấn",
          "explanation": "Thay nghi vấn từ (ví dụ: だれ / どなた) vào vị trí của nội dung mà bạn muốn hỏi, thêm trợ từ か vào cuối câu. Trật tự từ không thay đổi.",
          "examples": [
            {
              "ja": "あの方は どなたですか。…［あの方は］ミラーさんです。",
              "kana": "あのかたは どなたですか。…［あのかたは］みらーさんです。",
              "vi": "⑥ Người kia là ai? — …Người đó là anh Miller."
            }
          ]
        }
      ],
      "examples": [
        {
          "ja": "ミラーさんは アメリカ人ですか。…はい、アメリカ人です。",
          "kana": "みらーさんは あめりかじんですか。…はい、あめりかじんです。",
          "vi": "Anh Miller có phải là người Mỹ không? — …Vâng, là người Mỹ."
        },
        {
          "ja": "あの方は どなたですか。…ワットさんです。",
          "kana": "あのかたは どなたですか。…わっとさんです。",
          "vi": "Vị kia là ai? — …Là ông Watt."
        }
      ]
    },
    {
      "id": "g1-4",
      "structure": "4. Danh từ も",
      "meaning": "Danh từ cũng...",
      "explanation": "Trợ từ「も」được dùng khi trình bày một nội dung tương tự như ở câu văn trước.",
      "examples": [
        {
          "ja": "ミラーさんは 会社員です。グプタさんも 会社員です。",
          "kana": "みらーさんは かいしゃいんです。ぐぷたさんも かいしゃいんです。",
          "vi": "⑦ Anh Miller là nhân viên công ty. Anh Gupta cũng là nhân viên công ty."
        }
      ]
    },
    {
      "id": "g1-5",
      "structure": "5. Danh từ 1 の Danh từ 2",
      "meaning": "N2 của N1 / N2 thuộc N1",
      "explanation": "Trong trường hợp Danh từ 1 ở trước bổ nghĩa cho Danh từ 2 ở sau thì hai danh từ đó được nối với nhau bằng trợ từ「の」. Ở Bài 1, Danh từ 1 biểu thị nơi sở thuộc của Danh từ 2.",
      "examples": [
        {
          "ja": "ミラーさんは IMCの 社員です。",
          "kana": "みらーさんは あいえむしーの しゃいんです。",
          "vi": "⑧ Anh Miller là nhân viên của công ty IMC."
        }
      ]
    },
    {
      "id": "g1-6",
      "structure": "6. ～さん / Chú ý về xưng hô & あなた",
      "meaning": "Danh xưng lịch sự",
      "explanation": "Trong tiếng Nhật, từ「～さん」được dùng sau họ hoặc tên của người nghe hoặc người ở ngôi thứ 3. Vì sử dụng「～さん」để thể hiện tính lịch sự nên KHÔNG dùng sau họ hoặc tên của chính người nói. Đối với trẻ em thì từ「～ちゃん」với sắc thái thân mật sẽ được dùng thay cho「～さん」.",
      "subPoints": [
        {
          "title": "Gọi tên trực tiếp kèm さん",
          "explanation": "Khi gọi, nếu trường hợp đã biết họ hoặc tên của người nghe thì không dùng「あなた」(bạn) mà thêm「～さん」vào sau họ hoặc tên người đó để gọi.",
          "examples": [
            {
              "ja": "あの方は ミラーさんです。",
              "kana": "あのかたは みらーさんです。",
              "vi": "⑨ Người kia là anh Miller."
            },
            {
              "ja": "鈴木：ミラーさんは 学生ですか。ミラー：いいえ、会社員です。",
              "kana": "すずき：みらーさんは がくせいですか。みらー：いいえ、かいしゃいんです。",
              "vi": "⑩ Suzuki: Anh Miller có phải là sinh viên không? — Miller: Không, tôi là nhân viên công ty."
            }
          ]
        }
      ],
      "notes": [
        "[Chú ý về あなた]:「あなた」(bạn) được sử dụng trong những quan hệ cực kỳ thân mật như vợ chồng, người yêu, v.v.. Do đó cần thiết phải chú ý khi sử dụng ngoài những trường hợp trên vì có thể sẽ gây cho đối phương ấn tượng không tốt."
      ],
      "examples": [
        {
          "ja": "あの方は ミラーさんです。",
          "kana": "あのかたは みらーさんです。",
          "vi": "Người kia là anh Miller."
        }
      ]
    }
  ]
}

# Update minna_grammar.json
with open('src/data/grammar/minna_grammar.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Replace lesson 1
updated = [lesson_1_full if item.get('lesson') == 1 else item for item in data]

with open('src/data/grammar/minna_grammar.json', 'w', encoding='utf-8') as f:
    json.dump(updated, f, ensure_ascii=False, indent=2)

print("Updated Lesson 1 in minna_grammar.json with complete book sections!")
