import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Trophy, Calendar, Users, Share2, Bookmark, BookmarkCheck, ExternalLink, Loader2, Sparkles, User, Building2, MessageCircle, Smile } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Badge } from './Badge';
import { Button } from './Button';
import { Avatar } from './Avatar';
import { VerifiedBadge } from './VerifiedBadge';
import { Comment } from './Comment';
import { Comment as CommentType } from '../types';
import { PostOriginDisplay } from './PostOriginDisplay';
import { ShareDropdown } from './ShareDropdown';
import hackathonsService, { Hackathon } from '../services/api/hackathons.service';
import { MarkdownRenderer } from '../utils/markdownRenderer';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import bookmarksService from '../services/api/bookmarks.service';
import commentsService from '../services/api/comments.service';
import reactionsService from '../services/api/reactions.service';
import { SEOHead } from './SEOHead';
import { MentionTextarea } from './MentionTextarea';
import { CommentSkeletonList } from './skeletons';

interface HackathonDetailProps {
  hackathonId: string;
  onClose: () => void;
}

export function HackathonDetail({ hackathonId, onClose }: HackathonDetailProps) {
  const { isAuthenticated, user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
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
    const fetchHackathon = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await hackathonsService.getHackathon(hackathonId);
        const hackathonData = data.hackathon || data;
        setHackathon(hackathonData);
        
        // Check bookmark status if authenticated and hackathon has postId
        if (isAuthenticated && hackathonData.postId) {
          try {
            const bookmarkCheck = await bookmarksService.checkBookmark(hackathonData.postId);
            setBookmarked(bookmarkCheck.isBookmarked);
          } catch (err) {
            console.error('Failed to check bookmark status:', err);
          }
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to load hackathon');
        console.error('Error fetching hackathon:', err);
      } finally {
        setLoading(false);
      }
    };

    if (hackathonId) {
      fetchHackathon();
    }
  }, [hackathonId, isAuthenticated]);

  // SEO metadata will be set via SEOHead component below

  // Load comments and reactions (comments are public, reactions load user-specific data only if authenticated)
  useEffect(() => {
    if (hackathon?.postId) {
      loadComments();
      loadReactions();
    }
  }, [hackathon?.postId]); // Remove isAuthenticated dependency - comments should load for everyone

  const loadComments = async () => {
    if (!hackathon?.postId) return;
    try {
      setLoadingComments(true);
      const response = await commentsService.getComments(hackathon.postId);
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
    if (!hackathon?.postId) return;
    try {
      const { reactions } = await reactionsService.getEmojis({ postId: hackathon.postId });
      setEmojis(reactions || []);
      
      if (isAuthenticated && user) {
        const { emojis: userEmojisList } = await reactionsService.getUserEmojis({ postId: hackathon.postId });
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
    
    if (!hackathon?.postId) return;

    try {
      const response = await reactionsService.addEmoji({ postId: hackathon.postId, emoji });
      
      // Reload reactions to get accurate counts
      await loadReactions();

      if (response.reactorReputation !== undefined && response.reactorReputation !== null) {
        updateUser({ reputation: response.reactorReputation });
      }

      if (response.authorReputation !== undefined && response.authorReputation !== null) {
        setHackathon(prev => {
          if (!prev) return prev;
          if (prev.organizer) {
            return {
              ...prev,
              organizer: {
                ...prev.organizer,
                reputation: response.authorReputation,
              },
            };
          }
          return prev;
        });
      }
    } catch (error) {
      console.error('Failed to add emoji:', error);
    }
  };

  const handleSubmitComment = async () => {
    if (!comment.trim() || !hackathon?.postId || !isAuthenticated) return;

    try {
      setSubmittingComment(true);
      await commentsService.createComment(hackathon.postId, { content: comment });
      setComment('');
      // Reload comments and update comment count
      await loadComments();
      // Refresh hackathon data to update comment count
      try {
        const data = await hackathonsService.getHackathon(hackathonId);
        const hackathonData = data.hackathon || data;
        setHackathon(hackathonData);
      } catch (err) {
        console.error('Failed to refresh hackathon:', err);
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
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getDaysUntil = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    
    if (!hackathon?.postId) {
      console.warn('Hackathon has no associated post for bookmarking');
      return;
    }
    
    // Optimistically update UI
    const previousBookmarked = bookmarked;
    setBookmarked(!bookmarked);
    setSaving(true);
    
    try {
      if (previousBookmarked) {
        await bookmarksService.removeBookmark(hackathon.postId);
      } else {
        await bookmarksService.addBookmark(hackathon.postId);
      }
    } catch (error: any) {
      // Revert optimistic update on error
      setBookmarked(previousBookmarked);
      
      // If error says already bookmarked, check actual status and update accordingly
      if (error?.message?.includes('already bookmarked') || error?.data?.message?.includes('already bookmarked')) {
        try {
          const response = await bookmarksService.checkBookmark(hackathon.postId);
          setBookmarked(response.isBookmarked);
        } catch (checkError) {
          console.error('Failed to check bookmark status after error:', checkError);
        }
      } else if (error?.message?.includes('not found') || error?.data?.message?.includes('not found')) {
        // If bookmark not found when trying to remove, check actual status
        try {
          const response = await bookmarksService.checkBookmark(hackathon.postId);
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

  if (error || !hackathon) {
    return (
      <div className="min-h-screen pt-16 sm:pt-20 px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-24 animate-fade-in">
        <div className="max-w-7xl mx-auto">
          <GlassCard className="p-6 sm:p-8 md:p-12 text-center">
            <p className="text-red-500 dark:text-red-400 text-sm sm:text-base">{error || 'Hackathon not found'}</p>
            <Button variant="primary" onClick={onClose} className="mt-4 sm:mt-6 text-sm sm:text-base">
              Go Back
            </Button>
          </GlassCard>
        </div>
      </div>
    );
  }

  const daysUntilStart = getDaysUntil(hackathon.startDate);

  return (
    <>
      {hackathon && (
        <SEOHead
          title={hackathon.seoTitle || hackathon.title}
          description={hackathon.seoDescription || hackathon.description?.substring(0, 160).replace(/[#*`_~\[\]()]/g, '').replace(/\n+/g, ' ').trim() || 'DevCommunity Hackathon'}
          image={hackathon.ogImageUrl || hackathon.imageUrl}
          url={`${window.location.origin}/hackathons/${hackathon.slug || hackathonId}`}
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
              {hackathon.category}
            </Badge>
            <Badge className={`text-xs capitalize whitespace-nowrap ${
              hackathon.status === 'upcoming' 
                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-700'
                : hackathon.status === 'ongoing'
                ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-300 dark:border-green-700'
                : 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-700'
            }`}>
              <Trophy size={12} className="inline mr-1" />
              <span className="hidden xs:inline">{hackathon.status}</span>
            </Badge>
            {hackathon.featured && (
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs whitespace-nowrap">
                <Sparkles size={12} className="inline mr-1" />
                <span className="hidden sm:inline">Featured</span>
              </Badge>
            )}
        </div>
        <div className="flex gap-2 flex-shrink-0">
            <ShareDropdown
              url={window.location.href}
              title={hackathon.title}
              type="hackathon"
              hashtags={(hackathon.post as any)?.tags || []}
              description={hackathon.description?.substring(0, 150)}
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
              disabled={saving || !hackathon?.postId}
              className={`p-2.5 sm:p-2 rounded-lg transition-all duration-200 ${
                bookmarked 
                  ? 'bg-purple-500/20 text-purple-500 shadow-md shadow-purple-500/20' 
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
              src={(hackathon.post as any)?.coverImage || (hackathon.post as any)?.coverImageUrl || hackathon.imageUrl || 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1200'}
            alt={hackathon.title}
            className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1200';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 lg:p-10">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">{hackathon.title}</h1>
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3 sm:gap-4 text-white/90 text-sm sm:text-base">
                {hackathon.organizerLogoUrl && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden bg-white flex-shrink-0">
                      <img src={hackathon.organizerLogoUrl} alt={hackathon.organizerName} className="w-full h-full object-cover" />
                </div>
                    <span className="font-medium break-words">{hackathon.organizerName}</span>
              </div>
                )}
                <div className="flex items-center gap-2">
                <Calendar size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="break-words">{formatDate(hackathon.startDate)} - {formatDate(hackathon.endDate)}</span>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Description */}
          <GlassCard className="p-4 sm:p-6 lg:p-8">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6">About This Hackathon</h2>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <MarkdownRenderer content={hackathon.description} />
              </div>
            </GlassCard>

            {/* Requirements */}
            {hackathon.requirements && hackathon.requirements.length > 0 && (
              <GlassCard className="p-4 sm:p-6 lg:p-8">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6">Requirements</h2>
                <ul className="space-y-2">
                  {hackathon.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700 dark:text-gray-300">{req}</span>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            )}

            {/* Prizes */}
            {hackathon.prizes && hackathon.prizes.length > 0 && (
          <GlassCard className="p-4 sm:p-6 lg:p-8">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6">Prize Distribution</h2>
            <div className="space-y-3">
                  {hackathon.prizes.map((prize: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                      <div>
                        <div className="font-bold text-lg">{prize.place || `Prize ${index + 1}`}</div>
                        {prize.description && (
                          <div className="text-sm text-gray-600 dark:text-gray-400">{prize.description}</div>
                        )}
                      </div>
                      {(prize.amount || prize.prize) && (
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {prize.amount || prize.prize}
                        </div>
                      )}
                </div>
              ))}
            </div>
          </GlassCard>
            )}

            {/* Judges */}
            {hackathon.judges && hackathon.judges.length > 0 && (
          <GlassCard className="p-4 sm:p-6 lg:p-8">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6">Judges</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {hackathon.judges.map((judge: any, index: number) => (
                    <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                      {judge.avatar && (
                        <Avatar src={judge.avatar} alt={judge.name || 'Judge'} size="md" />
                      )}
                  <div>
                        <h3 className="font-semibold">{judge.name || `Judge ${index + 1}`}</h3>
                        {judge.role && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">{judge.role}</p>
                        )}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
            )}

            {/* Tracks */}
            {hackathon.tracks && hackathon.tracks.length > 0 && (
          <GlassCard className="p-4 sm:p-6 lg:p-8">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6">Competition Tracks</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {hackathon.tracks.map((track: string, index: number) => (
                    <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                      <h3 className="font-semibold">{track}</h3>
                </div>
              ))}
            </div>
          </GlassCard>
            )}
        </div>

        {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Registration Card */}
          <GlassCard className="p-4 sm:p-6 lg:p-8 sticky top-20 sm:top-24 lg:top-28 z-10">
              {hackathon.prize && (
            <div className="text-center mb-4 sm:mb-6">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-2">
                {hackathon.prize}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">in total prizes</div>
            </div>
              )}
            {hackathon.registrationUrl && (
              <a href={hackathon.registrationUrl} target="_blank" rel="noopener noreferrer" className="block">
                <Button variant="primary" className="w-full mb-3 sm:mb-4 text-sm sm:text-base py-2.5 sm:py-3">
                  <ExternalLink size={18} className="mr-2" />
                  {hackathon.ctaButtonText || 'Register Now'}
                </Button>
              </a>
            )}
          </GlassCard>

            {/* Dates */}
          <GlassCard className="p-4 sm:p-6 lg:p-8">
              <h3 className="font-bold mb-4 sm:mb-6 flex items-center gap-2 text-base sm:text-lg">
                <Calendar size={18} className="text-purple-600 dark:text-purple-400" />
                Important Dates
              </h3>
            <div className="space-y-3">
                {/* Important Dates from API */}
                {hackathon.importantDates && hackathon.importantDates.length > 0 ? (
                  hackathon.importantDates.map((importantDate, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        index % 3 === 0 
                          ? 'bg-purple-100 dark:bg-purple-900/30'
                          : index % 3 === 1
                          ? 'bg-pink-100 dark:bg-pink-900/30'
                          : 'bg-blue-100 dark:bg-blue-900/30'
                      }`}>
                        <Calendar size={16} className={
                          index % 3 === 0 
                            ? 'text-purple-600 dark:text-purple-400'
                            : index % 3 === 1
                            ? 'text-pink-600 dark:text-pink-400'
                            : 'text-blue-600 dark:text-blue-400'
                        } />
                </div>
                <div className="flex-1">
                        <div className="text-xs text-gray-600 dark:text-gray-400 capitalize">{importantDate.label}</div>
                        <div className="font-semibold text-sm">{formatShortDate(importantDate.date)}</div>
                </div>
              </div>
                  ))
                ) : (
                  <>
                    {/* Fallback to start and end dates */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Calendar size={16} className="text-purple-600 dark:text-purple-400" />
                </div>
                      <div className="flex-1">
                        <div className="text-xs text-gray-600 dark:text-gray-400">Start Date</div>
                        <div className="font-semibold text-sm">{formatShortDate(hackathon.startDate)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                        <Calendar size={16} className="text-pink-600 dark:text-pink-400" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-600 dark:text-gray-400">End Date</div>
                        <div className="font-semibold text-sm">{formatShortDate(hackathon.endDate)}</div>
                      </div>
                    </div>
                  </>
                )}
                {daysUntilStart > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Starts in <span className="font-bold text-purple-600 dark:text-purple-400">{daysUntilStart} days</span>
                    </div>
                  </div>
                )}
              </div>
            </GlassCard>

            {/* Author/Organizer */}
            {hackathon.organizer && (
              <GlassCard className="p-4 sm:p-6 lg:p-8">
                <h3 className="font-bold mb-4 sm:mb-6 flex items-center gap-2 text-base sm:text-lg">
                  <User size={18} className="text-purple-600 dark:text-purple-400" />
                  Author
                </h3>
                <div 
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => navigate(`/profile/${hackathon.organizer?.username}`)}
                >
                  <Avatar
                    src={hackathon.organizer.avatarUrl || hackathon.organizer.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(hackathon.organizer.username)}`}
                    alt={hackathon.organizer.username}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 dark:text-white truncate">
                      {hackathon.organizer.username}
                    </div>
                    {hackathon.organizer.reputation !== undefined && (
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {hackathon.organizer.reputation} reputation
                      </div>
                    )}
                  </div>
                  {hackathon.organizer.isVerified && (
                    <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs">
                      ✓ Verified
                    </Badge>
                  )}
                </div>
              </GlassCard>
            )}

            {/* Post Origin Display - Under Author Card */}
            {hackathon.post && (hackathon.post.postOrigin || hackathon.post.originSource || hackathon.post.originUrl) && (
              <PostOriginDisplay 
                postOrigin={hackathon.post.postOrigin}
                originSource={hackathon.post.originSource}
                originUrl={hackathon.post.originUrl}
              />
            )}

            {/* Page Card - Show if hackathon belongs to a page */}
            {hackathon.post?.page && (
              <GlassCard className="p-4 sm:p-6 lg:p-8">
                <h3 className="font-bold mb-4 sm:mb-6 flex items-center gap-2 text-base sm:text-lg">
                  <Building2 size={18} className="text-purple-600 dark:text-purple-400" />
                  Posted by Page
                </h3>
                <div className="space-y-4">
                  <div 
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => hackathon.post?.page?.slug && navigate(`/pages/${hackathon.post.page.slug}`)}
                  >
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
                      <img 
                      src={hackathon.post?.page?.logo || hackathon.post?.page?.logoUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(hackathon.post?.page?.name || '')}`}
                      alt={hackathon.post?.page?.name || ''}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(hackathon.post?.page?.name || '')}`;
                        }}
                      />
                      {hackathon.post?.page?.isVerified && (
                        <div className="absolute -bottom-0.5 -right-0.5 bg-white dark:bg-gray-900 rounded-full p-0.5 shadow-md border border-white dark:border-gray-800">
                          <VerifiedBadge size={12} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 dark:text-white truncate">
                        {hackathon.post?.page?.name}
                      </div>
                      {hackathon.post?.page?.shortBio && (
                        <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                          {hackathon.post?.page?.shortBio}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {hackathon.post?.page?.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {hackathon.post?.page?.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-1.5">
                      <Users size={16} className="text-gray-400" />
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {(hackathon.post?.page?.memberCount || 0).toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">members</span>
                    </div>
                  </div>
                  
                  <Button
                    variant="secondary"
                    onClick={() => hackathon.post?.page?.slug && navigate(`/pages/${hackathon.post?.page?.slug}`)}
                    className="w-full"
                  >
                    <ExternalLink size={16} className="mr-2" />
                    View Page
                  </Button>
                </div>
              </GlassCard>
            )}

            {/* Details */}
            <GlassCard className="p-4 sm:p-6 lg:p-8">
              <h3 className="font-bold mb-4 sm:mb-6 text-base sm:text-lg">Details</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Difficulty</span>
                  <Badge className={`text-xs capitalize ${
                    hackathon.difficulty === 'beginner' 
                      ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                      : hackathon.difficulty === 'intermediate'
                      ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                      : 'bg-red-500/10 text-red-600 dark:text-red-400'
                  }`}>
                    {hackathon.difficulty}
                  </Badge>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Reactions Section */}
        {hackathon.postId && (
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
                          ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400 ring-1 ring-purple-400/50'
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
                                ? 'bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40 ring-2 ring-purple-400 dark:ring-purple-500 shadow-lg' 
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
        {hackathon.postId && (
          <>
            <GlassCard className="p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
                <MessageCircle size={20} className="text-purple-600 dark:text-purple-400" />
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
                    postId={hackathon.postId || undefined}
                    onReplySuccess={async () => {
                      if (hackathon.postId) {
                        await loadComments();
                      }
                    }}
                    onDelete={async () => {
                      if (hackathon.postId) {
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