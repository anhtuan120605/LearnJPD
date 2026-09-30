import React, { useState, useMemo } from 'react';
import { LessonGroup } from '../types';
import { 
  CheckCircle2, 
  BookOpen, 
  Layers, 
  CheckSquare, 
  Square, 
  Check, 
  ArrowRight, 
  Star, 
  Sparkles, 
  Clock, 
  LayoutGrid, 
  ChevronRight,
  ChevronLeft,
  Search,
  Filter
} from 'lucide-react';
import { courseDatasets } from '../data';
import { getLessonTopic } from '../data/lessonTopics';

export interface LessonSelectorProps {
  currentCourse: string;
  onSelectCourse: (courseKey: string) => void;
  lessons: LessonGroup[];
  selectedLessonNum: number;
  onSelectLesson: (lessonNum: number) => void;
  masteredWords: string[];
  isMultiMode?: boolean;
  onToggleMultiMode?: (val: boolean) => void;
  selectedLessons?: number[];
  onToggleLessonSelection?: (lessonNum: number) => void;
  onSelectAllLessons?: () => void;
  onClearAllLessons?: () => void;
  onSelectRange?: (start: number, end: number) => void;
  // Các prop mở rộng cho 2 View Mode
  mode?: 'dashboard' | 'sidebar' | 'compact';
  onEnterStudyMode?: (lessonNum: number) => void;
  onBackToDashboard?: () => void;
}

