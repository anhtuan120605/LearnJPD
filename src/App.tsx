import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { WordListView } from './components/WordListView';
import { FlashcardView } from './components/FlashcardView';
import { KanjiMasterView } from './components/KanjiMasterView';
import { PracticeView } from './components/PracticeView';
import { CrammingModeView } from './components/CrammingModeView';
import { SentenceTranslateView } from './components/SentenceTranslateView';
import { ShadowingView } from './components/ShadowingView';
import { StudyModeSelector, StudyMode } from './components/StudyModeSelector';
import { GrammarView } from './components/GrammarView';
import { ReadingView } from './components/ReadingView';
import { AuthModal } from './components/AuthModal';
import { BackupModal } from './components/BackupModal';
import { LessonSelector } from './components/LessonSelector';
import { CustomNotebookView } from './components/CustomNotebookView';
import { PracticeHubScopeBar, WordPracticeFilter } from './components/PracticeHubScopeBar';

import { 
  courseDatasets, 
  kanjiDatasets, 
  minnaGrammarDatasets, 
  minnaReadingDatasets,
  n3GrammarDatasets,
  n3ReadingDatasets,
  n2GrammarDatasets,
  n2ReadingDatasets,
  n1GrammarDatasets,
  n1ReadingDatasets
} from './data';
import { loadLocalProgress, saveLocalProgress, syncWithSupabase, fetchFromSupabase } from './lib/storage';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { UserProgress, CustomNotebookLesson } from './types';
import { 
  BookOpen, 
  Layers, 
  ListFilter, 
  Sparkles, 
  CheckCircle, 
  ChevronDown,
  FileText,
  ChevronLeft,
  Star,
  LayoutGrid
} from 'lucide-react';
import { getLessonTopic } from './data/lessonTopics';

export type LessonSubTab = 'vocab' | 'grammar' | 'reading' | 'practice';

