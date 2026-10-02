import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { WordItem } from '../types';
import { 
  Gamepad2, 
  Timer, 
  Trophy, 
  RotateCcw, 
  Sparkles, 
  Zap, 
  Volume2, 
  Star, 
  Check, 
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { speakJapanese, stopSpeaking } from '../lib/audio';

interface MatchGameViewProps {
  words: WordItem[];
  favoriteWords: string[];
  lessonNum?: number;
  onToggleFavorite?: (id: string) => void;
}

interface MatchCard {
  uid: string; // id duy nhất của thẻ trên bàn cờ
  wordId: string; // id từ vựng
  type: 'ja' | 'vi'; // Thẻ tiếng Nhật hay Thẻ tiếng Việt
  text: string;
  subText?: string;
  isMatched: boolean;
}

const PAIRS_PER_GAME = 6; // 6 cặp = 12 ô

export const MatchGameView: React.FC<MatchGameViewProps> = ({
  words,
  favoriteWords,
  lessonNum = 1,
  onToggleFavorite
}) => {
  // Lọc: 'all' | 'starred'
  const [filterMode, setFilterMode] = useState<'all' | 'starred'>('all');

  const activeWords = useMemo(() => {
    if (filterMode === 'starred') {
      return words.filter(w => favoriteWords.includes(w.id));
    }
    return words;
  }, [words, filterMode, favoriteWords]);

  // Bộ thẻ đang chơi trên bàn cờ
  const [cards, setCards] = useState<MatchCard[]>([]);
  // Thẻ thứ nhất đang được chọn
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  // Trạng thái thẻ đang bị sai (đỏ & rung lắc)
  const [mismatchedIds, setMismatchedIds] = useState<[string, string] | null>(null);

  // Đồng hồ bấm giờ (mili-giây)
  const [elapsedTime, setElapsedTime] = useState(0); // tính bằng 1/10 giây (100ms)
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [penaltyNotice, setPenaltyNotice] = useState<string | null>(null);

  const timerRef = useRef<any>(null);

  // Kỷ lục cá nhân (Personal Best) lưu theo từng bài
  const bestRecordKey = `learn_jpd_match_best_l${lessonNum}`;
  const [bestTime, setBestTime] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem(bestRecordKey);
      if (saved) return parseFloat(saved);
    } catch {}
    return null;
  });
  const [isNewRecord, setIsNewRecord] = useState(false);

  // Khởi tạo ván chơi mới
  const startNewGame = useCallback(() => {
    if (activeWords.length === 0) return;

    // Lấy ngẫu nhiên tối đa 6 từ
    const shuffledPool = [...activeWords].sort(() => 0.5 - Math.random());
    const selectedWords = shuffledPool.slice(0, PAIRS_PER_GAME);

    // Tạo 12 thẻ (6 tiếng Nhật, 6 tiếng Việt)
    const newCards: MatchCard[] = [];
    selectedWords.forEach(w => {
      // Thẻ Nhật
      newCards.push({
        uid: `ja-${w.id}`,
        wordId: w.id,
        type: 'ja',
        text: w.kanji || w.kana,
        subText: w.kanji ? w.kana : undefined,
        isMatched: false
      });
      // Thẻ Việt
      newCards.push({
        uid: `vi-${w.id}`,
        wordId: w.id,
        type: 'vi',
        text: w.meaning,
        subText: w.hanviet ? `Hán: ${w.hanviet}` : undefined,
        isMatched: false
      });
    });

    // Xáo trộn vị trí 12 thẻ ngẫu nhiên trên lưới
    const randomizedCards = newCards.sort(() => 0.5 - Math.random());

    setCards(randomizedCards);
    setSelectedCardId(null);
    setMismatchedIds(null);
    setElapsedTime(0);
    setIsGameOver(false);
    setIsNewRecord(false);
    setPenaltyNotice(null);
    setIsPlaying(true);
  }, [activeWords]);

  // Khởi động ván chơi khi component mount hoặc đổi bộ lọc
  useEffect(() => {
    startNewGame();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopSpeaking();
    };
  }, [filterMode]);

  // Bộ đếm thời gian chạy từng 100ms
  useEffect(() => {
    if (isPlaying && !isGameOver) {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, isGameOver]);

  // Xử lý khi người dùng click vào một thẻ
  const handleCardClick = (clickedCard: MatchCard) => {
    // Không làm gì nếu đang kiểm tra lỗi hoặc thẻ đã biến mất
    if (mismatchedIds || clickedCard.isMatched) return;

    // Bấm lại vào chính thẻ đang chọn -> Bỏ chọn
    if (selectedCardId === clickedCard.uid) {
      setSelectedCardId(null);
      return;
    }

    // Nếu chưa chọn thẻ nào -> Đặt thẻ này làm thẻ 1
    if (!selectedCardId) {
      setSelectedCardId(clickedCard.uid);
      if (clickedCard.type === 'ja') {
        speakJapanese(clickedCard.subText || clickedCard.text);
      }
      return;
    }

    // Đã có thẻ 1, đây là thẻ thứ 2
    const firstCard = cards.find(c => c.uid === selectedCardId);
    if (!firstCard) return;

    if (clickedCard.type === 'ja') {
      speakJapanese(clickedCard.subText || clickedCard.text);
    }

    // Kiểm tra xem có khớp nhau không (Cùng wordId và khác loại thẻ Nhật - Việt)
    const isMatch = firstCard.wordId === clickedCard.wordId && firstCard.type !== clickedCard.type;

    if (isMatch) {
      // Ghép ĐÚNG! Đánh dấu 2 thẻ này biến mất
      setCards(prev => prev.map(c => {
        if (c.uid === firstCard.uid || c.uid === clickedCard.uid) {
          return { ...c, isMatched: true };
        }
        return c;
      }));
      setSelectedCardId(null);

      // Phát âm từ tiếng Nhật vừa ghép đúng
      const jaCard = firstCard.type === 'ja' ? firstCard : clickedCard;
      speakJapanese(jaCard.subText || jaCard.text);

      // Kiểm tra xem đã dọn sạch toàn bộ bàn cờ chưa
      const remainingUnmatched = cards.filter(
        c => !c.isMatched && c.uid !== firstCard.uid && c.uid !== clickedCard.uid
      );

      if (remainingUnmatched.length === 0) {
        // CHIẾN THẮNG GAME!
        handleGameWin();
      }
    } else {
      // Ghép SAI!
      setMismatchedIds([firstCard.uid, clickedCard.uid]);
      // Phạt cộng thêm 1 giây (10 * 100ms)
      setElapsedTime(prev => prev + 10);
      setPenaltyNotice('+1.0s phạt!');
      setTimeout(() => setPenaltyNotice(null), 1200);

      // Sau 600ms bỏ trạng thái rung đỏ
      setTimeout(() => {
        setMismatchedIds(null);
        setSelectedCardId(null);
      }, 600);
    }
  };

  // Xử lý khi hoàn thành ván chơi
  const handleGameWin = () => {
    setIsGameOver(true);
    setIsPlaying(false);

    const finalSecs = (elapsedTime + 1) / 10; // làm tròn thành giây

    // Kiểm tra kỷ lục
    if (!bestTime || finalSecs < bestTime) {
      setBestTime(finalSecs);
      setIsNewRecord(true);
      try {
        localStorage.setItem(bestRecordKey, finalSecs.toFixed(1));
      } catch {}
    }

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const formattedCurrentTime = (elapsedTime / 10).toFixed(1);

  if (activeWords.length < 2) {
    return (
      <div className="max-w-xl mx-auto py-16 px-6 text-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-sm">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Cần ít nhất 2 từ vựng để chơi Ghép thẻ
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
          {filterMode === 'starred' 
            ? 'Bạn chưa gắn sao đủ từ trong bài học này.' 
            : 'Danh sách bài học này không có đủ từ vựng.'}
        </p>
        {filterMode === 'starred' && (
          <button
            onClick={() => setFilterMode('all')}
            className="mt-4 px-5 py-2.5 rounded-2xl bg-indigo-600 text-white font-bold text-xs"
          >
            Chơi với tất cả từ trong bài
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* 1. THANH ĐIỀU HƯỚNG BỘ LỌC & ĐỒNG HỒ TÍNH GIỜ CHUẨN QUIZLET MATCH */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-3 sm:p-4 rounded-3xl shadow-sm">
        {/* Bộ lọc Tất cả vs Gắn sao */}
        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-zinc-800 p-1 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-xl transition ${
              filterMode === 'all'
                ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilterMode('starred')}
            className={`px-3 py-1.5 rounded-xl flex items-center space-x-1 transition ${
              filterMode === 'starred'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-500 hover:text-amber-500'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>Gắn sao</span>
          </button>
        </div>

        {/* Đồng hồ bấm giờ mili-giây sống động */}
        <div className="flex items-center space-x-3">
          {penaltyNotice && (
            <span className="text-xs font-black text-rose-500 animate-bounce">
              {penaltyNotice}
            </span>
          )}

          <div className="flex items-center space-x-2 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 px-3.5 py-1.5 rounded-2xl text-indigo-700 dark:text-indigo-300 font-mono font-black text-base sm:text-lg shadow-inner">
            <Timer className="w-4 h-4 animate-spin text-indigo-500" style={{ animationDuration: '3s' }} />
            <span>{formattedCurrentTime}s</span>
          </div>

          {bestTime !== null && (
            <div className="hidden sm:flex items-center space-x-1 text-xs font-bold text-amber-500" title="Kỷ lục nhanh nhất của bạn">
              <Trophy className="w-3.5 h-3.5" />
              <span>Kỷ lục: {bestTime}s</span>
            </div>
          )}

          <button
            onClick={startNewGame}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white transition hover:bg-slate-100 dark:hover:bg-zinc-800"
            title="Làm mới ván chơi"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. BÀN CỜ LƯỚI GHÉP THẺ (12 Ô CHỮ) */}
      {!isGameOver ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3 select-none">
          {cards.map(card => {
            const isSelected = selectedCardId === card.uid;
            const isMismatched = mismatchedIds && (mismatchedIds[0] === card.uid || mismatchedIds[1] === card.uid);

            if (card.isMatched) {
              // Thẻ đã ghép đúng -> Biến mất để lộ ô trống
              return (
                <div 
                  key={card.uid} 
                  className="h-28 sm:h-32 rounded-3xl border-2 border-dashed border-slate-100 dark:border-zinc-800/50 opacity-20 pointer-events-none transition-all duration-500"
                />
              );
            }

            let style = 'bg-white dark:bg-zinc-900 border-2 border-slate-200 dark:border-zinc-800 hover:border-indigo-400 dark:hover:border-indigo-500 shadow-sm';

            if (isSelected) {
              style = 'bg-indigo-50 dark:bg-indigo-950/50 border-2 border-indigo-600 dark:border-indigo-400 shadow-md ring-4 ring-indigo-500/20 scale-102';
            } else if (isMismatched) {
              style = 'bg-rose-50 dark:bg-rose-950/60 border-2 border-rose-500 shadow-md animate-shake';
            }

            return (
              <button
                key={card.uid}
                onClick={() => handleCardClick(card)}
                className={`h-28 sm:h-32 p-3 rounded-3xl flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer active:scale-95 ${style}`}
              >
                {card.type === 'ja' ? (
                  <>
                    {card.subText && (
                      <span className="text-[11px] font-medium text-slate-400 dark:text-zinc-500 mb-1 line-clamp-1">
                        {card.subText}
                      </span>
                    )}
                    <span className="font-jp font-bold text-base sm:text-lg text-slate-900 dark:text-white line-clamp-2 leading-snug">
                      {card.text}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-zinc-100 line-clamp-3 leading-snug">
                      {card.text}
                    </span>
                    {card.subText && (
                      <span className="text-[10px] text-rose-500 font-bold mt-1 line-clamp-1">
                        {card.subText}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        // 3. MÀN HÌNH CHIẾN THẮNG BẢNG KỶ LỤC
        <div className="bg-white dark:bg-zinc-900 border-2 border-indigo-300 dark:border-indigo-800 rounded-3xl p-8 text-center shadow-xl space-y-6">
          <div className="w-20 h-20 bg-gradient-to-tr from-amber-400 to-indigo-500 rounded-3xl flex items-center justify-center mx-auto text-white shadow-lg shadow-indigo-500/30">
            <Trophy className="w-10 h-10 animate-bounce" />
          </div>

          <div>
            {isNewRecord && (
              <span className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mb-2 animate-pulse">
                🏆 Kỷ lục cá nhân mới!
              </span>
            )}
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
              {formattedCurrentTime} giây
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
              Bạn đã triệt tiêu hoàn toàn tất cả các cặp thẻ từ vựng!
            </p>
          </div>

          {bestTime !== null && !isNewRecord && (
            <div className="text-xs font-bold text-slate-400">
              Kỷ lục tốt nhất trước đó: <strong className="text-amber-500">{bestTime}s</strong>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={startNewGame}
              className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-500/25 transition active:scale-95 flex items-center justify-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Chơi lại ván mới</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
