import { useState, useEffect, useRef } from 'react';
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

interface ProfilePagesProps {
  username: string;
}

type ViewMode = 'list' | 'manage';
type FilterType = 'all' | 'owner' | 'admin' | 'member';

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
  const [selectedPageForTeam, setSelectedPageForTeam] = useState<string | null>(null);
  const [teamMemberSearchQuery, setTeamMemberSearchQuery] = useState('');
  const [teamMemberSearchResults, setTeamMemberSearchResults] = useState<any[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [selectedUserIndex, setSelectedUserIndex] = useState(-1);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedTeamRole, setSelectedTeamRole] = useState<'admin' | 'moderator'>('moderator');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchResultsRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<FilterType>('all');

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
        setUserPages(pagesWithRoles);
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
      setUserPages(pagesWithRoles);
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

  const handleAddTeamMember = async (pageId: string, username: string) => {
    if (!pageId || !username) return;
    
    try {
      await pagesService.addTeamMember(pageId, username, selectedTeamRole);
      setShowAddTeamMemberModal(false);
      setTeamMemberSearchQuery('');
      setTeamMemberSearchResults([]);
      setSelectedPageForTeam(null);
      setSelectedUserIndex(-1);
      setSearchError(null);
      
      // Refresh page members if we're in the members tab
      if (selectedPageId === pageId) {
        const members = await pagesService.getMembers(selectedPageId);
        setPageMembers(members.members || members || []);
      }
      
      // Refresh pages list
      if (username) {
        const pages = await usersService.getUserPages(username);
        const pagesWithRoles = Array.isArray(pages) ? pages : [];
        setUserPages(pagesWithRoles);
      }
    } catch (err: any) {
      setSearchError(err?.response?.data?.message || err?.message || 'Failed to add team member');
    }
  };

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
      if (selectedUserIndex >= 0 && selectedUserIndex < teamMemberSearchResults.length && selectedPageForTeam) {
        const selectedUser = teamMemberSearchResults[selectedUserIndex];
        handleAddTeamMember(selectedPageForTeam, selectedUser.username);
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
      setUserPages(pagesWithRoles);
      
      // Update selected page
      const updatedPage = pagesWithRoles.find((p: any) => p.id === selectedPage.id);
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
      setUserPages(pagesWithRoles);
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Failed to delete page');
    }
  };

  // List View
  if (viewMode === 'list') {
    return (
      <div className="space-y-6">
        <CreatePageModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handlePageCreated}
        />
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              {isOwnProfile ? 'Your Pages' : 'Pages'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {isOwnProfile 
                ? 'Manage pages you own or moderate' 
                : `Pages ${username} owns or moderates`}
            </p>
          </div>
          {isOwnProfile && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Plus size={20} />
              Create Page
            </button>
          )}
        </div>

        {/* Filters */}
        {isOwnProfile && userPages.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
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
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon size={16} />
                  <span className="capitalize">{filterType}</span>
                  <Badge variant="default" className={`text-xs px-1.5 py-0.5 ${
                    isActive ? 'bg-white/20 text-white' : ''
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
          <GlassCard className="p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center">
              <Building2 size={40} className="text-blue-500 dark:text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
              {isOwnProfile ? 'No Pages Yet' : 'No Pages Found'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              {isOwnProfile
                ? "Create your first community page to start building and engaging with your audience."
                : `This user hasn't created or joined any community pages yet.`}
            </p>
            {isOwnProfile && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl"
              >
                Create Your First Page
              </button>
            )}
          </GlassCard>
        ) : (
          /* Pages Grid */
          <div className="space-y-6">
            {/* Pages You Manage */}
            {ownerPages.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                    <Crown size={16} className="text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Pages You Manage
                  </h3>
                  <Badge variant="default" className="px-2 py-0.5 text-xs">
                    {ownerPages.length}
                  </Badge>
                </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ownerPages.map(page => (
                    <GlassCard key={`page-${page.id}`} className="hover:shadow-lg transition-all duration-300 group cursor-pointer relative overflow-hidden">
              {/* Cover Image Banner */}
                      <div className="relative h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 overflow-hidden">
                {page.coverImageUrl ? (
                  <img 
                    src={page.coverImageUrl} 
                    alt={`${page.name} cover`} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                ) : null}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent"></div>
                
                {/* Role Badge */}
                        <div className="absolute top-2 right-2 z-10">
                  <Badge
                            variant="gradient"
                            className="flex items-center gap-1 backdrop-blur-md bg-white/95 dark:bg-gray-900/95 px-2 py-0.5 text-xs"
                          >
                            {page.role === 'owner' || page.role === 'Owner' ? (
                              <Crown size={10} />
                            ) : (
                              <Shield size={10} />
                            )}
                  </Badge>
                </div>

              {/* Logo positioned overlapping cover */}
                        <div className="absolute -bottom-6 left-3 z-20">
                          <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-white dark:border-gray-900 bg-white dark:bg-gray-800 shadow-lg relative">
                    <img 
                      src={page.logoUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(page.name)}`} 
                      alt={`${page.name} logo`} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(page.name)}`;
                      }}
                    />
                    {page.isVerified && (
                      <div className="absolute -bottom-0.5 -right-0.5 bg-white dark:bg-gray-900 rounded-full p-0.5 shadow-md border border-white dark:border-gray-900">
                        <VerifiedBadge size={10} />
                  </div>
                    )}
                </div>
              </div>
              </div>

              {/* Content Section */}
              <div className="p-4 pt-10 space-y-3">
                {/* Page Header */}
                <div>
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h3 
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/pages/${page.slug}`);
                              }}
                              className="text-base font-bold hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors flex-1 line-clamp-1"
                  >
                    {page.name}
                  </h3>
                            {page.isVerified && (
                              <VerifiedBadge size={14} />
                            )}
                          </div>
                  {page.description && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-snug">
                      {page.description}
                    </p>
                  )}
                </div>

                {/* Page Stats - Compact Inline */}
                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
                          <div className="flex items-center gap-1">
                              <Users size={12} className="text-blue-500" />
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {page.memberCount || page.members || 0}
                              </span>
                  </div>
                          <div className="flex items-center gap-1">
                              <FileText size={12} className="text-purple-500" />
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {page.postCount || page.posts || 0}
                              </span>
                            </div>
                          {page.category && (
                            <div className="flex items-center gap-1 ml-auto">
                              <Hash size={12} className="text-green-500" />
                              <span className="truncate max-w-[80px]">{page.category}</span>
                            </div>
                          )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2">
                      <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/pages/${page.slug}`);
                            }}
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 transition-all text-xs font-semibold shadow-sm hover:shadow-md"
                      >
                            <Layout size={14} />
                            View
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleManagePage(page.id);
                        }}
                            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all text-xs font-semibold"
                            title="Manage Page"
                      >
                            <Settings size={14} />
                      </button>
                </div>
              </div>
            </GlassCard>
            ))}
                </div>
              </div>
            )}

            {/* Pages You're a Member Of */}
            {memberPages.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                    <Users size={16} className="text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Pages You're a Member Of
                  </h3>
                  <Badge variant="default" className="px-2 py-0.5 text-xs">
                    {memberPages.length}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {memberPages.map(page => (
                    <GlassCard 
                      key={`page-${page.id}`} 
                      className="hover:shadow-lg transition-all duration-300 group cursor-pointer relative overflow-hidden"
                      onClick={() => navigate(`/pages/${page.slug}`)}
                    >
                      {/* Cover Image Banner */}
                      <div className="relative h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 overflow-hidden">
                        {page.coverImageUrl ? (
                          <img 
                            src={page.coverImageUrl} 
                            alt={`${page.name} cover`} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        ) : null}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/5 to-transparent"></div>
                      </div>
                      
                      {/* Logo - positioned overlapping cover */}
                      <div className="absolute -bottom-5 left-3 z-20">
                        <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-white dark:border-gray-900 bg-white dark:bg-gray-800 shadow-md relative">
                          <img 
                            src={page.logoUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(page.name)}`} 
                            alt={`${page.name} logo`} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(page.name)}`;
                            }}
                          />
                          {page.isVerified && (
                            <div className="absolute -bottom-0.5 -right-0.5 bg-white dark:bg-gray-900 rounded-full p-0.5 shadow-sm border border-white dark:border-gray-900">
                              <VerifiedBadge size={9} />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-3 pt-8 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-bold hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex-1 line-clamp-1">
                            {page.name}
                          </h3>
                          {page.isVerified && (
                            <VerifiedBadge size={12} />
                          )}
                        </div>
                        
                        {page.description && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-snug">
                            {page.description}
                          </p>
                        )}

                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 pt-1.5 border-t border-gray-100 dark:border-gray-800">
                          <span className="flex items-center gap-1">
                            <Users size={11} className="text-blue-500" />
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {page.memberCount || page.members || 0}
                            </span>
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText size={11} className="text-purple-500" />
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {page.postCount || page.posts || 0}
                            </span>
                          </span>
                </div>
              </div>
            </GlassCard>
            ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Add Team Member Modal */}
        {showAddTeamMemberModal && selectedPageForTeam && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowAddTeamMemberModal(false);
                setTeamMemberSearchQuery('');
                setTeamMemberSearchResults([]);
                setSelectedPageForTeam(null);
                setSelectedUserIndex(-1);
                setSearchError(null);
              }
            }}
          >
            <GlassCard className="w-full max-w-md p-6 space-y-4 animate-slide-up max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add Team Member</h3>
                <button
                  onClick={() => {
                    setShowAddTeamMemberModal(false);
                    setTeamMemberSearchQuery('');
                    setTeamMemberSearchResults([]);
                    setSelectedPageForTeam(null);
                    setSelectedUserIndex(-1);
                    setSearchError(null);
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
                        key={user.id}
                        onClick={() => handleAddTeamMember(selectedPageForTeam!, user.username)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                          selectedUserIndex === index
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 dark:border-blue-400'
                            : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-2 border-transparent'
                        }`}
                        onMouseEnter={() => setSelectedUserIndex(index)}
                      >
                        <Avatar
                          src={user.avatarUrl || user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                          alt={user.username}
                          size="md"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                          <p className="font-bold text-gray-900 dark:text-white truncate">{user.username}</p>
                            {user.isVerified && <VerifiedBadge size={14} />}
                          </div>
                          {user.pseudo && (
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
                      Use <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs font-mono">↑</kbd> <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs font-mono">↓</kbd> to navigate, <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs font-mono">Enter</kbd> to select
                    </p>
                  </div>
                )}
              </div>
            </GlassCard>
          </div>
        )}
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
                    src={selectedPage.logoUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(selectedPage.name)}`} 
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
                    setSelectedPageForTeam(selectedPage.id);
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
      </div>
    );
  }

  return null;
}
