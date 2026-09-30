import React, { useState } from 'react';
import { KanjiItem } from '../types';
import { Search, Volume2, Star, CheckCircle, Info, Sparkles, X } from 'lucide-react';
import { speakJapanese } from '../lib/audio';

interface KanjiMasterViewProps {
  kanjiList: KanjiItem[];
  currentLevel: string;
  onSelectLevel: (lvl: string) => void;
  masteredKanji: string[];
  favoriteKanji: string[];
  onToggleMaster: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export const KanjiMasterView: React.FC<KanjiMasterViewProps> = ({
  kanjiList,
  currentLevel,
  onSelectLevel,
  masteredKanji,
  favoriteKanji,
  onToggleMaster,
  onToggleFavorite
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKanji, setSelectedKanji] = useState<KanjiItem | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'unlearned' | 'mastered'>('all');

  const filtered = kanjiList.filter(k => {
    const term = searchTerm.toLowerCase().trim();
    const matchTerm = !term ||
      k.kanji.includes(term) ||
      k.hanviet.toLowerCase().includes(term) ||
      k.onyomi.some(o => o.includes(term)) ||
      k.kunyomi.some(ku => ku.includes(term)) ||
      k.meanings_vi.some(m => m.toLowerCase().includes(term));

    if (!matchTerm) return false;
    if (filterType === 'mastered') return masteredKanji.includes(k.id);
    if (filterType === 'unlearned') return !masteredKanji.includes(k.id);
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Level Selector N5 -> N1 & Stats */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-rose-500" />
              <span>Chinh Phục Kanji Chuyên Sâu ({currentLevel})</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Đầy đủ Âm Hán Việt, Onyomi, Kunyomi, Số nét và Nghĩa chi tiết
            </p>
          </div>

          {/* Level Tabs */}
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-zinc-800 p-1.5 rounded-2xl">
            {['N5', 'N4', 'N3', 'N2', 'N1'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => onSelectLevel(lvl)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  currentLevel === lvl
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                    : 'text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Search & Filter */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-zinc-800">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm Kanji, Hán Việt, On, Kun..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700/60 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />
          </div>

          <div className="flex items-center space-x-2 text-xs font-semibold">
            <span className="text-slate-400">
              Đã thuộc: <strong className="text-emerald-500">{kanjiList.filter(k => masteredKanji.includes(k.id)).length}</strong> / {kanjiList.length}
            </span>
          </div>
        </div>
      </div>

      {/* Grid thẻ Kanji */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
        {filtered.map((k) => {
          const isMastered = masteredKanji.includes(k.id);
          const isFavorite = favoriteKanji.includes(k.id);

          return (
            <div
              key={k.id}
              onClick={() => setSelectedKanji(k)}
              className={`group relative p-4 rounded-3xl bg-white dark:bg-zinc-900 border transition-all cursor-pointer hover:shadow-lg hover:-translate-y-1 ${
                isMastered 
                  ? 'border-emerald-300/80 dark:border-emerald-900/60 bg-emerald-500/[0.02]' 
                  : 'border-slate-200 dark:border-zinc-800 hover:border-rose-400'
              }`}
            >
              {/* Nút yêu thích nhỏ góc trên */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(k.id);
                }}
                className="absolute top-2.5 right-2.5 p-1 text-slate-300 group-hover:text-slate-400 hover:!text-amber-500 transition"
              >
                <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current text-amber-500' : ''}`} />
              </button>

              {/* Chữ Kanji */}
              <div className="text-center pt-2">
                <span className="text-4xl font-jp font-bold text-slate-900 dark:text-white block group-hover:text-rose-500 transition-colors">
                  {k.kanji}
                </span>

                {/* Âm Hán Việt */}
                <h4 className="mt-2 text-xs font-extrabold tracking-wider text-rose-600 dark:text-rose-400 uppercase truncate">
                  {k.hanviet || '---'}
                </h4>

                {/* Số nét & Radical */}
                <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1 font-mono">
                  {k.strokes} nét
                </p>
              </div>

              {/* Trạng thái đã thuộc */}
              {isMastered && (
                <div className="mt-2 text-center">
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                    Đã thuộc ✓
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal chi tiết Kanji khi click vào */}
      {selectedKanji && (
        <div 
          onClick={() => setSelectedKanji(null)}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-8 space-y-6"
          >
            {/* Header Modal */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 flex items-center justify-center">
                  <span className="text-5xl font-jp font-bold text-rose-600 dark:text-rose-400">
                    {selectedKanji.kanji}
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-wide text-slate-900 dark:text-white uppercase">
                    {selectedKanji.hanviet}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs px-2 py-0.5 bg-rose-100 dark:bg-rose-950/60 text-rose-600 font-bold rounded">
                      {selectedKanji.jlpt}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {selectedKanji.strokes} nét viết
                    </span>
                    {selectedKanji.radical && (
                      <span className="text-xs text-slate-500 font-medium">
                        Bộ: {selectedKanji.radical}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedKanji(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Âm On & Kun */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-zinc-800/60 p-4 rounded-2xl">
              <div>
                <span className="text-[11px] font-bold uppercase text-slate-400 dark:text-zinc-500 block mb-1">
                  Âm Onyomi (Âm Hán)
                </span>
                <p className="text-sm font-jp font-semibold text-slate-800 dark:text-zinc-200">
                  {selectedKanji.onyomi.join(', ') || '---'}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase text-slate-400 dark:text-zinc-500 block mb-1">
                  Âm Kunyomi (Thuần Nhật)
                </span>
                <p className="text-sm font-jp font-semibold text-slate-800 dark:text-zinc-200">
                  {selectedKanji.kunyomi.join(', ') || '---'}
                </p>
              </div>
            </div>

            {/* Giải nghĩa chi tiết */}
            <div>
              <span className="text-xs font-bold uppercase text-slate-400 block mb-2">
                Ý nghĩa tiếng Việt:
              </span>
              <ul className="space-y-1.5 text-sm text-slate-700 dark:text-zinc-300">
                {selectedKanji.meanings_vi.map((m, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-rose-500 font-bold">•</span>
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer Modal: Audio + Master Button */}
            <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <button
                onClick={() => speakJapanese(selectedKanji.kunyomi[0] || selectedKanji.onyomi[0] || selectedKanji.kanji)}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-200 text-xs font-bold transition"
              >
                <Volume2 className="w-4 h-4 text-rose-500" />
                <span>Phát âm mẫu</span>
              </button>

              <button
                onClick={() => {
                  onToggleMaster(selectedKanji.id);
                  setSelectedKanji(null);
                }}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition ${
                  masteredKanji.includes(selectedKanji.id)
                    ? 'bg-emerald-500 text-white'
                    : 'bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/20'
                }`}
              >
                {masteredKanji.includes(selectedKanji.id) ? '✓ Đã thuộc chữ này' : 'Đánh dấu đã thuộc'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
