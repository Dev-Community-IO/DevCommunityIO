import { ArrowLeft, MessageCircle, Share2, Bookmark, MoreHorizontal, Flag, Smile, Award, AlertCircle, X, Eye } from 'lucide-react';
import { Post, Comment as CommentType, Page } from '../types';
import { asidePanelClass, postCardDividerClass, postActionBtnClass } from './postCardSurface';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { Comment } from './Comment';
import { VerifiedBadge } from './VerifiedBadge';
import { Tooltip } from './Tooltip';
import { MarkdownRenderer } from '../utils/markdownRenderer';
import { ShareDropdown } from './ShareDropdown';
import { ReportModal } from './ReportModal';
import { MentionTextarea } from './MentionTextarea';
import { PostOriginDisplay } from './PostOriginDisplay';
import { PostTags } from './PostTags';
import { ResponsivePostImage } from './ResponsivePostImage';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import commentsService from '../services/api/comments.service';
import reactionsService from '../services/api/reactions.service';
import pagesService from '../services/api/pages.service';
import bookmarksService from '../services/api/bookmarks.service';
import postsService from '../services/api/posts.service';
import { formatReadingTime } from '../utils/readingTime';

const DEFAULT_PAGE_LOGO = 'https://api.dicebear.com/7.x/shapes/svg?seed=Adaex%20App';

const detailPanelClass = `${asidePanelClass} p-3 sm:p-4 md:p-5`;

import { PostDetailSkeleton, CommentSkeletonList } from './skeletons';
import { useToast } from './Toast';

const COMMENT_REQUIREMENT_CACHE_KEY = 'devcommunity.commentRequirement.comment';

interface PostDetailProps {
  post: Post;
  onClose: () => void;
  onLoginRequired?: () => void;
}

