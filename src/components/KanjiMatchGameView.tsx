import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { KanjiItem } from '../types';
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

interface KanjiMatchGameViewProps {
  kanjiList: KanjiItem[];
  favoriteKanji: string[];
  currentLevel: string;
  onToggleFavorite?: (id: string) => void;
}

interface MatchCard {
  uid: string;
  kanjiId: string;
  type: 'kanji' | 'hanviet';
  text: string;
  subText?: string;
  isMatched: boolean;
}

const PAIRS_PER_GAME = 6; // 6 cặp = 12 thẻ

export const KanjiMatchGameView: React.FC<KanjiMatchGameViewProps> = ({
  kanjiList,
  favoriteKanji,
  currentLevel,
  onToggleFavorite
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'starred'>('all');

  const activePool = useMemo(() => {
    if (filterMode === 'starred') {
      return kanjiList.filter(k => favoriteKanji.includes(k.id));
    }
    return kanjiList;
  }, [kanjiList, filterMode, favoriteKanji]);

  const [cards, setCards] = useState<MatchCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [mismatchedIds, setMismatchedIds] = useState<[string, string] | null>(null);

  const [elapsedTime, setElapsedTime] = useState(0); // in tenths of a second (100ms)
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [penaltyNotice, setPenaltyNotice] = useState<string | null>(null);

  const timerRef = useRef<any>(null);

  // High score / Personal Best
  const bestRecordKey = `learn_jpd_kanji_match_best_${currentLevel}`;
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
    if (activePool.length === 0) return;

    const shuffledPool = [...activePool].sort(() => 0.5 - Math.random());
    const selectedKanji = shuffledPool.slice(0, PAIRS_PER_GAME);

    const newCards: MatchCard[] = [];
    selectedKanji.forEach(k => {
      // Thẻ chữ Hán
      newCards.push({
        uid: `kanji-${k.id}`,
        kanjiId: k.id,
        type: 'kanji',
        text: k.kanji,
        subText: k.kunyomi[0] || k.onyomi[0],
        isMatched: false
      });
      // Thẻ Âm Hán Việt & Ý nghĩa
      newCards.push({
        uid: `hanviet-${k.id}`,
        kanjiId: k.id,
        type: 'hanviet',
        text: k.hanviet,
        subText: k.meanings_vi[0] || '',
        isMatched: false
      });
    });

    // Shuffle 12 thẻ
    for (let i = newCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newCards[i], newCards[j]] = [newCards[j], newCards[i]];
    }

    setCards(newCards);
    setSelectedCardId(null);
    setMismatchedIds(null);
    setElapsedTime(0);
    setIsPlaying(true);
    setIsGameOver(false);
    setIsNewRecord(false);
    setPenaltyNotice(null);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 100);
  }, [activePool]);

  // Clean timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopSpeaking();
    };
  }, []);

  // Bắt đầu game khi mount hoặc đổi level / filter
  useEffect(() => {
    startNewGame();
  }, [currentLevel, filterMode, activePool.length]);

  // Xử lý click vào thẻ
  const handleCardClick = (card: MatchCard) => {
    if (!isPlaying || card.isMatched || mismatchedIds) return;
    if (selectedCardId === card.uid) {
      setSelectedCardId(null);
      return;
    }

    // Nếu chưa chọn thẻ nào
    if (!selectedCardId) {
      setSelectedCardId(card.uid);
      if (card.type === 'kanji') {
        const k = activePool.find(item => item.id === card.kanjiId);
        if (k) speakJapanese(k.kunyomi[0] || k.onyomi[0] || k.kanji);
      }
      return;
    }

    // Đã chọn thẻ thứ nhất, giờ click thẻ thứ hai
    const firstCard = cards.find(c => c.uid === selectedCardId);
    if (!firstCard) return;

    // Không được chọn 2 thẻ cùng loại (ví dụ 2 thẻ cùng là kanji hoặc cùng là hanviet)
    if (firstCard.type === card.type) {
      setSelectedCardId(card.uid);
      return;
    }

    // Kiểm tra xem có cùng kanjiId không
    const isMatch = firstCard.kanjiId === card.kanjiId;

    if (isMatch) {
      // Ghép đúng
      const matchedKanji = activePool.find(k => k.id === card.kanjiId);
      if (matchedKanji) {
        speakJapanese(matchedKanji.kunyomi[0] || matchedKanji.onyomi[0] || matchedKanji.kanji);
      }

      setCards(prev => prev.map(c => {
        if (c.kanjiId === card.kanjiId) {
          return { ...c, isMatched: true };
        }
        return c;
      }));
      setSelectedCardId(null);

      // Kiểm tra xem đã hoàn thành toàn bộ chưa
      const remainingUnmatched = cards.filter(c => !c.isMatched && c.kanjiId !== card.kanjiId);
      if (remainingUnmatched.length === 0) {
        // Kết thúc trò chơi
        if (timerRef.current) clearInterval(timerRef.current);
        setIsPlaying(false);
        setIsGameOver(true);

        const finalSec = (elapsedTime + 1) / 10;
        if (!bestTime || finalSec < bestTime) {
          setBestTime(finalSec);
          setIsNewRecord(true);
          try {
            localStorage.setItem(bestRecordKey, finalSec.toString());
          } catch {}
        }

        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
    } else {
      // Ghép sai: Phạt cộng 1 giây & hiệu ứng rung đỏ
      setMismatchedIds([firstCard.uid, card.uid]);
      setElapsedTime(prev => prev + 10); // +10 tenths = +1s
      setPenaltyNotice('+1.0s phạt');

      setTimeout(() => {
        setPenaltyNotice(null);
      }, 1200);

      setTimeout(() => {
        setMismatchedIds(null);
        setSelectedCardId(null);
      }, 700);
    }
  };

  const formattedTime = (elapsedTime / 10).toFixed(1);

  if (activePool.length < PAIRS_PER_GAME) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-12 text-center shadow-sm max-w-lg mx-auto">
        <Gamepad2 className="w-12 h-12 text-rose-500 mx-auto mb-3 opacity-60" />
        <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-200">
          Cần ít nhất {PAIRS_PER_GAME} chữ Kanji để chơi Ghép thẻ
        </h3>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
          {filterMode === 'starred'
            ? 'Bạn chưa đánh dấu đủ 6 chữ Kanji có dấu sao. Hãy chuyển sang "Tất cả" để chơi!'
            : 'Danh sách Kanji hiện tại chưa đủ số lượng để tạo bàn cờ ghép thẻ.'}
        </p>
        <button
          onClick={() => setFilterMode('all')}
          className="mt-6 px-6 py-2.5 rounded-2xl bg-rose-500 text-white font-bold text-xs hover:bg-rose-600 transition"
        >
          Chơi với tất cả Kanji ({kanjiList.length})
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Top Header: Timer, Best Score, Actions */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        {/* Đồng hồ bấm giờ */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-slate-100 dark:bg-zinc-800 px-3.5 py-1.5 rounded-xl font-mono">
            <Timer className="w-4 h-4 text-rose-500" />
            <span className="text-base font-black text-slate-900 dark:text-white">
              {formattedTime}s
            </span>
          </div>

          {penaltyNotice && (
            <span className="text-xs font-black text-rose-500 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 px-2 py-1 rounded-lg animate-bounce">
              {penaltyNotice}
            </span>
          )}
        </div>

        {/* Kỷ lục tốt nhất & Reset */}
        <div className="flex items-center space-x-3">
          {bestTime !== null && (
            <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-900/40">
              <Trophy className="w-3.5 h-3.5" />
              <span>Kỷ lục: {bestTime.toFixed(1)}s</span>
            </div>
          )}

          <button
            onClick={startNewGame}
            title="Chơi lại ván mới"
            className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* GAME OVER SCREEN */}
      {isGameOver ? (
        <div className="bg-white dark:bg-zinc-900 border-2 border-rose-300 dark:border-rose-900/60 rounded-3xl p-8 sm:p-10 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-200">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 text-white mx-auto flex items-center justify-center shadow-lg shadow-rose-500/30">
            <Trophy className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Xuất Sắc! Bạn Đã Ghép Đúng Tất Cả!
            </h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
              Thời gian hoàn thành: <strong className="text-rose-500 font-mono text-lg">{formattedTime}s</strong>
            </p>
            {isNewRecord && (
              <span className="inline-block mt-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-wider animate-pulse">
                🎉 Kỷ lục cá nhân mới!
              </span>
            )}
          </div>

          <div className="flex items-center justify-center space-x-3 pt-2">
            <button
              onClick={startNewGame}
              className="px-8 py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-black text-sm shadow-lg shadow-rose-500/25 transition flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Chơi ván mới (bộ 6 chữ khác)</span>
            </button>
          </div>
        </div>
      ) : (
        /* LƯỚI THẺ 12 Ô (3x4 hoặc 4x3) */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {cards.map(card => {
            const isSelected = selectedCardId === card.uid;
            const isMismatched = mismatchedIds && mismatchedIds.includes(card.uid);

            if (card.isMatched) {
              return (
                <div
                  key={card.uid}
                  className="h-28 rounded-2xl border border-dashed border-emerald-300/40 dark:border-emerald-800/30 bg-emerald-500/[0.03] flex items-center justify-center opacity-40 select-none"
                >
                  <Check className="w-5 h-5 text-emerald-500" />
                </div>
              );
            }

            let cardStyle = 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-rose-400 hover:shadow-md';

            if (isMismatched) {
              cardStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 animate-wiggle';
            } else if (isSelected) {
              cardStyle = 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-500/[0.04] shadow-lg shadow-rose-500/10 scale-102';
            }

            return (
              <button
                key={card.uid}
                onClick={() => handleCardClick(card)}
                className={`h-28 p-3 rounded-2xl border-2 transition-all flex flex-col items-center justify-center text-center select-none ${cardStyle}`}
              >
                {card.type === 'kanji' ? (
                  <div>
                    <span className="text-4xl font-jp font-bold text-slate-900 dark:text-white block">
                      {card.text}
                    </span>
                    {card.subText && (
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-jp block mt-1">
                        {card.subText}
                      </span>
                    )}
                  </div>
                ) : (
                  <div>
                    <span className="text-base font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 block truncate max-w-[150px]">
                      {card.text}
                    </span>
                    {card.subText && (
                      <span className="text-[11px] text-slate-600 dark:text-zinc-300 font-medium block mt-1 line-clamp-2">
                        {card.subText}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Footer Game Rules Tip */}
      <div className="text-center text-xs text-slate-400 dark:text-zinc-500 space-y-1">
        <p>💡 <strong>Cách chơi:</strong> Chọn 1 thẻ Chữ Hán và ghép với thẻ Âm Hán Việt / Ý nghĩa tương ứng.</p>
        <p>Mỗi lần chọn sai sẽ bị cộng thêm <strong>+1.0s phạt</strong> vào tổng thời gian!</p>
      </div>
    </div>
  );
};
