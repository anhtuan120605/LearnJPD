import React, { useState, useEffect, useRef } from 'react';
import { WordItem } from '../types';
import * as wanakana from 'wanakana';
import { 
  Settings, 
  Lightbulb, 
  Keyboard, 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  Volume2, 
  Sparkles, 
  ChevronRight, 
  Check,
  Maximize2,
  Minimize2,
  X
} from 'lucide-react';
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

// Bảng giải mã Telex tiếng Việt thông minh khi gõ romaji (ngăn Unikey / EVKey chèn ký tự sai hoặc nhảy chữ)
const telexMap: Record<string, string> = {
  'á': 'as', 'à': 'af', 'ả': 'ar', 'ã': 'ax', 'ạ': 'aj',
  'ắ': 'as', 'ằ': 'af', 'ẳ': 'ar', 'ẵ': 'ax', 'ặ': 'aj', 'ă': 'a',
  'ấ': 'aas', 'ầ': 'aaf', 'ẩ': 'aar', 'ẫ': 'aax', 'ậ': 'aaj', 'â': 'aa',
  'é': 'es', 'è': 'ef', 'ẻ': 'er', 'ẽ': 'ex', 'ẹ': 'ej',
  'ế': 'ees', 'ề': 'eef', 'ể': 'eer', 'ễ': 'eex', 'ệ': 'eej', 'ê': 'ee',
  'í': 'is', 'ì': 'if', 'ỉ': 'ir', 'ĩ': 'ix', 'ị': 'ij',
  'ó': 'os', 'ò': 'of', 'ỏ': 'or', 'õ': 'ox', 'ọ': 'oj',
  'ố': 'oos', 'ồ': 'oof', 'ổ': 'oor', 'ỗ': 'oox', 'ộ': 'ooj', 'ô': 'oo',
  'ớ': 'os', 'ờ': 'of', 'ở': 'or', 'ỡ': 'ox', 'ợ': 'oj', 'ơ': 'o',
  'ú': 'us', 'ù': 'uf', 'ủ': 'ur', 'ũ': 'ux', 'ụ': 'uj',
  'ứ': 'us', 'ừ': 'uf', 'ử': 'ur', 'ữ': 'ux', 'ự': 'uj',
  'ý': 'ys', 'ỳ': 'yf', 'ỷ': 'yr', 'ỹ': 'yx', 'ỵ': 'yj',
  'đ': 'd',
};

