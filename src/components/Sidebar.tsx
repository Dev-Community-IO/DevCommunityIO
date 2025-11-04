import { Home, FileText, Info, Mail, Shield, Lock, File, Trophy, Calendar, Briefcase, Bookmark, Hash, Star, Code2 } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Tooltip } from './Tooltip';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import bookmarksService from '../services/api/bookmarks.service';
import tagsService, { Tag } from '../services/api/tags.service';
import { useNavigate } from 'react-router-dom';
import siteSettingsService from '../services/api/siteSettings.service';
import { isNetworkError } from '../services/api/config';

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

const otherMenuItems = [
  { id: 'about', icon: Info, name: 'About' },
  { id: 'contact', icon: Mail, name: 'Contact' },
  { id: 'conduct', icon: Shield, name: 'Code of Conduct' },
  { id: 'privacy', icon: Lock, name: 'Privacy Policy' },
  { id: 'terms', icon: File, name: 'Terms of Use' },
  { id: 'contribute', icon: Code2, name: 'How to Contribute', external: true }
];

export function Sidebar({ activeCategory, onCategoryChange, forceIconOnly = false, isMobileSidebar = false }: SidebarProps) {
  const showText = !forceIconOnly;
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [bookmarkCount, setBookmarkCount] = useState<number | null>(null);
  const [featuredTags, setFeaturedTags] = useState<Tag[]>([]);
  const [trendingTags, setTrendingTags] = useState<Tag[]>([]);
  const [githubContributeUrl, setGithubContributeUrl] = useState<string | null>(null);
  
  // Fetch bookmark count when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const fetchBookmarkCount = async () => {
        try {
          const { meta } = await bookmarksService.getBookmarks(1);
          setBookmarkCount(meta.total);
        } catch (error: any) {
          // Don't log network errors (server offline) - already handled by interceptor
          if (!isNetworkError(error)) {
          console.error('Failed to fetch bookmark count:', error);
          }
        }
      };
      fetchBookmarkCount();
    } else {
      setBookmarkCount(null);
    }
  }, [isAuthenticated]);

  // Fetch featured and trending tags
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const [featuredResponse, trendingResponse] = await Promise.all([
          tagsService.getFeaturedTags(3).catch(() => ({ tags: [] })),
          tagsService.getTrendingTags('7d', 10).catch(() => ({ tags: [] }))
        ]);

        setFeaturedTags(featuredResponse?.tags || []);
        setTrendingTags(trendingResponse?.tags || []);
      } catch (err: any) {
        // Don't log network errors (server offline) - already handled by interceptor
        if (!isNetworkError(err)) {
        console.error('Error fetching tags:', err);
        }
      }
    };

    fetchTags();
  }, []);

  // Fetch GitHub contribute URL
  useEffect(() => {
    const fetchGithubContribute = async () => {
      try {
        const url = await siteSettingsService.getSetting('github_contribute_url');
        setGithubContributeUrl(url);
      } catch (err: any) {
        // Don't log network errors (server offline) - already handled by interceptor
        if (!isNetworkError(err)) {
        console.error('Error fetching GitHub contribute URL:', err);
        }
      }
    };

    fetchGithubContribute();
  }, []);

  const handleTagClick = (tag: Tag) => {
    navigate(`/?tags=${encodeURIComponent(tag.slug)}`);
  };

  // Combine menu items based on authentication
  const allMenuItems = isAuthenticated ? [...mainMenuItems, ...authenticatedMenuItems] : mainMenuItems;

  return (
    <aside className={`${isMobileSidebar ? '' : `hidden lg:block left-4 sm:left-6 lg:left-12 xl:left-24 2xl:left-48 ${forceIconOnly ? 'w-16' : 'w-16 xl:w-64 2xl:w-72'} z-40`}`}>
      <div className={`sticky top-24 self-start space-y-3`}>
      <GlassCard className="p-2 lg:p-3 overflow-hidden">
        <div className="space-y-2">
          {allMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeCategory === item.id;

            const buttonContent = (
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
              </button>
            );

            return (
              !showText || forceIconOnly ? (
                <Tooltip key={item.id} content={item.name} delay={200}>
                  {buttonContent}
                </Tooltip>
              ) : (
                buttonContent
              )
            );
          })}
        </div>
      </GlassCard>

      {/* Featured Tags */}
      {featuredTags.length > 0 && (
        <GlassCard className="p-3 xl:p-4">
          {showText && (
            <div className={`flex items-center gap-2 mb-3 px-2 ${isMobileSidebar ? 'flex' : 'hidden xl:flex'}`}>
              <div className="w-1 h-4 bg-gradient-to-b from-pink-500 to-purple-500 rounded-full"></div>
              <h3 className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Star size={12} className="text-yellow-500 fill-yellow-500" />
                Featured
              </h3>
            </div>
          )}
          <div className="space-y-2">
            {featuredTags.map((tag) => {
              const tagButton = (
                <button
                  key={tag.id}
                  onClick={() => handleTagClick(tag)}
                  className={`w-full group flex items-center ${isMobileSidebar ? 'justify-start' : 'justify-center xl:justify-start'} gap-3 px-2 ${showText ? 'xl:px-3' : ''} ${isMobileSidebar ? 'px-3' : ''} py-2.5 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-white/5 active:scale-[0.98]`}
                >
                  {tag.logoUrl ? (
                    <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-700">
                      <img
                        src={tag.logoUrl}
                        alt={tag.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                      <Hash size={16} className="text-white" strokeWidth={2.5} />
                    </div>
                  )}
                  {showText && (
                    <span className={`${isMobileSidebar ? 'block' : 'hidden xl:block'} font-medium text-sm text-gray-700 dark:text-gray-300 truncate`}>
                      {tag.name}
                    </span>
                  )}
                </button>
              );

              return (
                !showText ? (
                  <Tooltip key={tag.id} content={tag.name} delay={200}>
                    {tagButton}
                  </Tooltip>
                ) : (
                  tagButton
                )
              );
            })}
          </div>
        </GlassCard>
      )}

      {/* Trending Tags */}
      {trendingTags.length > 0 && showText && (
        <GlassCard className={`p-3 xl:p-4 ${isMobileSidebar ? 'block' : 'hidden xl:block'}`}>
          <div className="flex items-center gap-2 mb-3 px-2">
            <div className="w-1 h-4 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></div>
            <h3 className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Trending
            </h3>
          </div>
          <div className="flex flex-wrap gap-2 px-2">
            {trendingTags.slice(0, 10).map((tag) => (
              <button
                key={tag.id}
                onClick={() => handleTagClick(tag)}
                className="group px-3 py-1.5 text-xs font-semibold bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/50 hover:from-blue-50 hover:to-cyan-50 dark:hover:from-blue-900/30 dark:hover:to-cyan-900/30 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-all duration-300 hover:shadow-md hover:scale-105 active:scale-95 flex items-center gap-1"
              >
                {tag.logoUrl ? (
                  <img src={tag.logoUrl} alt={tag.name} className="w-3 h-3 object-cover rounded" />
                ) : (
                  <Hash size={10} className="inline-block group-hover:rotate-12 transition-transform duration-300" />
                )}
                {tag.name}
              </button>
            ))}
          </div>
          <div className="mt-3 px-2">
            <button
              onClick={() => navigate('/tags')}
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
            const isExternal = (item as any).external && item.id === 'contribute';
            const externalUrl = item.id === 'contribute' ? githubContributeUrl : null;

            const otherButton = (
              <button
                key={item.id}
                onClick={() => {
                  if (isExternal && externalUrl) {
                    window.open(externalUrl, '_blank', 'noopener noreferrer');
                  } else {
                    // Map page IDs to routes
                    const routeMap: Record<string, string> = {
                      'about': '/about',
                      'contact': '/contact',
                      'conduct': '/code-of-conduct',
                      'privacy': '/privacy-policy',
                      'terms': '/terms-of-use',
                    };
                    const route = routeMap[item.id];
                    if (route) {
                      navigate(route);
                    } else {
                      onCategoryChange(item.id);
                    }
                  }
                }}
                disabled={isExternal && !externalUrl}
                className={`w-full flex items-center ${isMobileSidebar ? 'justify-start' : 'justify-center xl:justify-start'} gap-2.5 px-2 ${showText ? 'xl:px-3' : ''} ${isMobileSidebar ? 'px-3' : ''} py-2.5 rounded-lg hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 dark:hover:from-white/10 dark:hover:to-white/5 transition-all duration-300 group relative active:scale-95 ${isExternal && !externalUrl ? 'opacity-50 cursor-not-allowed' : ''}`}
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
              </button>
            );

            return (
              !showText ? (
                <Tooltip key={item.id} content={item.name} delay={200}>
                  {otherButton}
                </Tooltip>
              ) : (
                otherButton
              )
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
