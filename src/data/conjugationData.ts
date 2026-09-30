export type VerbGroup = 'group1' | 'group2' | 'group3' | 'i_adj' | 'na_adj';

export type ConjugationForm = 
  | 'te'             // Thể て
  | 'nai'            // Thể ない
  | 'ta'             // Thể Quá khứ た
  | 'masu'           // Thể Lịch sự ます
  | 'potential'      // Thể Khả năng
  | 'passive'        // Thể Bị động
  | 'causative'      // Thể Sai khiến
  | 'conditional_ba' // Thể Điều kiện ば
  | 'volitional'     // Thể Ý chí
  | 'imperative';    // Thể Mệnh lệnh

export interface FormResult {
  kanji: string;
  kana: string;
  romaji: string;
}

export interface ConjugationItem {
  id: string;
  dictionary: string;
  kana: string;
  romaji: string;
  meaning: string;
  group: VerbGroup;
  level: 'N5' | 'N4' | 'N3';
  explanation?: string;
  forms: Partial<Record<ConjugationForm, FormResult>>;
}

export const FORM_METADATA: Record<ConjugationForm, { nameVi: string; nameJp: string; suffix: string; example: string }> = {
  te: { nameVi: 'Thể て (Yêu cầu, nối câu)', nameJp: 'て形', suffix: '〜て / 〜で', example: '食べて (Ăn đi, hãy ăn)' },
  nai: { nameVi: 'Thể Phủ định (Không làm)', nameJp: 'ない形', suffix: '〜ない', example: '食べない (Không ăn)' },
  ta: { nameVi: 'Thể Quá khứ (Đã làm)', nameJp: 'た形', suffix: '〜た / 〜だ', example: '食べた (Đã ăn)' },
  masu: { nameVi: 'Thể Lịch sự (Masu)', nameJp: 'ます形', suffix: '〜ます', example: '食べます (Ăn - lịch sự)' },
  potential: { nameVi: 'Thể Khả năng (Có thể làm)', nameJp: '可能形', suffix: '〜える / 〜られる', example: '食べられる (Có thể ăn)' },
  passive: { nameVi: 'Thể Bị động (Bị / Được làm)', nameJp: '受身形', suffix: '〜あれる / 〜られる', example: '食べられる (Bị ăn)' },
  causative: { nameVi: 'Thể Sai khiến (Bắt / Cho phép)', nameJp: '使役形', suffix: '〜あせる / 〜させる', example: '食べさせる (Bắt ăn)' },
  conditional_ba: { nameVi: 'Thể Điều kiện (Nếu làm)', nameJp: 'ば形', suffix: '〜えば / 〜れば', example: '食べれば (Nếu ăn)' },
  volitional: { nameVi: 'Thể Ý chí (Rủ rê, dự định)', nameJp: '意向形', suffix: '〜おう / 〜よう', example: '食べよう (Hãy cùng ăn)' },
  imperative: { nameVi: 'Thể Mệnh lệnh (Ra lệnh)', nameJp: '命令形', suffix: '〜え / 〜ろ', example: '食べろ (Ăn đi!)' },
};

