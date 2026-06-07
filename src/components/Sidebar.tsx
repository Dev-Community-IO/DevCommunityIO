import { Home, FileText, Info, Mail, Shield, Lock, File, Trophy, Calendar, Briefcase, Bookmark, Hash, Code2, Twitter, Github, Linkedin, Facebook, Instagram, Youtube, Award } from 'lucide-react';
import { Tooltip } from './Tooltip';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect, useMemo } from 'react';
import bookmarksService from '../services/api/bookmarks.service';
import tagsService, { Tag } from '../services/api/tags.service';
import { useNavigate } from 'react-router-dom';
import siteSettingsService from '../services/api/siteSettings.service';
import { isNetworkError } from '../services/api/config';
import { getVersion, getGitTag, getCommitHash } from '../utils/version';
import { StickyAsidePanel } from './layout/StickyAsidePanel';

// Helper function to determine platform and icon from URL
interface SocialLinkInfo {
  url: string;
  platform: string;
  icon: any;
  label: string;
  className: string;
}

const SOCIAL_ICON_CLASS =
  'inline-flex h-7 w-7 items-center justify-center rounded-md border border-zinc-200/80 text-zinc-500 transition-colors hover:border-zinc-300 hover:bg-zinc-100 hover:text-zinc-800 dark:border-white/10 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-zinc-200';

const getSocialPlatformFromUrl = (url: string): SocialLinkInfo | null => {
  if (!url || typeof url !== 'string' || url.trim() === '') return null;
  
  const lowerUrl = url.toLowerCase().trim();
  
  // Twitter/X
  if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) {
    return {
      url,
      platform: 'twitter',
      icon: Twitter,
      label: 'Twitter',
      className: SOCIAL_ICON_CLASS,
    };
  }
  
  // GitHub
  if (lowerUrl.includes('github.com')) {
    return {
      url,
      platform: 'github',
      icon: Github,
      label: 'GitHub',
      className: SOCIAL_ICON_CLASS,
    };
  }
  
  // Discord
  if (lowerUrl.includes('discord.com') || lowerUrl.includes('discord.gg')) {
    return {
      url,
      platform: 'discord',
      icon: null, // Custom SVG
      label: 'Discord',
      className: SOCIAL_ICON_CLASS,
    };
  }
  
  // LinkedIn
  if (lowerUrl.includes('linkedin.com')) {
    return {
      url,
      platform: 'linkedin',
      icon: Linkedin,
      label: 'LinkedIn',
      className: SOCIAL_ICON_CLASS,
    };
  }
  
  // Facebook
  if (lowerUrl.includes('facebook.com') || lowerUrl.includes('fb.com')) {
    return {
      url,
      platform: 'facebook',
      icon: Facebook,
      label: 'Facebook',
      className: SOCIAL_ICON_CLASS,
    };
  }
  
  // Instagram
  if (lowerUrl.includes('instagram.com')) {
    return {
      url,
      platform: 'instagram',
      icon: Instagram,
      label: 'Instagram',
      className: SOCIAL_ICON_CLASS,
    };
  }
  
  // YouTube
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
    return {
      url,
      platform: 'youtube',
      icon: Youtube,
      label: 'YouTube',
      className: SOCIAL_ICON_CLASS,
    };
  }
  
  return null;
};

