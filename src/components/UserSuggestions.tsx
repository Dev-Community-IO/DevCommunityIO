import { useState, useEffect } from 'react';
import { Search, Users, UserPlus, Check } from 'lucide-react';
import onboardingService from '../services/api/onboarding.service';
import { Avatar } from './Avatar';

interface UserSuggestionsProps {
  selectedUsers: string[];
  onUsersChange: (users: string[]) => void;
}

interface SuggestedUser {
  id: string;
  username: string;
  avatar: string;
  bio: string;
  reputation: number;
  isVerified: boolean;
  stats: {
    posts: number;
    followers: number;
  };
}

export function UserSuggestions({ selectedUsers, onUsersChange }: UserSuggestionsProps) {
  const [users, setUsers] = useState<SuggestedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadSuggestedUsers();
  }, []);

  const loadSuggestedUsers = async () => {
    try {
      const data = await onboardingService.getSuggestedUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load users:', error);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = (users || []).filter((user) =>
    user?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user?.bio?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleUser = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      onUsersChange(selectedUsers.filter((id) => id !== userId));
    } else {
      onUsersChange([...selectedUsers, userId]);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-2">Find Amazing People</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Follow creators who share your interests to build your feed
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search users..."
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Finding amazing people...</p>
        </div>
      ) : (
        <>
          {/* User Cards */}
          <div className="space-y-3">
            {filteredUsers.map((user) => {
              const isSelected = selectedUsers.includes(user.id);
              return (
                <div
                  key={user.id}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500/5 shadow-lg'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <Avatar
                      src={user.avatar}
                      alt={user.username}
                      size="lg"
                      className="flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold truncate">{user.username}</h4>
                        {user.isVerified && (
                          <svg
                            className="w-4 h-4 text-blue-500 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                          </svg>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {user.bio}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>{user.stats.posts} posts</span>
                        <span>•</span>
                        <span>{user.stats.followers.toLocaleString()} followers</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <span className="text-orange-500">★</span>
                          {user.reputation}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleUser(user.id)}
                      className={`flex-shrink-0 px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                        isSelected
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                    >
                      {isSelected ? (
                        <div className="flex items-center gap-2">
                          <Check size={16} />
                          Following
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <UserPlus size={16} />
                          Follow
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Count */}
          <div className="flex items-center justify-between p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <div className="flex items-center gap-2">
              <Users size={20} className="text-blue-600 dark:text-blue-400" />
              <p className="text-sm font-medium">
                {selectedUsers.length === 0 && 'No one followed yet'}
                {selectedUsers.length === 1 && '1 person followed'}
                {selectedUsers.length > 1 && `${selectedUsers.length} people followed`}
              </p>
            </div>
            {selectedUsers.length >= 1 && (
              <span className="text-green-600 dark:text-green-400 text-2xl">✓</span>
            )}
          </div>
        </>
      )}
    </div>
  );
}

