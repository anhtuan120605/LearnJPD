// Dữ liệu & Quy tắc số đếm tiếng Nhật chuẩn ngữ pháp
// Hỗ trợ từ 1 đến hàng nghìn tỷ (兆) kèm quy tắc biến âm (Rendaku / Sokuon)

export interface NumberDetail {
  num: number;
  hiragana: string;
  romaji: string;
  kanji: string;
  note?: string;
}

export interface NumberLevel {
  id: number;
  title: string;
  rangeLabel: string;
  min: number;
  max: number;
  description: string;
  badgeColor: string; // Tailwind color class or hex
  bgGradient: string;
  accentColor: string;
  kanjiPreview: string;
  notes: string[];
  tableData: NumberDetail[];
}

// Hàm chuyển số thành Hiragana & Romaji chuẩn kèm biến âm
export function numberToJapanese(n: number): { hiragana: string; romaji: string; kanji: string } {
  if (n === 0) return { hiragana: 'ぜろ', romaji: 'zero', kanji: '〇' };

  const onesHira = ['', 'いち', 'に', 'さん', 'よん', 'ご', 'ろく', 'なな', 'はち', 'きゅう'];
  const onesRoma = ['', 'ichi', 'ni', 'san', 'yon', 'go', 'roku', 'nana', 'hachi', 'kyuu'];
  const onesKanji = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];

  // Chuyển nhóm 4 chữ số (0 - 9999)
  function convertUnder10000(num: number): { hiragana: string; romaji: string; kanji: string } {
    if (num === 0) return { hiragana: '', romaji: '', kanji: '' };

    let hira = '';
    let roma = '';
    let kan = '';

    // Hàng nghìn (1000 - 9000)
    const thousands = Math.floor(num / 1000);
    if (thousands > 0) {
      if (thousands === 1) {
        hira += 'せん';
        roma += 'sen';
        kan += '千';
      } else if (thousands === 3) {
        hira += 'さんぜん';
        roma += 'sanzen';
        kan += '三千';
      } else if (thousands === 8) {
        hira += 'はっせん';
        roma += 'hassen';
        kan += '八千';
      } else {
        hira += onesHira[thousands] + 'せん';
        roma += onesRoma[thousands] + 'sen';
        kan += onesKanji[thousands] + '千';
      }
    }

    // Hàng trăm (100 - 900)
    const hundreds = Math.floor((num % 1000) / 100);
    if (hundreds > 0) {
      if (hundreds === 1) {
        hira += 'ひゃく';
        roma += (roma ? ' ' : '') + 'hyaku';
        kan += '百';
      } else if (hundreds === 3) {
        hira += 'さんびゃく';
        roma += (roma ? ' ' : '') + 'sanbyaku';
        kan += '三百';
      } else if (hundreds === 6) {
        hira += 'ろっぴゃく';
        roma += (roma ? ' ' : '') + 'roppyaku';
        kan += '六百';
      } else if (hundreds === 8) {
        hira += 'はっぴゃく';
        roma += (roma ? ' ' : '') + 'happyaku';
        kan += '八百';
      } else {
        hira += onesHira[hundreds] + 'ひゃく';
        roma += (roma ? ' ' : '') + onesRoma[hundreds] + 'hyaku';
        kan += onesKanji[hundreds] + '百';
      }
    }

    // Hàng chục (10 - 90)
    const tens = Math.floor((num % 100) / 10);
    if (tens > 0) {
      if (tens === 1) {
        hira += 'じゅう';
        roma += (roma ? ' ' : '') + 'juu';
        kan += '十';
      } else {
        hira += onesHira[tens] + 'じゅう';
        roma += (roma ? ' ' : '') + onesRoma[tens] + 'juu';
        kan += onesKanji[tens] + '十';
      }
    }

    // Hàng đơn vị (1 - 9)
    const remainder = num % 10;
    if (remainder > 0) {
      hira += onesHira[remainder];
      roma += (roma ? ' ' : '') + onesRoma[remainder];
      kan += onesKanji[remainder];
    }

    return { hiragana: hira, romaji: roma.trim(), kanji: kan };
  }

  // Phân giải theo hệ số 10.000 (vạn / 万, ức / 億, triệu / 兆)
  const cho = Math.floor(n / 1000000000000); // 兆
  const oku = Math.floor((n % 1000000000000) / 100000000); // 億
  const man = Math.floor((n % 100000000) / 10000); // 万
  const rest = n % 10000;

  let totalHira = '';
  let totalRoma = '';
  let totalKan = '';

  if (cho > 0) {
    const c = convertUnder10000(cho);
    let choPrefixHira = c.hiragana;
    let choPrefixRoma = c.romaji;
    if (cho === 1) {
      choPrefixHira = 'いっ';
      choPrefixRoma = 'it';
    } else if (cho === 8) {
      choPrefixHira = 'はっ';
      choPrefixRoma = 'hat';
    } else if (cho === 10) {
      choPrefixHira = 'じゅっ';
      choPrefixRoma = 'jut';
    }
    totalHira += choPrefixHira + 'ちょう';
    totalRoma += choPrefixRoma + 'chou';
    totalKan += c.kanji + '兆';
  }

  if (oku > 0) {
    const o = convertUnder10000(oku);
    let okuPrefixHira = o.hiragana;
    let okuPrefixRoma = o.romaji;
    if (oku === 1) {
      okuPrefixHira = 'いち';
      okuPrefixRoma = 'ichi';
    } else if (oku === 10) {
      okuPrefixHira = 'じゅう';
      okuPrefixRoma = 'juu';
    } else if (oku === 100) {
      okuPrefixHira = 'ひゃく';
      okuPrefixRoma = 'hyaku';
    } else if (oku === 1000) {
      okuPrefixHira = 'せん';
      okuPrefixRoma = 'sen';
    }
    totalHira += okuPrefixHira + 'おく';
    totalRoma += (totalRoma ? ' ' : '') + okuPrefixRoma + 'oku';
    totalKan += o.kanji + '億';
  }

  if (man > 0) {
    const m = convertUnder10000(man);
    let manPrefixHira = m.hiragana;
    let manPrefixRoma = m.romaji;
    // Chú ý: 1 vạn luôn phải đọc là ichiman (khác với 1 nghìn sen)
    if (man === 1) {
      manPrefixHira = 'いち';
      manPrefixRoma = 'ichi';
    }
    totalHira += manPrefixHira + 'まん';
    totalRoma += (totalRoma ? ' ' : '') + manPrefixRoma + 'man';
    totalKan += m.kanji + '万';
  }

  if (rest > 0 || (cho === 0 && oku === 0 && man === 0)) {
    const r = convertUnder10000(rest);
    totalHira += r.hiragana;
    totalRoma += (totalRoma ? ' ' : '') + r.romaji;
    totalKan += r.kanji;
  }

  return {
    hiragana: totalHira,
    romaji: totalRoma.trim(),
    kanji: totalKan
  };
}

