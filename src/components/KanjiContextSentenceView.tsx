import React, { useState, useMemo, useEffect } from 'react';
import { KanjiItem, WordItem } from '../types';
import { BookOpen, Volume2, CheckCircle2, XCircle, ArrowRight, RotateCcw, Lightbulb, Trophy } from 'lucide-react';
import { speakJapanese } from '../lib/audio';
import confetti from 'canvas-confetti';

interface KanjiContextSentenceViewProps {
  kanjiList: KanjiItem[];
  allVocabWords?: WordItem[];
  currentLevel: string;
}

interface ContextSentenceQuestion {
  sentence: string; // "今日の日記を書きます。"
  targetWord: string; // "日記"
  correctReading: string; // "にっき"
  sentenceVi: string; // "Tôi viết nhật ký hôm nay."
  options: string[]; // ["にっき", "ひき", "にちき", "ひにっき"]
  explanation: string;
}

export const KanjiContextSentenceView: React.FC<KanjiContextSentenceViewProps> = ({
  kanjiList,
  allVocabWords = [],
  currentLevel
}) => {
  // Trích xuất các câu thực tế từ allVocabWords và kanjiList
  const questions = useMemo<ContextSentenceQuestion[]>(() => {
    const list: ContextSentenceQuestion[] = [];
    const kanjiCharsSet = new Set(kanjiList.map(k => k.kanji));

    allVocabWords.forEach(w => {
      if (w.examples && w.examples.length > 0 && w.kanji && w.kanji.length >= 1) {
        // Chỉ chọn nếu có ít nhất 1 chữ kanji đang học
        const hasKanji = Array.from(w.kanji).some(ch => kanjiCharsSet.has(ch));
        if (!hasKanji) return;

        w.examples.forEach(ex => {
          if (ex.ja.includes(w.kanji) && !list.some(q => q.sentence === ex.ja)) {
            // Tạo 3 phương án nhiễu thông minh
            const correctReading = w.kana;
            const distractors = new Set<string>();

            // Tạo biến thể âm
            if (correctReading.length >= 2) {
              // Biến âm tenten
              distractors.add(correctReading.replace('き', 'ぎ').replace('し', 'じ').replace('ち', 'ぢ'));
              // Biến âm sokuon
              distractors.add(correctReading.replace('っ', 'つ'));
            }

            // Lấy từ kana của các từ vựng khác
            allVocabWords
              .filter(other => other.id !== w.id && other.kana && other.kana !== correctReading)
              .sort(() => 0.5 - Math.random())
              .slice(0, 3)
              .forEach(other => distractors.add(other.kana));

            const distractorArr = Array.from(distractors).filter(d => d && d !== correctReading).slice(0, 3);
            const options = [correctReading, ...distractorArr].sort(() => 0.5 - Math.random());

            const isCompound = w.kanji.length >= 2 && Array.from(w.kanji).every(ch => /[\u4e00-\u9faf]/.test(ch));
            const explanation = isCompound
              ? `Chữ "${w.kanji}" là từ ghép Hán-Nhật (Jukugo), được kết hợp và phát âm theo âm Onyomi là 「${correctReading}」.`
              : `Chữ "${w.kanji}" trong ngữ cảnh câu này được phát âm theo âm thuần Nhật (Kunyomi) là 「${correctReading}」.`;

            list.push({
              sentence: ex.ja,
              targetWord: w.kanji,
              correctReading,
              sentenceVi: ex.vi,
              options,
              explanation
            });
          }
        });
      }
    });

    // Thêm các câu mẫu phổ biến nếu dữ liệu vocab ít
    if (list.length < 5) {
      const fallbackTemplates: ContextSentenceQuestion[] = [
        {
          sentence: '天気がとてもいいですね。',
          targetWord: '天気',
          correctReading: 'てんき',
          sentenceVi: 'Thời tiết đẹp thật đấy nhỉ.',
          options: ['てんき', 'あめき', 'そらき', 'てんけ'],
          explanation: 'Từ ghép 天気 (Thiên Khí) đọc theo âm On là 「てんき」.'
        },
        {
          sentence: '駅の前で友達を待ちます。',
          targetWord: '待ちます',
          correctReading: 'まちます',
          sentenceVi: 'Tôi chờ bạn trước nhà ga.',
          options: ['まちます', 'もちます', 'いきます', 'とまります'],
          explanation: 'Động từ 待つ (Đãi - chờ đợi) chia thể lịch sự là 待ちます「まちます」.'
        },
        {
          sentence: '毎朝、新聞を読みます。',
          targetWord: '新聞',
          correctReading: 'しんぶん',
          sentenceVi: 'Mỗi sáng tôi đều đọc báo.',
          options: ['しんぶん', 'あたらしぶん', 'しんもん', 'ききもの'],
          explanation: 'Chữ 新 (Tân) và 聞 (Văn) ghép lại tạo thành từ 新聞 đọc là 「しんぶん」.'
        }
      ];
      return [...list, ...fallbackTemplates];
    }

    return list.slice(0, 25);
  }, [kanjiList, allVocabWords]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const currentQ = questions[currentIndex];

  useEffect(() => {
    setSelectedOption(null);
  }, [currentIndex]);

  const handleSelect = (opt: string) => {
    if (selectedOption !== null || !currentQ) return;
    setSelectedOption(opt);
    if (opt === currentQ.correctReading) {
      setScore(prev => prev + 10);
      speakJapanese(currentQ.sentence);
      try {
        confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
      } catch (_) {}
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  if (!currentQ) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 text-center space-y-3">
        <BookOpen className="w-10 h-10 text-emerald-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-100">
          Chưa tìm thấy câu ví dụ cho cấp độ {currentLevel}
        </h3>
        <p className="text-xs text-slate-500">
          Hãy chọn các bài học trong cấp độ N5 hoặc N4 để luyện đọc ngữ cảnh.
        </p>
      </div>
    );
  }

  // Chia câu để highlight từ Kanji mục tiêu
  const parts = currentQ.sentence.split(currentQ.targetWord);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
                <span>Luyện Đọc Kanji Trong Câu</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 font-bold">
                  {currentLevel}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Xác định âm đọc chuẩn xác (Onyomi hay Kunyomi) qua ngữ cảnh câu thực tế
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Điểm số</span>
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
              {score} XP
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 flex items-center space-x-3">
          <span className="text-xs font-bold text-slate-400 shrink-0">
            Câu {currentIndex + 1} / {questions.length}
          </span>
          <div className="flex-1 h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Thẻ câu hỏi ngữ cảnh */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">
            Từ gạch chân đọc là gì trong câu này?
          </span>
          <button
            onClick={() => speakJapanese(currentQ.sentence)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-300 text-xs font-bold transition"
          >
            <Volume2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Nghe câu</span>
          </button>
        </div>

        {/* Khung hiển thị câu tiếng Nhật to rõ */}
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-700/60 text-center">
          <p className="text-2xl sm:text-3xl font-jp font-bold text-slate-900 dark:text-white leading-relaxed">
            {parts[0]}
            <span className="inline-block px-2.5 py-1 mx-1 rounded-xl bg-emerald-500/15 border-b-4 border-emerald-500 text-emerald-600 dark:text-emerald-400">
              {currentQ.targetWord}
            </span>
            {parts[1]}
          </p>

          <p className="mt-3 text-sm text-slate-500 dark:text-zinc-400 font-medium">
            "{currentQ.sentenceVi}"
          </p>
        </div>

        {/* 4 Lựa chọn cách đọc */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {currentQ.options.map((opt, idx) => {
            const isChosen = selectedOption === opt;
            const isCorrect = opt === currentQ.correctReading;
            const hasAnswered = selectedOption !== null;

            let btnStyle = 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 hover:border-emerald-500 hover:bg-emerald-50/30 text-slate-800 dark:text-zinc-100';

            if (hasAnswered) {
              if (isCorrect) {
                btnStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300 ring-2 ring-emerald-500/20';
              } else if (isChosen) {
                btnStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 ring-2 ring-rose-500/20';
              } else {
                btnStyle = 'opacity-40 border-slate-200 dark:border-zinc-800';
              }
            }

            return (
              <button
                key={idx}
                disabled={hasAnswered}
                onClick={() => handleSelect(opt)}
                className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between font-jp text-lg sm:text-xl font-bold ${btnStyle}`}
              >
                <span>{opt}</span>
                {hasAnswered && isCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                )}
                {hasAnswered && isChosen && !isCorrect && (
                  <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Giải thích sau khi trả lời */}
        {selectedOption !== null && (
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-start space-x-2.5">
              <Lightbulb className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase text-blue-600 dark:text-blue-400">
                  Giải thích âm đọc ngữ cảnh:
                </span>
                <p className="text-xs text-blue-900 dark:text-blue-200 font-medium">
                  {currentQ.explanation}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleNext}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-sm active:scale-95"
              >
                <span>{currentIndex < questions.length - 1 ? 'Câu tiếp theo' : 'Hoàn thành bài đọc'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
