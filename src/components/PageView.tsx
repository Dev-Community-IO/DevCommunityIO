import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Users, MessageSquare, UserPlus, Bell, BellOff, Globe, Calendar, Building2, FileText, ExternalLink, Eye, AlertTriangle, Shield, Share2, Loader2, Twitter, Linkedin, Github, Facebook, Instagram, Youtube, Send, MessageCircle, Gamepad2 } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Badge } from './Badge';
import { CompactPostCard } from './CompactPostCard';
import { VerifiedBadge } from './VerifiedBadge';
import { ShareDropdown } from './ShareDropdown';
import { Post } from '../types';
import pagesService from '../services/api/pages.service';
import { useAuth } from '../contexts/AuthContext';
import { SEOHead } from './SEOHead';
import { useNavigate } from 'react-router-dom';
import { PageViewSkeleton } from './skeletons';
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

type TabType = 'posts' | 'about' | 'followers' | 'manage' | 'stats';

export function PageView({ pageId, pageSlug, onBack, onPostClick, onLoginRequired }: PageViewProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowingLoading, setIsFollowingLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [pageData, setPageData] = useState<any>(null);
  const [pagePosts, setPagePosts] = useState<Post[]>([]);
  const [pageTeamMembers, setPageTeamMembers] = useState<any[]>([]);
  const [pageFollowers, setPageFollowers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Determine user role and permissions
  const isOwner = pageData && user && (
    pageData.ownerId === user.id ||
    pageData.owner?.id === user.id
  );
  
  const isAdmin = pageData && user && pageData.userRole && (
    pageData.userRole === 'admin' ||
    pageData.userRole === 'owner'
  );
  
  const isModerator = pageData && user && pageData.userRole === 'moderator';
  
  // Only hide Follow button if user is owner, admin, or moderator
  // Default to showing Follow button if we can't determine role
  const canManage = !!(isOwner || isAdmin || isModerator);
 
   // Debug logging (remove in production)
   if (process.env.NODE_ENV === 'development' && pageData && user) {
     console.log('PageView Debug:', {
       userId: user.id,
       pageOwnerId: pageData.ownerId,
       userRole: pageData.userRole,
       isOwner,
       isAdmin,
       isModerator,
       canManage,
       shouldShowFollowButton: !canManage
     });
   }

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
        
        // Fetch team members and followers
        if (pageDataFromApi.id) {
          try {
            const [teamResponse, followersResponse] = await Promise.all([
              pagesService.getMembers(pageDataFromApi.id, { type: 'team' }),
              pagesService.getMembers(pageDataFromApi.id, { type: 'followers' })
            ]);
            
            setPageTeamMembers(teamResponse.members || teamResponse.data || teamResponse || []);
            setPageFollowers(followersResponse.followers || followersResponse.data || followersResponse || []);
          } catch (err) {
            console.warn('Could not fetch team members or followers:', err);
            setPageTeamMembers([]);
            setPageFollowers([]);
          }
        }
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
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

  const tabs = [
    { id: 'posts', label: 'Posts', icon: MessageSquare, count: pagePosts.length },
    { id: 'about', label: 'About', icon: FileText },
    { id: 'followers', label: 'Followers', icon: Users, count: pageData.followerCount || pageData.follower_count || 0 },
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Hero Section with Cover */}
      <div className="relative">
        {/* Cover Image */}
        <div className="relative h-72 md:h-96 overflow-hidden">
          {pageData.coverImageUrl ? (
            <>
            <img
              src={pageData.coverImageUrl}
              alt={`${pageData.name} cover`}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500"></div>
          )}
          
          {/* Back Button - with consistent margin */}
          <div className="absolute top-4 left-0 right-0 z-20 px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-24">
            <div className="max-w-7xl mx-auto">
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-white dark:hover:bg-gray-800 transition-all shadow-lg"
              >
                <ArrowLeft size={18} />
                <span className="hidden sm:inline">Back</span>
              </button>
            </div>
          </div>

          {/* Action Buttons - Top Right - with consistent margin */}
          <div className="absolute top-4 right-0 z-20 px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-24">
            <div className="max-w-7xl mx-auto flex justify-end">
              {user && !canManage && (
                <button
                  onClick={handleNotificationToggle}
                  className={`p-2.5 rounded-xl backdrop-blur-xl border transition-all ${
                    notificationsEnabled
                      ? 'bg-blue-500/90 text-white border-blue-400/50 shadow-lg shadow-blue-500/25'
                      : 'bg-white/90 dark:bg-gray-900/90 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800'
                  }`}
                  title={notificationsEnabled ? 'Notifications enabled' : 'Enable notifications'}
                >
                  {notificationsEnabled ? <Bell size={20} /> : <BellOff size={20} />}
                </button>
              )}

                  <ShareDropdown
                    url={window.location.href}
                    title={pageData.name}
                    hashtags={pageData.category ? [pageData.category] : []}
                    description={pageData.description?.substring(0, 150)}
                    trigger={
                      <button
                        className="p-2.5 rounded-xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-all"
                        title="Share page"
                      >
                        <Share2 size={20} />
                      </button>
                    }
                  />
            </div>
          </div>
        </div>
            
        {/* Profile Section - with consistent margin */}
        <div className="relative px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-24 -mt-20 z-10">
          <div className="max-w-7xl mx-auto">
            <GlassCard className="p-6 sm:p-8 shadow-2xl border-2 border-gray-200/50 dark:border-gray-700/50">
              <div className="flex flex-col md:flex-row md:items-end gap-6">
                {/* Logo */}
                <div className="relative flex-shrink-0">
                  <div className={`w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden border-4 border-white dark:border-gray-900 shadow-2xl bg-white dark:bg-gray-800`}>
                    <img
                      src={pageData.logoUrl || DEFAULT_PAGE_LOGO}
                      alt={`${pageData.name} logo`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = DEFAULT_PAGE_LOGO;
                      }}
                    />
                    {pageData.isVerified && (
                      <div className="absolute bottom-0 right-0 bg-white dark:bg-gray-900 rounded-full p-1 shadow-lg border-2 border-white dark:border-gray-900">
                        <VerifiedBadge size={20} />
                      </div>
                    )}
                  </div>
          </div>

                {/* Info Section */}
                <div className="flex-1 min-w-0 pt-4 md:pt-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                          {pageData.name}
                        </h1>
                        {pageData.isVerified && (
                          <Badge variant="gradient" className="text-xs px-2 py-1">
                            {/* <Sparkles size={12} className="mr-1" /> */}
                            Verified
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        {pageData.category && (
                          <Badge variant="default" className="text-xs">
                            <Building2 size={12} className="mr-1" />
                            {pageData.category}
                          </Badge>
                        )}
                        {pageData.createdAt && (
                          <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Calendar size={14} />
                            Created {new Date(pageData.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </span>
                        )}
        </div>
      </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {user ? (
                        <>
                          {/* Show Follow button if user cannot manage the page */}
                          {!canManage && pageData ? (
                            <button
                              onClick={handleFollowToggle}
                              disabled={isFollowingLoading}
                              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all shadow-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                                isFollowing
                                  ? 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600'
                                  : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105'
                              }`}
                            >
                              {isFollowingLoading ? (
                                <>
                                  <Loader2 size={18} className="animate-spin" />
                                  <span>Loading...</span>
                                </>
                              ) : (
                                <>
                              <UserPlus size={18} />
                              {isFollowing ? 'Following' : 'Follow'}
                                </>
                          )}
                            </button>
                          ) : null}
                </>
              ) : (
                <button
                  onClick={() => {
                    if (onLoginRequired) {
                      onLoginRequired();
                    }
                  }}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all shadow-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 shadow-blue-500/30 hover:scale-105"
                >
                  <UserPlus size={18} />
                  Follow to Join
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 mb-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                        <Users size={18} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {(pageData.followerCount || pageData.follower_count || 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Followers</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                        <MessageSquare size={18} className="text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {pageData.postCount || pageData.posts || 0}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Posts</p>
                      </div>
                    </div>
                    {pageData.viewCount && (
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                          <Eye size={18} className="text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {pageData.viewCount.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Views</p>
                        </div>
                </div>
              )}
            </div>
            
                  {/* Description */}
                  {pageData.description && (
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                      {pageData.description}
                    </p>
                  )}
                  
                  {/* Social Links - Display in top card */}
                  {socialLinkEntries.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex flex-wrap items-center gap-2">
                        {socialLinkEntries.map((entry: SocialLinkEntry, index: number) => {
                          return (
                            <a
                              key={`${entry.key}-${index}`}
                              href={entry.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all group hover:scale-105 ${entry.cardClass}`}
                              title={entry.label}
                            >
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${entry.iconBgClass}`}>
                                {React.cloneElement(entry.icon as React.ReactElement, { size: 16 })}
                              </div>
                              <span className="font-medium text-xs hidden sm:inline">{entry.label}</span>
                              <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>

      {/* Tabs Navigation - with consistent margin */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-24">
          <div className="flex items-center justify-between gap-4 overflow-x-auto hide-scrollbar">
            <div className="flex gap-1 min-w-0">
            {tabs.map(tab => {
              const Icon = tab.icon;
                const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                    className={`flex items-center gap-2 px-4 py-4 font-semibold text-sm whitespace-nowrap transition-all relative group ${
                      isActive
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    <Icon size={18} className={isActive ? 'text-blue-600 dark:text-blue-400' : ''} />
                  <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        isActive 
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-t-full"></span>
                  )}
                </button>
              );
            })}
          </div>
          </div>
        </div>
      </div>

      {/* Content - with consistent margin */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-24 py-8">
        {activeTab === 'posts' && (
          <div>
            {pagePosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <GlassCard className="p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                  <MessageSquare size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">No posts yet</h3>
                <p className="text-gray-500 dark:text-gray-400">Be the first to create a post for this page!</p>
              </GlassCard>
            )}
          </div>
        )}

        {activeTab === 'about' && (
          <AboutTab pageData={pageData} pageTeamMembers={pageTeamMembers} socialLinkEntries={socialLinkEntries} pagePosts={pagePosts} />
        )}

        {activeTab === 'followers' && (
          <FollowersTab 
            pageFollowers={pageFollowers}
            pageData={pageData}
          />
        )}
      </div>
    </div>
    </>
  );
}

