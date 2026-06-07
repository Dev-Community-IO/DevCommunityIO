import { useState, useEffect, useRef } from 'react';
import { Edit3, Building2, Briefcase, MapPin, Calendar, MessageSquare, FileText, Settings as SettingsIcon, Award, LogIn, UserPlus, Share2, Mail, LayoutGrid } from 'lucide-react';
import { SocialLinks } from './SocialLinks';
import { GlassCard } from './GlassCard';
import { Avatar } from './Avatar';
import { resolveUserAvatarUrl } from '../utils/defaultAvatar';
import { Badge } from './Badge';
import { VerifiedBadge } from './VerifiedBadge';
import { TrustedBadge } from './TrustedBadge';
import { ProfileDashboard } from './ProfileDashboard';
import { ProfilePublicOverview } from './ProfilePublicOverview';
import { ProfilePosts } from './ProfilePosts';
import { ProfileReplies } from './ProfileReplies';
import { ProfilePages } from './ProfilePages';
import { ProfileAchievements } from './ProfileAchievements';
import { ProfileSettings } from './ProfileSettings';
import { EditProfileModal } from './EditProfileModal';
import { ProfileHeaderSkeleton } from './skeletons';
import { FollowersFollowingDropdown } from './FollowersFollowingDropdown';
import { ShareDropdown } from './ShareDropdown';
import { useAuth } from '../contexts/AuthContext';
import usersService from '../services/api/users.service';
import { BioText } from './BioText';
import { TabPills } from './TabPills';

interface UserProfileProps {
  username?: string;
  onBack?: () => void;
  onOpenLoginModal?: () => void;
  activeTab?: string;
  onTabChange?: (tab: TabType) => void;
}

type TabType = 'dashboard' | 'posts' | 'replies' | 'pages' | 'achievements' | 'settings';

