import React, { useState, useEffect, useRef, useCallback } from 'react';
import { WordItem } from '../types';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  RotateCcw, 
  Volume2, 
  Eye, 
  EyeOff, 
  Settings2, 
  Sparkles,
  Headphones,
  CheckCircle2,
  List
} from 'lucide-react';
import { speakJapanese, stopSpeaking } from '../lib/audio';

interface ShadowingViewProps {
  words: WordItem[];
  masteredWords?: string[];
  onToggleMaster?: (id: string) => void;
}

export const ShadowingView: React.FC<ShadowingViewProps> = ({
  words,
  masteredWords = [],
  onToggleMaster,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shadowTarget, setShadowTarget] = useState<'word' | 'sentence'>('word');
  const [speed, setSpeed] = useState<number>(0.9); // 0.8, 0.9, 1.0, 1.2
  const [repeatCount, setRepeatCount] = useState<number>(2); // số lần lặp mỗi từ
  const [pauseDuration, setPauseDuration] = useState<number>(1500); // ms nghỉ giữa các lần
  const [autoAdvance, setAutoAdvance] = useState(true);
  
  // Ẩn/hiện chữ để luyện nghe mù
  const [showText, setShowText] = useState(true);
  const [showFurigana, setShowFurigana] = useState(true);
  const [showMeaning, setShowMeaning] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  // Trạng thái phát âm hiện tại
  const [isSpeakingNow, setIsSpeakingNow] = useState(false);
  const [currentRepeat, setCurrentRepeat] = useState(1);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const currentWord = words[currentIndex] || words[0];

  const clearPendingTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const playCurrentWord = useCallback((repeatIndex = 1) => {
    if (!currentWord) return;
    clearPendingTimer();
    setIsSpeakingNow(true);
    setCurrentRepeat(repeatIndex);

    const exSentence = currentWord.examples?.[0];
    const speechText = (shadowTarget === 'sentence' && exSentence)
      ? (exSentence.ja || exSentence.kana || '')
      : (currentWord.kana || currentWord.kanji || '');

    speakJapanese(speechText, speed, () => {
      setIsSpeakingNow(false);

      if (!isPlayingRef.current) return;

      // Nếu còn lượt lặp của từ hiện tại
      if (repeatIndex < repeatCount) {
        timerRef.current = setTimeout(() => {
          if (isPlayingRef.current) {
            playCurrentWord(repeatIndex + 1);
          }
        }, pauseDuration);
      } else {
        // Hết lượt lặp của từ này
        if (autoAdvance) {
          timerRef.current = setTimeout(() => {
            if (isPlayingRef.current) {
              setCurrentIndex((prev) => {
                const nextIdx = (prev + 1) % words.length;
                return nextIdx;
              });
            }
          }, pauseDuration);
        } else {
          setIsPlaying(false);
        }
      }
    });
  }, [currentWord, speed, repeatCount, pauseDuration, autoAdvance, words.length]);

  // Khi currentIndex thay đổi và đang ở trạng thái play
  useEffect(() => {
    if (isPlaying) {
      playCurrentWord(1);
    }
    return () => {
      clearPendingTimer();
      stopSpeaking();
    };
  }, [currentIndex, isPlaying, playCurrentWord]);

  // Xử lý nút Play/Pause
  const handleTogglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      clearPendingTimer();
      stopSpeaking();
      setIsSpeakingNow(false);
    } else {
      setIsPlaying(true);
      playCurrentWord(1);
    }
  };

  const handleNext = () => {
    clearPendingTimer();
    stopSpeaking();
    setIsSpeakingNow(false);
    setCurrentIndex((prev) => (prev + 1) % words.length);
  };

  const handlePrev = () => {
    clearPendingTimer();
    stopSpeaking();
    setIsSpeakingNow(false);
    setCurrentIndex((prev) => (prev - 1 + words.length) % words.length);
  };

  const handleManualReplay = () => {
    clearPendingTimer();
    stopSpeaking();
    playCurrentWord(1);
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Bỏ qua khi người dùng đang nhập input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        handleManualReplay();
      } else if (e.code === 'KeyH') {
        e.preventDefault();
        setShowMeaning((v) => !v);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, handleNext, handlePrev, handleManualReplay, handleTogglePlay]);

  if (!words || words.length === 0) {
    return (
      <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-slate-200 dark:border-zinc-800">
        <p className="text-slate-500">Danh sách từ vựng hiện đang trống.</p>
      </div>
    );
  }

  const isMastered = masteredWords.includes(currentWord?.id || '');

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Bar: Progress & Setting trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:px-5 sm:py-3 shadow-xs gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black">
            <Headphones className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Luyện nghe đuổi (Shadowing)
            </div>
            <div className="text-sm font-extrabold text-slate-800 dark:text-zinc-200">
              Mục {currentIndex + 1} / {words.length}
            </div>
          </div>
        </div>

        {/* Nút chuyển đổi: Nghe Từ vựng vs Nghe Câu ví dụ / Kaiwa */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => {
                setShadowTarget('word');
                clearPendingTimer();
                stopSpeaking();
                setIsSpeakingNow(false);
                setIsPlaying(false);
              }}
              className={`px-3 py-1.5 rounded-lg transition ${
                shadowTarget === 'word'
                  ? 'bg-white dark:bg-zinc-700 text-purple-600 dark:text-purple-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Nghe từ vựng
            </button>
            <button
              onClick={() => {
                setShadowTarget('sentence');
                clearPendingTimer();
                stopSpeaking();
                setIsSpeakingNow(false);
                setIsPlaying(false);
              }}
              className={`px-3 py-1.5 rounded-lg transition ${
                shadowTarget === 'sentence'
                  ? 'bg-white dark:bg-zinc-700 text-purple-600 dark:text-purple-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Nghe câu / Kaiwa
            </button>
          </div>

          {/* Quick toggle blind listening */}
          <button
            onClick={() => setShowText(!showText)}
            title="Bật/Tắt chế độ nghe mù (ẩn chữ)"
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition ${
              !showText
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
            }`}
          >
            {!showText ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{!showText ? 'Đang nghe mù' : 'Hiện chữ'}</span>
          </button>

          {/* Settings button */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-xl transition ${
              showSettings
                ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Settings Panel Drawer (Collapsible) */}
      {showSettings && (
        <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 space-y-4 animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="font-bold text-sm text-slate-200 flex items-center space-x-2">
              <Settings2 className="w-4 h-4 text-purple-400" />
              <span>Cài đặt Shadowing & Tự động phát</span>
            </h4>
            <span className="text-xs text-slate-400">Tùy chỉnh cá nhân</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {/* Tốc độ đọc */}
            <div className="space-y-2">
              <label className="text-slate-400 font-semibold block">Tốc độ phát:</label>
              <div className="grid grid-cols-3 gap-1 bg-slate-800 p-1 rounded-xl">
                {[0.8, 1.0, 1.2].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    className={`py-1.5 rounded-lg font-bold transition ${
                      speed === s ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            {/* Số lần lặp lại mỗi từ */}
            <div className="space-y-2">
              <label className="text-slate-400 font-semibold block">Lặp lại mỗi từ:</label>
              <div className="grid grid-cols-3 gap-1 bg-slate-800 p-1 rounded-xl">
                {[1, 2, 3].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRepeatCount(r)}
                    className={`py-1.5 rounded-lg font-bold transition ${
                      repeatCount === r ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {r} lần
                  </button>
                ))}
              </div>
            </div>

            {/* Khoảng nghỉ giữa các lần */}
            <div className="space-y-2">
              <label className="text-slate-400 font-semibold block">Thời gian nghỉ (delay):</label>
              <div className="grid grid-cols-3 gap-1 bg-slate-800 p-1 rounded-xl">
                {[
                  { label: '1s', val: 1000 },
                  { label: '1.5s', val: 1500 },
                  { label: '2.5s', val: 2500 }
                ].map((p) => (
                  <button
                    key={p.val}
                    onClick={() => setPauseDuration(p.val)}
                    className={`py-1.5 rounded-lg font-bold transition ${
                      pauseDuration === p.val ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-800 text-xs">
            <label className="flex items-center space-x-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoAdvance}
                onChange={(e) => setAutoAdvance(e.target.checked)}
                className="rounded text-purple-600 focus:ring-purple-500"
              />
              <span className="text-slate-300 font-medium">Tự động chuyển từ tiếp theo</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showFurigana}
                onChange={(e) => setShowFurigana(e.target.checked)}
                className="rounded text-purple-600 focus:ring-purple-500"
              />
              <span className="text-slate-300 font-medium">Hiện Furigana</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showMeaning}
                onChange={(e) => setShowMeaning(e.target.checked)}
                className="rounded text-purple-600 focus:ring-purple-500"
              />
              <span className="text-slate-300 font-medium">Hiện Nghĩa tiếng Việt</span>
            </label>
          </div>
        </div>
      )}

      {/* Main Shadowing Player Card */}
      <div className="relative bg-gradient-to-b from-white to-slate-50 dark:from-zinc-900 dark:to-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 sm:p-12 shadow-sm text-center overflow-hidden">
        {/* Glow & Soundwave animation behind */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Status Badge & Repeat pill */}
        <div className="flex items-center justify-center space-x-2 mb-8">
          <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-black ${
            isSpeakingNow
              ? 'bg-purple-500 text-white animate-pulse'
              : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400'
          }`}>
            <Volume2 className="w-3.5 h-3.5" />
            <span>{isSpeakingNow ? `Đang phát âm (Lần ${currentRepeat}/${repeatCount})` : 'Sẵn sàng'}</span>
          </span>

          {onToggleMaster && (
            <button
              onClick={() => onToggleMaster(currentWord.id)}
              className={`p-1.5 rounded-full transition ${
                isMastered
                  ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
                  : 'text-slate-300 dark:text-zinc-700 hover:text-emerald-500'
              }`}
              title={isMastered ? 'Đã thuộc từ này' : 'Đánh dấu đã thuộc'}
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sound Wave Equalizer Graphic */}
        <div className="flex items-center justify-center space-x-1.5 h-10 mb-8">
          {[40, 70, 30, 90, 60, 100, 50, 80, 45, 95, 35, 65, 85].map((h, i) => (
            <span
              key={i}
              className={`w-1.5 rounded-full transition-all duration-300 ${
                isSpeakingNow
                  ? 'bg-purple-500 dark:bg-purple-400'
                  : 'bg-slate-200 dark:bg-zinc-800'
              }`}
              style={{
                height: isSpeakingNow ? `${Math.max(15, (h * (0.6 + Math.random() * 0.4)))}%` : '15%',
                transitionDelay: `${i * 20}ms`
              }}
            />
          ))}
        </div>

        {/* Content Display: Hidden in Blind Mode, or Visible */}
        {showText ? (
          shadowTarget === 'sentence' && currentWord.examples && currentWord.examples.length > 0 ? (
            <div className="space-y-4 max-w-2xl mx-auto animate-in fade-in duration-200">
              <div className="inline-block px-3 py-1 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest">
                💬 Ngữ pháp / Kaiwa Bài này
              </div>

              {/* Furigana của câu */}
              {showFurigana && currentWord.examples[0].kana && currentWord.examples[0].kana !== currentWord.examples[0].ja && (
                <div className="text-base sm:text-lg font-medium text-rose-500 dark:text-rose-400 tracking-wider">
                  {currentWord.examples[0].kana}
                </div>
              )}

              {/* Câu tiếng Nhật chính */}
              <div className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-wide leading-relaxed font-jp">
                {currentWord.examples[0].ja}
              </div>

              {/* Nghĩa tiếng Việt của câu */}
              {showMeaning ? (
                <div className="text-base sm:text-lg font-bold text-slate-700 dark:text-zinc-200 pt-2">
                  👉 {currentWord.examples[0].vi}
                </div>
              ) : (
                <button
                  onClick={() => setShowMeaning(true)}
                  className="text-sm font-semibold text-purple-600 dark:text-purple-400 hover:underline pt-2 block mx-auto"
                >
                  Nhấn để xem nghĩa tiếng Việt (Phím H)
                </button>
              )}

              {/* Từ vựng gốc đang học */}
              <div className="pt-2 text-xs font-semibold text-slate-400">
                Từ vựng: <strong className="text-rose-500 font-bold">{currentWord.kanji || currentWord.kana}</strong> ({currentWord.meaning})
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Furigana / Kana */}
              {showFurigana && currentWord.kana && (
                <div className="text-lg sm:text-xl font-bold text-rose-500 dark:text-rose-400 tracking-wider">
                  {currentWord.kana}
                </div>
              )}

              {/* Kanji / Main Japanese Word */}
              <div className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-wide font-jp">
                {currentWord.kanji || currentWord.kana}
              </div>

              {/* Han-Viet if exists */}
              {currentWord.hanviet && (
                <div className="inline-block px-3 py-1 rounded-xl bg-slate-100 dark:bg-zinc-800 text-xs font-bold text-slate-600 dark:text-zinc-300 uppercase tracking-widest">
                  Âm Hán: {currentWord.hanviet}
                </div>
              )}

              {/* Vietnamese Meaning */}
              {showMeaning ? (
                <div className="text-xl sm:text-2xl font-bold text-slate-700 dark:text-zinc-200 pt-3 max-w-xl mx-auto">
                  {currentWord.meaning || (currentWord as any).vietnamese}
                </div>
              ) : (
                <button
                  onClick={() => setShowMeaning(true)}
                  className="text-sm font-semibold text-purple-600 dark:text-purple-400 hover:underline pt-3"
                >
                  Nhấn để xem nghĩa tiếng Việt (Phím H)
                </button>
              )}
            </div>
          )
        ) : (
          <div className="py-10 space-y-3">
            <div className="text-slate-400 dark:text-zinc-500 text-sm font-medium">
              Chế độ nghe mù đang kích hoạt — Lắng nghe và nhại theo ngữ điệu người bản xứ!
            </div>
            <button
              onClick={() => setShowText(true)}
              className="px-4 py-2 rounded-2xl bg-purple-600 text-white font-bold text-sm shadow-md hover:bg-purple-700 transition"
            >
              Mở chữ kiểm tra
            </button>
          </div>
        )}

        {/* Controller Bar */}
        <div className="mt-12 flex items-center justify-center space-x-4">
          {/* Previous Button */}
          <button
            onClick={handlePrev}
            className="p-3.5 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-700 transition active:scale-95"
            title="Từ trước (←)"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          {/* Replay Current */}
          <button
            onClick={handleManualReplay}
            className="p-3.5 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-700 transition active:scale-95"
            title="Nghe lại (R)"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {/* Main Play / Pause Button */}
          <button
            onClick={handleTogglePlay}
            className={`p-5 rounded-3xl text-white shadow-xl transition transform active:scale-95 flex items-center justify-center ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/25 ring-4 ring-amber-500/20'
                : 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/25 ring-4 ring-purple-600/20'
            }`}
            title="Bắt đầu / Tạm dừng (Space)"
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 fill-current" />
            ) : (
              <Play className="w-7 h-7 fill-current ml-0.5" />
            )}
          </button>

          {/* Next Button */}
          <button
            onClick={handleNext}
            className="p-3.5 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-700 transition active:scale-95"
            title="Từ tiếp theo (→)"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Keyboard hints footer */}
        <div className="mt-8 flex items-center justify-center flex-wrap gap-4 text-[11px] font-semibold text-slate-400 dark:text-zinc-500">
          <span>Phím tắt:</span>
          <span className="bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-slate-600 dark:text-zinc-400">Space: Play/Pause</span>
          <span className="bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-slate-600 dark:text-zinc-400">← / →: Trước/Sau</span>
          <span className="bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-slate-600 dark:text-zinc-400">R: Nghe lại</span>
          <span className="bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-slate-600 dark:text-zinc-400">H: Ẩn/Hiện nghĩa</span>
        </div>
      </div>
    </div>
  );
};
