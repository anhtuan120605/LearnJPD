import React, { useRef } from 'react';
import { UserProgress } from '../types';
import { exportProgressJSON, importProgressJSON } from '../lib/storage';
import { X, Download, Upload, ShieldCheck, Database } from 'lucide-react';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: UserProgress;
  onProgressImported: (p: UserProgress) => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  progress,
  onProgressImported
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    exportProgressJSON(progress);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await importProgressJSON(file);
      onProgressImported(imported);
      alert('Khôi phục tiến độ học tập thành công!');
      onClose();
    } catch (err) {
      alert('File backup không hợp lệ hoặc bị lỗi!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Sao Lưu & Khôi Phục Tiến Độ
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
          Bạn có thể xuất toàn bộ tiến độ từ vựng, thẻ Kanji đã thuộc, và lịch sử quiz thành file `.json` để cất giữ hoặc chuyển sang máy tính/điện thoại khác mà không cần đăng nhập.
        </p>

        <div className="space-y-3">
          {/* Nút Xuất file */}
          <button
            onClick={handleExport}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-bold text-sm transition"
          >
            <Download className="w-4 h-4 text-rose-500" />
            <span>Tải về file sao lưu (Export JSON)</span>
          </button>

          {/* Nút Nhập file */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl border border-dashed border-slate-300 dark:border-zinc-700 hover:border-rose-400 text-slate-600 dark:text-zinc-300 font-bold text-sm transition"
          >
            <Upload className="w-4 h-4 text-emerald-500" />
            <span>Khôi phục từ file có sẵn (Import JSON)</span>
          </button>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 text-xs flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 flex-shrink-0" />
          <span>Dữ liệu được lưu trữ an toàn, bảo mật 100% trên thiết bị của bạn.</span>
        </div>
      </div>
    </div>
  );
};
