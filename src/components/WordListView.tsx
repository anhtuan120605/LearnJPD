import React, { useState } from 'react';
import { WordItem } from '../types';
import { Volume2, Star, CheckCircle2, Eye, EyeOff, Search, Sparkles, MessageSquare, ChevronDown, ChevronUp, Trash2, RotateCcw, PenTool, Edit3, Plus, ShieldCheck } from 'lucide-react';
import { speakJapanese } from '../lib/audio';
import { KanjiStrokeModal } from './KanjiStrokeModal';

interface WordListViewProps {
  words: WordItem[];
  masteredWords: string[];
  favoriteWords: string[];
  hiddenWords?: string[];
  onToggleMaster: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onToggleHide?: (id: string) => void;
  onRestoreAllHidden?: () => void;
  isAdmin?: boolean;
  onEditWord?: (word: WordItem) => void;
  onAddNewWord?: () => void;
  onAdminDeleteWord?: (wordId: string) => Promise<void> | void;
  deletedWordsCount?: number;
  onOpenDeletedWords?: () => void;
}

export const WordListView: React.FC<WordListViewProps> = ({
  words,
  masteredWords,
  favoriteWords,
  hiddenWords = [],
  onToggleMaster,
  onToggleFavorite,
  onToggleHide,
  onRestoreAllHidden,
  isAdmin = false,
  onEditWord,
  onAddNewWord,
  onAdminDeleteWord,
  deletedWordsCount = 0,
  onOpenDeletedWords,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFurigana, setShowFurigana] = useState(true);
  const [showMeaning, setShowMeaning] = useState(true);
  const [showExamples, setShowExamples] = useState(true);
  const [expandedWordIds, setExpandedWordIds] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'unlearned' | 'mastered' | 'favorite' | 'hidden'>('all');
  const [strokeKanji, setStrokeKanji] = useState<{ kanji: string; hanviet?: string; meaning?: string } | null>(null);

  const toggleWordExpand = (id: string) => {
    setExpandedWordIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Danh sách các từ đang hoạt động (chưa bị ẩn) và từ đã ẩn trong bài này
  const activeWordsInLesson = words.filter(w => !hiddenWords.includes(w.id));
  const hiddenWordsInLesson = words.filter(w => hiddenWords.includes(w.id));

  // Lọc từ vựng theo tìm kiếm và trạng thái
  const filteredWords = words.filter(w => {
    const isHidden = hiddenWords.includes(w.id);

    // 1. Phân loại theo tab ẩn hay đang học
    if (filterType === 'hidden') {
      if (!isHidden) return false;
    } else {
      // Các tab khác không hiển thị từ đã ẩn/xóa
      if (isHidden) return false;
    }

    // 2. Tìm kiếm theo từ khóa
    const term = searchTerm.toLowerCase().trim();
    const matchTerm = !term || 
      w.kanji.toLowerCase().includes(term) ||
      w.kana.toLowerCase().includes(term) ||
      w.romaji.toLowerCase().includes(term) ||
      w.hanviet.toLowerCase().includes(term) ||
      w.meaning.toLowerCase().includes(term);

    if (!matchTerm) return false;

    // 3. Lọc theo trạng thái con
    if (filterType === 'mastered') return masteredWords.includes(w.id);
    if (filterType === 'unlearned') return !masteredWords.includes(w.id);
    if (filterType === 'favorite') return favoriteWords.includes(w.id);
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Thanh thông báo Quản trị viên (Admin) */}
      {isAdmin && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-orange-500/10 border border-amber-500/30 p-4 rounded-2xl shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center shadow-xs font-black text-base shrink-0">
              👑
            </div>
            <div>
              <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <span>Chế độ Quản trị viên (Admin)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30">
                  Đang hoạt động
                </span>
              </p>
              <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-0.5">
                Đầy đủ quyền <strong>Thêm từ mới</strong>, <strong>Chỉnh sửa</strong> và <strong>Xóa vĩnh viễn</strong>. Mọi thay đổi tự động đồng bộ Cloud cho tất cả tài khoản.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {deletedWordsCount > 0 && onOpenDeletedWords && (
              <button
                onClick={onOpenDeletedWords}
                className="inline-flex items-center space-x-1.5 px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30 text-xs font-bold rounded-xl transition active:scale-95"
                title="Xem danh sách từ đã bị Admin xóa và khôi phục lại"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Từ đã xóa ({deletedWordsCount})</span>
              </button>
            )}

            {onAddNewWord && (
              <button
                onClick={onAddNewWord}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-sm shadow-blue-500/25 transition active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm từ mới</span>
              </button>
            )}
          </div>
        </div>
      )}

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
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700/60 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
          />
        </div>

        {/* Nút lọc & Toggle ẩn/hiện */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Filter Status buttons */}
          <div className="flex flex-wrap items-center bg-slate-100 dark:bg-zinc-800/80 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterType === 'all'
                  ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Đang học ({activeWordsInLesson.length})
            </button>
            <button
              onClick={() => setFilterType('unlearned')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterType === 'unlearned'
                  ? 'bg-white dark:bg-zinc-700 text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Chưa thuộc ({activeWordsInLesson.filter(w => !masteredWords.includes(w.id)).length})
            </button>
            <button
              onClick={() => setFilterType('mastered')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterType === 'mastered'
                  ? 'bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Đã thuộc ({activeWordsInLesson.filter(w => masteredWords.includes(w.id)).length})
            </button>
            <button
              onClick={() => setFilterType('favorite')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterType === 'favorite'
                  ? 'bg-white dark:bg-zinc-700 text-amber-500 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              ⭐ Yêu thích ({activeWordsInLesson.filter(w => favoriteWords.includes(w.id)).length})
            </button>

            {/* Nút xem từ đã ẩn/xóa (nếu có từ bị ẩn) */}
            {hiddenWordsInLesson.length > 0 && (
              <button
                onClick={() => setFilterType('hidden')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1 ${
                  filterType === 'hidden'
                    ? 'bg-red-500 text-white shadow-xs'
                    : 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Đã ẩn ({hiddenWordsInLesson.length})</span>
              </button>
            )}
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

      {/* Thông báo và hành động khi đang ở mục "Đã ẩn" */}
      {filterType === 'hidden' && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-2xl p-4 flex items-center justify-between text-xs text-red-800 dark:text-red-300">
          <div>
            <strong>Danh sách từ đã ẩn/xóa khỏi bài ({hiddenWordsInLesson.length} từ):</strong>
            <p className="text-[11px] text-red-600 dark:text-red-400 pt-0.5">
              Những từ này sẽ không xuất hiện trong các bài luyện tập (Flashcard, Trắc nghiệm, Dịch câu...).
            </p>
          </div>
          {onRestoreAllHidden && (
            <button
              onClick={onRestoreAllHidden}
              className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition flex items-center space-x-1 shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Khôi phục tất cả</span>
            </button>
          )}
        </div>
      )}

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
              const isHidden = hiddenWords.includes(word.id);
              const isRowExpanded = expandedWordIds.includes(word.id);
              const hasExamples = word.examples && word.examples.length > 0;
              const shouldShowExamples = showExamples || isRowExpanded;

              return (
                <div
                  key={word.id}
                  className={`p-4 sm:px-6 transition-colors hover:bg-slate-50/80 dark:hover:bg-zinc-800/50 flex flex-col space-y-3 ${
                    isMastered ? 'bg-emerald-500/[0.02]' : ''
                  } ${isHidden ? 'opacity-60 bg-slate-100/50 dark:bg-zinc-800/20' : ''}`}
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
                        <div className="flex items-center space-x-2">
                          <h4 className="text-xl sm:text-2xl font-jp font-bold text-slate-900 dark:text-white leading-tight">
                            {word.kanji || word.kana}
                          </h4>
                          {word.kanji && (
                            <button
                              onClick={() => setStrokeKanji({ kanji: word.kanji, hanviet: word.hanviet, meaning: word.meaning })}
                              title={`Xem nét viết chữ ${word.kanji}`}
                              className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition"
                            >
                              <PenTool className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {isHidden && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
                              Đã ẩn
                            </span>
                          )}
                        </div>
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

                    {/* Cột phải: Toggle ví dụ riêng, Sao, Thuộc & Xóa/Ẩn từ */}
                    <div className="flex items-center space-x-1.5">
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

                      {!isHidden && (
                        <>
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
                        </>
                      )}

                      {/* NÚT ẨN / KHÔI PHỤC TỪ KHỎI BÀI HỌC DÀNH CHO HỌC VIÊN CÁ NHÂN (chỉ hiện khi không ở chế độ Admin) */}
                      {!isAdmin && onToggleHide && (
                        <button
                          onClick={() => onToggleHide(word.id)}
                          className={`p-2 rounded-xl transition ${
                            isHidden
                              ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100'
                              : 'text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30'
                          }`}
                          title={isHidden ? 'Khôi phục từ này để học lại' : 'Ẩn từ này khỏi bài học của bạn'}
                        >
                          {isHidden ? (
                            <RotateCcw className="w-4 h-4" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      )}

                      {/* BỘ NÚT CHỨC NĂNG ADMIN ĐẦY ĐỦ: SỬA & XÓA VĨNH VIỄN */}
                      {isAdmin && (
                        <div className="flex items-center space-x-1 pl-1.5 border-l border-amber-500/30">
                          {onEditWord && (
                            <button
                              onClick={() => onEditWord(word)}
                              className="p-2 rounded-xl text-blue-600 dark:text-sky-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200/60 dark:border-blue-800/50 transition shadow-2xs active:scale-95"
                              title="[Admin] Chỉnh sửa từ vựng này"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}
                          {onAdminDeleteWord && (
                            <button
                              onClick={() => {
                                const wordLabel = word.kanji ? `${word.kanji} (${word.kana})` : word.kana;
                                if (window.confirm(`⚠️ BẠN CÓ CHẮC MUỐN XÓA VĨNH VIỄN TỪ NÀY?\n\n"${wordLabel} - ${word.meaning}"\n\nTừ này sẽ bị xóa và đồng bộ ẩn khỏi TẤT CẢ các tài khoản khác trên hệ thống!`)) {
                                  onAdminDeleteWord(word.id);
                                }
                              }}
                              className="p-2 rounded-xl text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200/60 dark:border-rose-800/50 transition shadow-2xs active:scale-95"
                              title="[Admin] Xóa vĩnh viễn từ này khỏi hệ thống (Đồng bộ mọi tài khoản)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* KHỐI CÂU VÍ DỤ NGỮ PHÁP / KAIWA THÔNG DỤNG */}
                  {hasExamples && shouldShowExamples && !isHidden && (
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
                            className="mt-0.5 p-1.5 rounded-lg text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 hover:scale-105 active:scale-95 transition shrink-0"
                            title="Nghe câu ví dụ"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>

                          <div className="flex-1 space-y-1">
                            <p className="font-jp text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100 leading-snug">
                              {ex.ja}
                            </p>

                            {showFurigana && ex.kana && ex.kana !== ex.ja && (
                              <p className="text-[11px] font-mono text-slate-400 dark:text-zinc-500">
                                {ex.kana}
                              </p>
                            )}

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

      {/* Modal Nét viết & Tập viết Kanji */}
      {strokeKanji && (
        <KanjiStrokeModal
          isOpen={!!strokeKanji}
          onClose={() => setStrokeKanji(null)}
          kanji={strokeKanji.kanji}
          hanviet={strokeKanji.hanviet}
          meaning={strokeKanji.meaning}
        />
      )}
    </div>
  );
};
