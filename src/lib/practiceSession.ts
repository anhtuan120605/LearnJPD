import { WordItem } from '../types';

export interface QuizSessionState {
  currentIdx: number;
  quizQueue: WordItem[];
  score: number;
  mode: 'multiple_choice' | 'typing' | 'matching';
  resolvedWordIds: string[];
  retryCount: number;
  repeatMistakes: boolean;
  updatedAt: number;
}

export interface CrammingSessionState {
  currentIndex: number;
  activeWords: WordItem[];
  score: number;
  resolvedWordIds: string[];
  retryCount: number;
  testType: 'reading' | 'han';
  repeatMistakes: boolean;
  updatedAt: number;
}

/**
 * Tạo session key duy nhất dựa trên danh sách từ vựng
 */
export function getPracticeSessionKey(prefix: string, words: WordItem[], customId?: string): string {
  if (customId) return `learn_jpd_session_${prefix}_${customId}`;
  if (!words || words.length === 0) return `learn_jpd_session_${prefix}_empty`;
  const firstId = words[0]?.id || '0';
  const lastId = words[words.length - 1]?.id || '0';
  return `learn_jpd_session_${prefix}_${words.length}_${firstId}_${lastId}`;
}

/**
 * Lưu trạng thái session vào localStorage
 */
export function savePracticeSession<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn('[PracticeSession] Failed to save session:', err);
  }
}

/**
 * Tải trạng thái session từ localStorage
 */
export function loadPracticeSession<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn('[PracticeSession] Failed to load session:', err);
    return null;
  }
}

/**
 * Xóa session khỏi localStorage khi hoàn thành hoặc bắt đầu lại
 */
export function clearPracticeSession(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.warn('[PracticeSession] Failed to clear session:', err);
  }
}
