import React, { useState, useEffect } from 'react';
import { WordItem } from '../types';
import { 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Trophy, 
  RotateCcw, 
  Volume2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { speakJapanese } from '../lib/audio';
import { normalizeJapaneseAnswer, isJapaneseAnswerMatch } from '../lib/textUtils';
import { 
  getPracticeSessionKey, 
  savePracticeSession, 
  loadPracticeSession, 
  clearPracticeSession,
  QuizSessionState 
} from '../lib/practiceSession';

interface PracticeViewProps {
  words: WordItem[];
  mistakeWords: string[];
  onAddMistake: (id: string) => void;
  onRemoveMistake: (id: string) => void;
  onSaveQuizScore: (score: number, total: number, type: string) => void;
  onAddMastered?: (id: string) => void;
}

type PracticeMode = 'multiple_choice' | 'typing' | 'matching';

export const PracticeView: React.FC<PracticeViewProps> = ({
  words,
  mistakeWords,
  onAddMistake,
  onRemoveMistake,
  onSaveQuizScore,
  onAddMastered
}) => {
  const [mode, setMode] = useState<PracticeMode>('multiple_choice');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  
  // Cho chế độ gõ từ (typing)
  const [inputVal, setInputVal] = useState('');
  const [isTypingCorrect, setIsTypingCorrect] = useState<boolean | null>(null);

  // Chuẩn bị danh sách câu hỏi dạng hàng đợi động (nếu trả lời sai sẽ đẩy về sau làm lại)
  const [quizQueue, setQuizQueue] = useState<WordItem[]>(() => words.slice(0, 15));
  // Bật/tắt chế độ lặp lại câu sai cho đến khi đúng
  const [repeatMistakes, setRepeatMistakes] = useState<boolean>(true);
  // Tập hợp các ID từ đã trả lời đúng lần đầu
  const [resolvedWordIds, setResolvedWordIds] = useState<Set<string>>(new Set());
  // Đếm số lượt đã lặp lại câu sai
  const [retryCount, setRetryCount] = useState<number>(0);

  // Key phiên làm bài & thông báo tự động khôi phục
  const sessionKey = React.useMemo(() => getPracticeSessionKey('quiz', words), [words]);
  const [restoredBanner, setRestoredBanner] = useState<string | null>(null);

  // Khởi tạo hoặc khôi phục tiến độ khi bộ từ đầu vào thay đổi hoặc tải lại trang
  useEffect(() => {
    const saved = loadPracticeSession<QuizSessionState>(sessionKey);
    if (saved && saved.currentIdx > 0 && saved.currentIdx < saved.quizQueue.length) {
      setQuizQueue(saved.quizQueue);
      setCurrentIdx(saved.currentIdx);
      setScore(saved.score);
      setMode(saved.mode || 'multiple_choice');
      setResolvedWordIds(new Set(saved.resolvedWordIds || []));
      setRetryCount(saved.retryCount || 0);
      setRepeatMistakes(saved.repeatMistakes !== undefined ? saved.repeatMistakes : true);
      setIsFinished(false);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setInputVal('');
      setIsTypingCorrect(null);
      setRestoredBanner(`Đã khôi phục câu số ${saved.currentIdx + 1}/${saved.quizQueue.length} đang làm dở`);
    } else {
      setQuizQueue(words.slice(0, 15));
      setCurrentIdx(0);
      setScore(0);
      setIsFinished(false);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setInputVal('');
      setIsTypingCorrect(null);
      setResolvedWordIds(new Set());
      setRetryCount(0);
      setRestoredBanner(null);
    }
  }, [words, sessionKey]);

  // Tự động lưu tiến độ vào LocalStorage mỗi khi trả lời hoặc chuyển câu
  useEffect(() => {
    if (isFinished || quizQueue.length === 0) return;
    if (currentIdx > 0 || resolvedWordIds.size > 0 || retryCount > 0) {
      savePracticeSession<QuizSessionState>(sessionKey, {
        currentIdx,
        quizQueue,
        score,
        mode,
        resolvedWordIds: Array.from(resolvedWordIds),
        retryCount,
        repeatMistakes,
        updatedAt: Date.now()
      });
    }
  }, [currentIdx, quizQueue, score, mode, resolvedWordIds, retryCount, repeatMistakes, isFinished, sessionKey]);

  // Tạo 4 đáp án trắc nghiệm khi đổi câu hỏi
  useEffect(() => {
    if (quizQueue.length === 0 || isFinished) return;
    const currentWord = quizQueue[currentIdx];
    if (!currentWord) return;

    // Lấy đáp án đúng và 3 đáp án sai ngẫu nhiên
    const correctAnswer = currentWord.meaning;
    const wrongAnswers = words
      .filter(w => w.id !== currentWord.id && w.meaning !== correctAnswer)
      .map(w => w.meaning)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    const allOpts = [correctAnswer, ...wrongAnswers].sort(() => 0.5 - Math.random());
    setOptions(allOpts);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setInputVal('');
    setIsTypingCorrect(null);
  }, [currentIdx, mode, quizQueue]);

  // Xử lý chọn đáp án trắc nghiệm
  const handleSelectOption = (opt: string) => {
    if (isAnswered) return;
    const currentWord = quizQueue[currentIdx];
    setSelectedAnswer(opt);
    setIsAnswered(true);

    const isCorrect = opt === currentWord.meaning;
    if (isCorrect) {
      if (!resolvedWordIds.has(currentWord.id)) {
        setScore(s => s + 1);
        setResolvedWordIds(prev => new Set(prev).add(currentWord.id));
      }
      onRemoveMistake(currentWord.id);
      onAddMastered?.(currentWord.id);
    } else {
      onAddMistake(currentWord.id);
      if (repeatMistakes) {
        // Đẩy câu hỏi sai về cuối hàng đợi để người học làm lại ở lần sau
        setQuizQueue(prev => [...prev, currentWord]);
        setRetryCount(c => c + 1);
      }
    }
  };

  // Xử lý kiểm tra gõ từ
  const handleCheckTyping = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAnswered) return;
    const currentWord = quizQueue[currentIdx];
    const isCorrect = 
      isJapaneseAnswerMatch(inputVal, currentWord.kana) ||
      isJapaneseAnswerMatch(inputVal, currentWord.romaji) ||
      isJapaneseAnswerMatch(inputVal, currentWord.kanji || '');

    setIsTypingCorrect(isCorrect);
    setIsAnswered(true);

    if (isCorrect) {
      if (!resolvedWordIds.has(currentWord.id)) {
        setScore(s => s + 1);
        setResolvedWordIds(prev => new Set(prev).add(currentWord.id));
      }
      onRemoveMistake(currentWord.id);
      onAddMastered?.(currentWord.id);
    } else {
      onAddMistake(currentWord.id);
      if (repeatMistakes) {
        // Đẩy câu hỏi sai về cuối hàng đợi
        setQuizQueue(prev => [...prev, currentWord]);
        setRetryCount(c => c + 1);
      }
    }
  };

  // Chuyển sang câu tiếp
  const handleNextQuestion = () => {
    if (currentIdx + 1 < quizQueue.length) {
      setCurrentIdx(i => i + 1);
    } else {
      // Kết thúc bài kiểm tra
      setIsFinished(true);
      clearPracticeSession(sessionKey);
      setRestoredBanner(null);
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
      onSaveQuizScore(score, Math.min(words.length, 15), mode);
    }
  };

  const handleRestart = () => {
    clearPracticeSession(sessionKey);
    setRestoredBanner(null);
    setQuizQueue(words.slice(0, 15));
    setCurrentIdx(0);
    setScore(0);
    setIsFinished(false);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setInputVal('');
    setIsTypingCorrect(null);
    setResolvedWordIds(new Set());
    setRetryCount(0);
  };

  if (quizQueue.length === 0) {
    return (
      <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-8 shadow-sm">
        <p className="text-slate-500">Vui lòng chọn bài học có từ vựng để bắt đầu luyện tập.</p>
      </div>
    );
  }

  const currentWord = quizQueue[currentIdx];

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Banner thông báo đã khôi phục phiên làm bài dở dang */}
      {restoredBanner && !isFinished && (
        <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 px-4 py-2.5 rounded-2xl text-xs text-blue-700 dark:text-blue-300 shadow-2xs">
          <div className="flex items-center space-x-2">
            <span className="text-sm">🔄</span>
            <span>{restoredBanner} (tiến độ được tự động lưu lại).</span>
          </div>
          <button
            onClick={handleRestart}
            className="font-bold underline hover:text-blue-900 dark:hover:text-blue-100 ml-3 shrink-0"
          >
            Làm lại từ đầu
          </button>
        </div>
      )}

      {/* Header điều khiển: Chế độ & Bật tắt lặp lại câu sai */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-100 dark:bg-zinc-800 p-2 rounded-2xl">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => { setMode('multiple_choice'); handleRestart(); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              mode === 'multiple_choice'
                ? 'bg-white dark:bg-zinc-700 text-rose-600 dark:text-rose-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Trắc nghiệm 4 đáp án
          </button>
          <button
            onClick={() => { setMode('typing'); handleRestart(); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              mode === 'typing'
                ? 'bg-white dark:bg-zinc-700 text-rose-600 dark:text-rose-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Gõ từ (Typing Test)
          </button>
        </div>

        <button
          onClick={() => setRepeatMistakes(prev => !prev)}
          className={`inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition border ${
            repeatMistakes 
              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/60 shadow-2xs' 
              : 'bg-white dark:bg-zinc-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-zinc-600'
          }`}
          title="Khi sai câu nào, hệ thống sẽ đẩy câu đó về sau làm lại cho đến khi đúng"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${repeatMistakes ? 'animate-spin-slow text-rose-500' : ''}`} />
          <span>Lặp lại câu sai: {repeatMistakes ? 'BẬT' : 'TẮT'}</span>
        </button>
      </div>

      {/* Màn hình kết thúc Quiz */}
      {isFinished ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 text-center shadow-xl space-y-6 animate-in zoom-in-95 duration-200">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Trophy className="w-10 h-10 animate-bounce" />
          </div>

          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              Hoàn Thành Luyện Tập!
            </h3>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
              Bạn đã giải quyết đúng tất cả các câu hỏi trong bài! (Đạt <strong className="text-emerald-500 font-extrabold text-lg">{score}</strong> / {Math.min(words.length, 15)} điểm chuẩn{retryCount > 0 ? `, đã lặp lại và vượt qua ${retryCount} lượt câu sai` : ''}).
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-center space-x-3">
            <button
              onClick={handleRestart}
              className="flex items-center space-x-2 px-6 py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm shadow-md shadow-rose-500/20 transition active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Làm lại lần nữa</span>
            </button>
          </div>
        </div>
      ) : (
        /* Thẻ câu hỏi bài làm */
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          {/* Header câu hỏi */}
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <div className="flex items-center space-x-2">
              <span>Lượt câu {currentIdx + 1} / {quizQueue.length}</span>
              {repeatMistakes && retryCount > 0 && quizQueue.length > currentIdx + 1 && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40">
                  Đang lặp câu sai ({quizQueue.length - currentIdx - 1} còn lại)
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-emerald-500 font-extrabold">Đúng: {score}</span>
            </div>
          </div>

          {/* Thanh tiến trình câu hỏi */}
          <div className="w-full bg-slate-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-rose-500 h-full transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / quizQueue.length) * 100}%` }}
            ></div>
          </div>

          {/* Nội dung câu hỏi (Kanji & Loa) */}
          <div className="text-center py-6 border-y border-slate-100 dark:border-zinc-800/80">
            <button
              onClick={() => speakJapanese(currentWord.kana || currentWord.kanji)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold mb-3 hover:scale-105 active:scale-95 transition"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Nghe phát âm</span>
            </button>

            <h3 className="text-4xl sm:text-5xl font-jp font-bold text-slate-900 dark:text-white">
              {currentWord.kanji || currentWord.kana}
            </h3>

            {currentWord.hanviet && (
              <span className="inline-block mt-2 text-xs font-extrabold text-rose-500 uppercase tracking-widest bg-rose-50 dark:bg-rose-950/30 px-2 py-0.5 rounded">
                Hán Việt: {currentWord.hanviet}
              </span>
            )}
          </div>

          {/* Chế độ 1: Trắc nghiệm 4 đáp án */}
          {mode === 'multiple_choice' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {options.map((opt, idx) => {
                const isSelected = selectedAnswer === opt;
                const isCorrect = opt === currentWord.meaning;
                let btnStyle = 'bg-slate-50 dark:bg-zinc-800/70 border-slate-200 dark:border-zinc-700/60 text-slate-800 dark:text-zinc-200 hover:border-rose-300';

                if (isAnswered) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold';
                  } else if (isSelected) {
                    btnStyle = 'bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-400 font-bold';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(opt)}
                    className={`p-4 rounded-2xl border text-left text-sm font-medium transition-all ${btnStyle}`}
                  >
                    <span className="text-xs text-slate-400 mr-2 font-mono">{idx + 1}.</span>
                    {opt}
                  </button>
                );
              })}
            </div>
          )}

          {/* Chế độ 2: Gõ từ vựng (Typing Test) */}
          {mode === 'typing' && (
            <form onSubmit={handleCheckTyping} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400 mb-2">
                  Nhập Hiragana hoặc Romaji cho từ này:
                </label>
                <input
                  type="text"
                  disabled={isAnswered}
                  autoFocus
                  placeholder="Ví dụ: watashi hoặc わたし"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  className={`w-full px-4 py-3 rounded-2xl border text-base font-semibold focus:outline-none transition ${
                    isAnswered 
                      ? (isTypingCorrect 
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600' 
                          : 'border-rose-500 bg-rose-50 dark:bg-rose-950/20 text-rose-600')
                      : 'border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white focus:border-rose-500'
                  }`}
                />
              </div>

              {!isAnswered ? (
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm shadow-md shadow-rose-500/20 transition"
                >
                  Kiểm tra đáp án
                </button>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-xs space-y-1">
                  <p>Đáp án đúng: <strong className="text-rose-500 text-sm font-jp">{currentWord.kana}</strong> ({currentWord.romaji})</p>
                  <p>Nghĩa: {currentWord.meaning}</p>
                </div>
              )}
            </form>
          )}

          {/* Nút Câu tiếp theo */}
          {isAnswered && (
            <div className="pt-4 flex justify-end">
              <button
                onClick={handleNextQuestion}
                className="flex items-center space-x-2 px-6 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm hover:opacity-90 active:scale-95 transition"
              >
                <span>{currentIdx + 1 === quizQueue.length ? 'Xem kết quả' : 'Câu tiếp theo'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
