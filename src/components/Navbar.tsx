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

const navShellClass =
  'fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-xl transition-colors ' +
  'bg-white/95 border-zinc-200/80 shadow-sm ' +
  'dark:border-[var(--app-border,#141c2e)] dark:bg-[var(--app-chrome,#060b14)] dark:shadow-none';

const navIconBtnClass =
  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-600 transition-colors ' +
  'hover:bg-zinc-100 hover:text-zinc-900 ' +
  'dark:text-zinc-400 dark:hover:bg-white/[0.06] dark:hover:text-zinc-100';

const userMenuPanelClass =
  'absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-lg ' +
  'z-50 animate-in fade-in slide-in-from-top-2 duration-200 ' +
  'dark:border-white/10 dark:bg-zinc-900';

const userMenuItemClass =
  'flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-zinc-700 transition-colors ' +
  'hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/[0.06]';

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
    <nav className={navShellClass}>
      <div className="mx-auto px-4 sm:px-6 lg:px-12 xl:px-24 2xl:px-48">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <button
              onClick={onMenuClick}
              className={`lg:hidden ${navIconBtnClass}`}
              aria-label="Menu"
            >
              <Menu size={20} strokeWidth={2} />
            </button>

            <button
              onClick={onLogoClick}
              className="flex-shrink-0 transition-opacity hover:opacity-85"
            >
              <img
                src={dynamicAssets?.logoUrl || '/devcommunity-new_LOG (1).png'}
                alt="Dev Community"
                className="h-8 w-auto object-contain sm:h-9 dark:brightness-[1.08] dark:contrast-[1.05]"
              />
            </button>
          </div>

          <button
            onClick={() => setIsSearchModalOpen(true)}
            className={`md:hidden ${navIconBtnClass}`}
            aria-label="Search"
          >
            <Search size={20} strokeWidth={2} />
          </button>

          <div className="mx-4 hidden max-w-3xl flex-1 items-center md:flex lg:mx-6 lg:max-w-4xl">
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
                  className={navIconBtnClass}
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? <Sun size={20} strokeWidth={2} /> : <Moon size={20} strokeWidth={2} />}
                </button>

                <div className="hidden sm:block">
                  <NotificationDropdown onViewAll={() => onNotificationsClick?.()} />
                </div>

                <button
                  onClick={() => onNotificationsClick?.()}
                  className={`relative sm:hidden ${navIconBtnClass}`}
                  aria-label="Notifications"
                >
                  <Bell size={20} strokeWidth={2} />
                  {unreadCount > 0 && (
                    <span className="absolute right-1 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
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
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-2 ring-transparent transition-[box-shadow] hover:ring-zinc-200/80 dark:hover:ring-white/15"
                    aria-label="User Menu"
                    aria-expanded={showUserMenu}
                    type="button"
                  >
                    <Avatar
                      src={user?.avatarUrl || user?.avatar || ''}
                      alt={user?.username || 'User'}
                      size="sm"

                    />
                  </button>
                  {showUserMenu && (
                    <div className={userMenuPanelClass}>
                      <div className="border-b border-zinc-100 p-4 dark:border-white/[0.06]">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={user?.avatarUrl || user?.avatar || ''}
                            alt={user?.username || 'User'}
                            size="md"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="truncate font-semibold text-zinc-900 dark:text-zinc-100">
                              {user?.username || 'User'}
                            </div>
                            {user?.email && (
                              <div className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                                {user.email}
                              </div>
                            )}
                            {user?.role && (
                              <div className="mt-1 text-xs font-medium capitalize text-zinc-600 dark:text-zinc-400">
                                {user.role.replace('_', ' ')}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowUserMenu(false);
                            navigate('/profile/me');
                          }}
                          className={userMenuItemClass}
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
                            className={userMenuItemClass}
                            type="button"
                          >
                            <Shield size={18} />
                            <span>Management</span>
                          </button>
                        )}

                        <div className="my-1 border-t border-zinc-100 dark:border-white/[0.06]" />

                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleLogout();
                          }}
                          className={`${userMenuItemClass} text-red-600 dark:text-red-400`}
                          type="button"
                        >
                          <LogOut size={18} />
                          <span>Disconnect</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative sm:hidden" ref={userMenuMobileRef}>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowUserMenu(!showUserMenu);
                    }}
                    className={navIconBtnClass}
                    aria-label="User Menu"
                    aria-expanded={showUserMenu}
                    type="button"
                  >
                    <User size={20} strokeWidth={2} />
                  </button>
                  {showUserMenu && (
                    <div className={userMenuPanelClass}>
                      <div className="border-b border-zinc-100 p-4 dark:border-white/[0.06]">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={user?.avatarUrl || user?.avatar || ''}
                            alt={user?.username || 'User'}
                            size="md"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="truncate font-semibold text-zinc-900 dark:text-zinc-100">
                              {user?.username || 'User'}
                            </div>
                            {user?.email && (
                              <div className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                                {user.email}
                              </div>
                            )}
                            {user?.role && (
                              <div className="mt-1 text-xs font-medium capitalize text-zinc-600 dark:text-zinc-400">
                                {user.role.replace('_', ' ')}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowUserMenu(false);
                            navigate('/profile/me');
                          }}
                          className={userMenuItemClass}
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
                            className={userMenuItemClass}
                            type="button"
                          >
                            <Shield size={18} />
                            <span>Management</span>
                          </button>
                        )}

                        <div className="my-1 border-t border-zinc-100 dark:border-white/[0.06]" />

                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleLogout();
                          }}
                          className={`${userMenuItemClass} text-red-600 dark:text-red-400`}
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
                  className={navIconBtnClass}
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? <Sun size={20} strokeWidth={2} /> : <Moon size={20} strokeWidth={2} />}
                </button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    if (onOpenLoginModal) {
                      onOpenLoginModal();
                    } else {
                      window.dispatchEvent(new CustomEvent('open-login'));
                    }
                  }}
                  icon={LogIn}
                  aria-label="Connect wallet or sign in"
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