export const GROUP_METADATA: Record<VerbGroup, { nameVi: string; badge: string; color: string }> = {
  group1: { nameVi: 'Động từ Nhóm 1 (Godan - Ngũ đoạn)', badge: 'Nhóm 1', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  group2: { nameVi: 'Động từ Nhóm 2 (Ichidan - Một đoạn)', badge: 'Nhóm 2', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  group3: { nameVi: 'Động từ Nhóm 3 (Bất quy tắc する / くる)', badge: 'Nhóm 3', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
  i_adj: { nameVi: 'Tính từ đuôi い', badge: 'Tính từ い', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  na_adj: { nameVi: 'Tính từ đuôi な', badge: 'Tính từ な', color: 'bg-rose-500/10 text-rose-600 border-rose-500/20' },
};

export const CONJUGATION_ITEMS: ConjugationItem[] = [
  // ==========================================
  // NHÓM 1: GODAN (五段動詞)
  // ==========================================
  {
    id: 'v1_iku',
    dictionary: '行く',
    kana: 'いく',
    romaji: 'iku',
    meaning: 'Đi (Ngoại lệ thể Te/Ta)',
    group: 'group1',
    level: 'N5',
    explanation: 'Ngoại lệ: Đuôi [く] thường thành [いて], nhưng 行く thành 行って / 行った.',
    forms: {
      te: { kanji: '行って', kana: 'いって', romaji: 'itte' },
      nai: { kanji: '行かない', kana: 'いかない', romaji: 'ikanai' },
      ta: { kanji: '行った', kana: 'いった', romaji: 'itta' },
      masu: { kanji: '行きます', kana: 'いきます', romaji: 'ikimasu' },
      potential: { kanji: '行ける', kana: 'いける', romaji: 'ikeru' },
      passive: { kanji: '行かれる', kana: 'いかれる', romaji: 'ikareru' },
      causative: { kanji: '行かせる', kana: 'いかせる', romaji: 'ikaseru' },
      conditional_ba: { kanji: '行けば', kana: 'いけば', romaji: 'ikeba' },
      volitional: { kanji: '行こう', kana: 'いこう', romaji: 'ikou' },
      imperative: { kanji: '行け', kana: 'いけ', romaji: 'ike' },
    }
  },
  {
    id: 'v1_kaku',
    dictionary: '書く',
    kana: 'かく',
    romaji: 'kaku',
    meaning: 'Viết, vẽ',
    group: 'group1',
    level: 'N5',
    explanation: 'Quy tắc: Đuôi [く] -> [いて], [かない], [いた], [ける].',
    forms: {
      te: { kanji: '書いて', kana: 'かいて', romaji: 'kaite' },
      nai: { kanji: '書かない', kana: 'かかない', romaji: 'kakanai' },
      ta: { kanji: '書いた', kana: 'かいた', romaji: 'kaita' },
      masu: { kanji: '書きます', kana: 'かきます', romaji: 'kakimasu' },
      potential: { kanji: '書ける', kana: 'かける', romaji: 'kakeru' },
      passive: { kanji: '書かれる', kana: 'かかれる', romaji: 'kakareru' },
      causative: { kanji: '書かせる', kana: 'かかせる', romaji: 'kakaseru' },
      conditional_ba: { kanji: '書けば', kana: 'かけば', romaji: 'kakeba' },
      volitional: { kanji: '書こう', kana: 'かこう', romaji: 'kakou' },
      imperative: { kanji: '書け', kana: 'かけ', romaji: 'kake' },
    }
  },
  {
    id: 'v1_oyogu',
    dictionary: '泳ぐ',
    kana: 'およぐ',
    romaji: 'oyogu',
    meaning: 'Bơi',
    group: 'group1',
    level: 'N5',
    explanation: 'Quy tắc: Đuôi [ぐ] -> biến âm [いで], [いだ], [がない].',
    forms: {
      te: { kanji: '泳いで', kana: 'およいで', romaji: 'oyoide' },
      nai: { kanji: '泳がない', kana: 'およがない', romaji: 'oyoganai' },
      ta: { kanji: '泳いだ', kana: 'およいだ', romaji: 'oyoida' },
      masu: { kanji: '泳ぎます', kana: 'およぎます', romaji: 'oyogimasu' },
      potential: { kanji: '泳げる', kana: 'およげる', romaji: 'oyogeru' },
      passive: { kanji: '泳がれる', kana: 'およがれる', romaji: 'oyogareru' },
      causative: { kanji: '泳がせる', kana: 'およがせる', romaji: 'oyogaseru' },
      conditional_ba: { kanji: '泳げば', kana: 'およげば', romaji: 'oyogeba' },
      volitional: { kanji: '泳ごう', kana: 'およごう', romaji: 'oyogou' },
      imperative: { kanji: '泳げ', kana: 'およげ', romaji: 'oyoge' },
    }
  },
  {
    id: 'v1_nomu',
    dictionary: '飲む',
    kana: 'のむ',
    romaji: 'nomu',
    meaning: 'Uống',
    group: 'group1',
    level: 'N5',
    explanation: 'Quy tắc: Đuôi [む, ぶ, ぬ] -> [んで], [んだ].',
    forms: {
      te: { kanji: '飲んで', kana: 'のんで', romaji: 'nonde' },
      nai: { kanji: '飲まない', kana: 'のまない', romaji: 'nomanai' },
      ta: { kanji: '飲んだ', kana: 'のんだ', romaji: 'nonda' },
      masu: { kanji: '飲みます', kana: 'のみます', romaji: 'nomimasu' },
      potential: { kanji: '飲める', kana: 'のめる', romaji: 'nomeru' },
      passive: { kanji: '飲まれる', kana: 'のまれる', romaji: 'nomareru' },
      causative: { kanji: '飲ませる', kana: 'のませる', romaji: 'nomaseru' },
      conditional_ba: { kanji: '飲めば', kana: 'のめば', romaji: 'nomeba' },
      volitional: { kanji: '飲もう', kana: 'のもう', romaji: 'nomou' },
      imperative: { kanji: '飲め', kana: 'のめ', romaji: 'nome' },
    }
  },
  {
    id: 'v1_kau',
    dictionary: '買う',
    kana: 'かう',
    romaji: 'kau',
    meaning: 'Mua',
    group: 'group1',
    level: 'N5',
    explanation: 'Quy tắc: Đuôi [う, つ, る] -> [って], [った]. Đuôi [う] sang phủ định là [わない].',
    forms: {
      te: { kanji: '買って', kana: 'かって', romaji: 'katte' },
      nai: { kanji: '買わない', kana: 'かわない', romaji: 'kawanai' },
      ta: { kanji: '買った', kana: 'かった', romaji: 'katta' },
      masu: { kanji: '買います', kana: 'かいます', romaji: 'kaimasu' },
      potential: { kanji: '買える', kana: 'かえる', romaji: 'kaeru' },
      passive: { kanji: '買われる', kana: 'かわれる', romaji: 'kawareru' },
      causative: { kanji: '買わせる', kana: 'かわせる', romaji: 'kawaseru' },
      conditional_ba: { kanji: '買えば', kana: 'かえば', romaji: 'kaeba' },
      volitional: { kanji: '買おう', kana: 'かおう', romaji: 'kaou' },
      imperative: { kanji: '買え', kana: 'かえ', romaji: 'kae' },
    }
  },
  {
    id: 'v1_matsu',
    dictionary: '待つ',
    kana: 'まつ',
    romaji: 'matsu',
    meaning: 'Đợi, chờ',
    group: 'group1',
    level: 'N5',
    explanation: 'Quy tắc: Đuôi [つ] -> [って], [った], [たない], [てる].',
    forms: {
      te: { kanji: '待って', kana: 'まって', romaji: 'matte' },
      nai: { kanji: '待たない', kana: 'またない', romaji: 'matanai' },
      ta: { kanji: '待った', kana: 'まった', romaji: 'matta' },
      masu: { kanji: '待ちます', kana: 'まちます', romaji: 'machimasu' },
      potential: { kanji: '待てる', kana: 'まてる', romaji: 'materu' },
      passive: { kanji: '待たれる', kana: 'またれる', romaji: 'matareru' },
      causative: { kanji: '待たせる', kana: 'またせる', romaji: 'mataseru' },
      conditional_ba: { kanji: '待てば', kana: 'まてば', romaji: 'mateba' },
      volitional: { kanji: '待とう', kana: 'まとう', romaji: 'matou' },
      imperative: { kanji: '待て', kana: 'まて', romaji: 'mate' },
    }
  },
  {
    id: 'v1_hanasu',
    dictionary: '話す',
    kana: 'はなす',
    romaji: 'hanasu',
    meaning: 'Nói chuyện',
    group: 'group1',
    level: 'N5',
    explanation: 'Quy tắc: Đuôi [す] -> [して], [した], [さない], [せる].',
    forms: {
      te: { kanji: '話して', kana: 'はなして', romaji: 'hanashite' },
      nai: { kanji: '話さない', kana: 'はなさない', romaji: 'hanasanai' },
      ta: { kanji: '話した', kana: 'はなした', romaji: 'hanashita' },
      masu: { kanji: '話します', kana: 'はなします', romaji: 'hanashimasu' },
      potential: { kanji: '話せる', kana: 'はなせる', romaji: 'hanaseru' },
      passive: { kanji: '話される', kana: 'はなされる', romaji: 'hanasareru' },
      causative: { kanji: '話させる', kana: 'はなさせる', romaji: 'hanasaseru' },
      conditional_ba: { kanji: '話せば', kana: 'はなせば', romaji: 'hanaseba' },
      volitional: { kanji: '話そう', kana: 'はなそう', romaji: 'hanasou' },
      imperative: { kanji: '話せ', kana: 'はなせ', romaji: 'hanase' },
    }
  },
  {
    id: 'v1_asobu',
    dictionary: '遊ぶ',
    kana: 'あそぶ',
    romaji: 'asobu',
    meaning: 'Chơi, giải trí',
    group: 'group1',
    level: 'N5',
    explanation: 'Quy tắc: Đuôi [ぶ] -> [んで], [んだ], [ばない].',
    forms: {
      te: { kanji: '遊んで', kana: 'あそんで', romaji: 'asonde' },
      nai: { kanji: '遊ばない', kana: 'あそばない', romaji: 'asobanai' },
      ta: { kanji: '遊んだ', kana: 'あそんだ', romaji: 'asonda' },
      masu: { kanji: '遊びます', kana: 'あそびます', romaji: 'asobimasu' },
      potential: { kanji: '遊べる', kana: 'あそべる', romaji: 'asoberu' },
      passive: { kanji: '遊ばれる', kana: 'あそばれる', romaji: 'asobareru' },
      causative: { kanji: '遊ばせる', kana: 'あそばせる', romaji: 'asobaseru' },
      conditional_ba: { kanji: '遊べば', kana: 'あそべば', romaji: 'asobeba' },
      volitional: { kanji: '遊ぼう', kana: 'あそぼう', romaji: 'asobou' },
      imperative: { kanji: '遊べ', kana: 'あそべ', romaji: 'asobe' },
    }
  },
  {
    id: 'v1_kaeru',
    dictionary: '帰る',
    kana: 'かえる',
    romaji: 'kaeru',
    meaning: 'Về, trở về (Ngoại lệ nhóm 1)',
    group: 'group1',
    level: 'N5',
    explanation: 'Lưu ý: Mặc dù đuôi là [える], nhưng đây là ĐỘNG TỪ NHÓM 1: 帰って, 帰らない, 帰った.',
    forms: {
      te: { kanji: '帰って', kana: 'かえって', romaji: 'kaette' },
      nai: { kanji: '帰らない', kana: 'かえらない', romaji: 'kaeranai' },
      ta: { kanji: '帰った', kana: 'かえった', romaji: 'kaetta' },
      masu: { kanji: '帰ります', kana: 'かえります', romaji: 'kaerimasu' },
      potential: { kanji: '帰れる', kana: 'かえれる', romaji: 'kaereru' },
      passive: { kanji: '帰られる', kana: 'かえられる', romaji: 'kaerareru' },
      causative: { kanji: '帰らせる', kana: 'かえらせる', romaji: 'kaeraseru' },
      conditional_ba: { kanji: '帰れば', kana: 'かえれば', romaji: 'kaereba' },
      volitional: { kanji: '帰ろう', kana: 'かえろう', romaji: 'kaerou' },
      imperative: { kanji: '帰れ', kana: 'かえれ', romaji: 'kaere' },
    }
  },

  // ==========================================
  // NHÓM 2: ICHIDAN (一段動詞)
  // ==========================================
  {
    id: 'v2_taberu',
    dictionary: '食べる',
    kana: 'たべる',
    romaji: 'taberu',
    meaning: 'Ăn',
    group: 'group2',
    level: 'N5',
    explanation: 'Quy tắc Nhóm 2: Bỏ [る] thêm đuôi: [て], [ない], [た], [られる], [させる].',
    forms: {
      te: { kanji: '食べて', kana: 'たべて', romaji: 'tabete' },
      nai: { kanji: '食べない', kana: 'たべない', romaji: 'tabenai' },
      ta: { kanji: '食べた', kana: 'たべた', romaji: 'tabeta' },
      masu: { kanji: '食べます', kana: 'たべます', romaji: 'tabemasu' },
      potential: { kanji: '食べられる', kana: 'たべられる', romaji: 'taberareru' },
      passive: { kanji: '食べられる', kana: 'たべられる', romaji: 'taberareru' },
      causative: { kanji: '食べさせる', kana: 'たべさせる', romaji: 'tabesaseru' },
      conditional_ba: { kanji: '食べれば', kana: 'たべれば', romaji: 'tabereba' },
      volitional: { kanji: '食べよう', kana: 'たべよう', romaji: 'tabeyou' },
      imperative: { kanji: '食べろ', kana: 'たべろ', romaji: 'tabero' },
    }
  },
  {
    id: 'v2_miru',
    dictionary: '見る',
    kana: 'みる',
    romaji: 'miru',
    meaning: 'Nhìn, xem',
    group: 'group2',
    level: 'N5',
    explanation: 'Quy tắc Nhóm 2: Bỏ [る] thêm [て], [ない], [た], [られる].',
    forms: {
      te: { kanji: '見て', kana: 'みて', romaji: 'mite' },
      nai: { kanji: '見ない', kana: 'みない', romaji: 'minai' },
      ta: { kanji: '見た', kana: 'みた', romaji: 'mita' },
      masu: { kanji: '見ます', kana: 'みます', romaji: 'mimasu' },
      potential: { kanji: '見られる', kana: 'みられる', romaji: 'mirareru' },
      passive: { kanji: '見られる', kana: 'みられる', romaji: 'mirareru' },
      causative: { kanji: '見させる', kana: 'みさせる', romaji: 'misaseru' },
      conditional_ba: { kanji: '見れば', kana: 'みれば', romaji: 'mireba' },
      volitional: { kanji: '見よう', kana: 'みよう', romaji: 'miyou' },
      imperative: { kanji: '見ろ', kana: 'みろ', romaji: 'miro' },
    }
  },
  {
    id: 'v2_okiru',
    dictionary: '起きる',
    kana: 'おきる',
    romaji: 'okiru',
    meaning: 'Thức dậy',
    group: 'group2',
    level: 'N5',
    explanation: 'Quy tắc Nhóm 2: Bỏ [る] thêm [て], [ない], [た], [られる].',
    forms: {
      te: { kanji: '起きて', kana: 'おきて', romaji: 'okite' },
      nai: { kanji: '起きない', kana: 'おきない', romaji: 'okinai' },
      ta: { kanji: '起きた', kana: 'おきた', romaji: 'okita' },
      masu: { kanji: '起きます', kana: 'おきます', romaji: 'okimasu' },
      potential: { kanji: '起きられる', kana: 'おきられる', romaji: 'okirareru' },
      passive: { kanji: '起きられる', kana: 'おきられる', romaji: 'okirareru' },
      causative: { kanji: '起きさせる', kana: 'おきさせる', romaji: 'okisaseru' },
      conditional_ba: { kanji: '起きれば', kana: 'おきれば', romaji: 'okireba' },
      volitional: { kanji: '起きよう', kana: 'おきよう', romaji: 'okiyou' },
      imperative: { kanji: '起きろ', kana: 'おきろ', romaji: 'okiro' },
    }
  },
  {
    id: 'v2_oshieru',
    dictionary: '教える',
    kana: 'おしえる',
    romaji: 'oshieru',
    meaning: 'Dạy học, chỉ dẫn',
    group: 'group2',
    level: 'N5',
    explanation: 'Quy tắc Nhóm 2: Bỏ [る] thêm [て], [ない], [た], [られる].',
    forms: {
      te: { kanji: '教えて', kana: 'おしえて', romaji: 'oshiete' },
      nai: { kanji: '教えない', kana: 'おしえない', romaji: 'oshienai' },
      ta: { kanji: '教えた', kana: 'おしえた', romaji: 'oshieta' },
      masu: { kanji: '教えます', kana: 'おしえます', romaji: 'oshiemasu' },
      potential: { kanji: '教えられる', kana: 'おしえられる', romaji: 'oshierareru' },
      passive: { kanji: '教えられる', kana: 'おしえられる', romaji: 'oshierareru' },
      causative: { kanji: '教えさせる', kana: 'おしえさせる', romaji: 'oshiesaseru' },
      conditional_ba: { kanji: '教えれば', kana: 'おしえれば', romaji: 'oshiereba' },
      volitional: { kanji: '教えよう', kana: 'おしえよう', romaji: 'oshieyou' },
      imperative: { kanji: '教えろ', kana: 'おしえろ', romaji: 'oshiero' },
    }
  },

  // ==========================================
  // NHÓM 3: BẤT QUY TẮC (不規則動詞)
  // ==========================================
  {
    id: 'v3_suru',
    dictionary: 'する',
    kana: 'する',
    romaji: 'suru',
    meaning: 'Làm, thực hiện',
    group: 'group3',
    level: 'N5',
    explanation: 'Bất quy tắc: して, しない, した, できる (khả năng), される (bị động), させる (sai khiến), すれば, しよう, しろ.',
    forms: {
      te: { kanji: 'して', kana: 'して', romaji: 'shite' },
      nai: { kanji: 'しない', kana: 'しない', romaji: 'shinai' },
      ta: { kanji: 'した', kana: 'した', romaji: 'shita' },
      masu: { kanji: 'します', kana: 'します', romaji: 'shimasu' },
      potential: { kanji: 'できる', kana: 'できる', romaji: 'dekiru' },
      passive: { kanji: 'される', kana: 'される', romaji: 'sareru' },
      causative: { kanji: 'させる', kana: 'させる', romaji: 'saseru' },
      conditional_ba: { kanji: 'すれば', kana: 'すれば', romaji: 'sureba' },
      volitional: { kanji: 'しよう', kana: 'しよう', romaji: 'shiyou' },
      imperative: { kanji: 'しろ', kana: 'しろ', romaji: 'shiro' },
    }
  },
  {
    id: 'v3_kuru',
    dictionary: '来る',
    kana: 'くる',
    romaji: 'kuru',
    meaning: 'Đến',
    group: 'group3',
    level: 'N5',
    explanation: 'Bất quy tắc chữ 來: 来て [きて], 来ない [こない], 来た [きた], 来られる [こられる], 来れば [くれば], 来よう [こよう], 来い [こい].',
    forms: {
      te: { kanji: '来て', kana: 'きて', romaji: 'kite' },
      nai: { kanji: '来ない', kana: 'こない', romaji: 'konai' },
      ta: { kanji: '来た', kana: 'きた', romaji: 'kita' },
      masu: { kanji: '来ます', kana: 'きます', romaji: 'kimasu' },
      potential: { kanji: '来られる', kana: 'こられる', romaji: 'korareru' },
      passive: { kanji: '来られる', kana: 'こられる', romaji: 'korareru' },
      causative: { kanji: '来させる', kana: 'こさせる', romaji: 'kosaseru' },
      conditional_ba: { kanji: '来れば', kana: 'くれば', romaji: 'kureba' },
      volitional: { kanji: '来よう', kana: 'こよう', romaji: 'koyou' },
      imperative: { kanji: '来い', kana: 'こい', romaji: 'koi' },
    }
  },
  {
    id: 'v3_benkyou',
    dictionary: '勉強する',
    kana: 'べんきょうする',
    romaji: 'benkyou suru',
    meaning: 'Học tập (Danh động từ ghép)',
    group: 'group3',
    level: 'N5',
    explanation: 'Ghép danh từ + する: chia giống hệt động từ する.',
    forms: {
      te: { kanji: '勉強して', kana: 'べんきょうして', romaji: 'benkyoushite' },
      nai: { kanji: '勉強しない', kana: 'べんきょうしない', romaji: 'benkyoushinai' },
      ta: { kanji: '勉強した', kana: 'べんきょうした', romaji: 'benkyoushita' },
      masu: { kanji: '勉強します', kana: 'べんきょうします', romaji: 'benkyoushimasu' },
      potential: { kanji: '勉強できる', kana: 'べんきょうできる', romaji: 'benkyoudekiru' },
      passive: { kanji: '勉強される', kana: 'べんきょうされる', romaji: 'benkyousareru' },
      causative: { kanji: '勉強させる', kana: 'べんきょうさせる', romaji: 'benkyousaseru' },
      conditional_ba: { kanji: '勉強すれば', kana: 'べんきょうすれば', romaji: 'benkyousureba' },
      volitional: { kanji: '勉強しよう', kana: 'べんきょうしよう', romaji: 'benkyoushiyou' },
      imperative: { kanji: '勉強しろ', kana: 'べんきょうしろ', romaji: 'benkyoushiro' },
    }
  },

  // ==========================================
  // TÍNH TỪ ĐUÔI い (I-ADJECTIVES)
  // ==========================================
  {
    id: 'adj_takai',
    dictionary: '高い',
    kana: 'たかい',
    romaji: 'takai',
    meaning: 'Cao, đắt',
    group: 'i_adj',
    level: 'N5',
    explanation: 'Tính từ い: Phủ định [-くない], Quá khứ [-かった], Nối câu [-くて], Điều kiện [-ければ].',
    forms: {
      te: { kanji: '高くて', kana: 'たかくて', romaji: 'takakute' },
      nai: { kanji: '高くない', kana: 'たかくない', romaji: 'takakunai' },
      ta: { kanji: '高かった', kana: 'たかかった', romaji: 'takakatta' },
      conditional_ba: { kanji: '高ければ', kana: 'たかければ', romaji: 'takakeba' },
    }
  },
  {
    id: 'adj_ii',
    dictionary: 'いい (良い)',
    kana: 'いい (よい)',
    romaji: 'ii (yoi)',
    meaning: 'Tốt, đẹp (Ngoại lệ)',
    group: 'i_adj',
    level: 'N5',
    explanation: 'Lưu ý: Mọi phép chia của [いい] đều bắt nguồn từ gốc [よい]: よくて, よくない, よかった, よければ.',
    forms: {
      te: { kanji: 'よくて', kana: 'よくて', romaji: 'yokute' },
      nai: { kanji: 'よくない', kana: 'よくない', romaji: 'yokunai' },
      ta: { kanji: 'よかった', kana: 'よかった', romaji: 'yokatta' },
      conditional_ba: { kanji: 'よければ', kana: 'よければ', romaji: 'yokeba' },
    }
  },
  {
    id: 'adj_atsui',
    dictionary: '暑い',
    kana: 'あつい',
    romaji: 'atsui',
    meaning: 'Nóng (thời tiết)',
    group: 'i_adj',
    level: 'N5',
    explanation: 'Tính từ い: Bỏ [い] thêm [くて], [くない], [かった], [ければ].',
    forms: {
      te: { kanji: '暑くて', kana: 'あつくて', romaji: 'atsukute' },
      nai: { kanji: '暑くない', kana: 'あつくない', romaji: 'atsukunai' },
      ta: { kanji: '暑かった', kana: 'あつかった', romaji: 'atsukatta' },
      conditional_ba: { kanji: '暑ければ', kana: 'あつければ', romaji: 'atsukeba' },
    }
  },

  // ==========================================
  // TÍNH TỪ ĐUÔI な (NA-ADJECTIVES)
  // ==========================================
  {
    id: 'adj_shizuka',
    dictionary: '静か [な]',
    kana: 'しずか [な]',
    romaji: 'shizuka [na]',
    meaning: 'Yên tĩnh',
    group: 'na_adj',
    level: 'N5',
    explanation: 'Tính từ な: Nối câu [で], Phủ định [ではない / じゃない], Quá khứ [だった], Điều kiện [なら].',
    forms: {
      te: { kanji: '静かで', kana: 'しずかで', romaji: 'shizukade' },
      nai: { kanji: '静かではない', kana: 'しずかではない', romaji: 'shizukadewanai' },
      ta: { kanji: '静かだった', kana: 'しずかだった', romaji: 'shizukadatta' },
      conditional_ba: { kanji: '静かなら', kana: 'しずかなら', romaji: 'shizukanara' },
    }
  },
  {
    id: 'adj_genki',
    dictionary: '元気 [な]',
    kana: 'げんき [な]',
    romaji: 'genki [na]',
    meaning: 'Khỏe mạnh',
    group: 'na_adj',
    level: 'N5',
    explanation: 'Tính từ な: Nối câu [で], Phủ định [ではない], Quá khứ [だった], Điều kiện [なら].',
    forms: {
      te: { kanji: '元気で', kana: 'げんきで', romaji: 'genkide' },
      nai: { kanji: '元気ではない', kana: 'げんきではない', romaji: 'genkidewanai' },
      ta: { kanji: '元気だった', kana: 'げんきだった', romaji: 'genkidatta' },
      conditional_ba: { kanji: '元気なら', kana: 'げんきなら', romaji: 'genkinara' },
    }
  }
];
