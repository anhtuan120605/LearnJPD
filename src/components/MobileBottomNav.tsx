import React from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Bookmark, 
  Gamepad2, 
  LayoutDashboard 
} from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: 'tango' | 'kanji' | 'practice' | 'notebook' | 'dashboard';
  setActiveTab: (tab: 'tango' | 'kanji' | 'practice' | 'notebook' | 'dashboard') => void;
  mistakeCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  mistakeCount = 0,
}) => {
  const navItems = [
    {
      id: 'tango' as const,
      label: 'Từ vựng',
      icon: BookOpen,
      color: 'text-blue-600 dark:text-sky-400',
      activeBg: 'bg-blue-500/10 dark:bg-sky-500/15',
    },
    {
      id: 'kanji' as const,
      label: 'Chữ Hán',
      icon: Sparkles,
      color: 'text-indigo-600 dark:text-indigo-400',
      activeBg: 'bg-indigo-500/10 dark:bg-indigo-500/15',
    },
    {
      id: 'notebook' as const,
      label: 'Sổ tay',
      icon: Bookmark,
      color: 'text-amber-600 dark:text-amber-400',
      activeBg: 'bg-amber-500/10 dark:bg-amber-500/15',
    },
    {
      id: 'practice' as const,
      label: 'Luyện tập',
      icon: Gamepad2,
      color: 'text-emerald-600 dark:text-emerald-400',
      activeBg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
      badge: mistakeCount > 0 ? mistakeCount : undefined,
    },
    {
      id: 'dashboard' as const,
      label: 'Cá nhân',
      icon: LayoutDashboard,
      color: 'text-purple-600 dark:text-purple-400',
      activeBg: 'bg-purple-500/10 dark:bg-purple-500/15',
    },
  ];

  return (
    <nav 
      aria-label="Thanh điều hướng di động"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-lg border-t border-slate-200/90 dark:border-slate-800/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="grid grid-cols-5 h-16 items-center px-1 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-200 active:scale-90 ${
                isActive 
                  ? `${item.color} font-bold` 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {/* Active pill background indicator */}
              <div 
                className={`relative flex items-center justify-center w-10 h-7 rounded-xl transition-all duration-200 ${
                  isActive ? item.activeBg : 'bg-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'}`} />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.2 min-w-[16px] h-4 text-[10px] font-black leading-tight text-white bg-rose-500 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900 animate-pulse">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 leading-tight ${isActive ? 'font-black' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
