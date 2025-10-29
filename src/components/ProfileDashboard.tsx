import { useState, useEffect } from 'react';
import { MessageSquare, Activity, ThumbsUp, Users, Clock, TrendingUp } from 'lucide-react';
import { GlassCard } from './GlassCard';
import usersService from '../services/api/users.service';

interface ProfileDashboardProps {
  username: string;
  user: {
    username: string;
    reputation: number;
    stats: {
      posts: number;
      replies: number;
      upvotes: number;
      followers: number;
      following: number;
    };
  };
}

export function ProfileDashboard({ username, user }: ProfileDashboardProps) {
  const [stats, setStats] = useState(user.stats);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [recentReplies, setRecentReplies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch updated stats
        const updatedStats = await usersService.getUserStats(username);
        setStats({
          posts: Number(updatedStats.posts || 0),
          replies: Number(updatedStats.replies || 0),
          upvotes: Number(updatedStats.upvotes || 0),
          followers: Number(updatedStats.followers || 0),
          following: Number(updatedStats.following || 0),
        });

        // Fetch recent posts
        const posts = await usersService.getUserPosts(username, { limit: 5 });
        setRecentPosts(Array.isArray(posts) ? posts.slice(0, 5) : []);

        // Fetch recent replies
        const replies = await usersService.getUserReplies(username);
        setRecentReplies(Array.isArray(replies) ? replies.slice(0, 5) : []);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchDashboardData();
    }
  }, [username]);

  const timeAgo = (date: Date | string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview - Minimal Design */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <GlassCard className="p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800">
              <MessageSquare size={20} className="text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Posts</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{stats.posts}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800">
              <Activity size={20} className="text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Replies</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{stats.replies}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800">
              <ThumbsUp size={20} className="text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Reputation</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{user.reputation}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800">
              <Users size={20} className="text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Followers</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{stats.followers}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800">
              <Users size={20} className="text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Following</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{stats.following}</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Posts */}
        <GlassCard className="p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Posts</h3>
            <MessageSquare size={18} className="text-gray-400" />
          </div>
          <div className="space-y-3">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : recentPosts.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No posts yet</p>
            ) : (
              recentPosts.map((post) => (
                <div key={post.id} className="pb-3 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1 mb-1">
                    {post.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Clock size={12} />
                    <span>{timeAgo(post.createdAt || post.timestamp)}</span>
                    {post.upvotes > 0 && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp size={12} />
                          {post.upvotes}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>

        {/* Recent Replies */}
        <GlassCard className="p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Replies</h3>
            <Activity size={18} className="text-gray-400" />
          </div>
          <div className="space-y-3">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : recentReplies.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No replies yet</p>
            ) : (
              recentReplies.map((reply) => (
                <div key={reply.id} className="pb-3 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Replied to: <span className="font-medium">{reply.postTitle || 'Post'}</span>
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-1">
                    {reply.content?.substring(0, 100) || ''}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Clock size={12} />
                    <span>{timeAgo(reply.createdAt || reply.timestamp)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
