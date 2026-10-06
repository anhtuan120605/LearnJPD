import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { KanjiItem } from '../types';
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
  PenTool,
  BookOpen,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Moon,
  Sun
} from 'lucide-react';
import { speakJapanese, stopSpeaking } from '../lib/audio';
import { KanjiStrokeModal } from './KanjiStrokeModal';

interface KanjiFlashcardViewProps {
  kanjiList: KanjiItem[];
  masteredKanji: string[];
  favoriteKanji: string[];
  onToggleMaster: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export const KanjiFlashcardView: React.FC<KanjiFlashcardViewProps> = ({
  kanjiList,
  masteredKanji,
  favoriteKanji,
  onToggleMaster,
  onToggleFavorite
}) => {
  // 1. Tùy chọn lọc: 'all' | 'unlearned' | 'starred'
  const [filterMode, setFilterMode] = useState<'all' | 'unlearned' | 'starred'>('all');

  // 2. Tùy chọn xáo trộn
  const [isShuffled, setIsShuffled] = useState(false);

  // 3. Tùy chọn mặt trước: 'kanji' (Chữ Hán trước) | 'hanviet' (Âm Hán Việt / Nghĩa trước)
  const [frontSide, setFrontSide] = useState<'kanji' | 'hanviet'>('kanji');

  // 4. Tự động phát âm
  const [autoAudio, setAutoAudio] = useState(true);

  // 5. Hiển thị gợi ý mặt trước
  const [showHint, setShowHint] = useState(false);

  // 6. Chế độ Toàn màn hình & Nền tối dịu mắt (Eye-care Dark Mode)
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isNightMode, setIsNightMode] = useState(false);

  // 7. Hiển thị bảng phím tắt
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

  // 8. Modal tập viết nét chữ
  const [strokeModalKanji, setStrokeModalKanji] = useState<KanjiItem | null>(null);

