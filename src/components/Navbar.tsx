import React from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Gamepad2, 
  Flame, 
  Moon, 
  Sun, 
  User,
  Share2
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'tango' | 'kanji' | 'practice';
  setActiveTab: (tab: 'tango' | 'kanji' | 'practice') => void;
  streak: number;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  onOpenAuth: () => void;
  onOpenBackup: () => void;
  userEmail?: string | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  streak,
  isDarkMode,
  setIsDarkMode,
  onOpenAuth,
  onOpenBackup,
  userEmail
}) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-zinc-900/80 border-b border-slate-200 dark:border-zinc-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('tango')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-rose-600 flex items-center justify-center text-white shadow-md shadow-rose-500/20 font-jp font-bold text-xl">
            日
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-rose-600 to-orange-600 dark:from-rose-400 dark:to-orange-400 bg-clip-text text-transparent">
                LearnJPD
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium hidden sm:block">
              Học Tiếng Nhật & Kanji Thông Minh
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1 sm:space-x-2 bg-slate-100 dark:bg-zinc-800/60 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('tango')}
            className={`flex items-center space-x-2 px-3 sm:px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'tango'
                ? 'bg-white dark:bg-zinc-700 text-rose-600 dark:text-rose-400 shadow-sm'
                : 'text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Từ vựng (Tango)</span>
          </button>

          <button
            onClick={() => setActiveTab('kanji')}
            className={`flex items-center space-x-2 px-3 sm:px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'kanji'
                ? 'bg-white dark:bg-zinc-700 text-rose-600 dark:text-rose-400 shadow-sm'
                : 'text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Chữ Hán (Kanji)</span>
          </button>

          <button
            onClick={() => setActiveTab('practice')}
            className={`flex items-center space-x-2 px-3 sm:px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'practice'
                ? 'bg-white dark:bg-zinc-700 text-rose-600 dark:text-rose-400 shadow-sm'
                : 'text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Luyện tập</span>
          </button>
        </nav>

        {/* Right Tools (Streak, DarkMode, Cloud/Auth, Backup) */}
        <div className="flex items-center space-x-2">
          {/* Streak pill */}
          <div 
            title={`Chuỗi ${streak} ngày học liên tục!`}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-xs"
          >
            <Flame className="w-4 h-4 fill-current animate-pulse text-amber-500" />
            <span>{streak}</span>
          </div>

          {/* Backup & Sync button */}
          <button
            onClick={onOpenBackup}
            title="Sao lưu / Khôi phục dữ liệu"
            className="p-2 rounded-xl text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Dark mode toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            title="Đổi giao diện Sáng / Tối"
            className="p-2 rounded-xl text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Supabase Auth / Profile */}
          <button
            onClick={onOpenAuth}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              userEmail
                ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-50 dark:bg-zinc-800 text-rose-600 dark:text-zinc-300 hover:bg-rose-100 dark:hover:bg-zinc-700'
            }`}
          >
            {userEmail ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="max-w-[80px] truncate sm:max-w-none">{userEmail.split('@')[0]}</span>
              </>
            ) : (
              <>
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Đăng nhập</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
