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
import { ShareDropdown } from './ShareDropdown';
import { ResponsivePostImage } from './ResponsivePostImage';
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
  const { isAuthenticated, user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [bookmarked, setBookmarked] = useState(false);
  const [postData, setPostData] = useState<Post>(post);
  
  // Check bookmark status on mount
  useEffect(() => {
    if (isAuthenticated) {
      const checkBookmark = async () => {
        try {
          const response = await bookmarksService.checkBookmark(postData.id);
          setBookmarked(response.isBookmarked);
        } catch (error) {
          console.error('Failed to check bookmark status:', error);
        }
      };
      checkBookmark();
    }
  }, [isAuthenticated, postData.id]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojis, setEmojis] = useState<{ emoji: string; count: number }[]>([]);
  const [userEmojis, setUserEmojis] = useState<string[]>([]);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  
  // Load emoji reactions on mount
  useEffect(() => {
    const loadReactions = async () => {
      try {
        const { reactions } = await reactionsService.getEmojis({ postId: postData.id });
        setEmojis(reactions || []);
        
        if (user) {
          try {
          const { emojis: userEmojisList } = await reactionsService.getUserEmojis({ postId: postData.id });
          setUserEmojis(userEmojisList || []);
          } catch (error: any) {
            // Don't log 401 errors for user emojis - user might not be authenticated
            if (error?.response?.status !== 401) {
              console.error('Failed to load user reactions:', error);
            }
          }
        }
      } catch (error: any) {
        // Don't log 401 errors - user might not be authenticated
        // Public reactions should still load even if user is not authenticated
        // Only log actual errors (network issues, server errors, etc.)
        if (error?.response?.status !== 401) {
        console.error('Failed to load reactions:', error);
        }
      }
    };
    loadReactions();
  }, [postData.id, user]);

  // Update postData when post prop changes
  useEffect(() => {
    setPostData(post);
  }, [post]);
  
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
      const response = await reactionsService.addEmoji({ postId: postData.id, emoji });
      
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

      // Update author reputation if returned from backend
      if (response.authorReputation !== undefined && response.authorReputation !== null) {
        setPostData(prev => ({
          ...prev,
          author: {
            ...prev.author,
            reputation: response.authorReputation
          }
        }));
      }

      if (response.reactorReputation !== undefined && response.reactorReputation !== null) {
        updateUser({ reputation: response.reactorReputation });
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
    
    // Optimistically update UI
    const previousBookmarked = bookmarked;
    setBookmarked(!bookmarked);
    
    try {
      if (previousBookmarked) {
        await bookmarksService.removeBookmark(postData.id);
      } else {
        await bookmarksService.addBookmark(postData.id);
      }
    } catch (error: any) {
      // Revert optimistic update on error
      setBookmarked(previousBookmarked);
      
      // If error says already bookmarked, check actual status and update accordingly
      if (error?.message?.includes('already bookmarked') || error?.data?.message?.includes('already bookmarked')) {
        try {
          const response = await bookmarksService.checkBookmark(postData.id);
          setBookmarked(response.isBookmarked);
        } catch (checkError) {
          console.error('Failed to check bookmark status after error:', checkError);
        }
      } else if (error?.message?.includes('not found') || error?.data?.message?.includes('not found')) {
        // If bookmark not found when trying to remove, check actual status
        try {
          const response = await bookmarksService.checkBookmark(postData.id);
          setBookmarked(response.isBookmarked);
        } catch (checkError) {
          console.error('Failed to check bookmark status after error:', checkError);
        }
      } else {
        console.error('Failed to toggle bookmark:', error);
        // Don't show alert for "already bookmarked" errors as we handle it gracefully
        if (!error?.message?.includes('already bookmarked') && !error?.data?.message?.includes('already bookmarked')) {
          alert('Failed to toggle bookmark');
        }
      }
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
    <GlassCard hover className="p-3 sm:p-4 md:p-5 overflow-hidden active:scale-[0.98] transition-transform duration-150 touch-manipulation" onClick={onClick}>
      <div className="space-y-2 sm:space-y-3">
        {/* Main Content */}
        <div className="space-y-2 sm:space-y-3 min-w-0">
          {/* Header with Author Info - Mobile Optimized */}
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              {/* Page Logo and Author Avatar - With Hover Cards - Mobile Optimized */}
              {postData.page ? (
                <div className="relative flex-shrink-0 group flex items-center gap-0">
                  {/* Page Logo with Hover Card */}
                  <PageHoverCardDropdown
                    page={postData.page}
                    trigger={
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (postData.page?.slug) {
                            navigate(`/pages/${postData.page.slug}`);
                          }
                        }}
                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg overflow-hidden border-2 border-white/80 dark:border-gray-800/80 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-md hover:shadow-lg active:scale-95 transition-all duration-200 relative z-10 cursor-pointer touch-manipulation`}>
                        <img 
                          src={postData.page.logo || postData.page.logoUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(postData.page.name)}`} 
                          alt={postData.page.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(post.page.name)}`;
                          }}
                        />
                        {postData.page.isVerified && (
                          <div className="absolute -bottom-0.5 -right-0.5 bg-white dark:bg-gray-900 rounded-full p-0.5 shadow-md border border-white dark:border-gray-800">
                            <VerifiedBadge size={10} className="sm:w-3 sm:h-3" />
                          </div>
                        )}
                      </div>
                    }
                    onViewPage={() => {
                      if (postData.page?.slug) {
                        navigate(`/pages/${postData.page.slug}`);
                      }
                    }}
                    onJoin={() => {
                      if (!isAuthenticated) {
                        onLoginRequired?.();
                      }
                    }}
                  />
                  {/* Author Avatar with Hover Card - Mobile Optimized */}
                  <UserHoverCardDropdown
                    user={postData.author}
                    page={postData.page}
                    trigger={
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/profile/${postData.author.username}`);
                        }}
                        className="-ml-1.5 sm:-ml-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-white dark:border-gray-900 overflow-hidden cursor-pointer shadow-lg active:scale-95 transition-all duration-200 ring-2 ring-blue-500/20 relative z-20 touch-manipulation">
                        <Avatar 
                          src={postData.author.avatar || postData.author.avatarUrl} 
                          alt={postData.author.username} 
                          size="sm" 
                          className="w-full h-full"
                          isTrusted={postData.author.isTrusted}
                        />
                      </div>
                    }
                    onViewProfile={() => {
                      navigate(`/profile/${post.author.username}`);
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
                  user={postData.author}
                  trigger={
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/profile/${post.author.username}`);
                      }}
                      className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 cursor-pointer active:scale-95 transition-transform duration-200 touch-manipulation">
                      <Avatar 
                        src={post.author.avatar || post.author.avatarUrl} 
                        alt={post.author.username} 
                        size="sm" 
                        className="w-full h-full"
                        isTrusted={post.author.isTrusted}
                      />
                    </div>
                  }
                  onViewProfile={() => {
                    navigate(`/profile/${post.author.username}`);
                  }}
                  onFollow={() => {
                    if (!isAuthenticated) {
                      onLoginRequired?.();
                    }
                  }}
                />
              )}

              {/* Author Name / Page Info - Mobile Optimized */}
              {postData.page ? (
                <div className="flex items-center gap-1 sm:gap-1.5 min-w-0 flex-wrap">
                  <span 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/profile/${post.author.username}`);
                    }}
                    className="font-semibold text-xs sm:text-sm truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors touch-manipulation"
                  >
                    {postData.author.username}
                  </span>
                  {postData.author.isVerified && (
                    <VerifiedBadge size={12} className="flex-shrink-0 sm:w-3.5 sm:h-3.5" />
                  )}
                  <span className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 flex-shrink-0 font-medium hidden xs:inline">posted for</span>
                  <span 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (postData.page?.slug) {
                        navigate(`/pages/${postData.page.slug}`);
                      }
                    }}
                    className="font-bold text-xs sm:text-sm bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent hover:from-blue-700 hover:to-cyan-700 dark:hover:from-blue-300 dark:hover:to-cyan-300 transition-all cursor-pointer truncate touch-manipulation"
                  >
                    {postData.page.name}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1 sm:gap-1.5 min-w-0 flex-wrap">
                  <span 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/profile/${post.author.username}`);
                    }}
                    className="font-medium text-xs sm:text-sm truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors touch-manipulation"
                  >
                    {postData.author.username}
                  </span>
                  {postData.author.isVerified && (
                    <VerifiedBadge size={12} className="flex-shrink-0 sm:w-3.5 sm:h-3.5" />
                  )}
                  <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate hidden sm:inline">
                    {postData.author.walletAddress}
                  </span>
                </div>
              )}

              <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 hidden xs:inline">•</span>
              <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                {timeAgo(postData.publishedAt || postData.createdAt || postData.timestamp)}
              </span>
              {!postData.page && (
                <Badge variant="gradient" className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 flex-shrink-0">{postData.author.reputation} rep</Badge>
              )}
            </div>
            <button
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 sm:p-2 rounded-md hover:bg-white/10 dark:hover:bg-white/5 active:scale-95 transition-all duration-200 flex-shrink-0 touch-manipulation"
            >
              <MoreHorizontal size={14} className="sm:w-4 sm:h-4" />
            </button>
          </div>

          {/* Title - Colorful Gradient - Mobile Optimized */}
          <h3 className="text-base sm:text-lg md:text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 dark:hover:from-blue-300 dark:hover:via-purple-300 dark:hover:to-pink-300 transition-all duration-300 leading-tight sm:leading-snug cursor-pointer line-clamp-2">
            {postData.title}
          </h3>

          {/* Cover Image - Show cover image or OG image if auto-generated - Mobile Optimized */}
          {(postData.coverImage || postData.coverImageUrl || postData.coverImageSizes || postData.ogImageUrl) && (
            <div className="relative w-full h-36 sm:h-40 md:h-48 rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 mb-2 sm:mb-3">
              <ResponsivePostImage
                coverImageUrl={postData.coverImage || postData.coverImageUrl || postData.ogImageUrl}
                coverImageSizes={postData.coverImageSizes}
                alt={postData.title}
                className="w-full h-full object-cover"
                size="feed" // Use feed size for cards
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Content Preview - Clean Text with Formatted Mentions - Mobile Optimized */}
          <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 line-clamp-2 sm:line-clamp-3 leading-relaxed">
            {formatContentPreview(getCleanPreview(postData.content, 250))}
          </div>

          {/* Tags - Mobile Optimized */}
          {postData.tags && postData.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 sm:gap-1.5">
              {postData.tags.slice(0, 3).map(tag => {
                const tagName = typeof tag === 'string' ? tag : (tag.name || tag.slug || '');
                const tagKey = typeof tag === 'string' ? tag : (tag.id || tag.slug || tagName);
                return (
                  <Badge key={tagKey} className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5">#{tagName}</Badge>
                );
              })}
              {postData.tags.length > 3 && (
                <Badge className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5">+{postData.tags.length - 3}</Badge>
              )}
            </div>
          )}

          {/* Actions Footer - Mobile Optimized */}
          <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-gray-200 dark:border-white/5">
            <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap flex-1 min-w-0">
              {/* Emoji Reactions - Inline and Compact - Mobile Optimized */}
              {emojis.length > 0 && (
                <div className="flex items-center gap-0.5 sm:gap-1 flex-wrap">
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
                      className={`px-1 sm:px-1.5 py-0.5 rounded text-xs transition-all duration-200 flex items-center gap-0.5 active:scale-95 touch-manipulation ${
                        userEmojis.includes(emoji)
                          ? 'bg-blue-500/20 text-blue-400 ring-1 ring-blue-400/50'
                          : 'hover:bg-gray-200 dark:hover:bg-gray-700 active:bg-gray-300 dark:active:bg-gray-600'
                      }`}
                    >
                      <span className="text-xs sm:text-sm">{emoji}</span>
                      <span className="font-semibold text-[9px] sm:text-[10px]">{count}</span>
                    </button>
                  ))}
                </div>
              )}
              
              {/* Add Emoji Button - Mobile Optimized */}
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
                  className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-all duration-200 touch-manipulation"
                >
                  <Smile size={12} className="sm:w-3.5 sm:h-3.5" />
                  <span className="text-[10px] sm:text-xs font-medium hidden sm:inline">React</span>
                </button>

                {showEmojiPicker && (
                  <div className="absolute bottom-full mb-2 sm:mb-3 left-0 z-[9999] animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl border-2 border-gray-200 dark:border-gray-700 p-2 sm:p-3 min-w-[200px] sm:min-w-[260px]">
                      <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                        {['👍', '❤️', '🔥', '👏', '😂', '😮', '😢', '🎉'].map((emoji) => (
                          <button
                            key={emoji}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEmojiReaction(emoji);
                              setShowEmojiPicker(false);
                            }}
                            className={`p-2 sm:p-3 text-xl sm:text-2xl rounded-lg sm:rounded-xl active:scale-95 hover:scale-110 transition-all duration-200 touch-manipulation ${
                              userEmojis.includes(emoji) 
                                ? 'bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 ring-2 ring-blue-400 dark:ring-blue-500 shadow-lg' 
                                : 'hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600'
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                      {/* Arrow pointer */}
                      <div className="absolute -bottom-2 left-3 sm:left-4 w-3 h-3 sm:w-4 sm:h-4 bg-white dark:bg-gray-800 border-b-2 border-r-2 border-gray-200 dark:border-gray-700 rotate-45"></div>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-all duration-200 touch-manipulation"
              >
                <MessageCircle size={12} className="sm:w-3.5 sm:h-3.5" />
                <span className="text-[10px] sm:text-xs font-medium">{postData.commentCount || 0}</span>
              </button>
              <ShareDropdown
        url={`${window.location.origin}/post/${postData.slug}`}
        title={postData.title}
        type="post"
        hashtags={postData.tags || []}
        description={postData.content?.substring(0, 150)}
                trigger={
              <button
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-all duration-200 touch-manipulation"
              >
                <Share2 size={12} className="sm:w-3.5 sm:h-3.5" />
                <span className="text-[10px] sm:text-xs font-medium hidden sm:inline">Share</span>
              </button>
                }
              />
            </div>
            <Tooltip content={!isAuthenticated ? "Login to bookmark" : bookmarked ? "Remove bookmark" : "Bookmark"}>
              <button
                onClick={handleBookmark}
                className={`p-1.5 sm:p-2 rounded-md transition-all duration-200 active:scale-95 touch-manipulation flex-shrink-0 ${
                  bookmarked
                    ? 'bg-yellow-500/20 text-yellow-500 shadow-md shadow-yellow-500/20'
                    : !isAuthenticated
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-white/10 dark:hover:bg-white/5'
                }`}
              >
                <Bookmark size={12} className="sm:w-3.5 sm:h-3.5" fill={bookmarked ? 'currentColor' : 'none'} strokeWidth={bookmarked ? 2.5 : 2} />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
