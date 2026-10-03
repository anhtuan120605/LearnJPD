import React, { useState, useRef, useEffect } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Zap, 
  Flame, 
  Moon, 
  Sun, 
  User, 
  Share2, 
  Bookmark, 
  LayoutDashboard, 
  AlertCircle, 
  Crown, 
  Clock,
  ChevronDown,
  LogOut,
  ExternalLink,
  SlidersHorizontal,
  Check
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
  dueSrsCount?: number;
  onOpenSrsReview?: () => void;
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
  dueSrsCount = 0,
  onOpenSrsReview,
  hasAdminAccess = false,
  isAdminEditMode = false,
  onToggleAdminEditMode,
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Đóng profile dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  // Lấy chữ cái đầu của email làm avatar
  const avatarLetter = userEmail ? userEmail.charAt(0).toUpperCase() : null;

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#faf9f5]/85 dark:bg-[#0b0f19]/85 border-b border-stone-200/60 dark:border-stone-800/60 transition-colors pt-[env(safe-area-inset-top,0px)]">
      <div className="max-w-[1400px] mx-auto px-3.5 sm:px-8 h-16 sm:h-19 flex items-center justify-between gap-3">
        
        {/* Brand / Logo (Left) */}
        <div 
          className="flex items-center space-x-2.5 sm:space-x-3.5 cursor-pointer select-none group shrink-0" 
          onClick={() => setActiveTab('tango')}
        >
          {/* Logo Squircle with Gradient & Ring */}
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-stone-900 via-stone-800 to-indigo-950 dark:from-indigo-600 dark:via-indigo-700 dark:to-purple-900 flex items-center justify-center text-white shadow-md shadow-stone-900/10 dark:shadow-indigo-900/30 font-jp font-black text-xl sm:text-2xl tracking-wider transition-all duration-300 group-hover:scale-105 group-hover:rotate-[-2deg] ring-1 ring-white/10 shrink-0">
            日
          </div>
          <div>
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <span className="font-black text-lg sm:text-xl tracking-tight text-stone-900 dark:text-stone-50 font-sans">
                Learn<span className="bg-gradient-to-r from-indigo-600 to-rose-500 bg-clip-text text-transparent">JPD</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-indigo-500/10 dark:bg-indigo-400/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                Zen
              </span>
            </div>
            <p className="text-[11px] text-stone-400 dark:text-stone-400 font-medium hidden sm:block -mt-0.5">
              Học Tiếng Nhật Trọng Tâm
            </p>
          </div>
        </div>

        {/* 3 Core Tabs (Center - Desktop only) */}
        <nav className="hidden md:flex items-center bg-stone-200/50 dark:bg-stone-900/60 p-1.5 rounded-2xl border border-stone-200/60 dark:border-stone-800/60 text-sm font-bold gap-1 shadow-2xs backdrop-blur-md">
          <button
            onClick={() => setActiveTab('tango')}
            className={`flex items-center space-x-2 px-5 py-2 rounded-xl transition-all duration-200 ${
              activeTab === 'tango'
                ? 'bg-white dark:bg-stone-800 text-indigo-600 dark:text-indigo-300 shadow-xs font-extrabold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Bài học</span>
          </button>

          <button
            onClick={() => setActiveTab('kanji')}
            className={`flex items-center space-x-2 px-5 py-2 rounded-xl transition-all duration-200 ${
              activeTab === 'kanji'
                ? 'bg-white dark:bg-stone-800 text-rose-600 dark:text-rose-400 shadow-xs font-extrabold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Chữ Hán</span>
          </button>

          <button
            onClick={() => setActiveTab('practice')}
            className={`flex items-center space-x-2 px-5 py-2 rounded-xl transition-all duration-200 relative ${
              activeTab === 'practice'
                ? 'bg-white dark:bg-stone-800 text-emerald-600 dark:text-emerald-400 shadow-xs font-extrabold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Ôn luyện</span>
            {dueSrsCount > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 absolute top-1.5 right-1.5 ring-2 ring-white dark:ring-stone-800" />
            )}
          </button>

          {/* Tab phụ: Sổ tay hoặc Cá nhân khi đang mở */}
          {(activeTab === 'notebook' || activeTab === 'dashboard') && (
            <span className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 shadow-xs font-bold ml-1 border border-stone-200/80 dark:border-stone-700/80">
              {activeTab === 'notebook' ? (
                <>
                  <Bookmark className="w-4 h-4 text-amber-500" />
                  <span>Sổ tay</span>
                </>
              ) : (
                <>
                  <LayoutDashboard className="w-4 h-4 text-indigo-500" />
                  <span>Cá nhân</span>
                </>
              )}
            </span>
          )}
        </nav>

        {/* Right Area: Unified Glass Action Cluster */}
        <div className="flex items-center space-x-2 sm:space-x-2.5 shrink-0">
          
          {/* SRS Quick Button (Chỉ hiện khi có từ cần ôn) */}
          {dueSrsCount > 0 && onOpenSrsReview && (
            <button
              onClick={onOpenSrsReview}
              title={`Bạn có ${dueSrsCount} mục đến hạn ôn tập ngắt quãng (SRS)`}
              className="flex items-center space-x-1 sm:space-x-1.5 px-2.5 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-extrabold transition border border-indigo-500/20 active:scale-95"
            >
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500 animate-pulse" />
              <span className="font-mono text-xs">{dueSrsCount}</span>
            </button>
          )}

          {/* Mistake Bank Button (Chỉ hiện khi có từ sai) */}
          {mistakeCount > 0 && onOpenMistakeBank && (
            <button
              onClick={onOpenMistakeBank}
              title={`Bạn có ${mistakeCount} từ trong Kho từ sai`}
              className="flex items-center space-x-1 sm:space-x-1.5 px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-extrabold transition border border-rose-500/20 active:scale-95"
            >
              <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500" />
              <span className="font-mono text-xs">{mistakeCount}</span>
            </button>
          )}

          {/* Streak Badge - Minimalist Apple Pill */}
          <div 
            title={streak > 0 ? `Xuất sắc! Chuỗi ${streak} ngày học liên tục` : 'Học bài hôm nay để bắt đầu chuỗi ngọn lửa!'}
            className={`flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold transition border ${
              streak > 0
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25 shadow-2xs'
                : 'bg-stone-100/80 dark:bg-stone-800/80 text-stone-400 dark:text-stone-500 border-stone-200/60 dark:border-stone-700/60'
            }`}
          >
            <Flame className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${streak > 0 ? 'text-amber-500 fill-amber-500 animate-bounce' : 'text-stone-400'}`} />
            <span className="font-mono">{streak}</span>
          </div>

          {/* Quick Dark Mode Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            title={isDarkMode ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-stone-100/80 dark:bg-stone-800/80 hover:bg-stone-200/60 dark:hover:bg-stone-700/60 text-stone-600 dark:text-stone-300 border border-stone-200/60 dark:border-stone-700/60 transition shadow-2xs active:scale-95"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-600 dark:text-stone-300" />}
          </button>

          {/* Profile Menu Trigger (Dropdown) */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setIsProfileMenuOpen((prev) => !prev)}
              className="flex items-center space-x-1.5 sm:space-x-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-stone-100/80 dark:bg-stone-800/80 hover:bg-stone-200/60 dark:hover:bg-stone-700/60 border border-stone-200/60 dark:border-stone-700/60 text-stone-700 dark:text-stone-200 transition shadow-2xs active:scale-95"
            >
              {avatarLetter ? (
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-xs shadow-xs ring-1 ring-white/20">
                  {avatarLetter}
                </div>
              ) : (
                <div className="w-7 h-7 rounded-lg bg-stone-200/80 dark:bg-stone-700 text-stone-600 dark:text-stone-300 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
              )}
              <span className="text-xs font-bold hidden md:inline max-w-[110px] truncate">
                {userEmail ? userEmail.split('@')[0] : 'Tài khoản'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400 transition-transform duration-200 hidden sm:block" style={{ transform: isProfileMenuOpen ? 'rotate(180deg)' : 'none' }} />
            </button>

            {/* Profile Dropdown Drawer */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Account info section */}
                <div className="px-4 py-2.5 border-b border-stone-100 dark:border-stone-800">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                    Tài khoản
                  </div>
                  {userEmail ? (
                    <div className="mt-1">
                      <p className="text-xs font-bold text-stone-800 dark:text-stone-200 truncate">
                        {userEmail}
                      </p>
                      <span className="inline-block mt-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                        ✓ Đã đồng bộ Cloud
                      </span>
                    </div>
                  ) : (
                    <div className="mt-1">
                      <p className="text-xs text-stone-600 dark:text-stone-400">
                        Khách (Chưa đồng bộ)
                      </p>
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          onOpenAuth();
                        }}
                        className="mt-2 w-full py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition"
                      >
                        Đăng nhập / Đăng ký
                      </button>
                    </div>
                  )}
                </div>

                {/* Main Navigation Links in Menu */}
                <div className="py-1 text-xs">
                  <button
                    onClick={() => {
                      setActiveTab('notebook');
                      setIsProfileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2 text-left hover:bg-stone-100 dark:hover:bg-stone-800/80 transition ${
                      activeTab === 'notebook' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Bookmark className="w-4 h-4 text-amber-500" />
                      <span>Sổ tay từ vựng tự tạo</span>
                    </div>
                    {activeTab === 'notebook' && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('dashboard');
                      setIsProfileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2 text-left hover:bg-stone-100 dark:hover:bg-stone-800/80 transition ${
                      activeTab === 'dashboard' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <LayoutDashboard className="w-4 h-4 text-indigo-500" />
                      <span>Thống kê & Tiến độ cá nhân</span>
                    </div>
                    {activeTab === 'dashboard' && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onOpenBackup();
                    }}
                    className="w-full flex items-center space-x-2.5 px-4 py-2 text-left text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/80 transition"
                  >
                    <Share2 className="w-4 h-4 text-blue-500" />
                    <span>Sao lưu & Khôi phục dữ liệu</span>
                  </button>
                </div>

                {/* Dark mode switch in dropdown */}
                <div className="px-4 py-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs">
                  <span className="text-stone-600 dark:text-stone-400 flex items-center space-x-2">
                    {isDarkMode ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
                    <span>Giao diện {isDarkMode ? 'Tối' : 'Sáng'}</span>
                  </span>
                  <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                      isDarkMode ? 'bg-indigo-600' : 'bg-stone-300'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        isDarkMode ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Admin Mode Toggle (If user has access) */}
                {hasAdminAccess && (
                  <div className="px-4 py-2 border-t border-stone-100 dark:border-stone-800 text-xs">
                    <button
                      onClick={() => {
                        if (onToggleAdminEditMode) onToggleAdminEditMode();
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between py-1 text-amber-600 dark:text-amber-400 font-bold hover:opacity-80 transition"
                    >
                      <div className="flex items-center space-x-2">
                        <Crown className="w-4 h-4 fill-amber-500/20" />
                        <span>Chế độ Quản trị (Admin)</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        isAdminEditMode ? 'bg-amber-500 text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-500'
                      }`}>
                        {isAdminEditMode ? 'BẬT' : 'TẮT'}
                      </span>
                    </button>
                  </div>
                )}

                {/* Logout or Account settings */}
                {userEmail && (
                  <div className="px-4 pt-2 border-t border-stone-100 dark:border-stone-800">
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onOpenAuth();
                      }}
                      className="w-full text-left py-1 text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-300 transition"
                    >
                      Quản lý tài khoản / Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
