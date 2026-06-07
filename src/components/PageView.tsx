import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Users, MessageSquare, UserPlus, Bell, BellOff, Globe, Calendar, Building2, FileText, ExternalLink, AlertTriangle, Shield, Share2, Loader2, Twitter, Linkedin, Github, Facebook, Instagram, Youtube, Send, MessageCircle, Gamepad2, ChevronRight, Award } from 'lucide-react';
import { InfiniteScroll } from './InfiniteScroll';
import { TabPills } from './TabPills';
import { BioText } from './BioText';
import { SocialLinks } from './SocialLinks';
import { GlassCard } from './GlassCard';
import { Badge } from './Badge';
import { CompactPostCard } from './CompactPostCard';
import {
  asidePanelClass,
  asideStatChipClass,
  compactPostGridClass,
  postCardSurfaceClass,
  postCardDividerClass,
  postTagClass,
} from './postCardSurface';
import { formatListingLabel } from './listingPageChrome';
import { VerifiedBadge } from './VerifiedBadge';
import { Avatar } from './Avatar';
import { ShareDropdown } from './ShareDropdown';
import { Post } from '../types';
import pagesService from '../services/api/pages.service';
import { useAuth } from '../contexts/AuthContext';
import { SEOHead } from './SEOHead';
import { useNavigate } from 'react-router-dom';
import { PageViewSkeleton } from './skeletons';
import { usePaginatedPageMembers } from '../hooks/usePaginatedPageMembers';
const DEFAULT_PAGE_LOGO = 'https://api.dicebear.com/7.x/shapes/svg?seed=Adaex%20App';

type SocialPlatform =
  | 'website'
  | 'twitter'
  | 'linkedin'
  | 'github'
  | 'discord'
  | 'telegram'
  | 'whatsapp'
  | 'facebook'
  | 'instagram'
  | 'youtube';

interface SocialLinkConfig {
  label: string;
  icon: React.ReactNode;
  iconBgClass: string;
  cardClass: string;
}

const SOCIAL_LINKS_CONFIG: Record<SocialPlatform, SocialLinkConfig> = {
  website: {
    label: 'Website',
    icon: <Globe size={18} className="text-white" />,
    iconBgClass: 'bg-purple-500',
    cardClass:
      'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30',
  },
  twitter: {
    label: 'Twitter / X',
    icon: <Twitter size={18} className="text-white" />,
    iconBgClass: 'bg-slate-900',
    cardClass:
      'bg-slate-900/5 dark:bg-slate-900/40 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 hover:bg-slate-900/10 dark:hover:bg-slate-900/60',
  },
  linkedin: {
    label: 'LinkedIn',
    icon: <Linkedin size={18} className="text-white" />,
    iconBgClass: 'bg-blue-600',
    cardClass:
      'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30',
  },
  github: {
    label: 'GitHub',
    icon: <Github size={18} className="text-white" />,
    iconBgClass: 'bg-gray-900',
    cardClass:
      'bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700',
  },
  discord: {
    label: 'Discord',
    icon: <Gamepad2 size={18} className="text-white" />,
    iconBgClass: 'bg-indigo-600',
    cardClass:
      'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/30',
  },
  telegram: {
    label: 'Telegram',
    icon: <Send size={18} className="text-white" />,
    iconBgClass: 'bg-sky-500',
    cardClass:
      'bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-300 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-sky-900/30',
  },
  whatsapp: {
    label: 'WhatsApp',
    icon: <MessageCircle size={18} className="text-white" />,
    iconBgClass: 'bg-emerald-500',
    cardClass:
      'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30',
  },
  facebook: {
    label: 'Facebook',
    icon: <Facebook size={18} className="text-white" />,
    iconBgClass: 'bg-blue-700',
    cardClass:
      'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30',
  },
  instagram: {
    label: 'Instagram',
    icon: <Instagram size={18} className="text-white" />,
    iconBgClass: 'bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600',
    cardClass:
      'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-300 border border-pink-200 dark:border-pink-800 hover:bg-pink-100 dark:hover:bg-pink-900/30',
  },
  youtube: {
    label: 'YouTube',
    icon: <Youtube size={18} className="text-white" />,
    iconBgClass: 'bg-red-600',
    cardClass:
      'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30',
  },
};

const ensureHttpsUrl = (value: string): string => {
  if (!value) return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed.replace(/^http:\/\//i, 'https://');
  }
  if (trimmed.startsWith('mailto:') || trimmed.startsWith('tel:')) {
    return trimmed;
  }
  return `https://${trimmed.replace(/^\/+/, '')}`;
};

