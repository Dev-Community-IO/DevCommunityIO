import { Routes, Route, Navigate, useNavigate, useSearchParams, useParams, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { PostFeed } from './components/PostFeed';
import { RightSidebar } from './components/RightSidebar';
import { AuthorSidebarPost } from './components/AuthorSidebarPost';
import { PageSidebar } from './components/PageSidebar';
import { LoginModal } from './components/LoginModal';
import { OnboardingWizard } from './components/OnboardingWizard';
import { CreatePost } from './components/CreatePost';
import { PostDetail } from './components/PostDetail';
import { PostDetailSkeleton } from './components/skeletons';
import { UserProfile } from './components/UserProfile';
import { PagesListing } from './components/PagesListing';
import { PageView } from './components/PageView';
import { TagsPage } from './components/TagsPage';
import { PodcastPage } from './components/PodcastPage';
import { HackathonsPage } from './components/HackathonsPage';
import { HackathonDetail } from './components/HackathonDetail';
import { EventsPage } from './components/EventsPage';
import { EventDetail } from './components/EventDetail';
import { OpportunitiesPage } from './components/OpportunitiesPage';
import { OpportunityDetail } from './components/OpportunityDetail';
import { NotificationsPage } from './components/NotificationsPage';
import { BookmarksPage } from './components/BookmarksPage';
import { AdminDashboard } from './components/AdminDashboard';
import { AboutPage } from './components/AboutPage';
import { ContactPage } from './components/ContactPage';
import { PrivacyPolicyPage } from './components/PrivacyPolicyPage';
import { TermsOfUsePage } from './components/TermsOfUsePage';
import { CodeOfConductPage } from './components/CodeOfConductPage';
import { FloatingCreateButton } from './components/FloatingCreateButton';
import { ScrollToTopButton } from './components/ScrollToTopButton';
import { MobileSidebar } from './components/MobileSidebar';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { useAuth } from './contexts/AuthContext';
import postsService from './services/api/posts.service';
import tagsService from './services/api/tags.service';
import hackathonsService from './services/api/hackathons.service';
import eventsService from './services/api/events.service';
import opportunitiesService from './services/api/opportunities.service';
import { getApiBaseUrl } from './utils/apiUrl';
import { FeedItem } from './components/PostFeed';
import { Post } from './types';
import { isNetworkError } from './services/api/config';
import { SEOHead } from './components/SEOHead';

function App() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showOnboarding, setShowOnboarding, login } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Handle OAuth callback
  useEffect(() => {
    const authStatus = searchParams.get('auth');
    const token = searchParams.get('token');
    
    if (authStatus === 'success' && token) {
      // Exchange OAuth token for user data
      fetch(`${getApiBaseUrl()}/auth/exchange-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          if (data.user && data.token) {
            // Use login() function to properly set user state and check onboarding
            // This ensures new users see onboarding immediately
            login(data.user, data.token);
            console.log('✅ OAuth successful - user logged in');
            // Navigate away - onboarding will be shown by AuthContext if needed
            navigate('/', { replace: true });
          } else {
            // Only show alert if it's not a network error
            if (!isNetworkError({ message: 'Invalid response' })) {
            alert('Authentication failed: Invalid response');
            }
          }
        })
        .catch(error => {
          // Don't show alert for network errors (disconnection)
          // Fetch API throws TypeError for network errors with message "Failed to fetch"
          const errorMessage = error?.message || error?.toString() || '';
          const isFailedFetch = errorMessage === 'Failed to fetch' || 
                               errorMessage.toLowerCase().includes('failed to fetch');
          const networkErr = isNetworkError(error) || 
                           isFailedFetch ||
                           errorMessage.includes('NetworkError') ||
                           errorMessage.includes('ERR_CONNECTION_REFUSED') ||
                           errorMessage.includes('ECONNREFUSED') ||
                           (error instanceof TypeError && isFailedFetch);
          
          if (!networkErr) {
          console.error('OAuth token exchange failed:', error);
            alert('Authentication failed: ' + errorMessage);
          }
          // For network errors, silently fail - user will see they're offline elsewhere
        });
    } else if (authStatus === 'error') {
      const message = searchParams.get('message') || 'Authentication failed';
      
      // Don't show alert for network/disconnection errors
      const isNetworkErr = message.includes('Failed to fetch') ||
                          message.includes('NetworkError') ||
                          message.includes('ERR_CONNECTION_REFUSED') ||
                          message.includes('ECONNREFUSED');
      
      if (!isNetworkErr) {
      console.error('OAuth error:', message);
      alert(`Authentication failed: ${message}`);
      }
      navigate('/', { replace: true });
    }
  }, [searchParams, navigate, login]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  return (
    <>
      <SEOHead />
      {/* Global Onboarding Wizard */}
      <OnboardingWizard 
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={handleOnboardingComplete}
      />
      
      <Routes>
        {/* Home / Feed Routes */}
        <Route path="/" element={<FeedLayout />} />
        <Route path="/for-you" element={<FeedLayout category="for-you" />} />
        <Route path="/following" element={<FeedLayout category="following" />} />
        <Route path="/latest" element={<FeedLayout category="latest" />} />
        <Route path="/trending" element={<FeedLayout category="trending" />} />

        {/* Post Routes */}
        <Route path="/post/:id" element={<PostDetailPage />} />
        <Route path="/create-post" element={<CreatePostPage />} />

        {/* Profile Routes */}
        <Route path="/profile/:username" element={<ProfilePage />} />

        {/* Pages Routes */}
        <Route path="/pages" element={<PagesListPage />} />
        <Route path="/pages/:slug" element={<PageDetailPage />} />

        {/* Tags */}
        <Route path="/tags" element={<TagsPageLayout />} />

        {/* Podcast */}
        <Route path="/podcast" element={<PodcastPageLayout />} />

        {/* Hackathons */}
        <Route path="/hackathons" element={<HackathonsListPage />} />
        <Route path="/hackathons/:id" element={<HackathonDetailPage />} />

        {/* Events */}
        <Route path="/events" element={<EventsListPage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />

        {/* Opportunities */}
        <Route path="/opportunities" element={<OpportunitiesListPage />} />
        <Route path="/opportunities/:id" element={<OpportunityDetailPage />} />

        {/* Notifications */}
        <Route path="/notifications" element={<NotificationsPageLayout />} />

        {/* Bookmarks */}
        <Route path="/bookmarks" element={<BookmarksPageLayout />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminPage />} />

        {/* Static Pages */}
        <Route path="/about" element={<StaticPageLayout slug="about" />} />
        <Route path="/contact" element={<StaticPageLayout slug="contact" />} />
        <Route path="/privacy-policy" element={<StaticPageLayout slug="privacy-policy" />} />
        <Route path="/terms-of-use" element={<StaticPageLayout slug="terms-of-use" />} />
        <Route path="/code-of-conduct" element={<StaticPageLayout slug="code-of-conduct" />} />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Floating Create Button (shows on all pages except create) */}
      <FloatingCreateButton onLoginRequired={() => setIsLoginModalOpen(true)} />
      
      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
      
      {/* PWA Install Prompt - Mobile Only */}
      <PWAInstallPrompt />
    </>
  );
}

// Feed Layout Component
function FeedLayout({ category }: { category?: string }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  
  // Determine default category: 'trending' for all users (changed from 'for-you')
  // If guest user tries to access 'for-you', redirect to 'trending'
  let defaultCategory = category || 'trending';
  if (defaultCategory === 'for-you' && !isAuthenticated) {
    defaultCategory = 'trending';
  }

    return (
      <>
        <Navbar
        onCreatePost={() => navigate('/create-post')}
        onPostClick={() => {}}
        onLogoClick={() => navigate('/')}
        onNotificationsClick={() => navigate('/notifications')}
        onMenuClick={() => setIsMobileSidebarOpen(true)}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        />
        <MobileSidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        activeCategory={defaultCategory}
        onCategoryChange={(cat) => {
          const routes: Record<string, string> = {
            'for-you': '/',
            'following': '/following',
            'latest': '/latest',
            'trending': '/trending',
            'pages': '/pages',
            'bookmarks': '/bookmarks',
            'tags': '/tags',
            'podcast': '/podcast',
            'hackathons': '/hackathons',
            'events': '/events',
            'opportunities': '/opportunities'
          };
          navigate(routes[cat] || '/');
        }}
      />
      <div className="min-h-screen pt-16 sm:pt-20 px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-24 animate-fade-in pb-20 sm:pb-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex gap-4 sm:gap-6 lg:gap-8">
            {/* Left Sidebar */}
            <div className="hidden lg:block w-16 xl:w-64 2xl:w-72 flex-shrink-0">
              <Sidebar
                activeCategory={defaultCategory}
                onCategoryChange={(cat) => {
                  const routes: Record<string, string> = {
                    'home': '/',
                    'for-you': '/',
                    'following': '/following',
                    'latest': '/latest',
                    'trending': '/trending',
                    'pages': '/pages',
                    'bookmarks': '/bookmarks',
                    'tags': '/tags',
                    'podcast': '/podcast',
                    'hackathons': '/hackathons',
                    'events': '/events',
                    'opportunities': '/opportunities'
                  };
                  navigate(routes[cat] || '/');
                }}
              />
            </div>
            
            {/* Main content area */}
            <div className="flex-1 flex gap-4 sm:gap-6 lg:gap-8">
              {/* Main content - Optimized for mobile/tablet */}
              <main className="flex-1 w-full max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-3xl mx-auto">
                <PostFeedWithData category={defaultCategory} onLoginRequired={() => setIsLoginModalOpen(true)} />
              </main>
              
              {/* Right sidebar */}
              <aside className="hidden xl:block w-80 flex-shrink-0">
                <RightSidebar
                  onHackathonClick={(id: string) => navigate(`/hackathons/${id}`)}
                  onEventClick={(id: string) => navigate(`/events/${id}`)}
                  onOpportunityClick={(id: string) => navigate(`/opportunities/${id}`)}
                />
              </aside>
            </div>
          </div>
        </div>
      </div>
      <ScrollToTopButton />
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  );
}

// Post Feed with Data
function PostFeedWithData({ category, onLoginRequired }: { category: string; onLoginRequired: () => void }) {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeSort, setActiveSort] = useState<'hot' | 'new' | 'top'>('hot');
  const [activeTagInfo, setActiveTagInfo] = useState<{ name: string; logoUrl?: string } | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [postPaginationMeta, setPostPaginationMeta] = useState<{ currentPage: number; lastPage: number; perPage: number; total: number } | null>(null);
  const [supplementaryItems, setSupplementaryItems] = useState<FeedItem[]>([]); // Hackathons, events, opportunities
  const [addedSupplementaryKeys, setAddedSupplementaryKeys] = useState<Set<string>>(new Set()); // Track which supplementary items have been added

  // Build post params based on category and filters
  const buildPostParams = (page: number = 1, excludeIds?: string[]) => {
    let postParams: any = { page, limit: 20 };
    
    // Add excludeIds if provided (for pagination to avoid duplicates)
    if (excludeIds && excludeIds.length > 0) {
      postParams.excludeIds = excludeIds.join(',');
    }
    
    // Only add sort parameter if not using "for-you" (which uses recommendations)
    if (category !== 'for-you') {
      postParams.sort = activeSort;
    } else {
      // For "for-you", use recommendations (default strategy)
      postParams.recommendations = 'true';
    }
    
    // Check for tag filter in URL params
    const tagsParam = searchParams.get('tags');
    if (tagsParam) {
      const tagSlug = tagsParam.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      postParams.tags = tagSlug;
    }
    
    // Feed categories are for sorting/filtering, not post categories
    if (category === 'latest') {
      // Latest: Sort by newest first, disable recommendations
      postParams = { ...postParams, sort: 'new', recommendations: 'false' };
    } else if (category === 'trending') {
      // Trending: Sort by hot (most engagement), disable recommendations
      postParams = { ...postParams, sort: 'hot', recommendations: 'false' };
    } else if (category === 'following') {
      // Following: Filter by followed users, sort by user preference, disable recommendations
      postParams = { ...postParams, following: 'true', sort: activeSort, recommendations: 'false' };
    } else if (category === 'for-you') {
      // For You: Use recommendations (personalized feed)
      postParams = { ...postParams, recommendations: 'true' };
    } else {
      // If it's an actual post category (article, tutorial, etc.)
      postParams = { ...postParams, category, sort: activeSort, recommendations: 'false' };
    }
    
    return postParams;
  };

  // Fetch supplementary content (hackathons, events, opportunities) - load once
  const fetchSupplementaryContent = async () => {
    try {
      const [hackathonsResponse, eventsResponse, opportunitiesResponse] = await Promise.allSettled([
        hackathonsService.getHackathons({ limit: 20 }),
        eventsService.getEvents({ limit: 20 }),
        opportunitiesService.getOpportunities({ limit: 20 })
      ]);

      const supplementary: FeedItem[] = [];

      if (hackathonsResponse.status === 'fulfilled') {
        const responseValue = hackathonsResponse.value as any;
        let hackathons: any[] = [];
        
        if (responseValue.data && Array.isArray(responseValue.data)) {
          hackathons = responseValue.data;
        } else if (responseValue.hackathons && Array.isArray(responseValue.hackathons)) {
          hackathons = responseValue.hackathons;
        } else if (Array.isArray(responseValue)) {
          hackathons = responseValue;
        }
        
        hackathons.forEach((hackathon: any) => {
          if (hackathon && hackathon.id) {
            supplementary.push({ type: 'hackathon', data: hackathon });
          }
        });
      }

      if (eventsResponse.status === 'fulfilled') {
        const responseValue = eventsResponse.value as any;
        let events: any[] = [];
        
        if (responseValue.data && Array.isArray(responseValue.data)) {
          events = responseValue.data;
        } else if (responseValue.events && Array.isArray(responseValue.events)) {
          events = responseValue.events;
        } else if (Array.isArray(responseValue)) {
          events = responseValue;
        }
        
        events.forEach((event: any) => {
          if (event && event.id) {
            supplementary.push({ type: 'event', data: event });
          }
        });
      }

      if (opportunitiesResponse.status === 'fulfilled') {
        const responseValue = opportunitiesResponse.value as any;
        let opportunities: any[] = [];
        
        if (responseValue.data && Array.isArray(responseValue.data)) {
          opportunities = responseValue.data;
        } else if (responseValue.opportunities && Array.isArray(responseValue.opportunities)) {
          opportunities = responseValue.opportunities;
        } else if (Array.isArray(responseValue)) {
          opportunities = responseValue;
        }
        
        opportunities.forEach((opportunity: any) => {
          if (opportunity && opportunity.id) {
            supplementary.push({ type: 'opportunity', data: opportunity });
          }
        });
      }

      setSupplementaryItems(supplementary);
    } catch (err) {
      console.error('Error fetching supplementary content:', err);
    }
  };

  // Initial load and reset when filters change
  useEffect(() => {
    const fetchAllContent = async () => {
      setLoading(true);
      setError(null);
      setCurrentPage(1);
      setHasMore(true);
      setItems([]);
      setSupplementaryItems([]);
      setAddedSupplementaryKeys(new Set()); // Reset added supplementary items tracking
      
      try {
        // Fetch tag info if tag filter is present
        const tagsParam = searchParams.get('tags');
        if (tagsParam) {
          const tagSlug = tagsParam.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
          try {
            const tagResponse = await tagsService.getTag(tagSlug);
            const tagData = tagResponse.tag || tagResponse;
            if (tagData) {
              setActiveTagInfo({
                name: tagData.name || tagsParam,
                logoUrl: tagData.logoUrl
              });
            } else {
              setActiveTagInfo({ name: tagsParam });
            }
          } catch (err) {
            setActiveTagInfo({ name: tagsParam });
          }
        } else {
          setActiveTagInfo(null);
        }
        
        const postParams = buildPostParams(1);
        
        // Fetch posts and supplementary content in parallel
        const [postsResponse] = await Promise.allSettled([
          postsService.getPosts(postParams),
          fetchSupplementaryContent()
        ]);

        // Process posts
        if (postsResponse.status === 'fulfilled') {
          const responseData = postsResponse.value as any;
          let fetchedPosts: any[] = [];
          let meta: any = null;
          
          if (responseData.data && Array.isArray(responseData.data)) {
            fetchedPosts = responseData.data;
            meta = responseData.meta || null;
          } else if (responseData.posts && Array.isArray(responseData.posts)) {
            fetchedPosts = responseData.posts;
            meta = responseData.meta || null;
          } else if (Array.isArray(responseData)) {
            fetchedPosts = responseData;
          }
          
          if (meta) {
            setPostPaginationMeta({
              currentPage: meta.currentPage || 1,
              lastPage: meta.lastPage || 1,
              perPage: meta.perPage || 20,
              total: meta.total || 0
            });
            // For "for-you" category, always assume there's more content (unlimited feed)
            // For other categories, use normal pagination logic
            if (category === 'for-you') {
              // Always allow more pages for "For You" feed - never stop infinite scroll
              setHasMore(true);
            } else {
              setHasMore((meta.currentPage || 1) < (meta.lastPage || 1));
            }
          } else {
            // If no meta, for "for-you" always assume more, otherwise check if we got full page
            if (category === 'for-you') {
              setHasMore(true); // Unlimited feed for "For You"
            } else {
              setHasMore(fetchedPosts.length >= 20);
            }
          }
          
          const postsMap = new Map<string, any>();
          fetchedPosts.forEach((post: any) => {
            if (post && post.id && !postsMap.has(post.id)) {
              postsMap.set(post.id, post);
            }
          });
          
          const postItems: FeedItem[] = Array.from(postsMap.values()).map((post: any) => ({
            type: 'post' as const,
            data: post
          }));
          
          setItems(postItems);
        } else {
          setItems([]);
          setHasMore(false);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch content');
        console.error('Error fetching content:', err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllContent();
  }, [category, searchParams, activeSort]);

  // Fetch more posts (infinite scroll)
  const fetchMore = async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      // Get already loaded post IDs to exclude from next request
      const alreadyLoadedPostIds = items
        .filter(item => item.type === 'post')
        .map(item => item.data.id);
      const postParams = buildPostParams(nextPage, alreadyLoadedPostIds);
      
      const postsResponse = await postsService.getPosts(postParams);
      const responseData = postsResponse as any;
      
      let fetchedPosts: any[] = [];
      let meta: any = null;
      
      if (responseData.data && Array.isArray(responseData.data)) {
        fetchedPosts = responseData.data;
        meta = responseData.meta || null;
      } else if (responseData.posts && Array.isArray(responseData.posts)) {
        fetchedPosts = responseData.posts;
        meta = responseData.meta || null;
      } else if (Array.isArray(responseData)) {
        fetchedPosts = responseData;
      }
      
      // For "for-you" category, even if we get 0 posts, continue trying (might be temporary)
      // For other categories, stop if we get 0 posts
      if (fetchedPosts.length === 0) {
        if (category === 'for-you') {
          // For "For You" feed, continue trying - might be temporary empty result
          // Only stop if we've tried many pages with no results
          if (nextPage > 50) {
            setHasMore(false);
          } else {
            setHasMore(true); // Keep trying
          }
        } else {
          setHasMore(false);
        }
        setLoadingMore(false);
        return;
      }
      
      if (meta) {
        setPostPaginationMeta({
          currentPage: meta.currentPage || nextPage,
          lastPage: meta.lastPage || 1,
          perPage: meta.perPage || 20,
          total: meta.total || 0
        });
        // For "for-you" category, always assume there's more content (unlimited feed)
        if (category === 'for-you') {
          setHasMore(true); // Always allow more pages for "For You" feed
        } else {
          setHasMore((meta.currentPage || nextPage) < (meta.lastPage || 1));
        }
      } else {
        // If no meta, for "for-you" always assume more, otherwise check if we got full page
        if (category === 'for-you') {
          setHasMore(true); // Unlimited feed for "For You"
        } else {
          setHasMore(fetchedPosts.length >= 20);
        }
      }
      
      // Remove duplicates with existing items
      const existingPostIds = new Set(items.filter(item => item.type === 'post').map(item => item.data.id));
      const newPostItems: FeedItem[] = fetchedPosts
        .filter((post: any) => post && post.id && !existingPostIds.has(post.id))
        .map((post: any) => ({
          type: 'post' as const,
          data: post
        }));
      
      // If all fetched posts were duplicates, log for debugging and try next page
      if (fetchedPosts.length > 0 && newPostItems.length === 0) {
        console.warn(`Page ${nextPage}: All ${fetchedPosts.length} posts were duplicates. Already loaded ${existingPostIds.size} posts.`);
        // For "for-you", continue trying next page (might be a temporary issue)
        // For other categories, this indicates we've reached the end
        if (category !== 'for-you') {
          setHasMore(false);
          setLoadingMore(false);
          return;
        }
        // For "for-you", increment page and try again (but don't add empty items)
        setCurrentPage(nextPage);
        setLoadingMore(false);
        return;
      }
      
      // Merge supplementary items periodically (every 3 pages)
      let mergedItems: FeedItem[] = [...items, ...newPostItems];
      if (nextPage % 3 === 0 && supplementaryItems.length > 0) {
        // Create a map of existing items by their unique keys (type + id)
        const existingItemKeys = new Set<string>();
        mergedItems.forEach(item => {
          const key = 
            item.type === 'post' ? `post-${item.data.id}` :
            item.type === 'hackathon' ? `hackathon-${item.data.id}` :
            item.type === 'event' ? `event-${item.data.id}` :
            `opportunity-${item.data.id}`;
          existingItemKeys.add(key);
        });
        
        // Filter out duplicates from supplementary items (both existing items and already added ones)
        const newSupplementaryItems = supplementaryItems.filter(item => {
          const key = 
            item.type === 'post' ? `post-${item.data.id}` :
            item.type === 'hackathon' ? `hackathon-${item.data.id}` :
            item.type === 'event' ? `event-${item.data.id}` :
            `opportunity-${item.data.id}`;
          // Check both existing items and previously added supplementary items
          return !existingItemKeys.has(key) && !addedSupplementaryKeys.has(key);
        });
        
        // Interleave supplementary items (limit to first 5)
        const limitedSupplementary = newSupplementaryItems.slice(0, 5);
        
        // Track which supplementary items we're adding
        const newAddedKeys = new Set(addedSupplementaryKeys);
        limitedSupplementary.forEach(item => {
          const key = 
            item.type === 'post' ? `post-${item.data.id}` :
            item.type === 'hackathon' ? `hackathon-${item.data.id}` :
            item.type === 'event' ? `event-${item.data.id}` :
            `opportunity-${item.data.id}`;
          newAddedKeys.add(key);
        });
        setAddedSupplementaryKeys(newAddedKeys);
        
        const allItemsWithSupplementary = [...mergedItems, ...limitedSupplementary];
        
        // Sort if not "for-you" category
        if (category !== 'for-you') {
          allItemsWithSupplementary.sort((a, b) => {
            const dateA = new Date(
              a.type === 'post' ? (a.data.createdAt || a.data.publishedAt || 0) :
              a.type === 'hackathon' ? (a.data.createdAt || 0) :
              a.type === 'event' ? (a.data.createdAt || 0) :
              (a.data.createdAt || a.data.postedAt || 0)
            ).getTime();
            
            const dateB = new Date(
              b.type === 'post' ? (b.data.createdAt || b.data.publishedAt || 0) :
              b.type === 'hackathon' ? (b.data.createdAt || 0) :
              b.type === 'event' ? (b.data.createdAt || 0) :
              (b.data.createdAt || b.data.postedAt || 0)
            ).getTime();
            
            return dateB - dateA;
          });
        }
        
        mergedItems = allItemsWithSupplementary;
      }
      
      // Only update items if we actually got new posts
      if (newPostItems.length > 0) {
        setItems(mergedItems);
        setCurrentPage(nextPage);
      } else {
        // No new items - increment page anyway for next attempt
        setCurrentPage(nextPage);
        console.warn(`Page ${nextPage}: No new posts to add. Will retry on next scroll.`);
      }
    } catch (err: any) {
      console.error('Error fetching more posts:', err);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  // Merge supplementary items with posts on initial load
  useEffect(() => {
    // Only merge on initial load (page 1) and when we have both items and supplementary items
    if (items.length > 0 && supplementaryItems.length > 0 && currentPage === 1 && addedSupplementaryKeys.size === 0) {
      // Create a map of existing items by their unique keys (type + id)
      const existingItemKeys = new Set<string>();
      items.forEach(item => {
        const key = 
          item.type === 'post' ? `post-${item.data.id}` :
          item.type === 'hackathon' ? `hackathon-${item.data.id}` :
          item.type === 'event' ? `event-${item.data.id}` :
          `opportunity-${item.data.id}`;
        existingItemKeys.add(key);
      });
      
      // Filter out duplicates from supplementary items
      const newSupplementaryItems = supplementaryItems.filter(item => {
        const key = 
          item.type === 'post' ? `post-${item.data.id}` :
          item.type === 'hackathon' ? `hackathon-${item.data.id}` :
          item.type === 'event' ? `event-${item.data.id}` :
          `opportunity-${item.data.id}`;
        return !existingItemKeys.has(key);
      });
      
      // Limit to first 5 supplementary items
      const limitedSupplementary = newSupplementaryItems.slice(0, 5);
      
      // Track which supplementary items we're adding
      const newAddedKeys = new Set<string>();
      limitedSupplementary.forEach(item => {
        const key = 
          item.type === 'post' ? `post-${item.data.id}` :
          item.type === 'hackathon' ? `hackathon-${item.data.id}` :
          item.type === 'event' ? `event-${item.data.id}` :
          `opportunity-${item.data.id}`;
        newAddedKeys.add(key);
      });
      setAddedSupplementaryKeys(newAddedKeys);
      
      const allItems: FeedItem[] = [...items, ...limitedSupplementary];
      
      // Sort if not "for-you" category
      if (category !== 'for-you') {
        allItems.sort((a, b) => {
          const dateA = new Date(
            a.type === 'post' ? (a.data.createdAt || a.data.publishedAt || 0) :
            a.type === 'hackathon' ? (a.data.createdAt || 0) :
            a.type === 'event' ? (a.data.createdAt || 0) :
            (a.data.createdAt || a.data.postedAt || 0)
          ).getTime();
          
          const dateB = new Date(
            b.type === 'post' ? (b.data.createdAt || b.data.publishedAt || 0) :
            b.type === 'hackathon' ? (b.data.createdAt || 0) :
            b.type === 'event' ? (b.data.createdAt || 0) :
            (b.data.createdAt || b.data.postedAt || 0)
          ).getTime();
          
          return dateB - dateA;
        });
      }
      
      setItems(allItems);
    }
  }, [supplementaryItems, category, currentPage, addedSupplementaryKeys.size]);

  // Get active tag filter from URL
  const activeTagFilter = activeTagInfo?.name || searchParams.get('tags');
  
  // Convert tag slug to display name (format: "cardano" -> "Cardano")
  const getTagDisplayName = (slug: string | null): string | null => {
    if (!slug) return null;
    if (activeTagInfo?.name) return activeTagInfo.name;
    // Convert slug to title case: "open-source" -> "Open Source"
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Clear tag filter
  const handleClearTagFilter = () => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete('tags');
    setSearchParams(newSearchParams, { replace: true });
  };

  return (
    <PostFeed
      items={items}
      onPostClick={(post) => navigate(`/post/${post.slug}`)}
      onHackathonClick={(hackathon) => navigate(`/hackathons/${hackathon.slug || hackathon.id}`)}
      onEventClick={(event) => navigate(`/events/${event.slug || event.id}`)}
      onOpportunityClick={(opportunity) => navigate(`/opportunities/${opportunity.slug || opportunity.id}`)}
      onLoginRequired={onLoginRequired}
      loading={loading}
      error={error}
      hasMore={hasMore}
      fetchMore={fetchMore}
      activeTagFilter={getTagDisplayName(searchParams.get('tags'))}
      activeTagLogo={activeTagInfo?.logoUrl || undefined}
      onClearTagFilter={activeTagFilter ? handleClearTagFilter : undefined}
      activeSort={activeSort}
      onSortChange={setActiveSort}
      activeCategory={category}
    />
  );
}

// Post Detail Page with navigation cache
const postCache = new Map<string, any>();

function PostDetailPage() {
  const { id: slug } = useParams<{ id: string }>(); // 'id' param but it's actually the slug
  const navigate = useNavigate();
  const location = useLocation();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      
      // Check if post data was passed via navigation state (e.g., from CreatePost)
      const locationState = (location.state as any)?.post;
      if (locationState && locationState.slug === slug) {
        setPost(locationState);
        setLoading(false);
        // Cache the post for future navigation
        postCache.set(slug, locationState);
        // Scroll to top for better UX
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      
      // Check cache first for browser back/forward
      if (postCache.has(slug)) {
        const cachedPost = postCache.get(slug);
        setPost(cachedPost);
        setLoading(false);
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const fetchedPost = await postsService.getPost(slug);
        setPost(fetchedPost);
        // Cache the post for navigation
        postCache.set(slug, fetchedPost);
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (err: any) {
        setError(err.message || 'Failed to load post');
        console.error('Error fetching post:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <>
        <NavbarWrapper />
        <Sidebar
          activeCategory="home"
          forceIconOnly={true}
          onCategoryChange={(cat) => {
            const routes: Record<string, string> = {
              'home': '/',
              'for-you': '/',
              'following': '/following',
              'latest': '/latest',
              'trending': '/trending',
              'pages': '/pages',
              'tags': '/tags',
              'podcast': '/podcast',
              'hackathons': '/hackathons',
              'events': '/events',
              'opportunities': '/opportunities'
            };
            navigate(routes[cat] || '/');
          }}
        />
        <div className="min-h-screen pt-16 sm:pt-20 px-3 sm:px-4 md:px-6 lg:px-12 xl:px-24 2xl:px-48">
          <div className="mx-auto">
            <div className="flex gap-3 sm:gap-4 md:gap-6">
              <div className="hidden lg:block w-16 flex-shrink-0"></div>
              <div className="flex-1 max-w-4xl mx-auto">
                <PostDetailSkeleton />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error || !post) {
    return (
      <>
        <NavbarWrapper />
        <Sidebar
          activeCategory="home"
          forceIconOnly={true}
          onCategoryChange={(cat) => {
            const routes: Record<string, string> = {
              'home': '/',
              'for-you': '/',
              'following': '/following',
              'latest': '/latest',
              'trending': '/trending',
              'pages': '/pages',
              'tags': '/tags',
              'podcast': '/podcast',
              'hackathons': '/hackathons',
              'events': '/events',
              'opportunities': '/opportunities'
            };
            navigate(routes[cat] || '/');
          }}
        />
        <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-12 xl:px-24 2xl:px-48">
          <div className="mx-auto">
            <div className="flex gap-6">
              <div className="hidden lg:block w-16 flex-shrink-0"></div>
              <div className="flex-1 max-w-4xl mx-auto p-6 text-center">
                <p className="text-red-500 mb-4">{error || 'Post not found'}</p>
                <button
                  onClick={() => navigate(-1)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {post && (
        <SEOHead
          title={post.seoTitle || post.title}
          description={post.seoDescription || post.content?.substring(0, 160).replace(/[#*`_~\[\]()]/g, '').replace(/\n+/g, ' ').trim() || 'DevCommunity Post'}
          image={post.ogImageUrl || post.coverImageUrl || post.coverImage}
          url={`${window.location.origin}/post/${post.slug}`}
          type="article"
          author={post.author?.username}
          publishedTime={post.publishedAt || post.createdAt}
          modifiedTime={post.updatedAt || post.publishedAt || post.createdAt}
        />
      )}
      <NavbarWrapper />
        <div className="min-h-screen pt-16 sm:pt-20 px-3 sm:px-4 md:px-6 lg:px-12 xl:px-24 2xl:px-48 animate-fade-in">
        <div className="mx-auto">
          <div className="flex gap-3 sm:gap-4 md:gap-6 max-w-7xl mx-auto">
            {/* Left Sidebar - Icon only mode */}
            <div className="hidden lg:block w-16 flex-shrink-0">
              <Sidebar
                activeCategory="home"
                forceIconOnly={true}
                onCategoryChange={(cat) => {
                  const routes: Record<string, string> = {
                    'home': '/',
                    'for-you': '/',
                    'following': '/following',
                    'latest': '/latest',
                    'trending': '/trending',
                    'pages': '/pages',
                    'bookmarks': '/bookmarks',
                    'tags': '/tags',
                    'podcast': '/podcast',
                    'hackathons': '/hackathons',
                    'events': '/events',
                    'opportunities': '/opportunities'
                  };
                  navigate(routes[cat] || '/');
                }}
              />
            </div>
            
            {/* Main content area */}
            <div className="flex-1 flex gap-3 sm:gap-4 md:gap-6">
              <div className="flex-1 max-w-4xl">
                <PostDetail 
                  post={post} 
                  onClose={() => {
                    // If there's history, go back, otherwise go to home
                    if (window.history.length > 1) {
                      navigate(-1);
                    } else {
                      navigate('/');
                    }
                  }} 
                  onLoginRequired={() => setIsLoginModalOpen(true)}
                />
              </div>
              
              {/* Right sidebar - Page card (if post belongs to page) and Author info */}
              {(post?.page || post?.pageId || post?.author) && (
                <aside className="hidden xl:block w-80 flex-shrink-0">
                  <div className="sticky top-24 space-y-4">
                    {/* Page Card - Show first if post belongs to a page */}
                    {(post?.page || post?.pageId) && (
                      <PageSidebar
                        page={post.page || { id: post.pageId, slug: post.pageSlug }}
                        onLoginRequired={() => setIsLoginModalOpen(true)}
                        onFollowChange={(isFollowing, followerCount) => {
                          // Update post.page with new follow status
                          if (post.page) {
                            setPost({
                              ...post,
                              page: {
                                ...post.page,
                                isFollowing,
                                followerCount
                              }
                            });
                          } else if (post.pageId) {
                            // If page data is not in post, we need to add it
                            setPost({
                              ...post,
                              page: {
                                id: post.pageId,
                                slug: post.pageSlug,
                                isFollowing,
                                followerCount
                              }
                            });
                          }
                        }}
                      />
                    )}
                    
                    {/* Author Card - Show below page card */}
                    {post?.author && (
                      <AuthorSidebarPost
                        author={post.author}
                        onPostClick={(slug) => navigate(`/post/${slug}`)}
                        onLoginRequired={() => setIsLoginModalOpen(true)}
                      />
                    )}
                  </div>
                </aside>
              )}
            </div>
          </div>
        </div>
      </div>
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  );
}

