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
  EyeOff
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

  // 6. Hiển thị bảng phím tắt
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

  // 7. Modal tập viết nét chữ
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

  // Phím tắt bàn phím
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
        return;
      }

      switch (e.code) {
        case 'Space':
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
        case 'KeyS':
          e.preventDefault();
          if (currentKanji) onToggleFavorite(currentKanji.id);
          break;
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
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleNext, handlePrev, currentKanji, onToggleFavorite, onToggleMaster, playAudio]);

  if (!currentKanji || filteredList.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-12 text-center shadow-sm">
        <Sparkles className="w-12 h-12 text-rose-500 mx-auto mb-3 opacity-60" />
        <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-200">
          Không có chữ Kanji nào phù hợp với bộ lọc hiện tại
        </h3>
        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1 max-w-md mx-auto">
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
          Xem tất cả Kanji
        </button>
      </div>
    );
  }

  const isMastered = masteredKanji.includes(currentKanji.id);
  const isFavorite = favoriteKanji.includes(currentKanji.id);
  const progressPercent = Math.round(((currentIndex + 1) / filteredList.length) * 100);

  return (
    <div className="space-y-6">
      {/* Thanh điều khiển & Tùy chọn học tập */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-3.5 shadow-sm flex flex-wrap items-center justify-between gap-3">
        {/* Bộ lọc */}
        <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-zinc-800/80 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filterMode === 'all'
                ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
            }`}
          >
            Tất cả ({kanjiList.length})
          </button>
          <button
            onClick={() => setFilterMode('unlearned')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filterMode === 'unlearned'
                ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
            }`}
          >
            Chưa thuộc ({kanjiList.filter(k => !masteredKanji.includes(k.id)).length})
          </button>
          <button
            onClick={() => setFilterMode('starred')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1 ${
              filterMode === 'starred'
                ? 'bg-white dark:bg-zinc-900 text-amber-500 shadow-sm'
                : 'text-slate-500 dark:text-zinc-400 hover:text-amber-500'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>Có sao ({kanjiList.filter(k => favoriteKanji.includes(k.id)).length})</span>
          </button>
        </div>

        {/* Nút thao tác nhanh */}
        <div className="flex items-center space-x-2 text-xs font-semibold">
          <button
            onClick={() => setFrontSide(prev => prev === 'kanji' ? 'hanviet' : 'kanji')}
            title="Đảo mặt thẻ (Chữ Hán ↔ Âm Hán Việt)"
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border transition ${
              frontSide === 'hanviet'
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 text-rose-600 dark:text-rose-400 font-bold'
                : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-50'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mặt trước: {frontSide === 'kanji' ? 'Chữ Hán' : 'Hán Việt'}</span>
          </button>

          <button
            onClick={() => setIsShuffled(prev => !prev)}
            title="Xáo trộn thứ tự thẻ"
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border transition ${
              isShuffled
                ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 text-blue-600 dark:text-blue-400 font-bold'
                : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-50'
            }`}
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Xáo trộn</span>
          </button>

          <button
            onClick={() => setAutoAudio(prev => !prev)}
            title="Bật/Tắt tự động phát âm khi lật thẻ"
            className={`p-1.5 rounded-xl border transition ${
              autoAudio
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-600 dark:text-emerald-400'
                : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-400'
            }`}
          >
            {autoAudio ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setShowShortcutsHelp(prev => !prev)}
            title="Phím tắt bàn phím"
            className="p-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200"
          >
            <Keyboard className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bảng trợ giúp phím tắt */}
      {showShortcutsHelp && (
        <div className="bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-2xl p-4 text-xs text-slate-600 dark:text-zinc-300 relative animate-in fade-in duration-150">
          <button
            onClick={() => setShowShortcutsHelp(false)}
            className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="font-bold text-slate-900 dark:text-white mb-2 flex items-center space-x-1.5">
            <Keyboard className="w-4 h-4 text-rose-500" />
            <span>Phím tắt hỗ trợ thao tác nhanh:</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-700 border font-mono">Space</kbd> : Lật thẻ 3D</div>
            <div><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-700 border font-mono">→</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-700 border font-mono">D</kbd> : Thẻ tiếp theo</div>
            <div><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-700 border font-mono">←</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-700 border font-mono">A</kbd> : Thẻ trước đó</div>
            <div><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-700 border font-mono">S</kbd> : Gắn sao yêu thích</div>
            <div><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-700 border font-mono">M</kbd> : Đánh dấu đã thuộc</div>
            <div><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-700 border font-mono">V</kbd> : Phát âm On/Kun</div>
            <div><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-700 border font-mono">H</kbd> : Mở gợi ý</div>
          </div>
        </div>
      )}

      {/* Thanh tiến trình (Progress Bar) */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-zinc-400">
          <span>Thẻ {currentIndex + 1} / {filteredList.length}</span>
          <span className="text-rose-500 font-extrabold">{progressPercent}%</span>
        </div>
        <div className="w-full h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-rose-500 to-amber-500 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* THẺ 3D FLIP CARD CONTAINER */}
      <div
        style={{ perspective: '1200px' }}
        className="w-full max-w-3xl lg:max-w-4xl mx-auto min-h-[420px] sm:min-h-[470px] select-none"
      >
        <div
          onClick={handleFlip}
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transition: 'transform 0.5s cubic-bezier(0.4, 0.2, 0.2, 1)'
          }}
          className="relative w-full h-full min-h-[420px] sm:min-h-[470px] cursor-pointer rounded-3xl"
        >
          {/* MẶT 1 (Front Side) */}
          <div
            style={{ backfaceVisibility: 'hidden' }}
            className={`absolute inset-0 rounded-3xl p-6 sm:p-8 bg-white dark:bg-zinc-900 border-2 shadow-xl flex flex-col justify-between transition-colors ${
              isMastered
                ? 'border-emerald-300/80 dark:border-emerald-800/60 shadow-emerald-500/5'
                : 'border-slate-200 dark:border-zinc-800 hover:border-rose-400'
            }`}
          >
            {/* Top Bar mặt trước */}
            <div className="flex items-center justify-between" onClick={e => e.stopPropagation()}>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-xs font-black uppercase tracking-wider">
                  {currentKanji.jlpt}
                </span>
                <span className="text-xs font-medium text-slate-400 dark:text-zinc-500">
                  {currentKanji.strokes} nét viết
                </span>
                {currentKanji.radical && (
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 font-medium">
                    Bộ: {currentKanji.radical}
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => setStrokeModalKanji(currentKanji)}
                  title="Xem nét viết & Tập viết"
                  className="p-2 rounded-xl text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition"
                >
                  <PenTool className="w-4 h-4" />
                </button>

                <button
                  onClick={() => playAudio()}
                  title="Phát âm"
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                >
                  <Volume2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onToggleFavorite(currentKanji.id)}
                  title="Gắn sao yêu thích"
                  className={`p-2 rounded-xl transition ${
                    isFavorite
                      ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                      : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                  }`}
                >
                  <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            {/* Nội dung trung tâm mặt trước */}
            <div className="text-center my-auto py-4">
              {frontSide === 'kanji' ? (
                <div>
                  <span className="text-7xl sm:text-8xl font-jp font-bold text-slate-900 dark:text-white block hover:scale-105 transition-transform duration-200">
                    {currentKanji.kanji}
                  </span>

                  {/* Nút bật tắt gợi ý */}
                  <div className="mt-4 flex items-center justify-center" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => setShowHint(prev => !prev)}
                      className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
                    >
                      {showHint ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showHint ? 'Ẩn gợi ý' : 'Xem gợi ý âm đọc'}</span>
                    </button>
                  </div>

                  {showHint && (
                    <div className="mt-2 text-xs font-semibold text-rose-500 dark:text-rose-400 animate-in fade-in">
                      {currentKanji.kunyomi[0] ? `Kun: ${currentKanji.kunyomi[0]}` : `On: ${currentKanji.onyomi[0] || '---'}`}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block">
                    Âm Hán Việt & Ý nghĩa
                  </span>
                  <h3 className="text-3xl sm:text-4xl font-black text-rose-600 dark:text-rose-400 uppercase tracking-wide">
                    {currentKanji.hanviet}
                  </h3>
                  <p className="text-base text-slate-700 dark:text-zinc-300 font-medium max-w-md mx-auto">
                    {currentKanji.meanings_vi.slice(0, 2).join(', ')}
                  </p>
                  <p className="text-xs text-slate-400 italic">
                    Chữ Hán tương ứng là gì? Bấm thẻ để kiểm tra đáp án!
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Bar mặt trước: Trợ giúp lật */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100 dark:border-zinc-800/80">
              <span className="flex items-center space-x-1">
                <RotateCw className="w-3.5 h-3.5 text-rose-500 animate-spin-slow" />
                <span>Bấm vào thẻ hoặc Space để lật</span>
              </span>

              <div onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => onToggleMaster(currentKanji.id)}
                  className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-bold transition ${
                    isMastered
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <CheckCircle className={`w-3.5 h-3.5 ${isMastered ? 'fill-current' : ''}`} />
                  <span>{isMastered ? 'Đã thuộc' : 'Chưa thuộc'}</span>
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
            className="absolute inset-0 rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-white to-rose-50/30 dark:from-zinc-900 dark:to-zinc-950 border-2 border-rose-300 dark:border-rose-900/60 shadow-2xl flex flex-col justify-between"
          >
            {/* Header mặt sau */}
            <div className="flex items-start justify-between" onClick={e => e.stopPropagation()}>
              <div className="flex items-center space-x-3">
                <div className="w-14 h-14 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-jp text-3xl font-bold shadow-md shadow-rose-500/20">
                  {currentKanji.kanji}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400 uppercase tracking-wide">
                    {currentKanji.hanviet}
                  </h3>
                  <div className="flex items-center space-x-2 text-xs text-slate-400">
                    <span>{currentKanji.strokes} nét</span>
                    {currentKanji.radical && <span>• Bộ: {currentKanji.radical}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => setStrokeModalKanji(currentKanji)}
                  title="Tập viết nét chữ"
                  className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition"
                >
                  <PenTool className="w-4 h-4" />
                </button>
                <button
                  onClick={() => playAudio()}
                  title="Phát âm"
                  className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-200 transition"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Nội dung chi tiết On/Kun & Nghĩa */}
            <div className="my-auto py-3 space-y-3">
              {/* Box Âm On & Kun */}
              <div className="grid grid-cols-2 gap-3 bg-white dark:bg-zinc-800/80 p-3.5 rounded-2xl border border-slate-200/80 dark:border-zinc-700/60 shadow-sm">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-500 block mb-0.5">
                    Onyomi (Âm Hán)
                  </span>
                  <p className="text-sm font-jp font-bold text-slate-800 dark:text-zinc-200">
                    {currentKanji.onyomi.length > 0 ? currentKanji.onyomi.join('、 ') : '---'}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-500 block mb-0.5">
                    Kunyomi (Thuần Nhật)
                  </span>
                  <p className="text-sm font-jp font-bold text-slate-800 dark:text-zinc-200">
                    {currentKanji.kunyomi.length > 0 ? currentKanji.kunyomi.join('、 ') : '---'}
                  </p>
                </div>
              </div>

              {/* Nghĩa chi tiết */}
              <div className="bg-white dark:bg-zinc-800/80 p-3.5 rounded-2xl border border-slate-200/80 dark:border-zinc-700/60 shadow-sm text-left">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                  Ý nghĩa tiếng Việt
                </span>
                <ul className="text-xs sm:text-sm font-medium text-slate-800 dark:text-zinc-200 space-y-1">
                  {currentKanji.meanings_vi.map((m, idx) => (
                    <li key={idx} className="flex items-start space-x-1.5">
                      <span className="text-rose-500 font-bold">•</span>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Từ ghép ví dụ nếu có */}
              {currentKanji.examples && currentKanji.examples.length > 0 && (
                <div className="bg-white dark:bg-zinc-800/80 p-3 rounded-2xl border border-slate-200/80 dark:border-zinc-700/60 text-left">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                    Từ ghép tiêu biểu
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {currentKanji.examples.slice(0, 2).map((ex, idx) => (
                      <div key={idx} className="p-1.5 rounded-lg bg-slate-50 dark:bg-zinc-900/50">
                        <div className="font-jp font-bold text-slate-900 dark:text-white flex items-center justify-between">
                          <span>{ex.word}</span>
                          <span className="text-[11px] text-slate-400 font-normal">{ex.reading}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-zinc-400 truncate mt-0.5">{ex.meaning}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom bar mặt sau */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-200 dark:border-zinc-800" onClick={e => e.stopPropagation()}>
              <button
                onClick={handleFlip}
                className="inline-flex items-center space-x-1 text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Lật lại mặt trước</span>
              </button>

              <button
                onClick={() => onToggleMaster(currentKanji.id)}
                className={`px-4 py-1.5 rounded-xl font-bold transition flex items-center space-x-1.5 ${
                  isMastered
                    ? 'bg-emerald-500 text-white'
                    : 'bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/20'
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{isMastered ? '✓ Đã thuộc' : 'Đánh dấu đã thuộc'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ĐIỀU HƯỚNG DƯỚI THẺ (Next, Prev, Actions) */}
      <div className="flex items-center justify-center space-x-4 max-w-md mx-auto pt-2">
        <button
          onClick={handlePrev}
          title="Thẻ trước (← / A)"
          className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 shadow-sm transition hover:scale-105"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={handleFlip}
          className="px-6 py-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 font-bold text-xs sm:text-sm hover:border-rose-400 shadow-sm transition flex items-center space-x-2"
        >
          <RotateCw className="w-4 h-4 text-rose-500" />
          <span>{isFlipped ? 'Mặt trước' : 'Lật xem nghĩa (Space)'}</span>
        </button>

        <button
          onClick={handleNext}
          title="Thẻ tiếp theo (→ / D)"
          className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 shadow-sm transition hover:scale-105"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

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
};
