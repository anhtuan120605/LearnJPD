import React from 'react';
import { Layers, Target, Zap, FileText, Headphones, Sparkles, Check } from 'lucide-react';

export type StudyMode = 'flashcard' | 'quiz' | 'cram' | 'translate' | 'shadowing';

interface StudyModeSelectorProps {
  currentMode: StudyMode;
  onSelectMode: (mode: StudyMode) => void;
  variant?: 'cards' | 'compact';
}

export const StudyModeSelector: React.FC<StudyModeSelectorProps> = ({
  currentMode,
  onSelectMode,
  variant = 'cards'
}) => {
  const modes = [
    { 
      key: 'flashcard' as StudyMode, 
      label: 'Flashcard 3D', 
      desc: 'Lật thẻ 3 chiều, nghe phát âm và ghi nhớ từ vựng',
      badge: 'Ghi nhớ',
      icon: Layers,
      color: 'indigo',
      activeBorder: 'border-indigo-500',
      activeBg: 'bg-indigo-50/70 dark:bg-indigo-950/30',
      activeText: 'text-indigo-600 dark:text-indigo-400',
      iconBg: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300'
    },
    { 
      key: 'quiz' as StudyMode, 
      label: 'Trắc nghiệm (Quiz)', 
      desc: 'Thử thách 4 đáp án Furigana / Ý nghĩa với phím tắt 1-4',
      badge: 'Đo lường',
      icon: Target,
      color: 'emerald',
      activeBorder: 'border-emerald-500',
      activeBg: 'bg-emerald-50/70 dark:bg-emerald-950/30',
      activeText: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300'
    },
    { 
      key: 'cram' as StudyMode, 
      label: 'Gõ nhồi nhét', 
      desc: 'Gõ Romaji sang Hiragana tự động lọc Telex, rèn phản xạ',
      badge: 'HOT • Phản xạ',
      icon: Zap,
      color: 'amber',
      activeBorder: 'border-amber-500',
      activeBg: 'bg-amber-50/70 dark:bg-amber-950/30',
      activeText: 'text-amber-600 dark:text-amber-400',
      iconBg: 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-300'
    },
    { 
      key: 'translate' as StudyMode, 
      label: 'Dịch câu (Puzzle)', 
      desc: 'Ghép các mảnh từ vựng thành câu hoàn chỉnh theo ngữ pháp',
      badge: 'Cấu trúc câu',
      icon: FileText,
      color: 'blue',
      activeBorder: 'border-blue-500',
      activeBg: 'bg-blue-50/70 dark:bg-blue-950/30',
      activeText: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300'
    },
    { 
      key: 'shadowing' as StudyMode, 
      label: 'Nghe đuổi (Shadowing)', 
      desc: 'Luyện tai nghe và nói đuổi theo giọng đọc bản xứ chuẩn',
      badge: 'Luyện phát âm',
      icon: Headphones,
      color: 'purple',
      activeBorder: 'border-purple-500',
      activeBg: 'bg-purple-50/70 dark:bg-purple-950/30',
      activeText: 'text-purple-600 dark:text-purple-400',
      iconBg: 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300'
    },
  ];

  // Dạng Compact: Lưới 5 cột tự co giãn vừa khít 100% bề ngang, không cuộn ngang
  if (variant === 'compact') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5 bg-slate-100 dark:bg-zinc-800/90 p-1.5 rounded-2xl w-full">
        {modes.map((m) => {
          const isSelected = currentMode === m.key;
          const Icon = m.icon;
          return (
            <button
              key={m.key}
              onClick={() => onSelectMode(m.key)}
              className={`flex items-center justify-center space-x-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition text-center ${
                isSelected
                  ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs ring-1 ring-slate-200 dark:ring-zinc-600'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? m.activeText : 'text-slate-400'}`} />
              <span className="truncate">{m.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Dạng Cards: 5 Thẻ Chế Độ Hiện Đại & Nổi Bật (Dùng trong Practice Hub)
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500 flex items-center space-x-1.5">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Chọn phương pháp luyện tập:</span>
        </label>
        <span className="text-xs text-slate-400">
          5 chế độ học thông minh
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {modes.map((m) => {
          const isSelected = currentMode === m.key;
          const Icon = m.icon;

          return (
            <button
              key={m.key}
              onClick={() => onSelectMode(m.key)}
              className={`p-4 rounded-3xl border-2 text-left transition-all duration-200 flex flex-col justify-between group relative active:scale-98 ${
                isSelected
                  ? `${m.activeBorder} ${m.activeBg} shadow-md shadow-${m.color}-500/10 ring-2 ring-${m.color}-500/20`
                  : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 shadow-xs'
              }`}
            >
              <div>
                {/* Header thẻ: Icon & Badge */}
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${m.iconBg}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    isSelected
                      ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-2xs font-extrabold'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400'
                  }`}>
                    {m.badge}
                  </span>
                </div>

                {/* Tiêu đề chế độ */}
                <h4 className={`text-sm font-black tracking-tight leading-snug ${
                  isSelected ? m.activeText : 'text-slate-900 dark:text-white'
                }`}>
                  {m.label}
                </h4>

                {/* Mô tả chức năng */}
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                  {m.desc}
                </p>
              </div>

              {/* Footer thẻ: Active indicator */}
              <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] font-bold">
                <span className={isSelected ? m.activeText : 'text-slate-400'}>
                  {isSelected ? 'Đang kích hoạt' : 'Bấm để chọn'}
                </span>
                {isSelected && (
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center bg-white dark:bg-zinc-800 shadow-2xs ${m.activeText}`}>
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
