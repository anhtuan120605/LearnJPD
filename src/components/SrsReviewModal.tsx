import React, { useState, useEffect } from 'react';
import { SrsRating } from '../types';
import { DueReviewItem } from '../lib/srs';
import { 
  X, 
  Volume2, 
  RotateCw, 
  Sparkles, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  Flame, 
  BookOpen, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { speakJapanese } from '../lib/audio';
import confetti from 'canvas-confetti';

interface SrsReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  dueItems: DueReviewItem[];
  onRateItem: (id: string, type: 'word' | 'kanji', rating: SrsRating) => void;
}

export const SrsReviewModal: React.FC<SrsReviewModalProps> = ({
  isOpen,
  onClose,
  dueItems,
  onRateItem,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showFurigana, setShowFurigana] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [stats, setStats] = useState({ again: 0, hard: 0, good: 0, easy: 0 });

  // Reset khi mở modal mới
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setIsFlipped(false);
      setIsFinished(false);
      setStats({ again: 0, hard: 0, good: 0, easy: 0 });
    }
  }, [isOpen]);

  const current = dueItems[currentIndex];

  // Bắt phím tắt bàn phím: Space lật thẻ, 1, 2, 3, 4 đánh giá
  useEffect(() => {
    if (!isOpen || isFinished || !current) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((f) => !f);
      } else if (isFlipped) {
        if (e.key === '1') handleRate('again');
        else if (e.key === '2') handleRate('hard');
        else if (e.key === '3') handleRate('good');
        else if (e.key === '4') handleRate('easy');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isFinished, isFlipped, currentIndex]);

  if (!isOpen) return null;

  const handleRate = (rating: SrsRating) => {
    if (!current) return;

    setStats((prev) => ({ ...prev, [rating]: prev[rating] + 1 }));
    onRateItem(current.srs.id, current.srs.type, rating);

    setIsFlipped(false);
    if (currentIndex + 1 >= dueItems.length) {
      setIsFinished(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } else {
      setCurrentIndex((idx) => idx + 1);
    }
  };

  // Xác định dữ liệu hiển thị (Từ vựng hoặc Kanji)
  const isWord = current?.srs.type === 'word';
  const mainText = isWord ? current?.word?.kanji || current?.word?.kana || '' : current?.kanji?.kanji || '';
  const subKana = isWord ? current?.word?.kana || '' : current?.kanji?.onyomi?.join(', ') || '';
  const hanviet = isWord ? current?.word?.hanviet : current?.kanji?.hanviet;
  const meaning = isWord ? current?.word?.meaning : current?.kanji?.meanings_vi?.join(', ');

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-white dark:bg-[#111c30] rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center space-x-2.5">
            <span className="p-1.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Clock className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                Ôn Tập Ngắt Quãng (SRS Review)
              </h2>
              <span className="text-[11px] text-slate-400">
                Lặp lại đúng thời điểm vàng trước khi quên
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung chính */}
        <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between overflow-y-auto">
          {dueItems.length === 0 ? (
            /* Khi không có từ nào đến hạn */
            <div className="py-16 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Tuyệt vời! Không có từ nào đến hạn hôm nay
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Bạn đã hoàn thành mọi lượt ôn tập ngắt quãng. Các từ đã học sẽ tự động được xếp lịch ôn lại vào những ngày tiếp theo!
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
              >
                Đóng lại
              </button>
            </div>
          ) : !isFinished && current ? (
            /* Thẻ Flashcard SRS đang ôn */
            <div className="space-y-5">
              {/* Thanh tiến độ */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                  <span>Tiến độ phiên: {currentIndex + 1} / {dueItems.length} thẻ</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                    Cấp độ SRS: Level {current.srs.level}
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300 rounded-full"
                    style={{ width: `${((currentIndex + 1) / dueItems.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* KHỐI FLASHCARD 3D TƯƠNG TÁC */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="min-h-[260px] sm:min-h-[290px] rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-slate-50 to-indigo-50/30 dark:from-slate-800/60 dark:to-slate-900/60 border-2 border-slate-200/80 dark:border-slate-700/80 hover:border-purple-400 transition cursor-pointer flex flex-col justify-between text-center relative group shadow-sm select-none"
              >
                {/* Header thẻ: Loại từ & Nút nghe */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                    {isWord ? 'Từ vựng' : 'Chữ Hán'}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      speakJapanese(subKana || mainText);
                    }}
                    className="p-1.5 rounded-xl hover:bg-white dark:hover:bg-slate-700 text-slate-400 hover:text-blue-600 transition"
                    title="Nghe phát âm"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Nội dung MẶT TRƯỚC */}
                <div className="my-auto space-y-2 py-4">
                  {showFurigana && subKana && (
                    <p className="text-sm sm:text-base font-bold text-slate-400 dark:text-slate-400 font-jp tracking-wider">
                      {subKana}
                    </p>
                  )}
                  <h3 className="text-4xl sm:text-5xl font-black font-jp text-slate-900 dark:text-white">
                    {mainText}
                  </h3>

                  {!isFlipped && (
                    <p className="text-xs text-slate-400 mt-3 flex items-center justify-center space-x-1">
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Bấm để lật thẻ xem nghĩa (hoặc phím Space)</span>
                    </p>
                  )}
                </div>

                {/* Nội dung MẶT SAU (Khi đã lật) */}
                {isFlipped && (
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700/80 space-y-2 animate-fade-in">
                    {hanviet && (
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                        【{hanviet}】
                      </span>
                    )}
                    <p className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200">
                      {meaning}
                    </p>
                    {!isWord && current?.kanji?.radical && (
                      <p className="text-xs text-slate-400">
                        Bộ thủ: {current.kanji.radical}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* 4 NÚT ĐÁNH GIÁ SM-2 (HIỆN KHI ĐÃ LẬT THẺ) */}
              {isFlipped ? (
                <div className="space-y-2 animate-fade-in">
                  <div className="grid grid-cols-4 gap-2">
                    {/* Quên */}
                    <button
                      onClick={() => handleRate('again')}
                      className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 border border-rose-200 dark:border-rose-800/50 text-rose-600 dark:text-rose-400 flex flex-col items-center justify-center transition active:scale-95"
                    >
                      <span className="text-xs font-black">🔴 Quên (1)</span>
                      <span className="text-[10px] opacity-75 mt-0.5">1 ngày</span>
                    </button>

                    {/* Khó */}
                    <button
                      onClick={() => handleRate('hard')}
                      className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 border border-amber-200 dark:border-amber-800/50 text-amber-600 dark:text-amber-400 flex flex-col items-center justify-center transition active:scale-95"
                    >
                      <span className="text-xs font-black">🟡 Khó (2)</span>
                      <span className="text-[10px] opacity-75 mt-0.5">2 ngày</span>
                    </button>

                    {/* Nhớ */}
                    <button
                      onClick={() => handleRate('good')}
                      className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400 flex flex-col items-center justify-center transition active:scale-95"
                    >
                      <span className="text-xs font-black">🟢 Nhớ (3)</span>
                      <span className="text-[10px] opacity-75 mt-0.5">Tăng cấp</span>
                    </button>

                    {/* Dễ */}
                    <button
                      onClick={() => handleRate('easy')}
                      className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 border border-blue-200 dark:border-blue-800/50 text-blue-600 dark:text-sky-400 flex flex-col items-center justify-center transition active:scale-95"
                    >
                      <span className="text-xs font-black">🔵 Dễ (4)</span>
                      <span className="text-[10px] opacity-75 mt-0.5">7 ngày+</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-center text-slate-400 font-mono">
                    💡 Phím tắt: Bấm phím 1, 2, 3, 4 trên bàn phím để chọn nhanh
                  </p>
                </div>
              ) : (
                <button
                  onClick={() => setIsFlipped(true)}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm shadow-md shadow-purple-500/20 transition active:scale-95"
                >
                  Lật thẻ xem đáp án
                </button>
              )}
            </div>
          ) : (
            /* MÀN HÌNH HOÀN THÀNH PHIÊN ÔN TẬP */
            <div className="py-8 text-center space-y-6 animate-scale-up">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-purple-500/25">
                <Sparkles className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  Hoàn Thành Phiên Ôn Tập Hôm Nay!
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Bạn đã xem xét lại toàn bộ {dueItems.length} thẻ đến hạn theo thuật toán lặp lại ngắt quãng.
                </p>
              </div>

              {/* Thống kê đánh giá */}
              <div className="grid grid-cols-4 gap-2 max-w-sm mx-auto">
                <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 text-center">
                  <span className="text-[11px] text-rose-600 font-bold block">Quên</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white">{stats.again}</span>
                </div>
                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 text-center">
                  <span className="text-[11px] text-amber-600 font-bold block">Khó</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white">{stats.hard}</span>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-center">
                  <span className="text-[11px] text-emerald-600 font-bold block">Nhớ</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white">{stats.good}</span>
                </div>
                <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/30 text-center">
                  <span className="text-[11px] text-blue-600 font-bold block">Dễ</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white">{stats.easy}</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-black text-xs sm:text-sm transition active:scale-95 shadow-md"
              >
                Hoàn tất & Đóng lại
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
