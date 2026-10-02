import React from 'react';
import { 
  Layers, 
  Brain, 
  FileCheck2, 
  Gamepad2, 
  Target, 
  Zap, 
  FileText, 
  Headphones, 
  Sparkles, 
  Check 
} from 'lucide-react';
import { StudyMode } from '../types';

export type { StudyMode };

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
      desc: 'Lật thẻ 3 chiều, phím tắt Quizlet, tự động phát âm & lọc từ sao',
      badge: 'Ghi nhớ',
      icon: Layers,
      color: 'indigo',
      activeBorder: 'border-indigo-500',
      activeBg: 'bg-indigo-50/70 dark:bg-indigo-950/30',
      activeText: 'text-indigo-600 dark:text-indigo-400',
      iconBg: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300'
    },
    { 
      key: 'learn' as StudyMode, 
      label: 'Chế độ Học (Learn)', 
      desc: 'Chuẩn Quizlet Learn: 3 tầng thích ứng (Chưa học ➔ Quen ➔ Thuộc)',
      badge: 'QUIZLET PLUS',
      icon: Brain,
      color: 'rose',
      activeBorder: 'border-rose-500',
      activeBg: 'bg-rose-50/70 dark:bg-rose-950/30',
      activeText: 'text-rose-600 dark:text-rose-400',
      iconBg: 'bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-300'
    },
    { 
      key: 'test' as StudyMode, 
      label: 'Kiểm tra (Test)', 
      desc: 'Thi thử tùy biến số câu, Trắc nghiệm, Đúng/Sai, Viết & Trả điểm A-F',
      badge: 'MỚI • Thi thử',
      icon: FileCheck2,
      color: 'emerald',
      activeBorder: 'border-emerald-500',
      activeBg: 'bg-emerald-50/70 dark:bg-emerald-950/30',
      activeText: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300'
    },
    { 
      key: 'match' as StudyMode, 
      label: 'Ghép thẻ (Match)', 
      desc: 'Game đua thời gian bấm giờ mili-giây, triệt tiêu thẻ và lập kỷ lục',
      badge: 'HOT • Game',
      icon: Gamepad2,
      color: 'amber',
      activeBorder: 'border-amber-500',
      activeBg: 'bg-amber-50/70 dark:bg-amber-950/30',
      activeText: 'text-amber-600 dark:text-amber-400',
      iconBg: 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-300'
    },
    { 
      key: 'quiz' as StudyMode, 
      label: 'Trắc nghiệm nhanh', 
      desc: 'Thử thách 4 đáp án Furigana / Ý nghĩa với hàng đợi lặp câu sai',
      badge: 'Đo lường',
      icon: Target,
      color: 'blue',
      activeBorder: 'border-blue-500',
      activeBg: 'bg-blue-50/70 dark:bg-blue-950/30',
      activeText: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300'
    },
    { 
      key: 'cram' as StudyMode, 
      label: 'Gõ nhồi nhét', 
      desc: 'Gõ Romaji sang Hiragana tự động lọc Telex, rèn phản xạ bàn phím',
      badge: 'Phản xạ',
      icon: Zap,
      color: 'orange',
      activeBorder: 'border-orange-500',
      activeBg: 'bg-orange-50/70 dark:bg-orange-950/30',
      activeText: 'text-orange-600 dark:text-orange-400',
      iconBg: 'bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-300'
    },
    { 
      key: 'translate' as StudyMode, 
      label: 'Dịch câu (Puzzle)', 
      desc: 'Ghép các mảnh từ vựng thành câu hoàn chỉnh theo ngữ pháp Minna',
      badge: 'Cấu trúc câu',
      icon: FileText,
      color: 'cyan',
      activeBorder: 'border-cyan-500',
      activeBg: 'bg-cyan-50/70 dark:bg-cyan-950/30',
      activeText: 'text-cyan-600 dark:text-cyan-400',
      iconBg: 'bg-cyan-100 dark:bg-cyan-900/50 text-cyan-600 dark:text-cyan-300'
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

  // Dạng Compact: Thanh nút chọn chế độ linh hoạt, cuộn ngang mượt mà trên mobile
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-800/90 p-1.5 rounded-2xl w-full overflow-x-auto scrollbar-none">
        {modes.map((m) => {
          const isSelected = currentMode === m.key;
          const Icon = m.icon;
          return (
            <button
              key={m.key}
              onClick={() => onSelectMode(m.key)}
              className={`flex items-center space-x-1.5 py-2 px-3 rounded-xl text-xs font-bold transition shrink-0 ${
                isSelected
                  ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs ring-1 ring-slate-200 dark:ring-zinc-600'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? m.activeText : 'text-slate-400'}`} />
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Dạng Lưới Thẻ lớn (Cards)
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
      {modes.map((m) => {
        const isSelected = currentMode === m.key;
        const Icon = m.icon;
        return (
          <div
            key={m.key}
            onClick={() => onSelectMode(m.key)}
            className={`cursor-pointer rounded-2xl border-2 p-4 transition-all duration-200 relative overflow-hidden group flex flex-col justify-between ${
              isSelected
                ? `${m.activeBorder} ${m.activeBg} shadow-sm ring-2 ring-indigo-500/20`
                : 'border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-slate-50/50 dark:hover:bg-zinc-800/30'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${m.iconBg} transition-transform group-hover:scale-105`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-slate-400'
                  }`}>
                    {m.badge}
                  </span>
                  {isSelected && (
                    <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </div>
              </div>

              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                {m.label}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {m.desc}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
