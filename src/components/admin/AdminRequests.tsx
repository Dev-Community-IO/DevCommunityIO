import { useState, useEffect } from 'react';
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
  X
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
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [adminComment, setAdminComment] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadRequests();
  }, [statusFilter, page]);

  const loadRequests = async () => {
    try {
      setIsLoading(true);
      const response = await adminService.getVerificationRequests(statusFilter === 'all' ? undefined : statusFilter, page);
      setRequests(response.requests || []);
      setTotalPages(response.meta?.last_page || 1);
    } catch (error: any) {
      console.error('Failed to load verification requests:', error);
      toast.error('Failed to load verification requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (request: VerificationRequest) => {
    if (!adminComment.trim() && !confirm('Approve without adding a comment?')) {
      return;
    }

    try {
      setIsProcessing(true);
      await adminService.approveVerification(request.userId, adminComment || undefined);
      toast.success(`Verification approved for ${request.user.username}`);
      setSelectedRequest(null);
      setAdminComment('');
      await loadRequests();
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

    try {
      setIsProcessing(true);
      await adminService.rejectVerification(request.userId, adminComment);
      toast.success(`Verification rejected for ${request.user.username}`);
      setSelectedRequest(null);
      setAdminComment('');
      await loadRequests();
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

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{pendingCount}</p>
            </div>
            <Clock size={24} className="text-yellow-500" />
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Approved</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{approvedCount}</p>
            </div>
            <CheckCircle2 size={24} className="text-green-500" />
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Rejected</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{rejectedCount}</p>
            </div>
            <XCircle size={24} className="text-red-500" />
          </div>
        </GlassCard>
      </div>

      {/* Filters */}
      <GlassCard className="p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter:</span>
          {(['pending', 'approved', 'rejected', 'all'] as const).map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setPage(1);
              }}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Requests List */}
      {isLoading ? (
        <GlassCard className="p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
          </div>
        </GlassCard>
      ) : requests.length === 0 ? (
        <GlassCard className="p-8 text-center">
          <Shield size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <h3 className="text-lg font-bold mb-2">No Verification Requests</h3>
          <p className="text-gray-500 dark:text-gray-400">
            {statusFilter === 'all' 
              ? 'No verification requests found.'
              : `No ${statusFilter} verification requests found.`}
          </p>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => {
            const authMethod = getUserAuthMethod(request.user);
            return (
              <GlassCard key={request.id} className="p-6">
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
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                            {request.user.pseudo || request.user.username}
                          </h3>
                          {getStatusBadge(request.status)}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
                          <span className="flex items-center gap-1">
                            <User size={14} />
                            @{request.user.username}
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp size={14} />
                            {request.user.reputation} rep
                          </span>
                          <span className={`flex items-center gap-1 ${authMethod.color}`}>
                            {authMethod.icon}
                            {authMethod.method}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {formatDate(request.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* User's Reason */}
                    {request.reason && (
                      <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          User's Request:
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{request.reason}</p>
                      </div>
                    )}

                    {/* Admin Comment */}
                    {request.adminComment && (
                      <div className="mb-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <p className="text-xs font-semibold text-purple-700 dark:text-purple-300 mb-1">
                          Admin Comment:
                        </p>
                        <p className="text-sm text-purple-600 dark:text-purple-400">{request.adminComment}</p>
                        {request.reviewer && (
                          <p className="text-xs text-purple-500 dark:text-purple-400 mt-1">
                            Reviewed by: {request.reviewer.username}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    {request.status === 'pending' && (
                      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => setSelectedRequest(request)}
                          className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
                        >
                          <MessageSquare size={16} />
                          Review Request
                        </button>
                      </div>
                    )}

                    {/* Review Info */}
                    {request.status !== 'pending' && request.reviewedAt && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
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
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Review Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <GlassCard className="p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Review Verification Request</h3>
              <button
                onClick={() => {
                  setSelectedRequest(null);
                  setAdminComment('');
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* User Info */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Avatar
                  src={selectedRequest.user.avatarUrl || undefined}
                  alt={selectedRequest.user.username}
                  size="md"
                />
                <div>
                  <p className="font-bold">{selectedRequest.user.pseudo || selectedRequest.user.username}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    @{selectedRequest.user.username} • {selectedRequest.user.reputation} reputation
                  </p>
                </div>
              </div>

              {/* User's Reason */}
              {selectedRequest.reason && (
                <div>
                  <label className="block text-sm font-medium mb-2">User's Request</label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-300">{selectedRequest.reason}</p>
                  </div>
                </div>
              )}

              {/* Admin Comment */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Admin Comment {selectedRequest.status === 'pending' && <span className="text-red-500">*</span>}
                </label>
                <textarea
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                  placeholder={
                    selectedRequest.status === 'pending'
                      ? 'Add a comment (required for rejection, optional for approval)'
                      : 'Add a comment...'
                  }
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                  minLength={selectedRequest.status === 'pending' ? 10 : 0}
                />
                {selectedRequest.status === 'pending' && (
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum 10 characters required for rejection
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => handleApprove(selectedRequest)}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      Approve
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleReject(selectedRequest)}
                  disabled={isProcessing || adminComment.trim().length < 10}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <XCircle size={16} />
                      Reject
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setSelectedRequest(null);
                    setAdminComment('');
                  }}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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

