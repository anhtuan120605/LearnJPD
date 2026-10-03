import { UserProgress } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';

const BASE_STORAGE_KEY = 'learn_jpd_progress';

function getStorageKey(userId?: string): string {
  if (userId) return `${BASE_STORAGE_KEY}_user_${userId}`;
  return `${BASE_STORAGE_KEY}_guest`;
}

export const defaultProgress: UserProgress = {
  masteredWords: [],
  favoriteWords: [],
  mistakeWords: [],
  hiddenWords: [],
  masteredKanji: [],
  favoriteKanji: [],
  streak: 0,
  lastActiveDate: '',
  quizScores: [],
  customNotebooks: [
    {
      id: 'custom-lesson-1',
      title: 'Bài 1',
      createdAt: new Date().toISOString(),
      words: []
    }
  ]
};

// Lấy ngày hiện tại theo giờ địa phương của thiết bị (YYYY-MM-DD)
export function getLocalTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Tính số ngày chênh lệch giữa 2 ngày YYYY-MM-DD theo lịch
export function getDaysBetweenDates(fromStr: string, toStr: string): number {
  if (!fromStr || !toStr) return 999;
  const [y1, m1, d1] = fromStr.split('-').map(Number);
  const [y2, m2, d2] = toStr.split('-').map(Number);
  if (!y1 || !m1 || !d1 || !y2 || !m2 || !d2) return 999;
  const date1 = new Date(y1, m1 - 1, d1);
  const date2 = new Date(y2, m2 - 1, d2);
  const diffMs = date2.getTime() - date1.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

// Đánh giá trạng thái streak khi khởi động ứng dụng
export function evaluateStreak(progress: UserProgress): UserProgress {
  const hasEverStudied = (progress.masteredWords && progress.masteredWords.length > 0) ||
    (progress.masteredKanji && progress.masteredKanji.length > 0) ||
    (progress.quizScores && progress.quizScores.length > 0);

  // Nếu người dùng chưa từng học từ nào, streak phải là 0
  if (!hasEverStudied) {
    return {
      ...progress,
      streak: 0,
      lastActiveDate: ''
    };
  }

  const today = getLocalTodayDateString();
  const lastActive = progress.lastActiveDate;

  if (!lastActive) {
    return {
      ...progress,
      streak: 1,
      lastActiveDate: today
    };
  }

  const diff = getDaysBetweenDates(lastActive, today);

  if (diff <= 1) {
    // diff === 0 (hôm nay đã học) hoặc diff === 1 (hôm qua có học, hôm nay chưa học)
    // Giữ nguyên chuỗi để người dùng học tiếp hôm nay
    return {
      ...progress,
      streak: Math.max(1, progress.streak || 1)
    };
  } else {
    // diff > 1: Bỏ lỡ từ 2 ngày trở lên -> Đứt chuỗi về 0
    return {
      ...progress,
      streak: 0
    };
  }
}

// Cập nhật streak khi người dùng thực hiện hoạt động học tập
export function recordStudyActivity(progress: UserProgress): UserProgress {
  const today = getLocalTodayDateString();
  const lastActive = progress.lastActiveDate;

  if (lastActive === today) {
    // Hôm nay đã ghi nhận rồi, không tăng lặp lại trong ngày
    return progress;
  }

  const diff = lastActive ? getDaysBetweenDates(lastActive, today) : 999;
  let newStreak = 1;

  if (diff === 1) {
    // Học liên tiếp hôm qua và hôm nay
    newStreak = (progress.streak || 0) + 1;
  } else {
    // Bắt đầu chuỗi mới
    newStreak = 1;
  }

  return {
    ...progress,
    streak: newStreak,
    lastActiveDate: today
  };
}

// 1. Tải tiến độ từ LocalStorage (cô lập theo từng tài khoản / khách)
export function loadLocalProgress(userId?: string): UserProgress {
  try {
    const key = getStorageKey(userId);
    let raw = localStorage.getItem(key);
    
    // Fallback: nếu chưa có key mới nhưng có legacy key và là guest
    if (!raw && !userId) {
      raw = localStorage.getItem('learn_jpd_progress_v1');
    }

    if (!raw) return { ...defaultProgress, customNotebooks: [...defaultProgress.customNotebooks] };
    const parsed = JSON.parse(raw);
    
    // Kiểm tra và đánh giá lại streak chuẩn xác
    const progressWithStreak = evaluateStreak({ ...defaultProgress, ...parsed });
    if (progressWithStreak.streak !== parsed.streak || progressWithStreak.lastActiveDate !== parsed.lastActiveDate) {
      saveLocalProgress(progressWithStreak, userId);
    }
    
    const progress: UserProgress = progressWithStreak;
    if (!progress.customNotebooks || progress.customNotebooks.length === 0) {
      progress.customNotebooks = defaultProgress.customNotebooks;
    }
    if (!progress.hiddenWords) {
      progress.hiddenWords = [];
    }
    return progress;
  } catch (e) {
    console.error('Lỗi khi đọc LocalStorage:', e);
    return defaultProgress;
  }
}

// 2. Lưu tiến độ vào LocalStorage (cô lập theo từng tài khoản)
export function saveLocalProgress(progress: UserProgress, userId?: string): void {
  try {
    const key = getStorageKey(userId);
    localStorage.setItem(key, JSON.stringify(progress));
  } catch (e) {
    console.error('Lỗi khi lưu LocalStorage:', e);
  }
}

// 3. Xuất file backup JSON
export function exportProgressJSON(progress: UserProgress): void {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(progress, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `learn_jpd_backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

// 4. Nhập file backup JSON
export function importProgressJSON(file: File, userId?: string): Promise<UserProgress> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content) as UserProgress;
        saveLocalProgress(parsed, userId);
        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

// 5. Đồng bộ với Supabase
export async function syncWithSupabase(userId: string, progress: UserProgress): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const { error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        mastered_words: progress.masteredWords,
        favorite_words: progress.favoriteWords,
        mistake_words: progress.mistakeWords,
        mastered_kanji: progress.masteredKanji,
        favorite_kanji: progress.favoriteKanji,
        streak: progress.streak,
        last_active_date: progress.lastActiveDate,
        quiz_scores: progress.quizScores,
        progress_data: progress,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
    
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Lỗi đồng bộ Supabase:', err);
    return false;
  }
}

export async function fetchFromSupabase(userId: string): Promise<UserProgress | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error || !data) return null;

    let result: UserProgress;
    if (data.progress_data) {
      result = { ...defaultProgress, ...(data.progress_data as UserProgress) };
    } else {
      result = {
        masteredWords: data.mastered_words || [],
        favoriteWords: data.favorite_words || [],
        mistakeWords: data.mistake_words || [],
        hiddenWords: [],
        masteredKanji: data.mastered_kanji || [],
        favoriteKanji: data.favorite_kanji || [],
        streak: data.streak || 0,
        lastActiveDate: data.last_active_date || '',
        quizScores: data.quiz_scores || [],
        customNotebooks: defaultProgress.customNotebooks
      };
    }

    // Luôn đánh giá lại streak chuẩn xác theo hoạt động thực tế
    const evaluated = evaluateStreak(result);
    // Nếu có sự chênh lệch (ví dụ streak cũ là 1 nhưng chưa học gì, cần reset về 0), đồng bộ lại Supabase
    if (evaluated.streak !== result.streak || evaluated.lastActiveDate !== result.lastActiveDate) {
      syncWithSupabase(userId, evaluated).catch(() => {});
    }

    return evaluated;
  } catch (err) {
    console.error('Lỗi lấy dữ liệu từ Supabase:', err);
    return null;
  }
}

