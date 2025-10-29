import { MessageCircle, Share2, Bookmark, MoreHorizontal, Smile } from 'lucide-react';
import { Post } from '../types';
import { GlassCard } from './GlassCard';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { VerifiedBadge } from './VerifiedBadge';
import { Tooltip } from './Tooltip';
import { EmojiReactions } from './EmojiReactions';
import { UserHoverCardDropdown } from './UserHoverCardDropdown';
import { PageHoverCardDropdown } from './PageHoverCardDropdown';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect, useRef } from 'react';
import reactionsService from '../services/api/reactions.service';
import bookmarksService from '../services/api/bookmarks.service';
import { useNavigate } from 'react-router-dom';

interface PostCardProps {
  post: Post;
  onClick: () => void;
  onLoginRequired?: () => void;
}

export function PostCard({ post, onClick, onLoginRequired }: PostCardProps) {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [bookmarked, setBookmarked] = useState(false);
  
  // Check bookmark status on mount
  useEffect(() => {
    if (isAuthenticated) {
      const checkBookmark = async () => {
        try {
          const response = await bookmarksService.checkBookmark(post.id);
          setBookmarked(response.isBookmarked);
        } catch (error) {
          console.error('Failed to check bookmark status:', error);
        }
      };
      checkBookmark();
    }
  }, [isAuthenticated, post.id]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojis, setEmojis] = useState<{ emoji: string; count: number }[]>([]);
  const [userEmojis, setUserEmojis] = useState<string[]>([]);
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

  // Clean content for feed preview - remove markdown headers and formatting
  // BUT preserve mentions (@username) for proper formatting
  const getCleanPreview = (content: string, maxLength: number = 300): string => {
    // Remove markdown headers (# ## ### etc)
    let cleaned = content.replace(/^#{1,6}\s+/gm, '');
    
    // Remove emphasis markers but keep text
    cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1');  // Bold
    cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1');      // Italic
    cleaned = cleaned.replace(/__([^_]+)__/g, '$1');      // Bold underscore
    cleaned = cleaned.replace(/_([^_]+)_/g, '$1');        // Italic underscore
    
    // Remove code blocks
    cleaned = cleaned.replace(/```[\s\S]*?```/g, '');
    
    // Remove inline code backticks (but preserve mentions in code - we'll handle separately)
    cleaned = cleaned.replace(/`([^`]+)`/g, '$1');
    
    // Remove links but keep text [text](url) -> text
    cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    
    // Remove images
    cleaned = cleaned.replace(/!\[([^\]]*)\]\([^)]+\)/g, '');
    
    // Preserve mentions - they'll be formatted in the render
    
    // Remove blockquotes
    cleaned = cleaned.replace(/^>\s+/gm, '');
    
    // Remove horizontal rules
    cleaned = cleaned.replace(/^[-*_]{3,}$/gm, '');
    
    // Clean up multiple newlines
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    
    // Trim and limit length
    cleaned = cleaned.trim();
    
    // Take first 3 lines or maxLength characters, whichever comes first
    const lines = cleaned.split('\n').filter(line => line.trim().length > 0);
    const first3Lines = lines.slice(0, 3).join(' ');
    
    if (first3Lines.length > maxLength) {
      return first3Lines.substring(0, maxLength).trim() + '...';
    }
    
    return first3Lines + (lines.length > 3 ? '...' : '');
  };

  // Format content preview with styled mentions
  const formatContentPreview = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    const mentionRegex = /@(\w+)/g;
    let lastIndex = 0;
    let match;
    let key = 0;

    const handleMentionClick = (username: string, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      navigate(`/profile/${username}`);
    };

    while ((match = mentionRegex.exec(text)) !== null) {
      // Add text before mention
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${key++}`}>
            {text.substring(lastIndex, match.index)}
          </span>
        );
      }

      // Add mention link
      const username = match[1];
      parts.push(
        <a
          key={`mention-${key++}`}
          href={`/profile/${username}`}
          onClick={(e) => handleMentionClick(username, e)}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold cursor-pointer bg-blue-50 dark:bg-blue-900/30 px-1 py-0.5 rounded hover:underline transition-colors inline-block"
          onMouseDown={(e) => e.stopPropagation()} // Prevent triggering card click
        >
          @{username}
        </a>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(
        <span key={`text-${key++}`}>
          {text.substring(lastIndex)}
        </span>
      );
    }

    return <>{parts}</>;
  };
  
  const handleEmojiReaction = async (emoji: string) => {
    if (!user) {
      alert('Please login to react');
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

  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      onLoginRequired?.();
      return;
    }
    
    try {
      if (bookmarked) {
        await bookmarksService.removeBookmark(post.id);
        setBookmarked(false);
      } else {
        await bookmarksService.addBookmark(post.id);
        setBookmarked(true);
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
      alert('Failed to toggle bookmark');
    }
  };

  const timeAgo = (date: Date | string | undefined | null) => {
    if (!date) return 'just now';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if date is valid
    if (!dateObj || isNaN(dateObj.getTime())) return 'just now';
    
    const seconds = Math.floor((new Date().getTime() - dateObj.getTime()) / 1000);
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
      <div className="space-y-2">
        {/* Main Content */}
        <div className="space-y-2 min-w-0">
          {/* Header with Author Info */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {/* Page Logo and Author Avatar - With Hover Cards */}
              {post.page ? (
                <div className="relative flex-shrink-0 group flex items-center gap-0">
                  {/* Page Logo with Hover Card */}
                  <PageHoverCardDropdown
                    page={post.page}
                    trigger={
                      <div className="w-9 h-9 rounded-lg overflow-hidden border-2 border-white/80 dark:border-gray-800/80 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 relative z-10 cursor-pointer">
                        <img src={post.page.logo} alt={post.page.name} className="w-full h-full object-cover" />
                      </div>
                    }
                    onViewPage={() => {
                      // Navigation logic
                    }}
                    onJoin={() => {
                      if (!isAuthenticated) {
                        onLoginRequired?.();
                      }
                    }}
                  />
                  {/* Author Avatar with Hover Card */}
                  <UserHoverCardDropdown
                    user={post.author}
                    trigger={
                      <div className="-ml-2 w-6 h-6 rounded-full border-2 border-white dark:border-gray-900 overflow-hidden cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 ring-2 ring-blue-500/20 hover:ring-blue-500/40 relative z-20">
                        <Avatar src={post.author.avatar || post.author.avatarUrl} alt={post.author.username} size="sm" className="w-full h-full" />
                      </div>
                    }
                    onViewProfile={() => {
                      // Navigation logic
                    }}
                    onFollow={() => {
                      if (!isAuthenticated) {
                        onLoginRequired?.();
                      }
                    }}
                  />
                </div>
              ) : (
                <UserHoverCardDropdown
                  user={post.author}
                  trigger={
                    <div className="flex-shrink-0 w-6 h-6 cursor-pointer hover:scale-110 transition-transform duration-300">
                      <Avatar src={post.author.avatar || post.author.avatarUrl} alt={post.author.username} size="sm" className="w-full h-full" />
                    </div>
                  }
                  onViewProfile={() => {
                    // Navigation logic
                  }}
                  onFollow={() => {
                    if (!isAuthenticated) {
                      onLoginRequired?.();
                    }
                  }}
                />
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
                {timeAgo(post.publishedAt || post.createdAt || post.timestamp)}
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

          {/* Title - Colorful Gradient */}
          <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 dark:hover:from-blue-300 dark:hover:via-purple-300 dark:hover:to-pink-300 transition-all duration-300 leading-tight cursor-pointer">
            {post.title}
          </h3>

          {/* Cover Image */}
          {(post.coverImage || post.coverImageUrl) && (
            <div className="relative w-full h-32 sm:h-40 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 mb-3">
              <img
                src={post.coverImage || post.coverImageUrl}
                alt={post.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Hide image on error
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Content Preview - Clean Text with Formatted Mentions */}
          <div className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 leading-relaxed">
            {formatContentPreview(getCleanPreview(post.content, 300))}
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {post.tags.map(tag => {
                const tagName = typeof tag === 'string' ? tag : (tag.name || tag.slug || '');
                const tagKey = typeof tag === 'string' ? tag : (tag.id || tag.slug || tagName);
                return (
                  <Badge key={tagKey} className="text-xs px-2 py-0.5">#{tagName}</Badge>
                );
              })}
            </div>
          )}

          {/* Actions Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-white/5">
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Emoji Reactions - Inline and Compact */}
              {emojis.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                  {emojis.map(({ emoji, count }) => (
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
                          : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span className="text-sm">{emoji}</span>
                      <span className="font-semibold text-[10px]">{count}</span>
                    </button>
                  ))}
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
                  className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                >
                  <Smile size={14} />
                  <span className="text-xs font-medium">React</span>
                </button>

                {showEmojiPicker && (
                  <div className="absolute bottom-full mb-3 left-0 z-[9999] animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-2 border-gray-200 dark:border-gray-700 p-3 min-w-[260px]">
                      <div className="grid grid-cols-4 gap-2">
                        {['👍', '❤️', '🔥', '👏', '😂', '😮', '😢', '🎉'].map((emoji) => (
                          <button
                            key={emoji}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEmojiReaction(emoji);
                              setShowEmojiPicker(false);
                            }}
                            className={`p-3 text-2xl rounded-xl hover:scale-110 transition-all duration-200 ${
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
                      <div className="absolute -bottom-2 left-4 w-4 h-4 bg-white dark:bg-gray-800 border-b-2 border-r-2 border-gray-200 dark:border-gray-700 rotate-45"></div>
                    </div>
                  </div>
                )}
              </div>

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
            <Tooltip content={!isAuthenticated ? "Login to bookmark" : bookmarked ? "Remove bookmark" : "Bookmark"}>
              <button
                onClick={handleBookmark}
                className={`p-1.5 rounded-md transition-all duration-200 ${
                  bookmarked
                    ? 'bg-yellow-500/20 text-yellow-500 shadow-md shadow-yellow-500/20'
                    : !isAuthenticated
                      ? 'opacity-50 cursor-not-allowed hover:bg-white/5'
                      : 'hover:bg-white/10 dark:hover:bg-white/5'
                }`}
              >
                <Bookmark size={14} fill={bookmarked ? 'currentColor' : 'none'} strokeWidth={bookmarked ? 2.5 : 2} />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
