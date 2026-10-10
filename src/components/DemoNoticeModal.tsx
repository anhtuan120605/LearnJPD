import React from 'react';
import { Sparkles, Construction, X } from 'lucide-react';

interface DemoNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  featureName?: string;
}

export const DemoNoticeModal: React.FC<DemoNoticeModalProps> = ({
  isOpen,
  onClose,
  title = 'Tính năng đang hoàn thiện',
  featureName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-white dark:bg-[#121826] border border-stone-200 dark:border-stone-800 rounded-3xl p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-200 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nút đóng */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon & Badge */}
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto mb-4 shadow-xs">
          <Construction className="w-8 h-8" />
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 mb-3">
          <Sparkles className="w-3 h-3" /> Bản thử nghiệm (DEMO)
        </span>

        <h3 className="text-lg sm:text-xl font-black text-stone-900 dark:text-stone-100 mb-2">
          {title}
        </h3>

        <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed mb-6">
          {featureName ? (
            <>
              Chuyên mục <strong className="text-indigo-600 dark:text-indigo-400">{featureName}</strong> hiện đang được biên tập dữ liệu và thẩm định chất lượng.
            </>
          ) : (
            'Nội dung và dữ liệu cho phần này đang trong quá trình biên tập và hoàn thiện.'
          )}
          <br className="hidden sm:inline" /> Tính năng sẽ chính thức ra mắt trong các phiên bản cập nhật tiếp theo!
        </p>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-extrabold text-sm shadow-md shadow-indigo-600/25 active:scale-[0.98] transition-all"
        >
          Đã hiểu, quay lại học N5 & N4
        </button>
      </div>
    </div>
  );
};
