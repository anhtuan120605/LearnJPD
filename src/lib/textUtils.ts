import * as wanakana from 'wanakana';

/**
 * Chuẩn hóa chuỗi tiếng Nhật / Romaji / Hán Việt để so sánh đáp án chính xác
 * - Loại bỏ toàn bộ các biến thể dấu ngã (half-width ~, full-width ～, wave dash 〜, 〰, ...)
 * - Loại bỏ toàn bộ các biến thể dấu gạch ngang (ASCII -, fullwidth －, trường âm ー, horizontal bar ―, en dash –, em dash —, ‒)
 * - Loại bỏ dấu ngoặc đơn, ngoặc vuông, ngoặc tiếng Nhật
 * - Chuyển chữ thường, bỏ khoảng trắng và dấu câu
 * - Xử lý trợ từ / biến âm: ha/wa, wo/o
 */
export function normalizeJapaneseAnswer(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    // 1. Loại bỏ tất cả biến thể dấu ngã (half-width ~, full-width ～, wave dash 〜, 〰, ...)
    .replace(/[~～〜\uFF5E\u301C\u3030]/g, '')
    // 2. Loại bỏ tất cả các loại gạch ngang, gạch nối, trường âm, gạch dưới (-, －, ー, ―, –, —, ‒, _)
    .replace(/[\-－ー―–—‒_]/g, '')
    // 3. Loại bỏ dấu ngoặc đơn, ngoặc vuông, ngoặc nhọn, ngoặc tiếng Nhật
    .replace(/[()[\]（）「」『』【】［］〔〕]/g, '')
    // 4. Loại bỏ dấu ba chấm, dấu chấm giữa (nakaguro), dấu câu, khoảng trắng
    .replace(/[.…・·.,!?。、\s\u3000/／\\|｜]/g, '')
    // 5. Biến âm trợ từ thường gặp
    .replace(/ha/g, 'wa')
    .replace(/wo/g, 'o')
    .replace(/は/g, 'わ')
    .replace(/を/g, 'お');
}

/**
 * Chuẩn hóa ngữ âm mềm dẻo (lenient) cho trường âm (Chouonpu ー) và nguyên âm kéo dài:
 * - Giúp người học gõ 'pawadenki' hay 'pawa-denki' hay 'kohi' hay 'ko-hi-' đều khớp với từ gốc
 */
export function normalizeJapaneseLenient(text: string): string {
  if (!text) return '';
  let hira = wanakana.toHiragana(text);
  // Loại bỏ ký hiệu trường âm Katakana/Hiragana ー
  hira = hira.replace(/[ー]/g, '');
  // Rút gọn nguyên âm kéo dài tương đương trường âm: ああ->あ, いい->い, うう->う, えい->え, おう->お,...
  hira = hira.replace(/([あかさたなはまやらわがざだばぱ])あ+/g, '$1');
  hira = hira.replace(/([いきしちにひみりぎじぢびぴ])い+/g, '$1');
  hira = hira.replace(/([うくすつぬふむゆるぐずづぶぷ])う+/g, '$1');
  hira = hira.replace(/([えけせてねへめれげぜでべぺ])([えい])+/g, '$1');
  hira = hira.replace(/([おこそとのほもよろをごぞどぼぽ])([おう])+/g, '$1');
  return normalizeJapaneseAnswer(hira);
}

/**
 * Kiểm tra xem một ký tự có phải là ký hiệu phụ (dấu ngã, ngoặc, gạch nối, ...) không cần bắt buộc gõ hay không
 */
export function isPunctuationOrSymbol(char: string): boolean {
  if (!char) return false;
  return /[~～〜\uFF5E\u301C\u3030\-－ー―–—‒_()[\]（）「」『』【】［］〔〕・·.,!?。、\s\u3000/／]/.test(char);
}

export function toHiragana(text: string): string {
  if (!text) return '';
  return wanakana.toHiragana(text, { IMEMode: true });
}

/**
 * Tách và mở rộng các đáp án thay thế có chứa ngoặc đơn hoặc tiền tố gạch nối
 * Ví dụ:
 * - "なんさい（おいくつ）" -> ["なんさい", "おいくつ", "なんさいおいくつ"]
 * - "－かい（－がい）" -> ["－かい", "－がい", "かい", "がい"]
 * - "４分の１（１／４）" -> ["４分の１", "１／４", "1/4", "1／4"]
 * - "－さい" -> ["－さい", "さい"]
 * - "〜さん" -> ["〜さん", "さん"]
 */
