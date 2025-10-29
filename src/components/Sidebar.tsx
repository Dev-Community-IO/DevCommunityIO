import { Home, FileText, Mic, Hash, Info, Mail, Shield, Lock, File, Trophy, Calendar, Briefcase, Bookmark } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import bookmarksService from '../services/api/bookmarks.service';

interface SidebarProps {
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
  forceIconOnly?: boolean;
  isMobileSidebar?: boolean;
}

const mainMenuItems = [
  { id: 'home', icon: Home, name: 'Home' },
  { id: 'pages', icon: FileText, name: 'Pages' },
  { id: 'hackathons', icon: Trophy, name: 'Hackathons' },
  { id: 'events', icon: Calendar, name: 'Events' },
  { id: 'opportunities', icon: Briefcase, name: 'Opportunities' },
  // { id: 'podcast', icon: Mic, name: 'Podcast' }
];

const authenticatedMenuItems = [
  { id: 'bookmarks', icon: Bookmark, name: 'Bookmarks', requiresAuth: true }
];

const highlightTags = [
  { name: 'Developers', logo: null },
  { name: 'Cardano', logo: '/Cardano-RGB_Logo-Icon-Blue.png' },
  { name: 'Web3', logo: null }
];

const popularTags = [
  'DeFi',
  'NFT',
  'DAO',
  'Smart Contracts',
  'Ethereum',
  'Solidity',
  'Web3',
  'Blockchain',
  'Staking',
  'Layer2'
];

const otherMenuItems = [
  { id: 'about', icon: Info, name: 'About' },
  { id: 'contact', icon: Mail, name: 'Contact' },
  { id: 'conduct', icon: Shield, name: 'Code of Conduct' },
  { id: 'privacy', icon: Lock, name: 'Privacy Policy' },
  { id: 'terms', icon: File, name: 'Terms of Use' }
];

