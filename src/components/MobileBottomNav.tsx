import React from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Zap, 
  User 
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
      label: 'Bài học',
      icon: BookOpen,
      color: 'text-indigo-600 dark:text-indigo-400',
      activeBg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
    },
    {
      id: 'kanji' as const,
      label: 'Chữ Hán',
      icon: Sparkles,
      color: 'text-rose-600 dark:text-rose-400',
      activeBg: 'bg-rose-500/10 dark:bg-rose-500/20',
    },
    {
      id: 'practice' as const,
      label: 'Ôn luyện',
      icon: Zap,
      color: 'text-emerald-600 dark:text-emerald-400',
      activeBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
      badge: mistakeCount > 0 ? mistakeCount : undefined,
    },
    {
      id: 'dashboard' as const,
      label: 'Cá nhân',
      icon: User,
      color: 'text-stone-900 dark:text-stone-100',
      activeBg: 'bg-stone-200/60 dark:bg-stone-800',
    },
  ];

  return (
    <nav 
      aria-label="Thanh điều hướng di động"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#faf9f5]/95 dark:bg-[#0f1117]/95 backdrop-blur-lg border-t border-stone-200/80 dark:border-stone-800/80 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="grid grid-cols-4 h-15 items-center px-2 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = (item.id === 'dashboard' && (activeTab === 'dashboard' || activeTab === 'notebook')) 
            || activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-col items-center justify-center py-1 rounded-xl transition-all duration-150 active:scale-95 ${
                isActive 
                  ? `${item.color} font-bold` 
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <div 
                className={`relative flex items-center justify-center w-10 h-7 rounded-lg transition-all duration-150 ${
                  isActive ? item.activeBg : 'bg-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 transition-transform duration-150 ${isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'}`} />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.2 min-w-[15px] h-3.5 text-[9px] font-black leading-tight text-white bg-rose-500 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-stone-900">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 leading-tight ${isActive ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