export function UserProfile({ username, onBack, onOpenLoginModal, activeTab: propActiveTab, onTabChange }: UserProfileProps) {
  const { isAuthenticated, user: authUser, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>((propActiveTab || 'posts') as TabType);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (propActiveTab) {
      setActiveTab(propActiveTab as TabType);
    }
  }, [propActiveTab]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [profileUser, setProfileUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userNotFound, setUserNotFound] = useState(false);
  const [showFollowersDropdown, setShowFollowersDropdown] = useState(false);
  const [showFollowingDropdown, setShowFollowingDropdown] = useState(false);
  const followersRef = useRef<HTMLDivElement>(null);
  const followingRef = useRef<HTMLDivElement>(null);
  
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
    isTrusted?: boolean;
    role: string;
    occupation?: string | null;
    location: string;
    email?: string | null;
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
    
    // Update auth context with new username and user data
    updateUser({
      username: updatedUser.username || mockUser.username,
      pseudo: updatedUser.pseudo,
      avatar: updatedUser.avatarUrl || updatedUser.avatar,
      avatarUrl: updatedUser.avatarUrl || updatedUser.avatar,
      coverImage: updatedUser.coverImageUrl || updatedUser.coverImage,
      coverImageUrl: updatedUser.coverImageUrl || updatedUser.coverImage,
      bio: updatedUser.bio,
      location: updatedUser.location,
      skills: updatedUser.skills,
      socialLinks: updatedUser.socialLinks,
    });
    
    // Update mockUser with new data
    const newUsername = updatedUser.username || mockUser.username;
    setMockUser({ ...mockUser, ...updatedUser });
    
    // Use the new username if it changed, otherwise use viewingUsername
    const usernameToFetch = newUsername !== mockUser.username ? newUsername : viewingUsername;
    
    if (usernameToFetch) {
      usersService.getUserByUsername(usernameToFetch).then(userData => {
        setProfileUser(userData);
        usersService.getUserStats(usernameToFetch, { period: 'all' }).then(stats => {
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
              isTrusted: userData.isTrusted || false,
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
          
          // Update auth context again with complete user data
          updateUser({
            username: userData.username,
            pseudo: userData.pseudo || undefined,
            avatar: userData.avatarUrl || undefined,
            avatarUrl: userData.avatarUrl || undefined,
            coverImage: userData.coverImageUrl || undefined,
            coverImageUrl: userData.coverImageUrl || undefined,
            bio: userData.bio || undefined,
            location: userData.location || undefined,
            skills: userData.skills || undefined,
            socialLinks: userData.socialLinks || undefined,
            reputation: userData.reputation,
            isVerified: userData.isVerified,
            isTrusted: userData.isTrusted || false,
            role: userData.role as 'user' | 'moderator' | 'admin' | 'super_admin',
          });
        }).catch(error => {
          console.error('Failed to fetch user stats:', error);
        });
      }).catch(error => {
        console.error('Failed to fetch user data:', error);
      });
    }
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!viewingUsername) {
        setLoading(false);
        return;
      }

      // Reset edit modal when username changes
      setIsEditModalOpen(false);

      try {
        setLoading(true);
        
        const userData = await usersService.getUserByUsername(viewingUsername);
        setProfileUser(userData);
        
        let stats: Awaited<ReturnType<typeof usersService.getUserStats>> | null = null;
        try {
          stats = await usersService.getUserStats(viewingUsername, { period: 'all' });
        } catch (statsError) {
          console.error('Failed to fetch user stats:', statsError);
        }

        const normalizedStats = {
          posts: stats
            ? typeof stats.posts === 'object'
              ? (stats.posts as { total?: number }).total || 0
              : Number(stats.posts || 0)
            : 0,
          replies: stats
            ? typeof stats.replies === 'object'
              ? (stats.replies as { total?: number }).total || 0
              : Number(stats.replies || 0)
            : 0,
          upvotes: stats
            ? typeof stats.upvotes === 'object'
              ? (stats.upvotes as { total?: number }).total || 0
              : Number(stats.upvotes || 0)
            : 0,
          followers: stats
            ? typeof stats.followers === 'object'
              ? (stats.followers as { total?: number }).total || 0
              : Number(stats.followers || 0)
            : 0,
          following: stats
            ? typeof stats.following === 'object'
              ? (stats.following as { total?: number }).total || 0
              : Number(stats.following || 0)
            : 0,
        };
        
        setMockUser({
          id: userData.id,
          username: userData.username,
          pseudo: userData.pseudo || null,
          avatar: resolveUserAvatarUrl(userData.avatarUrl, userData.username),
          coverImage: userData.coverImageUrl || '',
          walletAddress: '',
          reputation: userData.reputation,
          isVerified: userData.isVerified,
          isTrusted: userData.isTrusted || false,
          role: userData.role,
          occupation: userData.occupation || null,
          location: userData.location ?? '',
          email: userData.email || null, // Include email if privacy allows
          joinedDate: new Date(userData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          bio: userData.bio || 'No bio yet.',
          skills: (userData.skills || []) as string[],
          socialLinks: (userData.socialLinks || {}) as Record<string, string>,
          stats: normalizedStats
        });

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

  const handleFollowToggle = async () => {
    if (!profileUser) return;
    
    if (!isAuthenticated) {
      onOpenLoginModal?.();
      return;
    }
    
    try {
      if (isFollowing) {
        await usersService.unfollowUser(profileUser.id);
        setIsFollowing(false);
        
        setMockUser(prev => {
          if (!prev) return null;
          return {
            ...prev,
            stats: {
              ...prev.stats,
              followers: Math.max(0, prev.stats.followers - 1)
            }
          };
        });
      } else {
        await usersService.followUser(profileUser.id);
        setIsFollowing(true);
        
        setMockUser(prev => {
          if (!prev) return null;
          return {
            ...prev,
            stats: {
              ...prev.stats,
              followers: prev.stats.followers + 1
            }
          };
        });
      }
    } catch (error: any) {
      console.error('Failed to toggle follow:', error);
      // Revert optimistic update on error
      setIsFollowing(!isFollowing);
      alert(error?.message || 'Failed to update follow status');
    }
  };

  const allTabs = [
    { id: 'dashboard', label: 'Overview', icon: LayoutGrid, requiresAuth: false, requiresOwn: false },
    { id: 'posts', label: 'Posts', icon: FileText, requiresAuth: false, requiresOwn: false },
    { id: 'replies', label: 'Replies', icon: MessageSquare, requiresAuth: false, requiresOwn: false },
    { id: 'pages', label: 'Pages', icon: Building2, requiresAuth: false, requiresOwn: false },
    { id: 'achievements', label: 'Achievements', icon: Award, requiresAuth: false, requiresOwn: false },
    { id: 'settings', label: 'Settings', icon: SettingsIcon, requiresAuth: true, requiresOwn: true },
  ];

  const tabs = allTabs.filter(tab => {
    if (tab.requiresOwn && !isOwnProfile) return false;
    if (tab.requiresAuth && !isAuthenticated) return false;
    return true;
  });

  // Settings is owner-only; redirect if opened via URL
  useEffect(() => {
    if (!isOwnProfile && activeTab === 'settings') {
      setActiveTab('posts');
      onTabChange?.('posts');
    }
  }, [isOwnProfile, activeTab, onTabChange]);

  if (loading || !mockUser) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ProfileHeaderSkeleton />
        </div>
      </div>
    );
  }

  if (userNotFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-transparent">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
            <UserPlus size={40} className="text-red-500" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">User Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The user <span className="font-semibold">@{viewingUsername}</span> does not exist.
          </p>
          {onBack && (
            <button
              onClick={onBack}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-all"
            >
              Go Back
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-transparent pb-20 sm:pb-24">
      {/* Hero Section - Mobile Optimized */}
      <div className="relative">
        {/* Cover Image - Responsive Height */}
        <div className="relative h-28 sm:h-36 md:h-44 lg:h-52 overflow-hidden">
          {mockUser.coverImage ? (
            <>
              <img 
                src={mockUser.coverImage} 
                alt="Cover" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20"></div>
            </>
          ) : (
            <div className="w-full h-full bg-gray-200 dark:bg-gray-800"></div>
          )}
          
          {/* Edit Cover Button - Mobile Optimized */}
          {isOwnProfile && (
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-95 transition-all touch-manipulation"
            >
              <Edit3 size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="text-xs sm:text-sm hidden xs:inline">Edit Profile</span>
            </button>
          )}
        </div>

        {/* Profile Card - Mobile Optimized */}
        <div className="relative z-10 px-4 sm:px-6 md:px-8 -mt-8 sm:-mt-9 md:-mt-10">
          <div className="max-w-7xl mx-auto">
            <GlassCard className="p-3 sm:p-4 md:p-5">
              <div className="flex flex-col gap-3">
                {/* Identity row */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
                  <div className="relative mx-auto shrink-0 sm:mx-0">
                    <Avatar
                      src={mockUser.avatar}
                      alt={mockUser.username}
                      size="lg"
                      className="h-14 w-14 ring-2 ring-white dark:ring-zinc-900 sm:h-16 sm:w-16"
                    />
                  </div>

                  <div className="min-w-0 flex-1 text-left">
                    <div className="mb-2 flex w-full flex-row items-center justify-between gap-2">
                      <div className="flex min-w-0 flex-1 items-center justify-start gap-1.5">
                        {mockUser.pseudo ? (
                          <>
                            <h1 className="truncate text-lg font-semibold text-zinc-900 dark:text-zinc-50 sm:text-xl">
                              {mockUser.pseudo}
                            </h1>
                            <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">@{mockUser.username}</p>
                          </>
                        ) : (
                          <h1 className="truncate text-lg font-semibold text-zinc-900 dark:text-zinc-50 sm:text-xl">
                            {mockUser.username}
                          </h1>
                        )}
                        {mockUser.isVerified && (
                          <VerifiedBadge size={16} className="h-4 w-4 shrink-0" />
                        )}
                        {mockUser.isTrusted && (
                          <TrustedBadge size={14} className="shrink-0" />
                        )}
                      </div>

                      <div className="flex shrink-0 items-center justify-end gap-1.5">
                        {!isAuthenticated ? (
                          <button
                            type="button"
                            onClick={() => onOpenLoginModal?.()}
                            className="inline-flex h-8 max-w-[11rem] items-center gap-1.5 rounded-md bg-zinc-900 px-3 text-xs font-medium text-white shadow-sm ring-1 ring-zinc-900/10 transition-all hover:bg-zinc-800 active:scale-[0.98] dark:bg-zinc-100 dark:text-zinc-900 dark:ring-white/20 dark:hover:bg-white touch-manipulation sm:max-w-none sm:px-3.5"
                          >
                            <LogIn size={14} className="shrink-0 opacity-90" strokeWidth={2.25} />
                            <span className="truncate">Connect to Follow</span>
                          </button>
                        ) : !isOwnProfile ? (
                          <>
                            <button
                              type="button"
                              onClick={handleFollowToggle}
                              className={`inline-flex h-8 min-w-[5.25rem] items-center justify-center gap-1.5 rounded-md px-3 text-xs font-medium transition-all active:scale-[0.98] touch-manipulation sm:min-w-[5.5rem] sm:px-3.5 ${
                                isFollowing
                                  ? 'border border-zinc-200/90 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:border-white/15 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/10'
                                  : 'bg-zinc-900 text-white shadow-sm ring-1 ring-zinc-900/10 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:ring-white/20 dark:hover:bg-white'
                              }`}
                            >
                              <UserPlus size={14} className="shrink-0" strokeWidth={2.25} />
                              <span>{isFollowing ? 'Following' : 'Follow'}</span>
                            </button>
                            <ShareDropdown
                              url={window.location.href}
                              title={`${mockUser.pseudo || mockUser.username} - DevCommunity`}
                              type="post"
                              description={mockUser.bio || ''}
                              trigger={
                                <button
                                  type="button"
                                  aria-label="Share profile"
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200/90 bg-white text-zinc-600 transition-all hover:bg-zinc-50 hover:text-zinc-900 active:scale-[0.98] dark:border-white/15 dark:bg-white/5 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-zinc-100 touch-manipulation"
                                >
                                  <Share2 size={15} strokeWidth={2} />
                                </button>
                              }
                            />
                          </>
                        ) : null}
                      </div>
                    </div>

                    {/* Meta + stats */}
                    <div className="mb-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-zinc-500 dark:text-zinc-400 sm:text-xs">
                        {mockUser.occupation && (
                          <span className="inline-flex max-w-[12rem] items-center gap-1 truncate sm:max-w-none">
                            <Briefcase size={12} className="shrink-0" />
                            {mockUser.occupation}
                          </span>
                        )}
                        {mockUser.location && (
                          <span className="inline-flex max-w-[12rem] items-center gap-1 truncate sm:max-w-none">
                            <MapPin size={12} className="shrink-0" />
                            {mockUser.location}
                          </span>
                        )}
                        {mockUser.email && (
                          <a
                            href={`mailto:${mockUser.email}`}
                            className="inline-flex max-w-[12rem] items-center gap-1 truncate hover:text-blue-600 dark:hover:text-blue-400 sm:max-w-none"
                          >
                            <Mail size={12} className="shrink-0" />
                            {mockUser.email}
                          </a>
                        )}
                        <span className="inline-flex items-center gap-1 whitespace-nowrap">
                          <Calendar size={12} className="shrink-0" />
                          Joined {mockUser.joinedDate}
                        </span>
                    </div>

                    <div className="mb-2 flex flex-wrap items-center gap-x-0.5 gap-y-0.5">
                      {[
                        { label: 'Posts', value: mockUser.stats.posts },
                        { label: 'Replies', value: mockUser.stats.replies },
                        { label: 'Rep', value: mockUser.reputation },
                      ].map((stat, index) => (
                        <span key={stat.label} className="inline-flex items-center">
                          {index > 0 && (
                            <span className="mx-1.5 text-zinc-300 dark:text-zinc-600" aria-hidden>
                              ·
                            </span>
                          )}
                          <span className="inline-flex items-baseline gap-0.5">
                            <span className="text-xs font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
                              {stat.value.toLocaleString()}
                            </span>
                            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">{stat.label}</span>
                          </span>
                        </span>
                      ))}
                      <span className="mx-1.5 text-zinc-300 dark:text-zinc-600" aria-hidden>
                        ·
                      </span>
                      <button
                        type="button"
                        ref={followersRef}
                        onClick={() => setShowFollowersDropdown(true)}
                        className="inline-flex items-baseline gap-0.5 rounded-md px-1 py-0.5 -mx-0.5 text-blue-600 transition-colors hover:bg-blue-500/10 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-500/15 dark:hover:text-blue-300 touch-manipulation"
                      >
                        <span className="text-xs font-semibold tabular-nums">
                          {mockUser.stats.followers.toLocaleString()}
                        </span>
                        <span className="text-[11px] font-medium opacity-90">Followers</span>
                      </button>
                      <span className="mx-1.5 text-zinc-300 dark:text-zinc-600" aria-hidden>
                        ·
                      </span>
                      <button
                        type="button"
                        ref={followingRef}
                        onClick={() => setShowFollowingDropdown(true)}
                        className="inline-flex items-baseline gap-0.5 rounded-md px-1 py-0.5 -mx-0.5 text-violet-600 transition-colors hover:bg-violet-500/10 hover:text-violet-700 dark:text-violet-400 dark:hover:bg-violet-500/15 dark:hover:text-violet-300 touch-manipulation"
                      >
                        <span className="text-xs font-semibold tabular-nums">
                          {mockUser.stats.following.toLocaleString()}
                        </span>
                        <span className="text-[11px] font-medium opacity-90">Following</span>
                      </button>
                    </div>

                    {mockUser.bio && mockUser.bio !== 'No bio yet.' && (
                      <BioText
                        text={mockUser.bio}
                        className="mb-2 max-w-2xl"
                      />
                    )}

                    {mockUser.skills && mockUser.skills.length > 0 && (
                      <div className="mb-1 flex flex-wrap justify-start gap-1">
                        {mockUser.skills.slice(0, 5).map((skill) => (
                          <Badge key={skill} variant="default" className="px-2 py-0.5 text-[10px]">
                            {skill}
                          </Badge>
                        ))}
                        {mockUser.skills.length > 5 && (
                          <Badge variant="default" className="px-2 py-0.5 text-[10px]">
                            +{mockUser.skills.length - 5}
                          </Badge>
                        )}
                      </div>
                    )}

                    <SocialLinks links={mockUser.socialLinks ?? {}} />
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>

      <div className="sticky top-16 sm:top-20 z-30 border-b border-zinc-200/80 bg-gray-50/95 backdrop-blur-md dark:border-white/10 dark:bg-[#060b14]/90">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-2">
          <TabPills
            ariaLabel="Profile sections"
            activeTab={activeTab}
            onChange={(id) => {
              setActiveTab(id as TabType);
              onTabChange?.(id as TabType);
            }}
            tabs={tabs.map((tab) => ({
              id: tab.id,
              label: tab.label,
              icon: tab.icon,
            }))}
          />
        </div>
      </div>

      {/* Tab Content - Mobile Optimized */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 lg:py-10">
        <div className="animate-fade-in">
          {activeTab === 'dashboard' && mockUser && isOwnProfile && (
            <ProfileDashboard username={mockUser.username} user={mockUser} isOwnProfile />
          )}
          {activeTab === 'dashboard' && mockUser && !isOwnProfile && (
            <ProfilePublicOverview
              username={mockUser.username}
              joinedDate={mockUser.joinedDate}
              stats={mockUser.stats}
            />
          )}
          {activeTab === 'posts' && mockUser && <ProfilePosts username={mockUser.username} />}
          {activeTab === 'replies' && mockUser && <ProfileReplies username={mockUser.username} />}
          {activeTab === 'pages' && mockUser && <ProfilePages username={mockUser.username} />}
          {activeTab === 'achievements' && mockUser && <ProfileAchievements username={mockUser.username} isOwnProfile={!!isOwnProfile} />}
          {activeTab === 'settings' && mockUser && <ProfileSettings user={mockUser} />}
        </div>
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