  // Danh sách Kanji sau lọc & shuffle
  const filteredList = useMemo(() => {
    let list = kanjiList;
    if (filterMode === 'starred') {
      list = kanjiList.filter(k => favoriteKanji.includes(k.id));
    } else if (filterMode === 'unlearned') {
      list = kanjiList.filter(k => !masteredKanji.includes(k.id));
    }

    if (isShuffled && list.length > 1) {
      const copy = [...list];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    }
    return list;
  }, [kanjiList, filterMode, favoriteKanji, masteredKanji, isShuffled]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    if (currentIndex >= filteredList.length) {
      setCurrentIndex(0);
    }
    setIsFlipped(false);
    setShowHint(false);
  }, [filteredList.length]);

  const currentKanji = filteredList[currentIndex] as KanjiItem | undefined;
  const hasUserInteracted = useRef(false);

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  const playAudio = useCallback(() => {
    hasUserInteracted.current = true;
    if (currentKanji) {
      const textToRead = currentKanji.kunyomi[0] || currentKanji.onyomi[0] || currentKanji.kanji;
      speakJapanese(textToRead);
    }
  }, [currentKanji]);

  useEffect(() => {
    if (hasUserInteracted.current && autoAudio && currentKanji && !isFlipped && frontSide === 'kanji') {
      const timer = setTimeout(() => {
        playAudio();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, isFlipped, frontSide, autoAudio, currentKanji, playAudio]);

  const handleNext = useCallback(() => {
    if (filteredList.length <= 1) return;
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex(prev => (prev + 1) % filteredList.length);
  }, [filteredList.length]);

  const handlePrev = useCallback(() => {
    if (filteredList.length <= 1) return;
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex(prev => (prev - 1 + filteredList.length) % filteredList.length);
  }, [filteredList.length]);

  const handleFlip = useCallback(() => {
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

  // Phím tắt bàn phím
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
        return;
      }

      switch (e.code) {
        case 'Space':
        case 'Enter':
          e.preventDefault();
          handleFlip();
          break;
        case 'ArrowRight':
        case 'KeyD':
          e.preventDefault();
          handleNext();
          break;
        case 'ArrowLeft':
        case 'KeyA':
          e.preventDefault();
          handlePrev();
          break;
        case 'ArrowUp':
        case 'KeyS':
          e.preventDefault();
          if (currentKanji) onToggleFavorite(currentKanji.id);
          break;
        case 'ArrowDown':
        case 'KeyM':
          e.preventDefault();
          if (currentKanji) onToggleMaster(currentKanji.id);
          break;
        case 'KeyV':
          e.preventDefault();
          playAudio();
          break;
        case 'KeyH':
          e.preventDefault();
          setShowHint(prev => !prev);
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
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleNext, handlePrev, currentKanji, onToggleFavorite, onToggleMaster, playAudio, toggleFullscreen, isFullscreen]);

  if (!currentKanji || filteredList.length === 0) {
    return (
      <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-8 shadow-sm max-w-2xl mx-auto">
        <Star className="w-12 h-12 text-slate-300 dark:text-zinc-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">
          Không tìm thấy chữ Kanji phù hợp
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
          {filterMode === 'starred'
            ? 'Bạn chưa đánh dấu sao chữ Kanji nào. Hãy bấm biểu tượng ngôi sao để lưu các chữ cần ôn luyện thêm!'
            : filterMode === 'unlearned'
            ? 'Tuyệt vời! Bạn đã thuộc toàn bộ chữ Kanji trong danh sách này.'
            : 'Danh sách Kanji đang trống.'}
        </p>
        <button
          onClick={() => setFilterMode('all')}
          className="mt-6 px-6 py-2.5 rounded-2xl bg-rose-500 text-white font-bold text-sm hover:bg-rose-600 transition shadow-md shadow-rose-500/20"
        >
          Xem tất cả Kanji ({kanjiList.length})
        </button>
      </div>
    );
  }

  const isMastered = masteredKanji.includes(currentKanji.id);
  const isFavorite = favoriteKanji.includes(currentKanji.id);
  const progressPercent = Math.round(((currentIndex + 1) / filteredList.length) * 100);

  // Màu sắc tối dịu mắt (khi bật Night Mode hoặc đang ở chế độ Fullscreen)
  const isDarkCard = isFullscreen || isNightMode;

  // Giao diện thẻ Kanji chính (dùng chung cho cả thường và Toàn màn hình)
  const renderCard = (cardHeightClass: string) => (
    <div
      style={{ perspective: '1200px' }}
      className={`w-full ${cardHeightClass} select-none`}
    >
      <div
        onClick={handleFlip}
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transition: 'transform 0.5s cubic-bezier(0.4, 0.2, 0.2, 1)'
        }}
        className={`relative w-full h-full ${cardHeightClass} cursor-pointer rounded-3xl`}
      >
        {/* MẶT 1 (Front Side) */}
        <div
          style={{ backfaceVisibility: 'hidden' }}
          className={`absolute inset-0 rounded-3xl p-6 sm:p-10 border-2 shadow-xl flex flex-col justify-between transition-colors ${
            isDarkCard
              ? 'bg-[#151926] border-slate-700/80 text-slate-100 shadow-2xl hover:border-rose-500/80'
              : isMastered
              ? 'bg-white dark:bg-zinc-900 border-emerald-300/80 dark:border-emerald-800/60 shadow-emerald-500/5'
              : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-rose-400 text-slate-900 dark:text-white'
          }`}
        >
          {/* Top Bar mặt trước */}
          <div className="flex items-center justify-between" onClick={e => e.stopPropagation()}>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider border ${
                isDarkCard
                  ? 'bg-rose-950/60 border-rose-800/60 text-rose-300'
                  : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200/50 text-rose-600 dark:text-rose-400'
              }`}>
                {currentKanji.jlpt}
              </span>
              <span className={`text-xs font-semibold ${isDarkCard ? 'text-slate-400' : 'text-slate-400 dark:text-zinc-500'}`}>
                {currentKanji.strokes} nét viết
              </span>
              {currentKanji.radical && (
                <span className={`text-xs px-2.5 py-0.5 rounded-lg font-medium border ${
                  isDarkCard
                    ? 'bg-slate-800 border-slate-700 text-slate-300'
                    : 'bg-slate-100 dark:bg-zinc-800 border-slate-200/60 text-slate-600 dark:text-zinc-400'
                }`}>
                  Bộ: {currentKanji.radical}
                </span>
              )}
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setStrokeModalKanji(currentKanji)}
                title="Xem nét viết & Tập viết"
                className={`p-2.5 rounded-xl transition ${
                  isDarkCard
                    ? 'text-slate-400 hover:text-blue-400 hover:bg-slate-800'
                    : 'text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40'
                }`}
              >
                <PenTool className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <button
                onClick={() => playAudio()}
                title="Phát âm (Phím V)"
                className={`p-2.5 rounded-xl transition ${
                  isDarkCard
                    ? 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
                    : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                }`}
              >
                <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <button
                onClick={() => onToggleFavorite(currentKanji.id)}
                title="Gắn sao yêu thích (Phím S)"
                className={`p-2.5 rounded-xl transition ${
                  isFavorite
                    ? 'text-amber-400 bg-amber-500/15 border border-amber-500/30'
                    : isDarkCard
                    ? 'text-slate-500 hover:text-amber-400 hover:bg-slate-800'
                    : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                }`}
              >
                <Star className={`w-4 h-4 sm:w-5 sm:h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {/* Nội dung trung tâm mặt trước: Cỡ chữ TO ĐẬM HOÀNH TRÁNG */}
          <div className="text-center my-auto py-4 px-4">
            {frontSide === 'kanji' ? (
              <div>
                <span className={`text-7xl sm:text-8xl md:text-9xl font-jp font-bold block hover:scale-105 transition-transform duration-200 select-none ${
                  isDarkCard ? 'text-slate-50' : 'text-slate-900 dark:text-white'
                }`}>
                  {currentKanji.kanji}
                </span>

                {/* Nút bật tắt gợi ý */}
                <div className="mt-5 flex items-center justify-center" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => setShowHint(prev => !prev)}
                    className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition ${
                      isDarkCard
                        ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                        : 'bg-slate-100 dark:bg-zinc-800 border-slate-200 text-slate-500 dark:text-zinc-400 hover:bg-slate-200'
                    }`}
                  >
                    {showHint ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showHint ? 'Ẩn gợi ý' : 'Xem gợi ý âm đọc'}</span>
                  </button>
                </div>

                {showHint && (
                  <div className="mt-2.5 text-sm font-semibold text-rose-400 animate-in fade-in">
                    {currentKanji.kunyomi[0] ? `Kun: ${currentKanji.kunyomi[0]}` : `On: ${currentKanji.onyomi[0] || '---'}`}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4 max-w-xl mx-auto">
                <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-400 block">
                  Âm Hán Việt & Ý nghĩa
                </span>
                <h3 className="text-4xl sm:text-5xl md:text-6xl font-black text-rose-500 uppercase tracking-wide">
                  {currentKanji.hanviet}
                </h3>
                <p className={`text-base sm:text-xl font-medium ${isDarkCard ? 'text-slate-200' : 'text-slate-700 dark:text-zinc-300'}`}>
                  {currentKanji.meanings_vi.slice(0, 3).join(', ')}
                </p>
                <p className="text-xs sm:text-sm text-slate-400 italic">
                  Chữ Hán tương ứng là gì? Bấm thẻ để kiểm tra đáp án!
                </p>
              </div>
            )}
          </div>

          {/* Bottom Bar mặt trước: Trợ giúp lật */}
          <div className={`flex items-center justify-between text-xs sm:text-sm pt-3.5 border-t ${
            isDarkCard ? 'border-slate-800 text-slate-400' : 'border-slate-100 dark:border-zinc-800/80 text-slate-400'
          }`}>
            <span className="flex items-center space-x-1.5">
              <RotateCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500" />
              <span>Chạm hoặc bấm <strong className={isDarkCard ? 'text-slate-200' : 'text-slate-700 dark:text-zinc-200'}>Space</strong> để lật</span>
            </span>

            <div onClick={e => e.stopPropagation()}>
              <button
                onClick={() => onToggleMaster(currentKanji.id)}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition ${
                  isMastered
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : isDarkCard
                    ? 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800'
                    : 'text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-zinc-800'
                }`}
              >
                <CheckCircle className={`w-4 h-4 ${isMastered ? 'fill-current' : ''}`} />
                <span>{isMastered ? 'Đã thuộc ✓' : 'Chưa thuộc'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* MẶT 2 (Back Side - 180deg) */}
        <div
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
          className={`absolute inset-0 rounded-3xl p-6 sm:p-10 border-2 shadow-2xl flex flex-col justify-between overflow-y-auto ${
            isDarkCard
              ? 'bg-gradient-to-b from-[#151926] to-[#0f121d] border-rose-500/50 text-slate-100 shadow-2xl'
              : 'bg-gradient-to-b from-white to-rose-50/30 dark:from-zinc-900 dark:to-zinc-950 border-rose-300 dark:border-rose-900/60 shadow-2xl text-slate-900 dark:text-white'
          }`}
        >
          {/* Header mặt sau */}
          <div className="flex items-start justify-between" onClick={e => e.stopPropagation()}>
            <div className="flex items-center space-x-3.5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-jp text-3xl sm:text-4xl font-bold shadow-md shadow-rose-500/25">
                {currentKanji.kanji}
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-rose-500 uppercase tracking-wide">
                  {currentKanji.hanviet}
                </h3>
                <div className={`flex items-center space-x-2 text-xs sm:text-sm ${isDarkCard ? 'text-slate-400' : 'text-slate-400'}`}>
                  <span>{currentKanji.strokes} nét</span>
                  {currentKanji.radical && <span>• Bộ: {currentKanji.radical}</span>}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setStrokeModalKanji(currentKanji)}
                title="Tập viết nét chữ"
                className={`p-2.5 rounded-xl transition ${
                  isDarkCard
                    ? 'bg-blue-950/60 text-blue-300 border border-blue-800/60 hover:bg-blue-900'
                    : 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100'
                }`}
              >
                <PenTool className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={() => playAudio()}
                title="Phát âm"
                className={`p-2.5 rounded-xl transition ${
                  isDarkCard
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-200'
                }`}
              >
                <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* Nội dung chi tiết On/Kun & Nghĩa */}
          <div className="my-auto py-3 space-y-3.5">
            {/* Box Âm On & Kun */}
            <div className={`grid grid-cols-2 gap-3.5 p-4 rounded-2xl border shadow-xs ${
              isDarkCard
                ? 'bg-slate-800/80 border-slate-700 text-slate-200'
                : 'bg-white dark:bg-zinc-800/80 border-slate-200/80 dark:border-zinc-700/60'
            }`}>
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-400 block mb-1">
                  Onyomi (Âm Hán)
                </span>
                <p className={`text-base font-jp font-bold ${isDarkCard ? 'text-slate-100' : 'text-slate-800 dark:text-zinc-200'}`}>
                  {currentKanji.onyomi.length > 0 ? currentKanji.onyomi.join('、 ') : '---'}
                </p>
              </div>
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-sky-400 block mb-1">
                  Kunyomi (Thuần Nhật)
                </span>
                <p className={`text-base font-jp font-bold ${isDarkCard ? 'text-slate-100' : 'text-slate-800 dark:text-zinc-200'}`}>
                  {currentKanji.kunyomi.length > 0 ? currentKanji.kunyomi.join('、 ') : '---'}
                </p>
              </div>
            </div>

            {/* Nghĩa chi tiết */}
            <div className={`p-4 rounded-2xl border shadow-xs text-left ${
              isDarkCard
                ? 'bg-slate-800/80 border-slate-700 text-slate-200'
                : 'bg-white dark:bg-zinc-800/80 border-slate-200/80 dark:border-zinc-700/60'
            }`}>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1.5">
                Ý nghĩa tiếng Việt
              </span>
              <ul className={`text-sm sm:text-base font-medium space-y-1 ${isDarkCard ? 'text-slate-100' : 'text-slate-800 dark:text-zinc-200'}`}>
                {currentKanji.meanings_vi.map((m, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Từ ghép ví dụ nếu có */}
            {currentKanji.examples && currentKanji.examples.length > 0 && (
              <div className={`p-3.5 rounded-2xl border text-left ${
                isDarkCard
                  ? 'bg-slate-800/80 border-slate-700'
                  : 'bg-white dark:bg-zinc-800/80 border-slate-200/80 dark:border-zinc-700/60'
              }`}>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Từ ghép tiêu biểu
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                  {currentKanji.examples.slice(0, 2).map((ex, idx) => (
                    <div key={idx} className={`p-2 rounded-xl ${isDarkCard ? 'bg-slate-900/60' : 'bg-slate-50 dark:bg-zinc-900/50'}`}>
                      <div className="font-jp font-bold flex items-center justify-between">
                        <span className={isDarkCard ? 'text-slate-100' : 'text-slate-900 dark:text-white'}>{ex.word}</span>
                        <span className="text-xs text-slate-400 font-normal">{ex.reading}</span>
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{ex.meaning}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom bar mặt sau */}
          <div className={`flex items-center justify-between text-xs sm:text-sm pt-3.5 border-t ${
            isDarkCard ? 'border-slate-800 text-slate-400' : 'border-slate-200 dark:border-zinc-800 text-slate-400'
          }`} onClick={e => e.stopPropagation()}>
            <button
              onClick={handleFlip}
              className={`inline-flex items-center space-x-1 transition ${
                isDarkCard ? 'text-slate-400 hover:text-white' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <RotateCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Lật lại mặt trước</span>
            </button>

            <button
              onClick={() => onToggleMaster(currentKanji.id)}
              className={`px-5 py-2 rounded-xl font-bold transition flex items-center space-x-1.5 ${
                isMastered
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/25'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>{isMastered ? '✓ Đã thuộc' : 'Đánh dấu đã thuộc'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Thanh điều khiển dưới thẻ (Prev, Flip, Next)
  const renderBottomControls = () => (
    <div className="flex items-center justify-center space-x-3 sm:space-x-4 max-w-lg mx-auto pt-4 px-2">
      <button
        onClick={handlePrev}
        title="Thẻ trước (← / A)"
        className={`p-3.5 rounded-2xl border shadow-sm transition hover:scale-105 active:scale-95 ${
          isDarkCard
            ? 'bg-[#151926] border-slate-700 text-slate-200 hover:bg-slate-800'
            : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800'
        }`}
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      <button
        onClick={handleFlip}
        className={`px-6 sm:px-8 py-3.5 rounded-2xl border font-bold text-xs sm:text-base shadow-sm transition flex items-center space-x-2 active:scale-95 ${
          isDarkCard
            ? 'bg-[#151926] border-slate-700 text-slate-100 hover:border-rose-400'
            : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 hover:border-rose-400'
        }`}
      >
        <RotateCw className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500" />
        <span>{isFlipped ? 'Mặt trước' : 'Lật xem nghĩa (Space)'}</span>
      </button>

      <button
        onClick={handleNext}
        title="Thẻ tiếp theo (→ / D)"
        className={`p-3.5 rounded-2xl border shadow-sm transition hover:scale-105 active:scale-95 ${
          isDarkCard
            ? 'bg-[#151926] border-slate-700 text-slate-200 hover:bg-slate-800'
            : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800'
        }`}
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
    </div>
  );

  // Modal phím tắt
  const renderShortcutsModal = () => (
    showShortcutsHelp && (
      <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center space-x-2 text-rose-500">
              <Keyboard className="w-5 h-5" />
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Phím tắt Kanji Flashcard</h4>
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
              <span className="text-slate-600 dark:text-zinc-300">Lật thẻ 3D</span>
              <kbd className="px-2 py-1 bg-slate-100 dark:bg-zinc-800 rounded-md font-mono text-slate-800 dark:text-zinc-200 font-bold">Space / Enter</kbd>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-600 dark:text-zinc-300">Thẻ trước / Thẻ tiếp</span>
              <kbd className="px-2 py-1 bg-slate-100 dark:bg-zinc-800 rounded-md font-mono text-slate-800 dark:text-zinc-200 font-bold">← / → hoặc A / D</kbd>
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
              <span className="text-slate-600 dark:text-zinc-300">Gắn sao Kanji</span>
              <kbd className="px-2 py-1 bg-slate-100 dark:bg-zinc-800 rounded-md font-mono text-slate-800 dark:text-zinc-200 font-bold">Phím S / ↑</kbd>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-600 dark:text-zinc-300">Đánh dấu đã thuộc</span>
              <kbd className="px-2 py-1 bg-slate-100 dark:bg-zinc-800 rounded-md font-mono text-slate-800 dark:text-zinc-200 font-bold">Phím M / ↓</kbd>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-600 dark:text-zinc-300">Phát âm On/Kun</span>
              <kbd className="px-2 py-1 bg-slate-100 dark:bg-zinc-800 rounded-md font-mono text-slate-800 dark:text-zinc-200 font-bold">Phím V</kbd>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-600 dark:text-zinc-300">Bật/Tắt gợi ý</span>
              <kbd className="px-2 py-1 bg-slate-100 dark:bg-zinc-800 rounded-md font-mono text-slate-800 dark:text-zinc-200 font-bold">Phím H</kbd>
            </div>
          </div>

          <button
            onClick={() => setShowShortcutsHelp(false)}
            className="w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs transition"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    )
  );

  // NẾU ĐANG BẬT TOÀN MÀN HÌNH NỀN TỐI (FULLSCREEN DARK EYE-CARE MODE)
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#0c1017] text-slate-100 flex flex-col justify-between p-4 sm:p-6 md:p-8 min-h-screen select-none overflow-y-auto animate-in fade-in duration-200">
        {/* Vầng hào quang nền tối dịu mắt (Ambient background aura) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-rose-500/10 blur-[130px] rounded-full" />
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
              Tất cả ({kanjiList.length})
            </button>
            <button
              onClick={() => setFilterMode('unlearned')}
              className={`px-3 py-1.5 rounded-xl transition ${
                filterMode === 'unlearned'
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Chưa thuộc ({kanjiList.filter(k => !masteredKanji.includes(k.id)).length})
            </button>
            <button
              onClick={() => setFilterMode('starred')}
              className={`px-3 py-1.5 rounded-xl flex items-center space-x-1 transition ${
                filterMode === 'starred'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-400 hover:text-amber-400'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>Có sao ({kanjiList.filter(k => favoriteKanji.includes(k.id)).length})</span>
            </button>
          </div>

          {/* Tiến độ ở giữa */}
          <div className="flex items-center space-x-4 text-xs font-bold text-slate-300">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span>Thẻ {currentIndex + 1} / {filteredList.length}</span>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 font-extrabold text-rose-400">
              {progressPercent}%
            </span>
          </div>

          {/* Các nút công cụ + Nút Thoát toàn màn hình */}
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setFrontSide(prev => prev === 'kanji' ? 'hanviet' : 'kanji')}
              title="Đảo mặt thẻ (Chữ Hán ↔ Hán Việt)"
              className="p-2 rounded-xl text-xs font-bold bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white transition flex items-center space-x-1"
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">{frontSide === 'kanji' ? 'Chữ Hán' : 'Hán Việt'}</span>
            </button>

            <button
              onClick={() => setIsShuffled(prev => !prev)}
              className={`p-2 rounded-xl text-xs font-bold border transition ${
                isShuffled
                  ? 'bg-rose-950/80 border-rose-600 text-rose-400'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
              }`}
              title="Xáo trộn Kanji"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              onClick={() => setAutoAudio(prev => !prev)}
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
              onClick={() => setShowShortcutsHelp(true)}
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
              className="h-full bg-gradient-to-r from-rose-500 to-amber-500 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* 2. KHỐI THẺ KANJI FLASHCARD TO VÀ RỘNG Ở TRUNG TÂM */}
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
            <span><kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">M</kbd> Thuộc</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">S</kbd> Gắn sao</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">V</kbd> Đọc</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">H</kbd> Gợi ý</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">F / Esc</kbd> Toàn màn hình</span>
          </div>
        </div>

        {renderShortcutsModal()}

        {/* Modal Nét viết chữ Kanji */}
        {strokeModalKanji && (
          <KanjiStrokeModal
            isOpen={!!strokeModalKanji}
            onClose={() => setStrokeModalKanji(null)}
            kanji={strokeModalKanji.kanji}
            hanviet={strokeModalKanji.hanviet}
            meaning={strokeModalKanji.meanings_vi.join(', ')}
            strokes={strokeModalKanji.strokes}
          />
        )}
      </div>
    );
  }

  // CHẾ ĐỘ XEM TIÊU CHUẨN (CARD TO HƠN, RỘNG RÃI, CÓ NÚT FULL MÀN HÌNH & NỀN TỐI)
  return (
    <div className="w-full max-w-3xl lg:max-w-4xl mx-auto flex flex-col items-center transition-all duration-300 space-y-5">
      {/* 1. Thanh điều khiển & Tùy chọn học tập */}
      <div className={`w-full border rounded-2xl p-3 sm:p-4 shadow-sm flex flex-wrap items-center justify-between gap-3 ${
        isNightMode ? 'bg-slate-800/90 border-slate-700/80 text-white' : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800'
      }`}>
        {/* Bộ lọc */}
        <div className={`flex items-center space-x-1.5 p-1 rounded-xl text-xs font-bold ${
          isNightMode ? 'bg-slate-700/80' : 'bg-slate-100 dark:bg-zinc-800/80'
        }`}>
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filterMode === 'all'
                ? isNightMode
                  ? 'bg-slate-600 text-white shadow-xs'
                  : 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tất cả ({kanjiList.length})
          </button>
          <button
            onClick={() => setFilterMode('unlearned')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filterMode === 'unlearned'
                ? isNightMode
                  ? 'bg-slate-600 text-white shadow-xs'
                  : 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Chưa thuộc ({kanjiList.filter(k => !masteredKanji.includes(k.id)).length})
          </button>
          <button
            onClick={() => setFilterMode('starred')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1 ${
              filterMode === 'starred'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-amber-500'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>Có sao ({kanjiList.filter(k => favoriteKanji.includes(k.id)).length})</span>
          </button>
        </div>

        {/* Nút thao tác nhanh: Toàn màn hình, Nền tối, Đổi mặt, Xáo trộn, Âm thanh, Trợ giúp */}
        <div className="flex items-center space-x-1.5 text-xs font-semibold">
          {/* NÚT TOÀN MÀN HÌNH NỀN TỐI */}
          <button
            onClick={toggleFullscreen}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center space-x-1.5 shadow-sm active:scale-95 ${
              isNightMode
                ? 'bg-rose-950/80 border-rose-600/70 text-rose-300 hover:bg-rose-900'
                : 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
            }`}
            title="Bật Toàn màn hình màu tối cho dịu mắt (Phím F)"
          >
            <Maximize2 className="w-3.5 h-3.5 text-rose-500" />
            <span className="hidden sm:inline">Toàn màn hình</span>
          </button>

          {/* NÚT BẬT / TẮT CHẾ ĐỘ NỀN TỐI DỊU MẮT */}
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

          {/* Nút Đổi mặt thẻ */}
          <button
            onClick={() => setFrontSide(prev => prev === 'kanji' ? 'hanviet' : 'kanji')}
            title="Đảo mặt thẻ (Chữ Hán ↔ Âm Hán Việt)"
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border transition ${
              frontSide === 'hanviet'
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 text-rose-600 dark:text-rose-400 font-bold'
                : isNightMode
                ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-50'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{frontSide === 'kanji' ? 'Chữ Hán' : 'Hán Việt'}</span>
          </button>

          {/* Nút Xáo trộn */}
          <button
            onClick={() => setIsShuffled(prev => !prev)}
            title="Xáo trộn thứ tự thẻ"
            className={`p-2 rounded-xl border transition ${
              isShuffled
                ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 text-blue-600 dark:text-blue-400 font-bold'
                : isNightMode
                ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-50'
            }`}
          >
            <Shuffle className="w-3.5 h-3.5" />
          </button>

          {/* Nút Tự động đọc */}
          <button
            onClick={() => setAutoAudio(prev => !prev)}
            title="Bật/Tắt tự động phát âm khi lật thẻ"
            className={`p-2 rounded-xl border transition ${
              autoAudio
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-600 dark:text-emerald-400'
                : isNightMode
                ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-400'
            }`}
          >
            {autoAudio ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Phím tắt */}
          <button
            onClick={() => setShowShortcutsHelp(true)}
            title="Phím tắt bàn phím"
            className={`p-2 rounded-xl border transition ${
              isNightMode
                ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                : 'border-slate-200 dark:border-zinc-700 text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Thanh tiến trình (Progress Bar) */}
      <div className="w-full space-y-1.5">
        <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-zinc-400">
          <span>Thẻ {currentIndex + 1} / {filteredList.length}</span>
          <span className="text-rose-500 font-extrabold">{progressPercent}%</span>
        </div>
        <div className={`w-full h-1.5 rounded-full overflow-hidden ${
          isNightMode ? 'bg-slate-800' : 'bg-slate-100 dark:bg-zinc-800'
        }`}>
          <div
            className="h-full bg-gradient-to-r from-rose-500 to-amber-500 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 3. THẺ 3D FLIP CARD CONTAINER: KÍCH THƯỚC LỚN HƠN, RỘNG RÃI */}
      {renderCard('min-h-[440px] sm:min-h-[480px] md:min-h-[500px]')}

      {/* 4. ĐIỀU HƯỚNG DƯỚI THẺ */}
      {renderBottomControls()}

      {/* 5. Modal Phím tắt */}
      {renderShortcutsModal()}

      {/* 6. Modal Nét viết chữ Kanji */}
      {strokeModalKanji && (
        <KanjiStrokeModal
          isOpen={!!strokeModalKanji}
          onClose={() => setStrokeModalKanji(null)}
          kanji={strokeModalKanji.kanji}
          hanviet={strokeModalKanji.hanviet}
          meaning={strokeModalKanji.meanings_vi.join(', ')}
          strokes={strokeModalKanji.strokes}
        />
      )}
    </div>
  );
};