const buildSocialLinkUrl = (platform: SocialPlatform, rawValue?: string | null): string | null => {
  if (!rawValue) return null;
  const value = rawValue.trim();
  if (!value) return null;

  switch (platform) {
    case 'twitter': {
      if (/^https?:\/\//i.test(value) || value.includes('twitter.') || value.includes('x.com')) {
        return ensureHttpsUrl(value);
      }
      const handle = value.replace(/^@/, '');
      return `https://twitter.com/${handle}`;
    }
    case 'linkedin': {
      if (/^https?:\/\//i.test(value) || value.includes('linkedin.')) {
        return ensureHttpsUrl(value);
      }
      const handle = value.replace(/^@/, '');
      return `https://www.linkedin.com/in/${handle}`;
    }
    case 'github': {
      if (/^https?:\/\//i.test(value) || value.includes('github.')) {
        return ensureHttpsUrl(value);
      }
      const handle = value.replace(/^@/, '');
      return `https://github.com/${handle}`;
    }
    case 'instagram': {
      if (/^https?:\/\//i.test(value) || value.includes('instagram.')) {
        return ensureHttpsUrl(value);
      }
      const handle = value.replace(/^@/, '');
      return `https://instagram.com/${handle}`;
    }
    case 'facebook': {
      if (/^https?:\/\//i.test(value) || value.includes('facebook.')) {
        return ensureHttpsUrl(value);
      }
      const handle = value.replace(/^@/, '');
      return `https://facebook.com/${handle}`;
    }
    case 'youtube': {
      if (/^https?:\/\//i.test(value) || value.includes('youtube.') || value.includes('youtu.be')) {
        return ensureHttpsUrl(value);
      }
      return `https://youtube.com/${value}`;
    }
    case 'discord': {
      if (/^https?:\/\//i.test(value) || value.includes('discord.')) {
        return ensureHttpsUrl(value);
      }
      if (value.startsWith('discord.gg/')) {
        return ensureHttpsUrl(`https://${value}`);
      }
      return `https://discord.gg/${value}`;
    }
    case 'telegram': {
      if (/^https?:\/\//i.test(value) || value.startsWith('t.me')) {
        return ensureHttpsUrl(value);
      }
      const handle = value.replace(/^@/, '');
      return `https://t.me/${handle}`;
    }
    case 'whatsapp': {
      if (/^https?:\/\//i.test(value) || value.includes('wa.me') || value.includes('whatsapp.')) {
        return ensureHttpsUrl(value);
      }
      const digits = value.replace(/[^\d]/g, '');
      if (digits.length >= 8) {
        return `https://wa.me/${digits}`;
      }
      return ensureHttpsUrl(value);
    }
    case 'website':
    default:
      return ensureHttpsUrl(value);
  }
};

const getDisplayUrl = (url: string): string => {
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname && parsed.pathname !== '/' ? parsed.pathname.replace(/\/$/, '') : '';
    return `${parsed.hostname}${pathname}`;
  } catch {
    return url;
  }
};

interface SocialLinkEntry {
  key: string;
  href: string;
  label: string;
  icon: React.ReactNode;
  iconBgClass: string;
  cardClass: string;
}

interface PageViewProps {
  pageId?: string;
  pageSlug?: string;
  onBack: () => void;
  onPostClick?: (post: Post) => void;
  onLoginRequired?: () => void;
}

type TabType = 'posts' | 'about' | 'members' | 'followers' | 'manage' | 'stats';

