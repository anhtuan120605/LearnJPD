// Cơ sở dữ liệu Các cặp Kanji dễ nhầm lẫn (Look-alike Pairs) theo cấp độ JLPT
export interface LookAlikePair {
  id: string;
  level: string; // "N5" | "N4" | "N3" | "N2"
  kanji1: {
    char: string;
    hanviet: string;
    meaning: string;
    reading: string;
    distinctFeature: string;
    example: string;
    exampleVi: string;
  };
  kanji2: {
    char: string;
    hanviet: string;
    meaning: string;
    reading: string;
    distinctFeature: string;
    example: string;
    exampleVi: string;
  };
  keyDifference: string;
  mnemonicTip: string;
}

export const KANJI_LOOKALIKE_PAIRS: LookAlikePair[] = [
  // === N5 PAIRS ===
  {
    id: 'n5-wait-hold',
    level: 'N5',
    kanji1: {
      char: '待',
      hanviet: 'ĐÃI',
      meaning: 'Chờ đợi',
      reading: 'まつ (matsu) / タイ',
      distinctFeature: 'Bộ Xích 彳 (bước chân đi)',
      example: 'ちょっと待ってください (Xin hãy đợi một chút)',
      exampleVi: 'Đợi một lát'
    },
    kanji2: {
      char: '持',
      hanviet: 'TRÌ',
      meaning: 'Cầm, nắm, giữ',
      reading: 'もつ (motsu) / ジ',
      distinctFeature: 'Bộ Thủ 扌 (bàn tay)',
      example: 'かばんを持っています (Tôi đang cầm túi xách)',
      exampleVi: 'Cầm giữ đồ vật'
    },
    keyDifference: '待 dùng chân (彳) đứng lại chờ, 持 dùng tay (扌) để cầm nắm đồ vật.',
    mnemonicTip: 'ĐÃI người phải đứng CHÂN đợi, TRÌ vật dùng TAY nắm chắc.'
  },
  {
    id: 'n5-notyet-end',
    level: 'N5',
    kanji1: {
      char: '未',
      hanviet: 'VỊ',
      meaning: 'Chưa, vị lai',
      reading: 'いまだ (imada) / ミ',
      distinctFeature: 'Nét ngang TRÊN NGẮN HƠN nét ngang dưới',
      example: '未来 (みらい - Tương lai)',
      exampleVi: 'Chưa tới'
    },
    kanji2: {
      char: '末',
      hanviet: 'MẠT',
      meaning: 'Cuối cùng, phần ngọn',
      reading: 'すえ (sue) / マツ',
      distinctFeature: 'Nét ngang TRÊN DÀI HƠN nét ngang dưới',
      example: '週末 (しゅうまつ - Cuối tuần)',
      exampleVi: 'Điểm tận cùng'
    },
    keyDifference: 'Chữ 未 nét trên ngắn hơn nét dưới (chưa lớn hết). Chữ 末 nét trên dài xòe ra (ngọn cây mọc tít tận cùng).',
    mnemonicTip: 'VỊ (未) còn non nớt đầu nhỏ chưa lớn; MẠT (末) ngọn vươn cao đầu to đến tận cùng.'
  },
  {
    id: 'n5-cow-noon',
    level: 'N5',
    kanji1: {
      char: '牛',
      hanviet: 'NGƯU',
      meaning: 'Con bò',
      reading: 'うし (ushi) / ギュウ',
      distinctFeature: 'Nét dọc THÒ LÊN trên đỉnh (như sừng bò)',
      example: '牛肉 (ぎゅうにく - Thịt bò)',
      exampleVi: 'Con trâu/bò'
    },
    kanji2: {
      char: '午',
      hanviet: 'NGỌ',
      meaning: 'Buổi trưa, giờ Ngọ',
      reading: 'ゴ (go)',
      distinctFeature: 'Nét dọc KHÔNG THÒ LÊN (bằng phẳng)',
      example: '午前 (ごぜん - Buổi sáng), 午後 (ごご - Buổi chiều)',
      exampleVi: 'Giờ chính ngọ'
    },
    keyDifference: 'Con bò (牛) có sừng nhú lên trên; Giờ trưa (午) mặt trời chiếu bằng phẳng không thò nét.',
    mnemonicTip: 'Bò NGƯU (牛) ló sừng lên đầu; Trưa NGỌ (午) bằng đầu chẳng có sừng đâu.'
  },
  {
    id: 'n5-buy-sell',
    level: 'N5',
    kanji1: {
      char: '買',
      hanviet: 'MÃI',
      meaning: 'Mua vào',
      reading: 'かう (kau) / バイ',
      distinctFeature: 'Phía trên là chiếc võng xếp 罒 che tiền Bối 貝',
      example: 'パンを買います (Tôi mua bánh mì)',
      exampleVi: 'Bỏ tiền ra mua'
    },
    kanji2: {
      char: '売',
      hanviet: 'MẠI',
      meaning: 'Bán ra',
      reading: 'うる (uru) / バイ',
      distinctFeature: 'Có chữ Sĩ 士 ở trên đầu',
      example: '本を売ります (Tôi bán sách)',
      exampleVi: 'Bán hàng lấy tiền'
    },
    keyDifference: 'Mãi là mua, Mại là bán. Chữ 売 (Bán) có người Sĩ (士) đứng rao bán trên sạp.',
    mnemonicTip: 'Bán MẠI (売) thêm kẻ Sĩ (士) rao; Mua MÃI (買) giấu tiền vỏ sò (貝) trong túi.'
  },
  {
    id: 'n5-day-white',
    level: 'N5',
    kanji1: {
      char: '日',
      hanviet: 'NHẬT',
      meaning: 'Mặt trời, ngày',
      reading: 'ひ (hi) / ニチ',
      distinctFeature: 'Hình chữ nhật phẳng không có nét phẩy',
      example: '日曜日 (にちようび - Chủ nhật)',
      exampleVi: 'Mặt trời chiếu sáng'
    },
    kanji2: {
      char: '白',
      hanviet: 'BẠCH',
      meaning: 'Màu trắng',
      reading: 'しろ (shiro) / ハク',
      distinctFeature: 'Có thêm 1 NÉT PHẨY nhỏ trên đầu',
      example: '白いシャツ (Áo sơ mi trắng)',
      exampleVi: 'Trắng tinh khiết'
    },
    keyDifference: 'Mặt trời (日) không có tóc. Màu trắng (白) có 1 cọng tóc bạc phẩy trên đầu.',
    mnemonicTip: 'Một sợi tóc trắng (白) nhú trên mặt trời (日).'
  },
  {
    id: 'n5-right-left',
    level: 'N5',
    kanji1: {
      char: '右',
      hanviet: 'HỮU',
      meaning: 'Bên phải',
      reading: 'みぎ (migi) / ウ',
      distinctFeature: 'Bên dưới là chữ Khẩu 口 (miệng)',
      example: '右に曲がります (Rẽ phải)',
      exampleVi: 'Hướng tay phải'
    },
    kanji2: {
      char: '左',
      hanviet: 'TẢ',
      meaning: 'Bên trái',
      reading: 'ひだり (hidari) / サ',
      distinctFeature: 'Bên dưới là chữ Công 工 (cái thước)',
      example: '左手 (ひだりて - Tay trái)',
      exampleVi: 'Hướng tay trái'
    },
    keyDifference: 'Bên phải (右) dùng tay đưa thức ăn vào MIỆNG (口); Bên trái (左) cầm THƯỚC (工) thợ hồ đo đạc.',
    mnemonicTip: 'Tay PHẢI (右) đưa cơm vào miệng; Tay TRÁI (左) cầm thước đo ke.'
  },
  {
    id: 'n5-big-dog-thick',
    level: 'N5',
    kanji1: {
      char: '大',
      hanviet: 'ĐẠI',
      meaning: 'To lớn',
      reading: 'おおきい (ookii) / ダイ',
      distinctFeature: 'Không có chấm',
      example: '大学 (だいがく - Đại học)',
      exampleVi: 'To lớn'
    },
    kanji2: {
      char: '犬',
      hanviet: 'KHUYỂN',
      meaning: 'Con chó',
      reading: 'いぬ (inu) / ケン',
      distinctFeature: 'Có 1 DẤU CHẤM ở vai bên phải',
      example: '犬を飼う (Nuôi chó)',
      exampleVi: 'Chó cưng'
    },
    keyDifference: 'Người dang rộng tay chân là ĐẠI (大); Có thêm đốm lông trên vai vẫy đuôi là KHUYỂN (犬).',
    mnemonicTip: 'ĐẠI (大) to lớn đứng giữa trời; Thêm dấu CHẤM trên vai thành KHUYỂN (犬) vẫy đuôi.'
  },
  // === N4 PAIRS ===
  {
    id: 'n4-history-calendar',
    level: 'N4',
    kanji1: {
      char: '歴',
      hanviet: 'LỊCH',
      meaning: 'Lịch sử, trải qua',
      reading: 'レキ (reki)',
      distinctFeature: 'Bên dưới có 2 cây lúa (禾 禾) và chữ Chỉ 止',
      example: '歴史 (れきし - Lịch sử)',
      exampleVi: 'Thời gian đã qua'
    },
    kanji2: {
      char: '暦',
      hanviet: 'LỊCH',
      meaning: 'Tờ lịch, quyển lịch',
      reading: 'こよみ (koyomi) / レキ',
      distinctFeature: 'Bên dưới là chữ Nhật 日 (mặt trời/ngày)',
      example: '西暦 (せいれき - Dương lịch)',
      exampleVi: 'Quyển lịch xem ngày'
    },
    keyDifference: 'Lịch sử (歴) là lúa cấy từ đời xưa; Quyển lịch (暦) có chữ Nhật (日) để đếm từng ngày.',
    mnemonicTip: 'LỊCH sử (歴) ghi dấu bước chân (止) qua hai vụ lúa (禾禾); Xem LỊCH (暦) mỗi ngày nhìn vào mặt trời (日).'
  },
  {
    id: 'n4-cure-stay',
    level: 'N4',
    kanji1: {
      char: '治',
      hanviet: 'TRỊ',
      meaning: 'Chữa trị, trị vì',
      reading: 'なおる (naoru) / ジ, チ',
      distinctFeature: 'Có bộ 3 chấm thủy 氵 bên trái',
      example: '病気が治る (Khỏi bệnh)',
      exampleVi: 'Chữa lành bệnh'
    },
    kanji2: {
      char: '泊',
      hanviet: 'BẠC',
      meaning: 'Trọ lại, ngủ đêm',
      reading: 'とまる (tomaru) / ハク',
      distinctFeature: 'Bộ 3 chấm thủy 氵 + chữ Bạch 白',
      example: 'ホテルに泊まる (Trọ ở khách sạn)',
      exampleVi: 'Nghỉ lại qua đêm'
    },
    keyDifference: 'Chữa bệnh (治) dùng nước rửa sạch đài (台); Trọ lại đêm (泊) dùng nước rửa mặt trắng (白) trẻo đi ngủ.',
    mnemonicTip: 'TRỊ (治) bệnh đưa lên đài nước; Trọ BẠC (泊) soi gương thấy mặt trắng bong.'
  }
];
