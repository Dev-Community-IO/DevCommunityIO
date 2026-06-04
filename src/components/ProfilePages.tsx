import { useState, useEffect, useRef, useMemo } from 'react';
import { Plus, Users, Settings, BarChart3, UserPlus, Crown, Shield, ArrowLeft, Layout, FileText, Building2, Sparkles, Hash, X, ExternalLink, Upload, Camera, Save, Loader, AlertCircle, CheckCircle, Trash2, Search, Loader2, Globe, Twitter, Linkedin, Github, Send, MessageCircle, Facebook, Instagram, Youtube, Gamepad2, Pencil, UserX, ArrowRightLeft, ChevronRight } from 'lucide-react';
import { TabPills } from './TabPills';
import { GlassCard } from './GlassCard';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { VerifiedBadge } from './VerifiedBadge';
import { CompactPostCard } from './CompactPostCard';
import {
  asidePanelClass,
  asideStatChipClass,
  compactPostGridClass,
  postCardDividerClass,
  postCardSurfaceClass,
  postTagClass,
} from './postCardSurface';
import { formatListingLabel } from './listingPageChrome';
import { Post } from '../types';
import { useNavigate } from 'react-router-dom';
import usersService from '../services/api/users.service';
import pagesService from '../services/api/pages.service';
import { PageCardSkeletonList, PostSkeletonList } from './skeletons';
import { useAuth } from '../contexts/AuthContext';
import { CreatePageModal } from './CreatePageModal';
const DEFAULT_PAGE_LOGO = 'https://api.dicebear.com/7.x/shapes/svg?seed=Adaex%20App';

interface ProfilePagesProps {
  username: string;
}

type ViewMode = 'list' | 'manage';
type FilterType = 'all' | 'owner' | 'admin' | 'member';

const normalizePages = (pages: any[]) => {
  if (!Array.isArray(pages)) return []

  const seenIds = new Set<string>()
  const seenSlugs = new Set<string>()

  return pages.filter((page) => {
    if (!page) return false
    
    const id = page?.id
    const slug = page?.slug

    // Check for duplicates by ID
    if (id && seenIds.has(id)) {
      console.warn('[ProfilePages] Duplicate page ID detected:', id, page.name);
      return false
    }

    // Check for duplicates by slug (if no ID)
    if (!id && slug && seenSlugs.has(slug)) {
      console.warn('[ProfilePages] Duplicate page slug detected:', slug, page.name);
      return false
    }

    if (id) {
      seenIds.add(id)
    } else if (slug) {
      seenSlugs.add(slug)
    }

    return true
  })
}

const profilePageGridClass =
  'grid items-stretch gap-3 sm:gap-4 [grid-template-columns:repeat(auto-fill,minmax(min(100%,16rem),1fr))]';

const manageInputClass =
  'w-full rounded-lg border border-zinc-200/80 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 disabled:opacity-60 dark:border-white/10 dark:bg-[#0a1020]/90 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-500';

const manageTextareaClass = `${manageInputClass} min-h-[88px] resize-y`;

const manageLabelClass = 'mb-1.5 block text-xs font-semibold text-zinc-700 dark:text-zinc-300';

const manageGhostBtnClass =
  'inline-flex items-center gap-1.5 rounded-lg border border-zinc-200/80 bg-white/90 px-3 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-white/10 dark:bg-zinc-900/40 dark:text-zinc-300 dark:hover:bg-zinc-900/60';

const managePrimaryBtnClass =
  'inline-flex items-center justify-center gap-1.5 rounded-lg border border-zinc-200/80 bg-zinc-900 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white';

const manageMemberGridClass =
  'grid items-stretch gap-3 sm:gap-4 [grid-template-columns:repeat(auto-fill,minmax(min(100%,14rem),1fr))]';

function getPageRoleLabel(role: string | undefined): string {
  const r = role?.toLowerCase();
  if (r === 'owner') return 'Owner';
  if (r === 'admin') return 'Admin';
  if (r === 'moderator') return 'Moderator';
  return 'Member';
}

function ProfilePagesSectionHeader({
  title,
  subtitle,
  count,
}: {
  title: string;
  subtitle: string;
  count: number;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{subtitle}</p>
      </div>
      <span className={`${asideStatChipClass} shrink-0 tabular-nums text-xs`}>
        <span className="font-semibold text-zinc-800 dark:text-zinc-200">{count}</span>
      </span>
    </div>
  );
}

function ProfilePageCard({
  page,
  onView,
  onManage,
}: {
  page: any;
  onView: () => void;
  onManage?: () => void;
}) {
  const logoUrl = page.logoUrl || DEFAULT_PAGE_LOGO;
  const coverUrl = page.coverImageUrl;
  const bio = page.shortBio || page.description;
  const handle = page.username || page.slug;
  const members = Number(page.memberCount ?? page.members ?? 0);
  const posts = Number(page.postCount ?? page.posts ?? 0);
  const roleLabel = getPageRoleLabel(page.role);

  return (
    <article className={`${postCardSurfaceClass} h-full overflow-hidden`}>
      <button
        type="button"
        onClick={onView}
        className="flex w-full flex-1 flex-col text-left"
      >
        <div className="relative h-[4.5rem] shrink-0 overflow-hidden bg-zinc-100 dark:bg-zinc-900/60 sm:h-20">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt=""
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div
              className="h-full w-full bg-gradient-to-br from-zinc-100 via-zinc-50 to-zinc-200/60 dark:from-zinc-900 dark:via-zinc-900/80 dark:to-zinc-800"
              aria-hidden
            />
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
          <span className={`${postTagClass} absolute left-2 top-2 capitalize`}>{roleLabel}</span>
        </div>

        <div className="relative flex flex-1 flex-col px-3.5 pb-3 pt-7 sm:px-4">
          <div className="absolute -top-5 left-3.5 z-10 sm:left-4">
            <div className="h-11 w-11 overflow-hidden rounded-xl border-2 border-white bg-zinc-100 shadow-sm ring-1 ring-zinc-200/80 dark:border-zinc-900 dark:bg-zinc-800 dark:ring-white/10 sm:h-12 sm:w-12">
              <img
                src={logoUrl}
                alt=""
                className="h-full w-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src !== DEFAULT_PAGE_LOGO) target.src = DEFAULT_PAGE_LOGO;
                }}
              />
            </div>
          </div>

          <div className="mb-1.5 flex min-w-0 items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="inline-flex min-w-0 max-w-full items-center gap-0.5">
                <h4 className="min-w-0 truncate text-sm font-semibold text-zinc-900 group-hover:text-zinc-700 dark:text-zinc-100 dark:group-hover:text-white">
                  {page.name}
                </h4>
                {page.isVerified && <VerifiedBadge variant="page" size={12} className="shrink-0" />}
              </div>
              {handle && (
                <p className="mt-0.5 truncate text-[11px] text-zinc-500 dark:text-zinc-400">@{handle}</p>
              )}
            </div>
            <ChevronRight
              size={16}
              strokeWidth={2}
              className="mt-0.5 shrink-0 text-zinc-400 group-hover:translate-x-0.5"
              aria-hidden
            />
          </div>

          <p className="mb-2 line-clamp-2 flex-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
            {bio || 'No description yet.'}
          </p>

          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            <span className="tabular-nums">{members.toLocaleString()} members</span>
            <span className="mx-1 text-zinc-300 dark:text-zinc-600" aria-hidden>
              ·
            </span>
            <span className="tabular-nums">{posts.toLocaleString()} posts</span>
            {page.category && (
              <>
                <span className="mx-1 text-zinc-300 dark:text-zinc-600" aria-hidden>
                  ·
                </span>
                <span className="capitalize">{formatListingLabel(page.category)}</span>
              </>
            )}
          </p>
        </div>
      </button>

      {onManage && (
        <div className="flex gap-2 border-t border-zinc-100 px-3 py-2 dark:border-white/[0.06] sm:px-4">
          <button
            type="button"
            onClick={onView}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-zinc-200/80 bg-zinc-50/90 px-2.5 py-1.5 text-xs font-medium text-zinc-800 transition-colors hover:bg-zinc-100 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-200 dark:hover:bg-white/[0.08]"
          >
            <Layout size={14} strokeWidth={2} aria-hidden />
            View
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onManage();
            }}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-zinc-200/80 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-white/10 dark:bg-zinc-900/40 dark:text-zinc-300 dark:hover:bg-zinc-900/60"
          >
            <Settings size={14} strokeWidth={2} aria-hidden />
            Manage
          </button>
        </div>
      )}
    </article>
  );
}

