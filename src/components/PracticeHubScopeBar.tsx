import React, { useState, useMemo } from 'react';
import { LessonGroup } from '../types';
import { 
  BookOpen, 
  Layers, 
  CheckSquare, 
  Square, 
  ChevronDown, 
  Filter, 
  Sparkles, 
  Star, 
  AlertCircle,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { courseDatasets } from '../data';
import { getLessonTopic } from '../data/lessonTopics';

export type WordPracticeFilter = 'all' | 'unmastered' | 'favorite' | 'mistake';

interface PracticeHubScopeBarProps {
  currentCourse: string;
  onSelectCourse: (courseKey: string) => void;
  lessons: LessonGroup[];
  selectedLessonNum: number;
  onSelectLesson: (lessonNum: number) => void;
  isMultiMode: boolean;
  onToggleMultiMode: (val: boolean) => void;
  selectedLessons: number[];
  onToggleLessonSelection: (lessonNum: number) => void;
  onSelectAllLessons: () => void;
  onClearAllLessons: () => void;
  onSelectRange: (start: number, end: number) => void;
  filterType: WordPracticeFilter;
  onSelectFilterType: (filter: WordPracticeFilter) => void;
  counts: {
    all: number;
    unmastered: number;
    favorite: number;
    mistake: number;
  };
}

export const PracticeHubScopeBar: React.FC<PracticeHubScopeBarProps> = ({
  currentCourse,
  onSelectCourse,
  lessons,
  selectedLessonNum,
  onSelectLesson,
  isMultiMode,
  onToggleMultiMode,
  selectedLessons,
  onToggleLessonSelection,
  onSelectAllLessons,
  onClearAllLessons,
  onSelectRange,
  filterType,
  onSelectFilterType,
  counts
}) => {
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);
  const [isLessonPickerOpen, setIsLessonPickerOpen] = useState(false);

  const courseList = useMemo(() => {
    return Object.entries(courseDatasets).map(([key, data]) => ({
      key,
      name: data.name,
      badge: data.badge,
      count: data.lessons.length
    }));
  }, []);

  const currentTopic = useMemo(() => {
    return getLessonTopic(currentCourse, selectedLessonNum);
  }, [currentCourse, selectedLessonNum]);

  // Tạo các dải bài chọn nhanh (1-5, 6-10...)
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

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
      {/* Hàng 1: Chọn Giáo Trình & Chọn Bài Học (Gọn gàng trong 1 thanh) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-zinc-800">
        {/* Cụm Trái: Chọn Giáo Trình & Bài */}
        <div className="flex flex-wrap items-center gap-3">
          {/* 1. Pill Chọn Giáo Trình */}
          <div className="relative">
            <button
              onClick={() => setIsCourseDropdownOpen(!isCourseDropdownOpen)}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-bold text-slate-800 dark:text-zinc-200 transition"
            >
              <BookOpen className="w-4 h-4 text-rose-500" />
              <span>{courseDatasets[currentCourse]?.name || 'Giáo trình'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isCourseDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-2 shadow-xl z-30 animate-in fade-in zoom-in-95 duration-150 space-y-1">
                {courseList.map(c => (
                  <button
                    key={c.key}
                    onClick={() => {
                      onSelectCourse(c.key);
                      setIsCourseDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs font-bold transition ${
                      currentCourse === c.key
                        ? 'bg-rose-500 text-white'
                        : 'text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <span>{c.name}</span>
                    <span className="text-[10px] font-mono opacity-80">{c.count} bài</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <span className="text-slate-300 dark:text-zinc-700 hidden sm:inline">|</span>

          {/* 2. Hiển thị Bài Học Đang Chọn */}
          <div className="flex items-center space-x-2">
            {!isMultiMode ? (
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-zinc-800 px-3 py-1.5 rounded-xl">
                  Bài {selectedLessonNum}
                </span>
                <span className="text-xs font-bold text-slate-600 dark:text-zinc-300 max-w-[200px] sm:max-w-xs truncate" title={currentTopic}>
                  {currentTopic}
                </span>
              </div>
            ) : (
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-3 py-1.5 rounded-xl flex items-center space-x-1.5">
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Đang chọn {selectedLessons.length} bài ôn tập ({counts.all} từ)</span>
              </span>
            )}
          </div>
        </div>

        {/* Cụm Phải: Nút Chọn nhiều bài & Đổi bài */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onToggleMultiMode(!isMultiMode)}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition flex items-center space-x-1.5 ${
              isMultiMode
                ? 'bg-rose-500 text-white shadow-xs'
                : 'border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>{isMultiMode ? 'Tắt chọn nhiều bài' : 'Chọn nhiều bài'}</span>
          </button>

          <button
            onClick={() => setIsLessonPickerOpen(!isLessonPickerOpen)}
            className="px-3.5 py-2 rounded-2xl bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold transition flex items-center space-x-1 shadow-2xs"
          >
            <span>{isLessonPickerOpen ? 'Đóng chọn bài' : 'Đổi bài học'}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isLessonPickerOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Popover Bảng Chọn Bài Học (Khi bấm Đổi bài học) - Gọn gàng, không choán màn hình */}
      {isLessonPickerOpen && (
        <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border border-slate-100 dark:border-zinc-800 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Bấm vào bài bạn muốn học:</span>
            {isMultiMode && (
              <div className="flex items-center space-x-2">
                <button onClick={onSelectAllLessons} className="text-rose-500 hover:underline">Chọn tất cả</button>
                <span>•</span>
                <button onClick={onClearAllLessons} className="text-slate-400 hover:underline">Bỏ chọn</button>
              </div>
            )}
          </div>

          {/* Dải bài chọn nhanh khi bật multi mode */}
          {isMultiMode && rangeButtons.length > 0 && (
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs scrollbar-thin">
              <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap">Dải bài:</span>
              {rangeButtons.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onSelectRange(r.start, r.end)}
                  className="px-2.5 py-1 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 hover:border-rose-400 font-bold text-xs whitespace-nowrap"
                >
                  Bài {r.start} - {r.end}
                </button>
              ))}
            </div>
          )}

          {/* Lưới chọn bài học nhỏ gọn */}
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 gap-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
            {lessons.map(l => {
              const isSelected = isMultiMode
                ? selectedLessons.includes(l.lesson)
                : selectedLessonNum === l.lesson;

              return (
                <button
                  key={l.lesson}
                  onClick={() => {
                    if (isMultiMode) {
                      onToggleLessonSelection(l.lesson);
                    } else {
                      onSelectLesson(l.lesson);
                      setIsLessonPickerOpen(false);
                    }
                  }}
                  className={`py-2 px-2.5 rounded-xl text-center border text-xs font-bold transition flex items-center justify-center space-x-1 ${
                    isSelected
                      ? 'bg-rose-500 text-white border-rose-500 shadow-xs ring-1 ring-rose-500/20'
                      : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:border-slate-400'
                  }`}
                >
                  <span>Bài {l.lesson}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Hàng 2: Bộ lọc từ vựng thông minh (Tất cả / Chưa thuộc / Yêu thích / Hay sai) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-thin">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center space-x-1 mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Lọc từ:</span>
          </span>

          <button
            onClick={() => onSelectFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 whitespace-nowrap ${
              filterType === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200'
            }`}
          >
            <span>Tất cả</span>
            <span className="px-1.5 py-0.2 rounded-md bg-white/20 dark:bg-black/20 text-[10px] font-mono">
              {counts.all}
            </span>
          </button>

          <button
            onClick={() => onSelectFilterType('unmastered')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 whitespace-nowrap ${
              filterType === 'unmastered'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200'
            }`}
          >
            <span>Chưa thuộc</span>
            <span className="px-1.5 py-0.2 rounded-md bg-white/20 text-[10px] font-mono">
              {counts.unmastered}
            </span>
          </button>

          <button
            onClick={() => onSelectFilterType('favorite')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 whitespace-nowrap ${
              filterType === 'favorite'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200'
            }`}
          >
            <Star className="w-3 h-3 fill-current" />
            <span>Yêu thích</span>
            <span className="px-1.5 py-0.2 rounded-md bg-white/20 text-[10px] font-mono">
              {counts.favorite}
            </span>
          </button>

          <button
            onClick={() => onSelectFilterType('mistake')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 whitespace-nowrap ${
              filterType === 'mistake'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200'
            }`}
          >
            <AlertCircle className="w-3 h-3" />
            <span>Hay sai</span>
            <span className="px-1.5 py-0.2 rounded-md bg-white/20 text-[10px] font-mono">
              {counts.mistake}
            </span>
          </button>
        </div>

        {/* Tóm tắt số từ đang sẵn sàng luyện */}
        <div className="text-xs text-slate-400 font-semibold self-end sm:self-center">
          Sẵn sàng luyện: <strong className="text-emerald-500 font-bold">{
            filterType === 'all' ? counts.all :
            filterType === 'unmastered' ? counts.unmastered :
            filterType === 'favorite' ? counts.favorite : counts.mistake
          }</strong> từ vựng
        </div>
      </div>
    </div>
  );
};
