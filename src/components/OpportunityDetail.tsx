import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, MapPin, Clock, Building, Share2, Bookmark, BookmarkCheck, Sparkles, Zap, Loader2, ExternalLink, Users, Building2, MessageCircle, Smile } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Badge } from './Badge';
import { Button } from './Button';
import { VerifiedBadge } from './VerifiedBadge';
import { Comment } from './Comment';
import { Comment as CommentType } from '../types';
import { PostOriginDisplay } from './PostOriginDisplay';
import { ShareDropdown } from './ShareDropdown';
import opportunitiesService, { Opportunity } from '../services/api/opportunities.service';
import { MarkdownRenderer } from '../utils/markdownRenderer';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import bookmarksService from '../services/api/bookmarks.service';
import commentsService from '../services/api/comments.service';
import reactionsService from '../services/api/reactions.service';
import { useSEO } from '../hooks/useSEO';
import { MentionTextarea } from './MentionTextarea';
import { CommentSkeletonList } from './skeletons';

interface OpportunityDetailProps {
  opportunityId: string;
  onClose: () => void;
}

export function OpportunityDetail({ opportunityId, onClose }: OpportunityDetailProps) {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [comment, setComment] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojis, setEmojis] = useState<{ emoji: string; count: number }[]>([]);
  const [userEmojis, setUserEmojis] = useState<string[]>([]);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchOpportunity = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await opportunitiesService.getOpportunity(opportunityId);
        const opportunityData = data.opportunity || data;
        setOpportunity(opportunityData);
        
        // Check bookmark status if authenticated and opportunity has postId
        if (isAuthenticated && (opportunityData as any).postId) {
          try {
            const bookmarkCheck = await bookmarksService.checkBookmark((opportunityData as any).postId);
            setBookmarked(bookmarkCheck.isBookmarked);
          } catch (err) {
            console.error('Failed to check bookmark status:', err);
          }
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to load opportunity');
        console.error('Error fetching opportunity:', err);
      } finally {
        setLoading(false);
      }
    };

    if (opportunityId) {
      fetchOpportunity();
    }
  }, [opportunityId, isAuthenticated]);

  // SEO metadata
  useSEO({
    type: 'opportunity',
    slug: opportunity?.slug || opportunityId || '',
    enabled: !!opportunity?.slug || !!opportunityId
  });

  // Load comments and reactions (comments are public, reactions load user-specific data only if authenticated)
  useEffect(() => {
    const postId = (opportunity as any)?.postId;
    if (postId) {
      loadComments();
      loadReactions();
    }
  }, [(opportunity as any)?.postId]); // Remove isAuthenticated dependency - comments should load for everyone

  const loadComments = async () => {
    const postId = (opportunity as any)?.postId;
    if (!postId) return;
    try {
      setLoadingComments(true);
      const response = await commentsService.getComments(postId);
      // Handle paginated response - check for data array or comments array
      const commentsData = response.data?.data || response.data || response.comments || response;
      setComments(Array.isArray(commentsData) ? commentsData : []);
    } catch (error) {
      console.error('Failed to load comments:', error);
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  const loadReactions = async () => {
    const postId = (opportunity as any)?.postId;
    if (!postId) return;
    try {
      const { reactions } = await reactionsService.getEmojis({ postId });
      setEmojis(reactions || []);
      
      if (isAuthenticated && user) {
        const { emojis: userEmojisList } = await reactionsService.getUserEmojis({ postId });
        setUserEmojis(userEmojisList || []);
      }
    } catch (error) {
      console.error('Failed to load reactions:', error);
    }
  };

  const handleEmojiReaction = async (emoji: string) => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    
    const postId = (opportunity as any)?.postId;
    if (!postId) return;

    try {
      await reactionsService.addEmoji({ postId, emoji });
      
      // Reload reactions to get accurate counts
      await loadReactions();
    } catch (error) {
      console.error('Failed to add emoji:', error);
    }
  };

  const handleSubmitComment = async () => {
    const postId = (opportunity as any)?.postId;
    if (!comment.trim() || !postId || !isAuthenticated) return;

    try {
      setSubmittingComment(true);
      await commentsService.createComment(postId, { content: comment });
      setComment('');
      // Reload comments and update comment count
      await loadComments();
      // Refresh opportunity data to update comment count
      try {
        const data = await opportunitiesService.getOpportunity(opportunityId);
        const opportunityData = data.opportunity || data;
        setOpportunity(opportunityData);
      } catch (err) {
        console.error('Failed to refresh opportunity:', err);
      }
    } catch (error: any) {
      console.error('Failed to submit comment:', error);
      alert(error.response?.data?.message || 'Failed to submit comment');
    } finally {
      setSubmittingComment(false);
    }
  };

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

  const getDaysAgo = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = today.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  const getTypeBadge = (type: string) => {
    const styles = {
      'full-time': 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-300 dark:border-green-700',
      'part-time': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-700',
      'contract': 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-300 dark:border-purple-700',
      'internship': 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-300 dark:border-orange-700'
    };
    return styles[type as keyof typeof styles] || styles['full-time'];
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    
    const postId = (opportunity as any).postId;
    if (!postId) {
      console.warn('Opportunity has no associated post for bookmarking');
      return;
    }
    
    // Optimistically update UI
    const previousBookmarked = bookmarked;
    setBookmarked(!bookmarked);
    setSaving(true);
    
    try {
      if (previousBookmarked) {
        await bookmarksService.removeBookmark(postId);
      } else {
        await bookmarksService.addBookmark(postId);
      }
    } catch (error: any) {
      // Revert optimistic update on error
      setBookmarked(previousBookmarked);
      
      // If error says already bookmarked, check actual status and update accordingly
      if (error?.message?.includes('already bookmarked') || error?.data?.message?.includes('already bookmarked')) {
        try {
          const response = await bookmarksService.checkBookmark(postId);
          setBookmarked(response.isBookmarked);
        } catch (checkError) {
          console.error('Failed to check bookmark status after error:', checkError);
        }
      } else if (error?.message?.includes('not found') || error?.data?.message?.includes('not found')) {
        // If bookmark not found when trying to remove, check actual status
        try {
          const response = await bookmarksService.checkBookmark(postId);
          setBookmarked(response.isBookmarked);
        } catch (checkError) {
          console.error('Failed to check bookmark status after error:', checkError);
        }
      } else {
        console.error('Failed to toggle bookmark:', error);
      }
    } finally {
      setSaving(false);
    }
  };

  // Share functionality is now handled by ShareDropdown component

  if (loading) {
    return (
      <div className="min-h-screen pt-16 sm:pt-20 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24 animate-fade-in">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-center justify-center py-12 sm:py-20">
            <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 animate-spin text-green-500" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !opportunity) {
    return (
      <div className="min-h-screen pt-16 sm:pt-20 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24 animate-fade-in">
        <div className="max-w-[1600px] mx-auto">
          <GlassCard className="p-6 sm:p-8 md:p-12 text-center">
            <p className="text-red-500 dark:text-red-400 text-sm sm:text-base">{error || 'Opportunity not found'}</p>
            <Button variant="primary" onClick={onClose} className="mt-4 sm:mt-6 text-sm sm:text-base">
              Go Back
            </Button>
          </GlassCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 sm:pt-20 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24 animate-fade-in">
      <div className="max-w-[1600px] mx-auto space-y-4 sm:space-y-6 pb-8 sm:pb-12">
        {/* Header */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        <button
            onClick={onClose}
          className="p-2 sm:p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-200 group flex-shrink-0"
        >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        </button>
          <div className="flex-1 flex items-center gap-2 min-w-0 flex-wrap">
            <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs capitalize whitespace-nowrap">
              {opportunity.category}
            </Badge>
            <Badge className={`text-xs capitalize whitespace-nowrap ${getTypeBadge(opportunity.type)}`}>
              <span className="hidden xs:inline">{opportunity.type}</span>
            </Badge>
            {opportunity.remote && (
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs whitespace-nowrap">
                <Zap size={12} className="inline mr-1" />
                <span className="hidden sm:inline">Remote</span>
              </Badge>
            )}
            {opportunity.featured && (
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs whitespace-nowrap">
                <Sparkles size={12} className="inline mr-1" />
                <span className="hidden sm:inline">Featured</span>
              </Badge>
            )}
        </div>
        <div className="flex gap-2 flex-shrink-0">
            <ShareDropdown
              url={window.location.href}
              title={opportunity.title}
              type="opportunity"
              hashtags={(opportunity.post as any)?.tags || []}
              description={opportunity.description?.substring(0, 150)}
              trigger={
                <button 
                  className="p-2.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
                  aria-label="Share"
                >
                  <Share2 size={18} />
                </button>
              }
            />
            <button 
              onClick={handleBookmark}
              disabled={saving || !(opportunity as any).postId}
              className={`p-2.5 sm:p-2 rounded-lg transition-all duration-200 ${
                bookmarked 
                  ? 'bg-green-500/20 text-green-500 shadow-md shadow-green-500/20' 
                  : !isAuthenticated
                    ? 'opacity-50 cursor-not-allowed hover:bg-gray-100 dark:hover:bg-white/5'
                    : 'hover:bg-gray-100 dark:hover:bg-white/5'
              }`}
              aria-label={bookmarked ? "Remove bookmark" : "Bookmark"}
            >
              {bookmarked ? <BookmarkCheck size={18} fill="currentColor" /> : <Bookmark size={18} />}
          </button>
        </div>
      </div>

      {/* Company Header */}
        <GlassCard className="p-4 sm:p-6 md:p-8 lg:p-10">
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
            {opportunity.logoUrl && (
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex-shrink-0 border-2 border-gray-200 dark:border-gray-700">
                <img src={opportunity.logoUrl} alt={opportunity.companyName} className="w-full h-full object-cover" />
          </div>
            )}
          <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 leading-tight">{opportunity.title}</h1>
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3 sm:gap-4 text-gray-700 dark:text-gray-300 mb-4 text-sm sm:text-base">
              <div className="flex items-center gap-2 font-semibold">
                <Building size={18} className="sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                  <span className="break-words">{opportunity.companyName}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={18} className="sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                <span className="break-words">{opportunity.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={18} className="sm:w-5 sm:h-5 text-orange-500 flex-shrink-0" />
                  <span>Posted {getDaysAgo(opportunity.postedAt)}</span>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm sm:text-base">
              {opportunity.description}
            </p>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Full Description */}
          <GlassCard className="p-4 sm:p-6 lg:p-8">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6">About The Role</h2>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <MarkdownRenderer content={opportunity.description} />
            </div>
          </GlassCard>
        </div>

        {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
          {/* Apply Card */}
          <GlassCard className="p-4 sm:p-6 lg:p-8 sticky top-20 sm:top-24 lg:top-28 z-10">
              {opportunity.salary && (
            <div className="text-center mb-4 sm:mb-6">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-2">
                {opportunity.salary}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">annual salary</div>
            </div>
              )}
            {opportunity.applicationUrl && (
              <a href={opportunity.applicationUrl} target="_blank" rel="noopener noreferrer" className="block">
                <Button variant="primary" className="w-full mb-3 sm:mb-4 text-sm sm:text-base py-2.5 sm:py-3">
                  <ExternalLink size={18} className="mr-2" />
                  {opportunity.ctaButtonText || 'Apply Now'}
                </Button>
              </a>
            )}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-center text-gray-600 dark:text-gray-400">
                  Posted {getDaysAgo(opportunity.postedAt)}
              </p>
            </div>
          </GlassCard>

          {/* Job Details */}
          <GlassCard className="p-4 sm:p-6 lg:p-8">
              <h3 className="font-bold mb-4 sm:mb-6 text-base sm:text-lg">Job Details</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">Location</span>
                <span className="font-semibold text-sm">{opportunity.location}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">Job Type</span>
                <span className="font-semibold text-sm capitalize">{opportunity.type}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">Experience</span>
                <span className="font-semibold text-sm">{opportunity.experience}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Remote</span>
                  <Badge className={opportunity.remote ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-gray-500/10 text-gray-600 dark:text-gray-400'}>
                    {opportunity.remote ? 'Yes' : 'No'}
                  </Badge>
              </div>
            </div>
          </GlassCard>

            {/* Company Info */}
          <GlassCard className="p-4 sm:p-6 lg:p-8">
              <h3 className="font-bold mb-4 sm:mb-6 text-base sm:text-lg">Company</h3>
              <div className="flex items-center gap-3">
                {opportunity.logoUrl && (
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <img src={opportunity.logoUrl} alt={opportunity.companyName} className="w-full h-full object-cover" />
                  </div>
                )}
                <div>
                  <div className="font-semibold">{opportunity.companyName}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{opportunity.category}</div>
                </div>
            </div>
          </GlassCard>

          {/* Post Origin Display - Under Company Card */}
          {opportunity.post && (opportunity.post.postOrigin || opportunity.post.originSource || opportunity.post.originUrl) && (
            <PostOriginDisplay 
              postOrigin={opportunity.post.postOrigin}
              originSource={opportunity.post.originSource}
              originUrl={opportunity.post.originUrl}
            />
          )}

          {/* Page Card - Show if opportunity belongs to a page */}
          {opportunity.post?.page && (
          <GlassCard className="p-4 sm:p-6 lg:p-8">
              <h3 className="font-bold mb-4 sm:mb-6 flex items-center gap-2 text-base sm:text-lg">
                <Building2 size={18} className="text-purple-600 dark:text-purple-400" />
                Posted by Page
              </h3>
              <div className="space-y-4">
                <div 
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => opportunity.post?.page?.slug && navigate(`/pages/${opportunity.post.page.slug}`)}
                >
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
                    <img 
                      src={opportunity.post?.page?.logo || opportunity.post?.page?.logoUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(opportunity.post?.page?.name || '')}`}
                      alt={opportunity.post?.page?.name || ''}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(opportunity.post?.page?.name || '')}`;
                      }}
                    />
                    {opportunity.post.page.isVerified && (
                      <div className="absolute -bottom-0.5 -right-0.5 bg-white dark:bg-gray-900 rounded-full p-0.5 shadow-md border border-white dark:border-gray-800">
                        <VerifiedBadge size={12} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 dark:text-white truncate">
                      {opportunity.post.page.name}
                    </div>
                    {opportunity.post.page.shortBio && (
                      <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                        {opportunity.post.page.shortBio}
                      </div>
                    )}
                  </div>
                </div>
                
                {opportunity.post.page.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {opportunity.post.page.description}
                  </p>
                )}
                
                <div className="flex items-center gap-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-1.5">
                    <Users size={16} className="text-gray-400" />
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {(opportunity.post.page.memberCount || 0).toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">members</span>
                  </div>
                </div>
                
                <Button
                  variant="secondary"
                  onClick={() => opportunity.post?.page?.slug && navigate(`/pages/${opportunity.post.page.slug}`)}
                  className="w-full"
                >
                  <ExternalLink size={16} className="mr-2" />
                  View Page
                </Button>
              </div>
            </GlassCard>
          )}
            </div>
        </div>

        {/* Reactions Section */}
        {(opportunity as any)?.postId && (
          <GlassCard className="p-4 sm:p-6">
            <div className="flex items-center gap-3 flex-wrap">
              {emojis.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  {emojis.map(({ emoji, count }) => (
                    <button
                      key={emoji}
                      onClick={() => handleEmojiReaction(emoji)}
                      className={`px-2 py-1 rounded-lg text-sm transition-all duration-200 flex items-center gap-1 ${
                        userEmojis.includes(emoji)
                          ? 'bg-green-500/20 text-green-600 dark:text-green-400 ring-1 ring-green-400/50'
                          : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span>{emoji}</span>
                      <span className="font-semibold text-xs">{count}</span>
                    </button>
                  ))}
                </div>
              )}
              
              <div className="relative" ref={emojiPickerRef}>
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
                >
                  <Smile size={16} />
                  <span className="text-sm font-medium">React</span>
              </button>

                {showEmojiPicker && (
                  <div className="absolute bottom-full mb-2 left-0 z-[9999] animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-2 border-gray-200 dark:border-gray-700 p-3 min-w-[240px]">
                      <div className="grid grid-cols-4 gap-2">
                        {['👍', '❤️', '🔥', '👏', '😂', '😮', '😢', '🎉'].map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => {
                              handleEmojiReaction(emoji);
                              setShowEmojiPicker(false);
                            }}
                            className={`p-3 text-2xl rounded-xl hover:scale-110 transition-all duration-200 ${
                              userEmojis.includes(emoji) 
                                ? 'bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40 ring-2 ring-green-400 dark:ring-green-500 shadow-lg' 
                                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          >
                            {emoji}
              </button>
                        ))}
                      </div>
                      <div className="absolute -bottom-2 left-4 w-4 h-4 bg-white dark:bg-gray-800 border-b-2 border-r-2 border-gray-200 dark:border-gray-700 rotate-45"></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </GlassCard>
        )}

        {/* Comments Section */}
        {(opportunity as any)?.postId && (
          <>
            <GlassCard className="p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
                <MessageCircle size={20} className="text-green-600 dark:text-green-400" />
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
                    disabled={!comment.trim() || submittingComment || !isAuthenticated}
                  >
                    {submittingComment ? 'Posting...' : 'Post Comment'}
                  </Button>
                </div>
              </div>
            </GlassCard>

            <div className="space-y-4 mb-6">
              <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                <MessageCircle size={20} className="text-gray-500 dark:text-gray-400" />
                Comments ({comments.length})
              </h3>
              {loadingComments ? (
                <CommentSkeletonList count={3} />
              ) : comments.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No comments yet. Be the first to comment!
                </div>
              ) : (
                comments.map(comment => (
                  <Comment 
                    key={comment.id} 
                    comment={comment} 
                    postId={(opportunity as any)?.postId || undefined}
                    onReplySuccess={async () => {
                      await loadComments();
                    }}
                    onDelete={async () => {
                      await loadComments();
                    }}
                  />
                ))
              )}
        </div>
          </>
        )}
      </div>
    </div>
  );
}