// 9 Cấp độ theo thiết kế bài bản
export const JAPANESE_NUMBER_LEVELS: NumberLevel[] = [
  {
    id: 1,
    title: 'Số từ 1 – 10',
    rangeLabel: '1 - 10',
    min: 1,
    max: 10,
    description: 'Những số cơ bản, dùng hằng ngày.',
    badgeColor: 'bg-blue-500 text-white',
    bgGradient: 'from-blue-500/10 to-indigo-500/10',
    accentColor: '#3b82f6',
    kanjiPreview: 'いち',
    notes: [
      'Số 4 đọc là よん (yon) hoặc し (shi), trong giao tiếp thông thường ưu tiên dùng よん.',
      'Số 7 đọc là なな (nana) hoặc しち (shichi), thường dùng なな để tránh nhầm với số 1 (ichi).',
      'Số 9 đọc là きゅう (kyuu), ít khi đọc く (ku) trong số đếm thường.',
      'Số 10 đọc là じゅう (juu), phân biệt với とお (to-o) trong bộ đếm đồ vật thuần Nhật.'
    ],
    tableData: [
      { num: 1, hiragana: 'いち', romaji: 'ichi', kanji: '一' },
      { num: 2, hiragana: 'に', romaji: 'ni', kanji: '二' },
      { num: 3, hiragana: 'さん', romaji: 'san', kanji: '三' },
      { num: 4, hiragana: 'よん / し', romaji: 'yon / shi', kanji: '四', note: 'Thường dùng よん' },
      { num: 5, hiragana: 'ご', romaji: 'go', kanji: '五' },
      { num: 6, hiragana: 'ろく', romaji: 'roku', kanji: '六' },
      { num: 7, hiragana: 'なな / しち', romaji: 'nana / shichi', kanji: '七', note: 'Thường dùng なな' },
      { num: 8, hiragana: 'はち', romaji: 'hachi', kanji: '八' },
      { num: 9, hiragana: 'きゅう', romaji: 'kyuu', kanji: '九', note: 'Không đọc く' },
      { num: 10, hiragana: 'じゅう', romaji: 'juu', kanji: '十' }
    ]
  },
  {
    id: 2,
    title: 'Số từ 11 – 99',
    rangeLabel: '11 - 99',
    min: 11,
    max: 99,
    description: 'Số hàng chục và số có 2 chữ số.',
    badgeColor: 'bg-rose-500 text-white',
    bgGradient: 'from-rose-500/10 to-pink-500/10',
    accentColor: '#f43f5e',
    kanjiPreview: 'じゅう',
    notes: [
      'Công thức hàng chục: [Số] + じゅう (Ví dụ: 20 = にじゅう, 30 = さんじゅう).',
      'Công thức số 2 chữ số: [Hàng chục] + [Hàng đơn vị] (Ví dụ: 25 = にじゅうご).',
      'Chú ý số 40 là よんじゅう (không nói しじゅう), 70 là ななじゅう (không nói しちじゅう), 90 là きゅうじゅう.'
    ],
    tableData: [
      { num: 11, hiragana: 'じゅういち', romaji: 'juuichi', kanji: '十一' },
      { num: 14, hiragana: 'じゅうよん', romaji: 'juuyon', kanji: '十四' },
      { num: 20, hiragana: 'にじゅう', romaji: 'nijuu', kanji: '二十' },
      { num: 30, hiragana: 'さんじゅう', romaji: 'sanjuu', kanji: '三十' },
      { num: 40, hiragana: 'よんじゅう', romaji: 'yonjuu', kanji: '四十' },
      { num: 55, hiragana: 'ごじゅうご', romaji: 'gojuugo', kanji: '五十五' },
      { num: 70, hiragana: 'ななじゅう', romaji: 'nanajuu', kanji: '七十' },
      { num: 88, hiragana: 'はちじゅうはち', romaji: 'hachijuuhachi', kanji: '八十八' },
      { num: 90, hiragana: 'きゅうじゅう', romaji: 'kyuujuu', kanji: '九十' },
      { num: 99, hiragana: 'きゅうじゅうきゅう', romaji: 'kyuujuukyuu', kanji: '九十九' }
    ]
  },
  {
    id: 3,
    title: 'Số từ 100 – 999',
    rangeLabel: '100 - 999',
    min: 100,
    max: 999,
    description: 'Số hàng trăm và các biến âm đặc biệt.',
    badgeColor: 'bg-amber-500 text-white',
    bgGradient: 'from-amber-500/10 to-yellow-500/10',
    accentColor: '#f59e0b',
    kanjiPreview: 'ひゃく',
    notes: [
      '100 đọc là ひゃく (hyaku), KHÔNG đọc là いちひゃく.',
      '★ Biến âm đặc biệt bắt buộc nhớ:',
      '• 300: さんびゃく (sanbyaku) - biến âm bi',
      '• 600: ろっぴゃく (roppyaku) - biến âm ngắt âm pi',
      '• 800: はっぴゃく (happyaku) - biến âm ngắt âm pi'
    ],
    tableData: [
      { num: 100, hiragana: 'ひゃく', romaji: 'hyaku', kanji: '百', note: 'Không đọc ichihyaku' },
      { num: 200, hiragana: 'にひゃく', romaji: 'nihyaku', kanji: '二百' },
      { num: 300, hiragana: 'さんびゃく', romaji: 'sanbyaku', kanji: '三百', note: 'Biến âm byaku' },
      { num: 400, hiragana: 'よんひゃく', romaji: 'yonhyaku', kanji: '四百' },
      { num: 500, hiragana: 'ごひゃく', romaji: 'gohyaku', kanji: '五百' },
      { num: 600, hiragana: 'ろっぴゃく', romaji: 'roppyaku', kanji: '六百', note: 'Biến âm roppyaku' },
      { num: 700, hiragana: 'ななひゃく', romaji: 'nanahyaku', kanji: '七百' },
      { num: 800, hiragana: 'はっぴゃく', romaji: 'happyaku', kanji: '八百', note: 'Biến âm happyaku' },
      { num: 900, hiragana: 'きゅうひゃく', romaji: 'kyuuhyaku', kanji: '九百' },
      { num: 350, hiragana: 'さんびゃくごじゅう', romaji: 'sanbyakugojuu', kanji: '三百五十' }
    ]
  },
  {
    id: 4,
    title: 'Số từ 1.000 – 9.999',
    rangeLabel: '1.000 - 9.999',
    min: 1000,
    max: 9999,
    description: 'Số hàng nghìn, cách ghép và cách đọc...',
    badgeColor: 'bg-emerald-500 text-white',
    bgGradient: 'from-emerald-500/10 to-teal-500/10',
    accentColor: '#10b981',
    kanjiPreview: 'せん',
    notes: [
      '1.000 đọc là せん (sen), KHÔNG đọc là いちせん.',
      '★ Biến âm hàng nghìn cần nhớ:',
      '• 3.000: さんぜん (sanzen) - biến âm zen',
      '• 8.000: はっせん (hassen) - biến âm sokuon hassen'
    ],
    tableData: [
      { num: 1000, hiragana: 'せん', romaji: 'sen', kanji: '千', note: 'Không đọc ichisen' },
      { num: 2000, hiragana: 'にせん', romaji: 'nisen', kanji: '二千' },
      { num: 3000, hiragana: 'さんぜん', romaji: 'sanzen', kanji: '三千', note: 'Biến âm sanzen' },
      { num: 4000, hiragana: 'よんせん', romaji: 'yonsen', kanji: '四千' },
      { num: 5000, hiragana: 'ごせん', romaji: 'gosen', kanji: '五千' },
      { num: 6000, hiragana: 'ろくせん', romaji: 'rokusen', kanji: '六千' },
      { num: 7000, hiragana: 'ななせん', romaji: 'nanasen', kanji: '七千' },
      { num: 8000, hiragana: 'はっせん', romaji: 'hassen', kanji: '八千', note: 'Biến âm hassen' },
      { num: 9000, hiragana: 'きゅうせん', romaji: 'kyuusen', kanji: '九千' },
      { num: 3800, hiragana: 'さんぜんはっぴゃく', romaji: 'sanzenhappyaku', kanji: '三千八百' }
    ]
  },
  {
    id: 5,
    title: 'Số từ 10.000 – 99.999',
    rangeLabel: '10.000 - 99.999',
    min: 10000,
    max: 99999,
    description: 'Số hàng vạn (万).',
    badgeColor: 'bg-purple-500 text-white',
    bgGradient: 'from-purple-500/10 to-indigo-500/10',
    accentColor: '#8b5cf6',
    kanjiPreview: 'まん',
    notes: [
      '★ Khác biệt lớn giữa tiếng Việt và tiếng Nhật: Tiếng Nhật tách số theo đơn vị 4 chữ số (10.000 = 1 Vạn / 万).',
      '10.000 bắt buộc đọc là いちまん (ichiman), KHÔNG được đọc cụt là まん.',
      'Ví dụ: 25.000 = にまんごせん (2 vạn 5 nghìn).'
    ],
    tableData: [
      { num: 10000, hiragana: 'いちまん', romaji: 'ichiman', kanji: '一万', note: 'Bắt buộc có いち' },
      { num: 20000, hiragana: 'にまん', romaji: 'niman', kanji: '二万' },
      { num: 30000, hiragana: 'さんまん', romaji: 'sanman', kanji: '三万' },
      { num: 40000, hiragana: 'よんまん', romaji: 'yonman', kanji: '四万' },
      { num: 50000, hiragana: 'ごまん', romaji: 'goman', kanji: '五万' },
      { num: 65000, hiragana: 'ろくまんごせん', romaji: 'rokumangosen', kanji: '六万五千' },
      { num: 70000, hiragana: 'ななまん', romaji: 'nanaman', kanji: '七万' },
      { num: 80000, hiragana: 'はちまん', romaji: 'hachiman', kanji: '八万' },
      { num: 90000, hiragana: 'きゅうまん', romaji: 'kyuuman', kanji: '九万' },
      { num: 99999, hiragana: 'きゅうまんきゅうせんきゅうひゃくきゅうじゅうきゅう', romaji: 'kyuumankyuusenkyuuhyakukyuujuukyuu', kanji: '九万九千九百九十九' }
    ]
  },
  {
    id: 6,
    title: 'Số từ 100.000 – 999.999',
    rangeLabel: '100.000 - 999.999',
    min: 100000,
    max: 999999,
    description: 'Số hàng chục vạn.',
    badgeColor: 'bg-orange-500 text-white',
    bgGradient: 'from-orange-500/10 to-amber-500/10',
    accentColor: '#f97316',
    kanjiPreview: '十万',
    notes: [
      '100.000 = 10 vạn = じゅうまん (juuman).',
      '500.000 = 50 vạn = ごじゅうまん (gojuuman).',
      'Mẹo tính nhanh: Bỏ 4 số 0 cuối để ra số hàng Vạn (万) trong tiếng Nhật.'
    ],
    tableData: [
      { num: 100000, hiragana: 'じゅうまん', romaji: 'juuman', kanji: '十万' },
      { num: 200000, hiragana: 'にじゅうまん', romaji: 'nijuuman', kanji: '二十万' },
      { num: 350000, hiragana: 'さんじゅうごまん', romaji: 'sanjuugoman', kanji: '三十五万' },
      { num: 500000, hiragana: 'ごじゅうまん', romaji: 'gojuuman', kanji: '五十万' },
      { num: 680000, hiragana: 'ろくじゅうはちまん', romaji: 'rokujuuhachiman', kanji: '六十八万' },
      { num: 800000, hiragana: 'はちじゅうまん', romaji: 'hachijuuman', kanji: '八十万' },
      { num: 990000, hiragana: 'きゅうじゅうきゅうまん', romaji: 'kyuujuukyuuman', kanji: '九十九万' }
    ]
  },
  {
    id: 7,
    title: 'Số từ 1.000.000 – 9.999.999',
    rangeLabel: '1.000.000 - 9.999.999',
    min: 1000000,
    max: 9999999,
    description: 'Số hàng triệu (Trăm vạn).',
    badgeColor: 'bg-amber-600 text-white',
    bgGradient: 'from-amber-600/10 to-orange-500/10',
    accentColor: '#d97706',
    kanjiPreview: '百万',
    notes: [
      '1 triệu = 100 vạn = ひゃくまん (hyakuman).',
      '3 triệu = 300 vạn = さんびゃくまん (sanbyakuman) - chú ý biến âm byaku.',
      '6 triệu = 600 vạn = ろっぴゃくまん (roppyakuman) - biến âm roppyaku.',
      '8 triệu = 800 vạn = はっぴゃくまん (happyakuman) - biến âm happyaku.'
    ],
    tableData: [
      { num: 1000000, hiragana: 'ひゃくまん', romaji: 'hyakuman', kanji: '百万' },
      { num: 2000000, hiragana: 'にひゃくまん', romaji: 'nihyakuman', kanji: '二百万' },
      { num: 3000000, hiragana: 'さんびゃくまん', romaji: 'sanbyakuman', kanji: '三百万', note: 'Biến âm byaku' },
      { num: 5000000, hiragana: 'ごひゃくまん', romaji: 'gohyakuman', kanji: '五百万' },
      { num: 6000000, hiragana: 'ろっぴゃくまん', romaji: 'roppyakuman', kanji: '六百万', note: 'Biến âm roppyaku' },
      { num: 8000000, hiragana: 'はっぴゃくまん', romaji: 'happyakuman', kanji: '八百万', note: 'Biến âm happyaku' }
    ]
  },
  {
    id: 8,
    title: 'Số từ 10.000.000 – 999.999.999',
    rangeLabel: '10.000.000 - 999.999.999',
    min: 10000000,
    max: 999999999,
    description: 'Số hàng chục triệu đến hàng trăm triệu (Nghìn vạn & Ức 億).',
    badgeColor: 'bg-teal-600 text-white',
    bgGradient: 'from-teal-600/10 to-cyan-500/10',
    accentColor: '#0d9488',
    kanjiPreview: '千万/億',
    notes: [
      '10 triệu = 1.000 vạn = いっせんまん (issenman) - chú ý biến âm issen.',
      '100 triệu = 1 ức (億) = いちおく (ichioku). Bắt buộc có いち.',
      '200 triệu = におく (nioku).'
    ],
    tableData: [
      { num: 10000000, hiragana: 'いっせんまん', romaji: 'issenman', kanji: '一千万', note: 'Biến âm issen' },
      { num: 30000000, hiragana: 'さんぜんまん', romaji: 'sanzenman', kanji: '三千万', note: 'Biến âm sanzen' },
      { num: 50000000, hiragana: 'ごせんまん', romaji: 'gosenman', kanji: '五千万' },
      { num: 100000000, hiragana: 'いちおく', romaji: 'ichioku', kanji: '一億', note: 'Bắt buộc có いち' },
      { num: 300000000, hiragana: 'さんおく', romaji: 'san\'oku', kanji: '三億' },
      { num: 500000000, hiragana: 'ごおく', romaji: 'gooku', kanji: '五億' }
    ]
  },
  {
    id: 9,
    title: 'Số từ 1.000.000.000 trở lên',
    rangeLabel: '1.000.000.000+',
    min: 1000000000,
    max: 1000000000000,
    description: 'Số hàng tỷ, chục tỷ và các số lớn hơn (億, 兆).',
    badgeColor: 'bg-pink-600 text-white',
    bgGradient: 'from-pink-600/10 to-rose-600/10',
    accentColor: '#db2777',
    kanjiPreview: '十億',
    notes: [
      '1 tỷ = 10 ức = じゅうおく (juuoku).',
      '10 tỷ = 100 ức = ひゃくおく (hyakuoku).',
      '100 tỷ = 1.000 ức = せんおく (sen\'oku).',
      '1.000 tỷ = 1 triệu (兆) = いっちょう (icchou).'
    ],
    tableData: [
      { num: 1000000000, hiragana: 'じゅうおく', romaji: 'juuoku', kanji: '十億' },
      { num: 5000000000, hiragana: 'ごじゅうおく', romaji: 'gojuuoku', kanji: '五十億' },
      { num: 10000000000, hiragana: 'ひゃくおく', romaji: 'hyakuoku', kanji: '百億' },
      { num: 100000000000, hiragana: 'せんおく', romaji: 'sen\'oku', kanji: '千億' },
      { num: 1000000000000, hiragana: 'いっちょう', romaji: 'icchou', kanji: '一兆', note: 'Biến âm icchou' }
    ]
  }
];

