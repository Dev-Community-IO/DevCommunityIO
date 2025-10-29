import { Routes, Route, Navigate, useNavigate, useSearchParams, useParams, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { PostFeed } from './components/PostFeed';
import { RightSidebar } from './components/RightSidebar';
import { AuthorSidebarPost } from './components/AuthorSidebarPost';
import { LoginModal } from './components/LoginModal';
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
import { BookmarksPage } from './components/BookmarksPage';
import { FloatingCreateButton } from './components/FloatingCreateButton';
import { MobileSidebar } from './components/MobileSidebar';
import { useAuth } from './contexts/AuthContext';
import postsService from './services/api/posts.service';
import { generatePostMeta, updateMetaTags, resetMetaTags } from './utils/seo';

function App() {
  const { isAuthenticated, user, checkAuth } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Handle OAuth callback
  useEffect(() => {
    const authStatus = searchParams.get('auth');
    const token = searchParams.get('token');
    
    if (authStatus === 'success' && token) {
      // Exchange OAuth token for user data
      fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3333/api'}/auth/exchange-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.user && data.token) {
            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            console.log('✅ OAuth successful - user logged in');
            navigate('/', { replace: true });
            window.location.reload();
    } else {
            alert('Authentication failed: Invalid response');
          }
        })
        .catch(error => {
          console.error('OAuth token exchange failed:', error);
          alert('Authentication failed: ' + error.message);
        });
    } else if (authStatus === 'error') {
      const message = searchParams.get('message') || 'Authentication failed';
      console.error('OAuth error:', message);
      alert(`Authentication failed: ${message}`);
      navigate('/', { replace: true });
    }
  }, [searchParams, navigate]);

  return (
    <>
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

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Floating Create Button (shows on all pages except create) */}
      <FloatingCreateButton onClick={() => navigate('/create-post')} />
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
        onProfileClick={() => navigate('/profile/me')}
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
      <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-12 xl:px-24 2xl:px-48 animate-fade-in">
        <div className="mx-auto">
          <div className="flex gap-6">
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
            <div className="flex-1 flex gap-6">
              {/* Main content */}
              <main className="flex-1 max-w-3xl">
                <PostFeedWithData category={category} onLoginRequired={() => setIsLoginModalOpen(true)} />
              </main>
              
              {/* Right sidebar */}
              <aside className="hidden xl:block w-80 flex-shrink-0">
                <div className="sticky top-24">
                  <RightSidebar
                    onHackathonClick={(id: string) => navigate(`/hackathons/${id}`)}
                    onEventClick={(id: string) => navigate(`/events/${id}`)}
                    onOpportunityClick={(id: string) => navigate(`/opportunities/${id}`)}
                  />
                </div>
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
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        // Map feed categories to API parameters
        let params: any = { limit: 20 };
        
        // Check for tag filter in URL params
        const tagsParam = searchParams.get('tags');
        if (tagsParam) {
          // Convert tag name to slug if needed (slugify: lowercase, replace spaces with hyphens)
          const tagSlug = tagsParam.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
          params.tags = tagSlug;
        }
        
        // Feed categories are for sorting/filtering, not post categories
        // "for-you", "following", "latest", "trending" are feed types, not post categories
        if (category === 'latest' || category === 'for-you') {
          // Just get all posts, sorted by date (default backend behavior)
          params = { ...params, limit: 20 };
        } else if (category === 'trending') {
          // Could add a trending sort parameter later
          params = { ...params, limit: 20 };
        } else if (category === 'following') {
          // Would filter by followed users/pages
          params = { ...params, limit: 20 };
        } else {
          // If it's an actual post category (article, tutorial, etc.)
          params = { ...params, category, limit: 20 };
        }
        
        const response = await postsService.getPosts(params);
        setPosts(response.posts || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch posts');
        console.error('Error fetching posts:', err);
        setPosts([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [category, searchParams]);

  // Get active tag filter from URL
  const activeTagFilter = searchParams.get('tags');
  
  // Convert tag slug to display name (format: "cardano" -> "Cardano")
  const getTagDisplayName = (slug: string | null): string | null => {
    if (!slug) return null;
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
      posts={posts}
      onPostClick={(post) => navigate(`/post/${post.slug}`)}
      onLoginRequired={onLoginRequired}
      loading={loading}
      error={error}
      activeTagFilter={getTagDisplayName(activeTagFilter)}
      onClearTagFilter={activeTagFilter ? handleClearTagFilter : undefined}
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
        const seoMeta = generatePostMeta(locationState);
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
        const seoMeta = generatePostMeta(cachedPost);
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
        const seoMeta = generatePostMeta(fetchedPost);
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
      resetMetaTags();
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
              
              {/* Right sidebar - Author info */}
              {post?.author && (
                <aside className="hidden xl:block w-80 flex-shrink-0">
                  <div className="sticky top-24">
                    <AuthorSidebarPost
                      author={post.author}
                      onPostClick={(slug) => navigate(`/post/${slug}`)}
                      onLoginRequired={() => setIsLoginModalOpen(true)}
                    />
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

    return (
      <>
      <NavbarWrapper />
      <CreatePost onBack={() => navigate(-1)} />
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
  const navigate = useNavigate();

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
          <NotificationsPage />
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

// Admin Page
function AdminPage() {
  const navigate = useNavigate();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    return (
      <>
        <Navbar
        onCreatePost={() => navigate('/create-post')}
        onPostClick={() => {}}
        onProfileClick={() => navigate('/profile/me')}
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
        onProfileClick={() => navigate('/profile/me')}
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
