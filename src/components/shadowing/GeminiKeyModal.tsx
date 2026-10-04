import React, { useState, useEffect } from 'react';
import { Key, Sparkles, CheckCircle2, AlertCircle, ExternalLink, X, Eye, EyeOff, Trash2 } from 'lucide-react';
import { getGeminiApiKey, saveGeminiApiKey, removeGeminiApiKey, validateGeminiApiKey } from '../../lib/geminiVideoService';

interface GeminiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved?: () => void;
}

export const GeminiKeyModal: React.FC<GeminiKeyModalProps> = ({ isOpen, onClose, onKeySaved }) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ valid: boolean; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const current = getGeminiApiKey();
      setApiKey(current);
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestAndSave = async () => {
    if (!apiKey.trim()) {
      setTestResult({ valid: false, message: 'Vui lòng nhập API Key trước khi lưu.' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const res = await validateGeminiApiKey(apiKey.trim());
    setIsTesting(false);
    setTestResult(res);

    if (res.valid) {
      saveGeminiApiKey(apiKey.trim());
      if (onKeySaved) onKeySaved();
      setTimeout(() => {
        onClose();
      }, 1200);
    }
  };

  const handleRemove = () => {
    removeGeminiApiKey();
    setApiKey('');
    setTestResult({ valid: true, message: 'Đã xoá API Key khỏi trình duyệt này.' });
    if (onKeySaved) onKeySaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 p-6 sm:p-7 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow decoration */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
              <span>Cấu hình Gemini API Key</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Miễn phí
              </span>
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Dùng để AI tự nghe, tách câu và dịch video YouTube của bạn
            </p>
          </div>
        </div>

        {/* Guide Steps */}
        <div className="mb-5 p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/60 text-xs text-stone-600 dark:text-stone-300 space-y-2">
          <div className="font-bold text-stone-800 dark:text-stone-200 flex items-center justify-between">
            <span>Cách lấy API Key miễn phí (mất 30 giây):</span>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline inline-flex items-center gap-1"
            >
              <span>Mở Google AI Studio</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-stone-500 dark:text-stone-400 pl-1 leading-relaxed">
            <li>Truy cập <b className="text-stone-700 dark:text-stone-200">Google AI Studio</b> bằng tài khoản Google bất kỳ.</li>
            <li>Bấm nút xanh <b className="text-stone-700 dark:text-stone-200">"Create API key"</b> (Không cần nhập thẻ ngân hàng).</li>
            <li>Copy chuỗi ký tự <code className="bg-stone-200 dark:bg-stone-700 px-1 rounded text-[11px]">AIzaSy...</code> và dán vào ô dưới đây.</li>
          </ol>
        </div>

        {/* Input Field */}
        <div className="space-y-2 mb-4">
          <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center justify-between">
            <span>Google Gemini API Key:</span>
            {apiKey && (
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-normal">
                ✓ Được lưu an toàn trên máy bạn
              </span>
            )}
          </label>
          <div className="relative flex items-center">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setTestResult(null);
              }}
              placeholder="Dán key bắt đầu bằng AIzaSy..."
              className="w-full px-3.5 py-2.5 pr-10 text-xs font-mono rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Test Result Message */}
        {testResult && (
          <div
            className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${testResult.valid
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/30'
              }`}
          >
            {testResult.valid ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            )}
            <span className="leading-snug">{testResult.message}</span>
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2">
          {apiKey ? (
            <button
              type="button"
              onClick={handleRemove}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xoá Key</span>
            </button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
            >
              Đóng
            </button>
            <button
              type="button"
              disabled={isTesting || !apiKey.trim()}
              onClick={handleTestAndSave}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md shadow-indigo-600/20 disabled:opacity-50 disabled:pointer-events-none transition active:scale-95 flex items-center gap-1.5"
            >
              {isTesting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Đang kiểm tra...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Kiểm tra & Lưu</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
