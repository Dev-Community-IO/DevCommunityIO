import { useState, useEffect, useRef } from 'react';
import { Edit3, Briefcase, MapPin, Calendar, TrendingUp, MessageSquare, FileText, Settings as SettingsIcon, Award, Twitter, Linkedin, Github, LogIn, UserPlus, Share2, Mail } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { VerifiedBadge } from './VerifiedBadge';
import { ProfileDashboard } from './ProfileDashboard';
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
        usersService.getUserStats(usernameToFetch).then(stats => {
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
        
        const stats = await usersService.getUserStats(viewingUsername);
        
        const normalizedStats = {
          posts: typeof stats.posts === 'object' ? (stats.posts as any).total || 0 : Number(stats.posts || 0),
          replies: typeof stats.replies === 'object' ? (stats.replies as any).total || 0 : Number(stats.replies || 0),
          upvotes: typeof stats.upvotes === 'object' ? (stats.upvotes as any).total || 0 : Number(stats.upvotes || 0),
          followers: typeof stats.followers === 'object' ? (stats.followers as any).total || 0 : Number(stats.followers || 0),
          following: typeof stats.following === 'object' ? (stats.following as any).total || 0 : Number(stats.following || 0),
        };
        
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

  if (loading || !mockUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ProfileHeaderSkeleton />
        </div>
      </div>
    );
  }

  if (userNotFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
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
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg shadow-blue-500/25"
            >
              Go Back
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 pb-20 sm:pb-24">
      {/* Hero Section - Mobile Optimized */}
      <div className="relative">
        {/* Cover Image - Responsive Height */}
        <div className="relative h-40 sm:h-56 md:h-72 lg:h-80 overflow-hidden">
          {mockUser.coverImage ? (
            <>
              <img 
                src={mockUser.coverImage} 
                alt="Cover" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500"></div>
          )}
          
          {/* Edit Cover Button - Mobile Optimized */}
          {isOwnProfile && (
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-white dark:hover:bg-gray-800 active:scale-95 transition-all shadow-lg touch-manipulation"
            >
              <Edit3 size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="text-xs sm:text-sm hidden xs:inline">Edit Profile</span>
            </button>
          )}
        </div>

        {/* Profile Card - Mobile Optimized */}
        <div className="relative px-4 sm:px-6 md:px-8 -mt-12 sm:-mt-16 md:-mt-20 z-10">
          <div className="max-w-7xl mx-auto">
            <GlassCard className="p-4 sm:p-6 md:p-8 lg:p-10 shadow-2xl border-2 border-gray-200/50 dark:border-gray-700/50">
              <div className="flex flex-col lg:flex-row lg:items-start gap-5 sm:gap-6 md:gap-8">
                {/* Left Section - Avatar & Basic Info - Mobile Optimized */}
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 md:gap-6 items-center sm:items-start w-full sm:w-auto">
                  {/* Avatar - Responsive Size */}
                  <div className="relative flex-shrink-0">
                    <Avatar
                      src={mockUser.avatar}
                      alt={mockUser.username}
                      size="xl"
                      className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 ring-4 ring-white dark:ring-gray-900 shadow-2xl"
                    />
                  </div>

                  {/* Name & Basic Info - Mobile Optimized */}
                  <div className="flex-1 text-center sm:text-left w-full sm:w-auto min-w-0">
                    <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center sm:justify-start">
                        {mockUser.pseudo ? (
                          <>
                            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white truncate max-w-full">
                              {mockUser.pseudo}
                            </h1>
                            <p className="text-xs sm:text-sm md:text-base text-gray-500 dark:text-gray-400 truncate max-w-full">@{mockUser.username}</p>
                          </>
                        ) : (
                          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white truncate max-w-full">
                            {mockUser.username}
                          </h1>
                        )}
                        {mockUser.isVerified && (
                          <VerifiedBadge size={16} className="sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0" />
                        )}
                      </div>
                    </div>

                    {/* Role & Location - Mobile Optimized */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-center justify-center sm:justify-start gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 text-xs sm:text-sm">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 md:gap-4">
                        {mockUser.occupation && (
                          <div className="flex items-center gap-1.5 sm:gap-2 text-gray-600 dark:text-gray-400">
                            <Briefcase size={14} className="sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0" />
                            <span className="font-medium truncate max-w-[200px] sm:max-w-none">{mockUser.occupation}</span>
                          </div>
                        )}
                        {mockUser.location && (
                          <div className="flex items-center gap-1.5 sm:gap-2 text-gray-600 dark:text-gray-400">
                            <MapPin size={14} className="sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0" />
                            <span className="truncate max-w-[200px] sm:max-w-none">{mockUser.location}</span>
                          </div>
                        )}
                        {mockUser.email && (
                          <div className="flex items-center gap-1.5 sm:gap-2 text-gray-600 dark:text-gray-400">
                            <Mail size={14} className="sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0" />
                            <a 
                              href={`mailto:${mockUser.email}`}
                              className="truncate max-w-[200px] sm:max-w-none hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                              {mockUser.email}
                            </a>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 sm:gap-2 text-gray-600 dark:text-gray-400">
                          <Calendar size={14} className="sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0" />
                          <span className="truncate whitespace-nowrap">Joined {mockUser.joinedDate}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bio - Mobile Optimized */}
                    {mockUser.bio && (
                      <p className="text-xs sm:text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-3 sm:mb-4 max-w-2xl mx-auto sm:mx-0 px-2 sm:px-0">
                        {mockUser.bio}
                      </p>
                    )}

                    {/* Skills - Mobile Optimized */}
                    {mockUser.skills && mockUser.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4 justify-center sm:justify-start">
                        {mockUser.skills.slice(0, 5).map((skill) => (
                          <Badge key={skill} variant="default" className="text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1">
                            {skill}
                          </Badge>
                        ))}
                        {mockUser.skills.length > 5 && (
                          <Badge variant="default" className="text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1">
                            +{mockUser.skills.length - 5}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Social Links - Mobile Optimized */}
                    {mockUser.socialLinks && Object.keys(mockUser.socialLinks).length > 0 && (
                      <div className="flex items-center gap-2 sm:gap-3 justify-center sm:justify-start flex-wrap">
                        {mockUser.socialLinks.twitter && (
                          <a
                            href={`https://twitter.com/${mockUser.socialLinks.twitter}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 sm:p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 active:scale-95 transition-all border border-blue-200 dark:border-blue-800 touch-manipulation"
                            aria-label="Twitter"
                          >
                            <Twitter size={16} className="sm:w-[18px] sm:h-[18px]" />
                          </a>
                        )}
                        {mockUser.socialLinks.linkedin && (
                          <a
                            href={mockUser.socialLinks.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 sm:p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 active:scale-95 transition-all border border-blue-200 dark:border-blue-800 touch-manipulation"
                            aria-label="LinkedIn"
                          >
                            <Linkedin size={16} className="sm:w-[18px] sm:h-[18px]" />
                          </a>
                        )}
                        {mockUser.socialLinks.github && (
                          <a
                            href={`https://github.com/${mockUser.socialLinks.github}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 sm:p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95 transition-all border border-gray-200 dark:border-gray-700 touch-manipulation"
                            aria-label="GitHub"
                          >
                            <Github size={16} className="sm:w-[18px] sm:h-[18px]" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Section - Stats & Actions - Mobile Optimized */}
                <div className="flex-shrink-0 lg:ml-auto w-full lg:w-auto">
                  {/* Stats Grid - Mobile Optimized */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-3 md:gap-4 mb-4 sm:mb-5 md:mb-6">
                    <div className="flex flex-col items-center justify-center p-3 sm:p-3.5 md:p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800 active:scale-95 transition-transform touch-manipulation cursor-pointer min-h-[70px] sm:min-h-[80px]">
                      <p className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400">{mockUser.stats.posts.toLocaleString()}</p>
                      <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mt-1 font-medium">Posts</p>
                    </div>
                    <div className="flex flex-col items-center justify-center p-3 sm:p-3.5 md:p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800 active:scale-95 transition-transform touch-manipulation cursor-pointer min-h-[70px] sm:min-h-[80px]">
                      <p className="text-lg sm:text-xl md:text-2xl font-bold text-purple-600 dark:text-purple-400">{mockUser.stats.replies.toLocaleString()}</p>
                      <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mt-1 font-medium">Replies</p>
                    </div>
                    <div className="flex flex-col items-center justify-center p-3 sm:p-3.5 md:p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800 active:scale-95 transition-transform touch-manipulation cursor-pointer min-h-[70px] sm:min-h-[80px]">
                      <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-600 dark:text-green-400">{mockUser.reputation.toLocaleString()}</p>
                      <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mt-1 font-medium">Rep</p>
                    </div>
                    <div 
                      ref={followersRef}
                      onClick={() => setShowFollowersDropdown(true)}
                      className="flex flex-col items-center justify-center p-3 sm:p-3.5 md:p-4 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200 dark:border-orange-800 cursor-pointer hover:shadow-lg active:scale-95 transition-all touch-manipulation min-h-[70px] sm:min-h-[80px]"
                    >
                      <p className="text-lg sm:text-xl md:text-2xl font-bold text-orange-600 dark:text-orange-400">{mockUser.stats.followers.toLocaleString()}</p>
                      <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mt-1 font-medium">Followers</p>
                    </div>
                    <div 
                      ref={followingRef}
                      onClick={() => setShowFollowingDropdown(true)}
                      className="flex flex-col items-center justify-center p-3 sm:p-3.5 md:p-4 rounded-xl bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 border border-pink-200 dark:border-pink-800 cursor-pointer hover:shadow-lg active:scale-95 transition-all touch-manipulation min-h-[70px] sm:min-h-[80px]"
                    >
                      <p className="text-lg sm:text-xl md:text-2xl font-bold text-pink-600 dark:text-pink-400">{mockUser.stats.following.toLocaleString()}</p>
                      <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mt-1 font-medium">Following</p>
                    </div>
                  </div>

                  {/* Action Buttons - Mobile Optimized */}
                  <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap justify-center lg:justify-end w-full">
                    {!isAuthenticated ? (
                      <button
                        onClick={() => onOpenLoginModal?.()}
                        className="flex items-center justify-center gap-2 px-5 sm:px-6 md:px-8 py-3 sm:py-3.5 rounded-xl font-semibold text-sm sm:text-base transition-all shadow-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 hover:shadow-xl hover:shadow-blue-500/30 active:scale-95 w-full sm:w-auto min-h-[44px] touch-manipulation"
                      >
                        <LogIn size={18} className="sm:w-5 sm:h-5 flex-shrink-0" />
                        <span className="truncate">Connect to Follow</span>
                      </button>
                    ) : !isOwnProfile && (
                      <>
                        <button
                          onClick={handleFollowToggle}
                          className={`flex items-center justify-center gap-2 px-5 sm:px-6 md:px-8 py-3 sm:py-3.5 rounded-xl font-semibold text-sm sm:text-base transition-all shadow-lg active:scale-95 touch-manipulation flex-1 sm:flex-none min-w-[140px] sm:min-w-[160px] min-h-[44px] ${
                            isFollowing
                              ? 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600'
                              : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 hover:shadow-xl hover:shadow-blue-500/30'
                          }`}
                        >
                          <UserPlus size={18} className="sm:w-5 sm:h-5 flex-shrink-0" />
                          <span className="truncate">{isFollowing ? 'Following' : 'Follow'}</span>
                        </button>
                        <ShareDropdown
                          url={window.location.href}
                          title={`${mockUser.pseudo || mockUser.username} - DevCommunity`}
                          type="post"
                          description={mockUser.bio || ''}
                          trigger={
                            <button className="p-3 sm:p-3.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95 transition-all border border-gray-200 dark:border-gray-700 touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center">
                              <Share2 size={18} className="sm:w-5 sm:h-5 text-gray-700 dark:text-gray-300" />
                            </button>
                          }
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>

      {/* Tabs Navigation - Mobile Optimized */}
      <div className="sticky top-16 sm:top-20 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between overflow-x-auto scrollbar-hide pb-1">
            <div className="flex gap-1 sm:gap-2 min-w-0 flex-1">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as TabType);
                      onTabChange?.(tab.id as TabType);
                    }}
                    className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 md:px-6 py-3 sm:py-4 font-semibold text-xs sm:text-sm whitespace-nowrap transition-all relative group active:scale-95 touch-manipulation min-w-fit min-h-[48px] flex-shrink-0 ${
                      isActive
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 active:text-gray-900 dark:active:text-gray-200'
                    }`}
                  >
                    <Icon size={18} className={`sm:w-5 sm:h-5 flex-shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                    <span className="hidden xs:inline">{tab.label}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 sm:h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-t-full"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content - Mobile Optimized */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 lg:py-10">
        <div className="animate-fade-in">
          {activeTab === 'dashboard' && mockUser && <ProfileDashboard username={mockUser.username} user={mockUser} />}
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
