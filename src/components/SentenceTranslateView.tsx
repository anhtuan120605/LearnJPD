import React, { useState, useMemo } from 'react';
import { WordItem } from '../types';
import { Volume2, CheckCircle2, RotateCcw, ArrowRight, Sparkles } from 'lucide-react';
import { speakJapanese } from '../lib/audio';

interface SentenceTranslateViewProps {
  words: WordItem[];
}

export const SentenceTranslateView: React.FC<SentenceTranslateViewProps> = ({ words }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const currentWord = words[currentIdx] || words[0];
  const example = currentWord?.examples?.[0];

  // Nếu có câu ví dụ, dùng câu ví dụ để dịch, nếu không dùng từ vựng
  const targetJa = example ? example.ja : (currentWord?.kanji || currentWord?.kana || '');
  const targetMeaning = example ? example.vi : (currentWord?.meaning || '');
  const targetAudio = example ? (example.ja || example.kana || '') : (currentWord?.kana || currentWord?.kanji || '');

  // Phân tách câu thành các mảnh từ (Tokens)
  const { correctTokens, shuffledTokens } = useMemo(() => {
    let tokens: string[] = [];

    if (example && example.ja) {
      // Tách câu theo dấu cách hoặc phân đoạn từ
      if (example.ja.includes(' ')) {
        tokens = example.ja.split(/\s+/).filter(Boolean);
      } else {
        // Tách câu theo cụm ngữ pháp cơ bản (trợ từ hoặc dấu câu)
        tokens = example.ja.split(/(?<=[はをにでへとがも、。]|です|ます)/g).filter(Boolean);
      }
    } else {
      tokens = (currentWord?.kana || '').split('');
    }

    if (tokens.length <= 1) {
      tokens = (currentWord?.kana || '').split('');
    }

    // Các mảnh nhiễu
    const distractors = ['は', 'を', 'に', 'です', 'でした'];
    const fakeTokens = distractors.filter(d => !tokens.includes(d)).slice(0, 2);

    const all = [...tokens, ...fakeTokens].sort(() => 0.5 - Math.random());

    return {
      correctTokens: tokens,
      shuffledTokens: all,
    };
  }, [currentIdx, example, currentWord]);

  const handleSelectToken = (token: string, tokenIndex: number) => {
    if (isAnswered) return;
    setSelectedTokens(prev => [...prev, token]);
  };

  const handleRemoveToken = (index: number) => {
    if (isAnswered) return;
    setSelectedTokens(prev => prev.filter((_, i) => i !== index));
  };

  const handleCheck = () => {
    const userStr = selectedTokens.join('');
    const cleanTarget = targetJa.replace(/\s+/g, '');
    const cleanUser = userStr.replace(/\s+/g, '');

    const right = cleanUser === cleanTarget;
    setIsCorrect(right);
    setIsAnswered(true);
    speakJapanese(targetAudio);
  };

  const handleNext = () => {
    setSelectedTokens([]);
    setIsAnswered(false);
    setIsCorrect(false);
    setCurrentIdx(prev => (prev + 1) % words.length);
  };

  const handleReset = () => {
    setSelectedTokens([]);
    setIsAnswered(false);
    setIsCorrect(false);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex items-center justify-between text-xs font-bold text-slate-400">
        <span className="flex items-center space-x-1.5">
          <Sparkles className="w-3.5 h-3.5 text-purple-500" />
          <span>Chế độ Dịch câu • Câu {currentIdx + 1}/{words.length}</span>
        </span>
        <button 
          onClick={() => speakJapanese(targetAudio)}
          className="p-1.5 rounded-lg text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 transition"
          title="Nghe phát âm"
        >
          <Volume2 className="w-4 h-4" />
        </button>
      </div>

      {/* Hiển thị nghĩa tiếng Việt của câu hoặc từ cần dịch */}
      <div className="text-center py-4 border-b border-slate-100 dark:border-zinc-800 space-y-1">
        <span className="text-[11px] text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider">
          {example ? 'Hãy dịch câu sau sang tiếng Nhật:' : 'Nghĩa tiếng Việt:'}
        </span>
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
          {targetMeaning}
        </h3>
        {example && (
          <p className="text-xs text-slate-400 dark:text-zinc-500 pt-1">
            Từ vựng trọng tâm: <strong className="text-rose-500">{currentWord.kanji || currentWord.kana}</strong> ({currentWord.meaning})
          </p>
        )}
      </div>

      {/* Khu vực ghép từ của người học */}
      <div className="min-h-20 p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border-2 border-dashed border-slate-200 dark:border-zinc-700 flex flex-wrap items-center justify-center gap-2">
        {selectedTokens.length === 0 ? (
          <span className="text-xs text-slate-400 font-medium">Bấm chọn các khối từ bên dưới để ghép thành câu hoàn chỉnh</span>
        ) : (
          selectedTokens.map((t, idx) => (
            <button
              key={idx}
              onClick={() => handleRemoveToken(idx)}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-700 text-slate-900 dark:text-white font-jp font-bold shadow-xs hover:border-purple-400 border border-slate-200 dark:border-zinc-600 transition active:scale-95"
            >
              {t}
            </button>
          ))
        )}
      </div>

      {/* Các mảnh từ để chọn */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
        {shuffledTokens.map((tok, idx) => (
          <button
            key={idx}
            disabled={isAnswered}
            onClick={() => handleSelectToken(tok, idx)}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-jp font-bold text-sm shadow-xs transition active:scale-95 disabled:opacity-50"
          >
            {tok}
          </button>
        ))}
      </div>

      {/* Hành động kiểm tra & Kết quả */}
      {isAnswered ? (
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 dark:border-zinc-800 gap-3">
          <div className="text-left">
            <span className={`text-sm font-bold block ${isCorrect ? 'text-emerald-500' : 'text-rose-500'}`}>
              {isCorrect ? '✓ Chính xác tuyệt đối!' : '✕ Chưa chính xác!'}
            </span>
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-jp">
              Đáp án: <strong className="text-slate-800 dark:text-zinc-200">{targetJa}</strong>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {!isCorrect && (
              <button
                onClick={handleReset}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 font-bold text-xs flex items-center space-x-1 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Thử lại</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-purple-600/20 transition active:scale-95"
            >
              <span>Câu tiếp theo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <button
            onClick={handleReset}
            disabled={selectedTokens.length === 0}
            className="p-3 rounded-2xl border border-slate-200 dark:border-zinc-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-40 transition"
            title="Làm lại"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleCheck}
            disabled={selectedTokens.length === 0}
            className="flex-1 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md shadow-purple-600/20 disabled:opacity-50 transition"
          >
            Kiểm tra câu dịch
          </button>
        </div>
      )}
    </div>
  );
};