export function App() {
  // Tabs: 'tango' (Từ vựng) | 'kanji' (Chữ Hán) | 'practice' (Luyện tập) | 'notebook' (Sổ tay từ vựng)
  const [activeTab, setActiveTab] = useState<'tango' | 'kanji' | 'practice' | 'notebook'>('tango');
  
  // Chế độ xem trong Phân hệ Từ vựng: 'dashboard' (Lưới thẻ bài học lớn) | 'study' (Bàn học Split-View)
  const [tangoViewMode, setTangoViewMode] = useState<'dashboard' | 'study'>('dashboard');

  // Chế độ xem trong Bài học: 'vocab' (Danh sách từ vựng - mặc định) | 'grammar' (Ngữ pháp) | 'reading' (Bài đọc) | 'practice' (5 chế độ học)
  const [lessonSubTab, setLessonSubTab] = useState<LessonSubTab>('vocab');

  // 5 Chế độ học theo screenshot: 'flashcard' | 'quiz' | 'cram' | 'translate' | 'shadowing'
  const [studyMode, setStudyMode] = useState<StudyMode>('flashcard');

  // Khóa giáo trình / cấp độ đang chọn: 'MINNA_1' | 'MINNA_2' | 'MINNA_CHUKYU_1' | 'MINNA_CHUKYU_2' | 'JLPT_N1'
  const [currentCourse, setCurrentCourse] = useState<string>('MINNA_1');

  // Bài học đang chọn
  const [selectedLessonNum, setSelectedLessonNum] = useState<number>(1);

  // Chế độ chọn nhiều bài để ôn tập
  const [isMultiLessonMode, setIsMultiLessonMode] = useState<boolean>(false);
  const [selectedLessons, setSelectedLessons] = useState<number[]>([1]);

  // Bộ lọc từ trong phân hệ Luyện tập: 'all' | 'unmastered' | 'favorite' | 'mistake'
  const [practiceWordFilter, setPracticeWordFilter] = useState<WordPracticeFilter>('all');

  // Cấp độ Kanji đang chọn (N5 -> N1)
  const [selectedKanjiLevel, setSelectedKanjiLevel] = useState<string>('N5');

  // Chế độ Giao diện Dark / Light mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Tiến độ học tập cá nhân
  const [progress, setProgress] = useState<UserProgress>(loadLocalProgress());

  // Supabase Auth state: { id, email }
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string } | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);

  // Khởi tạo theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Lắng nghe phiên đăng nhập Supabase và tải tiến độ đám mây
  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      // 1. Kiểm tra session hiện tại
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const u = { id: session.user.id, email: session.user.email || '' };
          setCurrentUser(u);
          fetchFromSupabase(session.user.id).then((cloudP) => {
            if (cloudP) {
              setProgress((prev) => {
                const merged: UserProgress = {
                  masteredWords: Array.from(new Set([...prev.masteredWords, ...cloudP.masteredWords])),
                  favoriteWords: Array.from(new Set([...prev.favoriteWords, ...cloudP.favoriteWords])),
                  mistakeWords: Array.from(new Set([...prev.mistakeWords, ...cloudP.mistakeWords])),
                  masteredKanji: Array.from(new Set([...prev.masteredKanji, ...cloudP.masteredKanji])),
                  favoriteKanji: Array.from(new Set([...prev.favoriteKanji, ...cloudP.favoriteKanji])),
                  streak: Math.max(prev.streak, cloudP.streak || 1),
                  lastActiveDate: prev.lastActiveDate || cloudP.lastActiveDate,
                  quizScores: [...cloudP.quizScores, ...prev.quizScores.filter(p => !cloudP.quizScores.some(c => c.date === p.date))]
                };
                saveLocalProgress(merged);
                return merged;
              });
            }
          });
        }
      });

      // 2. Lắng nghe thay đổi trạng thái đăng nhập
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setCurrentUser({ id: session.user.id, email: session.user.email || '' });
        } else {
          setCurrentUser(null);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  // Tự động lưu tiến độ khi có thay đổi
  const updateProgress = (updater: (prev: UserProgress) => UserProgress) => {
    setProgress((prev) => {
      const next = updater(prev);
      saveLocalProgress(next);
      if (currentUser?.id) {
        syncWithSupabase(currentUser.id, next);
      }
      return next;
    });
  };

  // Toggle từ vựng đã thuộc
  const handleToggleMasterWord = (id: string) => {
    updateProgress((prev) => {
      const isMastered = prev.masteredWords.includes(id);
      return {
        ...prev,
        masteredWords: isMastered
          ? prev.masteredWords.filter((wId) => wId !== id)
          : [...prev.masteredWords, id]
      };
    });
  };

  // Toggle từ vựng yêu thích
  const handleToggleFavoriteWord = (id: string) => {
    updateProgress((prev) => {
      const isFav = prev.favoriteWords.includes(id);
      return {
        ...prev,
        favoriteWords: isFav
          ? prev.favoriteWords.filter((wId) => wId !== id)
          : [...prev.favoriteWords, id]
      };
    });
  };

  // Toggle Kanji đã thuộc
  const handleToggleMasterKanji = (id: string) => {
    updateProgress((prev) => {
      const isMastered = prev.masteredKanji.includes(id);
      return {
        ...prev,
        masteredKanji: isMastered
          ? prev.masteredKanji.filter((kId) => kId !== id)
          : [...prev.masteredKanji, id]
      };
    });
  };

  // Toggle Kanji yêu thích
  const handleToggleFavoriteKanji = (id: string) => {
    updateProgress((prev) => {
      const isFav = prev.favoriteKanji.includes(id);
      return {
        ...prev,
        favoriteKanji: isFav
          ? prev.favoriteKanji.filter((kId) => kId !== id)
          : [...prev.favoriteKanji, id]
      };
    });
  };

  // Xử lý từ sai trong Quiz
  const handleAddMistake = (id: string) => {
    updateProgress((prev) => ({
      ...prev,
      mistakeWords: Array.from(new Set([...prev.mistakeWords, id]))
    }));
  };

  const handleRemoveMistake = (id: string) => {
    updateProgress((prev) => ({
      ...prev,
      mistakeWords: prev.mistakeWords.filter((wId) => wId !== id)
    }));
  };

  // Lưu điểm số sau khi làm xong bài
  const handleSaveQuizScore = (score: number, total: number, type: string) => {
    updateProgress((prev) => ({
      ...prev,
      quizScores: [
        ...prev.quizScores,
        {
          date: new Date().toISOString(),
          type,
          level: `Bài ${selectedLessonNum}`,
          score,
          total
        }
      ]
    }));
  };

  // Toggle ẩn / hiện từ vựng không cần thiết (xóa khỏi bài học)
  const handleToggleHideWord = (id: string) => {
    updateProgress((prev) => {
      const currentHidden = prev.hiddenWords || [];
      const isHidden = currentHidden.includes(id);
      return {
        ...prev,
        hiddenWords: isHidden
          ? currentHidden.filter((wId) => wId !== id)
          : [...currentHidden, id]
      };
    });
  };

  // Khôi phục tất cả từ vựng đã ẩn trong bài học hiện tại
  const handleRestoreLessonHiddenWords = () => {
    const lessonWordIds = new Set(currentLessonData.words.map((w) => w.id));
    updateProgress((prev) => {
      const currentHidden = prev.hiddenWords || [];
      return {
        ...prev,
        hiddenWords: currentHidden.filter((id) => !lessonWordIds.has(id))
      };
    });
  };

  // Cập nhật danh sách sổ tay từ vựng tự tạo
  const handleUpdateCustomNotebooks = (notebooks: CustomNotebookLesson[]) => {
    updateProgress((prev) => ({
      ...prev,
      customNotebooks: notebooks
    }));
  };

  // Lấy dữ liệu giáo trình và bài học hiện tại
  const currentCourseData = courseDatasets[currentCourse] || courseDatasets.MINNA_1;
  const currentLessonData = currentCourseData.lessons.find((l) => l.lesson === selectedLessonNum) || currentCourseData.lessons[0] || { lesson: 1, title: 'Bài 1', level: currentCourse, words: [] };
  const currentKanjiList = kanjiDatasets[selectedKanjiLevel] || kanjiDatasets.N5;

  // Lấy dữ liệu ngữ pháp và bài đọc của bài hiện tại tùy theo cấp độ (N5, N4, N3, N2, N1)
  const currentGrammarLesson = React.useMemo(() => {
    if (currentCourse === 'MINNA_CHUKYU_1') {
      return n3GrammarDatasets.find((g) => g.lesson === selectedLessonNum);
    }
    if (currentCourse === 'MINNA_CHUKYU_2') {
      return n2GrammarDatasets.find((g) => g.lesson === selectedLessonNum);
    }
    if (currentCourse === 'JLPT_N1') {
      return n1GrammarDatasets.find((g) => g.lesson === selectedLessonNum);
    }
    return minnaGrammarDatasets.find((g) => g.lesson === selectedLessonNum);
  }, [currentCourse, selectedLessonNum]);

  const currentReadingLesson = React.useMemo(() => {
    if (currentCourse === 'MINNA_CHUKYU_1') {
      return n3ReadingDatasets.find((r) => r.lesson === selectedLessonNum);
    }
    if (currentCourse === 'MINNA_CHUKYU_2') {
      return n2ReadingDatasets.find((r) => r.lesson === selectedLessonNum);
    }
    if (currentCourse === 'JLPT_N1') {
      return n1ReadingDatasets.find((r) => r.lesson === selectedLessonNum);
    }
    return minnaReadingDatasets.find((r) => r.lesson === selectedLessonNum);
  }, [currentCourse, selectedLessonNum]);

  const allVocabWords = React.useMemo(() => {
    return Object.values(courseDatasets).flatMap((c) => c.lessons.flatMap((l) => l.words));
  }, []);

  // Khi đổi Cấp độ giáo trình thì tự chọn bài đầu tiên của tập đó và reset về tab Từ vựng
  const handleSelectCourse = (courseKey: string) => {
    setCurrentCourse(courseKey);
    const targetLessons = courseDatasets[courseKey]?.lessons || [];
    if (targetLessons.length > 0) {
      setSelectedLessonNum(targetLessons[0].lesson);
      setSelectedLessons([targetLessons[0].lesson]);
    }
    setLessonSubTab('vocab');
  };

  // Khi chọn bài học mới thì luôn hiển thị danh sách từ vựng trước
  const handleSelectLesson = (lessonNum: number) => {
    setSelectedLessonNum(lessonNum);
    setSelectedLessons([lessonNum]);
    setLessonSubTab('vocab');
  };

  // Bật/tắt chọn 1 bài trong danh sách chọn nhiều bài
  const handleToggleLessonSelection = (lessonNum: number) => {
    setSelectedLessons((prev) => {
      if (prev.includes(lessonNum)) {
        if (prev.length <= 1) return prev;
        return prev.filter((n) => n !== lessonNum);
      }
      return [...prev, lessonNum].sort((a, b) => a - b);
    });
  };

  // Chọn toàn bộ các bài trong giáo trình hiện tại
  const handleSelectAllLessons = () => {
    setSelectedLessons(currentCourseData.lessons.map((l) => l.lesson));
  };

  // Bỏ chọn hết (giữ lại bài hiện tại)
  const handleClearAllLessons = () => {
    setSelectedLessons([selectedLessonNum]);
  };

  // Chọn nhanh một dải bài (vd: Bài 1 đến 5)
  const handleSelectRange = (start: number, end: number) => {
    const range: number[] = [];
    for (let i = start; i <= end; i++) {
      if (currentCourseData.lessons.some((l) => l.lesson === i)) {
        range.push(i);
      }
    }
    if (range.length > 0) {
      setSelectedLessons(range);
    }
  };

  // Lọc các từ đang học của bài (loại trừ từ người dùng đã chọn xóa/ẩn)
  const activeLessonWords = React.useMemo(() => {
    const hiddenSet = new Set(progress.hiddenWords || []);
    const filtered = currentLessonData.words.filter((w) => !hiddenSet.has(w.id));
    return filtered.length > 0 ? filtered : currentLessonData.words;
  }, [currentLessonData.words, progress.hiddenWords]);

  const hiddenCountInCurrentLesson = (progress.hiddenWords || []).filter((id) =>
    currentLessonData.words.some((w) => w.id === id)
  ).length;

  const lessonActiveCount = currentLessonData.words.length - hiddenCountInCurrentLesson;
  const lessonMasteredCount = currentLessonData.words.filter(
    (w) => !(progress.hiddenWords || []).includes(w.id) && progress.masteredWords.includes(w.id)
  ).length;
  const lessonProgressPercent = lessonActiveCount > 0
    ? Math.round((lessonMasteredCount / lessonActiveCount) * 100)
    : 0;

  // Xử lý tiêu đề bài học hiển thị đẹp mắt kèm Tên Chủ Đề thực tế
  const currentLessonTopic = React.useMemo(() => {
    return getLessonTopic(currentCourse, currentLessonData.lesson);
  }, [currentCourse, currentLessonData.lesson]);

  const lessonHeading = React.useMemo(() => {
    return `Bài ${currentLessonData.lesson}: ${currentLessonTopic}`;
  }, [currentLessonData.lesson, currentLessonTopic]);

  // Bộ từ ôn tập tổng hợp (khi bật chế độ chọn nhiều bài)
  const activeReviewWords = React.useMemo(() => {
    const hiddenSet = new Set(progress.hiddenWords || []);
    if (!isMultiLessonMode || selectedLessons.length <= 1) {
      return activeLessonWords;
    }
    const combined = currentCourseData.lessons
      .filter((l) => selectedLessons.includes(l.lesson))
      .flatMap((l) => l.words)
      .filter((w) => !hiddenSet.has(w.id));
    return combined.length > 0 ? combined : activeLessonWords;
  }, [isMultiLessonMode, selectedLessons, currentCourseData.lessons, activeLessonWords, progress.hiddenWords]);

  // Bộ từ dùng cho luyện tập (1 bài hoặc nhiều bài)
  const reviewWords = isMultiLessonMode ? activeReviewWords : activeLessonWords;

  // Thống kê số lượng từ theo bộ lọc trong phân hệ Luyện tập
  const practiceFilterCounts = React.useMemo(() => {
    const baseWords = reviewWords;
    const all = baseWords.length;
    const unmastered = baseWords.filter((w) => !progress.masteredWords.includes(w.id)).length;
    const favorite = baseWords.filter((w) => progress.favoriteWords.includes(w.id)).length;
    const mistake = baseWords.filter((w) => progress.mistakeWords.includes(w.id)).length;
    return { all, unmastered, favorite, mistake };
  }, [reviewWords, progress.masteredWords, progress.favoriteWords, progress.mistakeWords]);

  // Bộ từ thực tế được đưa vào các chế độ luyện tập sau khi lọc
  const wordsForPractice = React.useMemo(() => {
    if (practiceWordFilter === 'unmastered') {
      const filtered = reviewWords.filter((w) => !progress.masteredWords.includes(w.id));
      return filtered.length > 0 ? filtered : reviewWords;
    }
    if (practiceWordFilter === 'favorite') {
      const filtered = reviewWords.filter((w) => progress.favoriteWords.includes(w.id));
      return filtered.length > 0 ? filtered : reviewWords;
    }
    if (practiceWordFilter === 'mistake') {
      const filtered = reviewWords.filter((w) => progress.mistakeWords.includes(w.id));
      return filtered.length > 0 ? filtered : reviewWords;
    }
    return reviewWords;
  }, [reviewWords, practiceWordFilter, progress.masteredWords, progress.favoriteWords, progress.mistakeWords]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-zinc-950 transition-colors">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        streak={progress.streak}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenBackup={() => setIsBackupOpen(true)}
        userEmail={currentUser?.email || null}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* PHÂN HỆ 1: TỪ VỰNG (TANGO) */}
        {/* PHÂN HỆ 1: TỪ VỰNG & BÀI HỌC (TANGO) */}
        {activeTab === 'tango' && (
          <div className="space-y-6">
            {tangoViewMode === 'dashboard' ? (
              /* GÓC NHÌN 1: DASHBOARD TỔNG QUAN BÀI HỌC CÓ CHỦ ĐỀ & GAMIFICATION (Ảnh 1) */
              <LessonSelector
                currentCourse={currentCourse}
                onSelectCourse={handleSelectCourse}
                lessons={currentCourseData.lessons}
                selectedLessonNum={selectedLessonNum}
                onSelectLesson={handleSelectLesson}
                masteredWords={progress.masteredWords}
                isMultiMode={isMultiLessonMode}
                onToggleMultiMode={setIsMultiLessonMode}
                selectedLessons={selectedLessons}
                onToggleLessonSelection={handleToggleLessonSelection}
                onSelectAllLessons={handleSelectAllLessons}
                onClearAllLessons={handleClearAllLessons}
                onSelectRange={handleSelectRange}
                mode="dashboard"
                onEnterStudyMode={(lessonNum) => {
                  setSelectedLessonNum(lessonNum);
                  setSelectedLessons([lessonNum]);
                  setTangoViewMode('study');
                }}
              />
            ) : (
              /* GÓC NHÌN 2: BÀN HỌC SPLIT-VIEW (Ảnh 2): 75% nội dung học bên trái, 25% sidebar bên phải */
              <div className="space-y-4">
                {/* Thanh điều hướng quay lại Dashboard & Nút Thêm cả bài vào ôn tập */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={() => setTangoViewMode('dashboard')}
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-700 dark:text-zinc-200 hover:border-rose-400 hover:text-rose-600 dark:hover:text-rose-400 transition shadow-2xs group"
                  >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    <span>Quay lại Tổng quan bài học (Dashboard)</span>
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleLessonSelection(selectedLessonNum)}
                      className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition flex items-center space-x-1.5 ${
                        selectedLessons.includes(selectedLessonNum)
                          ? 'bg-rose-500 text-white shadow-xs'
                          : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-200 hover:border-rose-400'
                      }`}
                      title="Thêm cả bài này vào danh sách ôn tập tổng hợp"
                    >
                      <Star className={`w-3.5 h-3.5 ${selectedLessons.includes(selectedLessonNum) ? 'fill-white' : ''}`} />
                      <span>{selectedLessons.includes(selectedLessonNum) ? '✓ Đã thêm bài này vào ôn tập' : '⭐ Thêm cả bài vào ôn tập'}</span>
                    </button>
                  </div>
                </div>

                {/* Bố cục Split-View 2 Cột */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* CỘT TRÁI (Khung 75% - 9 cols): Không gian học tập trung */}
                  <div className="lg:col-span-9 space-y-6">
                    {/* Header bài học & Thanh 4 Tab: Từ vựng, Ngữ pháp, Bài đọc, 5 Chế độ học */}
                    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center space-x-1.5">
                            <span>{currentCourseData.name} • {currentLessonData.level}</span>
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            {isMultiLessonMode 
                              ? `Đang chọn ${selectedLessons.length} bài (${reviewWords.length} từ vựng)`
                              : `${lessonActiveCount} từ vựng ${hiddenCountInCurrentLesson > 0 ? `(đã ẩn ${hiddenCountInCurrentLesson})` : ''}`
                            }
                          </span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">
                          {isMultiLessonMode ? `Ôn tập tổng hợp: ${selectedLessons.length} bài học` : lessonHeading}
                        </h1>
                        {/* Thanh tiến trình % thuộc từ */}
                        <div className="flex items-center space-x-3 mt-2.5">
                          <div className="w-36 bg-slate-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                              style={{ width: `${lessonProgressPercent}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">
                            Đã thuộc: <strong className="text-emerald-500">{lessonMasteredCount}</strong>/{lessonActiveCount} ({lessonProgressPercent}%)
                          </span>
                        </div>
                      </div>

                      {/* Thanh 4 Tab: Từ vựng | Ngữ pháp | Bài đọc | Luyện tập (5 chế độ) */}
                      <div className="flex items-center bg-slate-100 dark:bg-zinc-800 p-1.5 rounded-2xl overflow-x-auto w-full md:w-auto">
                        <button
                          onClick={() => setLessonSubTab('vocab')}
                          className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
                            lessonSubTab === 'vocab'
                              ? 'bg-white dark:bg-zinc-700 text-rose-600 dark:text-rose-400 shadow-sm'
                              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <ListFilter className="w-4 h-4" />
                          <span>Từ vựng</span>
                        </button>

                        <button
                          onClick={() => setLessonSubTab('grammar')}
                          className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
                            lessonSubTab === 'grammar'
                              ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <BookOpen className="w-4 h-4" />
                          <span>Ngữ pháp</span>
                        </button>

                        <button
                          onClick={() => setLessonSubTab('reading')}
                          className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
                            lessonSubTab === 'reading'
                              ? 'bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <FileText className="w-4 h-4" />
                          <span>Bài đọc</span>
                        </button>

                        <button
                          onClick={() => setLessonSubTab('practice')}
                          className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
                            lessonSubTab === 'practice'
                              ? 'bg-white dark:bg-zinc-700 text-amber-600 dark:text-amber-400 shadow-sm'
                              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <Sparkles className="w-4 h-4 text-amber-500" />
                          <span>Luyện tập (5 chế độ)</span>
                        </button>
                      </div>
                    </div>

                    {/* 1. Tab Từ vựng (Hiện đầu tiên khi vào bài) */}
                    {lessonSubTab === 'vocab' && (
                      <div className="space-y-4">
                        {/* Banner điều hướng nhanh sang Luyện tập */}
                        <div className="bg-gradient-to-r from-rose-500/10 via-amber-500/5 to-transparent border border-rose-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
                          <div className="flex items-center space-x-3 text-center sm:text-left">
                            <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center font-black shrink-0 shadow-sm">
                              <Sparkles className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                                Xem xong từ vựng? Sẵn sàng ôn luyện!
                              </h3>
                              <p className="text-xs text-slate-500 dark:text-zinc-400">
                                Thực hành ngay với 5 chế độ: Flashcard 3D, Trắc nghiệm, Gõ nhồi nhét, Dịch câu và Nghe đuổi.
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => setLessonSubTab('practice')}
                            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs sm:text-sm shadow-sm transition whitespace-nowrap shrink-0"
                          >
                            Bắt đầu luyện tập →
                          </button>
                        </div>

                        <WordListView
                          words={isMultiLessonMode ? reviewWords : currentLessonData.words}
                          masteredWords={progress.masteredWords}
                          favoriteWords={progress.favoriteWords}
                          hiddenWords={progress.hiddenWords || []}
                          onToggleMaster={handleToggleMasterWord}
                          onToggleFavorite={handleToggleFavoriteWord}
                          onToggleHide={handleToggleHideWord}
                          onRestoreAllHidden={handleRestoreLessonHiddenWords}
                        />
                      </div>
                    )}

                    {/* 2. Tab Ngữ pháp */}
                    {lessonSubTab === 'grammar' && (
                      <GrammarView
                        lesson={currentGrammarLesson}
                        lessonNum={selectedLessonNum}
                      />
                    )}

                    {/* 3. Tab Bài đọc hiểu */}
                    {lessonSubTab === 'reading' && (
                      <ReadingView
                        reading={currentReadingLesson}
                        lessonNum={selectedLessonNum}
                      />
                    )}

                    {/* 4. Tab Luyện tập (5 Chế độ học) */}
                    {lessonSubTab === 'practice' && (
                      <div className="space-y-6">
                        {/* Bộ chọn 5 Chế độ học (Flashcard, Trắc nghiệm, Nhồi nhét, Dịch câu, Nghe đuổi) */}
                        <StudyModeSelector
                          currentMode={studyMode}
                          onSelectMode={setStudyMode}
                          variant="compact"
                        />

                        {/* 1. Flashcard 3D */}
                        {studyMode === 'flashcard' && (
                          <FlashcardView
                            words={reviewWords}
                            masteredWords={progress.masteredWords}
                            favoriteWords={progress.favoriteWords}
                            onToggleMaster={handleToggleMasterWord}
                            onToggleFavorite={handleToggleFavoriteWord}
                          />
                        )}

                        {/* 2. Trắc nghiệm (Quiz) */}
                        {studyMode === 'quiz' && (
                          <PracticeView
                            words={reviewWords}
                            mistakeWords={progress.mistakeWords}
                            onAddMistake={handleAddMistake}
                            onRemoveMistake={handleRemoveMistake}
                            onSaveQuizScore={handleSaveQuizScore}
                          />
                        )}

                        {/* 3. Nhồi nhét (Cramming Mode - Gõ Romaji sang Hiragana) */}
                        {studyMode === 'cram' && (
                          <CrammingModeView
                            words={reviewWords}
                            onFinish={(score, total) => handleSaveQuizScore(score, total, 'Nhồi nhét')}
                          />
                        )}

                        {/* 4. Dịch câu (Sentence Translate Puzzle) */}
                        {studyMode === 'translate' && (
                          <SentenceTranslateView
                            words={reviewWords}
                          />
                        )}

                        {/* 5. Nghe đuổi (Shadowing Mode) */}
                        {studyMode === 'shadowing' && (
                          <ShadowingView
                            words={reviewWords}
                            masteredWords={progress.masteredWords}
                            onToggleMaster={handleToggleMasterWord}
                          />
                        )}
                      </div>
                    )}
                  </div>

                  {/* CỘT PHẢI (Khung 25% - 3 cols): Sidebar Lưới 2 Cột Chuyển Bài Nhanh (Ảnh 2) */}
                  <div className="lg:col-span-3 lg:sticky lg:top-20">
                    <LessonSelector
                      currentCourse={currentCourse}
                      onSelectCourse={handleSelectCourse}
                      lessons={currentCourseData.lessons}
                      selectedLessonNum={selectedLessonNum}
                      onSelectLesson={handleSelectLesson}
                      masteredWords={progress.masteredWords}
                      isMultiMode={isMultiLessonMode}
                      onToggleMultiMode={setIsMultiLessonMode}
                      selectedLessons={selectedLessons}
                      onToggleLessonSelection={handleToggleLessonSelection}
                      onSelectAllLessons={handleSelectAllLessons}
                      onClearAllLessons={handleClearAllLessons}
                      onSelectRange={handleSelectRange}
                      mode="sidebar"
                      onBackToDashboard={() => setTangoViewMode('dashboard')}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PHÂN HỆ 2: KANJI CHUYÊN SÂU (N5 -> N1) */}
        {activeTab === 'kanji' && (
          <KanjiMasterView
            kanjiList={currentKanjiList}
            allVocabWords={allVocabWords}
            currentLevel={selectedKanjiLevel}
            onSelectLevel={setSelectedKanjiLevel}
            masteredKanji={progress.masteredKanji}
            favoriteKanji={progress.favoriteKanji}
            onToggleMaster={handleToggleMasterKanji}
            onToggleFavorite={handleToggleFavoriteKanji}
            streak={progress.streak || 0}
          />
        )}

        {/* PHÂN HỆ 3: TRUNG TÂM LUYỆN TẬP CHUYÊN SÂU (PRACTICE HUB) */}
        {activeTab === 'practice' && (
          <div className="space-y-6">
            {/* 1. Thanh cấu hình phạm vi bài học & bộ lọc từ vựng thông minh (Gọn gàng, chuyên nghiệp) */}
            <PracticeHubScopeBar
              currentCourse={currentCourse}
              onSelectCourse={handleSelectCourse}
              lessons={currentCourseData.lessons}
              selectedLessonNum={selectedLessonNum}
              onSelectLesson={setSelectedLessonNum}
              isMultiMode={isMultiLessonMode}
              onToggleMultiMode={setIsMultiLessonMode}
              selectedLessons={selectedLessons}
              onToggleLessonSelection={handleToggleLessonSelection}
              onSelectAllLessons={handleSelectAllLessons}
              onClearAllLessons={handleClearAllLessons}
              onSelectRange={handleSelectRange}
              filterType={practiceWordFilter}
              onSelectFilterType={setPracticeWordFilter}
              counts={practiceFilterCounts}
            />

            {/* 2. Menu 5 Chế Độ Luyện Tập (5 Card màu sắc nổi bật, rõ ràng) */}
            <StudyModeSelector
              currentMode={studyMode}
              onSelectMode={setStudyMode}
              variant="cards"
            />

            {/* 3. Khu vực thực hành chế độ học tập */}
            {studyMode === 'flashcard' && (
              <FlashcardView
                words={wordsForPractice}
                masteredWords={progress.masteredWords}
                favoriteWords={progress.favoriteWords}
                onToggleMaster={handleToggleMasterWord}
                onToggleFavorite={handleToggleFavoriteWord}
              />
            )}

            {studyMode === 'quiz' && (
              <PracticeView
                words={wordsForPractice}
                mistakeWords={progress.mistakeWords}
                onAddMistake={handleAddMistake}
                onRemoveMistake={handleRemoveMistake}
                onSaveQuizScore={handleSaveQuizScore}
              />
            )}

            {studyMode === 'cram' && (
              <CrammingModeView
                words={wordsForPractice}
                onFinish={(score, total) => handleSaveQuizScore(score, total, 'Nhồi nhét')}
              />
            )}

            {studyMode === 'translate' && (
              <SentenceTranslateView
                words={wordsForPractice}
              />
            )}

            {studyMode === 'shadowing' && (
              <ShadowingView
                words={wordsForPractice}
                masteredWords={progress.masteredWords}
                onToggleMaster={handleToggleMasterWord}
              />
            )}
          </div>
        )}

        {/* PHÂN HỆ 4: SỔ TAY TỪ VỰNG TỰ TẠO (CUSTOM NOTEBOOK) */}
        {activeTab === 'notebook' && (
          <CustomNotebookView
            customNotebooks={progress.customNotebooks || []}
            onUpdateNotebooks={handleUpdateCustomNotebooks}
            masteredWords={progress.masteredWords}
            favoriteWords={progress.favoriteWords}
            mistakeWords={progress.mistakeWords}
            onToggleMaster={handleToggleMasterWord}
            onToggleFavorite={handleToggleFavoriteWord}
            onAddMistake={handleAddMistake}
            onRemoveMistake={handleRemoveMistake}
            onSaveQuizScore={handleSaveQuizScore}
          />
        )}
      </main>

      {/* Footer bản quyền & thông tin giáo trình */}
      <footer className="mt-auto border-t border-slate-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 py-6 text-center text-xs text-slate-400 dark:text-zinc-500">
        <p className="font-semibold text-slate-600 dark:text-zinc-400">
          LearnJPD • Ứng dụng Học Tiếng Nhật & Kanji Thông Minh
        </p>
        <p className="mt-1">
          Dựa trên giáo trình Minna no Nihongo (50 bài) & Bộ Kanji chuẩn JLPT N5 - N1
        </p>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onSuccess={(user) => {
          setCurrentUser(user);
          if (user?.id) {
            fetchFromSupabase(user.id).then((cloudP) => {
              if (cloudP) {
                setProgress((prev) => {
                  const merged: UserProgress = {
                    masteredWords: Array.from(new Set([...prev.masteredWords, ...cloudP.masteredWords])),
                    favoriteWords: Array.from(new Set([...prev.favoriteWords, ...cloudP.favoriteWords])),
                    mistakeWords: Array.from(new Set([...prev.mistakeWords, ...cloudP.mistakeWords])),
                    masteredKanji: Array.from(new Set([...prev.masteredKanji, ...cloudP.masteredKanji])),
                    favoriteKanji: Array.from(new Set([...prev.favoriteKanji, ...cloudP.favoriteKanji])),
                    streak: Math.max(prev.streak, cloudP.streak || 1),
                    lastActiveDate: prev.lastActiveDate || cloudP.lastActiveDate,
                    quizScores: [...cloudP.quizScores, ...prev.quizScores.filter(p => !cloudP.quizScores.some(c => c.date === p.date))]
                  };
                  saveLocalProgress(merged);
                  return merged;
                });
              } else {
                syncWithSupabase(user.id, progress);
              }
            });
          }
        }}
      />

      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        progress={progress}
        onProgressImported={(newP) => setProgress(newP)}
      />
    </div>
  );
}

export default App;
