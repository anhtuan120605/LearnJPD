import React from 'react';
import { 
  ChevronLeft, 
  Star, 
  AlertCircle,
  Shuffle
} from 'lucide-react';
import { StudyMode, StudyModeSelector } from './StudyModeSelector';
import { WordPracticeFilter } from '../types';

interface PracticeSessionHeaderProps {
  courseName: string;
  lessonTitle: string;
  isMultiMode: boolean;
  selectedLessonsCount: number;
  totalWordsCount: number;
  studyMode: StudyMode;
  onSelectStudyMode: (mode: StudyMode) => void;
  wordFilter: WordPracticeFilter;
  onSelectWordFilter: (filter: WordPracticeFilter) => void;
  filterCounts: {
    all: number;
    unmastered: number;
    favorite: number;
    mistake: number;
  };
  onBackToOverview: () => void;
  isShuffled?: boolean;
  onToggleShuffle?: () => void;
  onReshuffle?: () => void;
}

export const PracticeSessionHeader: React.FC<PracticeSessionHeaderProps> = ({
  courseName,
  lessonTitle,
  isMultiMode,
  selectedLessonsCount,
  totalWordsCount,
  studyMode,
  onSelectStudyMode,
  wordFilter,
  onSelectWordFilter,
  filterCounts,
  onBackToOverview,
  isShuffled = false,
  onToggleShuffle,
  onReshuffle
}) => {
  return (
    <div className="bg-white dark:bg-[#111c30] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
      {/* Hàng 1: Nút Quay Lại Danh Sách Tổng Thể & Tên bài đang học */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBackToOverview}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/40 dark:hover:text-sky-300 text-slate-700 dark:text-slate-200 text-xs font-bold transition group shadow-2xs shrink-0 border border-slate-200/60 dark:border-slate-700/60"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>← Quay lại chọn bài khác (Tổng thể)</span>
          </button>

          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-sky-400 border border-blue-100 dark:border-blue-900/40">
                {courseName}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {isMultiMode 
                  ? `Ôn tổng hợp ${selectedLessonsCount} bài học` 
                  : `${totalWordsCount} từ vựng`}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight mt-0.5">
              {lessonTitle}
            </h2>
          </div>
        </div>

        {/* Bộ lọc từ vựng nhanh & Nút Xáo trộn */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-zinc-800/80 p-1 rounded-2xl overflow-x-auto">
            <span className="text-[11px] font-bold text-slate-500 px-2 hidden lg:inline">Lọc từ:</span>
            <button
              onClick={() => onSelectWordFilter('all')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center space-x-1 ${
                wordFilter === 'all'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
              }`}
            >
              <span>Tất cả ({filterCounts.all})</span>
            </button>

            <button
              onClick={() => onSelectWordFilter('unmastered')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center space-x-1 ${
                wordFilter === 'unmastered'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-amber-600'
              }`}
            >
              <span>Chưa thuộc ({filterCounts.unmastered})</span>
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
              <span>Yêu thích ({filterCounts.favorite})</span>
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
              <span>Hay sai ({filterCounts.mistake})</span>
            </button>
          </div>

          {/* Nút Xáo Trộn Ngẫu Nhiên (Shuffle) */}
          {onToggleShuffle && (
            <div className="flex items-center space-x-1">
              <button
                onClick={onToggleShuffle}
                title={isShuffled ? 'Đang xáo trộn ngẫu nhiên (Bấm để trở về thứ tự bài học)' : 'Xáo trộn ngẫu nhiên thứ tự các từ khi luyện tập'}
                className={`px-3 py-1.5 rounded-2xl text-xs font-bold transition flex items-center space-x-1.5 border shadow-2xs ${
                  isShuffled
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-500 shadow-md shadow-blue-500/20'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700 hover:border-blue-400 hover:bg-slate-50'
                }`}
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>{isShuffled ? 'Đã xáo trộn 🔀' : 'Xáo trộn từ'}</span>
              </button>

              {isShuffled && onReshuffle && (
                <button
                  onClick={onReshuffle}
                  title="Xáo trộn lại một lượt mới ngẫu nhiên"
                  className="p-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 border border-slate-200 dark:border-slate-700 transition"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Hàng 2: Bộ chọn nhanh 5 Chế Độ Luyện Tập (Gọn gàng) */}
      <StudyModeSelector
        currentMode={studyMode}
        onSelectMode={onSelectStudyMode}
        variant="compact"
      />
    </div>
  );
};
