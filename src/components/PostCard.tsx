import { ArrowUp, ArrowDown, MessageCircle, Share2, Bookmark, MoreHorizontal } from 'lucide-react';
import { Post } from '../types';
import { GlassCard } from './GlassCard';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { VerifiedBadge } from './VerifiedBadge';
import { Tooltip } from './Tooltip';
import { EmojiReactions } from './EmojiReactions';
import { useState } from 'react';

interface PostCardProps {
  post: Post;
  onClick: () => void;
}

export function PostCard({ post, onClick }: PostCardProps) {
  const [upvoted, setUpvoted] = useState(post.hasUpvoted);
  const [downvoted, setDownvoted] = useState(post.hasDownvoted);
  const [upvotes, setUpvotes] = useState(post.upvotes);
  const [downvotes, setDownvotes] = useState(post.downvotes);
  const [bookmarked, setBookmarked] = useState(false);

  const handleUpvote = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (upvoted) {
      setUpvoted(false);
      setUpvotes(upvotes - 1);
    } else {
      setUpvoted(true);
      setUpvotes(upvotes + 1);
      if (downvoted) {
        setDownvoted(false);
        setDownvotes(downvotes - 1);
      }
    }
  };

  const handleDownvote = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (downvoted) {
      setDownvoted(false);
      setDownvotes(downvotes - 1);
    } else {
      setDownvoted(true);
      setDownvotes(downvotes + 1);
      if (upvoted) {
        setUpvoted(false);
        setUpvotes(upvotes - 1);
      }
    }
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarked(!bookmarked);
  };

  const timeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <GlassCard hover className="p-3 overflow-hidden" onClick={onClick}>
      <div className="flex gap-2.5">
        {/* Compact Vote Section */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <button
            onClick={handleUpvote}
            className={`p-1.5 rounded-md transition-all duration-200 ${
              upvoted
                ? 'bg-green-500/20 text-green-500'
                : 'hover:bg-white/10 dark:hover:bg-white/5'
            }`}
          >
            <ArrowUp size={16} />
          </button>
          <span className="font-bold text-sm">
            {upvotes - downvotes}
          </span>
          <button
            onClick={handleDownvote}
            className={`p-1.5 rounded-md transition-all duration-200 ${
              downvoted
                ? 'bg-red-500/20 text-red-500'
                : 'hover:bg-white/10 dark:hover:bg-white/5'
            }`}
          >
            <ArrowDown size={16} />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-2 min-w-0">
          {/* Header with Author Info */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {/* Page Logo and Author Avatar - Touching */}
              {post.page ? (
                <div className="relative flex-shrink-0 group flex items-center gap-0">
                  {/* Page Logo (Square) with enhanced design */}
                  <Tooltip content={post.page.name}>
                    <div className="w-9 h-9 rounded-lg overflow-hidden border-2 border-white/80 dark:border-gray-800/80 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 relative z-10 cursor-pointer">
                      <img src={post.page.logo} alt={post.page.name} className="w-full h-full object-cover" />
                    </div>
                  </Tooltip>
                  {/* Author Avatar (Touching) with enhanced design */}
                  <Tooltip content={`@${post.author.username}`}>
                    <div className="-ml-2 w-6 h-6 rounded-full border-2 border-white dark:border-gray-900 overflow-hidden cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 ring-2 ring-blue-500/20 hover:ring-blue-500/40 relative z-20">
                      <Avatar src={post.author.avatar} alt={post.author.username} size="sm" className="w-full h-full" />
                    </div>
                  </Tooltip>
                </div>
              ) : (
                <Tooltip content={`@${post.author.username}`}>
                  <div className="flex-shrink-0 w-6 h-6 cursor-pointer hover:scale-110 transition-transform duration-300">
                    <Avatar src={post.author.avatar} alt={post.author.username} size="sm" className="w-full h-full" />
                  </div>
                </Tooltip>
              )}

              {/* Author Name / Page Info */}
              {post.page ? (
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-semibold text-sm truncate">
                    {post.author.username}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0 font-medium">posted for</span>
                  <span className="font-bold text-sm bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent hover:from-blue-700 hover:to-cyan-700 dark:hover:from-blue-300 dark:hover:to-cyan-300 transition-all cursor-pointer truncate">
                    {post.page.name}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-medium text-sm truncate">
                    {post.author.username}
                  </span>
                  {post.author.isVerified && (
                    <VerifiedBadge size={14} className="flex-shrink-0" />
                  )}
                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate hidden sm:inline">
                    {post.author.walletAddress}
                  </span>
                </div>
              )}

              <span className="text-xs text-gray-500 dark:text-gray-400">•</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                {timeAgo(post.timestamp)}
              </span>
              {!post.page && (
                <Badge variant="gradient" className="text-xs px-2 py-0.5">{post.author.reputation} rep</Badge>
              )}
            </div>
            <button
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-md hover:bg-white/10 dark:hover:bg-white/5 transition-all duration-200 flex-shrink-0"
            >
              <MoreHorizontal size={16} />
            </button>
          </div>

          {/* Title */}
          <h3 className="text-base font-bold hover:text-blue-500 transition-colors leading-tight">
            {post.title}
          </h3>

          {/* Cover Image */}
          {post.coverImage && (
            <div className="relative w-full h-32 sm:h-40 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Content Preview */}
          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 leading-snug">
            {post.content}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map(tag => (
              <Badge key={tag} className="text-xs px-2 py-0.5">#{tag}</Badge>
            ))}
          </div>

          {/* Actions Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-white/5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <EmojiReactions onClick={(e) => e.stopPropagation()} />

              <button
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              >
                <MessageCircle size={14} />
                <span className="text-xs font-medium">{post.commentCount}</span>
              </button>
              <button
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              >
                <Share2 size={14} />
                <span className="text-xs font-medium hidden sm:inline">Share</span>
              </button>
            </div>
            <button
              onClick={handleBookmark}
              className={`p-1.5 rounded-md transition-all duration-200 ${
                bookmarked
                  ? 'bg-yellow-500/20 text-yellow-500'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Bookmark size={14} fill={bookmarked ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
