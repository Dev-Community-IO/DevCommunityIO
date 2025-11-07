import { useEffect, useState } from 'react';
import { Users, ExternalLink, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from './GlassCard';
import { Badge } from './Badge';
import { Button } from './Button';
import { VerifiedBadge } from './VerifiedBadge';
import { Page } from '../types';
import pagesService from '../services/api/pages.service';
import { useAuth } from '../contexts/AuthContext';

const DEFAULT_PAGE_LOGO = 'https://api.dicebear.com/7.x/shapes/svg?seed=Adaex%20App';

interface PageSidebarProps {
  page: Page | { id: string; slug?: string };
  onLoginRequired?: () => void;
  onFollowChange?: (isFollowing: boolean, followerCount: number) => void; // Callback when follow status changes
}

export function PageSidebar({ page: pageProp, onLoginRequired, onFollowChange }: PageSidebarProps) {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [pageData, setPageData] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  // REBUILT FROM SCRATCH: Always fetch from API to get correct isFollowing status (like PageView)
  useEffect(() => {
    const fetchPageData = async () => {
      try {
        setLoading(true);
        
        // Get identifier - use slug or id
        const identifier = (pageProp as any).slug || (pageProp as any).id;
        if (!identifier) {
          // If no identifier, try to use page data from prop
        if ('name' in pageProp && pageProp.name) {
          const page = pageProp as Page;
            const isFollowingFromProp = page?.isFollowing === true;
            setIsFollowing(isFollowingFromProp);
            setPageData({ 
              ...page, 
              isFollowing: isFollowingFromProp
            });
            setLoading(false);
          }
          return;
        }
        
        // IMPORTANT: Always fetch from API to get correct isFollowing status
        // The API checks authentication and returns proper follow status
            const pageResponse = await pagesService.getPage(identifier);
        const pageDataFromApi = pageResponse.page || pageResponse;
        
        // Extract isFollowing - MUST be boolean, default to false
        // API returns correct isFollowing based on authenticated user
        const isFollowingFromApi = pageDataFromApi?.isFollowing === true;
        
        // Set state immediately
        setIsFollowing(isFollowingFromApi);
        
        // Store complete page data with isFollowing explicitly set
        const completePageData = {
          ...pageDataFromApi,
          isFollowing: isFollowingFromApi, // Explicitly set to ensure it's always boolean
          followerCount: pageDataFromApi?.followerCount || pageDataFromApi?.follower_count || 0
        };
        
        setPageData(completePageData);
        
      } catch (error) {
        console.error('Error fetching page data:', error);
        // Fallback: use page data from prop if available
        if ('name' in pageProp && pageProp.name) {
          const page = pageProp as Page;
          const isFollowingFromProp = page?.isFollowing === true;
          setIsFollowing(isFollowingFromProp);
          setPageData({ 
            ...page, 
            isFollowing: isFollowingFromProp
          });
        } else {
        setPageData(null);
        }
      } finally {
        setLoading(false);
      }
    };

    if (pageProp) {
      fetchPageData();
    }
  }, [pageProp, user?.id, isAuthenticated]); // Re-fetch when user changes (login/logout) or auth state changes

  // Sync isFollowing state when pageProp.isFollowing changes (from parent updates)
  useEffect(() => {
    if ('name' in pageProp && pageProp.name && (pageProp as Page).isFollowing !== undefined) {
      const page = pageProp as Page;
      const isFollowingFromProp = page?.isFollowing === true;
      if (isFollowingFromProp !== isFollowing) {
        setIsFollowing(isFollowingFromProp);
        setPageData(prev => prev ? { ...prev, isFollowing: isFollowingFromProp } : null);
      }
    }
  }, [(pageProp as Page)?.isFollowing]);

  // Check if current user owns or can manage the page
  const isOwnerOrAdmin = isAuthenticated && user && pageData && (
    pageData.ownerId === user.id ||
    pageData.owner?.id === user.id ||
    pageData.userRole === 'owner' ||
    pageData.userRole === 'admin' ||
    ['owner', 'admin'].includes(pageData.userRole || '')
  );

  // REBUILT: Handle follow toggle
  const handleFollow = async () => {
    if (!isAuthenticated) {
      onLoginRequired?.();
      return;
    }

    if (!pageData?.id) return;

    const currentFollowing = isFollowing;

    try {
      let response;
      
      if (currentFollowing) {
        response = await pagesService.leavePage(pageData.id);
      } else {
        response = await pagesService.joinPage(pageData.id);
      }
      
      // API response: { message: "...", isFollowing: boolean, followerCount: number }
      const newIsFollowing = response?.isFollowing === true;
      const newFollowerCount = response?.followerCount ?? pageData.followerCount;
      
      // Update state immediately
      setIsFollowing(newIsFollowing);
      
      // Update pageData
        if (pageData) {
          setPageData({ 
            ...pageData, 
          isFollowing: newIsFollowing,
          followerCount: newFollowerCount
          });
      }
      
      // Notify parent component of follow status change
      onFollowChange?.(newIsFollowing, newFollowerCount);
    } catch (error) {
      console.error('Error following/unfollowing page:', error);
      // Revert on error
      setIsFollowing(currentFollowing);
    }
  };

  if (loading) {
    return (
      <GlassCard className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-16 w-16 bg-gray-700 rounded-xl mx-auto"></div>
          <div className="h-4 bg-gray-700 rounded w-3/4 mx-auto"></div>
          <div className="h-3 bg-gray-700 rounded w-full"></div>
        </div>
      </GlassCard>
    );
  }

  if (!pageData) {
    return null;
  }

  return (
    <GlassCard className="p-6">
      <div className="space-y-4">
        {/* Page Header */}
        <div className="flex items-center gap-3">
          <div className={`w-16 h-16 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0 shadow-lg relative`}>
            <img 
              src={pageData.logo || pageData.logoUrl || DEFAULT_PAGE_LOGO}
              alt={pageData.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = DEFAULT_PAGE_LOGO;
              }}
            />
            {pageData.isVerified && (
              <div className="absolute -bottom-0.5 -right-0.5 bg-white dark:bg-gray-900 rounded-full p-0.5 shadow-md border border-white dark:border-gray-800">
                <VerifiedBadge size={14} />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 
              className="font-bold text-lg truncate hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
              onClick={() => pageData.slug && navigate(`/pages/${pageData.slug}`)}
            >
              {pageData.name}
            </h3>
            {pageData.category && (
              <Badge className="text-xs mt-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                {pageData.category}
              </Badge>
            )}
          </div>
        </div>

        {/* Page Description */}
        {pageData.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
            {pageData.description}
          </p>
        )}

        {/* Page Stats */}
        <div className="flex items-center gap-4 pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1.5">
            <Users size={16} className="text-gray-400" />
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {(pageData.followerCount || pageData.follower_count || 0).toLocaleString()}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">followers</span>
          </div>
          <div className="w-px h-4 bg-gray-300 dark:bg-gray-700"></div>
          <div className="flex items-center gap-1.5">
            <Building2 size={16} className="text-gray-400" />
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {(pageData.postCount || 0).toLocaleString()}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">posts</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-2">
          {/* Follow Button - Only show if user is not owner/admin */}
          {!isOwnerOrAdmin && (
            <Button
              variant={isFollowing ? 'secondary' : 'primary'}
              onClick={handleFollow}
              className="w-full"
            >
              {isFollowing ? 'Following' : 'Follow'}
            </Button>
          )}
          
          <button
            onClick={() => pageData.slug && navigate(`/pages/${pageData.slug}`)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all shadow-md text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
          >
            <ExternalLink size={16} />
            View Page
          </button>
        </div>
      </div>
    </GlassCard>
  );
}

