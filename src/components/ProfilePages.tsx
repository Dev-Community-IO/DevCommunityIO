import { useState } from 'react';
import { Plus, Users, Settings, BarChart3, Edit3, Trash2, UserPlus, Crown, Shield, ArrowLeft, Upload, Camera, Layout, FileText } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { PostFeed } from './PostFeed';

interface ProfilePagesProps {
  userId: string;
}

type ViewMode = 'list' | 'manage' | 'create';

export function ProfilePages({ userId }: ProfilePagesProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'posts' | 'overview' | 'members' | 'settings'>('dashboard');

  const mockPages = [
    {
      id: '1',
      name: 'Web3 Developers Hub',
      description: 'Community for Web3 developers to share knowledge and collaborate',
      avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=web3dev',
      coverImage: '',
      members: 1250,
      role: 'Owner',
      posts: 342,
      created: 'Jan 2024',
      category: 'Development'
    },
    {
      id: '2',
      name: 'DeFi Research Group',
      description: 'Deep dive into DeFi protocols and mechanisms',
      avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=defi',
      coverImage: '',
      members: 856,
      role: 'Admin',
      posts: 189,
      created: 'Mar 2024',
      category: 'DeFi'
    },
    {
      id: '3',
      name: 'Smart Contract Auditors',
      description: 'Professional network for smart contract security experts',
      avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=audit',
      coverImage: '',
      members: 423,
      role: 'Moderator',
      posts: 267,
      created: 'May 2024',
      category: 'Development'
    }
  ];

  const mockMembers = [
    { id: '1', name: 'Alice Johnson', role: 'Admin', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice', joined: '2 months ago' },
    { id: '2', name: 'Bob Smith', role: 'Moderator', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob', joined: '1 month ago' },
    { id: '3', name: 'Carol White', role: 'Member', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carol', joined: '3 weeks ago' },
    { id: '4', name: 'David Brown', role: 'Member', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David', joined: '1 week ago' },
  ];

  const selectedPage = mockPages.find(p => p.id === selectedPageId);

  const handleManagePage = (pageId: string) => {
    setSelectedPageId(pageId);
    setViewMode('manage');
    setActiveTab('overview');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedPageId(null);
  };

  // List View
  if (viewMode === 'list') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Your Pages</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage pages you own or moderate</p>
          </div>
          <button
            onClick={() => setViewMode('create')}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Plus size={20} />
            Create Page
          </button>
        </div>

        {/* Pages Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {mockPages.map(page => (
            <GlassCard key={page.id} className="p-6 hover:scale-[1.02] transition-all duration-300">
              <div className="space-y-4">
                {/* Page Header */}
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex-shrink-0">
                    <img src={page.avatar} alt={page.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold hover:text-blue-500 cursor-pointer transition-colors">
                          {page.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {page.description}
                        </p>
                      </div>
                      <Badge
                        variant={page.role === 'Owner' ? 'gradient' : 'secondary'}
                        className="flex items-center gap-1"
                      >
                        {page.role === 'Owner' && <Crown size={12} />}
                        {page.role === 'Admin' && <Shield size={12} />}
                        {page.role}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Page Stats */}
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-gray-400" />
                    <span className="font-semibold">{page.members}</span>
                    <span className="text-gray-500 dark:text-gray-400">members</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart3 size={16} className="text-gray-400" />
                    <span className="font-semibold">{page.posts}</span>
                    <span className="text-gray-500 dark:text-gray-400">posts</span>
                  </div>
                  <div className="text-gray-500 dark:text-gray-400">
                    Created {page.created}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleManagePage(page.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 font-medium"
                  >
                    <Settings size={16} />
                    Manage
                  </button>
                  <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300">
                    <UserPlus size={16} />
                  </button>
                  <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300">
                    <BarChart3 size={16} />
                  </button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    );
  }

  // Create Page View
  if (viewMode === 'create') {
    return (
      <div className="space-y-6">
        <button
          onClick={handleBackToList}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Pages
        </button>

        <GlassCard className="p-8">
          <h2 className="text-2xl font-bold mb-6">Create New Page</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Page Name *</label>
              <input
                type="text"
                placeholder="Enter page name..."
                className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Description *</label>
              <textarea
                placeholder="Describe your page..."
                rows={4}
                className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Category</label>
              <select className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none">
                <option>Development</option>
                <option>DeFi</option>
                <option>NFTs</option>
                <option>DAOs</option>
                <option>Other</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl">
                Create Page
              </button>
              <button
                onClick={handleBackToList}
                className="px-6 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-xl font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  // Manage Page View
  if (viewMode === 'manage' && selectedPage) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Header */}
        <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 border-b border-gray-200 dark:border-gray-800 px-4 py-3">
          <button
            onClick={handleBackToList}
            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium"
          >
            <ArrowLeft size={20} />
            Back to Pages
          </button>
        </div>

        {/* Cover & Profile Section */}
        <div className="relative">
          {/* Cover Image */}
          <div className="relative h-36 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
            {selectedPage.coverImage && (
              <img src={selectedPage.coverImage} alt="Cover" className="w-full h-full object-cover" />
            )}
          </div>

          {/* Profile Info Card */}
          <div className="px-4 pb-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-4 -mt-12">
              <div className="flex items-start gap-3 mb-4">
                {/* Page Avatar */}
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-white dark:border-gray-900 bg-white dark:bg-gray-800 flex-shrink-0 shadow-lg">
                  <img src={selectedPage.avatar} alt={selectedPage.name} className="w-full h-full object-cover" />
                </div>

                {/* Page Name & Badge */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">{selectedPage.name}</h2>
                    <Badge variant="gradient" className="flex items-center gap-1 flex-shrink-0">
                      {selectedPage.role === 'Owner' && <Crown size={12} />}
                      {selectedPage.role === 'Admin' && <Shield size={12} />}
                      <span className="text-xs">{selectedPage.role}</span>
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{selectedPage.description}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <Users size={16} className="text-gray-400" />
                  <span className="font-bold text-gray-900 dark:text-white">{selectedPage.members}</span>
                  <span className="text-gray-500 dark:text-gray-400">members</span>
                </div>
                <div className="w-px h-4 bg-gray-300 dark:bg-gray-700"></div>
                <div className="flex items-center gap-1.5">
                  <BarChart3 size={16} className="text-gray-400" />
                  <span className="font-bold text-gray-900 dark:text-white">{selectedPage.posts}</span>
                  <span className="text-gray-500 dark:text-gray-400">posts</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="sticky top-[57px] z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-2">
          <div className="flex gap-1 overflow-x-auto hide-scrollbar">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm whitespace-nowrap transition-all border-b-2 ${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-500'
                  : 'border-transparent text-gray-600 dark:text-gray-400'
              }`}
            >
              <Layout size={18} />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm whitespace-nowrap transition-all border-b-2 ${
                activeTab === 'posts'
                  ? 'border-blue-500 text-blue-500'
                  : 'border-transparent text-gray-600 dark:text-gray-400'
              }`}
            >
              <FileText size={18} />
              Posts
            </button>
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-3 font-semibold text-sm whitespace-nowrap transition-all border-b-2 ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-500'
                  : 'border-transparent text-gray-600 dark:text-gray-400'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`px-4 py-3 font-semibold text-sm whitespace-nowrap transition-all border-b-2 ${
                activeTab === 'members'
                  ? 'border-blue-500 text-blue-500'
                  : 'border-transparent text-gray-600 dark:text-gray-400'
              }`}
            >
              Members
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-3 font-semibold text-sm whitespace-nowrap transition-all border-b-2 ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-500'
                  : 'border-transparent text-gray-600 dark:text-gray-400'
              }`}
            >
              Settings
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 pb-8">

            {/* Tab Content */}
            {activeTab === 'dashboard' && (
              <div className="space-y-4">
                {/* Stats Cards */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">Total Members</p>
                    <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                      <Users size={20} className="text-white" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{selectedPage.members}</p>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">Total Posts</p>
                    <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                      <BarChart3 size={20} className="text-white" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{selectedPage.posts}</p>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">Category</p>
                    <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-teal-500">
                      <Settings size={20} className="text-white" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedPage.category}</p>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-800">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3">Recent Activity</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Activity feed coming soon...</p>
                </div>
              </div>
            )}

            {activeTab === 'posts' && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-800 text-center">
                <FileText size={48} className="mx-auto text-gray-300 dark:text-gray-700 mb-3" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">Posts for this page will appear here</p>
              </div>
            )}

            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">Total Members</p>
                    <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                      <Users size={20} className="text-white" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{selectedPage.members}</p>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">Total Posts</p>
                    <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                      <BarChart3 size={20} className="text-white" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{selectedPage.posts}</p>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">Category</p>
                    <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-teal-500">
                      <Settings size={20} className="text-white" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedPage.category}</p>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-800">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3">Recent Activity</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Activity feed coming soon...</p>
                </div>
              </div>
            )}

            {activeTab === 'members' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Team Members</h3>
                  <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all font-semibold shadow-lg text-sm">
                    <UserPlus size={18} />
                    Add
                  </button>
                </div>

                {mockMembers.map(member => (
                  <div key={member.id} className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar src={member.avatar} alt={member.name} size="md" className="w-12 h-12" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 dark:text-white truncate">{member.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Joined {member.joined}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select className="flex-1 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 outline-none text-sm font-medium">
                        <option value="admin">Admin</option>
                        <option value="moderator">Moderator</option>
                        <option value="member">Member</option>
                      </select>
                      <button className="p-2.5 text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-4">
                {/* Cover Image */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-800">
                  <label className="block text-sm font-bold mb-3 text-gray-900 dark:text-white">Cover Image</label>
                  <div className="relative h-32 rounded-xl overflow-hidden bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
                    {selectedPage.coverImage && (
                      <img src={selectedPage.coverImage} alt="Cover preview" className="w-full h-full object-cover" />
                    )}
                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 cursor-pointer transition-colors">
                      <div className="text-center text-white">
                        <Camera size={28} className="mx-auto mb-2" />
                        <span className="text-sm font-semibold">Change Cover</span>
                      </div>
                      <input type="file" accept="image/*" className="hidden" />
                    </label>
                  </div>
                </div>

                {/* Avatar */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-800">
                  <label className="block text-sm font-bold mb-3 text-gray-900 dark:text-white">Page Avatar</label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex-shrink-0">
                      <img src={selectedPage.avatar} alt={selectedPage.name} className="w-full h-full object-cover" />
                    </div>
                    <label className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl font-semibold cursor-pointer transition-colors flex items-center justify-center gap-2 text-sm">
                      <Upload size={18} />
                      Upload
                      <input type="file" accept="image/*" className="hidden" />
                    </label>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-800">
                  <label className="block text-sm font-bold mb-2 text-gray-900 dark:text-white">Page Name</label>
                  <input
                    type="text"
                    defaultValue={selectedPage.name}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none text-base"
                  />
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-800">
                  <label className="block text-sm font-bold mb-2 text-gray-900 dark:text-white">Description</label>
                  <textarea
                    defaultValue={selectedPage.description}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none resize-none text-base"
                  />
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-800">
                  <label className="block text-sm font-bold mb-2 text-gray-900 dark:text-white">Category</label>
                  <select
                    defaultValue={selectedPage.category}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none text-base"
                  >
                    <option>Development</option>
                    <option>DeFi</option>
                    <option>NFTs</option>
                    <option>DAOs</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <button className="flex-1 px-6 py-3.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-bold hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg">
                    Save
                  </button>
                  <button className="px-6 py-3.5 border-2 border-gray-300 dark:border-gray-700 rounded-xl font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-gray-700 dark:text-gray-300">
                    Cancel
                  </button>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-4 border-2 border-red-200 dark:border-red-900">
                  <h3 className="text-base font-bold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
                    <Shield size={18} />
                    Danger Zone
                  </h3>
                  <p className="text-sm text-red-600 dark:text-red-400 mb-3">
                    Once you delete a page, there is no going back.
                  </p>
                  <button className="w-full px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all shadow-lg">
                    Delete Page
                  </button>
                </div>
              </div>
            )}
        </div>
      </div>
    );
  }

  return null;
}
