import { WordItem, LessonGroup } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';

export interface VocabOverride {
  id: string;
  courseKey: string;
  lesson: number;
  kanji: string;
  kana: string;
  romaji: string;
  meaning: string;
  hanviet?: string;
  examples?: { ja: string; vi: string }[];
  isCustomAdded?: boolean;
  isDeleted?: boolean;
  updatedAt: string;
  updatedBy?: string;
}

const LOCAL_STORAGE_KEY = 'learn_jpd_vocab_overrides';

/**
 * Tải danh sách từ đã được chỉnh sửa / bổ sung từ LocalStorage
 */
export function loadLocalVocabOverrides(): Record<string, VocabOverride> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (err) {
    console.warn('[VocabOverrides] Lỗi khi đọc LocalStorage:', err);
    return {};
  }
}

/**
 * Lưu danh sách override vào LocalStorage
 */
export function saveLocalVocabOverrides(overrides: Record<string, VocabOverride>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(overrides));
  } catch (err) {
    console.warn('[VocabOverrides] Lỗi khi ghi LocalStorage:', err);
  }
}

/**
 * Tải danh sách từ đã sửa từ Supabase Cloud (Đồng bộ chung cho tất cả người dùng)
 */
export async function fetchCloudVocabOverrides(): Promise<Record<string, VocabOverride>> {
  const localMap = loadLocalVocabOverrides();
  if (!isSupabaseConfigured || !supabase) {
    return localMap;
  }

  try {
    const { data, error } = await supabase
      .from('vocab_overrides')
      .select('*');

    if (error || !data) {
      console.warn('[VocabOverrides] Không thể tải từ Supabase (bảng có thể chưa tạo):', error?.message);
      return localMap;
    }

    const cloudMap: Record<string, VocabOverride> = { ...localMap };
    data.forEach((row: any) => {
      const item: VocabOverride = {
        id: row.id,
        courseKey: row.course_key,
        lesson: row.lesson,
        kanji: row.word_data?.kanji || '',
        kana: row.word_data?.kana || '',
        romaji: row.word_data?.romaji || '',
        meaning: row.word_data?.meaning || '',
        hanviet: row.word_data?.hanviet || '',
        examples: row.word_data?.examples || [],
        isCustomAdded: Boolean(row.word_data?.isCustomAdded),
        isDeleted: Boolean(row.is_deleted),
        updatedAt: row.updated_at || new Date().toISOString(),
        updatedBy: row.updated_by || 'Admin',
      };
      cloudMap[item.id] = item;
    });

    // Cập nhật lại cache cục bộ
    saveLocalVocabOverrides(cloudMap);
    return cloudMap;
  } catch (err) {
    console.warn('[VocabOverrides] Lỗi mạng khi fetch Supabase:', err);
    return localMap;
  }
}

/**
 * Lắng nghe thay đổi thời gian thực từ Supabase
 * Khi Admin sửa hoặc xóa từ, các tài khoản khác đang mở web sẽ tự động cập nhật ngay lập tức
 */
