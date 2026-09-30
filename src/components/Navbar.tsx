import { 
  BookOpen, 
  Sparkles, 
  Gamepad2, 
  Flame, 
  Moon, 
  Sun, 
  User,
  Share2,
  Bookmark,
  LayoutDashboard,
  AlertCircle,
  Crown
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'tango' | 'kanji' | 'practice' | 'notebook' | 'dashboard';
  setActiveTab: (tab: 'tango' | 'kanji' | 'practice' | 'notebook' | 'dashboard') => void;
  streak: number;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  onOpenAuth: () => void;
  onOpenBackup: () => void;
  userEmail?: string | null;
  mistakeCount?: number;
  onOpenMistakeBank?: () => void;
  hasAdminAccess?: boolean;
  isAdminEditMode?: boolean;
  onToggleAdminEditMode?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  streak,
  isDarkMode,
  setIsDarkMode,
  onOpenAuth,
  onOpenBackup,
  userEmail,
  mistakeCount = 0,
  onOpenMistakeBank,
  hasAdminAccess = false,
  isAdminEditMode = false,
  onToggleAdminEditMode,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-[#0f172a]/80 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('tango')}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25 font-jp font-bold text-xl">
            日
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 dark:from-sky-400 dark:via-blue-300 dark:to-indigo-300 bg-clip-text text-transparent">
                LearnJPD
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-sky-400 border border-blue-200/60 dark:border-blue-800/50">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
              Học Tiếng Nhật & Kanji Thông Minh
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1 sm:space-x-2 bg-slate-100/90 dark:bg-slate-800/70 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-700/50">
          <button
            onClick={() => setActiveTab('tango')}
            className={`flex items-center space-x-2 px-3 sm:px-4 py-1.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'tango'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-sky-400 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Từ vựng</span>
          </button>

          <button
            onClick={() => setActiveTab('kanji')}
            className={`flex items-center space-x-2 px-3 sm:px-4 py-1.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'kanji'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-sky-400 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Chữ Hán</span>
          </button>

          <button
            onClick={() => setActiveTab('notebook')}
            className={`flex items-center space-x-2 px-3 sm:px-4 py-1.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'notebook'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-sky-400 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Sổ tay</span>
          </button>

          <button
            onClick={() => setActiveTab('practice')}
            className={`flex items-center space-x-2 px-3 sm:px-4 py-1.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'practice'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-sky-400 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Luyện tập</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center space-x-2 px-3 sm:px-4 py-1.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'dashboard'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-sky-400 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Cá nhân</span>
          </button>
        </nav>

        {/* Right Tools (Streak, DarkMode, Cloud/Auth, Backup) */}
        <div className="flex items-center space-x-2">
          {/* Nút Kho từ hay sai nếu có từ sai */}
          {mistakeCount > 0 && onOpenMistakeBank && (
            <button
              onClick={onOpenMistakeBank}
              title={`Bạn có ${mistakeCount} từ cần phục hồi! Bấm để mở Kho từ hay sai.`}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-bold transition group"
            >
              <AlertCircle className="w-4 h-4 text-rose-500 animate-pulse" />
              <span className="font-mono">{mistakeCount}</span>
            </button>
          )}

          {/* Streak pill */}
          <div 
            title={`Chuỗi ${streak} ngày học liên tục!`}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-xs"
          >
            <Flame className="w-4 h-4 fill-current text-amber-500 animate-pulse" />
            <span>{streak}</span>
          </div>

          {/* Backup & Sync button */}
          <button
            onClick={onOpenBackup}
            title="Sao lưu / Khôi phục dữ liệu"
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Dark mode toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            title="Đổi giao diện Sáng / Tối"
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Supabase Auth / Profile */}
          <button
            onClick={onOpenAuth}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-2xl text-xs font-semibold transition ${
              userEmail
                ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                : 'bg-blue-50 dark:bg-slate-800/80 border border-blue-200/60 dark:border-slate-700 text-blue-600 dark:text-sky-300 hover:bg-blue-100 dark:hover:bg-slate-700'
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

          {/* Logo Admin nhỏ gọn tinh tế: Chỉ DUY NHẤT anhtuan120605@gmail.com */}
          {hasAdminAccess && (
            <button
              onClick={onToggleAdminEditMode}
              title={
                isAdminEditMode
                  ? 'Chế độ Sửa từ vựng: ĐANG BẬT (Bấm để tắt)'
                  : 'Quyền Quản trị viên: Bấm vào logo để bật sửa từ vựng'
              }
              className={`p-2 rounded-xl transition-all duration-200 active:scale-90 relative flex items-center justify-center ${
                isAdminEditMode
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25 ring-2 ring-amber-400'
                  : 'text-amber-500 hover:text-amber-600 hover:bg-amber-500/10 dark:hover:bg-amber-500/20'
              }`}
            >
              <Crown className={`w-4 h-4 ${isAdminEditMode ? 'fill-slate-950 stroke-[2.2]' : 'fill-amber-500/20 stroke-[2]'}`} />
              {isAdminEditMode && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
