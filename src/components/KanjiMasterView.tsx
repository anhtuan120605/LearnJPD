import React, { useState } from 'react';
import { KanjiItem, WordItem } from '../types';
import { Search, Volume2, Star, Sparkles, X, Map, LayoutGrid, PenTool, Layers, Brain, Gamepad2 } from 'lucide-react';
import { speakJapanese } from '../lib/audio';
import { KanjiRoadmapView } from './KanjiRoadmapView';
import { KanjiStrokeModal } from './KanjiStrokeModal';
import { KanjiFlashcardView } from './KanjiFlashcardView';
import { KanjiLearnView } from './KanjiLearnView';
import { KanjiMatchGameView } from './KanjiMatchGameView';

interface KanjiMasterViewProps {
  kanjiList: KanjiItem[];
  allVocabWords?: WordItem[];
  currentLevel: string;
  onSelectLevel: (lvl: string) => void;
  masteredKanji: string[];
  favoriteKanji: string[];
  onToggleMaster: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  streak?: number;
}

export type KanjiStudySubTab = 'roadmap' | 'flashcard' | 'learn' | 'match' | 'explorer';

export const KanjiMasterView: React.FC<KanjiMasterViewProps> = ({
  kanjiList,
  allVocabWords = [],
  currentLevel,
  onSelectLevel,
  masteredKanji,
  favoriteKanji,
  onToggleMaster,
  onToggleFavorite,
  streak = 0,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<KanjiStudySubTab>('roadmap');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKanji, setSelectedKanji] = useState<KanjiItem | null>(null);
  const [strokeKanji, setStrokeKanji] = useState<KanjiItem | null>(null);
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

  const masteredCount = kanjiList.filter(k => masteredKanji.includes(k.id)).length;
  const favoriteCount = kanjiList.filter(k => favoriteKanji.includes(k.id)).length;

  return (
    <div className="space-y-6">
      {/* Top Banner: Chọn Trình độ JLPT & Thống kê nhanh */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-rose-500" />
              <span>Chinh Phục Kanji Chuyên Sâu ({currentLevel})</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Đã thuộc <strong className="text-emerald-500">{masteredCount}</strong> / {kanjiList.length} chữ ({Math.round((masteredCount / Math.max(1, kanjiList.length)) * 100)}%) • Yêu thích <strong className="text-amber-500">{favoriteCount}</strong> chữ
            </p>
          </div>

          {/* Cấp độ JLPT N5 -> N1 */}
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-zinc-800 p-1.5 rounded-2xl shrink-0">
            {['N5', 'N4', 'N3', 'N2', 'N1'].map((lvl) => {
              const isDemo = ['N3', 'N2', 'N1'].includes(lvl);
              const isSelected = currentLevel === lvl;
              return (
                <button
                  key={lvl}
                  onClick={() => onSelectLevel(lvl)}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                    isSelected
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                      : 'text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>{lvl}</span>
                  {isDemo && (
                    <span className={`text-[9px] font-black uppercase px-1 py-0.2 rounded-sm ${
                      isSelected ? 'bg-amber-400 text-slate-900' : 'bg-amber-500 text-white'
                    }`}>
                      Demo
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Thông báo Demo nếu đang chọn N3, N2, N1 */}
        {['N3', 'N2', 'N1'].includes(currentLevel) && (
          <div className="mt-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-xl px-3.5 py-2 text-xs text-amber-800 dark:text-amber-300 flex items-center space-x-2">
            <span className="px-1.5 py-0.5 rounded bg-amber-500 text-white font-black text-[9px] uppercase tracking-wider shrink-0">
              DEMO
            </span>
            <span>
              Cấp độ Kanji <strong>{currentLevel}</strong> hiện đang ở phiên bản <strong>Demo (Thử nghiệm)</strong>. Dữ liệu chữ Hán, số nét, âm đọc và ví dụ đang tiếp tục được cập nhật.
            </span>
          </div>
        )}
      </div>

      {/* Chuyển đổi chế độ học tập đa dạng (Tương tự Từ vựng Quizlet Plus) */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-2 rounded-2xl shadow-sm overflow-x-auto">
        <div className="flex items-center space-x-1.5 min-w-max">
          <button
            onClick={() => setActiveSubTab('roadmap')}
            className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center space-x-2 ${
              activeSubTab === 'roadmap'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Map className="w-4 h-4" />
            <span>Lộ trình (10 chữ/ngày)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('flashcard')}
            className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center space-x-2 ${
              activeSubTab === 'flashcard'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                : 'text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Flashcard 3D</span>
          </button>

          <button
            onClick={() => setActiveSubTab('learn')}
            className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center space-x-2 ${
              activeSubTab === 'learn'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                : 'text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>Học thông minh (Learn)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('match')}
            className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center space-x-2 ${
              activeSubTab === 'match'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Ghép thẻ Match</span>
          </button>

          <button
            onClick={() => setActiveSubTab('explorer')}
            className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center space-x-2 ${
              activeSubTab === 'explorer'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-500/20'
                : 'text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Tra cứu từ điển ({kanjiList.length})</span>
          </button>
        </div>
      </div>

      {/* NỘI DUNG TỪNG PHÂN HỆ */}
      {activeSubTab === 'roadmap' && (
        <KanjiRoadmapView
          kanjiList={kanjiList}
          allVocabWords={allVocabWords}
          currentLevel={currentLevel}
          onSelectLevel={onSelectLevel}
          masteredKanji={masteredKanji}
          favoriteKanji={favoriteKanji}
          onToggleMaster={onToggleMaster}
          onToggleFavorite={onToggleFavorite}
          streak={streak}
        />
      )}

      {activeSubTab === 'flashcard' && (
        <KanjiFlashcardView
          kanjiList={kanjiList}
          masteredKanji={masteredKanji}
          favoriteKanji={favoriteKanji}
          onToggleMaster={onToggleMaster}
          onToggleFavorite={onToggleFavorite}
        />
      )}

      {activeSubTab === 'learn' && (
        <KanjiLearnView
          kanjiList={kanjiList}
          masteredKanji={masteredKanji}
          favoriteKanji={favoriteKanji}
          onAddMastered={onToggleMaster}
          onToggleFavorite={onToggleFavorite}
        />
      )}

      {activeSubTab === 'match' && (
        <KanjiMatchGameView
          kanjiList={kanjiList}
          favoriteKanji={favoriteKanji}
          currentLevel={currentLevel}
          onToggleFavorite={onToggleFavorite}
        />
      )}

      {activeSubTab === 'explorer' && (
        <div className="space-y-6">
          {/* Search & Filter Bar */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm Kanji, Hán Việt, On, Kun, nghĩa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700/60 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
            </div>

            <div className="flex items-center space-x-2 text-xs font-semibold">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  filterType === 'all'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Tất cả ({kanjiList.length})
              </button>
              <button
                onClick={() => setFilterType('unlearned')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  filterType === 'unlearned'
                    ? 'bg-rose-500 text-white font-bold'
                    : 'text-slate-500 hover:text-rose-500'
                }`}
              >
                Chưa thuộc ({kanjiList.length - masteredCount})
              </button>
              <button
                onClick={() => setFilterType('mastered')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  filterType === 'mastered'
                    ? 'bg-emerald-500 text-white font-bold'
                    : 'text-slate-500 hover:text-emerald-500'
                }`}
              >
                Đã thuộc ({masteredCount})
              </button>
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
              {/* Nút nét viết nhỏ góc trên trái */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setStrokeKanji(k);
                }}
                title="Xem nét viết & Tập viết"
                className="absolute top-2.5 left-2.5 p-1 text-slate-300 group-hover:text-blue-500 hover:!text-blue-600 transition"
              >
                <PenTool className="w-3.5 h-3.5" />
              </button>

              {/* Nút yêu thích nhỏ góc trên phải */}
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

            {/* Footer Modal: Audio + Stroke Modal + Master Button */}
            <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => speakJapanese(selectedKanji.kunyomi[0] || selectedKanji.onyomi[0] || selectedKanji.kanji)}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-200 text-xs font-bold transition"
                >
                  <Volume2 className="w-3.5 h-3.5 text-rose-500" />
                  <span>Phát âm</span>
                </button>

                <button
                  onClick={() => setStrokeKanji(selectedKanji)}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-sky-300 text-xs font-bold transition border border-blue-200/60 dark:border-blue-800/40"
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>Nét viết & Tập vẽ</span>
                </button>
              </div>

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
      )}

      {/* Modal Nét viết & Tập viết Kanji */}
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

