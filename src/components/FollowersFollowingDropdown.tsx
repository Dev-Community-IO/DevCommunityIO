import { useState, useEffect, useRef } from 'react';
import { X, UserCheck, Users, Loader2 } from 'lucide-react';
import { Avatar } from './Avatar';
import { GlassCard } from './GlassCard';
import usersService from '../services/api/users.service';
import { useNavigate } from 'react-router-dom';

interface FollowersFollowingDropdownProps {
  userId: string;
  type: 'followers' | 'following';
  count: number;
  isOpen: boolean;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLDivElement>;
}

interface UserItem {
  id: string;
  username: string;
  pseudo?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  reputation: number;
  isVerified: boolean;
  followedAt?: string;
}

export function FollowersFollowingDropdown({
  userId,
  type,
  count,
  isOpen,
  onClose,
  triggerRef,
}: FollowersFollowingDropdownProps) {
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (isOpen && userId) {
      fetchUsers();
    } else {
      // Reset when closing
      setUsers([]);
      setPage(1);
      setHasMore(true);
      setLoading(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, userId, type]);

  useEffect(() => {
    if (isOpen && page > 1) {
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef?.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose, triggerRef]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = type === 'followers' 
        ? await usersService.getFollowers(userId, { page, limit: 20 })
        : await usersService.getFollowing(userId, { page, limit: 20 });
      
      // Handle paginated response
      const userList = response.data || [];
      const meta = response.meta || { lastPage: 1, currentPage: page };
      
      setUsers(prev => page === 1 ? userList : [...prev, ...userList]);
      setHasMore(meta.currentPage < meta.lastPage);
    } catch (error) {
      console.error(`Failed to fetch ${type}:`, error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (username: string) => {
    navigate(`/user/${username}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <GlassCard
        ref={dropdownRef}
        className="w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            {type === 'followers' ? (
              <Users size={20} className="text-blue-500" />
            ) : (
              <UserCheck size={20} className="text-blue-500" />
            )}
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {type === 'followers' ? 'Followers' : 'Following'}
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">({count})</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={18} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto p-2">
          {loading && users.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-gray-400" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                {type === 'followers' 
                  ? 'No followers yet' 
                  : 'Not following anyone yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleUserClick(user.username)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors group"
                >
                  <Avatar
                    src={user.avatarUrl || undefined}
                    alt={user.username}
                    size="md"
                    className="flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                        {user.pseudo || user.username}
                      </span>
                      {user.isVerified && (
                        <span className="text-blue-500 flex-shrink-0">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      @{user.username}
                    </p>
                    {user.bio && (
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                        {user.bio}
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {user.reputation}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">reputation</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Load More */}
        {hasMore && !loading && users.length > 0 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                setPage(prev => prev + 1);
              }}
              disabled={loading}
              className="w-full px-4 py-2 text-sm font-medium text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
        {loading && page > 1 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-center">
            <Loader2 size={20} className="animate-spin text-gray-400 mx-auto" />
          </div>
        )}
      </GlassCard>
    </div>
  );
}

