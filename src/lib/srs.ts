import { SrsItem, SrsRating, WordItem, KanjiItem } from '../types';

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDaysToDate(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Tính toán chu kỳ lặp lại ngắt quãng (SRS) dựa trên đánh giá của người học:
 * - 'again' (Quên): Reset chu kỳ về 1 ngày, level = 0
 * - 'hard'  (Khó): Tăng nhẹ chu kỳ (1.2x), lặp lại sớm
 * - 'good'  (Nhớ): Tăng theo các mốc chuẩn: 1 ngày -> 3 ngày -> 7 ngày -> 14 ngày -> 30 ngày
 * - 'easy'  (Dễ): Nhảy cóc chu kỳ nhanh hơn (2.2x), kéo dài thời gian ôn
 */
export function calculateNextSrsItem(
  current: SrsItem | undefined,
  id: string,
  type: 'word' | 'kanji',
  rating: SrsRating
): SrsItem {
  const today = getTodayDateString();
  const prevLevel = current ? current.level : 0;
  const prevInterval = current ? current.intervalDays : 1;
  const prevReps = current ? current.repetitions : 0;

  let newLevel = prevLevel;
  let newInterval = 1;

  switch (rating) {
    case 'again':
      newLevel = 0;
      newInterval = 1;
      break;

    case 'hard':
      newLevel = Math.max(1, prevLevel);
      newInterval = Math.max(1, Math.round(prevInterval * 1.2));
      break;

    case 'good':
      newLevel = Math.min(5, prevLevel + 1);
      if (newLevel === 1) newInterval = 1;
      else if (newLevel === 2) newInterval = 3;
      else if (newLevel === 3) newInterval = 7;
      else if (newLevel === 4) newInterval = 14;
      else newInterval = 30;
      break;

    case 'easy':
      newLevel = Math.min(5, prevLevel + 2);
      newInterval = Math.max(4, Math.round(prevInterval * 2.2));
      break;
  }

  return {
    id,
    type,
    level: newLevel,
    intervalDays: newInterval,
    repetitions: rating === 'again' ? 0 : prevReps + 1,
    lastReviewedDate: today,
    nextReviewDate: addDaysToDate(today, newInterval),
  };
}

export interface DueReviewItem {
  srs: SrsItem;
  word?: WordItem;
  kanji?: KanjiItem;
}

/**
 * Lọc danh sách các mục đến hạn ôn tập trong ngày hôm nay (hoặc quá hạn chưa ôn)
 */
export function getDueSrsItems(
  srsItems: Record<string, SrsItem> = {},
  allWords: WordItem[] = [],
  allKanji: KanjiItem[] = []
): DueReviewItem[] {
  const today = getTodayDateString();
  const wordMap = new Map<string, WordItem>(allWords.map((w) => [w.id, w]));
  const kanjiMap = new Map<string, KanjiItem>(allKanji.map((k) => [k.id, k]));

  const dueList: DueReviewItem[] = [];

  for (const srs of Object.values(srsItems)) {
    if (srs.nextReviewDate <= today) {
      if (srs.type === 'word') {
        const word = wordMap.get(srs.id);
        if (word) {
          dueList.push({ srs, word });
        }
      } else {
        const kanji = kanjiMap.get(srs.id);
        if (kanji) {
          dueList.push({ srs, kanji });
        }
      }
    }
  }

  return dueList;
}

/**
 * Tự động đồng bộ hóa kho từ vựng đã học / đã thuộc vào hàng đợi SRS nếu chưa có
 */
export function autoSeedSrsFromProgress(
  existingSrs: Record<string, SrsItem> = {},
  masteredWords: string[] = [],
  favoriteWords: string[] = [],
  mistakeWords: string[] = [],
  masteredKanji: string[] = []
): Record<string, SrsItem> {
  const result: Record<string, SrsItem> = { ...existingSrs };
  const today = getTodayDateString();

  // Đưa từ đã thuộc vào SRS (nếu chưa có)
  for (const id of masteredWords) {
    if (!result[id]) {
      result[id] = {
        id,
        type: 'word',
        level: 1,
        intervalDays: 1,
        repetitions: 1,
        lastReviewedDate: today,
        nextReviewDate: today, // Đến hạn ngay để người dùng ôn lượt đầu
      };
    }
  }

  // Đưa từ yêu thích vào SRS
  for (const id of favoriteWords) {
    if (!result[id]) {
      result[id] = {
        id,
        type: 'word',
        level: 0,
        intervalDays: 1,
        repetitions: 0,
        lastReviewedDate: today,
        nextReviewDate: today,
      };
    }
  }

  // Đưa từ hay sai vào SRS (mức ưu tiên ôn lại hàng ngày)
  for (const id of mistakeWords) {
    if (!result[id]) {
      result[id] = {
        id,
        type: 'word',
        level: 0,
        intervalDays: 1,
        repetitions: 0,
        lastReviewedDate: today,
        nextReviewDate: today,
      };
    }
  }

  // Đưa Kanji đã thuộc vào SRS
  for (const id of masteredKanji) {
    if (!result[id]) {
      result[id] = {
        id,
        type: 'kanji',
        level: 1,
        intervalDays: 1,
        repetitions: 1,
        lastReviewedDate: today,
        nextReviewDate: today,
      };
    }
  }

  return result;
}
