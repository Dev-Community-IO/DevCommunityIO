import { Compass, Megaphone } from 'lucide-react';

interface MobileTabsProps {
  activeTab: 'posts' | 'announcements';
  onTabChange: (tab: 'posts' | 'announcements') => void;
}

export function MobileTabs({ activeTab, onTabChange }: MobileTabsProps) {
  const tabs = [
    { id: 'posts', label: 'Discover', icon: Compass },
    { id: 'announcements', label: 'Announcements', icon: Megaphone }
  ];

  return (
    <div className="lg:hidden sticky top-16 z-40 backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 border-b border-gray-200 dark:border-gray-800 mb-4">
      <div className="flex gap-2 p-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id as 'posts' | 'announcements')}
              className={`flex-1 relative flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 ${
                isActive
                  ? 'text-white shadow-lg shadow-blue-500/30'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl" />
              )}
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className="relative z-10" />
              <span className="relative z-10">{tab.label}</span>
              {isActive && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1/3 h-1 bg-gradient-to-r from-transparent via-white to-transparent rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
