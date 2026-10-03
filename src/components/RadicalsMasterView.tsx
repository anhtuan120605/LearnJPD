import React, { useState, useMemo } from 'react';
import { RadicalItem, KanjiItem } from '../types';
import { RADICALS_214 } from '../data/radicals214';
import { 
  Search, 
  Layers, 
  Sparkles, 
  X, 
  BookOpen, 
  ChevronRight, 
  Flame, 
  Star, 
  CheckCircle2, 
  ArrowRight,
  Filter
} from 'lucide-react';

interface RadicalsMasterViewProps {
  allKanjiList: KanjiItem[];
  onSelectKanji: (kanji: KanjiItem) => void;
  masteredKanji?: string[];
  favoriteKanji?: string[];
}

export const RadicalsMasterView: React.FC<RadicalsMasterViewProps> = ({
  allKanjiList,
  onSelectKanji,
  masteredKanji = [],
  favoriteKanji = [],
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStrokeFilter, setSelectedStrokeFilter] = useState<number | 'all' | 'top'>('all');
  const [activeRadical, setActiveRadical] = useState<RadicalItem | null>(null);

  // Lập bản đồ liên kết: mỗi bộ thủ có bao nhiêu chữ Hán trong kho dữ liệu LearnJPD
  const radicalKanjiMap = useMemo(() => {
    const map = new Map<string, KanjiItem[]>();

    for (const k of allKanjiList) {
      if (!k.radical) continue;
      // Trích xuất glyph của bộ thủ: vd 'nhất 一 (+0 nét)' -> '一'
      const m = k.radical.match(/^([\w\s\u00C0-\u1EF9]+?)\s+([^\s\(\)]+)/);
      if (m) {
        const glyph = m[2];
        const list = map.get(glyph) || [];
        list.push(k);
        map.set(glyph, list);
      }
    }

    return map;
  }, [allKanjiList]);

  // Danh sách các bộ thủ có nhiều chữ Hán nhất (Top thông dụng)
  const topRadicals = useMemo(() => {
    return [...RADICALS_214]
      .sort((a, b) => {
        const countA = (radicalKanjiMap.get(a.glyph) || []).length;
        const countB = (radicalKanjiMap.get(b.glyph) || []).length;
        return countB - countA;
      })
      .slice(0, 30);
  }, [radicalKanjiMap]);

  // Bộ lọc tìm kiếm
  const filteredRadicals = useMemo(() => {
    let list = RADICALS_214;

    if (selectedStrokeFilter === 'top') {
      list = topRadicals;
    } else if (typeof selectedStrokeFilter === 'number') {
      list = list.filter(r => r.strokes === selectedStrokeFilter);
    }

    if (!searchTerm.trim()) return list;

    const term = searchTerm.toLowerCase().trim();
    return list.filter(r => {
      const matchGlyph = r.glyph.includes(term) || (r.variants && r.variants.some(v => v.includes(term)));
      const matchHanviet = r.hanviet.toLowerCase().includes(term);
      const matchMeaning = r.meaning.toLowerCase().includes(term);
      const matchJa = r.jaName && r.jaName.toLowerCase().includes(term);
      return matchGlyph || matchHanviet || matchMeaning || matchJa;
    });
  }, [searchTerm, selectedStrokeFilter, topRadicals]);

  // Phân nhóm theo số nét để hiển thị giống XieHanzi
  const groupedByStrokes = useMemo(() => {
    const groups: Record<number, RadicalItem[]> = {};
    for (const r of filteredRadicals) {
      if (!groups[r.strokes]) groups[r.strokes] = [];
      groups[r.strokes].push(r);
    }
    return groups;
  }, [filteredRadicals]);

  // Danh sách Kanji của bộ thủ đang chọn
  const activeRadicalKanjiList = useMemo(() => {
    if (!activeRadical) return [];
    const directList = radicalKanjiMap.get(activeRadical.glyph) || [];
    
    // Tìm thêm theo các biến thể nếu có
    const variantLists = (activeRadical.variants || []).flatMap(v => radicalKanjiMap.get(v) || []);
    
    // Gộp và loại trùng lặp
    const combined = [...directList, ...variantLists];
    const seen = new Set<string>();
    return combined.filter(k => {
      if (seen.has(k.id)) return false;
      seen.add(k.id);
      return true;
    });
  }, [activeRadical, radicalKanjiMap]);

  // Thống kê số nét có sẵn
  const strokeCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    for (const r of RADICALS_214) {
      counts[r.strokes] = (counts[r.strokes] || 0) + 1;
    }
    return counts;
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Banner: 214 Bộ Thủ Khang Hy */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-[#111c30] text-white p-6 sm:p-8 rounded-3xl border border-indigo-500/25 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 relative">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="p-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                <Layers className="w-5 h-5" />
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-indigo-300">
                Gốc Rễ Chữ Hán
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              214 Bộ Thủ Chữ Hán (Khang Hy)
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Hiểu bản chất gốc rễ của mọi chữ Hán. Khám phá tên Hán-Việt, ý nghĩa cấu thành và tra cứu toàn bộ Kanji JLPT N5–N1 phái sinh từ mỗi bộ thủ.
            </p>
          </div>

          {/* Huy hiệu tổng số */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
              <span className="text-2xl font-black text-white block">214</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Bộ thủ</span>
            </div>
            <div className="px-4 py-3 rounded-2xl bg-indigo-500/20 backdrop-blur-md border border-indigo-400/30 text-center">
              <span className="text-2xl font-black text-indigo-300 block">{allKanjiList.length}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">Kanji liên kết</span>
            </div>
          </div>
        </div>
      </div>

      {/* Thanh Tìm Kiếm & Bộ Lọc Nhanh */}
      <div className="bg-white dark:bg-[#111c30] p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Ô tìm kiếm */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm bộ thủ theo chữ (氵, 心), Hán-Việt (thủy), nghĩa (nước)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-blue-500/30 text-slate-800 dark:text-slate-200"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Phân loại nhanh */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSelectedStrokeFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedStrokeFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Tất cả (214)
            </button>
            <button
              onClick={() => setSelectedStrokeFilter('top')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                selectedStrokeFilter === 'top'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Hay gặp nhất (Top 30)</span>
            </button>
          </div>
        </div>

        {/* Thanh lọc theo số nét (1 nét -> 17 nét) giống XieHanzi */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 pt-1 scrollbar-thin">
          <span className="text-[11px] font-bold text-slate-400 shrink-0 px-1">Lọc theo số nét:</span>
          {Array.from({ length: 17 }, (_, i) => i + 1).map((strokes) => {
            const isSelected = selectedStrokeFilter === strokes;
            return (
              <button
                key={strokes}
                onClick={() => setSelectedStrokeFilter(isSelected ? 'all' : strokes)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition shrink-0 flex items-center space-x-1 ${
                  isSelected
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <span>{strokes} nét</span>
                <span className="text-[10px] opacity-75 font-mono">({strokeCounts[strokes] || 0})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* LƯỚI DANH SÁCH BỘ THỦ */}
      {selectedStrokeFilter !== 'all' && selectedStrokeFilter !== 'top' ? (
        /* Xem trực tiếp 1 nhóm nét cụ thể */
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {filteredRadicals.map((rad) => {
              const count = (radicalKanjiMap.get(rad.glyph) || []).length;
              return (
                <RadicalCard
                  key={rad.id}
                  radical={rad}
                  kanjiCount={count}
                  onClick={() => setActiveRadical(rad)}
                />
              );
            })}
          </div>
        </div>
      ) : (
        /* Xem phân nhóm đầy đủ theo số nét (Giống giao diện XieHanzi) */
        <div className="space-y-8">
          {Object.entries(groupedByStrokes).map(([strokeStr, radicals]) => {
            const strokes = Number(strokeStr);
            return (
              <div key={strokes} className="space-y-3">
                <div className="flex items-center space-x-2 border-b border-slate-200/80 dark:border-slate-800 pb-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 dark:text-sky-400 text-xs font-black flex items-center justify-center">
                    {strokes}
                  </span>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    {strokes} Nét
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    ({radicals.length} bộ thủ)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {radicals.map((rad) => {
                    const count = (radicalKanjiMap.get(rad.glyph) || []).length;
                    return (
                      <RadicalCard
                        key={rad.id}
                        radical={rad}
                        kanjiCount={count}
                        onClick={() => setActiveRadical(rad)}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL / DRAWER XEM CHI TIẾT BỘ THỦ VÀ DANH SÁCH KANJI LIÊN KẾT */}
      {activeRadical && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#111c30] rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-scale-up">
            {/* Header Modal */}
            <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-3xl font-black font-jp shadow-lg shadow-blue-500/25">
                  {activeRadical.glyph}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-400">Bộ thủ #{activeRadical.id}</span>
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-sky-400">
                      {activeRadical.strokes} nét
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase">
                    Bộ {activeRadical.hanviet}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5">
                    {activeRadical.meaning}
                  </p>
                  {activeRadical.variants && activeRadical.variants.length > 0 && (
                    <div className="flex items-center space-x-1.5 mt-2">
                      <span className="text-[11px] text-slate-400">Biến thể:</span>
                      {activeRadical.variants.map((v, i) => (
                        <span key={i} className="text-xs font-bold font-jp px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                          {v}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => setActiveRadical(null)}
                className="p-2 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Thân Modal: Danh sách Kanji trong kho dữ liệu chứa bộ thủ này */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-blue-600 dark:text-sky-400" />
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Các Chữ Hán Chứa Bộ Này ({activeRadicalKanjiList.length} chữ)
                  </h3>
                </div>
                <span className="text-xs text-slate-400">
                  Bấm vào chữ để xem cách viết & phân tích nét
                </span>
              </div>

              {activeRadicalKanjiList.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <Layers className="w-10 h-10 mx-auto opacity-30" />
                  <p className="text-xs sm:text-sm">
                    Hiện chưa có chữ Hán nào trong cấp độ N5–N1 thuộc bộ thủ này trong cơ sở dữ liệu bài học.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {activeRadicalKanjiList.map((k) => {
                    const isMastered = masteredKanji.includes(k.id);
                    const isFav = favoriteKanji.includes(k.id);
                    return (
                      <div
                        key={k.id}
                        onClick={() => {
                          onSelectKanji(k);
                          setActiveRadical(null);
                        }}
                        className="bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 hover:border-blue-400 hover:shadow-md transition cursor-pointer group flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-sky-400">
                              {k.jlpt}
                            </span>
                            <div className="flex items-center space-x-1">
                              {isMastered && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                              {isFav && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                            </div>
                          </div>

                          <div className="text-center my-1">
                            <span className="text-3xl font-black font-jp text-slate-900 dark:text-white group-hover:scale-110 group-hover:text-blue-600 dark:group-hover:text-sky-400 transition inline-block">
                              {k.kanji}
                            </span>
                            <p className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 mt-1">
                              {k.hanviet}
                            </p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/50 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 text-center">
                          {k.meanings_vi?.[0] || ''}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer Modal */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-end">
              <button
                onClick={() => setActiveRadical(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Component con hiển thị thẻ bộ thủ nhỏ gọn
const RadicalCard: React.FC<{
  radical: RadicalItem;
  kanjiCount: number;
  onClick: () => void;
}> = ({ radical, kanjiCount, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-[#111c30] hover:bg-slate-50 dark:hover:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500/50 shadow-xs hover:shadow-md transition cursor-pointer group flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-mono text-slate-400">#{radical.id}</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            kanjiCount > 0
              ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-sky-400'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
          }`}>
            {kanjiCount} chữ
          </span>
        </div>

        <div className="text-center my-2">
          <span className="text-3xl font-black font-jp text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-sky-400 transition inline-block">
            {radical.glyph}
          </span>
          <h4 className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 mt-1">
            {radical.hanviet}
          </h4>
        </div>
      </div>

      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 text-center pt-1 border-t border-slate-100 dark:border-slate-800/80">
        {radical.meaning}
      </p>
    </div>
  );
};
