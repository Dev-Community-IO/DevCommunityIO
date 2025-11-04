import { MessageCircle, Clock, Smile } from 'lucide-react';
import { Post } from '../types';
import { GlassCard } from './GlassCard';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { VerifiedBadge } from './VerifiedBadge';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import reactionsService from '../services/api/reactions.service';

interface CompactPostCardProps {
  post: Post;
  onClick: () => void;
  onLoginRequired?: () => void;
  hideTags?: boolean;
}

export function CompactPostCard({ post, onClick, onLoginRequired, hideTags = false }: CompactPostCardProps) {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [emojis, setEmojis] = useState<{ emoji: string; count: number }[]>([]);
  const [userEmojis, setUserEmojis] = useState<string[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Load emoji reactions on mount
  useEffect(() => {
    const loadReactions = async () => {
      try {
        const { reactions } = await reactionsService.getEmojis({ postId: post.id });
        setEmojis(reactions || []);
        
        if (user) {
          const { emojis: userEmojisList } = await reactionsService.getUserEmojis({ postId: post.id });
          setUserEmojis(userEmojisList || []);
        }
      } catch (error) {
        console.error('Failed to load reactions:', error);
      }
    };
    loadReactions();
  }, [post.id, user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  const handleEmojiReaction = async (emoji: string) => {
    if (!isAuthenticated) {
      onLoginRequired?.();
      return;
    }

    try {
      const response = await reactionsService.addEmoji({ postId: post.id, emoji });
      
      // Update emojis list
      const emojiIndex = emojis.findIndex(e => e.emoji === emoji);
      
      if (response.reacted) {
        // Add emoji
        if (emojiIndex >= 0) {
          setEmojis(emojis.map(e => e.emoji === emoji ? { ...e, count: e.count + 1 } : e));
        } else {
          setEmojis([...emojis, { emoji, count: 1 }]);
        }
        setUserEmojis([...userEmojis, emoji]);
      } else {
        // Remove emoji
        if (emojiIndex >= 0) {
          const newCount = emojis[emojiIndex].count - 1;
          if (newCount > 0) {
            setEmojis(emojis.map(e => e.emoji === emoji ? { ...e, count: newCount } : e));
          } else {
            setEmojis(emojis.filter(e => e.emoji !== emoji));
          }
        }
        setUserEmojis(userEmojis.filter(e => e !== emoji));
      }
    } catch (error) {
      console.error('Failed to add emoji:', error);
    }
  };

  const timeAgo = (date: Date | string | undefined | null) => {
    if (!date) return 'just now';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (!dateObj || isNaN(dateObj.getTime())) return 'just now';
    const seconds = Math.floor((new Date().getTime() - dateObj.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  const getCleanPreview = (content: string, maxLength: number = 120): string => {
    let cleaned = content
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
      .replace(/^>\s+/gm, '')
      .replace(/^[-*_]{3,}$/gm, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    
    const lines = cleaned.split('\n').filter(line => line.trim().length > 0);
    const firstLine = lines[0] || '';
    
    if (firstLine.length > maxLength) {
      return firstLine.substring(0, maxLength).trim() + '...';
    }
    return firstLine;
  };

  return (
    <GlassCard 
      hover 
      className="p-4 cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-[1.02] group"
      onClick={onClick}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div 
            onClick={(e) => {
              e.stopPropagation();
              if (post.author?.username) {
                navigate(`/profile/${post.author.username}`);
              }
            }}
          >
            <Avatar 
              src={post.author?.avatar || post.author?.avatarUrl || ''} 
              alt={post.author?.username || 'User'} 
              size="sm" 
              className="flex-shrink-0 ring-2 ring-gray-200 dark:ring-gray-700 cursor-pointer hover:ring-blue-500 dark:hover:ring-blue-400 transition-all"
            />
          </div>
          
          {/* Title and Meta */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-gray-900 dark:text-white line-clamp-2 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {post.title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
              <span 
                onClick={(e) => {
                  e.stopPropagation();
                  if (post.author?.username) {
                    navigate(`/profile/${post.author.username}`);
                  }
                }}
                className="font-medium cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {post.author?.username}
              </span>
              {post.author?.isVerified && <VerifiedBadge size={12} />}
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock size={10} />
                {timeAgo(post.publishedAt || post.createdAt || post.timestamp)}
              </span>
            </div>
          </div>
        </div>

        {/* Content Preview */}
        {post.content && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
            {getCleanPreview(post.content)}
          </p>
        )}

        {/* Cover Image - Small Thumbnail */}
        {(post.coverImage || post.coverImageUrl) && (
          <div className="relative w-full h-24 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
            <img
              src={post.coverImage || post.coverImageUrl}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
          {/* Tags */}
          {!hideTags && post.tags && post.tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {post.tags.slice(0, 2).map((tag: any) => {
                const tagName = typeof tag === 'string' ? tag : (tag?.name || tag?.slug || '');
                return (
                  <Badge key={tagName} className="text-[10px] px-1.5 py-0.5">
                    #{tagName}
                  </Badge>
                );
              })}
              {post.tags.length > 2 && (
                <span className="text-[10px] text-gray-500 dark:text-gray-400">+{post.tags.length - 2}</span>
              )}
            </div>
          )}

          {/* Stats - Reactions and Comments */}
          <div className={`flex items-center gap-2 text-xs ${hideTags ? 'ml-auto' : ''}`}>
            {/* Emoji Reactions */}
            {emojis.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap">
                {emojis.slice(0, 3).map(({ emoji, count }) => (
                  <button
                    key={emoji}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isAuthenticated) {
                        onLoginRequired?.();
                        return;
                      }
                      handleEmojiReaction(emoji);
                    }}
                    className={`px-1.5 py-0.5 rounded text-xs transition-all duration-200 flex items-center gap-0.5 ${
                      userEmojis.includes(emoji)
                        ? 'bg-blue-500/20 text-blue-400 ring-1 ring-blue-400/50'
                        : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    <span className="text-sm">{emoji}</span>
                    <span className="font-semibold text-[10px]">{count}</span>
                  </button>
                ))}
                {emojis.length > 3 && (
                  <span className="text-gray-500 dark:text-gray-400 text-[10px]">+{emojis.length - 3}</span>
                )}
              </div>
            )}
            
            {/* Add Emoji Button */}
            <div className="relative" ref={emojiPickerRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isAuthenticated) {
                    onLoginRequired?.();
                    return;
                  }
                  setShowEmojiPicker(!showEmojiPicker);
                }}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 text-gray-500 dark:text-gray-400"
              >
                <Smile size={12} />
              </button>

              {showEmojiPicker && (
                <div className="absolute bottom-full mb-2 left-0 z-[9999] animate-fade-in">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-2 border-gray-200 dark:border-gray-700 p-2 min-w-[200px]">
                    <div className="grid grid-cols-4 gap-1.5">
                      {['👍', '❤️', '🔥', '👏', '😂', '😮', '😢', '🎉'].map((emoji) => (
                        <button
                          key={emoji}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEmojiReaction(emoji);
                            setShowEmojiPicker(false);
                          }}
                          className={`p-2 text-lg rounded-lg hover:scale-110 transition-all duration-200 ${
                            userEmojis.includes(emoji) 
                              ? 'bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 ring-2 ring-blue-400 dark:ring-blue-500 shadow-lg' 
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                    {/* Arrow pointer */}
                    <div className="absolute -bottom-2 left-3 w-3 h-3 bg-white dark:bg-gray-800 border-b-2 border-r-2 border-gray-200 dark:border-gray-700 rotate-45"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Comments */}
            <button
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 text-gray-500 dark:text-gray-400"
            >
              <MessageCircle size={12} />
              <span className="font-medium">{post.commentCount || 0}</span>
            </button>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

