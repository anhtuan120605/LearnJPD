import React, { useState } from 'react';
import { WordItem } from '../types';
import { Volume2, Star, CheckCircle2, Eye, EyeOff, Search, Sparkles, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { speakJapanese } from '../lib/audio';

interface WordListViewProps {
  words: WordItem[];
  masteredWords: string[];
  favoriteWords: string[];
  onToggleMaster: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export const WordListView: React.FC<WordListViewProps> = ({
  words,
  masteredWords,
  favoriteWords,
  onToggleMaster,
  onToggleFavorite
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFurigana, setShowFurigana] = useState(true);
  const [showMeaning, setShowMeaning] = useState(true);
  const [showExamples, setShowExamples] = useState(true);
  const [expandedWordIds, setExpandedWordIds] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'unlearned' | 'mastered' | 'favorite'>('all');

  const toggleWordExpand = (id: string) => {
    setExpandedWordIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Lọc từ vựng
  const filteredWords = words.filter(w => {
    // 1. Tìm kiếm theo từ khóa
    const term = searchTerm.toLowerCase().trim();
    const matchTerm = !term || 
      w.kanji.toLowerCase().includes(term) ||
      w.kana.toLowerCase().includes(term) ||
      w.romaji.toLowerCase().includes(term) ||
      w.hanviet.toLowerCase().includes(term) ||
      w.meaning.toLowerCase().includes(term);

    if (!matchTerm) return false;

    // 2. Lọc theo trạng thái
    if (filterType === 'mastered') return masteredWords.includes(w.id);
    if (filterType === 'unlearned') return !masteredWords.includes(w.id);
    if (filterType === 'favorite') return favoriteWords.includes(w.id);
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Thanh công cụ tìm kiếm và lọc */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Input Tìm kiếm */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm Kanji, Kana, Hán Việt, Nghĩa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
          />
        </div>

        {/* Nút lọc & Toggle ẩn/hiện */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Filter Status buttons */}
          <div className="flex items-center bg-slate-100 dark:bg-zinc-800/80 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterType === 'all'
                  ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Tất cả ({words.length})
            </button>
            <button
              onClick={() => setFilterType('unlearned')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterType === 'unlearned'
                  ? 'bg-white dark:bg-zinc-700 text-rose-600 dark:text-rose-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Chưa thuộc ({words.filter(w => !masteredWords.includes(w.id)).length})
            </button>
            <button
              onClick={() => setFilterType('mastered')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterType === 'mastered'
                  ? 'bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Đã thuộc ({words.filter(w => masteredWords.includes(w.id)).length})
            </button>
            <button
              onClick={() => setFilterType('favorite')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterType === 'favorite'
                  ? 'bg-white dark:bg-zinc-700 text-amber-500 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              ⭐ Yêu thích ({words.filter(w => favoriteWords.includes(w.id)).length})
            </button>
          </div>

          {/* Toggle Furigana */}
          <button
            onClick={() => setShowFurigana(!showFurigana)}
            title={showFurigana ? 'Ẩn cách đọc Furigana' : 'Hiện cách đọc Furigana'}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition ${
              showFurigana
                ? 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 border-slate-200 dark:border-zinc-700'
                : 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/40'
            }`}
          >
            {showFurigana ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Furigana</span>
          </button>

          {/* Toggle Nghĩa */}
          <button
            onClick={() => setShowMeaning(!showMeaning)}
            title={showMeaning ? 'Ẩn nghĩa tiếng Việt' : 'Hiện nghĩa tiếng Việt'}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition ${
              showMeaning
                ? 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 border-slate-200 dark:border-zinc-700'
                : 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/40'
            }`}
          >
            {showMeaning ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Nghĩa</span>
          </button>

          {/* Toggle Câu ví dụ & Kaiwa */}
          <button
            onClick={() => setShowExamples(!showExamples)}
            title={showExamples ? 'Ẩn câu ví dụ & Kaiwa ngữ pháp' : 'Hiện câu ví dụ & Kaiwa ngữ pháp'}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition ${
              showExamples
                ? 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900/40 shadow-xs'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 border-slate-200 dark:border-zinc-700'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Ví dụ & Kaiwa</span>
          </button>
        </div>
      </div>

      {/* Bảng danh sách từ vựng */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="divide-y divide-slate-100 dark:divide-zinc-800/80">
          {filteredWords.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-sm">
              Không tìm thấy từ vựng nào phù hợp với bộ lọc.
            </div>
          ) : (
            filteredWords.map((word, idx) => {
              const isMastered = masteredWords.includes(word.id);
              const isFavorite = favoriteWords.includes(word.id);
              const isRowExpanded = expandedWordIds.includes(word.id);
              const hasExamples = word.examples && word.examples.length > 0;
              const shouldShowExamples = showExamples || isRowExpanded;

              return (
                <div
                  key={word.id}
                  className={`p-4 sm:px-6 transition-colors hover:bg-slate-50/80 dark:hover:bg-zinc-800/50 flex flex-col space-y-3 ${
                    isMastered ? 'bg-emerald-500/[0.02]' : ''
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    {/* Cột trái: Số thứ tự, Loa, Từ vựng */}
                    <div className="flex items-center space-x-4">
                      <span className="text-xs font-mono text-slate-400 w-6 text-center">
                        {idx + 1}
                      </span>

                      {/* Nút phát âm từ vựng */}
                      <button
                        onClick={() => speakJapanese(word.kana || word.kanji)}
                        className="p-2 rounded-xl text-rose-500 bg-rose-50 dark:bg-rose-950/30 hover:scale-110 active:scale-95 transition"
                        title="Nghe phát âm từ"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>

                      {/* Kanji & Furigana */}
                      <div>
                        {showFurigana && (
                          <p className="text-xs font-medium text-slate-400 dark:text-zinc-500">
                            {word.kana}
                          </p>
                        )}
                        <h4 className="text-xl sm:text-2xl font-jp font-bold text-slate-900 dark:text-white leading-tight">
                          {word.kanji || word.kana}
                        </h4>
                        {word.hanviet && (
                          <span className="inline-block mt-0.5 text-[11px] font-extrabold uppercase tracking-wide text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.2 rounded">
                            {word.hanviet}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Cột giữa: Nghĩa tiếng Việt */}
                    <div className="flex-1 px-6 text-right sm:text-left">
                      {showMeaning ? (
                        <div>
                          <p className="text-sm sm:text-base font-semibold text-slate-800 dark:text-zinc-200">
                            {word.meaning}
                          </p>
                          {word.meaning_en && (
                            <p className="text-xs text-slate-400 dark:text-zinc-500 hidden sm:block italic">
                              {word.meaning_en}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs italic text-slate-400 font-mono select-none">
                          [Đã ẩn nghĩa - nhấp để hiện]
                        </span>
                      )}
                    </div>

                    {/* Cột phải: Toggle ví dụ riêng, Sao & Thuộc */}
                    <div className="flex items-center space-x-2">
                      {hasExamples && !showExamples && (
                        <button
                          onClick={() => toggleWordExpand(word.id)}
                          className={`p-2 rounded-xl text-xs font-semibold flex items-center space-x-1 transition ${
                            isRowExpanded
                              ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400'
                              : 'text-slate-400 hover:text-purple-600 hover:bg-slate-100 dark:hover:bg-zinc-800'
                          }`}
                          title="Xem câu ví dụ của từ này"
                        >
                          <MessageSquare className="w-4 h-4" />
                          {isRowExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      )}

                      <button
                        onClick={() => onToggleFavorite(word.id)}
                        className={`p-2 rounded-xl transition ${
                          isFavorite
                            ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/30'
                            : 'text-slate-300 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-zinc-800'
                        }`}
                        title={isFavorite ? 'Bỏ yêu thích' : 'Yêu thích'}
                      >
                        <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                      </button>

                      <button
                        onClick={() => onToggleMaster(word.id)}
                        className={`p-2 rounded-xl transition ${
                          isMastered
                            ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
                            : 'text-slate-300 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-zinc-800'
                        }`}
                        title={isMastered ? 'Đã thuộc từ này' : 'Đánh dấu đã thuộc'}
                      >
                        <CheckCircle2 className={`w-4 h-4 ${isMastered ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* KHỐI CÂU VÍ DỤ NGỮ PHÁP / KAIWA THÔNG DỤNG */}
                  {hasExamples && shouldShowExamples && (
                    <div className="w-full bg-slate-50/90 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60 rounded-2xl p-3 sm:p-4 space-y-2 text-xs animate-in fade-in duration-200">
                      <div className="flex items-center space-x-1.5 text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider text-[10px]">
                        <MessageSquare className="w-3 h-3" />
                        <span>Ví dụ ngữ pháp & Kaiwa thông dụng:</span>
                      </div>

                      {word.examples!.map((ex, exIdx) => (
                        <div key={exIdx} className="flex items-start space-x-3 bg-white dark:bg-zinc-900/80 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800">
                          {/* Nút phát âm câu ví dụ */}
                          <button
                            onClick={() => speakJapanese(ex.ja || ex.kana || '')}
                            className="mt-0.5 p-1.5 rounded-lg text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 hover:scale-105 active:scale-95 transition flex-shrink-0"
                            title="Nghe câu ví dụ"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>

                          <div className="flex-1 space-y-1">
                            {/* Câu tiếng Nhật */}
                            <p className="font-jp text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100 leading-snug">
                              {ex.ja}
                            </p>

                            {/* Cách đọc Furigana/Kana */}
                            {showFurigana && ex.kana && ex.kana !== ex.ja && (
                              <p className="text-[11px] font-mono text-slate-400 dark:text-zinc-500">
                                {ex.kana}
                              </p>
                            )}

                            {/* Dịch nghĩa tiếng Việt */}
                            {showMeaning && ex.vi && (
                              <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-zinc-300">
                                {ex.vi}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
