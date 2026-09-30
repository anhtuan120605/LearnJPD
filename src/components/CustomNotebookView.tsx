import React, { useState } from 'react';
import { CustomNotebookLesson, WordItem } from '../types';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Download, 
  Sparkles, 
  Check, 
  AlertCircle, 
  Play, 
  Volume2, 
  Layers, 
  Target, 
  Zap, 
  ArrowLeft, 
  CheckCircle2, 
  HelpCircle, 
  FileCode, 
  Search 
} from 'lucide-react';
import { speakJapanese } from '../lib/audio';
import { FlashcardView } from './FlashcardView';
import { PracticeView } from './PracticeView';
import { CrammingModeView } from './CrammingModeView';

interface CustomNotebookViewProps {
  customNotebooks: CustomNotebookLesson[];
  onUpdateNotebooks: (notebooks: CustomNotebookLesson[]) => void;
  masteredWords: string[];
  favoriteWords: string[];
  mistakeWords: string[];
  onToggleMaster: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onAddMistake: (id: string) => void;
  onRemoveMistake: (id: string) => void;
  onSaveQuizScore: (score: number, total: number, type: string) => void;
}

const DEMO_VOCAB_JSON = `[
  {
    "word": "図書館",
    "reading": "としょかん",
    "hanviet": "ĐỒ THƯ QUÁN",
    "meaning": "Thư viện",
    "example": "図書館で本を読みます",
    "exampleMeaning": "Tôi đọc sách ở thư viện"
  },
  {
    "word": "勉強",
    "reading": "べんきょう",
    "hanviet": "MIỄN CƯỠNG",
    "meaning": "Học tập",
    "example": "毎日日本語を勉強します",
    "exampleMeaning": "Tôi học tiếng Nhật mỗi ngày"
  },
  {
    "word": "友達",
    "reading": "ともだち",
    "hanviet": "HỮU ĐẠT",
    "meaning": "Bạn bè",
    "example": "友達と一緒に映画を見ます",
    "exampleMeaning": "Tôi đi xem phim cùng với bạn bè"
  },
  {
    "word": "朝ご飯",
    "reading": "あさごはん",
    "hanviet": "TRIÊU PHẠN",
    "meaning": "Bữa sáng",
    "example": "朝ご飯にパンを食べました",
    "exampleMeaning": "Tôi đã ăn bánh mì vào bữa sáng"
  },
  {
    "word": "車",
    "reading": "くるま",
    "hanviet": "XA",
    "meaning": "Xe hơi, ô tô",
    "example": "新しい車を買いたいです",
    "exampleMeaning": "Tôi muốn mua một chiếc ô tô mới"
  }
]`;

