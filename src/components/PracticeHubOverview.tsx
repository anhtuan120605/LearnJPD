import React, { useState, useMemo } from 'react';
import { LessonGroup, WordPracticeFilter } from '../types';
import { 
  BookOpen, 
  CheckSquare, 
  Square, 
  Sparkles, 
  Star, 
  AlertCircle,
  Search,
  ArrowRight,
  Play,
  Check
} from 'lucide-react';
import { courseDatasets } from '../data';
import { getLessonTopic } from '../data/lessonTopics';
import { StudyMode, StudyModeSelector } from './StudyModeSelector';

interface PracticeHubOverviewProps {
  currentCourse: string;
  onSelectCourse: (courseKey: string) => void;
  lessons: LessonGroup[];
  selectedLessonNum: number;
  onSelectLesson: (lessonNum: number) => void;
  masteredWords: string[];
  isMultiMode: boolean;
  onToggleMultiMode: (val: boolean) => void;
  selectedLessons: number[];
  onToggleLessonSelection: (lessonNum: number) => void;
  onSelectAllLessons: () => void;
  onClearAllLessons: () => void;
  onSelectRange: (start: number, end: number) => void;
  studyMode: StudyMode;
  onSelectStudyMode: (mode: StudyMode) => void;
  wordFilter: WordPracticeFilter;
  onSelectWordFilter: (filter: WordPracticeFilter) => void;
  counts: {
    all: number;
    unmastered: number;
    favorite: number;
    mistake: number;
  };
  onStartPractice: (lessonNum?: number) => void;
  onOpenConjugationTrainer?: () => void;
  onOpenMistakeBank?: () => void;
}

