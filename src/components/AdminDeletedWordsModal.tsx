import React from 'react';
import { VocabOverride } from '../lib/vocabOverrides';
import { X, RotateCcw, Trash2, Sparkles } from 'lucide-react';

interface AdminDeletedWordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  deletedWords: VocabOverride[];
  lessonNum: number;
  onRestoreWord: (wordId: string) => Promise<void>;
}

export const AdminDeletedWordsModal: React.FC<AdminDeletedWordsModalProps> = ({
  isOpen,
  onClose,
  deletedWords,
  lessonNum,
  onRestoreWord,
}) => {
  const [restoringId, setRestoringId] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleRestore = async (id: string) => {
    try {
      setRestoringId(id);
      await onRestoreWord(id);
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-zinc-100">
                Từ vựng đã xóa (Bài {lessonNum})
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Các từ dưới đây đã bị xóa khỏi hệ thống. Bạn có thể khôi phục lại bất kỳ lúc nào.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {deletedWords.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-700 dark:text-zinc-300">
                Không có từ vựng nào bị xóa trong bài này
              </p>
              <p className="text-xs text-slate-400 dark:text-zinc-500 max-w-sm mx-auto">
                Tất cả từ vựng của Bài {lessonNum} đang hiển thị đầy đủ cho học viên.
              </p>
            </div>
          ) : (
            deletedWords.map((word) => (
              <div
                key={word.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-700/60 gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline space-x-2">
                    <span className="font-jp text-base font-bold text-slate-900 dark:text-zinc-100">
                      {word.kanji || word.kana}
                    </span>
                    {word.kanji && word.kana && word.kanji !== word.kana && (
                      <span className="font-jp text-xs text-slate-500 dark:text-zinc-400">
                        {word.kana}
                      </span>
                    )}
                    {word.hanviet && (
                      <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-sky-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded-md">
                        {word.hanviet}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-zinc-300 truncate mt-0.5">
                    {word.meaning}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1">
                    Cập nhật bởi: {word.updatedBy || 'Admin'} • ID: {word.id}
                  </p>
                </div>

                <button
                  onClick={() => handleRestore(word.id)}
                  disabled={restoringId === word.id}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition shrink-0 active:scale-95 disabled:opacity-50"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${restoringId === word.id ? 'animate-spin' : ''}`} />
                  <span>{restoringId === word.id ? 'Đang khôi phục...' : 'Khôi phục'}</span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
