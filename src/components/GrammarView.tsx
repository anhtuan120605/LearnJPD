import React, { useState } from 'react';
import { GrammarLesson, GrammarPoint } from '../types';
import { 
  Volume2, 
  BookOpen, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Info, 
  MessageSquare, 
  Compass, 
  CheckCircle2, 
  Globe2 
} from 'lucide-react';
import { speakJapanese } from '../lib/audio';
import { GrammarBookEmbedView } from './GrammarBookEmbedView';

interface GrammarViewProps {
  lesson: GrammarLesson | undefined;
  lessonNum: number;
}

export const GrammarView: React.FC<GrammarViewProps> = ({ lesson, lessonNum }) => {
  // Chế độ hiển thị: 'interactive' (Bản số hóa tương tác) | 'book' (Sách gốc PDF) | 'split' (Song song hai bên)
  const [displayMode, setDisplayMode] = useState<'interactive' | 'book' | 'split'>('interactive');

  // Tab nội bộ của bài học ngữ pháp theo đúng sách:
  // 'kaisetsu' (IV. Giải thích ngữ pháp) | 'bunkei_reibun' (II. Mẫu câu & Ví dụ) | 'kaiwa' (II. Hội thoại) | 'reference' (III. Tham khảo)
  const [activeSection, setActiveSection] = useState<'kaisetsu' | 'bunkei_reibun' | 'kaiwa' | 'reference'>('kaisetsu');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  if (!lesson) {
    return (
      <div className="space-y-4">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 text-center shadow-sm">
          <BookOpen className="w-10 h-10 text-blue-500 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white">
            Đang hiển thị sách gốc PDF cho Bài {lessonNum}
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Bản số hóa tương tác cho bài này đang được cập nhật. Bạn có thể xem và đọc trực tiếp sách gốc bên dưới:
          </p>
        </div>
        <GrammarBookEmbedView lessonNum={lessonNum} />
      </div>
    );
  }

  const filteredPoints = (lesson.points || []).filter(p => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      p.structure.toLowerCase().includes(term) ||
      p.meaning.toLowerCase().includes(term) ||
      p.explanation.toLowerCase().includes(term) ||
      (p.subPoints && p.subPoints.some(sp => sp.title.toLowerCase().includes(term) || sp.explanation.toLowerCase().includes(term)))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Giới thiệu Ngữ pháp bài học */}
      <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/20 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        {/* Bộ chuyển đổi chế độ xem: [ ✨ Bản số hóa (Audio) ] | [ 📖 Nhúng sách gốc (PDF) ] | [ ⚡ Chia đôi ] */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-white/80 dark:bg-zinc-800/80 rounded-2xl border border-indigo-100 dark:border-zinc-700/60 shadow-2xs">
          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 px-2 hidden sm:inline">Chế độ xem:</span>
            <button
              type="button"
              onClick={() => setDisplayMode('interactive')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                displayMode === 'interactive'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/25'
                  : 'text-slate-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Bản số hóa (Audio)</span>
            </button>

            <button
              type="button"
              onClick={() => setDisplayMode('book')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                displayMode === 'book'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                  : 'text-slate-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Nhúng sách gốc (PDF)</span>
            </button>

            <button
              type="button"
              onClick={() => setDisplayMode('split')}
              className={`hidden lg:flex px-3 py-1.5 rounded-xl text-xs font-bold transition items-center space-x-1.5 ${
                displayMode === 'split'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/25'
                  : 'text-slate-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700'
              }`}
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span>Chia đôi màn hình</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium px-2">
            Trang sách Bài {lessonNum}: <strong>Trang {33 + (lessonNum - 1) * 6}</strong>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                Minna no Nihongo • {lesson.level}
              </span>
              <span className="text-xs text-slate-500 dark:text-zinc-400">
                Chuẩn Sách Bản dịch & Giải thích ngữ pháp
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
              {lesson.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-1">
              Trình bày nguyên bản 100% đầy đủ 4 phần: Mẫu câu (文型), Ví dụ (例文), Hội thoại (会話), Từ tham khảo và Giải thích chi tiết.
            </p>
          </div>

          {/* Ô tìm kiếm cấu trúc */}
          {activeSection === 'kaisetsu' && displayMode !== 'book' && (
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm mẫu câu, quy tắc..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
          )}
        </div>

        {/* Thanh chuyển đổi 4 phân mục chuẩn theo sách Minna (khi không ở chế độ chỉ xem sách) */}
        {displayMode !== 'book' && (
          <div className="flex items-center gap-1.5 sm:gap-2 mt-6 overflow-x-auto pb-1 border-t border-indigo-500/10 pt-4">
          <button
            onClick={() => setActiveSection('kaisetsu')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition shrink-0 ${
              activeSection === 'kaisetsu'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/25'
                : 'bg-white/80 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 border border-slate-200/60 dark:border-zinc-700/60'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>IV. Giải thích Ngữ pháp ({lesson.points?.length || 0})</span>
          </button>

          {lesson.bunkei && lesson.bunkei.length > 0 && (
            <button
              onClick={() => setActiveSection('bunkei_reibun')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition shrink-0 ${
                activeSection === 'bunkei_reibun'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/25'
                  : 'bg-white/80 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 border border-slate-200/60 dark:border-zinc-700/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>II. Mẫu câu & Ví dụ dịch</span>
            </button>
          )}

          {lesson.kaiwa && (
            <button
              onClick={() => setActiveSection('kaiwa')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition shrink-0 ${
                activeSection === 'kaiwa'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/25'
                  : 'bg-white/80 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 border border-slate-200/60 dark:border-zinc-700/60'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>II. Hội thoại dịch (Kaiwa)</span>
            </button>
          )}

          {lesson.referenceInfo && (
            <button
              onClick={() => setActiveSection('reference')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition shrink-0 ${
                activeSection === 'reference'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/25'
                  : 'bg-white/80 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 border border-slate-200/60 dark:border-zinc-700/60'
              }`}
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span>III. Từ tham khảo</span>
            </button>
          )}
        </div>
        )}
      </div>

      {/* 1. Chế độ xem sách gốc PDF (Toàn bộ) */}
      {displayMode === 'book' && (
        <GrammarBookEmbedView lessonNum={lessonNum} />
      )}

      {/* 2. Chế độ bản số hóa tương tác & 3. Chế độ song song Split */}
      {displayMode !== 'book' && (
        <div className={displayMode === 'split' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6 items-start' : 'space-y-6'}>
          <div className="space-y-6">
            {/* ======================================================== */}
            {/* PHÂN MỤC 1: IV. GIẢI THÍCH NGỮ PHÁP (BUNPOU KAISETSU)    */}
            {/* ======================================================== */}
            {activeSection === 'kaisetsu' && (
        <div className="space-y-4">
          {filteredPoints.map((point: GrammarPoint, idx: number) => {
            const isExpanded = !searchTerm && (expandedIds.includes(point.id) || idx === 0);

            return (
              <div
                key={point.id}
                className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-sm hover:border-indigo-300 dark:hover:border-zinc-700 transition"
              >
                {/* Tiêu đề cấu trúc & Nút mở rộng */}
                <div 
                  onClick={() => toggleExpand(point.id)}
                  className="flex items-start justify-between cursor-pointer group"
                >
                  <div className="space-y-1.5 flex-1 pr-3">
                    <div className="flex items-center space-x-2.5">
                      <span className="w-7 h-7 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs flex items-center justify-center shrink-0 border border-indigo-200/60 dark:border-indigo-800/50">
                        {idx + 1}
                      </span>
                      <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition tracking-tight">
                        {point.structure}
                      </h3>
                    </div>

                    <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 pl-9">
                      Ý nghĩa: {point.meaning}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="w-8 h-8 rounded-full bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white shrink-0 transition"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Nội dung chi tiết cấu trúc (Giải thích nguyên bản & Tiểu mục & Ví dụ) */}
                {isExpanded && (
                  <div className="mt-5 pt-5 border-t border-slate-100 dark:border-zinc-800/80 space-y-5 pl-0 sm:pl-9">
                    {/* Giải thích tổng quan */}
                    {point.explanation && (
                      <div className="bg-slate-50 dark:bg-zinc-800/50 rounded-2xl p-4 sm:p-5 border border-slate-200/60 dark:border-zinc-700/50 text-xs sm:text-sm text-slate-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                        <div className="flex items-center space-x-2 font-bold text-slate-900 dark:text-white mb-2">
                          <Info className="w-4 h-4 text-indigo-500" />
                          <span>Giải thích cách dùng chuẩn theo sách:</span>
                        </div>
                        {point.explanation}
                      </div>
                    )}

                    {/* Các tiểu mục chi tiết theo sách: 1), 2), 3)... */}
                    {point.subPoints && point.subPoints.length > 0 && (
                      <div className="space-y-3.5">
                        {point.subPoints.map((sub, sIdx) => (
                          <div 
                            key={sIdx}
                            className="bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl p-4 space-y-2.5"
                          >
                            <h5 className="font-extrabold text-xs sm:text-sm text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                              <span>{sub.title}</span>
                            </h5>
                            <p className="text-xs sm:text-sm text-slate-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                              {sub.explanation}
                            </p>

                            {/* Ví dụ trong tiểu mục */}
                            {sub.examples && sub.examples.length > 0 && (
                              <div className="space-y-2 pt-1">
                                {sub.examples.map((ex, eIdx) => (
                                  <div
                                    key={eIdx}
                                    className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-slate-100 dark:border-zinc-800 flex items-start justify-between gap-3 text-xs"
                                  >
                                    <div className="space-y-0.5">
                                      <p className="font-bold text-slate-900 dark:text-white font-jp text-sm">
                                        {ex.ja}
                                      </p>
                                      {ex.kana && ex.kana !== ex.ja && (
                                        <p className="text-[11px] text-slate-400 font-mono">
                                          {ex.kana}
                                        </p>
                                      )}
                                      <p className="text-slate-600 dark:text-zinc-400">
                                        {ex.vi}
                                      </p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => speakJapanese(ex.ja)}
                                      className="p-1.5 rounded-lg bg-slate-50 dark:bg-zinc-800 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition shrink-0"
                                      title="Nghe phát âm"
                                    >
                                      <Volume2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Khung Chú ý quan trọng */}
                    {point.notes && point.notes.length > 0 && (
                      <div className="space-y-2">
                        {point.notes.map((note, nIdx) => (
                          <div 
                            key={nIdx}
                            className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 text-xs text-amber-900 dark:text-amber-200 leading-relaxed font-medium flex items-start gap-2"
                          >
                            <span className="text-sm shrink-0">⚠️</span>
                            <span>{note}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Các câu ví dụ thực tế chuẩn (Reibun) */}
                    {point.examples && point.examples.length > 0 && (
                      <div className="space-y-2.5">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>Câu ví dụ thực tế trong sách:</span>
                        </h4>

                        {point.examples.map((ex, exIdx) => (
                          <div
                            key={exIdx}
                            className="bg-white dark:bg-zinc-800/70 border border-slate-100 dark:border-zinc-700/60 rounded-2xl p-3.5 flex items-start justify-between gap-3 shadow-2xs hover:shadow-xs transition"
                          >
                            <div className="space-y-1">
                              <p className="text-base font-extrabold text-slate-900 dark:text-white tracking-wide font-jp">
                                {ex.ja}
                              </p>
                              {ex.kana && ex.kana !== ex.ja && (
                                <p className="text-xs font-medium text-slate-400 dark:text-zinc-500 font-mono">
                                  {ex.kana}
                                </p>
                              )}
                              <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-zinc-300">
                                {ex.vi}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                speakJapanese(ex.ja);
                              }}
                              className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 shrink-0 transition"
                              title="Nghe phát âm"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* PHÂN MỤC 2: II. MẪU CÂU & VÍ DỤ DỊCH (BUNKEI & REIBUN)    */}
      {/* ======================================================== */}
      {activeSection === 'bunkei_reibun' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Mẫu câu (Bunkei) */}
          {lesson.bunkei && lesson.bunkei.length > 0 && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                  Mẫu câu (文型 - Bunkei)
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {lesson.bunkei.map((item, bIdx) => (
                  <div
                    key={bIdx}
                    className="p-4 rounded-2xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-100/80 dark:border-blue-900/40 flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <p className="font-jp text-base sm:text-lg font-bold text-slate-900 dark:text-zinc-100">
                        {item.ja}
                      </p>
                      {item.kana && (
                        <p className="text-xs font-mono text-slate-400 dark:text-zinc-500">
                          {item.kana}
                        </p>
                      )}
                      <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-zinc-300">
                        {item.vi}
                      </p>
                    </div>

                    <button
                      onClick={() => speakJapanese(item.ja)}
                      className="p-2 rounded-xl bg-white dark:bg-zinc-800 text-blue-600 dark:text-sky-400 hover:bg-blue-50 transition shrink-0 shadow-2xs"
                      title="Nghe phát âm"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ví dụ (Reibun) */}
          {lesson.reibun && lesson.reibun.length > 0 && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                  Ví dụ đàm thoại (例文 - Reibun)
                </h3>
              </div>

              <div className="space-y-3">
                {lesson.reibun.map((item, rIdx) => (
                  <div
                    key={rIdx}
                    className="p-4 rounded-2xl bg-slate-50/80 dark:bg-zinc-800/40 border border-slate-200/60 dark:border-zinc-700/50 flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1 whitespace-pre-line">
                      <p className="font-jp text-base font-bold text-slate-900 dark:text-zinc-100">
                        {item.ja}
                      </p>
                      {item.kana && (
                        <p className="text-xs font-mono text-slate-400 dark:text-zinc-500">
                          {item.kana}
                        </p>
                      )}
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed">
                        {item.vi}
                      </p>
                    </div>

                    <button
                      onClick={() => speakJapanese(item.ja)}
                      className="p-2 rounded-xl bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 transition shrink-0 shadow-2xs"
                      title="Nghe phát âm"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* PHÂN MỤC 3: II. BÀI HỘI THOẠI CHÍNH (KAIWA)              */}
      {/* ======================================================== */}
      {activeSection === 'kaiwa' && lesson.kaiwa && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-slate-100 dark:border-zinc-800 pb-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider bg-purple-50 dark:bg-purple-950/60 px-2.5 py-0.5 rounded-lg border border-purple-200/60">
                Hội thoại chính (会話)
              </span>
              <h3 className="font-black text-xl text-slate-900 dark:text-white mt-1.5">
                {lesson.kaiwa.title}
              </h3>
            </div>
          </div>

          <div className="space-y-4">
            {lesson.kaiwa.lines.map((line, lIdx) => (
              <div 
                key={lIdx}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/60 dark:border-zinc-700/50 flex items-start justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                    {line.speaker}
                  </span>
                  <p className="font-jp text-base sm:text-lg font-bold text-slate-900 dark:text-zinc-100">
                    {line.ja}
                  </p>
                  {line.kana && (
                    <p className="text-xs font-mono text-slate-400 dark:text-zinc-500">
                      {line.kana}
                    </p>
                  )}
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300">
                    {line.vi}
                  </p>
                </div>

                <button
                  onClick={() => speakJapanese(line.ja)}
                  className="p-2 rounded-xl bg-white dark:bg-zinc-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50 transition shrink-0 shadow-2xs"
                  title="Nghe phát âm câu thoại"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* PHÂN MỤC 4: III. TỪ VÀ THÔNG TIN THAM KHẢO (SANKOU GOI)   */}
      {/* ======================================================== */}
      {activeSection === 'reference' && lesson.referenceInfo && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h3 className="font-black text-xl text-slate-900 dark:text-white">
              {lesson.referenceInfo.title}
            </h3>
            {lesson.referenceInfo.description && (
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                {lesson.referenceInfo.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {lesson.referenceInfo.items.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/60 dark:border-zinc-700/50 flex items-center justify-between gap-3"
              >
                <div>
                  <p className="font-jp text-base font-bold text-slate-900 dark:text-zinc-100">
                    {item.ja}
                  </p>
                  <p className="text-xs font-semibold text-indigo-600 dark:text-sky-400">
                    {item.vi}
                  </p>
                  {item.extra && (
                    <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">
                      {item.extra}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => speakJapanese(item.ja)}
                  className="p-2 rounded-xl bg-white dark:bg-zinc-800 text-slate-500 hover:text-indigo-600 transition shrink-0 shadow-2xs"
                  title="Nghe phát âm"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
          </div>

          {displayMode === 'split' && (
            <div className="lg:sticky lg:top-20">
              <GrammarBookEmbedView lessonNum={lessonNum} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

