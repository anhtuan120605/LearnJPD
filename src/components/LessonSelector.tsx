import React from 'react';
import { LessonGroup } from '../types';
import { CheckCircle2, BookOpen, Layers } from 'lucide-react';
import { courseDatasets } from '../data';

interface LessonSelectorProps {
  currentCourse: string;
  onSelectCourse: (courseKey: string) => void;
  lessons: LessonGroup[];
  selectedLessonNum: number;
  onSelectLesson: (lessonNum: number) => void;
  masteredWords: string[];
}

export const LessonSelector: React.FC<LessonSelectorProps> = ({
  currentCourse,
  onSelectCourse,
  lessons,
  selectedLessonNum,
  onSelectLesson,
  masteredWords
}) => {
  const courseList = Object.entries(courseDatasets).map(([key, data]) => ({
    key,
    name: data.name,
    badge: data.badge,
    count: data.lessons.length,
    description: data.description
  }));

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
      {/* 1. Menu bên ngoài: Chọn Tập Giáo trình Minna no Nihongo & Cấp độ */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500 flex items-center space-x-1.5">
            <BookOpen className="w-4 h-4 text-rose-500" />
            <span>1. Chọn Tập Giáo Trình / Cấp Độ:</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
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

      {/* 2. Menu bên trong: Danh sách từng bài học của tập đó */}
      <div className="pt-4 border-t border-slate-100 dark:border-zinc-800">
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500 flex items-center space-x-1.5">
            <Layers className="w-4 h-4 text-emerald-500" />
            <span>2. Chọn Bài Học ({lessons.length} bài):</span>
          </label>
          <span className="text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/40 px-3 py-1 rounded-full">
            Đang mở: Bài {selectedLessonNum}
          </span>
        </div>

        {/* Thanh cuộn danh sách các bài học */}
        <div className="flex items-center space-x-2.5 overflow-x-auto pb-2 scrollbar-thin">
          {lessons.map((l) => {
            const isSelected = selectedLessonNum === l.lesson;
            const masteredInLesson = l.words.filter(w => masteredWords.includes(w.id)).length;
            const isFullMastered = l.words.length > 0 && masteredInLesson === l.words.length;

            return (
              <button
                key={l.lesson}
                onClick={() => onSelectLesson(l.lesson)}
                className={`flex-shrink-0 flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold border transition ${
                  isSelected
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-md'
                    : 'bg-slate-50 dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700/60 text-slate-600 dark:text-zinc-300 hover:border-rose-400'
                }`}
              >
                {isFullMastered && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />
                )}
                <span>Bài {l.lesson}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold ${
                  isSelected ? 'bg-white/20 dark:bg-slate-900/20' : 'bg-slate-200 dark:bg-zinc-700 text-slate-500 dark:text-zinc-400'
                }`}>
                  {masteredInLesson}/{l.words.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
