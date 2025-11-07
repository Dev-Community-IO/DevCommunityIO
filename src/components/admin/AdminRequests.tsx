import { useState, useEffect, useMemo } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  MessageSquare, 
  Mail,
  Wallet,
  Github,
  Loader2,
  Shield,
  TrendingUp,
  Calendar,
  X,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  AlertCircle,
  Info
} from 'lucide-react';
import { GlassCard } from '../GlassCard';
import { Avatar } from '../Avatar';
import { Badge } from '../Badge';
import { useToast } from '../Toast';
import adminService from '../../services/api/admin.service';

interface VerificationRequest {
  id: string;
  userId: string;
  status: 'pending' | 'approved' | 'rejected';
  reason: string | null;
  adminComment: string | null;
  createdAt: string;
  reviewedAt: string | null;
  rejectedAt: string | null;
  user: {
    id: string;
    username: string;
    pseudo: string | null;
    avatarUrl: string | null;
    reputation: number;
    email: string | null;
    googleId: string | null;
    githubId: string | null;
    walletAddress: string | null;
  };
  reviewer: {
    id: string;
    username: string;
  } | null;
}

export function AdminRequests() {
  const toast = useToast();
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [allRequests, setAllRequests] = useState<VerificationRequest[]>([]); // Store all requests for stats
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [adminComment, setAdminComment] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'reputation' | 'username'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadRequests();
  }, [statusFilter, page]);

  // Load stats separately to get accurate counts
  useEffect(() => {
    loadAllRequestsForStats();
  }, []);

  const loadAllRequestsForStats = async () => {
    try {
      const response = await adminService.getVerificationRequests(undefined, 1, 1000); // Get all for stats
      setAllRequests(response.requests || []);
    } catch (error) {
      console.error('Failed to load all requests for stats:', error);
    }
  };

  const loadRequests = async () => {
    try {
      setIsLoading(true);
      const response = await adminService.getVerificationRequests(statusFilter === 'all' ? undefined : statusFilter, page);
      const fetchedRequests = response.requests || [];
      setRequests(fetchedRequests);
      setTotalPages(response.meta?.last_page || 1);
      
      // Update stats if we got all requests
      if (statusFilter === 'all' && page === 1) {
        setAllRequests(fetchedRequests);
      }
    } catch (error: any) {
      console.error('Failed to load verification requests:', error);
      toast.error(error?.response?.data?.message || 'Failed to load verification requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (request: VerificationRequest) => {
    if (!window.confirm(`Approve verification for ${request.user.pseudo || request.user.username}?`)) {
      return;
    }

    try {
      setIsProcessing(true);
      await adminService.approveVerification(request.userId, adminComment.trim() || undefined);
      toast.success(`Verification approved for ${request.user.pseudo || request.user.username}`);
      setSelectedRequest(null);
      setAdminComment('');
      await loadRequests();
      await loadAllRequestsForStats(); // Refresh stats
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to approve verification';
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (request: VerificationRequest) => {
    if (!adminComment.trim() || adminComment.trim().length < 10) {
      toast.warning('Please provide a rejection comment (minimum 10 characters)');
      return;
    }

    if (!window.confirm(`Reject verification for ${request.user.pseudo || request.user.username}?`)) {
      return;
    }

    try {
      setIsProcessing(true);
      await adminService.rejectVerification(request.userId, adminComment.trim());
      toast.success(`Verification rejected for ${request.user.pseudo || request.user.username}`);
      setSelectedRequest(null);
      setAdminComment('');
      await loadRequests();
      await loadAllRequestsForStats(); // Refresh stats
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to reject verification';
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const getUserAuthMethod = (user: VerificationRequest['user']) => {
    if (user.googleId) return { method: 'Google', icon: <Mail size={14} />, color: 'text-red-500' };
    if (user.githubId) return { method: 'GitHub', icon: <Github size={14} />, color: 'text-gray-700 dark:text-gray-300' };
    if (user.walletAddress) return { method: 'Wallet', icon: <Wallet size={14} />, color: 'text-blue-500' };
    return { method: 'Email', icon: <Mail size={14} />, color: 'text-gray-500' };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-500/10 text-green-600 dark:text-green-400">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/10 text-red-600 dark:text-red-400">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filter and sort requests
  const filteredAndSortedRequests = useMemo(() => {
    let filtered = [...requests];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(request => 
        request.user.username.toLowerCase().includes(query) ||
        (request.user.pseudo && request.user.pseudo.toLowerCase().includes(query)) ||
        (request.reason && request.reason.toLowerCase().includes(query)) ||
        (request.user.email && request.user.email.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'reputation':
          comparison = a.user.reputation - b.user.reputation;
          break;
        case 'username':
          comparison = (a.user.pseudo || a.user.username).localeCompare(b.user.pseudo || b.user.username);
          break;
        case 'date':
        default:
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [requests, searchQuery, sortBy, sortOrder]);

  // Calculate stats from all requests
  const pendingCount = allRequests.filter(r => r.status === 'pending').length;
  const approvedCount = allRequests.filter(r => r.status === 'approved').length;
  const rejectedCount = allRequests.filter(r => r.status === 'rejected').length;
  const totalCount = allRequests.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Shield size={32} className="text-purple-500" />
            Verification Requests
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Review and manage user verification requests
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard className="p-5 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-2 border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Pending</p>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">{pendingCount}</p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                {totalCount > 0 ? `${Math.round((pendingCount / totalCount) * 100)}% of total` : '0%'}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/40 rounded-xl">
              <Clock size={28} className="text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700 dark:text-green-300">Approved</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">{approvedCount}</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                {totalCount > 0 ? `${Math.round((approvedCount / totalCount) * 100)}% of total` : '0%'}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded-xl">
              <CheckCircle2 size={28} className="text-green-600 dark:text-green-400" />
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-5 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-2 border-red-200 dark:border-red-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-700 dark:text-red-300">Rejected</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-1">{rejectedCount}</p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                {totalCount > 0 ? `${Math.round((rejectedCount / totalCount) * 100)}% of total` : '0%'}
              </p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/40 rounded-xl">
              <XCircle size={28} className="text-red-600 dark:text-red-400" />
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">{totalCount}</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">All requests</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-xl">
              <Shield size={28} className="text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Filters and Search */}
      <GlassCard className="p-5">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by username, email, or reason..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 outline-none transition-all"
            />
          </div>

          {/* Filters and Sort */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
          {(['pending', 'approved', 'rejected', 'all'] as const).map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setPage(1);
              }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                statusFilter === status
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'reputation' | 'username')}
                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
              >
                <option value="date">Date</option>
                <option value="reputation">Reputation</option>
                <option value="username">Username</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Requests List */}
      {isLoading ? (
        <GlassCard className="p-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            <p className="text-gray-600 dark:text-gray-400">Loading verification requests...</p>
          </div>
        </GlassCard>
      ) : filteredAndSortedRequests.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <Shield size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">No Verification Requests</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchQuery 
              ? `No requests match "${searchQuery}"`
              : statusFilter === 'all' 
              ? 'No verification requests found.'
              : `No ${statusFilter} verification requests found.`}
          </p>
          {(searchQuery || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors font-medium"
            >
              Clear Filters
            </button>
          )}
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedRequests.map((request) => {
            const authMethod = getUserAuthMethod(request.user);
            return (
              <GlassCard key={request.id} className="p-6 hover:shadow-xl transition-all duration-300">
                <div className="flex gap-4">
                  {/* User Avatar */}
                  <Avatar
                    src={request.user.avatarUrl || undefined}
                    alt={request.user.username}
                    size="md"
                  />

                  {/* Request Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                            {request.user.pseudo || request.user.username}
                          </h3>
                          {getStatusBadge(request.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
                          <span className="flex items-center gap-1">
                            <User size={14} />
                            @{request.user.username}
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp size={14} />
                            {request.user.reputation.toLocaleString()} rep
                          </span>
                          <span className={`flex items-center gap-1 ${authMethod.color}`}>
                            {authMethod.icon}
                            {authMethod.method}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {formatDate(request.createdAt)}
                          </span>
                          {request.user.email && (
                            <span className="flex items-center gap-1">
                              <Mail size={14} />
                              {request.user.email}
                            </span>
                          )}
                        </div>
                      </div>
                      <a
                        href={`/profile/${request.user.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
                        title="View Profile"
                      >
                        <ExternalLink size={18} className="text-gray-500" />
                      </a>
                    </div>

                    {/* User's Reason */}
                    {request.reason && (
                      <div className="mb-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                          <MessageSquare size={14} />
                          User's Request:
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{request.reason}</p>
                      </div>
                    )}

                    {/* Admin Comment */}
                    {request.adminComment && (
                      <div className="mb-3 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                        <p className="text-xs font-semibold text-purple-700 dark:text-purple-300 mb-2 flex items-center gap-1">
                          <Info size={14} />
                          Admin Comment:
                        </p>
                        <p className="text-sm text-purple-600 dark:text-purple-400">{request.adminComment}</p>
                        {request.reviewer && (
                          <p className="text-xs text-purple-500 dark:text-purple-400 mt-2">
                            Reviewed by: <strong>{request.reviewer.username}</strong>
                          </p>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    {request.status === 'pending' && (
                      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => setSelectedRequest(request)}
                          className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xl transition-all font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <MessageSquare size={18} />
                          Review Request
                        </button>
                      </div>
                    )}

                    {/* Review Info */}
                    {request.status !== 'pending' && request.reviewedAt && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          {request.status === 'approved' ? (
                            <CheckCircle2 size={14} className="text-green-500" />
                          ) : (
                            <XCircle size={14} className="text-red-500" />
                          )}
                          {request.status === 'approved' ? 'Approved' : 'Rejected'} on {formatDate(request.reviewedAt)}
                          {request.reviewer && ` by ${request.reviewer.username}`}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <GlassCard className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing page {page} of {totalPages} ({requests.length} request{requests.length !== 1 ? 's' : ''} on this page)
            </div>
            <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading}
                className="px-4 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2 font-medium"
          >
                <ChevronLeft size={18} />
            Previous
          </button>
              <div className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Page {page} / {totalPages}
              </div>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || isLoading}
                className="px-4 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2 font-medium"
          >
            Next
                <ChevronRight size={18} />
          </button>
        </div>
          </div>
        </GlassCard>
      )}

      {/* Review Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <GlassCard className="p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <Shield size={28} className="text-purple-500" />
                Review Verification Request
              </h3>
              <button
                onClick={() => {
                  setSelectedRequest(null);
                  setAdminComment('');
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5">
              {/* User Info */}
              <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                <Avatar
                  src={selectedRequest.user.avatarUrl || undefined}
                  alt={selectedRequest.user.username}
                  size="lg"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="font-bold text-lg">{selectedRequest.user.pseudo || selectedRequest.user.username}</p>
                    {getStatusBadge(selectedRequest.status)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
                    <span className="flex items-center gap-1">
                      <User size={14} />
                      @{selectedRequest.user.username}
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp size={14} />
                      {selectedRequest.user.reputation.toLocaleString()} reputation
                    </span>
                    <span className={`flex items-center gap-1 ${getUserAuthMethod(selectedRequest.user).color}`}>
                      {getUserAuthMethod(selectedRequest.user).icon}
                      {getUserAuthMethod(selectedRequest.user).method}
                    </span>
                    {selectedRequest.user.email && (
                      <span className="flex items-center gap-1">
                        <Mail size={14} />
                        {selectedRequest.user.email}
                      </span>
                    )}
                  </div>
                  <a
                    href={`/profile/${selectedRequest.user.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-2 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                  >
                    View Profile <ExternalLink size={14} />
                  </a>
                </div>
              </div>

              {/* User's Reason */}
              {selectedRequest.reason && (
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white flex items-center gap-2">
                    <MessageSquare size={16} />
                    User's Request
                  </label>
                  <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{selectedRequest.reason}</p>
                  </div>
                </div>
              )}

              {/* Request Date */}
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Calendar size={16} />
                Request submitted on {formatDate(selectedRequest.createdAt)}
              </div>

              {/* Admin Comment */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                  Admin Comment
                  {selectedRequest.status === 'pending' && <span className="text-red-500 ml-1">*</span>}
                  <span className="text-gray-500 dark:text-gray-400 font-normal ml-2 text-xs">
                    (Required for rejection, optional for approval)
                  </span>
                </label>
                <textarea
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                  placeholder={
                    selectedRequest.status === 'pending'
                      ? 'Add a comment explaining your decision...'
                      : 'Add a comment...'
                  }
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 outline-none transition-all resize-none"
                  minLength={selectedRequest.status === 'pending' ? 10 : 0}
                />
                {selectedRequest.status === 'pending' && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
                    <AlertCircle size={12} />
                    Minimum 10 characters required for rejection
                  </p>
                )}
                <p className={`text-xs mt-2 ${adminComment.length >= 10 ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  {adminComment.length} characters
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => handleApprove(selectedRequest)}
                  disabled={isProcessing}
                  className="flex-1 px-5 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      Approve Verification
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleReject(selectedRequest)}
                  disabled={isProcessing || adminComment.trim().length < 10}
                  className="flex-1 px-5 py-3 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-xl transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <XCircle size={18} />
                      Reject Verification
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setSelectedRequest(null);
                    setAdminComment('');
                  }}
                  className="px-5 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
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

