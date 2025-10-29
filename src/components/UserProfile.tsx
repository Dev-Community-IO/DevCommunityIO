import { useState, useEffect, useRef } from 'react';
import { Edit3, Briefcase, Star, MapPin, Calendar, TrendingUp, MessageSquare, FileText, Settings as SettingsIcon, Award, Twitter, Linkedin, Send, Github, LogIn } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { ProfileDashboard } from './ProfileDashboard';
import { ProfilePosts } from './ProfilePosts';
import { ProfileReplies } from './ProfileReplies';
import { ProfilePages } from './ProfilePages';
import { ProfileAchievements } from './ProfileAchievements';
import { ProfileSettings } from './ProfileSettings';
import { EditProfileModal } from './EditProfileModal';
import { ProfileHeaderSkeleton, ProfileTabsSkeleton } from './skeletons';
import { FollowersFollowingDropdown } from './FollowersFollowingDropdown';
import { useAuth } from '../contexts/AuthContext';
import usersService from '../services/api/users.service';

interface UserProfileProps {
  username?: string;
  onBack?: () => void; // eslint-disable-line @typescript-eslint/no-unused-vars
  onOpenLoginModal?: () => void;
  activeTab?: string;
  onTabChange?: (tab: TabType) => void;
}

type TabType = 'dashboard' | 'posts' | 'replies' | 'pages' | 'achievements' | 'settings';

