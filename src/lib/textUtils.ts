import * as wanakana from 'wanakana';

/**
 * Chuẩn hóa chuỗi tiếng Nhật / Romaji / Hán Việt để so sánh đáp án chính xác
 * - Loại bỏ toàn bộ các biến thể dấu ngã (half-width ~, full-width ～, wave dash 〜, ...)
 * - Loại bỏ dấu ba chấm, dấu gạch nối, dấu ngoặc, dấu câu tiếng Nhật và tiếng Anh
 * - Chuyển chữ thường, bỏ khoảng trắng
 * - Xử lý trợ từ / biến âm: ha/wa, wo/o
 */
export function normalizeJapaneseAnswer(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    // Loại bỏ tất cả biến thể dấu ngã (half-width, full-width, wave dash)
    .replace(/[~～〜\uFF5E\u301C]/g, '')
    // Loại bỏ dấu ba chấm, gạch ngang, ngoặc đơn/kép, dấu chấm giữa
    .replace(/[.…\-–—_()[\]（）「」『』・]/g, '')
    // Loại bỏ dấu câu tiếng Nhật và tiếng Anh, khoảng trắng
    .replace(/[.,!?。、\s\u3000]/g, '')
    // Biến âm trợ từ thường gặp
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
 * Kiểm tra xem một ký tự có phải là ký hiệu phụ (dấu ngã, ngoặc, gạch nối, ...) không cần gõ hay không
 */
export function isPunctuationOrSymbol(char: string): boolean {
  if (!char) return false;
  return /[~～〜\uFF5E\u301C\-–—_()[\]（）「」『』・.,!?。、\s\u3000]/.test(char);
}

/**
 * Kiểm tra đáp án tiếng Nhật toàn diện (chấp nhận mọi cách biểu diễn hợp lệ của người học)
 * - Chấp nhận cả Hiragana, Katakana, Romaji, hỗn hợp Katakana + Hiragana
 * - Chấp nhận cả trường âm có gạch nối '-' lẫn không có '-'
 * - Bỏ qua ký hiệu ngữ pháp ~, ～, ()
 */
export function isJapaneseAnswerMatch(userInput: string, targetAnswer: string): boolean {
  if (!userInput || !targetAnswer) return false;

  const cleanUser = userInput.trim();
  const cleanTarget = targetAnswer.trim();
  if (cleanUser === cleanTarget) return true;

  // 1. So khớp chuẩn hóa chặt chẽ
  const normUserStrict = normalizeJapaneseAnswer(cleanUser);
  const normTargetStrict = normalizeJapaneseAnswer(cleanTarget);
  if (normUserStrict === normTargetStrict) return true;

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
  if (userLenient === targetLenient) return true;

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