// Create Post Page
function CreatePostPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editPostId = searchParams.get('edit');
  const contentTypeParam = searchParams.get('type');

  // Validate and normalize content type
  const validContentTypes = ['post', 'hackathon', 'event', 'opportunity'];
  const initialContentType = contentTypeParam && validContentTypes.includes(contentTypeParam.toLowerCase())
    ? contentTypeParam.toLowerCase() as 'post' | 'hackathon' | 'event' | 'opportunity'
    : undefined;

    return (
      <>
      <NavbarWrapper />
      <CreatePost 
        onBack={() => navigate(-1)} 
        editPostId={editPostId || undefined}
        initialContentType={initialContentType}
      />
      </>
    );
  }

// Profile Page
function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const tab = searchParams.get('tab') || 'posts';

    return (
      <>
      <NavbarWrapper />
        <div className="min-h-screen pt-20 px-3 sm:px-4 md:px-6 lg:px-12 xl:px-24 2xl:px-48 animate-fade-in">
          <div className="max-w-[1400px] mx-auto">
          <UserProfile 
            username={username === 'me' ? undefined : username}
            onBack={() => navigate('/')}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
            activeTab={tab as any}
            onTabChange={(newTab) => navigate(`/profile/${username}?tab=${newTab}`)}
          />
        </div>
      </div>
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      </>
    );
  }

