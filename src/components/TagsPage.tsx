import {
  Hash,
  TrendingUp,
  UserPlus,
  UserCheck,
  Loader2,
  Edit,
  Upload,
  X,
  Save,
  Shield,
  Star,
  LayoutGrid,
  List,
} from 'lucide-react';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { tagsService, Tag as APITag, UpdateTagParams } from '../services/api/tags.service';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { canManageTagRestrictions } from '../utils/tagAccess';
import type { TabPillItem } from './TabPills';
import {
  ListingPageHeader,
  ListingFilterToolbar,
  ListingEmptyState,
  ListingErrorState,
  ListingSectionTitle,
  formatListingLabel,
} from './listingPageChrome';
import {
  asidePanelClass,
  postCardSurfaceClass,
  postCardDividerClass,
} from './postCardSurface';

interface TagsPageProps {
  onTagClick?: (tag: string) => void;
  onBack?: () => void;
}

interface TagRow {
  name: string;
  slug: string;
  category: string;
  posts: number;
  followers: number;
  trending?: boolean;
  featured?: boolean;
  logoUrl?: string;
  restrictedToRoles?: string[];
}

type ViewMode = 'grid' | 'list';

const featuredPillClass =
  'inline-flex items-center gap-0.5 rounded-md border border-amber-200/80 bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-800 dark:border-amber-500/30 dark:bg-amber-950/50 dark:text-amber-200';

const trendingPillClass =
  'inline-flex items-center gap-0.5 rounded-md border border-orange-200/80 bg-orange-50 px-1.5 py-0.5 text-[10px] font-medium text-orange-800 dark:border-orange-500/30 dark:bg-orange-950/50 dark:text-orange-200';

const tagGridClass =
  'grid items-stretch gap-3 sm:gap-4 [grid-template-columns:repeat(auto-fill,minmax(min(100%,14rem),1fr))]';

const iconBtnClass =
  'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-200/80 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:border-white/10 dark:text-zinc-400 dark:hover:bg-white/[0.06] dark:hover:text-zinc-100';

const iconBtnActiveClass =
  'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900';

function TagLogo({ tag }: { tag: TagRow }) {
  if (tag.logoUrl) {
    return (
      <img
        src={tag.logoUrl}
        alt=""
        className="h-10 w-10 shrink-0 rounded-lg border border-zinc-200/80 object-cover dark:border-white/10"
      />
    );
  }
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-200/80 bg-zinc-100 dark:border-white/10 dark:bg-white/[0.04]">
      <Hash size={16} strokeWidth={2} className="text-zinc-500 dark:text-zinc-400" />
    </span>
  );
}

function TagCard({
  tag,
  apiTag,
  isFollowing,
  isAdmin,
  onView,
  onFollow,
  onEdit,
}: {
  tag: TagRow;
  apiTag?: APITag;
  isFollowing: boolean;
  isAdmin: boolean;
  onView: () => void;
  onFollow: () => void;
  onEdit: () => void;
}) {
  return (
    <article
      role="link"
      tabIndex={0}
      onClick={onView}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onView();
        }
      }}
      className={`${postCardSurfaceClass} h-full`}
    >
      <div className="flex h-full items-center gap-3 p-3 sm:p-3.5">
      <TagLogo tag={tag} />
      <div className="min-w-0 flex-1 text-left">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          <h3 className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {tag.name}
          </h3>
          {tag.featured && (
            <span className={featuredPillClass}>
              <Star size={9} className="shrink-0" aria-hidden />
              Featured
            </span>
          )}
          {tag.trending && (
            <span className={trendingPillClass}>
              <TrendingUp size={9} className="shrink-0" aria-hidden />
              Trending
            </span>
          )}
        </div>
        <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
          <span className="capitalize">{formatListingLabel(tag.category)}</span>
          <span className="mx-1 text-zinc-300 dark:text-zinc-600" aria-hidden>
            ·
          </span>
          <span className="tabular-nums">{tag.posts.toLocaleString()} posts</span>
          <span className="mx-1 text-zinc-300 dark:text-zinc-600" aria-hidden>
            ·
          </span>
          <span className="tabular-nums">{tag.followers.toLocaleString()} followers</span>
        </p>
        {tag.restrictedToRoles && tag.restrictedToRoles.length > 0 && (
          <p className="mt-1 flex items-center gap-1 text-[10px] text-zinc-400 dark:text-zinc-500">
            <Shield size={10} strokeWidth={2} className="shrink-0" aria-hidden />
            <span className="truncate">{tag.restrictedToRoles.map(formatListingLabel).join(', ')}</span>
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1" onClick={(e) => e.stopPropagation()}>
        {isAdmin && apiTag && (
          <button type="button" onClick={onEdit} className={iconBtnClass} title="Edit tag" aria-label="Edit tag">
            <Edit size={14} strokeWidth={2} />
          </button>
        )}
        <button
          type="button"
          onClick={onFollow}
          className={isFollowing ? iconBtnActiveClass : iconBtnClass}
          aria-label={isFollowing ? 'Unfollow tag' : 'Follow tag'}
        >
          {isFollowing ? <UserCheck size={14} strokeWidth={2} /> : <UserPlus size={14} strokeWidth={2} />}
        </button>
      </div>
      </div>
    </article>
  );
}

function TagsPageSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className={`${asidePanelClass} h-24`} />
      <div className={`${asidePanelClass} h-28`} />
      <div className={tagGridClass}>
        {[...Array(8)].map((_, i) => (
          <div key={i} className={`${asidePanelClass} h-24`} />
        ))}
      </div>
    </div>
  );
}

export function TagsPage({ onTagClick, onBack }: TagsPageProps) {
  const navigate = useNavigate();
  const { user, isAdmin: checkIsAdmin } = useAuth();
  const canManageTags = checkIsAdmin() || canManageTagRestrictions(user);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [followedTags, setFollowedTags] = useState<Set<string>>(new Set());
  const [tags, setTags] = useState<APITag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTag, setEditingTag] = useState<APITag | null>(null);
  const [editForm, setEditForm] = useState<UpdateTagParams>({});
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const logoInputRef = useRef<HTMLInputElement>(null);
  const isSuperAdmin = user?.role === 'super_admin';

  const handleTagClick = useCallback(
    (tagSlug: string, tagName?: string) => {
      if (onTagClick) {
        onTagClick(tagName || tagSlug);
      } else {
        navigate(`/?tags=${encodeURIComponent(tagSlug)}`);
      }
    },
    [onTagClick, navigate]
  );

  const fetchTags = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: Record<string, unknown> = {
        includeRestricted: true,
        limit: 500,
      };
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (selectedFilter === 'trending') {
        params.trending = true;
      } else if (selectedFilter !== 'all') {
        params.category = selectedFilter;
      }

      const response = await tagsService.getTags(params);
      const tagsArray = Array.isArray(response)
        ? response
        : response?.tags || response?.data || [];
      const list = Array.isArray(tagsArray) ? tagsArray : [];
      setTags(list);

      if (user) {
        setFollowedTags(
          new Set(
            list.filter((t: APITag) => t.isFollowing === true).map((t: APITag) => t.name)
          )
        );
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load tags';
      setError(message);
      console.error('Error fetching tags:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedFilter, user]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const allTags: TagRow[] = useMemo(
    () =>
      (Array.isArray(tags) ? tags : []).map((t) => ({
        name: t.name,
        slug: t.slug || t.name.toLowerCase().replace(/\s+/g, '-'),
        category: t.category || 'general',
        posts: t.usageCount || 0,
        followers: Number(t.followersCount ?? t.followers_count ?? 0) || 0,
        trending: t.trending,
        featured: t.featured,
        logoUrl: t.logoUrl,
        restrictedToRoles: t.restrictedToRoles ?? (t as APITag & { restricted_to_roles?: string[] }).restricted_to_roles,
      })),
    [tags]
  );

  const categoryFilters = useMemo(() => {
    const cats = Array.from(new Set(allTags.map((t) => t.category).filter(Boolean)));
    return ['all', 'trending', ...cats.sort()];
  }, [allTags]);

  const filterTabs: TabPillItem<string>[] = useMemo(
    () =>
      categoryFilters.map((cat) => ({
        id: cat,
        label:
          cat === 'all' ? 'All' : cat === 'trending' ? 'Trending' : formatListingLabel(cat),
      })),
    [categoryFilters]
  );

  const sortTags = (list: TagRow[]) =>
    [...list].sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      if (a.trending !== b.trending) return a.trending ? -1 : 1;
      return b.posts - a.posts;
    });

  const showGroupedSections =
    selectedFilter === 'all' && !searchQuery.trim();

  const trendingTags = useMemo(
    () => sortTags(allTags.filter((t) => t.trending)),
    [allTags]
  );
  const featuredTags = useMemo(
    () => sortTags(allTags.filter((t) => t.featured)),
    [allTags]
  );
  const regularTags = useMemo(
    () => sortTags(allTags.filter((t) => !t.trending && !t.featured)),
    [allTags]
  );

  const flatTags = useMemo(() => sortTags(allTags), [allTags]);

  const adjustTagFollowers = (tagName: string, delta: number) => {
    setTags((prev) =>
      prev.map((t) =>
        t.name === tagName
          ? {
              ...t,
              followersCount: Math.max(
                0,
                Number(t.followersCount ?? t.followers_count ?? 0) + delta
              ),
            }
          : t
      )
    );
  };

  const handleFollow = async (tagSlug: string, tagName: string) => {
    if (followedTags.has(tagName)) {
      try {
        await tagsService.unfollowTag(tagSlug);
        setFollowedTags((prev) => {
          const next = new Set(prev);
          next.delete(tagName);
          return next;
        });
        adjustTagFollowers(tagName, -1);
      } catch (err) {
        console.error('Failed to unfollow tag:', err);
      }
    } else {
      try {
        await tagsService.followTag(tagSlug);
        setFollowedTags((prev) => new Set(prev).add(tagName));
        adjustTagFollowers(tagName, 1);
      } catch (err) {
        console.error('Failed to follow tag:', err);
      }
    }
  };

  const handleEditTag = (tag: APITag) => {
    setEditingTag(tag);
    setEditForm({
      name: tag.name,
      category: tag.category || '',
      logoUrl: tag.logoUrl || '',
      featured: tag.featured || false,
      restrictedToRoles: tag.restrictedToRoles || [],
    });
    setLogoPreview(tag.logoUrl || null);
    setLogoFile(null);
  };

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveTag = async () => {
    if (!editingTag) return;

    try {
      setIsSaving(true);
      let logoUrl = editForm.logoUrl;

      if (logoFile) {
        logoUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(logoFile);
        });
      }

      await tagsService.updateTag(editingTag.slug, { ...editForm, logoUrl });
      setEditingTag(null);
      await fetchTags();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update tag';
      alert(message);
    } finally {
      setIsSaving(false);
    }
  };

  const renderTagList = (list: TagRow[]) => {
    const layoutClass =
      viewMode === 'list'
        ? 'grid items-stretch gap-2 [grid-template-columns:repeat(auto-fill,minmax(min(100%,20rem),1fr))]'
        : tagGridClass;

    return (
      <div className={layoutClass}>
        {list.map((tag) => {
          const apiTag = tags.find((t) => t.slug === tag.slug || t.name === tag.name);
          return (
            <TagCard
              key={tag.slug}
              tag={tag}
              apiTag={apiTag}
              isFollowing={followedTags.has(tag.name)}
              isAdmin={canManageTags}
              onView={() => handleTagClick(tag.slug, tag.name)}
              onFollow={() => handleFollow(tag.slug, tag.name)}
              onEdit={() => apiTag && handleEditTag(apiTag)}
            />
          );
        })}
      </div>
    );
  };

  if (loading && tags.length === 0) {
    return <TagsPageSkeleton />;
  }

  return (
    <div className="space-y-4 pb-8 sm:space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <ListingPageHeader
          icon={Hash}
          title="Tags"
          subtitle="Discover topics, follow communities, and filter the feed by tag."
          onBack={onBack}
          count={allTags.length}
          countLabel={allTags.length === 1 ? 'tag' : 'tags'}
        />
        <div
          className={`${asidePanelClass} flex shrink-0 items-center gap-1 self-start p-1 sm:mt-1`}
          role="group"
          aria-label="View mode"
        >
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={viewMode === 'list' ? iconBtnActiveClass : iconBtnClass}
            aria-label="List view"
            aria-pressed={viewMode === 'list'}
          >
            <List size={14} strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={viewMode === 'grid' ? iconBtnActiveClass : iconBtnClass}
            aria-label="Grid view"
            aria-pressed={viewMode === 'grid'}
          >
            <LayoutGrid size={14} strokeWidth={2} />
          </button>
        </div>
      </div>

      <ListingFilterToolbar
        searchId="tags-search"
        searchPlaceholder="Search tags…"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterTabs={filterTabs}
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
        filterAriaLabel="Filter tags"
        resultCount={flatTags.length}
        loading={loading}
        loadingLabel="Loading tags…"
        entityPlural={flatTags.length === 1 ? 'tag' : 'tags'}
      />

      {error && (
        <ListingErrorState
          icon={Hash}
          title="Failed to load tags"
          message={error}
          onRetry={fetchTags}
        />
      )}

      {!error && (
        <>
          {loading && tags.length > 0 && (
            <div className="flex items-center justify-center gap-2 py-6 text-sm text-zinc-500 dark:text-zinc-400">
              <Loader2 size={16} className="animate-spin" aria-hidden />
              Updating…
            </div>
          )}

          {!loading && flatTags.length === 0 && (
            <ListingEmptyState
              icon={Hash}
              message={
                searchQuery.trim() || selectedFilter !== 'all'
                  ? 'No tags match your search or filter.'
                  : 'No tags available yet.'
              }
            />
          )}

          {!loading && flatTags.length > 0 && showGroupedSections ? (
            <div className="space-y-6">
              {featuredTags.length > 0 && (
                <section>
                  <ListingSectionTitle icon={Star}>Featured</ListingSectionTitle>
                  {renderTagList(featuredTags)}
                </section>
              )}
              {trendingTags.length > 0 && (
                <section>
                  <ListingSectionTitle icon={TrendingUp}>Trending</ListingSectionTitle>
                  {renderTagList(trendingTags)}
                </section>
              )}
              {regularTags.length > 0 && (
                <section>
                  {(featuredTags.length > 0 || trendingTags.length > 0) && (
                    <ListingSectionTitle icon={Hash}>All tags</ListingSectionTitle>
                  )}
                  {renderTagList(regularTags)}
                </section>
              )}
            </div>
          ) : null}

          {!loading && flatTags.length > 0 && !showGroupedSections && renderTagList(flatTags)}
        </>
      )}

      {editingTag && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div
            className={`${asidePanelClass} max-h-[90vh] w-full max-w-lg overflow-y-auto p-4 sm:p-5`}
            role="dialog"
            aria-labelledby="edit-tag-title"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2
                id="edit-tag-title"
                className="text-base font-semibold text-zinc-900 dark:text-zinc-100"
              >
                Edit tag
                <span className="text-zinc-500 dark:text-zinc-400"> · {editingTag.name}</span>
              </h2>
              <button
                type="button"
                onClick={() => setEditingTag(null)}
                className={iconBtnClass}
                aria-label="Close"
              >
                <X size={16} strokeWidth={2} />
              </button>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                  Name
                </span>
                <input
                  type="text"
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="h-9 w-full rounded-lg border border-zinc-200/80 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-white/10 dark:bg-[#0a1020]/90 dark:text-zinc-100"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                  Category
                </span>
                <input
                  type="text"
                  value={editForm.category || ''}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="h-9 w-full rounded-lg border border-zinc-200/80 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-white/10 dark:bg-[#0a1020]/90 dark:text-zinc-100"
                />
              </label>

              {canManageTags && (
                <div className="space-y-2">
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                    Restricted to roles
                  </span>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Only admins, verified users, or verified pages can use restricted tags.
                  </p>
                  {(['verified_user', 'verified_page'] as const).map((role) => (
                    <label
                      key={role}
                      className="flex items-center gap-2 rounded-lg border border-zinc-200/80 p-3 dark:border-white/10"
                    >
                      <input
                        type="checkbox"
                        checked={(editForm.restrictedToRoles || []).includes(role)}
                        onChange={(e) => {
                          const roles = editForm.restrictedToRoles || [];
                          setEditForm({
                            ...editForm,
                            restrictedToRoles: e.target.checked
                              ? [...roles, role]
                              : roles.filter((r) => r !== role),
                          });
                        }}
                        className="rounded border-zinc-300"
                      />
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">
                        {formatListingLabel(role)}
                      </span>
                    </label>
                  ))}
                </div>
              )}

              {isSuperAdmin && (
                <div>
                  <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                    Logo
                  </span>
                  <div className="flex flex-wrap items-center gap-3">
                    {logoPreview && (
                      <img
                        src={logoPreview}
                        alt=""
                        className="h-14 w-14 rounded-lg border border-zinc-200/80 object-cover dark:border-white/10"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-zinc-200/80 bg-zinc-50 px-3 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-300 dark:hover:bg-white/[0.08]"
                    >
                      <Upload size={14} strokeWidth={2} />
                      {logoPreview ? 'Change' : 'Upload'}
                    </button>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoSelect}
                      className="hidden"
                    />
                  </div>
                </div>
              )}

              {isSuperAdmin && (
                <label className={`flex items-center gap-2 rounded-lg border border-zinc-200/80 p-3 dark:border-white/10 ${postCardDividerClass}`}>
                  <input
                    type="checkbox"
                    checked={editForm.featured || false}
                    onChange={(e) => setEditForm({ ...editForm, featured: e.target.checked })}
                    className="rounded border-zinc-300"
                  />
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">Featured in sidebar</span>
                </label>
              )}

              <div className={`flex gap-2 pt-2 ${postCardDividerClass}`}>
                <button
                  type="button"
                  onClick={handleSaveTag}
                  disabled={isSaving}
                  className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-zinc-900 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                >
                  {isSaving ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Save size={14} strokeWidth={2} />
                  )}
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditingTag(null)}
                  disabled={isSaving}
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200/80 px-4 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/[0.06]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
