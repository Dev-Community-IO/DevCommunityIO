import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Calendar, MapPin, Users, Video, Share2, Bookmark, BookmarkCheck, ExternalLink, Sparkles, Loader2, Building2, MessageCircle, Smile } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Badge } from './Badge';
import { Button } from './Button';
import { VerifiedBadge } from './VerifiedBadge';
import { Comment } from './Comment';
import { Comment as CommentType } from '../types';
import { PostOriginDisplay } from './PostOriginDisplay';
import { ShareDropdown } from './ShareDropdown';
import eventsService, { Event } from '../services/api/events.service';
import { MarkdownRenderer } from '../utils/markdownRenderer';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import bookmarksService from '../services/api/bookmarks.service';
import commentsService from '../services/api/comments.service';
import reactionsService from '../services/api/reactions.service';
import { SEOHead } from './SEOHead';
import { MentionTextarea } from './MentionTextarea';
import { CommentSkeletonList } from './skeletons';

const DEFAULT_PAGE_LOGO = 'https://api.dicebear.com/7.x/shapes/svg?seed=Adaex%20App';

interface EventDetailProps {
  eventId: string;
  onClose: () => void;
}

export function EventDetail({ eventId, onClose }: EventDetailProps) {
  const { isAuthenticated, user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
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
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await eventsService.getEvent(eventId);
        const eventData = data.event || data;
        setEvent(eventData);
        
        // Check bookmark status if authenticated and event has postId
        if (isAuthenticated && eventData.postId) {
          try {
            const bookmarkCheck = await bookmarksService.checkBookmark(eventData.postId);
            setBookmarked(bookmarkCheck.isBookmarked);
          } catch (err) {
            console.error('Failed to check bookmark status:', err);
          }
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to load event');
        console.error('Error fetching event:', err);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEvent();
    }
  }, [eventId, isAuthenticated]);

  // SEO metadata will be set via SEOHead component below

  // Load comments and reactions (comments are public, reactions load user-specific data only if authenticated)
  useEffect(() => {
    if (event?.postId) {
      loadComments();
      loadReactions();
    }
  }, [event?.postId]); // Remove isAuthenticated dependency - comments should load for everyone

  const loadComments = async () => {
    if (!event?.postId) return;
    try {
      setLoadingComments(true);
      const response = await commentsService.getComments(event.postId);
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
    if (!event?.postId) return;
    try {
      const { reactions } = await reactionsService.getEmojis({ postId: event.postId });
      setEmojis(reactions || []);
      
      if (isAuthenticated && user) {
        const { emojis: userEmojisList } = await reactionsService.getUserEmojis({ postId: event.postId });
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
    
    if (!event?.postId) return;

    try {
      const response = await reactionsService.addEmoji({ postId: event.postId, emoji });
      
      // Reload reactions to get accurate counts
      await loadReactions();

      if (response.reactorReputation !== undefined && response.reactorReputation !== null) {
        updateUser({ reputation: response.reactorReputation });
      }
    } catch (error) {
      console.error('Failed to add emoji:', error);
    }
  };

  const handleSubmitComment = async () => {
    if (!comment.trim() || !event?.postId || !isAuthenticated) return;

    try {
      setSubmittingComment(true);
      await commentsService.createComment(event.postId, { content: comment });
      setComment('');
      // Reload comments and update comment count
      await loadComments();
      // Refresh event data to update comment count
      try {
        const data = await eventsService.getEvent(eventId);
        const eventData = data.event || data;
        setEvent(eventData);
      } catch (err) {
        console.error('Failed to refresh event:', err);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  const getDaysUntil = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getTypeIcon = () => {
    switch (event?.type) {
      case 'online':
        return <Video size={18} className="text-blue-500" />;
      case 'in-person':
        return <MapPin size={18} className="text-green-500" />;
      case 'hybrid':
        return <Users size={18} className="text-purple-500" />;
      default:
        return <Calendar size={18} />;
    }
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    
    if (!event?.postId) {
      console.warn('Event has no associated post for bookmarking');
      return;
    }
    
    // Optimistically update UI
    const previousBookmarked = bookmarked;
    setBookmarked(!bookmarked);
    setSaving(true);
    
    try {
      if (previousBookmarked) {
        await bookmarksService.removeBookmark(event.postId);
      } else {
        await bookmarksService.addBookmark(event.postId);
      }
    } catch (error: any) {
      // Revert optimistic update on error
      setBookmarked(previousBookmarked);
      
      // If error says already bookmarked, check actual status and update accordingly
      if (error?.message?.includes('already bookmarked') || error?.data?.message?.includes('already bookmarked')) {
        try {
          const response = await bookmarksService.checkBookmark(event.postId);
          setBookmarked(response.isBookmarked);
        } catch (checkError) {
          console.error('Failed to check bookmark status after error:', checkError);
        }
      } else if (error?.message?.includes('not found') || error?.data?.message?.includes('not found')) {
        // If bookmark not found when trying to remove, check actual status
        try {
          const response = await bookmarksService.checkBookmark(event.postId);
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
      <div className="min-h-screen pt-16 sm:pt-20 px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-24 animate-fade-in">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12 sm:py-20">
            <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 animate-spin text-purple-500" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen pt-16 sm:pt-20 px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-24 animate-fade-in">
        <div className="max-w-7xl mx-auto">
          <GlassCard className="p-6 sm:p-8 md:p-12 text-center">
            <p className="text-red-500 dark:text-red-400 text-sm sm:text-base">{error || 'Event not found'}</p>
            <Button variant="primary" onClick={onClose} className="mt-4 sm:mt-6 text-sm sm:text-base">
              Go Back
            </Button>
          </GlassCard>
        </div>
      </div>
    );
  }

  const daysUntil = getDaysUntil(event.date);
  const attendeePercentage = event.maxAttendees 
    ? Math.round((event.attendeeCount / event.maxAttendees) * 100)
    : 0;

  return (
    <>
      {event && (
        <SEOHead
          title={event.seoTitle || event.title}
          description={event.seoDescription || event.description?.substring(0, 160).replace(/[#*`_~\[\]()]/g, '').replace(/\n+/g, ' ').trim() || 'DevCommunity Event'}
          image={(event as any).ogImageUrl || event.imageUrl}
          url={`${window.location.origin}/events/${event.slug || eventId}`}
          type="article"
        />
      )}
      <div className="min-h-screen pt-16 sm:pt-20 px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-24 animate-fade-in">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 pb-8 sm:pb-12">
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
              {event.category}
            </Badge>
            <Badge className={`text-xs capitalize whitespace-nowrap ${
              event.type === 'online'
                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-700'
                : event.type === 'in-person'
                ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-300 dark:border-green-700'
                : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-300 dark:border-purple-700'
            }`}>
              {getTypeIcon()}
              <span className="ml-1 hidden xs:inline">{event.type}</span>
            </Badge>
            {event.featured && (
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs whitespace-nowrap">
                <Sparkles size={12} className="inline mr-1" />
                <span className="hidden sm:inline">Featured</span>
              </Badge>
            )}
        </div>
        <div className="flex gap-2 flex-shrink-0">
            <ShareDropdown
              url={window.location.href}
              title={event.title}
              type="event"
              hashtags={(event.post as any)?.tags || []}
              description={event.description?.substring(0, 150)}
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
              disabled={saving || !event?.postId}
              className={`p-2.5 sm:p-2 rounded-lg transition-all duration-200 ${
                bookmarked 
                  ? 'bg-blue-500/20 text-blue-500 shadow-md shadow-blue-500/20' 
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

        {/* Hero Section */}
      <GlassCard className="p-0 overflow-hidden">
          <div className="relative h-64 sm:h-80 md:h-96 lg:h-[32rem] xl:h-[36rem]">
          <img
              src={(event.post as any)?.coverImage || (event.post as any)?.coverImageUrl || event.imageUrl || 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=1200'}
            alt={event.title}
            className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=1200';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 lg:p-10">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">{event.title}</h1>
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3 sm:gap-4 text-white/90 text-sm sm:text-base">
                <div className="flex items-center gap-2">
                <Calendar size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="break-words">{formatDate(event.date)} • {event.time}</span>
              </div>
                {event.location && (
                  <div className="flex items-center gap-2">
                <MapPin size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="break-words">{event.location}</span>
              </div>
                )}
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Description */}
          <GlassCard className="p-4 sm:p-6 lg:p-8">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6">About This Event</h2>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <MarkdownRenderer content={event.description} />
            </div>
          </GlassCard>
        </div>

        {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Registration Card */}
          <GlassCard className="p-4 sm:p-6 lg:p-8 sticky top-20 sm:top-24 lg:top-28 z-10">
              {event.price && (
            <div className="text-center mb-4 sm:mb-6">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-2">
                {event.price}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">per ticket</div>
            </div>
              )}
            {event.registrationUrl && (
              <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer" className="block">
                <Button variant="primary" className="w-full mb-3 sm:mb-4 text-sm sm:text-base py-2.5 sm:py-3">
                  <ExternalLink size={18} className="mr-2" />
                  {event.ctaButtonText || 'Get Tickets'}
                </Button>
              </a>
            )}
              {event.maxAttendees && (
            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-xs sm:text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">Registered</span>
                    <span className="font-semibold">{event.attendeeCount} / {event.maxAttendees}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(attendeePercentage, 100)}%` }}
                ></div>
              </div>
            </div>
              )}
          </GlassCard>

          {/* Event Details */}
          <GlassCard className="p-4 sm:p-6 lg:p-8">
              <h3 className="font-bold mb-4 sm:mb-6 text-base sm:text-lg">Event Details</h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 sm:p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex-shrink-0">
                  <Calendar size={16} className="sm:w-[18px] sm:h-[18px] text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Date & Time</div>
                  <div className="font-semibold text-sm sm:text-base break-words">{formatDate(event.date)}</div>
                    <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{event.time}</div>
                  </div>
                </div>
                {event.location && (
              <div className="flex items-start gap-3">
                <div className="p-2 sm:p-2.5 bg-green-100 dark:bg-green-900/30 rounded-lg flex-shrink-0">
                  <MapPin size={16} className="sm:w-[18px] sm:h-[18px] text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Location</div>
                      <div className="font-semibold text-sm sm:text-base break-words">{event.location}</div>
                    </div>
                  </div>
                )}
                {daysUntil > 0 && (
                  <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                      Starts in <span className="font-bold text-purple-600 dark:text-purple-400">{daysUntil} days</span>
                    </div>
                  </div>
                )}
              </div>
            </GlassCard>

            {/* Type Info */}
            <GlassCard className="p-4 sm:p-6 lg:p-8">
              <h3 className="font-bold mb-4 sm:mb-6 text-base sm:text-lg">Event Type</h3>
              <div className="flex items-center gap-3">
                {getTypeIcon()}
                <span className="text-sm sm:text-base font-medium capitalize">{event.type}</span>
              </div>
            </GlassCard>

            {/* Page Card - Show if event belongs to a page */}
            {event.post?.page && (
              <GlassCard className="p-4 sm:p-6 lg:p-8">
                <h3 className="font-bold mb-4 sm:mb-6 flex items-center gap-2 text-base sm:text-lg">
                  <Building2 size={18} className="text-purple-600 dark:text-purple-400" />
                  Posted by Page
                </h3>
                <div className="space-y-4">
                  <div 
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => event.post?.page?.slug && navigate(`/pages/${event.post?.page?.slug}`)}
                  >
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
                      <img 
                      src={event.post?.page?.logo || event.post?.page?.logoUrl || DEFAULT_PAGE_LOGO}
                        alt={event.post?.page?.name || ''}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = DEFAULT_PAGE_LOGO;
                        }}
                      />
                      {event.post?.page?.isVerified && (
                        <div className="absolute -bottom-0.5 -right-0.5 bg-white dark:bg-gray-900 rounded-full p-0.5 shadow-md border border-white dark:border-gray-800">
                          <VerifiedBadge size={12} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 dark:text-white truncate">
                        {event.post?.page?.name}
                      </div>
                      {event.post?.page?.shortBio && (
                        <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                          {event.post?.page?.shortBio}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {event.post?.page?.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {event.post?.page?.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-1.5">
                      <Users size={16} className="text-gray-400" />
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {(event.post?.page?.memberCount || 0).toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">members</span>
                    </div>
                  </div>
                  
                  <Button
                    variant="secondary"
                    onClick={() => event.post?.page?.slug && navigate(`/pages/${event.post?.page?.slug}`)}
                    className="w-full"
                  >
                    <ExternalLink size={16} className="mr-2" />
                    View Page
                  </Button>
                </div>
              </GlassCard>
            )}

            {/* Post Origin Display - Under Page/Author Card */}
            {event.post && (event.post.postOrigin || event.post.originSource || event.post.originUrl) && (
              <PostOriginDisplay 
                postOrigin={event.post.postOrigin}
                originSource={event.post.originSource}
                originUrl={event.post.originUrl}
              />
            )}
          </div>
        </div>

        {/* Reactions Section */}
        {event.postId && (
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
                          ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 ring-1 ring-blue-400/50'
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
                                ? 'bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 ring-2 ring-blue-400 dark:ring-blue-500 shadow-lg' 
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
        {event.postId && (
          <>
            <GlassCard className="p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
                <MessageCircle size={20} className="text-blue-600 dark:text-blue-400" />
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
                    postId={event.postId || undefined}
                    onReplySuccess={async () => {
                      if (event.postId) {
                        const updated = await commentsService.getComments(event.postId);
                        const commentsData = updated.data?.data || updated.data || updated.comments || updated;
                        setComments(Array.isArray(commentsData) ? commentsData : []);
                      }
                    }}
                    onDelete={async () => {
                      if (event.postId) {
                        await loadComments();
                      }
                    }}
                  />
                ))
              )}
        </div>
          </>
        )}
      </div>
    </div>
    </>
  );
}