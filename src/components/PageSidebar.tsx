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

interface PageSidebarProps {
  page: Page | { id: string; slug?: string };
  onLoginRequired?: () => void;
}

export function PageSidebar({ page: pageProp, onLoginRequired }: PageSidebarProps) {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [pageData, setPageData] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        setLoading(true);
        
        // If full page data is already provided, use it
        if ('name' in pageProp && pageProp.name) {
          setPageData(pageProp as Page);
          setIsFollowing((pageProp as Page).isFollowing || false);
        } else {
          // Otherwise fetch by id or slug
          const identifier = (pageProp as any).slug || (pageProp as any).id;
          if (identifier) {
            const page = await pagesService.getPage(identifier);
            const pageObj = page.page || page;
            setPageData(pageObj);
            setIsFollowing(pageObj.isFollowing || false);
          }
        }
      } catch (error) {
        console.error('Error fetching page data:', error);
        setPageData(null);
      } finally {
        setLoading(false);
      }
    };

    if (pageProp) {
      fetchPageData();
    }
  }, [pageProp]);

  // Check if current user owns or can manage the page
  const isOwnerOrAdmin = isAuthenticated && user && pageData && (
    pageData.ownerId === user.id ||
    pageData.owner?.id === user.id ||
    pageData.userRole === 'owner' ||
    pageData.userRole === 'admin' ||
    ['owner', 'admin'].includes(pageData.userRole || '')
  );

  const handleFollow = async () => {
    if (!isAuthenticated) {
      onLoginRequired?.();
      return;
    }

    if (!pageData?.id) return;

    try {
      if (isFollowing) {
        await pagesService.leavePage(pageData.id);
        setIsFollowing(false);
      } else {
        await pagesService.joinPage(pageData.id);
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Error following/unfollowing page:', error);
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
              src={pageData.logo || pageData.logoUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(pageData.name)}`}
              alt={pageData.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(pageData.name)}`;
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
              {(pageData.memberCount || 0).toLocaleString()}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">members</span>
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

