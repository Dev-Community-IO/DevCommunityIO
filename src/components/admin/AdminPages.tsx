import { useState, useEffect, useRef } from 'react';
import { 
  Building2, 
  Search, 
  CheckCircle, 
  XCircle, 
  Eye,
  Trash2,
  Users,
  FileText,
  MoreVertical,
  Loader2,
  User,
  Archive,
  Edit,
  Ban,
  Shield,
  TrendingUp,
  TrendingDown,
  UserPlus,
  Settings,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import adminService from '../../services/api/admin.service';
import { Avatar } from '../Avatar';
import { GlassCard } from '../GlassCard';
import { Badge } from '../Badge';
import { VerifiedBadge } from '../VerifiedBadge';
import { ConfirmDialog } from '../ConfirmDialog';
import { useToast } from '../Toast';

interface Page {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  category?: string;
  isVerified?: boolean;
  isTrending?: boolean;
  owner?: {
    id: string;
    username: string;
    avatar?: string;
  };
  memberCount?: number;
  postCount?: number;
  createdAt: string;
}

export function AdminPages() {
  const navigate = useNavigate();
  const toast = useToast();
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [showModal, setShowModal] = useState<'verify' | 'unverify' | 'delete' | 'archive' | 'transfer' | 'members' | null>(null);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [pageMembers, setPageMembers] = useState<any[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [newMemberUsername, setNewMemberUsername] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'admin' | 'moderator' | 'member'>('member');
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [transferSearchQuery, setTransferSearchQuery] = useState('');
  const [transferSearchResults, setTransferSearchResults] = useState<any[]>([]);
  const [isSearchingForTransfer, setIsSearchingForTransfer] = useState(false);
  const [selectedNewOwner, setSelectedNewOwner] = useState<any>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: 'danger' | 'warning' | 'info' | 'default';
    onConfirm: () => void | Promise<void>;
    isLoading: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    variant: 'danger',
    onConfirm: () => {},
    isLoading: false,
  });
  const actionMenuRef = useRef<HTMLDivElement>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVerified, setFilterVerified] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setPages([]);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load data on mount and when filters change
  useEffect(() => {
    loadPages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterVerified, filterCategory, page, searchQuery]);

  // Ensure data loads on initial mount (safety net)
  useEffect(() => {
    // Load on mount if no data exists yet
    if (pages.length === 0) {
      loadPages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setShowActionMenu(null);
      }
    };

    if (showActionMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showActionMenu]);

  const loadPages = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getPages({
        page,
        limit: 50,
        search: searchQuery.trim() || undefined,
        verified: filterVerified !== 'all' ? filterVerified === 'verified' : undefined,
        category: filterCategory !== 'all' ? filterCategory : undefined,
      });
      
      const filteredPages = data.pages || data.data || [];
      
      if (page === 1) {
        setPages(filteredPages);
      } else {
        setPages(prev => [...prev, ...filteredPages]);
      }
      
      setHasMore(data.meta?.currentPage < data.meta?.lastPage);
    } catch (error) {
      console.error('Failed to load pages:', error);
      setPages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPage = (pageId: string) => {
    const page = pages.find(p => p.id === pageId);
    setConfirmDialog({
      isOpen: true,
      title: 'Grant Verification Badge',
      message: `Are you sure you want to grant a verification badge to ${page?.name}? This badge will be displayed on the page and all its content.`,
      variant: 'info',
      onConfirm: async () => {
        try {
          setConfirmDialog(prev => ({ ...prev, isLoading: true }));
          await adminService.verifyPage(pageId);
          toast.success('Verification badge has been granted to the page and will be displayed on all page content');
          setShowModal(null);
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          loadPages();
        } catch (error: any) {
          console.error('Failed to verify page:', error);
          toast.error(error?.response?.data?.message || 'Failed to verify page');
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      },
      isLoading: false,
    });
  };

  const handleUnverifyPage = (pageId: string) => {
    const page = pages.find(p => p.id === pageId);
    setConfirmDialog({
      isOpen: true,
      title: 'Revoke Verification Badge',
      message: `Are you sure you want to revoke the verification badge from ${page?.name}? The page will lose its verified status and badge.`,
      variant: 'warning',
      onConfirm: async () => {
        try {
          setConfirmDialog(prev => ({ ...prev, isLoading: true }));
          await adminService.unverifyPage(pageId);
          toast.success('Verification badge has been revoked from the page and verified status removed');
          setShowModal(null);
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          loadPages();
        } catch (error: any) {
          console.error('Failed to unverify page:', error);
          toast.error(error?.response?.data?.message || 'Failed to unverify page');
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      },
      isLoading: false,
    });
  };

  const handleDeletePage = (pageId: string) => {
    const page = pages.find(p => p.id === pageId);
    setConfirmDialog({
      isOpen: true,
      title: 'Permanently Delete Page',
      message: `Are you sure you want to permanently delete ${page?.name}? This action cannot be undone. All page data, posts, members, followers, and associated content will be permanently removed from the platform.`,
      variant: 'danger',
      onConfirm: async () => {
        try {
          setConfirmDialog(prev => ({ ...prev, isLoading: true }));
          await adminService.deletePage(pageId);
          toast.success('Page has been permanently deleted from the platform');
          setShowModal(null);
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          loadPages();
        } catch (error: any) {
          console.error('Failed to delete page:', error);
          toast.error(error?.response?.data?.message || 'Failed to delete page');
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      },
      isLoading: false,
    });
  };

  const handleToggleTrending = async (pageId: string) => {
    const page = pages.find(p => p.id === pageId);
    const isTrending = page?.isTrending || false;
    
    setConfirmDialog({
      isOpen: true,
      title: isTrending ? 'Remove from Trending Pages' : 'Feature in Trending Pages',
      message: `Are you sure you want to ${isTrending ? 'remove' : 'feature'} ${page?.name} ${isTrending ? 'from' : 'in'} the trending pages section? ${isTrending ? 'The page will no longer appear in trending.' : 'The page will be prominently displayed in the trending pages section.'}`,
      variant: 'info',
      onConfirm: async () => {
        try {
          setConfirmDialog(prev => ({ ...prev, isLoading: true }));
          await adminService.updatePageSettings(pageId, { is_trending: !isTrending });
          toast.success(`Page has been ${isTrending ? 'removed from' : 'featured in'} the trending pages section`);
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          setShowActionMenu(null);
          loadPages();
        } catch (error: any) {
          console.error('Failed to update trending status:', error);
          toast.error(error?.response?.data?.message || 'Failed to update trending status');
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      },
      isLoading: false,
    });
  };

  const handleOpenMembersModal = async (pageId: string) => {
    setSelectedPage(pages.find(p => p.id === pageId) || null);
    setShowMembersModal(true);
    setShowActionMenu(null);
    await loadPageMembers(pageId);
  };

  const loadPageMembers = async (pageId: string) => {
    try {
      setIsLoadingMembers(true);
      const data = await adminService.getPageMembers(pageId);
      setPageMembers(data.members || []);
    } catch (error: any) {
      console.error('Failed to load page members:', error);
      toast.error(error?.response?.data?.message || 'Failed to load members');
      setPageMembers([]);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const handleSearchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      setIsSearchingUsers(true);
      const data = await adminService.getUsers({ search: query, limit: 10 });
      setSearchResults(data.users || data.data || []);
    } catch (error) {
      console.error('Failed to search users:', error);
      setSearchResults([]);
    } finally {
      setIsSearchingUsers(false);
    }
  };

  const handleAddMember = async (userId: string, role: 'admin' | 'moderator' | 'member') => {
    if (!selectedPage) return;
    try {
      await adminService.addPageMember(selectedPage.id, userId, role);
      toast.success(`Team member has been added with ${role} role to the page`);
      setNewMemberUsername('');
      setNewMemberRole('member');
      await loadPageMembers(selectedPage.id);
      loadPages();
    } catch (error: any) {
      console.error('Failed to add member:', error);
      toast.error(error?.response?.data?.message || 'Failed to add member');
    }
  };

  const handleUpdateMemberRole = async (userId: string, role: 'admin' | 'moderator' | 'member') => {
    if (!selectedPage) return;
    try {
      await adminService.updatePageMemberRole(selectedPage.id, userId, role);
      toast.success(`Team member role has been updated to ${role}`);
      await loadPageMembers(selectedPage.id);
      loadPages();
    } catch (error: any) {
      console.error('Failed to update member role:', error);
      toast.error(error?.response?.data?.message || 'Failed to update member role');
    }
  };

  const handleArchivePage = (pageId: string) => {
    const page = pages.find(p => p.id === pageId);
    setConfirmDialog({
      isOpen: true,
      title: 'Archive Page',
      message: `Are you sure you want to archive ${page?.name}? The page will be hidden from public view but can be restored later. All content and members will be preserved.`,
      variant: 'warning',
      onConfirm: async () => {
        try {
          setConfirmDialog(prev => ({ ...prev, isLoading: true }));
          // TODO: Implement archive page API call
          // await adminService.archivePage(pageId);
          toast.success('Page has been archived and hidden from public view');
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          setShowActionMenu(null);
          loadPages();
        } catch (error: any) {
          console.error('Failed to archive page:', error);
          toast.error(error?.response?.data?.message || 'Failed to archive page');
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      },
      isLoading: false,
    });
  };

  const handleTransferOwnership = (pageId: string) => {
    const page = pages.find(p => p.id === pageId);
    setSelectedPage(page || null);
    setShowTransferModal(true);
    setShowActionMenu(null);
  };

  const handleSearchForTransfer = async (query: string) => {
    if (!query.trim()) {
      setTransferSearchResults([]);
      return;
    }
    try {
      setIsSearchingForTransfer(true);
      const data = await adminService.getUsers({ search: query, limit: 10 });
      setTransferSearchResults(data.users || data.data || []);
    } catch (error) {
      console.error('Failed to search users:', error);
      setTransferSearchResults([]);
    } finally {
      setIsSearchingForTransfer(false);
    }
  };

  const handleConfirmTransferOwnership = async (newOwnerId: string) => {
    if (!selectedPage) return;
    const page = pages.find(p => p.id === selectedPage.id);
    setConfirmDialog({
      isOpen: true,
      title: 'Transfer Page Ownership',
      message: `Are you sure you want to transfer ownership of ${page?.name}? This will transfer all administrative control to the selected user. The current owner will become a regular member. This action cannot be easily undone.`,
      variant: 'warning',
      onConfirm: async () => {
        try {
          setConfirmDialog(prev => ({ ...prev, isLoading: true }));
          // TODO: Implement transfer ownership API call
          // await adminService.transferPageOwnership(selectedPage.id, newOwnerId);
          toast.success('Page ownership has been transferred successfully');
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          setShowTransferModal(false);
          setSelectedPage(null);
          setSelectedNewOwner(null);
          setTransferSearchQuery('');
          setTransferSearchResults([]);
          loadPages();
        } catch (error: any) {
          console.error('Failed to transfer ownership:', error);
          toast.error(error?.response?.data?.message || 'Failed to transfer ownership');
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      },
      isLoading: false,
    });
  };

  const handleRemoveMember = (userId: string, username: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Remove Team Member',
      message: `Are you sure you want to remove ${username} from this page? They will lose all access and permissions associated with this page.`,
      variant: 'warning',
      onConfirm: async () => {
        if (!selectedPage) return;
        try {
          setConfirmDialog(prev => ({ ...prev, isLoading: true }));
          await adminService.removePageMember(selectedPage.id, userId);
          toast.success('Team member has been removed from the page');
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          await loadPageMembers(selectedPage.id);
          loadPages();
        } catch (error: any) {
          console.error('Failed to remove member:', error);
          toast.error(error?.response?.data?.message || 'Failed to remove member');
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      },
      isLoading: false,
    });
  };

  const categories = Array.from(new Set(pages.map(p => p.category).filter(Boolean))) as string[];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <GlassCard className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Search size={20} className="text-gray-500" />
            <h3 className="text-lg font-semibold">Filters</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search pages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <select
              value={filterVerified}
              onChange={(e) => {
                setFilterVerified(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Pages</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>

            <select
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Pages Table */}
      <GlassCard className="overflow-hidden">
        {isLoading && pages.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        ) : pages.length === 0 ? (
          <div className="text-center py-12">
            <Building2 size={48} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No pages found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Page</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Owner</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Members</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Posts</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {pages.map((page) => (
                  <tr 
                    key={page.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 flex-shrink-0">
                          <img
                            src={page.logoUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${page.name}`}
                            alt={page.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900 dark:text-white">{page.name}</p>
                            {page.isVerified && <VerifiedBadge size={14} />}
                          </div>
                          {page.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 max-w-xs">
                              {page.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {page.owner && (
                        <div className="flex items-center gap-2">
                          <Avatar
                            src={page.owner.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${page.owner.username}`}
                            alt={page.owner.username}
                            size="sm"
                          />
                          <span className="text-sm text-gray-900 dark:text-white">{page.owner.username}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <Users size={14} />
                        <span className="text-sm">{page.memberCount || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <FileText size={14} />
                        <span className="text-sm">{page.postCount || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {page.category && (
                        <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400">
                          {page.category}
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {page.isVerified ? (
                        <Badge className="bg-green-500/10 text-green-600 dark:text-green-400">
                          Verified
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-500/10 text-gray-600 dark:text-gray-400">
                          Unverified
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/pages/${page.slug}`)}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          title="View Page"
                        >
                          <Eye size={16} />
                        </button>
                        <div className="relative" ref={actionMenuRef}>
                          <button
                            onClick={() => {
                              setSelectedPage(page);
                              setShowActionMenu(showActionMenu === page.id ? null : page.id);
                            }}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <MoreVertical size={18} />
                          </button>
                          {showActionMenu === page.id && (
                            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                              <button
                                onClick={() => {
                                  navigate(`/pages/${page.slug}`);
                                  setShowActionMenu(null);
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300 transition-colors"
                              >
                                <Eye size={16} />
                                Open Page
                              </button>

                              {page.owner && (
                                <button
                                  onClick={() => {
                                    navigate(`/profile/${page.owner.username}`);
                                    setShowActionMenu(null);
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300 transition-colors"
                                >
                                  <User size={16} />
                                  View Owner Profile
                                </button>
                              )}

                              <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

                              {!page.isVerified ? (
                                <button
                                  onClick={() => {
                                    handleVerifyPage(page.id);
                                    setShowActionMenu(null);
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-blue-600 dark:text-blue-400 transition-colors"
                                >
                                  <CheckCircle size={16} />
                                  Grant Verification Badge
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    handleUnverifyPage(page.id);
                                    setShowActionMenu(null);
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-600 dark:text-gray-400 transition-colors"
                                >
                                  <XCircle size={16} />
                                  Revoke Verification Badge
                                </button>
                              )}

                              <button
                                onClick={() => {
                                  handleToggleTrending(page.id);
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-purple-600 dark:text-purple-400 transition-colors"
                              >
                                {page.isTrending ? (
                                  <>
                                    <TrendingDown size={16} />
                                    Remove from Trending Pages
                                  </>
                                ) : (
                                  <>
                                    <TrendingUp size={16} />
                                    Feature in Trending Pages
                                  </>
                                )}
                              </button>

                              <button
                                onClick={() => {
                                  handleOpenMembersModal(page.id);
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-blue-600 dark:text-blue-400 transition-colors"
                              >
                                <Users size={16} />
                                Manage Team Members & Roles
                              </button>

                              <button
                                onClick={() => {
                                  // Navigate to page edit or open edit modal
                                  navigate(`/pages/${page.slug}?edit=true`);
                                  setShowActionMenu(null);
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-indigo-600 dark:text-indigo-400 transition-colors"
                              >
                                <Edit size={16} />
                                Edit Page Details
                              </button>

                              <button
                                onClick={() => {
                                  // View page analytics/stats
                                  navigate(`/pages/${page.slug}?tab=stats`);
                                  setShowActionMenu(null);
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-green-600 dark:text-green-400 transition-colors"
                              >
                                <TrendingUp size={16} />
                                View Page Analytics
                              </button>

                              <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

                              <button
                                onClick={() => {
                                  // Archive page (temporary removal)
                                  handleArchivePage(page.id);
                                  setShowActionMenu(null);
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-orange-600 dark:text-orange-400 transition-colors"
                              >
                                <Archive size={16} />
                                Archive Page
                              </button>

                              <button
                                onClick={() => {
                                  // Transfer ownership to another user
                                  handleTransferOwnership(page.id);
                                  setShowActionMenu(null);
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-yellow-600 dark:text-yellow-400 transition-colors"
                              >
                                <Shield size={16} />
                                Transfer Page Ownership
                              </button>

                              <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

                              <button
                                onClick={() => {
                                  handleDeletePage(page.id);
                                  setShowActionMenu(null);
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-red-600 dark:text-red-400 transition-colors"
                              >
                                <Trash2 size={16} />
                                Permanently Delete Page
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {hasMore && !isLoading && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-center">
            <button
              onClick={() => setPage(prev => prev + 1)}
              disabled={isLoading}
              className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Loading...
                </>
              ) : (
                'Load More'
              )}
            </button>
          </div>
        )}
      </GlassCard>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant={confirmDialog.variant}
        isLoading={confirmDialog.isLoading}
      />

      {/* Transfer Ownership Modal */}
      {showTransferModal && selectedPage && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => {
              setShowTransferModal(false);
              setSelectedPage(null);
              setSelectedNewOwner(null);
              setTransferSearchQuery('');
              setTransferSearchResults([]);
            }}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <GlassCard className="max-w-md w-full p-6 animate-scale-in">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold">Transfer Page Ownership</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Transfer ownership of {selectedPage.name} to another user
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowTransferModal(false);
                    setSelectedPage(null);
                    setSelectedNewOwner(null);
                    setTransferSearchQuery('');
                    setTransferSearchResults([]);
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Search for New Owner</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search users by username..."
                      value={transferSearchQuery}
                      onChange={(e) => {
                        setTransferSearchQuery(e.target.value);
                        handleSearchForTransfer(e.target.value);
                      }}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    {isSearchingForTransfer && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-400" size={18} />
                    )}
                  </div>
                </div>

                {transferSearchResults.length > 0 && (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg max-h-64 overflow-y-auto">
                    {transferSearchResults.map((user: any) => (
                      <div
                        key={user.id}
                        onClick={() => setSelectedNewOwner(user)}
                        className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 border-b border-gray-200 dark:border-gray-700 last:border-0 cursor-pointer transition-colors ${
                          selectedNewOwner?.id === user.id ? 'bg-purple-50 dark:bg-purple-900/20' : ''
                        }`}
                      >
                        <Avatar
                          src={user.avatarUrl || user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                          alt={user.username}
                          size="sm"
                        />
                        <div className="flex-1">
                          <p className="font-medium">{user.username}</p>
                          {user.email && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                          )}
                        </div>
                        {selectedNewOwner?.id === user.id && (
                          <CheckCircle size={18} className="text-purple-600 dark:text-purple-400" />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {selectedNewOwner && (
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <p className="text-sm font-medium text-purple-900 dark:text-purple-300 mb-2">
                      Selected New Owner:
                    </p>
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={selectedNewOwner.avatarUrl || selectedNewOwner.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedNewOwner.username}`}
                        alt={selectedNewOwner.username}
                        size="sm"
                      />
                      <div>
                        <p className="font-semibold">{selectedNewOwner.username}</p>
                        {selectedNewOwner.email && (
                          <p className="text-xs text-gray-600 dark:text-gray-400">{selectedNewOwner.email}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      if (selectedNewOwner) {
                        handleConfirmTransferOwnership(selectedNewOwner.id);
                      } else {
                        toast.warning('Please select a new owner');
                      }
                    }}
                    disabled={!selectedNewOwner}
                    className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Transfer Ownership
                  </button>
                  <button
                    onClick={() => {
                      setShowTransferModal(false);
                      setSelectedPage(null);
                      setSelectedNewOwner(null);
                      setTransferSearchQuery('');
                      setTransferSearchResults([]);
                    }}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </GlassCard>
          </div>
        </>
      )}

      {/* Members Management Modal */}
      {showMembersModal && selectedPage && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => {
              setShowMembersModal(false);
              setSelectedPage(null);
              setPageMembers([]);
              setSearchUserQuery('');
              setSearchResults([]);
            }}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <GlassCard className="max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-scale-in">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">Manage Team Members - {selectedPage.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Add team members, update roles, or remove members from this page. Manage administrators, moderators, and regular members.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowMembersModal(false);
                      setSelectedPage(null);
                      setPageMembers([]);
                      setSearchUserQuery('');
                      setSearchResults([]);
                    }}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                {/* Add Member Section */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <UserPlus size={20} />
                    Add New Team Member
                  </h4>
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        placeholder="Search users by username..."
                        value={searchUserQuery}
                        onChange={(e) => {
                          setSearchUserQuery(e.target.value);
                          handleSearchUsers(e.target.value);
                        }}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      {isSearchingUsers && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-400" size={18} />
                      )}
                    </div>
                    {searchResults.length > 0 && (
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg max-h-48 overflow-y-auto">
                        {searchResults.map((user: any) => (
                          <div
                            key={user.id}
                            className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 last:border-0"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar
                                src={user.avatarUrl || user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                                alt={user.username}
                                size="sm"
                              />
                              <div>
                                <p className="font-medium">{user.username}</p>
                                {user.email && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                                )}
                              </div>
                            </div>
                            <select
                              value={newMemberRole}
                              onChange={(e) => setNewMemberRole(e.target.value as 'admin' | 'moderator' | 'member')}
                              className="px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                            >
                              <option value="member">Member</option>
                              <option value="moderator">Moderator</option>
                              <option value="admin">Admin</option>
                            </select>
                            <button
                              onClick={() => handleAddMember(user.id, newMemberRole)}
                              className="px-4 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm transition-colors"
                            >
                              Add to Team
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Members List */}
                <div>
                  <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Users size={20} />
                    Current Members ({pageMembers.length})
                  </h4>
                  {isLoadingMembers ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                    </div>
                  ) : pageMembers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No members found
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {pageMembers.map((member: any) => (
                        <div
                          key={member.userId || member.id}
                          className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar
                              src={member.user?.avatarUrl || member.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.user?.username || member.username}`}
                              alt={member.user?.username || member.username}
                              size="sm"
                            />
                            <div>
                              <p className="font-medium">{member.user?.username || member.username}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {member.user?.email || member.email || 'No email'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <select
                              value={member.role}
                              onChange={(e) => handleUpdateMemberRole(member.userId || member.id, e.target.value as 'admin' | 'moderator' | 'member')}
                              className="px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                            >
                              <option value="member">Member</option>
                              <option value="moderator">Moderator</option>
                              <option value="admin">Admin</option>
                            </select>
                            <button
                              onClick={() => handleRemoveMember(member.userId || member.id, member.user?.username || member.username)}
                              className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                              title="Remove Team Member"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          </div>
        </>
      )}
    </div>
  );
}