export const LessonSelector: React.FC<LessonSelectorProps> = ({
  currentCourse,
  onSelectCourse,
  lessons,
  selectedLessonNum,
  onSelectLesson,
  masteredWords,
  isMultiMode = false,
  onToggleMultiMode,
  selectedLessons = [selectedLessonNum],
  onToggleLessonSelection,
  onSelectAllLessons,
  onClearAllLessons,
  onSelectRange,
  mode = 'dashboard',
  onEnterStudyMode,
  onBackToDashboard
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

  // Thống kê tổng quan toàn giáo trình
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

  // Tạo các dải bài chọn nhanh (Bài 1-5, Bài 6-10,...)
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

  // Lọc bài theo từ khóa & trạng thái
  const filteredLessons = useMemo(() => {
    return lessonStats.filter(s => {
      const matchSearch = !searchQuery.trim() || 
        s.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `bài ${s.lesson}`.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchStatus = statusFilter === 'all' || s.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [lessonStats, searchQuery, statusFilter]);

  // ==========================================
  // VIEW MODE 2: SIDEBAR LƯỚI BÀI HỌC 2 CỘT (SPLIT-VIEW)
  // ==========================================
  if (mode === 'sidebar') {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-4 shadow-sm space-y-4">
        {/* Header Sidebar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-500">
              {courseDatasets[currentCourse]?.badge || 'MINNA'}
            </span>
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              Danh sách bài học
            </h3>
          </div>

          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-200 text-xs font-bold transition flex items-center space-x-1"
              title="Về Dashboard xem tất cả bài"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Tất cả bài</span>
            </button>
          )}
        </div>

        {/* Nút bật chế độ chọn nhiều bài */}
        {onToggleMultiMode && (
          <div className="flex items-center justify-between text-xs pt-1">
            <button
              onClick={() => onToggleMultiMode(!isMultiMode)}
              className={`w-full py-1.5 rounded-xl font-bold transition flex items-center justify-center space-x-1.5 ${
                isMultiMode
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>{isMultiMode ? `Đã chọn (${selectedLessons.length} bài)` : 'Chọn nhiều bài để ôn'}</span>
            </button>
          </div>
        )}

        {/* Lưới bài học 2 cột nhỏ gọn đúng chuẩn Split-View */}
        <div className="grid grid-cols-2 gap-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1 scrollbar-thin">
          {lessonStats.map(s => {
            const isSelected = isMultiMode
              ? selectedLessons.includes(s.lesson)
              : selectedLessonNum === s.lesson;

            let dotColor = 'bg-slate-300 dark:bg-zinc-600';
            if (s.status === 'completed') dotColor = 'bg-emerald-500 shadow-xs shadow-emerald-500/50';
            else if (s.status === 'in_progress') dotColor = 'bg-amber-500 shadow-xs shadow-amber-500/50';

            return (
              <button
                key={s.lesson}
                onClick={() => {
                  if (isMultiMode && onToggleLessonSelection) {
                    onToggleLessonSelection(s.lesson);
                  } else {
                    onSelectLesson(s.lesson);
                  }
                }}
                className={`p-2.5 rounded-2xl text-left border transition relative flex flex-col justify-between group active:scale-98 ${
                  isSelected
                    ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-bold ring-2 ring-rose-500/20'
                    : 'border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 text-slate-700 dark:text-zinc-300 hover:border-slate-400'
                }`}
                title={`Bài ${s.lesson}: ${s.topic} (${s.percent}% đã thuộc)`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-black">
                    Bài {s.lesson}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                </div>

                <p className="text-[10px] text-slate-500 dark:text-zinc-400 line-clamp-1 mt-1 font-medium leading-tight">
                  {s.topic}
                </p>

                <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 dark:border-zinc-800/80 text-[9px] font-mono text-slate-400">
                  <span>{s.masteredCount}/{s.totalWords}</span>
                  <span className={s.status === 'completed' ? 'text-emerald-500 font-bold' : ''}>{s.percent}%</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW MODE 1: DASHBOARD LƯỚI THẺ BÀI HỌC LỚN (GÓC NHÌN 1)
  // ==========================================
  return (
    <div className="space-y-6">
      {/* 1. Chọn Tập Giáo Trình / Cấp Độ */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500 flex items-center space-x-1.5">
            <BookOpen className="w-4 h-4 text-rose-500" />
            <span>1. Chọn Giáo Trình / Cấp Độ:</span>
          </label>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {courseList.map((c) => {
            const isSelected = currentCourse === c.key;
            return (
              <button
                key={c.key}
                onClick={() => onSelectCourse(c.key)}
                className={`flex flex-col justify-between text-left p-4 rounded-2xl border transition-all ${
                  isSelected
                    ? 'bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/25 ring-2 ring-rose-500/20 scale-[1.02]'
                    : 'bg-slate-50 dark:bg-zinc-800/70 border-slate-200 dark:border-zinc-700/60 text-slate-700 dark:text-zinc-200 hover:border-rose-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      isSelected 
                        ? 'bg-white/20 text-white' 
                        : 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                    }`}>
                      {c.badge}
                    </span>
                    <span className={`text-[11px] font-mono ${isSelected ? 'text-rose-100' : 'text-slate-400'}`}>
                      {c.count} bài
                    </span>
                  </div>
                  <h4 className="text-sm font-extrabold leading-snug">
                    {c.name}
                  </h4>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Banner Tiến Độ Tổng Quan & Thanh Gamification Phủ Xanh */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-zinc-900 dark:to-zinc-950 text-white border border-slate-700 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30">
                Tiến độ giáo trình
              </span>
              <span className="text-xs text-slate-400">
                {courseDatasets[currentCourse]?.name}
              </span>
            </div>
            <h2 className="text-2xl font-black mt-1">
              Đã thuộc <strong className="text-emerald-400">{overallStats.completedLessons}</strong> / {overallStats.totalLessons} bài học
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Tổng cộng {overallStats.totalMastered} / {overallStats.totalWords} từ vựng đã nhớ ({overallStats.overallPercent}%)
            </p>
          </div>

          {/* Cụm nút hành động nhanh */}
          <div className="flex items-center space-x-2">
            {onToggleMultiMode && (
              <button
                onClick={() => onToggleMultiMode(!isMultiMode)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center space-x-2 ${
                  isMultiMode
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                }`}
              >
                <CheckSquare className="w-4 h-4" />
                <span>{isMultiMode ? `Đang chọn ${selectedLessons.length} bài` : 'Chọn nhiều bài để ôn'}</span>
              </button>
            )}

            <button
              onClick={() => {
                if (onEnterStudyMode) {
                  onEnterStudyMode(selectedLessonNum);
                } else {
                  onSelectLesson(selectedLessonNum);
                }
              }}
              className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center space-x-2 shadow-md shadow-emerald-500/25 transition active:scale-95"
            >
              <span>Học tiếp Bài {selectedLessonNum}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Thanh Progress tổng thể rực rỡ */}
        <div className="space-y-1.5">
          <div className="w-full bg-slate-800 dark:bg-zinc-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700 dark:border-zinc-700">
            <div
              className="bg-gradient-to-r from-emerald-500 via-teal-400 to-[#05b651] h-full rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${overallStats.overallPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold px-1">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              <span>{overallStats.completedLessons} bài hoàn thành</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
              <span>{overallStats.inProgressLessons} bài đang học</span>
            </span>
            <span>{overallStats.overallPercent}% hoàn thành</span>
          </div>
        </div>
      </div>

      {/* 3. Thanh điều khiển nhanh khi bật Chọn Nhiều Bài */}
      {isMultiMode && (
        <div className="bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 rounded-3xl p-4 sm:p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="font-bold text-rose-700 dark:text-rose-300 flex items-center space-x-2">
              <span className="text-base">📚</span>
              <span>Đang chọn <strong>{selectedLessons.length}</strong> / {lessons.length} bài để ôn tập tổng hợp</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onSelectAllLessons}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 font-bold hover:bg-slate-50 transition"
              >
                Chọn tất cả ({lessons.length} bài)
              </button>
              <button
                type="button"
                onClick={onClearAllLessons}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700 font-bold hover:bg-slate-50 transition"
              >
                Bỏ chọn hết
              </button>
              {onEnterStudyMode && (
                <button
                  type="button"
                  onClick={() => onEnterStudyMode(selectedLessons[0] || 1)}
                  className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition shadow-sm"
                >
                  Bắt đầu ôn tập →
                </button>
              )}
            </div>
          </div>

          {/* Dải bài chọn nhanh */}
          {rangeButtons.length > 0 && (
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs scrollbar-thin pt-1 border-t border-rose-100 dark:border-rose-900/30">
              <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">Chọn dải:</span>
              {rangeButtons.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onSelectRange && onSelectRange(r.start, r.end)}
                  className="px-2.5 py-1 rounded-xl bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 hover:border-rose-400 hover:text-rose-600 font-bold text-xs whitespace-nowrap shadow-2xs transition"
                >
                  Bài {r.start} - {r.end}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. Bộ Lọc & Tìm Kiếm Bài Học */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Lọc trạng thái gamification */}
        <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-zinc-800/80 p-1 rounded-2xl overflow-x-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              statusFilter === 'all'
                ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Tất cả ({lessonStats.length})
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

        {/* Ô tìm kiếm theo tên chủ đề */}
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

      {/* 5. LƯỚI THẺ BÀI HỌC LỚN CÓ TÊN CHỦ ĐỀ THỰC TẾ & GAMIFICATION (Ảnh 1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLessons.map(s => {
          const isSelected = isMultiMode
            ? selectedLessons.includes(s.lesson)
            : selectedLessonNum === s.lesson;

          // Màu sắc trạng thái Gamification
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
              className={`bg-white dark:bg-zinc-900 border-2 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative ${borderAccent} ${
                isSelected && isMultiMode ? 'ring-2 ring-rose-500/30 border-rose-500' : ''
              }`}
            >
              <div>
                {/* Header thẻ: Số bài + Gamification badge */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-9 h-9 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center font-black text-slate-900 dark:text-white text-sm">
                      {s.lesson}
                    </span>
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

                {/* TÊN CHỦ ĐỀ THỰC TẾ (Nổi bật, giúp ghi nhớ ngữ cảnh tốt hơn 3 lần) */}
                <div className="my-3 py-2.5 px-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800">
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-500 block mb-0.5">
                    CHỦ ĐỀ CHÍNH
                  </span>
                  <p className="text-sm font-bold text-slate-800 dark:text-zinc-200 line-clamp-2">
                    {s.topic}
                  </p>
                </div>

                {/* Thanh tiến trình mini */}
                <div className="space-y-1 mt-3">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                    <span>Tiến độ thuộc</span>
                    <span>{s.masteredCount} / {s.totalWords} từ</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        s.status === 'completed'
                          ? 'bg-emerald-500'
                          : s.status === 'in_progress'
                            ? 'bg-amber-500'
                            : 'bg-slate-300 dark:bg-zinc-700'
                      }`}
                      style={{ width: `${s.percent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Nút hành động trong thẻ */}
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                {/* Nút ⭐ Thêm cả bài vào ôn tập */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onToggleMultiMode && !isMultiMode) {
                      onToggleMultiMode(true);
                    }
                    if (onToggleLessonSelection) {
                      onToggleLessonSelection(s.lesson);
                    }
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                    isMultiMode && selectedLessons.includes(s.lesson)
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
                  }`}
                  title="Thêm cả bài này vào danh sách ôn tập tổng hợp"
                >
                  <Star className={`w-3.5 h-3.5 ${isMultiMode && selectedLessons.includes(s.lesson) ? 'fill-white' : ''}`} />
                  <span className="hidden sm:inline">
                    {isMultiMode && selectedLessons.includes(s.lesson) ? 'Đã thêm' : 'Ôn tập'}
                  </span>
                </button>

                {/* Nút Vào học ngay bài này -> Chuyển sang Split-View */}
                <button
                  type="button"
                  onClick={() => {
                    onSelectLesson(s.lesson);
                    if (onEnterStudyMode) {
                      onEnterStudyMode(s.lesson);
                    }
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs flex items-center justify-center space-x-1.5 transition active:scale-95 shadow-sm"
                >
                  <span>Vào học</span>
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