export function PostDetail({ post, onClose, onLoginRequired }: PostDetailProps) {
  const { isAuthenticated, user, updateUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [bookmarked, setBookmarked] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<CommentType[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojis, setEmojis] = useState<{ emoji: string; count: number }[]>([]);
  const [userEmojis, setUserEmojis] = useState<string[]>([]);
  const [pageData, setPageData] = useState<Page | null>(post.page || null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const [commentRequirement, setCommentRequirement] = useState<number>(0);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [commentNotice, setCommentNotice] = useState<string | null>(null);
  const userReputation = user?.reputation ?? 0;
  const debugCommentGate = useCallback((label: string, payload?: unknown) => {
    console.debug('[PostDetail][CommentGate]', label, payload);
  }, []);
  const updateCommentRequirement = useCallback((value: number) => {
    setCommentRequirement(value);
    if (typeof window !== 'undefined') {
      if (value > 0) {
        window.sessionStorage.setItem(COMMENT_REQUIREMENT_CACHE_KEY, String(value));
      } else {
        window.sessionStorage.removeItem(COMMENT_REQUIREMENT_CACHE_KEY);
      }
    }
    debugCommentGate('updateCommentRequirement', { value });
  }, [debugCommentGate]);

  // Count a post "open" every time the detail page is opened (no per-user dedup).
  // The displayed count updates from the server's response so it ticks up live.
  // A ref guards React strict-mode's dev double-invoke from counting one open
  // twice; genuine re-opens (new post.id) still count each time.
  const [viewCount, setViewCount] = useState<number>(post.viewCount || 0);
  const lastTrackedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!post?.id) return;
    setViewCount(post.viewCount || 0);
    if (lastTrackedRef.current === post.id) return;
    lastTrackedRef.current = post.id;
    postsService
      .trackView(post.id, 'open')
      .then((r) => {
        if (r && typeof r.viewCount === 'number') setViewCount(r.viewCount);
      })
      .catch(() => {});
  }, [post?.id]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const cachedRequirement = window.sessionStorage.getItem(COMMENT_REQUIREMENT_CACHE_KEY);
    if (!cachedRequirement) return;
    const parsedRequirement = Number(cachedRequirement);
    if (!Number.isNaN(parsedRequirement) && parsedRequirement > 0) {
      debugCommentGate('hydrateRequirementFromCache', { parsedRequirement });
      setCommentRequirement(parsedRequirement);
    }
  }, [debugCommentGate]);
  const bypassCommentRequirement = user ? (user.isTrusted || ['moderator', 'admin', 'super_admin'].includes(user.role)) : false;
  const isCommentRequirementBlocking = Boolean(
    user &&
    commentRequirement > 0 &&
    !bypassCommentRequirement &&
    userReputation < commentRequirement
  );
  const requirementWarningShownRef = useRef(false);
  const requirementMessage = user
    ? `You need at least ${commentRequirement} reputation points to comment. Your current reputation: ${userReputation}`
    : null;
  const remindReputationRequirement = useCallback(() => {
    if (!requirementMessage) return;
    debugCommentGate('remindReputationRequirement', {
      requirementMessage,
      requirementWarningShown: requirementWarningShownRef.current,
    });
    setCommentNotice(requirementMessage);
    setCommentError(null);
    if (!requirementWarningShownRef.current) {
      toast.warning(requirementMessage);
      requirementWarningShownRef.current = true;
    }
  }, [debugCommentGate, requirementMessage, toast]);

  // REBUILT: Fetch full page data if post has a page - same pattern as PageView
  useEffect(() => {
    const fetchPageData = async () => {
      if (post.page) {
        // If page data is already in post, use it
        const page = post.page as any;
        // Extract isFollowing - MUST be boolean, default to false
        const isFollowingFromApi = page?.isFollowing === true;
        setPageData({
          ...page,
          isFollowing: isFollowingFromApi // Explicitly set to ensure it's always boolean
        } as Page);
      } else if (post.pageId) {
        try {
          // Fetch page data from API
          const pageResponse = await pagesService.getPage(post.pageId);
          
          // API returns: { page: { ...pageData, isFollowing: boolean } }
          const pageDataFromApi = pageResponse.page || pageResponse;
          
          // Extract isFollowing - MUST be boolean, default to false
          const isFollowingFromApi = pageDataFromApi?.isFollowing === true;
          
          // Store complete page data with isFollowing explicitly set
          setPageData({
            ...pageDataFromApi,
            isFollowing: isFollowingFromApi // Explicitly set to ensure it's always boolean
          });
        } catch (error) {
          console.error('Failed to fetch page data:', error);
        }
      }
    };
    fetchPageData();
  }, [post.pageId, post.page, user?.id]); // Re-fetch when user changes

  // Sync pageData when post.page changes (e.g., from PageSidebar follow action)
  useEffect(() => {
    if (post.page) {
      const page = post.page as any;
      // Extract isFollowing - MUST be boolean, default to false
      const isFollowingFromPost = page?.isFollowing === true;
      setPageData({
        ...page,
        isFollowing: isFollowingFromPost // Explicitly set to ensure it's always boolean
      });
    }
  }, [post.page?.isFollowing, post.page?.followerCount]); // Sync when follow status or follower count changes
  
  // Load reputation requirements for comments (public endpoint)
  useEffect(() => {
    let isMounted = true;

    const fetchCommentRequirement = async () => {
      try {
        const data = await commentsService.getRequirement();
        debugCommentGate('fetchedRequirementFromPublic', data);
        if (!isMounted) return;

        if (data && typeof data.requiredReputation === 'number') {
          updateCommentRequirement(data.requiredReputation);
        }
      } catch (error) {
        console.error('Failed to fetch comment reputation requirement:', error);
        debugCommentGate('fetchRequirementError', error);
      }
    };

    fetchCommentRequirement();

    return () => {
      isMounted = false;
    };
  }, [debugCommentGate, updateCommentRequirement]);

  useEffect(() => {
    if (!isCommentRequirementBlocking) {
      requirementWarningShownRef.current = false;
      debugCommentGate('requirementCleared', {
        commentNotice,
        commentError,
      });
      if (!commentNotice) {
        setCommentError(null);
      }
    }
  }, [
    isCommentRequirementBlocking,
    requirementMessage,
    toast,
    remindReputationRequirement,
    commentNotice,
    commentRequirement,
    userReputation,
    debugCommentGate
  ]);

  useEffect(() => {
    debugCommentGate('commentNoticeChanged', commentNotice);
  }, [commentNotice, debugCommentGate]);

  useEffect(() => {
    debugCommentGate('commentErrorChanged', commentError);
  }, [commentError, debugCommentGate]);

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

  // Load bookmark status (only for authenticated users) and comments (always) on mount
  useEffect(() => {
    if (post?.id) {
      // Always load comments (public endpoint)
      fetchComments();
      
      // Only check bookmark status if authenticated
      if (isAuthenticated) {
        checkBookmarkStatus();
      }
    }
  }, [isAuthenticated, post?.id]);

  const checkBookmarkStatus = async () => {
    if (!isAuthenticated) return;
    try {
      const response = await bookmarksService.checkBookmark(post.id);
      setBookmarked(response.isBookmarked);
    } catch (error) {
      console.error('Failed to check bookmark status:', error);
    }
  };

  const fetchComments = async () => {
    if (!post?.id) return;
    try {
      setLoadingComments(true);
      const response = await commentsService.getComments(post.id);
      setComments(response.comments || []);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  // Show loading or error if post is not available
  if (!post) {
    return <PostDetailSkeleton />;
  }

  
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
      if (response.reactorReputation !== undefined && response.reactorReputation !== null) {
        updateUser({ reputation: response.reactorReputation });
      }
    } catch (error) {
      console.error('Failed to add emoji:', error);
    }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      onLoginRequired?.();
      return;
    }
    
    // Optimistically update UI
    const previousBookmarked = bookmarked;
    setBookmarked(!bookmarked);
    
    try {
      if (previousBookmarked) {
        await bookmarksService.removeBookmark(post.id);
      } else {
        await bookmarksService.addBookmark(post.id);
      }
    } catch (error: any) {
      // Revert optimistic update on error
      setBookmarked(previousBookmarked);
      
      // If error says already bookmarked, check actual status and update accordingly
      if (error?.message?.includes('already bookmarked') || error?.data?.message?.includes('already bookmarked')) {
        try {
          const response = await bookmarksService.checkBookmark(post.id);
          setBookmarked(response.isBookmarked);
        } catch (checkError) {
          console.error('Failed to check bookmark status after error:', checkError);
        }
      } else if (error?.message?.includes('not found') || error?.data?.message?.includes('not found')) {
        // If bookmark not found when trying to remove, check actual status
        try {
          const response = await bookmarksService.checkBookmark(post.id);
          setBookmarked(response.isBookmarked);
        } catch (checkError) {
          console.error('Failed to check bookmark status after error:', checkError);
        }
      } else {
        console.error('Failed to toggle bookmark:', error);
      }
    }
  };

  const handleCommentChange = (value: string) => {
    setComment(value);
    debugCommentGate('handleCommentChange:start', {
      valueLength: value.length,
      isCommentRequirementBlocking,
      requirementMessage,
    });

    if (!value.trim()) {
      if (!isCommentRequirementBlocking) {
        setCommentNotice(null);
        setCommentError(null);
        debugCommentGate('handleCommentChange:clearedEmptyValue');
      } else {
        debugCommentGate('handleCommentChange:emptyWhileBlocking');
      }
      return;
    }

    if (!isCommentRequirementBlocking) {
      setCommentNotice(null);
      setCommentError(null);
      debugCommentGate('handleCommentChange:clearedNonBlocking');
    } else {
      debugCommentGate('handleCommentChange:blockingNoClear');
    }
  };

  const handleSubmitComment = async () => {
    debugCommentGate('handleSubmitComment:start', {
      isAuthenticated,
      hasCommentText: Boolean(comment.trim()),
      isCommentRequirementBlocking,
    });
    if (!isAuthenticated) {
      onLoginRequired?.();
      return;
    }
    
    if (!comment.trim()) return;
    
    if (isCommentRequirementBlocking) {
      debugCommentGate('handleSubmitComment:blockingEarlyExit', {
        requirementMessage,
      });
      remindReputationRequirement();
      return;
    }
    
    try {
      setSubmittingComment(true);
      await commentsService.createComment(post.id, { content: comment });
      setComment('');
      setCommentError(null);
      setCommentNotice(null);
      // Refresh comments
      await fetchComments();
    } catch (error: any) {
      console.error('Failed to submit comment:', error);
      debugCommentGate('handleSubmitComment:error', {
        status: error?.response?.status,
        data: error?.response?.data,
      });
      const status = error.response?.status;
      const errorData = error.response?.data || {};
      if (status === 403) {
        const rawRequired =
          errorData.requiredReputation ??
          errorData.required_reputation ??
          errorData.requirement ??
          commentRequirement;
        const parsedRequired = Number(rawRequired);
        const requiredReputation =
          !Number.isNaN(parsedRequired) && parsedRequired > 0 ? parsedRequired : commentRequirement;
        updateCommentRequirement(requiredReputation);
        debugCommentGate('handleSubmitComment:403', {
          rawRequired,
          requiredReputation,
        });

        const rawCurrent =
          errorData.currentReputation ?? errorData.current_reputation ?? userReputation;
        const parsedCurrent = Number(rawCurrent);
        const currentReputation =
          !Number.isNaN(parsedCurrent) && parsedCurrent >= 0 ? parsedCurrent : userReputation;
        debugCommentGate('handleSubmitComment:403Current', {
          rawCurrent,
          currentReputation,
        });

        const constructedMessage =
          errorData.message ||
          `You need at least ${requiredReputation} reputation points to comment. Your current reputation: ${currentReputation}`;

        setCommentNotice(constructedMessage);
        setCommentError(null);
        toast.warning(constructedMessage);
        requirementWarningShownRef.current = true;
        debugCommentGate('handleSubmitComment:403NoticeApplied', {
          constructedMessage,
          requiredReputation,
          currentReputation,
        });
      } else {
        const errorMessage = errorData.message || 'Failed to post comment';
        setCommentError(errorMessage);
        setCommentNotice(null);
        toast.error(errorMessage);
        debugCommentGate('handleSubmitComment:genericError', {
          errorMessage,
        });
      }
    } finally {
      debugCommentGate('handleSubmitComment:finally');
      setSubmittingComment(false);
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
    <>
      <button
        onClick={onClose}
        className="mb-3 flex min-h-[40px] items-center gap-1.5 pl-1 text-zinc-500 transition-colors hover:text-zinc-800 active:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 dark:active:text-zinc-100 touch-manipulation -ml-1"
      >
        <ArrowLeft size={16} className="group-active:-translate-x-0.5 transition-transform" />
        <span className="text-xs font-medium">Back to feed</span>
      </button>

      <div className="space-y-3 sm:space-y-4">
        <div className="min-w-0 space-y-3 sm:space-y-4">
          <article className={detailPanelClass}>
            <div className="min-w-0 space-y-3 sm:space-y-3.5">
              <div className="mb-2 flex items-start justify-between gap-2 sm:gap-3">
                <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3 flex-1 min-w-0">
                  {/* User Avatar and Page Logo */}
                  <div className="relative flex-shrink-0">
                    {post.author && (
                      <Tooltip content={`@${post.author.username || post.author.pseudo || 'unknown'}`}>
                        <div 
                          onClick={() => navigate(`/profile/${post.author.username || post.author.pseudo || ''}`)}
                          className="relative cursor-pointer hover:scale-105 transition-transform"
                        >
                          <Avatar 
                            src={(post.author.avatar || post.author.avatarUrl) || ''} 
                            alt={post.author.username || post.author.pseudo || 'Unknown'} 
                            size="md" 
                            className="cursor-pointer"

                          />
                        {/* Page Logo under avatar if post is for a page */}
                        {pageData && (
                          <div 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (pageData.slug) {
                                navigate(`/pages/${pageData.slug}`);
                              }
                            }}
                            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg overflow-hidden border-2 border-white dark:border-gray-900 bg-white dark:bg-gray-800 shadow-lg cursor-pointer hover:scale-110 transition-transform"
                          >
                            <img 
                              src={pageData.logo || pageData.logoUrl || DEFAULT_PAGE_LOGO}
                              alt={pageData.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = DEFAULT_PAGE_LOGO;
                              }}
                            />
                          </div>
                        )}
                        </div>
                      </Tooltip>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    {post.author && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span 
                          onClick={() => navigate(`/profile/${post.author.username || post.author.pseudo || ''}`)}
                          className="cursor-pointer text-sm font-semibold text-zinc-900 transition-colors hover:text-zinc-700 dark:text-zinc-100 dark:hover:text-zinc-300"
                        >
                          {post.author.username || post.author.pseudo || 'Unknown'}
                        </span>
                        {post.author.isVerified && (
                          <VerifiedBadge size={14} />
                        )}
                        {pageData && (
                          <>
                            <span className="text-[11px] text-zinc-400 dark:text-zinc-500">posted for</span>
                            <button
                              type="button"
                              onClick={() => pageData.slug && navigate(`/pages/${pageData.slug}`)}
                              className="cursor-pointer text-sm font-semibold text-zinc-700 transition-colors hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
                            >
                              {pageData.name}
                            </button>
                          </>
                        )}
                      </div>
                    )}
                    <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                      <span>{timeAgo(post.publishedAt || post.createdAt || post.timestamp)}</span>
                      <span>•</span>
                      <span className="text-xs">{formatReadingTime(post.content)}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-xs" title={`${viewCount} views`}>
                        <Eye size={13} />
                        {viewCount}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="shrink-0 rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 dark:hover:bg-white/[0.06]"
                >
                  <MoreHorizontal size={18} />
                </button>
              </div>

              {/* Post Origin Display - Under Author Card */}
              {post.postOrigin || post.originSource || post.originUrl ? (
                <div className="mb-3 sm:mb-4">
                  <PostOriginDisplay 
                    postOrigin={post.postOrigin}
                    originSource={post.originSource}
                    originUrl={post.originUrl}
                  />
                </div>
              ) : null}

              <div>
                <h1 className="mb-3 text-xl font-semibold leading-snug tracking-tight text-zinc-900 sm:text-2xl dark:text-zinc-50">
                  {post.title}
                </h1>

              {/* Cover Image - Only show if user checked "Auto-generate social preview image" OR uploaded an image */}
              {/* Don't show auto-generated OG images unless user explicitly requested them */}
              {((post.autoGenerateImage && (post.coverImage || post.coverImageUrl || post.coverImageSizes || post.ogImageUrl)) || 
                (post.coverImage || post.coverImageUrl || post.coverImageSizes)) ? (
                <div className="relative mb-4 w-full overflow-hidden rounded-lg border border-zinc-200/60 bg-zinc-100 dark:border-white/[0.06] dark:bg-zinc-900/80 sm:mb-6">
                  <ResponsivePostImage
                    coverImageUrl={post.coverImage || post.coverImageUrl || (post.autoGenerateImage ? post.ogImageUrl : undefined)}
                    coverImageSizes={post.coverImageSizes}
                    alt={post.title}
                    naturalHeight
                    size="full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              ) : null}


              <PostTags tags={post.tags} className="mb-3" />

              <MarkdownRenderer content={post.content} />
              </div>

            <div className={`flex flex-col items-stretch justify-between gap-2 pt-3 sm:flex-row sm:items-center sm:gap-3 ${postCardDividerClass}`}>
              <div className="flex items-center flex-wrap gap-2">
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
                        className={`flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs transition-colors ${
                          userEmojis.includes(emoji)
                            ? 'bg-zinc-200/90 text-zinc-900 ring-1 ring-zinc-300/80 dark:bg-white/10 dark:text-zinc-100 dark:ring-white/15'
                            : 'hover:bg-zinc-100 dark:hover:bg-white/[0.06]'
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
                    onClick={() => {
                      if (!isAuthenticated) {
                        onLoginRequired?.();
                        return;
                      }
                      setShowEmojiPicker(!showEmojiPicker);
                    }}
                    className={postActionBtnClass}
                  >
                    <Smile size={14} />
                    <span>React</span>
                  </button>

                  {showEmojiPicker && (
                    <div className="absolute bottom-full left-0 z-[9999] mb-2 animate-fade-in">
                      <div className="min-w-[220px] rounded-lg border border-zinc-200/80 bg-white p-2 shadow-lg dark:border-white/10 dark:bg-zinc-900">
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
                              className={`rounded-md p-2 text-lg transition-colors ${
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

                <button type="button" className={postActionBtnClass}>
                  <MessageCircle size={14} />
                  <span>{comments.length}</span>
                </button>

                <ShareDropdown
                  url={window.location.href}
                  title={post.title}
                  type="post"
                  hashtags={post.tags || []}
                  description={post.content?.substring(0, 150)}
                  trigger={
                    <button type="button" className={postActionBtnClass}>
                      <Share2 size={14} />
                      <span className="hidden sm:inline">Share</span>
                    </button>
                  }
                />
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleBookmark}
                  className={`${postActionBtnClass} ${
                    bookmarked ? 'text-zinc-900 dark:text-zinc-100' : ''
                  }`}
                >
                  <Bookmark size={14} fill={bookmarked ? 'currentColor' : 'none'} />
                  <span>{bookmarked ? 'Saved' : 'Save'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(true)}
                  className={`${postActionBtnClass} hover:text-red-600 dark:hover:text-red-400`}
                >
                  <Flag size={14} />
                  <span className="hidden sm:inline">Report</span>
                </button>
              </div>
            </div>
            </div>
          </article>

          {isAuthenticated ? (
          <section className={detailPanelClass}>
        <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          <MessageCircle size={16} className="text-zinc-500" />
          Add a comment
        </h3>
        <div className="space-y-2.5">
          <MentionTextarea
            value={comment}
            onChange={handleCommentChange}
            placeholder="Share your thoughts... Use @ to mention other users"
            rows={4}
            className={isCommentRequirementBlocking ? 'ring-2 ring-yellow-400/60 dark:ring-yellow-500/40' : ''}
          />
          {commentNotice && (
            <div className="relative flex items-start gap-2.5 rounded-lg border border-red-300/80 bg-red-50 p-2.5 text-xs text-red-900 dark:border-red-800 dark:bg-red-900/30 dark:text-red-100">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5 text-red-700 dark:text-red-300" />
              <div className="flex-1">
                <p className="font-semibold mb-1">Action requise</p>
                <p>{commentNotice}</p>
              </div>
              <button
                onClick={() => setCommentNotice(null)}
                className="absolute top-2 right-2 text-red-600 hover:text-red-800 dark:text-red-300 dark:hover:text-red-100 transition-colors"
                aria-label="Dismiss notice"
              >
                <X size={16} />
              </button>
            </div>
          )}
          {isCommentRequirementBlocking && (
            <div className="flex items-start gap-2.5 rounded-lg border border-yellow-200/80 bg-yellow-50 p-2.5 dark:border-yellow-800 dark:bg-yellow-900/20">
              <Award size={16} className="mt-0.5 shrink-0 text-yellow-600 dark:text-yellow-400" />
              <div className="text-xs text-yellow-800 dark:text-yellow-200">
                <p className="font-semibold">Reputation required to comment</p>
                {requirementMessage && (
                  <p className="mt-1">
                    {requirementMessage}
                  </p>
                )}
                <p className="mt-2 text-xs text-yellow-700 dark:text-yellow-300">
                  Trusted members and moderators automatically bypass this requirement.
                </p>
              </div>
            </div>
          )}
          {commentError && (
            <div className="flex items-start gap-2.5 rounded-lg border border-red-200/80 bg-red-50 p-2.5 dark:border-red-800 dark:bg-red-900/20">
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-600 dark:text-red-400" />
              <p className="text-xs text-red-700 dark:text-red-300">{commentError}</p>
            </div>
          )}
          <div className="flex justify-end">
            <Button 
              variant="primary" 
              size="sm"
              onClick={handleSubmitComment}
              disabled={!comment.trim() || submittingComment || isCommentRequirementBlocking}
            >
              {submittingComment ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>
        </div>
      </section>
          ) : (
            <section className={detailPanelClass}>
              <div className="py-3 text-center">
                <MessageCircle size={20} className="mx-auto mb-2 text-zinc-400" />
                <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
                  Log in to leave a comment
                </p>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => onLoginRequired?.()}
                >
                  Log In to Comment
                </Button>
              </div>
            </section>
          )}

      <div className="mb-4 space-y-3">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          <MessageCircle size={16} className="text-zinc-500" />
          Comments ({comments.length})
        </h3>
        {loadingComments ? (
          <CommentSkeletonList count={3} />
        ) : comments.length === 0 ? (
          <div className="py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
            No comments yet. Be the first to comment.
          </div>
        ) : (
          comments.map(comment => (
            <Comment 
              key={comment.id} 
              comment={comment} 
              postId={post.id}
              onReplySuccess={async () => {
                // Refresh comments after reply
                const updated = await commentsService.getPostComments(post.id);
                setComments(updated.comments || []);
              }}
              onDelete={async () => {
                // Refresh comments after deletion
                const updated = await commentsService.getPostComments(post.id);
                setComments(updated.comments || []);
              }}
            />
          ))
        )}
      </div>
        </div>
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        postId={post.id}
      />
    </>
  );
}
