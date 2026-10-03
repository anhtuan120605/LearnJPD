export interface WordItem {
  id: string;
  lesson: number;
  level: string; // "N5" | "N4" | "N3" | "N2" | "N1"
  kanji: string;
  kana: string;
  romaji: string;
  hanviet: string;
  meaning: string;
  meaning_en?: string;
  type?: string;
  examples?: Array<{
    ja: string;
    kana?: string;
    vi: string;
  }>;
}

export interface LessonGroup {
  lesson: number;
  title: string;
  level: string;
  words: WordItem[];
}

export interface KanjiItem {
  id: string;
  kanji: string;
  hanviet: string;
  strokes: number;
  jlpt: string;
  onyomi: string[];
  kunyomi: string[];
  meanings_vi: string[];
  meanings_en: string[];
  radical?: string;
  examples?: Array<{
    word: string;
    reading: string;
    meaning: string;
    hanviet?: string;
    level?: string;
  }>;
}

export interface RadicalItem {
  id: number;
  glyph: string;
  strokes: number;
  hanviet: string;
  meaning: string;
  variants?: string[];
  jaName?: string;
}

export interface CustomNotebookLesson {
  id: string;
  title: string;
  createdAt: string;
  words: WordItem[];
}

export type SrsRating = 'again' | 'hard' | 'good' | 'easy';

export interface SrsItem {
  id: string; // word or kanji ID
  type: 'word' | 'kanji';
  level: number; // 0 to 5
  nextReviewDate: string; // YYYY-MM-DD
  lastReviewedDate?: string;
  intervalDays: number;
  repetitions: number;
}

export interface UserProgress {
  masteredWords: string[];
  favoriteWords: string[];
  mistakeWords: string[];
  hiddenWords?: string[];
  masteredKanji: string[];
  favoriteKanji: string[];
  streak: number;
  lastActiveDate: string;
  quizScores: Array<{
    date: string;
    type: string;
    level: string;
    score: number;
    total: number;
  }>;
  customNotebooks?: CustomNotebookLesson[];
  srsItems?: Record<string, SrsItem>;
}

export interface GrammarPoint {
  id: string;
  structure: string;
  meaning: string;
  explanation: string;
  notes?: string[];
  subPoints?: Array<{
    title: string;
    explanation: string;
    examples?: Array<{ ja: string; kana: string; vi: string }>;
  }>;
  examples: Array<{
    ja: string;
    kana: string;
    vi: string;
  }>;
}

export interface GrammarSentenceItem {
  id: string;
  ja: string;
  kana: string;
  vi: string;
}

export interface GrammarConversationItem {
  speaker: string;
  ja: string;
  kana?: string;
  vi: string;
}

export interface GrammarLesson {
  lesson: number;
  title: string;
  level: string;
  bunkei?: GrammarSentenceItem[]; // II. Phần dịch Mẫu câu (文型)
  reibun?: GrammarSentenceItem[]; // II. Phần dịch Ví dụ (例文)
  kaiwa?: {
    title: string;
    lines: GrammarConversationItem[];
  }; // II. Phần dịch Hội thoại (会話)
  referenceInfo?: {
    title: string;
    description?: string;
    items: Array<{ ja: string; kana?: string; vi: string; extra?: string }>;
  }; // III. Từ và thông tin tham khảo (参考語彙)
  points: GrammarPoint[]; // IV. Giải thích ngữ pháp chi tiết (文法解説)
}

export interface ReadingQuestion {
  q: string;
  options: string[];
  answer: number;
  explain: string;
}

export interface ReadingLesson {
  lesson: number;
  title_ja: string;
  title_vi: string;
  content: string;
  content_kana: string;
  translation: string;
  questions: ReadingQuestion[];
}

export type WordPracticeFilter = 'all' | 'unmastered' | 'favorite' | 'mistake';
export type StudyMode = 'flashcard' | 'learn' | 'test' | 'match' | 'quiz' | 'cram' | 'translate' | 'shadowing';
