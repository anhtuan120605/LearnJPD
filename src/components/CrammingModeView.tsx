import React, { useState, useEffect, useRef } from 'react';
import { WordItem } from '../types';
import * as wanakana from 'wanakana';
import { Settings, Lightbulb, Keyboard, CheckCircle, XCircle, RotateCcw, Volume2, Sparkles, ChevronRight, Check } from 'lucide-react';
import { speakJapanese } from '../lib/audio';
import { 
  normalizeJapaneseAnswer, 
  isPunctuationOrSymbol, 
  isJapaneseAnswerMatch, 
  smartHybridConvert 
} from '../lib/textUtils';
import confetti from 'canvas-confetti';
import { 
  getPracticeSessionKey, 
  savePracticeSession, 
  loadPracticeSession, 
  clearPracticeSession,
  CrammingSessionState 
} from '../lib/practiceSession';

interface CrammingModeViewProps {
  words: WordItem[];
  onFinish?: (score: number, total: number) => void;
  onAddMastered?: (id: string) => void;
  onAddMasteredList?: (ids: string[]) => void;
  onAddMistake?: (id: string) => void;
  onRemoveMistake?: (id: string) => void;
}

// Bảng giải mã Telex tiếng Việt nhầm khi gõ romaji (vd: gõ "amerika" bị thành "amẻika")
const telexMap: Record<string, string> = {
  'á': 'as', 'à': 'af', 'ả': 'ar', 'ã': 'ax', 'ạ': 'aj',
  'ắ': 'aws', 'ằ': 'awf', 'ẳ': 'awr', 'ẵ': 'awx', 'ặ': 'awj', 'ă': 'aw',
  'ấ': 'aas', 'ầ': 'aaf', 'ẩ': 'aar', 'ẫ': 'aax', 'ậ': 'aaj', 'â': 'aa',
  'é': 'es', 'è': 'ef', 'ẻ': 'er', 'ẽ': 'ex', 'ẹ': 'ej',
  'ế': 'ees', 'ề': 'eef', 'ể': 'eer', 'ễ': 'eex', 'ệ': 'eej', 'ê': 'ee',
  'í': 'is', 'ì': 'if', 'ỉ': 'ir', 'ĩ': 'ix', 'ị': 'ij',
  'ó': 'os', 'ò': 'of', 'ỏ': 'or', 'õ': 'ox', 'ọ': 'oj',
  'ố': 'oos', 'ồ': 'oof', 'ổ': 'oor', 'ỗ': 'oox', 'ộ': 'ooj', 'ô': 'oo',
  'ớ': 'ows', 'ờ': 'owf', 'ở': 'owr', 'ỡ': 'owx', 'ợ': 'owj', 'ơ': 'ow',
  'ú': 'us', 'ù': 'uf', 'ủ': 'ur', 'ũ': 'ux', 'ụ': 'uj',
  'ứ': 'uws', 'ừ': 'uwf', 'ử': 'uwr', 'ữ': 'uwx', 'ự': 'uwj', 'ư': 'uw',
  'ý': 'ys', 'ỳ': 'yf', 'ỷ': 'yr', 'ỹ': 'yx', 'ỵ': 'yj',
  'đ': 'dd',
};

function cleanVietnameseTelex(text: string): string {
  let res = '';
  for (const char of text) {
    const lower = char.toLowerCase();
    if (telexMap[lower]) {
      res += telexMap[lower];
    } else {
      res += char;
    }
  }
  return res;
}