export function expandAlternativeTargets(targets: (string | undefined)[]): string[] {
  const result = new Set<string>();

  for (const raw of targets) {
    if (!raw) continue;
    const t = raw.trim();
    if (!t) continue;
    result.add(t);

    // 1. Nếu có chứa ngoặc đơn hoặc ngoặc tiếng Nhật
    const parenMatch = t.match(/^([^\(（]+)[\(（](.*?)[\)）]/);
    if (parenMatch) {
      const mainPart = parenMatch[1].trim();
      const parenPart = parenMatch[2].trim();
      if (mainPart) {
        result.add(mainPart);
        // Tước thêm dấu nối nếu có (vd: －かい -> かい)
        const strippedMain = mainPart.replace(/^[~～〜\uFF5E\u301C\u3030\-－ー―–—‒_]+/g, '').trim();
        if (strippedMain) result.add(strippedMain);
      }
      if (parenPart) {
        result.add(parenPart);
        const strippedParen = parenPart.replace(/^[~～〜\uFF5E\u301C\u3030\-－ー―–—‒_]+/g, '').trim();
        if (strippedParen) result.add(strippedParen);
      }
      // Ghép toàn bộ không ngoặc
      result.add(t.replace(/[（\(\)）]/g, '').trim());
    }

    // 2. Tước các ký tự gạch nối, tilde ở đầu chuỗi (vd: －さい -> さい, 〜さん -> さん)
    const strippedPrefix = t.replace(/^[~～〜\uFF5E\u301C\u3030\-－ー―–—‒_]+/g, '').trim();
    if (strippedPrefix && strippedPrefix !== t) {
      result.add(strippedPrefix);
    }
  }

  return Array.from(result);
}

/**
 * Kiểm tra đáp án tiếng Nhật toàn diện (chấp nhận mọi cách biểu diễn hợp lệ của người học)
 * - Chấp nhận cả Hiragana, Katakana, Romaji, hỗn hợp Katakana + Hiragana
 * - Hỗ trợ nhiều đáp án hợp lệ thay thế (như Kanji, Romaji, từ phụ trong ngoặc...)
 */
export function isJapaneseAnswerMatch(
  userInput: string, 
  targetAnswer: string,
  ...alternativeTargets: (string | undefined)[]
): boolean {
  if (!userInput) return false;

  const allTargets = expandAlternativeTargets([targetAnswer, ...alternativeTargets]);
  if (allTargets.length === 0) return false;

  for (const target of allTargets) {
    if (checkSingleMatch(userInput, target)) {
      return true;
    }
  }
  return false;
}

function checkSingleMatch(userInput: string, targetAnswer: string): boolean {
  const cleanUser = userInput.trim();
  const cleanTarget = targetAnswer.trim();
  if (cleanUser === cleanTarget) return true;

  // 1. So khớp chuẩn hóa chặt chẽ (đã gỡ bỏ toàn bộ gạch ngang, tilde, ngoặc)
  const normUserStrict = normalizeJapaneseAnswer(cleanUser);
  const normTargetStrict = normalizeJapaneseAnswer(cleanTarget);
  if (normUserStrict && normUserStrict === normTargetStrict) return true;

  // 2. So khớp đồng dạng Hiragana (cả 2 cùng quy về Hiragana)
  const userHira = wanakana.toHiragana(cleanUser);
  const targetHira = wanakana.toHiragana(cleanTarget);
  if (normalizeJapaneseAnswer(userHira) === normalizeJapaneseAnswer(targetHira)) return true;

  // 3. So khớp đồng dạng Katakana
  const userKata = wanakana.toKatakana(cleanUser);
  const targetKata = wanakana.toKatakana(cleanTarget);
  if (normalizeJapaneseAnswer(userKata) === normalizeJapaneseAnswer(targetKata)) return true;

  // 4. So khớp đồng dạng Romaji
  const userRomaji = wanakana.toRomaji(cleanUser);
  const targetRomaji = wanakana.toRomaji(cleanTarget);
  if (normalizeJapaneseAnswer(userRomaji) === normalizeJapaneseAnswer(targetRomaji)) return true;

  // 5. So khớp ngữ âm mềm dẻo (hỗ trợ từ ghép Katakana + Hiragana, từ mượn trường âm)
  const userLenient = normalizeJapaneseLenient(cleanUser);
  const targetLenient = normalizeJapaneseLenient(cleanTarget);
  if (userLenient && userLenient === targetLenient) return true;

  return false;
}

/**
 * Chuyển đổi thông minh khi người học gõ vào ô nhập liệu:
 * - Nếu từ là thuần Katakana (vd: アメリカ) -> tự động chuyển Katakana
 * - Nếu từ là thuần Hiragana (vd: としょかん) -> tự động chuyển Hiragana
 * - Nếu từ là từ ghép lai (vd: パワーでんき, けしゴム, コピーします) ->
 *   tự động gán đúng phân đoạn Katakana cho phần Katakana và Hiragana cho phần Hiragana!
 */
export function smartHybridConvert(raw: string, target: string): string {
  if (!raw) return '';
  if (!target) return wanakana.toHiragana(raw, { IMEMode: true });

  const hasKata = /[\u30A0-\u30FF]/.test(target);
  const hasHira = /[\u3040-\u309F]/.test(target);

  // 1. Thuần Katakana
  if (hasKata && !hasHira) {
    return wanakana.toKatakana(raw, { IMEMode: true });
  }

  // 2. Thuần Hiragana
  if (!hasKata) {
    return wanakana.toHiragana(raw, { IMEMode: true });
  }

  // 3. Từ ghép lai Katakana + Hiragana (vd: パワーでんき, コピーします)
  const segments: { isKata: boolean; text: string }[] = [];
  let currentSeg = { isKata: /[\u30A0-\u30FFー]/.test(target[0]), text: '' };

  for (let i = 0; i < target.length; i++) {
    const char = target[i];
    const isK = /[\u30A0-\u30FFー]/.test(char);
    if (isK === currentSeg.isKata) {
      currentSeg.text += char;
    } else {
      segments.push(currentSeg);
      currentSeg = { isKata: isK, text: char };
    }
  }
  segments.push(currentSeg);

  // Chuyển toàn bộ chuỗi nhập sang Hiragana trước
  const fullHira = wanakana.toHiragana(raw, { IMEMode: true });

  // Tái tạo chuỗi khớp với cấu trúc script của từ mục tiêu
  let result = '';
  let hiraIdx = 0;
  for (const seg of segments) {
    const segHira = wanakana.toHiragana(seg.text);
    const segLen = segHira.length;

    const slice = fullHira.slice(hiraIdx, hiraIdx + segLen);
    hiraIdx += segLen;

    if (seg.isKata) {
      result += wanakana.toKatakana(slice);
    } else {
      result += slice;
    }
  }
  if (hiraIdx < fullHira.length) {
    result += fullHira.slice(hiraIdx);
  }
  return result;
}