export const CustomNotebookView: React.FC<CustomNotebookViewProps> = ({
  customNotebooks,
  onUpdateNotebooks,
  masteredWords,
  favoriteWords,
  mistakeWords,
  onToggleMaster,
  onToggleFavorite,
  onAddMistake,
  onRemoveMistake,
  onSaveQuizScore
}) => {
  // Đảm bảo luôn có ít nhất 1 bài
  const lessons = customNotebooks && customNotebooks.length > 0 ? customNotebooks : [
    {
      id: 'custom-lesson-1',
      title: 'Bài 1',
      createdAt: new Date().toISOString(),
      words: []
    }
  ];

  const [selectedLessonId, setSelectedLessonId] = useState<string>(lessons[0]?.id || 'custom-lesson-1');
  const [jsonInput, setJsonInput] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeStudyMode, setActiveStudyMode] = useState<'flashcard' | 'quiz' | 'cram' | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);

  // Bài học đang chọn
  const currentLesson = lessons.find(l => l.id === selectedLessonId) || lessons[0];

  // 1. Tạo bài mới
  const handleCreateLesson = () => {
    const nextNumber = lessons.length + 1;
    const newLesson: CustomNotebookLesson = {
      id: `custom-lesson-${Date.now()}`,
      title: `Bài ${nextNumber}`,
      createdAt: new Date().toISOString(),
      words: []
    };
    const updated = [...lessons, newLesson];
    onUpdateNotebooks(updated);
    setSelectedLessonId(newLesson.id);
    setStatusMessage({ type: 'success', text: `Đã tạo bài mới: ${newLesson.title}` });
  };

  // 2. Đổi tên bài
  const handleStartRename = (lesson: CustomNotebookLesson) => {
    setEditingLessonId(lesson.id);
    setEditingTitle(lesson.title);
  };

  const handleSaveRename = (id: string) => {
    if (!editingTitle.trim()) {
      setEditingLessonId(null);
      return;
    }
    const updated = lessons.map(l => l.id === id ? { ...l, title: editingTitle.trim() } : l);
    onUpdateNotebooks(updated);
    setEditingLessonId(null);
  };

  // 3. Xóa bài
  const handleDeleteLesson = (id: string) => {
    if (lessons.length <= 1) {
      alert('Phải giữ lại ít nhất 1 bài trong sổ tay!');
      return;
    }
    if (confirm('Bạn có chắc chắn muốn xoá bài này cùng toàn bộ từ vựng bên trong?')) {
      const updated = lessons.filter(l => l.id !== id);
      onUpdateNotebooks(updated);
      setSelectedLessonId(updated[0].id);
      setStatusMessage({ type: 'success', text: 'Đã xoá bài học thành công.' });
    }
  };

  // 4. Xuất JSON của bài
  const handleExportLesson = (lesson: CustomNotebookLesson) => {
    const exportData = lesson.words.map(w => ({
      word: w.kanji,
      reading: w.kana,
      hanviet: w.hanviet || '',
      meaning: w.meaning,
      example: w.examples?.[0]?.ja || '',
      exampleMeaning: w.examples?.[0]?.vi || ''
    }));
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${lesson.title.replace(/\s+/g, '_')}_vocab.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // 5. Dùng thử demo
  const handleLoadDemo = () => {
    setJsonInput(DEMO_VOCAB_JSON);
    setStatusMessage({ type: 'success', text: 'Đã điền dữ liệu mẫu. Hãy bấm "Nhập dữ liệu vào hệ thống"!' });
  };

  // 6. Tính năng AI Format thông minh
  const handleAIFormat = () => {
    const raw = jsonInput.trim();
    if (!raw) {
      setStatusMessage({ type: 'error', text: 'Hãy nhập hoặc dán nội dung từ vựng trước khi bấm AI Format!' });
      return;
    }

    try {
      // Nếu đã là JSON thì format cho đẹp
      const parsed = JSON.parse(raw);
      setJsonInput(JSON.stringify(parsed, null, 2));
      setStatusMessage({ type: 'success', text: 'JSON đã được định dạng chuẩn đẹp!' });
      return;
    } catch {
      // Phân tích text tự do
      const lines = raw.split(/\r?\n/).filter(line => line.trim().length > 0);
      const formattedItems: Array<{
        word: string;
        reading: string;
        hanviet: string;
        meaning: string;
        example: string;
        exampleMeaning: string;
      }> = [];

      for (const line of lines) {
        let cleaned = line.replace(/^\d+[\.\-\)]\s*/, '').trim();
        let word = '';
        let reading = '';
        let hanviet = '';
        let meaning = '';
        let example = '';
        let exampleMeaning = '';

        // Tách câu ví dụ nếu có (dấu '|' hoặc 'VD:' hoặc 'Ví dụ:')
        const exampleSplit = cleaned.split(/\s*(?:\||VD:|Ví dụ:|Ví dụ\s*:)\s*/i);
        if (exampleSplit.length > 1) {
          cleaned = exampleSplit[0].trim();
          const rawEx = exampleSplit[1].trim();
          const exParts = rawEx.split(/[:\-–—]\s*/);
          example = exParts[0]?.trim() || '';
          exampleMeaning = exParts[1]?.trim() || '';
        }

        // Tách Hán Việt nếu có dạng [ĐỒ THƯ QUÁN] hoặc (ĐỒ THƯ QUÁN)
        const hanvietMatch = cleaned.match(/[\[\(]([A-ZÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴĐ\s]{2,})[\]\)]/);
        if (hanvietMatch) {
          hanviet = hanvietMatch[1].trim();
          cleaned = cleaned.replace(hanvietMatch[0], ' ').trim();
        }

        // Tách cách đọc nếu có trong ngoặc đơn (としょかん) hoặc [としょかん]
        const readingMatch = cleaned.match(/[\[\(]([\u3040-\u309F\u30A0-\u30FF\s]+)[\]\)]/);
        if (readingMatch) {
          reading = readingMatch[1].trim();
          cleaned = cleaned.replace(readingMatch[0], ' ').trim();
        }

        // Tách phần còn lại qua dấu tab, ' - ', ' : ', hoặc ','
        const parts = cleaned.split(/\t|\s+[-–—:]\s+|\s*,\s*/);
        if (parts.length >= 2) {
          word = parts[0].trim();
          if (!reading && parts.length >= 3) {
            reading = parts[1].trim();
            meaning = parts.slice(2).join(' - ').trim();
          } else {
            meaning = parts.slice(1).join(' - ').trim();
          }
        } else {
          word = cleaned;
        }

        if (!reading) {
          reading = word;
        }

        formattedItems.push({
          word,
          reading,
          hanviet,
          meaning,
          example,
          exampleMeaning
        });
      }

      if (formattedItems.length > 0) {
        setJsonInput(JSON.stringify(formattedItems, null, 2));
        setStatusMessage({ type: 'success', text: `AI đã tự động chuyển đổi ${formattedItems.length} từ vựng sang JSON chuẩn!` });
      } else {
        setStatusMessage({ type: 'error', text: 'Không nhận diện được từ vựng, vui lòng kiểm tra lại cấu trúc!' });
      }
    }
  };

  // 7. Nhập dữ liệu vào hệ thống
  const handleImportData = () => {
    if (!jsonInput.trim()) {
      setStatusMessage({ type: 'error', text: 'Vui lòng nhập JSON từ vựng vào ô bên dưới!' });
      return;
    }

    try {
      let parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed)) {
        parsed = [parsed];
      }

      if (parsed.length === 0) {
        setStatusMessage({ type: 'error', text: 'Dữ liệu JSON rỗng!' });
        return;
      }

      const newWords: WordItem[] = parsed.map((item: any, idx: number) => {
        const wordText = item.word || item.kanji || item.reading || item.kana || '';
        const kanaText = item.reading || item.kana || item.word || '';
        const meaningText = item.meaning || item.meaning_vi || item.vietnamese || '';
        const hanvietText = item.hanviet || '';

        const examples = item.example ? [{
          ja: item.example,
          kana: item.exampleReading || '',
          vi: item.exampleMeaning || ''
        }] : (Array.isArray(item.examples) ? item.examples : []);

        return {
          id: `custom-${currentLesson.id}-${Date.now()}-${idx}`,
          lesson: 1,
          level: 'Sổ tay',
          kanji: wordText,
          kana: kanaText,
          romaji: '',
          hanviet: hanvietText,
          meaning: meaningText,
          examples
        };
      });

      // Thêm vào bài hiện tại
      const updatedLessons = lessons.map(l => {
        if (l.id === currentLesson.id) {
          return {
            ...l,
            words: [...l.words, ...newWords]
          };
        }
        return l;
      });

      onUpdateNotebooks(updatedLessons);
      setJsonInput('');
      setStatusMessage({ 
        type: 'success', 
        text: `Đã nhập thành công ${newWords.length} từ vựng vào "${currentLesson.title}"!` 
      });
    } catch (e: any) {
      setStatusMessage({ 
        type: 'error', 
        text: `Lỗi cú pháp JSON: ${e?.message || 'Vui lòng kiểm tra lại dấu ngoặc và dấu phẩy'}` 
      });
    }
  };

  // 8. Xóa 1 từ khỏi bài
  const handleDeleteWord = (wordId: string) => {
    const updatedLessons = lessons.map(l => {
      if (l.id === currentLesson.id) {
        return {
          ...l,
          words: l.words.filter(w => w.id !== wordId)
        };
      }
      return l;
    });
    onUpdateNotebooks(updatedLessons);
  };

  // 9. Xóa toàn bộ từ trong bài
  const handleClearAllWords = () => {
    if (confirm(`Bạn có chắc muốn xoá toàn bộ ${currentLesson.words.length} từ trong "${currentLesson.title}"?`)) {
      const updatedLessons = lessons.map(l => {
        if (l.id === currentLesson.id) {
          return { ...l, words: [] };
        }
        return l;
      });
      onUpdateNotebooks(updatedLessons);
      setStatusMessage({ type: 'success', text: 'Đã dọn sạch từ vựng trong bài.' });
    }
  };

  // Lọc từ vựng trong bài để xem
  const filteredWords = currentLesson.words.filter(w => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      w.kanji.toLowerCase().includes(term) ||
      w.kana.toLowerCase().includes(term) ||
      w.meaning.toLowerCase().includes(term) ||
      (w.hanviet && w.hanviet.toLowerCase().includes(term))
    );
  });

  // NẾU ĐANG TRONG CHẾ ĐỘ LUYỆN TẬP
  if (activeStudyMode) {
    return (
      <div className="space-y-6">
        {/* Thanh điều hướng quay lại */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <button
            onClick={() => setActiveStudyMode(null)}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-bold text-sm transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← Quay lại sổ tay từ vựng</span>
          </button>

          <div className="flex items-center space-x-2 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold">
              {currentLesson.title}
            </span>
            <span className="text-slate-400 font-medium">
              ({currentLesson.words.length} từ vựng)
            </span>
          </div>
        </div>

        {/* 1. Flashcard 3D */}
        {activeStudyMode === 'flashcard' && (
          <FlashcardView
            words={currentLesson.words}
            masteredWords={masteredWords}
            favoriteWords={favoriteWords}
            onToggleMaster={onToggleMaster}
            onToggleFavorite={onToggleFavorite}
          />
        )}

        {/* 2. Trắc nghiệm Quiz */}
        {activeStudyMode === 'quiz' && (
          <PracticeView
            words={currentLesson.words}
            mistakeWords={mistakeWords}
            onAddMistake={onAddMistake}
            onRemoveMistake={onRemoveMistake}
            onSaveQuizScore={(score, total) => onSaveQuizScore(score, total, `Sổ tay - ${currentLesson.title}`)}
          />
        )}

        {/* 3. Nhồi nhét Cramming */}
        {activeStudyMode === 'cram' && (
          <CrammingModeView
            words={currentLesson.words}
            onFinish={(score, total) => onSaveQuizScore(score, total, `Sổ tay Nhồi nhét - ${currentLesson.title}`)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header trang Sổ tay */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <span>🎴</span>
            <span>Tạo sổ tay từ vựng</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Tự nhập từ vựng và chọn chế độ học phù hợp
          </p>
        </div>
      </div>

      {/* 1. KHU VỰC DANH SÁCH BÀI HỌC */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Danh sách bài
          </h2>
          <button
            onClick={handleCreateLesson}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-bold text-xs hover:bg-slate-50 dark:hover:bg-zinc-750 transition shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tạo bài mới</span>
          </button>
        </div>

        {/* Cards danh sách bài */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {lessons.map(lesson => {
            const isSelected = lesson.id === currentLesson.id;
            const isEditing = editingLessonId === lesson.id;

            return (
              <div
                key={lesson.id}
                onClick={() => !isEditing && setSelectedLessonId(lesson.id)}
                className={`cursor-pointer rounded-2xl p-4 border transition-all duration-200 relative ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/20 dark:bg-blue-950/20 shadow-xs ring-1 ring-blue-500'
                    : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-slate-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 mr-2">
                    {isEditing ? (
                      <div className="flex items-center space-x-1" onClick={e => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={e => setEditingTitle(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleSaveRename(lesson.id)}
                          className="w-full text-xs font-bold px-2 py-1 rounded border border-blue-400 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white focus:outline-hidden"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveRename(lesson.id)}
                          className="p-1 rounded bg-blue-500 text-white hover:bg-blue-600"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <h3 className={`text-sm font-bold truncate ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-zinc-200'}`}>
                          {lesson.title}
                        </h3>
                        <p className={`text-xs mt-1 ${isSelected ? 'text-blue-500/80 dark:text-blue-400/80 font-medium' : 'text-slate-400'}`}>
                          {lesson.words.length} từ vựng
                        </p>
                      </>
                    )}
                  </div>

                  {/* Hành động (Sửa tên, Xuất JSON, Xoá) */}
                  <div className="flex items-center space-x-1 text-slate-400" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => handleStartRename(lesson)}
                      title="Đổi tên bài"
                      className="p-1 rounded-md hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleExportLesson(lesson)}
                      title="Xuất file JSON bài này"
                      className="p-1 rounded-md hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    {lessons.length > 1 && (
                      <button
                        onClick={() => handleDeleteLesson(lesson.id)}
                        title="Xoá bài này"
                        className="p-1 rounded-md hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. KHU VỰC NHẬP TỪ VỰNG (JSON) */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
              <span>Nhập từ vựng (JSON)</span>
            </h2>
            <button
              onClick={() => setShowHelpModal(!showHelpModal)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 transition"
              title="Hướng dẫn định dạng JSON"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleLoadDemo}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-700/60 bg-amber-50/60 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 font-bold text-xs hover:bg-amber-100 dark:hover:bg-amber-950/50 transition shadow-2xs"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Dùng thử demo</span>
          </button>
        </div>

        {/* Hướng dẫn khi bấm dấu ? */}
        {showHelpModal && (
          <div className="bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-2xl p-4 text-xs space-y-2 text-slate-700 dark:text-zinc-300">
            <div className="font-bold flex items-center space-x-1 text-slate-900 dark:text-white">
              <FileCode className="w-4 h-4 text-blue-500" />
              <span>Cấu trúc chuẩn của 1 từ vựng:</span>
            </div>
            <pre className="bg-white dark:bg-zinc-900 p-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-[11px] overflow-x-auto text-emerald-600 dark:text-emerald-400 font-mono">
{`{
  "word": "図書館",                // Kanji hoặc từ tiếng Nhật
  "reading": "としょかん",          // Cách đọc Hiragana
  "hanviet": "ĐỒ THƯ QUÁN",        // Âm Hán Việt (tùy chọn)
  "meaning": "Thư viện",           // Nghĩa tiếng Việt
  "example": "図書館で本を読みます",  // Câu ví dụ (tùy chọn)
  "exampleMeaning": "Tôi đọc sách ở thư viện"
}`}
            </pre>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              💡 Mẹo: Bạn có thể copy dạng text tự do (VD: `図書館 - としょかん - Thư viện`) rồi bấm <strong>AI Format</strong> để hệ thống tự động chuẩn hoá!
            </p>
          </div>
        )}

        {/* Cảnh báo màu vàng cam */}
        <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-3.5 flex items-start space-x-2.5 text-xs text-amber-800 dark:text-amber-300">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
          <p className="leading-relaxed">
            Âm thanh được tạo tự động theo <strong>word</strong> và <strong>reading</strong> — nhập sai format (reading không khớp với từ, gõ sai kana, ghi nhiều cách đọc trong một ô...) thì âm thanh sẽ không đúng.
          </p>
        </div>

        {/* Khung Textarea JSON */}
        <div className="relative">
          <textarea
            value={jsonInput}
            onChange={e => setJsonInput(e.target.value)}
            rows={7}
            placeholder={`[\n  {\n    "word": "図書館",\n    "reading": "としょかん",\n    "hanviet": "ĐỒ THƯ QUÁN",\n    "meaning": "Thư viện",\n    "example": "図書館で本を読みます",\n    "exampleMeaning": "Tôi đọc sách ở thư viện"\n  }\n]`}
            className="w-full font-mono text-xs p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition leading-relaxed resize-y"
          />
        </div>

        {/* Thông báo trạng thái nếu có */}
        {statusMessage && (
          <div className={`p-3 rounded-xl text-xs font-semibold flex items-center space-x-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
          }`}>
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Nút Nhập dữ liệu & AI Format */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <button
            onClick={handleImportData}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-sm transition active:scale-98"
          >
            <span>🩺</span>
            <span>Nhập dữ liệu vào hệ thống</span>
          </button>

          <button
            onClick={handleAIFormat}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 font-bold text-xs sm:text-sm hover:bg-purple-100 dark:hover:bg-purple-950/60 transition active:scale-98"
          >
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span>AI Format</span>
          </button>
        </div>
      </div>

      {/* 3. DANH SÁCH TỪ VỰNG TRONG BÀI ĐÃ CHỌN */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Từ vựng trong {currentLesson.title}
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-bold">
              {currentLesson.words.length} từ
            </span>
          </div>

          {currentLesson.words.length > 0 && (
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm từ vựng..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <button
                onClick={handleClearAllWords}
                className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition whitespace-nowrap"
              >
                Dọn sạch bài
              </button>
            </div>
          )}
        </div>

        {/* Nội dung danh sách */}
        {currentLesson.words.length === 0 ? (
          <div className="text-center py-10 px-4 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 text-slate-400 dark:text-zinc-500 text-sm">
            Chưa có từ vựng nào. Hãy thêm từ vựng để bắt đầu học.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-zinc-800/80 border border-slate-100 dark:border-zinc-800 rounded-2xl overflow-hidden max-h-96 overflow-y-auto">
            {filteredWords.map((word, idx) => (
              <div 
                key={word.id || idx} 
                className="p-3.5 flex items-center justify-between hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <button
                    onClick={() => speakJapanese(word.kana || word.kanji)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-rose-500 transition shrink-0"
                    title="Nghe phát âm"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-baseline space-x-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white font-jp">
                        {word.kanji}
                      </span>
                      {word.kana && word.kana !== word.kanji && (
                        <span className="text-xs text-rose-500 dark:text-rose-400 font-jp">
                          【{word.kana}】
                        </span>
                      )}
                      {word.hanviet && (
                        <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase">
                          {word.hanviet}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-zinc-300 truncate mt-0.5">
                      {word.meaning}
                    </p>
                    {word.examples?.[0]?.ja && (
                      <p className="text-[11px] text-slate-400 dark:text-zinc-500 italic mt-0.5 truncate">
                        {word.examples[0].ja} — {word.examples[0].vi}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteWord(word.id)}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition shrink-0"
                  title="Xoá từ này"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. KHU VỰC CHỌN CHẾ ĐỘ HỌC */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        {/* Banner lưu ý bộ gõ tiếng Việt */}
        <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-3 flex items-center space-x-2 text-xs text-amber-800 dark:text-amber-300 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
          <span>Dùng bộ gõ tiếng Việt cho chế độ học nhồi nhét</span>
        </div>

        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          Chọn chế độ học
        </h2>

        {/* Cảnh báo khi chưa đủ từ */}
        {currentLesson.words.length === 0 ? (
          <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/30 rounded-2xl p-3.5 flex items-center space-x-2 text-xs text-amber-800 dark:text-amber-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
            <span>Cần ít nhất 1 từ vựng để bắt đầu học</span>
          </div>
        ) : null}

        {/* 3 Thẻ chế độ học */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* Card 1: Flashcard */}
          <div className="rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/30 dark:bg-blue-950/20 p-5 flex flex-col justify-between space-y-4 transition hover:shadow-xs">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 font-bold">
                <Layers className="w-5 h-5" />
                <h3 className="text-base">Flashcard</h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                Lật thẻ để xem đáp án. Phù hợp để làm quen với từ vựng mới.
              </p>
            </div>

            <button
              disabled={currentLesson.words.length === 0}
              onClick={() => setActiveStudyMode('flashcard')}
              className={`w-full py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white transition shadow-sm ${
                currentLesson.words.length === 0
                  ? 'bg-slate-300 dark:bg-zinc-700 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 active:scale-98'
              }`}
            >
              Bắt đầu Flashcard
            </button>
          </div>

          {/* Card 2: Trắc nghiệm */}
          <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950/20 p-5 flex flex-col justify-between space-y-4 transition hover:shadow-xs">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold">
                <Target className="w-5 h-5" />
                <h3 className="text-base">Trắc nghiệm</h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                Xem từ vựng, chọn cách đọc. Kiểm tra nhanh kiến thức.
              </p>
            </div>

            <button
              disabled={currentLesson.words.length === 0}
              onClick={() => setActiveStudyMode('quiz')}
              className={`w-full py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white transition shadow-sm ${
                currentLesson.words.length === 0
                  ? 'bg-slate-300 dark:bg-zinc-700 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-600 active:scale-98'
              }`}
            >
              Bắt đầu Trắc nghiệm
            </button>
          </div>

          {/* Card 3: Nhồi nhét */}
          <div className="rounded-2xl border border-orange-200 dark:border-orange-900/50 bg-orange-50/30 dark:bg-orange-950/20 p-5 flex flex-col justify-between space-y-4 transition hover:shadow-xs">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-orange-600 dark:text-orange-400 font-bold">
                <Zap className="w-5 h-5" />
                <h3 className="text-base">Nhồi nhét</h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                Gõ đáp án để ghi nhớ sâu hơn. Dành cho người muốn thử thách.
              </p>
            </div>

            <button
              disabled={currentLesson.words.length === 0}
              onClick={() => setActiveStudyMode('cram')}
              className={`w-full py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white transition shadow-sm ${
                currentLesson.words.length === 0
                  ? 'bg-slate-300 dark:bg-zinc-700 cursor-not-allowed'
                  : 'bg-orange-400 hover:bg-orange-500 active:scale-98'
              }`}
            >
              Bắt đầu Nhồi nhét
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