// Pages List Page
function PagesListPage() {

    return (
      <>
      <NavbarWrapper />
        <div className="min-h-screen pt-20 px-3 sm:px-4 md:px-6 lg:px-12 xl:px-24 2xl:px-48 animate-fade-in">
        <div className="max-w-[1400px] mx-auto">
          <PagesListing />
        </div>
      </div>
      </>
    );
  }

// Page Detail Page
function PageDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

    return (
      <>
      <NavbarWrapper />
        <div className="min-h-screen pt-20 px-3 sm:px-4 md:px-6 lg:px-12 xl:px-24 2xl:px-48 animate-fade-in">
          <div className="max-w-[1400px] mx-auto">
          <PageView pageSlug={slug!} onBack={() => navigate('/pages')} />
        </div>
      </div>
      </>
    );
  }

// Tags Page Layout
function TagsPageLayout() {
    return (
      <>
      <NavbarWrapper />
        <div className="min-h-screen pt-20 px-3 sm:px-4 md:px-6 lg:px-12 xl:px-24 2xl:px-48 animate-fade-in">
        <div className="max-w-[1400px] mx-auto">
          <TagsPage />
        </div>
      </div>
      </>
    );
  }

// Podcast Page Layout
function PodcastPageLayout() {
    return (
      <>
      <NavbarWrapper />
        <div className="min-h-screen pt-20 px-3 sm:px-4 md:px-6 lg:px-12 xl:px-24 2xl:px-48 animate-fade-in">
        <div className="max-w-[1400px] mx-auto">
          <PodcastPage />
        </div>
      </div>
      </>
    );
  }

