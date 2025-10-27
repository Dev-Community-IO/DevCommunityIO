import { useState } from 'react';
import { ArrowLeft, Users, TrendingUp, MessageSquare, Settings, UserPlus, Bell, BellOff } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Badge } from './Badge';
import { PostFeed } from './PostFeed';
import { mockPosts } from '../data/mockData';
import { Post } from '../types';

interface PageViewProps {
  pageId: string;
  onBack: () => void;
  onPostClick?: (post: Post) => void;
}

type TabType = 'posts' | 'about' | 'members';

export function PageView({ pageId, onBack, onPostClick }: PageViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [isFollowing, setIsFollowing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const pageData = {
    id: pageId,
    name: 'Web3 Developers Hub',
    description: 'Community for Web3 developers to share knowledge and collaborate on cutting-edge blockchain projects. Join us to learn, share, and build the future of decentralized technology.',
    logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=web3dev',
    coverImage: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1200',
    category: 'Development',
    members: 1250,
    posts: 342,
    created: 'January 2024',
    rules: [
      'Be respectful and professional',
      'Stay on topic - Web3 development only',
      'No spam or self-promotion without prior approval',
      'Share knowledge and help others learn',
      'Give credit where credit is due'
    ],
    admins: [
      { id: '1', name: 'Alice Johnson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice', role: 'Founder' },
      { id: '2', name: 'Bob Smith', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob', role: 'Admin' },
    ]
  };

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
  };

  const handleNotificationToggle = () => {
    setNotificationsEnabled(!notificationsEnabled);
  };

  const tabs = [
    { id: 'posts', label: 'Posts', icon: MessageSquare },
    { id: 'about', label: 'About', icon: TrendingUp },
    { id: 'members', label: 'Members', icon: Users }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
      >
        <ArrowLeft size={20} />
        Back to Pages
      </button>

      <GlassCard className="p-0 overflow-hidden">
        {/* Cover Image */}
        <div className="relative h-64 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
          <img
            src={pageData.coverImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />

          {/* Page Logo on top of cover */}
          <div className="absolute bottom-0 left-6 md:left-8 translate-y-1/2 z-20">
            <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-white dark:border-gray-900 bg-white dark:bg-gray-900 flex-shrink-0 shadow-2xl">
              <img
                src={pageData.logo}
                alt={pageData.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Page Header */}
        <div className="px-6 md:px-8 pb-6 pt-20">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            {/* Page Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-bold">{pageData.name}</h1>
                <Badge variant="secondary">{pageData.category}</Badge>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-2xl">
                {pageData.description}
              </p>
              <div className="flex items-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users size={18} className="text-gray-400" />
                  <span className="font-bold text-lg">{pageData.members.toLocaleString()}</span>
                  <span className="text-gray-500 dark:text-gray-400">members</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare size={18} className="text-gray-400" />
                  <span className="font-bold text-lg">{pageData.posts}</span>
                  <span className="text-gray-500 dark:text-gray-400">posts</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={handleFollowToggle}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl ${
                  isFollowing
                    ? 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                    : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600'
                }`}
              >
                <UserPlus size={20} />
                {isFollowing ? 'Following' : 'Follow'}
              </button>

              <button
                onClick={handleNotificationToggle}
                className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
              >
                {notificationsEnabled ? <Bell size={20} /> : <BellOff size={20} />}
              </button>

              <button className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">
                <Settings size={20} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-8 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all border-b-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-500'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </GlassCard>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {activeTab === 'posts' && (
          <PostFeed
            posts={mockPosts}
            onPostClick={onPostClick || (() => {})}
          />
        )}

        {activeTab === 'about' && (
          <GlassCard className="p-6 md:p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-3">About</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {pageData.description}
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-3">Page Rules</h2>
              <ul className="space-y-2">
                {pageData.rules.map((rule, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">
                      {index + 1}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">Admins & Moderators</h2>
              <div className="space-y-3">
                {pageData.admins.map(admin => (
                  <div key={admin.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <img
                      src={admin.avatar}
                      alt={admin.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <p className="font-semibold">{admin.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{admin.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Created</p>
                  <p className="font-semibold mt-1">{pageData.created}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Category</p>
                  <p className="font-semibold mt-1">{pageData.category}</p>
                </div>
              </div>
            </div>
          </GlassCard>
        )}

        {activeTab === 'members' && (
          <GlassCard className="p-6 md:p-8">
            <h2 className="text-xl font-bold mb-4">Members ({pageData.members.toLocaleString()})</h2>
            <p className="text-gray-600 dark:text-gray-400">Member list coming soon...</p>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