export function Sidebar({ activeCategory, onCategoryChange, forceIconOnly = false, isMobileSidebar = false }: SidebarProps) {
  const showText = !forceIconOnly;
  const { isAuthenticated } = useAuth();
  const [bookmarkCount, setBookmarkCount] = useState<number | null>(null);
  
  // Fetch bookmark count when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const fetchBookmarkCount = async () => {
        try {
          const { meta } = await bookmarksService.getBookmarks(1);
          setBookmarkCount(meta.total);
        } catch (error) {
          console.error('Failed to fetch bookmark count:', error);
        }
      };
      fetchBookmarkCount();
    } else {
      setBookmarkCount(null);
    }
  }, [isAuthenticated]);

  // Combine menu items based on authentication
  const allMenuItems = isAuthenticated ? [...mainMenuItems, ...authenticatedMenuItems] : mainMenuItems;

  return (
    <aside className={`${isMobileSidebar ? '' : `hidden lg:block left-4 sm:left-6 lg:left-12 xl:left-24 2xl:left-48 ${forceIconOnly ? 'w-16' : 'w-16 xl:w-64 2xl:w-72'} z-40`}`}>
      <div className="sticky top-24 self-start space-y-3">
      <GlassCard className="p-2 lg:p-3 overflow-hidden">
        <div className="space-y-2">
          {allMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeCategory === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onCategoryChange(item.id)}
                className={`
                  w-full flex items-center ${isMobileSidebar ? 'justify-start' : forceIconOnly ? 'justify-center' : 'justify-center xl:justify-start'} gap-3 px-2 ${showText && !forceIconOnly ? 'xl:px-4' : ''} ${isMobileSidebar ? 'px-4' : ''} py-3.5 rounded-xl
                  transition-all duration-300 group relative overflow-hidden
                  ${isActive
                    ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/30 scale-[1.02]'
                    : 'hover:bg-gradient-to-br hover:from-gray-100 hover:to-gray-50 dark:hover:from-white/10 dark:hover:to-white/5 active:scale-95'
                  }
                `}
              >
                <div className={`relative z-10 ${isActive ? 'animate-pulse-subtle' : ''}`}>
                  <Icon
                    size={22}
                    className={`flex-shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </div>
                {showText && !forceIconOnly && (
                  <span className={`font-semibold text-sm ${isMobileSidebar ? 'block' : 'hidden xl:block'} relative z-10 ${isActive ? 'tracking-wide' : ''}`}>
                    {item.name}
                    {item.id === 'bookmarks' && bookmarkCount !== null && (
                      <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${isActive ? 'bg-white/20' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
                        {bookmarkCount}
                      </span>
                    )}
                  </span>
                )}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                )}
                <span className={`absolute left-full ml-3 px-3 py-2 bg-gray-900 dark:bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 ${showText ? 'xl:hidden' : ''} transition-all duration-200 whitespace-nowrap pointer-events-none z-[9999] shadow-xl`}>
                  {item.name}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-gray-800"></div>
                </span>
              </button>
            );
          })}
        </div>
      </GlassCard>

      <GlassCard className="p-2 xl:p-3">
        {showText && (
          <div className={`flex items-center gap-2 mb-2 px-2 ${isMobileSidebar ? 'flex' : 'hidden xl:flex'}`}>
            <div className="w-1 h-4 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></div>
            <h3 className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Featured
            </h3>
          </div>
        )}
        <div className="space-y-2">
          {highlightTags.map((tag, index) => {
            const colors = [
              'from-blue-500 to-cyan-500',
              'from-purple-500 to-pink-500',
              'from-green-500 to-teal-500'
            ];

            return (
              <button
                key={tag.name}
                onClick={() => onCategoryChange(tag.name.toLowerCase())}
                className={`w-full flex items-center ${isMobileSidebar ? 'justify-start' : 'justify-center xl:justify-start'} gap-2.5 px-2 ${showText ? 'xl:px-3' : ''} ${isMobileSidebar ? 'px-3' : ''} py-2.5 rounded-lg transition-all duration-300 group relative hover:scale-[1.02] active:scale-95`}
              >
                {tag.logo ? (
                  <div className="w-7 h-7 flex items-center justify-center">
                    <img
                      src={tag.logo}
                      alt={tag.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className={`p-1.5 rounded-lg bg-gradient-to-br ${colors[index]} shadow-sm group-hover:shadow-md transition-all duration-300`}>
                    <Hash size={14} className="text-white" strokeWidth={2.5} />
                  </div>
                )}
                {showText && (
                  <span className={`${isMobileSidebar ? 'block' : 'hidden xl:block'} font-medium text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors`}>
                    {tag.name}
                  </span>
                )}
                <span className={`absolute left-full ml-3 px-3 py-2 bg-gray-900 dark:bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 ${showText ? 'xl:hidden' : ''} transition-all duration-200 whitespace-nowrap pointer-events-none z-[9999] shadow-xl`}>
                  {tag.name}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-gray-800"></div>
                </span>
              </button>
            );
          })}
        </div>
      </GlassCard>

      {showText && (
        <GlassCard className={`p-3 xl:p-4 ${isMobileSidebar ? 'block' : 'hidden xl:block'}`}>
          <div className="flex items-center gap-2 mb-3 px-2">
            <div className="w-1 h-4 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></div>
            <h3 className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Trending
            </h3>
          </div>
          <div className="flex flex-wrap gap-2 px-2">
            {popularTags.map((tag) => (
              <button
                key={tag}
                onClick={() => onCategoryChange(tag.toLowerCase())}
                className="group px-3 py-1.5 text-xs font-semibold bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/50 hover:from-blue-50 hover:to-cyan-50 dark:hover:from-blue-900/30 dark:hover:to-cyan-900/30 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-all duration-300 hover:shadow-md hover:scale-105 active:scale-95"
              >
                <span className="inline-block group-hover:rotate-12 transition-transform duration-300">#</span>{tag}
              </button>
            ))}
          </div>
          <div className="mt-3 px-2">
            <button
              onClick={() => onCategoryChange('tags')}
              className="w-full px-4 py-2.5 text-sm font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
            >
              <Hash size={16} strokeWidth={2.5} />
              See All Tags
            </button>
          </div>
        </GlassCard>
      )}

      <GlassCard className="p-2 xl:p-3">
        {showText && (
          <div className={`flex items-center gap-2 mb-2 px-2 ${isMobileSidebar ? 'flex' : 'hidden xl:flex'}`}>
            <div className="w-1 h-4 bg-gradient-to-b from-gray-400 to-gray-500 rounded-full"></div>
            <h3 className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Resources
            </h3>
          </div>
        )}
        <div className="space-y-2">
          {otherMenuItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => onCategoryChange(item.id)}
                className={`w-full flex items-center ${isMobileSidebar ? 'justify-start' : 'justify-center xl:justify-start'} gap-2.5 px-2 ${showText ? 'xl:px-3' : ''} ${isMobileSidebar ? 'px-3' : ''} py-2.5 rounded-lg hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 dark:hover:from-white/10 dark:hover:to-white/5 transition-all duration-300 group relative active:scale-95`}
              >
                <Icon
                  size={16}
                  className="flex-shrink-0 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-all duration-300 group-hover:scale-110"
                  strokeWidth={2}
                />
                {showText && (
                  <span className={`${isMobileSidebar ? 'block' : 'hidden xl:block'} text-xs font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors`}>
                    {item.name}
                  </span>
                )}
                <span className={`absolute left-full ml-3 px-3 py-2 bg-gray-900 dark:bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 ${showText ? 'xl:hidden' : ''} transition-all duration-200 whitespace-nowrap pointer-events-none z-[9999] shadow-xl`}>
                  {item.name}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-gray-800"></div>
                </span>
              </button>
            );
          })}
        </div>
      </GlassCard>

      {/* Copyright and Version */}
      {showText && (
        <GlassCard className={`p-3 xl:p-4 ${isMobileSidebar ? 'block' : 'hidden xl:block'}`}>
          <div className="space-y-2 text-center">
            <div className="text-[10px] text-gray-500 dark:text-gray-400 space-y-1">
              <p className="font-semibold">DevCommunity Platform</p>
              <p>Version 1.0.0</p>
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent"></div>
            <div className="text-[10px] text-gray-500 dark:text-gray-400 space-y-1">
              <p>&copy; {new Date().getFullYear()} DevCommunity</p>
              <p>All rights reserved</p>
            </div>
            <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400 dark:text-gray-500">
              <span>Made with</span>
              <span className="text-red-500 animate-pulse">♥</span>
              <span>by developers</span>
            </div>
          </div>
        </GlassCard>
      )}
      </div>
    </aside>
  );
}
