import React, { useState, useEffect } from 'react';
import { ReadingLesson, ReadingQuestion } from '../types';
import { Volume2, VolumeX, Eye, EyeOff, BookOpen, CheckCircle2, XCircle, HelpCircle, Sparkles, RefreshCw } from 'lucide-react';
import { speakJapanese, stopSpeaking } from '../lib/audio';

interface ReadingViewProps {
  reading: ReadingLesson | undefined;
  lessonNum: number;
}

export const ReadingView: React.FC<ReadingViewProps> = ({ reading, lessonNum }) => {
  const [showFurigana, setShowFurigana] = useState(true);
  const [showTranslation, setShowTranslation] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  
  // Trạng thái câu trả lời câu hỏi đọc hiểu: { [qIdx]: selectedOptionIndex }
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  // Dừng phát âm khi unmount khỏi ReadingView
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  if (!reading) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-10 text-center shadow-sm">
        <BookOpen className="w-12 h-12 text-slate-300 dark:text-zinc-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">
          Chưa có bài đọc cho Bài {lessonNum}
        </h3>
        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
          Hệ thống đang chuẩn bị bài đọc hiểu tương ứng với bài học này.
        </p>
      </div>
    );
  }

  // Phát âm toàn bộ bài đọc
  const handlePlayReadingAudio = () => {
    if (isPlayingAudio) {
      stopSpeaking();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      speakJapanese(reading.content, 0.85, () => {
        setIsPlayingAudio(false);
      });
    }
  };

  const handleSelectOption = (qIdx: number, optIdx: number) => {
    setSelectedAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  const resetQuiz = () => {
    setSelectedAnswers({});
    setShowResults(false);
  };

  return (
    <div className="space-y-6">
      {/* Khung bài đọc chính */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        {/* Header bài đọc & Công cụ hỗ trợ */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-zinc-800">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                Minna no Nihongo • Bài đọc {lessonNum}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">
              {reading.title_ja}
            </h2>
            <p className="text-sm font-bold text-slate-500 dark:text-zinc-400">
              {reading.title_vi}
            </p>
          </div>

          {/* Các nút công cụ: Nghe bài đọc, Bật Furigana, Hiện bản dịch */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Nút Audio đọc cả bài */}
            <button
              onClick={handlePlayReadingAudio}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
                isPlayingAudio
                  ? 'bg-rose-500 text-white'
                  : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
              }`}
            >
              {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{isPlayingAudio ? 'Dừng đọc' : 'Nghe bài đọc'}</span>
            </button>

            {/* Nút Toggle Furigana */}
            <button
              onClick={() => setShowFurigana(!showFurigana)}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition ${
                showFurigana
                  ? 'bg-slate-100 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white'
                  : 'bg-transparent border-slate-200 dark:border-zinc-800 text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>Furigana</span>
              <span className={`w-2 h-2 rounded-full ${showFurigana ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
            </button>

            {/* Nút Toggle Dịch nghĩa tiếng Việt */}
            <button
              onClick={() => setShowTranslation(!showTranslation)}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition ${
                showTranslation
                  ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-300 dark:border-blue-800 text-blue-600 dark:text-blue-400'
                  : 'bg-transparent border-slate-200 dark:border-zinc-800 text-slate-500 hover:text-slate-900'
              }`}
            >
              {showTranslation ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>Bản dịch</span>
            </button>
          </div>
        </div>

        {/* Nội dung bài đọc tiếng Nhật */}
        <div className="py-8 px-2 sm:px-6">
          <div className="max-w-3xl mx-auto space-y-4">
            {/* Văn bản tiếng Nhật */}
            <p className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white leading-loose tracking-wide">
              {reading.content}
            </p>

            {/* Phiên âm Furigana / Hiragana hỗ trợ */}
            {showFurigana && (
              <p className="text-xs sm:text-sm text-slate-400 dark:text-zinc-500 leading-relaxed font-medium pt-2 border-t border-dashed border-slate-200 dark:border-zinc-800">
                Cách đọc: {reading.content_kana}
              </p>
            )}

            {/* Bản dịch tiếng Việt */}
            {showTranslation && (
              <div className="mt-6 p-5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-sm sm:text-base text-slate-700 dark:text-zinc-200 leading-relaxed">
                <span className="font-bold text-blue-600 dark:text-blue-400 block mb-1">
                  Bản dịch tiếng Việt:
                </span>
                {reading.translation}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Phần Câu hỏi kiểm tra Đọc hiểu (Comprehension Questions) */}
      {reading.questions && reading.questions.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Câu hỏi đọc hiểu
              </h3>
            </div>

            {showResults && (
              <button
                onClick={resetQuiz}
                className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-purple-600 dark:hover:text-purple-400"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Làm lại</span>
              </button>
            )}
          </div>

          <div className="space-y-6">
            {reading.questions.map((q: ReadingQuestion, qIdx: number) => {
              const selectedOpt = selectedAnswers[qIdx];
              const isAnswered = selectedOpt !== undefined;
              const isCorrect = isAnswered && selectedOpt === q.answer;

              return (
                <div key={qIdx} className="space-y-3">
                  <p className="text-base font-bold text-slate-900 dark:text-white flex items-start space-x-2">
                    <span className="text-purple-600 dark:text-purple-400 font-extrabold">{qIdx + 1}.</span>
                    <span>{q.q}</span>
                  </p>

                  {/* Lựa chọn đáp án */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {q.options.map((opt, optIdx) => {
                      const isChosen = selectedOpt === optIdx;
                      let btnStyle = 'bg-slate-50 dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700/60 text-slate-700 dark:text-zinc-300 hover:border-purple-300';

                      if (showResults) {
                        if (optIdx === q.answer) {
                          btnStyle = 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold';
                        } else if (isChosen) {
                          btnStyle = 'bg-rose-50 dark:bg-rose-950/50 border-rose-500 text-rose-700 dark:text-rose-300';
                        }
                      } else if (isChosen) {
                        btnStyle = 'bg-purple-50 dark:bg-purple-950/60 border-purple-500 text-purple-700 dark:text-purple-300 font-bold';
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectOption(qIdx, optIdx)}
                          className={`p-3.5 rounded-2xl border text-sm text-left flex items-center justify-between transition ${btnStyle}`}
                        >
                          <span>{opt}</span>
                          {showResults && optIdx === q.answer && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 ml-2" />
                          )}
                          {showResults && isChosen && optIdx !== q.answer && (
                            <XCircle className="w-4 h-4 text-rose-500 shrink-0 ml-2" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Giải thích câu trả lời khi nộp bài */}
                  {showResults && (
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-xs text-slate-600 dark:text-zinc-300">
                      <strong className="text-slate-900 dark:text-white">Giải thích: </strong>
                      {q.explain}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Nút Kiểm tra kết quả */}
          {!showResults && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowResults(true)}
                disabled={Object.keys(selectedAnswers).length < reading.questions.length}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-sm shadow-md transition"
              >
                Kiểm tra câu trả lời
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