export function PageView({ pageId, pageSlug, onBack, onPostClick, onLoginRequired }: PageViewProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowingLoading, setIsFollowingLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [pageData, setPageData] = useState<any>(null);
  const [pagePosts, setPagePosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const pageSocialLinks = useMemo(() => {
    if (!pageData) return {};
    const links = { ...(pageData.socialLinks || {}) } as Record<string, string>;
    if (pageData.url && !links.website) {
      links.website = pageData.url;
    }
    return links;
  }, [pageData]);

  const socialLinkEntries = useMemo<SocialLinkEntry[]>(() => {
    if (!pageData) return [];

    const links = (pageData.socialLinks || {}) as Record<string, string>;
    const entries: SocialLinkEntry[] = [];
    const seen = new Set<string>();

    const pushEntry = (key: string, href: string | null, config: SocialLinkConfig) => {
      if (!href) return;
      const normalizedHref = href.trim();
      if (!normalizedHref || seen.has(normalizedHref)) return;

      entries.push({
        key,
        href: normalizedHref,
        label: config.label,
        icon: config.icon,
        iconBgClass: config.iconBgClass,
        cardClass: config.cardClass,
      });

      seen.add(normalizedHref);
    };

    (Object.keys(SOCIAL_LINKS_CONFIG) as SocialPlatform[]).forEach((platform) => {
      let rawValue: string | undefined;

      if (platform === 'website') {
        rawValue = links[platform] || pageData.url || (pageData as any)?.website || '';
      } else {
        rawValue = links[platform] ?? links[platform.toLowerCase()] ?? links[platform.toUpperCase()];
      }

      const href = buildSocialLinkUrl(platform, rawValue);
      pushEntry(platform, href, SOCIAL_LINKS_CONFIG[platform]);
    });

    Object.entries(links).forEach(([rawKey, value]) => {
      const normalizedKey = rawKey.toLowerCase();
      if ((SOCIAL_LINKS_CONFIG as Record<string, SocialLinkConfig>)[normalizedKey as SocialPlatform]) {
        return;
      }

      const href = buildSocialLinkUrl('website', value);
      if (!href) return;

      const label = rawKey
        .replace(/_/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());

      pushEntry(normalizedKey, href, {
        label,
        icon: <span className="text-white text-lg">🔗</span>,
        iconBgClass: 'bg-gray-500',
        cardClass:
          'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-200/80 dark:hover:bg-gray-700/70',
      });
    });

    return entries;
  }, [pageData]);

  // SEO metadata will be set via SEOHead component below

  // Fetch page data - REBUILT FROM SCRATCH
  useEffect(() => {
    const fetchPageData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const identifier = pageSlug || pageId;
        if (!identifier) {
          throw new Error('Page identifier is required');
        }
        
        // Fetch page data from API
        const pageResponse = await pagesService.getPage(identifier);
        
        // API returns: { page: { ...pageData, isFollowing: boolean } }
        const pageDataFromApi = pageResponse.page || pageResponse;
        
        // Parse socialLinks if needed
        let parsedSocialLinks = null;
        if (pageDataFromApi.socialLinks !== undefined && pageDataFromApi.socialLinks !== null) {
          if (typeof pageDataFromApi.socialLinks === 'string') {
            try {
              parsedSocialLinks = JSON.parse(pageDataFromApi.socialLinks);
            } catch (e) {
              console.error('[PageView] Error parsing socialLinks:', e);
              parsedSocialLinks = null;
            }
          } else if (typeof pageDataFromApi.socialLinks === 'object' && pageDataFromApi.socialLinks !== null) {
            if (Object.keys(pageDataFromApi.socialLinks).length > 0) {
              parsedSocialLinks = pageDataFromApi.socialLinks;
            } else {
              parsedSocialLinks = null;
            }
          }
        }
        
        // Extract isFollowing - MUST be boolean, default to false
        // API returns correct isFollowing based on authenticated user
        const isFollowingFromApi = pageDataFromApi?.isFollowing === true;
        
        // Set state immediately
        setIsFollowing(isFollowingFromApi);
        
        // Store complete page data with isFollowing explicitly set
        const completePageData = {
          ...pageDataFromApi,
          isFollowing: isFollowingFromApi, // Explicitly set to ensure it's always boolean
          followerCount: pageDataFromApi?.followerCount || pageDataFromApi?.follower_count || 0,
          memberCount: Number(pageDataFromApi?.memberCount ?? pageDataFromApi?.member_count ?? 0),
          socialLinks: parsedSocialLinks, // Use parsed social links
        };
        
        console.log('[PageView] Page data loaded:', {
          id: completePageData.id,
          name: completePageData.name,
          hasSocialLinks: !!completePageData.socialLinks,
          socialLinksKeys: completePageData.socialLinks ? Object.keys(completePageData.socialLinks) : [],
          socialLinksData: completePageData.socialLinks,
        });
        
        setPageData(completePageData);
        
        // Fetch posts
        const postsResponse = await pagesService.getPagePosts(pageDataFromApi.slug || identifier);
        const posts = postsResponse.posts || postsResponse.data || postsResponse || [];
        const uniquePosts = Array.isArray(posts) ? posts.filter((post: Post, index: number, self: Post[]) => 
          index === self.findIndex((p: Post) => p.id === post.id)
        ) : [];
        setPagePosts(uniquePosts);
      } catch (err: any) {
        setError(err?.message || 'Failed to load page data');
        console.error('Error fetching page:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
  }, [pageId, pageSlug, user?.id]); // Re-fetch when user changes (login/logout)

  // Handle follow toggle - REBUILT FROM SCRATCH
  const handleFollowToggle = async () => {
    if (!pageData || !pageData.id || !user) {
      if (onLoginRequired) {
        onLoginRequired();
      }
      return;
    }
    
    const currentFollowing = isFollowing;
    const previousFollowerCount = pageData.followerCount || 0;
    
    // Optimistic update
    setIsFollowing(!currentFollowing);
    setIsFollowingLoading(true);
    
    try {
      let response;
      
      if (currentFollowing) {
        // User is following, so unfollow
        response = await pagesService.leavePage(pageData.id);
      } else {
        // User is not following, so follow
        response = await pagesService.joinPage(pageData.id);
      }
      
      // API response: { message: "...", isFollowing: boolean, followerCount: number }
      const newIsFollowing = response?.isFollowing === true;
      const newFollowerCount = response?.followerCount ?? previousFollowerCount;
      
      // Update state with actual API response
      setIsFollowing(newIsFollowing);
        
      // Update pageData to persist the change
        setPageData({ 
          ...pageData, 
        isFollowing: newIsFollowing,
        followerCount: newFollowerCount
        });
      
    } catch (err: any) {
      // Revert on error
      setIsFollowing(currentFollowing);
      
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to update follow status';
      console.error('Error toggling follow:', err);
      alert(errorMessage);
    } finally {
      setIsFollowingLoading(false);
    }
  };

  const handleNotificationToggle = () => {
    setNotificationsEnabled(!notificationsEnabled);
  };

  if (loading) {
    return <PageViewSkeleton />;
  }

  if (error || !pageData) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center bg-gray-50 dark:bg-transparent">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Page Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error || 'The page you are looking for does not exist.'}</p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg shadow-blue-500/25"
          >
            Back to Pages
          </button>
        </div>
      </div>
    );
  }

  const membersCount = Number(pageData.memberCount ?? pageData.member_count ?? 0);
  const followersCount = Number(pageData.followerCount ?? pageData.follower_count ?? 0);

  const tabs = [
    { id: 'posts', label: 'Posts', icon: MessageSquare, count: pagePosts.length },
    { id: 'about', label: 'About', icon: FileText },
    { id: 'members', label: 'Members', icon: Shield, count: membersCount },
    { id: 'followers', label: 'Followers', icon: Users, count: followersCount },
  ];

  return (
    <>
      {pageData && (
        <SEOHead
          title={pageData.seoTitle || pageData.name}
          description={pageData.seoDescription || pageData.description?.substring(0, 160).replace(/[#*`_~\[\]()]/g, '').replace(/\n+/g, ' ').trim() || 'DevCommunity Page'}
          image={pageData.ogImageUrl || pageData.coverImageUrl || pageData.logoUrl}
          url={`${window.location.origin}/pages/${pageData.slug}`}
          type="website"
        />
      )}
      <div className="min-h-screen pb-20 sm:pb-24">
      <div className="relative">
        <div className="relative h-28 sm:h-36 md:h-44 lg:h-52 overflow-hidden">
          {pageData.coverImageUrl ? (
            <>
              <img
                src={pageData.coverImageUrl}
                alt={`${pageData.name} cover`}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-black/20" />
            </>
          ) : (
            <div className="h-full w-full bg-gray-200 dark:bg-gray-800" />
          )}

          <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between gap-2 sm:top-4 sm:left-4 sm:right-4">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white/95 px-3 py-2 text-xs font-medium text-gray-700 backdrop-blur-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900/95 dark:text-gray-300 dark:hover:bg-gray-800 sm:text-sm"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Pages</span>
            </button>
            <div className="flex items-center gap-1.5">
              {user && isFollowing && (
                <button
                  type="button"
                  onClick={handleNotificationToggle}
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
                    notificationsEnabled
                      ? 'border-blue-400/50 bg-blue-500 text-white'
                      : 'border-gray-200 bg-white/95 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900/95 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}
                  title={notificationsEnabled ? 'Notifications enabled' : 'Enable notifications'}
                >
                  {notificationsEnabled ? <Bell size={18} /> : <BellOff size={18} />}
                </button>
              )}
              <ShareDropdown
                url={window.location.href}
                title={pageData.name}
                hashtags={pageData.category ? [pageData.category] : []}
                description={pageData.description?.substring(0, 150)}
                trigger={
                  <button
                    type="button"
                    aria-label="Share page"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white/95 text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900/95 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    <Share2 size={18} />
                  </button>
                }
              />
            </div>
          </div>
        </div>

        <div className="relative z-10 -mt-8 px-4 sm:-mt-9 sm:px-6 md:-mt-10 md:px-8">
          <GlassCard className="p-3 sm:p-4 md:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
              <div className="mx-auto shrink-0 sm:mx-0">
                <div className="h-14 w-14 overflow-hidden rounded-xl bg-white ring-2 ring-white dark:bg-gray-800 dark:ring-zinc-900 sm:h-16 sm:w-16">
                  <img
                    src={pageData.logoUrl || DEFAULT_PAGE_LOGO}
                    alt={`${pageData.name} logo`}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = DEFAULT_PAGE_LOGO;
                    }}
                  />
                </div>
              </div>

              <div className="min-w-0 flex-1 text-left">
                <div className="mb-2 flex w-full flex-row items-center justify-between gap-2">
                  <div className="flex min-w-0 flex-1 items-center justify-start gap-1.5">
                    <h1 className="truncate text-lg font-semibold text-zinc-900 dark:text-zinc-50 sm:text-xl">
                      {pageData.name}
                    </h1>
                    {pageData.isVerified && (
                      <VerifiedBadge variant="page" size={16} className="h-4 w-4 shrink-0" />
                    )}
                  </div>

                  <div className="flex shrink-0 items-center justify-end gap-1.5">
                    {!user ? (
                      <button
                        type="button"
                        onClick={() => onLoginRequired?.()}
                        className="inline-flex h-8 items-center gap-1.5 rounded-md bg-zinc-900 px-3 text-xs font-medium text-white transition-all hover:bg-zinc-800 active:scale-[0.98] dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                      >
                        <UserPlus size={14} strokeWidth={2.25} />
                        <span>Follow</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleFollowToggle}
                        disabled={isFollowingLoading}
                        className={`inline-flex h-8 min-w-[5.25rem] items-center justify-center gap-1.5 rounded-md px-3 text-xs font-medium transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${
                          isFollowing
                            ? 'border border-zinc-200/90 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:border-white/15 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/10'
                            : 'bg-zinc-900 text-white shadow-sm ring-1 ring-zinc-900/10 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:ring-white/20 dark:hover:bg-white'
                        }`}
                      >
                        {isFollowingLoading ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <UserPlus size={14} strokeWidth={2.25} />
                        )}
                        <span>{isFollowingLoading ? '…' : isFollowing ? 'Following' : 'Follow'}</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="mb-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-zinc-500 dark:text-zinc-400 sm:text-xs">
                  {pageData.category && (
                    <span className="inline-flex items-center gap-1">
                      <Building2 size={12} className="shrink-0" />
                      {pageData.category}
                    </span>
                  )}
                  {pageData.createdAt && (
                    <span className="inline-flex items-center gap-1 whitespace-nowrap">
                      <Calendar size={12} className="shrink-0" />
                      Created{' '}
                      {new Date(pageData.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  )}
                </div>

                <div className="mb-2 flex flex-wrap items-center gap-x-0.5 gap-y-0.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab('followers')}
                    className="inline-flex items-baseline gap-0.5 rounded-md px-1 py-0.5 -mx-0.5 text-blue-600 transition-colors hover:bg-blue-500/10 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-500/15 dark:hover:text-blue-300"
                  >
                    <span className="text-xs font-semibold tabular-nums">
                      {(pageData.followerCount || pageData.follower_count || 0).toLocaleString()}
                    </span>
                    <span className="text-[11px] font-medium opacity-90">Followers</span>
                  </button>
                  <span className="mx-1.5 text-zinc-300 dark:text-zinc-600" aria-hidden>
                    ·
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('posts')}
                    className="inline-flex items-baseline gap-0.5 rounded-md px-1 py-0.5 -mx-0.5 text-zinc-900 transition-colors hover:bg-zinc-100 dark:text-zinc-50 dark:hover:bg-white/10"
                  >
                    <span className="text-xs font-semibold tabular-nums">
                      {(pageData.postCount || pagePosts.length || 0).toLocaleString()}
                    </span>
                    <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Posts</span>
                  </button>
                  {pageData.viewCount ? (
                    <>
                      <span className="mx-1.5 text-zinc-300 dark:text-zinc-600" aria-hidden>
                        ·
                      </span>
                      <span className="inline-flex items-baseline gap-0.5">
                        <span className="text-xs font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
                          {pageData.viewCount.toLocaleString()}
                        </span>
                        <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Views</span>
                      </span>
                    </>
                  ) : null}
                </div>

                {pageData.description && (
                  <BioText text={pageData.description} className="mb-2 max-w-2xl" />
                )}

                <SocialLinks links={pageSocialLinks} />
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      <div className="sticky top-16 sm:top-20 z-30 border-b border-zinc-200/80 bg-gray-50/95 backdrop-blur-md dark:border-white/10 dark:bg-[#060b14]/90">
        <div className="px-2 sm:px-4 md:px-6 lg:px-8 py-2">
          <TabPills
            ariaLabel="Page sections"
            activeTab={activeTab}
            onChange={(id) => setActiveTab(id as TabType)}
            tabs={tabs.map((tab) => ({
              id: tab.id,
              label: tab.label,
              icon: tab.icon,
              count: tab.count,
            }))}
          />
        </div>
      </div>

      <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 lg:py-10">
        {activeTab === 'posts' && (
          <div>
            {pagePosts.length > 0 ? (
              <div className={compactPostGridClass}>
                {pagePosts.map(post => {
                  const handlePostClick = () => {
                    // Check if post is linked to a hackathon, event, or opportunity
                    const postAny = post as any;
                    
                    // Check by category first, then by attached objects
                    if (post.category === 'hackathon' && postAny.hackathon) {
                      const hackathon = postAny.hackathon;
                      navigate(`/hackathons/${hackathon.slug || hackathon.id}`);
                    } else if (post.category === 'event' && postAny.event) {
                      const event = postAny.event;
                      navigate(`/events/${event.slug || event.id}`);
                    } else if (post.category === 'opportunity' && postAny.opportunity) {
                      const opportunity = postAny.opportunity;
                      navigate(`/opportunities/${opportunity.slug || opportunity.id}`);
                    } else if (postAny.hackathonId || postAny.hackathon_id) {
                      const hackathonId = postAny.hackathonId || postAny.hackathon_id;
                      navigate(`/hackathons/${hackathonId}`);
                    } else if (postAny.eventId || postAny.event_id) {
                      const eventId = postAny.eventId || postAny.event_id;
                      navigate(`/events/${eventId}`);
                    } else if (postAny.opportunityId || postAny.opportunity_id) {
                      const opportunityId = postAny.opportunityId || postAny.opportunity_id;
                      navigate(`/opportunities/${opportunityId}`);
                    } else {
                      // Regular post - navigate to post detail
                      navigate(`/post/${post.slug || post.id}`);
                    }
                  };
                  
                  return (
                    <CompactPostCard
                      key={post.id}
                      post={post}
                      onClick={handlePostClick}
                      onLoginRequired={onLoginRequired}
                    />
                  );
                })}
              </div>
            ) : (
              <div className={`${asidePanelClass} px-6 py-12 text-center`}>
                <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-200/80 bg-zinc-50 text-zinc-400 dark:border-white/10 dark:bg-white/[0.04]">
                  <MessageSquare size={22} strokeWidth={1.75} />
                </span>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">No posts yet</h3>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Be the first to create a post for this page.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'about' && (
          <AboutTab pageData={pageData} socialLinkEntries={socialLinkEntries} pagePosts={pagePosts} />
        )}

        {activeTab === 'members' && pageData?.id && (
          <MembersTab pageId={pageData.id} totalCount={membersCount} />
        )}

        {activeTab === 'followers' && pageData?.id && (
          <FollowersTab pageId={pageData.id} totalCount={followersCount} />
        )}
      </div>
    </div>
    </>
  );
}

const aboutMetaGridClass =
  'grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3';

function AboutSectionHeader({
  icon: Icon,
  title,
  subtitle,
  count,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  title: string;
  subtitle?: string;
  count?: number;
}) {
  return (
    <div className="mb-3 flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-200/80 bg-zinc-50 text-zinc-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-400"
          aria-hidden
        >
          <Icon size={15} strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</h2>
          {subtitle && (
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{subtitle}</p>
          )}
        </div>
      </div>
      {count !== undefined && count > 0 && (
        <span className={`${asideStatChipClass} shrink-0 tabular-nums text-xs`}>
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">
            {count.toLocaleString()}
          </span>
        </span>
      )}
    </div>
  );
}

function AboutMetaTile({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`${asidePanelClass} p-3 sm:p-3.5`}>
      <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
        <Icon size={11} strokeWidth={2} className="shrink-0" aria-hidden />
        {label}
      </p>
      <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{children}</div>
    </div>
  );
}

const teamRoleLabel: Record<string, string> = {
  owner: 'Owner',
  admin: 'Admin',
  moderator: 'Moderator',
};

// About Tab Component
const AboutTab = ({
  pageData,
  socialLinkEntries,
  pagePosts,
}: {
  pageData: any;
  socialLinkEntries: SocialLinkEntry[];
  pagePosts: Post[];
}) => {
  const navigate = useNavigate();

  const allTags = new Map<string, any>();
  pagePosts.forEach((post: Post) => {
    if (post.tags && Array.isArray(post.tags)) {
      post.tags.forEach((tag: any) => {
        const tagName = typeof tag === 'string' ? tag : tag?.name || tag?.slug || '';
        const tagKey = typeof tag === 'string' ? tag : tag?.id || tag?.slug || tagName;
        if (!allTags.has(tagKey)) {
          allTags.set(tagKey, typeof tag === 'string' ? { name: tag, slug: tag } : tag);
        }
      });
    }
  });
  const uniqueTags = Array.from(allTags.values());

  const description = pageData.description || pageData.shortBio || 'No description available.';
  const createdLabel = pageData.createdAt
    ? new Date(pageData.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;
  const websiteDisplay = pageData.url
    ? String(pageData.url)
        .replace(/^https?:\/\//i, '')
        .replace(/\/$/, '')
    : null;

  return (
    <div className="space-y-4">
      <section className={`${asidePanelClass} p-3 sm:p-4`}>
        <AboutSectionHeader icon={FileText} title="About" subtitle="Community overview" />
        <BioText text={description} className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400" />

        {uniqueTags.length > 0 && (
          <div className={`mt-4 pt-4 ${postCardDividerClass}`}>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Topics from posts
            </p>
            <div className="flex flex-wrap gap-1.5">
              {uniqueTags.map((tag: any) => {
                const tagName = typeof tag === 'string' ? tag : tag?.name || tag?.slug || '';
                const tagKey = typeof tag === 'string' ? tag : tag?.id || tag?.slug || tagName;
                const tagSlug = typeof tag === 'string' ? tag : tag?.slug || tagName;
                const tagLogoUrl = typeof tag === 'string' ? null : tag?.logoUrl || tag?.logo_url;
                return (
                  <button
                    key={tagKey}
                    type="button"
                    onClick={() => navigate(`/tags/${tagSlug}`)}
                    className={`${postTagClass} cursor-pointer transition-colors hover:border-zinc-300 hover:bg-zinc-100 dark:hover:border-white/15 dark:hover:bg-white/[0.08]`}
                  >
                    {tagLogoUrl ? (
                      <span className="inline-flex max-w-[8rem] items-center gap-1 truncate">
                        <img src={tagLogoUrl} alt="" className="h-3.5 w-3.5 rounded object-cover" />
                        {tagName}
                      </span>
                    ) : (
                      <span className="truncate">#{tagName}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </section>

      <div className={aboutMetaGridClass}>
        <AboutMetaTile icon={Building2} label="Category">
          <span className="capitalize">{formatListingLabel(pageData.category || 'general')}</span>
        </AboutMetaTile>
        <AboutMetaTile icon={Calendar} label="Created">
          {createdLabel || '—'}
        </AboutMetaTile>
        {websiteDisplay && (
          <AboutMetaTile icon={Globe} label="Website">
            <a
              href={pageData.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex max-w-full items-center gap-1 text-zinc-800 transition-colors hover:text-zinc-600 dark:text-zinc-200 dark:hover:text-white"
            >
              <span className="truncate">{websiteDisplay}</span>
              <ExternalLink size={12} strokeWidth={2} className="shrink-0 opacity-60" />
            </a>
          </AboutMetaTile>
        )}
      </div>

      {socialLinkEntries.length > 0 && (
        <section className={`${asidePanelClass} p-3 sm:p-4`}>
          <AboutSectionHeader icon={Globe} title="Links" subtitle="Official channels" />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {socialLinkEntries.map((entry: SocialLinkEntry, index: number) => {
              const displayUrl = getDisplayUrl(entry.href);
              return (
                <a
                  key={`${entry.key}-${index}`}
                  href={entry.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2.5 rounded-lg border border-zinc-200/80 bg-zinc-50/50 px-3 py-2.5 transition-colors hover:border-zinc-300 hover:bg-zinc-100/90 dark:border-white/[0.08] dark:bg-white/[0.02] dark:hover:border-white/[0.12] dark:hover:bg-white/[0.06]"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-zinc-200/80 bg-white text-zinc-600 dark:border-white/10 dark:bg-zinc-900/60 dark:text-zinc-400 [&_svg]:h-4 [&_svg]:w-4">
                    {entry.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-medium text-zinc-800 dark:text-zinc-200">
                      {entry.label}
                    </span>
                    <span className="block truncate text-[10px] text-zinc-500 dark:text-zinc-400">
                      {displayUrl}
                    </span>
                  </span>
                  <ExternalLink
                    size={12}
                    strokeWidth={2}
                    className="shrink-0 text-zinc-400 opacity-0 transition-opacity group-hover:opacity-100"
                    aria-hidden
                  />
                </a>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};

const memberGridClass =
  'grid items-stretch gap-3 sm:gap-4 [grid-template-columns:repeat(auto-fill,minmax(min(100%,14rem),1fr))]';

function formatMemberJoined(date: string | undefined): string | null {
  if (!date) return null;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function FollowerMemberCard({
  follower,
  onClick,
}: {
  follower: {
    id: string;
    username: string;
    avatar_url?: string;
    avatarUrl?: string;
    is_verified?: boolean;
    isVerified?: boolean;
    reputation?: number;
    created_at?: string;
    createdAt?: string;
    bio?: string;
  };
  onClick: () => void;
}) {
  const joined = formatMemberJoined(follower.created_at || follower.createdAt);
  const verified = follower.is_verified || follower.isVerified;
  const reputation =
    follower.reputation !== undefined && follower.reputation !== null
      ? Number(follower.reputation)
      : null;

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className={`${postCardSurfaceClass} h-full`}
    >
      <div className="flex h-full items-center gap-3 p-3 sm:p-3.5">
        <Avatar
          src={
            follower.avatar_url ||
            follower.avatarUrl ||
            ''
          }
          alt={follower.username}
          size="sm"
          className="h-10 w-10 shrink-0 ring-2 ring-white dark:ring-zinc-900"
        />

        <div className="min-w-0 flex-1">
          <p className="flex min-w-0 items-center gap-1 text-sm font-semibold text-zinc-900 transition-colors group-hover:text-zinc-700 dark:text-zinc-100 dark:group-hover:text-white">
            <span className="truncate">{follower.username}</span>
            {verified && <VerifiedBadge size={11} className="shrink-0" />}
          </p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0 text-[11px] text-zinc-500 dark:text-zinc-400">
            {reputation !== null && (
              <span className="inline-flex items-center gap-0.5 tabular-nums">
                <Award size={10} strokeWidth={2} className="shrink-0 opacity-70" />
                {reputation.toLocaleString()}
              </span>
            )}
            {reputation !== null && joined && (
              <span className="text-zinc-300 dark:text-zinc-600" aria-hidden>
                ·
              </span>
            )}
            {joined && <span>Joined {joined}</span>}
          </p>
          {follower.bio && (
            <p className="mt-1 line-clamp-1 text-[11px] leading-snug text-zinc-500 dark:text-zinc-400">
              {follower.bio}
            </p>
          )}
        </div>

        <ChevronRight
          size={14}
          strokeWidth={2}
          className="shrink-0 text-zinc-400 transition-transform group-hover:translate-x-0.5 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"
          aria-hidden
        />
      </div>
    </article>
  );
}

const memberRoleOrder: Record<string, number> = {
  owner: 0,
  admin: 1,
  moderator: 2,
  member: 3,
};

function dedupePageMembers(members: any[]): any[] {
  const seen = new Set<string>();
  return members.filter((m) => {
    if (!m?.id || seen.has(m.id)) return false;
    seen.add(m.id);
    return true;
  });
}

function sortPageMembers(members: any[]): any[] {
  return [...members].sort((a, b) => {
    const aOrder = memberRoleOrder[a.role] ?? 99;
    const bOrder = memberRoleOrder[b.role] ?? 99;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return String(a.username || '').localeCompare(String(b.username || ''));
  });
}

function TeamMemberCard({ member, onClick }: { member: any; onClick: () => void }) {
  const joined = formatMemberJoined(member.created_at || member.createdAt);
  const verified = member.is_verified || member.isVerified;
  const reputation =
    member.reputation !== undefined && member.reputation !== null
      ? Number(member.reputation)
      : null;

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className={`${postCardSurfaceClass} h-full`}
    >
      <div className="flex h-full items-center gap-3 p-3 sm:p-3.5">
        <Avatar
          src={
            member.avatarUrl ||
            member.avatar_url ||
            ''
          }
          alt={member.username}
          size="sm"
          className="h-10 w-10 shrink-0 ring-2 ring-white dark:ring-zinc-900"
        />
        <div className="min-w-0 flex-1">
          <p className="flex min-w-0 items-center gap-1 text-sm font-semibold text-zinc-900 transition-colors group-hover:text-zinc-700 dark:text-zinc-100 dark:group-hover:text-white">
            <span className="truncate">{member.username}</span>
            {verified && <VerifiedBadge size={11} className="shrink-0" />}
          </p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0 text-[11px] text-zinc-500 dark:text-zinc-400">
            <span className={`${postTagClass} capitalize`}>
              {teamRoleLabel[member.role] || member.role || 'Member'}
            </span>
            {reputation !== null && (
              <>
                <span className="text-zinc-300 dark:text-zinc-600" aria-hidden>
                  ·
                </span>
                <span className="inline-flex items-center gap-0.5 tabular-nums">
                  <Award size={10} strokeWidth={2} className="shrink-0 opacity-70" />
                  {reputation.toLocaleString()}
                </span>
              </>
            )}
            {joined && (
              <>
                <span className="text-zinc-300 dark:text-zinc-600" aria-hidden>
                  ·
                </span>
                <span>Joined {joined}</span>
              </>
            )}
          </p>
          {member.bio && (
            <p className="mt-1 line-clamp-1 text-[11px] leading-snug text-zinc-500 dark:text-zinc-400">
              {member.bio}
            </p>
          )}
        </div>
        <ChevronRight
          size={14}
          strokeWidth={2}
          className="shrink-0 text-zinc-400 transition-transform group-hover:translate-x-0.5 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"
          aria-hidden
        />
      </div>
    </article>
  );
}

const PAGE_MEMBERS_PAGE_SIZE = 20;

const MembersTab = ({ pageId, totalCount }: { pageId: string; totalCount: number }) => {
  const navigate = useNavigate();
  const { items, total, hasMore, initialLoading, loadingMore, loadMore, error } =
    usePaginatedPageMembers({
      pageId,
      type: 'team',
      enabled: true,
    });
  const members = sortPageMembers(dedupePageMembers(items));
  const displayTotal = total || totalCount;

  return (
    <div className="space-y-4">
      <div className={`${asidePanelClass} flex items-center justify-between gap-3 p-3 sm:p-4`}>
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-200/80 bg-zinc-50 text-zinc-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-400"
            aria-hidden
          >
            <Shield size={15} strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Members</h2>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Team who can post and manage this community
            </p>
          </div>
        </div>
        <span className={`${asideStatChipClass} shrink-0 tabular-nums text-xs text-zinc-600 dark:text-zinc-400`}>
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">
            {displayTotal.toLocaleString()}
          </span>
        </span>
      </div>

      {initialLoading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 size={24} className="animate-spin text-zinc-500" strokeWidth={2} />
        </div>
      ) : error ? (
        <div className={`${asidePanelClass} px-6 py-10 text-center`}>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      ) : members.length > 0 ? (
        <InfiniteScroll
          dataLength={members.length}
          next={loadMore}
          hasMore={hasMore}
          isLoading={loadingMore}
          loader={
            <div className="flex items-center justify-center py-6">
              <Loader2 size={20} className="animate-spin text-zinc-500" strokeWidth={2} />
              <span className="ml-2 text-xs text-zinc-500 dark:text-zinc-400">Loading more members…</span>
            </div>
          }
          endMessage={
            displayTotal > PAGE_MEMBERS_PAGE_SIZE ? (
              <p className="py-4 text-center text-xs text-zinc-500 dark:text-zinc-400">
                All {displayTotal.toLocaleString()} members loaded
              </p>
            ) : null
          }
        >
          <div className={memberGridClass}>
            {members.map((member) => (
              <TeamMemberCard
                key={member.id}
                member={member}
                onClick={() => navigate(`/profile/${member.username}`)}
              />
            ))}
          </div>
        </InfiniteScroll>
      ) : (
        <div className={`${asidePanelClass} px-6 py-10 text-center`}>
          <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-200/80 bg-zinc-50 text-zinc-400 dark:border-white/10 dark:bg-white/[0.04]">
            <Shield size={20} strokeWidth={1.75} />
          </span>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">No team members yet</h3>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Owners and moderators will appear here when added.
          </p>
        </div>
      )}

      {loadingMore && members.length > 0 && (
        <div className="sr-only" aria-live="polite">
          Loading more members
        </div>
      )}
    </div>
  );
};

// Followers Tab — people following the page (not team)
const FollowersTab = ({ pageId, totalCount }: { pageId: string; totalCount: number }) => {
  const navigate = useNavigate();
  const { items, total, hasMore, initialLoading, loadingMore, loadMore, error } =
    usePaginatedPageMembers({
      pageId,
      type: 'followers',
      enabled: true,
    });
  const followers = items as Array<{
    id: string;
    username: string;
    avatar_url?: string;
    avatarUrl?: string;
    is_verified?: boolean;
    isVerified?: boolean;
    reputation?: number;
    created_at?: string;
    createdAt?: string;
    bio?: string;
  }>;
  const displayTotal = total || totalCount;

  return (
    <div className="space-y-4">
      <div className={`${asidePanelClass} flex items-center justify-between gap-3 p-3 sm:p-4`}>
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-200/80 bg-zinc-50 text-zinc-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-400"
            aria-hidden
          >
            <Users size={15} strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Followers</h2>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">People following this community</p>
          </div>
        </div>
        <span className={`${asideStatChipClass} shrink-0 tabular-nums text-xs text-zinc-600 dark:text-zinc-400`}>
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">
            {displayTotal.toLocaleString()}
          </span>
        </span>
      </div>

      {initialLoading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 size={24} className="animate-spin text-zinc-500" strokeWidth={2} />
        </div>
      ) : error ? (
        <div className={`${asidePanelClass} px-6 py-10 text-center`}>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      ) : followers.length > 0 ? (
        <InfiniteScroll
          dataLength={followers.length}
          next={loadMore}
          hasMore={hasMore}
          isLoading={loadingMore}
          loader={
            <div className="flex items-center justify-center py-6">
              <Loader2 size={20} className="animate-spin text-zinc-500" strokeWidth={2} />
              <span className="ml-2 text-xs text-zinc-500 dark:text-zinc-400">Loading more followers…</span>
            </div>
          }
          endMessage={
            displayTotal > PAGE_MEMBERS_PAGE_SIZE ? (
              <p className="py-4 text-center text-xs text-zinc-500 dark:text-zinc-400">
                All {displayTotal.toLocaleString()} followers loaded
              </p>
            ) : null
          }
        >
          <div className={memberGridClass}>
            {followers.map((follower) => (
              <FollowerMemberCard
                key={follower.id}
                follower={follower}
                onClick={() => navigate(`/profile/${follower.username}`)}
              />
            ))}
          </div>
        </InfiniteScroll>
      ) : (
        <div className={`${asidePanelClass} px-6 py-10 text-center`}>
          <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-200/80 bg-zinc-50 text-zinc-400 dark:border-white/10 dark:bg-white/[0.04]">
            <Users size={20} strokeWidth={1.75} />
          </span>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">No followers yet</h3>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Be the first to follow this community.
          </p>
        </div>
      )}

      {loadingMore && followers.length > 0 && (
        <div className="sr-only" aria-live="polite">
          Loading more followers
        </div>
      )}
    </div>
  );
};