// Hackathons List Page
function HackathonsListPage() {
  const navigate = useNavigate();

    return (
      <>
      <NavbarWrapper />
        <div className="min-h-screen pt-20 px-3 sm:px-4 md:px-6 lg:px-12 xl:px-24 2xl:px-48 animate-fade-in">
        <div className="max-w-[1400px] mx-auto">
          <HackathonsPage onViewHackathonDetail={(id) => navigate(`/hackathons/${id}`)} />
        </div>
      </div>
    </>
  );
}

// Hackathon Detail Page
function HackathonDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <>
      <NavbarWrapper />
      <HackathonDetail hackathonId={id!} onClose={() => navigate('/hackathons')} />
      </>
    );
  }

// Events List Page
function EventsListPage() {
  const navigate = useNavigate();

    return (
      <>
      <NavbarWrapper />
        <div className="min-h-screen pt-20 px-3 sm:px-4 md:px-6 lg:px-12 xl:px-24 2xl:px-48 animate-fade-in">
        <div className="max-w-[1400px] mx-auto">
          <EventsPage onViewEventDetail={(id) => navigate(`/events/${id}`)} />
        </div>
      </div>
    </>
  );
}

// Event Detail Page
function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <>
      <NavbarWrapper />
      <EventDetail eventId={id!} onClose={() => navigate('/events')} />
      </>
    );
  }

