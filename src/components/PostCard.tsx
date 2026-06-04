import { ChevronRight, MessageCircle } from 'lucide-react';
import { PostActionIcon } from './PostActionIcon';
import { Post } from '../types';
import {
  compactPostCardClass,
  postTagClass,
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
    maxLength: hasCover ? 140 : 200,
    skipTitle: postData.title,
  });
  const showContentPreview = contentPreview.length > 0;

  const firstTag = postData.tags?.[0];
  const firstTagLabel = firstTag
    ? typeof firstTag === 'string'
      ? firstTag
      : firstTag?.name || firstTag?.slug
    : null;

  const isPostOwner =
    isAuthenticated &&
    Boolean(user?.id) &&
    Boolean(postData.author?.id) &&
    String(user!.id) === String(postData.author.id);

  const totalReactions = emojis.reduce((sum, e) => sum + e.count, 0);
  const topEmojis = emojis.slice(0, 3);
  const commentCount = postData.commentCount ?? 0;
  const viewCount = postData.viewCount ?? 0;

  const iconActionClass =
    'flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-white/[0.06] dark:hover:text-zinc-200 touch-manipulation';

  return (
    <article
      className={compactPostCardClass}
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
      {hasCover ? (
        <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-zinc-100 dark:bg-zinc-950">
          <ResponsivePostImage
            coverImageUrl={
              postData.coverImage ||
              postData.coverImageUrl ||
              (postData.autoGenerateImage ? postData.ogImageUrl : undefined)
            }
            coverImageSizes={postData.coverImageSizes}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
            size="feed"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent"
            aria-hidden
          />
          {firstTagLabel && (
            <span
              className={`${postTagClass} absolute left-2.5 top-2.5 max-w-[calc(100%-1.25rem)] truncate border-white/20 bg-white/90 text-zinc-700 backdrop-blur-sm dark:bg-zinc-900/90 dark:text-zinc-300`}
            >
              #{firstTagLabel}
            </span>
          )}
        </div>
      ) : (
        <div
          className="h-1 w-full shrink-0 bg-gradient-to-r from-zinc-200 via-zinc-300/70 to-zinc-200 dark:from-white/[0.06] dark:via-white/[0.1] dark:to-white/[0.06]"
          aria-hidden
        />
      )}

      <div className="flex min-h-0 flex-1 flex-col p-4">
        <PostCardHeader
          post={postData}
          timeAgo={timeAgo(postData.publishedAt || postData.createdAt || postData.timestamp)}
          isAuthenticated={isAuthenticated}
          isPostOwner={isPostOwner}
          onLoginRequired={onLoginRequired}
          onNavigateProfile={(username) => navigate(`/profile/${username}`)}
          onNavigatePage={(slug) => navigate(`/pages/${slug}`)}
        />

        <h3 className="mb-2 mt-3 line-clamp-2 text-[15px] font-semibold leading-snug tracking-tight text-zinc-900 transition-colors group-hover:text-zinc-700 dark:text-zinc-50 dark:group-hover:text-white sm:text-base">
          {postData.title}
        </h3>

        {showContentPreview ? (
          <p className="mb-3 line-clamp-2 flex-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {formatContentPreview(contentPreview)}
          </p>
        ) : (
          <div className="mb-3 flex-1" />
        )}

        {!hasCover && firstTagLabel && (
          <span className={`${postTagClass} mb-3 max-w-full self-start truncate`}>#{firstTagLabel}</span>
        )}

        <div
          className={`mt-auto flex items-center justify-between gap-2 pt-3 ${postCardDividerClass}`}
        >
          <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
            {topEmojis.length > 0 && totalReactions > 0 && (
              <span className="inline-flex max-w-full items-center gap-1 tabular-nums">
                <span className="flex items-center -space-x-0.5">
                  {topEmojis.map(({ emoji }) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isAuthenticated) {
                          onLoginRequired?.();
                          return;
                        }
                        handleEmojiReaction(emoji);
                      }}
                      className={`inline-flex h-5 w-5 items-center justify-center rounded-full border text-[10px] transition-colors touch-manipulation ${
                        userEmojis.includes(emoji)
                          ? 'border-zinc-300 bg-zinc-200/90 dark:border-white/15 dark:bg-white/10'
                          : 'border-zinc-200/80 bg-zinc-50 dark:border-white/10 dark:bg-zinc-800'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </span>
                <span>{totalReactions}</span>
              </span>
            )}
            <span className="inline-flex items-center gap-1 tabular-nums">
              <MessageCircle size={12} strokeWidth={2} className="shrink-0 opacity-70" aria-hidden />
              {commentCount}
            </span>
            {viewCount > 0 && (
              <span className="hidden tabular-nums sm:inline">{viewCount.toLocaleString()} views</span>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-0.5">
            <div className="relative" ref={emojiPickerRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isAuthenticated) {
                    onLoginRequired?.();
                    return;
                  }
                  setShowEmojiPicker(!showEmojiPicker);
                }}
                className={iconActionClass}
                aria-label="React"
              >
                <PostActionIcon name="react" size={16} className="h-4 w-4" />
              </button>

              {showEmojiPicker && (
                <div className="absolute bottom-full right-0 z-[9999] mb-2 animate-fade-in">
                  <div className="min-w-[200px] rounded-lg border border-zinc-200/80 bg-white p-2 shadow-lg dark:border-white/10 dark:bg-zinc-900">
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
                          className={`rounded-md p-2 text-xl transition-colors touch-manipulation ${
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
                  className={iconActionClass}
                  aria-label="Share"
                >
                  <PostActionIcon name="share" size={16} className="h-4 w-4" />
                </button>
              }
            />

            <Tooltip
              content={
                !isAuthenticated ? 'Login to bookmark' : bookmarked ? 'Remove bookmark' : 'Bookmark'
              }
            >
              <button
                type="button"
                onClick={handleBookmark}
                className={`${iconActionClass} ${
                  bookmarked ? 'bg-zinc-200/90 text-zinc-900 dark:bg-white/10 dark:text-zinc-100' : ''
                } ${!isAuthenticated ? 'cursor-not-allowed opacity-50' : ''}`}
                aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark'}
              >
                <PostActionIcon
                  name={bookmarked ? 'bookmarkActive' : 'bookmark'}
                  size={16}
                  className="h-4 w-4"
                />
              </button>
            </Tooltip>

            <span className="ml-0.5 inline-flex items-center gap-0.5 pl-1 text-xs font-medium text-zinc-500 transition-colors group-hover:text-zinc-800 dark:text-zinc-400 dark:group-hover:text-zinc-200">
              <span className="sr-only">Read post</span>
              <ChevronRight
                size={15}
                strokeWidth={2}
                className="transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
