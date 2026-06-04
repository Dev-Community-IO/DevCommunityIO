import { Briefcase, MapPin, DollarSign, Clock, MoreHorizontal, Smile, Bookmark, MessageCircle, Share2 } from 'lucide-react';
import { Avatar } from './Avatar';
import {
  contentFeedCardClass,
  contentFeedTitleClass,
  contentFeedPreviewClass,
  contentFeedCoverClass,
  contentTypePillClass,
  contentMetaChipClass,
  contentAuthorLinkClass,
  contentTimestampClass,
  contentPageThumbClass,
  contentStackedUserClass,
  contentIconBtnClass,
  contentEmojiActiveClass,
  contentEmojiInactiveClass,
  contentEmojiPickerClass,
  contentBookmarkActiveClass,
  contentBookmarkIdleClass,
  postActionBtnClass,
  postCardDividerClass,
  postTagClass,
} from './contentFeedCardTheme';
import { ReputationBadge } from './ReputationBadge';
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
    <article
      className={contentFeedCardClass}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      tabIndex={0}
      role="link"
      aria-label={opportunity.title}
    >
      <div className="flex flex-col space-y-2 sm:space-y-2.5">
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
                      className={contentPageThumbClass}>
                      <img 
                        src={opportunity.post?.page?.logo || opportunity.post?.page?.logoUrl || opportunity.logoUrl || DEFAULT_PAGE_LOGO} 
                        alt={opportunity.post?.page?.name || ''} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = DEFAULT_PAGE_LOGO;
                        }}
                      />
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
                        className={contentStackedUserClass}>
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
                    className={contentAuthorLinkClass}
                  >
                    {company.username}
                  </span>
                  {company.isVerified && <VerifiedBadge variant="page" size={14} />}
                  {!opportunity.post?.page && (
                    <ReputationBadge value={company.reputation || 0} />
                  )}
                </>
              )}
              <span className={contentTimestampClass}>•</span>
              <span className={contentTimestampClass}>
                {timeAgo(opportunity.postedAt || opportunity.createdAt)}
              </span>
            </div>
          </div>
          <button
            onClick={(e) => e.stopPropagation()}
            className={contentIconBtnClass}
            type="button"
          >
            <MoreHorizontal size={16} />
          </button>
        </div>

        {/* Type Badge */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={contentTypePillClass}>
            <Briefcase size={12} strokeWidth={2} />
            Opportunity
          </span>
          {opportunity.category && <span className={`${postTagClass} capitalize`}>{opportunity.category}</span>}
          {opportunity.type && <span className={`${postTagClass} capitalize`}>{opportunity.type}</span>}
          {opportunity.remote && <span className={postTagClass}>Remote</span>}
        </div>

        <h3 className={contentFeedTitleClass}>{opportunity.title}</h3>

        {((opportunity.post as any)?.coverImage || (opportunity.post as any)?.coverImageUrl) && (
          <div className={contentFeedCoverClass}>
            <img
              src={(opportunity.post as any).coverImage || (opportunity.post as any).coverImageUrl}
              alt={opportunity.title}
              className="h-full w-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Description Preview */}
        <p className={contentFeedPreviewClass}>{getCleanPreview(opportunity.description, 200)}</p>

        <div className="flex flex-wrap items-center gap-1.5">
          {opportunity.location && (
            <span className={`${contentMetaChipClass} max-w-[180px] truncate`}>
              <MapPin size={12} strokeWidth={2} className="shrink-0 text-zinc-400" />
              {opportunity.location}
            </span>
          )}
          {opportunity.salary && (
            <span className={contentMetaChipClass}>
              <DollarSign size={12} strokeWidth={2} className="text-zinc-400" />
              {opportunity.salary}
            </span>
          )}
          {opportunity.experience && (
            <span className={`${contentMetaChipClass} capitalize`}>
              <Clock size={12} strokeWidth={2} className="text-zinc-400" />
              {opportunity.experience}
            </span>
          )}
        </div>

        <div className={`flex items-center justify-between pt-2 sm:pt-2.5 ${postCardDividerClass}`}>
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
                    className={
                      userEmojis.includes(emoji) ? contentEmojiActiveClass : contentEmojiInactiveClass
                    }
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
                  className={postActionBtnClass}
                >
                  <Smile size={14} strokeWidth={2} />
                  <span className="hidden text-xs font-medium sm:inline">React</span>
                </button>

                {showEmojiPicker && (
                  <div className="absolute bottom-full left-0 z-[9999] mb-2 animate-fade-in">
                    <div className={contentEmojiPickerClass}>
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
                            className={`rounded-md p-2 text-xl transition-colors ${
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
            )}

            {/* Comment Button */}
            {(opportunity.postId || (opportunity.post as any)?.id) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClick();
                }}
                className={postActionBtnClass}
              >
                <MessageCircle size={14} strokeWidth={2} />
                <span className="text-xs font-medium tabular-nums">{commentCount}</span>
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
                  <button type="button" className={postActionBtnClass}>
                    <Share2 size={14} strokeWidth={2} />
                    <span className="hidden text-xs font-medium sm:inline">Share</span>
                  </button>
                }
              />
            )}
          </div>

          {/* Bookmark Button */}
          <Tooltip content={!isAuthenticated ? "Login to bookmark" : bookmarked ? "Remove bookmark" : "Bookmark"}>
            <button
              onClick={handleBookmark}
              className={
                bookmarked
                  ? contentBookmarkActiveClass
                  : !isAuthenticated
                    ? `${contentBookmarkIdleClass} cursor-not-allowed opacity-50`
                    : contentBookmarkIdleClass
              }
            >
              <Bookmark size={16} fill={bookmarked ? 'currentColor' : 'none'} strokeWidth={bookmarked ? 2.5 : 2} />
            </button>
          </Tooltip>
        </div>
      </div>
    </article>
  );
}
