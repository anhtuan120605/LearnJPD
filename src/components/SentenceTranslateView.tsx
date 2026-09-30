import React, { useState, useMemo, useRef, useEffect } from 'react';
import { WordItem } from '../types';
import { Volume2, CheckCircle2, RotateCcw, ArrowRight, Sparkles, Keyboard, Layers, Lightbulb, ChevronRight, Check } from 'lucide-react';
import { speakJapanese } from '../lib/audio';
import * as wanakana from 'wanakana';

interface SentenceTranslateViewProps {
  words: WordItem[];
}

export const SentenceTranslateView: React.FC<SentenceTranslateViewProps> = ({ words }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  
  // Chế độ nhập: 'token' (Ghép thẻ từ) | 'romaji' (Gõ bàn phím Romaji)
  const [inputMode, setInputMode] = useState<'token' | 'romaji'>('token');

  // Trạng thái cho chế độ ghép thẻ
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);

  // Trạng thái cho chế độ gõ Romaji
  const [romajiInput, setRomajiInput] = useState<string>('');
  
  // Số từ được gợi ý từng bước (bấm 1 lần hiện 1 từ, tiếp tục bấm để hiện các từ tiếp theo cho đến hết câu)
  const [revealedHintWords, setRevealedHintWords] = useState<number>(0);
  
  const inputRef = useRef<HTMLInputElement>(null);

  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const currentWord = words[currentIdx] || words[0];
  const example = currentWord?.examples?.[0];

  // Mục tiêu câu cần dịch
  const targetJa = example ? example.ja : (currentWord?.kanji || currentWord?.kana || '');
  const targetKana = example ? (example.kana || example.ja) : (currentWord?.kana || currentWord?.kanji || '');
  const targetMeaning = example ? example.vi : (currentWord?.meaning || '');
  const targetAudio = example ? (example.ja || example.kana || '') : (currentWord?.kana || currentWord?.kanji || '');
  
  // Romaji chuẩn của câu đích
  const targetRomaji = useMemo(() => {
    return wanakana.toRomaji(targetKana || targetJa);
  }, [targetKana, targetJa]);

  // Tách câu thành danh sách từng từ Romaji
  const romajiWords = useMemo(() => {
    return targetRomaji.trim().split(/\s+/).filter(Boolean);
  }, [targetRomaji]);

  // Tách câu tiếng Nhật thành các cụm từ chuẩn
  const correctTokens = useMemo(() => {
    if (example && example.ja) {
      if (example.ja.includes(' ')) {
        return example.ja.split(/\s+/).filter(Boolean);
      } else {
        return example.ja.split(/(?<=[はをにでへとがも、。]|です|ます)/g).filter(Boolean);
      }
    }
    return (currentWord?.kana || '').split('');
  }, [example, currentWord]);

  // Tự động focus vào ô input khi chuyển sang chế độ Romaji hoặc chuyển câu
  useEffect(() => {
    if (inputMode === 'romaji' && !isAnswered) {
      inputRef.current?.focus();
    }
  }, [inputMode, currentIdx, isAnswered]);

  // Phân tách câu thành các mảnh từ (Tokens) ngẫu nhiên cho chế độ ghép thẻ
  const { shuffledTokens } = useMemo(() => {
    let tokens = [...correctTokens];
    if (tokens.length <= 1) {
      tokens = (currentWord?.kana || '').split('');
    }

    // Các mảnh từ nhiễu
    const distractors = ['は', 'を', 'に', 'です', 'でした', 'も', 'が'];
    const fakeTokens = distractors.filter(d => !tokens.includes(d)).slice(0, 2);
    const all = [...tokens, ...fakeTokens].sort(() => 0.5 - Math.random());

    return {
      shuffledTokens: all,
    };
  }, [correctTokens, currentWord]);

  // Chuẩn hóa chuỗi Romaji để đối chiếu thông minh
  const normalizeRomaji = (s: string) => {
    return s
      .toLowerCase()
      .replace(/[.,!?。、\s\-~_]/g, '')
      .replace(/ha/g, 'wa')
      .replace(/wo/g, 'o')
      .replace(/nn/g, 'n')
      .replace(/oo/g, 'o')
      .replace(/ou/g, 'o')
      .replace(/uu/g, 'u')
      .replace(/aa/g, 'a')
      .replace(/ii/g, 'i')
      .replace(/ee/g, 'e');
  };

  const normalizeKana = (s: string) => {
    return s
      .replace(/[.,!?。、\s\-~_]/g, '')
      .replace(/は/g, 'わ')
      .replace(/を/g, 'お');
  };

  // Xử lý chọn thẻ
  const handleSelectToken = (token: string) => {
    if (isAnswered) return;
    setSelectedTokens(prev => [...prev, token]);
  };

  const handleRemoveToken = (index: number) => {
    if (isAnswered) return;
    setSelectedTokens(prev => prev.filter((_, i) => i !== index));
  };

  // Chức năng gợi ý từng từ một cho đến hết
  const handleRevealNextHint = () => {
    const totalWords = inputMode === 'romaji' ? romajiWords.length : correctTokens.length;
    setRevealedHintWords(prev => Math.min(prev + 1, totalWords));
  };

  // Mở toàn bộ từ trong câu cùng lúc
  const handleRevealAllHints = () => {
    const totalWords = inputMode === 'romaji' ? romajiWords.length : correctTokens.length;
    setRevealedHintWords(totalWords);
  };

  // Ẩn gợi ý
  const handleHideHint = () => {
    setRevealedHintWords(0);
  };

  // Điền các từ đã gợi ý vào ô gõ Romaji
  const handleFillRevealedToInput = () => {
    if (revealedHintWords === 0) return;
    const revealedText = romajiWords.slice(0, revealedHintWords).join(' ');
    setRomajiInput(revealedText + ' ');
    inputRef.current?.focus();
  };

  // Kiểm tra đáp án
  const handleCheck = () => {
    let right = false;

    if (inputMode === 'token') {
      const userStr = selectedTokens.join('');
      const cleanTarget = targetJa.replace(/[\s。、]/g, '');
      const cleanUser = userStr.replace(/[\s。、]/g, '');
      right = cleanUser === cleanTarget;
    } else {
      const normInput = normalizeRomaji(romajiInput);
      const normTargetRomaji = normalizeRomaji(targetRomaji);

      if (normInput && normInput === normTargetRomaji) {
        right = true;
      } else {
        const userHira = wanakana.toHiragana(romajiInput);
        const normUserHira = normalizeKana(userHira);
        const normTargetKana = normalizeKana(targetKana || targetJa);
        right = normUserHira === normTargetKana;
      }
    }

    setIsCorrect(right);
    setIsAnswered(true);
    speakJapanese(targetAudio);
  };

  const handleNext = () => {
    setSelectedTokens([]);
    setRomajiInput('');
    setRevealedHintWords(0);
    setIsAnswered(false);
    setIsCorrect(false);
    setCurrentIdx(prev => (prev + 1) % words.length);
  };

  const handleReset = () => {
    setSelectedTokens([]);
    setRomajiInput('');
    setRevealedHintWords(0);
    setIsAnswered(false);
    setIsCorrect(false);
    if (inputMode === 'romaji') {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  // Xem trước chuyển đổi Hiragana theo thời gian thực khi gõ Romaji
  const liveHiraganaPreview = useMemo(() => {
    if (!romajiInput) return '';
    return wanakana.toHiragana(romajiInput);
  }, [romajiInput]);

  const totalWords = inputMode === 'romaji' ? romajiWords.length : correctTokens.length;

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header & Thanh chuyển đổi chế độ nhập */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-bold text-slate-400">
        <span className="flex items-center space-x-1.5">
          <Sparkles className="w-3.5 h-3.5 text-purple-500" />
          <span>Luyện dịch câu • Câu {currentIdx + 1}/{words.length}</span>
        </span>

        {/* Nút chuyển đổi: Ghép thẻ vs Gõ Romaji */}
        <div className="flex items-center space-x-1 p-1 bg-slate-100 dark:bg-zinc-800 rounded-xl">
          <button
            onClick={() => {
              setInputMode('token');
              setIsAnswered(false);
              setRevealedHintWords(0);
            }}
            className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 text-xs font-bold transition ${
              inputMode === 'token'
                ? 'bg-white dark:bg-zinc-700 text-purple-600 dark:text-purple-300 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Ghép thẻ từ</span>
          </button>

          <button
            onClick={() => {
              setInputMode('romaji');
              setIsAnswered(false);
              setRevealedHintWords(0);
            }}
            className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 text-xs font-bold transition ${
              inputMode === 'romaji'
                ? 'bg-white dark:bg-zinc-700 text-purple-600 dark:text-purple-300 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>Gõ Romaji</span>
          </button>
        </div>
      </div>

      {/* Hiển thị câu tiếng Việt cần dịch */}
      <div className="text-center py-4 border-b border-slate-100 dark:border-zinc-800 space-y-2">
        <span className="text-[11px] text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider">
          {example ? 'Hãy dịch câu sau sang tiếng Nhật:' : 'Nghĩa tiếng Việt:'}
        </span>
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
          {targetMeaning}
        </h3>
        {example && (
          <p className="text-xs text-slate-400 dark:text-zinc-500 pt-1">
            Từ trọng tâm: <strong className="text-rose-500 font-jp">{currentWord.kanji || currentWord.kana}</strong> ({currentWord.meaning})
          </p>
        )}
      </div>

      {/* PHẦN 1: CHẾ ĐỘ GHÉP THẺ TỪ */}
      {inputMode === 'token' && (
        <div className="space-y-4">
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

          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            {shuffledTokens.map((tok, idx) => (
              <button
                key={idx}
                disabled={isAnswered}
                onClick={() => handleSelectToken(tok)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-jp font-bold text-sm shadow-xs transition active:scale-95 disabled:opacity-50"
              >
                {tok}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* PHẦN 2: CHẾ ĐỘ TỰ GÕ BÀN PHÍM ROMAJI (CÓ VẠCH GẠCH CHÂN TỪNG TỪ NHƯ NHỒI NHÉT) */}
      {inputMode === 'romaji' && (
        <div className="space-y-4">
          {/* Bảng vạch gạch chân từng từ trong câu chuẩn kiểu nhồi nhét */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border-2 border-dashed border-slate-200 dark:border-zinc-700 select-none">
            <div className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider text-center mb-3">
              Các từ trong câu ({romajiWords.length} từ)
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              {romajiWords.map((targetWord, idx) => {
                const userWord = romajiInput.trim().split(/\s+/).filter(Boolean)[idx] || '';
                const isRevealed = idx < revealedHintWords;
                const displayWord = userWord || (isRevealed ? targetWord : '');
                const isFilled = Boolean(userWord);
                const isHintOnly = !userWord && isRevealed;

                return (
                  <div key={idx} className="flex flex-col items-center min-w-[65px] max-w-[150px] px-1.5">
                    {/* Phần chữ hiển thị (Hiragana + Romaji) */}
                    <div className="h-11 flex flex-col items-center justify-end pb-1">
                      {displayWord ? (
                        <>
                          <span className="text-[11px] font-jp font-bold text-purple-600 dark:text-purple-400 animate-fadeIn">
                            {wanakana.toHiragana(displayWord)}
                          </span>
                          <span className={`text-sm sm:text-base font-mono font-bold leading-tight animate-fadeIn ${
                            isHintOnly
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-slate-900 dark:text-white'
                          }`}>
                            {displayWord}
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400 dark:text-zinc-500 font-mono">
                          Từ {idx + 1}
                        </span>
                      )}
                    </div>

                    {/* Vạch gạch chân kiểu nhồi nhét */}
                    <div className={`w-full h-1 sm:h-1.5 rounded-full transition-all duration-300 ${
                      isFilled
                        ? 'bg-purple-600 dark:bg-purple-400 shadow-xs'
                        : isHintOnly
                          ? 'bg-amber-500'
                          : 'bg-slate-300 dark:bg-zinc-700'
                    }`} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ô nhập Romaji từ bàn phím */}
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              disabled={isAnswered}
              value={romajiInput}
              onChange={(e) => setRomajiInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && romajiInput.trim() && !isAnswered) {
                  handleCheck();
                }
              }}
              placeholder="Nhập phiên âm Romaji (gõ cách giữa các từ, vd: watashi wa gakusei desu)..."
              className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800 border-2 border-purple-200 dark:border-purple-900/50 focus:border-purple-500 dark:focus:border-purple-500 focus:outline-hidden text-slate-900 dark:text-white font-medium text-base shadow-inner transition"
            />
            {romajiInput && !isAnswered && (
              <button
                type="button"
                onClick={() => setRomajiInput('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1 rounded-md"
              >
                Xóa
              </button>
            )}
          </div>

          {/* Xem trước Hiragana tự động chuyển đổi */}
          {liveHiraganaPreview && (
            <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-zinc-400 px-2">
              <span className="font-semibold text-purple-600 dark:text-purple-400">Câu Hiragana tương ứng:</span>
              <span className="font-jp text-sm font-bold text-slate-800 dark:text-zinc-100 bg-purple-50 dark:bg-purple-950/40 px-2.5 py-0.5 rounded-lg border border-purple-100 dark:border-purple-900/40">
                {liveHiraganaPreview}
              </span>
            </div>
          )}
        </div>
      )}

      {/* KHU VỰC GỢI Ý TỪNG TỪ MỘT CHO ĐẾN HẾT CÂU */}
      <div className="space-y-3 pt-1">
        {revealedHintWords === 0 ? (
          <div className="flex items-center justify-between text-xs px-1">
            <button
              type="button"
              onClick={handleRevealNextHint}
              className="flex items-center space-x-1.5 font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
              <span>Gợi ý từng từ (bấm để hiện từ 1/{totalWords})</span>
            </button>
            <span className="text-slate-400 text-[11px]">
              {inputMode === 'romaji' ? 'Bấm Enter để kiểm tra nhanh' : 'Ghép đúng thứ tự'}
            </span>
          </div>
        ) : (
          <div className="p-4 bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl text-xs space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-900 dark:text-amber-300 flex items-center space-x-1.5">
                <Lightbulb className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>
                  Đang gợi ý: <span className="text-amber-600 dark:text-amber-400 font-extrabold">{revealedHintWords}/{totalWords} từ</span>
                  {revealedHintWords === totalWords && ' (Đã hiện hết câu!)'}
                </span>
              </span>

              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => speakJapanese(targetAudio)}
                  className="p-1 px-2 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 font-bold text-[11px] flex items-center space-x-1 hover:bg-amber-200 transition"
                >
                  <Volume2 className="w-3 h-3" />
                  <span>Nghe</span>
                </button>

                <button
                  type="button"
                  onClick={handleHideHint}
                  className="p-1 px-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 text-[11px] font-bold"
                >
                  Ẩn gợi ý
                </button>
              </div>
            </div>

            {/* Danh sách từng từ được hiện ra dần dần */}
            <div className="flex flex-wrap items-center gap-1.5 p-3 bg-white/80 dark:bg-zinc-900/80 rounded-xl border border-amber-100 dark:border-amber-900/40">
              {inputMode === 'romaji' ? (
                romajiWords.map((word, idx) => {
                  const isRevealed = idx < revealedHintWords;
                  return (
                    <span
                      key={idx}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all duration-200 ${
                        isRevealed
                          ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-700 shadow-2xs'
                          : 'bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 border border-dashed border-slate-300 dark:border-zinc-700'
                      }`}
                    >
                      {isRevealed ? word : `[ từ ${idx + 1} ]`}
                    </span>
                  );
                })
              ) : (
                correctTokens.map((tok, idx) => {
                  const isRevealed = idx < revealedHintWords;
                  return (
                    <span
                      key={idx}
                      className={`px-3 py-1 rounded-lg font-jp text-xs font-bold transition-all duration-200 ${
                        isRevealed
                          ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-700 shadow-2xs'
                          : 'bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 border border-dashed border-slate-300 dark:border-zinc-700'
                      }`}
                    >
                      {isRevealed ? tok : `[ từ ${idx + 1} ]`}
                    </span>
                  );
                })
              )}
            </div>

            {/* Các nút bấm điều khiển gợi ý tiếp theo */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-amber-100 dark:border-amber-900/40">
              <div className="flex items-center space-x-2">
                {revealedHintWords < totalWords ? (
                  <button
                    type="button"
                    onClick={handleRevealNextHint}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center space-x-1 shadow-xs transition active:scale-95"
                  >
                    <span>Hiện từ tiếp theo ({revealedHintWords + 1}/{totalWords})</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center space-x-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Đã gợi ý đầy đủ cả câu!</span>
                  </span>
                )}

                {revealedHintWords < totalWords && (
                  <button
                    type="button"
                    onClick={handleRevealAllHints}
                    className="px-2.5 py-1.5 rounded-xl text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 font-bold text-xs transition"
                  >
                    Hiện hết cả câu
                  </button>
                )}
              </div>

              {inputMode === 'romaji' && (
                <button
                  type="button"
                  onClick={handleFillRevealedToInput}
                  className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 text-purple-700 dark:text-purple-300 font-bold text-xs flex items-center space-x-1 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition"
                  title="Điền các từ đã gợi ý vào ô nhập"
                >
                  <span>⚡ Điền vào ô gõ</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Kết quả kiểm tra & Nút chuyển tiếp */}
      {isAnswered ? (
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 dark:border-zinc-800 gap-4">
          <div className="text-left space-y-1 w-full sm:w-auto">
            <span className={`text-sm font-bold flex items-center space-x-1.5 ${isCorrect ? 'text-emerald-500' : 'text-rose-500'}`}>
              <CheckCircle2 className="w-4 h-4" />
              <span>{isCorrect ? 'Chính xác tuyệt đối!' : 'Chưa chính xác!'}</span>
            </span>
            <div className="text-xs text-slate-600 dark:text-zinc-300">
              <div>
                Đáp án: <strong className="font-jp text-slate-900 dark:text-white font-bold">{targetJa}</strong>
              </div>
              <div className="text-slate-400 text-[11px] font-medium pt-0.5">
                Hiragana: <span className="font-jp">{targetKana}</span> • Romaji: <span>{targetRomaji}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => speakJapanese(targetAudio)}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-zinc-800 transition"
              title="Nghe lại phát âm"
            >
              <Volume2 className="w-4 h-4" />
            </button>

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
            disabled={inputMode === 'token' ? selectedTokens.length === 0 : !romajiInput.trim()}
            className="p-3 rounded-2xl border border-slate-200 dark:border-zinc-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-40 transition"
            title="Làm lại"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleCheck}
            disabled={inputMode === 'token' ? selectedTokens.length === 0 : !romajiInput.trim()}
            className="flex-1 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md shadow-purple-600/20 disabled:opacity-50 transition"
          >
            Kiểm tra câu dịch
          </button>
        </div>
      )}
    </div>
  );
};
