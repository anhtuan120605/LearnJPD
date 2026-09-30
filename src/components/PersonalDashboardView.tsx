import React, { useState, useMemo } from 'react';
import {
  UserProgress,
  WordItem,
  KanjiItem,
  StudyMode,
  WordPracticeFilter
} from '../types';
import {
  Flame,
  Award,
  Sparkles,
  BookCheck,
  TrendingUp,
  Target,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Lock,
  Trophy,
  History,
  Calendar,
  Layers,
  Heart,
  AlertTriangle,
  Zap,
  LogIn,
  Sliders,
  Compass
} from 'lucide-react';

interface PersonalDashboardViewProps {
  progress: UserProgress;
  currentUser: { id: string; email: string } | null;
  allVocabWords: WordItem[];
  kanjiDatasets: Record<string, KanjiItem[]>;
  onOpenAuth: () => void;
  onOpenBackup: () => void;
  onNavigateToPractice: (filter: WordPracticeFilter, mode?: StudyMode) => void;
  onNavigateToCourse: (courseKey: string) => void;
  onNavigateToKanji: (level: string) => void;
  onNavigateToNotebook: () => void;
  onOpenConjugationTrainer?: () => void;
}

export const PersonalDashboardView: React.FC<PersonalDashboardViewProps> = ({
  progress,
  currentUser,
  allVocabWords,
  kanjiDatasets,
  onOpenAuth,
  onOpenBackup,
  onNavigateToPractice,
  onNavigateToCourse,
  onNavigateToKanji,
  onNavigateToNotebook,
  onOpenConjugationTrainer
}) => {
  // Mục tiêu học mỗi ngày (mặc định 20 từ)
  const [dailyTarget, setDailyTarget] = useState<number>(() => {
    const saved = localStorage.getItem('learnjpd_daily_target');
    return saved ? parseInt(saved, 10) : 20;
  });

  const handleUpdateDailyTarget = (newTarget: number) => {
    setDailyTarget(newTarget);
    localStorage.setItem('learnjpd_daily_target', newTarget.toString());
  };

  // 1. TỔNG QUAN TỪ VỰNG & KANJI
  const totalVocabCount = allVocabWords.length;
  const masteredVocabCount = progress.masteredWords.length;
  const vocabMasteryPercent = totalVocabCount > 0 ? Math.round((masteredVocabCount / totalVocabCount) * 100) : 0;

  const allKanjiList = useMemo(() => {
    return Object.values(kanjiDatasets).flat();
  }, [kanjiDatasets]);
  const totalKanjiCount = allKanjiList.length;
  const masteredKanjiCount = progress.masteredKanji.length;
  const kanjiMasteryPercent = totalKanjiCount > 0 ? Math.round((masteredKanjiCount / totalKanjiCount) * 100) : 0;

  // 2. TÍNH ĐIỂM QUIZ TRUNG BÌNH
  const quizScores = progress.quizScores || [];
  const averageQuizScore = useMemo(() => {
    if (quizScores.length === 0) return 0;
    const totalPercentage = quizScores.reduce((acc, q) => acc + (q.total > 0 ? (q.score / q.total) * 100 : 0), 0);
    return Math.round(totalPercentage / quizScores.length);
  }, [quizScores]);

  // 3. TIẾN ĐỘ HÔM NAY (Dựa trên số lượng bài quiz hôm nay hoặc từ mastered gần nhất)
  const todayStr = new Date().toISOString().split('T')[0];
  const todayQuizzes = useMemo(() => {
    return quizScores.filter(q => q.date && q.date.startsWith(todayStr));
  }, [quizScores, todayStr]);

  // Ước tính từ vựng đã ôn luyện hôm nay
  const todayReviewedCount = useMemo(() => {
    const fromQuizzes = todayQuizzes.reduce((acc, q) => acc + q.total, 0);
    return Math.max(fromQuizzes, progress.lastActiveDate === todayStr ? Math.min(masteredVocabCount, dailyTarget) : 0);
  }, [todayQuizzes, progress.lastActiveDate, todayStr, masteredVocabCount, dailyTarget]);

  const todayProgressPercent = Math.min(100, Math.round((todayReviewedCount / dailyTarget) * 100));

  // 4. DANH SÁCH CẦN ÔN TẬP HÔM NAY (Spaced Repetition: Từ hay sai + chưa thuộc)
  const mistakeWordsList = useMemo(() => {
    const mistakeSet = new Set(progress.mistakeWords);
    return allVocabWords.filter(w => mistakeSet.has(w.id));
  }, [allVocabWords, progress.mistakeWords]);

  // 5. TIẾN ĐỘ THEO CẤP ĐỘ JLPT (N5 -> N1)
  const jlptProgressData = useMemo(() => {
    const levels = ['N5', 'N4', 'N3', 'N2', 'N1'] as const;
    const masteredWordSet = new Set(progress.masteredWords);
    const masteredKanjiSet = new Set(progress.masteredKanji);

    return levels.map(level => {
      // Từ vựng theo level
      const levelWords = allVocabWords.filter(w => w.level === level);
      const levelMasteredWords = levelWords.filter(w => masteredWordSet.has(w.id)).length;
      const vocabPercent = levelWords.length > 0 ? Math.round((levelMasteredWords / levelWords.length) * 100) : 0;

      // Kanji theo level
      const levelKanji = kanjiDatasets[level] || [];
      const levelMasteredKanji = levelKanji.filter(k => masteredKanjiSet.has(k.id || k.kanji)).length;
      const kanjiPercent = levelKanji.length > 0 ? Math.round((levelMasteredKanji / levelKanji.length) * 100) : 0;

      // Tổng thể
      const overallPercent = Math.round((vocabPercent * 0.6) + (kanjiPercent * 0.4));

      return {
        level,
        vocabTotal: levelWords.length,
        vocabMastered: levelMasteredWords,
        vocabPercent,
        kanjiTotal: levelKanji.length,
        kanjiMastered: levelMasteredKanji,
        kanjiPercent,
        overallPercent,
      };
    });
  }, [allVocabWords, kanjiDatasets, progress.masteredWords, progress.masteredKanji]);

  // 6. HUY HIỆU & THÀNH TÍCH (GAMIFICATION)
  const achievements = useMemo(() => {
    const streak = progress.streak || 0;
    const has100Quiz = quizScores.some(q => q.total > 0 && q.score === q.total);
    const notebookCount = progress.customNotebooks?.length || 0;
    const favCount = progress.favoriteWords?.length || 0;

    return [
      {
        id: 'streak_3',
        title: 'Bắt đầu thói quen',
        description: 'Học liên tục 3 ngày',
        icon: Flame,
        color: 'text-amber-500',
        bg: 'bg-amber-500/10 border-amber-500/30',
        unlocked: streak >= 3,
        progress: `${Math.min(streak, 3)}/3 ngày`,
      },
      {
        id: 'streak_7',
        title: 'Tuần lễ vàng',
        description: 'Duy trì chuỗi học 7 ngày liên tục',
        icon: Trophy,
        color: 'text-orange-500',
        bg: 'bg-orange-500/10 border-orange-500/30',
        unlocked: streak >= 7,
        progress: `${Math.min(streak, 7)}/7 ngày`,
      },
      {
        id: 'vocab_50',
        title: 'Người mở đường',
        description: 'Thuộc 50 từ vựng đầu tiên',
        icon: BookCheck,
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10 border-emerald-500/30',
        unlocked: masteredVocabCount >= 50,
        progress: `${Math.min(masteredVocabCount, 50)}/50 từ`,
      },
      {
        id: 'vocab_200',
        title: 'Nhà ngôn ngữ học',
        description: 'Thành thạo 200 từ vựng',
        icon: Award,
        color: 'text-blue-500',
        bg: 'bg-blue-500/10 border-blue-500/30',
        unlocked: masteredVocabCount >= 200,
        progress: `${Math.min(masteredVocabCount, 200)}/200 từ`,
      },
      {
        id: 'kanji_20',
        title: 'Nhập môn Hán Tự',
        description: 'Ghi nhớ 20 chữ Kanji',
        icon: Sparkles,
        color: 'text-indigo-500',
        bg: 'bg-indigo-500/10 border-indigo-500/30',
        unlocked: masteredKanjiCount >= 20,
        progress: `${Math.min(masteredKanjiCount, 20)}/20 chữ`,
      },
      {
        id: 'kanji_100',
        title: 'Đại sư Hán Tự',
        description: 'Ghi nhớ 100 chữ Kanji',
        icon: Zap,
        color: 'text-purple-500',
        bg: 'bg-purple-500/10 border-purple-500/30',
        unlocked: masteredKanjiCount >= 100,
        progress: `${Math.min(masteredKanjiCount, 100)}/100 chữ`,
      },
      {
        id: 'quiz_perfect',
        title: 'Bách phát bách trúng',
        description: 'Đạt điểm tuyệt đối 100% trong 1 bài Quiz',
        icon: Target,
        color: 'text-rose-500',
        bg: 'bg-rose-500/10 border-rose-500/30',
        unlocked: has100Quiz,
        progress: has100Quiz ? 'Đã đạt' : 'Chưa đạt',
      },
      {
        id: 'notebook_creator',
        title: 'Chuyên cần tạo sổ',
        description: 'Tạo ít nhất 1 sổ tay từ vựng riêng',
        icon: Layers,
        color: 'text-sky-500',
        bg: 'bg-sky-500/10 border-sky-500/30',
        unlocked: notebookCount >= 1,
        progress: `${notebookCount}/1 sổ tay`,
      },
      {
        id: 'favorite_collector',
        title: 'Bộ sưu tập yêu thích',
        description: 'Lưu 10 từ vựng vào mục Yêu thích',
        icon: Heart,
        color: 'text-pink-500',
        bg: 'bg-pink-500/10 border-pink-500/30',
        unlocked: favCount >= 10,
        progress: `${Math.min(favCount, 10)}/10 từ`,
      },
    ];
  }, [progress, quizScores, masteredVocabCount, masteredKanjiCount]);

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="space-y-8 pb-12 animate-fadeIn">
      {/* 1. HERO PROFILE & DAILY MISSION BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-900 text-white p-6 sm:p-8 shadow-xl shadow-indigo-950/20 border border-indigo-500/20">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-72 h-72 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Cột trái: Thông tin người dùng & Lời chào */}
          <div className="flex items-start sm:items-center space-x-4">
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-sky-400 to-indigo-400 p-0.5 shadow-lg shadow-indigo-500/30 flex items-center justify-center">
                <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-white font-bold text-2xl">
                  {currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : '🇯🇵'}
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-emerald-500 text-[10px] font-bold text-white border-2 border-slate-900 flex items-center space-x-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                <span>ONLINE</span>
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  {currentUser?.email ? currentUser.email.split('@')[0] : 'Người học Tiếng Nhật'}
                </h1>
                {currentUser?.email ? (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/30 text-sky-200 border border-blue-400/30">
                    Đã đăng nhập
                  </span>
                ) : (
                  <button
                    onClick={onOpenAuth}
                    className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 hover:bg-white/30 text-white transition border border-white/20"
                  >
                    <LogIn className="w-3 h-3" />
                    <span>Đăng nhập lưu mây</span>
                  </button>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-md">
                {progress.streak > 0
                  ? `Xuất sắc! Bạn đã giữ lửa học liên tục ${progress.streak} ngày. Tiếp tục bứt phá mục tiêu hôm nay!`
                  : 'Chào mừng bạn! Hãy hoàn thành mục tiêu từ vựng để bắt đầu chuỗi ngày học liên tục.'}
              </p>
              
              {/* Quick Action Badges */}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold">
                  <Flame className="w-3.5 h-3.5 fill-current text-amber-400 animate-pulse" />
                  <span>Chuỗi {progress.streak || 0} ngày</span>
                </div>
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 text-xs font-bold">
                  <Trophy className="w-3.5 h-3.5 text-indigo-300" />
                  <span>{unlockedCount}/9 Thành tích</span>
                </div>
                {onOpenConjugationTrainer && (
                  <button
                    onClick={onOpenConjugationTrainer}
                    className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-xs font-bold transition shadow-xs transform active:scale-95"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>Luyện chia thể Động từ ⚡</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Cột phải: Daily Mission Meter */}
          <div className="w-full lg:w-80 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15">
            <div className="flex items-center justify-between text-xs font-semibold mb-2">
              <span className="flex items-center space-x-1.5 text-sky-200">
                <Target className="w-4 h-4 text-sky-300" />
                <span>Mục tiêu hàng ngày</span>
              </span>
              <div className="flex items-center space-x-1 text-slate-300">
                <Sliders className="w-3 h-3" />
                <select
                  aria-label="Chọn mục tiêu từ vựng mỗi ngày"
                  value={dailyTarget}
                  onChange={(e) => handleUpdateDailyTarget(Number(e.target.value))}
                  className="bg-slate-900/60 text-white text-xs rounded-lg px-2 py-0.5 border border-white/20 focus:outline-none focus:ring-1 focus:ring-sky-400"
                >
                  <option value={10}>10 từ/ngày</option>
                  <option value={20}>20 từ/ngày</option>
                  <option value={30}>30 từ/ngày</option>
                  <option value={50}>50 từ/ngày</option>
                </select>
              </div>
            </div>

            <div className="flex items-baseline justify-between mb-1.5">
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-black text-white">{todayReviewedCount}</span>
                <span className="text-xs text-slate-300">/ {dailyTarget} từ</span>
              </div>
              <span className="text-xs font-bold text-sky-300">{todayProgressPercent}%</span>
            </div>

            {/* Thanh tiến độ rực rỡ */}
            <div className="w-full h-3 rounded-full bg-slate-900/50 p-0.5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-400 via-blue-400 to-emerald-400 transition-all duration-700 ease-out"
                style={{ width: `${todayProgressPercent}%` }}
              />
            </div>

            <p className="text-[11px] text-slate-300 mt-2 text-center">
              {todayProgressPercent >= 100
                ? '🎉 Đã hoàn thành mục tiêu ngày! Tuyệt vời!'
                : `Còn ${Math.max(0, dailyTarget - todayReviewedCount)} từ nữa để hoàn thành mục tiêu`}
            </p>
          </div>
        </div>
      </div>

      {/* 2. BỐN THẺ CHỈ SỐ NỀN TẢNG (4 KEY ANALYTICS CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Mastered Vocab */}
        <div className="relative group overflow-hidden rounded-2xl bg-white dark:bg-[#111c30] p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Từ vựng đã thuộc
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-sky-400 flex items-center justify-center font-bold">
              <BookCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {masteredVocabCount.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              / {totalVocabCount.toLocaleString()} từ
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              <span>Độ phủ toàn bộ</span>
              <span className="text-blue-600 dark:text-sky-400 font-bold">{vocabMasteryPercent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-600 to-sky-400 transition-all duration-700"
                style={{ width: `${vocabMasteryPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Mastered Kanji */}
        <div className="relative group overflow-hidden rounded-2xl bg-white dark:bg-[#111c30] p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Hán Tự ghi nhớ
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {masteredKanjiCount.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              / {totalKanjiCount.toLocaleString()} chữ
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              <span>Độ phủ Kanji N5-N1</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">{kanjiMasteryPercent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-purple-500 transition-all duration-700"
                style={{ width: `${kanjiMasteryPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Quiz Score Average */}
        <div className="relative group overflow-hidden rounded-2xl bg-white dark:bg-[#111c30] p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Điểm Quiz trung bình
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {averageQuizScore}%
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              ({quizScores.length} bài test)
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              <span>Mức độ tự tin</span>
              <span className="text-amber-600 dark:text-amber-400 font-bold">
                {averageQuizScore >= 80 ? 'Rất cao 🌟' : averageQuizScore >= 50 ? 'Khá tốt 👍' : 'Cần ôn thêm 📖'}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-400 transition-all duration-700"
                style={{ width: `${averageQuizScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 4: Sổ tay & Yêu thích */}
        <div className="relative group overflow-hidden rounded-2xl bg-white dark:bg-[#111c30] p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Kho lưu trữ cá nhân
            </span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
              <Heart className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {progress.favoriteWords?.length || 0}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              từ yêu thích
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80 text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              {progress.customNotebooks?.length || 0} Sổ tay riêng
            </span>
            <button
              onClick={onNavigateToNotebook}
              className="text-blue-600 dark:text-sky-400 font-bold hover:underline flex items-center space-x-1"
            >
              <span>Xem ngay</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. KHU VỰC TRUNG TÂM: SMART SRS (CẦN ÔN HÔM NAY) & LỘ TRÌNH JLPT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CỘT TRÁI (2 COLS): SMART SRS - CẦN ÔN HÔM NAY */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl bg-white dark:bg-[#111c30] p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Hộp Spaced Repetition (Cần ôn hôm nay)
                  </h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Các từ bạn từng đánh dấu sai trong các bài kiểm tra hoặc cần củng cố trí nhớ
                </p>
              </div>

              {mistakeWordsList.length > 0 && (
                <button
                  onClick={() => onNavigateToPractice('mistake', 'flashcard')}
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition transform active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Ôn {mistakeWordsList.length} từ này ngay</span>
                </button>
              )}
            </div>

            {mistakeWordsList.length === 0 ? (
              <div className="text-center py-10 px-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Tuyệt vời! Không có từ nào bị đánh dấu sai
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  Bạn đang nắm vững tất cả các từ vựng đã học. Hãy mở một bài Quiz mới để thử thách giới hạn của bạn!
                </p>
                <button
                  onClick={() => onNavigateToPractice('all', 'quiz')}
                  className="mt-4 inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-sky-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 font-bold text-xs transition"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Làm Quiz kiểm tra ngay</span>
                </button>
              </div>
            ) : (
              <div className="mt-4 space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                  {mistakeWordsList.slice(0, 10).map((word) => (
                    <div
                      key={word.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-baseline space-x-2">
                          <span className="font-jp font-bold text-base text-slate-900 dark:text-white">
                            {word.kanji || word.kana}
                          </span>
                          {word.kanji && (
                            <span className="font-jp text-xs text-slate-500 dark:text-slate-400">
                              {word.kana}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 truncate mt-0.5">
                          {word.meaning}
                        </p>
                      </div>
                      <span className="shrink-0 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40">
                        {word.level}
                      </span>
                    </div>
                  ))}
                </div>
                {mistakeWordsList.length > 10 && (
                  <p className="text-center text-xs text-slate-400 dark:text-slate-500 pt-2">
                    và còn {mistakeWordsList.length - 10} từ nữa trong hộp ghi nhớ...
                  </p>
                )}
              </div>
            )}
          </div>

          {/* LỊCH SỬ QUIZ GẦN ĐÂY */}
          <div className="rounded-3xl bg-white dark:bg-[#111c30] p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-sky-400">
                  <History className="w-4 h-4" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Lịch sử kiểm tra gần đây
                </h2>
              </div>
              <span className="text-xs text-slate-400">
                {quizScores.length} lần test
              </span>
            </div>

            {quizScores.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                Chưa có dữ liệu bài test nào. Hãy chọn mục Luyện tập để làm bài test đầu tiên!
              </div>
            ) : (
              <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800/80">
                {quizScores.slice(-5).reverse().map((scoreItem, idx) => {
                  const percent = scoreItem.total > 0 ? Math.round((scoreItem.score / scoreItem.total) * 100) : 0;
                  return (
                    <div key={idx} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                            percent >= 80
                              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : percent >= 50
                              ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                              : 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {percent}%
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {scoreItem.type || 'Trắc nghiệm Quiz'}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                              {scoreItem.level || 'Tổng hợp'}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                            <Calendar className="w-3 h-3" />
                            <span>{scoreItem.date ? new Date(scoreItem.date).toLocaleDateString('vi-VN') : 'Gần đây'}</span>
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-black text-slate-900 dark:text-white">
                          {scoreItem.score} / {scoreItem.total}
                        </span>
                        <p className="text-[10px] text-slate-400">câu đúng</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* CỘT PHẢI (1 COL): LỘ TRÌNH CHINH PHỤC JLPT (N5 -> N1) */}
        <div className="space-y-6">
          <div className="rounded-3xl bg-white dark:bg-[#111c30] p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center space-x-2 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Lộ trình JLPT (N5 → N1)
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Tỷ lệ hoàn thành theo từng cấp độ
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              {jlptProgressData.map((lvl) => (
                <div
                  key={lvl.level}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 hover:border-blue-500/40 transition group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                        {lvl.level}
                      </span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Cấp độ {lvl.level}
                      </span>
                    </div>
                    <span className="text-xs font-black text-blue-600 dark:text-sky-400">
                      {lvl.overallPercent}%
                    </span>
                  </div>

                  {/* Thanh tiến độ */}
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden mb-2.5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-700"
                      style={{ width: `${lvl.overallPercent}%` }}
                    />
                  </div>

                  {/* Sub-breakdown (Vocab & Kanji) */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/50 dark:border-slate-800">
                    <div>
                      <span>Từ: </span>
                      <strong className="text-slate-700 dark:text-slate-300">
                        {lvl.vocabMastered}/{lvl.vocabTotal}
                      </strong>
                    </div>
                    <div className="text-right">
                      <span>Kanji: </span>
                      <strong className="text-slate-700 dark:text-slate-300">
                        {lvl.kanjiMastered}/{lvl.kanjiTotal}
                      </strong>
                    </div>
                  </div>

                  {/* Quick link button to switch to this level */}
                  <div className="mt-2.5 flex items-center space-x-2">
                    <button
                      onClick={() => onNavigateToCourse(lvl.level === 'N5' ? 'MINNA_1' : lvl.level === 'N4' ? 'MINNA_2' : lvl.level === 'N3' ? 'MINNA_CHUKYU_1' : lvl.level === 'N2' ? 'MINNA_CHUKYU_2' : 'JLPT_N1')}
                      className="flex-1 py-1 rounded-lg bg-white dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition text-center"
                    >
                      Học từ vựng
                    </button>
                    <button
                      onClick={() => onNavigateToKanji(lvl.level)}
                      className="flex-1 py-1 rounded-lg bg-white dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition text-center"
                    >
                      Học Kanji
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. HUY HIỆU & THÀNH TÍCH (GAMIFICATION BADGES) */}
      <div className="rounded-3xl bg-white dark:bg-[#111c30] p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                <Trophy className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Bảng vàng Thành tích & Huy hiệu
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Mở khóa các cột mốc trong hành trình chinh phục tiếng Nhật của bạn
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Đã mở:
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-black text-xs border border-amber-500/30">
              {unlockedCount} / {achievements.length} Huy hiệu
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className={`relative flex items-start space-x-3.5 p-4 rounded-2xl border transition-all ${
                  item.unlocked
                    ? `${item.bg} shadow-xs`
                    : 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-200/50 dark:border-slate-800/50 opacity-60'
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                    item.unlocked
                      ? 'bg-white dark:bg-slate-800 shadow-xs'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.unlocked ? (
                    <Icon className={`w-5 h-5 ${item.color}`} />
                  ) : (
                    <Lock className="w-4 h-4 text-slate-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                      {item.title}
                    </h3>
                    {item.unlocked && (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        ✓ Mở khóa
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                    {item.description}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                    <span>Tiến độ</span>
                    <span className={item.unlocked ? 'text-slate-700 dark:text-slate-300 font-bold' : ''}>
                      {item.progress}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
