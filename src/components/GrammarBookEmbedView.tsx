import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Download, 
  Maximize2, 
  Minimize2, 
  Sparkles,
  FileText
} from 'lucide-react';

interface GrammarBookEmbedViewProps {
  lessonNum: number;
  initialBook?: 'grammar_explanation' | 'textbook' | 'exercise';
}

const BOOKS = [
  {
    id: 'grammar_explanation',
    title: 'Bản dịch & Giải thích ngữ pháp (Tập 1)',
    badge: 'Khuyên dùng',
    fileName: 'grammar_explanation_vol1.pdf',
    // Mỗi bài học bắt đầu từ trang 33, cách nhau đúng 6 trang
    getStartPage: (lessonNum: number) => 33 + Math.max(0, Math.min(24, lessonNum - 1)) * 6,
    totalPages: 201
  },
  {
    id: 'textbook',
    title: 'Sách giáo khoa Minna no Nihongo (Tập 1)',
    badge: 'Sách chính',
    fileName: 'textbook_vol1.pdf',
    // Trang sách giáo khoa bài 1 bắt đầu khoảng trang 12
    getStartPage: (lessonNum: number) => 12 + Math.max(0, Math.min(24, lessonNum - 1)) * 8,
    totalPages: 260
  },
  {
    id: 'exercise',
    title: 'Sách bài tập ngữ pháp (Tập 1)',
    badge: 'Bài tập',
    fileName: 'grammar_exercise_vol1.pdf',
    getStartPage: (lessonNum: number) => 8 + Math.max(0, Math.min(24, lessonNum - 1)) * 4,
    totalPages: 140
  }
];

export const GrammarBookEmbedView: React.FC<GrammarBookEmbedViewProps> = ({
  lessonNum,
  initialBook = 'grammar_explanation'
}) => {
  const [selectedBookId, setSelectedBookId] = useState<'grammar_explanation' | 'textbook' | 'exercise'>(initialBook);
  const currentBook = BOOKS.find(b => b.id === selectedBookId) || BOOKS[0];

  const defaultPage = currentBook.getStartPage(lessonNum);
  const [currentPage, setCurrentPage] = useState(defaultPage);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Cập nhật lại trang khi đổi bài hoặc đổi sách
  useEffect(() => {
    const page = currentBook.getStartPage(lessonNum);
    setCurrentPage(page);
  }, [lessonNum, selectedBookId]);

  const pdfUrl = `/materials/n5/${currentBook.fileName}`;
  const iframeSrc = `${pdfUrl}#page=${currentPage}&view=FitH`;

  const handlePrevPage = () => {
    setCurrentPage(p => Math.max(1, p - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(p => Math.min(currentBook.totalPages, p + 1));
  };

  const handleResetToLesson = () => {
    setCurrentPage(defaultPage);
  };

  return (
    <div className={`space-y-3 transition-all ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-900/95 p-4 flex flex-col justify-between' : ''}`}>
      {/* Thanh điều khiển đọc sách PDF (Toolbar) */}
      <div className="bg-white dark:bg-[#111c30] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        {/* Chọn cuốn sách */}
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-sky-400">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Sách đang nhúng
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                Bài {lessonNum}
              </span>
            </div>
            <select
              value={selectedBookId}
              onChange={(e) => setSelectedBookId(e.target.value as any)}
              className="mt-0.5 font-bold text-xs sm:text-sm text-slate-800 dark:text-white bg-transparent border-0 focus:ring-0 cursor-pointer p-0 pr-4"
            >
              {BOOKS.map(b => (
                <option key={b.id} value={b.id} className="dark:bg-slate-900 dark:text-white">
                  {b.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Cụm chuyển trang & Điều hướng */}
        <div className="flex items-center space-x-2">
          {/* Nút về đầu bài */}
          <button
            onClick={handleResetToLesson}
            title={`Về trang đầu Bài ${lessonNum} (Trang ${defaultPage})`}
            className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition border border-slate-200/60 dark:border-slate-700"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Đầu bài</span>
            <span className="font-mono text-blue-600 dark:text-sky-400">p.{defaultPage}</span>
          </button>

          {/* Điều hướng trang trước / sau */}
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className="p-1 rounded-lg hover:bg-white dark:hover:bg-zinc-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 transition"
              title="Trang trước"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <span className="px-2 text-xs font-mono font-bold text-slate-700 dark:text-slate-200">
              {currentPage} / {currentBook.totalPages}
            </span>

            <button
              onClick={handleNextPage}
              disabled={currentPage >= currentBook.totalPages}
              className="p-1 rounded-lg hover:bg-white dark:hover:bg-zinc-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 transition"
              title="Trang sau"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mở tab mới */}
          <a
            href={iframeSrc}
            target="_blank"
            rel="noopener noreferrer"
            title="Mở toàn màn hình trong tab mới"
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-sky-400 text-xs font-bold transition border border-slate-200/60 dark:border-slate-700"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {/* Toàn màn hình trong trang */}
          <button
            onClick={() => setIsFullscreen(prev => !prev)}
            title={isFullscreen ? 'Thu nhỏ lại' : 'Phóng to toàn màn hình'}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold transition border border-slate-200/60 dark:border-slate-700"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Khung nhúng PDF Reader trực tiếp */}
      <div className={`w-full rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-slate-100 dark:bg-zinc-950 shadow-inner ${isFullscreen ? 'flex-1 h-[calc(100vh-100px)]' : 'h-[720px] sm:h-[800px]'}`}>
        <iframe
          key={`${selectedBookId}-${currentPage}`}
          src={iframeSrc}
          className="w-full h-full border-0"
          title={`${currentBook.title} - Trang ${currentPage}`}
        />
      </div>

      {/* Chú thích hướng dẫn */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-2">
        <div className="flex items-center space-x-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Đang hiển thị đúng trang ngữ pháp <strong>Bài {lessonNum}</strong> của cuốn {currentBook.title}.</span>
        </div>
        <a
          href={pdfUrl}
          download={currentBook.fileName}
          className="hover:text-blue-600 dark:hover:text-sky-400 font-semibold inline-flex items-center space-x-1 mt-1 sm:mt-0"
        >
          <Download className="w-3 h-3" />
          <span>Tải file PDF về máy</span>
        </a>
      </div>
    </div>
  );
};
