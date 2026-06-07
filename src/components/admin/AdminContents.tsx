import { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  MessageCircle, 
  Calendar, 
  Trophy, 
  Briefcase,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Trash2,
  EyeOff,
  CheckCircle2,
  X,
  Loader2,
  Ban,
  Clock,
  User,
  AlertTriangle,
  Archive,
  Edit,
  Star,
  UserCheck,
  UserX,
  Shield,
  ShieldOff
} from 'lucide-react';
import { GlassCard } from '../GlassCard';
import { Avatar } from '../Avatar';
import { Badge } from '../Badge';
import { ConfirmDialog } from '../ConfirmDialog';
import { ContentReportsModal } from './ContentReportsModal';
import adminService from '../../services/api/admin.service';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../Toast';

type ContentType = 'post' | 'comment' | 'event' | 'hackathon' | 'opportunity' | 'all';
type ContentStatus = 'published' | 'unpublished' | 'deleted' | 'all';

interface ContentItem {
  id: string;
  type: ContentType;
  title?: string;
  content?: string;
  author: {
    id: string;
    username: string;
    avatar?: string;
    isTrusted?: boolean;
    isSpam?: boolean;
    isVerified?: boolean;
  };
  status: string;
  createdAt: string;
  updatedAt?: string;
  tags?: string[];
  slug?: string;
  reportsCount?: number;
}

