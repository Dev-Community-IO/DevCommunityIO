import { PostActionIcon } from './PostActionIcon';
import { Post } from '../types';
import {
  postCardSurfaceClass,
  postCardPaddingClass,
  postTagClass,
  postActionBtnClass,
  postMentionClass,
  postCardDividerClass,
} from './postCardSurface';
import { Tooltip } from './Tooltip';
import { PostCardHeader } from './PostCardHeader';
import { ShareDropdown } from './ShareDropdown';
import { ResponsivePostImage } from './ResponsivePostImage';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect, useRef } from 'react';
import reactionsService from '../services/api/reactions.service';
import bookmarksService from '../services/api/bookmarks.service';
import postsService from '../services/api/posts.service';
import { useNavigate } from 'react-router-dom';
import { extractPostPreviewText } from '../utils/extractPostPreviewText';

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
          className={`${postMentionClass} cursor-pointer inline-block`}
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

  // Count a "card click" view (deduped + anonymous-friendly server-side), then
  // navigate. Fire-and-forget so it never delays the click.
  const handleCardClick = () => {
    if (postData?.id) {
      postsService.trackView(postData.id, 'card_click').catch(() => {});
    }
    onClick();
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

  const hasCover =
    (postData.autoGenerateImage &&
      (postData.coverImage ||
        postData.coverImageUrl ||
        postData.coverImageSizes ||
        postData.ogImageUrl)) ||
    Boolean(postData.coverImage || postData.coverImageUrl || postData.coverImageSizes);

  const contentPreview = extractPostPreviewText(postData.content, {
    maxLength: 280,
    skipTitle: postData.title,
  });
  const showContentPreview = contentPreview.length > 0;

  const isPostOwner =
    isAuthenticated &&
    Boolean(user?.id) &&
    Boolean(postData.author?.id) &&
    String(user!.id) === String(postData.author.id);

  return (
    <article
      className={`${postCardSurfaceClass} ${postCardPaddingClass}`}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      tabIndex={0}
      role="link"
      aria-label={postData.title}
    >
      <div className="flex flex-1 flex-col space-y-2 sm:space-y-2.5">
        {/* Main Content */}
        <div className="space-y-2 sm:space-y-3 min-w-0 flex-1 flex flex-col">
          <PostCardHeader
            post={postData}
            timeAgo={timeAgo(postData.publishedAt || postData.createdAt || postData.timestamp)}
            isAuthenticated={isAuthenticated}
            isPostOwner={isPostOwner}
            onLoginRequired={onLoginRequired}
            onNavigateProfile={(username) => navigate(`/profile/${username}`)}
            onNavigatePage={(slug) => navigate(`/pages/${slug}`)}
          />

          {hasCover && (
            <div className="relative mb-1 h-32 w-full shrink-0 overflow-hidden rounded-lg border border-zinc-200/60 bg-zinc-100 dark:border-white/[0.06] dark:bg-zinc-900/80 sm:h-36">
              <ResponsivePostImage
                coverImageUrl={
                  postData.coverImage ||
                  postData.coverImageUrl ||
                  (postData.autoGenerateImage ? postData.ogImageUrl : undefined)
                }
                coverImageSizes={postData.coverImageSizes}
                alt={postData.title}
                className="h-full w-full object-cover"
                size="feed"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}

          <h3 className="line-clamp-2 text-base font-semibold leading-snug tracking-tight text-zinc-900 transition-colors group-hover:text-zinc-700 dark:text-zinc-50 dark:group-hover:text-zinc-200 sm:text-[17px]">
            {postData.title}
          </h3>

          {showContentPreview && (
            <p
              className={`flex-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400 sm:text-sm ${
                hasCover ? 'line-clamp-2' : 'line-clamp-2 sm:line-clamp-3'
              }`}
            >
              {formatContentPreview(contentPreview)}
            </p>
          )}

          {/* Tags - Mobile Optimized */}
          {postData.tags && postData.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 sm:gap-1.5">
              {postData.tags.slice(0, 3).map(tag => {
                const tagName = typeof tag === 'string' ? tag : (tag.name || tag.slug || '');
                const tagKey = typeof tag === 'string' ? tag : (tag.id || tag.slug || tagName);
                return (
                  <span key={tagKey} className={postTagClass}>
                    #{tagName}
                  </span>
                );
              })}
              {postData.tags.length > 3 && (
                <span className={postTagClass}>+{postData.tags.length - 3}</span>
              )}
            </div>
          )}

          {/* Actions Footer - Mobile Optimized */}
          <div className={`flex shrink-0 items-center justify-between pt-2 sm:pt-2.5 ${postCardDividerClass}`}>
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
                      className={`flex items-center gap-0.5 rounded-md px-1 sm:px-1.5 py-0.5 text-xs transition-colors touch-manipulation ${
                        userEmojis.includes(emoji)
                          ? 'bg-zinc-200/90 text-zinc-900 ring-1 ring-zinc-300/80 dark:bg-white/10 dark:text-zinc-100 dark:ring-white/15'
                          : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-white/[0.06]'
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
                  className={postActionBtnClass}
                >
                  <PostActionIcon name="react" size={14} className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  <span className="text-[10px] sm:text-xs font-medium hidden sm:inline">React</span>
                </button>

                {showEmojiPicker && (
                  <div className="absolute bottom-full left-0 z-[9999] mb-2 animate-fade-in">
                    <div className="min-w-[200px] rounded-lg border border-zinc-200/80 bg-white p-2 shadow-lg dark:border-white/10 dark:bg-zinc-900 sm:min-w-[220px]">
                      <div className="grid grid-cols-4 gap-0.5">
                        {['👍', '❤️', '🔥', '👏', '😂', '😮', '😢', '🎉'].map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEmojiReaction(emoji);
                              setShowEmojiPicker(false);
                            }}
                            className={`rounded-md p-2 text-xl transition-colors touch-manipulation sm:p-2.5 ${
                              userEmojis.includes(emoji)
                                ? 'bg-zinc-100 ring-1 ring-zinc-300/80 dark:bg-white/10 dark:ring-white/15'
                                : 'hover:bg-zinc-100 dark:hover:bg-white/[0.06]'
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={(e) => e.stopPropagation()}
                className={postActionBtnClass}
              >
                <PostActionIcon name="comment" size={14} className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span>{postData.commentCount || 0}</span>
              </button>
              <span
                className="flex items-center gap-1 px-1.5 sm:px-2 py-1 text-zinc-500 dark:text-zinc-400"
                title={`${postData.viewCount || 0} views`}
              >
                <PostActionIcon name="view" size={14} className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span className="text-[10px] sm:text-xs font-medium">{postData.viewCount || 0}</span>
              </span>
              <ShareDropdown
        url={`${window.location.origin}/post/${postData.slug}`}
        title={postData.title}
        type="post"
        hashtags={postData.tags || []}
        description={postData.content?.substring(0, 150)}
                trigger={
              <button
                type="button"
                onClick={(e) => e.stopPropagation()}
                className={postActionBtnClass}
              >
                <PostActionIcon name="share" size={14} className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span className="hidden sm:inline">Share</span>
              </button>
                }
              />
            </div>
            <Tooltip content={!isAuthenticated ? "Login to bookmark" : bookmarked ? "Remove bookmark" : "Bookmark"}>
              <button
                onClick={handleBookmark}
                className={`shrink-0 rounded-md p-1.5 transition-colors touch-manipulation sm:p-2 ${
                  bookmarked
                    ? 'bg-zinc-200/90 text-zinc-900 dark:bg-white/10 dark:text-zinc-100'
                    : !isAuthenticated
                      ? 'cursor-not-allowed opacity-50'
                      : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-white/[0.06] dark:hover:text-zinc-200'
                }`}
              >
                <PostActionIcon
                  name={bookmarked ? 'bookmarkActive' : 'bookmark'}
                  size={14}
                  className="h-3 w-3 sm:h-3.5 sm:w-3.5"
                />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    </article>
  );
}