// Opportunities List Page
function OpportunitiesListPage() {
  const navigate = useNavigate();

    return (
      <>
      <NavbarWrapper />
        <div className="min-h-screen pt-20 px-3 sm:px-4 md:px-6 lg:px-12 xl:px-24 2xl:px-48 animate-fade-in">
        <div className="max-w-[1400px] mx-auto">
          <OpportunitiesPage onViewOpportunityDetail={(id) => navigate(`/opportunities/${id}`)} />
        </div>
      </div>
      </>
    );
  }

// Opportunity Detail Page
function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

    return (
      <>
      <NavbarWrapper />
      <OpportunityDetail opportunityId={id!} onClose={() => navigate('/opportunities')} />
      </>
    );
  }

// Notifications Page Layout
function NotificationsPageLayout() {
    return (
      <>
      <NavbarWrapper />
        <div className="min-h-screen pt-20 px-3 sm:px-4 md:px-6 lg:px-12 xl:px-24 2xl:px-48 animate-fade-in">
        <div className="max-w-[1400px] mx-auto">
          <NotificationsPage onBack={() => window.history.back()} />
        </div>
      </div>
      </>
    );
  }

// Bookmarks Page
function BookmarksPageLayout() {
  const navigate = useNavigate();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  
  return (
    <>
      <NavbarWrapper />
      <div className="min-h-screen pt-20 px-3 sm:px-4 md:px-6 lg:px-12 xl:px-24 2xl:px-48 animate-fade-in">
        <div className="max-w-[1400px] mx-auto">
          <BookmarksPage 
            onPostClick={(post: Post) => navigate(`/post/${post.slug}`)}
            onLoginRequired={() => setIsLoginModalOpen(true)}
          />
        </div>
      </div>
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  );
}

