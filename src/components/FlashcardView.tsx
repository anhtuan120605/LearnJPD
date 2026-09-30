import React, { useState } from 'react';
import { WordItem } from '../types';
import { Volume2, Star, CheckCircle, RotateCw, ChevronLeft, ChevronRight, Eye, EyeOff, Sparkles } from 'lucide-react';
import { speakJapanese } from '../lib/audio';

interface FlashcardViewProps {
  words: WordItem[];
  masteredWords: string[];
  favoriteWords: string[];
  onToggleMaster: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export const FlashcardView: React.FC<FlashcardViewProps> = ({
  words,
  masteredWords,
  favoriteWords,
  onToggleMaster,
  onToggleFavorite
}) => {
  const sessionKey = React.useMemo(() => {
    if (!words || words.length === 0) return 'learn_jpd_flashcard_idx';
    return `learn_jpd_flashcard_${words.length}_${words[0]?.id}`;
  }, [words]);

  const [currentIndex, setCurrentIndex] = useState(() => {
    try {
      const saved = localStorage.getItem(sessionKey);
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed < (words?.length || 0)) {
          return parsed;
        }
      }
    } catch {}
    return 0;
  });

  const [isFlipped, setIsFlipped] = useState(false);

  // Lưu thẻ hiện tại khi người dùng chuyển thẻ
  React.useEffect(() => {
    try {
      localStorage.setItem(sessionKey, currentIndex.toString());
    } catch {}
  }, [currentIndex, sessionKey]);

  if (!words || words.length === 0) {
    return (
      <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-8 shadow-sm">
        <p className="text-slate-500 dark:text-zinc-400">Không có từ vựng nào trong danh sách này.</p>
      </div>
    );
  }

  const currentWord = words[currentIndex];
  const isMastered = masteredWords.includes(currentWord.id);
  const isFavorite = favoriteWords.includes(currentWord.id);

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % words.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + words.length) % words.length);
  };

  const handlePlayAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    speakJapanese(currentWord.kana || currentWord.kanji);
  };

  return (
    <div className="max-w-xl mx-auto flex flex-col items-center">
      {/* Top Controls / Counter */}
      <div className="w-full flex items-center justify-between mb-4 text-sm font-semibold text-slate-500 dark:text-zinc-400">
        <span className="bg-slate-100 dark:bg-zinc-800 px-3 py-1 rounded-full text-xs font-bold text-rose-600 dark:text-rose-400">
          Bài {currentWord.lesson} ({currentWord.level})
        </span>
        <span>
          Thẻ <span className="text-slate-900 dark:text-white font-extrabold">{currentIndex + 1}</span> / {words.length}
        </span>
      </div>

      {/* 3D Flip Card Container */}
      <div 
        onClick={() => setIsFlipped(!isFlipped)}
        className="w-full h-80 sm:h-96 perspective-1000 cursor-pointer select-none group"
      >
        <div 
          className={`w-full h-full relative duration-500 transform-style-3d transition-transform ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* Mặt trước của Thẻ (Front) */}
          <div className="absolute inset-0 backface-hidden rounded-3xl bg-white dark:bg-zinc-900 border-2 border-slate-200 dark:border-zinc-800 shadow-xl p-8 flex flex-col justify-between items-center group-hover:border-rose-300 dark:group-hover:border-rose-900/50 transition-all">
            {/* Header mặt trước: Nút Loa & Nút Sao */}
            <div className="w-full flex items-center justify-between">
              <button
                onClick={handlePlayAudio}
                className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:scale-110 active:scale-95 transition"
                title="Nghe phát âm"
              >
                <Volume2 className="w-5 h-5" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(currentWord.id);
                }}
                className={`p-2.5 rounded-2xl transition ${
                  isFavorite 
                    ? 'bg-amber-500/10 text-amber-500' 
                    : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-zinc-800'
                }`}
              >
                <Star className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Kanji & Furigana trung tâm */}
            <div className="text-center my-auto">
              <p className="text-sm font-medium text-slate-400 dark:text-zinc-500 tracking-wider mb-2">
                {currentWord.kana}
              </p>
              <h2 className="text-5xl sm:text-6xl font-jp font-bold text-slate-900 dark:text-white tracking-wide">
                {currentWord.kanji || currentWord.kana}
              </h2>
              {currentWord.romaji && (
                <p className="text-xs font-mono text-slate-400 dark:text-zinc-500 mt-3 uppercase tracking-widest">
                  [{currentWord.romaji}]
                </p>
              )}
            </div>

            {/* Hint chạm lật thẻ */}
            <div className="flex items-center space-x-1 text-xs text-slate-400 dark:text-zinc-500">
              <RotateCw className="w-3.5 h-3.5" />
              <span>Chạm hoặc bấm Space để lật nghĩa</span>
            </div>
          </div>

          {/* Mặt sau của Thẻ (Back) */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-3xl bg-gradient-to-b from-white to-slate-50 dark:from-zinc-900 dark:to-zinc-950 border-2 border-rose-200 dark:border-rose-900/40 shadow-xl p-8 flex flex-col justify-between items-center">
            {/* Header mặt sau */}
            <div className="w-full flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                  {currentWord.hanviet ? `HÁN VIỆT: ${currentWord.hanviet}` : 'TỪ VỰNG'}
                </span>
              </div>
              <button
                onClick={handlePlayAudio}
                className="p-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            {/* Nghĩa trung tâm */}
            <div className="text-center my-auto px-4 w-full space-y-3">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-snug">
                {currentWord.meaning}
              </h3>
              {currentWord.meaning_en && (
                <p className="text-xs text-slate-400 dark:text-zinc-500 italic">
                  EN: {currentWord.meaning_en}
                </p>
              )}

              {/* Câu ví dụ ngữ pháp & Kaiwa thông dụng */}
              {currentWord.examples && currentWord.examples.length > 0 && (
                <div 
                  onClick={(e) => e.stopPropagation()} 
                  className="mt-3 text-left bg-purple-50/80 dark:bg-zinc-800/80 border border-purple-100 dark:border-zinc-700/60 p-3 sm:p-4 rounded-2xl space-y-1.5 shadow-xs"
                >
                  <div className="flex items-center justify-between text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                    <span className="flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Ví dụ ngữ pháp & Kaiwa bài này:</span>
                    </span>
                    <button
                      onClick={() => speakJapanese(currentWord.examples![0].ja || currentWord.examples![0].kana || '')}
                      className="p-1 rounded-lg text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition"
                      title="Phát âm câu ví dụ"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="font-jp text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100">
                    {currentWord.examples[0].ja}
                  </p>
                  {currentWord.examples[0].kana && currentWord.examples[0].kana !== currentWord.examples[0].ja && (
                    <p className="text-[11px] font-mono text-slate-400 dark:text-zinc-500">
                      {currentWord.examples[0].kana}
                    </p>
                  )}
                  <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-zinc-300">
                    👉 {currentWord.examples[0].vi}
                  </p>
                </div>
              )}
            </div>

            {/* Đánh dấu đã thuộc */}
            <div className="w-full pt-4 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                {isMastered ? 'Đã ghi nhận thuộc' : 'Chưa thuộc'}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleMaster(currentWord.id);
                }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  isMastered
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-emerald-50 hover:text-emerald-600'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                <span>{isMastered ? 'Đã thuộc ✓' : 'Đánh dấu thuộc'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Buttons */}
      <div className="w-full flex items-center justify-between mt-6 px-2">
        <button
          onClick={handlePrev}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-200 font-bold text-sm shadow-sm hover:bg-slate-50 dark:hover:bg-zinc-800 active:scale-95 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Thẻ trước</span>
        </button>

        <button
          onClick={() => onToggleMaster(currentWord.id)}
          className={`px-4 py-2.5 rounded-2xl font-bold text-sm transition ${
            isMastered 
              ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
              : 'bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/20'
          }`}
        >
          {isMastered ? '✓ Đã thuộc' : 'Thuộc từ này'}
        </button>

        <button
          onClick={handleNext}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-200 font-bold text-sm shadow-sm hover:bg-slate-50 dark:hover:bg-zinc-800 active:scale-95 transition"
        >
          <span>Thẻ tiếp</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
