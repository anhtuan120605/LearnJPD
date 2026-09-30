import React, { useState, useEffect } from 'react';
import { WordItem } from '../types';
import { VocabOverride } from '../lib/vocabOverrides';
import * as wanakana from 'wanakana';
import { X, Save, Trash2, Sparkles, ShieldCheck, AlertCircle, Plus, Eye } from 'lucide-react';

interface AdminWordEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  wordToEdit: WordItem | null;
  courseKey: string;
  lessonNum: number;
  onSave: (override: VocabOverride) => Promise<void>;
  onDelete?: (wordId: string) => Promise<void>;
}

export const AdminWordEditModal: React.FC<AdminWordEditModalProps> = ({
  isOpen,
  onClose,
  wordToEdit,
  courseKey,
  lessonNum,
  onSave,
  onDelete,
}) => {
  const isEditing = Boolean(wordToEdit);

  const [kanji, setKanji] = useState('');
  const [kana, setKana] = useState('');
  const [romaji, setRomaji] = useState('');
  const [meaning, setMeaning] = useState('');
  const [hanviet, setHanviet] = useState('');
  
  // Câu ví dụ
  const [exampleJa, setExampleJa] = useState('');
  const [exampleVi, setExampleVi] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Điền dữ liệu khi mở modal
  useEffect(() => {
    if (wordToEdit) {
      setKanji(wordToEdit.kanji || '');
      setKana(wordToEdit.kana || '');
      setRomaji(wordToEdit.romaji || '');
      setMeaning(wordToEdit.meaning || '');
      setHanviet(wordToEdit.hanviet || '');
      const firstEx = wordToEdit.examples?.[0];
      setExampleJa(firstEx?.ja || '');
      setExampleVi(firstEx?.vi || '');
    } else {
      // Tạo từ mới
      setKanji('');
      setKana('');
      setRomaji('');
      setMeaning('');
      setHanviet('');
      setExampleJa('');
      setExampleVi('');
    }
    setErrorMessage(null);
  }, [wordToEdit, isOpen]);

  // Tự động gợi ý Romaji khi gõ Kana nếu chưa có romaji
  const handleKanaChange = (val: string) => {
    setKana(val);
    if (!romaji || romaji === wanakana.toRomaji(kana)) {
      setRomaji(wanakana.toRomaji(val));
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kana.trim()) {
      setErrorMessage('Vui lòng nhập Cách đọc (Hiragana / Katakana)');
      return;
    }
    if (!meaning.trim()) {
      setErrorMessage('Vui lòng nhập Nghĩa tiếng Việt');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    const generatedId = wordToEdit?.id || `custom_${courseKey}_l${lessonNum}_${Date.now()}`;
    const cleanRomaji = romaji.trim() || wanakana.toRomaji(kana.trim());

    const examples = exampleJa.trim()
      ? [{ ja: exampleJa.trim(), vi: exampleVi.trim() }]
      : (wordToEdit?.examples || []);

    const override: VocabOverride = {
      id: generatedId,
      courseKey,
      lesson: lessonNum,
      kanji: kanji.trim() || kana.trim(),
      kana: kana.trim(),
      romaji: cleanRomaji,
      meaning: meaning.trim(),
      hanviet: hanviet.trim().toUpperCase(),
      examples,
      isCustomAdded: !isEditing,
      isDeleted: false,
      updatedAt: new Date().toISOString(),
    };

    try {
      await onSave(override);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi khi lưu từ vựng.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!wordToEdit || !onDelete) return;
    const confirmDelete = window.confirm(`Bạn có chắc muốn xóa vĩnh viễn từ "${wordToEdit.kanji || wordToEdit.kana}" khỏi hệ thống bài học này?`);
    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(wordToEdit.id);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi khi xóa từ.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-zinc-900 w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-gradient-to-r from-blue-50/60 to-indigo-50/60 dark:from-blue-950/20 dark:to-indigo-950/20">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-sky-300">
                  Admin Panel
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {courseKey} • Bài {lessonNum}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">
                {isEditing ? `Chỉnh sửa từ: ${wordToEdit?.kanji || wordToEdit?.kana}` : 'Thêm từ vựng mới vào bài'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {errorMessage && (
            <div className="flex items-center space-x-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-semibold border border-red-200 dark:border-red-900/50">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Xem trước trực tiếp (Live Preview) */}
          <div className="bg-slate-50 dark:bg-zinc-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-zinc-700/60 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-slate-400 flex items-center space-x-1">
                <Eye className="w-3 h-3" />
                <span>Xem trước hiển thị:</span>
              </span>
              <p className="text-xs text-slate-500">{kana || 'cách đọc'}</p>
              <h3 className="text-xl font-bold font-jp text-slate-900 dark:text-white leading-tight">
                {kanji || kana || 'Từ vựng'}
              </h3>
              {hanviet && (
                <span className="text-[10px] font-extrabold uppercase bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded">
                  {hanviet}
                </span>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-blue-600 dark:text-sky-400">
                {meaning || 'Nghĩa tiếng Việt'}
              </p>
              <p className="text-xs text-slate-400 italic">
                {romaji || wanakana.toRomaji(kana) || 'romaji'}
              </p>
            </div>
          </div>

          {/* Hàng 1: Kanji & Kana */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Chữ Kanji (Hán tự)
              </label>
              <input
                type="text"
                placeholder="VD: 私, 学生, 日本..."
                value={kanji}
                onChange={(e) => setKanji(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm font-jp focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Cách đọc Kana <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="VD: わたし, がくせい..."
                value={kana}
                onChange={(e) => handleKanaChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm font-jp focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Hàng 2: Nghĩa tiếng Việt & Âm Hán Việt */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Nghĩa tiếng Việt <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="VD: Tôi, Học sinh..."
                value={meaning}
                onChange={(e) => setMeaning(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Âm Hán Việt (Tùy chọn)
              </label>
              <input
                type="text"
                placeholder="VD: TƯ, HỌC SINH, NHẬT BẢN..."
                value={hanviet}
                onChange={(e) => setHanviet(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm uppercase focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Romaji */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
              Phiên âm Romaji (Tự động tạo)
            </label>
            <input
              type="text"
              placeholder="VD: watashi, gakusei..."
              value={romaji}
              onChange={(e) => setRomaji(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Câu ví dụ mẫu (Tùy chọn) */}
          <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 space-y-3">
            <span className="text-xs font-bold text-slate-600 dark:text-zinc-400">
              Câu ví dụ minh họa (Tùy chọn):
            </span>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Câu tiếng Nhật: わたしは がくせいです。"
                value={exampleJa}
                onChange={(e) => setExampleJa(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-jp focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="Dịch nghĩa tiếng Việt: Tôi là học sinh."
                value={exampleVi}
                onChange={(e) => setExampleVi(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Footer nút điều khiển */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-zinc-800">
            {isEditing && onDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting || isSaving}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900/40 transition"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeleting ? 'Đang xóa...' : 'Xóa từ này'}</span>
              </button>
            ) : <div />}

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving || isDeleting}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
              >
                Hủy
              </button>

              <button
                type="submit"
                disabled={isSaving || isDeleting}
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/25 transition active:scale-95 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Đang đồng bộ...' : 'Lưu & Đồng bộ Cloud 🚀'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
