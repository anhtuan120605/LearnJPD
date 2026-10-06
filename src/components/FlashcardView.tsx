import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { WordItem } from '../types';
import { 
  Volume2, 
  Star, 
  CheckCircle, 
  RotateCw, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Shuffle, 
  ArrowLeftRight, 
  VolumeX, 
  Keyboard, 
  X,
  Maximize2,
  Minimize2,
  Moon,
  Sun
} from 'lucide-react';
import { speakJapanese, stopSpeaking } from '../lib/audio';

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
  // 1. Tùy chọn lọc: 'all' (Tất cả từ) | 'starred' (Chỉ từ gắn sao)
  const [filterMode, setFilterMode] = useState<'all' | 'starred'>('all');
  
  // 2. Tùy chọn xáo trộn
  const [isShuffled, setIsShuffled] = useState(false);

  // 3. Tùy chọn mặt trước: 'ja' (Hỏi Tiếng Nhật trước) | 'vi' (Hỏi Nghĩa tiếng Việt trước)
  const [frontSide, setFrontSide] = useState<'ja' | 'vi'>('ja');

  // 4. Tự động phát âm khi lật mặt tiếng Nhật hoặc chuyển thẻ mới
  const [autoAudio, setAutoAudio] = useState(true);

  // 5. Chế độ Toàn màn hình & Nền tối dịu mắt (Eye-care Dark Mode)
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isNightMode, setIsNightMode] = useState(false);

  // 6. Hiển thị bảng trợ giúp phím tắt
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

  // Danh sách từ sau khi lọc
  const filteredWords = useMemo(() => {
    let list = filterMode === 'starred' 
      ? words.filter(w => favoriteWords.includes(w.id))
      : words;

    if (isShuffled && list.length > 1) {
      const copy = [...list];
      // Shuffle Fisher-Yates
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    }
    return list;
  }, [words, filterMode, favoriteWords, isShuffled]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Đảm bảo currentIndex luôn hợp lệ
  useEffect(() => {
    if (currentIndex >= filteredWords.length) {
      setCurrentIndex(0);
    }
    setIsFlipped(false);
  }, [filteredWords.length]);

  const currentWord = filteredWords[currentIndex] as WordItem | undefined;

  const hasUserInteracted = useRef(false);

  // Dừng âm thanh khi rời khỏi FlashcardView
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  // Xử lý phát âm từ vựng hiện tại
  const playCurrentAudio = useCallback(() => {
    hasUserInteracted.current = true;
    if (currentWord) {
      speakJapanese(currentWord.kana || currentWord.kanji);
    }
  }, [currentWord]);

  // Tự động phát âm khi chuyển sang thẻ mới (nếu mặt trước là tiếng Nhật và đã tương tác)
  useEffect(() => {
    if (hasUserInteracted.current && autoAudio && currentWord && !isFlipped && frontSide === 'ja') {
      playCurrentAudio();
    }
  }, [currentIndex, autoAudio, frontSide]);

  // Tự động phát âm khi lật sang mặt tiếng Nhật (nếu mặt trước là tiếng Việt và đã tương tác)
  useEffect(() => {
    if (hasUserInteracted.current && autoAudio && currentWord && isFlipped && frontSide === 'vi') {
      playCurrentAudio();
    }
  }, [isFlipped, autoAudio, frontSide]);

  const handleNext = useCallback(() => {
    hasUserInteracted.current = true;
    if (filteredWords.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex(prev => (prev + 1) % filteredWords.length);
  }, [filteredWords.length]);

  const handlePrev = useCallback(() => {
    hasUserInteracted.current = true;
    if (filteredWords.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex(prev => (prev - 1 + filteredWords.length) % filteredWords.length);
  }, [filteredWords.length]);

  const handleToggleFlip = useCallback(() => {
    hasUserInteracted.current = true;
    setIsFlipped(prev => !prev);
  }, []);

  // Chức năng bật / tắt Toàn màn hình đồng bộ Browser API
  const toggleFullscreen = useCallback(() => {
    if (!isFullscreen) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
    } else {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  }, [isFullscreen]);

  // Lắng nghe khi thoát Fullscreen từ trình duyệt (phím Esc của browser)
  useEffect(() => {
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  // Khóa cuộn trang nền khi đang ở chế độ toàn màn hình
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

  // Lắng nghe phím tắt bàn phím chuẩn Quizlet + phím F / Esc cho toàn màn hình
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Bỏ qua nếu người dùng đang gõ trong input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      switch (e.code) {
        case 'Space':
        case 'Enter':
          e.preventDefault();
          handleToggleFlip();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handlePrev();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleNext();
          break;
        case 'ArrowUp':
          if (currentWord) {
            e.preventDefault();
            onToggleFavorite(currentWord.id);
          }
          break;
        case 'ArrowDown':
        case 'KeyM':
          if (currentWord) {
            e.preventDefault();
            onToggleMaster(currentWord.id);
          }
          break;
        case 'KeyA':
          e.preventDefault();
          playCurrentAudio();
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'Escape':
          if (isFullscreen) {
            e.preventDefault();
            toggleFullscreen();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleToggleFlip, handlePrev, handleNext, currentWord, onToggleFavorite, onToggleMaster, playCurrentAudio, toggleFullscreen, isFullscreen]);

  const starredCount = useMemo(() => {
    return words.filter(w => favoriteWords.includes(w.id)).length;
  }, [words, favoriteWords]);

  const masteredInSetCount = useMemo(() => {
    return words.filter(w => masteredWords.includes(w.id)).length;
  }, [words, masteredWords]);

  // Trường hợp bộ lọc từ gắn sao rỗng
  if (filterMode === 'starred' && starredCount === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-6 text-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-sm">
        <Star className="w-12 h-12 text-amber-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Chưa có từ nào được gắn sao ★
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
          Hãy gắn sao cho các từ khó hoặc từ bạn hay quên trong bài học để tập trung ôn tập riêng.
        </p>
        <button
          onClick={() => setFilterMode('all')}
          className="mt-5 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm"
        >
          Quay lại học tất cả từ ({words.length})
        </button>
      </div>
    );
  }

  if (!currentWord || filteredWords.length === 0) {
    return (
      <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-8 shadow-sm max-w-2xl mx-auto">
        <p className="text-slate-500 dark:text-zinc-400">Không có từ vựng nào trong danh sách này.</p>
      </div>
    );
  }

  const isCurrentMastered = masteredWords.includes(currentWord.id);
  const isCurrentFavorite = favoriteWords.includes(currentWord.id);

  // Màu sắc tối dịu mắt (khi bật Night Mode hoặc đang ở chế độ Fullscreen)
  const isDarkCard = isFullscreen || isNightMode;

  // Giao diện thẻ Flashcard chính (dùng chung cho cả chế độ thường và Toàn màn hình)
  const renderCard = (cardHeightClass: string) => (
    <div 
      onClick={handleToggleFlip}
      className={`w-full ${cardHeightClass} perspective-1000 cursor-pointer select-none group relative`}
    >
      <div 
        className={`w-full h-full relative duration-500 transform-style-3d transition-transform ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* MẶT TRƯỚC (Front Card) */}
        <div 
          className={`absolute inset-0 backface-hidden rounded-3xl p-6 sm:p-10 flex flex-col justify-between items-center transition-all ${
            isDarkCard
              ? 'bg-[#151926] border-2 border-slate-700/80 text-slate-100 shadow-2xl group-hover:border-indigo-400/80 shadow-indigo-950/20'
              : 'bg-white dark:bg-zinc-900 border-2 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white shadow-xl group-hover:border-indigo-400 dark:group-hover:border-indigo-600/60'
          }`}
        >
          {/* Header Thẻ: Loa + Gắn sao */}
          <div className="w-full flex items-center justify-between">
            <button
              onClick={(e) => {
                e.stopPropagation();
                playCurrentAudio();
              }}
              className={`p-3 rounded-2xl transition hover:scale-110 active:scale-95 ${
                isDarkCard
                  ? 'bg-indigo-950/80 text-indigo-400 hover:bg-indigo-900 border border-indigo-800/60'
                  : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
              }`}
              title="Nghe phát âm (Phím A)"
            >
              <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider ${
                isDarkCard
                  ? 'bg-slate-800 text-slate-300 border border-slate-700/60'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400'
              }`}>
                {frontSide === 'ja' ? 'Tiếng Nhật' : 'Nghĩa tiếng Việt'}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(currentWord.id);
                }}
                className={`p-3 rounded-2xl transition hover:scale-110 active:scale-95 ${
                  isCurrentFavorite 
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' 
                    : isDarkCard
                    ? 'text-slate-500 hover:text-amber-400 hover:bg-slate-800/80'
                    : 'text-slate-300 dark:text-zinc-600 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-zinc-800'
                }`}
                title="Gắn sao từ khó (Phím Mũi tên Lên ↑)"
              >
                <Star className={`w-5 h-5 sm:w-6 sm:h-6 ${isCurrentFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {/* Nội dung Trung tâm Mặt trước: Kích thước TO, rõ nét, dịu mắt */}
          {frontSide === 'ja' ? (
            <div className="text-center my-auto px-4 sm:px-8 max-w-2xl">
              <p className={`text-base sm:text-xl font-medium tracking-wider mb-2.5 ${
                isDarkCard ? 'text-indigo-300' : 'text-slate-400 dark:text-zinc-400'
              }`}>
                {currentWord.kana}
              </p>
              <h2 className={`text-6xl sm:text-7xl md:text-8xl font-jp font-bold tracking-wide leading-tight ${
                isDarkCard ? 'text-slate-50' : 'text-slate-900 dark:text-white'
              }`}>
                {currentWord.kanji || currentWord.kana}
              </h2>
              {currentWord.romaji && (
                <p className={`text-sm sm:text-base font-mono mt-3 uppercase tracking-widest ${
                  isDarkCard ? 'text-slate-400' : 'text-slate-400 dark:text-zinc-500'
                }`}>
                  [{currentWord.romaji}]
                </p>
              )}
              {currentWord.hanviet && (
                <span className={`inline-block mt-3.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold border ${
                  isDarkCard
                    ? 'bg-rose-950/50 border-rose-800/50 text-rose-300'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200/60 dark:border-rose-900/40 text-rose-600 dark:text-rose-400'
                }`}>
                  HÁN VIỆT: {currentWord.hanviet}
                </span>
              )}
            </div>
          ) : (
            <div className="text-center my-auto px-4 sm:px-8 max-w-2xl">
              <span className="text-xs sm:text-sm font-bold text-indigo-400 uppercase tracking-widest block mb-3">
                Hãy nhớ từ tiếng Nhật:
              </span>
              <h3 className={`text-3xl sm:text-4xl md:text-5xl font-extrabold leading-snug ${
                isDarkCard ? 'text-slate-50' : 'text-slate-900 dark:text-white'
              }`}>
                {currentWord.meaning}
              </h3>
              {currentWord.hanviet && (
                <p className="text-xs sm:text-sm text-rose-400 font-bold mt-3">
                  Âm Hán: {currentWord.hanviet}
                </p>
              )}
            </div>
          )}

          {/* Hint Chạm để lật */}
          <div className={`flex items-center space-x-1.5 text-xs sm:text-sm ${
            isDarkCard ? 'text-slate-400' : 'text-slate-400 dark:text-zinc-500'
          }`}>
            <RotateCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Chạm hoặc bấm <strong className={isDarkCard ? 'text-slate-200' : 'text-slate-700 dark:text-zinc-200'}>Space</strong> để lật</span>
          </div>
        </div>

        {/* MẶT SAU (Back Card) */}
        <div 
          className={`absolute inset-0 backface-hidden rotate-y-180 rounded-3xl p-6 sm:p-10 flex flex-col justify-between items-center transition-all ${
            isDarkCard
              ? 'bg-gradient-to-b from-[#151926] to-[#0f121d] border-2 border-indigo-500/50 text-slate-100 shadow-2xl'
              : 'bg-gradient-to-b from-white to-slate-50 dark:from-zinc-900 dark:to-zinc-950 border-2 border-indigo-300 dark:border-indigo-800 text-slate-900 dark:text-white shadow-xl'
          }`}
        >
          {/* Header Mặt sau */}
          <div className="w-full flex items-center justify-between">
            <span className={`px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider ${
              isDarkCard
                ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-800/60'
                : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
            }`}>
              {frontSide === 'ja' ? 'Nghĩa tiếng Việt' : 'Tiếng Nhật (Kanji/Kana)'}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                playCurrentAudio();
              }}
              className={`p-2.5 rounded-xl transition ${
                isDarkCard
                  ? 'text-indigo-300 hover:bg-slate-800'
                  : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40'
              }`}
              title="Phát âm"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>

          {/* Nội dung Trung tâm Mặt sau */}
          {frontSide === 'ja' ? (
            <div className="text-center my-auto px-4 sm:px-6 w-full max-w-2xl space-y-3.5">
              <h3 className={`text-3xl sm:text-4xl md:text-5xl font-extrabold leading-snug ${
                isDarkCard ? 'text-slate-50' : 'text-slate-900 dark:text-white'
              }`}>
                {currentWord.meaning}
              </h3>
              {currentWord.meaning_en && (
                <p className={`text-xs sm:text-sm italic ${
                  isDarkCard ? 'text-slate-400' : 'text-slate-400 dark:text-zinc-500'
                }`}>
                  EN: {currentWord.meaning_en}
                </p>
              )}

              {/* Câu ví dụ ngữ cảnh */}
              {currentWord.examples && currentWord.examples.length > 0 && (
                <div 
                  onClick={(e) => e.stopPropagation()} 
                  className={`mt-4 text-left p-4 sm:p-5 rounded-2xl space-y-1.5 border shadow-xs ${
                    isDarkCard
                      ? 'bg-slate-800/80 border-slate-700 text-slate-200'
                      : 'bg-purple-50/80 dark:bg-zinc-800/80 border-purple-100 dark:border-zinc-700/60'
                  }`}
                >
                  <div className={`flex items-center justify-between text-xs font-bold uppercase tracking-wider ${
                    isDarkCard ? 'text-purple-300' : 'text-purple-600 dark:text-purple-400'
                  }`}>
                    <span className="flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Ví dụ ngữ cảnh:</span>
                    </span>
                    <button
                      onClick={() => speakJapanese(currentWord.examples![0].ja || '')}
                      className={`p-1.5 rounded-lg transition ${
                        isDarkCard ? 'text-purple-300 hover:bg-slate-700' : 'text-purple-600 hover:bg-purple-100'
                      }`}
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className={`font-jp text-base sm:text-lg font-bold ${
                    isDarkCard ? 'text-slate-100' : 'text-slate-900 dark:text-zinc-100'
                  }`}>
                    {currentWord.examples[0].ja}
                  </p>
                  <p className={`text-xs sm:text-sm font-medium ${
                    isDarkCard ? 'text-slate-300' : 'text-slate-600 dark:text-zinc-300'
                  }`}>
                    👉 {currentWord.examples[0].vi}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center my-auto px-4 sm:px-6 w-full max-w-2xl space-y-2.5">
              <p className="text-base sm:text-xl font-bold text-indigo-400 tracking-wider">
                {currentWord.kana}
              </p>
              <h2 className={`text-5xl sm:text-6xl md:text-7xl font-jp font-bold ${
                isDarkCard ? 'text-slate-50' : 'text-slate-900 dark:text-white'
              }`}>
                {currentWord.kanji || currentWord.kana}
              </h2>
              {currentWord.romaji && (
                <p className={`text-xs sm:text-sm font-mono uppercase tracking-widest ${
                  isDarkCard ? 'text-slate-400' : 'text-slate-400 dark:text-zinc-500'
                }`}>
                  [{currentWord.romaji}]
                </p>
              )}
            </div>
          )}

          {/* Chân Thẻ mặt sau */}
          <div className={`w-full pt-3.5 border-t flex items-center justify-between ${
            isDarkCard ? 'border-slate-800' : 'border-slate-100 dark:border-zinc-800'
          }`}>
            <span className={`text-xs sm:text-sm font-medium ${
              isDarkCard ? 'text-slate-400' : 'text-slate-400'
            }`}>
              {isCurrentMastered ? '✓ Đã thuộc' : 'Chưa thuộc'}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleMaster(currentWord.id);
              }}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition ${
                isCurrentMastered
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : isDarkCard
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-emerald-50 hover:text-emerald-600'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>{isCurrentMastered ? 'Đã thuộc ✓' : 'Đánh dấu thuộc'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Thanh điều khiển dưới cùng (Prev / Master / Next)
  const renderBottomControls = () => (
    <div className="w-full flex items-center justify-between gap-3 mt-6 px-1">
      <button
        onClick={handlePrev}
        className={`flex items-center space-x-1.5 px-4 sm:px-6 py-3 rounded-2xl font-bold text-xs sm:text-base border transition active:scale-95 shadow-sm ${
          isDarkCard
            ? 'bg-[#151926] border-slate-700 text-slate-200 hover:bg-slate-800'
            : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800'
        }`}
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        <span>Thẻ trước</span>
      </button>

      <button
        onClick={() => onToggleMaster(currentWord.id)}
        className={`px-5 sm:px-8 py-3 rounded-2xl font-bold text-xs sm:text-base transition flex items-center space-x-2 shadow-md active:scale-95 ${
          isCurrentMastered 
            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/25'
        }`}
      >
        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
        <span>{isCurrentMastered ? 'Đã thuộc ✓' : 'Thuộc từ này'}</span>
      </button>

      <button
        onClick={handleNext}
        className={`flex items-center space-x-1.5 px-4 sm:px-6 py-3 rounded-2xl font-bold text-xs sm:text-base border transition active:scale-95 shadow-sm ${
          isDarkCard
            ? 'bg-[#151926] border-slate-700 text-slate-200 hover:bg-slate-800'
            : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800'
        }`}
      >
        <span>Thẻ tiếp</span>
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
    </div>
  );

  // Modal bảng hướng dẫn phím tắt
  const renderShortcutsModal = () => (
    showShortcutsHelp && (
      <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
              <Keyboard className="w-5 h-5" />
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Phím tắt Flashcard</h4>
            </div>
            <button 
              onClick={() => setShowShortcutsHelp(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-600 dark:text-zinc-300">Lật thẻ</span>
              <kbd className="px-2 py-1 bg-slate-100 dark:bg-zinc-800 rounded-md font-mono text-slate-800 dark:text-zinc-200 font-bold">Space / Enter</kbd>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-600 dark:text-zinc-300">Thẻ trước / Thẻ tiếp</span>
              <kbd className="px-2 py-1 bg-slate-100 dark:bg-zinc-800 rounded-md font-mono text-slate-800 dark:text-zinc-200 font-bold">← / →</kbd>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-600 dark:text-zinc-300">Toàn màn hình nền tối</span>
              <kbd className="px-2 py-1 bg-slate-100 dark:bg-zinc-800 rounded-md font-mono text-slate-800 dark:text-zinc-200 font-bold">Phím F</kbd>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-600 dark:text-zinc-300">Thoát toàn màn hình</span>
              <kbd className="px-2 py-1 bg-slate-100 dark:bg-zinc-800 rounded-md font-mono text-slate-800 dark:text-zinc-200 font-bold">Esc</kbd>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-600 dark:text-zinc-300">Gắn sao từ khó</span>
              <kbd className="px-2 py-1 bg-slate-100 dark:bg-zinc-800 rounded-md font-mono text-slate-800 dark:text-zinc-200 font-bold">↑ Mũi tên lên</kbd>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-600 dark:text-zinc-300">Đánh dấu đã thuộc</span>
              <kbd className="px-2 py-1 bg-slate-100 dark:bg-zinc-800 rounded-md font-mono text-slate-800 dark:text-zinc-200 font-bold">↓ / Phím M</kbd>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-600 dark:text-zinc-300">Phát âm tiếng Nhật</span>
              <kbd className="px-2 py-1 bg-slate-100 dark:bg-zinc-800 rounded-md font-mono text-slate-800 dark:text-zinc-200 font-bold">Phím A</kbd>
            </div>
          </div>

          <button
            onClick={() => setShowShortcutsHelp(false)}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    )
  );

  // NẾU ĐANG BẬT TOÀN MÀN HÌNH MÀU TỐI (FULLSCREEN DARK EYE-CARE MODE)
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#0c1017] text-slate-100 flex flex-col justify-between p-4 sm:p-6 md:p-8 min-h-screen select-none overflow-y-auto animate-in fade-in duration-200">
        {/* Vầng hào quang nền tối dịu mắt (Ambient background aura) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-indigo-500/10 blur-[130px] rounded-full" />
          <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-500/10 blur-[130px] rounded-full" />
        </div>

        {/* 1. Header trên cùng Fullscreen */}
        <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          {/* Bộ lọc */}
          <div className="flex items-center space-x-1.5 bg-slate-800/80 p-1 rounded-2xl text-xs font-bold border border-slate-700/60">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-xl transition ${
                filterMode === 'all'
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Tất cả ({words.length})
            </button>
            <button
              onClick={() => setFilterMode('starred')}
              className={`px-3 py-1.5 rounded-xl flex items-center space-x-1 transition ${
                filterMode === 'starred'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-400 hover:text-amber-400'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${starredCount > 0 ? 'fill-current' : ''}`} />
              <span>Gắn sao ({starredCount})</span>
            </button>
          </div>

          {/* Tiến độ ở giữa */}
          <div className="flex items-center space-x-4 text-xs font-bold text-slate-300">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Đã thuộc: <strong className="text-emerald-400">{masteredInSetCount}</strong> / {words.length}</span>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 font-extrabold text-slate-200">
              Thẻ {currentIndex + 1} / {filteredWords.length}
            </span>
          </div>

          {/* Các nút công cụ + Nút Thoát toàn màn hình */}
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setIsShuffled(!isShuffled)}
              className={`p-2 rounded-xl text-xs font-bold border transition ${
                isShuffled
                  ? 'bg-indigo-950/80 border-indigo-600 text-indigo-400'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
              }`}
              title="Xáo trộn từ"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setFrontSide(prev => prev === 'ja' ? 'vi' : 'ja');
                setIsFlipped(false);
              }}
              className="p-2 rounded-xl text-xs font-bold bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white transition flex items-center space-x-1"
              title="Đổi mặt thẻ"
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">{frontSide === 'ja' ? 'Nhật ➔ Việt' : 'Việt ➔ Nhật'}</span>
            </button>

            <button
              onClick={() => setAutoAudio(!autoAudio)}
              className={`p-2 rounded-xl text-xs font-bold border transition ${
                autoAudio
                  ? 'bg-emerald-950/80 border-emerald-600 text-emerald-400'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
              }`}
              title="Tự động phát âm"
            >
              {autoAudio ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setShowShortcutsHelp(!showShortcutsHelp)}
              className="p-2 rounded-xl text-xs font-bold bg-slate-800/80 border border-slate-700 text-slate-400 hover:text-white transition"
              title="Phím tắt"
            >
              <Keyboard className="w-4 h-4" />
            </button>

            {/* Nút THOÁT TOÀN MÀN HÌNH */}
            <button
              onClick={toggleFullscreen}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold transition ml-2 shadow-xs active:scale-95"
              title="Thoát toàn màn hình (Phím Esc hoặc F)"
            >
              <Minimize2 className="w-4 h-4" />
              <span>Thoát (Esc)</span>
            </button>
          </div>
        </div>

        {/* Thanh tiến độ viền mỏng */}
        <div className="relative z-10 w-full max-w-5xl mx-auto my-2">
          <div className="w-full h-1.5 bg-slate-800/80 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-rose-500 via-indigo-500 to-emerald-400 transition-all duration-300 rounded-full"
              style={{ width: `${Math.round(((currentIndex + 1) / filteredWords.length) * 100)}%` }}
            />
          </div>
        </div>

        {/* 2. KHỐI THẺ FLASHCARD TO VÀ RỘNG Ở TRUNG TÂM */}
        <div className="relative z-10 w-full max-w-4xl mx-auto my-auto py-2">
          {renderCard('h-[440px] sm:h-[500px] md:h-[540px] max-h-[62vh]')}
        </div>

        {/* 3. ĐIỀU HƯỚNG DƯỚI CÙNG & PHÍM TẮT NHANH */}
        <div className="relative z-10 w-full max-w-4xl mx-auto">
          {renderBottomControls()}
          
          {/* Dòng tóm tắt phím tắt thuận mắt ở đáy màn hình */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[11px] font-medium text-slate-400 mt-4 pt-3 border-t border-slate-800/60">
            <span><kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">Space</kbd> Lật thẻ</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">← / →</kbd> Chuyển thẻ</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">M</kbd> Thuộc từ</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">A</kbd> Nghe</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">F / Esc</kbd> Toàn màn hình</span>
          </div>
        </div>

        {renderShortcutsModal()}
      </div>
    );
  }

  // CHẾ ĐỘ XEM TIÊU CHUẨN (CARD TO HƠN, RỘNG HÃI, CÓ NÚT FULL MÀN HÌNH & NỀN TỐI)
  return (
    <div className="w-full max-w-3xl lg:max-w-4xl mx-auto flex flex-col items-center transition-all duration-300">
      {/* 1. THANH ĐIỀU HƯỚNG TÙY BIẾN CHUẨN QUIZLET */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2.5 mb-4">
        {/* Bộ lọc Tất cả vs Gắn sao */}
        <div className={`flex items-center space-x-1 p-1 rounded-2xl text-xs font-bold ${
          isNightMode ? 'bg-slate-800/90 border border-slate-700/60' : 'bg-slate-100 dark:bg-zinc-800'
        }`}>
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-xl transition ${
              filterMode === 'all'
                ? isNightMode
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Tất cả ({words.length})
          </button>
          <button
            onClick={() => setFilterMode('starred')}
            className={`px-3 py-1.5 rounded-xl flex items-center space-x-1 transition ${
              filterMode === 'starred'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-500 dark:text-zinc-400 hover:text-amber-500'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${starredCount > 0 ? 'fill-current' : ''}`} />
            <span>Gắn sao ({starredCount})</span>
          </button>
        </div>

        {/* Các nút công cụ: Toàn màn hình, Nền tối dịu mắt, Xáo trộn, Đổi chiều mặt trước, Tự động đọc, Trợ giúp */}
        <div className="flex items-center space-x-1.5">
          {/* NÚT TOÀN MÀN HÌNH NỀN TỐI (FULLSCREEN) */}
          <button
            onClick={toggleFullscreen}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center space-x-1.5 shadow-sm active:scale-95 ${
              isNightMode
                ? 'bg-indigo-950/80 border-indigo-600/70 text-indigo-300 hover:bg-indigo-900'
                : 'bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
            }`}
            title="Bật Toàn màn hình màu tối cho dịu mắt (Phím F)"
          >
            <Maximize2 className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden sm:inline">Toàn màn hình</span>
          </button>

          {/* NÚT BẬT / TẮT CHẾ ĐỘ NỀN TỐI DỊU MẮT (NIGHT EYE-CARE) */}
          <button
            onClick={() => setIsNightMode(!isNightMode)}
            className={`p-2 rounded-xl text-xs font-bold border transition ${
              isNightMode
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 shadow-xs'
                : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title={isNightMode ? 'Đang bật nền tối dịu mắt (Bấm để về giao diện sáng)' : 'Bật nền tối dịu mắt cho thẻ'}
          >
            {isNightMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {/* Nút Xáo trộn */}
          <button
            onClick={() => setIsShuffled(!isShuffled)}
            className={`p-2 rounded-xl text-xs font-bold border transition flex items-center space-x-1 ${
              isShuffled
                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'
                : isNightMode
                ? 'bg-slate-800/90 border-slate-700 text-slate-300 hover:text-white'
                : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Xáo trộn thứ tự thẻ (Shuffle)"
          >
            <Shuffle className="w-3.5 h-3.5" />
          </button>

          {/* Nút Đổi chiều thẻ: Mặt trước Kanji hay Tiếng Việt */}
          <button
            onClick={() => {
              setFrontSide(prev => prev === 'ja' ? 'vi' : 'ja');
              setIsFlipped(false);
            }}
            className={`p-2 rounded-xl text-xs font-bold border transition flex items-center space-x-1 ${
              isNightMode
                ? 'bg-slate-800/90 border-slate-700 text-slate-300 hover:text-white'
                : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title={`Mặt trước: ${frontSide === 'ja' ? 'Tiếng Nhật' : 'Tiếng Việt'} (Bấm để đổi)`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span className="text-[11px] hidden md:inline">
              {frontSide === 'ja' ? 'Nhật ➔ Việt' : 'Việt ➔ Nhật'}
            </span>
          </button>

          {/* Nút Bật/Tắt tự động phát âm */}
          <button
            onClick={() => setAutoAudio(!autoAudio)}
            className={`p-2 rounded-xl text-xs font-bold border transition ${
              autoAudio
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400'
                : isNightMode
                ? 'bg-slate-800/90 border-slate-700 text-slate-500 hover:text-slate-300'
                : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-400 hover:text-slate-600'
            }`}
            title={autoAudio ? 'Tự động phát âm: ĐANG BẬT' : 'Tự động phát âm: ĐÃ TẮT'}
          >
            {autoAudio ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Phím tắt trợ giúp */}
          <button
            onClick={() => setShowShortcutsHelp(!showShortcutsHelp)}
            className={`p-2 rounded-xl text-xs font-bold border transition ${
              isNightMode
                ? 'bg-slate-800/90 border-slate-700 text-slate-400 hover:text-white'
                : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200'
            }`}
            title="Hướng dẫn phím tắt"
          >
            <Keyboard className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. THANH TIẾN ĐỘ CHẠY TRÊN CÙNG */}
      <div className="w-full mb-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-zinc-400 mb-1.5 px-1">
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Đã thuộc: <strong className="text-emerald-600 dark:text-emerald-400">{masteredInSetCount}</strong> / {words.length}</span>
          </span>
          <span>
            Thẻ <strong className="text-slate-900 dark:text-white font-extrabold">{currentIndex + 1}</strong> / {filteredWords.length}
          </span>
        </div>
        <div className={`w-full h-1.5 rounded-full overflow-hidden ${
          isNightMode ? 'bg-slate-800' : 'bg-slate-100 dark:bg-zinc-800'
        }`}>
          <div 
            className="h-full bg-gradient-to-r from-rose-500 to-indigo-500 transition-all duration-300 rounded-full"
            style={{ width: `${Math.round(((currentIndex + 1) / filteredWords.length) * 100)}%` }}
          />
        </div>
      </div>

      {/* 3. THẺ 3D FLIP CONTAINER: KÍCH THƯỚC LỚN HƠN, RỘNG RÃI */}
      {renderCard('h-[400px] sm:h-[460px] md:h-[490px]')}

      {/* 4. NÚT ĐIỀU HƯỚNG DƯỚI CÙNG (PREV / NEXT / MASTER) */}
      {renderBottomControls()}

      {/* 5. MODAL HƯỚNG DẪN PHÍM TẮT */}
      {renderShortcutsModal()}
    </div>
  );
};