export const PracticeHubOverview: React.FC<PracticeHubOverviewProps> = ({
  currentCourse,
  onSelectCourse,
  lessons,
  selectedLessonNum,
  onSelectLesson,
  masteredWords,
  isMultiMode,
  onToggleMultiMode,
  selectedLessons,
  onToggleLessonSelection,
  onSelectAllLessons,
  onClearAllLessons,
  onSelectRange,
  studyMode,
  onSelectStudyMode,
  wordFilter,
  onSelectWordFilter,
  counts,
  onStartPractice,
  onOpenConjugationTrainer,
  onOpenMistakeBank
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'in_progress' | 'not_started'>('all');

  const courseList = useMemo(() => {
    return Object.entries(courseDatasets).map(([key, data]) => ({
      key,
      name: data.name,
      badge: data.badge,
      count: data.lessons.length,
      description: data.description
    }));
  }, []);

  // Thống kê tiến độ từng bài học
  const lessonStats = useMemo(() => {
    return lessons.map(l => {
      const topic = getLessonTopic(currentCourse, l.lesson);
      const totalWords = l.words.length;
      const masteredCount = l.words.filter(w => masteredWords.includes(w.id)).length;
      const percent = totalWords > 0 ? Math.round((masteredCount / totalWords) * 100) : 0;
      
      let status: 'completed' | 'in_progress' | 'not_started' = 'not_started';
      if (percent === 100) status = 'completed';
      else if (percent > 0) status = 'in_progress';

      return {
        lesson: l.lesson,
        title: l.title,
        topic,
        totalWords,
        masteredCount,
        percent,
        status,
        words: l.words
      };
    });
  }, [lessons, currentCourse, masteredWords]);

  // Thống kê tổng thể
  const overallStats = useMemo(() => {
    const totalLessons = lessonStats.length;
    const completedLessons = lessonStats.filter(s => s.status === 'completed').length;
    const inProgressLessons = lessonStats.filter(s => s.status === 'in_progress').length;
    const totalWords = lessonStats.reduce((sum, s) => sum + s.totalWords, 0);
    const totalMastered = lessonStats.reduce((sum, s) => sum + s.masteredCount, 0);
    const overallPercent = totalWords > 0 ? Math.round((totalMastered / totalWords) * 100) : 0;

    return {
      totalLessons,
      completedLessons,
      inProgressLessons,
      totalWords,
      totalMastered,
      overallPercent
    };
  }, [lessonStats]);

  // Dải bài chọn nhanh (1-5, 6-10...)
  const rangeButtons = useMemo(() => {
    if (lessons.length <= 5) return [];
    const chunkSize = lessons.length > 30 ? 10 : 5;
    const ranges: Array<{ start: number; end: number }> = [];
    const minLesson = Math.min(...lessons.map(l => l.lesson));
    const maxLesson = Math.max(...lessons.map(l => l.lesson));
    for (let s = minLesson; s <= maxLesson; s += chunkSize) {
      const e = Math.min(s + chunkSize - 1, maxLesson);
      ranges.push({ start: s, end: e });
    }
    return ranges;
  }, [lessons]);

  // Lọc bài học
  const filteredLessons = useMemo(() => {
    return lessonStats.filter(s => {
      const matchesSearch = s.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `Bài ${s.lesson}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `Bài ${s.lesson}:`.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || s.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [lessonStats, searchQuery, statusFilter]);

  const activeLessonCount = isMultiMode ? selectedLessons.length : 1;
  const readyWordsCount = counts[wordFilter] ?? 0;

  return (
    <div className="space-y-6">
      {/* BANNER ĐẶC BIỆT: BỘ LUYỆN CHIA THỂ ĐỘNG TỪ (CONJUGATION TRAINER) */}
      {onOpenConjugationTrainer && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white p-5 sm:p-6 shadow-lg shadow-indigo-950/20 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5 z-10">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 font-bold text-2xl shadow-inner shrink-0">
              ⚡
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  Bộ Luyện Chia Thể Động Từ & Tính Từ (Conjugation Trainer)
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  MỚI
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Thực chiến phản xạ chia thể て, ない, た, khả năng, bị động, sai khiến, điều kiện (ば) với thử thách 60 giây!
              </p>
            </div>
          </div>

          <button
            onClick={onOpenConjugationTrainer}
            className="shrink-0 px-5 py-2.5 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 font-black text-xs shadow-md transition transform active:scale-95 flex items-center justify-center space-x-2 z-10"
          >
            <span>Vào đấu trường chia thể</span>
            <ArrowRight className="w-4 h-4 text-blue-600" />
          </button>
        </div>
      )}

      {/* 1. THANH CHỌN GIÁO TRÌNH */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2 text-xs font-black text-blue-600 dark:text-sky-400 uppercase tracking-wider px-1">
          <BookOpen className="w-4 h-4" />
          <span>1. Chọn giáo trình / Cấp độ ôn luyện:</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {courseList.map((c) => {
            const isSelected = currentCourse === c.key;
            return (
              <button
                key={c.key}
                onClick={() => onSelectCourse(c.key)}
                className={`p-3.5 rounded-2xl text-left transition-all border relative overflow-hidden group ${
                  isSelected
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-500 shadow-md shadow-blue-500/20'
                    : 'bg-white dark:bg-[#111c30] border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-blue-400 hover:shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                    isSelected 
                      ? 'bg-white/20 text-white' 
                      : 'bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-sky-400 border border-blue-100 dark:border-slate-700'
                  }`}>
                    {c.badge}
                  </span>
                  <span className={`text-[11px] font-mono ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                    {c.count} bài
                  </span>
                </div>
                <h4 className="text-xs font-black line-clamp-2 leading-snug">
                  {c.name}
                </h4>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. CHỌN PHƯƠNG PHÁP & BỘ LỌC TỪ VỰNG */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center space-x-2 text-xs font-black text-blue-600 dark:text-sky-400 uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>2. Chọn phương pháp luyện tập:</span>
          </div>

          {/* Bộ lọc từ vựng thông minh */}
          <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-zinc-800/80 p-1 rounded-2xl overflow-x-auto">
            <span className="text-[11px] font-bold text-slate-500 px-2 hidden sm:inline">Lọc từ:</span>
            <button
              onClick={() => onSelectWordFilter('all')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center space-x-1 ${
                wordFilter === 'all'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
              }`}
            >
              <span>Tất cả</span>
              <span className="text-[10px] opacity-75 font-mono">({counts.all})</span>
            </button>

            <button
              onClick={() => onSelectWordFilter('unmastered')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center space-x-1 ${
                wordFilter === 'unmastered'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-amber-600'
              }`}
            >
              <span>Chưa thuộc</span>
              <span className="text-[10px] opacity-90 font-mono">({counts.unmastered})</span>
            </button>

            <button
              onClick={() => onSelectWordFilter('favorite')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center space-x-1 ${
                wordFilter === 'favorite'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-rose-600'
              }`}
            >
              <Star className="w-3 h-3 fill-current" />
              <span>Yêu thích</span>
              <span className="text-[10px] opacity-90 font-mono">({counts.favorite})</span>
            </button>

            <button
              onClick={() => onSelectWordFilter('mistake')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center space-x-1 ${
                wordFilter === 'mistake'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-red-600'
              }`}
            >
              <AlertCircle className="w-3 h-3" />
              <span>Hay sai</span>
              <span className="text-[10px] opacity-90 font-mono">({counts.mistake})</span>
            </button>
          </div>
        </div>

        {/* 5 Thẻ Hero Chế Độ Luyện Tập */}
        <StudyModeSelector
          currentMode={studyMode}
          onSelectMode={onSelectStudyMode}
          variant="cards"
        />
      </div>

      {/* BANNER PHỤC HỒI TỪ HAY SAI (MISTAKE RECOVERY) */}
      {counts.mistake > 0 && (
        <div className="bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-transparent border border-rose-500/30 dark:border-rose-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs animate-in fade-in duration-300">
          <div className="flex items-center space-x-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-600 text-white flex items-center justify-center font-black shrink-0 shadow-sm shadow-rose-500/20">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center space-x-2">
                <span>Hộp Phục Hồi Từ Hay Sai</span>
                <span className="px-2 py-0.2 rounded-full text-[11px] font-bold bg-rose-500 text-white">
                  {counts.mistake} từ
                </span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Bạn đang có các từ trả lời sai trong bài này. Hãy luyện tập để giải quyết dứt điểm các từ này nhé!
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            {onOpenMistakeBank && (
              <button
                onClick={onOpenMistakeBank}
                className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 transition"
              >
                Xem danh sách từ sai
              </button>
            )}
            <button
              onClick={() => {
                onSelectWordFilter('mistake');
                onStartPractice();
              }}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs shadow-md shadow-rose-500/20 transition active:scale-95"
            >
              Ôn ngay {counts.mistake} từ này →
            </button>
          </div>
        </div>
      )}

      {/* 3. BANNER ĐIỀU KHIỂN & HÀNH ĐỘNG BẮT ĐẦU */}
      <div className="bg-gradient-to-br from-slate-900 via-[#0f172a] to-[#1e1b4b] border border-slate-800 text-white rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-sky-300 border border-blue-500/30">
                PHẠM VI ĐANG CHỌN
              </span>
              <span className="text-xs text-slate-300 font-mono">
                {isMultiMode 
                  ? `Đã chọn ${selectedLessons.length} bài học` 
                  : `Bài ${selectedLessonNum}: ${getLessonTopic(currentCourse, selectedLessonNum)}`}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black">
              Sẵn sàng luyện <span className="text-sky-400 font-mono">{readyWordsCount}</span> từ vựng ({wordFilter === 'all' ? 'Tất cả' : wordFilter === 'unmastered' ? 'Chưa thuộc' : wordFilter === 'favorite' ? 'Yêu thích' : 'Hay sai'})
            </h3>
          </div>

          {/* Nút to CTA: Bắt đầu luyện tập */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onToggleMultiMode(!isMultiMode)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center space-x-2 border ${
                isMultiMode 
                  ? 'bg-blue-500/20 border-blue-500/40 text-sky-300' 
                  : 'bg-white/10 hover:bg-white/15 border-white/10 text-slate-200'
              }`}
            >
              {isMultiMode ? <CheckSquare className="w-4 h-4 text-sky-400" /> : <Square className="w-4 h-4" />}
              <span>{isMultiMode ? 'Đang chọn nhiều bài' : 'Chọn nhiều bài để ôn'}</span>
            </button>

            <button
              onClick={() => onStartPractice()}
              disabled={readyWordsCount === 0}
              className={`px-6 py-3 rounded-2xl font-black text-sm flex items-center space-x-2 shadow-lg transition active:scale-95 whitespace-nowrap ${
                readyWordsCount > 0
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/30'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Bắt đầu luyện tập ({readyWordsCount} từ) →</span>
            </button>
          </div>
        </div>

        {/* Công cụ chọn nhiều bài: Dải bài & Chọn tất cả */}
        {isMultiMode && (
          <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onSelectAllLessons}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition"
              >
                Chọn tất cả ({lessons.length} bài)
              </button>
              <button
                type="button"
                onClick={onClearAllLessons}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 font-bold transition"
              >
                Bỏ chọn hết
              </button>
            </div>

            {rangeButtons.length > 0 && (
              <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-thin">
                <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap">Chọn dải:</span>
                {rangeButtons.map((r, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => onSelectRange(r.start, r.end)}
                    className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-blue-600 text-slate-200 hover:text-white font-bold text-xs whitespace-nowrap transition"
                  >
                    Bài {r.start} - {r.end}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. THANH TÌM KIẾM & BỘ LỌC TRẠNG THÁI BÀI HỌC */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-zinc-800/80 p-1 rounded-2xl overflow-x-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              statusFilter === 'all'
                ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Tất cả ({overallStats.totalLessons})
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              statusFilter === 'completed'
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'text-slate-500 hover:text-emerald-600'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Đã thuộc ({overallStats.completedLessons})</span>
          </button>
          <button
            onClick={() => setStatusFilter('in_progress')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              statusFilter === 'in_progress'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-500 hover:text-amber-600'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Đang học ({overallStats.inProgressLessons})</span>
          </button>
          <button
            onClick={() => setStatusFilter('not_started')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              statusFilter === 'not_started'
                ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-slate-300" />
            <span>Chưa học</span>
          </button>
        </div>

        {/* Ô tìm kiếm */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tìm theo chủ đề, số bài..."
            className="w-full pl-9 pr-3.5 py-2 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
          />
        </div>
      </div>

      {/* 5. LƯỚI TỔNG THỂ TẤT CẢ CÁC BÀI HỌC (HIỂN THỊ ĐẦY ĐỦ, KHÔNG GIẤU) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLessons.map(s => {
          const isSelected = isMultiMode
            ? selectedLessons.includes(s.lesson)
            : selectedLessonNum === s.lesson;

          let badgeBg = 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400';
          let badgeText = 'Chưa bắt đầu';
          let borderAccent = 'border-slate-200 dark:border-zinc-800';

          if (s.status === 'completed') {
            badgeBg = 'bg-emerald-500 text-white';
            badgeText = '✓ Đã thuộc 100%';
            borderAccent = 'border-emerald-300 dark:border-emerald-800/80';
          } else if (s.status === 'in_progress') {
            badgeBg = 'bg-amber-500 text-white';
            badgeText = `Đang học (${s.percent}%)`;
            borderAccent = 'border-amber-300 dark:border-amber-800/80';
          }

          return (
            <div
              key={s.lesson}
              onClick={() => {
                if (isMultiMode) {
                  onToggleLessonSelection(s.lesson);
                } else {
                  onSelectLesson(s.lesson);
                }
              }}
              className={`bg-white dark:bg-[#111c30] border-2 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer relative ${borderAccent} ${
                isSelected 
                  ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50/30 dark:bg-blue-950/20' 
                  : ''
              }`}
            >
              <div>
                {/* Header thẻ: Số bài + Checkbox (nếu có) + Huy hiệu tiến độ */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2.5">
                    {isMultiMode ? (
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition ${
                        isSelected ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                      }`}>
                        {isSelected ? <Check className="w-4 h-4 stroke-[3]" /> : <Square className="w-4 h-4" />}
                      </div>
                    ) : (
                      <span className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 flex items-center justify-center font-black text-blue-600 dark:text-sky-400 text-sm">
                        {s.lesson}
                      </span>
                    )}

                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                        Bài {s.lesson}
                      </h3>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {s.totalWords} từ vựng
                      </span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${badgeBg}`}>
                    {badgeText}
                  </span>
                </div>

                {/* TÊN CHỦ ĐỀ THỰC TẾ (Nổi bật, giúp nhận diện ngay ngữ cảnh bài học) */}
                <div className="my-3 py-2.5 px-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-sky-400 block mb-0.5">
                    CHỦ ĐỀ CHÍNH
                  </span>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 line-clamp-2">
                    {s.topic}
                  </p>
                </div>

                {/* Thanh tiến độ mini */}
                <div className="space-y-1 mt-3">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                    <span>Tiến độ thuộc</span>
                    <span>{s.masteredCount} / {s.totalWords} từ ({s.percent}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        s.status === 'completed'
                          ? 'bg-emerald-500'
                          : s.status === 'in_progress'
                            ? 'bg-amber-500'
                            : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                      style={{ width: `${s.percent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Nút hành động trong thẻ */}
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                {/* Nút Thêm vào ôn tập nhiều bài */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isMultiMode) onToggleMultiMode(true);
                    onToggleLessonSelection(s.lesson);
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                    isMultiMode && selectedLessons.includes(s.lesson)
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  title="Thêm cả bài này vào danh sách ôn tập tổng hợp"
                >
                  <Star className={`w-3.5 h-3.5 ${isMultiMode && selectedLessons.includes(s.lesson) ? 'fill-white' : ''}`} />
                  <span className="hidden sm:inline">
                    {isMultiMode && selectedLessons.includes(s.lesson) ? 'Đã thêm' : 'Thêm ôn'}
                  </span>
                </button>

                {/* Nút Luyện bài này ngay */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectLesson(s.lesson);
                    onStartPractice(s.lesson);
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-blue-600 dark:bg-slate-800 dark:hover:bg-blue-600 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition active:scale-95 shadow-sm"
                >
                  <span>Luyện tập bài này</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
