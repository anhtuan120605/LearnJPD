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
  streak: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
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
    
    // Kiểm tra streak
    const today = new Date().toISOString().split('T')[0];
    if (parsed.lastActiveDate !== today) {
      const lastDate = new Date(parsed.lastActiveDate);
      const currentDate = new Date(today);
      const diffDays = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
      
      if (diffDays === 1) {
        parsed.streak = (parsed.streak || 0) + 1;
      } else if (diffDays > 1) {
        parsed.streak = 1;
      }
      parsed.lastActiveDate = today;
      saveLocalProgress(parsed, userId);
    }
    
    const progress: UserProgress = { ...defaultProgress, ...parsed };
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

    if (data.progress_data) {
      return data.progress_data as UserProgress;
    }

    return {
      masteredWords: data.mastered_words || [],
      favoriteWords: data.favorite_words || [],
      mistakeWords: data.mistake_words || [],
      hiddenWords: [],
      masteredKanji: data.mastered_kanji || [],
      favoriteKanji: data.favorite_kanji || [],
      streak: data.streak || 1,
      lastActiveDate: data.last_active_date || new Date().toISOString().split('T')[0],
      quizScores: data.quiz_scores || [],
      customNotebooks: defaultProgress.customNotebooks
    };
  } catch (err) {
    console.error('Lỗi lấy dữ liệu từ Supabase:', err);
    return null;
  }
}

