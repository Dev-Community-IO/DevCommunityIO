import { Moon, Sun, Bell, User, Menu, Search, LogIn, Shield, LogOut } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Button } from './Button';
import { Avatar } from './Avatar';
import { SearchDropdown } from './SearchDropdown';
import { SearchModal } from './SearchModal';
import { NotificationDropdown } from './NotificationDropdown';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Post } from '../types';
import { useRealtimeNotifications } from '../hooks/useRealtimeNotifications';
import { useDynamicAssets } from '../utils/dynamicAssets';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  onCreatePost: () => void;
  onPostClick: (post: Post) => void;
  onLogoClick?: () => void;
  onNotificationsClick?: () => void;
  onMenuClick?: () => void;
  onOpenLoginModal?: () => void;
}

export function Navbar({ onCreatePost, onPostClick, onLogoClick, onNotificationsClick, onMenuClick, onOpenLoginModal }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, user, logout } = useAuth();
  const dynamicAssets = useDynamicAssets();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const userMenuDesktopRef = useRef<HTMLDivElement>(null);
  const userMenuMobileRef = useRef<HTMLDivElement>(null);

  // Check if user is admin or super admin
  const isAdminUser = isAuthenticated && user && (user.role === 'admin' || user.role === 'super_admin');
  const isModeratorUser = isAuthenticated && user && (user.role === 'moderator' || isAdminUser);

  // Use real-time notifications hook for unread count
  const { unreadCount } = useRealtimeNotifications({
    pollInterval: 30000, // Poll every 30 seconds for navbar
    autoFetch: isAuthenticated,
    limit: 1, // Only need count
  });

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const clickedInsideDesktop = userMenuDesktopRef.current?.contains(event.target as Node);
      const clickedInsideMobile = userMenuMobileRef.current?.contains(event.target as Node);
      
      if (!clickedInsideDesktop && !clickedInsideMobile) {
        setShowUserMenu(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [showUserMenu]);

  const handleLogout = async () => {
    try {
      await logout();
      setShowUserMenu(false);
      navigate('/');
      window.location.reload();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

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
                src={dynamicAssets?.logoUrl || '/devcommunity-new_LOG (1).png'}
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

          <div className="hidden md:block flex-1 max-w-4xl mx-6 lg:mx-8">
            <SearchDropdown onPostClick={onPostClick} />
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated ? (
              <>
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
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                <div className="hidden sm:block relative" ref={userMenuDesktopRef}>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowUserMenu(!showUserMenu);
                    }}
                    className="hover:scale-105 transition-transform duration-300 flex-shrink-0"
                    aria-label="User Menu"
                    aria-expanded={showUserMenu}
                    type="button"
                  >
                    <Avatar
                      src={user?.avatarUrl || user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.username || 'User')}`}
                      alt={user?.username || 'User'}
                      size="sm"
                      isTrusted={user?.isTrusted}
                    />
                  </button>
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      {/* User Info */}
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={user?.avatarUrl || user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.username || 'User')}`}
                            alt={user?.username || 'User'}
                            size="md"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900 dark:text-white truncate">
                              {user?.username || 'User'}
                            </div>
                            {user?.email && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {user.email}
                              </div>
                            )}
                            {user?.role && (
                              <div className="text-xs font-medium text-purple-600 dark:text-purple-400 mt-1 capitalize">
                                {user.role.replace('_', ' ')}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowUserMenu(false);
                            navigate('/profile/me');
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 text-gray-700 dark:text-gray-300 transition-colors"
                          type="button"
                        >
                          <User size={18} />
                          <span>My Profile</span>
                        </button>

                        {(isAdminUser || isModeratorUser) && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setShowUserMenu(false);
                              navigate('/admin');
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 text-purple-600 dark:text-purple-400 transition-colors"
                            type="button"
                          >
                            <Shield size={18} />
                            <span>Management</span>
                          </button>
                        )}

                        <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleLogout();
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 text-red-600 dark:text-red-400 transition-colors"
                          type="button"
                        >
                          <LogOut size={18} />
                          <span>Disconnect</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="sm:hidden relative" ref={userMenuMobileRef}>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowUserMenu(!showUserMenu);
                    }}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 flex-shrink-0"
                    aria-label="User Menu"
                    aria-expanded={showUserMenu}
                    type="button"
                  >
                    <User size={20} />
                  </button>
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      {/* User Info */}
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={user?.avatarUrl || user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.username || 'User')}`}
                            alt={user?.username || 'User'}
                            size="md"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900 dark:text-white truncate">
                              {user?.username || 'User'}
                            </div>
                            {user?.email && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {user.email}
                              </div>
                            )}
                            {user?.role && (
                              <div className="text-xs font-medium text-purple-600 dark:text-purple-400 mt-1 capitalize">
                                {user.role.replace('_', ' ')}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowUserMenu(false);
                            navigate('/profile/me');
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 text-gray-700 dark:text-gray-300 transition-colors"
                          type="button"
                        >
                          <User size={18} />
                          <span>My Profile</span>
                        </button>

                        {(isAdminUser || isModeratorUser) && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setShowUserMenu(false);
                              navigate('/admin');
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 text-purple-600 dark:text-purple-400 transition-colors"
                            type="button"
                          >
                            <Shield size={18} />
                            <span>Management</span>
                          </button>
                        )}

                        <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleLogout();
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 text-red-600 dark:text-red-400 transition-colors"
                          type="button"
                        >
                          <LogOut size={18} />
                          <span>Disconnect</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 flex-shrink-0"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    if (onOpenLoginModal) {
                      onOpenLoginModal();
                    } else {
                      // Fallback: dispatch a global event to open the login modal
                      window.dispatchEvent(new CustomEvent('open-login'));
                    }
                  }}
                  className="flex items-center gap-2"
                  icon={LogIn}
                >
                  <span className="hidden sm:inline">Connect</span>
                </Button>
              </>
            )}
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
