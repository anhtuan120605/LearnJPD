import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  ChevronRight,
  LogOut,
  ExternalLink,
  SlidersHorizontal,
  Check,
  Menu,
  X,
  Keyboard,
  Headphones,
  RotateCcw,
  Trophy,
  Scroll,
  FileText
} from 'lucide-react';
import { LevelMegaMenu, LevelAction } from './LevelMegaMenu';

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
  currentCourse?: string;
  onSelectCourse?: (courseKey: string) => void;
  onNavigateLevelAction?: (level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1', action: LevelAction) => void;
  onShowDemoNotice?: (featureName: string) => void;
  onOpenTypingMaster?: () => void;
  onOpenConjugationTrainer?: () => void;
  onOpenShadowingHub?: () => void;
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
  currentCourse = 'MINNA_1',
  onSelectCourse,
  onNavigateLevelAction,
  onShowDemoNotice,
  onOpenTypingMaster,
  onOpenConjugationTrainer,
  onOpenShadowingHub,
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Quản lý trạng thái mở Mega Menu cho từng cấp độ (N5 -> N1)
  const levels: Array<'N5' | 'N4' | 'N3' | 'N2' | 'N1'> = ['N5', 'N4', 'N3', 'N2', 'N1'];
  const [activeDropdownLevel, setActiveDropdownLevel] = useState<'N5' | 'N4' | 'N3' | 'N2' | 'N1' | null>(null);
  const [isPracticeDropdownOpen, setIsPracticeDropdownOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Safe-hover tunnel timer tránh menu bị tắt giật khi rê chuột
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHoverTimeout = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  const handleMouseEnterLevel = (lvl: 'N5' | 'N4' | 'N3' | 'N2' | 'N1') => {
    clearHoverTimeout();
    setIsPracticeDropdownOpen(false);
    setActiveDropdownLevel(lvl);
  };

  const handleMouseLeaveLevel = () => {
    clearHoverTimeout();
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveDropdownLevel(null);
    }, 200);
  };

  const handleMouseEnterDropdown = () => {
    clearHoverTimeout();
  };

  const handleMouseEnterPractice = () => {
    clearHoverTimeout();
    setActiveDropdownLevel(null);
    setIsPracticeDropdownOpen(true);
  };

  const handleMouseLeavePractice = () => {
    clearHoverTimeout();
    hoverTimeoutRef.current = setTimeout(() => {
      setIsPracticeDropdownOpen(false);
    }, 200);
  };

  // Xác định cấp độ hiện tại dựa trên currentCourse
  const activeLevel = useMemo<'N5' | 'N4' | 'N3' | 'N2' | 'N1'>(() => {
    if (currentCourse === 'MINNA_2') return 'N4';
    if (currentCourse === 'MINNA_CHUKYU_1') return 'N3';
    if (currentCourse === 'MINNA_CHUKYU_2') return 'N2';
    if (currentCourse === 'JLPT_N1') return 'N1';
    return 'N5';
  }, [currentCourse]);

  // Đóng dropdown khi click ngoài hoặc bấm Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveDropdownLevel(null);
        setIsPracticeDropdownOpen(false);
        setIsProfileMenuOpen(false);
        setIsMobileNavOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      clearHoverTimeout();
    };
  }, []);

  // Lấy chữ cái đầu của email làm avatar
  const avatarLetter = userEmail ? userEmail.charAt(0).toUpperCase() : null;

  const handleSelectLevelAction = (lvl: 'N5' | 'N4' | 'N3' | 'N2' | 'N1', action: LevelAction) => {
    setActiveDropdownLevel(null);
    setIsMobileNavOpen(false);
    if (onNavigateLevelAction) {
      onNavigateLevelAction(lvl, action);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#faf9f5]/90 dark:bg-[#0b0f19]/90 border-b border-stone-200/70 dark:border-stone-800/70 transition-colors pt-[env(safe-area-inset-top,0px)]">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-6 h-16 sm:h-18 flex items-center justify-between gap-2 md:gap-4">
        
        {/* ===================== BRAND & MOBILE TOGGLE (LEFT) ===================== */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Nút mở Menu trên Mobile */}
          <button
            type="button"
            onClick={() => setIsMobileNavOpen((prev) => !prev)}
            aria-label="Mở menu điều hướng"
            className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center bg-stone-100 dark:bg-white/10 text-stone-700 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-white/20 transition-colors"
          >
            {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo Brand */}
          <div 
            className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer select-none group shrink-0" 
            onClick={() => setActiveTab('tango')}
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-stone-900 via-stone-800 to-indigo-950 dark:from-indigo-600 dark:via-indigo-700 dark:to-purple-900 flex items-center justify-center text-white shadow-md shadow-stone-900/10 dark:shadow-indigo-900/30 font-jp font-black text-xl tracking-wider transition-all duration-300 group-hover:scale-105 group-hover:rotate-[-2deg] ring-1 ring-white/10 shrink-0">
              日
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-black text-lg sm:text-xl tracking-tight text-stone-900 dark:text-stone-50 font-sans leading-none">
                  Learn<span className="bg-gradient-to-r from-indigo-600 to-rose-500 bg-clip-text text-transparent">JPD</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-indigo-500/10 dark:bg-indigo-400/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  Zen
                </span>
              </div>
              <p className="text-[10.5px] text-stone-400 dark:text-stone-400 font-medium hidden sm:block mt-0.5">
                Học Tiếng Nhật Trọng Tâm
              </p>
            </div>
          </div>
        </div>

        {/* ===================== MEGA MENU NAV (CENTER - DESKTOP ONLY) ===================== */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 text-sm font-bold flex-1 justify-center max-w-[900px]">

          {/* CÁC CẤP ĐỘ JLPT (N5 -> N1) VỚI MEGA DROPDOWN 2 CỘT */}
          {levels.map((lvl) => {
            const isCurrentActive = activeLevel === lvl;
            const isDropdownOpen = activeDropdownLevel === lvl;
            const isLvlDemo = lvl === 'N3' || lvl === 'N2' || lvl === 'N1';
            return (
              <div 
                key={lvl}
                className="relative"
                onMouseEnter={() => handleMouseEnterLevel(lvl)}
                onMouseLeave={handleMouseLeaveLevel}
              >
                <button
                  type="button"
                  onClick={() => {
                    if (activeDropdownLevel === lvl) {
                      setActiveDropdownLevel(null);
                    } else {
                      handleMouseEnterLevel(lvl);
                    }
                  }}
                  className={`flex items-center gap-1.5 px-2.5 xl:px-3 py-2 rounded-xl text-[13px] font-extrabold transition-all duration-150 whitespace-nowrap ${
                    isDropdownOpen || isCurrentActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-stone-700 dark:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-white/10 hover:text-indigo-600 dark:hover:text-white'
                  }`}
                >
                  <span>{lvl}</span>
                  {isLvlDemo && (
                    <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-500 dark:text-amber-300 border border-amber-500/30">
                      DEMO
                    </span>
                  )}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : 'opacity-70'}`} />
                </button>

                {/* Hộp Mega Menu 2 Cột thả xuống */}
                {isDropdownOpen && (
                  <div 
                    className="absolute top-full left-0 pt-2 z-50 animate-in fade-in slide-in-from-top-1.5 duration-150"
                    onMouseEnter={handleMouseEnterDropdown}
                    onMouseLeave={handleMouseLeaveLevel}
                  >
                    <LevelMegaMenu
                      level={lvl}
                      onSelectAction={handleSelectLevelAction}
                      onShowDemoNotice={onShowDemoNotice}
                      onClose={() => setActiveDropdownLevel(null)}
                    />
                  </div>
                )}
              </div>
            );
          })}

          {/* Giao tiếp / Shadowing Hub */}
          <button
            type="button"
            onClick={() => {
              if (onOpenShadowingHub) onOpenShadowingHub();
            }}
            className="flex items-center px-2.5 xl:px-3 py-2 rounded-xl text-stone-600 dark:text-stone-300 hover:text-indigo-600 dark:hover:text-white hover:bg-stone-200/50 dark:hover:bg-white/10 transition-colors whitespace-nowrap text-[13px] font-bold"
          >
            Giao tiếp
          </button>

          {/* Đọc song ngữ (DEMO) */}
          <button
            type="button"
            onClick={() => {
              if (onShowDemoNotice) {
                onShowDemoNotice('Đọc song ngữ');
              }
            }}
            className="flex items-center gap-1.5 px-2.5 xl:px-3 py-2 rounded-xl text-stone-600 dark:text-stone-300 hover:text-indigo-600 dark:hover:text-white hover:bg-stone-200/50 dark:hover:bg-white/10 transition-colors whitespace-nowrap text-[13px] font-bold"
          >
            <span>Đọc song ngữ</span>
            <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-500 dark:text-amber-300 border border-amber-500/30">
              DEMO
            </span>
          </button>

          {/* NÚT & DROPDOWN: ÔN LUYỆN */}
          <div 
            className="relative"
            onMouseEnter={handleMouseEnterPractice}
            onMouseLeave={handleMouseLeavePractice}
          >
            <button
              type="button"
              onClick={() => {
                setActiveTab('practice');
                setIsPracticeDropdownOpen(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-extrabold transition-all whitespace-nowrap ${
                isPracticeDropdownOpen || activeTab === 'practice'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-stone-700 dark:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-white/10 hover:text-emerald-600 dark:hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Ôn luyện</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isPracticeDropdownOpen ? 'rotate-180' : 'opacity-70'}`} />
            </button>

            {isPracticeDropdownOpen && (
              <div 
                className="absolute top-full right-0 pt-2 z-50 animate-in fade-in slide-in-from-top-1.5 duration-150"
                onMouseEnter={handleMouseEnterPractice}
                onMouseLeave={handleMouseLeavePractice}
              >
                <div className="w-[340px] bg-white dark:bg-[#111827] rounded-3xl shadow-2xl border border-stone-200/90 dark:border-stone-800/90 p-3.5 flex flex-col gap-3 ring-1 ring-black/5 dark:ring-white/10">
                  
                  {/* Nút lớn trực tiếp vào Trung tâm Ôn luyện */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('practice');
                      setIsPracticeDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl text-left bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-600/20 transition-all group"
                  >
                    <span className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                      <Zap className="w-5 h-5 fill-white text-white" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black tracking-tight">Trung tâm Ôn luyện</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 font-bold">Chính</span>
                      </div>
                      <p className="text-[11px] text-emerald-100 truncate">
                        Flashcard, Trắc nghiệm, Cày từ vựng theo bài
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/80 group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </button>

                  {/* Mục 1: Luyện các chuyên đề */}
                  <div className="bg-blue-50/70 dark:bg-blue-950/20 rounded-2xl p-2.5 border border-blue-100/80 dark:border-blue-900/30">
                    <div className="flex items-center gap-2 px-1.5 pb-2 mb-1 border-b border-blue-100 dark:border-blue-900/40">
                      <Sparkles className="w-3.5 h-3.5 text-blue-700 dark:text-blue-300" />
                      <span className="text-[11px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-300">
                        Luyện các chuyên đề
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (onOpenConjugationTrainer) onOpenConjugationTrainer();
                        setIsPracticeDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-2 py-2 rounded-xl text-left text-stone-800 dark:text-stone-200 hover:bg-white dark:hover:bg-white/10 hover:shadow-xs transition-colors text-[13px] font-bold"
                    >
                      <span className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center shrink-0 text-blue-600">
                        🔄
                      </span>
                      <span>Luyện chia các thể tiếng Nhật</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (onOpenTypingMaster) onOpenTypingMaster();
                        setIsPracticeDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-2 py-2 rounded-xl text-left text-stone-800 dark:text-stone-200 hover:bg-white dark:hover:bg-white/10 hover:shadow-xs transition-colors text-[13px] font-bold"
                    >
                      <span className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center shrink-0 text-blue-600">
                        ⌨️
                      </span>
                      <span>Luyện gõ phím tiếng Nhật</span>
                    </button>
                  </div>

                  {/* Mục 2: Đánh giá & Ghi nhớ */}
                  <div className="bg-emerald-50/70 dark:bg-emerald-950/20 rounded-2xl p-2.5 border border-emerald-100/80 dark:border-emerald-900/30">
                    <div className="flex items-center gap-2 px-1.5 pb-2 mb-1 border-b border-emerald-100 dark:border-emerald-900/40">
                      <Trophy className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-300" />
                      <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                        Đánh giá & Ghi nhớ
                      </span>
                    </div>
                    {dueSrsCount > 0 && onOpenSrsReview && (
                      <button
                        type="button"
                        onClick={() => {
                          onOpenSrsReview();
                          setIsPracticeDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-2 py-2 rounded-xl text-left text-stone-800 dark:text-stone-200 hover:bg-white dark:hover:bg-white/10 hover:shadow-xs transition-colors text-[13px] font-bold"
                      >
                        <span className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center shrink-0 text-indigo-600">
                          ⏱️
                        </span>
                        <span className="flex-1">Ôn tập ngắt quãng (SRS)</span>
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-indigo-600 text-white font-bold">{dueSrsCount}</span>
                      </button>
                    )}
                    {mistakeCount > 0 && onOpenMistakeBank && (
                      <button
                        type="button"
                        onClick={() => {
                          onOpenMistakeBank();
                          setIsPracticeDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-2 py-2 rounded-xl text-left text-stone-800 dark:text-stone-200 hover:bg-white dark:hover:bg-white/10 hover:shadow-xs transition-colors text-[13px] font-bold"
                      >
                        <span className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center shrink-0 text-rose-600">
                          ⚠️
                        </span>
                        <span className="flex-1">Kho từ hay làm sai</span>
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-600 text-white font-bold">{mistakeCount}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

        </nav>

        {/* ===================== ACTION CLUSTER (RIGHT) ===================== */}
        <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0">
          
          {/* SRS Quick Pill (Khi có từ đến hạn) */}
          {dueSrsCount > 0 && onOpenSrsReview && (
            <button
              onClick={onOpenSrsReview}
              title={`Bạn có ${dueSrsCount} mục đến hạn ôn tập ngắt quãng (SRS)`}
              className="hidden sm:flex items-center space-x-1 sm:space-x-1.5 px-2.5 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-extrabold transition border border-indigo-500/20 active:scale-95"
            >
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500 animate-pulse" />
              <span className="font-mono text-xs">{dueSrsCount}</span>
            </button>
          )}

          {/* Mistake Bank Button (Khi có từ sai) */}
          {mistakeCount > 0 && onOpenMistakeBank && (
            <button
              onClick={onOpenMistakeBank}
              title={`Bạn có ${mistakeCount} từ trong Kho từ sai`}
              className="hidden sm:flex items-center space-x-1 sm:space-x-1.5 px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-extrabold transition border border-rose-500/20 active:scale-95"
            >
              <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500" />
              <span className="font-mono text-xs">{mistakeCount}</span>
            </button>
          )}

          {/* Streak Badge */}
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

          {/* Chuyển Giao diện Sáng/Tối */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            title={isDarkMode ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-stone-100/80 dark:bg-stone-800/80 hover:bg-stone-200/60 dark:hover:bg-stone-700/60 text-stone-600 dark:text-stone-300 border border-stone-200/60 dark:border-stone-700/60 transition shadow-2xs active:scale-95"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-600 dark:text-stone-300" />}
          </button>

          {/* Profile Menu Trigger */}
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

            {/* Profile Dropdown Menu */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
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

                <div className="px-4 py-2 border-t border-stone-100 dark:border-stone-800 text-[11px] text-stone-400 dark:text-stone-500 text-center">
                  LearnJPD Zen Style · v2.6
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ===================== MOBILE NAV DRAWER / ACCORDION ===================== */}
      {isMobileNavOpen && (
        <div className="lg:hidden bg-white dark:bg-[#111827] border-t border-stone-200/80 dark:border-stone-800 px-4 pt-3 pb-6 shadow-2xl max-h-[80vh] overflow-y-auto animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-1 text-sm font-semibold">

            {/* Accordion các cấp độ N5 -> N1 */}
            {levels.map((lvl) => {
              const isLvlDemo = lvl === 'N3' || lvl === 'N2' || lvl === 'N1';
              return (
                <details key={lvl} className="group border-t border-stone-100 dark:border-stone-800/80 py-1">
                  <summary className="flex items-center justify-between px-3 py-2.5 rounded-xl text-stone-800 dark:text-stone-200 font-bold hover:bg-stone-100 dark:hover:bg-white/10 cursor-pointer list-none">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-xs font-black text-white ${isLvlDemo ? 'bg-amber-600' : 'bg-indigo-600'}`}>
                        {lvl}
                      </span>
                      <span>Luyện thi JLPT {lvl}</span>
                      {isLvlDemo && (
                        <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                          DEMO
                        </span>
                      )}
                    </div>
                    <ChevronDown className="w-4 h-4 text-stone-400 transition-transform group-open:rotate-180" />
                  </summary>
                  
                  <div className="pl-4 pr-1 py-2 flex flex-col gap-1 text-xs">
                    <p className="font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider text-[11px] px-2 pt-1">
                      📖 Lý thuyết
                    </p>
                    <button
                      onClick={() => handleSelectLevelAction(lvl, 'vocab')}
                      className="text-left px-3 py-2 rounded-lg text-stone-700 dark:text-stone-300 hover:bg-blue-50 dark:hover:bg-white/5"
                    >
                      • Học từ vựng {isLvlDemo && '(DEMO)'}
                    </button>
                    <button
                      onClick={() => handleSelectLevelAction(lvl, 'kanji')}
                      className="text-left px-3 py-2 rounded-lg text-stone-700 dark:text-stone-300 hover:bg-blue-50 dark:hover:bg-white/5"
                    >
                      • Học Kanji {isLvlDemo && '(DEMO)'}
                    </button>
                    <button
                      onClick={() => handleSelectLevelAction(lvl, 'grammar')}
                      className="text-left px-3 py-2 rounded-lg text-stone-700 dark:text-stone-300 hover:bg-blue-50 dark:hover:bg-white/5"
                    >
                      • Học ngữ pháp {isLvlDemo && '(DEMO)'}
                    </button>

                    <p className="font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider text-[11px] px-2 pt-2">
                      🏆 Bài tập luyện thi JLPT
                    </p>
                    <button
                      onClick={() => handleSelectLevelAction(lvl, 'kanji_reading')}
                      className="text-left px-3 py-2 rounded-lg text-stone-700 dark:text-stone-300 hover:bg-emerald-50 dark:hover:bg-white/5"
                    >
                      • Tìm cách đọc Kanji
                    </button>
                    <button
                      onClick={() => handleSelectLevelAction(lvl, 'kanji_writing')}
                      className="text-left px-3 py-2 rounded-lg text-stone-700 dark:text-stone-300 hover:bg-emerald-50 dark:hover:bg-white/5"
                    >
                      • Tìm Kanji đúng
                    </button>
                    <button
                      onClick={() => handleSelectLevelAction(lvl, 'practice_vocab')}
                      className="text-left px-3 py-2 rounded-lg text-stone-700 dark:text-stone-300 hover:bg-emerald-50 dark:hover:bg-white/5"
                    >
                      • Trắc nghiệm từ vựng
                    </button>
                    <button
                      onClick={() => {
                        setIsMobileNavOpen(false);
                        if (onShowDemoNotice) onShowDemoNotice('Bài tập diễn đạt tương đương');
                      }}
                      className="text-left px-3 py-2 rounded-lg text-stone-700 dark:text-stone-300 hover:bg-emerald-50 dark:hover:bg-white/5 flex items-center justify-between"
                    >
                      <span>• Diễn đạt tương đương</span>
                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400">DEMO</span>
                    </button>
                    <button
                      onClick={() => handleSelectLevelAction(lvl, 'practice_grammar')}
                      className="text-left px-3 py-2 rounded-lg text-stone-700 dark:text-stone-300 hover:bg-emerald-50 dark:hover:bg-white/5"
                    >
                      • Trắc nghiệm ngữ pháp
                    </button>
                    <button
                      onClick={() => {
                        setIsMobileNavOpen(false);
                        if (onShowDemoNotice) onShowDemoNotice('Bài tập sắp xếp câu');
                      }}
                      className="text-left px-3 py-2 rounded-lg text-stone-700 dark:text-stone-300 hover:bg-emerald-50 dark:hover:bg-white/5 flex items-center justify-between"
                    >
                      <span>• Sắp xếp câu (★)</span>
                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400">DEMO</span>
                    </button>
                    <button
                      onClick={() => handleSelectLevelAction(lvl, 'reading')}
                      className="text-left px-3 py-2 rounded-lg text-stone-700 dark:text-stone-300 hover:bg-emerald-50 dark:hover:bg-white/5"
                    >
                      • Bài tập đọc hiểu
                    </button>
                    <button
                      onClick={() => handleSelectLevelAction(lvl, 'listening')}
                      className="text-left px-3 py-2 rounded-lg text-stone-700 dark:text-stone-300 hover:bg-emerald-50 dark:hover:bg-white/5"
                    >
                      • Bài tập luyện nghe
                    </button>
                  </div>
                </details>
              );
            })}

            <button
              onClick={() => {
                setIsMobileNavOpen(false);
                if (onOpenShadowingHub) onOpenShadowingHub();
              }}
              className="text-left px-3 py-2.5 border-t border-stone-100 dark:border-stone-800/80 rounded-xl text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-white/10"
            >
              Giao tiếp (Shadowing)
            </button>

            <button
              onClick={() => {
                setIsMobileNavOpen(false);
                if (onShowDemoNotice) onShowDemoNotice('Đọc song ngữ');
              }}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-white/10"
            >
              <span>Đọc song ngữ</span>
              <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                DEMO
              </span>
            </button>

            <button
              onClick={() => {
                setIsMobileNavOpen(false);
                setActiveTab('practice');
              }}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-black bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/20 mt-1"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Trung tâm Ôn luyện</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
