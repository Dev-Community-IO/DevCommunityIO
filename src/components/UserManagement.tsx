import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MoreVertical, Ban, Clock, CheckCircle, Shield, AlertTriangle, Star, X, UserX, UserCheck, Eye, Edit, BadgeCheck, FileX, Trash2 } from 'lucide-react';
import adminService from '../services/api/admin.service';
import { Avatar } from './Avatar';
import { GlassCard } from './GlassCard';
import { useToast } from './Toast';

interface User {
  id: string;
  username: string;
  email?: string;
  avatar: string;
  avatarUrl?: string;
  role: 'user' | 'moderator' | 'admin' | 'super_admin';
  status: 'active' | 'suspended' | 'banned' | 'pending';
  reputation: number;
  createdAt: string;
  suspendedUntil?: string;
  suspendedReason?: string;
  isSpam?: boolean;
  isTrusted?: boolean;
  isVerified?: boolean;
}

export function UserManagement() {
  const navigate = useNavigate();
  const toast = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const [showSpamModal, setShowSpamModal] = useState(false);
  const [showTrustedModal, setShowTrustedModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showUnpublishModal, setShowUnpublishModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionComment, setActionComment] = useState('');
  const [actionReason, setActionReason] = useState('');
  const [suspendDuration, setSuspendDuration] = useState(7);
  const [selectedRole, setSelectedRole] = useState<string>('user');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [filterRole, filterStatus]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getUsers({
        search: searchQuery,
        role: filterRole !== 'all' ? filterRole : undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
      });
      setUsers(data.users || data.data || []);
    } catch (error: any) {
      console.error('Failed to load users:', error);
      toast.error(error?.response?.data?.message || 'Failed to load users');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadUsers();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleMarkSpam = async () => {
    if (!selectedUser || !actionComment.trim()) {
      toast.warning('Please provide a comment explaining why this user is being marked as spam');
      return;
    }

    try {
      setIsProcessing(true);
      await adminService.markSpam(selectedUser.id, actionComment);
      setShowSpamModal(false);
      setActionComment('');
      setSelectedUser(null);
      await loadUsers();
      toast.success('User marked as spam successfully. User has been notified.');
    } catch (error: any) {
      console.error('Failed to mark user as spam:', error);
      toast.error(error?.response?.data?.message || 'Failed to mark user as spam');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnmarkSpam = async (userId: string) => {
    if (!confirm('Are you sure you want to remove spam status from this user?')) {
      return;
    }

    try {
      await adminService.unmarkSpam(userId);
      await loadUsers();
      toast.success('Spam status removed successfully. User has been notified.');
    } catch (error: any) {
      console.error('Failed to unmark spam:', error);
      toast.error(error?.response?.data?.message || 'Failed to remove spam status');
    }
  };

  const handleMarkTrusted = async () => {
    if (!selectedUser) return;

    try {
      setIsProcessing(true);
      await adminService.markTrusted(selectedUser.id);
      setShowTrustedModal(false);
      setSelectedUser(null);
      await loadUsers();
      toast.success('User marked as trusted successfully. User has been notified.');
    } catch (error: any) {
      console.error('Failed to mark user as trusted:', error);
      toast.error(error?.response?.data?.message || 'Failed to mark user as trusted');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnmarkTrusted = async (userId: string) => {
    if (!confirm('Are you sure you want to remove trusted status from this user?')) {
      return;
    }

    try {
      await adminService.unmarkTrusted(userId);
      await loadUsers();
      toast.success('Trusted status removed successfully. User has been notified.');
    } catch (error: any) {
      console.error('Failed to unmark trusted:', error);
      toast.error(error?.response?.data?.message || 'Failed to remove trusted status');
    }
  };

  const handleDeactivate = async () => {
    if (!selectedUser || !actionComment.trim()) {
      toast.warning('Please provide a comment explaining why this user is being deactivated');
      return;
    }

    try {
      setIsProcessing(true);
      await adminService.deactivateUser(selectedUser.id, actionComment);
      setShowDeactivateModal(false);
      setActionComment('');
      setSelectedUser(null);
      await loadUsers();
      toast.success('User deactivated successfully. User has been notified via email and in-app notification.');
    } catch (error: any) {
      console.error('Failed to deactivate user:', error);
      toast.error(error?.response?.data?.message || 'Failed to deactivate user');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleActivate = async (userId: string) => {
    if (!confirm('Are you sure you want to activate this user?')) {
      return;
    }

    try {
      await adminService.activateUser(userId);
      await loadUsers();
      toast.success('User activated successfully. User has been notified.');
    } catch (error: any) {
      console.error('Failed to activate user:', error);
      toast.error(error?.response?.data?.message || 'Failed to activate user');
    }
  };

  const handleBanUser = async () => {
    if (!selectedUser || !actionComment.trim()) {
      toast.warning('Please provide a reason for banning this user');
      return;
    }

    try {
      setIsProcessing(true);
      await adminService.banUser(selectedUser.id, actionComment);
      setShowBanModal(false);
      setActionComment('');
      setSelectedUser(null);
      await loadUsers();
      toast.success('User banned successfully. User has been notified.');
    } catch (error: any) {
      console.error('Failed to ban user:', error);
      toast.error(error?.response?.data?.message || 'Failed to ban user');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSuspendUser = async () => {
    if (!selectedUser || !actionReason.trim()) {
      toast.warning('Please provide a reason for suspending this user');
      return;
    }

    try {
      setIsProcessing(true);
      await adminService.suspendUser(selectedUser.id, actionReason, suspendDuration);
      setShowSuspendModal(false);
      setActionReason('');
      setSuspendDuration(7);
      setSelectedUser(null);
      await loadUsers();
      toast.success(`User suspended successfully for ${suspendDuration} days. User has been notified.`);
    } catch (error: any) {
      console.error('Failed to suspend user:', error);
      toast.error(error?.response?.data?.message || 'Failed to suspend user');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnsuspendUser = async (userId: string) => {
    if (!confirm('Are you sure you want to unsuspend this user?')) {
      return;
    }

    try {
      await adminService.unsuspendUser(userId);
      await loadUsers();
      toast.success('User unsuspended successfully. User has been notified.');
    } catch (error: any) {
      console.error('Failed to unsuspend user:', error);
      toast.error(error?.response?.data?.message || 'Failed to unsuspend user');
    }
  };

  const handleChangeRole = async () => {
    if (!selectedUser) return;

    try {
      setIsProcessing(true);
      await adminService.updateUserRole(selectedUser.id, selectedRole);
      setShowRoleModal(false);
      setSelectedUser(null);
      await loadUsers();
      toast.success(`User role updated to ${selectedRole} successfully. User has been notified.`);
    } catch (error: any) {
      console.error('Failed to update role:', error);
      toast.error(error?.response?.data?.message || 'Failed to update role');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyUser = async (userId: string) => {
    if (!confirm('Are you sure you want to grant verification badge to this user?')) {
      return;
    }

    try {
      await adminService.verifyUser(userId);
      await loadUsers();
      toast.success('User verified successfully. Verification badge granted. User has been notified.');
    } catch (error: any) {
      console.error('Failed to verify user:', error);
      toast.error(error?.response?.data?.message || 'Failed to verify user');
    }
  };

  const handleUnverifyUser = async (userId: string) => {
    if (!confirm('Are you sure you want to remove verification badge from this user?')) {
      return;
    }

    try {
      await adminService.unverifyUser(userId);
      await loadUsers();
      toast.success('Verification badge removed successfully. User has been notified.');
    } catch (error: any) {
      console.error('Failed to unverify user:', error);
      toast.error(error?.response?.data?.message || 'Failed to remove verification');
    }
  };

  const handleUnpublishContent = async () => {
    if (!selectedUser || !actionReason.trim()) {
      toast.warning('Please provide a reason for unpublishing all user content');
      return;
    }

    try {
      setIsProcessing(true);
      await adminService.unpublishUserContent(selectedUser.id, actionReason);
      setShowUnpublishModal(false);
      setActionReason('');
      setSelectedUser(null);
      await loadUsers();
      toast.success('All user content unpublished successfully. User has been notified via email and in-app notification.');
    } catch (error: any) {
      console.error('Failed to unpublish user content:', error);
      toast.error(error?.response?.data?.message || 'Failed to unpublish user content');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser || !actionReason.trim()) {
      toast.warning('Please provide a reason for deleting this user');
      return;
    }

    if (!confirm(`Are you absolutely sure you want to permanently delete user @${selectedUser.username}? This action cannot be undone.`)) {
      return;
    }

    try {
      setIsProcessing(true);
      await adminService.deleteUser(selectedUser.id, actionReason);
      setShowDeleteModal(false);
      setActionReason('');
      setSelectedUser(null);
      await loadUsers();
      toast.success('User deleted successfully. User has been notified via email.');
    } catch (error: any) {
      console.error('Failed to delete user:', error);
      toast.error(error?.response?.data?.message || 'Failed to delete user');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500/10 text-green-600 dark:text-green-400">Active</span>;
      case 'suspended':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400">Suspended</span>;
      case 'banned':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-500/10 text-red-600 dark:text-red-400">Banned</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-500/10 text-gray-600 dark:text-gray-400">Pending</span>;
    }
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      super_admin: 'from-purple-500 to-pink-500',
      admin: 'from-red-500 to-orange-500',
      moderator: 'from-blue-500 to-cyan-500',
      user: 'from-gray-500 to-gray-600',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full bg-gradient-to-r ${colors[role as keyof typeof colors]} text-white`}>
        {role.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <GlassCard className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadUsers()}
              placeholder="Search users..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="moderator">Moderator</option>
            <option value="admin">Admin</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
          </select>
        </div>
      </GlassCard>

      {/* Users Table */}
      <GlassCard className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-600 dark:text-gray-400">No users found</p>
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">User</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Role</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Reputation</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Joined</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar src={(user.avatar ?? user.avatarUrl) ?? ''} alt={user.username} size="sm" />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{user.username}</p>
                          {user.isSpam && (
                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-500/10 text-red-600 dark:text-red-400 flex items-center gap-1">
                              <AlertTriangle size={12} />
                              Spam
                            </span>
                          )}
                          {user.isTrusted && (
                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center gap-1">
                              <Star size={12} />
                              Trusted
                            </span>
                          )}
                        </div>
                        {user.email && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                  <td className="px-6 py-4">{getStatusBadge(user.status)}</td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1 text-orange-500">
                      ★ {user.reputation}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate(`/profile/${user.username}`)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="View User Profile"
                      >
                        <Eye size={18} />
                      </button>
                      <div className="relative inline-block">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowActionMenu(showActionMenu === user.id ? null : user.id);
                          }}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <MoreVertical size={18} />
                        </button>
                      {showActionMenu === user.id && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setShowActionMenu(null)}
                          />
                          <div 
                            className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-[60] max-h-[80vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* Basic Actions */}
                            <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase border-b border-gray-200 dark:border-gray-700">
                              User Actions
                            </div>
                            <button
                              onClick={() => {
                                navigate(`/profile/${user.username}`);
                                setShowActionMenu(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                              <Eye size={16} />
                              View User Profile
                            </button>

                            {/* Role Management */}
                            <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase border-b border-gray-200 dark:border-gray-700 mt-1">
                              Role Management
                            </div>
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setSelectedRole(user.role);
                                setShowRoleModal(true);
                                setShowActionMenu(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-blue-600 dark:text-blue-400"
                            >
                              <Edit size={16} />
                              Update User Role
                            </button>
                            {user.isVerified ? (
                              <button
                                onClick={() => {
                                  handleUnverifyUser(user.id);
                                  setShowActionMenu(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-blue-600 dark:text-blue-400"
                              >
                                <X size={16} />
                                Remove Verification Badge
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  handleVerifyUser(user.id);
                                  setShowActionMenu(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-blue-600 dark:text-blue-400"
                              >
                                <BadgeCheck size={16} />
                                Grant Verification Badge
                              </button>
                            )}

                            {/* Status Management */}
                            <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase border-b border-gray-200 dark:border-gray-700 mt-1">
                              Status Management
                            </div>
                            {user.status === 'active' ? (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setActionComment('');
                                    setShowDeactivateModal(true);
                                    setShowActionMenu(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-orange-600 dark:text-orange-400"
                                >
                                  <UserX size={16} />
                                  Deactivate User Account
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setActionReason('');
                                    setSuspendDuration(7);
                                    setShowSuspendModal(true);
                                    setShowActionMenu(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-orange-600 dark:text-orange-400"
                                >
                                  <Clock size={16} />
                                  Temporarily Suspend User
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setActionComment('');
                                    setShowBanModal(true);
                                    setShowActionMenu(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-red-600 dark:text-red-400"
                                >
                                  <Ban size={16} />
                                  Permanently Ban User
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setActionReason('');
                                    setShowUnpublishModal(true);
                                    setShowActionMenu(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-orange-600 dark:text-orange-400"
                                >
                                  <FileX size={16} />
                                  Unpublish All User Content
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setActionReason('');
                                    setShowDeleteModal(true);
                                    setShowActionMenu(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-red-600 dark:text-red-400"
                                >
                                  <Trash2 size={16} />
                                  Permanently Delete User
                                </button>
                              </>
                            ) : user.status === 'suspended' ? (
                              <button
                                onClick={() => {
                                  handleUnsuspendUser(user.id);
                                  setShowActionMenu(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-green-600 dark:text-green-400"
                              >
                                <CheckCircle size={16} />
                                Unsuspend
                              </button>
                            ) : user.status === 'pending' ? (
                              <button
                                onClick={() => {
                                  handleActivate(user.id);
                                  setShowActionMenu(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-green-600 dark:text-green-400"
                              >
                                <UserCheck size={16} />
                                Activate
                              </button>
                            ) : null}

                            {/* Spam & Trusted Management */}
                            <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase border-b border-gray-200 dark:border-gray-700 mt-1">
                              Spam & Trusted
                            </div>
                            {user.isSpam ? (
                              <button
                                onClick={() => {
                                  handleUnmarkSpam(user.id);
                                  setShowActionMenu(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-orange-600 dark:text-orange-400"
                              >
                                <CheckCircle size={16} />
                                Remove Spam Status
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setActionComment('');
                                  setShowSpamModal(true);
                                  setShowActionMenu(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-orange-600 dark:text-orange-400"
                              >
                                <AlertTriangle size={16} />
                                Mark as Spam
                              </button>
                            )}
                            {user.isTrusted ? (
                              <button
                                onClick={() => {
                                  handleUnmarkTrusted(user.id);
                                  setShowActionMenu(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-blue-600 dark:text-blue-400"
                              >
                                <X size={16} />
                                Remove Trusted Status
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowTrustedModal(true);
                                  setShowActionMenu(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-blue-600 dark:text-blue-400"
                              >
                                <Star size={16} />
                                Mark as Trusted
                              </button>
                            )}
                          </div>
                        </>
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
      </GlassCard>

      {/* Mark as Spam Modal */}
      {showSpamModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <GlassCard className="max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="text-orange-500" size={20} />
              Mark User as Spam
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              You are about to mark <strong>@{selectedUser.username}</strong> as spam. This will restrict their posting to once every 24 hours.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Comment (required) - This will be sent to the user
              </label>
              <textarea
                value={actionComment}
                onChange={(e) => setActionComment(e.target.value)}
                placeholder="Explain why this user is being marked as spam..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[100px]"
                required
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowSpamModal(false);
                  setActionComment('');
                  setSelectedUser(null);
                }}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={handleMarkSpam}
                disabled={isProcessing || !actionComment.trim()}
                className="px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Mark as Spam'}
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Mark as Trusted Modal */}
      {showTrustedModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <GlassCard className="max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Star className="text-blue-500" size={20} />
              Mark User as Trusted
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              You are about to mark <strong>@{selectedUser.username}</strong> as trusted. This will remove all cooldown restrictions and grant them enhanced features.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowTrustedModal(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={handleMarkTrusted}
                disabled={isProcessing}
                className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Mark as Trusted'}
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Deactivate User Modal */}
      {showDeactivateModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <GlassCard className="max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <UserX className="text-red-500" size={20} />
              Deactivate User
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              You are about to deactivate <strong>@{selectedUser.username}</strong>. They will not be able to perform any actions until reactivated.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Comment (required) - This will be sent to the user via email and notification
              </label>
              <textarea
                value={actionComment}
                onChange={(e) => setActionComment(e.target.value)}
                placeholder="Explain why this user is being deactivated..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[100px]"
                required
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeactivateModal(false);
                  setActionComment('');
                  setSelectedUser(null);
                }}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={handleDeactivate}
                disabled={isProcessing || !actionComment.trim()}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Deactivate User'}
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Ban User Modal */}
      {showBanModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <GlassCard className="max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Ban className="text-red-500" size={20} />
              Ban User
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              You are about to ban <strong>@{selectedUser.username}</strong>. This is a permanent action.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Reason (required) - This will be sent to the user
              </label>
              <textarea
                value={actionComment}
                onChange={(e) => setActionComment(e.target.value)}
                placeholder="Explain why this user is being banned..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[100px]"
                required
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowBanModal(false);
                  setActionComment('');
                  setSelectedUser(null);
                }}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={handleBanUser}
                disabled={isProcessing || !actionComment.trim()}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Ban User'}
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Suspend User Modal */}
      {showSuspendModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <GlassCard className="max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="text-orange-500" size={20} />
              Suspend User
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              You are about to suspend <strong>@{selectedUser.username}</strong>. They will not be able to perform actions until the suspension period ends.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Reason (required) - This will be sent to the user
              </label>
              <textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="Explain why this user is being suspended..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[100px]"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Duration (days)
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={suspendDuration}
                onChange={(e) => setSuspendDuration(parseInt(e.target.value) || 7)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowSuspendModal(false);
                  setActionReason('');
                  setSuspendDuration(7);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={handleSuspendUser}
                disabled={isProcessing || !actionReason.trim()}
                className="px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Suspend User'}
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Change Role Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <GlassCard className="max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Shield className="text-blue-500" size={20} />
              Change User Role
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              You are about to change the role of <strong>@{selectedUser.username}</strong> from <strong>{selectedUser.role}</strong> to a new role.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                New Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="user">User</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Current role: <span className="font-medium">{selectedUser.role}</span>
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={handleChangeRole}
                disabled={isProcessing || selectedRole === selectedUser.role}
                className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Change Role'}
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Unpublish All Content Modal */}
      {showUnpublishModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <GlassCard className="max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileX className="text-orange-500" size={20} />
              Unpublish All User Content
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              You are about to unpublish all published content from <strong>@{selectedUser.username}</strong>. All their posts will be archived.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Reason (required) - This will be sent to the user via email and notification
              </label>
              <textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="Explain why all user content is being unpublished..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[100px]"
                required
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowUnpublishModal(false);
                  setActionReason('');
                  setSelectedUser(null);
                }}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={handleUnpublishContent}
                disabled={isProcessing || !actionReason.trim()}
                className="px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Unpublish All Content'}
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Delete User Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <GlassCard className="max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Trash2 className="text-red-500" size={20} />
              Permanently Delete User
            </h3>
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm font-semibold text-red-800 dark:text-red-200 mb-2">
                ⚠️ Warning: This action cannot be undone!
              </p>
              <p className="text-sm text-red-700 dark:text-red-300">
                You are about to permanently delete <strong>@{selectedUser.username}</strong>. This will remove all their data and cannot be reversed.
              </p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Reason (required) - This will be sent to the user via email
              </label>
              <textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="Explain why this user is being permanently deleted..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[100px]"
                required
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setActionReason('');
                  setSelectedUser(null);
                }}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={isProcessing || !actionReason.trim()}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Delete User Permanently'}
              </button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}

