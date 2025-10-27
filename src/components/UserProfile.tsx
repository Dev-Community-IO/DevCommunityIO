import { useState } from 'react';
import { Edit3, Briefcase, Star, MapPin, Calendar, TrendingUp, MessageSquare, FileText, Settings as SettingsIcon, Award } from 'lucide-react';
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

interface UserProfileProps {
  onBack?: () => void;
}

type TabType = 'dashboard' | 'posts' | 'replies' | 'pages' | 'achievements' | 'settings';

export function UserProfile({ onBack }: UserProfileProps) {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isFollowing, setIsFollowing] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const isOwnProfile = true;

  const [mockUser, setMockUser] = useState({
    id: '1',
    username: 'Emma Smith',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    coverImage: '',
    walletAddress: '0x742d...35a8',
    reputation: 2450,
    isVerified: true,
    role: 'Software Engineer',
    location: 'Los Angeles, California',
    joinedDate: 'January 2024',
    bio: 'Passionate about blockchain technology and decentralized systems. Building the future of Web3.',
    skills: ['HTML', 'CSS', 'Dart', 'C++', 'UI Design', 'React', 'TypeScript', 'Solidity'],
    stats: {
      posts: 142,
      replies: 589,
      upvotes: 3420,
      followers: 1250,
      following: 387
    }
  });

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
  };

  const handleSaveProfile = (updatedUser: any) => {
    setMockUser({ ...mockUser, ...updatedUser });
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'posts', label: 'Posts', icon: FileText },
    { id: 'replies', label: 'Replies', icon: MessageSquare },
    { id: 'pages', label: 'Pages', icon: Briefcase },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'settings', label: 'Settings', icon: SettingsIcon }
  ];

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
                    <h1 className="text-2xl sm:text-3xl font-bold">{mockUser.username}</h1>
                    <p className="text-gray-600 dark:text-gray-400 flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 text-sm sm:text-base">
                      <Briefcase size={14} className="sm:w-4 sm:h-4" />
                      {mockUser.role}
                    </p>
                    <p className="text-gray-500 dark:text-gray-500 flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 text-xs sm:text-sm">
                      <MapPin size={12} className="sm:w-3.5 sm:h-3.5" />
                      {mockUser.location}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Button - Only for guests */}
              {!isOwnProfile && (
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
                  <span className="font-bold text-lg sm:text-xl">{mockUser.stats.upvotes}</span>
                  <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Upvotes</span>
                </div>
                <div className="flex flex-col sm:flex-row items-center sm:items-center gap-0.5 sm:gap-2">
                  <span className="font-bold text-lg sm:text-xl">{mockUser.stats.followers}</span>
                  <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Followers</span>
                </div>
                <div className="flex flex-col sm:flex-row items-center sm:items-center gap-0.5 sm:gap-2">
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
                  <p className="font-semibold text-sm sm:text-base">{mockUser.role}</p>
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
                    <Badge key={skill} variant="secondary" className="px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm">
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
                    onClick={() => setActiveTab(tab.id as TabType)}
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
        {activeTab === 'dashboard' && <ProfileDashboard user={mockUser} />}
        {activeTab === 'posts' && <ProfilePosts userId={mockUser.id} />}
        {activeTab === 'replies' && <ProfileReplies userId={mockUser.id} />}
        {activeTab === 'pages' && <ProfilePages userId={mockUser.id} />}
        {activeTab === 'achievements' && <ProfileAchievements userId={mockUser.id} />}
        {activeTab === 'settings' && <ProfileSettings user={mockUser} />}
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={mockUser}
        onSave={handleSaveProfile}
      />
    </div>
  );
}