interface SidebarProps {
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
  forceIconOnly?: boolean;
  isMobileSidebar?: boolean;
}

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false
  );

  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [query]);

  return matches;
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
  { id: 'reputation-system', icon: Award, name: 'Reputation System' },
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
  const [siteSettings, setSiteSettings] = useState<{
    siteName?: string | null;
    emailFooterHtml?: string | null;
    emailFooterTagline?: string | null;
    emailFooterCopyright?: string | null;
    emailFooterMadeWithText?: string | null;
    emailFooterSocialTwitter?: string | null;
    emailFooterSocialGithub?: string | null;
    emailFooterSocialDiscord?: string | null;
    emailFooterSocialLinkedin?: string | null;
    emailFooterSocialFacebook?: string | null;
    emailFooterSocialInstagram?: string | null;
    emailFooterSocialYoutube?: string | null;
  }>({});
  
  // Fetch bookmark count when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setBookmarkCount(null);
      return;
    }

    const fetchBookmarkCount = async () => {
      try {
        const response = await bookmarksService.getBookmarks(1);
        if (response?.meta && typeof response.meta.total === 'number') {
          setBookmarkCount(response.meta.total);
        } else {
          setBookmarkCount(0);
        }
      } catch (error: any) {
        if (!isNetworkError(error)) {
          if (error.response?.status === 401) {
            setBookmarkCount(0);
          } else {
            console.error('Failed to fetch bookmark count:', error);
            setBookmarkCount(0);
          }
        } else {
          setBookmarkCount(0);
        }
      }
    };

    fetchBookmarkCount();
  }, [isAuthenticated]);

  // Fetch featured and trending tags
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const [featuredResponse, trendingResponse] = await Promise.all([
          tagsService.getFeaturedTags(3).catch(() => ({ tags: [] })),
          tagsService.getTrendingTags('7d', 6).catch(() => ({ tags: [] }))
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

  // Fetch GitHub contribute URL and email footer settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const [url, settings] = await Promise.all([
          siteSettingsService.getSetting('github_contribute_url', false).catch(() => null), // Load without cache for fresh data
          siteSettingsService.getSettings([
            'site_name',
            'email_footer_html',
            'email_footer_tagline',
            'email_footer_copyright',
            'email_footer_made_with_text',
            'email_footer_social_twitter',
            'email_footer_social_github',
            'email_footer_social_discord',
            'email_footer_social_linkedin',
            'email_footer_social_facebook',
            'email_footer_social_instagram',
            'email_footer_social_youtube'
          ], false).catch(() => ({} as Record<string, string | null>)) // Load without cache for fresh data
        ]);
        
        // Handle URL: use null if empty string or null, otherwise use the URL
        const contributeUrl = url && url.trim() !== '' ? url.trim() : null;
        setGithubContributeUrl(contributeUrl);
        
        const settingsRecord = settings as Record<string, string | null>;
        
        setSiteSettings({
          siteName: settingsRecord.site_name || null,
          emailFooterHtml: settingsRecord.email_footer_html || null,
          emailFooterTagline: settingsRecord.email_footer_tagline || null,
          emailFooterCopyright: settingsRecord.email_footer_copyright || null,
          emailFooterMadeWithText: settingsRecord.email_footer_made_with_text || null,
          emailFooterSocialTwitter: settingsRecord.email_footer_social_twitter || null,
          emailFooterSocialGithub: settingsRecord.email_footer_social_github || null,
          emailFooterSocialDiscord: settingsRecord.email_footer_social_discord || null,
          emailFooterSocialLinkedin: settingsRecord.email_footer_social_linkedin || null,
          emailFooterSocialFacebook: settingsRecord.email_footer_social_facebook || null,
          emailFooterSocialInstagram: settingsRecord.email_footer_social_instagram || null,
          emailFooterSocialYoutube: settingsRecord.email_footer_social_youtube || null,
        });
      } catch (err: any) {
        // Don't log network errors (server offline) - already handled by interceptor
        if (!isNetworkError(err)) {
        console.error('Error fetching settings:', err);
        }
        // Set to null on error so button is disabled
        setGithubContributeUrl(null);
      }
    };

    fetchSettings();
  }, []);

  const handleTagClick = (tag: Tag) => {
    navigate(`/?tags=${encodeURIComponent(tag.slug)}`);
  };

  // Combine menu items based on authentication
  const allMenuItems = isAuthenticated ? [...mainMenuItems, ...authenticatedMenuItems] : mainMenuItems;

  const isLgUp = useMediaQuery('(min-width: 1024px)');
  const isIconRail = (forceIconOnly || !showText) && !isMobileSidebar;
  /** Icon rail md–lg only; full aligned sidebar at lg+ */
  const isNavRail = !isMobileSidebar && showText && !forceIconOnly && !isLgUp;
  const navItemClass = (active: boolean) => {
    const layout = isIconRail || isNavRail
      ? 'h-9 w-9 shrink-0 justify-center p-0'
      : isMobileSidebar
        ? 'w-full gap-2.5 px-3 py-2 justify-start'
        : 'w-full gap-2.5 px-2.5 py-2 justify-start';
    const tone = active
      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
      : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/[0.06] dark:hover:text-zinc-100';
    return `flex items-center text-left rounded-lg text-sm font-medium transition-colors touch-manipulation ${layout} ${tone}`;
  };

  const sectionLabelClass =
    'mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500';

  const panelClass =
    'rounded-xl border border-zinc-200/80 bg-white/90 shadow-sm dark:border-white/[0.08] dark:bg-zinc-900/40';

  const panelRailClass = `${panelClass} flex w-full flex-col items-center gap-0.5 py-1.5 px-1`;
  const panelExpandedClass = `${panelClass} w-full p-1`;

  const panelInnerClass = isIconRail || isNavRail ? panelRailClass : panelExpandedClass;

  const menuListClass =
    isIconRail || isNavRail
      ? 'flex w-full flex-col items-center gap-0.5'
      : 'flex w-full flex-col space-y-0.5';

  const menuListItemClass =
    isIconRail || isNavRail ? 'flex w-full justify-center' : 'w-full';

  const showNavTooltips = isIconRail || isNavRail || !showText || forceIconOnly;

  const wrapWithTooltip = (label: string, node: React.ReactNode) =>
    isIconRail || isNavRail ? (
      <div className="relative flex w-full justify-center">
        <Tooltip content={label} delay={200} side="right">
          {node}
        </Tooltip>
      </div>
    ) : (
      <Tooltip content={label} delay={200} side="right" fullWidth>
        {node}
      </Tooltip>
    );

  const collapsedRailDivider = (
    <div className="mx-auto my-1 h-px w-8 bg-zinc-200/80 dark:bg-white/10" aria-hidden />
  );

  const tagIconBtnClass =
    'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-zinc-100 dark:hover:bg-white/[0.06]';

  const renderTagIconButton = (tag: Tag) => (
    <button type="button" onClick={() => handleTagClick(tag)} className={tagIconBtnClass}>
      {tag.logoUrl ? (
        <img
          src={tag.logoUrl}
          alt=""
          className="h-7 w-7 shrink-0 rounded-md border border-zinc-200/80 object-cover dark:border-white/10"
        />
      ) : (
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-zinc-200 dark:bg-zinc-700">
          <Hash size={14} className="text-zinc-600 dark:text-zinc-300" />
        </span>
      )}
    </button>
  );

  const useTagTooltips = isIconRail || isNavRail;

  // Build social links array from database settings, dynamically determining icons from URLs
  const socialLinks = useMemo(() => {
    const links: SocialLinkInfo[] = [];
    
    // Collect all social URLs from settings
    const socialUrls = [
      siteSettings.emailFooterSocialTwitter,
      siteSettings.emailFooterSocialGithub,
      siteSettings.emailFooterSocialDiscord,
      siteSettings.emailFooterSocialLinkedin,
      siteSettings.emailFooterSocialFacebook,
      siteSettings.emailFooterSocialInstagram,
      siteSettings.emailFooterSocialYoutube,
    ].filter((url): url is string => url !== null && url !== undefined && url.trim() !== '');
    
    // Determine platform and icon for each URL
    socialUrls.forEach((url) => {
      const platformInfo = getSocialPlatformFromUrl(url);
      if (platformInfo) {
        links.push(platformInfo);
      }
    });
    
    return links;
  }, [
    siteSettings.emailFooterSocialTwitter,
    siteSettings.emailFooterSocialGithub,
    siteSettings.emailFooterSocialDiscord,
    siteSettings.emailFooterSocialLinkedin,
    siteSettings.emailFooterSocialFacebook,
    siteSettings.emailFooterSocialInstagram,
    siteSettings.emailFooterSocialYoutube
  ]);

  return (
    <aside
      className={
        isMobileSidebar
          ? 'w-full'
          : 'flex h-full min-h-0 w-full flex-1 flex-col z-40'
      }
    >
      <StickyAsidePanel pin={false} className="pb-2">
        <nav className="flex w-full flex-col gap-3 md:gap-4" aria-label="Main navigation">
          <div className={`${panelInnerClass} w-full`}>
            <ul className={menuListClass} role="list">
              {allMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeCategory === item.id;
                const button = (
                  <button
                    type="button"
                    onClick={() => onCategoryChange(item.id)}
                    className={navItemClass(isActive)}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon size={17} strokeWidth={2} className="shrink-0 opacity-90" />
                    {showText && !forceIconOnly && (isMobileSidebar || isLgUp) && (
                      <span className="min-w-0 flex-1 truncate text-left text-start">{item.name}</span>
                    )}
                    {showText && !forceIconOnly && item.id === 'bookmarks' && bookmarkCount !== null && (
                      <span
                        className={`${isMobileSidebar || isLgUp ? 'inline' : 'hidden'} shrink-0 tabular-nums rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                          isActive
                            ? 'bg-white/15 text-white'
                            : 'bg-zinc-100 text-zinc-600 dark:bg-white/10 dark:text-zinc-300'
                        }`}
                      >
                        {bookmarkCount}
                      </span>
                    )}
                  </button>
                );
                return (
                  <li key={item.id} className={menuListItemClass}>
                    <div className="w-full">
                      {showNavTooltips ? wrapWithTooltip(item.name, button) : button}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {featuredTags.length > 0 && showText && !forceIconOnly && (
            <div className="w-full">
              {(isMobileSidebar || isLgUp) && <p className={sectionLabelClass}>Featured</p>}
              {isNavRail && collapsedRailDivider}
              <div className={isNavRail || isIconRail ? panelRailClass : panelExpandedClass}>
                <ul className={menuListClass} role="list">
                  {featuredTags.map((tag) => {
                    const tagBtn = isNavRail ? (
                      renderTagIconButton(tag)
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleTagClick(tag)}
                        className={
                          isIconRail
                            ? tagIconBtnClass
                            : 'flex w-full items-center justify-start gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/[0.06] dark:hover:text-zinc-100'
                        }
                      >
                        {tag.logoUrl ? (
                          <img
                            src={tag.logoUrl}
                            alt=""
                            className="h-7 w-7 shrink-0 rounded-md border border-zinc-200/80 object-cover dark:border-white/10"
                          />
                        ) : (
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-zinc-200 dark:bg-zinc-700">
                            <Hash size={14} className="text-zinc-600 dark:text-zinc-300" />
                          </span>
                        )}
                        {(isMobileSidebar || isLgUp) && (
                          <span className="min-w-0 flex-1 truncate text-left text-start">{tag.name}</span>
                        )}
                      </button>
                    );
                    return (
                      <li key={tag.id} className={menuListItemClass}>
                        <div className="w-full">
                          {useTagTooltips ? wrapWithTooltip(tag.name, tagBtn) : tagBtn}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}

          {trendingTags.length > 0 && showText && !forceIconOnly && (
            <>
              {isNavRail && (
                <div>
                  <p className="sr-only">Trending</p>
                  {collapsedRailDivider}
                  <div className={panelRailClass}>
                    <ul className={menuListClass} role="list">
                    {trendingTags.slice(0, 5).map((tag) => (
                      <li key={tag.id} className={menuListItemClass}>
                        {wrapWithTooltip(tag.name, renderTagIconButton(tag))}
                      </li>
                    ))}
                    <li className={menuListItemClass}>
                      {wrapWithTooltip(
                        'Browse all tags',
                        <button
                          type="button"
                          onClick={() => navigate('/tags')}
                          className={tagIconBtnClass}
                          aria-label="Browse all tags"
                        >
                          <Hash size={16} strokeWidth={2} className="text-zinc-500 dark:text-zinc-400" />
                        </button>
                      )}
                    </li>
                    </ul>
                  </div>
                </div>
              )}

              {(isMobileSidebar || isLgUp) && (
                <div className="w-full">
                  <p className={sectionLabelClass}>Trending</p>
                <div className={`${panelClass} p-2`}>
                  <div className="flex flex-wrap gap-1">
                    {trendingTags.slice(0, 5).map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => handleTagClick(tag)}
                        className="inline-flex max-w-full items-center gap-1 rounded-md border border-zinc-200/70 bg-zinc-50 px-2 py-0.5 text-[11px] font-medium text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-zinc-100 hover:text-zinc-900 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-400 dark:hover:bg-white/[0.08] dark:hover:text-zinc-200"
                      >
                        {tag.logoUrl ? (
                          <img src={tag.logoUrl} alt="" className="h-3.5 w-3.5 rounded object-cover" />
                        ) : (
                          <Hash size={10} className="shrink-0 opacity-60" />
                        )}
                        <span className="truncate">{tag.name}</span>
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/tags')}
                    className="mt-2 w-full rounded-lg px-2 py-1.5 text-left text-[11px] font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-white/[0.06] dark:hover:text-zinc-200"
                  >
                    Browse all tags →
                  </button>
                </div>
                </div>
              )}
            </>
          )}

          {showText && !forceIconOnly && (
            <div className="w-full">
              {(isMobileSidebar || isLgUp) && <p className={sectionLabelClass}>Resources</p>}
              {isNavRail && collapsedRailDivider}
              <div className={`${panelInnerClass} w-full`}>
                <ul className={menuListClass} role="list">
                  {otherMenuItems.map((item) => {
                    const Icon = item.icon;
                    const isExternal = (item as any).external && item.id === 'contribute';
                    const externalUrl = item.id === 'contribute' ? githubContributeUrl : null;
                    const resourceBtn = (
                      <button
                        type="button"
                        onClick={() => {
                          if (isExternal && externalUrl) {
                            window.open(externalUrl, '_blank', 'noopener noreferrer');
                          } else {
                            const routeMap: Record<string, string> = {
                              about: '/about',
                              contact: '/contact',
                              conduct: '/code-of-conduct',
                              privacy: '/privacy-policy',
                              terms: '/terms-of-use',
                              'reputation-system': '/reputation-system',
                            };
                            const route = routeMap[item.id];
                            if (route) navigate(route);
                            else onCategoryChange(item.id);
                          }
                        }}
                        disabled={isExternal && !externalUrl}
                        className={`${navItemClass(false)} ${isNavRail ? '' : 'text-xs'} ${isExternal && !externalUrl ? 'cursor-not-allowed opacity-40' : ''}`}
                      >
                        <Icon size={17} strokeWidth={2} className="shrink-0 opacity-90" />
                        {showText && !forceIconOnly && (isMobileSidebar || isLgUp) && (
                          <span className="min-w-0 flex-1 truncate text-left text-start">{item.name}</span>
                        )}
                      </button>
                    );
                    return (
                      <li key={item.id} className={menuListItemClass}>
                        <div className="w-full">
                          {showNavTooltips ? wrapWithTooltip(item.name, resourceBtn) : resourceBtn}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}

          {showText && !forceIconOnly && isNavRail && socialLinks.length > 0 && (
            <div className="w-full">
              {collapsedRailDivider}
              <div className={`${panelRailClass} gap-1`}>
                {socialLinks.map((link, index) => {
                  const IconComponent = link.icon;
                  const socialBtn = (
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${tagIconBtnClass} text-zinc-600 dark:text-zinc-400`}
                      aria-label={link.label}
                    >
                      {link.platform === 'discord' ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C2.451 6.018 1.732 7.713 1.378 9.48a.082.082 0 0 0 .031.084a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.083c-.38-1.827-1.13-3.506-2.069-5.084a.059.059 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                        </svg>
                      ) : IconComponent ? (
                        <IconComponent size={16} />
                      ) : null}
                    </a>
                  );
                  return (
                    <div key={`${link.platform}-${index}`} className={menuListItemClass}>
                      {wrapWithTooltip(link.label, socialBtn)}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {showText && !forceIconOnly && (
            <footer className={`mt-1 w-full space-y-2 px-1 ${isMobileSidebar || isLgUp ? '' : 'hidden'}`}>
              {siteSettings.emailFooterHtml ? (
                <div
                  className="text-center text-[10px] leading-relaxed text-zinc-400 dark:text-zinc-500"
                  dangerouslySetInnerHTML={{
                    __html: siteSettings.emailFooterHtml
                      .replace(/\{\{siteName\}\}/g, siteSettings.siteName || 'DevCommunity')
                      .replace(/\{\{year\}\}/g, new Date().getFullYear().toString())
                      .replace(/\{\{version\}\}/g, (() => {
                        const tag = getGitTag();
                        const commit = getCommitHash();
                        return tag ? `${tag} (${commit.substring(0, 7)})` : `${getVersion()} (${commit.substring(0, 7)})`;
                      })())
                      .replace(/\{\{madeWithText\}\}/g, siteSettings.emailFooterMadeWithText || 'by developers')
                      .replace(
                        /\{\{copyright\}\}/g,
                        siteSettings.emailFooterCopyright ||
                          `© ${new Date().getFullYear()} ${siteSettings.siteName || 'DevCommunity'}`
                      ),
                  }}
                />
              ) : (
                <>
                  <p className="text-center text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
                    {siteSettings.siteName || 'DevCommunity'}
                  </p>
                  <p className="text-center text-[10px] tabular-nums text-zinc-400 dark:text-zinc-500">
                    {(() => {
                      const tag = getGitTag();
                      const commit = getCommitHash();
                      return tag ? `v${tag} · ${commit.substring(0, 7)}` : `v${getVersion()} · ${commit.substring(0, 7)}`;
                    })()}
                  </p>
                  <p className="text-center text-[10px] text-zinc-400 dark:text-zinc-500">
                    © {new Date().getFullYear()}{' '}
                    {siteSettings.siteName || 'DevCommunity'}
                  </p>
                </>
              )}
              {socialLinks.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                  {socialLinks.map((link, index) => {
                    const IconComponent = link.icon;
                    return (
                      <a
                        key={`${link.platform}-${index}`}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={link.className}
                        aria-label={link.label}
                        title={link.label}
                      >
                        {link.platform === 'discord' ? (
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C2.451 6.018 1.732 7.713 1.378 9.48a.082.082 0 0 0 .031.084a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.083c-.38-1.827-1.13-3.506-2.069-5.084a.059.059 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                          </svg>
                        ) : IconComponent ? (
                          <IconComponent size={13} />
                        ) : null}
                      </a>
                    );
                  })}
                </div>
              )}
            </footer>
          )}
        </nav>
      </StickyAsidePanel>
    </aside>
  );
}
