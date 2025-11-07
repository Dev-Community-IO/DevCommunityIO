import { useState, useEffect, useRef, useMemo } from 'react';
import { Plus, Users, Settings, BarChart3, UserPlus, Crown, Shield, ArrowLeft, Layout, FileText, Building2, Sparkles, Hash, X, ExternalLink, Upload, Camera, Save, Loader, AlertCircle, CheckCircle, Trash2, Search, Loader2 } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { VerifiedBadge } from './VerifiedBadge';
import { CompactPostCard } from './CompactPostCard';
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
    const id = page?.id
    const slug = page?.slug

    if (id && seenIds.has(id)) {
      return false
    }

    if (!id && slug && seenSlugs.has(slug)) {
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

export function ProfilePages({ username }: ProfilePagesProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'posts' | 'overview' | 'members' | 'settings'>('dashboard');
  const [userPages, setUserPages] = useState<any[]>([]);
  const [pageMembers, setPageMembers] = useState<any[]>([]);
  const [pagePosts, setPagePosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loading, setLoading] = useState(true);
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

  const ownerKeySeed = useMemo(() => Math.random().toString(36).slice(2), []);
  const memberKeySeed = useMemo(() => Math.random().toString(36).slice(2), []);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    name: '',
    description: '',
    category: '',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

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
        setUserPages(normalizePages(pagesWithRoles));
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

  // Initialize settings form when page is selected
  useEffect(() => {
    if (selectedPage) {
      setSettingsForm({
        name: selectedPage.name || '',
        description: selectedPage.description || '',
        category: selectedPage.category || '',
      });
      setLogoPreview(selectedPage.logoUrl || null);
      setCoverPreview(selectedPage.coverImageUrl || null);
      setLogoFile(null);
      setCoverFile(null);
      setSaveError(null);
      setSaveSuccess(false);
    }
  }, [selectedPage]);

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
    if (!selectedPage) return;

    if (!settingsForm.name.trim()) {
      setSaveError('Page name is required');
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      // Convert logo to base64 if a new file was selected
      let logoUrl = selectedPage.logoUrl || undefined;
      if (logoFile) {
        logoUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = reader.result as string;
            resolve(base64String);
          };
          reader.onerror = reject;
          reader.readAsDataURL(logoFile);
        });
      }

      // Convert cover to base64 if a new file was selected
      let coverImageUrl = selectedPage.coverImageUrl || undefined;
      if (coverFile) {
        coverImageUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = reader.result as string;
            resolve(base64String);
          };
          reader.onerror = reject;
          reader.readAsDataURL(coverFile);
        });
      }

      // Update page
      await pagesService.updatePage(selectedPage.id, {
        name: settingsForm.name.trim(),
        description: settingsForm.description.trim() || undefined,
        category: settingsForm.category || undefined,
        logoUrl: logoUrl,
        coverImageUrl: coverImageUrl,
      });

      setSaveSuccess(true);
      
      // Refresh pages list
      const pages = await usersService.getUserPages(username);
      const pagesWithRoles = Array.isArray(pages) ? pages : [];
      const normalizedPages = normalizePages(pagesWithRoles);
      setUserPages(normalizedPages);
      
      // Update selected page
      const updatedPage = normalizedPages.find((p: any) => p.id === selectedPage.id);
      if (updatedPage) {
        setSettingsForm({
          name: updatedPage.name || '',
          description: updatedPage.description || '',
          category: updatedPage.category || '',
        });
        setLogoPreview(updatedPage.logoUrl || null);
        setCoverPreview(updatedPage.coverImageUrl || null);
        setLogoFile(null);
        setCoverFile(null);
      }

      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setSaveError(err?.response?.data?.message || err?.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
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
      <div className="space-y-8 animate-fade-in">
        <CreatePageModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handlePageCreated}
        />
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 dark:from-white dark:via-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
              {isOwnProfile ? 'Your Pages' : 'Pages'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {isOwnProfile 
                ? 'Create and manage your community pages' 
                : `Pages ${username} owns or moderates`}
            </p>
          </div>
          {isOwnProfile && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="group flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:via-blue-700 hover:to-cyan-600 transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 active:scale-100"
            >
              <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
              <span>Create Page</span>
            </button>
          )}
        </div>

        {/* Filters */}
        {isOwnProfile && userPages.length > 0 && (
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
            {(['all', 'owner', 'admin', 'member'] as FilterType[]).map((filterType) => {
              const icons = {
                all: Sparkles,
                owner: Crown,
                admin: Shield,
                member: Users
              };
              const Icon = icons[filterType];
              const isActive = filter === filterType;
              const count = filterType === 'all' ? userPages.length : filteredPages.filter(p => {
                const role = p.role?.toLowerCase();
                if (filterType === 'owner') return role === 'owner';
                if (filterType === 'admin') return role === 'admin' || role === 'Admin';
                if (filterType === 'member') return !canManage(p);
                return true;
              }).length;
              
              return (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType)}
                  className={`group flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30 scale-105'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:scale-105'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'} />
                  <span className="capitalize font-semibold">{filterType}</span>
                  <Badge variant="default" className={`text-xs px-2 py-0.5 font-bold ${
                    isActive ? 'bg-white/25 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    {count}
                  </Badge>
                </button>
              );
            })}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <PageCardSkeletonList count={4} />
        ) : filteredPages.length === 0 ? (
          /* Empty State */
          <GlassCard className="p-16 text-center border-2 border-dashed border-gray-200 dark:border-gray-700">
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-blue-900/30 dark:via-purple-900/30 dark:to-pink-900/30 flex items-center justify-center shadow-lg">
              <Building2 size={48} className="text-blue-500 dark:text-blue-400" />
            </div>
            <h3 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white">
              {isOwnProfile ? 'No Pages Yet' : 'No Pages Found'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-lg mx-auto text-lg leading-relaxed">
              {isOwnProfile
                ? "Create your first community page to start building and engaging with your audience. Share your ideas, connect with others, and grow your community."
                : `This user hasn't created or joined any community pages yet.`}
            </p>
            {isOwnProfile && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="group px-8 py-4 bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:via-blue-700 hover:to-cyan-600 transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 active:scale-100"
              >
                <span className="flex items-center gap-2">
                  <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                  Create Your First Page
                </span>
              </button>
            )}
          </GlassCard>
        ) : (
          /* Pages Grid */
          <div className="space-y-10">
            {/* Pages You Manage */}
            {ownerPages.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500 shadow-xl shadow-blue-500/40">
                      <Crown size={20} className="text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                      Pages You Manage
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Your communities and pages you administer
                    </p>
                  </div>
                  <Badge variant="default" className="px-4 py-1.5 text-sm font-bold bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/40 dark:to-cyan-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    {ownerPages.length}
                  </Badge>
                </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ownerPages.map(page => (
            <div
              key={`owner-${ownerKeySeed}-${page.id}-${page.slug || ''}`}
              className="group relative bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border border-gray-200/60 dark:border-gray-700/60 hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1 cursor-pointer"
            >
              {/* Animated gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-cyan-50 to-purple-50 dark:from-blue-950/20 dark:via-cyan-950/20 dark:to-purple-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Cover Image Banner */}
              <div className="relative h-32 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 overflow-hidden">
                {page.coverImageUrl ? (
                  <img 
                    src={page.coverImageUrl} 
                    alt={`${page.name} cover`} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500"></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
                
                {/* Role Badge - Enhanced */}
                <div className="absolute top-3 right-3 z-10">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 border border-white/50 dark:border-gray-700/50 shadow-lg">
                    {page.role === 'owner' || page.role === 'Owner' ? (
                      <>
                        <Crown size={12} className="text-yellow-500" />
                        <span className="text-xs font-bold text-gray-900 dark:text-white">Owner</span>
                      </>
                    ) : (
                      <>
                        <Shield size={12} className="text-blue-500" />
                        <span className="text-xs font-bold text-gray-900 dark:text-white">Admin</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Logo - Enhanced with glow effect */}
                <div className="absolute -bottom-8 left-5 z-20">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/30 dark:bg-blue-400/30 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                    <div className="relative w-20 h-20 rounded-3xl overflow-hidden border-4 border-white dark:border-gray-900 bg-white dark:bg-gray-800 shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                      <img 
                        src={page.logoUrl || DEFAULT_PAGE_LOGO} 
                        alt={`${page.name} logo`} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = DEFAULT_PAGE_LOGO;
                        }}
                      />
                      {page.isVerified && (
                        <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-900 rounded-full p-1 shadow-xl border-2 border-white dark:border-gray-900">
                          <VerifiedBadge size={14} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6 pt-16 space-y-4 relative z-10">
                {/* Page Header */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/pages/${page.slug}`);
                      }}
                      className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors flex-1 line-clamp-1 group-hover:underline"
                    >
                      {page.name}
                    </h3>
                    {page.isVerified && (
                      <VerifiedBadge size={18} />
                    )}
                  </div>
                  {page.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                      {page.description}
                    </p>
                  )}
                </div>

                {/* Page Stats - Enhanced */}
                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex flex-col items-center p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                    <Users size={16} className="text-blue-600 dark:text-blue-400 mb-1" />
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {page.memberCount || page.members || 0}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Members</span>
                  </div>
                  <div className="flex flex-col items-center p-2 rounded-xl bg-purple-50 dark:bg-purple-900/20 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 transition-colors">
                    <FileText size={16} className="text-purple-600 dark:text-purple-400 mb-1" />
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {page.postCount || page.posts || 0}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Posts</span>
                  </div>
                  {page.category ? (
                    <div className="flex flex-col items-center p-2 rounded-xl bg-green-50 dark:bg-green-900/20 group-hover:bg-green-100 dark:group-hover:bg-green-900/30 transition-colors">
                      <Hash size={16} className="text-green-600 dark:text-green-400 mb-1" />
                      <span className="text-xs font-bold text-gray-900 dark:text-white truncate w-full text-center">
                        {page.category}
                      </span>
                    </div>
                  ) : (
                    <div></div>
                  )}
                </div>

                {/* Action Buttons - Enhanced */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/pages/${page.slug}`);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 transition-all text-sm font-semibold shadow-lg hover:shadow-xl hover:scale-105 active:scale-100"
                  >
                    <Layout size={18} />
                    View Page
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleManagePage(page.id);
                    }}
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all text-sm font-semibold hover:scale-105 active:scale-100 border border-gray-200 dark:border-gray-700"
                    title="Manage Page"
                  >
                    <Settings size={18} />
                  </button>
                </div>
              </div>
            </div>
            ))}
                </div>
              </div>
            )}

            {/* Pages You're a Member Of */}
            {memberPages.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 shadow-xl shadow-purple-500/40">
                      <Users size={20} className="text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-pink-400 rounded-full animate-pulse"></div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                      Pages You're a Member Of
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Communities you follow and participate in
                    </p>
                  </div>
                  <Badge variant="default" className="px-4 py-1.5 text-sm font-bold bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    {memberPages.length}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {memberPages.map(page => (
                    <div
                      key={`member-${memberKeySeed}-${page.id}-${page.slug || ''}`}
                      className="group relative bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200/60 dark:border-gray-700/60 hover:border-purple-400 dark:hover:border-purple-600 transition-all duration-500 hover:shadow-xl hover:shadow-purple-500/20 hover:-translate-y-1 cursor-pointer"
                      onClick={() => navigate(`/pages/${page.slug}`)}
                    >
                      {/* Animated gradient background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-rose-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      {/* Cover Image Banner */}
                      <div className="relative h-24 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 overflow-hidden">
                        {page.coverImageUrl ? (
                          <img 
                            src={page.coverImageUrl} 
                            alt={`${page.name} cover`} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500"></div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent"></div>
                      </div>
                      
                      {/* Logo - Compact but elegant */}
                      <div className="absolute -bottom-6 left-4 z-20">
                        <div className="relative">
                          <div className="absolute inset-0 bg-purple-500/30 dark:bg-purple-400/30 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
                          <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-white dark:border-gray-900 bg-white dark:bg-gray-800 shadow-xl group-hover:scale-110 group-hover:rotate-2 transition-all duration-500">
                            <img 
                              src={page.logoUrl || DEFAULT_PAGE_LOGO} 
                              alt={`${page.name} logo`} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = DEFAULT_PAGE_LOGO;
                              }}
                            />
                            {page.isVerified && (
                              <div className="absolute -bottom-0.5 -right-0.5 bg-white dark:bg-gray-900 rounded-full p-0.5 shadow-lg border-2 border-white dark:border-gray-900">
                                <VerifiedBadge size={12} />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 pt-12 space-y-3 relative z-10">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-base font-bold text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex-1 line-clamp-1 group-hover:underline">
                            {page.name}
                          </h3>
                          {page.isVerified && (
                            <VerifiedBadge size={16} />
                          )}
                        </div>
                        
                        {page.description && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                            {page.description}
                          </p>
                        )}

                        {/* Stats - Compact inline */}
                        <div className="flex items-center gap-4 pt-2 border-t border-gray-100 dark:border-gray-800">
                          <div className="flex items-center gap-1.5">
                            <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                              <Users size={12} className="text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="text-sm font-bold text-gray-900 dark:text-white">
                              {page.memberCount || page.members || 0}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                              <FileText size={12} className="text-purple-600 dark:text-purple-400" />
                            </div>
                            <span className="text-sm font-bold text-gray-900 dark:text-white">
                              {page.postCount || page.posts || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBackToList}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium transition-all"
          >
            <ArrowLeft size={18} />
            Back to Pages
          </button>
        </div>

        {/* Hero Section */}
        <div className="relative">
          {/* Cover Image */}
          <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
            {selectedPage.coverImageUrl && (
              <img 
                src={selectedPage.coverImageUrl} 
                alt={`${selectedPage.name} cover`} 
                className="w-full h-full object-cover" 
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
          </div>

          {/* Profile Card */}
          <div className="relative px-4 -mt-16 z-10">
            <GlassCard className="p-6 shadow-2xl">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Logo */}
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden border-4 border-white dark:border-gray-900 bg-white dark:bg-gray-800 shadow-xl relative">
                  <img 
                    src={selectedPage.logoUrl || DEFAULT_PAGE_LOGO} 
                    alt={`${selectedPage.name} logo`} 
                    className="w-full h-full object-cover" 
                  />
                  {selectedPage.isVerified && (
                    <div className="absolute bottom-0 right-0 bg-white dark:bg-gray-900 rounded-full p-1 shadow-lg border-2 border-white dark:border-gray-900">
                      <VerifiedBadge size={18} />
                    </div>
                  )}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                          {selectedPage.name}
                        </h2>
                        {selectedPage.isVerified && (
                          <VerifiedBadge size={20} />
                        )}
                        <Badge variant="gradient" className="flex items-center gap-1">
                          {selectedPage.role === 'owner' || selectedPage.role === 'Owner' ? (
                            <>
                              <Crown size={12} />
                              <span>Owner</span>
                            </>
                          ) : (
                            <>
                              <Shield size={12} />
                              <span>Admin</span>
                            </>
                          )}
                    </Badge>
                  </div>
                      {selectedPage.description && (
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                          {selectedPage.description}
                        </p>
                      )}
                </div>
              </div>

              {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="text-center p-3 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800">
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {selectedPage.memberCount || selectedPage.members || 0}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Members</p>
                </div>
                    <div className="text-center p-3 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800">
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {selectedPage.postCount || selectedPage.posts || 0}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Posts</p>
                </div>
                    <div className="text-center p-3 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800">
                      <p className="text-xl font-bold text-green-600 dark:text-green-400">
                        {selectedPage.category || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Category</p>
              </div>
            </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Tabs */}
        <div className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 rounded-t-2xl">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide px-2">
            {[
              { id: 'overview', label: 'Overview', icon: Layout },
              { id: 'posts', label: 'Posts', icon: FileText },
              { id: 'members', label: 'Members', icon: Users },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
            <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-5 py-4 font-semibold text-sm whitespace-nowrap transition-all border-b-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
            </button>
              );
            })}
          </div>
        </div>

            {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Page Statistics</h3>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                    <BarChart3 size={24} className="text-white" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Members</span>
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedPage.memberCount || selectedPage.members || 0}
                    </span>
                    </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Posts</span>
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedPage.postCount || selectedPage.posts || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Category</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {selectedPage.category || 'N/A'}
                    </span>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                <div className="space-y-2">
            <button
                    onClick={() => navigate(`/pages/${selectedPage.slug}`)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all text-left"
                  >
                    <ExternalLink size={18} />
                    <span className="font-medium">View Public Page</span>
            </button>
            <button
              onClick={() => setActiveTab('members')}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all text-left"
                  >
                    <UserPlus size={18} />
                    <span className="font-medium">Manage Members</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all text-left"
                  >
                    <Settings size={18} />
                    <span className="font-medium">Edit Settings</span>
            </button>
          </div>
              </GlassCard>
        </div>
            )}

            {activeTab === 'posts' && (
              <div className="space-y-6">
                {loadingPosts ? (
                  <PostSkeletonList count={6} />
                ) : pagePosts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pagePosts.map((post) => (
                      <CompactPostCard
                        key={post.id}
                        post={post}
                        onClick={() => navigate(`/posts/${post.id}`)}
                        onLoginRequired={() => {
                          // Handle login requirement if needed
                          navigate('/login');
                        }}
                      />
                    ))}
                    </div>
                ) : (
                  <GlassCard className="p-12 text-center">
                    <FileText size={48} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Posts Yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      This page doesn't have any posts yet.
                    </p>
                    {selectedPage?.slug && (
                      <button
                        onClick={() => navigate(`/pages/${selectedPage.slug}`)}
                        className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all"
                      >
                        View Public Page
                      </button>
                    )}
                  </GlassCard>
                )}
                  </div>
            )}

            {activeTab === 'members' && (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Team Members</h3>
                <button
                  onClick={() => {
                    setSelectedPageForTeam(selectedPage);
                    setShowAddTeamMemberModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all font-semibold shadow-lg"
                >
                    <UserPlus size={18} />
                  Add Member
                  </button>
                </div>

              {pageMembers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pageMembers.map((member: any) => (
                    <GlassCard key={member.id} className="p-4">
                      <div className="flex items-center gap-4">
                        <Avatar src={member.avatar || member.avatarUrl} alt={member.username || member.name} size="lg" />
                      <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 dark:text-white truncate">
                            {member.username || member.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {member.role || 'Member'}
                          </p>
                    </div>
                  </div>
                    </GlassCard>
                  ))}
                </div>
              ) : (
                <GlassCard className="p-12 text-center">
                  <Users size={48} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No team members yet</p>
                </GlassCard>
              )}
              </div>
            )}

            {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Success Message */}
              {saveSuccess && (
                <GlassCard className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3">
                    <CheckCircle size={20} className="text-green-600 dark:text-green-400 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-green-900 dark:text-green-100">Settings saved successfully!</p>
                </div>
              </div>
                </GlassCard>
              )}

              {/* Error Message */}
              {saveError && (
                <GlassCard className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <div className="flex items-start gap-3">
                    <AlertCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-900 dark:text-red-100">Error</p>
                      <p className="text-sm text-red-700 dark:text-red-300">{saveError}</p>
              </div>
                  </div>
                </GlassCard>
              )}

              {/* Page Settings Form */}
              <GlassCard className="p-6 space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Page Settings</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Manage your page information and appearance
                    </p>
                    </div>
                </div>

                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                    Basic Information
                  </h4>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                      Page Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={settingsForm.name}
                      onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all text-base"
                      placeholder="Enter page name"
                      disabled={isSaving}
                    />
                </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                      Description
                    </label>
                    <textarea
                      value={settingsForm.description}
                      onChange={(e) => setSettingsForm({ ...settingsForm, description: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all text-base min-h-[120px] resize-y"
                      placeholder="Describe your page..."
                      disabled={isSaving}
                    />
                </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                      Category
                    </label>
                    <input
                      type="text"
                      value={settingsForm.category}
                      onChange={(e) => setSettingsForm({ ...settingsForm, category: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all text-base"
                      placeholder="e.g., Web3, DeFi, NFT"
                      disabled={isSaving}
                    />
                </div>
              </div>

                {/* Logo */}
              <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                    Logo
                  </h4>
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-white dark:border-gray-900 bg-white dark:bg-gray-800 shadow-xl">
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
                      <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                        Upload Logo
                      </label>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl cursor-pointer transition-colors">
                          <Upload size={18} />
                          <span className="text-sm font-medium">Choose File</span>
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
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                    Cover Image
                  </h4>
                  <div className="relative h-48 rounded-xl overflow-hidden bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 group">
                    {coverPreview && (
                      <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                    )}
                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 cursor-pointer transition-colors group-hover:bg-black/60">
                      <div className="text-center text-white">
                        <Camera size={28} className="mx-auto mb-2" />
                        <span className="text-sm font-semibold">
                          {coverPreview ? 'Change Cover' : 'Upload Cover Image'}
                        </span>
                        <p className="text-xs mt-1 opacity-90">Recommended: 1200x300px</p>
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
                        className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
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

                {/* Danger Zone */}
                {selectedPage?.role === 'owner' || selectedPage?.role === 'Owner' ? (
                  <div className="space-y-4 pt-6 border-t border-red-200 dark:border-red-800">
                    <h4 className="text-lg font-semibold text-red-600 dark:text-red-400">Danger Zone</h4>
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-red-900 dark:text-red-100">Delete Page</p>
                          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                            Once you delete a page, there is no going back. Please be certain.
                          </p>
                    </div>
                        <button
                          onClick={handleDeletePage}
                          className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors"
                          disabled={isSaving}
                        >
                          <Trash2 size={18} />
                          Delete Page
                        </button>
                  </div>
                </div>
                </div>
                ) : null}

                {/* Save Button */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleBackToList}
                    className="px-6 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all font-semibold"
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveSettings}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <Loader size={18} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </GlassCard>
              </div>
            )}
        </div>
        {renderAddTeamMemberModal()}
      </div>
    );
  }

  return null;
}
