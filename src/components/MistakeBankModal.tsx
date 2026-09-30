import React, { useState, useMemo } from 'react';
import { WordItem } from '../types';
import { 
  X, 
  AlertCircle, 
  Search, 
  Volume2, 
  Check, 
  Trash2, 
  RotateCcw, 
  Sparkles, 
  Layers, 
  Zap, 
  CheckCircle2 
} from 'lucide-react';
import { speakJapanese } from '../lib/audio';
import { StudyMode } from './StudyModeSelector';

interface MistakeBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  mistakeWordIds: string[];
  allVocabWords: WordItem[];
  masteredWordIds: string[];
  onRemoveMistake: (id: string) => void;
  onAddMastered: (id: string) => void;
  onClearAllMistakes: () => void;
  onStartPracticeWithMistakes: (mode: StudyMode) => void;
}

export const MistakeBankModal: React.FC<MistakeBankModalProps> = ({
  isOpen,
  onClose,
  mistakeWordIds,
  allVocabWords,
  masteredWordIds,
  onRemoveMistake,
  onAddMastered,
  onClearAllMistakes,
  onStartPracticeWithMistakes
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');

  // Lọc ra các WordItem có ID nằm trong mistakeWordIds
  const mistakeWords = useMemo(() => {
    const mistakeSet = new Set(mistakeWordIds);
    return allVocabWords.filter(w => mistakeSet.has(w.id));
  }, [mistakeWordIds, allVocabWords]);

  // Bộ lọc tìm kiếm & cấp độ
  const filteredWords = useMemo(() => {
    return mistakeWords.filter(w => {
      if (levelFilter !== 'all' && w.level !== levelFilter) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        w.kanji?.toLowerCase().includes(q) ||
        w.kana.toLowerCase().includes(q) ||
        w.romaji.toLowerCase().includes(q) ||
        w.meaning.toLowerCase().includes(q) ||
        (w.hanviet && w.hanviet.toLowerCase().includes(q))
      );
    });
  }, [mistakeWords, searchQuery, levelFilter]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-[#111c30] w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-rose-50/50 via-amber-50/30 to-transparent dark:from-rose-950/20 dark:via-amber-950/10">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/25">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  Kho Từ Hay Sai & Khắc Phục
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 font-mono">
                  {mistakeWords.length} từ
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Tổng hợp tất cả các từ bạn từng làm sai trong Quiz & Nhồi nhét để ôn luyện lại cho đến khi thuộc.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thanh tác vụ nhanh: Luyện tập ngay 3 chế độ */}
        {mistakeWords.length > 0 && (
          <div className="px-5 sm:px-6 py-3.5 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                Luyện tập riêng kho từ sai:
              </span>
              <button
                onClick={() => {
                  onClose();
                  onStartPracticeWithMistakes('flashcard');
                }}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm transition active:scale-95"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Flashcard 3D</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onStartPracticeWithMistakes('quiz');
                }}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-sm transition active:scale-95"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Quiz trắc nghiệm</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onStartPracticeWithMistakes('cram');
                }}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-sm transition active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Gõ nhồi nhét</span>
              </button>
            </div>

            <button
              onClick={onClearAllMistakes}
              className="text-xs font-bold text-slate-400 hover:text-rose-500 transition flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa toàn bộ kho sai</span>
            </button>
          </div>
        )}

        {/* Thanh tìm kiếm & lọc cấp độ */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo Kanji, Hiragana, Hán Việt hoặc Nghĩa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-rose-500 transition"
            />
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto">
            {['all', 'N5', 'N4', 'N3', 'N2', 'N1'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setLevelFilter(lvl)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                  levelFilter === lvl
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {lvl === 'all' ? 'Tất cả cấp độ' : lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Danh sách từ hay sai */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {mistakeWords.length === 0 ? (
            <div className="text-center py-16 px-4 space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Kho từ sai đang trống!
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Tuyệt vời, bạn chưa có từ nào bị đánh dấu sai hoặc đã khắc phục xong tất cả. Hãy tiếp tục làm Quiz để thử sức nhé!
              </p>
            </div>
          ) : filteredWords.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              Không tìm thấy từ nào phù hợp với từ khóa & cấp độ đã chọn.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredWords.map((word) => {
                const isMastered = masteredWordIds.includes(word.id);
                return (
                  <div
                    key={word.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 hover:border-rose-400/50 dark:hover:border-rose-500/40 transition group relative flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-baseline space-x-2">
                          <span className="font-jp font-black text-xl text-slate-900 dark:text-white">
                            {word.kanji || word.kana}
                          </span>
                          {word.kanji && (
                            <span className="font-jp text-sm text-slate-500 dark:text-slate-400">
                              {word.kana}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-1.5">
                          <button
                            onClick={() => speakJapanese(word.kana || word.kanji)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-sky-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition"
                            title="Nghe phát âm"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/40">
                            {word.level}
                          </span>
                        </div>
                      </div>

                      {word.hanviet && (
                        <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400 mt-1 uppercase tracking-wider">
                          [{word.hanviet}]
                        </p>
                      )}

                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-1.5">
                        {word.meaning}
                      </p>
                    </div>

                    {/* Dưới cùng: Nút đánh dấu đã thuộc / gỡ khỏi kho sai */}
                    <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
                      <button
                        onClick={() => {
                          onAddMastered(word.id);
                          onRemoveMistake(word.id);
                        }}
                        className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-bold transition border ${
                          isMastered
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800/60'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:text-emerald-600 dark:hover:text-emerald-400'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{isMastered ? 'Đã thuộc (Đã xong)' : 'Đã nhớ từ này (Thuộc)'}</span>
                      </button>

                      <button
                        onClick={() => onRemoveMistake(word.id)}
                        className="text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition p-1"
                        title="Xóa từ này khỏi kho sai"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Mẹo: Khi làm đúng câu hỏi trong Quiz hoặc Cramming, từ sẽ tự động được gỡ khỏi kho sai này.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:opacity-90 transition shadow-xs"
          >
            Đóng lại
          </button>
        </div>
      </div>
    </div>
  );
};
