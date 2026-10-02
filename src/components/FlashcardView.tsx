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
  ListFilter
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

  // 5. Hiển thị bảng trợ giúp phím tắt
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

  // Lắng nghe phím tắt bàn phím chuẩn Quizlet
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
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleToggleFlip, handlePrev, handleNext, currentWord, onToggleFavorite, onToggleMaster, playCurrentAudio]);

  const starredCount = useMemo(() => {
    return words.filter(w => favoriteWords.includes(w.id)).length;
  }, [words, favoriteWords]);

  const masteredInSetCount = useMemo(() => {
    return words.filter(w => masteredWords.includes(w.id)).length;
  }, [words, masteredWords]);

  // Trường hợp bộ lọc từ gắn sao rỗng
  if (filterMode === 'starred' && starredCount === 0) {
    return (
      <div className="max-w-xl mx-auto py-16 px-6 text-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-sm">
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
      <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-8 shadow-sm">
        <p className="text-slate-500 dark:text-zinc-400">Không có từ vựng nào trong danh sách này.</p>
      </div>
    );
  }

  const isCurrentMastered = masteredWords.includes(currentWord.id);
  const isCurrentFavorite = favoriteWords.includes(currentWord.id);

  // Nội dung Mặt A (Japanese) và Mặt B (Vietnamese)
  const isFrontJa = frontSide === 'ja';
  // Nếu frontSide === 'ja', isFlipped = false hiển thị Tiếng Nhật, isFlipped = true hiển thị Tiếng Việt
  // Nếu frontSide === 'vi', isFlipped = false hiển thị Tiếng Việt, isFlipped = true hiển thị Tiếng Nhật
  const showingJapanese = (isFrontJa && !isFlipped) || (!isFrontJa && isFlipped);

  return (
    <div className="max-w-xl mx-auto flex flex-col items-center">
      {/* 1. THANH ĐIỀU HƯỚNG TÙY BIẾN CHUẨN QUIZLET */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2 mb-4">
        {/* Bộ lọc Tất cả vs Gắn sao */}
        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-zinc-800 p-1 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-xl transition ${
              filterMode === 'all'
                ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs'
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

        {/* Các nút công cụ: Xáo trộn, Đổi chiều mặt trước, Tự động đọc, Trợ giúp */}
        <div className="flex items-center space-x-1.5">
          {/* Nút Xáo trộn */}
          <button
            onClick={() => setIsShuffled(!isShuffled)}
            className={`p-2 rounded-xl text-xs font-bold border transition flex items-center space-x-1 ${
              isShuffled
                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'
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
            className="p-2 rounded-xl text-xs font-bold bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition flex items-center space-x-1"
            title={`Mặt trước: ${frontSide === 'ja' ? 'Tiếng Nhật' : 'Tiếng Việt'} (Bấm để đổi)`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span className="text-[11px] hidden sm:inline">
              {frontSide === 'ja' ? 'Nhật ➔ Việt' : 'Việt ➔ Nhật'}
            </span>
          </button>

          {/* Nút Bật/Tắt tự động phát âm */}
          <button
            onClick={() => setAutoAudio(!autoAudio)}
            className={`p-2 rounded-xl text-xs font-bold border transition ${
              autoAudio
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400'
                : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-400 hover:text-slate-600'
            }`}
            title={autoAudio ? 'Tự động phát âm: ĐANG BẬT' : 'Tự động phát âm: ĐÃ TẮT'}
          >
            {autoAudio ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Phím tắt trợ giúp */}
          <button
            onClick={() => setShowShortcutsHelp(!showShortcutsHelp)}
            className="p-2 rounded-xl text-xs font-bold bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition"
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
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Đã thuộc: <strong className="text-emerald-600 dark:text-emerald-400">{masteredInSetCount}</strong> / {words.length}</span>
          </span>
          <span>
            Thẻ <strong className="text-slate-900 dark:text-white font-extrabold">{currentIndex + 1}</strong> / {filteredWords.length}
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-rose-500 to-indigo-500 transition-all duration-300 rounded-full"
            style={{ width: `${Math.round(((currentIndex + 1) / filteredWords.length) * 100)}%` }}
          />
        </div>
      </div>

      {/* 3. THẺ 3D FLIP CONTAINER */}
      <div 
        onClick={handleToggleFlip}
        className="w-full h-80 sm:h-96 perspective-1000 cursor-pointer select-none group relative"
      >
        <div 
          className={`w-full h-full relative duration-500 transform-style-3d transition-transform ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* MẶT TRƯỚC (Front Card) */}
          <div className="absolute inset-0 backface-hidden rounded-3xl bg-white dark:bg-zinc-900 border-2 border-slate-200 dark:border-zinc-800 shadow-xl p-6 sm:p-8 flex flex-col justify-between items-center group-hover:border-indigo-400 dark:group-hover:border-indigo-600/60 transition-all">
            {/* Header Thẻ: Loa + Gắn sao */}
            <div className="w-full flex items-center justify-between">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playCurrentAudio();
                }}
                className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:scale-110 active:scale-95 transition"
                title="Nghe phát âm (Phím A)"
              >
                <Volume2 className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-1.5">
                <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400">
                  {frontSide === 'ja' ? 'Tiếng Nhật' : 'Nghĩa tiếng Việt'}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(currentWord.id);
                  }}
                  className={`p-2.5 rounded-2xl transition ${
                    isCurrentFavorite 
                      ? 'bg-amber-500/15 text-amber-500' 
                      : 'text-slate-300 dark:text-zinc-600 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-zinc-800'
                  }`}
                  title="Gắn sao từ khó (Phím Mũi tên Lên ↑)"
                >
                  <Star className={`w-5 h-5 ${isCurrentFavorite ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            {/* Nội dung Trung tâm Mặt trước */}
            {frontSide === 'ja' ? (
              // Tiếng Nhật mặt trước
              <div className="text-center my-auto px-4">
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
                {currentWord.hanviet && (
                  <span className="inline-block mt-3 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
                    HÁN VIỆT: {currentWord.hanviet}
                  </span>
                )}
              </div>
            ) : (
              // Tiếng Việt mặt trước
              <div className="text-center my-auto px-4">
                <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest block mb-2">
                  Hãy nhớ từ tiếng Nhật:
                </span>
                <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-snug">
                  {currentWord.meaning}
                </h3>
                {currentWord.hanviet && (
                  <p className="text-xs text-rose-500 font-bold mt-2">
                    Âm Hán: {currentWord.hanviet}
                  </p>
                )}
              </div>
            )}

            {/* Hint Chạm để lật */}
            <div className="flex items-center space-x-1 text-xs text-slate-400 dark:text-zinc-500">
              <RotateCw className="w-3.5 h-3.5" />
              <span>Chạm hoặc bấm <strong className="text-slate-600 dark:text-zinc-300">Space</strong> để lật</span>
            </div>
          </div>

          {/* MẶT SAU (Back Card) */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-3xl bg-gradient-to-b from-white to-slate-50 dark:from-zinc-900 dark:to-zinc-950 border-2 border-indigo-300 dark:border-indigo-800 shadow-xl p-6 sm:p-8 flex flex-col justify-between items-center">
            {/* Header Mặt sau */}
            <div className="w-full flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                {frontSide === 'ja' ? 'Nghĩa tiếng Việt' : 'Tiếng Nhật (Kanji/Kana)'}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playCurrentAudio();
                }}
                className="p-2 rounded-xl text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            {/* Nội dung Trung tâm Mặt sau */}
            {frontSide === 'ja' ? (
              // Tiếng Việt ở mặt sau
              <div className="text-center my-auto px-4 w-full space-y-3">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-snug">
                  {currentWord.meaning}
                </h3>
                {currentWord.meaning_en && (
                  <p className="text-xs text-slate-400 dark:text-zinc-500 italic">
                    EN: {currentWord.meaning_en}
                  </p>
                )}

                {/* Câu ví dụ ngữ pháp nếu có */}
                {currentWord.examples && currentWord.examples.length > 0 && (
                  <div 
                    onClick={(e) => e.stopPropagation()} 
                    className="mt-2 text-left bg-purple-50/80 dark:bg-zinc-800/80 border border-purple-100 dark:border-zinc-700/60 p-3 rounded-2xl space-y-1 shadow-xs"
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                      <span className="flex items-center space-x-1">
                        <Sparkles className="w-3 h-3" />
                        <span>Ví dụ ngữ cảnh:</span>
                      </span>
                      <button
                        onClick={() => speakJapanese(currentWord.examples![0].ja || '')}
                        className="p-1 rounded-md text-purple-600 hover:bg-purple-100 transition"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="font-jp text-sm font-bold text-slate-900 dark:text-zinc-100">
                      {currentWord.examples[0].ja}
                    </p>
                    <p className="text-xs font-medium text-slate-600 dark:text-zinc-300">
                      👉 {currentWord.examples[0].vi}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              // Tiếng Nhật ở mặt sau
              <div className="text-center my-auto px-4 w-full space-y-2">
                <p className="text-base font-bold text-indigo-500 tracking-wider">
                  {currentWord.kana}
                </p>
                <h2 className="text-4xl sm:text-5xl font-jp font-bold text-slate-900 dark:text-white">
                  {currentWord.kanji || currentWord.kana}
                </h2>
                {currentWord.romaji && (
                  <p className="text-xs font-mono text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
                    [{currentWord.romaji}]
                  </p>
                )}
              </div>
            )}

            {/* Chân Thẻ mặt sau */}
            <div className="w-full pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">
                {isCurrentMastered ? '✓ Đã thuộc' : 'Chưa thuộc'}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleMaster(currentWord.id);
                }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  isCurrentMastered
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-emerald-50 hover:text-emerald-600'
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{isCurrentMastered ? 'Đã thuộc ✓' : 'Đánh dấu thuộc'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. NÚT ĐIỀU HƯỚNG DƯỚI CÙNG (PREV / NEXT / MASTER) */}
      <div className="w-full flex items-center justify-between mt-6 px-1">
        <button
          onClick={handlePrev}
          className="flex items-center space-x-1.5 px-4 sm:px-5 py-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-200 font-bold text-xs sm:text-sm shadow-sm hover:bg-slate-50 dark:hover:bg-zinc-800 active:scale-95 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Thẻ trước</span>
        </button>

        <button
          onClick={() => onToggleMaster(currentWord.id)}
          className={`px-4 sm:px-6 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition flex items-center space-x-1.5 ${
            isCurrentMastered 
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 active:scale-95'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          <span>{isCurrentMastered ? 'Đã thuộc' : 'Thuộc từ này'}</span>
        </button>

        <button
          onClick={handleNext}
          className="flex items-center space-x-1.5 px-4 sm:px-5 py-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-200 font-bold text-xs sm:text-sm shadow-sm hover:bg-slate-50 dark:hover:bg-zinc-800 active:scale-95 transition"
        >
          <span>Thẻ tiếp</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* 5. MODAL / POPUP HƯỚNG DẪN PHÍM TẮT CHUẨN QUIZLET */}
      {showShortcutsHelp && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
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

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-600 dark:text-zinc-300">Lật thẻ</span>
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-zinc-800 rounded-md font-mono text-slate-800 dark:text-zinc-200 font-bold">Space / Enter</kbd>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-600 dark:text-zinc-300">Thẻ trước / Thẻ tiếp</span>
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-zinc-800 rounded-md font-mono text-slate-800 dark:text-zinc-200 font-bold">← / →</kbd>
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
      )}
    </div>
  );
};
