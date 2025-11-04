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
import { AdminDashboard } from './components/AdminDashboard';
import { AboutPage } from './components/AboutPage';
import { ContactPage } from './components/ContactPage';
import { PrivacyPolicyPage } from './components/PrivacyPolicyPage';
import { TermsOfUsePage } from './components/TermsOfUsePage';
import { CodeOfConductPage } from './components/CodeOfConductPage';
import { FloatingCreateButton } from './components/FloatingCreateButton';
import { MobileSidebar } from './components/MobileSidebar';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { useAuth } from './contexts/AuthContext';
import postsService from './services/api/posts.service';
import tagsService from './services/api/tags.service';
import hackathonsService from './services/api/hackathons.service';
import eventsService from './services/api/events.service';
import opportunitiesService from './services/api/opportunities.service';
import { generatePostMeta, updateMetaTags, resetMetaTags } from './utils/seo';
import { getApiBaseUrl } from './utils/apiUrl';
import { FeedItem } from './components/PostFeed';
import { isNetworkError } from './services/api/config';

function App() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showOnboarding, setShowOnboarding, checkAuth } = useAuth();
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
            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            console.log('✅ OAuth successful - user logged in');
            // Don't reload - check auth and onboarding will be handled by AuthContext
            checkAuth();
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
  }, [searchParams, navigate, checkAuth]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  return (
    <>
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
function FeedLayout({ category = 'for-you' }: { category?: string }) {
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
        activeCategory={category}
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
                activeCategory={category}
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
                <PostFeedWithData category={category} onLoginRequired={() => setIsLoginModalOpen(true)} />
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
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  );
}

