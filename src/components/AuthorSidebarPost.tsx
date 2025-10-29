import { useEffect, useState } from 'react';
import { GlassCard } from './GlassCard';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { VerifiedBadge } from './VerifiedBadge';
import usersService from '../services/api/users.service';
import postsService from '../services/api/posts.service';
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

interface Post {
  id: string;
  slug: string;
  title: string;
  upvotes: number;
  commentCount: number;
  createdAt: string;
}

export function AuthorSidebarPost({ author: authorProp, onPostClick, onLoginRequired }: AuthorSidebarPostProps) {
  const { isAuthenticated } = useAuth();
  const [author, setAuthor] = useState<Author | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);

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

        // Fetch author's latest posts
        const postsResponse = await postsService.getPosts({
          userId: authorProp.id,
          limit: 3,
        });
        setPosts(postsResponse.posts || []);
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
              followers: (author.stats?.followers || 0) - 1
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
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <GlassCard className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-16 w-16 bg-gray-700 rounded-full mx-auto"></div>
            <div className="h-4 bg-gray-700 rounded w-3/4 mx-auto"></div>
            <div className="h-3 bg-gray-700 rounded w-full"></div>
          </div>
        </GlassCard>
      </div>
    );
  }

  if (!author) {
    return null;
  }

  return (
    <div className="space-y-4 sticky top-24">
      {/* Author Card */}
      <GlassCard className="p-6">
        <div className="text-center">
          {/* Avatar */}
          <div className="mb-4">
            <Avatar src={author.avatarUrl} alt={author.username} size="lg" className="mx-auto" />
          </div>

          {/* Username */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <h3 className="font-bold text-lg text-white">
              {author.pseudo || author.username}
            </h3>
            {author.isVerified && <VerifiedBadge />}
          </div>

          {/* Username (if pseudo exists) */}
          {author.pseudo && (
            <p className="text-sm text-gray-400 mb-3">@{author.username}</p>
          )}

          {/* Bio */}
          {author.bio && (
            <p className="text-sm text-gray-300 mb-4 line-clamp-3">{author.bio}</p>
          )}

          {/* Stats */}
          <div className="flex justify-around mb-4 py-3 border-t border-b border-gray-700">
            <div className="text-center">
              <p className="text-xl font-bold text-white">{author.stats?.posts || 0}</p>
              <p className="text-xs text-gray-400">Posts</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-white">{author.stats?.followers || 0}</p>
              <p className="text-xs text-gray-400">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-blue-400">{author.reputation}</p>
              <p className="text-xs text-gray-400">Reputation</p>
            </div>
          </div>

          {/* Follow Button */}
          <Button
            variant={following ? 'secondary' : 'primary'}
            onClick={handleFollow}
            className="w-full"
          >
            {following ? 'Following' : 'Follow'}
          </Button>
        </div>
      </GlassCard>

      {/* Latest Posts */}
      {posts.length > 0 && (
        <GlassCard className="p-6">
          <h3 className="font-bold text-white mb-4">Latest Posts</h3>
          <div className="space-y-3">
            {posts.map((post) => (
              <div
                key={post.id}
                onClick={() => onPostClick(post.slug)}
                className="group cursor-pointer p-3 rounded-lg hover:bg-white/5 transition-colors"
              >
                <h4 className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors line-clamp-2 mb-2">
                  {post.title}
                </h4>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                    </svg>
                    {post.upvotes}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                    </svg>
                    {post.commentCount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}

