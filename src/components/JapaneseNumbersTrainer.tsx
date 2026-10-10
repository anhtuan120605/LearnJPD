import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Volume2,
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Trophy,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Clock,
  Eye,
  Headphones,
  Keyboard,
  PenTool,
  Shuffle,
  BookOpen,
  Gamepad2,
  Check,
  Flame,
  ArrowRight,
  Share2
} from 'lucide-react';
import { 
  JAPANESE_NUMBER_LEVELS, 
  NumberLevel, 
  numberToJapanese, 
  generateQuizQuestions, 
  QuizQuestion,
  QuizOption 
} from '../data/japaneseNumbers';
import { speakJapanese, stopSpeaking } from '../lib/audio';

export type PracticeMode = 
  | 'look_read'    // Nhìn số ➔ Chọn cách đọc
  | 'listen_num'   // Nghe ➔ Chọn số
  | 'look_type'    // Nhìn số ➔ Nhập cách đọc
  | 'listen_type'; // Nghe ➔ Nhập số

interface JapaneseNumbersTrainerProps {
  onBack?: () => void;
}

// Danh sách hình nền danh lam thắng cảnh Nhật Bản cho 9 cấp độ
const LEVEL_BACKGROUNDS: Record<number, string> = {
  1: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80', // Fuji & Sakura
  2: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80', // Phố cổ đèn lồng Kyoto
  3: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=600&q=80', // Lâu đài Osaka
  4: 'https://images.unsplash.com/photo-1492571350019-22de08371fd3?auto=format&fit=crop&w=600&q=80', // Chùa gỗ truyền thống
  5: 'https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=600&q=80', // Chureito Pagoda
  6: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=600&q=80', // Tháp Tokyo
  7: 'https://images.unsplash.com/photo-1509024644558-2d56ce76a47d?auto=format&fit=crop&w=600&q=80', // Tokyo Rainbow Bridge
  8: 'https://images.unsplash.com/photo-1578637387939-43c525550085?auto=format&fit=crop&w=600&q=80', // Hồ núi hoàng hôn
  9: 'https://images.unsplash.com/photo-1513407030348-c983a97b98d8?auto=format&fit=crop&w=600&q=80', // Shinjuku Skyline Sunset
};

