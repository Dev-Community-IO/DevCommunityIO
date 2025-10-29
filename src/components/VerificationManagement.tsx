import { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Award } from 'lucide-react';
import { Avatar } from './Avatar';
import { GlassCard } from './GlassCard';
import adminService from '../services/api/admin.service';

interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  isVerified: boolean;
  reputation: number;
  stats: {
    posts: number;
    followers: number;
  };
  createdAt: string;
}

export function VerificationManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, [filter]);

  const loadUsers = async () => {
    try {
      const data = await adminService.getUsers({
        search: searchQuery,
        verified: filter === 'verified' ? true : filter === 'unverified' ? false : undefined,
      });
      setUsers(data.users || []);
    } catch (error) {
      console.error('Failed to load users:', error);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (userId: string) => {
    try {
      await adminService.verifyUser(userId);
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, isVerified: true } : user
        )
      );
    } catch (error) {
      console.error('Failed to verify user:', error);
    }
  };

  const handleUnverify = async (userId: string) => {
    try {
      await adminService.unverifyUser(userId);
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, isVerified: false } : user
        )
      );
    } catch (error) {
      console.error('Failed to unverify user:', error);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Award className="text-blue-500" size={28} />
            Verification Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Manage user verification badges
          </p>
        </div>
      </div>

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
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-3 rounded-xl font-medium transition-all ${
                filter === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('verified')}
              className={`px-4 py-3 rounded-xl font-medium transition-all ${
                filter === 'verified'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Verified
            </button>
            <button
              onClick={() => setFilter('unverified')}
              className={`px-4 py-3 rounded-xl font-medium transition-all ${
                filter === 'unverified'
                  ? 'bg-gray-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Unverified
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Users List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Loading users...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">No users found</p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {filteredUsers.map((user) => (
            <GlassCard key={user.id} className="p-5">
              <div className="flex items-center gap-4">
                <Avatar src={user.avatar} alt={user.username} size="lg" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg truncate">{user.username}</h3>
                    {user.isVerified && (
                      <CheckCircle className="text-blue-500 flex-shrink-0" size={18} />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate mb-2">
                    {user.email}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>{user.stats.posts} posts</span>
                    <span>•</span>
                    <span>{user.stats.followers} followers</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <span className="text-orange-500">★</span>
                      {user.reputation}
                    </span>
                    <span>•</span>
                    <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {user.isVerified ? (
                    <button
                      onClick={() => handleUnverify(user.id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition-all"
                    >
                      <XCircle size={18} />
                      Remove Badge
                    </button>
                  ) : (
                    <button
                      onClick={() => handleVerify(user.id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-all"
                    >
                      <CheckCircle size={18} />
                      Verify
                    </button>
                  )}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}

