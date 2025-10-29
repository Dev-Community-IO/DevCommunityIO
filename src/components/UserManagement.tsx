import { useState, useEffect } from 'react';
import { Search, MoreVertical, Ban, Clock, CheckCircle, Shield } from 'lucide-react';
import adminService from '../services/api/admin.service';
import { Avatar } from './Avatar';
import { GlassCard } from './GlassCard';

interface User {
  id: string;
  username: string;
  email?: string;
  avatar: string;
  role: 'user' | 'moderator' | 'admin' | 'super_admin';
  status: 'active' | 'suspended' | 'banned' | 'pending';
  reputation: number;
  createdAt: string;
  suspendedUntil?: string;
  suspendedReason?: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, [filterRole, filterStatus]);

  const loadUsers = async () => {
    try {
      const data = await adminService.getUsers({
        search: searchQuery,
        role: filterRole !== 'all' ? filterRole : undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
      });
      setUsers(data.users || []);
    } catch (error) {
      console.error('Failed to load users:', error);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuspendUser = async (userId: string, reason: string, duration: number) => {
    try {
      await adminService.suspendUser(userId, reason, duration);
      loadUsers();
    } catch (error) {
      console.error('Failed to suspend user:', error);
    }
  };

  const handleUnsuspendUser = async (userId: string) => {
    try {
      await adminService.unsuspendUser(userId);
      loadUsers();
    } catch (error) {
      console.error('Failed to unsuspend user:', error);
    }
  };

  const handleBanUser = async (userId: string, reason: string) => {
    try {
      await adminService.banUser(userId, reason);
      loadUsers();
    } catch (error) {
      console.error('Failed to ban user:', error);
    }
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      await adminService.updateUserRole(userId, newRole);
      loadUsers();
    } catch (error) {
      console.error('Failed to update role:', error);
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
                      <Avatar src={user.avatar} alt={user.username} size="sm" />
                      <div>
                        <p className="font-medium">{user.username}</p>
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
                    <div className="relative inline-block">
                      <button
                        onClick={() => setShowActionMenu(showActionMenu === user.id ? null : user.id)}
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
                          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                            <button
                              onClick={() => {
                                handleChangeRole(user.id, 'moderator');
                                setShowActionMenu(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                              <Shield size={16} />
                              Make Moderator
                            </button>
                            {user.status === 'active' ? (
                              <button
                                onClick={() => {
                                  handleSuspendUser(user.id, 'Violation of terms', 7);
                                  setShowActionMenu(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-orange-600 dark:text-orange-400"
                              >
                                <Clock size={16} />
                                Suspend
                              </button>
                            ) : (
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
                            )}
                            <button
                              onClick={() => {
                                handleBanUser(user.id, 'Severe violation');
                                setShowActionMenu(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-red-600 dark:text-red-400"
                            >
                              <Ban size={16} />
                              Ban User
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}

