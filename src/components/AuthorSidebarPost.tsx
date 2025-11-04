import { useEffect, useState } from 'react';
import { GlassCard } from './GlassCard';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { VerifiedBadge } from './VerifiedBadge';
import { useNavigate } from 'react-router-dom';
import usersService from '../services/api/users.service';
import { useAuth } from '../contexts/AuthContext';

interface AuthorSidebarPostProps {
  author: {
    id: string;
    username: string;
    pseudo?: string;
    avatarUrl: string;
    bio?: string;
    reputation: number;
    isVerified: boolean;
  };
  onPostClick: (slug: string) => void;
  onLoginRequired?: () => void;
}

interface Author {
  id: string;
  username: string;
  pseudo?: string;
  avatarUrl: string;
  bio?: string;
  reputation: number;
  isVerified: boolean;
  stats?: {
    posts: number;
    followers: number;
  };
}

export function AuthorSidebarPost({ author: authorProp, onPostClick, onLoginRequired }: AuthorSidebarPostProps) {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [author, setAuthor] = useState<Author | null>(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);

  // Check if current user is the author
  const isOwnProfile = isAuthenticated && user && (user.id === authorProp.id || user.username === authorProp.username);

  useEffect(() => {
    const fetchAuthorData = async () => {
      try {
        setLoading(true);
        
        // Use provided author data and fetch stats
        const statsResponse = await usersService.getUserStats(authorProp.username);
        
        setAuthor({
          ...authorProp,
          stats: {
            posts: statsResponse.posts,
            followers: statsResponse.followers,
          }
        });

        // Check if following
        if (isAuthenticated) {
          const isFollowingUser = await usersService.isFollowing(authorProp.id);
          setFollowing(isFollowingUser);
        }
      } catch (error) {
        console.error('Error fetching author data:', error);
        // Even if stats fail, show author with basic info
        setAuthor({
          ...authorProp,
          stats: { posts: 0, followers: 0 }
        });
      } finally {
        setLoading(false);
      }
    };

    if (authorProp) {
      fetchAuthorData();
    }
  }, [authorProp, isAuthenticated]);

  const handleFollow = async () => {
    if (!isAuthenticated) {
      onLoginRequired?.();
      return;
    }

    try {
      if (following) {
        await usersService.unfollowUser(authorProp.id);
        setFollowing(false);
        // Update follower count
        if (author) {
          setAuthor({
            ...author,
            stats: {
              ...author.stats!,
              followers: Math.max(0, (author.stats?.followers || 0) - 1)
            }
          });
        }
      } else {
        await usersService.followUser(authorProp.id);
        setFollowing(true);
        // Update follower count
        if (author) {
          setAuthor({
            ...author,
            stats: {
              ...author.stats!,
              followers: (author.stats?.followers || 0) + 1
            }
          });
        }
      }
    } catch (error: any) {
      console.error('Error following/unfollowing user:', error);
      // Revert optimistic update on error
      setFollowing(!following);
      alert(error?.message || 'Failed to update follow status');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <GlassCard className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-16 w-16 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
          </div>
        </GlassCard>
      </div>
    );
  }

  if (!author) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Author Card */}
      <GlassCard className="p-6">
        <div className="text-center">
          {/* Avatar */}
          <div 
            onClick={() => navigate(`/profile/${author.username}`)}
            className="mb-4 cursor-pointer hover:scale-105 transition-transform"
          >
            <Avatar src={author.avatarUrl} alt={author.username} size="lg" className="mx-auto ring-2 ring-transparent hover:ring-blue-500 transition-all" />
          </div>

          {/* Username */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <h3 
              onClick={() => navigate(`/profile/${author.username}`)}
              className="font-bold text-lg text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {author.pseudo || author.username}
            </h3>
            {author.isVerified && <VerifiedBadge />}
          </div>

          {/* Username (if pseudo exists) */}
          {author.pseudo && (
            <p 
              onClick={() => navigate(`/profile/${author.username}`)}
              className="text-sm text-gray-600 dark:text-gray-400 mb-3 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              @{author.username}
            </p>
          )}

          {/* Bio */}
          {author.bio && (
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">{author.bio}</p>
          )}

          {/* Stats */}
          <div className="flex justify-around mb-4 py-3 border-t border-b border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900 dark:text-white">{author.stats?.posts || 0}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Posts</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900 dark:text-white">{author.stats?.followers || 0}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{author.reputation}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Reputation</p>
            </div>
          </div>

          {/* Follow Button - Only show if not viewing own profile */}
          {!isOwnProfile && (
            <Button
              variant={following ? 'secondary' : 'primary'}
              onClick={handleFollow}
              className="w-full"
            >
              {following ? 'Following' : 'Follow'}
            </Button>
          )}
        </div>
      </GlassCard>
    </div>
  );
}

