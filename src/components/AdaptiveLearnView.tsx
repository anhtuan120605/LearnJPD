import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { WordItem } from '../types';
import { 
  Brain, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Sparkles, 
  RotateCcw, 
  Volume2, 
  ArrowRight, 
  Star, 
  Trophy, 
  ChevronRight,
  Send,
  Keyboard
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { speakJapanese, stopSpeaking } from '../lib/audio';
import { toHiragana, isJapaneseAnswerMatch } from '../lib/textUtils';

interface AdaptiveLearnViewProps {
  words: WordItem[];
  masteredWords: string[];
  favoriteWords: string[];
  onAddMastered?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  onSaveScore?: (score: number, total: number, type: string) => void;
}

// Trạng thái từng từ: 0 = Chưa học, 1 = Đang nhớ (Familiar), 2 = Đã thuộc (Mastered)
type TermStage = 0 | 1 | 2;

interface QuestionState {
  word: WordItem;
  type: 'mc' | 'written'; // mc: Trắc nghiệm, written: Gõ từ
  options?: string[]; // 4 lựa chọn cho mc
  correctOption?: string;
}

const ROUND_SIZE = 5; // Số từ mỗi chặng

export const AdaptiveLearnView: React.FC<AdaptiveLearnViewProps> = ({
  words,
  masteredWords,
  favoriteWords,
  onAddMastered,
  onToggleFavorite,
  onSaveScore
}) => {
  // Lọc: 'all' | 'starred'
  const [filterMode, setFilterMode] = useState<'all' | 'starred'>('all');

  const activeWords = useMemo(() => {
    if (filterMode === 'starred') {
      return words.filter(w => favoriteWords.includes(w.id));
    }
    return words;
  }, [words, filterMode, favoriteWords]);

  // Map lưu stage của từng từ: wordId -> TermStage (0, 1, 2)
  const [stageMap, setStageMap] = useState<Record<string, TermStage>>(() => {
    const map: Record<string, TermStage> = {};
    words.forEach(w => {
      // Nếu đã thuộc từ trước trong tiến độ tài khoản thì cho stage 2
      map[w.id] = masteredWords.includes(w.id) ? 2 : 0;
    });
    return map;
  });

  // Hàng đợi câu hỏi của Round hiện tại
  const [currentRoundQuestions, setCurrentRoundQuestions] = useState<QuestionState[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);

  // Trạng thái câu trả lời hiện tại
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [writtenInput, setWrittenInput] = useState('');
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCurrentCorrect, setIsCurrentCorrect] = useState<boolean | null>(null);

  // Hiển thị màn hình Chữa bài chi tiết khi sai (Correction Screen)
  const [showCorrection, setShowCorrection] = useState(false);

  // Hiển thị màn hình Tổng kết Vòng (Round Checkpoint)
  const [isRoundSummary, setIsRoundSummary] = useState(false);
  const [roundNumber, setRoundNumber] = useState(1);

  // Dừng phát âm khi unmount khỏi màn hình Học thông minh
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  // Thống kê số từ đã Mastered, Familiar, Not Studied
  const stats = useMemo(() => {
    let notStudied = 0;
    let familiar = 0;
    let mastered = 0;

    activeWords.forEach(w => {
      const s = stageMap[w.id] ?? 0;
      if (s === 2) mastered++;
      else if (s === 1) familiar++;
      else notStudied++;
    });

    return { notStudied, familiar, mastered, total: activeWords.length };
  }, [activeWords, stageMap]);

  // Tạo câu hỏi trắc nghiệm với 4 lựa chọn ngẫu nhiên
  const generateMultipleChoice = useCallback((targetWord: WordItem): QuestionState => {
    const correctAnswer = targetWord.meaning;
    // Lấy 3 đáp án sai từ các từ khác trong bài
    const otherMeanings = words
      .filter(w => w.id !== targetWord.id && w.meaning !== correctAnswer)
      .map(w => w.meaning);
    
    // Xáo trộn lấy 3 distractors
    const shuffledOthers = [...otherMeanings].sort(() => 0.5 - Math.random()).slice(0, 3);
    const options = [correctAnswer, ...shuffledOthers].sort(() => 0.5 - Math.random());

    return {
      word: targetWord,
      type: 'mc',
      options,
      correctOption: correctAnswer
    };
  }, [words]);

  // Tạo câu hỏi tự luận / gõ từ
  const generateWritten = useCallback((targetWord: WordItem): QuestionState => {
    return {
      word: targetWord,
      type: 'written'
    };
  }, []);

  // Xây dựng câu hỏi cho một Round mới
  const buildNextRound = useCallback(() => {
    if (activeWords.length === 0) return;

    // Ưu tiên:
    // 1. Những từ đang ở stage 1 (Familiar) -> đưa vào kiểm tra Written
    // 2. Những từ đang ở stage 0 (Not studied) -> đưa vào kiểm tra Multiple Choice
    const unmastered = activeWords.filter(w => (stageMap[w.id] ?? 0) < 2);

    if (unmastered.length === 0) {
      // Đã Mastered 100% bài học!
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
      return;
    }

    // Chọn tối đa ROUND_SIZE từ cho Round này
    // Sắp xếp: stage 1 trước, sau đó đến stage 0
    const sorted = [...unmastered].sort((a, b) => {
      const stageA = stageMap[a.id] ?? 0;
      const stageB = stageMap[b.id] ?? 0;
      return stageB - stageA; // 1 trước 0
    });

    const selectedWords = sorted.slice(0, ROUND_SIZE);

    const questions: QuestionState[] = selectedWords.map(w => {
      const stage = stageMap[w.id] ?? 0;
      if (stage === 1) {
        // Stage 1 -> Nâng cấp lên Written (hoặc trắc nghiệm ngược)
        return generateWritten(w);
      } else {
        // Stage 0 -> Trắc nghiệm cơ bản
        return generateMultipleChoice(w);
      }
    });

    setCurrentRoundQuestions(questions);
    setCurrentQIndex(0);
    setSelectedOption(null);
    setWrittenInput('');
    setIsAnswerChecked(false);
    setIsCurrentCorrect(null);
    setShowCorrection(false);
    setIsRoundSummary(false);
  }, [activeWords, stageMap, generateMultipleChoice, generateWritten]);

  // Khởi tạo vòng 1 khi bắt đầu hoặc đổi bộ lọc
  useEffect(() => {
    buildNextRound();
  }, [filterMode]);

  const currentQ = currentRoundQuestions[currentQIndex] as QuestionState | undefined;

  // Xử lý nộp đáp án Trắc nghiệm
  const handleSelectOption = (option: string) => {
    if (isAnswerChecked || !currentQ) return;
    setSelectedOption(option);
    setIsAnswerChecked(true);

    const isCorrect = option === currentQ.correctOption;
    setIsCurrentCorrect(isCorrect);

    if (isCorrect) {
      // Phát âm từ
      speakJapanese(currentQ.word.kana || currentQ.word.kanji);
      // Nâng hạng: 0 -> 1 (hoặc nếu là 1 -> 2)
      setStageMap(prev => {
        const cur = prev[currentQ.word.id] ?? 0;
        const nextStage = (Math.min(cur + 1, 2)) as TermStage;
        if (nextStage === 2 && onAddMastered) {
          onAddMastered(currentQ.word.id);
        }
        return { ...prev, [currentQ.word.id]: nextStage };
      });
    } else {
      // Sai: Giữ hoặc hạ về 0, hiển thị bảng Chữa bài
      setStageMap(prev => ({ ...prev, [currentQ.word.id]: 0 }));
      setShowCorrection(true);
    }
  };

  // Xử lý nộp đáp án Gõ từ (Written)
  const handleSubmitWritten = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isAnswerChecked || !currentQ || !writtenInput.trim()) return;

    setIsAnswerChecked(true);

    const targetWord = currentQ.word;
    const cleanInput = writtenInput.trim();
    // Tự động đối chiếu cả Kanji, Kana và Romaji
    const isMatch = isJapaneseAnswerMatch(
      cleanInput,
      targetWord.kana,
      targetWord.kanji,
      targetWord.romaji
    );

    setIsCurrentCorrect(isMatch);

    if (isMatch) {
      speakJapanese(targetWord.kana || targetWord.kanji);
      // Nâng lên Mastered (2)!
      setStageMap(prev => {
        if (onAddMastered) onAddMastered(targetWord.id);
        return { ...prev, [targetWord.id]: 2 };
      });
    } else {
      // Sai: Tụt về 0
      setStageMap(prev => ({ ...prev, [targetWord.id]: 0 }));
      setShowCorrection(true);
    }
  };

  // Chuyển sang câu hỏi tiếp theo
  const handleNextQuestion = () => {
    setSelectedOption(null);
    setWrittenInput('');
    setIsAnswerChecked(false);
    setIsCurrentCorrect(null);
    setShowCorrection(false);

    if (currentQIndex + 1 < currentRoundQuestions.length) {
      setCurrentQIndex(prev => prev + 1);
    } else {
      // Kết thúc Round này -> Hiện Round Checkpoint
      setIsRoundSummary(true);
    }
  };

  // Tự động chuyển phím Romaji sang Hiragana trong input
  const handleWrittenChange = (val: string) => {
    // Chuyển romaji gõ trực tiếp sang Hiragana
    const converted = toHiragana(val);
    setWrittenInput(converted);
  };

  // Xử lý phím tắt 1-4 trong trắc nghiệm và Enter để tiếp tục
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showCorrection) {
        if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
          handleNextQuestion();
        }
        return;
      }

      if (isAnswerChecked) {
        if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
          handleNextQuestion();
        }
        return;
      }

      if (currentQ && currentQ.type === 'mc' && currentQ.options) {
        const key = e.key;
        if (['1', '2', '3', '4'].includes(key)) {
          const idx = parseInt(key, 10) - 1;
          if (idx < currentQ.options.length) {
            handleSelectOption(currentQ.options[idx]);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQ, isAnswerChecked, showCorrection, handleNextQuestion]);

  // Hoàn thành toàn bộ (100% Mastered)
  const isAllMastered = stats.mastered === stats.total && stats.total > 0;

  if (activeWords.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-16 px-6 text-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-sm">
        <Star className="w-12 h-12 text-amber-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Chưa có từ nào được gắn sao ★
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
          Hãy gắn sao cho các từ khó trong mục Flashcard hoặc Danh sách từ để ôn tập ở chế độ này nhé!
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

  // MÀN HÌNH HOÀN THÀNH 100% MASTERED
  if (isAllMastered) {
    return (
      <div className="max-w-xl mx-auto py-12 px-6 text-center bg-white dark:bg-zinc-900 border border-emerald-500/30 rounded-3xl shadow-lg space-y-6">
        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/60 rounded-full flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400 shadow-inner">
          <Trophy className="w-10 h-10 animate-bounce" />
        </div>

        <div>
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            Xuất sắc • Mastered 100%
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
            Bạn đã làm chủ toàn bộ từ vựng!
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-2 max-w-md mx-auto">
            Chúc mừng bạn! Tất cả <strong>{stats.total}</strong> từ vựng đã vượt qua cả vòng trắc nghiệm và vòng viết chính xác.
          </p>
        </div>

        {/* Thanh chỉ số 3 cấp độ */}
        <div className="grid grid-cols-3 gap-3 max-w-md mx-auto bg-slate-50 dark:bg-zinc-800/60 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800">
          <div className="text-center">
            <span className="text-xs text-slate-400">Chưa học</span>
            <p className="text-xl font-bold text-slate-400">0</p>
          </div>
          <div className="text-center">
            <span className="text-xs text-amber-500">Đang quen</span>
            <p className="text-xl font-bold text-amber-500">0</p>
          </div>
          <div className="text-center">
            <span className="text-xs text-emerald-500">Đã thuộc</span>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{stats.total}</p>
          </div>
        </div>

        <button
          onClick={() => {
            // Reset lại để học lại từ đầu
            const resetMap: Record<string, TermStage> = {};
            words.forEach(w => { resetMap[w.id] = 0; });
            setStageMap(resetMap);
            setRoundNumber(1);
            buildNextRound();
          }}
          className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-500/25 transition active:scale-95 inline-flex items-center space-x-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Học lại bài này từ đầu</span>
        </button>
      </div>
    );
  }

  // MÀN HÌNH TỔNG KẾT VÒNG (ROUND CHECKPOINT)
  if (isRoundSummary) {
    return (
      <div className="max-w-xl mx-auto py-10 px-6 text-center bg-white dark:bg-zinc-900 border border-indigo-200 dark:border-indigo-900/40 rounded-3xl shadow-lg space-y-6">
        <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-950/60 rounded-3xl flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400 shadow-xs">
          <Sparkles className="w-8 h-8" />
        </div>

        <div>
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            Chặng {roundNumber} hoàn tất
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            Tiến độ ghi nhớ của bạn
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Thuật toán Quizlet đang điều chỉnh thứ tự xuất hiện của từ theo trí nhớ của bạn.
          </p>
        </div>

        {/* 3 Cột thống kê chuẩn Quizlet */}
        <div className="grid grid-cols-3 gap-3 bg-slate-50 dark:bg-zinc-800/60 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800">
          <div className="p-3 bg-white dark:bg-zinc-800 rounded-xl shadow-xs border border-slate-100 dark:border-zinc-700">
            <span className="text-[11px] font-bold text-slate-400 block mb-1">Cần học</span>
            <p className="text-2xl font-black text-slate-500">{stats.notStudied}</p>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl shadow-xs border border-amber-200 dark:border-amber-900/40">
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 block mb-1">Đang nhớ</span>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{stats.familiar}</p>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl shadow-xs border border-emerald-200 dark:border-emerald-900/40">
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block mb-1">Đã thuộc</span>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.mastered}</p>
          </div>
        </div>

        {/* Thanh phần trăm hoàn thành */}
        <div className="space-y-1.5 text-left">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-slate-600 dark:text-zinc-300">Tỷ lệ thành thạo:</span>
            <span className="text-indigo-600 dark:text-indigo-400">
              {Math.round((stats.mastered / stats.total) * 100)}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
            <div 
              className="bg-emerald-500 transition-all duration-500" 
              style={{ width: `${(stats.mastered / stats.total) * 100}%` }}
              title="Đã thuộc"
            />
            <div 
              className="bg-amber-400 transition-all duration-500" 
              style={{ width: `${(stats.familiar / stats.total) * 100}%` }}
              title="Đang nhớ"
            />
          </div>
        </div>

        <button
          onClick={() => {
            setRoundNumber(prev => prev + 1);
            buildNextRound();
          }}
          className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-500/25 transition active:scale-98 flex items-center justify-center space-x-2"
        >
          <span>Bắt đầu Chặng tiếp theo</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // MÀN HÌNH CHỮA BÀI KHI LÀM SAI (QUIZLET CORRECTION CARD)
  if (showCorrection && currentQ) {
    const word = currentQ.word;
    return (
      <div className="max-w-xl mx-auto bg-white dark:bg-zinc-900 border-2 border-rose-300 dark:border-rose-900/50 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center space-x-2 text-rose-500">
          <XCircle className="w-6 h-6 shrink-0" />
          <h3 className="font-extrabold text-base sm:text-lg">Hãy ghi nhớ lại từ này nhé!</h3>
        </div>

        {/* Thẻ đáp án đúng chuẩn */}
        <div className="bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Đáp án chính xác:</span>
            <button
              onClick={() => speakJapanese(word.kana || word.kanji)}
              className="p-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:scale-110 transition"
              title="Nghe phát âm"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          <div className="text-center py-2 space-y-1">
            <p className="text-sm font-medium text-indigo-500">{word.kana}</p>
            <h2 className="text-4xl font-jp font-black text-slate-900 dark:text-white">
              {word.kanji || word.kana}
            </h2>
            {word.romaji && (
              <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">
                [{word.romaji}]
              </p>
            )}
            <h4 className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 pt-2">
              👉 {word.meaning}
            </h4>
          </div>
        </div>

        {/* Lựa chọn bạn đã nhập/chọn */}
        <div className="text-xs text-slate-500 dark:text-zinc-400 px-1">
          <span>Bạn đã {currentQ.type === 'mc' ? 'chọn' : 'gõ'}: </span>
          <strong className="text-rose-500 line-through">
            {currentQ.type === 'mc' ? selectedOption : (writtenInput || '(bỏ trống)')}
          </strong>
        </div>

        <button
          onClick={handleNextQuestion}
          className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-500/25 transition active:scale-98 flex items-center justify-center space-x-2"
        >
          <span>Tôi đã hiểu, tiếp tục (Space)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  if (!currentQ) return null;

  const word = currentQ.word;

  return (
    <div className="max-w-xl mx-auto space-y-4">
      {/* 1. THANH ĐIỀU HƯỚNG BỘ LỌC & TIẾN ĐỘ CHUẨN QUIZLET */}
      <div className="flex items-center justify-between gap-2 px-1">
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
            Tất cả ({words.length})
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

        {/* 3 Trạng thái nhỏ gọn: Chưa học | Đang quen | Đã thuộc */}
        <div className="flex items-center space-x-2 text-xs font-bold">
          <span className="text-slate-400" title="Chưa học">
            ⚪ {stats.notStudied}
          </span>
          <span className="text-amber-500" title="Đang làm quen">
            🟡 {stats.familiar}
          </span>
          <span className="text-emerald-500" title="Đã thuần thục">
            🟢 {stats.mastered}
          </span>
        </div>
      </div>

      {/* 2. THANH TIẾN ĐỘ CHẶNG */}
      <div className="w-full bg-slate-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
        <div 
          className="bg-indigo-600 h-full transition-all duration-300 rounded-full"
          style={{ width: `${Math.round(((currentQIndex) / currentRoundQuestions.length) * 100)}%` }}
        />
      </div>

      {/* 3. KHUNG CÂU HỎI HỌC THÍCH ỨNG */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        {/* Header câu hỏi: Loại thử thách + Nút loa + Nút sao */}
        <div className="flex items-center justify-between">
          <span className={`px-2.5 py-1 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center space-x-1 ${
            currentQ.type === 'mc' 
              ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400' 
              : 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400'
          }`}>
            <Brain className="w-3.5 h-3.5" />
            <span>{currentQ.type === 'mc' ? 'Trắc nghiệm 4 đáp án' : 'Tự gõ câu trả lời (Viết)'}</span>
          </span>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => speakJapanese(word.kana || word.kanji)}
              className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
              title="Nghe phát âm"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            {onToggleFavorite && (
              <button
                onClick={() => onToggleFavorite(word.id)}
                className={`p-2 rounded-xl transition ${
                  favoriteWords.includes(word.id)
                    ? 'text-amber-500'
                    : 'text-slate-300 dark:text-zinc-600 hover:text-amber-500'
                }`}
                title="Gắn sao từ khó"
              >
                <Star className={`w-4 h-4 ${favoriteWords.includes(word.id) ? 'fill-current' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Nội dung Từ vựng cần đoán */}
        <div className="text-center py-4 space-y-2">
          {currentQ.type === 'mc' ? (
            // Trắc nghiệm: Hiển thị Tiếng Nhật -> Đoán Nghĩa tiếng Việt
            <>
              <p className="text-sm font-medium text-slate-400 dark:text-zinc-500">
                {word.kana}
              </p>
              <h2 className="text-4xl sm:text-5xl font-jp font-black text-slate-900 dark:text-white tracking-wide">
                {word.kanji || word.kana}
              </h2>
              {word.romaji && (
                <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">
                  [{word.romaji}]
                </p>
              )}
            </>
          ) : (
            // Gõ từ: Hiển thị Nghĩa tiếng Việt -> Gõ chữ Hiragana / Kanji
            <>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Nghĩa của từ:
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-snug">
                {word.meaning}
              </h3>
              {word.hanviet && (
                <span className="inline-block mt-2 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
                  Hán Việt: {word.hanviet}
                </span>
              )}
            </>
          )}
        </div>

        {/* PHẦN TRẢ LỜI */}
        {currentQ.type === 'mc' && currentQ.options ? (
          // 4 Lựa chọn Trắc nghiệm
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === opt;
              const isCorrectOpt = opt === currentQ.correctOption;

              let btnStyle = 'bg-slate-50 dark:bg-zinc-800/80 border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20';

              if (isAnswerChecked) {
                if (isCorrectOpt) {
                  btnStyle = 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20';
                } else if (isSelected && !isCorrectOpt) {
                  btnStyle = 'bg-rose-500 text-white border-rose-500';
                } else {
                  btnStyle = 'opacity-40 border-slate-200 dark:border-zinc-800 text-slate-400';
                }
              }

              return (
                <button
                  key={idx}
                  disabled={isAnswerChecked}
                  onClick={() => handleSelectOption(opt)}
                  className={`p-4 rounded-2xl border-2 text-left font-bold text-xs sm:text-sm transition flex items-center justify-between ${btnStyle}`}
                >
                  <span className="leading-snug">{opt}</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/10 shrink-0 ml-2">
                    {idx + 1}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          // Form Gõ từ (Written)
          <form onSubmit={handleSubmitWritten} className="space-y-3">
            <div className="relative">
              <input
                type="text"
                autoFocus
                disabled={isAnswerChecked}
                placeholder="Gõ Hiragana hoặc Romaji (tự chuyển)..."
                value={writtenInput}
                onChange={(e) => handleWrittenChange(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-50 dark:bg-zinc-800 border-2 border-slate-200 dark:border-zinc-700 rounded-2xl text-sm sm:text-base font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition"
              />
              <button
                type="submit"
                disabled={isAnswerChecked || !writtenInput.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1"
              >
                <span>Trả lời</span>
                <Send className="w-3 h-3" />
              </button>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center space-x-1">
              <Keyboard className="w-3 h-3" />
              <span>Gõ Romaji (ví dụ: watashi) hệ thống sẽ tự đổi sang わたし</span>
            </p>
          </form>
        )}

        {/* Nút Tiếp tục sau khi đã chọn đúng */}
        {isAnswerChecked && isCurrentCorrect && (
          <div className="pt-2">
            <button
              onClick={handleNextQuestion}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-500/20 transition flex items-center justify-center space-x-2"
            >
              <span>Chính xác! Tiếp tục (Space)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