export function AdminContents() {
  const navigate = useNavigate();
  const toast = useToast();
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [selectedContentForReports, setSelectedContentForReports] = useState<{
    type: 'post' | 'comment';
    id: string;
    title?: string;
  } | null>(null);
  const [selectedAuthor, setSelectedAuthor] = useState<{
    id: string;
    username: string;
  } | null>(null);
  const [showAuthorModal, setShowAuthorModal] = useState<'spam' | 'trusted' | 'verify' | 'deactivate' | null>(null);
  const [modalComment, setModalComment] = useState('');
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
  const isInitialMount = useRef(true);
  
  // Filters
  const [typeFilter, setTypeFilter] = useState<ContentType>('all');
  const [statusFilter, setStatusFilter] = useState<ContentStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [authorFilter, setAuthorFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Debounce search query - reset page when search changes (not on initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const timer = setTimeout(() => {
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, authorFilter]);

  // Load data on mount and when filters change
  useEffect(() => {
    // Clear contents only when page resets to 1 (new search/filter)
    if (page === 1) {
      setContents([]);
    }
    loadContents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter, statusFilter, searchQuery, authorFilter, dateFrom, dateTo, page]);

  // Ensure data loads on initial mount (safety net)
  useEffect(() => {
    // Load on mount if no data exists yet
    if (contents.length === 0) {
      loadContents();
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

  const loadContents = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getContents({
        page,
        limit: 50,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchQuery.trim() || undefined,
        authorId: authorFilter || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });
      
      const contentsData = data.contents || data.data || [];
      console.log('[DEBUG] Loaded contents:', {
        totalReceived: contentsData.length,
        page,
        searchQuery: searchQuery,
        filters: { typeFilter, statusFilter, authorFilter }
      });
      
      if (page === 1) {
        setContents(contentsData);
      } else {
        setContents(prev => [...prev, ...contentsData]);
      }
      
      setHasMore(data.meta?.currentPage < data.meta?.lastPage);
    } catch (error) {
      console.error('Failed to load contents:', error);
      setContents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnpublish = (type: string, id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Unpublish Content',
      message: 'Are you sure you want to unpublish this content? It will be hidden from public view but can be restored later.',
      variant: 'warning',
      onConfirm: async () => {
        try {
          setConfirmDialog(prev => ({ ...prev, isLoading: true }));
          await adminService.unpublishContent(type, id, 'Unpublished by admin');
          toast.success('Content has been unpublished and hidden from public view');
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          loadContents();
        } catch (error: any) {
          console.error('Failed to unpublish content:', error);
          toast.error(error?.response?.data?.message || 'Failed to unpublish content');
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      },
      isLoading: false,
    });
  };

  const handleRepublish = async (type: string, id: string) => {
    try {
      await adminService.republishContent(type, id);
      toast.success('Content has been restored and is now publicly visible');
      loadContents();
    } catch (error: any) {
      console.error('Failed to republish content:', error);
      toast.error(error?.response?.data?.message || 'Failed to republish content');
    }
  };

  const handleDelete = (type: string, id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Permanently Delete Content',
      message: 'Are you sure you want to permanently delete this content? This action cannot be undone and all associated data will be removed.',
      variant: 'danger',
      onConfirm: async () => {
        try {
          setConfirmDialog(prev => ({ ...prev, isLoading: true }));
          await adminService.removeContent(type, id, 'Deleted by admin');
          toast.success('Content has been permanently deleted');
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          loadContents();
        } catch (error: any) {
          console.error('Failed to delete content:', error);
          toast.error(error?.response?.data?.message || 'Failed to delete content');
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      },
      isLoading: false,
    });
  };

  const handleBulkAction = (action: 'unpublish' | 'delete') => {
    if (selectedItems.size === 0) return;
    
    const confirmMessage = action === 'delete' 
      ? `Are you sure you want to permanently delete ${selectedItems.size} item${selectedItems.size > 1 ? 's' : ''}? This action cannot be undone and all associated data will be permanently removed.`
      : `Are you sure you want to unpublish ${selectedItems.size} item${selectedItems.size > 1 ? 's' : ''}? These items will be hidden from public view but can be restored later.`;
    
    setConfirmDialog({
      isOpen: true,
      title: action === 'delete' ? 'Permanently Delete Multiple Items' : 'Unpublish Multiple Items',
      message: confirmMessage,
      variant: action === 'delete' ? 'danger' : 'warning',
      onConfirm: async () => {
        try {
          setConfirmDialog(prev => ({ ...prev, isLoading: true }));
          for (const itemId of selectedItems) {
            const item = contents.find(c => c.id === itemId);
            if (!item) continue;
            
            if (action === 'unpublish') {
              await adminService.unpublishContent(item.type, item.id, 'Bulk unpublish by admin');
            } else {
              await adminService.removeContent(item.type, item.id, 'Bulk delete by admin');
            }
          }
          
          setSelectedItems(new Set());
          toast.success(`${selectedItems.size} item${selectedItems.size > 1 ? 's' : ''} ${action === 'delete' ? 'deleted' : 'unpublished'} successfully`);
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          loadContents();
        } catch (error: any) {
          console.error(`Failed to ${action} contents:`, error);
          toast.error(error?.response?.data?.message || `Failed to ${action} contents`);
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      },
      isLoading: false,
    });
  };

  const handleViewReports = (item: ContentItem) => {
    // Only posts and comments can have reports
    if (item.type !== 'post' && item.type !== 'comment') {
      toast.warning('Reports are only available for posts and comments');
      return;
    }
    setSelectedContentForReports({
      type: item.type as 'post' | 'comment',
      id: item.id,
      title: item.title || item.content?.substring(0, 50),
    });
    setShowReportsModal(true);
    setShowActionMenu(null);
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === contents.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(contents.map(c => c.id)));
    }
  };

  const getTypeIcon = (type: ContentType) => {
    const icons = {
      post: FileText,
      comment: MessageCircle,
      event: Calendar,
      hackathon: Trophy,
      opportunity: Briefcase,
      all: FileText,
    };
    return icons[type] || FileText;
  };

  const getTypeColor = (type: ContentType) => {
    const colors = {
      post: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      comment: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
      event: 'bg-green-500/10 text-green-600 dark:text-green-400',
      hackathon: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
      opportunity: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
      all: 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
    };
    return colors[type] || colors.all;
  };

  const formatCompactDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleBanAuthor = (authorId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Permanently Ban Author',
      message: 'Are you sure you want to permanently ban this author? This action cannot be undone and the author will lose all access to the platform.',
      variant: 'danger',
      onConfirm: async () => {
        try {
          setConfirmDialog(prev => ({ ...prev, isLoading: true }));
          await adminService.banUser(authorId, 'Banned due to content violation');
          toast.success('Author has been permanently banned from the platform');
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          setShowActionMenu(null);
          loadContents();
        } catch (error: any) {
          console.error('Failed to ban author:', error);
          toast.error(error?.response?.data?.message || 'Failed to ban author');
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      },
      isLoading: false,
    });
  };

  const handleSuspendAuthor = (authorId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Temporarily Suspend Author',
      message: 'Are you sure you want to temporarily suspend this author for 7 days? The author will lose access to the platform during this period.',
      variant: 'warning',
      onConfirm: async () => {
        try {
          setConfirmDialog(prev => ({ ...prev, isLoading: true }));
          await adminService.suspendUser(authorId, 'Suspended due to content violation', 7);
          toast.success('Author has been temporarily suspended for 7 days');
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          setShowActionMenu(null);
          loadContents();
        } catch (error: any) {
          console.error('Failed to suspend author:', error);
          toast.error(error?.response?.data?.message || 'Failed to suspend author');
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      },
      isLoading: false,
    });
  };

  const handleUnpublishAllAuthorPosts = (authorId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Unpublish All Author Content',
      message: 'Are you sure you want to unpublish all content from this author? All posts will be hidden from public view but can be restored later.',
      variant: 'warning',
      onConfirm: async () => {
        try {
          setConfirmDialog(prev => ({ ...prev, isLoading: true }));
          await adminService.unpublishUserContent(authorId, 'All posts unpublished by admin');
          toast.success('All author content has been unpublished and hidden from public view. User has been notified.');
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          setShowActionMenu(null);
          loadContents();
        } catch (error: any) {
          console.error('Failed to unpublish author posts:', error);
          toast.error(error?.response?.data?.message || 'Failed to unpublish author posts');
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      },
      isLoading: false,
    });
  };

  const handleMarkAuthorSpam = (authorId: string, username: string) => {
    setSelectedAuthor({ id: authorId, username });
    setShowAuthorModal('spam');
    setModalComment('');
    setShowActionMenu(null);
  };

  const handleMarkAuthorSpamConfirm = async () => {
    if (!selectedAuthor || !modalComment.trim()) {
      toast.warning('Please provide a comment explaining why this author is being marked as spam');
      return;
    }

    try {
      setConfirmDialog(prev => ({ ...prev, isLoading: true }));
      await adminService.markSpam(selectedAuthor.id, modalComment);
      toast.success('Author marked as spam successfully. User has been notified.');
      setShowAuthorModal(null);
      setModalComment('');
      setSelectedAuthor(null);
      setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      loadContents();
    } catch (error: any) {
      console.error('Failed to mark author as spam:', error);
      toast.error(error?.response?.data?.message || 'Failed to mark author as spam');
      setConfirmDialog(prev => ({ ...prev, isOpen: false }));
    }
  };

  const handleUnmarkAuthorSpam = (authorId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Remove Spam Status',
      message: 'Are you sure you want to remove spam status from this author? They will regain normal posting privileges.',
      variant: 'info',
      onConfirm: async () => {
        try {
          setConfirmDialog(prev => ({ ...prev, isLoading: true }));
          await adminService.unmarkSpam(authorId);
          toast.success('Spam status removed successfully. User has been notified.');
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          setShowActionMenu(null);
          loadContents();
        } catch (error: any) {
          console.error('Failed to unmark spam:', error);
          toast.error(error?.response?.data?.message || 'Failed to remove spam status');
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      },
      isLoading: false,
    });
  };

  const handleMarkAuthorTrusted = async (authorId: string) => {
    try {
      setConfirmDialog(prev => ({ ...prev, isLoading: true }));
      await adminService.markTrusted(authorId);
      toast.success('Author marked as trusted successfully. User has been notified.');
      setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      setShowActionMenu(null);
      loadContents();
    } catch (error: any) {
      console.error('Failed to mark author as trusted:', error);
      toast.error(error?.response?.data?.message || 'Failed to mark author as trusted');
      setConfirmDialog(prev => ({ ...prev, isOpen: false }));
    }
  };

  const handleUnmarkAuthorTrusted = (authorId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Remove Trusted Status',
      message: 'Are you sure you want to remove trusted status from this author? They will lose cooldown exemptions.',
      variant: 'warning',
      onConfirm: async () => {
        try {
          setConfirmDialog(prev => ({ ...prev, isLoading: true }));
          await adminService.unmarkTrusted(authorId);
          toast.success('Trusted status removed successfully. User has been notified.');
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          setShowActionMenu(null);
          loadContents();
        } catch (error: any) {
          console.error('Failed to unmark trusted:', error);
          toast.error(error?.response?.data?.message || 'Failed to remove trusted status');
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      },
      isLoading: false,
    });
  };

  const handleVerifyAuthor = (authorId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Grant Verification Badge',
      message: 'Are you sure you want to grant a verification badge to this author? This badge will be displayed on their profile and content.',
      variant: 'info',
      onConfirm: async () => {
        try {
          setConfirmDialog(prev => ({ ...prev, isLoading: true }));
          await adminService.verifyUser(authorId);
          toast.success('Verification badge has been granted to the author');
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          setShowActionMenu(null);
          loadContents();
        } catch (error: any) {
          console.error('Failed to verify author:', error);
          toast.error(error?.response?.data?.message || 'Failed to verify author');
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      },
      isLoading: false,
    });
  };

  const handleUnverifyAuthor = (authorId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Revoke Verification Badge',
      message: 'Are you sure you want to revoke the verification badge from this author? They will lose their verified status and badge.',
      variant: 'warning',
      onConfirm: async () => {
        try {
          setConfirmDialog(prev => ({ ...prev, isLoading: true }));
          await adminService.unverifyUser(authorId);
          toast.success('Verification badge has been revoked from the author');
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          setShowActionMenu(null);
          loadContents();
        } catch (error: any) {
          console.error('Failed to unverify author:', error);
          toast.error(error?.response?.data?.message || 'Failed to unverify author');
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      },
      isLoading: false,
    });
  };

  const handleDeactivateAuthor = (authorId: string, username: string) => {
    setSelectedAuthor({ id: authorId, username });
    setShowAuthorModal('deactivate');
    setModalComment('');
    setShowActionMenu(null);
  };

  const handleDeactivateAuthorConfirm = async () => {
    if (!selectedAuthor || !modalComment.trim()) {
      toast.warning('Please provide a comment explaining why this author is being deactivated');
      return;
    }

    try {
      setConfirmDialog(prev => ({ ...prev, isLoading: true }));
      await adminService.deactivateUser(selectedAuthor.id, modalComment);
      toast.success('Author account has been deactivated and access revoked. User has been notified.');
      setShowAuthorModal(null);
      setModalComment('');
      setSelectedAuthor(null);
      setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      loadContents();
    } catch (error: any) {
      console.error('Failed to deactivate author:', error);
      toast.error(error?.response?.data?.message || 'Failed to deactivate author');
      setConfirmDialog(prev => ({ ...prev, isOpen: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <GlassCard className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={20} className="text-gray-500" />
            <h3 className="text-lg font-semibold">Filters</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value as ContentType);
                setPage(1);
              }}
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="post">Posts</option>
              <option value="comment">Comments</option>
              <option value="event">Events</option>
              <option value="hackathon">Hackathons</option>
              <option value="opportunity">Opportunities</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as ContentStatus);
                setPage(1);
              }}
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="unpublished">Unpublished</option>
              <option value="deleted">Deleted</option>
            </select>

            {/* Author Filter */}
            <input
              type="text"
              placeholder="Author username..."
              value={authorFilter}
              onChange={(e) => setAuthorFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Date From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Date To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Bulk Actions */}
      {selectedItems.size > 0 && (
        <GlassCard className="p-4 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-purple-700 dark:text-purple-300">
              {selectedItems.size} item{selectedItems.size > 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkAction('unpublish')}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <EyeOff size={16} />
                Unpublish Selected
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Trash2 size={16} />
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedItems(new Set())}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Contents Table */}
      <GlassCard className="overflow-visible p-0">
        {isLoading && contents.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        ) : contents.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No content found</p>
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-visible">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-800/30 border-b-2 border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-3 py-2.5 text-left w-10">
                    <input
                      type="checkbox"
                      checked={selectedItems.size === contents.length && contents.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                    />
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Type</th>
                  <th className="px-3 py-2.5 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Content</th>
                  <th className="px-3 py-2.5 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Author</th>
                  <th className="px-3 py-2.5 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Date</th>
                  <th className="px-3 py-2.5 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-3 py-2.5 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Reports</th>
                  <th className="px-3 py-2.5 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {contents.map((item) => {
                  const TypeIcon = getTypeIcon(item.type);
                  const isSelected = selectedItems.has(item.id);
                  
                  return (
                    <tr 
                      key={item.id}
                      className={`group transition-all duration-150 ${
                        isSelected 
                          ? 'bg-purple-50 dark:bg-purple-900/20 border-l-2 border-purple-500' 
                          : 'hover:bg-gray-50/50 dark:hover:bg-gray-800/30 border-l-2 border-transparent'
                      }`}
                    >
                      <td className="px-3 py-1.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(item.id)}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                        />
                      </td>
                      <td className="px-3 py-1.5">
                        <Badge className={`${getTypeColor(item.type)} text-xs font-medium px-2 py-0.5 inline-flex items-center gap-1`}>
                          <TypeIcon size={10} />
                          <span className="capitalize">{item.type}</span>
                        </Badge>
                      </td>
                      <td className="px-3 py-1.5">
                        <div className="max-w-xs">
                          <p className="font-semibold text-sm text-gray-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                            {item.title || item.content?.substring(0, 45) || 'Untitled'}
                          </p>
                          {item.tags && item.tags.length > 0 && (
                            <div className="flex gap-1 mt-0.5 flex-wrap">
                              {item.tags.slice(0, 2).map((tag, idx) => (
                                <span key={idx} className="text-xs text-gray-500 dark:text-gray-400 font-medium">#{tag}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-1.5">
                        <div className="flex items-center gap-1.5">
                          <Avatar
                            src={item.author.avatar || ''}
                            alt={item.author.username}
                            size="sm"

                          />
                          <span className="text-xs font-medium text-gray-900 dark:text-white truncate max-w-[100px]">{item.author.username}</span>
                        </div>
                      </td>
                      <td className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap font-medium">
                        {formatCompactDate(item.createdAt)}
                      </td>
                      <td className="px-3 py-1.5">
                        <Badge className={`text-xs font-medium px-2 py-0.5 ${
                          item.status === 'published' 
                            ? 'bg-green-500/10 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-700'
                            : item.status === 'unpublished' || item.status === 'archived'
                            ? 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-300 dark:border-orange-700'
                            : 'bg-red-500/10 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-700'
                        }`}>
                          <span className="capitalize">{item.status}</span>
                        </Badge>
                      </td>
                      <td className="px-3 py-1.5">
                        {(item.reportsCount || 0) > 0 && (item.type === 'post' || item.type === 'comment') ? (
                          <button
                            onClick={() => handleViewReports(item)}
                            className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group"
                          >
                            <AlertTriangle size={14} className="text-red-500 group-hover:text-red-600" />
                            <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                              {item.reportsCount}
                            </span>
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400 dark:text-gray-600">-</span>
                        )}
                      </td>
                      <td className="px-3 py-1.5">
                        <div className="flex items-center justify-end gap-0.5">
                          {item.slug && item.type === 'post' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/post/${item.slug}`);
                              }}
                              className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group/btn"
                              title="View Content"
                            >
                              <Eye size={13} className="text-gray-500 dark:text-gray-400 group-hover/btn:text-purple-600 dark:group-hover/btn:text-purple-400 transition-colors" />
                            </button>
                          )}
                          <div className="relative" ref={showActionMenu === item.id ? actionMenuRef : null}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowActionMenu(showActionMenu === item.id ? null : item.id);
                              }}
                              className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group/btn"
                              title="More Actions"
                            >
                              <MoreVertical size={13} className="text-gray-500 dark:text-gray-400 group-hover/btn:text-purple-600 dark:group-hover/btn:text-purple-400 transition-colors" />
                            </button>
                            {showActionMenu === item.id && (
                              <>
                                <div
                                  className="fixed inset-0 z-40"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowActionMenu(null);
                                  }}
                                />
                                <div 
                                  className="fixed right-4 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
                                  style={{
                                    top: actionMenuRef.current ? `${actionMenuRef.current.getBoundingClientRect().bottom + 8}px` : 'auto',
                                    right: actionMenuRef.current ? `${window.innerWidth - actionMenuRef.current.getBoundingClientRect().right}px` : '16px'
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (item.slug && item.type === 'post') {
                                      navigate(`/post/${item.slug}`);
                                    } else if (item.type === 'comment' && item.id) {
                                      // For comments, we might need to navigate to the post
                                      toast.info('Navigate to the post to view this comment');
                                    }
                                    setShowActionMenu(null);
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300 transition-colors"
                                >
                                  <Eye size={16} />
                                  View Content
                                </button>
                                
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/profile/${item.author.username}`);
                                    setShowActionMenu(null);
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300 transition-colors"
                                >
                                  <User size={16} />
                                  View Author Profile
                                </button>

                                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

                                <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                                  Content Actions
                                </div>

                                {item.status === 'published' ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUnpublish(item.type, item.id);
                                      setShowActionMenu(null);
                                    }}
                                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-orange-600 dark:text-orange-400 transition-colors"
                                  >
                                    <EyeOff size={16} />
                                    Unpublish Content
                                  </button>
                                ) : (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRepublish(item.type, item.id);
                                      setShowActionMenu(null);
                                    }}
                                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-green-600 dark:text-green-400 transition-colors"
                                  >
                                    <CheckCircle2 size={16} />
                                    Restore Publication
                                  </button>
                                )}

                                {(item.type === 'post' || item.type === 'comment') && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewReports(item);
                                      setShowActionMenu(null);
                                    }}
                                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-blue-600 dark:text-blue-400 transition-colors"
                                  >
                                    <AlertTriangle size={16} />
                                    Review Content Reports
                                    {(item.reportsCount || 0) > 0 && (
                                      <Badge className="ml-auto bg-red-500/10 text-red-600 dark:text-red-400">
                                        {item.reportsCount}
                                      </Badge>
                                    )}
                                  </button>
                                )}

                                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

                                <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                                  Author Actions
                                </div>

                                {!item.author.isVerified ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleVerifyAuthor(item.author.id);
                                      setShowActionMenu(null);
                                    }}
                                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-blue-600 dark:text-blue-400 transition-colors"
                                  >
                                    <UserCheck size={16} />
                                    Grant Verification Badge
                                  </button>
                                ) : (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUnverifyAuthor(item.author.id);
                                      setShowActionMenu(null);
                                    }}
                                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-600 dark:text-gray-400 transition-colors"
                                  >
                                    <UserX size={16} />
                                    Revoke Verification Badge
                                  </button>
                                )}

                                {item.author.isTrusted ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUnmarkAuthorTrusted(item.author.id);
                                      setShowActionMenu(null);
                                    }}
                                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-blue-600 dark:text-blue-400 transition-colors"
                                  >
                                    <X size={16} />
                                    Remove Trusted Status
                                  </button>
                                ) : (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMarkAuthorTrusted(item.author.id);
                                      setShowActionMenu(null);
                                    }}
                                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-blue-600 dark:text-blue-400 transition-colors"
                                  >
                                    <Star size={16} />
                                    Mark as Trusted
                                  </button>
                                )}

                                {item.author.isSpam ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUnmarkAuthorSpam(item.author.id);
                                      setShowActionMenu(null);
                                    }}
                                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-orange-600 dark:text-orange-400 transition-colors"
                                  >
                                    <CheckCircle2 size={16} />
                                    Remove Spam Status
                                  </button>
                                ) : (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMarkAuthorSpam(item.author.id, item.author.username);
                                      setShowActionMenu(null);
                                    }}
                                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-orange-600 dark:text-orange-400 transition-colors"
                                  >
                                    <AlertTriangle size={16} />
                                    Mark as Spam
                                  </button>
                                )}

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUnpublishAllAuthorPosts(item.author.id);
                                    setShowActionMenu(null);
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-orange-600 dark:text-orange-400 transition-colors"
                                >
                                  <Archive size={16} />
                                  Unpublish All Author Content
                                </button>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSuspendAuthor(item.author.id);
                                    setShowActionMenu(null);
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-orange-600 dark:text-orange-400 transition-colors"
                                >
                                  <Clock size={16} />
                                  Temporarily Suspend Author (7 days)
                                </button>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeactivateAuthor(item.author.id, item.author.username);
                                    setShowActionMenu(null);
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-orange-600 dark:text-orange-400 transition-colors"
                                >
                                  <UserX size={16} />
                                  Deactivate Author Account
                                </button>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleBanAuthor(item.author.id);
                                    setShowActionMenu(null);
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-red-600 dark:text-red-400 transition-colors"
                                >
                                  <Ban size={16} />
                                  Permanently Ban Author
                                </button>

                                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

                                <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                                  Dangerous Actions
                                </div>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(item.type, item.id);
                                    setShowActionMenu(null);
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-red-600 dark:text-red-400 transition-colors"
                                >
                                  <Trash2 size={16} />
                                  Permanently Delete Content
                                </button>
                              </div>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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

      {/* Reports Modal */}
      {selectedContentForReports && (
        <ContentReportsModal
          isOpen={showReportsModal}
          onClose={() => {
            setShowReportsModal(false);
            setSelectedContentForReports(null);
          }}
          contentType={selectedContentForReports.type}
          contentId={selectedContentForReports.id}
          contentTitle={selectedContentForReports.title}
        />
      )}

      {/* Author Action Modals */}
      {showAuthorModal && selectedAuthor && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => {
              setShowAuthorModal(null);
              setModalComment('');
              setSelectedAuthor(null);
            }}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <GlassCard className="max-w-md w-full p-6 animate-scale-in">
              {showAuthorModal === 'spam' && (
                <>
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <AlertTriangle className="text-orange-500" size={20} />
                    Mark Author as Spam
                  </h3>
                  <div className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-400">
                      You are about to mark {selectedAuthor.username} as spam. This will restrict their posting to once every 24 hours.
                    </p>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Comment (required) - This will be sent to the user
                      </label>
                      <textarea
                        value={modalComment}
                        onChange={(e) => setModalComment(e.target.value)}
                        placeholder="Explain why this author is being marked as spam..."
                        rows={4}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          if (modalComment.trim()) {
                            handleMarkAuthorSpamConfirm();
                          } else {
                            toast.warning('Please provide a comment');
                          }
                        }}
                        className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!modalComment.trim()}
                      >
                        Mark as Spam
                      </button>
                      <button
                        onClick={() => {
                          setShowAuthorModal(null);
                          setModalComment('');
                          setSelectedAuthor(null);
                        }}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </>
              )}

              {showAuthorModal === 'deactivate' && (
                <>
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <UserX className="text-orange-500" size={20} />
                    Deactivate Author Account
                  </h3>
                  <div className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-400">
                      You are about to deactivate {selectedAuthor.username}. They will not be able to perform any actions until reactivated.
                    </p>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Comment (required) - This will be sent to the user
                      </label>
                      <textarea
                        value={modalComment}
                        onChange={(e) => setModalComment(e.target.value)}
                        placeholder="Explain why this author is being deactivated..."
                        rows={4}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          if (modalComment.trim()) {
                            handleDeactivateAuthorConfirm();
                          } else {
                            toast.warning('Please provide a comment');
                          }
                        }}
                        className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!modalComment.trim()}
                      >
                        Deactivate Author
                      </button>
                      <button
                        onClick={() => {
                          setShowAuthorModal(null);
                          setModalComment('');
                          setSelectedAuthor(null);
                        }}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </>
              )}
            </GlassCard>
          </div>
        </>
      )}
    </div>
  );
}

