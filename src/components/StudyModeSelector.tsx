import React from 'react';
import { Layers, Target, Zap, FileText, Headphones } from 'lucide-react';

export type StudyMode = 'flashcard' | 'quiz' | 'cram' | 'translate' | 'shadowing';

interface StudyModeSelectorProps {
  currentMode: StudyMode;
  onSelectMode: (mode: StudyMode) => void;
}

export const StudyModeSelector: React.FC<StudyModeSelectorProps> = ({
  currentMode,
  onSelectMode,
}) => {
  const modes = [
    { key: 'flashcard' as StudyMode, label: 'Flashcard', icon: Layers },
    { key: 'quiz' as StudyMode, label: 'Trắc nghiệm', icon: Target },
    { key: 'cram' as StudyMode, label: 'Nhồi nhét', icon: Zap, badge: true },
    { key: 'translate' as StudyMode, label: 'Dịch câu', icon: FileText },
    { key: 'shadowing' as StudyMode, label: 'Nghe đuổi', icon: Headphones },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
        Chọn chế độ học
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {modes.map((m) => {
          const isSelected = currentMode === m.key;
          const Icon = m.icon;

          return (
            <div key={m.key} className="relative">
              {/* Badge tròn nhỏ màu xanh dương ở góc trên bên trái khi active */}
              {isSelected && (
                <div className="absolute -top-2 left-3 z-10 w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                </div>
              )}

              <button
                onClick={() => onSelectMode(m.key)}
                className={`w-full py-4 px-3 rounded-2xl flex flex-col items-center justify-center space-y-2 border transition-all ${
                  isSelected
                    ? 'bg-blue-500/5 dark:bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-blue-500'
                    : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:border-slate-300 dark:hover:border-zinc-700 shadow-xs'
                }`}
              >
                <Icon className={`w-6 h-6 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                <span className="text-sm font-bold tracking-tight">
                  {m.label}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