export function UserProfile({ username, onBack, onOpenLoginModal, activeTab: propActiveTab, onTabChange }: UserProfileProps) {
  const { isAuthenticated, user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>((propActiveTab || 'posts') as TabType);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [profileUser, setProfileUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userNotFound, setUserNotFound] = useState(false);
  const [showFollowersDropdown, setShowFollowersDropdown] = useState(false);
  const [showFollowingDropdown, setShowFollowingDropdown] = useState(false);
  const followersRef = useRef<HTMLDivElement>(null);
  const followingRef = useRef<HTMLDivElement>(null);
  
  // Determine if viewing own profile
  const viewingUsername = username || authUser?.username;
  const isOwnProfile = isAuthenticated && authUser && viewingUsername === authUser.username;

  const [mockUser, setMockUser] = useState<{
    id: string;
    username: string;
    pseudo?: string | null;
    avatar: string;
    coverImage: string;
    walletAddress: string;
    reputation: number;
    isVerified: boolean;
    role: string;
    occupation?: string | null;
    location: string;
    joinedDate: string;
    bio: string;
    skills: string[];
    socialLinks: Record<string, string>;
    stats: {
      posts: number;
      replies: number;
      upvotes: number;
      followers: number;
      following: number;
    };
  } | null>(null);

  const handleSaveProfile = (updatedUser: any) => {
    if (!mockUser) return;
    
    setMockUser({ ...mockUser, ...updatedUser });
    // Refresh profile data after save
    if (viewingUsername) {
      usersService.getUserByUsername(viewingUsername).then(userData => {
        setProfileUser(userData);
        usersService.getUserStats(viewingUsername).then(stats => {
          const normalizedStats = {
            posts: typeof stats.posts === 'object' ? (stats.posts as any).total || 0 : Number(stats.posts || 0),
            replies: typeof stats.replies === 'object' ? (stats.replies as any).total || 0 : Number(stats.replies || 0),
            upvotes: typeof stats.upvotes === 'object' ? (stats.upvotes as any).total || 0 : Number(stats.upvotes || 0),
            followers: typeof stats.followers === 'object' ? (stats.followers as any).total || 0 : Number(stats.followers || 0),
            following: typeof stats.following === 'object' ? (stats.following as any).total || 0 : Number(stats.following || 0),
          };
          setMockUser(prev => {
            if (!prev) return null;
            return {
              ...prev,
              id: userData.id,
              username: userData.username,
              pseudo: userData.pseudo || null,
              avatar: userData.avatarUrl || prev.avatar,
              coverImage: userData.coverImageUrl || prev.coverImage,
              walletAddress: prev.walletAddress,
              reputation: userData.reputation,
              isVerified: userData.isVerified,
            role: userData.role,
            occupation: userData.occupation || prev.occupation || null,
            location: userData.location ?? prev.location,
              joinedDate: prev.joinedDate,
              bio: userData.bio || prev.bio,
              skills: userData.skills || prev.skills,
              socialLinks: (userData.socialLinks || {}) as Record<string, string>,
              stats: normalizedStats,
            };
          });
        });
      });
    }
  };

  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!viewingUsername) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch user profile
        const userData = await usersService.getUserByUsername(viewingUsername);
        setProfileUser(userData);
        
        // Fetch user stats
        const stats = await usersService.getUserStats(viewingUsername);
        
        // Ensure stats are numbers (convert any count objects to numbers)
        const normalizedStats = {
          posts: typeof stats.posts === 'object' ? (stats.posts as any).total || 0 : Number(stats.posts || 0),
          replies: typeof stats.replies === 'object' ? (stats.replies as any).total || 0 : Number(stats.replies || 0),
          upvotes: typeof stats.upvotes === 'object' ? (stats.upvotes as any).total || 0 : Number(stats.upvotes || 0),
          followers: typeof stats.followers === 'object' ? (stats.followers as any).total || 0 : Number(stats.followers || 0),
          following: typeof stats.following === 'object' ? (stats.following as any).total || 0 : Number(stats.following || 0),
        };
        
        // Update mockUser with real data
        setMockUser({
          id: userData.id,
          username: userData.username,
          pseudo: userData.pseudo || null,
          avatar: userData.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`,
          coverImage: userData.coverImageUrl || '',
          walletAddress: '',
          reputation: userData.reputation,
          isVerified: userData.isVerified,
          role: userData.role,
          occupation: userData.occupation || null,
          location: userData.location ?? '',
          joinedDate: new Date(userData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          bio: userData.bio || 'No bio yet.',
          skills: (userData.skills || []) as string[],
          socialLinks: (userData.socialLinks || {}) as Record<string, string>,
          stats: normalizedStats
        });

        // Check if following (only if viewing someone else's profile)
        if (!isOwnProfile && isAuthenticated) {
          const following = await usersService.isFollowing(userData.id);
          setIsFollowing(following);
        }
        setUserNotFound(false);
      } catch (error: any) {
        console.error('Failed to fetch profile:', error);
        if (error?.response?.status === 404 || error?.message?.includes('not found')) {
          setUserNotFound(true);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [viewingUsername, isOwnProfile, isAuthenticated]);

  // Handle follow/unfollow
  const handleFollowToggle = async () => {
    if (!profileUser) return;
    
    try {
      if (isFollowing) {
        await usersService.unfollowUser(profileUser.id);
      } else {
        await usersService.followUser(profileUser.id);
      }
      setIsFollowing(!isFollowing);
      
      // Update follower count
      setMockUser(prev => {
        if (!prev) return null;
        return {
          ...prev,
          stats: {
            ...prev.stats,
            followers: isFollowing ? prev.stats.followers - 1 : prev.stats.followers + 1
          }
        };
      });
    } catch (error) {
      console.error('Failed to toggle follow:', error);
    }
  };

  // Filter tabs based on authentication and ownership
  const allTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp, requiresAuth: true, requiresOwn: true },
    { id: 'posts', label: 'Posts', icon: FileText, requiresAuth: false, requiresOwn: false },
    { id: 'replies', label: 'Replies', icon: MessageSquare, requiresAuth: false, requiresOwn: false },
    { id: 'pages', label: 'Pages', icon: Briefcase, requiresAuth: false, requiresOwn: false },
    { id: 'achievements', label: 'Achievements', icon: Award, requiresAuth: false, requiresOwn: false },
    { id: 'settings', label: 'Settings', icon: SettingsIcon, requiresAuth: true, requiresOwn: true }
  ];

  const tabs = allTabs.filter(tab => {
    if (tab.requiresOwn && !isOwnProfile) return false;
    if (tab.requiresAuth && !isAuthenticated) return false;
    return true;
  });

  // Show skeleton loader while loading or if user data is not yet loaded
  if (loading || !mockUser) {
    return (
      <div className="space-y-4 sm:space-y-6 animate-fade-in">
        <GlassCard className="overflow-hidden p-0">
          <ProfileHeaderSkeleton />
        </GlassCard>
        <GlassCard>
          <ProfileTabsSkeleton />
        </GlassCard>
      </div>
    );
  }

  // Show user not found message
  if (userNotFound) {
    return (
      <div className="space-y-4 sm:space-y-6 animate-fade-in flex items-center justify-center min-h-[400px]">
        <GlassCard className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">User Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The user <span className="font-semibold">@{viewingUsername}</span> does not exist.
          </p>
          {onBack && (
            <button
              onClick={onBack}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-300"
            >
              Go Back
            </button>
          )}
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <GlassCard className="overflow-hidden p-0">
        {/* Gradient Header */}
        <div className="relative h-32 sm:h-48 bg-gradient-to-br from-orange-400 via-pink-400 to-cyan-400 animate-gradient">
          {mockUser.coverImage && (
            <img src={mockUser.coverImage} alt="Cover" className="w-full h-full object-cover" />
          )}
          {isOwnProfile && (
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 sm:p-2.5 rounded-full bg-white dark:bg-gray-800 hover:scale-110 transition-transform duration-300 shadow-lg"
            >
              <Edit3 size={18} className="text-gray-700 dark:text-gray-300 sm:w-5 sm:h-5" />
            </button>
          )}
        </div>

        {/* Profile Info - Overlapping Card */}
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 rounded-xl sm:rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 -mt-16 sm:-mt-24 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 sm:gap-4">
              {/* Avatar and Basic Info */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center sm:items-end">
                <Avatar
                  src={mockUser.avatar}
                  alt={mockUser.username}
                  size="xl"
                  className="ring-4 ring-white dark:ring-gray-900 w-24 h-24 sm:w-32 sm:h-32"
                />

                <div className="space-y-1 sm:space-y-2 mb-2 text-center sm:text-left">
                  <div>
                    {mockUser.pseudo ? (
                      <>
                        <h1 className="text-2xl sm:text-3xl font-bold">{mockUser.pseudo}</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">@{mockUser.username}</p>
                      </>
                    ) : (
                      <h1 className="text-2xl sm:text-3xl font-bold">{mockUser.username}</h1>
                    )}
                    {mockUser.occupation && (
                      <p className="text-gray-600 dark:text-gray-400 flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 text-sm sm:text-base mt-1">
                        <Briefcase size={14} className="sm:w-4 sm:h-4" />
                        {mockUser.occupation}
                      </p>
                    )}
                    <p className="text-gray-500 dark:text-gray-500 flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 text-xs sm:text-sm">
                      <MapPin size={12} className="sm:w-3.5 sm:h-3.5" />
                      {mockUser.location}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {!isAuthenticated ? (
                <div className="flex gap-3 items-center">
                  <button
                    onClick={() => onOpenLoginModal?.()}
                    className="px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 flex items-center gap-2"
                  >
                    <LogIn size={18} />
                    Connect to Follow
                  </button>
                </div>
              ) : !isOwnProfile && (
                <div className="flex gap-3 items-center">
                  <button
                    onClick={handleFollowToggle}
                    className={`px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl ${
                      isFollowing
                        ? 'border-2 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                        : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600'
                    }`}
                  >
                    {isFollowing ? 'Unfollow' : 'Follow'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Current Role & Skills Section */}
          <div className="mt-4 sm:mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2 space-y-3 sm:space-y-4">
              {/* Bio */}
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">{mockUser.bio}</p>

              {/* Social Links */}
              {mockUser.socialLinks && Object.keys(mockUser.socialLinks).length > 0 && (
                <div className="flex gap-3 items-center flex-wrap">
                  {mockUser.socialLinks.twitter && (
                    <a
                      href={`https://twitter.com/${mockUser.socialLinks.twitter}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg hover:bg-blue-500/10 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                      aria-label="Twitter"
                    >
                      <Twitter size={18} />
                    </a>
                  )}
                  {mockUser.socialLinks.linkedin && (
                    <a
                      href={mockUser.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg hover:bg-blue-600/10 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-500 transition-colors"
                      aria-label="LinkedIn"
                    >
                      <Linkedin size={18} />
                    </a>
                  )}
                  {mockUser.socialLinks.telegram && (
                    <a
                      href={`https://t.me/${mockUser.socialLinks.telegram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg hover:bg-blue-400/10 text-gray-600 dark:text-gray-400 hover:text-blue-400 dark:hover:text-blue-300 transition-colors"
                      aria-label="Telegram"
                    >
                      <Send size={18} />
                    </a>
                  )}
                  {mockUser.socialLinks.github && (
                    <a
                      href={`https://github.com/${mockUser.socialLinks.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg hover:bg-gray-600/10 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                      aria-label="GitHub"
                    >
                      <Github size={18} />
                    </a>
                  )}
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-3 sm:gap-4">
                <div className="flex flex-col sm:flex-row items-center sm:items-center gap-0.5 sm:gap-2">
                  <span className="font-bold text-lg sm:text-xl">{mockUser.stats.posts}</span>
                  <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Posts</span>
                </div>
                <div className="flex flex-col sm:flex-row items-center sm:items-center gap-0.5 sm:gap-2">
                  <span className="font-bold text-lg sm:text-xl">{mockUser.stats.replies}</span>
                  <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Replies</span>
                </div>
                <div className="flex flex-col sm:flex-row items-center sm:items-center gap-0.5 sm:gap-2">
                  <span className="font-bold text-lg sm:text-xl">{mockUser.reputation}</span>
                  <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Reputation</span>
                </div>
                <div 
                  ref={followersRef}
                  onClick={() => setShowFollowersDropdown(true)}
                  className="flex flex-col sm:flex-row items-center sm:items-center gap-0.5 sm:gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <span className="font-bold text-lg sm:text-xl">{mockUser.stats.followers}</span>
                  <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Followers</span>
                </div>
                <div 
                  ref={followingRef}
                  onClick={() => setShowFollowingDropdown(true)}
                  className="flex flex-col sm:flex-row items-center sm:items-center gap-0.5 sm:gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <span className="font-bold text-lg sm:text-xl">{mockUser.stats.following}</span>
                  <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Following</span>
                </div>
              </div>

              {/* Join Date */}
              <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                <Calendar size={12} className="sm:w-3.5 sm:h-3.5" />
                <span>Joined {mockUser.joinedDate}</span>
              </div>
            </div>

            {/* Skills & Role */}
            <div className="space-y-3 sm:space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <h3 className="font-bold text-xs sm:text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5 sm:gap-2">
                    <Briefcase size={14} className="sm:w-4 sm:h-4" />
                    Current Role
                  </h3>
                </div>
                <div className="p-2.5 sm:p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
                  <p className="font-semibold text-sm sm:text-base">{mockUser.occupation || 'Not specified'}</p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <h3 className="font-bold text-xs sm:text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5 sm:gap-2">
                    <Star size={14} className="sm:w-4 sm:h-4" />
                    Skills
                  </h3>
                </div>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {mockUser.skills.map((skill) => (
                    <Badge key={skill} className="px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="mt-6 sm:mt-8 border-b border-gray-200 dark:border-gray-700 -mx-4 sm:mx-0">
            <div className="flex gap-0 overflow-x-auto scrollbar-thin px-4 sm:px-0">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as TabType);
                      onTabChange?.(tab.id as TabType);
                    }}
                    className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2.5 sm:py-3 font-semibold text-xs sm:text-sm whitespace-nowrap transition-all duration-300 border-b-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-500'
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    <Icon size={16} className="sm:w-[18px] sm:h-[18px]" />
                    <span className="hidden xs:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {activeTab === 'dashboard' && mockUser && <ProfileDashboard username={mockUser.username} user={mockUser} />}
        {activeTab === 'posts' && <ProfilePosts username={mockUser.username} />}
        {activeTab === 'replies' && <ProfileReplies username={mockUser.username} />}
        {activeTab === 'pages' && <ProfilePages username={mockUser.username} />}
        {activeTab === 'achievements' && <ProfileAchievements userId={mockUser.id} />}
        {activeTab === 'settings' && <ProfileSettings user={mockUser} />}
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={{
          username: mockUser.username,
          pseudo: mockUser.pseudo || undefined,
          avatar: mockUser.avatar,
          avatarUrl: mockUser.avatar,
          coverImageUrl: mockUser.coverImage,
          location: mockUser.location,
          occupation: mockUser.occupation || undefined,
          bio: mockUser.bio,
          skills: mockUser.skills,
          socialLinks: mockUser.socialLinks,
        }}
        onSave={handleSaveProfile}
      />

      {/* Followers/Following Dropdowns */}
      {mockUser && showFollowersDropdown && (
        <FollowersFollowingDropdown
          userId={mockUser.id}
          type="followers"
          count={mockUser.stats.followers}
          isOpen={showFollowersDropdown}
          onClose={() => setShowFollowersDropdown(false)}
          triggerRef={followersRef}
        />
      )}
      {mockUser && showFollowingDropdown && (
        <FollowersFollowingDropdown
          userId={mockUser.id}
          type="following"
          count={mockUser.stats.following}
          isOpen={showFollowingDropdown}
          onClose={() => setShowFollowingDropdown(false)}
          triggerRef={followingRef}
        />
      )}
    </div>
  );
}