// Static Page Layout Component
function StaticPageLayout({ slug }: { slug: string }) {
  const navigate = useNavigate();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleBack = () => {
    navigate(-1);
  };

  const pageComponents: Record<string, React.ComponentType<{ onBack: () => void }>> = {
    'about': AboutPage,
    'contact': ContactPage,
    'privacy-policy': PrivacyPolicyPage,
    'terms-of-use': TermsOfUsePage,
    'code-of-conduct': CodeOfConductPage,
  };

  const PageComponent = pageComponents[slug];

  if (!PageComponent) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <Navbar
        onCreatePost={() => navigate('/create-post')}
        onPostClick={() => {}}
        onLogoClick={() => navigate('/')}
        onNotificationsClick={() => navigate('/notifications')}
        onMenuClick={() => setIsMobileSidebarOpen(true)}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
      />
      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        activeCategory=""
        onCategoryChange={(cat) => {
          const routes: Record<string, string> = {
            'for-you': '/',
            'following': '/following',
            'latest': '/latest',
            'trending': '/trending',
            'pages': '/pages',
            'bookmarks': '/bookmarks',
            'tags': '/tags',
            'podcast': '/podcast',
            'hackathons': '/hackathons',
            'events': '/events',
            'opportunities': '/opportunities',
            'about': '/about',
            'contact': '/contact',
            'privacy': '/privacy-policy',
            'terms': '/terms-of-use',
            'conduct': '/code-of-conduct',
          };
          navigate(routes[cat] || '/');
        }}
      />
      <div className="min-h-screen pt-16 sm:pt-20 px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-24 animate-fade-in pb-20 sm:pb-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex gap-4 sm:gap-6 lg:gap-8">
            {/* Left Sidebar */}
            <div className="hidden lg:block w-16 xl:w-64 2xl:w-72 flex-shrink-0">
              <Sidebar
                activeCategory=""
                forceIconOnly={false}
                onCategoryChange={(cat) => {
                  const routes: Record<string, string> = {
                    'home': '/',
                    'for-you': '/',
                    'following': '/following',
                    'latest': '/latest',
                    'trending': '/trending',
                    'pages': '/pages',
                    'bookmarks': '/bookmarks',
                    'tags': '/tags',
                    'podcast': '/podcast',
                    'hackathons': '/hackathons',
                    'events': '/events',
                    'opportunities': '/opportunities',
                    'about': '/about',
                    'contact': '/contact',
                    'privacy': '/privacy-policy',
                    'terms': '/terms-of-use',
                    'conduct': '/code-of-conduct',
                  };
                  navigate(routes[cat] || '/');
                }}
              />
            </div>

            {/* Main content */}
            <div className="flex-1">
              <PageComponent onBack={handleBack} />
            </div>
          </div>
        </div>
      </div>
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  );
}

