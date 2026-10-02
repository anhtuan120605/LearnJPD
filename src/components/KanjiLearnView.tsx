import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { KanjiItem } from '../types';
import {
  Brain,
  CheckCircle2,
  XCircle,
  Sparkles,
  RotateCcw,
  Volume2,
  ArrowRight,
  Star,
  Trophy,
  ChevronRight,
  Send,
  PenTool,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { speakJapanese, stopSpeaking } from '../lib/audio';
import { KanjiStrokeModal } from './KanjiStrokeModal';

interface KanjiLearnViewProps {
  kanjiList: KanjiItem[];
  masteredKanji: string[];
  favoriteKanji: string[];
  onAddMastered?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
}

type KanjiStage = 0 | 1 | 2; // 0 = Chưa học, 1 = Quen thuộc, 2 = Đã thuộc

interface KanjiQuestion {
  kanji: KanjiItem;
  type: 'kanji_to_hanviet' | 'hanviet_to_kanji' | 'reading_to_kanji' | 'written_hanviet';
  prompt: string;
  subPrompt?: string;
  options?: string[];
  correctOption: string;
}

const ROUND_SIZE = 5;

export const KanjiLearnView: React.FC<KanjiLearnViewProps> = ({
  kanjiList,
  masteredKanji,
  favoriteKanji,
  onAddMastered,
  onToggleFavorite
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'unlearned' | 'starred'>('all');
  const [allowWrittenMode, setAllowWrittenMode] = useState(false);
  const [strokeKanji, setStrokeKanji] = useState<KanjiItem | null>(null);

  const activePool = useMemo(() => {
    if (filterMode === 'starred') {
      return kanjiList.filter(k => favoriteKanji.includes(k.id));
    }
    if (filterMode === 'unlearned') {
      return kanjiList.filter(k => !masteredKanji.includes(k.id));
    }
    return kanjiList;
  }, [kanjiList, filterMode, favoriteKanji, masteredKanji]);

  // Stage mapping
  const [stageMap, setStageMap] = useState<Record<string, KanjiStage>>(() => {
    const map: Record<string, KanjiStage> = {};
    kanjiList.forEach(k => {
      map[k.id] = masteredKanji.includes(k.id) ? 2 : 0;
    });
    return map;
  });

  // Questions queue for current round
  const [currentRoundQuestions, setCurrentRoundQuestions] = useState<KanjiQuestion[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);

  // User input states
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [writtenInput, setWrittenInput] = useState('');
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCurrentCorrect, setIsCurrentCorrect] = useState<boolean | null>(null);

  // Correction & round summaries
  const [showCorrection, setShowCorrection] = useState(false);
  const [isRoundSummary, setIsRoundSummary] = useState(false);
  const [roundNumber, setRoundNumber] = useState(1);

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  // Compute stats
  const stats = useMemo(() => {
    let notStudied = 0;
    let familiar = 0;
    let mastered = 0;

    activePool.forEach(k => {
      const s = stageMap[k.id] ?? 0;
      if (s === 0) notStudied++;
      else if (s === 1) familiar++;
      else if (s === 2) mastered++;
    });

    const total = activePool.length;
    const progressPercent = total > 0 ? Math.round(((familiar * 0.5 + mastered) / total) * 100) : 0;

    return { notStudied, familiar, mastered, total, progressPercent };
  }, [activePool, stageMap]);

  // Generate question for a kanji
  const createQuestionForKanji = useCallback((k: KanjiItem, pool: KanjiItem[], forceType?: KanjiQuestion['type']): KanjiQuestion => {
    // Types available
    const possibleTypes: KanjiQuestion['type'][] = ['kanji_to_hanviet', 'hanviet_to_kanji'];
    if (k.kunyomi.length > 0 || k.onyomi.length > 0) {
      possibleTypes.push('reading_to_kanji');
    }
    if (allowWrittenMode && (stageMap[k.id] ?? 0) >= 1) {
      possibleTypes.push('written_hanviet');
    }

    const qType = forceType || possibleTypes[Math.floor(Math.random() * possibleTypes.length)];

    // Get 3 random distractors from pool
    const distractors = pool.filter(item => item.id !== k.id).sort(() => 0.5 - Math.random()).slice(0, 3);

    if (qType === 'kanji_to_hanviet') {
      const options = [k.hanviet, ...distractors.map(d => d.hanviet)].sort(() => 0.5 - Math.random());
      return {
        kanji: k,
        type: 'kanji_to_hanviet',
        prompt: k.kanji,
        subPrompt: 'Chọn âm Hán Việt tương ứng với chữ Hán này',
        options,
        correctOption: k.hanviet
      };
    } else if (qType === 'hanviet_to_kanji') {
      const options = [k.kanji, ...distractors.map(d => d.kanji)].sort(() => 0.5 - Math.random());
      return {
        kanji: k,
        type: 'hanviet_to_kanji',
        prompt: k.hanviet,
        subPrompt: `Ý nghĩa: ${k.meanings_vi.slice(0, 2).join(', ')} — Chọn chữ Hán đúng:`,
        options,
        correctOption: k.kanji
      };
    } else if (qType === 'reading_to_kanji') {
      const reading = k.kunyomi[0] ? `Kun: ${k.kunyomi.join('、')}` : `On: ${k.onyomi.join('、')}`;
      const options = [k.kanji, ...distractors.map(d => d.kanji)].sort(() => 0.5 - Math.random());
      return {
        kanji: k,
        type: 'reading_to_kanji',
        prompt: reading,
        subPrompt: `Âm đọc trên là của chữ Kanji nào? (Nghĩa: ${k.meanings_vi[0] || '---'})`,
        options,
        correctOption: k.kanji
      };
    } else {
      // written_hanviet
      return {
        kanji: k,
        type: 'written_hanviet',
        prompt: k.kanji,
        subPrompt: `Gõ âm Hán Việt (không dấu hoặc có dấu) cho chữ Hán này (Nghĩa: ${k.meanings_vi[0] || ''})`,
        correctOption: k.hanviet
      };
    }
  }, [allowWrittenMode, stageMap]);

  // Build next round of questions
  const buildNextRound = useCallback(() => {
    if (activePool.length === 0) return;

    // Prioritize stage 1 (familiar), then stage 0 (not studied)
    const stage1Kanji = activePool.filter(k => (stageMap[k.id] ?? 0) === 1);
    const stage0Kanji = activePool.filter(k => (stageMap[k.id] ?? 0) === 0);
    const stage2Kanji = activePool.filter(k => (stageMap[k.id] ?? 0) === 2);

    let roundCandidates: KanjiItem[] = [];

    // Up to ROUND_SIZE
    if (stage1Kanji.length > 0) {
      roundCandidates.push(...stage1Kanji.slice(0, ROUND_SIZE));
    }
    if (roundCandidates.length < ROUND_SIZE && stage0Kanji.length > 0) {
      roundCandidates.push(...stage0Kanji.slice(0, ROUND_SIZE - roundCandidates.length));
    }
    // If still empty and all are mastered, review stage 2
    if (roundCandidates.length === 0 && stage2Kanji.length > 0) {
      roundCandidates.push(...stage2Kanji.sort(() => 0.5 - Math.random()).slice(0, ROUND_SIZE));
    }

    if (roundCandidates.length === 0) return;

    const questions = roundCandidates.map(k => createQuestionForKanji(k, activePool));
    setCurrentRoundQuestions(questions);
    setCurrentQIndex(0);
    setSelectedOption(null);
    setWrittenInput('');
    setIsAnswerChecked(false);
    setIsCurrentCorrect(null);
    setShowCorrection(false);
    setIsRoundSummary(false);
  }, [activePool, stageMap, createQuestionForKanji]);

  // Initial load
  useEffect(() => {
    buildNextRound();
  }, [activePool.length, filterMode]);

  const currentQ = currentRoundQuestions[currentQIndex];

  // Play audio when entering question
  useEffect(() => {
    if (currentQ) {
      const text = currentQ.kanji.kunyomi[0] || currentQ.kanji.onyomi[0] || currentQ.kanji.kanji;
      // slight delay
      const t = setTimeout(() => {
        speakJapanese(text);
      }, 200);
      return () => clearTimeout(t);
    }
  }, [currentQIndex, currentQ]);

  // Check answer
  const handleCheckAnswer = useCallback((overrideAnswer?: string) => {
    if (!currentQ || isAnswerChecked) return;

    const answer = (overrideAnswer !== undefined ? overrideAnswer : (
      currentQ.type === 'written_hanviet' ? writtenInput.trim() : selectedOption
    )) || '';

    if (!answer) return;

    let isCorrect = false;
    if (currentQ.type === 'written_hanviet') {
      // Normalize comparison for Han-Viet
      const cleanInput = answer.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
      const cleanCorrect = currentQ.correctOption.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
      isCorrect = cleanInput === cleanCorrect;
    } else {
      isCorrect = answer.trim() === currentQ.correctOption.trim();
    }

    setIsAnswerChecked(true);
    setIsCurrentCorrect(isCorrect);

    const kId = currentQ.kanji.id;
    const currentStage = stageMap[kId] ?? 0;

    if (isCorrect) {
      const newStage: KanjiStage = currentStage === 0 ? 1 : 2;
      setStageMap(prev => ({ ...prev, [kId]: newStage }));
      if (newStage === 2) {
        onAddMastered?.(kId);
      }
    } else {
      // Re-queue question for repeat in this round
      setStageMap(prev => ({ ...prev, [kId]: 0 }));
      setCurrentRoundQuestions(prev => {
        const copy = [...prev];
        const retryQ = createQuestionForKanji(currentQ.kanji, activePool);
        copy.push(retryQ);
        return copy;
      });
      setShowCorrection(true);
    }
  }, [currentQ, isAnswerChecked, writtenInput, selectedOption, stageMap, onAddMastered, activePool, createQuestionForKanji]);

  // Move to next question
  const handleNextQuestion = useCallback(() => {
    setShowCorrection(false);
    setSelectedOption(null);
    setWrittenInput('');
    setIsAnswerChecked(false);
    setIsCurrentCorrect(null);

    if (currentQIndex + 1 < currentRoundQuestions.length) {
      setCurrentQIndex(prev => prev + 1);
    } else {
      // Round completed
      setIsRoundSummary(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [currentQIndex, currentRoundQuestions.length]);

  if (!currentQ || activePool.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-12 text-center shadow-sm">
        <Sparkles className="w-12 h-12 text-rose-500 mx-auto mb-3 opacity-60" />
        <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-200">
          Chưa có chữ Kanji nào để bắt đầu vòng học
        </h3>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
          {filterMode === 'starred'
            ? 'Bạn chưa gắn sao chữ Kanji nào. Hãy chọn chế độ "Tất cả" để học!'
            : 'Hãy chọn cấp độ Kanji có dữ liệu để bắt đầu!'}
        </p>
        <button
          onClick={() => setFilterMode('all')}
          className="mt-6 px-6 py-2.5 rounded-2xl bg-rose-500 text-white font-bold text-xs hover:bg-rose-600 transition"
        >
          Học tất cả Kanji
        </button>
      </div>
    );
  }

  // ROUND SUMMARY SCREEN
  if (isRoundSummary) {
    const isAllMastered = stats.mastered === stats.total;

    return (
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 max-w-xl mx-auto shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-200">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 text-white mx-auto flex items-center justify-center shadow-lg shadow-rose-500/30">
          <Trophy className="w-10 h-10" />
        </div>

        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            {isAllMastered ? 'Hoàn thành Xuất sắc Toàn bộ!' : `Hoàn Thành Vòng ${roundNumber}!`}
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            {isAllMastered
              ? 'Bạn đã làm chủ toàn bộ các chữ Kanji trong danh sách này!'
              : 'Bạn đang tiến bộ rất nhanh. Hệ thống đã cập nhật mức độ ghi nhớ!'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-100 dark:border-zinc-700/60">
            <span className="text-2xl font-black text-slate-400 block">{stats.notStudied}</span>
            <span className="text-[11px] font-bold text-slate-500 uppercase">Chưa học</span>
          </div>
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40">
            <span className="text-2xl font-black text-amber-500 block">{stats.familiar}</span>
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase">Quen mặt</span>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40">
            <span className="text-2xl font-black text-emerald-500 block">{stats.mastered}</span>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Đã thuộc</span>
          </div>
        </div>

        <button
          onClick={() => {
            setRoundNumber(prev => prev + 1);
            buildNextRound();
          }}
          className="w-full py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-black text-sm shadow-lg shadow-rose-500/25 transition flex items-center justify-center space-x-2"
        >
          <span>{isAllMastered ? 'Ôn tập lại từ đầu' : 'Tiếp tục Vòng tiếp theo'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const progressPercent = Math.round(((currentQIndex + 1) / currentRoundQuestions.length) * 100);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Top Header & Settings */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-3.5 shadow-sm flex items-center justify-between gap-3">
        {/* Memory Stats Summary */}
        <div className="flex items-center space-x-3 text-xs font-bold">
          <span className="flex items-center space-x-1.5 text-slate-500">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-zinc-700" />
            <span>Mới: {stats.notStudied}</span>
          </span>
          <span className="flex items-center space-x-1.5 text-amber-500">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>Quen: {stats.familiar}</span>
          </span>
          <span className="flex items-center space-x-1.5 text-emerald-500">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span>Thuộc: {stats.mastered}</span>
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Toggle Type/Written mode */}
          <button
            onClick={() => setAllowWrittenMode(prev => !prev)}
            title="Bật/Tắt chế độ gõ âm Hán Việt"
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center space-x-1.5 ${
              allowWrittenMode
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 text-rose-600 dark:text-rose-400'
                : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-500'
            }`}
          >
            <span>Chế độ gõ</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-zinc-400">
          <span>Vòng {roundNumber} • Câu {currentQIndex + 1}/{currentRoundQuestions.length}</span>
          <span className="text-rose-500 font-extrabold">{progressPercent}%</span>
        </div>
        <div className="w-full h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-rose-500 to-amber-500 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* QUESTION CARD */}
      <div className="bg-white dark:bg-zinc-900 border-2 border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        {/* Top Info of Question */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-xs font-black uppercase">
              {currentQ.kanji.jlpt}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {currentQ.kanji.strokes} nét viết
            </span>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setStrokeKanji(currentQ.kanji)}
              title="Xem nét viết & tập vẽ"
              className="p-2 rounded-xl text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition"
            >
              <PenTool className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                const text = currentQ.kanji.kunyomi[0] || currentQ.kanji.onyomi[0] || currentQ.kanji.kanji;
                speakJapanese(text);
              }}
              title="Phát âm"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onToggleFavorite?.(currentQ.kanji.id)}
              className={`p-2 rounded-xl transition ${
                favoriteKanji.includes(currentQ.kanji.id)
                  ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                  : 'text-slate-400 hover:text-amber-500'
              }`}
            >
              <Star className={`w-4 h-4 ${favoriteKanji.includes(currentQ.kanji.id) ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Prompt */}
        <div className="text-center py-4 space-y-2">
          {currentQ.type === 'kanji_to_hanviet' || currentQ.type === 'written_hanviet' ? (
            <span className="text-7xl sm:text-8xl font-jp font-bold text-slate-900 dark:text-white block hover:scale-105 transition-transform duration-200">
              {currentQ.prompt}
            </span>
          ) : (
            <h3 className="text-3xl sm:text-4xl font-black text-rose-600 dark:text-rose-400 uppercase tracking-wide">
              {currentQ.prompt}
            </h3>
          )}
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium max-w-md mx-auto">
            {currentQ.subPrompt}
          </p>
        </div>

        {/* OPTIONS OR INPUT */}
        {currentQ.type === 'written_hanviet' ? (
          <div className="space-y-3">
            <div className="relative">
              <input
                type="text"
                autoFocus
                placeholder="Nhập âm Hán Việt (ví dụ: NHAT hoặc nhat)..."
                value={writtenInput}
                disabled={isAnswerChecked}
                onChange={e => setWrittenInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    if (!isAnswerChecked) handleCheckAnswer();
                    else handleNextQuestion();
                  }
                }}
                className={`w-full px-5 py-3.5 rounded-2xl border text-sm font-bold uppercase tracking-wider focus:outline-none transition ${
                  isAnswerChecked
                    ? isCurrentCorrect
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
                      : 'border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300'
                    : 'border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500/20'
                }`}
              />
              {!isAnswerChecked && (
                <button
                  onClick={() => handleCheckAnswer()}
                  disabled={!writtenInput.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-rose-500 text-white disabled:opacity-40 hover:bg-rose-600 transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentQ.options?.map((opt, idx) => {
              const isSelected = selectedOption === opt;
              const isCorrectOpt = opt === currentQ.correctOption;

              let btnStyle = 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/80 text-slate-800 dark:text-zinc-200 hover:border-rose-400 hover:bg-rose-50/30';

              if (isAnswerChecked) {
                if (isCorrectOpt) {
                  btnStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-black shadow-md shadow-emerald-500/10';
                } else if (isSelected && !isCorrectOpt) {
                  btnStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 line-through';
                } else {
                  btnStyle = 'border-slate-200 dark:border-zinc-800 opacity-40';
                }
              } else if (isSelected) {
                btnStyle = 'border-rose-500 bg-rose-50 text-rose-600';
              }

              const isKanjiOpt = currentQ.type === 'hanviet_to_kanji' || currentQ.type === 'reading_to_kanji';

              return (
                <button
                  key={idx}
                  disabled={isAnswerChecked}
                  onClick={() => {
                    setSelectedOption(opt);
                    handleCheckAnswer(opt);
                  }}
                  className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${btnStyle}`}
                >
                  <span className={`${isKanjiOpt ? 'text-3xl font-jp font-bold mx-auto' : 'text-sm font-bold uppercase tracking-wider'}`}>
                    {opt}
                  </span>
                  {isAnswerChecked && isCorrectOpt && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  )}
                  {isAnswerChecked && isSelected && !isCorrectOpt && (
                    <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* FEEDBACK & EXPLANATION PANEL */}
        {isAnswerChecked && (
          <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 space-y-4 animate-in fade-in duration-200">
            {isCurrentCorrect ? (
              <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>Chính xác! Bạn đã ghi nhớ từ này rất tốt.</span>
              </div>
            ) : (
              <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 p-4 rounded-2xl space-y-2 text-left">
                <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-400 font-black text-sm">
                  <XCircle className="w-5 h-5 shrink-0" />
                  <span>Chưa chính xác! Đáp án đúng là:</span>
                </div>
                <div className="flex items-center space-x-3 pt-1">
                  <div className="w-12 h-12 rounded-xl bg-rose-500 text-white font-jp font-bold text-2xl flex items-center justify-center">
                    {currentQ.kanji.kanji}
                  </div>
                  <div>
                    <h4 className="text-base font-black text-rose-600 dark:text-rose-400 uppercase">
                      {currentQ.kanji.hanviet}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-zinc-300">
                      Nghĩa: {currentQ.kanji.meanings_vi.join(', ')}
                    </p>
                    <p className="text-xs text-slate-400 font-mono">
                      {currentQ.kanji.onyomi.length > 0 && `On: ${currentQ.kanji.onyomi.join(', ')} `}
                      {currentQ.kanji.kunyomi.length > 0 && `• Kun: ${currentQ.kanji.kunyomi.join(', ')}`}
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-rose-500/80 italic mt-1">
                  Chữ này sẽ được đưa lại vào cuối vòng để bạn ôn luyện lại cho tới khi thuần thục!
                </p>
              </div>
            )}

            <button
              autoFocus
              onClick={handleNextQuestion}
              className="w-full py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-black text-sm shadow-md shadow-rose-500/20 transition flex items-center justify-center space-x-2"
            >
              <span>{currentQIndex + 1 < currentRoundQuestions.length ? 'Câu tiếp theo' : 'Xem kết quả Vòng'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Modal Tập vẽ & nét chữ */}
      {strokeKanji && (
        <KanjiStrokeModal
          isOpen={!!strokeKanji}
          onClose={() => setStrokeKanji(null)}
          kanji={strokeKanji.kanji}
          hanviet={strokeKanji.hanviet}
          meaning={strokeKanji.meanings_vi.join(', ')}
          strokes={strokeKanji.strokes}
        />
      )}
    </div>
  );
};