// About Tab Component
const AboutTab = ({ pageData, pageTeamMembers, socialLinkEntries, pagePosts }: { pageData: any; pageTeamMembers: any[]; socialLinkEntries: SocialLinkEntry[]; pagePosts: Post[] }) => {
  const navigate = useNavigate();
  
  // Collect unique tags from all page posts
  const allTags = new Map<string, any>();
  pagePosts.forEach((post: Post) => {
    if (post.tags && Array.isArray(post.tags)) {
      post.tags.forEach((tag: any) => {
        const tagName = typeof tag === 'string' ? tag : (tag?.name || tag?.slug || '');
        const tagKey = typeof tag === 'string' ? tag : (tag?.id || tag?.slug || tagName);
        if (!allTags.has(tagKey)) {
          allTags.set(tagKey, typeof tag === 'string' ? { name: tag, slug: tag } : tag);
        }
      });
    }
  });
  const uniqueTags = Array.from(allTags.values());
  
  return (
    <div className="space-y-6">
      <GlassCard className="p-6 md:p-8">
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText size={24} className="text-blue-500" />
            About
          </h2>
        </div>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-lg">
          {pageData.description || pageData.shortBio || 'No description available.'}
        </p>
        
        {/* Tags */}
        {uniqueTags.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {uniqueTags.map((tag: any) => {
                const tagName = typeof tag === 'string' ? tag : (tag?.name || tag?.slug || '');
                const tagKey = typeof tag === 'string' ? tag : (tag?.id || tag?.slug || tagName);
                const tagLogoUrl = typeof tag === 'string' ? null : (tag?.logoUrl || tag?.logo_url);
                return (
                  <span
                    key={tagKey}
                    onClick={() => navigate(`/tags/${typeof tag === 'string' ? tag : (tag?.slug || tagName)}`)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-700 transition-colors cursor-pointer"
                  >
                    {tagLogoUrl ? (
                      <>
                        <img src={tagLogoUrl} alt={tagName} className="w-4 h-4 rounded" />
                        <span>{tagName}</span>
                      </>
                    ) : (
                      <span>#{tagName}</span>
                    )}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </GlassCard>

      {/* Page Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <GlassCard className="p-6 hover:shadow-xl transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/20">
              <Building2 size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</p>
          </div>
          <p className="font-bold text-xl text-gray-900 dark:text-white">
            {pageData.category || 'General'}
          </p>
        </GlassCard>

        <GlassCard className="p-6 hover:shadow-xl transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/20">
              <Calendar size={20} className="text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</p>
          </div>
          <p className="font-bold text-xl text-gray-900 dark:text-white">
            {pageData.createdAt ? new Date(pageData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}
          </p>
        </GlassCard>

        {pageData.url && (
          <GlassCard className="p-6 hover:shadow-xl transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/20">
                <Globe size={20} className="text-green-600 dark:text-green-400" />
              </div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Website</p>
            </div>
            <a 
              href={pageData.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-semibold text-blue-600 dark:text-blue-400 hover:underline break-all flex items-center gap-1 group"
            >
              <span className="truncate">{pageData.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
              <ExternalLink size={14} className="flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </GlassCard>
        )}
      </div>

      {/* Team Members - Only visible to admins */}
      {pageTeamMembers && pageTeamMembers.filter((m: any) => ['owner', 'admin', 'moderator'].includes(m.role)).length > 0 && (
        <GlassCard className="p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Shield size={24} className="text-blue-500" />
              Team
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pageTeamMembers
              .filter((m: any) => ['owner', 'admin', 'moderator'].includes(m.role))
              .map((member: any) => (
                <div key={member.id} className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700">
                  <img
                    src={member.avatarUrl || member.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.username}`}
                    alt={member.username}
                    className="w-14 h-14 rounded-full flex-shrink-0 border-2 border-gray-200 dark:border-gray-700"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-gray-900 dark:text-white truncate">{member.username}</p>
                      {member.is_verified && (
                        <Badge variant="gradient" className="text-xs px-1.5 py-0.5">
                          ✓
                        </Badge>
                      )}
                    </div>
                    <Badge 
                      variant={member.role === 'owner' ? 'gradient' : 'default'}
                      className="text-xs"
                    >
                      {member.role === 'owner' ? 'Owner' : member.role === 'admin' ? 'Admin' : 'Moderator'}
                    </Badge>
                  </div>
                </div>
              ))}
          </div>
        </GlassCard>
      )}

      {/* Social Links */}
      {socialLinkEntries.length > 0 && (
        <GlassCard className="p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
            <Globe size={24} className="text-blue-500" />
            Social Links
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {socialLinkEntries.map((entry: SocialLinkEntry, index: number) => {
              const displayUrl = getDisplayUrl(entry.href);
              return (
              <a
                  key={`${entry.key}-${index}`}
                  href={entry.href}
                target="_blank"
                rel="noopener noreferrer"
                  className={`flex items-center gap-3 px-5 py-3 rounded-xl transition-all group ${entry.cardClass}`}
              >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${entry.iconBgClass}`}>
                    {entry.icon}
                </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-semibold">{entry.label}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{displayUrl}</span>
                </div>
                <ExternalLink size={16} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
              );
            })}
          </div>
        </GlassCard>
      )}
    </div>
  );
};

// Followers Tab Component - Shows followers (not team members)
// Team members are only visible in About tab or Manage section for admins
const FollowersTab = ({ pageFollowers }: any) => {
  const navigate = useNavigate();
  const followers = pageFollowers || [];

  return (
    <div className="space-y-6">
      {/* Followers Section */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Users size={24} className="text-purple-600 dark:text-purple-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Followers</h2>
          <Badge variant="default" className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
            {followers.length}
          </Badge>
        </div>
        {followers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {followers.map((follower: any) => (
              <GlassCard 
                key={follower.id} 
                className="p-5 hover:shadow-xl transition-all cursor-pointer group"
                onClick={() => navigate(`/profile/${follower.username}`)}
              >
                <div className="flex items-center gap-4">
                  <div className="relative flex-shrink-0">
                    <img
                      src={follower.avatar_url || follower.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${follower.username}`}
                      alt={follower.username}
                      className="w-16 h-16 rounded-full flex-shrink-0 border-2 border-gray-200 dark:border-gray-700 group-hover:border-purple-500 dark:group-hover:border-purple-400 transition-all"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${follower.username}`;
                      }}
                    />
                    {follower.is_verified && (
                      <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-900 rounded-full p-0.5 shadow-md border border-white dark:border-gray-800">
                        <VerifiedBadge size={14} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-bold text-gray-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {follower.username}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {follower.reputation !== undefined && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {follower.reputation} reputation
                        </span>
                      )}
                      {follower.created_at && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          • Joined {new Date(follower.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                    {follower.bio && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                        {follower.bio}
                      </p>
                    )}
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        ) : (
          <GlassCard className="p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <Users size={40} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">No followers yet</h3>
            <p className="text-gray-500 dark:text-gray-400">Be the first to follow this page!</p>
          </GlassCard>
        )}
      </div>
    </div>
  );
};