function cleanVietnameseTelex(text: string): string {
  let res = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1] || '';
    const lower = char.toLowerCase();

    // Xử lý 'ư'/'Ư' do Unikey gõ phím u hoặc w:
    // 1. Nếu theo sau là nguyên âm (vd: wa -> わたし, wo -> を) thì giữ là 'w'
    // 2. Nếu ở cuối hoặc trước phụ âm (vd: kenkyu + u -> ư) thì bản chất người học đang gõ âm 'u' (trường âm uu)
    if (lower === 'ư') {
      if (/[aeoi]/i.test(next)) {
        res += 'w';
      } else {
        res += 'u';
      }
      continue;
    }

    if (telexMap[lower] !== undefined) {
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

  // Chế độ phóng to toàn màn hình (Focus Mode)
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Hiển thị chữ Hán (Kanji) - mặc định là BẬT để học viên nhớ thêm 1 lần
  const [showKanji, setShowKanji] = useState<boolean>(() => {
    const saved = localStorage.getItem('cram_show_kanji');
    return saved !== null ? saved === 'true' : true;
  });

  // Tự động chuyển đổi sang Hiragana trong lúc gõ (IME)
  const [liveConvertKana, setLiveConvertKana] = useState<boolean>(() => {
    const saved = localStorage.getItem('cram_live_convert');
    return saved !== null ? saved === 'true' : true;
  });

  // Tự động phát âm thanh
  const [autoPlaySound, setAutoPlaySound] = useState<boolean>(() => {
    const saved = localStorage.getItem('cram_auto_sound');
    return saved !== null ? saved === 'true' : true;
  });

  // Modal cài đặt
  const [showSettingsModal, setShowSettingsModal] = useState(false);

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

  // Dùng ref ghi nhớ sessionKey đã khởi tạo, ngăn background sync ở App re-run làm mất chữ người học đang gõ
  const initializedSessionKeyRef = useRef<string | null>(null);

  const toggleShowKanji = () => {
    setShowKanji(prev => {
      const next = !prev;
      localStorage.setItem('cram_show_kanji', String(next));
      return next;
    });
  };

  const toggleLiveConvertKana = () => {
    setLiveConvertKana(prev => {
      const next = !prev;
      localStorage.setItem('cram_live_convert', String(next));
      return next;
    });
  };

  const toggleAutoSound = () => {
    setAutoPlaySound(prev => {
      const next = !prev;
      localStorage.setItem('cram_auto_sound', String(next));
      return next;
    });
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      try {
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
      } catch (_) {}
      setIsFullscreen(true);
    } else {
      try {
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      } catch (_) {}
      setIsFullscreen(false);
    }
  };

  // Lắng nghe phím Esc và fullscreenchange để đồng bộ chế độ phóng to
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        toggleFullscreen();
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen]);

  // Ngăn cuộn trang phía dưới khi ở chế độ toàn màn hình
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  // Khôi phục phiên dở dang hoặc khởi tạo mới (chỉ chạy 1 lần khi sessionKey thực sự đổi)
  useEffect(() => {
    if (initializedSessionKeyRef.current === sessionKey) {
      return; // Không nạp lại nếu sessionKey không đổi để tránh xóa chữ đang gõ
    }
    initializedSessionKeyRef.current = sessionKey;

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
  }, [sessionKey]);

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
  const currentWordId = currentWord?.id;
  const targetAnswer = testType === 'reading' 
    ? (currentWord?.kana || '') 
    : (currentWord?.hanviet || currentWord?.kana || '');

  // Kiểm tra từ có chứa chữ Hán (Kanji) thực sự hay không
  const hasKanji = React.useMemo(() => {
    if (!currentWord?.kanji) return false;
    const hasKanjiChar = /[\u4E00-\u9FAF\u3400-\u4DBF]/.test(currentWord.kanji);
    return Boolean(hasKanjiChar && currentWord.kanji !== currentWord.kana);
  }, [currentWord]);

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

  // Reset mỗi khi chuyển sang từ mới hoặc đổi chế độ testType (KHÔNG reset khi fullscreen hay background re-render)
  useEffect(() => {
    if (!currentWordId) return;
    setInputValue('');
    setHintCount(0);
    setShowRomajiHint(false);
    setStatus('idle');

    // Khởi tạo các vạch gạch chân (các ký hiệu như ～, -, () sẽ được hiển thị sẵn chứ không bắt gõ)
    const chars = targetAnswer.split('');
    setRevealedChars(chars.map(c => isPunctuationOrSymbol(c) ? c : ''));

    // Tự động focus vào ô nhập liệu
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 120);
    return () => clearTimeout(timer);
  }, [currentIndex, currentWordId, testType]);

  // Giữ focus khi chuyển chế độ phóng to mà không xóa chữ người học đang gõ
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 120);
    return () => clearTimeout(timer);
  }, [isFullscreen]);

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
      if (liveConvertKana) {
        const deTelexted = cleanVietnameseTelex(raw);
        const converted = smartHybridConvert(deTelexted, targetAnswer);
        setInputValue(converted);
      } else {
        // Cho phép gõ Romaji nguyên bản, không bị can thiệp bộ gõ
        setInputValue(raw);
      }
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
      isCorrect = isJapaneseAnswerMatch(
        trimmedInput, 
        cleanTarget,
        currentWord.kana,
        currentWord.kanji,
        currentWord.romaji
      );
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
      if (autoPlaySound) {
        speakJapanese(currentWord.kana || currentWord.kanji);
      }
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
      if (autoPlaySound) {
        speakJapanese(currentWord.kana || currentWord.kanji);
      }
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
    <div 
      style={isFullscreen ? { backgroundColor: '#0b0f19' } : undefined}
      className={
        isFullscreen
          ? "fixed inset-0 z-50 text-white p-4 sm:p-6 md:p-8 flex flex-col justify-center items-center overflow-y-auto"
          : "max-w-4xl mx-auto space-y-4"
      }
    >
      {/* Banner thông báo chế độ phóng to toàn màn hình */}
      {isFullscreen && (
        <div className="w-full max-w-5xl mx-auto mb-3 flex items-center justify-between px-3 py-1.5 text-xs text-slate-400 shrink-0 select-none">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-medium text-slate-300">Chế độ gõ tập trung toàn màn hình</span>
          </div>
          <button
            onClick={toggleFullscreen}
            style={{ backgroundColor: '#182234' }}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition border border-slate-700/80 shadow-xs"
            title="Thu nhỏ lại về kích thước thường (phím Esc)"
          >
            <Minimize2 className="w-3.5 h-3.5 text-orange-400" />
            <span>Thu nhỏ (Esc)</span>
          </button>
        </div>
      )}

      {/* Banner thông báo đã khôi phục phiên gõ dở */}
      {restoredBanner && !isCompleted && (
        <div 
          style={{ backgroundColor: '#1b2333' }}
          className={`flex items-center justify-between border border-amber-500/30 px-4 py-2.5 rounded-2xl text-xs text-amber-300 shadow-2xs ${isFullscreen ? 'w-full max-w-5xl mx-auto mb-3 shrink-0' : ''}`}
        >
          <div className="flex items-center space-x-2">
            <span className="text-sm">🔄</span>
            <span>{restoredBanner} (tiến độ được tự động lưu lại).</span>
          </div>
          <button
            onClick={handleRestart}
            className="font-bold underline hover:text-amber-200 ml-3 shrink-0"
          >
            Làm lại từ đầu
          </button>
        </div>
      )}

      {isCompleted ? (
        /* Màn hình kết thúc */
        <div 
          style={{ backgroundColor: '#161f30' }}
          className={`text-white rounded-3xl p-10 text-center shadow-2xl border border-slate-700/60 space-y-6 ${isFullscreen ? 'w-full max-w-5xl my-auto' : ''}`}
        >
          <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Sparkles className="w-10 h-10 animate-bounce" />
          </div>
          <h2 className="text-3xl font-black">Tuyệt Vời! Đã Hoàn Thành Nhồi Nhét!</h2>
          <p className="text-slate-300">
            Bạn đã vượt qua bài luyện gõ với kết quả: <strong className="text-orange-400 text-2xl font-black">{score}</strong> / {words.length} câu.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleRestart}
              className="inline-flex items-center space-x-2 px-8 py-3.5 bg-orange-500 hover:bg-orange-600 font-bold rounded-2xl shadow-lg shadow-orange-500/30 transition active:scale-95"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Luyện gõ lại từ đầu</span>
            </button>
            {isFullscreen && (
              <button
                onClick={toggleFullscreen}
                className="inline-flex items-center space-x-2 px-6 py-3.5 bg-slate-700 hover:bg-slate-600 font-bold rounded-2xl transition"
              >
                <Minimize2 className="w-5 h-5" />
                <span>Thoát phóng to</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Giao diện Nhồi nhét Dark Navy chuẩn NhaiKanji */
        <div 
          style={{ backgroundColor: '#161f30' }}
          className={`relative rounded-3xl text-white shadow-2xl border border-slate-700/70 flex flex-col justify-between transition-all ${
            isFullscreen 
              ? 'w-full max-w-5xl my-auto p-8 sm:p-12 md:p-14 min-h-[580px]' 
              : 'overflow-hidden p-6 sm:p-10 min-h-[480px]'
          }`}
        >
          
          {/* Header trên: Mascot bên trái, Các nút điều khiển bên phải */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2 opacity-80 hover:opacity-100 transition select-none">
              <div className="text-2xl">🎧</div>
              <span className="text-xs font-mono font-bold tracking-widest text-slate-400">
                カタカタカタ...
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Nút Bật/Tắt Hán tự */}
              <button
                onClick={toggleShowKanji}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                  showKanji
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-xs'
                    : 'bg-[#1B2436] text-slate-400 border-transparent hover:text-slate-200'
                }`}
                title="Bật/Tắt hiển thị chữ Hán (Kanji) của từ vựng để thêm 1 lần nhớ"
              >
                <span className="font-jp font-bold text-sm">漢</span>
                <span>Hán tự: {showKanji ? 'BẬT' : 'TẮT'}</span>
              </button>

              {/* Nút Lặp lại câu sai */}
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
                <span className="hidden sm:inline">Lặp lại câu sai: {repeatMistakes ? 'BẬT' : 'TẮT'}</span>
                <span className="sm:hidden">{repeatMistakes ? 'Lặp: BẬT' : 'Lặp: TẮT'}</span>
              </button>

              {/* Toggle Cách đọc / Âm Hán */}
              <div className="flex items-center bg-[#1B2436] p-1 rounded-xl">
                <button
                  onClick={() => setTestType('reading')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    testType === 'reading'
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Cách đọc
                </button>
                <button
                  onClick={() => setTestType('han')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    testType === 'han'
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Âm Hán
                </button>
              </div>

              {/* Nút Phóng to / Thu nhỏ */}
              <button
                onClick={toggleFullscreen}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                  isFullscreen
                    ? 'bg-orange-500 text-white border-orange-400 shadow-md'
                    : 'bg-[#1B2436] text-slate-300 border-slate-700/60 hover:text-white hover:border-slate-500'
                }`}
                title={isFullscreen ? 'Thu nhỏ lại (Phím Esc)' : 'Phóng to toàn trang để tập trung (Focus Mode)'}
              >
                {isFullscreen ? (
                  <>
                    <Minimize2 className="w-3.5 h-3.5 text-white" />
                    <span>Thu nhỏ</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5 text-orange-400" />
                    <span className="hidden sm:inline">Phóng to</span>
                  </>
                )}
              </button>

              {/* Nút Cài đặt */}
              <button 
                onClick={() => setShowSettingsModal(true)}
                title="Cài đặt gõ nhồi nhét"
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#1B2436] transition"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Vùng trung tâm: Hán tự (nếu có), Nghĩa tiếng Việt & Vạch gạch chân */}
          <div className="my-auto text-center py-4 sm:py-6 space-y-4 sm:space-y-6">
            <div className="space-y-2">
              {/* Hán tự nổi bật nếu từ có chữ Hán */}
              {hasKanji && showKanji && (
                <div className="flex flex-col items-center justify-center animate-fade-in group">
                  <div className={`font-black font-jp text-amber-300 drop-shadow-md tracking-wider transition-all select-all ${
                    isFullscreen ? 'text-5xl sm:text-7xl md:text-8xl mb-2' : 'text-3xl sm:text-5xl mb-1'
                  }`}>
                    {currentWord.kanji}
                  </div>
                  {/* Chỉ hiện âm Hán trong chế độ 'reading' để tránh lộ đáp án khi ở chế độ gõ âm Hán */}
                  {testType === 'reading' && currentWord.hanviet && (
                    <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs sm:text-sm font-bold tracking-widest uppercase">
                      <span>Âm Hán:</span>
                      <span className="text-amber-100 font-extrabold">{currentWord.hanviet}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Nghĩa tiếng Việt */}
              <h2 className={`font-extrabold tracking-tight text-white px-4 leading-tight transition-all ${
                isFullscreen 
                  ? 'text-3xl sm:text-4xl md:text-5xl' 
                  : (hasKanji && showKanji ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl')
              }`}>
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
                      <span className={`h-8 font-bold font-jp text-slate-400 flex items-center ${
                        isFullscreen ? 'text-3xl' : 'text-2xl'
                      }`}>
                        {char}
                      </span>
                      <div className="w-4 h-1"></div>
                    </div>
                  );
                }

                return (
                  <div key={idx} className="flex flex-col items-center">
                    <span className={`h-8 font-bold font-jp text-orange-400 transition-all duration-200 ${
                      isFullscreen ? 'text-2xl' : 'text-xl'
                    }`}>
                      {revealed || ''}
                    </span>
                    <div className={`${
                      isFullscreen ? 'w-8 sm:w-10 h-1.5' : 'w-6 sm:w-8 h-1'
                    } rounded-full transition-colors ${revealed ? 'bg-orange-400' : 'bg-slate-500'}`}></div>
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
          <form onSubmit={handleCheck} className={`space-y-4 mx-auto w-full transition-all ${
            isFullscreen ? 'max-w-2xl' : 'max-w-xl'
          }`}>
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                disabled={status === 'correct'}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                placeholder={
                  testType === 'reading'
                    ? (liveConvertKana
                        ? (scriptType === 'katakana' 
                            ? "Gõ romaji (tự động chuyển Katakana: vd amerika → アメリカ)" 
                            : scriptType === 'hybrid'
                              ? "Gõ romaji (vd: pawa-denki hoặc pawadenki - tự động chuyển Katakana + Hiragana)"
                              : "Gõ romaji (tự động chuyển Hiragana: vd toshokan → としょかん)")
                        : "Gõ romaji nguyên bản (vd: toshokan, kenkyuusha - chấp nhận cả Romaji và Kana)")
                    : "Gõ âm Hán Việt (vd: THỰC, SINH VIÊN)"
                }
                style={{ backgroundColor: '#0f1726' }}
                className={`w-full rounded-2xl text-white placeholder-slate-500 font-semibold focus:outline-hidden transition border-2 ${
                  isFullscreen ? 'py-4 sm:py-5 px-6 text-lg sm:text-xl' : 'py-3.5 px-5 text-base'
                } ${
                  status === 'correct' 
                    ? 'border-emerald-500 bg-emerald-950/20 text-emerald-400' 
                    : status === 'wrong'
                      ? 'border-rose-500 bg-rose-950/20 text-rose-400 animate-shake'
                      : 'border-slate-700/80 focus:border-orange-500/80'
                }`}
              />

              <button
                type="button"
                onClick={() => speakJapanese(currentWord.kana || currentWord.kanji)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-white transition"
              >
                <Volume2 className={isFullscreen ? "w-5 h-5" : "w-4 h-4"} />
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
                <div className="flex items-center gap-2">
                  <span>Đáp án đúng: <strong className="font-bold text-white font-jp text-sm">{targetAnswer}</strong> {currentWord.kanji ? `(${currentWord.kanji})` : ''}</span>
                  <button
                    type="button"
                    onClick={() => speakJapanese(currentWord.kana || currentWord.kanji)}
                    className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-rose-200 transition"
                    title="Nghe phát âm đáp án đúng"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
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
                style={{ backgroundColor: '#222d42' }}
                className={`${
                  isFullscreen ? 'py-3.5 sm:py-4 px-5 text-sm sm:text-base' : 'py-3 px-4 text-xs sm:text-sm'
                } rounded-xl hover:bg-[#2b3952] text-slate-200 border border-slate-600/50 font-bold disabled:opacity-40 transition flex items-center justify-center space-x-1.5 shadow-sm`}
              >
                <Lightbulb className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>
                  {hintCount >= totalChars 
                    ? 'Đã hiện hết từ!' 
                    : `Gợi ý (${hintCount}/${totalChars})`}
                </span>
                {hintCount < totalChars && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
              </button>

              <button
                type="submit"
                className={`${
                  isFullscreen ? 'py-3.5 sm:py-4 px-5 text-sm sm:text-base' : 'py-3 px-4 text-xs sm:text-sm'
                } rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold shadow-lg shadow-orange-500/20 transition flex items-center justify-center space-x-1.5 active:scale-95`}
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

      {/* Modal Cài đặt */}
      {showSettingsModal && (
        <div 
          className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowSettingsModal(false)}
        >
          <div 
            className="bg-[#1E283D] border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 text-white animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400">
                  <Settings className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Cài đặt gõ nhồi nhét</h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Toggle Hán tự */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#172033] border border-slate-700/50">
                <div className="pr-3">
                  <div className="font-bold text-sm text-slate-200 flex items-center space-x-2">
                    <span className="text-amber-400 font-jp font-bold">漢</span>
                    <span>Hiện chữ Hán (Kanji)</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">Hiển thị mặt chữ Hán tự để thêm 1 lần ghi nhớ</p>
                </div>
                <button
                  type="button"
                  onClick={toggleShowKanji}
                  className={`w-12 h-6.5 rounded-full transition-colors relative shrink-0 p-1 ${
                    showKanji ? 'bg-orange-500' : 'bg-slate-700'
                  }`}
                >
                  <div className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${
                    showKanji ? 'translate-x-5.5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Toggle Chuyển Kana trực tiếp khi gõ */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#172033] border border-slate-700/50">
                <div className="pr-3">
                  <div className="font-bold text-sm text-slate-200 flex items-center space-x-2">
                    <Keyboard className="w-4 h-4 text-orange-400" />
                    <span>Tự đổi Romaji sang Hiragana</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {liveConvertKana 
                      ? 'Đang bật: gõ toshokan tự chuyển thành としょかん' 
                      : 'Đang tắt: gõ Romaji nguyên bản (hệ thống vẫn chấm điểm đúng)'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={toggleLiveConvertKana}
                  className={`w-12 h-6.5 rounded-full transition-colors relative shrink-0 p-1 ${
                    liveConvertKana ? 'bg-orange-500' : 'bg-slate-700'
                  }`}
                >
                  <div className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${
                    liveConvertKana ? 'translate-x-5.5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Toggle Lặp lại câu sai */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#172033] border border-slate-700/50">
                <div className="pr-3">
                  <div className="font-bold text-sm text-slate-200 flex items-center space-x-2">
                    <RotateCcw className="w-4 h-4 text-amber-400" />
                    <span>Lặp lại câu sai</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">Đẩy từ sai về sau hàng đợi gõ cho đến khi đúng</p>
                </div>
                <button
                  type="button"
                  onClick={() => setRepeatMistakes(prev => !prev)}
                  className={`w-12 h-6.5 rounded-full transition-colors relative shrink-0 p-1 ${
                    repeatMistakes ? 'bg-orange-500' : 'bg-slate-700'
                  }`}
                >
                  <div className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${
                    repeatMistakes ? 'translate-x-5.5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Toggle Âm thanh */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#172033] border border-slate-700/50">
                <div className="pr-3">
                  <div className="font-bold text-sm text-slate-200 flex items-center space-x-2">
                    <Volume2 className="w-4 h-4 text-sky-400" />
                    <span>Phát âm thanh tự động</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">Đọc to từ vựng tiếng Nhật khi kiểm tra</p>
                </div>
                <button
                  type="button"
                  onClick={toggleAutoSound}
                  className={`w-12 h-6.5 rounded-full transition-colors relative shrink-0 p-1 ${
                    autoPlaySound ? 'bg-orange-500' : 'bg-slate-700'
                  }`}
                >
                  <div className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${
                    autoPlaySound ? 'translate-x-5.5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Phóng to toàn màn hình */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#172033] border border-slate-700/50">
                <div className="pr-3">
                  <div className="font-bold text-sm text-slate-200 flex items-center space-x-2">
                    <Maximize2 className="w-4 h-4 text-emerald-400" />
                    <span>Phóng to tập trung</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">Phóng to toàn trang, loại bỏ mọi phân tâm</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    toggleFullscreen();
                    setShowSettingsModal(false);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                    isFullscreen ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  {isFullscreen ? 'Đang bật' : 'Bật ngay'}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="w-full py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition shadow-lg shadow-orange-500/25"
              >
                Đã xong
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