// Admin Page
function AdminPage() {
  const navigate = useNavigate();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    return (
      <>
        <Navbar
        onCreatePost={() => navigate('/create-post')}
        onPostClick={() => {}}
        onLogoClick={() => navigate('/')}
        onNotificationsClick={() => navigate('/notifications')}
        onMenuClick={() => setIsMobileSidebarOpen(true)}
        onOpenLoginModal={() => {}}
        />
        <MobileSidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        activeCategory={''}
        onCategoryChange={() => {}}
      />
      <AdminDashboard />
      </>
    );
  }

// Reusable Navbar Wrapper
function NavbarWrapper() {
  const navigate = useNavigate();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <>
      <Navbar
        onCreatePost={() => navigate('/create-post')}
        onPostClick={() => {}}
        onLogoClick={() => navigate('/')}
        onNotificationsClick={() => navigate('/notifications')}
        onMenuClick={() => setIsMobileSidebarOpen(true)}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
      />
      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        activeCategory={''}
        onCategoryChange={(cat) => {
          const routes: Record<string, string> = {
            'for-you': '/',
            'following': '/following',
            'latest': '/latest',
            'trending': '/trending',
            'pages': '/pages',
            'bookmarks': '/bookmarks',
            'tags': '/tags',
            'podcast': '/podcast',
            'hackathons': '/hackathons',
            'events': '/events',
            'opportunities': '/opportunities'
          };
          navigate(routes[cat] || '/');
        }}
      />
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  );
}

export default App;
