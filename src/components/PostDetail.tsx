import { ArrowLeft, MessageCircle, Share2, Bookmark, MoreHorizontal, Flag, Smile } from 'lucide-react';
import { Post, Comment as CommentType, Page } from '../types';
import { GlassCard } from './GlassCard';
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
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import commentsService from '../services/api/comments.service';
import reactionsService from '../services/api/reactions.service';
import pagesService from '../services/api/pages.service';
import bookmarksService from '../services/api/bookmarks.service';

interface PostDetailProps {
  post: Post;
  onClose: () => void;
  onLoginRequired?: () => void;
}

export function PostDetail({ post, onClose, onLoginRequired }: PostDetailProps) {
  const { isAuthenticated, user } = useAuth();
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

  // Fetch full page data if post has a page
  useEffect(() => {
    const fetchPageData = async () => {
      if (post.page) {
        // If page data is already in post, use it
        setPageData(post.page);
      } else if (post.pageId) {
        try {
          const page = await pagesService.getPage(post.pageId);
          setPageData(page.page || page);
        } catch (error) {
          console.error('Failed to fetch page data:', error);
        }
      }
    };
    fetchPageData();
  }, [post.pageId, post.page]);
  
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
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Loading post...</p>
        </div>
      </div>
    );
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

  const handleSubmitComment = async () => {
    if (!isAuthenticated) {
      onLoginRequired?.();
      return;
    }
    
    if (!comment.trim()) return;
    
    try {
      setSubmittingComment(true);
      await commentsService.createComment(post.id, { content: comment });
      setComment('');
      // Refresh comments
      await fetchComments();
    } catch (error: any) {
      console.error('Failed to submit comment:', error);
      alert(error.response?.data?.message || 'Failed to post comment');
    } finally {
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
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors group mb-4 sm:mb-6"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm sm:text-base font-medium">Back to Feed</span>
      </button>

      <div className="space-y-4 sm:space-y-6">
        {/* Main Content */}
        <div className="space-y-4 sm:space-y-6 min-w-0">
          <GlassCard className="p-4 sm:p-6 lg:p-8">
            <div className="space-y-5 min-w-0">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-2.5 sm:gap-3 flex-1">
                  {/* User Avatar and Page Logo */}
                  <div className="relative flex-shrink-0">
                    {post.author && (
                      <Tooltip content={`@${post.author.username || post.author.pseudo || 'unknown'}`}>
                        <div 
                          onClick={() => navigate(`/profile/${post.author.username || post.author.pseudo || ''}`)}
                          className="relative cursor-pointer hover:scale-105 transition-transform"
                        >
                          <Avatar src={(post.author.avatar || post.author.avatarUrl) || ''} alt={post.author.username || post.author.pseudo || 'Unknown'} size="md" className="cursor-pointer ring-2 ring-gray-200 dark:ring-gray-700 hover:ring-blue-500 dark:hover:ring-blue-400 transition-all" />
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
                              src={pageData.logo || pageData.logoUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(pageData.name)}`}
                              alt={pageData.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(pageData.name)}`;
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
                          className="font-bold text-sm sm:text-base cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          {post.author.username || post.author.pseudo || 'Unknown'}
                        </span>
                        {post.author.isVerified && (
                          <VerifiedBadge size={16} />
                        )}
                        {pageData && (
                          <>
                            <span className="text-xs text-gray-400 dark:text-gray-500">posted for</span>
                            <button
                              onClick={() => pageData.slug && navigate(`/pages/${pageData.slug}`)}
                              className="font-bold text-sm bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent hover:from-blue-700 hover:to-cyan-700 dark:hover:from-blue-300 dark:hover:to-cyan-300 transition-all cursor-pointer"
                            >
                              {pageData.name}
                            </button>
                          </>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      <span>{timeAgo(post.publishedAt || post.createdAt || post.timestamp)}</span>
                      <span>•</span>
                      <span className="text-xs">{Math.ceil(post.content.length / 200)} min read</span>
                    </div>
                  </div>
                </div>
                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-300 flex-shrink-0">
                  <MoreHorizontal size={20} />
                </button>
              </div>

              {/* Post Origin Display - Under Author Card */}
              {post.postOrigin || post.originSource || post.originUrl ? (
                <div className="mb-4 sm:mb-6">
                  <PostOriginDisplay 
                    postOrigin={post.postOrigin}
                    originSource={post.originSource}
                    originUrl={post.originUrl}
                  />
                </div>
              ) : null}

              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 leading-tight">{post.title}</h1>

              {/* Cover Image - Show post cover first, only fallback to page cover if post has none */}
              {(post.coverImage || post.coverImageUrl) ? (
                <div className="relative w-full h-48 sm:h-64 md:h-80 lg:h-96 xl:h-[28rem] rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 mb-4 sm:mb-6 shadow-lg">
                  <img
                    src={post.coverImage || post.coverImageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              ) : pageData && (pageData.coverImage || pageData.coverImageUrl) ? (
                <div className="relative w-full h-64 sm:h-80 lg:h-96 rounded-xl overflow-hidden bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 mb-6 shadow-lg">
                  <img
                    src={pageData.coverImage || pageData.coverImageUrl}
                    alt={`${pageData.name} cover`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                </div>
              ) : null}


              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {post.tags.map((tag: any) => {
                    const tagName = typeof tag === 'string' ? tag : (tag?.name || tag?.slug || '');
                    const tagKey = typeof tag === 'string' ? tag : (tag?.id || tag?.slug || tagName);
                    const tagLogoUrl = typeof tag === 'string' ? null : (tag?.logoUrl || tag?.logo_url);
                    return (
                      <span
                        key={tagKey}
                        className="inline-flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-700 transition-colors cursor-pointer"
                      >
                        {tagLogoUrl ? (
                          <>
                            <img
                              src={tagLogoUrl}
                              alt={tagName}
                              className="w-4 h-4 rounded object-cover flex-shrink-0"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                            <span>#{tagName}</span>
                          </>
                        ) : (
                          <span>#{tagName}</span>
                        )}
                      </span>
                    );
                  })}
                </div>
              )}

              <div className="prose prose-lg dark:prose-invert max-w-none
                prose-headings:font-bold prose-headings:tracking-tight
                prose-h1:text-3xl prose-h1:mt-8 prose-h1:mb-4
                prose-h2:text-2xl prose-h2:mt-6 prose-h2:mb-3
                prose-h3:text-xl prose-h3:mt-5 prose-h3:mb-2
                prose-p:my-4 prose-p:leading-7
                prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6
                prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6
                prose-li:my-1 prose-li:leading-7
                prose-blockquote:my-4 prose-blockquote:pl-4 prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:italic prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-300
                prose-code:text-sm prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:before:content-[''] prose-code:after:content-['']
                prose-pre:my-4 prose-pre:bg-gray-900 dark:prose-pre:bg-gray-950 prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto prose-pre:shadow-lg
                prose-pre:code:bg-transparent prose-pre:code:p-0 prose-pre:code:text-sm prose-pre:code:leading-6
                prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline prose-a:font-medium hover:prose-a:underline
                prose-strong:font-bold prose-strong:text-gray-900 dark:prose-strong:text-white
                prose-em:italic
                prose-img:my-6 prose-img:rounded-lg prose-img:shadow-md
                prose-hr:my-8 prose-hr:border-gray-300 dark:prose-hr:border-gray-700
                prose-table:my-6 prose-table:w-full
                prose-th:bg-gray-100 dark:prose-th:bg-gray-800 prose-th:p-3 prose-th:text-left prose-th:font-semibold
                prose-td:p-3 prose-td:border-t prose-td:border-gray-200 dark:prose-td:border-gray-700
                [&_pre]:!my-4 [&_pre]:!leading-6
                [&_pre_code]:!leading-6 [&_pre_code]:!block
                [&_code]:!leading-normal">
                <MarkdownRenderer content={post.content} />
              </div>
              </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 pt-4 sm:pt-5 border-t border-gray-200 dark:border-gray-700">
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
                    onClick={() => {
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

                <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300">
                  <MessageCircle size={16} />
                  <span className="text-xs sm:text-sm font-medium">{comments.length}</span>
                </button>
                
                <ShareDropdown
                  url={window.location.href}
                  title={post.title}
                  type="post"
                  hashtags={post.tags || []}
                  description={post.content?.substring(0, 150)}
                  trigger={
                    <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300">
                      <Share2 size={16} />
                      <span className="text-xs sm:text-sm font-medium hidden sm:inline">Share</span>
                    </button>
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBookmark}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                    bookmarked
                      ? 'bg-yellow-500/20 text-yellow-500 shadow-lg shadow-yellow-500/20'
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <Bookmark size={16} fill={bookmarked ? 'currentColor' : 'none'} />
                  <span className="text-xs sm:text-sm font-medium">{bookmarked ? 'Saved' : 'Save'}</span>
                </button>
                
                <button
                  onClick={() => setIsReportModalOpen(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-all duration-300"
                >
                  <Flag size={16} />
                  <span className="text-xs sm:text-sm font-medium hidden sm:inline">Report</span>
                </button>
              </div>
            </div>
            </div>
          </GlassCard>

          {isAuthenticated ? (
          <GlassCard className="p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
          <MessageCircle size={20} className="text-blue-500" />
          Add a Comment
        </h3>
        <div className="space-y-3 sm:space-y-4">
          <MentionTextarea
            value={comment}
            onChange={setComment}
            placeholder="Share your thoughts... Use @ to mention other users"
            rows={6}
          />
          <div className="flex justify-end">
            <Button 
              variant="primary" 
              size="sm"
              onClick={handleSubmitComment}
              disabled={!comment.trim() || submittingComment}
            >
              {submittingComment ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>
        </div>
      </GlassCard>
          ) : (
            <GlassCard className="p-4 sm:p-6">
              <div className="text-center py-4">
                <MessageCircle size={24} className="text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  Please log in to leave a comment
                </p>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => onLoginRequired?.()}
                >
                  Log In to Comment
                </Button>
              </div>
            </GlassCard>
          )}

      <div className="space-y-4 mb-6">
        <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2">
          <MessageCircle size={20} className="text-gray-500 dark:text-gray-400" />
          Comments ({comments.length})
        </h3>
        {loadingComments ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No comments yet. Be the first to comment!
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
