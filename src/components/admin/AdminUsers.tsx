import { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  MoreVertical, 
  Ban, 
  Clock, 
  CheckCircle, 
  User,
  UserCheck,
  UserX,
  Trash2,
  Eye,
  EyeOff,
  Edit,
  X,
  Loader2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import adminService from '../../services/api/admin.service';
import { Avatar } from '../Avatar';
import { GlassCard } from '../GlassCard';
import { Badge } from '../Badge';
import { VerifiedBadge } from '../VerifiedBadge';
import { ConfirmDialog } from '../ConfirmDialog';
import { useToast } from '../Toast';

interface User {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  avatarUrl?: string;
  role: 'user' | 'moderator' | 'admin' | 'super_admin';
  status: 'active' | 'suspended' | 'banned' | 'pending' | 'inactive';
  reputation: number;
  isVerified?: boolean;
  createdAt: string;
  suspendedUntil?: string;
  suspendedReason?: string;
}

export function AdminUsers() {
  const navigate = useNavigate();
  const toast = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState<'role' | 'suspend' | 'ban' | 'delete' | 'unpublish' | null>(null);
  const [modalReason, setModalReason] = useState('');
  const [modalDuration, setModalDuration] = useState(7);
  const [modalRole, setModalRole] = useState<string>('');
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
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterVerified, setFilterVerified] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setUsers([]);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load data on mount and when filters change
  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterRole, filterStatus, filterVerified, page, searchQuery]);

  // Ensure data loads on initial mount (safety net)
  useEffect(() => {
    // Load on mount if no data exists yet
    if (users.length === 0) {
      loadUsers();
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

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getUsers({
        page,
        limit: 50,
        search: searchQuery.trim() || undefined,
        role: filterRole !== 'all' ? filterRole : undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
      });
      
      let filteredUsers = data.users || data.data || [];
      
      // Filter by verified status (client-side as backend may not support it)
      if (filterVerified !== 'all') {
        filteredUsers = filteredUsers.filter((user: User) => 
          filterVerified === 'verified' ? user.isVerified : !user.isVerified
        );
      }
      
      if (page === 1) {
        setUsers(filteredUsers);
      } else {
        setUsers(prev => [...prev, ...filteredUsers]);
      }
      
      setHasMore(data.meta?.currentPage < data.meta?.lastPage);
    } catch (error) {
      console.error('Failed to load users:', error);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuspendUser = async (userId: string, reason: string, duration: number) => {
    try {
      setConfirmDialog(prev => ({ ...prev, isLoading: true }));
      await adminService.suspendUser(userId, reason, duration);
      toast.success(`User has been temporarily suspended for ${duration} day${duration > 1 ? 's' : ''}`);
      setShowModal(null);
      setModalReason('');
      setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      loadUsers();
    } catch (error: any) {
      console.error('Failed to suspend user:', error);
      toast.error(error?.response?.data?.message || 'Failed to suspend user');
      setConfirmDialog(prev => ({ ...prev, isOpen: false }));
    }
  };

  const handleUnsuspendUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    setConfirmDialog({
      isOpen: true,
      title: 'Restore User Access',
      message: `Are you sure you want to restore access for ${user?.username}? They will regain full access to the platform.`,
      variant: 'info',
      onConfirm: async () => {
        try {
          setConfirmDialog(prev => ({ ...prev, isLoading: true }));
          await adminService.unsuspendUser(userId);
          toast.success('User access has been restored and suspension lifted');
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          setShowActionMenu(null);
          loadUsers();
        } catch (error: any) {
          console.error('Failed to unsuspend user:', error);
          toast.error(error?.response?.data?.message || 'Failed to unsuspend user');
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      },
      isLoading: false,
    });
  };

  const handleBanUser = async (userId: string, reason: string) => {
    try {
      setConfirmDialog(prev => ({ ...prev, isLoading: true }));
      await adminService.banUser(userId, reason);
      toast.success('User has been permanently banned from the platform');
      setShowModal(null);
      setModalReason('');
      setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      loadUsers();
    } catch (error: any) {
      console.error('Failed to ban user:', error);
      toast.error(error?.response?.data?.message || 'Failed to ban user');
      setConfirmDialog(prev => ({ ...prev, isOpen: false }));
    }
  };

  const handleDeleteUser = async (userId: string, reason: string) => {
    try {
      setConfirmDialog(prev => ({ ...prev, isLoading: true }));
      await adminService.deleteUser(userId, reason);
      toast.success('User account has been permanently deleted');
      setShowModal(null);
      setModalReason('');
      setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      loadUsers();
    } catch (error: any) {
      console.error('Failed to delete user:', error);
      toast.error(error?.response?.data?.message || 'Failed to delete user');
      setConfirmDialog(prev => ({ ...prev, isOpen: false }));
    }
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    const user = users.find(u => u.id === userId);
    const oldRole = user?.role;
    
    if (oldRole === newRole) {
      setShowModal(null);
      setModalRole('');
      return;
    }

    try {
      setConfirmDialog(prev => ({ ...prev, isLoading: true }));
      await adminService.updateUserRole(userId, newRole);
      toast.success(`User role has been updated from ${oldRole?.replace('_', ' ')} to ${newRole.replace('_', ' ')}`);
      setShowModal(null);
      setModalRole('');
      setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      loadUsers();
    } catch (error: any) {
      console.error('Failed to update role:', error);
      toast.error(error?.response?.data?.message || 'Failed to update role');
      setConfirmDialog(prev => ({ ...prev, isOpen: false }));
    }
  };

  const handleActivateUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    setConfirmDialog({
      isOpen: true,
      title: 'Activate User Account',
      message: `Are you sure you want to activate ${user?.username}? They will regain full access to the platform.`,
      variant: 'info',
      onConfirm: async () => {
        try {
          setConfirmDialog(prev => ({ ...prev, isLoading: true }));
          await adminService.activateUser(userId);
          toast.success('User account has been activated and access restored');
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          setShowActionMenu(null);
          loadUsers();
        } catch (error: any) {
          console.error('Failed to activate user:', error);
          toast.error(error?.response?.data?.message || 'Failed to activate user');
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      },
      isLoading: false,
    });
  };

  const handleDeactivateUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    setConfirmDialog({
      isOpen: true,
      title: 'Deactivate User Account',
      message: `Are you sure you want to deactivate ${user?.username}? They will lose all access to the platform until reactivated.`,
      variant: 'warning',
      onConfirm: async () => {
        try {
          setConfirmDialog(prev => ({ ...prev, isLoading: true }));
          await adminService.deactivateUser(userId);
          toast.success('User account has been deactivated and access revoked');
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          setShowActionMenu(null);
          loadUsers();
        } catch (error: any) {
          console.error('Failed to deactivate user:', error);
          toast.error(error?.response?.data?.message || 'Failed to deactivate user');
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      },
      isLoading: false,
    });
  };

  const handleVerifyUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    setConfirmDialog({
      isOpen: true,
      title: 'Grant Verification Badge',
      message: `Are you sure you want to grant a verification badge to ${user?.username}? This badge will be displayed on their profile and content.`,
      variant: 'info',
      onConfirm: async () => {
        try {
          setConfirmDialog(prev => ({ ...prev, isLoading: true }));
          await adminService.verifyUser(userId);
          toast.success('Verification badge has been granted to the user');
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          setShowActionMenu(null);
          loadUsers();
        } catch (error: any) {
          console.error('Failed to verify user:', error);
          toast.error(error?.response?.data?.message || 'Failed to verify user');
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      },
      isLoading: false,
    });
  };

  const handleUnverifyUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    setConfirmDialog({
      isOpen: true,
      title: 'Revoke Verification Badge',
      message: `Are you sure you want to revoke the verification badge from ${user?.username}? They will lose their verified status and badge.`,
      variant: 'warning',
      onConfirm: async () => {
        try {
          setConfirmDialog(prev => ({ ...prev, isLoading: true }));
          await adminService.unverifyUser(userId);
          toast.success('Verification badge has been revoked from the user');
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          setShowActionMenu(null);
          loadUsers();
        } catch (error: any) {
          console.error('Failed to unverify user:', error);
          toast.error(error?.response?.data?.message || 'Failed to unverify user');
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      },
      isLoading: false,
    });
  };

  const handleUnpublishUserPosts = async (userId: string, reason: string) => {
    try {
      setConfirmDialog(prev => ({ ...prev, isLoading: true }));
      await adminService.unpublishUserPosts(userId, reason);
      toast.success('All user content has been unpublished and hidden from public view');
      setShowModal(null);
      setModalReason('');
      setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      loadUsers();
    } catch (error: any) {
      console.error('Failed to unpublish user posts:', error);
      toast.error(error?.response?.data?.message || 'Failed to unpublish user posts');
      setConfirmDialog(prev => ({ ...prev, isOpen: false }));
    }
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
    if (selectedItems.size === users.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(users.map(u => u.id)));
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      active: <Badge className="bg-green-500/10 text-green-600 dark:text-green-400">Active</Badge>,
      suspended: <Badge className="bg-orange-500/10 text-orange-600 dark:text-orange-400">Suspended</Badge>,
      banned: <Badge className="bg-red-500/10 text-red-600 dark:text-red-400">Banned</Badge>,
      inactive: <Badge className="bg-gray-500/10 text-gray-600 dark:text-gray-400">Inactive</Badge>,
      pending: <Badge className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">Pending</Badge>,
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      super_admin: 'from-purple-500 to-pink-500',
      admin: 'from-red-500 to-orange-500',
      moderator: 'from-blue-500 to-cyan-500',
      user: 'from-gray-500 to-gray-600',
    };
    return (
      <Badge className={`bg-gradient-to-r ${colors[role as keyof typeof colors]} text-white`}>
        {role.replace('_', ' ')}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <GlassCard className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Search size={20} className="text-gray-500" />
            <h3 className="text-lg font-semibold">Filters</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <select
              value={filterRole}
              onChange={(e) => {
                setFilterRole(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="moderator">Moderator</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="banned">Banned</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>

            <select
              value={filterVerified}
              onChange={(e) => {
                setFilterVerified(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Users</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Bulk Actions */}
      {selectedItems.size > 0 && (
        <GlassCard className="p-4 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-purple-700 dark:text-purple-300">
              {selectedItems.size} user{selectedItems.size > 1 ? 's' : ''} selected
            </span>
            <button
              onClick={() => setSelectedItems(new Set())}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </GlassCard>
      )}

      {/* Users Table */}
      <GlassCard className="overflow-hidden">
        {isLoading && users.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <User size={48} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedItems.size === users.length && users.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Reputation</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((user) => {
                  const isSelected = selectedItems.has(user.id);
                  
                  return (
                    <tr 
                      key={user.id}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${isSelected ? 'bg-purple-50 dark:bg-purple-900/20' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(user.id)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={user.avatarUrl || user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                            alt={user.username}
                            size="sm"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900 dark:text-white">{user.username}</p>
                              {user.isVerified && <VerifiedBadge size={14} />}
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
                        <span className="flex items-center gap-1 text-orange-500 font-medium">
                          ★ {user.reputation.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/profile/${user.username}`)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            title="View Profile"
                          >
                            <Eye size={16} />
                          </button>
                          <div className="relative" ref={actionMenuRef}>
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowActionMenu(showActionMenu === user.id ? null : user.id);
                              }}
                              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                              <MoreVertical size={18} />
                            </button>
                            {showActionMenu === user.id && (
                              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                                <button
                                  onClick={() => {
                                    setShowModal('role');
                                    setModalRole(user.role);
                                    setShowActionMenu(null);
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                                >
                                  <Edit size={16} />
                                  Update User Role
                                </button>
                                
                                {!user.isVerified ? (
                                  <button
                                    onClick={() => {
                                      handleVerifyUser(user.id);
                                      setShowActionMenu(null);
                                    }}
                                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-blue-600 dark:text-blue-400"
                                  >
                                    <UserCheck size={16} />
                                    Grant Verification Badge
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => {
                                      handleUnverifyUser(user.id);
                                      setShowActionMenu(null);
                                    }}
                                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-600 dark:text-gray-400"
                                  >
                                    <UserX size={16} />
                                    Revoke Verification Badge
                                  </button>
                                )}

                                {user.status === 'active' || user.status === 'inactive' ? (
                                  <>
                                    {user.status === 'active' ? (
                                      <button
                                        onClick={() => {
                                          handleDeactivateUser(user.id);
                                          setShowActionMenu(null);
                                        }}
                                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-orange-600 dark:text-orange-400"
                                      >
                                        <UserX size={16} />
                                        Deactivate User Account
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => {
                                          handleActivateUser(user.id);
                                          setShowActionMenu(null);
                                        }}
                                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-green-600 dark:text-green-400"
                                      >
                                        <UserCheck size={16} />
                                        Activate User Account
                                      </button>
                                    )}
                                    <button
                                      onClick={() => {
                                        setShowModal('suspend');
                                        setShowActionMenu(null);
                                      }}
                                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-orange-600 dark:text-orange-400"
                                    >
                                      <Clock size={16} />
                                      Temporarily Suspend User
                                    </button>
                                  </>
                                ) : user.status === 'suspended' ? (
                                  <button
                                    onClick={() => {
                                      handleUnsuspendUser(user.id);
                                      setShowActionMenu(null);
                                    }}
                                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-green-600 dark:text-green-400"
                                  >
                                    <CheckCircle size={16} />
                                    Restore User Access
                                  </button>
                                ) : null}

                                <button
                                  onClick={() => {
                                    setShowModal('ban');
                                    setShowActionMenu(null);
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-red-600 dark:text-red-400"
                                >
                                  <Ban size={16} />
                                  Permanently Ban User
                                </button>

                                <button
                                  onClick={() => {
                                    setShowModal('unpublish');
                                    setShowActionMenu(null);
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-orange-600 dark:text-orange-400"
                                >
                                  <EyeOff size={16} />
                                  Unpublish All User Content
                                </button>

                                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

                                <button
                                  onClick={() => {
                                    setShowModal('delete');
                                    setShowActionMenu(null);
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-red-600 dark:text-red-400"
                                >
                                  <Trash2 size={16} />
                                  Permanently Delete User
                                </button>
                              </div>
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

      {/* Modals */}
      {showModal && selectedUser && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => {
              setShowModal(null);
              setModalReason('');
              setModalRole('');
            }}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <GlassCard className="max-w-md w-full p-6 animate-scale-in">
              {showModal === 'role' && (
                <>
                  <h3 className="text-xl font-bold mb-4">Change User Role</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">New Role</label>
                      <select
                        value={modalRole}
                        onChange={(e) => setModalRole(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                      >
                        <option value="user">User</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          if (selectedUser && modalRole !== selectedUser.role) {
                            setConfirmDialog({
                              isOpen: true,
                              title: 'Update User Role',
                              message: `Are you sure you want to update ${selectedUser.username}'s role from ${selectedUser.role.replace('_', ' ')} to ${modalRole.replace('_', ' ')}? This will change their permissions and access levels on the platform.`,
                              variant: 'warning',
                              onConfirm: async () => {
                                await handleChangeRole(selectedUser.id, modalRole);
                                setShowModal(null);
                                setModalRole('');
                              },
                              isLoading: false,
                            });
                          } else {
                            setShowModal(null);
                            setModalRole('');
                          }
                        }}
                        className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                      >
                        Update Role
                      </button>
                      <button
                        onClick={() => {
                          setShowModal(null);
                          setModalRole('');
                        }}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </>
              )}

              {showModal === 'suspend' && (
                <>
                  <h3 className="text-xl font-bold mb-4">Temporarily Suspend User</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Duration (days)</label>
                      <input
                        type="number"
                        value={modalDuration}
                        onChange={(e) => setModalDuration(Number(e.target.value))}
                        min="1"
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Reason</label>
                      <textarea
                        value={modalReason}
                        onChange={(e) => setModalReason(e.target.value)}
                        placeholder="Enter reason for suspension..."
                        rows={3}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          if (selectedUser && modalReason.trim()) {
                            setConfirmDialog({
                              isOpen: true,
                              title: 'Temporarily Suspend User',
                              message: `Are you sure you want to temporarily suspend ${selectedUser.username} for ${modalDuration} day${modalDuration > 1 ? 's' : ''}? The user will lose access to the platform during this period.`,
                              variant: 'warning',
                              onConfirm: async () => {
                                await handleSuspendUser(selectedUser.id, modalReason, modalDuration);
                                setShowModal(null);
                                setModalReason('');
                              },
                              isLoading: false,
                            });
                          } else {
                            toast.warning('Please provide a reason for suspension');
                          }
                        }}
                        className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                      >
                        Suspend User Account
                      </button>
                      <button
                        onClick={() => {
                          setShowModal(null);
                          setModalReason('');
                        }}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </>
              )}

              {showModal === 'ban' && (
                <>
                  <h3 className="text-xl font-bold mb-4">Permanently Ban User</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Reason</label>
                      <textarea
                        value={modalReason}
                        onChange={(e) => setModalReason(e.target.value)}
                        placeholder="Enter reason for ban..."
                        rows={3}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          if (selectedUser && modalReason.trim()) {
                            setConfirmDialog({
                              isOpen: true,
                              title: 'Permanently Ban User',
                              message: `Are you sure you want to permanently ban ${selectedUser.username}? This action cannot be undone and the user will lose all access to the platform permanently.`,
                              variant: 'danger',
                              onConfirm: async () => {
                                await handleBanUser(selectedUser.id, modalReason);
                                setShowModal(null);
                                setModalReason('');
                              },
                              isLoading: false,
                            });
                          } else {
                            toast.warning('Please provide a reason for the ban');
                          }
                        }}
                        className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                      >
                        Permanently Ban User
                      </button>
                      <button
                        onClick={() => {
                          setShowModal(null);
                          setModalReason('');
                        }}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </>
              )}

              {showModal === 'delete' && (
                <>
                  <h3 className="text-xl font-bold mb-4 text-red-600 dark:text-red-400">Permanently Delete User</h3>
                  <div className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-400">
                      This action cannot be undone. All user data, content, and associated information will be permanently deleted from the platform.
                    </p>
                    <div>
                      <label className="block text-sm font-medium mb-2">Reason</label>
                      <textarea
                        value={modalReason}
                        onChange={(e) => setModalReason(e.target.value)}
                        placeholder="Enter reason for deletion..."
                        rows={3}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          if (selectedUser && modalReason.trim()) {
                            setConfirmDialog({
                              isOpen: true,
                              title: 'Permanently Delete User',
                              message: `Are you sure you want to permanently delete ${selectedUser.username}? This action cannot be undone and all user data, content, posts, and associated information will be permanently removed from the platform.`,
                              variant: 'danger',
                              onConfirm: async () => {
                                await handleDeleteUser(selectedUser.id, modalReason);
                                setShowModal(null);
                                setModalReason('');
                              },
                              isLoading: false,
                            });
                          } else {
                            toast.warning('Please provide a reason for deletion');
                          }
                        }}
                        className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                      >
                        Permanently Delete User
                      </button>
                      <button
                        onClick={() => {
                          setShowModal(null);
                          setModalReason('');
                        }}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </>
              )}

              {showModal === 'unpublish' && (
                <>
                  <h3 className="text-xl font-bold mb-4">Unpublish All User Content</h3>
                  <div className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-400">
                      This will unpublish all content created by {selectedUser.username}. All posts will be hidden from public view but can be restored later.
                    </p>
                    <div>
                      <label className="block text-sm font-medium mb-2">Reason</label>
                      <textarea
                        value={modalReason}
                        onChange={(e) => setModalReason(e.target.value)}
                        placeholder="Enter reason for unpublishing..."
                        rows={3}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          if (selectedUser && modalReason.trim()) {
                            setConfirmDialog({
                              isOpen: true,
                              title: 'Unpublish All User Content',
                              message: `Are you sure you want to unpublish all content created by ${selectedUser.username}? All posts will be hidden from public view but can be restored later.`,
                              variant: 'warning',
                              onConfirm: async () => {
                                await handleUnpublishUserPosts(selectedUser.id, modalReason);
                                setShowModal(null);
                                setModalReason('');
                              },
                              isLoading: false,
                            });
                          } else {
                            toast.warning('Please provide a reason for unpublishing');
                          }
                        }}
                        className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                      >
                        Unpublish All Content
                      </button>
                      <button
                        onClick={() => {
                          setShowModal(null);
                          setModalReason('');
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

