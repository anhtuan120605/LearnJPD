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
import { AuthModal } from './components/AuthModal';
import { BackupModal } from './components/BackupModal';
import { LessonSelector } from './components/LessonSelector';

import { courseDatasets, kanjiDatasets } from './data';
import { loadLocalProgress, saveLocalProgress, syncWithSupabase, fetchFromSupabase } from './lib/storage';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { UserProgress } from './types';
import { 
  BookOpen, 
  Layers, 
  ListFilter, 
  Sparkles, 
  CheckCircle, 
  ChevronDown
} from 'lucide-react';

export function App() {
  // Tabs: 'tango' (Từ vựng) | 'kanji' (Chữ Hán) | 'practice' (Luyện tập)
  const [activeTab, setActiveTab] = useState<'tango' | 'kanji' | 'practice'>('tango');
  
  // Chế độ xem Từ vựng: 'study' (5 chế độ học) | 'list' (Danh sách từ vựng)
  const [tangoViewMode, setTangoViewMode] = useState<'study' | 'list'>('study');

  // 5 Chế độ học theo screenshot: 'flashcard' | 'quiz' | 'cram' | 'translate' | 'shadowing'
  const [studyMode, setStudyMode] = useState<StudyMode>('flashcard');

  // Khóa giáo trình / cấp độ đang chọn: 'MINNA_1' | 'MINNA_2' | 'MINNA_CHUKYU_1' | 'MINNA_CHUKYU_2' | 'JLPT_N1'
  const [currentCourse, setCurrentCourse] = useState<string>('MINNA_1');

  // Bài học đang chọn
  const [selectedLessonNum, setSelectedLessonNum] = useState<number>(1);

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

  // Lấy dữ liệu giáo trình và bài học hiện tại
  const currentCourseData = courseDatasets[currentCourse] || courseDatasets.MINNA_1;
  const currentLessonData = currentCourseData.lessons.find((l) => l.lesson === selectedLessonNum) || currentCourseData.lessons[0] || { lesson: 1, title: 'Bài 1', level: currentCourse, words: [] };
  const currentKanjiList = kanjiDatasets[selectedKanjiLevel] || kanjiDatasets.N5;

  // Khi đổi Cấp độ giáo trình thì tự chọn bài đầu tiên của tập đó
  const handleSelectCourse = (courseKey: string) => {
    setCurrentCourse(courseKey);
    const targetLessons = courseDatasets[courseKey]?.lessons || [];
    if (targetLessons.length > 0) {
      setSelectedLessonNum(targetLessons[0].lesson);
    }
  };

  // Tính phần trăm thuộc từ vựng của bài hiện tại
  const lessonMasteredCount = currentLessonData.words.filter((w) => progress.masteredWords.includes(w.id)).length;
  const lessonProgressPercent = currentLessonData.words.length > 0 
    ? Math.round((lessonMasteredCount / currentLessonData.words.length) * 100) 
    : 0;

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
        {activeTab === 'tango' && (
          <div className="space-y-6">
            {/* 1. Menu bên ngoài chọn Cấp độ N mấy rồi mới hiện menu từng bài */}
            <LessonSelector
              currentCourse={currentCourse}
              onSelectCourse={handleSelectCourse}
              lessons={currentCourseData.lessons}
              selectedLessonNum={selectedLessonNum}
              onSelectLesson={setSelectedLessonNum}
              masteredWords={progress.masteredWords}
            />

            {/* Header bài học & Công cụ chuyển đổi List / Luyện tập 5 chế độ */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                    {currentCourseData.name} • {currentLessonData.level}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {currentLessonData.words.length} từ vựng
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                  Bài {currentLessonData.lesson}: {currentLessonData.title}
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
                    Đã thuộc: <strong className="text-emerald-500">{lessonMasteredCount}</strong>/{currentLessonData.words.length} ({lessonProgressPercent}%)
                  </span>
                </div>
              </div>

              {/* Nút Toggle 5 Chế độ học / Danh sách từ vựng */}
              <div className="flex items-center bg-slate-100 dark:bg-zinc-800 p-1 rounded-2xl">
                <button
                  onClick={() => setTangoViewMode('study')}
                  className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                    tangoViewMode === 'study'
                      ? 'bg-white dark:bg-zinc-700 text-rose-600 dark:text-rose-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>5 Chế độ học</span>
                </button>

                <button
                  onClick={() => setTangoViewMode('list')}
                  className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                    tangoViewMode === 'list'
                      ? 'bg-white dark:bg-zinc-700 text-rose-600 dark:text-rose-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <ListFilter className="w-3.5 h-3.5" />
                  <span>Danh sách từ</span>
                </button>
              </div>
            </div>

            {/* Nội dung Từ vựng: Danh sách hoặc 5 Chế độ học */}
            {tangoViewMode === 'list' ? (
              <WordListView
                words={currentLessonData.words}
                masteredWords={progress.masteredWords}
                favoriteWords={progress.favoriteWords}
                onToggleMaster={handleToggleMasterWord}
                onToggleFavorite={handleToggleFavoriteWord}
              />
            ) : (
              <div className="space-y-6">
                {/* Bộ chọn 5 Chế độ học (Flashcard, Trắc nghiệm, Nhồi nhét, Dịch câu, Nghe đuổi) */}
                <StudyModeSelector
                  currentMode={studyMode}
                  onSelectMode={setStudyMode}
                />

                {/* 1. Flashcard 3D */}
                {studyMode === 'flashcard' && (
                  <FlashcardView
                    words={currentLessonData.words}
                    masteredWords={progress.masteredWords}
                    favoriteWords={progress.favoriteWords}
                    onToggleMaster={handleToggleMasterWord}
                    onToggleFavorite={handleToggleFavoriteWord}
                  />
                )}

                {/* 2. Trắc nghiệm (Quiz) */}
                {studyMode === 'quiz' && (
                  <PracticeView
                    words={currentLessonData.words}
                    mistakeWords={progress.mistakeWords}
                    onAddMistake={handleAddMistake}
                    onRemoveMistake={handleRemoveMistake}
                    onSaveQuizScore={handleSaveQuizScore}
                  />
                )}

                {/* 3. Nhồi nhét (Cramming Mode - Gõ Romaji sang Hiragana) */}
                {studyMode === 'cram' && (
                  <CrammingModeView
                    words={currentLessonData.words}
                    onFinish={(score, total) => handleSaveQuizScore(score, total, 'Nhồi nhét')}
                  />
                )}

                {/* 4. Dịch câu (Sentence Translate Puzzle) */}
                {studyMode === 'translate' && (
                  <SentenceTranslateView
                    words={currentLessonData.words}
                  />
                )}

                {/* 5. Nghe đuổi (Shadowing Mode) */}
                {studyMode === 'shadowing' && (
                  <ShadowingView
                    words={currentLessonData.words}
                    masteredWords={progress.masteredWords}
                    onToggleMaster={handleToggleMasterWord}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* PHÂN HỆ 2: KANJI CHUYÊN SÂU (N5 -> N1) */}
        {activeTab === 'kanji' && (
          <KanjiMasterView
            kanjiList={currentKanjiList}
            currentLevel={selectedKanjiLevel}
            onSelectLevel={setSelectedKanjiLevel}
            masteredKanji={progress.masteredKanji}
            favoriteKanji={progress.favoriteKanji}
            onToggleMaster={handleToggleMasterKanji}
            onToggleFavorite={handleToggleFavoriteKanji}
          />
        )}

        {/* PHÂN HỆ 3: LUYỆN TẬP & QUIZ TẬP TRUNG */}
        {activeTab === 'practice' && (
          <div className="space-y-6">
            {/* Bộ chọn bài học để luyện tập */}
            <LessonSelector
              currentCourse={currentCourse}
              onSelectCourse={handleSelectCourse}
              lessons={currentCourseData.lessons}
              selectedLessonNum={selectedLessonNum}
              onSelectLesson={setSelectedLessonNum}
              masteredWords={progress.masteredWords}
            />

            {/* 5 chế độ học tập */}
            <StudyModeSelector
              currentMode={studyMode}
              onSelectMode={setStudyMode}
            />

            {studyMode === 'flashcard' && (
              <FlashcardView
                words={currentLessonData.words}
                masteredWords={progress.masteredWords}
                favoriteWords={progress.favoriteWords}
                onToggleMaster={handleToggleMasterWord}
                onToggleFavorite={handleToggleFavoriteWord}
              />
            )}

            {studyMode === 'quiz' && (
              <PracticeView
                words={currentLessonData.words}
                mistakeWords={progress.mistakeWords}
                onAddMistake={handleAddMistake}
                onRemoveMistake={handleRemoveMistake}
                onSaveQuizScore={handleSaveQuizScore}
              />
            )}

            {studyMode === 'cram' && (
              <CrammingModeView
                words={currentLessonData.words}
                onFinish={(score, total) => handleSaveQuizScore(score, total, 'Nhồi nhét')}
              />
            )}

            {studyMode === 'translate' && (
              <SentenceTranslateView
                words={currentLessonData.words}
              />
            )}

            {studyMode === 'shadowing' && (
              <ShadowingView
                words={currentLessonData.words}
                masteredWords={progress.masteredWords}
                onToggleMaster={handleToggleMasterWord}
              />
            )}
          </div>
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
