import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  CONJUGATION_ITEMS,
  FORM_METADATA,
  GROUP_METADATA,
  ConjugationItem,
  ConjugationForm,
  VerbGroup
} from '../data/conjugationData';
import { ConjugationCheatSheetModal } from './ConjugationCheatSheetModal';
import { speakJapanese } from '../lib/audio';
import * as wanakana from 'wanakana';
import confetti from 'canvas-confetti';
import {
  Flame,
  Zap,
  Volume2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  BookOpen,
  RotateCcw,
  Sparkles,
  Trophy,
  Timer,
  ChevronRight,
  ArrowRight,
  Keyboard,
  ListChecks,
  Award
} from 'lucide-react';

interface ConjugationTrainerViewProps {
  onBack?: () => void;
}

export const ConjugationTrainerView: React.FC<ConjugationTrainerViewProps> = ({ onBack }) => {
  // Bộ lọc nhóm từ
  const [selectedGroup, setSelectedGroup] = useState<'all' | 'group1' | 'group2' | 'group3' | 'adj'>('all');
  // Thể cần luyện
  const [selectedForm, setSelectedForm] = useState<ConjugationForm | 'random'>('te');
  // Chế độ: 'practice' (Luyện tập tự do) | 'speed' (Thử thách 60 giây)
  const [gameMode, setGameMode] = useState<'practice' | 'speed'>('practice');
  // Kiểu trả lời: 'choice' (Trắc nghiệm) | 'type' (Tự gõ)
  const [inputMode, setInputMode] = useState<'choice' | 'type'>('choice');

  // Modal Cheat Sheet
  const [showCheatSheet, setShowCheatSheet] = useState<boolean>(false);

  // High score trong local storage
  const [highScore, setHighScore] = useState<number>(() => {
    const saved = localStorage.getItem('learnjpd_conjugation_highscore');
    return saved ? parseInt(saved, 10) : 0;
  });

  // State câu hỏi hiện tại
  const [currentItem, setCurrentItem] = useState<ConjugationItem>(CONJUGATION_ITEMS[0]);
  const [currentFormKey, setCurrentFormKey] = useState<ConjugationForm>('te');
  const [options, setOptions] = useState<string[]>([]);
  const [typedInput, setTypedInput] = useState<string>('');

  // Trạng thái trả lời
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);

  // Điểm số & Combo
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);

  // Speed Mode 60s
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isGameActive, setIsGameActive] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  // Lọc danh sách từ theo nhóm
  const pool = useMemo(() => {
    return CONJUGATION_ITEMS.filter((item) => {
      if (selectedGroup === 'all') return true;
      if (selectedGroup === 'adj') return item.group === 'i_adj' || item.group === 'na_adj';
      return item.group === selectedGroup;
    });
  }, [selectedGroup]);

  // Tạo câu hỏi mới
  const generateQuestion = (forcedItem?: ConjugationItem, forcedForm?: ConjugationForm) => {
    if (pool.length === 0) return;

    const item = forcedItem || pool[Math.floor(Math.random() * pool.length)];
    const validForms = Object.keys(item.forms) as ConjugationForm[];
    if (validForms.length === 0) return;

    let targetForm = forcedForm;
    if (!targetForm) {
      if (selectedForm === 'random') {
        targetForm = validForms[Math.floor(Math.random() * validForms.length)];
      } else if (validForms.includes(selectedForm)) {
        targetForm = selectedForm;
      } else {
        targetForm = validForms[0];
      }
    }

    const formResult = item.forms[targetForm];
    if (!formResult) return;

    const correctAnswer = formResult.kanji || formResult.kana;

    // Tạo 3 đáp án nhiễu
    const distractorPool: string[] = [];

    // Lấy các thể khác của chính từ này
    validForms.forEach((f) => {
      const res = item.forms[f];
      if (res && res.kanji !== correctAnswer && !distractorPool.includes(res.kanji)) {
        distractorPool.push(res.kanji);
      }
    });

    // Lấy thể tương ứng của các từ khác cùng nhóm
    pool.forEach((other) => {
      if (other.id !== item.id && other.forms[targetForm]) {
        const otherRes = other.forms[targetForm]!;
        if (!distractorPool.includes(otherRes.kanji)) {
          distractorPool.push(otherRes.kanji);
        }
      }
    });

    // Shuffle & pick 3 distractors
    const shuffledDistractors = distractorPool.sort(() => Math.random() - 0.5).slice(0, 3);
    const allChoices = [correctAnswer, ...shuffledDistractors].sort(() => Math.random() - 0.5);

    setCurrentItem(item);
    setCurrentFormKey(targetForm);
    setOptions(allChoices);
    setTypedInput('');
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCorrect(false);
  };

  // Khởi tạo câu hỏi đầu tiên
  useEffect(() => {
    generateQuestion();
  }, [pool, selectedForm]);

  // Bộ đếm thời gian cho Speed Mode 60s
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (gameMode === 'speed' && isGameActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsGameActive(false);
            setIsGameOver(true);
            confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameMode, isGameActive, timeLeft]);

  // Bắt đầu game Speed 60s
  const handleStartSpeedGame = () => {
    setTimeLeft(60);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setTotalQuestions(0);
    setIsGameActive(true);
    setIsGameOver(false);
    generateQuestion();
  };

  // Kiểm tra đáp án
  const handleCheckAnswer = (answer: string) => {
    if (isAnswered) return;

    const formResult = currentItem.forms[currentFormKey];
    if (!formResult) return;

    const correctKanji = formResult.kanji;
    const correctKana = formResult.kana;
    const cleanAnswer = answer.trim();

    // So khớp chữ Hán, Hiragana, hoặc Romaji
    const hiraganaAnswer = wanakana.toHiragana(cleanAnswer);
    const isRight =
      cleanAnswer === correctKanji ||
      cleanAnswer === correctKana ||
      hiraganaAnswer === correctKana ||
      cleanAnswer.toLowerCase() === formResult.romaji.toLowerCase();

    setIsAnswered(true);
    setIsCorrect(isRight);
    setSelectedOption(answer);
    setTotalQuestions((prev) => prev + 1);

    if (isRight) {
      const newScore = score + 10 + combo * 2;
      setScore(newScore);
      const newCombo = combo + 1;
      setCombo(newCombo);
      if (newCombo > maxCombo) setMaxCombo(newCombo);

      if (newCombo % 5 === 0) {
        confetti({ particleCount: 40, spread: 50 });
      }

      if (newScore > highScore) {
        setHighScore(newScore);
        localStorage.setItem('learnjpd_conjugation_highscore', newScore.toString());
      }

      // Trong Speed Mode: tự động chuyển câu tiếp theo sau 400ms
      if (gameMode === 'speed') {
        setTimeout(() => {
          generateQuestion();
        }, 350);
      }
    } else {
      setCombo(0);
      if (gameMode === 'speed') {
        setTimeout(() => {
          generateQuestion();
        }, 800);
      }
    }
  };

  const handleNext = () => {
    generateQuestion();
  };

  const currentFormMeta = FORM_METADATA[currentFormKey];
  const currentGroupMeta = GROUP_METADATA[currentItem.group];
  const formResult = currentItem.forms[currentFormKey];
  const correctAnswerText = formResult ? `${formResult.kanji} (${formResult.kana})` : '';

  return (
    <div className="space-y-6 pb-12 animate-fadeIn max-w-4xl mx-auto">
      {/* 1. TOP HEADER & NAVIGATION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#111c30] p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                Luyện Chia Thể Động Từ & Tính Từ
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-sky-400 border border-blue-200/60 dark:border-blue-800/40">
                PRO TRAINER
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Thành thạo chia thể て, ない, た, khả năng, bị động, sai khiến...
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Nút mở Bảng quy tắc Cheat Sheet */}
          <button
            onClick={() => setShowCheatSheet(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold transition border border-slate-200/60 dark:border-slate-700/60 shadow-2xs"
          >
            <BookOpen className="w-4 h-4 text-blue-600 dark:text-sky-400" />
            <span>Bảng quy tắc chia thể</span>
          </button>

          {onBack && (
            <button
              onClick={onBack}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Quay lại
            </button>
          )}
        </div>
      </div>

      {/* 2. THANH ĐIỀU KHIỂN & BỘ LỌC CẤP ĐỘ */}
      <div className="bg-white dark:bg-[#111c30] p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        {/* Row 1: Chọn Chế độ (Practice / Speed 60s) & Kiểu trả lời (Choice / Type) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setGameMode('practice');
                setIsGameActive(false);
                setIsGameOver(false);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                gameMode === 'practice'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Luyện tập tự do</span>
            </button>

            <button
              onClick={() => {
                setGameMode('speed');
                handleStartSpeedGame();
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                gameMode === 'speed'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Timer className="w-3.5 h-3.5" />
              <span>Đua tốc độ 60 giây ⚡</span>
            </button>
          </div>

          {/* Chọn Trắc nghiệm / Gõ phím */}
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
            <button
              onClick={() => setInputMode('choice')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
                inputMode === 'choice'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-sky-400 shadow-2xs'
                  : 'text-slate-500'
              }`}
            >
              <ListChecks className="w-3.5 h-3.5" />
              <span>4 Lựa chọn</span>
            </button>

            <button
              onClick={() => setInputMode('type')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
                inputMode === 'type'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-sky-400 shadow-2xs'
                  : 'text-slate-500'
              }`}
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span>Gõ phím</span>
            </button>
          </div>
        </div>

        {/* Row 2: Chọn Nhóm từ (Group 1, 2, 3, Tính từ) */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            1. Chọn nhóm từ vựng:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'Tất cả nhóm' },
              { id: 'group1', label: 'Nhóm 1 (Godan)' },
              { id: 'group2', label: 'Nhóm 2 (Ichidan)' },
              { id: 'group3', label: 'Nhóm 3 (Bất quy tắc)' },
              { id: 'adj', label: 'Tính từ (い / な)' },
            ].map((grp) => (
              <button
                key={grp.id}
                onClick={() => setSelectedGroup(grp.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  selectedGroup === grp.id
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {grp.label}
              </button>
            ))}
          </div>
        </div>

        {/* Row 3: Chọn Thể muốn luyện (Form) */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            2. Chọn thể ngữ pháp cần luyện:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedForm('random')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1 ${
                selectedForm === 'random'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ngẫu nhiên (Thử thách)</span>
            </button>

            {[
              { id: 'te', label: 'Thể て' },
              { id: 'nai', label: 'Thể ない' },
              { id: 'ta', label: 'Thể た' },
              { id: 'potential', label: 'Khả năng' },
              { id: 'passive', label: 'Bị động' },
              { id: 'causative', label: 'Sai khiến' },
              { id: 'conditional_ba', label: 'Điều kiện (ば)' },
              { id: 'volitional', label: 'Ý chí (よう)' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedForm(f.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  selectedForm === f.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. KHU VỰC THỰC CHIẾN (GAME ARENA) */}
      <div className="relative rounded-3xl bg-white dark:bg-[#111c30] p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-md">
        {/* Score & Combo Banner */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black text-xs border border-amber-500/20">
              <Flame className="w-4 h-4 fill-current animate-bounce" />
              <span>Combo: {combo}x</span>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              Điểm: <strong className="text-slate-900 dark:text-white font-black text-sm">{score}</strong>
            </div>
          </div>

          {gameMode === 'speed' ? (
            <div className="flex items-center space-x-2">
              <div
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-mono font-black text-xs border ${
                  timeLeft <= 10
                    ? 'bg-rose-500/15 border-rose-500/30 text-rose-600 dark:text-rose-400 animate-pulse'
                    : 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-sky-400'
                }`}
              >
                <Timer className="w-4 h-4" />
                <span>{timeLeft}s</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-1 text-xs text-slate-400 font-medium">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Kỷ lục: {highScore} đ</span>
            </div>
          )}
        </div>

        {/* Màn hình kết thúc Speed Mode 60s */}
        {gameMode === 'speed' && isGameOver ? (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                Hết Giờ! Hoàn Thành Thử Thách
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Bạn đã hoàn thành phiên luyện phản xạ chia thể 60 giây
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Tổng điểm</span>
                <span className="text-xl font-black text-blue-600 dark:text-sky-400">{score}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Max Combo</span>
                <span className="text-xl font-black text-amber-500">{maxCombo}x</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Số câu</span>
                <span className="text-xl font-black text-emerald-500">{totalQuestions}</span>
              </div>
            </div>

            <button
              onClick={handleStartSpeedGame}
              className="mt-4 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition active:scale-95 flex items-center space-x-2 mx-auto"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Chơi lại vòng mới</span>
            </button>
          </div>
        ) : (
          /* Khung Câu Hỏi Chính */
          <div className="py-6 sm:py-8 space-y-6 text-center">
            {/* Tag nhóm & Yêu cầu chia thể */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${currentGroupMeta.color}`}>
                {currentGroupMeta.badge}
              </span>
              <span className="px-3 py-1 rounded-xl text-xs font-black bg-blue-600 text-white shadow-xs">
                Chuyển sang: {currentFormMeta.nameVi} ({currentFormMeta.nameJp})
              </span>
            </div>

            {/* Từ gốc (Dictionary form) */}
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-3">
                <span className="text-4xl sm:text-5xl font-jp font-black text-slate-900 dark:text-white tracking-tight">
                  {currentItem.dictionary}
                </span>
                <button
                  onClick={() => speakJapanese(currentItem.dictionary)}
                  title="Nghe phát âm từ gốc"
                  className="p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-blue-600 dark:hover:text-sky-300 transition"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center justify-center space-x-2 text-slate-500 dark:text-slate-400 text-sm">
                <span className="font-jp">{currentItem.kana}</span>
                <span>•</span>
                <span className="font-medium">{currentItem.meaning}</span>
              </div>
            </div>

            {/* Khung Trả lời: Trắc nghiệm 4 đáp án hoặc Gõ phím */}
            {inputMode === 'choice' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto pt-4">
                {options.map((opt, idx) => {
                  let btnStyle =
                    'bg-slate-50 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 hover:border-blue-500 text-slate-800 dark:text-slate-200';

                  if (isAnswered) {
                    if (opt === formResult?.kanji) {
                      btnStyle = 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-black shadow-xs';
                    } else if (opt === selectedOption) {
                      btnStyle = 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-700 dark:text-rose-300 font-bold';
                    } else {
                      btnStyle = 'opacity-40 border-slate-200 dark:border-slate-800 text-slate-400';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleCheckAnswer(opt)}
                      disabled={isAnswered}
                      className={`p-4 rounded-2xl border-2 font-jp font-bold text-base sm:text-lg transition transform active:scale-95 shadow-2xs ${btnStyle}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            ) : (
              /* Gõ Phím (Type input) */
              <div className="max-w-md mx-auto space-y-3 pt-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (typedInput.trim()) {
                      handleCheckAnswer(typedInput);
                    }
                  }}
                  className="relative"
                >
                  <input
                    type="text"
                    disabled={isAnswered}
                    autoFocus
                    placeholder="Gõ Kanji, Hiragana hoặc Romaji..."
                    value={typedInput}
                    onChange={(e) => setTypedInput(e.target.value)}
                    className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-jp font-bold text-center text-lg focus:outline-none focus:border-blue-600 transition"
                  />
                  {!isAnswered && (
                    <button
                      type="submit"
                      disabled={!typedInput.trim()}
                      className="absolute right-2 top-2 bottom-2 px-4 rounded-xl bg-blue-600 text-white font-bold text-xs disabled:opacity-40 transition"
                    >
                      Gửi
                    </button>
                  )}
                </form>
                <p className="text-[11px] text-slate-400">
                  Mẹo: Hệ thống tự động chuyển đổi chữ Romaji sang Hiragana để chấm điểm!
                </p>
              </div>
            )}

            {/* Phản hồi sau khi trả lời */}
            {isAnswered && (
              <div className="max-w-lg mx-auto p-4 rounded-2xl animate-fadeIn space-y-2 text-left bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  {isCorrect ? (
                    <div className="p-1 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="p-1 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                      <XCircle className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <span className={`text-xs font-black ${isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {isCorrect ? 'Chính xác! Xuất sắc' : 'Chưa đúng rồi!'}
                    </span>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Đáp án đúng: <span className="text-blue-600 dark:text-sky-400 font-jp text-sm">{correctAnswerText}</span>
                    </p>
                  </div>
                </div>

                {currentItem.explanation && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/50 dark:border-slate-800">
                    💡 <strong>Ghi nhớ:</strong> {currentItem.explanation}
                  </p>
                )}

                {/* Nút Câu tiếp theo trong Practice mode */}
                {gameMode === 'practice' && (
                  <div className="pt-2 text-right">
                    <button
                      onClick={handleNext}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition active:scale-95"
                    >
                      <span>Câu tiếp theo</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Bảng Quy Tắc Chia Thể */}
      <ConjugationCheatSheetModal
        isOpen={showCheatSheet}
        onClose={() => setShowCheatSheet(false)}
      />
    </div>
  );
};
