import React, { useState, useEffect, useMemo } from 'react';
import { 
  Check, 
  RotateCcw, 
  SkipBack, 
  SkipForward, 
  Play, 
  Pause, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  Volume2, 
  HelpCircle,
  AlertCircle,
  CheckCircle2,
  Keyboard,
  Shuffle
} from 'lucide-react';
import { VideoSubtitleCue } from '../../types/shadowing';
import { DiffHighlighter, calculateAccuracy, cleanJapaneseText } from './DiffHighlighter';

interface DictationPanelProps {
  currentCue: VideoSubtitleCue;
  cueIndex: number;
  totalCues: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReplayCue: () => void;
  onPrevCue: () => void;
  onNextCue: () => void;
  autoPause: boolean;
  onToggleAutoPause: () => void;
  speed: number;
  onChangeSpeed: () => void;
  replayCount: number;
  onCompleteCue?: (cueId: string, result: { mistakeCount: number; replayCount: number; isCorrect: boolean }) => void;
}

export const DictationPanel: React.FC<DictationPanelProps> = ({
  currentCue,
  cueIndex,
  totalCues,
  isPlaying,
  onTogglePlay,
  onReplayCue,
  onPrevCue,
  onNextCue,
  autoPause,
  onToggleAutoPause,
  speed,
  onChangeSpeed,
  replayCount,
  onCompleteCue
}) => {
  const [subMode, setSubMode] = useState<'type' | 'scramble'>('type');
  const [typedInput, setTypedInput] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [revealedHints, setRevealedHints] = useState<number[]>([]);
  
  // State cho chế độ Ghép câu (Scramble)
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);

  // Tách từ cho gợi ý (Hints)
  const hintWords = useMemo(() => {
    if (currentCue.words && currentCue.words.length > 0) {
      return currentCue.words;
    }
    return currentCue.text.split(/([、。!?\s]+)/).filter(w => w.trim().length > 0);
  }, [currentCue]);

  // Reset trạng thái khi đổi câu
  useEffect(() => {
    setTypedInput('');
    setIsChecked(false);
    setRevealedHints([]);
    setSelectedWords([]);

    // Xáo trộn từ cho chế độ ghép câu
    const wordsToShuffle = currentCue.words && currentCue.words.length > 0
      ? [...currentCue.words]
      : currentCue.text.split('').filter(c => c.trim().length > 0);

    // Shuffle mảng
    const shuffled = [...wordsToShuffle].sort(() => Math.random() - 0.5);
    setAvailableWords(shuffled);
  }, [currentCue.id]);

  // Kiểm tra đáp án
  const accuracy = useMemo(() => {
    const answer = subMode === 'type' ? typedInput : selectedWords.join('');
    return calculateAccuracy(answer, currentCue.text, currentCue.kana);
  }, [typedInput, selectedWords, currentCue, subMode]);

  const handleCheckAnswer = () => {
    setIsChecked(true);
    if (!accuracy.isMatched) {
      setMistakeCount(prev => prev + 1);
    } else {
      if (onCompleteCue) {
        onCompleteCue(currentCue.id, {
          mistakeCount,
          replayCount,
          isCorrect: true
        });
      }
    }
  };

  const handleNext = () => {
    onNextCue();
  };

  const toggleRevealHint = (index: number) => {
    setRevealedHints(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  // Xử lý bấm chọn từ trong chế độ ghép câu
  const handlePickWord = (word: string, indexInAvailable: number) => {
    setSelectedWords(prev => [...prev, word]);
    setAvailableWords(prev => prev.filter((_, i) => i !== indexInAvailable));
    setIsChecked(false);
  };

  const handleRemoveWord = (word: string, indexInSelected: number) => {
    setSelectedWords(prev => prev.filter((_, i) => i !== indexInSelected));
    setAvailableWords(prev => [...prev, word]);
    setIsChecked(false);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm p-4 sm:p-6 overflow-y-auto">
      {/* 1. Header & Controls */}
      <div className="flex items-center justify-between pb-3.5 border-b border-stone-200/60 dark:border-stone-800 mb-4">
        <div>
          <h3 className="text-sm sm:text-base font-black text-stone-900 dark:text-stone-100 uppercase tracking-wider flex items-center gap-2">
            <span>Chép Chính Tả</span>
            <span className="text-xs font-mono font-bold text-stone-400">
              #{cueIndex + 1}/{totalCues}
            </span>
          </h3>
        </div>

        {/* Tự ngắt câu switch */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-stone-500 dark:text-stone-400 select-none">
            Tự ngắt câu
          </span>
          <button
            type="button"
            onClick={onToggleAutoPause}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${
              autoPause ? 'bg-indigo-600' : 'bg-stone-300 dark:bg-stone-700'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                autoPause ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 2. Mini Controller Bar */}
      <div className="flex items-center justify-between p-2 rounded-2xl bg-stone-100 dark:bg-stone-800/60 mb-4">
        <div className="flex items-center space-x-1 sm:space-x-2">
          <button
            onClick={onPrevCue}
            title="Câu trước"
            className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-700 transition"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={onReplayCue}
            title="Nghe lại câu này"
            className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-700 transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onTogglePlay}
            title={isPlaying ? 'Tạm dừng' : 'Phát'}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
          <button
            onClick={onNextCue}
            title="Câu tiếp theo"
            className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-700 transition"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={onChangeSpeed}
          className="px-2.5 py-1 text-xs font-mono font-bold text-stone-600 dark:text-stone-300 bg-white dark:bg-stone-700 rounded-lg hover:bg-stone-50 transition"
        >
          ⚡ {speed}x
        </button>
      </div>

      {/* 3. Submode Switch: [Gõ chính tả] | [Ghép câu] */}
      <div className="grid grid-cols-2 gap-2 mb-4 p-1 rounded-2xl bg-stone-100 dark:bg-stone-800/80">
        <button
          onClick={() => {
            setSubMode('type');
            setIsChecked(false);
          }}
          className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            subMode === 'type'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
          }`}
        >
          <Keyboard className="w-3.5 h-3.5" />
          <span>Gõ chính tả</span>
        </button>
        <button
          onClick={() => {
            setSubMode('scramble');
            setIsChecked(false);
          }}
          className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            subMode === 'scramble'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
          }`}
        >
          <Shuffle className="w-3.5 h-3.5" />
          <span>Ghép câu</span>
        </button>
      </div>

      {/* 4. Main Input Area */}
      <div className="space-y-3 mb-4">
        {subMode === 'type' ? (
          <div>
            <label className="text-xs font-bold text-stone-500 dark:text-stone-400 mb-1.5 block uppercase tracking-wider">
              Gõ những gì bạn nghe được:
            </label>
            <textarea
              value={typedInput}
              onChange={(e) => {
                setTypedInput(e.target.value);
                if (isChecked) setIsChecked(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (!isChecked) {
                    handleCheckAnswer();
                  } else {
                    handleNext();
                  }
                }
              }}
              placeholder="Gõ câu trả lời của bạn tại đây (có thể gõ Hiragana hoặc Kanji)..."
              rows={3}
              className="w-full p-3.5 text-sm sm:text-base font-jp rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition resize-none leading-relaxed"
            />
          </div>
        ) : (
          <div>
            <label className="text-xs font-bold text-stone-500 dark:text-stone-400 mb-1.5 block uppercase tracking-wider">
              Bấm chọn thẻ từ để ghép thành câu:
            </label>
            
            {/* Box chứa các từ đã chọn */}
            <div className="min-h-[70px] p-3 rounded-2xl border-2 border-dashed border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/40 flex flex-wrap gap-2 items-center mb-3">
              {selectedWords.length === 0 ? (
                <span className="text-xs text-stone-400 dark:text-stone-500 italic">
                  Chạm vào các thẻ từ bên dưới để đưa lên đây...
                </span>
              ) : (
                selectedWords.map((word, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleRemoveWord(word, idx)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-rose-600 text-white font-jp text-sm font-bold shadow-xs transition active:scale-95 group"
                  >
                    <span>{word}</span>
                    <span className="ml-1 text-xs opacity-70 group-hover:opacity-100">✕</span>
                  </button>
                ))
              )}
            </div>

            {/* Danh sách thẻ từ sẵn có để chọn */}
            <div className="flex flex-wrap gap-2">
              {availableWords.map((word, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePickWord(word, idx)}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-stone-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 font-jp text-sm font-medium shadow-2xs transition active:scale-95"
                >
                  {word}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Gợi ý (Hints with Eye icon) */}
        <div>
          <div className="text-[11px] font-bold text-stone-400 dark:text-stone-500 mb-1.5 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Gợi ý từng từ (nhấp vào biểu tượng con mắt để xem):</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {hintWords.map((word, idx) => {
              const isRevealed = revealedHints.includes(idx);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleRevealHint(idx)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-jp transition flex items-center gap-1 border ${
                    isRevealed
                      ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 font-bold'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-500 border-stone-200 dark:border-stone-700 hover:border-stone-400'
                  }`}
                >
                  {isRevealed ? <Eye className="w-3 h-3 text-amber-500" /> : <EyeOff className="w-3 h-3 text-stone-400" />}
                  <span>{isRevealed ? word : '...'}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. Diff Highlighter & Result view */}
      {isChecked && (
        <div className="mb-4 animate-fade-in">
          <DiffHighlighter
            userAnswer={subMode === 'type' ? typedInput : selectedWords.join('')}
            targetText={currentCue.text}
            targetKana={currentCue.kana}
          />
        </div>
      )}

      {/* 6. Action Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          type="button"
          onClick={handleCheckAnswer}
          className="py-3 px-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-stone-900 font-black text-xs sm:text-sm uppercase tracking-wider shadow-sm transition active:scale-95 flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4 stroke-[3]" />
          <span>Kiểm Tra Đáp Án</span>
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-sm transition active:scale-95 flex items-center justify-center gap-2"
        >
          <span>Tiếp Theo</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 7. Stats Card */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60 text-center">
          <div className="text-[11px] font-bold text-stone-400 uppercase">Lỗi sai</div>
          <div className={`text-base font-black mt-0.5 ${mistakeCount > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
            {mistakeCount}
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60 text-center">
          <div className="text-[11px] font-bold text-stone-400 uppercase">Lượt phát lại</div>
          <div className="text-base font-black text-indigo-600 dark:text-indigo-400 mt-0.5 font-mono">
            {replayCount}
          </div>
        </div>
      </div>

      {/* 8. Lý do / Hướng dẫn */}
      <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-800 text-xs text-stone-500 dark:text-stone-400 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-stone-700 dark:text-stone-300">Lưu ý: </span>
          <span>
            {currentCue.notes || 'Hãy bắt đầu nghe và gõ lại câu bạn nghe được. Bạn có thể nhấn Enter để kiểm tra nhanh.'}
          </span>
        </div>
      </div>
    </div>
  );
};