// Post Feed with Data
function PostFeedWithData({ category, onLoginRequired }: { category: string; onLoginRequired: () => void }) {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeSort, setActiveSort] = useState<'hot' | 'new' | 'top'>('hot');
  const [activeTagInfo, setActiveTagInfo] = useState<{ name: string; logoUrl?: string } | null>(null);

  useEffect(() => {
    const fetchAllContent = async () => {
      setLoading(true);
      setError(null);
      try {
        // Map feed categories to API parameters
        // Use recommendation system as default for "for-you" category
        let postParams: any = { limit: 20 };
        
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
          // Convert tag name to slug if needed (slugify: lowercase, replace spaces with hyphens)
          const tagSlug = tagsParam.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
          postParams.tags = tagSlug;
          
          // Fetch tag info to get logo
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
            // If tag fetch fails, just use the slug as name
            setActiveTagInfo({ name: tagsParam });
          }
        } else {
          setActiveTagInfo(null);
        }
        
        // Feed categories are for sorting/filtering, not post categories
        if (category === 'latest') {
          postParams = { ...postParams, limit: 20, sort: activeSort, recommendations: 'false' };
        } else if (category === 'trending') {
          postParams = { ...postParams, limit: 20, sort: activeSort, recommendations: 'false' };
        } else if (category === 'following') {
          postParams = { ...postParams, limit: 20, sort: activeSort, recommendations: 'false' };
        } else if (category === 'for-you') {
          // Use recommendations as default for "for-you"
          postParams = { ...postParams, limit: 20, recommendations: 'true' };
        } else {
          // If it's an actual post category (article, tutorial, etc.)
          postParams = { ...postParams, category, limit: 20, sort: activeSort };
        }
        
        // Fetch all content types in parallel
        const [postsResponse, hackathonsResponse, eventsResponse, opportunitiesResponse] = await Promise.allSettled([
          postsService.getPosts(postParams),
          hackathonsService.getHackathons({ limit: 20 }),
          eventsService.getEvents({ limit: 20 }),
          opportunitiesService.getOpportunities({ limit: 20 })
        ]);

        const allItems: FeedItem[] = [];

        // Process posts
        if (postsResponse.status === 'fulfilled') {
          // Handle both paginated format { meta, data } and direct array format
          const responseData = postsResponse.value as any;
          let fetchedPosts: any[] = [];
          
          if (responseData.data && Array.isArray(responseData.data)) {
            // Recommendation system returns { meta, data }
            fetchedPosts = responseData.data;
          } else if (responseData.posts && Array.isArray(responseData.posts)) {
            // Traditional pagination returns { posts, meta }
            fetchedPosts = responseData.posts;
          } else if (Array.isArray(responseData)) {
            // Direct array format
            fetchedPosts = responseData;
          }
          
          const postsMap = new Map();
          fetchedPosts.forEach((post: any) => {
            if (post && post.id && !postsMap.has(post.id)) {
              postsMap.set(post.id, post);
            }
          });
          const uniquePosts = Array.from(postsMap.values());
          uniquePosts.forEach((post: any) => {
            allItems.push({ type: 'post', data: post });
          });
        }

        // Process hackathons
        if (hackathonsResponse.status === 'fulfilled') {
          // Handle paginated response format: { meta, data } or direct array
          let hackathons: any[] = [];
          const responseValue = hackathonsResponse.value as any;
          
          if (responseValue.data && Array.isArray(responseValue.data)) {
            // Paginated format
            hackathons = responseValue.data;
          } else if (responseValue.hackathons && Array.isArray(responseValue.hackathons)) {
            // Alternative format
            hackathons = responseValue.hackathons;
          } else if (Array.isArray(responseValue)) {
            // Direct array
            hackathons = responseValue;
          }
          
          hackathons.forEach((hackathon: any) => {
            if (hackathon && hackathon.id) {
              allItems.push({ type: 'hackathon', data: hackathon });
            }
          });
        }

        // Process events
        if (eventsResponse.status === 'fulfilled') {
          // Handle paginated response format: { meta, data } or direct array
          let events: any[] = [];
          const responseValue = eventsResponse.value;
          
          if (responseValue.data && Array.isArray(responseValue.data)) {
            // Paginated format
            events = responseValue.data;
          } else if (responseValue.events && Array.isArray(responseValue.events)) {
            // Alternative format
            events = responseValue.events;
          } else if (Array.isArray(responseValue)) {
            // Direct array
            events = responseValue;
          }
          
          events.forEach((event: any) => {
            if (event && event.id) {
              allItems.push({ type: 'event', data: event });
            }
          });
        }

        // Process opportunities
        if (opportunitiesResponse.status === 'fulfilled') {
          // Handle paginated response format: { meta, data } or direct array
          let opportunities: any[] = [];
          const responseValue = opportunitiesResponse.value as any;
          
          if (responseValue.data && Array.isArray(responseValue.data)) {
            // Paginated format
            opportunities = responseValue.data;
          } else if (responseValue.opportunities && Array.isArray(responseValue.opportunities)) {
            // Alternative format
            opportunities = responseValue.opportunities;
          } else if (Array.isArray(responseValue)) {
            // Direct array
            opportunities = responseValue;
          }
          
          opportunities.forEach((opportunity: any) => {
            if (opportunity && opportunity.id) {
              allItems.push({ type: 'opportunity', data: opportunity });
            }
          });
        }

        // Sort all items by creation date (newest first) - but preserve recommendation order for "for-you"
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
            
            return dateB - dateA; // Descending order (newest first)
          });
        }
        // For "for-you", keep the recommendation order (already sorted by score)

        // Remove duplicates based on postId if multiple content types share the same post
        const seenPostIds = new Set<string>();
        const uniqueItems = allItems.filter(item => {
          const postId = 
            item.type === 'post' ? item.data.id :
            item.type === 'hackathon' ? item.data.postId :
            item.type === 'event' ? item.data.postId :
            item.data.postId;
          
          if (postId && seenPostIds.has(postId)) {
            return false;
          }
          if (postId) {
            seenPostIds.add(postId);
          }
          return true;
        });

        setItems(uniqueItems);
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
        // Update SEO meta tags
        const seoMeta = await generatePostMeta(locationState);
        updateMetaTags(seoMeta);
        // Scroll to top for better UX
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      
      // Check cache first for browser back/forward
      if (postCache.has(slug)) {
        const cachedPost = postCache.get(slug);
        setPost(cachedPost);
        setLoading(false);
        // Update SEO for cached post
        const seoMeta = await generatePostMeta(cachedPost);
        updateMetaTags(seoMeta);
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
        // Update SEO meta tags
        const seoMeta = await generatePostMeta(fetchedPost);
        updateMetaTags(seoMeta);
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
    
    // Cleanup: reset meta tags when leaving post page
    return () => {
      resetMetaTags().catch(console.error);
    };
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
        <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-12 xl:px-24 2xl:px-48">
          <div className="mx-auto">
            <div className="flex gap-6">
              <div className="hidden lg:block w-16 flex-shrink-0"></div>
              <div className="flex-1 max-w-4xl mx-auto p-6 text-center">
                <p className="text-gray-500 dark:text-gray-400">Loading post...</p>
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
      <NavbarWrapper />
      <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-12 xl:px-24 2xl:px-48 animate-fade-in">
        <div className="mx-auto">
          <div className="flex gap-6 max-w-7xl mx-auto">
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
            <div className="flex-1 flex gap-6">
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

    return (
      <>
      <NavbarWrapper />
      <CreatePost onBack={() => navigate(-1)} editPostId={editPostId || undefined} />
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
            onPostClick={(post) => navigate(`/post/${post.slug}`)}
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
