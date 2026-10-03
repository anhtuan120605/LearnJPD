import React, { useState, useMemo, useEffect } from 'react';
import { KANJI_LOOKALIKE_PAIRS, LookAlikePair } from '../data/kanjiLookAlikes';
import { Scale, Volume2, Sparkles, Zap, CheckCircle2, XCircle, ArrowRight, RotateCcw, Eye, ShieldAlert } from 'lucide-react';
import { speakJapanese } from '../lib/audio';
import confetti from 'canvas-confetti';

interface KanjiLookAlikeViewProps {
  currentLevel: string;
}

export const KanjiLookAlikeView: React.FC<KanjiLookAlikeViewProps> = ({ currentLevel }) => {
  const [activeMode, setActiveMode] = useState<'compare' | 'quiz'>('compare');
  const [levelFilter, setLevelFilter] = useState<string>(currentLevel);

  // Lọc cặp chữ theo level
  const filteredPairs = useMemo(() => {
    const matched = KANJI_LOOKALIKE_PAIRS.filter(p => p.level === levelFilter);
    return matched.length > 0 ? matched : KANJI_LOOKALIKE_PAIRS;
  }, [levelFilter]);

  const [selectedPairIndex, setSelectedPairIndex] = useState(0);
  const currentPair = filteredPairs[selectedPairIndex] || filteredPairs[0];

  // Trạng thái cho chế độ Quiz phản xạ 5s
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizChoice, setQuizChoice] = useState<string | null>(null);
  const [quizTimer, setQuizTimer] = useState(6);
  const [quizActive, setQuizActive] = useState(false);

  // Tạo câu hỏi quiz từ các cặp chữ
  const quizQuestions = useMemo(() => {
    return filteredPairs.flatMap(pair => [
      {
        pair,
        targetChar: pair.kanji1.char,
        targetHanviet: pair.kanji1.hanviet,
        targetMeaning: pair.kanji1.meaning,
        targetExample: pair.kanji1.example,
        options: [pair.kanji1.char, pair.kanji2.char].sort(() => 0.5 - Math.random())
      },
      {
        pair,
        targetChar: pair.kanji2.char,
        targetHanviet: pair.kanji2.hanviet,
        targetMeaning: pair.kanji2.meaning,
        targetExample: pair.kanji2.example,
        options: [pair.kanji1.char, pair.kanji2.char].sort(() => 0.5 - Math.random())
      }
    ]).sort(() => 0.5 - Math.random());
  }, [filteredPairs]);

  const currentQuiz = quizQuestions[quizIndex];

  // Đếm ngược timer cho quiz
  useEffect(() => {
    let interval: any;
    if (activeMode === 'quiz' && quizActive && quizChoice === null && quizTimer > 0) {
      interval = setInterval(() => {
        setQuizTimer(prev => prev - 1);
      }, 1000);
    } else if (quizTimer === 0 && quizChoice === null && quizActive) {
      setQuizChoice('timeout');
    }
    return () => clearInterval(interval);
  }, [activeMode, quizActive, quizChoice, quizTimer]);

  const handleStartQuiz = () => {
    setActiveMode('quiz');
    setQuizActive(true);
    setQuizIndex(0);
    setQuizScore(0);
    setQuizChoice(null);
    setQuizTimer(6);
  };

  const handleQuizAnswer = (char: string) => {
    if (quizChoice !== null || !currentQuiz) return;
    setQuizChoice(char);
    if (char === currentQuiz.targetChar) {
      setQuizScore(prev => prev + 10);
      try {
        confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
      } catch (_) {}
    }
  };

  const handleNextQuiz = () => {
    if (quizIndex < quizQuestions.length - 1) {
      setQuizIndex(prev => prev + 1);
      setQuizChoice(null);
      setQuizTimer(6);
    } else {
      setQuizActive(false);
      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } });
      } catch (_) {}
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
                <span>Phân Biệt Cặp Kanji Dễ Lẫn</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-300 font-bold">
                  {levelFilter}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Khắc phục triệt để các cặp chữ Hán "song sinh" dễ gây nhầm lẫn kinh điển
              </p>
            </div>
          </div>

          {/* Switcher chế độ: So sánh vs Quiz */}
          <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-zinc-800 p-1.5 rounded-2xl">
            <button
              onClick={() => setActiveMode('compare')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                activeMode === 'compare'
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                  : 'text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>So sánh đối đầu</span>
            </button>

            <button
              onClick={handleStartQuiz}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                activeMode === 'quiz'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Thách đấu phản xạ</span>
            </button>
          </div>
        </div>

        {/* Cấp độ filter pills */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800/80 flex items-center space-x-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Cấp độ:</span>
          {['N5', 'N4'].map(lvl => (
            <button
              key={lvl}
              onClick={() => {
                setLevelFilter(lvl);
                setSelectedPairIndex(0);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                levelFilter === lvl
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* CHẾ ĐỘ 1: SO SÁNH ĐỐI ĐẦU SIDE-BY-SIDE */}
      {activeMode === 'compare' && currentPair && (
        <div className="space-y-6">
          {/* Danh sách các cặp chữ có thể chọn */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {filteredPairs.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => setSelectedPairIndex(idx)}
                className={`px-3.5 py-2 rounded-2xl border text-xs font-bold shrink-0 transition flex items-center space-x-2 ${
                  idx === selectedPairIndex
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 ring-2 ring-amber-500/20 shadow-xs'
                    : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:border-slate-300'
                }`}
              >
                <span className="font-jp text-base font-bold">{p.kanji1.char}</span>
                <span className="text-[10px] text-slate-400">vs</span>
                <span className="font-jp text-base font-bold">{p.kanji2.char}</span>
              </button>
            ))}
          </div>

          {/* Khung so sánh lớn 2 cột đối đầu */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cột chữ 1 */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4 relative overflow-hidden group">
              <div className="text-center space-y-2">
                <div className="w-24 h-24 mx-auto rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center">
                  <span className="text-5xl sm:text-6xl font-jp font-bold text-amber-600 dark:text-amber-400">
                    {currentPair.kanji1.char}
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  {currentPair.kanji1.hanviet}
                </h3>
                <p className="text-sm font-semibold text-slate-600 dark:text-zinc-300">
                  {currentPair.kanji1.meaning}
                </p>
                <p className="text-xs font-jp text-slate-400 font-mono">
                  {currentPair.kanji1.reading}
                </p>
              </div>

              {/* Điểm đặc trưng bộ thủ */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 block">
                  Đặc điểm nhận dạng:
                </span>
                <p className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                  {currentPair.kanji1.distinctFeature}
                </p>
              </div>

              {/* Ví dụ thực tế */}
              <div className="p-3.5 rounded-2xl bg-amber-500/[0.04] border border-amber-500/20 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Ví dụ câu:</span>
                  <button
                    onClick={() => speakJapanese(currentPair.kanji1.example)}
                    className="p-1 rounded-lg text-amber-600 hover:bg-amber-100 transition"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs font-jp font-bold text-slate-900 dark:text-white">
                  {currentPair.kanji1.example}
                </p>
                <p className="text-[11px] text-slate-500">
                  {currentPair.kanji1.exampleVi}
                </p>
              </div>
            </div>

            {/* Cột chữ 2 */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4 relative overflow-hidden group">
              <div className="text-center space-y-2">
                <div className="w-24 h-24 mx-auto rounded-3xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center justify-center">
                  <span className="text-5xl sm:text-6xl font-jp font-bold text-blue-600 dark:text-blue-400">
                    {currentPair.kanji2.char}
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  {currentPair.kanji2.hanviet}
                </h3>
                <p className="text-sm font-semibold text-slate-600 dark:text-zinc-300">
                  {currentPair.kanji2.meaning}
                </p>
                <p className="text-xs font-jp text-slate-400 font-mono">
                  {currentPair.kanji2.reading}
                </p>
              </div>

              {/* Điểm đặc trưng bộ thủ */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 block">
                  Đặc điểm nhận dạng:
                </span>
                <p className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                  {currentPair.kanji2.distinctFeature}
                </p>
              </div>

              {/* Ví dụ thực tế */}
              <div className="p-3.5 rounded-2xl bg-blue-500/[0.04] border border-blue-500/20 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Ví dụ câu:</span>
                  <button
                    onClick={() => speakJapanese(currentPair.kanji2.example)}
                    className="p-1 rounded-lg text-blue-600 hover:bg-blue-100 transition"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs font-jp font-bold text-slate-900 dark:text-white">
                  {currentPair.kanji2.example}
                </p>
                <p className="text-[11px] text-slate-500">
                  {currentPair.kanji2.exampleVi}
                </p>
              </div>
            </div>
          </div>

          {/* Mẹo phân biệt cốt lõi */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200/80 dark:border-amber-900/50 rounded-3xl p-5 sm:p-6 space-y-2">
            <div className="flex items-center space-x-2 text-amber-700 dark:text-amber-300 font-black text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Mẹo Phân Biệt Cốt Lõi</span>
            </div>
            <p className="text-sm font-semibold text-slate-800 dark:text-zinc-200 leading-relaxed">
              {currentPair.keyDifference}
            </p>
            <div className="mt-2 pt-2 border-t border-amber-200/50 dark:border-amber-800/40">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                💡 Câu khẩu quyết: 
              </span>
              <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 italic ml-1">
                "{currentPair.mnemonicTip}"
              </span>
            </div>
          </div>
        </div>
      )}

      {/* CHẾ ĐỘ 2: THÁCH ĐẤU PHẢN XẠ NHANH 5S */}
      {activeMode === 'quiz' && (
        <div className="space-y-6">
          {quizActive && currentQuiz ? (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8">
              {/* Header Quiz: Timer & Score */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-400">
                    Câu {quizIndex + 1} / {quizQuestions.length}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <div className={`px-3 py-1 rounded-xl text-xs font-black flex items-center space-x-1 ${
                    quizTimer <= 2 
                      ? 'bg-rose-500 text-white animate-bounce' 
                      : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                  }`}>
                    <span>⏱️</span>
                    <span>{quizTimer}s</span>
                  </div>
                  <span className="text-sm font-black text-rose-500">
                    {quizScore} XP
                  </span>
                </div>
              </div>

              {/* Đề bài */}
              <div className="text-center space-y-2">
                <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                  Chọn đúng chữ Kanji mang nghĩa:
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {currentQuiz.targetMeaning} ({currentQuiz.targetHanviet})
                </h3>
                <p className="text-xs text-slate-400 font-jp">
                  Gợi ý: {currentQuiz.targetExample}
                </p>
              </div>

              {/* 2 Lựa chọn Kanji to khổng lồ */}
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                {currentQuiz.options.map((optChar) => {
                  const isSelected = quizChoice === optChar;
                  const isCorrect = optChar === currentQuiz.targetChar;
                  const hasAnswered = quizChoice !== null;

                  let style = 'border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-850/50 hover:border-amber-400 hover:scale-102';
                  if (hasAnswered) {
                    if (isCorrect) {
                      style = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 ring-4 ring-emerald-500/20';
                    } else if (isSelected) {
                      style = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-600 ring-4 ring-rose-500/20';
                    } else {
                      style = 'opacity-30 border-slate-200';
                    }
                  }

                  return (
                    <button
                      key={optChar}
                      disabled={hasAnswered}
                      onClick={() => handleQuizAnswer(optChar)}
                      className={`h-36 sm:h-44 rounded-3xl border-3 flex items-center justify-center text-6xl sm:text-7xl font-jp font-bold transition-all ${style}`}
                    >
                      {optChar}
                    </button>
                  );
                })}
              </div>

              {/* Kết quả phản xạ & Nút tiếp */}
              {quizChoice !== null && (
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-zinc-800">
                  <div className="flex items-center space-x-2">
                    {quizChoice === currentQuiz.targetChar ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <span className="text-xs font-bold text-emerald-600">Chính xác xuất sắc!</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-rose-500" />
                        <span className="text-xs font-bold text-rose-600">
                          {quizChoice === 'timeout' ? 'Hết giờ!' : 'Nhầm lẫn rồi!'} Đáp án đúng là {currentQuiz.targetChar}
                        </span>
                      </>
                    )}
                  </div>

                  <button
                    onClick={handleNextQuiz}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold transition flex items-center space-x-1.5"
                  >
                    <span>{quizIndex < quizQuestions.length - 1 ? 'Câu tiếp theo' : 'Xem tổng kết'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 text-center space-y-4">
              <Zap className="w-12 h-12 text-rose-500 mx-auto" />
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                Thách Đấu Hoàn Tất!
              </h3>
              <p className="text-sm text-slate-500">
                Bạn đã đạt được tổng cộng <strong className="text-rose-500">{quizScore} XP</strong> trong thử thách phản xạ chữ dễ lẫn.
              </p>
              <div className="pt-2 flex justify-center space-x-3">
                <button
                  onClick={handleStartQuiz}
                  className="px-5 py-2.5 rounded-xl bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-500/20"
                >
                  Chơi lại
                </button>
                <button
                  onClick={() => setActiveMode('compare')}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 text-xs font-bold"
                >
                  Quay lại xem so sánh
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
