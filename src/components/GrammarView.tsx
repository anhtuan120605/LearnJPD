import React, { useState } from 'react';
import { GrammarLesson, GrammarPoint } from '../types';
import { Volume2, BookOpen, Sparkles, Check, ChevronDown, ChevronUp, Search, Info } from 'lucide-react';
import { speakJapanese } from '../lib/audio';

interface GrammarViewProps {
  lesson: GrammarLesson | undefined;
  lessonNum: number;
}

export const GrammarView: React.FC<GrammarViewProps> = ({ lesson, lessonNum }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  if (!lesson || !lesson.points || lesson.points.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-10 text-center shadow-sm">
        <BookOpen className="w-12 h-12 text-slate-300 dark:text-zinc-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">
          Chưa có dữ liệu ngữ pháp cho Bài {lessonNum}
        </h3>
        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
          Hệ thống đang tiếp tục cập nhật ngữ pháp chi tiết cho bài học này.
        </p>
      </div>
    );
  }

  const filteredPoints = lesson.points.filter(p => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      p.structure.toLowerCase().includes(term) ||
      p.meaning.toLowerCase().includes(term) ||
      p.explanation.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Giới thiệu Ngữ pháp bài học */}
      <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/20 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                Minna no Nihongo • {lesson.level}
              </span>
              <span className="text-xs text-slate-500 dark:text-zinc-400">
                {lesson.points.length} cấu trúc trọng tâm
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
              {lesson.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-1">
              Học các mẫu câu cốt lõi kết hợp trực tiếp với từ vựng bài {lessonNum} để ghi nhớ nhanh nhất.
            </p>
          </div>

          {/* Ô tìm kiếm cấu trúc */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm mẫu câu, ý nghĩa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>
        </div>
      </div>

      {/* Danh sách các cấu trúc ngữ pháp */}
      <div className="space-y-4">
        {filteredPoints.map((point: GrammarPoint, idx: number) => {
          const isExpanded = !searchTerm && (expandedIds.includes(point.id) || idx === 0);

          return (
            <div
              key={point.id}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-sm hover:border-indigo-300 dark:hover:border-zinc-700 transition"
            >
              {/* Tiêu đề cấu trúc & Nút mở rộng */}
              <div 
                onClick={() => toggleExpand(point.id)}
                className="flex items-start justify-between cursor-pointer group"
              >
                <div className="space-y-1.5 flex-1 pr-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition tracking-tight">
                      {point.structure}
                    </h3>
                  </div>

                  <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 pl-8">
                    Ý nghĩa: {point.meaning}
                  </p>
                </div>

                <button
                  type="button"
                  className="w-8 h-8 rounded-full bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white shrink-0 transition"
                >
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {/* Nội dung chi tiết cấu trúc (Giải thích & Ví dụ) */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800/80 space-y-4 pl-0 sm:pl-8">
                  {/* Giải thích cách dùng */}
                  <div className="bg-slate-50 dark:bg-zinc-800/50 rounded-2xl p-4 border border-slate-200/60 dark:border-zinc-700/50 text-xs sm:text-sm text-slate-700 dark:text-zinc-300 leading-relaxed">
                    <div className="flex items-center space-x-2 font-bold text-slate-900 dark:text-white mb-1">
                      <Info className="w-4 h-4 text-indigo-500" />
                      <span>Cách dùng & Lưu ý:</span>
                    </div>
                    {point.explanation}
                  </div>

                  {/* Các câu ví dụ mẫu */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Câu ví dụ thực tế:</span>
                    </h4>

                    {point.examples.map((ex, exIdx) => (
                      <div
                        key={exIdx}
                        className="bg-white dark:bg-zinc-800/70 border border-slate-100 dark:border-zinc-700/60 rounded-2xl p-3.5 flex items-start justify-between gap-3 shadow-2xs hover:shadow-xs transition"
                      >
                        <div className="space-y-1">
                          <p className="text-base font-extrabold text-slate-900 dark:text-white tracking-wide">
                            {ex.ja}
                          </p>
                          {ex.kana && (
                            <p className="text-xs font-medium text-slate-400 dark:text-zinc-500">
                              {ex.kana}
                            </p>
                          )}
                          <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-zinc-300">
                            {ex.vi}
                          </p>
                        </div>

                        {/* Nút nghe phát âm câu ví dụ */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            speakJapanese(ex.ja);
                          }}
                          className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 shrink-0 transition"
                          title="Nghe phát âm"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
