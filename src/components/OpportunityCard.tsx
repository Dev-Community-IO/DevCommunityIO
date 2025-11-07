import { Briefcase, MapPin, DollarSign, Clock, MoreHorizontal, Smile, Bookmark, MessageCircle, Share2 } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { VerifiedBadge } from './VerifiedBadge';
import { Tooltip } from './Tooltip';
import { UserHoverCardDropdown } from './UserHoverCardDropdown';
import { PageHoverCardDropdown } from './PageHoverCardDropdown';
import { ShareDropdown } from './ShareDropdown';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect, useRef } from 'react';
import reactionsService from '../services/api/reactions.service';
import bookmarksService from '../services/api/bookmarks.service';
import { useNavigate } from 'react-router-dom';
import { Opportunity } from '../services/api/opportunities.service';

const DEFAULT_PAGE_LOGO = 'https://api.dicebear.com/7.x/shapes/svg?seed=Adaex%20App';

interface OpportunityCardProps {
  opportunity: Opportunity;
  onClick: () => void;
  onLoginRequired?: () => void;
}

export function OpportunityCard({ opportunity, onClick, onLoginRequired }: OpportunityCardProps) {
  const { isAuthenticated, user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [bookmarked, setBookmarked] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojis, setEmojis] = useState<{ emoji: string; count: number }[]>([]);
  const [userEmojis, setUserEmojis] = useState<string[]>([]);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const [companyReputation, setCompanyReputation] = useState(opportunity.company?.reputation ?? 0);

  // Check bookmark status on mount
  useEffect(() => {
    const currentPostId = opportunity.postId || (opportunity.post as any)?.id;
    if (isAuthenticated && currentPostId) {
      const checkBookmark = async () => {
        try {
          const response = await bookmarksService.checkBookmark(currentPostId);
          setBookmarked(response.isBookmarked);
        } catch (error) {
          console.error('Failed to check bookmark status:', error);
        }
      };
      checkBookmark();
    }
  }, [isAuthenticated, opportunity.postId, opportunity.post]);

  // Load emoji reactions on mount - ensure postId is available
  useEffect(() => {
    const currentPostId = opportunity.postId || (opportunity.post as any)?.id;
    if (currentPostId) {
      const loadReactions = async () => {
        try {
          const { reactions } = await reactionsService.getEmojis({ postId: currentPostId });
          setEmojis(reactions || []);
          
          if (user) {
            const { emojis: userEmojisList } = await reactionsService.getUserEmojis({ postId: currentPostId });
            setUserEmojis(userEmojisList || []);
          }
        } catch (error) {
          console.error('Failed to load reactions:', error);
        }
      };
      loadReactions();
    }
  }, [opportunity.postId, opportunity.post, user]);

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

  useEffect(() => {
    if (opportunity.company?.reputation !== undefined && opportunity.company?.reputation !== null) {
      setCompanyReputation(opportunity.company.reputation);
    }
  }, [opportunity.company?.reputation]);

  const handleEmojiReaction = async (emoji: string) => {
    const currentPostId = opportunity.postId || (opportunity.post as any)?.id;
    if (!user || !currentPostId) {
      onLoginRequired?.();
      return;
    }

    try {
      const response = await reactionsService.addEmoji({ postId: currentPostId, emoji });
      
      // Reload reactions to get accurate counts
      const { reactions } = await reactionsService.getEmojis({ postId: currentPostId });
      setEmojis(reactions || []);
      
      if (user) {
        const { emojis: userEmojisList } = await reactionsService.getUserEmojis({ postId: currentPostId });
        setUserEmojis(userEmojisList || []);
      }

      if (response.reactorReputation !== undefined && response.reactorReputation !== null) {
        updateUser({ reputation: response.reactorReputation });
      }

      if (response.authorReputation !== undefined && response.authorReputation !== null) {
        setCompanyReputation(response.authorReputation);
      }
    } catch (error: any) {
      console.error('Failed to add emoji:', error);
      if (error?.response?.status !== 500) {
        alert(error?.response?.data?.message || 'Failed to add reaction');
      }
    }
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const currentPostId = opportunity.postId || (opportunity.post as any)?.id;
    if (!isAuthenticated || !currentPostId) {
      onLoginRequired?.();
      return;
    }
    
    // Optimistically update UI
    const previousBookmarked = bookmarked;
    setBookmarked(!bookmarked);
    
    try {
      if (previousBookmarked) {
        await bookmarksService.removeBookmark(currentPostId);
      } else {
        await bookmarksService.addBookmark(currentPostId);
      }
    } catch (error: any) {
      // Revert optimistic update on error
      setBookmarked(previousBookmarked);
      
      // If error says already bookmarked, check actual status and update accordingly
      if (error?.message?.includes('already bookmarked') || error?.data?.message?.includes('already bookmarked')) {
        try {
          const response = await bookmarksService.checkBookmark(currentPostId);
          setBookmarked(response.isBookmarked);
        } catch (checkError) {
          console.error('Failed to check bookmark status after error:', checkError);
        }
      } else if (error?.message?.includes('not found') || error?.data?.message?.includes('not found')) {
        // If bookmark not found when trying to remove, check actual status
        try {
          const response = await bookmarksService.checkBookmark(currentPostId);
          setBookmarked(response.isBookmarked);
        } catch (checkError) {
          console.error('Failed to check bookmark status after error:', checkError);
        }
      } else {
        console.error('Failed to toggle bookmark:', error);
      }
    }
  };

  const timeAgo = (date: Date | string | undefined | null) => {
    if (!date) return 'just now';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
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

  // Clean content preview
  const getCleanPreview = (content: string, maxLength: number = 200): string => {
    let cleaned = content.replace(/^#{1,6}\s+/gm, '');
    cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1');
    cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1');
    cleaned = cleaned.replace(/`([^`]+)`/g, '$1');
    cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    cleaned = cleaned.replace(/!\[([^\]]*)\]\([^)]+\)/g, '');
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    cleaned = cleaned.trim();
    
    if (cleaned.length > maxLength) {
      return cleaned.substring(0, maxLength).trim() + '...';
    }
    return cleaned;
  };

  const company = opportunity.company
    ? { ...opportunity.company, reputation: companyReputation }
    : (opportunity.post?.page
        ? undefined
        : {
            id: opportunity.companyId,
            username: opportunity.companyName,
            avatar: opportunity.logoUrl || '',
            avatarUrl: opportunity.logoUrl || '',
            reputation: companyReputation,
            isVerified: false,
          } as any);

  const commentCount = (opportunity.post as any)?.commentCount || 0;

  return (
    <GlassCard hover className="p-4 overflow-hidden border-l-4 border-l-green-500 hover:border-l-green-600 transition-colors duration-300" onClick={onClick}>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {/* Page Logo or Company Avatar */}
            {opportunity.post?.page ? (
              <div className="relative flex-shrink-0 group flex items-center gap-0">
                <PageHoverCardDropdown
                  page={opportunity.post.page}
                  trigger={
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (opportunity.post?.page?.slug) {
                          navigate(`/pages/${opportunity.post.page.slug}`);
                        }
                      }}
                      className="w-10 h-10 rounded-lg overflow-hidden border-2 border-white/80 dark:border-gray-800/80 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 relative z-10 cursor-pointer">
                      <img 
                        src={opportunity.post?.page?.logo || opportunity.post?.page?.logoUrl || opportunity.logoUrl || DEFAULT_PAGE_LOGO} 
                        alt={opportunity.post?.page?.name || ''} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = DEFAULT_PAGE_LOGO;
                        }}
                      />
                      {opportunity.post?.page?.isVerified && (
                        <div className="absolute -bottom-0.5 -right-0.5 bg-white dark:bg-gray-900 rounded-full p-0.5 shadow-md border border-white dark:border-gray-800">
                          <VerifiedBadge size={12} />
                        </div>
                      )}
                    </div>
                  }
                  onViewPage={() => {
                    if (opportunity.post?.page?.slug) {
                      navigate(`/pages/${opportunity.post.page.slug}`);
                    }
                  }}
                />
                {company && (
                  <UserHoverCardDropdown
                    user={{
                      ...company,
                      avatar: company.avatar || company.avatarUrl || opportunity.logoUrl || '',
                      avatarUrl: company.avatarUrl || company.avatar || opportunity.logoUrl || '',
                      reputation: company.reputation || 0,
                      isVerified: company.isVerified || false
                    }}
                    trigger={
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (company?.username) {
                            navigate(`/profile/${company.username}`);
                          }
                        }}
                        className="-ml-2 w-7 h-7 rounded-full border-2 border-white dark:border-gray-900 overflow-hidden cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 ring-2 ring-green-500/20 hover:ring-green-500/40 relative z-20">
                        <Avatar src={company.avatar || company.avatarUrl || opportunity.logoUrl || ''} alt={company.username} size="sm" />
                      </div>
                    }
                    onViewProfile={() => company?.username && navigate(`/profile/${company.username}`)}
                  />
                )}
              </div>
            ) : company ? (
              <UserHoverCardDropdown
                user={{
                  ...company,
                  avatar: company.avatar || company.avatarUrl || opportunity.logoUrl || '',
                  avatarUrl: company.avatarUrl || company.avatar || opportunity.logoUrl || '',
                  reputation: company.reputation || 0,
                  isVerified: company.isVerified || false
                }}
                trigger={
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (company?.username) {
                        navigate(`/profile/${company.username}`);
                      }
                    }}
                    className="flex-shrink-0 w-8 h-8 cursor-pointer hover:scale-110 transition-transform duration-300">
                    <Avatar src={company.avatar || company.avatarUrl || opportunity.logoUrl || ''} alt={company.username} size="sm" />
                  </div>
                }
                onViewProfile={() => company?.username && navigate(`/profile/${company.username}`)}
              />
            ) : null}

            <div className="flex items-center gap-1.5 min-w-0">
              {company && (
                <>
                  <span 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (company?.username) {
                        navigate(`/profile/${company.username}`);
                      }
                    }}
                    className="font-semibold text-sm truncate cursor-pointer hover:text-green-600 dark:hover:text-green-400 transition-colors"
                  >
                    {company.username}
                  </span>
                  {company.isVerified && <VerifiedBadge size={14} />}
                  {!opportunity.post?.page && (
                    <Badge variant="gradient" className="text-xs px-2 py-0.5">{company.reputation || 0} rep</Badge>
                  )}
                </>
              )}
              <span className="text-xs text-gray-500 dark:text-gray-400">•</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                {timeAgo(opportunity.postedAt || opportunity.createdAt)}
              </span>
            </div>
          </div>
          <button
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 flex-shrink-0"
            type="button"
          >
            <MoreHorizontal size={16} />
          </button>
        </div>

        {/* Type Badge */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 shadow-sm">
            <Briefcase size={14} className="text-green-500" />
            <span className="text-xs font-semibold text-green-600 dark:text-green-400">Opportunity</span>
          </div>
          <Badge className="text-xs px-2 py-0.5">{opportunity.category}</Badge>
          <Badge className="text-xs capitalize px-2 py-0.5">{opportunity.type}</Badge>
          {opportunity.remote && (
            <Badge className="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400">Remote</Badge>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 dark:from-green-400 dark:via-emerald-400 dark:to-green-500 bg-clip-text text-transparent hover:from-green-700 hover:via-emerald-700 hover:to-green-800 dark:hover:from-green-300 dark:hover:via-emerald-300 dark:hover:to-green-400 transition-all duration-300 leading-tight cursor-pointer">
          {opportunity.title}
        </h3>

        {/* Cover Image */}
        {((opportunity.post as any)?.coverImage || (opportunity.post as any)?.coverImageUrl) && (
          <div className="relative w-full h-40 sm:h-48 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 mb-2 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <img
              src={(opportunity.post as any).coverImage || (opportunity.post as any).coverImageUrl}
              alt={opportunity.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Description Preview */}
        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 leading-relaxed">
          {getCleanPreview(opportunity.description, 200)}
        </p>

        {/* Opportunity Metadata */}
        <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400 flex-wrap">
          {opportunity.location && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-50 dark:bg-gray-800/50">
              <MapPin size={12} className="text-green-500" />
              <span className="font-medium truncate max-w-[150px]">{opportunity.location}</span>
            </div>
          )}
          {opportunity.salary && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-50 dark:bg-gray-800/50">
              <DollarSign size={12} className="text-yellow-500" />
              <span className="font-medium">{opportunity.salary}</span>
            </div>
          )}
          {opportunity.experience && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-50 dark:bg-gray-800/50">
              <Clock size={12} className="text-blue-500" />
              <span className="font-medium capitalize">{opportunity.experience}</span>
            </div>
          )}
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-white/5">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Emoji Reactions */}
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
                    className={`px-2 py-1 rounded-lg text-xs transition-all duration-200 flex items-center gap-1 ${
                      userEmojis.includes(emoji)
                        ? 'bg-green-500/20 text-green-600 dark:text-green-400 ring-1 ring-green-400/50 shadow-sm'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span className="text-sm">{emoji}</span>
                    <span className="font-semibold">{count}</span>
                  </button>
                ))}
              </div>
            )}
            
            {/* Add Emoji Button */}
            {(opportunity.postId || (opportunity.post as any)?.id) && (
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
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 text-sm font-medium"
                >
                  <Smile size={14} />
                  <span>React</span>
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
            )}

            {/* Comment Button */}
            {(opportunity.postId || (opportunity.post as any)?.id) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClick();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 text-sm font-medium"
              >
                <MessageCircle size={14} />
                <span>{commentCount}</span>
              </button>
            )}

            {/* Share Button */}
            {(opportunity.postId || (opportunity.post as any)?.id) && (
              <ShareDropdown
                url={window.location.href}
                title={opportunity.title}
                type="opportunity"
                hashtags={(opportunity.post as any)?.tags || []}
                description={opportunity.description?.substring(0, 150)}
                trigger={
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 text-sm font-medium">
                    <Share2 size={14} />
                    <span className="hidden sm:inline">Share</span>
                  </button>
                }
              />
            )}
          </div>

          {/* Bookmark Button */}
          <Tooltip content={!isAuthenticated ? "Login to bookmark" : bookmarked ? "Remove bookmark" : "Bookmark"}>
            <button
              onClick={handleBookmark}
              className={`p-2 rounded-lg transition-all duration-200 ${
                bookmarked
                  ? 'bg-green-500/20 text-green-500 shadow-md shadow-green-500/20'
                  : !isAuthenticated
                    ? 'opacity-50 cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Bookmark size={16} fill={bookmarked ? 'currentColor' : 'none'} strokeWidth={bookmarked ? 2.5 : 2} />
            </button>
          </Tooltip>
        </div>
      </div>
    </GlassCard>
  );
}
