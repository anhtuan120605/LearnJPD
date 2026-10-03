import React, { useState, useMemo, useEffect } from 'react';
import { KanjiItem, WordItem } from '../types';
import { Sparkles, Volume2, RotateCcw, CheckCircle2, ArrowRight, Zap, Trophy, HelpCircle } from 'lucide-react';
import { speakJapanese } from '../lib/audio';
import confetti from 'canvas-confetti';

interface KanjiJukugoViewProps {
  kanjiList: KanjiItem[];
  allVocabWords?: WordItem[];
  currentLevel: string;
  onToggleMaster?: (id: string) => void;
  masteredKanji?: string[];
}

interface JukugoChallenge {
  word: string; // ví dụ: "会社"
  reading: string; // ví dụ: "かいしゃ"
  hanviet: string; // ví dụ: "HỘI XÃ"
  meaning: string; // ví dụ: "công ty"
  kanjiChars: string[]; // ["会", "社"]
  scrambledChars: string[]; // ["社", "会", "学", "員"]
}

export const KanjiJukugoView: React.FC<KanjiJukugoViewProps> = ({
  kanjiList,
  allVocabWords = [],
  currentLevel,
  onToggleMaster,
  masteredKanji = []
}) => {
  // Tạo danh sách câu đố ghép từ Jukugo từ kho từ vựng và kanji
  const challenges = useMemo<JukugoChallenge[]>(() => {
    const list: JukugoChallenge[] = [];
    const kanjiCharsSet = new Set(kanjiList.map(k => k.kanji));

    // Lọc từ vựng thuộc level hiện tại có từ 2 chữ Kanji trở lên
    const candidateWords = allVocabWords.filter(w => {
      if (!w.kanji || w.kanji.length < 2 || w.kanji.length > 4) return false;
      // Kiểm tra có ít nhất 1 chữ Kanji trong danh sách đang học
      const chars = Array.from(w.kanji);
      const isPureKanji = chars.every(ch => /[\u4e00-\u9faf]/.test(ch));
      return isPureKanji && chars.some(ch => kanjiCharsSet.has(ch));
    });

    // Nếu không đủ từ vựng thì lấy từ kanji.examples
    if (candidateWords.length < 10) {
      kanjiList.forEach(k => {
        if (k.examples) {
          k.examples.forEach(ex => {
            if (ex.word && ex.word.length >= 2 && ex.word.length <= 4) {
              const chars = Array.from(ex.word);
              const isPure = chars.every(ch => /[\u4e00-\u9faf]/.test(ch));
              if (isPure && !list.some(item => item.word === ex.word)) {
                list.push({
                  word: ex.word,
                  reading: ex.reading,
                  hanviet: ex.hanviet || '',
                  meaning: ex.meaning,
                  kanjiChars: chars,
                  scrambledChars: []
                });
              }
            }
          });
        }
      });
    }

    candidateWords.forEach(w => {
      if (!list.some(item => item.word === w.kanji)) {
        list.push({
          word: w.kanji,
          reading: w.kana,
          hanviet: w.hanviet || '',
          meaning: w.meaning,
          kanjiChars: Array.from(w.kanji),
          scrambledChars: []
        });
      }
    });

    // Thêm các chữ cái gây nhiễu cho từng từ
    const allUniqueKanji = Array.from(kanjiCharsSet);
    return list.slice(0, 30).map(item => {
      // Lấy thêm 2 chữ kanji ngẫu nhiên khác để gây nhiễu
      const distractors = allUniqueKanji
        .filter(ch => !item.kanjiChars.includes(ch))
        .sort(() => 0.5 - Math.random())
        .slice(0, 2);

      const combined = [...item.kanjiChars, ...distractors].sort(() => 0.5 - Math.random());
      return {
        ...item,
        scrambledChars: combined
      };
    });
  }, [kanjiList, allVocabWords, currentLevel]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChars, setSelectedChars] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  const currentChallenge = challenges[currentIndex];

  useEffect(() => {
    setSelectedChars([]);
    setIsCompleted(false);
    setIsCorrect(null);
  }, [currentIndex]);

  const handleSelectChar = (char: string, indexInScrambled: number) => {
    if (isCompleted || selectedChars.length >= (currentChallenge?.kanjiChars.length || 0)) return;

    const nextSelected = [...selectedChars, char];
    setSelectedChars(nextSelected);

    // Kiểm tra khi đã chọn đủ số ký tự
    if (nextSelected.length === currentChallenge.kanjiChars.length) {
      const formedWord = nextSelected.join('');
      const correct = formedWord === currentChallenge.word;
      setIsCompleted(true);
      setIsCorrect(correct);

      if (correct) {
        setScore(prev => prev + 10);
        setStreak(prev => prev + 1);
        speakJapanese(currentChallenge.word);
        try {
          confetti({
            particleCount: 40,
            spread: 50,
            origin: { y: 0.7 }
          });
        } catch (_) {}
      } else {
        setStreak(0);
      }
    }
  };

  const handleRemoveChar = (indexToRemove: number) => {
    if (isCompleted) return;
    setSelectedChars(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleResetCurrent = () => {
    setSelectedChars([]);
    setIsCompleted(false);
    setIsCorrect(null);
  };

  const handleNext = () => {
    if (currentIndex < challenges.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Hoàn thành vòng chơi
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
    }
  };

  if (!currentChallenge) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 text-center space-y-4">
        <Sparkles className="w-10 h-10 text-amber-500 mx-auto" />
        <h3 className="text-xl font-bold text-slate-800 dark:text-zinc-100">
          Chưa có đủ từ vựng ghép cho cấp độ {currentLevel}
        </h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Hệ thống đang đồng bộ dữ liệu từ vựng Hán tự. Vui lòng chuyển sang cấp độ N5 hoặc N4 để trải nghiệm tính năng này!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header Thống kê & Điểm số */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
                <span>Đấu Trường Ghép Từ (Jukugo)</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 font-bold">
                  {currentLevel}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Ghép các khối Kanji đơn lẻ để tạo thành từ vựng có nghĩa
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Điểm số</span>
              <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                {score} XP
              </span>
            </div>
            {streak > 1 && (
              <div className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-amber-600 dark:text-amber-400 text-xs font-black animate-pulse">
                <span>🔥</span>
                <span>x{streak} Streak!</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 flex items-center space-x-3">
          <span className="text-xs font-bold text-slate-400 shrink-0">
            Câu {currentIndex + 1} / {challenges.length}
          </span>
          <div className="flex-1 h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / challenges.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Vùng thử thách chính */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8">
        {/* Nghĩa tiếng Việt & Gợi ý âm Hán */}
        <div className="text-center space-y-2">
          <span className="inline-block px-3 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Nghĩa từ vựng
          </span>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white capitalize">
            {currentChallenge.meaning}
          </h3>
          {currentChallenge.hanviet && (
            <p className="text-xs font-bold text-rose-500 tracking-widest uppercase">
              Âm Hán: {currentChallenge.hanviet}
            </p>
          )}
        </div>

        {/* Khung xếp từ ghép (Target Slots) */}
        <div className="flex items-center justify-center gap-3">
          {currentChallenge.kanjiChars.map((_, slotIdx) => {
            const char = selectedChars[slotIdx];
            return (
              <button
                key={slotIdx}
                onClick={() => char && handleRemoveChar(slotIdx)}
                className={`w-18 h-18 sm:w-22 sm:h-22 rounded-3xl border-2 flex items-center justify-center text-3xl sm:text-4xl font-jp font-bold transition-all relative group ${
                  char 
                    ? isCompleted
                      ? isCorrect 
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300 shadow-lg shadow-emerald-500/10'
                        : 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 shadow-lg shadow-rose-500/10'
                      : 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-300 hover:border-rose-400'
                    : 'border-dashed border-slate-300 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-850/40 text-slate-300 dark:text-zinc-600'
                }`}
              >
                {char ? (
                  <>
                    <span>{char}</span>
                    {!isCompleted && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-slate-200 dark:bg-zinc-700 text-slate-500 text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        ×
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-base text-slate-300 dark:text-zinc-600 font-mono">
                    #{slotIdx + 1}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Các khối Kanji có thể chọn (Scrambled pool) */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-center text-slate-400 uppercase tracking-wider">
            Chọn các chữ Kanji bên dưới theo đúng thứ tự:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {currentChallenge.scrambledChars.map((ch, idx) => {
              // Đếm số lần xuất hiện của ch trong scrambled vs selected để biết đã chọn hết chưa
              const countInScrambled = currentChallenge.scrambledChars.filter(c => c === ch).length;
              const countInSelected = selectedChars.filter(c => c === ch).length;
              const isUsed = countInSelected >= countInScrambled;

              return (
                <button
                  key={idx}
                  disabled={isUsed || isCompleted}
                  onClick={() => handleSelectChar(ch, idx)}
                  className={`w-16 h-16 sm:w-18 sm:h-18 rounded-2xl border-2 flex items-center justify-center text-2xl sm:text-3xl font-jp font-bold transition-all active:scale-95 ${
                    isUsed
                      ? 'opacity-25 border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-800 cursor-not-allowed scale-95'
                      : 'border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 hover:border-indigo-500 hover:shadow-md hover:-translate-y-0.5'
                  }`}
                >
                  {ch}
                </button>
              );
            })}
          </div>
        </div>

        {/* Kết quả sau khi ghép xong */}
        {isCompleted && (
          <div className={`p-5 rounded-2xl border transition-all animate-in fade-in zoom-in-95 duration-200 ${
            isCorrect 
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50' 
              : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/50'
          }`}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3 text-center sm:text-left">
                {isCorrect ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 shrink-0" />
                ) : (
                  <RotateCcw className="w-8 h-8 text-rose-500 shrink-0" />
                )}
                <div>
                  <div className="flex items-center justify-center sm:justify-start space-x-2">
                    <span className="text-2xl font-bold font-jp text-slate-900 dark:text-white">
                      {currentChallenge.word}
                    </span>
                    <span className="text-sm font-semibold text-slate-500 dark:text-zinc-400">
                      ({currentChallenge.reading})
                    </span>
                    <button
                      onClick={() => speakJapanese(currentChallenge.word)}
                      className="p-1.5 rounded-lg bg-white dark:bg-zinc-800 hover:bg-slate-100 text-indigo-600 transition"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-zinc-300 mt-0.5">
                    {isCorrect ? 'Tuyệt vời! Bạn đã ghép chính xác từ vựng này.' : `Đáp án đúng là: ${currentChallenge.word} (${currentChallenge.reading})`}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                {!isCorrect && (
                  <button
                    onClick={handleResetCurrent}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-50 text-slate-700 dark:text-zinc-200 text-xs font-bold transition flex items-center space-x-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Thử lại</span>
                  </button>
                )}
                <button
                  onClick={handleNext}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-md shadow-indigo-500/20 flex items-center space-x-1.5 active:scale-95"
                >
                  <span>{currentIndex < challenges.length - 1 ? 'Từ tiếp theo' : 'Hoàn thành'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
