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
  const [showModal, setShowModal] = useState<'verify' | 'unverify' | 'delete' | 'archive' | 'transfer' | null>(null);
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

  useEffect(() => {
    loadPages();
  }, [filterVerified, filterCategory, page]);

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
        search: searchQuery || undefined,
        verified: filterVerified !== 'all' ? filterVerified === 'verified' : undefined,
      });
      
      let filteredPages = data.pages || data.data || [];
      
      // Filter by category
      if (filterCategory !== 'all') {
        filteredPages = filteredPages.filter((p: Page) => p.category === filterCategory);
      }
      
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
      title: 'Verify Page',
      message: `Are you sure you want to verify ${page?.name}? They will receive a verified badge.`,
      variant: 'info',
      onConfirm: async () => {
        try {
          setConfirmDialog(prev => ({ ...prev, isLoading: true }));
          await adminService.verifyPage(pageId);
          toast.success('Page verified successfully');
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
      title: 'Unverify Page',
      message: `Are you sure you want to remove verification from ${page?.name}? They will lose their verified badge.`,
      variant: 'warning',
      onConfirm: async () => {
        try {
          setConfirmDialog(prev => ({ ...prev, isLoading: true }));
          await adminService.unverifyPage(pageId);
          toast.success('Page unverified successfully');
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
      title: 'Delete Page',
      message: `Are you sure you want to permanently delete ${page?.name}? This action cannot be undone. All page data, posts, and members will be removed.`,
      variant: 'danger',
      onConfirm: async () => {
        try {
          setConfirmDialog(prev => ({ ...prev, isLoading: true }));
          await adminService.deletePage(pageId);
          toast.success('Page deleted successfully');
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
      title: isTrending ? 'Remove from Trending' : 'Add to Trending',
      message: `Are you sure you want to ${isTrending ? 'remove' : 'add'} ${page?.name} ${isTrending ? 'from' : 'to'} trending pages?`,
      variant: 'info',
      onConfirm: async () => {
        try {
          setConfirmDialog(prev => ({ ...prev, isLoading: true }));
          await adminService.updatePageSettings(pageId, { is_trending: !isTrending });
          toast.success(`Page ${isTrending ? 'removed from' : 'added to'} trending successfully`);
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
                onKeyDown={(e) => e.key === 'Enter' && loadPages()}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <select
              value={filterVerified}
              onChange={(e) => setFilterVerified(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Pages</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
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
                                View Page
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
                                  Verify Page
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
                                  Unverify Page
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
                                    Remove from Trending
                                  </>
                                ) : (
                                  <>
                                    <TrendingUp size={16} />
                                    Add to Trending
                                  </>
                                )}
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
                                Delete Page
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
    </div>
  );
}

