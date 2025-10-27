import { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { PostFeed } from './components/PostFeed';
import { PostDetail } from './components/PostDetail';
import { CreatePost } from './components/CreatePost';
import { UserProfile } from './components/UserProfile';
import { RightSidebar } from './components/RightSidebar';
import { AuthorSidebar } from './components/AuthorSidebar';
import { MobileTabs } from './components/MobileTabs';
import { MobileAnnouncements } from './components/MobileAnnouncements';
import { MobileSidebar } from './components/MobileSidebar';
import { PagesListing } from './components/PagesListing';
import { PageView } from './components/PageView';
import { TagsPage } from './components/TagsPage';
import { PodcastPage } from './components/PodcastPage';
import { HackathonsPage } from './components/HackathonsPage';
import { EventsPage } from './components/EventsPage';
import { OpportunitiesPage } from './components/OpportunitiesPage';
import { HackathonDetail } from './components/HackathonDetail';
import { EventDetail } from './components/EventDetail';
import { OpportunityDetail } from './components/OpportunityDetail';
import { NotificationsPage } from './components/NotificationsPage';
import { FloatingCreateButton } from './components/FloatingCreateButton';
import { mockPosts } from './data/mockData';
import { Post } from './types';

type ViewMode = 'feed' | 'post' | 'create' | 'profile' | 'pages' | 'page' | 'tags' | 'podcast' | 'hackathons' | 'events' | 'opportunities' | 'hackathonDetail' | 'eventDetail' | 'opportunityDetail' | 'notifications';

function AppContent() {
  const [activeCategory, setActiveCategory] = useState('home');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [selectedHackathonId, setSelectedHackathonId] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('feed');
  const [mobileTab, setMobileTab] = useState<'posts' | 'announcements'>('posts');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const showAllPosts = ['home', 'about', 'contact', 'conduct', 'privacy', 'terms'].includes(activeCategory);

  const filteredPosts = showAllPosts
    ? mockPosts
    : mockPosts.filter(post => post.category === activeCategory);

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
    setViewMode('post');
  };

  const handleCreatePost = () => {
    setViewMode('create');
  };

  const handleBackToFeed = () => {
    setSelectedPost(null);
    setSelectedPageId(null);
    if (activeCategory === 'pages') {
      setViewMode('pages');
    } else {
      setViewMode('feed');
    }
  };

  const handleViewProfile = () => {
    setViewMode('profile');
  };

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    if (categoryId === 'pages') {
      setViewMode('pages');
    } else if (categoryId === 'tags') {
      setViewMode('tags');
    } else if (categoryId === 'podcast') {
      setViewMode('podcast');
    } else if (categoryId === 'hackathons') {
      setViewMode('hackathons');
    } else if (categoryId === 'events') {
      setViewMode('events');
    } else if (categoryId === 'opportunities') {
      setViewMode('opportunities');
    } else {
      setViewMode('feed');
    }
  };

  const handlePageClick = (pageId: string) => {
    setSelectedPageId(pageId);
    setViewMode('page');
  };

  const handleBackToPages = () => {
    setSelectedPageId(null);
    setViewMode('pages');
  };

  const handleLogoClick = () => {
    setActiveCategory('home');
    setViewMode('feed');
    setSelectedPost(null);
    setSelectedPageId(null);
    setSelectedHackathonId(null);
    setSelectedEventId(null);
    setSelectedOpportunityId(null);
  };

  const handleHackathonClick = (id: string) => {
    setSelectedHackathonId(id);
    setViewMode('hackathonDetail');
  };

  const handleEventClick = (id: string) => {
    setSelectedEventId(id);
    setViewMode('eventDetail');
  };

  const handleOpportunityClick = (id: string) => {
    setSelectedOpportunityId(id);
    setViewMode('opportunityDetail');
  };

  const handleBackFromDetail = () => {
    setViewMode('feed');
    setSelectedHackathonId(null);
    setSelectedEventId(null);
    setSelectedOpportunityId(null);
  };

  const handleNotificationsClick = () => {
    setViewMode('notifications');
  };

  const handleMenuClick = () => {
    setIsMobileSidebarOpen(true);
  };

  if (viewMode === 'create') {
    return (
      <>
        <Navbar
          onCreatePost={handleCreatePost}
          onPostClick={handlePostClick}
          onProfileClick={handleViewProfile}
          onLogoClick={handleLogoClick}
          onNotificationsClick={handleNotificationsClick}
          onMenuClick={handleMenuClick}
        />
        <MobileSidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />
        <CreatePost onBack={handleBackToFeed} />
        <FloatingCreateButton onClick={handleCreatePost} />
      </>
    );
  }

  if (viewMode === 'notifications') {
    return (
      <>
        <Navbar
          onCreatePost={handleCreatePost}
          onPostClick={handlePostClick}
          onProfileClick={handleViewProfile}
          onLogoClick={handleLogoClick}
          onNotificationsClick={handleNotificationsClick}
          onMenuClick={handleMenuClick}
        />
        <MobileSidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />
        <NotificationsPage onBack={handleBackToFeed} />
        <FloatingCreateButton onClick={handleCreatePost} />
      </>
    );
  }

  if (viewMode === 'profile') {
    return (
      <>
        <Navbar
          onCreatePost={handleCreatePost}
          onPostClick={handlePostClick}
          onProfileClick={handleViewProfile}
          onLogoClick={handleLogoClick}
          onNotificationsClick={handleNotificationsClick}
          onMenuClick={handleMenuClick}
        />
        <MobileSidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />
        <div className="min-h-screen pt-20 px-3 sm:px-4 md:px-6 lg:px-12 xl:px-24 2xl:px-48 animate-fade-in">
          <div className="max-w-[1400px] mx-auto">
            <UserProfile onBack={handleBackToFeed} />
          </div>
        </div>
        <FloatingCreateButton onClick={handleCreatePost} />
      </>
    );
  }

  if (viewMode === 'pages') {
    return (
      <>
        <Navbar
          onCreatePost={handleCreatePost}
          onPostClick={handlePostClick}
          onProfileClick={handleViewProfile}
          onLogoClick={handleLogoClick}
          onNotificationsClick={handleNotificationsClick}
          onMenuClick={handleMenuClick}
        />
        <MobileSidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />
        <div className="min-h-screen pt-20 px-3 sm:px-4 md:px-6 lg:px-12 xl:px-24 2xl:px-48 animate-fade-in">
          <div className="max-w-[1600px] mx-auto">
            <PagesListing onPageClick={handlePageClick} onBack={handleBackToFeed} />
          </div>
        </div>
        <FloatingCreateButton onClick={handleCreatePost} />
      </>
    );
  }

  if (viewMode === 'page' && selectedPageId) {
    return (
      <>
        <Navbar
          onCreatePost={handleCreatePost}
          onPostClick={handlePostClick}
          onProfileClick={handleViewProfile}
          onLogoClick={handleLogoClick}
          onNotificationsClick={handleNotificationsClick}
          onMenuClick={handleMenuClick}
        />
        <MobileSidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />
        <div className="min-h-screen pt-20 px-3 sm:px-4 md:px-6 lg:px-12 xl:px-24 2xl:px-48 animate-fade-in">
          <div className="max-w-[1400px] mx-auto">
            <PageView pageId={selectedPageId} onBack={handleBackToPages} onPostClick={handlePostClick} />
          </div>
        </div>
        <FloatingCreateButton onClick={handleCreatePost} />
      </>
    );
  }

  if (viewMode === 'tags') {
    return (
      <>
        <Navbar
          onCreatePost={handleCreatePost}
          onPostClick={handlePostClick}
          onProfileClick={handleViewProfile}
          onLogoClick={handleLogoClick}
          onNotificationsClick={handleNotificationsClick}
          onMenuClick={handleMenuClick}
        />
        <MobileSidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />
        <div className="min-h-screen pt-20 px-3 sm:px-4 md:px-6 lg:px-12 xl:px-24 2xl:px-48 animate-fade-in">
          <div className="max-w-[1600px] mx-auto">
            <TagsPage
              onTagClick={(tag) => {
                setActiveCategory(tag);
                setViewMode('feed');
              }}
              onBack={handleBackToFeed}
            />
          </div>
        </div>
        <FloatingCreateButton onClick={handleCreatePost} />
      </>
    );
  }

  if (viewMode === 'hackathons') {
    return (
      <>
        <Navbar
          onCreatePost={handleCreatePost}
          onPostClick={handlePostClick}
          onProfileClick={handleViewProfile}
          onLogoClick={handleLogoClick}
          onNotificationsClick={handleNotificationsClick}
          onMenuClick={handleMenuClick}
        />
        <MobileSidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />
        <div className="min-h-screen pt-20 px-3 sm:px-4 md:px-6 lg:px-12 xl:px-24 2xl:px-48 animate-fade-in">
          <div className="max-w-[1600px] mx-auto">
            <HackathonsPage onBack={handleBackToFeed} />
          </div>
        </div>
        <FloatingCreateButton onClick={handleCreatePost} />
      </>
    );
  }

  if (viewMode === 'events') {
    return (
      <>
        <Navbar
          onCreatePost={handleCreatePost}
          onPostClick={handlePostClick}
          onProfileClick={handleViewProfile}
          onLogoClick={handleLogoClick}
          onNotificationsClick={handleNotificationsClick}
          onMenuClick={handleMenuClick}
        />
        <MobileSidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />
        <div className="min-h-screen pt-20 px-3 sm:px-4 md:px-6 lg:px-12 xl:px-24 2xl:px-48 animate-fade-in">
          <div className="max-w-[1600px] mx-auto">
            <EventsPage onBack={handleBackToFeed} />
          </div>
        </div>
        <FloatingCreateButton onClick={handleCreatePost} />
      </>
    );
  }

  if (viewMode === 'opportunities') {
    return (
      <>
        <Navbar
          onCreatePost={handleCreatePost}
          onPostClick={handlePostClick}
          onProfileClick={handleViewProfile}
          onLogoClick={handleLogoClick}
          onNotificationsClick={handleNotificationsClick}
          onMenuClick={handleMenuClick}
        />
        <MobileSidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />
        <div className="min-h-screen pt-20 px-3 sm:px-4 md:px-6 lg:px-12 xl:px-24 2xl:px-48 animate-fade-in">
          <div className="max-w-[1600px] mx-auto">
            <OpportunitiesPage onBack={handleBackToFeed} />
          </div>
        </div>
        <FloatingCreateButton onClick={handleCreatePost} />
      </>
    );
  }

  if (viewMode === 'hackathonDetail' && selectedHackathonId) {
    return (
      <>
        <Navbar
          onCreatePost={handleCreatePost}
          onPostClick={handlePostClick}
          onProfileClick={handleViewProfile}
          onLogoClick={handleLogoClick}
          onNotificationsClick={handleNotificationsClick}
          onMenuClick={handleMenuClick}
        />
        <MobileSidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />
        <div className="min-h-screen pt-20 px-3 sm:px-4 md:px-6 lg:px-12 xl:px-24 2xl:px-48 animate-fade-in">
          <div className="max-w-[1600px] mx-auto">
            <HackathonDetail id={selectedHackathonId} onBack={handleBackFromDetail} />
          </div>
        </div>
        <FloatingCreateButton onClick={handleCreatePost} />
      </>
    );
  }

  if (viewMode === 'eventDetail' && selectedEventId) {
    return (
      <>
        <Navbar
          onCreatePost={handleCreatePost}
          onPostClick={handlePostClick}
          onProfileClick={handleViewProfile}
          onLogoClick={handleLogoClick}
          onNotificationsClick={handleNotificationsClick}
          onMenuClick={handleMenuClick}
        />
        <MobileSidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />
        <div className="min-h-screen pt-20 px-3 sm:px-4 md:px-6 lg:px-12 xl:px-24 2xl:px-48 animate-fade-in">
          <div className="max-w-[1600px] mx-auto">
            <EventDetail id={selectedEventId} onBack={handleBackFromDetail} />
          </div>
        </div>
        <FloatingCreateButton onClick={handleCreatePost} />
      </>
    );
  }

  if (viewMode === 'opportunityDetail' && selectedOpportunityId) {
    return (
      <>
        <Navbar
          onCreatePost={handleCreatePost}
          onPostClick={handlePostClick}
          onProfileClick={handleViewProfile}
          onLogoClick={handleLogoClick}
          onNotificationsClick={handleNotificationsClick}
          onMenuClick={handleMenuClick}
        />
        <MobileSidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />
        <div className="min-h-screen pt-20 px-3 sm:px-4 md:px-6 lg:px-12 xl:px-24 2xl:px-48 animate-fade-in">
          <div className="max-w-[1600px] mx-auto">
            <OpportunityDetail id={selectedOpportunityId} onBack={handleBackFromDetail} />
          </div>
        </div>
        <FloatingCreateButton onClick={handleCreatePost} />
      </>
    );
  }

  if (viewMode === 'podcast') {
    return (
      <>
        <Navbar
          onCreatePost={handleCreatePost}
          onPostClick={handlePostClick}
          onProfileClick={handleViewProfile}
          onLogoClick={handleLogoClick}
          onNotificationsClick={handleNotificationsClick}
          onMenuClick={handleMenuClick}
        />
        <MobileSidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />
        <div className="min-h-screen pt-20 px-3 sm:px-4 md:px-6 lg:px-12 xl:px-24 2xl:px-48 animate-fade-in">
          <div className="max-w-[1600px] mx-auto">
            <PodcastPage />
          </div>
        </div>
        <FloatingCreateButton onClick={handleCreatePost} />
      </>
    );
  }

  return (
    <>
      <Navbar
        onCreatePost={handleCreatePost}
        onPostClick={handlePostClick}
        onProfileClick={handleViewProfile}
        onLogoClick={handleLogoClick}
        onNotificationsClick={handleNotificationsClick}
        onMenuClick={handleMenuClick}
      />
      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />

      <div className="min-h-screen pt-20 px-3 sm:px-4 md:px-6 lg:px-12 xl:px-24 2xl:px-48 animate-fade-in">
        <div className="max-w-[1800px] mx-auto flex gap-4 lg:gap-6">
          <aside className={`hidden md:block flex-shrink-0 space-y-4 ${viewMode === 'post' ? 'w-16' : 'w-16 lg:w-64'}`}>
            <Sidebar
              activeCategory={activeCategory}
              onCategoryChange={handleCategoryChange}
              forceIconOnly={viewMode === 'post'}
            />
          </aside>

          <main className="flex-1 animate-slide-up min-w-0">
            {viewMode !== 'post' && (
              <MobileTabs activeTab={mobileTab} onTabChange={setMobileTab} />
            )}

            {viewMode === 'post' && selectedPost ? (
              <PostDetail
                post={selectedPost}
                onBack={handleBackToFeed}
              />
            ) : (
              <>
                {mobileTab === 'posts' ? (
                  <PostFeed
                    posts={filteredPosts}
                    onPostClick={handlePostClick}
                  />
                ) : (
                  <div className="lg:hidden">
                    <MobileAnnouncements />
                  </div>
                )}
              </>
            )}
          </main>

          {viewMode === 'post' && selectedPost ? (
            <AuthorSidebar author={selectedPost.author} />
          ) : (
            <RightSidebar
              onHackathonClick={handleHackathonClick}
              onEventClick={handleEventClick}
              onOpportunityClick={handleOpportunityClick}
            />
          )}
        </div>
      </div>

      <FloatingCreateButton onClick={handleCreatePost} />
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
