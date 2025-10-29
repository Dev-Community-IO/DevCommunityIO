import { useState, useEffect } from 'react';
import { TrendingUp, Clock, MapPin, Calendar, Link as LinkIcon, Loader } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Avatar } from './Avatar';
import { User, Post } from '../types';
import { useAuth } from '../contexts/AuthContext';
import usersService from '../services/api/users.service';

interface AuthorSidebarProps {
  author: User;
  onLoginRequired?: () => void;
}

export function AuthorSidebar({ author, onLoginRequired }: AuthorSidebarProps) {
  const { isAuthenticated } = useAuth();
  const [authorPosts, setAuthorPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuthorPosts = async () => {
      try {
        setLoading(true);
        const posts = await usersService.getUserPosts(author.username, 1, 5);
        setAuthorPosts(posts.slice(0, 5));
      } catch (err) {
        console.error('Error fetching author posts:', err);
        setAuthorPosts([]);
      } finally {
        setLoading(false);
      }
    };

    if (author.username) {
      fetchAuthorPosts();
    }
  }, [author.username]);

  return (
    <aside className="hidden lg:block w-80 flex-shrink-0 space-y-3">
      <GlassCard className="p-4 overflow-hidden">
        <div className="flex flex-col items-center text-center">
          <Avatar src={author.avatar} alt={author.username} size="lg" />
          <h3 className="font-bold text-lg mt-3 break-words w-full">{author.username}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 break-all">
            {author.walletAddress}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
              {author.reputation} rep
            </span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10 space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <MapPin size={14} className="flex-shrink-0" />
            <span className="text-xs truncate">Location not set</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Calendar size={14} className="flex-shrink-0" />
            <span className="text-xs truncate">Joined 3 months ago</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 min-w-0">
            <LinkIcon size={14} className="flex-shrink-0" />
            <span className="text-xs text-blue-500 hover:underline cursor-pointer truncate">website.com</span>
          </div>
        </div>

        <button 
          onClick={() => {
            if (!isAuthenticated) {
              onLoginRequired?.();
              return;
            }
            // Handle follow logic here
          }}
          className="w-full mt-4 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-sm font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30"
        >
          Follow
        </button>
      </GlassCard>

      <GlassCard className="p-4 overflow-hidden">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={16} className="text-green-500 flex-shrink-0" />
          <h3 className="font-semibold text-sm">Recent Posts</h3>
        </div>
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader className="w-4 h-4 animate-spin text-blue-500" />
          </div>
        ) : authorPosts.length > 0 ? (
          <div className="space-y-2">
            {authorPosts.map(post => (
              <div
                key={post.id}
                className="pb-2 border-b border-gray-200 dark:border-white/5 last:border-0 last:pb-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg p-2 -m-2 transition-all duration-300"
              >
                <h4 className="font-medium text-xs mb-1 line-clamp-2 hover:text-blue-500 transition-colors break-words">
                  {post.title}
                </h4>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 flex-wrap">
                  <span className="flex items-center gap-1 whitespace-nowrap">
                    <Clock size={10} />
                    {new Date(post.createdAt || post.timestamp).toLocaleDateString()}
                  </span>
                  <span>•</span>
                  <span className="whitespace-nowrap">{post.commentCount || 0} replies</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500 text-center py-4">No posts yet</p>
        )}
      </GlassCard>
    </aside>
  );
}