export interface QuizOption {
  label: string;
  text: string;
  numText: string;
  num: number;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: number;
  num: number;
  hiragana: string;
  romaji: string;
  kanji: string;
  options: QuizOption[];
}

export function generateQuizQuestions(levelId: number | 'random', count: number = 10): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  const level = levelId === 'random' ? null : JAPANESE_NUMBER_LEVELS.find(l => l.id === levelId);

  // Sinh 10 số phù hợp
  for (let i = 0; i < count; i++) {
    let targetNum = 0;
    if (!level) {
      // Random từ 1 đến 1.000.000
      const randType = Math.floor(Math.random() * 6);
      if (randType === 0) targetNum = Math.floor(Math.random() * 10) + 1;
      else if (randType === 1) targetNum = Math.floor(Math.random() * 90) + 10;
      else if (randType === 2) targetNum = Math.floor(Math.random() * 900) + 100;
      else if (randType === 3) targetNum = Math.floor(Math.random() * 9000) + 1000;
      else if (randType === 4) targetNum = Math.floor(Math.random() * 90000) + 10000;
      else targetNum = (Math.floor(Math.random() * 90) + 10) * 10000;
    } else {
      if (level.id === 1) {
        // Cấp 1: 1-10 (Lấy từng số từ 1..10)
        targetNum = (i % 10) + 1;
      } else if (level.id === 2) {
        // Cấp 2: 11-99
        targetNum = Math.floor(Math.random() * 89) + 11;
      } else if (level.id === 3) {
        // Cấp 3: 100-999 (ưu tiên có số biến âm 300, 600, 800)
        const specials = [100, 300, 600, 800, 350, 620, 840, 230, 480, 750];
        targetNum = i < specials.length ? specials[i] : Math.floor(Math.random() * 899) + 100;
      } else if (level.id === 4) {
        // Cấp 4: 1.000 - 9.999 (ưu tiên 3000, 8000)
        const specials = [1000, 3000, 8000, 3500, 8200, 2400, 6000, 7500, 4300, 9100];
        targetNum = i < specials.length ? specials[i] : Math.floor(Math.random() * 8999) + 1000;
      } else if (level.id === 5) {
        // Cấp 5: 10.000 - 99.999
        targetNum = (Math.floor(Math.random() * 9) + 1) * 10000 + (Math.floor(Math.random() * 9) * 1000);
        if (targetNum === 0) targetNum = 10000;
      } else if (level.id === 6) {
        // Cấp 6: 100.000 - 999.999
        targetNum = (Math.floor(Math.random() * 89) + 10) * 10000;
      } else if (level.id === 7) {
        // Cấp 7: 1.000.000 - 9.999.999
        targetNum = (Math.floor(Math.random() * 9) + 1) * 1000000;
      } else if (level.id === 8) {
        // Cấp 8: 10.000.000 - 999.999.999
        const sampleNumbers = [10000000, 30000000, 50000000, 80000000, 100000000, 300000000, 500000000];
        targetNum = sampleNumbers[i % sampleNumbers.length];
      } else {
        // Cấp 9: 1 tỷ +
        const sampleNumbers = [1000000000, 2000000000, 5000000000, 10000000000, 50000000000, 100000000000];
        targetNum = sampleNumbers[i % sampleNumbers.length];
      }
    }

    const correct = numberToJapanese(targetNum);

    // Tạo 3 đáp án sai (distractors) hợp lý
    const distractorNumbers = new Set<number>();
    while (distractorNumbers.size < 3) {
      let d = 0;
      if (level && level.id === 1) {
        d = Math.floor(Math.random() * 10) + 1;
      } else if (level && level.id === 2) {
        d = Math.floor(Math.random() * 89) + 11;
      } else if (level && level.id === 3) {
        d = Math.floor(Math.random() * 899) + 100;
      } else {
        // Lân cận hoặc chia nhân
        const delta = (Math.floor(Math.random() * 5) - 2) * (targetNum > 10000 ? 10000 : 10);
        d = targetNum + (delta === 0 ? 1 : delta);
        if (d <= 0) d = targetNum + 2;
      }
      if (d !== targetNum) distractorNumbers.add(d);
    }

    const wrongList = Array.from(distractorNumbers).map(d => ({
      num: d,
      ...numberToJapanese(d)
    }));

    // Trộn 4 đáp án
    const all = [
      { ...correct, num: targetNum, isCorrect: true },
      ...wrongList.map(w => ({ ...w, isCorrect: false }))
    ].sort(() => Math.random() - 0.5);

    const labels = ['A', 'B', 'C', 'D'];
    questions.push({
      id: i + 1,
      num: targetNum,
      hiragana: correct.hiragana,
      romaji: correct.romaji,
      kanji: correct.kanji,
      options: all.map((opt, idx) => ({
        label: labels[idx],
        text: opt.hiragana,
        numText: opt.num.toLocaleString('vi-VN'),
        num: opt.num,
        isCorrect: opt.isCorrect
      }))
    });
  }

  return questions;
}