export function subscribeToCloudVocabOverrides(
  onUpdate: (override: VocabOverride) => void
): () => void {
  if (!isSupabaseConfigured || !supabase) {
    return () => {};
  }

  try {
    const channel = supabase
      .channel('vocab_overrides_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'vocab_overrides' },
        (payload) => {
          if (payload.new && (payload.new as any).id) {
            const row = payload.new as any;
            const item: VocabOverride = {
              id: row.id,
              courseKey: row.course_key,
              lesson: row.lesson,
              kanji: row.word_data?.kanji || '',
              kana: row.word_data?.kana || '',
              romaji: row.word_data?.romaji || '',
              meaning: row.word_data?.meaning || '',
              hanviet: row.word_data?.hanviet || '',
              examples: row.word_data?.examples || [],
              isCustomAdded: Boolean(row.word_data?.isCustomAdded),
              isDeleted: Boolean(row.is_deleted),
              updatedAt: row.updated_at || new Date().toISOString(),
              updatedBy: row.updated_by || 'Admin',
            };
            const local = loadLocalVocabOverrides();
            local[item.id] = item;
            saveLocalVocabOverrides(local);
            onUpdate(item);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.warn('[VocabOverrides] Lỗi khi đăng ký realtime listener:', err);
    return () => {};
  }
}

/**
 * Lưu và đồng bộ 1 từ vựng mới / sửa lên Cloud và Local
 */
export async function syncSaveVocabOverride(
  override: VocabOverride,
  userEmail?: string | null
): Promise<{ success: boolean; error?: string }> {
  // 1. Lưu ngay vào LocalStorage để phản ánh lập tức trên giao diện
  const localMap = loadLocalVocabOverrides();
  localMap[override.id] = {
    ...override,
    updatedAt: new Date().toISOString(),
    updatedBy: userEmail || 'Admin',
  };
  saveLocalVocabOverrides(localMap);

  // 2. Đồng bộ lên Supabase nếu có cấu hình
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('vocab_overrides')
        .upsert({
          id: override.id,
          course_key: override.courseKey,
          lesson: override.lesson,
          word_data: {
            kanji: override.kanji,
            kana: override.kana,
            romaji: override.romaji,
            meaning: override.meaning,
            hanviet: override.hanviet,
            examples: override.examples,
            isCustomAdded: override.isCustomAdded,
          },
          is_deleted: Boolean(override.isDeleted),
          updated_at: new Date().toISOString(),
          updated_by: userEmail || 'Admin',
        }, { onConflict: 'id' });

      if (error) {
        console.warn('[VocabOverrides] Lỗi khi lưu lên Supabase:', error.message);
        return { success: true, error: 'Đã lưu trên máy của bạn (Supabase: ' + error.message + ')' };
      }
    } catch (err: any) {
      console.warn('[VocabOverrides] Ngoại lệ khi lưu Supabase:', err);
      return { success: true, error: 'Đã lưu trên máy (Không kết nối được server)' };
    }
  }

  return { success: true };
}

/**
 * Áp dụng danh sách overrides vào bộ từ vựng của một bài học
 */
export function applyVocabOverridesToWords(
  baseWords: WordItem[],
  courseKey: string,
  lessonNum: number,
  overrides: Record<string, VocabOverride>
): WordItem[] {
  if (!overrides || Object.keys(overrides).length === 0) {
    return baseWords;
  }

  // 1. Cập nhật các từ hiện có và lọc bỏ các từ bị đánh dấu xóa
  const modifiedWords: WordItem[] = [];

  baseWords.forEach((word) => {
    const override = overrides[word.id];
    if (override) {
      if (override.isDeleted) {
        // Bỏ qua từ bị Admin xóa
        return;
      }
      modifiedWords.push({
        ...word,
        kanji: override.kanji ?? word.kanji,
        kana: override.kana ?? word.kana,
        romaji: override.romaji ?? word.romaji,
        meaning: override.meaning ?? word.meaning,
        hanviet: override.hanviet ?? word.hanviet,
        examples: override.examples ?? word.examples,
      });
    } else {
      modifiedWords.push(word);
    }
  });

  // 2. Nạp thêm các từ vựng mới do Admin thêm vào bài này
  Object.values(overrides).forEach((override) => {
    if (
      override.isCustomAdded &&
      !override.isDeleted &&
      override.courseKey === courseKey &&
      override.lesson === lessonNum
    ) {
      // Tránh trùng lặp nếu id đã có
      if (!modifiedWords.some((w) => w.id === override.id)) {
        modifiedWords.push({
          id: override.id,
          lesson: override.lesson,
          kanji: override.kanji,
          kana: override.kana,
          romaji: override.romaji,
          meaning: override.meaning,
          hanviet: override.hanviet || '',
          level: 'N5',
          examples: override.examples || [],
        });
      }
    }
  });

  return modifiedWords;
}
