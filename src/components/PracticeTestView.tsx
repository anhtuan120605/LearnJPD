import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { WordItem } from '../types';
import { 
  FileCheck2, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Trophy, 
  Settings2, 
  Send, 
  Sparkles, 
  Volume2, 
  SlidersHorizontal,
  ArrowRight,
  Filter
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { speakJapanese, stopSpeaking } from '../lib/audio';
import { toHiragana, isJapaneseAnswerMatch } from '../lib/textUtils';

interface PracticeTestViewProps {
  words: WordItem[];
  favoriteWords: string[];
  lessonNum?: number;
  onSaveScore?: (score: number, total: number, type: string) => void;
}

type QuestionType = 'mc' | 'tf' | 'written';

interface TestQuestion {
  id: string;
  word: WordItem;
  type: QuestionType;
  prompt: string;
  subPrompt?: string;
  // Cho trắc nghiệm
  options?: string[];
  correctAnswer: string;
  // Cho đúng/sai
  tfGivenAnswer?: string;
  tfIsCorrect?: boolean;
}

export const PracticeTestView: React.FC<PracticeTestViewProps> = ({
  words,
  favoriteWords,
  lessonNum = 1,
  onSaveScore
}) => {
  // Trạng thái: 'setup' (Cài đặt cấu hình đề thi) | 'testing' (Đang làm bài) | 'result' (Kết quả bài thi)
  const [testStage, setTestStage] = useState<'setup' | 'testing' | 'result'>('setup');

  // Cấu hình đề thi
  const [questionCount, setQuestionCount] = useState<number>(Math.min(15, words.length));
  const [enableMC, setEnableMC] = useState(true);
  const [enableTF, setEnableTF] = useState(true);
  const [enableWritten, setEnableWritten] = useState(true);
  const [onlyStarred, setOnlyStarred] = useState(false);

  // Danh sách câu hỏi trong bài thi hiện tại
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  // Đáp án của người dùng: questionId -> userAnswer
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});

  // Bộ lọc xem lại sau khi nộp bài: 'all' | 'incorrect'
  const [resultFilter, setResultFilter] = useState<'all' | 'incorrect'>('all');

  // Dừng phát âm khi rời khỏi màn hình Kiểm tra
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  // Lọc từ vựng làm đề
  const poolWords = useMemo(() => {
    if (onlyStarred) {
      return words.filter(w => favoriteWords.includes(w.id));
    }
    return words;
  }, [words, onlyStarred, favoriteWords]);

  // Sinh đề thi ngẫu nhiên theo cấu hình
  const generateTest = useCallback(() => {
    if (poolWords.length === 0) return;

    // Các dạng câu hỏi được chọn
    const allowedTypes: QuestionType[] = [];
    if (enableMC) allowedTypes.push('mc');
    if (enableTF) allowedTypes.push('tf');
    if (enableWritten) allowedTypes.push('written');

    if (allowedTypes.length === 0) allowedTypes.push('mc');

    // Chọn số từ ngẫu nhiên
    const targetCount = Math.min(questionCount, poolWords.length);
    const shuffledPool = [...poolWords].sort(() => 0.5 - Math.random()).slice(0, targetCount);

    const generated: TestQuestion[] = shuffledPool.map((targetWord, idx) => {
      // Phân bổ luân phiên các dạng câu hỏi được bật
      const type = allowedTypes[idx % allowedTypes.length];

      if (type === 'mc') {
        // Trắc nghiệm 4 đáp án: Hỏi Tiếng Nhật -> Chọn Nghĩa
        const correctAnswer = targetWord.meaning;
        const otherMeanings = words
          .filter(w => w.id !== targetWord.id && w.meaning !== correctAnswer)
          .map(w => w.meaning);
        const distractors = [...otherMeanings].sort(() => 0.5 - Math.random()).slice(0, 3);
        const options = [correctAnswer, ...distractors].sort(() => 0.5 - Math.random());

        return {
          id: `q-${idx}-${targetWord.id}`,
          word: targetWord,
          type: 'mc',
          prompt: targetWord.kanji || targetWord.kana,
          subPrompt: targetWord.kanji ? targetWord.kana : undefined,
          options,
          correctAnswer
        };
      } else if (type === 'tf') {
        // Đúng / Sai: 50% cho nghĩa đúng, 50% cho nghĩa sai của từ khác
        const isTrue = Math.random() > 0.5;
        let givenMeaning = targetWord.meaning;
        if (!isTrue) {
          const otherWord = words.find(w => w.id !== targetWord.id && w.meaning !== targetWord.meaning);
          if (otherWord) givenMeaning = otherWord.meaning;
        }

        return {
          id: `q-${idx}-${targetWord.id}`,
          word: targetWord,
          type: 'tf',
          prompt: targetWord.kanji || targetWord.kana,
          subPrompt: targetWord.kanji ? targetWord.kana : undefined,
          tfGivenAnswer: givenMeaning,
          tfIsCorrect: isTrue,
          correctAnswer: isTrue ? 'Đúng' : 'Sai'
        };
      } else {
        // Tự luận (Written): Cho nghĩa tiếng Việt -> Gõ chữ Hiragana
        return {
          id: `q-${idx}-${targetWord.id}`,
          word: targetWord,
          type: 'written',
          prompt: targetWord.meaning,
          subPrompt: targetWord.hanviet ? `Hán Việt: ${targetWord.hanviet}` : undefined,
          correctAnswer: targetWord.kana
        };
      }
    });

    setQuestions(generated);
    setUserAnswers({});
    setTestStage('testing');
    setResultFilter('all');
  }, [poolWords, questionCount, enableMC, enableTF, enableWritten, words]);

  // Cập nhật câu trả lời của người dùng
  const handleAnswer = (questionId: string, answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  // Nộp bài thi & Chấm điểm
  const handleSubmitTest = () => {
    setTestStage('result');

    // Tính điểm
    let correctCount = 0;
    questions.forEach(q => {
      const userAns = (userAnswers[q.id] || '').trim();
      if (q.type === 'mc' || q.type === 'tf') {
        if (userAns === q.correctAnswer) correctCount++;
      } else if (q.type === 'written') {
        if (isJapaneseAnswerMatch(userAns, q.word.kana, q.word.kanji, q.word.romaji)) {
          correctCount++;
        }
      }
    });

    if (onSaveScore) {
      onSaveScore(correctCount, questions.length, `Bài thi Bài ${lessonNum}`);
    }

    if (correctCount / questions.length >= 0.8) {
      confetti({
        particleCount: 110,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  };

  // Tính kết quả chi tiết
  const testResults = useMemo(() => {
    if (testStage !== 'result') return null;

    let correctCount = 0;
    const details = questions.map(q => {
      const userAns = (userAnswers[q.id] || '').trim();
      let isCorrect = false;

      if (q.type === 'mc' || q.type === 'tf') {
        isCorrect = userAns === q.correctAnswer;
      } else if (q.type === 'written') {
        isCorrect = isJapaneseAnswerMatch(userAns, q.word.kana, q.word.kanji, q.word.romaji);
      }

      if (isCorrect) correctCount++;

      return {
        question: q,
        userAns,
        isCorrect,
        correctText: q.type === 'tf' 
          ? `${q.correctAnswer} (Nghĩa đúng là: ${q.word.meaning})`
          : (q.type === 'written' ? `${q.word.kana} (${q.word.kanji || ''})` : q.correctAnswer)
      };
    });

    const percent = Math.round((correctCount / questions.length) * 100);
    let grade = 'F';
    let gradeColor = 'text-rose-500';
    if (percent >= 95) { grade = 'A+'; gradeColor = 'text-emerald-500'; }
    else if (percent >= 85) { grade = 'A'; gradeColor = 'text-emerald-600'; }
    else if (percent >= 70) { grade = 'B'; gradeColor = 'text-blue-500'; }
    else if (percent >= 50) { grade = 'C'; gradeColor = 'text-amber-500'; }

    return {
      correctCount,
      totalCount: questions.length,
      percent,
      grade,
      gradeColor,
      details
    };
  }, [testStage, questions, userAnswers]);

  const answeredCount = Object.keys(userAnswers).filter(k => userAnswers[k]?.trim()).length;

  // 1. MÀN HÌNH THIẾT LẬP ĐỀ THI (TEST SETUP)
  if (testStage === 'setup') {
    return (
      <div className="max-w-xl mx-auto bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-100 dark:border-zinc-800">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-2xl">
            <SlidersHorizontal className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Tạo bài thi thử (Practice Test)
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Mô phỏng phòng thi thật với các dạng câu hỏi tùy chỉnh
            </p>
          </div>
        </div>

        {/* Cài đặt số lượng câu hỏi */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider flex items-center justify-between">
            <span>Số lượng câu hỏi:</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-extrabold text-sm">{questionCount} câu</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[10, 15, 20, poolWords.length].map((num, i) => {
              if (num <= 0) return null;
              const isSelected = questionCount === num;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setQuestionCount(num)}
                  className={`py-2 rounded-xl text-xs font-bold border transition ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:border-indigo-400'
                  }`}
                >
                  {i === 3 ? `Tất cả (${num})` : `${num} câu`}
                </button>
              );
            })}
          </div>
        </div>

        {/* Các dạng câu hỏi muốn thi */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider block">
            Các dạng câu hỏi trong bài thi:
          </label>

          <label className="flex items-center space-x-3 p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 cursor-pointer hover:bg-slate-100 transition">
            <input
              type="checkbox"
              checked={enableMC}
              onChange={(e) => setEnableMC(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded-md focus:ring-indigo-500"
            />
            <div className="text-xs">
              <span className="font-bold text-slate-800 dark:text-white block">Trắc nghiệm (Multiple Choice)</span>
              <span className="text-slate-400">Chọn 1 trong 4 đáp án đúng</span>
            </div>
          </label>

          <label className="flex items-center space-x-3 p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 cursor-pointer hover:bg-slate-100 transition">
            <input
              type="checkbox"
              checked={enableTF}
              onChange={(e) => setEnableTF(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded-md focus:ring-indigo-500"
            />
            <div className="text-xs">
              <span className="font-bold text-slate-800 dark:text-white block">Đúng / Sai (True / False)</span>
              <span className="text-slate-400">Đánh giá nhanh định nghĩa có chính xác hay không</span>
            </div>
          </label>

          <label className="flex items-center space-x-3 p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 cursor-pointer hover:bg-slate-100 transition">
            <input
              type="checkbox"
              checked={enableWritten}
              onChange={(e) => setEnableWritten(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded-md focus:ring-indigo-500"
            />
            <div className="text-xs">
              <span className="font-bold text-slate-800 dark:text-white block">Tự luận (Viết / Gõ chữ)</span>
              <span className="text-slate-400">Tự gõ Hiragana/Romaji theo nghĩa tiếng Việt</span>
            </div>
          </label>
        </div>

        {/* Nút Bắt đầu thi */}
        <button
          onClick={generateTest}
          disabled={poolWords.length === 0}
          className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-sm shadow-md shadow-indigo-500/25 transition active:scale-98 flex items-center justify-center space-x-2"
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Bắt đầu làm bài thi ({Math.min(questionCount, poolWords.length)} câu)</span>
        </button>
      </div>
    );
  }

  // 2. MÀN HÌNH ĐANG LÀM BÀI THI (TEST IN-PROGRESS)
  if (testStage === 'testing') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header bài thi cố định */}
        <div className="sticky top-20 z-20 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-slate-200 dark:border-zinc-800 p-4 rounded-3xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Bài thi thử • Bài {lessonNum}
            </span>
            <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white">
              Đã làm: {answeredCount} / {questions.length} câu
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                if (window.confirm('Bạn có chắc chắn muốn hủy bài thi này và cấu hình lại không?')) {
                  setTestStage('setup');
                }
              }}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmitTest}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition flex items-center space-x-1"
            >
              <Send className="w-3 h-3" />
              <span>Nộp bài</span>
            </button>
          </div>
        </div>

        {/* Danh sách các câu hỏi của bài thi */}
        <div className="space-y-4">
          {questions.map((q, idx) => {
            const currentAnswer = userAnswers[q.id];

            return (
              <div 
                key={q.id}
                className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4"
              >
                {/* Header câu hỏi */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    Câu {idx + 1} / {questions.length}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {q.type === 'mc' ? 'Trắc nghiệm' : (q.type === 'tf' ? 'Đúng / Sai' : 'Tự luận')}
                  </span>
                </div>

                {/* Nội dung câu hỏi */}
                <div>
                  {q.type === 'written' ? (
                    <div>
                      <span className="text-xs font-medium text-slate-400 block mb-1">Hãy viết từ tiếng Nhật cho:</span>
                      <h4 className="text-xl font-bold text-slate-900 dark:text-white">{q.prompt}</h4>
                      {q.subPrompt && <p className="text-xs text-rose-500 font-bold mt-1">{q.subPrompt}</p>}
                    </div>
                  ) : q.type === 'tf' ? (
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-2xl font-jp font-black text-slate-900 dark:text-white">{q.prompt}</h4>
                        <button 
                          onClick={() => speakJapanese(q.word.kana || q.word.kanji)}
                          className="p-1 rounded-lg text-slate-400 hover:text-indigo-500"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                      {q.subPrompt && <p className="text-xs text-slate-400 font-medium">{q.subPrompt}</p>}
                      <p className="text-sm font-bold text-slate-700 dark:text-zinc-200 mt-2">
                        Nghĩa là: <span className="text-indigo-600 dark:text-indigo-400 font-black">"{q.tfGivenAnswer}"</span>
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-2xl font-jp font-black text-slate-900 dark:text-white">{q.prompt}</h4>
                        <button 
                          onClick={() => speakJapanese(q.word.kana || q.word.kanji)}
                          className="p-1 rounded-lg text-slate-400 hover:text-indigo-500"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                      {q.subPrompt && <p className="text-xs text-slate-400 font-medium">{q.subPrompt}</p>}
                    </div>
                  )}
                </div>

                {/* Các phương thức trả lời */}
                {q.type === 'mc' && q.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = currentAnswer === opt;
                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleAnswer(q.id, opt)}
                          className={`p-3.5 rounded-2xl border-2 text-left font-bold text-xs sm:text-sm transition ${
                            isSelected
                              ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-600 text-indigo-700 dark:text-indigo-300 shadow-xs ring-2 ring-indigo-500/20'
                              : 'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 hover:border-slate-300'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                )}

                {q.type === 'tf' && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    {['Đúng', 'Sai'].map(tfOpt => {
                      const isSelected = currentAnswer === tfOpt;
                      return (
                        <button
                          key={tfOpt}
                          type="button"
                          onClick={() => handleAnswer(q.id, tfOpt)}
                          className={`py-3 rounded-2xl border-2 font-bold text-sm transition ${
                            isSelected
                              ? (tfOpt === 'Đúng' 
                                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm' 
                                  : 'bg-rose-500 text-white border-rose-500 shadow-sm')
                              : 'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 hover:border-slate-300'
                          }`}
                        >
                          {tfOpt}
                        </button>
                      );
                    })}
                  </div>
                )}

                {q.type === 'written' && (
                  <div className="pt-2">
                    <input
                      type="text"
                      placeholder="Gõ Hiragana hoặc Romaji..."
                      value={currentAnswer || ''}
                      onChange={(e) => handleAnswer(q.id, toHiragana(e.target.value))}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800 border-2 border-slate-200 dark:border-zinc-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Nút Nộp bài dưới đáy trang */}
        <div className="text-center pt-4 pb-12">
          <button
            onClick={handleSubmitTest}
            className="px-10 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-lg shadow-emerald-500/25 transition active:scale-95 inline-flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>Nộp bài thi ngay</span>
          </button>
        </div>
      </div>
    );
  }

  // 3. MÀN HÌNH TRẢ ĐIỂM BÀI THI (TEST RESULTS & REVIEW)
  if (testStage === 'result' && testResults) {
    const { correctCount, totalCount, percent, grade, gradeColor, details } = testResults;

    const filteredDetails = details.filter(item => {
      if (resultFilter === 'incorrect') return !item.isCorrect;
      return true;
    });

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Bảng tổng kết điểm chữ chuẩn Quizlet */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-4">
          <div className="flex items-center justify-center space-x-4">
            <span className={`text-6xl sm:text-7xl font-black ${gradeColor}`}>
              {grade}
            </span>
            <div className="text-left border-l border-slate-200 dark:border-zinc-700 pl-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Kết quả bài thi
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {percent}%
              </h2>
              <p className="text-xs font-bold text-slate-500 dark:text-zinc-400">
                {correctCount} / {totalCount} câu đúng
              </p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 max-w-sm mx-auto">
            {percent >= 85 
              ? 'Thành tích xuất sắc! Bạn đã nắm rất vững từ vựng bài học này.' 
              : 'Hãy xem lại các câu làm sai bên dưới để củng cố lại trí nhớ nhé!'}
          </p>

          <div className="flex flex-wrap gap-2 justify-center pt-2">
            <button
              onClick={() => setTestStage('setup')}
              className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition flex items-center space-x-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Tạo đề thi mới</span>
            </button>
          </div>
        </div>

        {/* Thanh chuyển đổi xem câu đúng / sai */}
        <div className="flex items-center justify-between px-1">
          <h4 className="font-bold text-sm text-slate-800 dark:text-zinc-200">
            Xem lại chi tiết bài làm:
          </h4>
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-zinc-800 p-1 rounded-2xl text-xs font-bold">
            <button
              onClick={() => setResultFilter('all')}
              className={`px-3 py-1.5 rounded-xl transition ${
                resultFilter === 'all'
                  ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Tất cả ({details.length})
            </button>
            <button
              onClick={() => setResultFilter('incorrect')}
              className={`px-3 py-1.5 rounded-xl transition ${
                resultFilter === 'incorrect'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-slate-500 hover:text-rose-500'
              }`}
            >
              Câu sai ({details.filter(d => !d.isCorrect).length})
            </button>
          </div>
        </div>

        {/* Danh sách câu hỏi kèm đáp án đối chiếu */}
        <div className="space-y-3 pb-12">
          {filteredDetails.map((item, idx) => {
            const q = item.question;

            return (
              <div
                key={q.id}
                className={`p-5 rounded-3xl border-2 transition ${
                  item.isCorrect 
                    ? 'bg-white dark:bg-zinc-900 border-emerald-500/30' 
                    : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/40'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 block mb-1">
                      Câu {idx + 1} • {q.type === 'mc' ? 'Trắc nghiệm' : (q.type === 'tf' ? 'Đúng/Sai' : 'Tự luận')}
                    </span>
                    <h5 className="font-jp font-black text-lg text-slate-900 dark:text-white">
                      {q.prompt}
                    </h5>
                    {q.subPrompt && <p className="text-xs text-slate-400">{q.subPrompt}</p>}
                  </div>

                  {item.isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-1" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-1" />
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800 text-xs space-y-1">
                  <p>
                    <span className="text-slate-500">Bạn đã trả lời: </span>
                    <strong className={item.isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 line-through'}>
                      {item.userAns || '(Bỏ trống)'}
                    </strong>
                  </p>
                  {!item.isCorrect && (
                    <p>
                      <span className="text-slate-500">Đáp án chính xác: </span>
                      <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
                        {item.correctText}
                      </strong>
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
};
