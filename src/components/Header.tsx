import { Search, Bell, Plus } from 'lucide-react';
import { Button } from './Button';
import { Avatar } from './Avatar';
import { GlassCard } from './GlassCard';

interface HeaderProps {
  onCreatePost: () => void;
}

export function Header({ onCreatePost }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 mb-4 sm:mb-8">
      <GlassCard className="p-2.5 sm:p-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 text-sm sm:text-base rounded-xl backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
            />
          </div>

          <Button
            variant="primary"
            icon={Plus}
            onClick={onCreatePost}
            size="sm"
            className="hidden sm:flex"
          >
            Create Post
          </Button>

          <button
            onClick={onCreatePost}
            className="sm:hidden p-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white transition-all duration-300 active:scale-95"
          >
            <Plus size={18} />
          </button>

          <button className="p-2 sm:p-3 rounded-xl hover:bg-white/10 dark:hover:bg-white/5 transition-all duration-300 relative active:scale-95">
            <Bell size={18} className="sm:hidden" />
            <Bell size={22} className="hidden sm:block" />
            <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <Avatar
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Guest"
            alt="User"
            size="sm"
            className="w-8 h-8 sm:w-10 sm:h-10"
          />
        </div>
      </GlassCard>
    </header>
  );
}
