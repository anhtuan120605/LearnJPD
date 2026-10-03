import React, { useState, useEffect, useRef, useMemo } from 'react';
import { WordItem } from '../types';
import * as wanakana from 'wanakana';
import { 
  Keyboard, 
  Flame, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Trophy, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Timer, 
  Eye, 
  EyeOff,
  Zap,
  FastForward,
  Bookmark
} from 'lucide-react';
import { speakJapanese } from '../lib/audio';
import { smartHybridConvert, isJapaneseAnswerMatch } from '../lib/textUtils';
import confetti from 'canvas-confetti';

interface JapaneseTypingViewProps {
  allWords: WordItem[];
  currentLevel?: string;
  onBack: () => void;
  onAddFavorite?: (id: string) => void;
  onAddMistake?: (id: string) => void;
  masteredWords?: string[];
  favoriteWords?: string[];
  mistakeWords?: string[];
}

// Bảng giải mã Telex tiếng Việt nhầm khi gõ romaji (vd: "amerika" -> "amẻika")
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

type RoundLength = 10 | 20 | 50 | 'timed60';

export const JapaneseTypingView: React.FC<JapaneseTypingViewProps> = ({
  allWords,
  currentLevel = 'N5',
  onBack,
  onAddFavorite,
  onAddMistake,
  masteredWords = [],
  favoriteWords = [],
  mistakeWords = [],
}) => {
  // Cài đặt vòng chơi
  const [selectedLevel, setSelectedLevel] = useState<string>(currentLevel || 'N5');
  const [roundMode, setRoundMode] = useState<RoundLength>(20);
  const [showFurigana, setShowFurigana] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Danh sách từ trong vòng thi đấu hiện tại
  const [queue, setQueue] = useState<WordItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userInput, setUserInput] = useState<string>('');
  
  // Trạng thái gõ
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [inputError, setInputError] = useState<boolean>(false);

  // Thống kê Real-time
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState<number>(0);
  const [correctKeystrokes, setCorrectKeystrokes] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  
  // Danh sách kết quả chi tiết
  const [results, setResults] = useState<Array<{
    word: WordItem;
    userTyped: string;
    isCorrect: boolean;
    timeMs: number;
  }>>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wordStartTimeRef = useRef<number>(Date.now());

  // Lọc kho từ phù hợp theo cấp độ hoặc danh mục đã học đang chọn
  const availableWords = useMemo(() => {
    if (selectedLevel === 'mastered') {
      return allWords.filter(w => masteredWords.includes(w.id));
    }
    if (selectedLevel === 'favorite') {
      return allWords.filter(w => favoriteWords.includes(w.id));
    }
    if (selectedLevel === 'mistake') {
      return allWords.filter(w => mistakeWords.includes(w.id));
    }
    if (selectedLevel === 'ALL') return allWords;
    const list = allWords.filter(w => w.level === selectedLevel);
    return list.length > 0 ? list : allWords;
  }, [allWords, selectedLevel, masteredWords, favoriteWords, mistakeWords]);

  // Khởi tạo vòng chơi mới
  const startNewRound = () => {
    if (availableWords.length === 0) return;

    // Xáo trộn ngẫu nhiên từ vựng
    const shuffled = [...availableWords].sort(() => Math.random() - 0.5);
    const count = roundMode === 'timed60' ? 60 : roundMode;
    const selected = shuffled.slice(0, Math.min(count, shuffled.length));

    setQueue(selected);
    setCurrentIndex(0);
    setUserInput('');
    setIsStarted(false);
    setIsFinished(false);
    setInputError(false);
    setElapsedSeconds(0);
    setTotalKeystrokes(0);
    setCorrectKeystrokes(0);
    setStreak(0);
    setMaxStreak(0);
    setResults([]);
    wordStartTimeRef.current = Date.now();

    if (timerRef.current) clearInterval(timerRef.current);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  useEffect(() => {
    startNewRound();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [selectedLevel, roundMode]);

  // Kết thúc vòng thi
  const finishRound = () => {
    setIsFinished(true);
    if (timerRef.current) clearInterval(timerRef.current);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Bộ đếm thời gian
  useEffect(() => {
    if (isStarted && !isFinished) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(prev => {
          const next = prev + 1;
          if (roundMode === 'timed60' && next >= 60) {
            finishRound();
            return 60;
          }
          return next;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isStarted, isFinished, roundMode]);

  // Tính toán chỉ số CPM và WPM
  const cpm = useMemo(() => {
    if (elapsedSeconds <= 0) return 0;
    return Math.round((correctKeystrokes / elapsedSeconds) * 60);
  }, [correctKeystrokes, elapsedSeconds]);

  const wpm = useMemo(() => {
    return Math.round(cpm / 5);
  }, [cpm]);

  const accuracy = useMemo(() => {
    if (totalKeystrokes === 0) return 100;
    return Math.min(100, Math.round((correctKeystrokes / totalKeystrokes) * 100));
  }, [correctKeystrokes, totalKeystrokes]);

  const currentWord = queue[currentIndex];

  // Xử lý khi gõ vào ô nhập liệu
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentWord || isFinished) return;

    if (!isStarted) {
      setIsStarted(true);
      wordStartTimeRef.current = Date.now();
    }

    const rawVal = e.target.value;
    setTotalKeystrokes(prev => prev + 1);

    // Chuyển đổi Telex lỗi và chuyển Romaji sang Kana thông minh
    const cleaned = cleanVietnameseTelex(rawVal);
    const converted = smartHybridConvert(cleaned, currentWord.kana);
    setUserInput(converted);

    const targetKana = currentWord.kana.trim();

    // Kiểm tra xem chuỗi đang gõ có khớp phần đầu của mục tiêu không
    const startsMatch = targetKana.startsWith(converted) || 
      wanakana.toRomaji(targetKana).toLowerCase().startsWith(cleaned.toLowerCase());

    if (startsMatch) {
      setInputError(false);
      setCorrectKeystrokes(prev => prev + 1);
    } else {
      setInputError(true);
    }

    // Kiểm tra hoàn thành từ: gõ đúng trọn vẹn Kana hoặc Romaji
    const isMatched = isJapaneseAnswerMatch(converted, targetKana, currentWord.kanji, currentWord.romaji);

    if (isMatched) {
      // Gõ đúng!
      const timeSpent = Date.now() - wordStartTimeRef.current;
      wordStartTimeRef.current = Date.now();

      if (soundEnabled) {
        speakJapanese(currentWord.kana);
      }

      setStreak(s => {
        const next = s + 1;
        if (next > maxStreak) setMaxStreak(next);
        return next;
      });

      setResults(prev => [
        ...prev,
        { word: currentWord, userTyped: converted, isCorrect: true, timeMs: timeSpent }
      ]);

      setUserInput('');
      setInputError(false);

      if (currentIndex + 1 >= queue.length) {
        finishRound();
      } else {
        setCurrentIndex(prev => prev + 1);
      }
    }
  };

  // Bỏ qua từ hiện tại (Skip)
  const handleSkipWord = () => {
    if (!currentWord || isFinished) return;

    const timeSpent = Date.now() - wordStartTimeRef.current;
    wordStartTimeRef.current = Date.now();

    setStreak(0);
    if (onAddMistake) {
      onAddMistake(currentWord.id);
    }

    setResults(prev => [
      ...prev,
      { word: currentWord, userTyped: userInput || '(bỏ qua)', isCorrect: false, timeMs: timeSpent }
    ]);

    setUserInput('');
    setInputError(false);

    if (currentIndex + 1 >= queue.length) {
      finishRound();
    } else {
      setCurrentIndex(prev => prev + 1);
    }
    inputRef.current?.focus();
  };

  // Tính xếp hạng hiệu năng (Rank)
  const getPerformanceRank = () => {
    if (accuracy >= 95 && cpm >= 180) return { rank: 'SSS', color: 'from-amber-400 to-rose-500', text: 'Bậc thầy gõ phím!' };
    if (accuracy >= 90 && cpm >= 140) return { rank: 'S', color: 'from-blue-500 to-indigo-600', text: 'Tốc độ xuất sắc!' };
    if (accuracy >= 85 && cpm >= 100) return { rank: 'A', color: 'from-emerald-500 to-teal-600', text: 'Rất nhanh và chuẩn!' };
    if (accuracy >= 75) return { rank: 'B', color: 'from-sky-500 to-blue-600', text: 'Khá tốt, hãy duy trì!' };
    return { rank: 'C', color: 'from-slate-500 to-zinc-600', text: 'Cần luyện thêm phản xạ.' };
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in">
      {/* Thanh điều hướng & Cài đặt */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#111c30] p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition active:scale-95"
            title="Quay lại"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
                <Keyboard className="w-5 h-5" />
              </span>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                Đấu Trường Luyện Gõ Tiếng Nhật
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
                Tốc độ & Phản xạ
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Gõ Romaji sang Kana tức thì, tự sửa Telex tiếng Việt, đo CPM thời gian thực
            </p>
          </div>
        </div>

        {/* Bộ chọn Cấp độ JLPT & Số lượng từ */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Cấp độ JLPT & Từ đã học */}
          <div className="flex flex-wrap items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 gap-0.5">
            {['N5', 'N4', 'N3', 'N2', 'N1'].map(lvl => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition ${
                  selectedLevel === lvl
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {lvl}
              </button>
            ))}

            <span className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1 hidden sm:inline-block" />

            {/* Mục: Từ đã học */}
            <button
              onClick={() => setSelectedLevel('mastered')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center space-x-1 ${
                selectedLevel === 'mastered'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600'
              }`}
              title="Luyện gõ các từ bạn đã học / đã thuộc"
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Đã học ({masteredWords.length})</span>
            </button>

            {/* Mục: Yêu thích */}
            {favoriteWords.length > 0 && (
              <button
                onClick={() => setSelectedLevel('favorite')}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center space-x-1 ${
                  selectedLevel === 'favorite'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-amber-500'
                }`}
              >
                <span>⭐ ({favoriteWords.length})</span>
              </button>
            )}

            {/* Mục: Hay sai */}
            {mistakeWords.length > 0 && (
              <button
                onClick={() => setSelectedLevel('mistake')}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center space-x-1 ${
                  selectedLevel === 'mistake'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-rose-500'
                }`}
              >
                <span>⚠️ ({mistakeWords.length})</span>
              </button>
            )}
          </div>

          {/* Số lượng */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-700/50">
            {[10, 20, 50].map(cnt => (
              <button
                key={cnt}
                onClick={() => setRoundMode(cnt as RoundLength)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition ${
                  roundMode === cnt
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {cnt} từ
              </button>
            ))}
            <button
              onClick={() => setRoundMode('timed60')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center space-x-1 ${
                roundMode === 'timed60'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Đua tốc độ 60 giây"
            >
              <Timer className="w-3 h-3" />
              <span>60s</span>
            </button>
          </div>

          {/* Toggle Âm thanh & Furigana */}
          <button
            onClick={() => setSoundEnabled(p => !p)}
            className={`p-2 rounded-2xl border transition ${
              soundEnabled
                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-sky-400 border-blue-200 dark:border-blue-800/50'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-transparent'
            }`}
            title={soundEnabled ? 'Đang bật âm thanh' : 'Đang tắt âm thanh'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setShowFurigana(p => !p)}
            className={`p-2 rounded-2xl border transition ${
              showFurigana
                ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/50'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-transparent'
            }`}
            title={showFurigana ? 'Furigana: Đang hiện' : 'Furigana: Đang ẩn'}
          >
            {showFurigana ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {availableWords.length === 0 ? (
        <div className="bg-white dark:bg-[#111c30] p-10 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Chưa có từ vựng nào trong danh mục này!
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              {selectedLevel === 'mastered'
                ? 'Bạn chưa đánh dấu từ nào là "Đã học" (mastered). Hãy luyện tập từ vựng ở các bài học trước, hoặc chọn cấp độ N5 để bắt đầu ngay!'
                : 'Hiện chưa có từ vựng nào trong danh mục đã chọn.'}
            </p>
          </div>
          <button
            onClick={() => setSelectedLevel('N5')}
            className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition active:scale-95"
          >
            Chuyển sang cấp độ N5
          </button>
        </div>
      ) : !isFinished ? (
        /* KHU VỰC THI ĐẤU GÕ PHÍM TRỰC TIẾP */
        <div className="space-y-6">
          {/* Dashboard HUD: CPM, WPM, Độ chính xác, Combo Streak */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* CPM */}
            <div className="bg-white dark:bg-[#111c30] p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center font-black">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Tốc độ CPM
                </span>
                <span className="text-xl font-black text-slate-900 dark:text-white">
                  {cpm} <span className="text-xs font-normal text-slate-400">ký tự/p</span>
                </span>
              </div>
            </div>

            {/* WPM */}
            <div className="bg-white dark:bg-[#111c30] p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-sky-400 flex items-center justify-center font-black">
                <Keyboard className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Tốc độ WPM
                </span>
                <span className="text-xl font-black text-slate-900 dark:text-white">
                  {wpm} <span className="text-xs font-normal text-slate-400">từ/p</span>
                </span>
              </div>
            </div>

            {/* Độ chính xác */}
            <div className="bg-white dark:bg-[#111c30] p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Chính xác
                </span>
                <span className="text-xl font-black text-slate-900 dark:text-white">
                  {accuracy}%
                </span>
              </div>
            </div>

            {/* Combo Streak & Thời gian */}
            <div className="bg-white dark:bg-[#111c30] p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-black">
                <Flame className={`w-5 h-5 ${streak >= 5 ? 'animate-bounce text-rose-500' : ''}`} />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  {roundMode === 'timed60' ? `Còn lại: ${60 - elapsedSeconds}s` : `Chuỗi đúng`}
                </span>
                <span className="text-xl font-black text-slate-900 dark:text-white">
                  {streak > 0 ? `🔥 ${streak}` : '0'}
                </span>
              </div>
            </div>
          </div>

          {/* Thanh tiến độ bài thi */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400 px-1">
              <span>Tiến độ: {currentIndex} / {queue.length} từ</span>
              <span>{Math.round((currentIndex / queue.length) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 via-rose-500 to-blue-500 transition-all duration-300 rounded-full"
                style={{ width: `${(currentIndex / queue.length) * 100}%` }}
              />
            </div>
          </div>

          {/* THẺ TỪ MỤC TIÊU & Ô NHẬP LIỆU CHÍNH */}
          {currentWord && (
            <div className="bg-white dark:bg-[#111c30] rounded-3xl border-2 border-slate-200/90 dark:border-slate-800 p-6 sm:p-10 text-center shadow-lg relative overflow-hidden">
              {/* Băng chuyền 3 từ sắp tới (Queue preview) */}
              <div className="flex items-center justify-center space-x-2 mb-6">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Từ kế tiếp:</span>
                {queue.slice(currentIndex + 1, currentIndex + 4).map((w, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-jp"
                  >
                    {w.kanji || w.kana}
                  </span>
                ))}
              </div>

              {/* Chữ Hán / Kana chính */}
              <div className="space-y-2 my-4">
                {showFurigana && currentWord.kanji && (
                  <p className="text-base sm:text-lg font-bold text-slate-400 dark:text-slate-400 font-jp tracking-wider">
                    {currentWord.kana}
                  </p>
                )}
                <h2 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white font-jp tracking-wide">
                  {currentWord.kanji || currentWord.kana}
                </h2>
                
                {/* Âm Hán-Việt & Nghĩa tiếng Việt */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  {currentWord.hanviet && (
                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/50">
                      【{currentWord.hanviet}】
                    </span>
                  )}
                  <span className="text-sm sm:text-base font-bold text-slate-700 dark:text-slate-300">
                    {currentWord.meaning}
                  </span>
                </div>
              </div>

              {/* Ô nhập phím tương tác */}
              <div className="max-w-md mx-auto mt-8 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={userInput}
                  onChange={handleInputChange}
                  placeholder="Gõ Romaji (vd: arigatou)..."
                  autoFocus
                  className={`w-full py-4 px-6 rounded-2xl text-xl sm:text-2xl font-black text-center font-jp tracking-wider outline-none transition-all border-2 shadow-inner ${
                    inputError
                      ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 animate-shake'
                      : 'border-blue-500/80 bg-slate-50 dark:bg-slate-800/80 text-blue-600 dark:text-sky-300 focus:ring-4 focus:ring-blue-500/20'
                  }`}
                />
                
                {/* Gợi ý ký tự đích */}
                <div className="mt-3 flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>Mục tiêu: <strong className="text-slate-700 dark:text-slate-200 font-jp">{currentWord.kana}</strong></span>
                  <button
                    onClick={handleSkipWord}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center space-x-1 font-bold transition"
                  >
                    <span>Bỏ qua từ này (Skip)</span>
                    <FastForward className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Nút hành động nhanh: Phát âm & Lưu từ */}
              <div className="mt-6 flex items-center justify-center space-x-4">
                <button
                  onClick={() => speakJapanese(currentWord.kana)}
                  className="p-2 rounded-xl text-slate-400 hover:text-blue-600 dark:hover:text-sky-400 transition"
                  title="Nghe lại phát âm"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
                {onAddFavorite && (
                  <button
                    onClick={() => onAddFavorite(currentWord.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-amber-500 transition"
                    title="Lưu vào Sổ tay yêu thích"
                  >
                    <Bookmark className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Phím tắt hữu ích */}
          <div className="text-center text-xs text-slate-400 flex items-center justify-center space-x-4">
            <span>💡 <strong>Gõ phím tiếng Anh</strong>: Romaji sẽ tự chuyển Hiragana/Katakana chuẩn</span>
            <span>•</span>
            <span>💡 <strong>Tự động sửa Telex</strong>: Không cần tắt bộ gõ Unikey</span>
          </div>
        </div>
      ) : (
        /* MÀN HÌNH TỔNG KẾT THÀNH TÍCH (COMPLETION SUMMARY) */
        <div className="bg-white dark:bg-[#111c30] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-lg text-center space-y-8 animate-scale-up">
          <div className="space-y-3">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-xl shadow-orange-500/25">
              <Trophy className="w-10 h-10" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Hoàn Thành Vòng Luyện Gõ!
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Bạn đã hoàn thành thử thách với thành tích ấn tượng
            </p>
          </div>

          {/* Huy hiệu Xếp hạng (Rank Badge) */}
          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 max-w-sm mx-auto">
            <span className={`text-6xl font-black bg-gradient-to-r ${getPerformanceRank().color} bg-clip-text text-transparent`}>
              {getPerformanceRank().rank}
            </span>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mt-2">
              {getPerformanceRank().text}
            </p>
          </div>

          {/* Bảng thông số chi tiết */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="p-4 rounded-2xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200/60 dark:border-orange-800/40">
              <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase">Tốc độ CPM</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{cpm}</p>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/40">
              <span className="text-xs font-bold text-blue-600 dark:text-sky-400 uppercase">Tốc độ WPM</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{wpm}</p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">Độ chính xác</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{accuracy}%</p>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-800/40">
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase">Chuỗi dài nhất</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">🔥 {maxStreak}</p>
            </div>
          </div>

          {/* Danh sách từ vựng chi tiết của vòng chơi */}
          <div className="text-left space-y-3 max-w-2xl mx-auto">
            <h3 className="text-sm font-black uppercase text-slate-400 tracking-wider">
              Chi tiết các từ trong lượt thi ({results.length} từ)
            </h3>
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {results.map((r, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/40 text-xs"
                >
                  <div className="flex items-center space-x-3">
                    {r.isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    )}
                    <div>
                      <span className="font-bold text-sm text-slate-900 dark:text-white font-jp">
                        {r.word.kanji || r.word.kana}
                      </span>
                      <span className="text-slate-400 ml-2 font-jp">({r.word.kana})</span>
                      <span className="text-slate-500 dark:text-slate-400 ml-2">• {r.word.meaning}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-slate-400 text-[11px]">
                      {(r.timeMs / 1000).toFixed(1)}s
                    </span>
                    <button
                      onClick={() => speakJapanese(r.word.kana)}
                      className="p-1 text-slate-400 hover:text-blue-600 transition"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Các nút điều hướng cuối */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={startNewRound}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-orange-500/25 transition active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Chơi lại lượt mới</span>
            </button>
            <button
              onClick={onBack}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm transition"
            >
              Quay lại danh mục
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
