import { Compass, Megaphone } from 'lucide-react';
import { TabPills } from './TabPills';

interface MobileTabsProps {
  activeTab: 'posts' | 'announcements';
  onTabChange: (tab: 'posts' | 'announcements') => void;
}

export function MobileTabs({ activeTab, onTabChange }: MobileTabsProps) {
  return (
    <div className="mb-4 border-b border-zinc-200/80 bg-gray-50/95 backdrop-blur-md dark:border-white/10 dark:bg-[#060b14]/90 lg:hidden">
      <div className="p-2">
        <TabPills
          ariaLabel="Feed sections"
          activeTab={activeTab}
          onChange={onTabChange}
          scrollable={false}
          variant="stretch"
          tabs={[
            { id: 'posts', label: 'Discover', icon: Compass },
            { id: 'announcements', label: 'Announcements', icon: Megaphone },
          ]}
        />
      </div>
    </div>
  );
}