function ManagePageHero({
  page,
  onBack,
  onViewPublic,
}: {
  page: any;
  onBack: () => void;
  onViewPublic: () => void;
}) {
  const members = Number(page.memberCount ?? page.members ?? 0);
  const posts = Number(page.postCount ?? page.posts ?? 0);
  const bio = page.shortBio || page.description;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button type="button" onClick={onBack} className={manageGhostBtnClass}>
          <ArrowLeft size={16} strokeWidth={2} aria-hidden />
          Back to pages
        </button>
        {page.slug && (
          <button type="button" onClick={onViewPublic} className={manageGhostBtnClass}>
            <ExternalLink size={16} strokeWidth={2} aria-hidden />
            View public page
          </button>
        )}
      </div>

      <div className={`${asidePanelClass} overflow-hidden`}>
        <div className="relative h-24 shrink-0 overflow-hidden bg-zinc-100 dark:bg-zinc-900/60 sm:h-28">
          {page.coverImageUrl ? (
            <img
              src={page.coverImageUrl}
              alt=""
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div
              className="h-full w-full bg-gradient-to-br from-zinc-100 via-zinc-50 to-zinc-200/60 dark:from-zinc-900 dark:via-zinc-900/80 dark:to-zinc-800"
              aria-hidden
            />
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>

        <div className="relative px-3.5 pb-3.5 pt-8 sm:px-4 sm:pb-4">
          <div className="absolute -top-6 left-3.5 sm:left-4">
            <div className="h-12 w-12 overflow-hidden rounded-xl border-2 border-white bg-zinc-100 shadow-sm ring-1 ring-zinc-200/80 dark:border-zinc-900 dark:bg-zinc-800 dark:ring-white/10 sm:h-14 sm:w-14">
              <img
                src={page.logoUrl || DEFAULT_PAGE_LOGO}
                alt=""
                className="h-full w-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src !== DEFAULT_PAGE_LOGO) target.src = DEFAULT_PAGE_LOGO;
                }}
              />
            </div>
          </div>

          <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="inline-flex min-w-0 max-w-full items-center gap-0.5">
                <h2 className="min-w-0 truncate text-base font-semibold text-zinc-900 dark:text-zinc-100 sm:text-lg">
                  {page.name}
                </h2>
                {page.isVerified && <VerifiedBadge variant="page" size={14} className="shrink-0" />}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <span className={`${postTagClass} capitalize`}>{getPageRoleLabel(page.role)}</span>
                {page.category && (
                  <span className={`${postTagClass} capitalize`}>
                    {formatListingLabel(page.category)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {bio && (
            <p className="mb-2 line-clamp-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
              {bio}
            </p>
          )}

          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            <span className="tabular-nums">{members.toLocaleString()} members</span>
            <span className="mx-1 text-zinc-300 dark:text-zinc-600" aria-hidden>
              ·
            </span>
            <span className="tabular-nums">{posts.toLocaleString()} posts</span>
          </p>
        </div>
      </div>
    </>
  );
}

function ManageTeamMemberCard({
  member,
  isOwner,
  canEdit,
  isCurrentUser,
  showTransfer,
  onUpdateRole,
  onRemove,
  onTransfer,
}: {
  member: any;
  isOwner: boolean;
  canEdit: boolean;
  isCurrentUser: boolean;
  showTransfer: boolean;
  onUpdateRole: () => void;
  onRemove: () => void;
  onTransfer: () => void;
}) {
  const username = member.username || member.name;
  const roleLabel = isOwner
    ? 'Owner'
    : member.role === 'admin'
      ? 'Admin'
      : member.role === 'moderator'
        ? 'Moderator'
        : 'Member';

  return (
    <article className={`${postCardSurfaceClass} p-3 sm:p-3.5`}>
      <div className="flex items-center gap-3">
        <Avatar
          src={member.avatar || member.avatarUrl}
          alt={username}
          size="sm"
          className="h-10 w-10 shrink-0 ring-2 ring-white dark:ring-zinc-900"
        />
        <div className="min-w-0 flex-1">
          <p className="flex min-w-0 items-center gap-1 truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {username}
            {isOwner && <Crown size={12} className="shrink-0 text-amber-500" aria-hidden />}
          </p>
          <span className={`${postTagClass} mt-1 capitalize`}>{roleLabel}</span>
        </div>
        {canEdit && (
          <div className="flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              onClick={onUpdateRole}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-white/[0.06] dark:hover:text-zinc-200"
              title="Update role"
            >
              <Pencil size={15} strokeWidth={2} />
            </button>
            {!isCurrentUser && (
              <>
                <button
                  type="button"
                  onClick={onRemove}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/40"
                  title="Remove member"
                >
                  <UserX size={15} strokeWidth={2} />
                </button>
                {showTransfer && (
                  <button
                    type="button"
                    onClick={onTransfer}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-amber-600 transition-colors hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/30"
                    title="Transfer ownership"
                  >
                    <ArrowRightLeft size={15} strokeWidth={2} />
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export function ProfilePages({ username }: ProfilePagesProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'posts' | 'overview' | 'members' | 'settings'>('dashboard');
  const [userPages, setUserPages] = useState<any[]>([]);
  const [pageMembers, setPageMembers] = useState<any[]>([]);
  const [pagePosts, setPagePosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingPageDetails, setLoadingPageDetails] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showAddTeamMemberModal, setShowAddTeamMemberModal] = useState(false);
  const [selectedPageForTeam, setSelectedPageForTeam] = useState<any | null>(null);
  const [teamMemberSearchQuery, setTeamMemberSearchQuery] = useState('');
  const [teamMemberSearchResults, setTeamMemberSearchResults] = useState<any[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [selectedUserIndex, setSelectedUserIndex] = useState(-1);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedTeamRole, setSelectedTeamRole] = useState<'admin' | 'moderator'>('moderator');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchResultsRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<FilterType>('all');

  // Member management states
  const [selectedMemberForAction, setSelectedMemberForAction] = useState<any | null>(null);
  const [showUpdateRoleModal, setShowUpdateRoleModal] = useState(false);
  const [showRemoveMemberModal, setShowRemoveMemberModal] = useState(false);
  const [showTransferOwnershipModal, setShowTransferOwnershipModal] = useState(false);
  const [newRole, setNewRole] = useState<'admin' | 'moderator'>('moderator');
  const [isProcessingMemberAction, setIsProcessingMemberAction] = useState(false);
  const [memberActionError, setMemberActionError] = useState<string | null>(null);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    name: '',
    description: '',
    shortBio: '',
    category: '',
    username: '',
    url: '',
    socialLinks: {
      website: '',
      twitter: '',
      linkedin: '',
      github: '',
      discord: '',
      telegram: '',
      whatsapp: '',
      facebook: '',
      instagram: '',
      youtube: '',
    },
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [usernameCheckStatus, setUsernameCheckStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [usernameCheckMessage, setUsernameCheckMessage] = useState<string>('');
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const lastInitializedPageIdRef = useRef<string | null>(null);
  const usernameCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastInitializedSocialLinksRef = useRef<string>('');

  const { user: authUser } = useAuth();
  const isOwnProfile = authUser?.username === username;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserPages = async () => {
      try {
        setLoading(true);
        const pages = await usersService.getUserPages(username);
        // Ensure pages is an array and include role information
        const pagesWithRoles = Array.isArray(pages) ? pages : [];
        
        // Parse socialLinks if they come as strings from the API
        const pagesWithParsedSocialLinks = pagesWithRoles.map((page: any) => {
          // Handle socialLinks parsing - could be string, object, or null
          // Check for undefined, null, empty string, or empty object
          if (page.socialLinks !== undefined && page.socialLinks !== null && page.socialLinks !== '') {
            if (typeof page.socialLinks === 'string') {
              try {
                const parsed = JSON.parse(page.socialLinks);
                page.socialLinks = parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0 ? parsed : null;
              } catch (e) {
                console.error('[ProfilePages] Error parsing socialLinks:', e, 'Raw value:', page.socialLinks);
                page.socialLinks = null;
              }
            } else if (typeof page.socialLinks === 'object' && page.socialLinks !== null) {
              // Check if it's an empty object
              if (Object.keys(page.socialLinks).length === 0) {
                page.socialLinks = null;
              } else {
                // Already an object with data, keep it
                page.socialLinks = page.socialLinks;
              }
            } else {
              page.socialLinks = null;
            }
          } else {
            page.socialLinks = null;
          }
          
          console.log('[ProfilePages] fetchUserPages: Parsed page socialLinks:', {
            pageId: page.id,
            pageName: page.name,
            hasSocialLinks: !!page.socialLinks,
            socialLinksType: typeof page.socialLinks,
            socialLinksKeys: page.socialLinks ? Object.keys(page.socialLinks) : [],
            socialLinksData: page.socialLinks,
            rawSocialLinks: pagesWithRoles.find((p: any) => p.id === page.id)?.socialLinks,
          });
          
          return page;
        });
        
        setUserPages(normalizePages(pagesWithParsedSocialLinks));
      } catch (err) {
        console.error('Error fetching user pages:', err);
        setUserPages([]);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchUserPages();
    }
  }, [username]);

  useEffect(() => {
    const fetchPageMembers = async () => {
      if (selectedPageId) {
        try {
          const members = await pagesService.getMembers(selectedPageId);
          setPageMembers(members.members || members || []);
        } catch (err) {
          console.error('Error fetching page members:', err);
          setPageMembers([]);
        }
      }
    };

    fetchPageMembers();
  }, [selectedPageId]);

  useEffect(() => {
    const fetchPagePosts = async () => {
  const selectedPage = userPages.find(p => p.id === selectedPageId);
      if (activeTab === 'posts' && selectedPage && selectedPage.slug) {
        try {
          setLoadingPosts(true);
          const postsResponse = await pagesService.getPagePosts(selectedPage.slug);
          const posts = postsResponse.posts || postsResponse.data || postsResponse || [];
          // Deduplicate posts by ID to prevent duplicates
          const uniquePosts = Array.isArray(posts) ? posts.filter((post: Post, index: number, self: Post[]) => 
            index === self.findIndex((p: Post) => p.id === post.id)
          ) : [];
          setPagePosts(uniquePosts);
        } catch (err) {
          console.error('Error fetching page posts:', err);
          setPagePosts([]);
        } finally {
          setLoadingPosts(false);
        }
      } else {
        setPagePosts([]);
      }
    };

    fetchPagePosts();
  }, [activeTab, selectedPageId, userPages]);

  const canManage = (page: any) => {
    const role = page.role?.toLowerCase();
    return role === 'owner' || role === 'admin' || role === 'Admin' || role === 'Owner';
  };

  const filteredPages = userPages.filter(page => {
    if (filter === 'all') return true;
    const role = page.role?.toLowerCase();
    if (filter === 'owner') return role === 'owner';
    if (filter === 'admin') return role === 'admin' || role === 'Admin';
    if (filter === 'member') return role === 'member' || role === 'moderator';
    return true;
  });

  const ownerPages = filteredPages.filter(p => canManage(p));
  const memberPages = filteredPages.filter(p => !canManage(p));

  const selectedPage = userPages.find(p => p.id === selectedPageId);

  // Create a stable string representation of social links for dependency tracking
  const selectedPageSocialLinksStr = useMemo(() => {
    return JSON.stringify(selectedPage?.socialLinks || {});
  }, [selectedPage?.socialLinks]);

  // Fetch full page details when entering edit mode
  useEffect(() => {
    const fetchFullPageDetails = async () => {
      if (selectedPageId && viewMode === 'manage') {
        try {
          setLoadingPageDetails(true);
          console.log('[ProfilePages] Fetching full page details for:', selectedPageId);
          
          // Find the page in userPages to get slug
          const pageFromList = userPages.find(p => p.id === selectedPageId);
          if (!pageFromList?.slug) {
            console.warn('[ProfilePages] No slug found for page:', selectedPageId);
            setLoadingPageDetails(false);
            return;
          }

          // Fetch full page details
          const fullPageData = await pagesService.getPage(pageFromList.slug);
          const pageData = fullPageData.page || fullPageData;
          
          console.log('[ProfilePages] fetchFullPageDetails: Raw API response:', {
            fullPageData,
            pageData,
            hasPageData: !!pageData,
            pageDataKeys: pageData ? Object.keys(pageData) : [],
            rawSocialLinks: pageData?.socialLinks,
            rawSocialLinksType: typeof pageData?.socialLinks,
          });
          
          // Parse socialLinks if needed - be very defensive
          let parsedSocialLinks = null;
          
          // First, check if socialLinks exists at all
          if (pageData.socialLinks !== undefined && pageData.socialLinks !== null) {
            if (typeof pageData.socialLinks === 'string') {
              try {
                parsedSocialLinks = JSON.parse(pageData.socialLinks);
                console.log('[ProfilePages] fetchFullPageDetails: Parsed socialLinks from string:', parsedSocialLinks);
              } catch (e) {
                console.error('[ProfilePages] fetchFullPageDetails: Failed to parse socialLinks string:', e, 'Raw value:', pageData.socialLinks);
                parsedSocialLinks = null;
              }
            } else if (typeof pageData.socialLinks === 'object' && pageData.socialLinks !== null) {
              // Check if it's an empty object
              if (Object.keys(pageData.socialLinks).length > 0) {
                parsedSocialLinks = pageData.socialLinks;
                console.log('[ProfilePages] fetchFullPageDetails: Using socialLinks object:', parsedSocialLinks);
              } else {
                console.log('[ProfilePages] fetchFullPageDetails: socialLinks is an empty object');
                parsedSocialLinks = null;
              }
            } else {
              console.log('[ProfilePages] fetchFullPageDetails: socialLinks is not a string or object:', typeof pageData.socialLinks);
              parsedSocialLinks = null;
            }
          } else {
            console.log('[ProfilePages] fetchFullPageDetails: socialLinks is undefined or null');
            parsedSocialLinks = null;
          }
          
          // Update pageData with parsed socialLinks
          const updatedPageData = {
            ...pageData,
            socialLinks: parsedSocialLinks,
          };
          
          console.log('[ProfilePages] Full page data fetched:', {
            id: updatedPageData.id,
            name: updatedPageData.name,
            hasShortBio: !!updatedPageData.shortBio,
            hasUsername: !!updatedPageData.username,
            hasUrl: !!updatedPageData.url,
            hasSocialLinks: !!updatedPageData.socialLinks,
            socialLinksType: typeof updatedPageData.socialLinks,
            socialLinksKeys: updatedPageData.socialLinks ? Object.keys(updatedPageData.socialLinks) : [],
            socialLinksData: updatedPageData.socialLinks,
          });

          // Update the page in userPages with full data
          setUserPages(prevPages => {
            const updatedPages = prevPages.map(p => {
              if (p.id === selectedPageId) {
                // Merge page data, but preserve socialLinks if pageData doesn't have it
                const mergedData = { ...p, ...updatedPageData };
                // Explicitly set socialLinks from updatedPageData
                if (updatedPageData.socialLinks !== undefined) {
                  mergedData.socialLinks = updatedPageData.socialLinks;
                }
                return mergedData;
              }
              return p;
            });
            return normalizePages(updatedPages);
          });
          
          // Reset form initialization ref so form can be re-initialized with full data
          lastInitializedPageIdRef.current = null;
          lastInitializedSocialLinksRef.current = '';
          console.log('[ProfilePages] Full page data updated, form will re-initialize');
        } catch (err: any) {
          console.error('[ProfilePages] Error fetching full page details:', err);
        } finally {
          setLoadingPageDetails(false);
        }
      }
    };

    fetchFullPageDetails();
  }, [selectedPageId, viewMode]); // Removed userPages dependency

  // Initialize settings form when page is selected (wait for full page data if loading)
  useEffect(() => {
    if (selectedPage && !loadingPageDetails) {
      // Check if we need to re-initialize (different page OR social links just loaded)
      const currentSocialLinksStr = JSON.stringify(selectedPage.socialLinks || {});
      const socialLinksChanged = selectedPage.socialLinks && 
        currentSocialLinksStr !== lastInitializedSocialLinksRef.current;
      const shouldReinitialize = lastInitializedPageIdRef.current !== selectedPage.id || socialLinksChanged;
      
      if (!shouldReinitialize) {
        console.log('[ProfilePages] Form initialization: Skipping (same page already initialized with same data)');
        return;
      }
      
      console.log('[ProfilePages] Form initialization: Page selected:', {
        id: selectedPage.id,
        name: selectedPage.name,
        description: selectedPage.description?.substring(0, 50),
        shortBio: selectedPage.shortBio?.substring(0, 50),
        category: selectedPage.category,
        username: selectedPage.username,
        url: selectedPage.url,
        hasSocialLinks: !!selectedPage.socialLinks,
        socialLinksType: typeof selectedPage.socialLinks,
        socialLinksKeys: selectedPage.socialLinks ? Object.keys(selectedPage.socialLinks) : [],
        socialLinksData: selectedPage.socialLinks,
      });
      
      // Parse socialLinks - handle null, string, or object
      let parsedSocialLinks: Record<string, string> = {};
      if (selectedPage.socialLinks) {
        if (typeof selectedPage.socialLinks === 'string') {
          try {
            parsedSocialLinks = JSON.parse(selectedPage.socialLinks) || {};
          } catch (e) {
            console.error('[ProfilePages] Form initialization: Failed to parse social links string:', e);
            parsedSocialLinks = {};
          }
        } else if (typeof selectedPage.socialLinks === 'object' && selectedPage.socialLinks !== null) {
          parsedSocialLinks = selectedPage.socialLinks;
        }
      }
      
      console.log('[ProfilePages] Form initialization: Extracted social links:', parsedSocialLinks);
      console.log('[ProfilePages] Form initialization: Social links type:', typeof selectedPage.socialLinks);
      console.log('[ProfilePages] Form initialization: Social links raw:', selectedPage.socialLinks);
      console.log('[ProfilePages] Form initialization: Parsed social links keys:', Object.keys(parsedSocialLinks));
      
      const initialFormData = {
        name: selectedPage.name || '',
        description: selectedPage.description || '',
        shortBio: selectedPage.shortBio || '',
        category: selectedPage.category || '',
        username: selectedPage.username || '',
        url: selectedPage.url || '',
        socialLinks: {
          website: parsedSocialLinks.website || '',
          twitter: parsedSocialLinks.twitter || '',
          linkedin: parsedSocialLinks.linkedin || '',
          github: parsedSocialLinks.github || '',
          discord: parsedSocialLinks.discord || '',
          telegram: parsedSocialLinks.telegram || '',
          whatsapp: parsedSocialLinks.whatsapp || '',
          facebook: parsedSocialLinks.facebook || '',
          instagram: parsedSocialLinks.instagram || '',
          youtube: parsedSocialLinks.youtube || '',
        },
      };
      
      console.log('[ProfilePages] Form initialization: Setting form data:', {
        name: initialFormData.name,
        description: initialFormData.description?.substring(0, 50),
        shortBio: initialFormData.shortBio?.substring(0, 50),
        category: initialFormData.category,
        username: initialFormData.username,
        url: initialFormData.url,
        socialLinks: initialFormData.socialLinks,
        socialLinksCount: Object.keys(initialFormData.socialLinks).filter(k => initialFormData.socialLinks[k as keyof typeof initialFormData.socialLinks]).length,
      });
      
      setSettingsForm(initialFormData);
      setLogoPreview(selectedPage.logoUrl || null);
      setCoverPreview(selectedPage.coverImageUrl || null);
      setLogoFile(null);
      setCoverFile(null);
      setSaveError(null);
      setSaveSuccess(false);
      setUsernameCheckStatus('idle');
      setUsernameCheckMessage('');
      lastInitializedPageIdRef.current = selectedPage.id;
      lastInitializedSocialLinksRef.current = currentSocialLinksStr;
      console.log('[ProfilePages] Form initialization: Form initialized successfully');
    } else if (loadingPageDetails) {
      console.log('[ProfilePages] Form initialization: Waiting for full page data to load...');
    } else {
      console.log('[ProfilePages] Form initialization: No page selected');
      lastInitializedPageIdRef.current = null;
      lastInitializedSocialLinksRef.current = '';
    }
  }, [selectedPage?.id, selectedPageSocialLinksStr, loadingPageDetails]); // Use stringified socialLinks for stable comparison

  const handleManagePage = (pageId: string) => {
    setSelectedPageId(pageId);
    setViewMode('manage');
    setActiveTab('settings');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedPageId(null);
  };

  const handlePageCreated = async () => {
    // Refresh the pages list
    try {
      const pages = await usersService.getUserPages(username);
      const pagesWithRoles = Array.isArray(pages) ? pages : [];
      setUserPages(normalizePages(pagesWithRoles));
    } catch (err) {
      console.error('Error refreshing pages:', err);
    }
  };

  // Debounced username uniqueness check
  useEffect(() => {
    // Clear any existing timeout
    if (usernameCheckTimeoutRef.current) {
      clearTimeout(usernameCheckTimeoutRef.current);
    }

    const currentUsername = settingsForm.username.trim();
    const originalUsername = selectedPage?.username || '';

    // Reset status if username is empty or same as original
    if (!currentUsername || currentUsername === originalUsername) {
      setUsernameCheckStatus('idle');
      setUsernameCheckMessage('');
      return;
    }

    // Validate format first
    if (!/^[a-zA-Z0-9_-]+$/.test(currentUsername)) {
      setUsernameCheckStatus('invalid');
      setUsernameCheckMessage('Only letters, numbers, hyphens, and underscores allowed');
      return;
    }

    if (currentUsername.length < 3) {
      setUsernameCheckStatus('invalid');
      setUsernameCheckMessage('Username must be at least 3 characters');
      return;
    }

    // Set checking status immediately
    setUsernameCheckStatus('checking');
    setUsernameCheckMessage('Checking availability...');

    // Debounce the API call
    usernameCheckTimeoutRef.current = setTimeout(async () => {
      try {
        console.log('[ProfilePages] Checking username availability:', currentUsername);
        const result = await pagesService.checkUsername(currentUsername, selectedPage?.id);
        console.log('[ProfilePages] Username check result:', result);
        
        if (result.available) {
          setUsernameCheckStatus('available');
          setUsernameCheckMessage(result.message || 'Username is available');
        } else {
          setUsernameCheckStatus('taken');
          setUsernameCheckMessage(result.message || 'Username is already taken');
        }
      } catch (err: any) {
        console.error('[ProfilePages] Error checking username:', err);
        setUsernameCheckStatus('taken');
        setUsernameCheckMessage(err?.response?.data?.message || 'Error checking username availability');
      }
    }, 500); // 500ms debounce

    // Cleanup function
    return () => {
      if (usernameCheckTimeoutRef.current) {
        clearTimeout(usernameCheckTimeoutRef.current);
      }
    };
  }, [settingsForm.username, selectedPage?.id, selectedPage?.username]);

  // Debounced search effect
  useEffect(() => {
    if (teamMemberSearchQuery.trim().length < 2) {
      setTeamMemberSearchResults([]);
      setIsSearchingUsers(false);
      setSearchError(null);
      setSelectedUserIndex(-1);
      return;
    }

    setIsSearchingUsers(true);
    setSearchError(null);
    setSelectedUserIndex(-1);

    const timeoutId = setTimeout(async () => {
    try {
        const users = await pagesService.searchUsers(teamMemberSearchQuery.trim());
        setTeamMemberSearchResults(users || []);
      } catch (err: any) {
      console.error('Error searching users:', err);
        setSearchError(err?.response?.data?.message || 'Failed to search users');
      setTeamMemberSearchResults([]);
      } finally {
        setIsSearchingUsers(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [teamMemberSearchQuery]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedUserIndex(-1);
  }, [teamMemberSearchResults]);

  // Scroll selected item into view when using keyboard navigation
  useEffect(() => {
    if (selectedUserIndex >= 0 && searchResultsRef.current) {
      const selectedElement = searchResultsRef.current.children[selectedUserIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedUserIndex]);

  // Focus input when modal opens
  useEffect(() => {
    if (showAddTeamMemberModal && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      setTeamMemberSearchQuery('');
      setTeamMemberSearchResults([]);
      setSelectedUserIndex(-1);
      setSearchError(null);
    }
  }, [showAddTeamMemberModal]);

  const handleAddTeamMember = async (pageId: string, member: any) => {
    if (!pageId || !member) {
      setSearchError('Select a user to add to the team')
      return
    }

    const usernameToUse = member.username || member.pseudo
    if (!usernameToUse) {
      setSearchError('Selected user has no username yet; ask them to set one before adding.')
      return
    }

    try {
      await pagesService.addTeamMember(pageId, usernameToUse, selectedTeamRole)
      setShowAddTeamMemberModal(false)
      setTeamMemberSearchQuery('')
      setTeamMemberSearchResults([])
      setSelectedPageForTeam(null)
      setSelectedUserIndex(-1)
      setSelectedTeamRole('moderator')
      setSearchError(null)

      // Refresh members for the managed page
      const members = await pagesService.getMembers(pageId)
      setPageMembers(members.members || members || [])

      // Refresh overall pages list for the profile owner
      try {
        const pages = await usersService.getUserPages(username)
        const pagesWithRoles = Array.isArray(pages) ? pages : []
        setUserPages(normalizePages(pagesWithRoles))
      } catch (refreshError) {
        console.error('Failed to refresh pages after adding member:', refreshError)
      }
    } catch (err: any) {
      setSearchError(err?.response?.data?.message || err?.message || 'Failed to add team member')
    }
  }

  const handleUpdateMemberRole = async () => {
    if (!selectedPageId || !selectedMemberForAction) return;

    try {
      setIsProcessingMemberAction(true);
      setMemberActionError(null);
      await pagesService.updateTeamMemberRole(selectedPageId, selectedMemberForAction.userId || selectedMemberForAction.id, newRole);
      
      // Refresh members
      const members = await pagesService.getMembers(selectedPageId);
      setPageMembers(members.members || members || []);
      
      // Refresh pages list
      const pages = await usersService.getUserPages(username);
      const pagesWithRoles = Array.isArray(pages) ? pages : [];
      setUserPages(normalizePages(pagesWithRoles));
      
      setShowUpdateRoleModal(false);
      setSelectedMemberForAction(null);
      setNewRole('moderator');
    } catch (err: any) {
      setMemberActionError(err?.response?.data?.message || err?.message || 'Failed to update member role');
    } finally {
      setIsProcessingMemberAction(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!selectedPageId || !selectedMemberForAction) return;

    try {
      setIsProcessingMemberAction(true);
      setMemberActionError(null);
      await pagesService.removeTeamMember(selectedPageId, selectedMemberForAction.userId || selectedMemberForAction.id);
      
      // Refresh members
      const members = await pagesService.getMembers(selectedPageId);
      setPageMembers(members.members || members || []);
      
      // Refresh pages list
      const pages = await usersService.getUserPages(username);
      const pagesWithRoles = Array.isArray(pages) ? pages : [];
      setUserPages(normalizePages(pagesWithRoles));
      
      setShowRemoveMemberModal(false);
      setSelectedMemberForAction(null);
    } catch (err: any) {
      setMemberActionError(err?.response?.data?.message || err?.message || 'Failed to remove member');
    } finally {
      setIsProcessingMemberAction(false);
    }
  };

  const handleTransferOwnership = async () => {
    if (!selectedPageId || !selectedMemberForAction) return;

    try {
      setIsProcessingMemberAction(true);
      setMemberActionError(null);
      await pagesService.transferOwnership(selectedPageId, selectedMemberForAction.userId || selectedMemberForAction.id);
      
      // Refresh members and pages
      const members = await pagesService.getMembers(selectedPageId);
      setPageMembers(members.members || members || []);
      
      const pages = await usersService.getUserPages(username);
      const pagesWithRoles = Array.isArray(pages) ? pages : [];
      setUserPages(normalizePages(pagesWithRoles));
      
      // Update selectedPageId if needed (if user is no longer owner, switch to list view)
      const updatedPage = pagesWithRoles.find((p: any) => p.id === selectedPageId);
      if (!updatedPage || !canManage(updatedPage)) {
        setViewMode('list');
        setSelectedPageId(null);
        setActiveTab('dashboard');
      }
      
      setShowTransferOwnershipModal(false);
      setSelectedMemberForAction(null);
    } catch (err: any) {
      setMemberActionError(err?.response?.data?.message || err?.message || 'Failed to transfer ownership');
    } finally {
      setIsProcessingMemberAction(false);
    }
  };

  const renderAddTeamMemberModal = () => {
    if (!showAddTeamMemberModal || !selectedPageForTeam) {
      return null
    }

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowAddTeamMemberModal(false)
            setTeamMemberSearchQuery('')
            setTeamMemberSearchResults([])
            setSelectedPageForTeam(null)
            setSelectedUserIndex(-1)
            setSearchError(null)
          }
        }}
      >
        <GlassCard className="w-full max-w-md p-6 space-y-4 animate-slide-up max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add Team Member</h3>
            <button
              onClick={() => {
                setShowAddTeamMemberModal(false)
                setTeamMemberSearchQuery('')
                setTeamMemberSearchResults([])
                setSelectedPageForTeam(null)
                setSelectedUserIndex(-1)
                setSearchError(null)
              }}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Close modal"
            >
              <X size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                Search by Username
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={teamMemberSearchQuery}
                  onChange={(e) => setTeamMemberSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Type username to search..."
                  className="w-full pl-11 pr-10 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none text-base"
                />
                {isSearchingUsers && (
                  <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-500 animate-spin" size={18} />
                )}
                {teamMemberSearchQuery && !isSearchingUsers && (
                  <button
                    onClick={() => setTeamMemberSearchQuery('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <X size={16} className="text-gray-400 dark:text-gray-500" />
                  </button>
                )}
              </div>
              {teamMemberSearchQuery.trim().length > 0 && teamMemberSearchQuery.trim().length < 2 && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Type at least 2 characters</p>
              )}
            </div>

            {searchError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="text-red-600 dark:text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-600 dark:text-red-400">{searchError}</p>
                </div>
              </div>
            )}

            {teamMemberSearchQuery.trim().length >= 2 && !isSearchingUsers && teamMemberSearchResults.length > 0 && (
              <div
                ref={searchResultsRef}
                className="space-y-1 max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-xl p-2 bg-white dark:bg-gray-900"
              >
                {teamMemberSearchResults.map((user: any, index: number) => (
                  <button
                    key={`${user.id}-${user.username || user.pseudo || 'user'}`}
                    onClick={() => handleAddTeamMember(selectedPageForTeam.id, user)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                      selectedUserIndex === index
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 dark:border-blue-400'
                        : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-2 border-transparent'
                    }`}
                    onMouseEnter={() => setSelectedUserIndex(index)}
                  >
                    <Avatar
                      src={
                        user.avatarUrl ||
                        user.avatar_url ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.username || user.pseudo || 'member')}`
                      }
                      alt={user.username || user.pseudo || 'User'}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900 dark:text-white truncate">{user.username || user.pseudo || 'Unknown user'}</p>
                        {user.isVerified && <VerifiedBadge size={14} />}
                      </div>
                      {user.pseudo && user.pseudo !== user.username && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.pseudo}</p>
                      )}
                      {user.bio && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">{user.bio}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {teamMemberSearchQuery.trim().length >= 2 && !isSearchingUsers && teamMemberSearchResults.length === 0 && !searchError && (
              <div className="p-8 text-center border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800">
                <Users size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No users found</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Try a different username</p>
              </div>
            )}

            {teamMemberSearchQuery.trim().length >= 2 && isSearchingUsers && (
              <div className="p-8 text-center border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800">
                <Loader2 className="mx-auto text-blue-500 animate-spin mb-2" size={24} />
                <p className="text-sm text-gray-500 dark:text-gray-400">Searching...</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                Role
              </label>
              <select
                value={selectedTeamRole}
                onChange={(e) => setSelectedTeamRole(e.target.value as 'admin' | 'moderator')}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none text-base"
              >
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {teamMemberSearchResults.length > 0 && (
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  Use <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs font-mono">↑</kbd>
                  <kbd className="ml-1 px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs font-mono">↓</kbd> to navigate,
                  <kbd className="ml-1 px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs font-mono">Enter</kbd> to select
                </p>
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    )
  }

  // Keyboard navigation handler
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedUserIndex(prev => 
        prev < teamMemberSearchResults.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedUserIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedPageForTeam) {
        if (selectedUserIndex >= 0 && selectedUserIndex < teamMemberSearchResults.length) {
          const selectedUser = teamMemberSearchResults[selectedUserIndex];
          handleAddTeamMember(selectedPageForTeam.id, selectedUser);
        } else if (teamMemberSearchResults.length === 1) {
          handleAddTeamMember(selectedPageForTeam.id, teamMemberSearchResults[0]);
        }
      }
    } else if (e.key === 'Escape') {
      setShowAddTeamMemberModal(false);
      setTeamMemberSearchQuery('');
      setTeamMemberSearchResults([]);
      setSelectedPageForTeam(null);
      setSelectedUserIndex(-1);
    }
  };

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setSaveError('Logo size must be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setSaveError('Please upload a valid image file');
      return;
    }

    setSaveError(null);
    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setSaveError('Cover image size must be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setSaveError('Please upload a valid image file');
      return;
    }

    setSaveError(null);
    setCoverFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSettings = async () => {
    if (!selectedPage) {
      console.error('[ProfilePages] handleSaveSettings: No selected page');
      setSaveError('No page selected');
      return;
    }

    console.log('[ProfilePages] handleSaveSettings: Starting save for page:', selectedPage.id);
    console.log('[ProfilePages] handleSaveSettings: Form data:', {
      name: settingsForm.name,
      description: settingsForm.description?.substring(0, 50),
      shortBio: settingsForm.shortBio?.substring(0, 50),
      category: settingsForm.category,
      username: settingsForm.username,
      url: settingsForm.url,
      socialLinksCount: Object.keys(settingsForm.socialLinks).filter(k => settingsForm.socialLinks[k as keyof typeof settingsForm.socialLinks]).length,
    });

    if (!settingsForm.name.trim()) {
      console.warn('[ProfilePages] handleSaveSettings: Page name is empty');
      setSaveError('Page name is required');
      return;
    }

    // Check username availability if changed
    if (settingsForm.username.trim() && settingsForm.username !== (selectedPage?.username || '')) {
      if (usernameCheckStatus === 'taken' || usernameCheckStatus === 'invalid') {
        console.warn('[ProfilePages] handleSaveSettings: Username is not available');
        setSaveError(usernameCheckMessage || 'Username is not available');
        return;
      }
      if (usernameCheckStatus === 'checking') {
        console.warn('[ProfilePages] handleSaveSettings: Username check in progress');
        setSaveError('Please wait for username availability check to complete');
        return;
      }
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      // Convert logo to base64 if a new file was selected
      let logoUrl = selectedPage.logoUrl || undefined;
      if (logoFile) {
        console.log('[ProfilePages] handleSaveSettings: Converting logo to base64');
        logoUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = reader.result as string;
            console.log('[ProfilePages] handleSaveSettings: Logo converted, size:', base64String.length);
            resolve(base64String);
          };
          reader.onerror = (error) => {
            console.error('[ProfilePages] handleSaveSettings: Error reading logo file:', error);
            reject(error);
          };
          reader.readAsDataURL(logoFile);
        });
      }

      // Convert cover to base64 if a new file was selected
      let coverImageUrl = selectedPage.coverImageUrl || undefined;
      if (coverFile) {
        console.log('[ProfilePages] handleSaveSettings: Converting cover to base64');
        coverImageUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = reader.result as string;
            console.log('[ProfilePages] handleSaveSettings: Cover converted, size:', base64String.length);
            resolve(base64String);
          };
          reader.onerror = (error) => {
            console.error('[ProfilePages] handleSaveSettings: Error reading cover file:', error);
            reject(error);
          };
          reader.readAsDataURL(coverFile);
        });
      }

      // Prepare social links - merge with existing ones instead of replacing
      // Get existing social links from the page
      const existingSocialLinks = (selectedPage.socialLinks || {}) as Record<string, string>;
      
      // Start with existing social links
      const socialLinks: Record<string, string> = { ...existingSocialLinks };
      
      // Update/add new social links from form (only non-empty values)
      // Use socialLinks.website if available, otherwise fall back to url field
      if (settingsForm.socialLinks.website && settingsForm.socialLinks.website.trim()) {
        socialLinks.website = settingsForm.socialLinks.website.trim();
      } else if (settingsForm.url && settingsForm.url.trim()) {
        socialLinks.website = settingsForm.url.trim();
      } else if (!settingsForm.socialLinks.website && !settingsForm.url) {
        // If both are empty, remove website
        delete socialLinks.website;
      }
      
      // Update other social links (only if they have values, otherwise keep existing or remove)
      const socialLinkFields: Array<keyof typeof settingsForm.socialLinks> = [
        'twitter', 'linkedin', 'github', 'discord', 'telegram', 
        'whatsapp', 'facebook', 'instagram', 'youtube'
      ];
      
      socialLinkFields.forEach(field => {
        const formValue = settingsForm.socialLinks[field];
        if (formValue && formValue.trim().length > 0) {
          socialLinks[field] = formValue.trim();
        } else {
          // Remove empty fields (user cleared them)
          delete socialLinks[field];
        }
      });
      
      console.log('[ProfilePages] handleSaveSettings: Prepared social links:', {
        existing: existingSocialLinks,
        form: settingsForm.socialLinks,
        merged: socialLinks,
        mergedKeys: Object.keys(socialLinks),
      });

      // Always send socialLinks (even if empty object) so backend can merge properly
      // Backend will handle null if empty
      const updateData = {
        name: settingsForm.name.trim(),
        description: settingsForm.description.trim() || undefined,
        shortBio: settingsForm.shortBio.trim() || undefined,
        category: settingsForm.category || undefined,
        username: settingsForm.username.trim() || undefined,
        logoUrl: logoUrl,
        coverImageUrl: coverImageUrl,
        url: settingsForm.url.trim() || undefined,
        socialLinks: Object.keys(socialLinks).length > 0 ? socialLinks : {}, // Send empty object if all cleared (backend will convert to null)
      };

      console.log('[ProfilePages] handleSaveSettings: Sending update request:', {
        ...updateData,
        logoUrl: logoUrl ? `[base64 ${logoUrl.length} chars]` : undefined,
        coverImageUrl: coverImageUrl ? `[base64 ${coverImageUrl.length} chars]` : undefined,
        socialLinks: updateData.socialLinks,
      });

      // Update page
      const updateResponse = await pagesService.updatePage(selectedPage.id, updateData);
      console.log('[ProfilePages] handleSaveSettings: Update response received:', {
        message: updateResponse.message,
        pageId: updateResponse.page?.id,
        hasSocialLinks: !!updateResponse.page?.socialLinks,
        socialLinksKeys: updateResponse.page?.socialLinks ? Object.keys(updateResponse.page.socialLinks) : [],
        socialLinksData: updateResponse.page?.socialLinks,
      });

      setSaveSuccess(true);
      console.log('[ProfilePages] handleSaveSettings: Save success flag set');
      
      // Use the page data from the update response first (it should have socialLinks)
      const updatedPageFromResponse = updateResponse.page;
      
      // Check if response has socialLinks (even if null, undefined means not included)
      const hasSocialLinksInResponse = updatedPageFromResponse && 'socialLinks' in updatedPageFromResponse;
      
      if (updatedPageFromResponse && hasSocialLinksInResponse) {
        console.log('[ProfilePages] handleSaveSettings: Using page data from update response');
        
        // Parse socialLinks from response
        let responseSocialLinks = updatedPageFromResponse.socialLinks;
        if (typeof responseSocialLinks === 'string') {
          try {
            responseSocialLinks = JSON.parse(responseSocialLinks);
          } catch (e) {
            console.error('[ProfilePages] handleSaveSettings: Failed to parse response socialLinks:', e);
            responseSocialLinks = null;
          }
        }
        
        // Update userPages with the response data
        setUserPages(prevPages => {
          const updatedPages = prevPages.map(p => {
            if (p.id === selectedPage.id) {
              const mergedData = { ...p, ...updatedPageFromResponse };
              // Explicitly set socialLinks from response (even if null)
              mergedData.socialLinks = responseSocialLinks;
              return mergedData;
            }
            return p;
          });
          return normalizePages(updatedPages);
        });
        
        // Update form with response data
        const parsedResponseSocialLinks = (responseSocialLinks || {}) as Record<string, string>;
        
        const newFormData = {
          name: updatedPageFromResponse.name || '',
          description: updatedPageFromResponse.description || '',
          shortBio: updatedPageFromResponse.shortBio || '',
          category: updatedPageFromResponse.category || '',
          username: updatedPageFromResponse.username || '',
          url: updatedPageFromResponse.url || '',
          socialLinks: {
            website: parsedResponseSocialLinks.website || '',
            twitter: parsedResponseSocialLinks.twitter || '',
            linkedin: parsedResponseSocialLinks.linkedin || '',
            github: parsedResponseSocialLinks.github || '',
            discord: parsedResponseSocialLinks.discord || '',
            telegram: parsedResponseSocialLinks.telegram || '',
            whatsapp: parsedResponseSocialLinks.whatsapp || '',
            facebook: parsedResponseSocialLinks.facebook || '',
            instagram: parsedResponseSocialLinks.instagram || '',
            youtube: parsedResponseSocialLinks.youtube || '',
          },
        };
        
        console.log('[ProfilePages] handleSaveSettings: Updating form with response data:', {
          name: newFormData.name,
          hasSocialLinks: Object.keys(newFormData.socialLinks).filter(k => newFormData.socialLinks[k as keyof typeof newFormData.socialLinks]).length > 0,
          socialLinks: newFormData.socialLinks,
        });
        
        setSettingsForm(newFormData);
        setLogoPreview(updatedPageFromResponse.logoUrl || null);
        setCoverPreview(updatedPageFromResponse.coverImageUrl || null);
        setLogoFile(null);
        setCoverFile(null);
        lastInitializedPageIdRef.current = null;
        lastInitializedSocialLinksRef.current = JSON.stringify(responseSocialLinks || {});
        console.log('[ProfilePages] handleSaveSettings: Form updated with response data');
      } else {
        // Fallback: Refresh pages list AND fetch full page details
        console.log('[ProfilePages] handleSaveSettings: Response data incomplete or missing socialLinks, fetching full page details');
        try {
      const pages = await usersService.getUserPages(username);
          console.log('[ProfilePages] handleSaveSettings: Pages fetched:', pages?.length || 0);
      const pagesWithRoles = Array.isArray(pages) ? pages : [];
          
          // Parse socialLinks for all pages
          const pagesWithParsedSocialLinks = pagesWithRoles.map((page: any) => {
            if (page.socialLinks !== undefined && page.socialLinks !== null && page.socialLinks !== '') {
              if (typeof page.socialLinks === 'string') {
                try {
                  const parsed = JSON.parse(page.socialLinks);
                  page.socialLinks = parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0 ? parsed : null;
                } catch (e) {
                  console.error('[ProfilePages] handleSaveSettings: Error parsing socialLinks:', e);
                  page.socialLinks = null;
                }
              } else if (typeof page.socialLinks === 'object' && page.socialLinks !== null) {
                if (Object.keys(page.socialLinks).length === 0) {
                  page.socialLinks = null;
                }
              } else {
                page.socialLinks = null;
              }
            } else {
              page.socialLinks = null;
            }
            return page;
          });
          
          const normalizedPages = normalizePages(pagesWithParsedSocialLinks);
          setUserPages(normalizedPages);
          console.log('[ProfilePages] handleSaveSettings: Pages normalized and set:', normalizedPages.length);
          
          // Find the updated page and fetch full details to get social links
          const updatedPage = normalizedPages.find((p: any) => p.id === selectedPage.id);
          if (updatedPage && updatedPage.slug) {
            console.log('[ProfilePages] handleSaveSettings: Fetching full page details for updated page');
            try {
              const fullPageData = await pagesService.getPage(updatedPage.slug);
              const pageData = fullPageData.page || fullPageData;
              
              console.log('[ProfilePages] handleSaveSettings: Full page data fetched:', {
                id: pageData.id,
                name: pageData.name,
                hasSocialLinks: !!pageData.socialLinks,
                socialLinksKeys: pageData.socialLinks ? Object.keys(pageData.socialLinks) : [],
                socialLinksData: pageData.socialLinks,
              });
              
              // Parse socialLinks from full page data
              let parsedSocialLinks = null;
              if (pageData.socialLinks !== undefined && pageData.socialLinks !== null) {
                if (typeof pageData.socialLinks === 'string') {
                  try {
                    parsedSocialLinks = JSON.parse(pageData.socialLinks);
                  } catch (e) {
                    console.error('[ProfilePages] handleSaveSettings: Error parsing full page socialLinks:', e);
                    parsedSocialLinks = null;
                  }
                } else if (typeof pageData.socialLinks === 'object' && pageData.socialLinks !== null) {
                  if (Object.keys(pageData.socialLinks).length > 0) {
                    parsedSocialLinks = pageData.socialLinks;
                  } else {
                    parsedSocialLinks = null;
                  }
                }
              }
              
              // Update the page in userPages with full data including social links
              setUserPages(prevPages => {
                const updatedPages = prevPages.map(p => {
                  if (p.id === selectedPage.id) {
                    const mergedData = { ...p, ...pageData };
                    mergedData.socialLinks = parsedSocialLinks;
                    return mergedData;
                  }
                  return p;
                });
                return normalizePages(updatedPages);
              });
              
              // Update form with full data
              const parsedFormSocialLinks = (parsedSocialLinks || {}) as Record<string, string>;
              
              const newFormData = {
                name: pageData.name || '',
                description: pageData.description || '',
                shortBio: pageData.shortBio || '',
                category: pageData.category || '',
                username: pageData.username || '',
                url: pageData.url || '',
                socialLinks: {
                  website: parsedFormSocialLinks.website || '',
                  twitter: parsedFormSocialLinks.twitter || '',
                  linkedin: parsedFormSocialLinks.linkedin || '',
                  github: parsedFormSocialLinks.github || '',
                  discord: parsedFormSocialLinks.discord || '',
                  telegram: parsedFormSocialLinks.telegram || '',
                  whatsapp: parsedFormSocialLinks.whatsapp || '',
                  facebook: parsedFormSocialLinks.facebook || '',
                  instagram: parsedFormSocialLinks.instagram || '',
                  youtube: parsedFormSocialLinks.youtube || '',
                },
              };
              
              console.log('[ProfilePages] handleSaveSettings: Updating form with full data:', {
                name: newFormData.name,
                hasSocialLinks: Object.keys(newFormData.socialLinks).filter(k => newFormData.socialLinks[k as keyof typeof newFormData.socialLinks]).length > 0,
                socialLinks: newFormData.socialLinks,
              });
              
              setSettingsForm(newFormData);
              setLogoPreview(pageData.logoUrl || null);
              setCoverPreview(pageData.coverImageUrl || null);
        setLogoFile(null);
        setCoverFile(null);
              lastInitializedPageIdRef.current = null;
              lastInitializedSocialLinksRef.current = JSON.stringify(parsedSocialLinks || {});
              console.log('[ProfilePages] handleSaveSettings: Form updated successfully with full data');
            } catch (fetchError: any) {
              console.error('[ProfilePages] handleSaveSettings: Error fetching full page details:', fetchError);
            }
          }
        } catch (refreshError: any) {
          console.error('[ProfilePages] handleSaveSettings: Error refreshing pages list:', refreshError);
          setSaveError('Settings saved, but failed to refresh page list. Please reload the page.');
        }
      }

      setTimeout(() => {
        console.log('[ProfilePages] handleSaveSettings: Hiding success message');
        setSaveSuccess(false);
      }, 5000);
    } catch (error: any) {
      console.error('[ProfilePages] handleSaveSettings: Error saving settings:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to save settings';
      setSaveError(errorMessage);
      // Note: toast is not available in this component, using setSaveError instead
    } finally {
      setIsSaving(false);
      console.log('[ProfilePages] handleSaveSettings: Setting isSaving to false');
    }
  };

  const handleDeletePage = async () => {
    if (!selectedPage) return;

    if (!confirm(`Are you sure you want to delete "${selectedPage.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await pagesService.deletePage(selectedPage.id);
      handleBackToList();
      // Refresh pages list
      const pages = await usersService.getUserPages(username);
      const pagesWithRoles = Array.isArray(pages) ? pages : [];
      setUserPages(normalizePages(pagesWithRoles));
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Failed to delete page');
    }
  };

  // List View
  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        <CreatePageModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handlePageCreated}
        />

        <div className={`${asidePanelClass} p-3 sm:p-4`}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-200/80 bg-zinc-50 text-zinc-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-400"
                aria-hidden
              >
                <Building2 size={18} strokeWidth={2} />
              </span>
              <div className="min-w-0">
                <h2 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-lg">
                  {isOwnProfile ? 'Your pages' : 'Pages'}
                </h2>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400 sm:text-sm">
                  {isOwnProfile
                    ? 'Communities you own, administer, or belong to'
                    : `Communities ${username} owns or moderates`}
                </p>
              </div>
            </div>
            {isOwnProfile && (
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-zinc-200/80 bg-zinc-900 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-zinc-800 dark:border-white/10 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              >
                <Plus size={16} strokeWidth={2} aria-hidden />
                Create page
              </button>
            )}
          </div>
        </div>

        {isOwnProfile && userPages.length > 0 && (
          <div className={`${asidePanelClass} overflow-hidden p-2 sm:p-2.5`}>
            <TabPills
              ariaLabel="Page roles"
              activeTab={filter}
              onChange={setFilter}
              size="sm"
              scrollable
              tabs={(['all', 'owner', 'admin', 'member'] as FilterType[]).map((filterType) => {
                const icons = { all: Sparkles, owner: Crown, admin: Shield, member: Users };
                const count =
                  filterType === 'all'
                    ? userPages.length
                    : userPages.filter((p) => {
                        const role = p.role?.toLowerCase();
                        if (filterType === 'owner') return role === 'owner';
                        if (filterType === 'admin') return role === 'admin';
                        if (filterType === 'member') return role === 'member' || role === 'moderator';
                        return true;
                      }).length;
                return {
                  id: filterType,
                  label: filterType.charAt(0).toUpperCase() + filterType.slice(1),
                  icon: icons[filterType],
                  count,
                };
              })}
            />
          </div>
        )}

        {loading ? (
          <PageCardSkeletonList count={4} />
        ) : filteredPages.length === 0 ? (
          <div className={`${asidePanelClass} px-6 py-12 text-center`}>
            <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-200/80 bg-zinc-50 text-zinc-400 dark:border-white/10 dark:bg-white/[0.04]">
              <Building2 size={22} strokeWidth={1.75} />
            </span>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {isOwnProfile ? 'No pages yet' : 'No pages found'}
            </h3>
            <p className="mx-auto mt-1 max-w-sm text-xs text-zinc-500 dark:text-zinc-400">
              {isOwnProfile
                ? 'Create a community page to publish posts and grow your audience.'
                : `This user hasn't joined or created any community pages yet.`}
            </p>
            {isOwnProfile && (
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-zinc-200/80 bg-zinc-900 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-zinc-800 dark:border-white/10 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              >
                <Plus size={16} strokeWidth={2} aria-hidden />
                Create your first page
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {ownerPages.length > 0 && (
              <section>
                <ProfilePagesSectionHeader
                  title="Pages you manage"
                  subtitle="Communities you own or administer"
                  count={ownerPages.length}
                />
                <div className={profilePageGridClass}>
                  {ownerPages.map((page) => (
                    <ProfilePageCard
                      key={`owner-${page.id}`}
                      page={page}
                      onView={() => {
                        if (page.slug) navigate(`/pages/${page.slug}`);
                      }}
                      onManage={() => handleManagePage(page.id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {memberPages.length > 0 && (
              <section>
                <ProfilePagesSectionHeader
                  title="Member of"
                  subtitle="Communities where you participate as a member"
                  count={memberPages.length}
                />
                <div className={profilePageGridClass}>
                  {memberPages.map((page) => (
                    <ProfilePageCard
                      key={`member-${page.id}`}
                      page={page}
                      onView={() => {
                        if (page.slug) navigate(`/pages/${page.slug}`);
                      }}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {renderAddTeamMemberModal()}
      </div>
    );
  }

  // Manage Page View (Only for owners/admins)
  if (viewMode === 'manage' && selectedPage) {
    return (
      <div className="space-y-4">
        <ManagePageHero
          page={selectedPage}
          onBack={handleBackToList}
          onViewPublic={() => {
            if (selectedPage.slug) navigate(`/pages/${selectedPage.slug}`);
          }}
        />

        <div className={`${asidePanelClass} sticky top-16 z-30 overflow-hidden p-2 sm:top-20`}>
          <TabPills
            ariaLabel="Manage page"
            activeTab={activeTab}
            onChange={(id) => setActiveTab(id as typeof activeTab)}
            size="sm"
            scrollable
            tabs={[
              { id: 'overview', label: 'Overview', icon: Layout },
              { id: 'posts', label: 'Posts', icon: FileText, count: pagePosts.length },
              { id: 'members', label: 'Members', icon: Users, count: pageMembers.length },
              { id: 'settings', label: 'Settings', icon: Settings },
            ]}
          />
        </div>

        <div className="space-y-4">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className={`${asidePanelClass} p-3 sm:p-4`}>
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Statistics</h3>
                  <BarChart3 size={16} strokeWidth={2} className="text-zinc-400" aria-hidden />
                </div>
                <div className="space-y-2">
                  {[
                    { label: 'Members', value: selectedPage.memberCount || selectedPage.members || 0 },
                    { label: 'Posts', value: selectedPage.postCount || selectedPage.posts || 0 },
                    {
                      label: 'Category',
                      value: selectedPage.category
                        ? formatListingLabel(selectedPage.category)
                        : '—',
                    },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between rounded-lg border border-zinc-200/70 bg-zinc-50/80 px-3 py-2 dark:border-white/10 dark:bg-white/[0.03]"
                    >
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">{row.label}</span>
                      <span className="text-sm font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                        {typeof row.value === 'number' ? row.value.toLocaleString() : row.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`${asidePanelClass} p-3 sm:p-4`}>
                <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Quick actions</h3>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => selectedPage.slug && navigate(`/pages/${selectedPage.slug}`)}
                    className={`${manageGhostBtnClass} w-full justify-start`}
                  >
                    <ExternalLink size={16} strokeWidth={2} aria-hidden />
                    View public page
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('members')}
                    className={`${manageGhostBtnClass} w-full justify-start`}
                  >
                    <UserPlus size={16} strokeWidth={2} aria-hidden />
                    Manage members
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('settings')}
                    className={`${manageGhostBtnClass} w-full justify-start`}
                  >
                    <Settings size={16} strokeWidth={2} aria-hidden />
                    Edit settings
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'posts' && (
            <div>
              {loadingPosts ? (
                <PostSkeletonList count={6} />
              ) : pagePosts.length > 0 ? (
                <div className={compactPostGridClass}>
                  {pagePosts.map((post) => (
                    <CompactPostCard
                      key={post.id}
                      post={post}
                      onClick={() => navigate(`/post/${post.slug || post.id}`)}
                      onLoginRequired={() => navigate('/login')}
                    />
                  ))}
                </div>
              ) : (
                <div className={`${asidePanelClass} px-6 py-10 text-center`}>
                  <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-200/80 bg-zinc-50 text-zinc-400 dark:border-white/10 dark:bg-white/[0.04]">
                    <FileText size={20} strokeWidth={1.75} />
                  </span>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">No posts yet</h3>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Posts published under this page will appear here.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'members' && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Team members</h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    People who can post and manage this page
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPageForTeam(selectedPage);
                    setShowAddTeamMemberModal(true);
                  }}
                  className={managePrimaryBtnClass}
                >
                  <UserPlus size={16} strokeWidth={2} aria-hidden />
                  Add member
                </button>
              </div>

              {pageMembers.length > 0 ? (
                <div className={manageMemberGridClass}>
                  {pageMembers.map((member: any) => {
                    const isOwner =
                      selectedPage?.ownerId === (member.userId || member.id) || member.role === 'owner';
                    const canEditMember = canManage(selectedPage) && !isOwner;
                    const isCurrentUser = authUser?.id === (member.userId || member.id);

                    return (
                      <ManageTeamMemberCard
                        key={member.id || member.userId}
                        member={member}
                        isOwner={isOwner}
                        canEdit={canEditMember}
                        isCurrentUser={isCurrentUser}
                        showTransfer={selectedPage?.ownerId === authUser?.id}
                        onUpdateRole={() => {
                          setSelectedMemberForAction(member);
                          setNewRole(member.role === 'admin' ? 'moderator' : 'admin');
                          setShowUpdateRoleModal(true);
                        }}
                        onRemove={() => {
                          setSelectedMemberForAction(member);
                          setShowRemoveMemberModal(true);
                        }}
                        onTransfer={() => {
                          setSelectedMemberForAction(member);
                          setShowTransferOwnershipModal(true);
                        }}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className={`${asidePanelClass} px-6 py-10 text-center`}>
                  <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-200/80 bg-zinc-50 text-zinc-400 dark:border-white/10 dark:bg-white/[0.04]">
                    <Users size={20} strokeWidth={1.75} />
                  </span>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">No team members yet</p>
                </div>
              )}
            </div>
          )}

            {activeTab === 'settings' && (
            <div className="space-y-4">
              {loadingPageDetails && (
                <div className={`${asidePanelClass} flex items-center gap-3 p-3 sm:p-4`}>
                  <Loader2 size={18} className="shrink-0 animate-spin text-zinc-500" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Loading page details…</p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Fetching latest data from the server</p>
                  </div>
                </div>
              )}

              {saveSuccess && (
                <div className={`${asidePanelClass} flex items-start gap-3 border-emerald-200/80 bg-emerald-50/80 p-3 dark:border-emerald-500/25 dark:bg-emerald-950/30 sm:p-4`}>
                  <CheckCircle size={18} className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">Settings saved</p>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-300/90">Your page information was updated.</p>
                  </div>
                </div>
              )}

              {saveError && (
                <div className={`${asidePanelClass} flex items-start gap-3 border-red-200/80 bg-red-50/80 p-3 dark:border-red-500/25 dark:bg-red-950/30 sm:p-4`}>
                  <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-600 dark:text-red-400" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-red-900 dark:text-red-100">Could not save</p>
                    <p className="text-[11px] text-red-700 dark:text-red-300/90">{saveError}</p>
                  </div>
                </div>
              )}

              <div className={`${asidePanelClass} space-y-5 p-3 sm:p-4`}>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Page settings</h3>
                  <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                    Name, branding, links, and appearance
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className={`text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 ${postCardDividerClass} pb-2`}>
                    Basic information
                  </h4>

                  <div>
                    <label className={manageLabelClass}>
                      Page name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={settingsForm.name}
                      onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                      className={manageInputClass}
                      placeholder="Enter page name"
                      disabled={isSaving}
                    />
                </div>

                  <div>
                    <label className={manageLabelClass}>
                      Description
                    </label>
                    <textarea
                      value={settingsForm.description}
                      onChange={(e) => setSettingsForm({ ...settingsForm, description: e.target.value })}
                      className={manageTextareaClass}
                      placeholder="Describe your page..."
                      disabled={isSaving}
                    />
                </div>

                  <div>
                    <label className={manageLabelClass}>
                      Short Bio <span className="text-gray-500 dark:text-gray-400 font-normal">(optional)</span>
                    </label>
                    <textarea
                      value={settingsForm.shortBio}
                      onChange={(e) => setSettingsForm({ ...settingsForm, shortBio: e.target.value })}
                      className={manageTextareaClass}
                      placeholder="A brief bio about your page..."
                      disabled={isSaving}
                      maxLength={1000}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {settingsForm.shortBio.length}/1000 characters
                    </p>
                </div>

                  <div>
                    <label className={manageLabelClass}>
                      Category
                    </label>
                    <input
                      type="text"
                      value={settingsForm.category}
                      onChange={(e) => setSettingsForm({ ...settingsForm, category: e.target.value })}
                      className={manageInputClass}
                      placeholder="e.g., Web3, DeFi, NFT"
                      disabled={isSaving}
                    />
                </div>

                  <div>
                    <label className={manageLabelClass}>
                      Username <span className="text-gray-500 dark:text-gray-400 font-normal">(optional)</span>
                    </label>
                    <div className="relative">
                      <Hash size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={settingsForm.username}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^a-zA-Z0-9_-]/g, '');
                          setSettingsForm({ ...settingsForm, username: value });
                        }}
                        placeholder="page-username"
                        disabled={isSaving}
                        className={`${manageInputClass} pl-10 pr-10 ${
                          usernameCheckStatus === 'available'
                            ? 'border-emerald-500 focus:border-emerald-500'
                            : usernameCheckStatus === 'taken' || usernameCheckStatus === 'invalid'
                            ? 'border-red-500 focus:border-red-500'
                            : usernameCheckStatus === 'checking'
                            ? 'border-zinc-400 focus:border-zinc-400'
                            : ''
                        }`}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {usernameCheckStatus === 'checking' && (
                          <Loader2 size={18} className="text-blue-500 animate-spin" />
                        )}
                        {usernameCheckStatus === 'available' && (
                          <CheckCircle size={18} className="text-green-500" />
                        )}
                        {(usernameCheckStatus === 'taken' || usernameCheckStatus === 'invalid') && (
                          <AlertCircle size={18} className="text-red-500" />
                        )}
                      </div>
                    </div>
                    {usernameCheckMessage && (
                      <p className={`text-xs mt-1 flex items-center gap-1 ${
                        usernameCheckStatus === 'available'
                          ? 'text-green-600 dark:text-green-400'
                          : usernameCheckStatus === 'taken' || usernameCheckStatus === 'invalid'
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-blue-600 dark:text-blue-400'
                      }`}>
                        {usernameCheckStatus === 'checking' && <Loader2 size={12} className="animate-spin" />}
                        {usernameCheckStatus === 'available' && <CheckCircle size={12} />}
                        {(usernameCheckStatus === 'taken' || usernameCheckStatus === 'invalid') && <AlertCircle size={12} />}
                        {usernameCheckMessage}
                      </p>
                    )}
                    {!usernameCheckMessage && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Only letters, numbers, hyphens, and underscores allowed
                      </p>
                    )}
                  </div>

                  <div>
                    <label className={manageLabelClass}>
                      Website URL <span className="text-gray-500 dark:text-gray-400 font-normal">(optional)</span>
                    </label>
                    <div className="relative">
                      <Globe size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="url"
                        value={settingsForm.url}
                        onChange={(e) => setSettingsForm({ ...settingsForm, url: e.target.value })}
                        placeholder="https://yourwebsite.com"
                        disabled={isSaving}
                        className={`${manageInputClass} pl-10`}
                      />
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                <div className="space-y-4">
                  <h4 className={`text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 ${postCardDividerClass} pb-2`}>
                    Social Links
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="relative">
                      <Globe size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500" />
                      <input
                        type="url"
                        value={settingsForm.socialLinks.website}
                        onChange={(e) => setSettingsForm({
                          ...settingsForm,
                          socialLinks: { ...settingsForm.socialLinks, website: e.target.value }
                        })}
                        placeholder="https://yourwebsite.com"
                        disabled={isSaving}
                        className={`${manageInputClass} pl-10`}
                      />
                    </div>
                    <div className="relative">
                      <Twitter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-900 dark:text-slate-100" />
                      <input
                        type="url"
                        value={settingsForm.socialLinks.twitter}
                        onChange={(e) => setSettingsForm({
                          ...settingsForm,
                          socialLinks: { ...settingsForm.socialLinks, twitter: e.target.value }
                        })}
                        placeholder="https://twitter.com/yourhandle or @handle"
                        disabled={isSaving}
                        className={`${manageInputClass} pl-10`}
                      />
                    </div>
                    <div className="relative">
                      <Linkedin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600" />
                      <input
                        type="url"
                        value={settingsForm.socialLinks.linkedin}
                        onChange={(e) => setSettingsForm({
                          ...settingsForm,
                          socialLinks: { ...settingsForm.socialLinks, linkedin: e.target.value }
                        })}
                        placeholder="https://linkedin.com/company/yourcompany"
                        disabled={isSaving}
                        className={`${manageInputClass} pl-10`}
                      />
                    </div>
                    <div className="relative">
                      <Github size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-900 dark:text-gray-100" />
                      <input
                        type="url"
                        value={settingsForm.socialLinks.github}
                        onChange={(e) => setSettingsForm({
                          ...settingsForm,
                          socialLinks: { ...settingsForm.socialLinks, github: e.target.value }
                        })}
                        placeholder="https://github.com/yourorg"
                        disabled={isSaving}
                        className={`${manageInputClass} pl-10`}
                      />
                    </div>
                    <div className="relative">
                      <Gamepad2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-600" />
                      <input
                        type="url"
                        value={settingsForm.socialLinks.discord}
                        onChange={(e) => setSettingsForm({
                          ...settingsForm,
                          socialLinks: { ...settingsForm.socialLinks, discord: e.target.value }
                        })}
                        placeholder="https://discord.gg/invitecode or invitecode"
                        disabled={isSaving}
                        className={`${manageInputClass} pl-10`}
                      />
                    </div>
                    <div className="relative">
                      <Send size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-500" />
                      <input
                        type="url"
                        value={settingsForm.socialLinks.telegram}
                        onChange={(e) => setSettingsForm({
                          ...settingsForm,
                          socialLinks: { ...settingsForm.socialLinks, telegram: e.target.value }
                        })}
                        placeholder="https://t.me/yourchannel or @channel"
                        disabled={isSaving}
                        className={`${manageInputClass} pl-10`}
                      />
                    </div>
                    <div className="relative">
                      <MessageCircle size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                      <input
                        type="text"
                        value={settingsForm.socialLinks.whatsapp}
                        onChange={(e) => setSettingsForm({
                          ...settingsForm,
                          socialLinks: { ...settingsForm.socialLinks, whatsapp: e.target.value }
                        })}
                        placeholder="+1234567890 or https://wa.me/1234567890"
                        disabled={isSaving}
                        className={`${manageInputClass} pl-10`}
                      />
                    </div>
                    <div className="relative">
                      <Facebook size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-700" />
                      <input
                        type="url"
                        value={settingsForm.socialLinks.facebook}
                        onChange={(e) => setSettingsForm({
                          ...settingsForm,
                          socialLinks: { ...settingsForm.socialLinks, facebook: e.target.value }
                        })}
                        placeholder="https://facebook.com/yourpage"
                        disabled={isSaving}
                        className={`${manageInputClass} pl-10`}
                      />
                    </div>
                    <div className="relative">
                      <Instagram size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-600" />
                      <input
                        type="url"
                        value={settingsForm.socialLinks.instagram}
                        onChange={(e) => setSettingsForm({
                          ...settingsForm,
                          socialLinks: { ...settingsForm.socialLinks, instagram: e.target.value }
                        })}
                        placeholder="https://instagram.com/yourhandle or @handle"
                        disabled={isSaving}
                        className={`${manageInputClass} pl-10`}
                      />
                    </div>
                    <div className="relative">
                      <Youtube size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-red-600" />
                      <input
                        type="url"
                        value={settingsForm.socialLinks.youtube}
                        onChange={(e) => setSettingsForm({
                          ...settingsForm,
                          socialLinks: { ...settingsForm.socialLinks, youtube: e.target.value }
                        })}
                        placeholder="https://youtube.com/@yourchannel"
                        disabled={isSaving}
                        className={`${manageInputClass} pl-10`}
                      />
                    </div>
                </div>
              </div>

                {/* Logo */}
              <div className="space-y-4">
                  <h4 className={`text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 ${postCardDividerClass} pb-2`}>
                    Logo
                  </h4>
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0">
                      <div className="h-24 w-24 overflow-hidden rounded-xl border-2 border-zinc-200/80 bg-zinc-100 ring-1 ring-zinc-200/80 dark:border-zinc-800 dark:bg-zinc-900 dark:ring-white/10 sm:h-28 sm:w-28">
                        {logoPreview ? (
                          <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                            <Camera size={32} className="text-gray-400" />
                </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <label className={manageLabelClass}>
                        Upload Logo
                      </label>
                      <div className="flex items-center gap-3">
                        <label className={`${manageGhostBtnClass} cursor-pointer`}>
                          <Upload size={16} strokeWidth={2} aria-hidden />
                          <span>Choose file</span>
                          <input
                            ref={logoInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleLogoSelect}
                            className="hidden"
                            disabled={isSaving}
                          />
                        </label>
                        {logoPreview && (
                          <button
                            type="button"
                            onClick={() => {
                              setLogoFile(null);
                              setLogoPreview(selectedPage?.logoUrl || null);
                              if (logoInputRef.current) logoInputRef.current.value = '';
                            }}
                            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                            disabled={isSaving}
                          >
                            Reset
                      </button>
                        )}
                    </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Recommended: Square image, at least 512x512px, max 5MB
                      </p>
                  </div>
              </div>
                </div>

                {/* Cover Image */}
                <div className="space-y-4">
                  <h4 className={`text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 ${postCardDividerClass} pb-2`}>
                    Cover Image
                  </h4>
                  <div className="group relative h-36 overflow-hidden rounded-xl border border-zinc-200/80 bg-zinc-100 dark:border-white/10 dark:bg-zinc-900/60 sm:h-40">
                    {coverPreview && (
                      <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                    )}
                    <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/35 transition-colors hover:bg-black/45">
                      <div className="text-center text-white">
                        <Camera size={22} className="mx-auto mb-1.5" strokeWidth={2} />
                        <span className="text-xs font-medium">
                          {coverPreview ? 'Change cover' : 'Upload cover'}
                        </span>
                        <p className="mt-0.5 text-[10px] opacity-90">1200×300 recommended</p>
                      </div>
                      <input
                        ref={coverInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleCoverSelect}
                        className="hidden"
                        disabled={isSaving}
                      />
                    </label>
                    {coverPreview && (
                      <button
                        type="button"
                        onClick={() => {
                          setCoverFile(null);
                          setCoverPreview(selectedPage?.coverImageUrl || null);
                          if (coverInputRef.current) coverInputRef.current.value = '';
                        }}
                        className="absolute right-2 top-2 rounded-lg border border-red-300/80 bg-red-600 p-1.5 text-white transition-colors hover:bg-red-700"
                        disabled={isSaving}
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Recommended: 1200x300px, max 5MB
                  </p>
                </div>

                {(selectedPage?.role === 'owner' || selectedPage?.role === 'Owner') && (
                  <div className={`space-y-3 pt-4 ${postCardDividerClass}`}>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
                      Danger zone
                    </h4>
                    <div className="flex flex-col gap-3 rounded-lg border border-red-200/80 bg-red-50/60 p-3 sm:flex-row sm:items-center sm:justify-between dark:border-red-500/25 dark:bg-red-950/25">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-red-900 dark:text-red-100">Delete page</p>
                        <p className="mt-0.5 text-[11px] text-red-700 dark:text-red-300/90">
                          Permanent. This cannot be undone.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleDeletePage}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-red-300 bg-red-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50 dark:border-red-500/40"
                        disabled={isSaving}
                      >
                        <Trash2 size={16} strokeWidth={2} aria-hidden />
                        Delete
                      </button>
                    </div>
                  </div>
                )}

                <div className={`flex flex-wrap items-center justify-end gap-2 pt-4 ${postCardDividerClass}`}>
                  <button
                    type="button"
                    onClick={handleBackToList}
                    className={manageGhostBtnClass}
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveSettings}
                    disabled={isSaving}
                    className={managePrimaryBtnClass}
                  >
                    {isSaving ? (
                      <>
                        <Loader size={16} className="animate-spin" aria-hidden />
                        Saving…
                      </>
                    ) : (
                      <>
                        <Save size={16} strokeWidth={2} aria-hidden />
                        Save changes
                      </>
                    )}
                  </button>
                </div>
              </div>
              </div>
            )}
        </div>
        {renderAddTeamMemberModal()}
        
        {/* Update Role Modal */}
        {showUpdateRoleModal && selectedMemberForAction && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowUpdateRoleModal(false);
                setSelectedMemberForAction(null);
                setMemberActionError(null);
              }
            }}
          >
            <GlassCard className="w-full max-w-md p-6 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Update Member Role</h3>
                <button
                  onClick={() => {
                    setShowUpdateRoleModal(false);
                    setSelectedMemberForAction(null);
                    setMemberActionError(null);
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X size={20} className="text-gray-600 dark:text-gray-400" />
                </button>
      </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <Avatar src={selectedMemberForAction.avatar || selectedMemberForAction.avatarUrl} alt={selectedMemberForAction.username || selectedMemberForAction.name} size="md" />
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{selectedMemberForAction.username || selectedMemberForAction.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Current role: {selectedMemberForAction.role || 'Member'}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    New Role
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as 'admin' | 'moderator')}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none text-base"
                    disabled={isProcessingMemberAction}
                  >
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {memberActionError && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">{memberActionError}</p>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleUpdateMemberRole}
                    disabled={isProcessingMemberAction}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isProcessingMemberAction ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Update Role
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowUpdateRoleModal(false);
                      setSelectedMemberForAction(null);
                      setMemberActionError(null);
                    }}
                    className="px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
                    disabled={isProcessingMemberAction}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {/* Remove Member Modal */}
        {showRemoveMemberModal && selectedMemberForAction && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowRemoveMemberModal(false);
                setSelectedMemberForAction(null);
                setMemberActionError(null);
              }
            }}
          >
            <GlassCard className="w-full max-w-md p-6 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Remove Team Member</h3>
                <button
                  onClick={() => {
                    setShowRemoveMemberModal(false);
                    setSelectedMemberForAction(null);
                    setMemberActionError(null);
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X size={20} className="text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <Avatar src={selectedMemberForAction.avatar || selectedMemberForAction.avatarUrl} alt={selectedMemberForAction.username || selectedMemberForAction.name} size="md" />
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{selectedMemberForAction.username || selectedMemberForAction.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Role: {selectedMemberForAction.role || 'Member'}</p>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    Are you sure you want to remove this member from the team? They will lose access to manage this page.
                  </p>
                </div>

                {memberActionError && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">{memberActionError}</p>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleRemoveMember}
                    disabled={isProcessingMemberAction}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:from-red-600 hover:to-rose-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isProcessingMemberAction ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Removing...
                      </>
                    ) : (
                      <>
                        <UserX size={18} />
                        Remove Member
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowRemoveMemberModal(false);
                      setSelectedMemberForAction(null);
                      setMemberActionError(null);
                    }}
                    className="px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
                    disabled={isProcessingMemberAction}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {/* Transfer Ownership Modal */}
        {showTransferOwnershipModal && selectedMemberForAction && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowTransferOwnershipModal(false);
                setSelectedMemberForAction(null);
                setMemberActionError(null);
              }
            }}
          >
            <GlassCard className="w-full max-w-md p-6 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Crown size={24} className="text-yellow-500" />
                  Transfer Ownership
                </h3>
                <button
                  onClick={() => {
                    setShowTransferOwnershipModal(false);
                    setSelectedMemberForAction(null);
                    setMemberActionError(null);
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X size={20} className="text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <Avatar src={selectedMemberForAction.avatar || selectedMemberForAction.avatarUrl} alt={selectedMemberForAction.username || selectedMemberForAction.name} size="md" />
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{selectedMemberForAction.username || selectedMemberForAction.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Current role: {selectedMemberForAction.role || 'Member'}</p>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-200 mb-2">⚠️ Important Warning</p>
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    You are about to transfer ownership of this page to <strong>{selectedMemberForAction.username || selectedMemberForAction.name}</strong>. 
                    After this action:
                  </p>
                  <ul className="list-disc list-inside text-sm text-yellow-800 dark:text-yellow-300 mt-2 space-y-1">
                    <li>They will become the new owner</li>
                    <li>You will become an admin member</li>
                    <li>You will lose the ability to transfer ownership again</li>
                    <li>This action cannot be undone</li>
                  </ul>
                </div>

                {memberActionError && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">{memberActionError}</p>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleTransferOwnership}
                    disabled={isProcessingMemberAction}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-xl hover:from-yellow-600 hover:to-amber-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isProcessingMemberAction ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Transferring...
                      </>
                    ) : (
                      <>
                        <ArrowRightLeft size={18} />
                        Transfer Ownership
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowTransferOwnershipModal(false);
                      setSelectedMemberForAction(null);
                      setMemberActionError(null);
                    }}
                    className="px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
                    disabled={isProcessingMemberAction}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    );
  }
}
