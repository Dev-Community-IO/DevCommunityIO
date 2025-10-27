import { Moon, Sun, Bell, User, Menu, Search } from 'lucide-react';
import { useState } from 'react';
import { Button } from './Button';
import { Avatar } from './Avatar';
import { SearchDropdown } from './SearchDropdown';
import { SearchModal } from './SearchModal';
import { NotificationDropdown } from './NotificationDropdown';
import { useTheme } from '../contexts/ThemeContext';
import { Post } from '../types';

interface NavbarProps {
  onCreatePost: () => void;
  onPostClick: (post: Post) => void;
  onProfileClick?: () => void;
  onLogoClick?: () => void;
  onNotificationsClick?: () => void;
  onMenuClick?: () => void;
}

export function Navbar({ onCreatePost, onPostClick, onProfileClick, onLogoClick, onNotificationsClick, onMenuClick }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white dark:bg-gray-900/95 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="mx-auto px-4 sm:px-6 lg:px-12 xl:px-24 2xl:px-48">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <button
              onClick={onMenuClick}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 flex-shrink-0"
              aria-label="Menu"
            >
              <Menu size={22} />
            </button>

            <button
              onClick={onLogoClick}
              className="flex-shrink-0 hover:opacity-80 transition-opacity"
            >
              <img
                src="/devcommunity-new_LOG (1).png"
                alt="Dev Community"
                className="h-8 sm:h-10 w-auto object-contain"
              />
            </button>
          </div>

          <button
            onClick={() => setIsSearchModalOpen(true)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 flex-shrink-0"
            aria-label="Search"
          >
            <Search size={20} />
          </button>

          <div className="hidden md:block flex-1 max-w-md mx-4">
            <SearchDropdown onPostClick={onPostClick} />
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={onCreatePost}
              className="hidden sm:flex"
            >
              Create Post
            </Button>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 flex-shrink-0"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="hidden sm:block">
              <NotificationDropdown onViewAll={() => onNotificationsClick?.()} />
            </div>

            <button
              onClick={() => onNotificationsClick?.()}
              className="sm:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 relative flex-shrink-0"
              aria-label="Notifications"
            >
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <button
              onClick={onProfileClick}
              className="hidden sm:block hover:scale-105 transition-transform duration-300 flex-shrink-0"
              aria-label="Profile"
            >
              <Avatar
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Emma"
                alt="User"
                size="sm"
              />
            </button>

            <button
              onClick={onProfileClick}
              className="sm:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 flex-shrink-0"
              aria-label="Profile"
            >
              <User size={20} />
            </button>
          </div>
        </div>
      </div>

      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onPostClick={onPostClick}
      />
    </nav>
  );
}
