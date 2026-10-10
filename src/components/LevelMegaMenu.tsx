import React from 'react';
import { 
  Book, 
  Sparkles, 
  Scroll, 
  BookOpen, 
  Type, 
  CheckSquare, 
  ArrowLeftRight, 
  ListChecks, 
  Shuffle, 
  PenLine, 
  FileText, 
  Headphones, 
  Trophy,
  ChevronRight,
  Construction
} from 'lucide-react';

export type LevelAction = 
  | 'vocab'
  | 'kanji'
  | 'grammar'
  | 'kanji_reading'
  | 'kanji_writing'
  | 'practice_vocab'
  | 'practice_synonym'
  | 'practice_grammar'
  | 'practice_sentence_star'
  | 'practice_cloze'
  | 'reading'
  | 'listening';

interface LevelMegaMenuProps {
  level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  onSelectAction: (level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1', action: LevelAction) => void;
  onShowDemoNotice?: (featureName: string) => void;
  onClose?: () => void;
}

export const LevelMegaMenu: React.FC<LevelMegaMenuProps> = ({
  level,
  onSelectAction,
  onShowDemoNotice,
  onClose,
}) => {
  const isLevelDemo = level === 'N3' || level === 'N2' || level === 'N1';

  const handleItemClick = (action: LevelAction, title: string, isItemDemo?: boolean) => {
    if (isLevelDemo || isItemDemo) {
      if (onShowDemoNotice) {
        onShowDemoNotice(`${title} (${level})`);
      }
      if (onClose) onClose();
      return;
    }

    onSelectAction(level, action);
    if (onClose) onClose();
  };

  const theoryItems = [
    {
      action: 'vocab' as LevelAction,
      title: 'Học từ vựng',
      desc: 'Từ vựng trọng tâm & ví dụ thực tế',
      icon: Book,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-100/80 dark:bg-blue-500/20',
      isDemo: isLevelDemo,
    },
    {
      action: 'kanji' as LevelAction,
      title: 'Học Kanji',
      desc: 'Hán tự, âm Hán-Việt & nét viết',
      icon: Sparkles,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-100/80 dark:bg-indigo-500/20',
      isDemo: isLevelDemo,
    },
    {
      action: 'grammar' as LevelAction,
      title: 'Học ngữ pháp',
      desc: 'Mẫu câu, liên kết & giải thích',
      icon: Scroll,
      color: 'text-sky-600 dark:text-sky-400',
      bg: 'bg-sky-100/80 dark:bg-sky-500/20',
      isDemo: isLevelDemo,
    },
  ];

  const practiceItems = [
    {
      action: 'kanji_reading' as LevelAction,
      title: 'Bài tập tìm cách đọc Kanji',
      desc: 'Kanji ➔ Hiragana',
      icon: BookOpen,
      isDemo: isLevelDemo,
    },
    {
      action: 'kanji_writing' as LevelAction,
      title: 'Bài tập tìm Kanji đúng',
      desc: 'Hiragana ➔ Kanji',
      icon: Type,
      isDemo: isLevelDemo,
    },
    {
      action: 'practice_vocab' as LevelAction,
      title: 'Bài tập trắc nghiệm từ vựng',
      desc: 'Chọn từ phù hợp với ngữ cảnh',
      icon: CheckSquare,
      isDemo: isLevelDemo,
    },
    {
      action: 'practice_synonym' as LevelAction,
      title: 'Bài tập tìm cách diễn đạt tương đương',
      desc: 'Từ đồng nghĩa & cách nói tương đương',
      icon: ArrowLeftRight,
      isDemo: true, // DEMO
    },
    {
      action: 'practice_grammar' as LevelAction,
      title: 'Bài tập trắc nghiệm ngữ pháp',
      desc: 'Chia thể, phó từ, trợ từ',
      icon: ListChecks,
      isDemo: isLevelDemo,
    },
    {
      action: 'practice_sentence_star' as LevelAction,
      title: 'Bài tập sắp xếp câu',
      desc: 'Dạng bài sao JLPT (★)',
      icon: Shuffle,
      isDemo: true, // DEMO
    },
    {
      action: 'practice_cloze' as LevelAction,
      title: 'Bài tập chọn từ điền vào đoạn văn',
      desc: 'Điền từ khuyết theo mạch văn',
      icon: PenLine,
      isDemo: true, // DEMO
    },
    {
      action: 'reading' as LevelAction,
      title: 'Bài tập đọc hiểu',
      desc: 'Luyện đọc đoạn văn ngắn & vừa',
      icon: FileText,
      isDemo: isLevelDemo,
    },
    {
      action: 'listening' as LevelAction,
      title: 'Bài tập luyện nghe',
      desc: 'Luyện nghe phản xạ & Shadowing',
      icon: Headphones,
      isDemo: isLevelDemo,
    },
  ];

  return (
    <div className="w-[660px] max-w-[94vw] bg-white dark:bg-[#111827] rounded-3xl shadow-2xl border border-stone-200/90 dark:border-stone-800/90 p-4 animate-in fade-in zoom-in-95 duration-150 text-left select-none ring-1 ring-black/5 dark:ring-white/10">
      
      {/* Header chỉ báo cấp độ */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-100 dark:border-stone-800/80 px-2">
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-black text-white shadow-xs ${
            isLevelDemo ? 'bg-amber-600' : 'bg-indigo-600'
          }`}>
            JLPT {level} {isLevelDemo && '(DEMO)'}
          </span>
          <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
            {isLevelDemo ? 'Nội dung đang trong quá trình biên tập' : 'Lộ trình học tập & luyện thi toàn diện'}
          </span>
        </div>
        {isLevelDemo && (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
            <Construction className="w-3 h-3" /> Đang hoàn thiện
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-start">
        
        {/* ===================== CỘT TRÁI: LÝ THUYẾT ===================== */}
        <div className="bg-blue-50/70 dark:bg-blue-950/20 rounded-2xl p-3 border border-blue-100/80 dark:border-blue-900/30 flex flex-col h-full">
          {/* Header Cột Trái */}
          <div className="flex items-center gap-2 px-1.5 pb-2.5 mb-1.5 border-b border-blue-100 dark:border-blue-900/40">
            <BookOpen className="w-4 h-4 text-blue-700 dark:text-blue-300 shrink-0" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-300">
              Lý thuyết
            </span>
          </div>

          {/* Danh sách mục Lý thuyết */}
          <div className="flex flex-col gap-1.5">
            {theoryItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.action}
                  type="button"
                  onClick={() => handleItemClick(item.action, item.title, item.isDemo)}
                  className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-left bg-white/60 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 hover:shadow-xs border border-transparent hover:border-blue-200/60 dark:hover:border-blue-800/40 transition-all duration-150"
                >
                  <span className={`w-8 h-8 rounded-xl ${item.bg} flex items-center justify-center shrink-0 transition-transform group-hover:scale-105`}>
                    <Icon className={`w-4 h-4 ${item.color}`} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[13.5px] font-bold text-stone-900 dark:text-stone-100 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                        {item.title}
                      </p>
                      {item.isDemo && (
                        <span className="text-[9.5px] font-extrabold px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          DEMO
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                      {item.desc}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-300 dark:text-stone-600 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              );
            })}
          </div>

          <div className="mt-auto pt-3 px-1 text-[11px] text-blue-900/60 dark:text-blue-300/60 leading-relaxed">
            💡 <strong>Mẹo:</strong> Nạp trước từ vựng và ngữ pháp để làm bài tập trắc nghiệm tự tin hơn.
          </div>
        </div>

        {/* ===================== CỘT PHẢI: BÀI TẬP LUYỆN THI JLPT ===================== */}
        <div className="bg-emerald-50/70 dark:bg-emerald-950/20 rounded-2xl p-3 border border-emerald-100/80 dark:border-emerald-900/30 flex flex-col">
          {/* Header Cột Phải */}
          <div className="flex items-center gap-2 px-1.5 pb-2.5 mb-1.5 border-b border-emerald-100 dark:border-emerald-900/40">
            <Trophy className="w-4 h-4 text-emerald-700 dark:text-emerald-300 shrink-0" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              Bài tập luyện thi JLPT
            </span>
          </div>

          {/* Danh sách 9 dạng bài tập JLPT */}
          <div className="flex flex-col gap-1 max-h-[380px] overflow-y-auto pr-0.5 custom-scrollbar">
            {practiceItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.action}
                  type="button"
                  onClick={() => handleItemClick(item.action, item.title, item.isDemo)}
                  className="group flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 hover:shadow-xs border border-transparent hover:border-emerald-200/60 dark:hover:border-emerald-800/40 transition-all duration-150"
                >
                  <span className="w-7 h-7 rounded-lg bg-emerald-100/80 dark:bg-emerald-500/20 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                    <Icon className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-300" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[12.5px] font-semibold text-stone-800 dark:text-stone-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 truncate transition-colors">
                        {item.title}
                      </p>
                      {item.isDemo && (
                        <span className="text-[9.5px] font-extrabold px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
                          DEMO
                        </span>
                      )}
                    </div>
                    <p className="text-[10.5px] text-stone-400 dark:text-stone-500 truncate">
                      {item.desc}
                    </p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-300 dark:text-stone-600 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
