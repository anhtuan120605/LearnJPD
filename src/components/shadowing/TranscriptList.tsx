import React, { useRef, useEffect } from 'react';
import { Bookmark, Flag, CheckCircle2, XCircle, Volume2, Sparkles } from 'lucide-react';
import { VideoSubtitleCue } from '../../types/shadowing';
import { FuriganaText } from './FuriganaText';

interface TranscriptListProps {
  cues: VideoSubtitleCue[];
  currentCueIndex: number;
  onSelectCue: (index: number) => void;
  showFurigana: boolean;
  onToggleFurigana: () => void;
  showTranslation: boolean;
  onToggleTranslation: () => void;
  bookmarkedCues: string[];
  onToggleBookmark: (cueId: string) => void;
  quizAnswers?: Record<string, number>;
  onSelectQuizAnswer?: (cueId: string, optionIndex: number) => void;
}

export const TranscriptList: React.FC<TranscriptListProps> = ({
  cues,
  currentCueIndex,
  onSelectCue,
  showFurigana,
  onToggleFurigana,
  showTranslation,
  onToggleTranslation,
  bookmarkedCues,
  onToggleBookmark,
  quizAnswers = {},
  onSelectQuizAnswer
}) => {
  const activeCueRef = useRef<HTMLDivElement>(null);

  // Tự động cuộn theo câu đang phát
  useEffect(() => {
    if (activeCueRef.current) {
      activeCueRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [currentCueIndex]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm overflow-hidden">
      {/* 1. Header & View Toggles */}
      <div className="p-4 sm:p-5 border-b border-stone-200/60 dark:border-stone-800 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2">
          <h3 className="text-xs sm:text-sm font-black text-stone-900 dark:text-stone-100 uppercase tracking-wider">
            Bản Chép
          </h3>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 font-bold">
            {cues.length} câu
          </span>
        </div>

        {/* Toggles */}
        <div className="flex items-center space-x-3 text-xs">
          <label className="flex items-center space-x-1.5 cursor-pointer text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 select-none">
            <input
              type="checkbox"
              checked={showFurigana}
              onChange={onToggleFurigana}
              className="rounded text-indigo-600 focus:ring-indigo-500 border-stone-300 dark:border-stone-700"
            />
            <span className="font-medium text-[11px]">Furigana</span>
          </label>

          <label className="flex items-center space-x-1.5 cursor-pointer text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 select-none">
            <input
              type="checkbox"
              checked={showTranslation}
              onChange={onToggleTranslation}
              className="rounded text-indigo-600 focus:ring-indigo-500 border-stone-300 dark:border-stone-700"
            />
            <span className="font-medium text-[11px]">Bản dịch</span>
          </label>
        </div>
      </div>

      {/* 2. Cues List */}
      <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3">
        {cues.map((cue, idx) => {
          const isActive = idx === currentCueIndex;
          const isBookmarked = bookmarkedCues.includes(cue.id);
          const userAnswer = quizAnswers[cue.id];
          const hasQuiz = Boolean(cue.options && cue.options.length > 0 && cue.correctAnswer);

          return (
            <div
              key={cue.id}
              ref={isActive ? activeCueRef : null}
              onClick={() => onSelectCue(idx)}
              className={`p-4 rounded-2xl transition-all cursor-pointer border text-left relative group ${
                isActive
                  ? 'bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-500/50 shadow-sm ring-1 ring-indigo-500/20'
                  : 'bg-stone-50/60 dark:bg-stone-800/40 border-stone-200/60 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
              }`}
            >
              {/* Cue number & Bookmark flag */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'bg-stone-200/70 dark:bg-stone-700/60 text-stone-600 dark:text-stone-300'
                  }`}>
                    #{cue.order || idx + 1}
                  </span>
                  {cue.speaker && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-200/50 dark:bg-stone-700/40 text-stone-500 dark:text-stone-400">
                      {cue.speaker}
                    </span>
                  )}
                  {cue.questionNum && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                      {cue.questionNum}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleBookmark(cue.id);
                  }}
                  title={isBookmarked ? 'Bỏ lưu câu này' : 'Lưu câu này vào sổ tay'}
                  className={`p-1.5 rounded-lg transition ${
                    isBookmarked
                      ? 'text-amber-500 bg-amber-500/10'
                      : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-200'
                  }`}
                >
                  <Flag className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Japanese Sentence with Furigana */}
              <div className="text-sm sm:text-base font-medium text-stone-900 dark:text-stone-100 leading-relaxed mb-1.5">
                <FuriganaText
                  tokens={cue.furiganaTokens}
                  fallbackText={cue.text}
                  showFurigana={showFurigana}
                />
              </div>

              {/* Vietnamese Translation */}
              {showTranslation && (
                <div className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                  {cue.vietnamese}
                </div>
              )}

              {/* JLPT Quiz Options (Nếu là câu hỏi trắc nghiệm JLPT) */}
              {hasQuiz && cue.options && onSelectQuizAnswer && (
                <div className="mt-3 pt-3 border-t border-stone-200/60 dark:border-stone-700/60 space-y-2">
                  <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    Chọn đáp án câu hỏi:
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {cue.options.map((opt, optIdx) => {
                      const optionNum = optIdx + 1;
                      const isSelected = userAnswer === optionNum;
                      const isCorrect = cue.correctAnswer === optionNum;
                      let btnStyle = 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 hover:border-indigo-400';

                      if (userAnswer !== undefined) {
                        if (isCorrect) {
                          btnStyle = 'bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold';
                        } else if (isSelected && !isCorrect) {
                          btnStyle = 'bg-rose-500/15 border-rose-500 text-rose-700 dark:text-rose-300 line-through';
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectQuizAnswer(cue.id, optionNum);
                          }}
                          className={`p-2 rounded-xl text-xs text-left border transition flex items-center justify-between ${btnStyle}`}
                        >
                          <span className="truncate">{opt}</span>
                          {userAnswer !== undefined && isCorrect && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          )}
                          {userAnswer !== undefined && isSelected && !isCorrect && (
                            <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {userAnswer !== undefined && cue.explanation && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-stone-700 dark:text-stone-300 mt-2">
                      <span className="font-bold text-amber-700 dark:text-amber-400">Giải thích: </span>
                      <span>{cue.explanation}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