export const CrammingModeView: React.FC<CrammingModeViewProps> = ({
  words,
  onFinish,
  onAddMastered,
  onAddMasteredList,
  onAddMistake,
  onRemoveMistake,
}) => {
  // Chế độ kiểm tra: 'reading' (Cách đọc Hiragana) hoặc 'han' (Âm Hán Việt)
  const [testType, setTestType] = useState<'reading' | 'han'>('reading');

  // Hàng đợi từ vựng động (nếu gõ sai sẽ tự động đẩy về sau để gõ lại cho đến khi đúng)
  const [activeWords, setActiveWords] = useState<WordItem[]>(words);
  const [repeatMistakes, setRepeatMistakes] = useState<boolean>(true);
  const [resolvedWordIds, setResolvedWordIds] = useState<Set<string>>(new Set());
  const [retryCount, setRetryCount] = useState<number>(0);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  
  // Gợi ý từng ký tự một cho đến hết độ dài đáp án
  const [hintCount, setHintCount] = useState(0);
  const [revealedChars, setRevealedChars] = useState<string[]>([]);
  const [showRomajiHint, setShowRomajiHint] = useState(false);

  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Key phiên làm bài & thông báo tự động khôi phục
  const sessionKey = React.useMemo(() => getPracticeSessionKey('cramming', words), [words]);
  const [restoredBanner, setRestoredBanner] = useState<string | null>(null);

  // Khôi phục phiên dở dang hoặc khởi tạo mới
  useEffect(() => {
    const saved = loadPracticeSession<CrammingSessionState>(sessionKey);
    if (saved && saved.currentIndex > 0 && saved.currentIndex < saved.activeWords.length) {
      setActiveWords(saved.activeWords);
      setCurrentIndex(saved.currentIndex);
      setScore(saved.score);
      setResolvedWordIds(new Set(saved.resolvedWordIds || []));
      setRetryCount(saved.retryCount || 0);
      setTestType(saved.testType || 'reading');
      setRepeatMistakes(saved.repeatMistakes !== undefined ? saved.repeatMistakes : true);
      setIsCompleted(false);
      setRestoredBanner(`Đã khôi phục từ số ${saved.currentIndex + 1}/${saved.activeWords.length} đang gõ dở`);
    } else {
      setActiveWords(words);
      setCurrentIndex(0);
      setScore(0);
      setIsCompleted(false);
      setResolvedWordIds(new Set());
      setRetryCount(0);
      setRestoredBanner(null);
    }
  }, [words, sessionKey]);

  // Tự động lưu tiến độ vào LocalStorage mỗi khi hoàn thành 1 từ
  useEffect(() => {
    if (isCompleted || activeWords.length === 0) return;
    if (currentIndex > 0 || resolvedWordIds.size > 0 || retryCount > 0) {
      savePracticeSession<CrammingSessionState>(sessionKey, {
        currentIndex,
        activeWords,
        score,
        resolvedWordIds: Array.from(resolvedWordIds),
        retryCount,
        testType,
        repeatMistakes,
        updatedAt: Date.now()
      });
    }
  }, [currentIndex, activeWords, score, resolvedWordIds, retryCount, testType, repeatMistakes, isCompleted, sessionKey]);

  const currentWord = activeWords[currentIndex] || activeWords[0];
  const targetAnswer = testType === 'reading' 
    ? (currentWord?.kana || '') 
    : (currentWord?.hanviet || currentWord?.kana || '');

  // Phân loại kiểu chữ của từ mục tiêu: 'katakana' (thuần) | 'hybrid' (ghép Katakana + Hiragana) | 'hiragana'
  const scriptType = React.useMemo(() => {
    const text = targetAnswer || currentWord?.kana || '';
    const hasKata = /[\u30A0-\u30FF]/.test(text);
    const hasHira = /[\u3040-\u309F]/.test(text);
    if (hasKata && hasHira) return 'hybrid';
    if (hasKata) return 'katakana';
    return 'hiragana';
  }, [targetAnswer, currentWord]);

  const totalChars = targetAnswer.length;
  const targetRomaji = wanakana.toRomaji(currentWord?.kana || '');

  // Reset mỗi khi đổi từ hoặc đổi chế độ testType
  useEffect(() => {
    if (!currentWord) return;
    setInputValue('');
    setHintCount(0);
    setShowRomajiHint(false);
    setStatus('idle');

    // Khởi tạo các vạch gạch chân (các ký hiệu như ～, -, () sẽ được hiển thị sẵn chứ không bắt gõ)
    const chars = targetAnswer.split('');
    setRevealedChars(chars.map(c => isPunctuationOrSymbol(c) ? c : ''));

    // Tự động focus vào ô nhập liệu
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, [currentIndex, testType, currentWord, targetAnswer]);

  if (!words || words.length === 0) {
    return (
      <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-3xl p-8">
        <p className="text-slate-500">Danh sách từ vựng hiện đang trống.</p>
      </div>
    );
  }

  // Tự động chuyển Romaji sang đúng chữ tiếng Nhật (thông minh cho cả từ thuần Katakana, Hiragana và từ ghép lai)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (testType === 'reading') {
      const deTelexted = cleanVietnameseTelex(raw);
      const converted = smartHybridConvert(deTelexted, targetAnswer);
      setInputValue(converted);
    } else {
      setInputValue(raw.toUpperCase());
    }
  };

  // Bấm gợi ý: Lần lượt hé lộ từng chữ cái cho tới khi hết toàn bộ (bỏ qua ký hiệu)
  const handleHint = () => {
    const answerChars = targetAnswer.split('');
    const newRevealed = [...revealedChars];
    const nextIdx = newRevealed.findIndex((c, i) => !c && !isPunctuationOrSymbol(answerChars[i]));
    if (nextIdx !== -1 && nextIdx < answerChars.length) {
      newRevealed[nextIdx] = answerChars[nextIdx];
      setRevealedChars(newRevealed);
      setHintCount(prev => prev + 1);
    }
  };

  // Mở hết tất cả các ký tự của đáp án
  const handleRevealAll = () => {
    const answerChars = targetAnswer.split('');
    setRevealedChars(answerChars);
    setHintCount(answerChars.length);
  };

  // Điền các ký tự đã gợi ý vào ô nhập
  const handleFillRevealed = () => {
    const filled = revealedChars.filter(Boolean).join('');
    setInputValue(filled);
    inputRef.current?.focus();
  };

  // Ẩn gợi ý
  const handleHideHint = () => {
    const chars = targetAnswer.split('');
    setRevealedChars(chars.map(c => isPunctuationOrSymbol(c) ? c : ''));
    setHintCount(0);
    setShowRomajiHint(false);
  };

  // Chuẩn hóa chuỗi so sánh
  const normalizeText = (s: string) => {
    return s
      .toLowerCase()
      .replace(/[.,!?。、\s\-~_]/g, '')
      .replace(/ha/g, 'wa')
      .replace(/wo/g, 'o')
      .replace(/は/g, 'わ')
      .replace(/を/g, 'お');
  };

  // Kiểm tra đáp án
  const handleCheck = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (status !== 'idle') {
      handleNext();
      return;
    }

    const trimmedInput = inputValue.trim();
    const cleanTarget = targetAnswer.trim();

    let isCorrect = false;
    if (testType === 'reading') {
      isCorrect = isJapaneseAnswerMatch(trimmedInput, cleanTarget);
    } else {
      isCorrect = normalizeJapaneseAnswer(trimmedInput) === normalizeJapaneseAnswer(cleanTarget);
    }

    if (isCorrect) {
      setStatus('correct');
      if (!resolvedWordIds.has(currentWord.id)) {
        setScore(s => s + 1);
        setResolvedWordIds(prev => new Set(prev).add(currentWord.id));
      }
      onRemoveMistake?.(currentWord.id);
      onAddMastered?.(currentWord.id);
      speakJapanese(currentWord.kana || currentWord.kanji);
      setTimeout(() => {
        handleNext();
      }, 700);
    } else {
      setStatus('wrong');
      onAddMistake?.(currentWord.id);
      if (repeatMistakes) {
        // Đẩy từ sai về sau hàng đợi để luyện lại
        setActiveWords(prev => [...prev, currentWord]);
        setRetryCount(c => c + 1);
      }
      speakJapanese(currentWord.kana || currentWord.kanji);
    }
  };

  // Chuyển sang câu tiếp theo
  const handleNext = () => {
    if (currentIndex + 1 < activeWords.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsCompleted(true);
      clearPracticeSession(sessionKey);
      setRestoredBanner(null);
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      onAddMasteredList?.(words.map(w => w.id));
      if (onFinish) onFinish(score, words.length);
    }
  };

  // Chơi lại
  const handleRestart = () => {
    clearPracticeSession(sessionKey);
    setRestoredBanner(null);
    setActiveWords(words);
    setCurrentIndex(0);
    setScore(0);
    setIsCompleted(false);
    setResolvedWordIds(new Set());
    setRetryCount(0);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Banner thông báo đã khôi phục phiên gõ dở */}
      {restoredBanner && !isCompleted && (
        <div className="flex items-center justify-between bg-orange-500/10 border border-orange-500/30 px-4 py-2.5 rounded-2xl text-xs text-orange-300 shadow-2xs">
          <div className="flex items-center space-x-2">
            <span className="text-sm">🔄</span>
            <span>{restoredBanner} (tiến độ được tự động lưu lại).</span>
          </div>
          <button
            onClick={handleRestart}
            className="font-bold underline hover:text-orange-100 ml-3 shrink-0"
          >
            Làm lại từ đầu
          </button>
        </div>
      )}

      {isCompleted ? (
        /* Màn hình kết thúc */
        <div className="bg-[#232F46] text-white rounded-3xl p-10 text-center shadow-2xl space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Sparkles className="w-10 h-10 animate-bounce" />
          </div>
          <h2 className="text-3xl font-black">Tuyệt Vời! Đã Hoàn Thành Nhồi Nhét!</h2>
          <p className="text-slate-300">
            Bạn đã vượt qua bài luyện gõ với kết quả: <strong className="text-orange-400 text-2xl font-black">{score}</strong> / {words.length} câu.
          </p>
          <button
            onClick={handleRestart}
            className="inline-flex items-center space-x-2 px-8 py-3.5 bg-orange-500 hover:bg-orange-600 font-bold rounded-2xl shadow-lg shadow-orange-500/30 transition active:scale-95"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Luyện gõ lại từ đầu</span>
          </button>
        </div>
      ) : (
        /* Giao diện Nhồi nhét Dark Navy chuẩn NhaiKanji */
        <div className="relative rounded-3xl bg-[#232F46] text-white shadow-2xl overflow-hidden border border-slate-700/60 p-6 sm:p-10 flex flex-col justify-between min-h-[480px]">
          
          {/* Header trên: Mascot bên trái, Chế độ Cách đọc/Âm Hán bên phải */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 opacity-80 hover:opacity-100 transition select-none">
              <div className="text-2xl">🎧</div>
              <span className="text-xs font-mono font-bold tracking-widest text-slate-400">
                カタカタカタ...
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setRepeatMistakes(prev => !prev)}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                  repeatMistakes
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-xs'
                    : 'bg-[#1B2436] text-slate-400 border-transparent hover:text-slate-200'
                }`}
                title="Khi gõ sai từ nào, hệ thống sẽ đẩy từ đó về sau để làm lại cho đến khi gõ đúng"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${repeatMistakes ? 'animate-spin-slow text-amber-400' : ''}`} />
                <span>Lặp lại câu sai: {repeatMistakes ? 'BẬT' : 'TẮT'}</span>
              </button>

              <div className="flex items-center bg-[#1B2436] p-1 rounded-xl">
                <button
                  onClick={() => setTestType('reading')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                    testType === 'reading'
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Cách đọc
                </button>
                <button
                  onClick={() => setTestType('han')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                    testType === 'han'
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Âm Hán
                </button>
              </div>

              <button 
                title="Cài đặt"
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#1B2436] transition"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Vùng trung tâm: Nghĩa tiếng Việt & Vạch gạch chân */}
          <div className="my-auto text-center py-6 space-y-6">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white px-4 leading-tight">
                {currentWord.meaning}
              </h2>
              {testType === 'reading' && (
                <div className="flex items-center justify-center space-x-2 mt-2">
                  {scriptType === 'katakana' && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      Từ mượn Katakana
                    </span>
                  )}
                  {scriptType === 'hybrid' && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Từ ghép Katakana + Hiragana
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Vạch gạch chân ký tự _ _ _ (hiện dần từng ký tự khi bấm gợi ý) */}
            <div className="flex flex-wrap items-center justify-center gap-2 select-none px-4">
              {targetAnswer.split('').map((char, idx) => {
                const isSymbol = isPunctuationOrSymbol(char);
                const revealed = revealedChars[idx] || (isSymbol ? char : '');
                
                if (isSymbol) {
                  return (
                    <div key={idx} className="flex flex-col items-center justify-center px-1">
                      <span className="h-8 text-2xl font-bold font-jp text-slate-400 flex items-center">
                        {char}
                      </span>
                      <div className="w-4 h-1"></div>
                    </div>
                  );
                }

                return (
                  <div key={idx} className="flex flex-col items-center">
                    <span className="h-8 text-xl font-bold font-jp text-orange-400 transition-all duration-200">
                      {revealed || ''}
                    </span>
                    <div className={`w-6 sm:w-8 h-1 rounded-full transition-colors ${revealed ? 'bg-orange-400' : 'bg-slate-500'}`}></div>
                  </div>
                );
              })}
            </div>

            {/* Romaji gợi ý (nếu người học muốn xem) */}
            {showRomajiHint && testType === 'reading' && (
              <div className="text-xs text-amber-300 font-mono bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-1.5 inline-block">
                Phiên âm Romaji: <strong className="text-amber-200">{targetRomaji}</strong>
              </div>
            )}
          </div>

          {/* Form Ô nhập & Nút hành động */}
          <form onSubmit={handleCheck} className="space-y-4 max-w-xl mx-auto w-full">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                disabled={status === 'correct'}
                placeholder={
                  testType === 'reading'
                    ? (scriptType === 'katakana' 
                        ? "Gõ romaji (tự động chuyển Katakana: vd amerika → アメリカ)" 
                        : scriptType === 'hybrid'
                          ? "Gõ romaji (vd: pawa-denki hoặc pawadenki - tự động chuyển Katakana + Hiragana)"
                          : "Gõ romaji (tự động chuyển Hiragana: vd toshokan → としょかん)")
                    : "Gõ âm Hán Việt (vd: THỰC, SINH VIÊN)"
                }
                className={`w-full py-3.5 px-5 rounded-2xl bg-[#1B2436] text-white placeholder-slate-500 text-base font-semibold focus:outline-hidden transition border-2 ${
                  status === 'correct' 
                    ? 'border-emerald-500 bg-emerald-950/20 text-emerald-400' 
                    : status === 'wrong'
                      ? 'border-rose-500 bg-rose-950/20 text-rose-400 animate-shake'
                      : 'border-slate-700/80 focus:border-orange-500'
                }`}
              />

              <button
                type="button"
                onClick={() => speakJapanese(currentWord.kana || currentWord.kanji)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-white transition"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            {/* Mẹo thông minh cho từ có ký hiệu phụ ngữ pháp ～ hoặc từ ghép lai */}
            {testType === 'reading' && (
              <>
                {(targetAnswer.includes('～') || targetAnswer.includes('~')) && (
                  <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[11px] text-sky-300 text-center">
                    💡 <strong>Mẹo:</strong> Ký hiệu <span className="font-mono text-amber-300 font-bold">～</span> là hậu tố/tiền tố. Bạn chỉ cần gõ <span className="font-mono text-amber-300 font-bold">san</span> (hoặc <span className="font-mono text-amber-300 font-bold">~san</span>) đều được chấp nhận!
                  </div>
                )}
                {scriptType === 'hybrid' && (
                  <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-[11px] text-indigo-200 text-center">
                    ✨ <strong>Từ ghép linh hoạt:</strong> Bạn chỉ cần gõ Romaji bình thường (<span className="font-mono text-amber-300 font-bold">{targetRomaji || 'pawadenki'}</span>). Hệ thống chấp nhận cả Hiragana, Katakana và Romaji!
                  </div>
                )}
              </>
            )}

            {/* Thông báo nếu sai */}
            {status === 'wrong' && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center justify-between">
                <span>Đáp án đúng: <strong className="font-bold text-white font-jp text-sm">{targetAnswer}</strong> ({currentWord.kanji})</span>
                <button
                  type="button"
                  onClick={handleNext}
                  className="font-bold text-orange-400 hover:underline"
                >
                  Bỏ qua ➔
                </button>
              </div>
            )}

            {/* Hàng nút bấm: Gợi ý từng chữ cho tới khi hết + Kiểm tra */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleHint}
                disabled={hintCount >= totalChars || status !== 'idle'}
                className="py-3 px-4 rounded-xl bg-white text-slate-800 font-bold text-xs sm:text-sm hover:bg-slate-100 disabled:opacity-50 transition flex items-center justify-center space-x-1.5 shadow-sm"
              >
                <Lightbulb className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>
                  {hintCount >= totalChars 
                    ? 'Đã hiện hết từ!' 
                    : `Gợi ý (${hintCount}/${totalChars})`}
                </span>
                {hintCount < totalChars && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
              </button>

              <button
                type="submit"
                className="py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-orange-500/25 transition flex items-center justify-center space-x-1.5 active:scale-95"
              >
                <Keyboard className="w-4 h-4" />
                <span>{status === 'idle' ? 'Kiểm tra' : 'Câu tiếp theo ➔'}</span>
              </button>
            </div>

            {/* Thanh điều khiển nâng cao khi gợi ý đang mở */}
            {hintCount > 0 && status === 'idle' && (
              <div className="flex items-center justify-between pt-1 px-1 text-xs">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleFillRevealed}
                    className="text-orange-400 hover:text-orange-300 font-bold flex items-center space-x-1"
                  >
                    <span>⚡ Điền chữ vào ô</span>
                  </button>

                  {hintCount < totalChars && (
                    <button
                      type="button"
                      onClick={handleRevealAll}
                      className="text-slate-400 hover:text-slate-200"
                    >
                      Hiện hết ({totalChars} chữ)
                    </button>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {testType === 'reading' && !showRomajiHint && (
                    <button
                      type="button"
                      onClick={() => setShowRomajiHint(true)}
                      className="text-amber-400 hover:text-amber-300"
                    >
                      Xem Romaji
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleHideHint}
                    className="text-slate-500 hover:text-slate-300"
                  >
                    Ẩn gợi ý
                  </button>
                </div>
              </div>
            )}

            {/* Phím tắt Hint */}
            <p className="text-center text-[11px] text-slate-400 pt-0.5">
              Nhấn <kbd className="px-1.5 py-0.5 rounded bg-slate-700 font-mono text-[10px] text-slate-200">Enter</kbd> để kiểm tra
            </p>
          </form>

          {/* Footer dưới cùng: Tiến độ câu & Thanh xanh lá */}
          <div className="mt-6 pt-4 border-t border-slate-700/50 flex flex-col space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span>Lượt từ {currentIndex + 1} / {activeWords.length}</span>
              {repeatMistakes && retryCount > 0 && activeWords.length > currentIndex + 1 && (
                <span className="text-[11px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                  Đang lặp từ sai ({activeWords.length - currentIndex - 1} từ chờ gõ lại)
                </span>
              )}
            </div>
            <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / activeWords.length) * 100}%` }}
              ></div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