export const JapaneseNumbersTrainer: React.FC<JapaneseNumbersTrainerProps> = ({ onBack }) => {
  // Trạng thái màn hình: 'hub' (Tổng quan 9 cấp) | 'level' (Chi tiết 1 cấp) | 'quiz' (Đang làm bài)
  const [currentView, setCurrentView] = useState<'hub' | 'level' | 'quiz'>('hub');
  const [selectedLevelId, setSelectedLevelId] = useState<number | 'random'>(1);
  const [levelTab, setLevelTab] = useState<'theory' | 'practice'>('theory');
  const [activeMode, setActiveMode] = useState<PracticeMode>('look_read');
  const [isLevelDropdownOpen, setIsLevelDropdownOpen] = useState(false);

  // Số lượt luyện tập lưu trên trình duyệt
  const [practiceCount, setPracticeCount] = useState<number>(() => {
    const saved = localStorage.getItem('japanese_numbers_practice_count');
    return saved ? parseInt(saved, 10) : 10;
  });

  // State bài tập trắc nghiệm
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, {
    selectedOption?: string;
    inputText?: string;
    isCorrect: boolean;
  }>>({});
  const [typingInput, setTypingInput] = useState('');
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);

  // Audio & Tốc độ
  const [speechSpeed, setSpeechSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const selectedLevel = useMemo(() => {
    if (selectedLevelId === 'random') return null;
    return JAPANESE_NUMBER_LEVELS.find(l => l.id === selectedLevelId) || JAPANESE_NUMBER_LEVELS[0];
  }, [selectedLevelId]);

  // Khởi động bài tập khi bắt đầu làm quiz
  const startQuiz = useCallback((levelId: number | 'random', mode: PracticeMode) => {
    stopSpeaking();
    setSelectedLevelId(levelId);
    setActiveMode(mode);
    const newQuestions = generateQuizQuestions(levelId, 10);
    setQuestions(newQuestions);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setTypingInput('');
    setIsAnswerSubmitted(false);
    setShowResultModal(false);
    setElapsedSeconds(0);
    setCurrentView('quiz');
  }, []);

  // Đếm giờ khi làm bài
  useEffect(() => {
    if (currentView === 'quiz' && !showResultModal) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentView, showResultModal]);

  // Tự động phát âm thanh khi vào câu hỏi mới ở chế độ Nghe
  useEffect(() => {
    if (currentView === 'quiz' && questions.length > 0 && !showResultModal) {
      const q = questions[currentQuestionIndex];
      if (q && (activeMode === 'listen_num' || activeMode === 'listen_type')) {
        playCurrentAudio();
      }
    }
  }, [currentView, currentQuestionIndex, activeMode, questions]);

  // Hàm phát âm thanh câu hỏi hiện tại
  const playCurrentAudio = useCallback((speedOverride?: number) => {
    const q = questions[currentQuestionIndex];
    if (!q) return;

    let rate = 1.0;
    if (speedOverride !== undefined) {
      rate = speedOverride;
    } else {
      if (speechSpeed === 'slow') rate = 0.75;
      else if (speechSpeed === 'fast') rate = 1.25;
    }

    setIsPlayingAudio(true);
    speakJapanese(q.hiragana, rate, () => {
      setIsPlayingAudio(false);
    });
  }, [questions, currentQuestionIndex, speechSpeed]);

  // Lắng nghe phím tắt bàn phím: Ctrl (nghe lại thường), Shift (nghe lại chậm), Enter, 1..4
  useEffect(() => {
    if (currentView !== 'quiz' || showResultModal) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Phím tắt nghe lại
      if (e.key === 'Control') {
        playCurrentAudio(1.0);
      } else if (e.key === 'Shift') {
        playCurrentAudio(0.7);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView, showResultModal, playCurrentAudio]);

  const currentQ = questions[currentQuestionIndex];
  const currentAnswer = currentQ ? userAnswers[currentQ.id] : undefined;

  // Tính số câu đúng
  const correctCount = useMemo(() => {
    return Object.values(userAnswers).filter(a => a.isCorrect).length;
  }, [userAnswers]);

  // Xử lý chọn đáp án trắc nghiệm
  const handleSelectOption = (opt: QuizOption) => {
    if (!currentQ || currentAnswer) return;

    const isCorrect = opt.isCorrect;
    setUserAnswers(prev => ({
      ...prev,
      [currentQ.id]: {
        selectedOption: opt.label,
        isCorrect
      }
    }));

    // Phát âm câu vừa chọn
    speakJapanese(opt.text, 1.0);

    // Nếu trả lời đúng thì tự động chuyển câu sau 800ms
    if (isCorrect) {
      setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
        } else {
          finishQuiz();
        }
      }, 700);
    }
  };

  // Xử lý kiểm tra gõ đáp án
  const handleSubmitTyping = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentQ || currentAnswer || !typingInput.trim()) return;

    const cleaned = typingInput.trim().toLowerCase();
    let isCorrect = false;

    if (activeMode === 'look_type') {
      // Chế độ 3: Nhập cách đọc bằng Hiragana hoặc Romaji
      const targetHira = currentQ.hiragana.replace(/\s+/g, '');
      const targetRoma = currentQ.romaji.replace(/\s+/g, '').toLowerCase();
      isCorrect = cleaned === targetHira || cleaned === targetRoma;
    } else if (activeMode === 'listen_type') {
      // Chế độ 4: Nhập con số bằng chữ số
      const cleanedNum = cleaned.replace(/[.,\s]/g, '');
      isCorrect = cleanedNum === currentQ.num.toString();
    }

    setUserAnswers(prev => ({
      ...prev,
      [currentQ.id]: {
        inputText: typingInput,
        isCorrect
      }
    }));
    setIsAnswerSubmitted(true);

    if (isCorrect) {
      speakJapanese(currentQ.hiragana, 1.0);
    }
  };

  // Chuyển sang câu tiếp theo
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTypingInput('');
      setIsAnswerSubmitted(false);
    } else {
      finishQuiz();
    }
  };

  // Quay lại câu trước
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setTypingInput('');
      setIsAnswerSubmitted(false);
    }
  };

  // Kết thúc bài tập
  const finishQuiz = () => {
    setShowResultModal(true);
    setPracticeCount(prev => {
      const nextVal = prev + 1;
      localStorage.setItem('japanese_numbers_practice_count', nextVal.toString());
      return nextVal;
    });
  };

  // Định dạng thời gian mm:ss
  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ==========================================
  // VIEW 1: HUB DANH SÁCH 9 CẤP ĐỘ SỐ ĐẾM
  // ==========================================
  if (currentView === 'hub') {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-[#0B1120] text-stone-900 dark:text-stone-100 pb-20">
        {/* Nút quay lại tổng thể nếu có */}
        {onBack && (
          <div className="max-w-6xl mx-auto pt-4 px-4 sm:px-6">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:text-indigo-600 text-xs font-bold transition shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại menu chính</span>
            </button>
          </div>
        )}

        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 space-y-6">
          {/* HERO BANNER SANG TRỌNG */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50 dark:from-stone-900 dark:via-stone-900/90 dark:to-stone-900 border border-amber-200/60 dark:border-stone-800 shadow-sm p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
              <div className="space-y-3.5 max-w-2xl text-left">
                {/* Badge Tiêu Đề */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-extrabold uppercase tracking-wide">
                  <span>⛩️</span>
                  <span>SỐ ĐẾM TIẾNG NHẬT</span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-stone-900 dark:text-white leading-tight">
                  Luyện <span className="text-rose-600 dark:text-rose-400">số đếm</span> tiếng Nhật
                </h1>

                <p className="text-sm sm:text-base font-bold text-stone-700 dark:text-stone-300">
                  Nhìn số đọc được – Nghe số hiểu được – Viết đúng số
                </p>

                <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
                  Từ 1 đến hàng tỷ và hơn thế nữa. Ứng dụng trong đời sống, mua sắm, giá cả, ngày tháng, số điện thoại...
                </p>

                {/* Badge số lượt luyện tập */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 text-xs font-bold">
                  <Flame className="w-4 h-4 fill-current" />
                  <span>Đã có <span className="font-black underline">{practiceCount}</span> lượt luyện tập</span>
                </div>

                {/* 4 Nhãn tính năng nhanh */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-500/15">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Nhìn số đọc số</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold border border-rose-500/15">
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Nghe số hiểu số</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/15">
                    <PenTool className="w-3.5 h-3.5" />
                    <span>Viết số thành thạo</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-500/15">
                    <span>👜</span>
                    <span>Áp dụng trong thực tế</span>
                  </div>
                </div>
              </div>

              {/* Minh họa Anime Chibi Nhật Bản */}
              <div className="shrink-0 relative">
                <div className="w-44 h-44 sm:w-52 sm:h-52 rounded-3xl overflow-hidden shadow-md border-2 border-white dark:border-stone-700 bg-white dark:bg-stone-800 flex items-center justify-center p-2 relative group">
                  <img
                    src="https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=500&q=80"
                    alt="Học tiếng Nhật"
                    className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-2xl flex items-end p-3">
                    <span className="text-white text-[11px] font-black tracking-wide bg-rose-600/90 px-2 py-0.5 rounded-md">
                      日本語の数字
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TIÊU ĐỀ KHU VỰC DANH SÁCH CẤP ĐỘ */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-stone-900 dark:text-white flex items-center gap-2">
                <span>Danh sách cấp độ</span>
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Chọn cấp độ để xem lý thuyết và luyện tập. Mỗi cấp độ đều có ví dụ minh họa và bài tập riêng.
              </p>
            </div>
          </div>

          {/* LƯỚI 9 CẤP ĐỘ (3 CỘT TRÊN DESKTOP) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {JAPANESE_NUMBER_LEVELS.map(lvl => (
              <div
                key={lvl.id}
                onClick={() => {
                  setSelectedLevelId(lvl.id);
                  setLevelTab('theory');
                  setCurrentView('level');
                }}
                className="group relative overflow-hidden rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 hover:border-indigo-400 dark:hover:border-indigo-500 p-4 transition-all duration-200 hover:shadow-lg cursor-pointer flex flex-col justify-between min-h-[140px]"
              >
                {/* Background hình ảnh phong cảnh mờ nghệ thuật phía sau */}
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-15 dark:opacity-10 group-hover:opacity-25 transition-opacity"
                  style={{ backgroundImage: `url(${LEVEL_BACKGROUNDS[lvl.id] || LEVEL_BACKGROUNDS[1]})` }}
                />

                <div className="relative z-10 flex items-start gap-3.5">
                  {/* Badge số thứ tự cấp độ */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-xs ${lvl.badgeColor}`}>
                    {lvl.id}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-extrabold text-stone-900 dark:text-stone-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {lvl.title}
                    </h3>
                    <div className="text-xs font-black text-blue-600 dark:text-blue-400 mt-0.5 font-mono">
                      {lvl.rangeLabel}
                    </div>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                      {lvl.description}
                    </p>
                  </div>

                  {/* Nút mũi tên tròn */}
                  <div className="w-7 h-7 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-400 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors shadow-2xs">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>

                <div className="relative z-10 mt-3 pt-2 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-stone-400">Xem lý thuyết & 4 chế độ</span>
                  <span className="font-extrabold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
                    Vào học →
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* CARD DƯỚI CÙNG: LUYỆN TẬP NGẪU NHIÊN NGAY */}
          <div className="rounded-3xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-rose-500/10 border border-orange-200 dark:border-orange-900/40 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 text-left">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 text-white flex items-center justify-center shrink-0 shadow-md">
                <Shuffle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-stone-900 dark:text-white">
                  Luyện tập ngẫu nhiên ngay
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-300 mt-0.5">
                  Làm bài tập với tất cả các cấp độ. Phù hợp nếu bạn đã nắm cơ bản và muốn thử sức luôn!
                </p>
              </div>
            </div>

            <button
              onClick={() => startQuiz('random', 'look_read')}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-extrabold text-sm shadow-md shadow-orange-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0"
            >
              <Shuffle className="w-4 h-4" />
              <span>Luyện tập ngẫu nhiên</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: CHI TIẾT CẤP ĐỘ (LÝ THUYẾT & LUYỆN TẬP)
  // ==========================================
  if (currentView === 'level' && selectedLevel) {
    const nextLevel = JAPANESE_NUMBER_LEVELS.find(l => l.id === selectedLevel.id + 1);

    return (
      <div className="min-h-screen bg-stone-50 dark:bg-[#0B1120] text-stone-900 dark:text-stone-100 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 space-y-6">
          
          {/* HEADER BANNER CẤP ĐỘ VỚI HÌNH NỀN TOÀN CẢNH */}
          <div className="relative overflow-hidden rounded-3xl border border-stone-200 dark:border-stone-800 shadow-md">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${LEVEL_BACKGROUNDS[selectedLevel.id] || LEVEL_BACKGROUNDS[1]})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/80 to-slate-900/60" />

            <div className="relative z-10 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-2 text-left">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-blue-500 text-white text-xs font-black">
                    Cấp độ {selectedLevel.id}
                  </span>
                  <span className="text-xs font-bold text-white/80 font-mono">
                    [{selectedLevel.rangeLabel}]
                  </span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-black text-white">
                  {selectedLevel.title}
                </h1>
                <p className="text-xs sm:text-sm text-stone-300 font-medium">
                  {selectedLevel.description}
                </p>
              </div>

              {/* Nút dropdown danh sách cấp độ & thẻ Kana Kanji xem nhanh */}
              <div className="flex items-center gap-3 self-end md:self-center">
                <div className="px-3.5 py-2 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white font-black text-base shadow-xs">
                  {selectedLevel.kanjiPreview}
                </div>

                <div className="relative">
                  <button
                    onClick={() => setIsLevelDropdownOpen(!isLevelDropdownOpen)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-stone-900 hover:bg-stone-100 font-black text-xs shadow-md transition"
                  >
                    <span>⊞ Danh sách cấp độ</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>

                  {/* Dropdown danh sách 9 cấp độ */}
                  {isLevelDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-800 p-2 z-50 animate-in fade-in slide-in-from-top-1">
                      <button
                        onClick={() => {
                          setCurrentView('hub');
                          setIsLevelDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 mb-1"
                      >
                        ← Về trang tổng hợp
                      </button>
                      <div className="max-h-60 overflow-y-auto space-y-1">
                        {JAPANESE_NUMBER_LEVELS.map(l => (
                          <button
                            key={l.id}
                            onClick={() => {
                              setSelectedLevelId(l.id);
                              setIsLevelDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                              l.id === selectedLevel.id
                                ? 'bg-indigo-600 text-white'
                                : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                            }`}
                          >
                            <span>Cấp {l.id}: {l.title}</span>
                            <span className="font-mono text-[10px] opacity-75">{l.rangeLabel}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* TAB CHUYỂN ĐỔI: 📖 LÝ THUYẾT ⇄ 🎮 LUYỆN TẬP */}
          <div className="flex justify-center">
            <div className="inline-flex p-1.5 rounded-2xl bg-stone-200/80 dark:bg-stone-800/80 border border-stone-300/60 dark:border-stone-700">
              <button
                onClick={() => setLevelTab('theory')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all ${
                  levelTab === 'theory'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Lý thuyết</span>
              </button>
              <button
                onClick={() => setLevelTab('practice')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all ${
                  levelTab === 'practice'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                <Gamepad2 className="w-4 h-4" />
                <span>Luyện tập</span>
              </button>
            </div>
          </div>

          {/* NỘI DUNG TAB 1: LÝ THUYẾT */}
          {levelTab === 'theory' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* BẢNG SỐ HỌC (Cột trái 8 phần) */}
                <div className="lg:col-span-8 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-stone-100/80 dark:bg-stone-800/60 text-stone-600 dark:text-stone-400 font-extrabold uppercase text-[11px] border-b border-stone-200 dark:border-stone-800">
                        <tr>
                          <th className="py-3.5 px-4">Số</th>
                          <th className="py-3.5 px-4">Hiragana</th>
                          <th className="py-3.5 px-4">Romaji</th>
                          <th className="py-3.5 px-4">Kanji</th>
                          <th className="py-3.5 px-4 text-center">Phát âm</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 dark:divide-stone-800 font-medium">
                        {selectedLevel.tableData.map((item, idx) => (
                          <tr key={idx} className="hover:bg-stone-50 dark:hover:bg-white/5 transition-colors">
                            <td className="py-3.5 px-4 font-black font-mono text-stone-900 dark:text-white">
                              {item.num.toLocaleString('vi-VN')}
                            </td>
                            <td className="py-3.5 px-4 font-bold text-indigo-600 dark:text-indigo-400">
                              {item.hiragana}
                              {item.note && (
                                <span className="block text-[10px] text-stone-400 font-normal mt-0.5">
                                  ({item.note})
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-stone-600 dark:text-stone-300">
                              {item.romaji}
                            </td>
                            <td className="py-3.5 px-4 font-bold text-stone-900 dark:text-white">
                              {item.kanji}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <button
                                onClick={() => speakJapanese(item.hiragana)}
                                className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white inline-flex items-center justify-center transition shadow-2xs active:scale-95"
                                title="Nghe phát âm"
                              >
                                <Volume2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* HỘP ĐIỂM CẦN NHỚ (Cột phải 4 phần) */}
                <div className="lg:col-span-4 bg-orange-50/60 dark:bg-orange-950/20 border border-orange-200/80 dark:border-orange-900/40 rounded-3xl p-5 sm:p-6 space-y-3.5">
                  <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-black text-sm">
                    <Sparkles className="w-4 h-4" />
                    <span>Điểm cần nhớ</span>
                  </div>

                  <ul className="space-y-3 text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                    {selectedLevel.notes.map((note, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-orange-500 font-bold shrink-0 mt-0.5">•</span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* THANH ĐIỀU HƯỚNG DƯỚI CÙNG */}
              <div className="rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-bold">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>Đã nắm vững lý thuyết cấp độ {selectedLevel.id}? Chuyển sang luyện tập ngay!</span>
                </div>

                <button
                  onClick={() => setLevelTab('practice')}
                  className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs sm:text-sm shadow-md transition active:scale-95 flex items-center gap-2 shrink-0"
                >
                  <span>Luyện tập ngay</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* NỘI DUNG TAB 2: LUYỆN TẬP (4 CHẾ ĐỘ) */}
          {levelTab === 'practice' && (
            <div className="space-y-6">
              <div className="text-left">
                <h2 className="text-lg font-black text-stone-900 dark:text-white flex items-center gap-2">
                  <Gamepad2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span>Luyện tập cấp độ {selectedLevel.id}</span>
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Chọn chế độ luyện tập và bắt đầu ngay!
                </p>
              </div>

              {/* 4 THẺ CHẾ ĐỘ LUYỆN TẬP */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Chế độ 1: Nhìn số ➔ Chọn cách đọc */}
                <div className="rounded-3xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 p-5 flex flex-col justify-between gap-4 text-left">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-md">
                      <Eye className="w-5 h-5" />
                    </div>
                    <h3 className="font-black text-stone-900 dark:text-white text-sm">
                      Nhìn số ➔ Chọn cách đọc
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                      Nhìn số và chọn cách đọc đúng trong 4 đáp án.
                    </p>
                  </div>

                  <button
                    onClick={() => startQuiz(selectedLevel.id, 'look_read')}
                    className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <span>Luyện tập</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Chế độ 2: Nghe ➔ Chọn số */}
                <div className="rounded-3xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 p-5 flex flex-col justify-between gap-4 text-left">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md">
                      <Headphones className="w-5 h-5" />
                    </div>
                    <h3 className="font-black text-stone-900 dark:text-white text-sm">
                      Nghe ➔ Chọn số
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                      Nghe audio tiếng Nhật và chọn đúng con số.
                    </p>
                  </div>

                  <button
                    onClick={() => startQuiz(selectedLevel.id, 'listen_num')}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <span>Luyện tập</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Chế độ 3: Nhìn số ➔ Nhập cách đọc */}
                <div className="rounded-3xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/40 p-5 flex flex-col justify-between gap-4 text-left">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-md">
                      <Keyboard className="w-5 h-5" />
                    </div>
                    <h3 className="font-black text-stone-900 dark:text-white text-sm">
                      Nhìn số ➔ Nhập cách đọc
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                      Nhìn số và nhập cách đọc bằng tiếng Nhật.
                    </p>
                  </div>

                  <button
                    onClick={() => startQuiz(selectedLevel.id, 'look_type')}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <span>Luyện tập</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Chế độ 4: Nghe ➔ Nhập số */}
                <div className="rounded-3xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-900/40 p-5 flex flex-col justify-between gap-4 text-left">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-2xl bg-purple-500 text-white flex items-center justify-center shadow-md">
                      <PenTool className="w-5 h-5" />
                    </div>
                    <h3 className="font-black text-stone-900 dark:text-white text-sm">
                      Nghe ➔ Nhập số
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                      Nghe audio và nhập số bằng chữ số.
                    </p>
                  </div>

                  <button
                    onClick={() => startQuiz(selectedLevel.id, 'listen_type')}
                    className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <span>Luyện tập</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* CHUYỂN SANG CẤP SAU NẾU CÓ */}
              {nextLevel && (
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setSelectedLevelId(nextLevel.id);
                      setLevelTab('theory');
                    }}
                    className="px-5 py-3 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-indigo-500 font-bold text-xs flex items-center gap-2 shadow-2xs transition"
                  >
                    <div className="text-right">
                      <div className="text-[10px] text-stone-400 uppercase font-black">CẤP SAU</div>
                      <div className="font-extrabold text-stone-900 dark:text-white">{nextLevel.title}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-indigo-600" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 3: QUIZ PLAYER TƯƠNG TÁC
  // ==========================================
  if (currentView === 'quiz' && currentQ) {
    const isAnswered = !!currentAnswer;

    return (
      <div className="min-h-screen bg-stone-50 dark:bg-[#0B1120] text-stone-900 dark:text-stone-100 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-4 space-y-5">
          
          {/* HEADER TRÊN CÙNG: QUAY LẠI, 4 TABS CHUYỂN NHANH, CHỌN BÀI */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => {
                stopSpeaking();
                setCurrentView(selectedLevelId === 'random' ? 'hub' : 'level');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:text-indigo-600 text-xs font-bold transition shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </button>

            {/* 4 Pill Buttons chọn chế độ làm bài */}
            <div className="flex items-center gap-1.5 overflow-x-auto bg-stone-200/60 dark:bg-stone-800/60 p-1 rounded-2xl">
              <button
                onClick={() => startQuiz(selectedLevelId, 'look_read')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition ${
                  activeMode === 'look_read'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Nhìn số ➔ Chọn cách đọc</span>
              </button>
              <button
                onClick={() => startQuiz(selectedLevelId, 'listen_num')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition ${
                  activeMode === 'listen_num'
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                <Headphones className="w-3.5 h-3.5" />
                <span>Nghe ➔ Chọn số</span>
              </button>
              <button
                onClick={() => startQuiz(selectedLevelId, 'look_type')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition ${
                  activeMode === 'look_type'
                    ? 'bg-blue-500 text-white shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                <Keyboard className="w-3.5 h-3.5" />
                <span>Nhìn số ➔ Nhập cách đọc</span>
              </button>
              <button
                onClick={() => startQuiz(selectedLevelId, 'listen_type')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition ${
                  activeMode === 'listen_type'
                    ? 'bg-purple-500 text-white shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Nghe ➔ Nhập số</span>
              </button>
            </div>

            {/* Dropdown Chọn bài */}
            <div className="relative">
              <button
                onClick={() => setIsLevelDropdownOpen(!isLevelDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs shadow-2xs"
              >
                <span>📑 Chọn bài • {selectedLevelId === 'random' ? 'Ngẫu nhiên' : selectedLevel?.rangeLabel}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {isLevelDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-800 p-2 z-50">
                  <button
                    onClick={() => {
                      startQuiz('random', activeMode);
                      setIsLevelDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/40"
                  >
                    🔀 Luyện ngẫu nhiên mọi cấp
                  </button>
                  <div className="border-t border-stone-100 dark:border-stone-800 my-1" />
                  {JAPANESE_NUMBER_LEVELS.map(l => (
                    <button
                      key={l.id}
                      onClick={() => {
                        startQuiz(l.id, activeMode);
                        setIsLevelDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                        l.id === selectedLevelId
                          ? 'bg-indigo-600 text-white'
                          : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                      }`}
                    >
                      <span>Cấp {l.id}: {l.title}</span>
                      <span className="font-mono text-[10px] opacity-75">{l.rangeLabel}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* TIẾN ĐỘ, ĐIỂM SỐ & ĐỒNG HỒ */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-4 sm:p-5 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs font-extrabold">
              <span className="text-stone-600 dark:text-stone-300">
                Câu {currentQuestionIndex + 1} / {questions.length}
              </span>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-black flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Đúng {correctCount} / {questions.length}</span>
                </span>

                <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-mono font-black flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatTimer(elapsedSeconds)}</span>
                </span>
              </div>
            </div>

            {/* Thanh tiến trình Progress Bar */}
            <div className="w-full h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-rose-500 transition-all duration-300 rounded-full"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* VÙNG NỘI DUNG CÂU HỎI CHÍNH */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200/80 dark:border-stone-800 shadow-sm text-center space-y-6">
            
            {/* Tag Tiêu đề câu hỏi */}
            <div className="inline-flex px-4 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 text-xs sm:text-sm font-black">
              {activeMode === 'look_read' && 'Số này đọc là gì?'}
              {activeMode === 'listen_num' && 'Bạn nghe được số nào?'}
              {activeMode === 'look_type' && 'Nhập cách đọc Hiragana của số này:'}
              {activeMode === 'listen_type' && 'Nghe và nhập chữ số:'}
            </div>

            {/* Điều khiển tốc độ (Chỉ hiện khi ở chế độ nghe) */}
            {(activeMode === 'listen_num' || activeMode === 'listen_type') && (
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-stone-500">
                <span>🌐 Tốc độ:</span>
                {(['slow', 'normal', 'fast'] as const).map(spd => (
                  <button
                    key={spd}
                    onClick={() => setSpeechSpeed(spd)}
                    className={`px-3 py-1 rounded-xl text-xs font-black transition ${
                      speechSpeed === spd
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                    }`}
                  >
                    {spd === 'slow' ? 'Chậm' : spd === 'normal' ? 'Vừa' : 'Nhanh'}
                  </button>
                ))}
              </div>
            )}

            {/* HIỂN THỊ CON SỐ HOẶC LOA PHÁT ÂM */}
            <div className="py-4">
              {activeMode === 'look_read' || activeMode === 'look_type' ? (
                /* Chế độ Nhìn số: Hiển thị con số siêu lớn */
                <div className="flex items-center justify-center gap-3">
                  <span className="text-stone-300 dark:text-stone-600 text-2xl font-black">≥</span>
                  <div className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight font-mono select-none">
                    {currentQ.num.toLocaleString('vi-VN')}
                  </div>
                  <span className="text-stone-300 dark:text-stone-600 text-2xl font-black">≤</span>
                </div>
              ) : (
                /* Chế độ Nghe: Nút loa phát âm tròn có sóng âm pulse */
                <div className="flex items-center justify-center gap-4">
                  <span className="text-rose-300 dark:text-rose-800 text-2xl font-black">≥</span>
                  <button
                    onClick={() => playCurrentAudio()}
                    className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${
                      isPlayingAudio
                        ? 'bg-rose-500 text-white scale-110 ring-8 ring-rose-400/30'
                        : 'bg-gradient-to-br from-rose-500 to-pink-500 text-white hover:scale-105 active:scale-95'
                    }`}
                  >
                    <Volume2 className={`w-10 h-10 ${isPlayingAudio ? 'animate-bounce' : ''}`} />
                  </button>
                  <span className="text-rose-300 dark:text-rose-800 text-2xl font-black">≤</span>
                </div>
              )}
            </div>

            {/* KHU VỰC TƯƠNG TÁC ĐÁP ÁN */}
            {activeMode === 'look_read' || activeMode === 'listen_num' ? (
              /* TRẮC NGHIỆM 4 ĐÁP ÁN (GRID 2x2) */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto">
                {currentQ.options.map(opt => {
                  let btnStyle = 'bg-stone-50 dark:bg-stone-800/80 border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:border-indigo-400';
                  
                  if (isAnswered) {
                    if (opt.isCorrect) {
                      btnStyle = 'bg-emerald-500 text-white border-emerald-600 shadow-md ring-2 ring-emerald-400/30';
                    } else if (currentAnswer?.selectedOption === opt.label) {
                      btnStyle = 'bg-rose-500 text-white border-rose-600 shadow-md ring-2 ring-rose-400/30';
                    } else {
                      btnStyle = 'opacity-40 bg-stone-100 dark:bg-stone-800 border-stone-200';
                    }
                  }

                  const displayContent = activeMode === 'look_read' ? opt.text : opt.numText;

                  return (
                    <button
                      key={opt.label}
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(opt)}
                      className={`p-4 rounded-2xl border text-left font-bold transition-all duration-150 flex items-center gap-3 shadow-2xs ${btnStyle}`}
                    >
                      <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                        isAnswered && opt.isCorrect
                          ? 'bg-white/30 text-white'
                          : 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300'
                      }`}>
                        {opt.label}
                      </span>
                      <span className="text-base sm:text-lg font-black truncate">
                        {displayContent}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              /* NHẬP ĐÁP ÁN TEXT (CHẾ ĐỘ 3 & 4) */
              <div className="max-w-md mx-auto space-y-4">
                <form onSubmit={handleSubmitTyping} className="space-y-3">
                  <div className="relative">
                    <input
                      type={activeMode === 'listen_type' ? 'text' : 'text'}
                      disabled={isAnswered}
                      value={typingInput}
                      onChange={e => setTypingInput(e.target.value)}
                      placeholder={
                        activeMode === 'look_type'
                          ? 'Nhập cách đọc Hiragana (vd: じゅう)...'
                          : 'Nhập số (vd: 10, 45, 100)...'
                      }
                      className="w-full py-3.5 px-4 rounded-2xl bg-stone-50 dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 focus:border-indigo-600 dark:focus:border-indigo-500 text-stone-900 dark:text-white font-bold text-center text-lg outline-none transition shadow-2xs"
                      autoFocus
                    />
                  </div>

                  {!isAnswered ? (
                    <button
                      type="submit"
                      disabled={!typingInput.trim()}
                      className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold text-sm shadow-md transition active:scale-95"
                    >
                      Kiểm tra đáp án
                    </button>
                  ) : (
                    /* Kết quả sau khi nộp câu nhập */
                    <div className={`p-4 rounded-2xl border text-left text-sm font-bold ${
                      currentAnswer?.isCorrect
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                        : 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        {currentAnswer?.isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                        )}
                        <span className="font-extrabold">
                          {currentAnswer?.isCorrect ? 'Chính xác!' : 'Chưa chính xác!'}
                        </span>
                      </div>
                      <div className="text-xs space-y-0.5 pl-7">
                        <div>Đáp án đúng: <span className="font-black underline">{currentQ.hiragana}</span> ({currentQ.romaji})</div>
                        <div>Số: <span className="font-mono font-bold">{currentQ.num.toLocaleString('vi-VN')}</span></div>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            )}

            {/* NÚT ĐIỀU HƯỚNG CÂU TRƯỚC / TIẾP THEO */}
            <div className="flex items-center justify-center gap-3 pt-4 border-t border-stone-100 dark:border-stone-800">
              <button
                onClick={handlePrevQuestion}
                disabled={currentQuestionIndex === 0}
                className="px-5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 disabled:opacity-40 text-stone-700 dark:text-stone-300 font-bold text-xs transition"
              >
                &lt; Câu trước
              </button>

              <button
                onClick={handleNextQuestion}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-extrabold text-xs shadow-md transition active:scale-95 flex items-center gap-1.5"
              >
                <span>{currentQuestionIndex === questions.length - 1 ? 'Xem kết quả' : 'Câu tiếp theo'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* PHÍM TẮT GỢI Ý Ở DƯỚI CÙNG (TRONG CHẾ ĐỘ NGHE) */}
            {(activeMode === 'listen_num' || activeMode === 'listen_type') && (
              <div className="text-[11px] font-bold text-stone-400 flex items-center justify-center gap-2 pt-2">
                <span>⌨️</span>
                <span><kbd className="px-1.5 py-0.5 bg-stone-200 dark:bg-stone-800 rounded font-mono text-[10px] text-stone-700 dark:text-stone-300">Ctrl</kbd> nghe lại tốc độ bình thường</span>
                <span>•</span>
                <span><kbd className="px-1.5 py-0.5 bg-stone-200 dark:bg-stone-800 rounded font-mono text-[10px] text-stone-700 dark:text-stone-300">Shift</kbd> nghe lại chậm</span>
              </div>
            )}
          </div>
        </div>

        {/* MODAL KẾT QUẢ CUỐI BÀI */}
        {showResultModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-200 dark:border-stone-800 text-center space-y-6">
              
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center mx-auto shadow-lg">
                <Trophy className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white">
                  Hoàn thành bài luyện tập!
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {selectedLevelId === 'random' ? 'Chế độ ngẫu nhiên' : selectedLevel?.title}
                </p>
              </div>

              {/* Vòng tròn điểm số */}
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/80 flex items-center justify-around">
                <div>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {correctCount} / {questions.length}
                  </div>
                  <div className="text-[11px] font-bold text-stone-400 uppercase">Câu đúng</div>
                </div>

                <div className="w-px h-8 bg-stone-200 dark:bg-stone-700" />

                <div>
                  <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                    {formatTimer(elapsedSeconds)}
                  </div>
                  <div className="text-[11px] font-bold text-stone-400 uppercase">Thời gian</div>
                </div>

                <div className="w-px h-8 bg-stone-200 dark:bg-stone-700" />

                <div>
                  <div className="text-2xl font-black text-orange-600 dark:text-orange-400">
                    {Math.round((correctCount / questions.length) * 100)}%
                  </div>
                  <div className="text-[11px] font-bold text-stone-400 uppercase">Độ chính xác</div>
                </div>
              </div>

              {/* 3 Nút thao tác */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => startQuiz(selectedLevelId, activeMode)}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs sm:text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Luyện tập lại bài này</span>
                </button>

                <button
                  onClick={() => {
                    setShowResultModal(false);
                    setCurrentView(selectedLevelId === 'random' ? 'hub' : 'level');
                  }}
                  className="w-full py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold text-xs transition"
                >
                  Đổi chế độ luyện tập khác
                </button>

                <button
                  onClick={() => {
                    setShowResultModal(false);
                    setCurrentView('hub');
                  }}
                  className="w-full py-2 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 font-bold text-xs transition"
                >
                  Về danh sách cấp độ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};
