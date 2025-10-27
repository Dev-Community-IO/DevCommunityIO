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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 animate-fade-in">
      {/* Fixed Header with Back Button */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 border-b border-gray-200 dark:border-gray-800 px-4 py-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium"
        >
          <ArrowLeft size={20} />
          Back to Pages
        </button>
      </div>

      {/* Cover & Profile Section */}
      <div className="relative z-30">
        {/* Cover Image */}
        <div className="relative h-48 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 overflow-hidden">
          <img
            src={pageData.coverImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Profile Card */}
        <div className="px-4 pb-4 -mt-16 relative z-40">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-4">
            {/* Logo and Name */}
            <div className="flex items-start gap-3 mb-4">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-white dark:border-gray-900 bg-white dark:bg-gray-800 flex-shrink-0 shadow-lg">
                <img
                  src={pageData.logo}
                  alt={pageData.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1 truncate">{pageData.name}</h1>
                <Badge variant="secondary" className="text-xs">{pageData.category}</Badge>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 mb-4 text-sm">
              <div className="flex items-center gap-1.5">
                <Users size={16} className="text-gray-400" />
                <span className="font-bold text-gray-900 dark:text-white">{pageData.members.toLocaleString()}</span>
                <span className="text-gray-500 dark:text-gray-400">members</span>
              </div>
              <div className="w-px h-4 bg-gray-300 dark:bg-gray-700"></div>
              <div className="flex items-center gap-1.5">
                <MessageSquare size={16} className="text-gray-400" />
                <span className="font-bold text-gray-900 dark:text-white">{pageData.posts}</span>
                <span className="text-gray-500 dark:text-gray-400">posts</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              {pageData.description}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleFollowToggle}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all shadow-lg text-sm ${
                  isFollowing
                    ? 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                    : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600'
                }`}
              >
                <UserPlus size={18} />
                {isFollowing ? 'Following' : 'Follow'}
              </button>

              <button
                onClick={handleNotificationToggle}
                className={`p-2.5 rounded-xl transition-all ${
                  notificationsEnabled
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {notificationsEnabled ? <Bell size={20} /> : <BellOff size={20} />}
              </button>

              <button className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all text-gray-700 dark:text-gray-300">
                <Settings size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-[57px] z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-2">
        <div className="flex gap-1 overflow-x-auto hide-scrollbar">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm whitespace-nowrap transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-500'
                    : 'border-transparent text-gray-600 dark:text-gray-400'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pb-8">

        {activeTab === 'posts' && (
          <PostFeed
            posts={mockPosts}
            onPostClick={onPostClick || (() => {})}
          />
        )}

        {activeTab === 'about' && (
          <div className="space-y-4">
            {/* About Section */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-4">
              <h2 className="text-base font-bold mb-2 text-gray-900 dark:text-white">About</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {pageData.description}
              </p>
            </div>

            {/* Page Rules */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-4">
              <h2 className="text-base font-bold mb-3 text-gray-900 dark:text-white">Page Rules</h2>
              <ul className="space-y-3">
                {pageData.rules.map((rule, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-xs flex items-center justify-center font-bold">
                      {index + 1}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Admins & Moderators */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-4">
              <h2 className="text-base font-bold mb-3 text-gray-900 dark:text-white">Admins & Moderators</h2>
              <div className="space-y-3">
                {pageData.admins.map(admin => (
                  <div key={admin.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <img
                      src={admin.avatar}
                      alt={admin.name}
                      className="w-12 h-12 rounded-full flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 dark:text-white truncate">{admin.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{admin.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Meta Info */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Created</p>
                  <p className="font-bold text-gray-900 dark:text-white">{pageData.created}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Category</p>
                  <p className="font-bold text-gray-900 dark:text-white">{pageData.category}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-8 text-center">
            <Users size={48} className="mx-auto text-gray-300 dark:text-gray-700 mb-3" />
            <h2 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
              {pageData.members.toLocaleString()} Members
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Member list coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}
