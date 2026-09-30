import { UserProgress } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEY = 'learn_jpd_progress_v1';

const defaultProgress: UserProgress = {
  masteredWords: [],
  favoriteWords: [],
  mistakeWords: [],
  masteredKanji: [],
  favoriteKanji: [],
  streak: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  quizScores: []
};

// 1. Tải tiến độ từ LocalStorage
export function loadLocalProgress(): UserProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress;
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
      saveLocalProgress(parsed);
    }
    
    return { ...defaultProgress, ...parsed };
  } catch (e) {
    console.error('Lỗi khi đọc LocalStorage:', e);
    return defaultProgress;
  }
}

// 2. Lưu tiến độ vào LocalStorage
export function saveLocalProgress(progress: UserProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
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
export function importProgressJSON(file: File): Promise<UserProgress> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content) as UserProgress;
        saveLocalProgress(parsed);
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
      masteredKanji: data.mastered_kanji || [],
      favoriteKanji: data.favorite_kanji || [],
      streak: data.streak || 1,
      lastActiveDate: data.last_active_date || new Date().toISOString().split('T')[0],
      quizScores: data.quiz_scores || []
    };
  } catch (err) {
    console.error('Lỗi lấy dữ liệu từ Supabase:', err);
    return null;
  }
}

