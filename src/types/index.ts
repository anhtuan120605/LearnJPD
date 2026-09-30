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

export interface CustomNotebookLesson {
  id: string;
  title: string;
  createdAt: string;
  words: WordItem[];
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
}

export interface GrammarPoint {
  id: string;
  structure: string;
  meaning: string;
  explanation: string;
  examples: Array<{
    ja: string;
    kana: string;
    vi: string;
  }>;
}

export interface GrammarLesson {
  lesson: number;
  title: string;
  level: string;
  points: GrammarPoint[];
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
