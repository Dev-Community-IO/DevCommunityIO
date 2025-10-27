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
      <div className="space-y-6">
        <button
          onClick={handleBackToList}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Pages
        </button>

        <GlassCard className="p-0 overflow-hidden">
          {/* Page Header with Cover */}
          <div className="relative h-48 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
            {selectedPage.coverImage && (
              <img src={selectedPage.coverImage} alt="Cover" className="w-full h-full object-cover" />
            )}
            {/* Page Logo on top of cover */}
            <div className="absolute bottom-0 left-8 translate-y-1/2">
              <div className="w-32 h-32 rounded-2xl border-4 border-white dark:border-gray-900 bg-white dark:bg-gray-900 overflow-hidden shadow-2xl">
                <img src={selectedPage.avatar} alt={selectedPage.name} className="w-full h-full object-cover" />
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Page Info */}
            <div className="flex items-start gap-6 mb-6">
              <div className="w-32 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-3xl font-bold">{selectedPage.name}</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">{selectedPage.description}</p>
                  </div>
                  <Badge variant="gradient" className="flex items-center gap-1">
                    {selectedPage.role === 'Owner' && <Crown size={12} />}
                    {selectedPage.role === 'Admin' && <Shield size={12} />}
                    {selectedPage.role}
                  </Badge>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-8 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Users size={18} className="text-gray-400" />
                    <span className="font-bold text-lg">{selectedPage.members}</span>
                    <span className="text-gray-500 dark:text-gray-400">members</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart3 size={18} className="text-gray-400" />
                    <span className="font-bold text-lg">{selectedPage.posts}</span>
                    <span className="text-gray-500 dark:text-gray-400">posts</span>
                  </div>
                  <div className="text-gray-500 dark:text-gray-400">
                    Created {selectedPage.created}
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all border-b-2 ${
                  activeTab === 'dashboard'
                    ? 'border-blue-500 text-blue-500'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <Layout size={18} />
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('posts')}
                className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all border-b-2 ${
                  activeTab === 'posts'
                    ? 'border-blue-500 text-blue-500'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <FileText size={18} />
                Posts
              </button>
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-3 font-semibold transition-all border-b-2 ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-500'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('members')}
                className={`px-6 py-3 font-semibold transition-all border-b-2 ${
                  activeTab === 'members'
                    ? 'border-blue-500 text-blue-500'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Members ({mockMembers.length})
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-6 py-3 font-semibold transition-all border-b-2 ${
                  activeTab === 'settings'
                    ? 'border-blue-500 text-blue-500'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Settings
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <GlassCard className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Members</p>
                        <p className="text-3xl font-bold mt-1">{selectedPage.members}</p>
                      </div>
                      <Users size={32} className="text-blue-500" />
                    </div>
                  </GlassCard>

                  <GlassCard className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Posts</p>
                        <p className="text-3xl font-bold mt-1">{selectedPage.posts}</p>
                      </div>
                      <BarChart3 size={32} className="text-purple-500" />
                    </div>
                  </GlassCard>

                  <GlassCard className="p-6 bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Category</p>
                        <p className="text-xl font-bold mt-1">{selectedPage.category}</p>
                      </div>
                      <Settings size={32} className="text-green-500" />
                    </div>
                  </GlassCard>
                </div>

                <GlassCard className="p-6">
                  <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
                  <p className="text-gray-600 dark:text-gray-400">Activity feed coming soon...</p>
                </GlassCard>
              </div>
            )}

            {activeTab === 'posts' && (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <p>Posts for this page will appear here</p>
              </div>
            )}

            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <GlassCard className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Members</p>
                        <p className="text-3xl font-bold mt-1">{selectedPage.members}</p>
                      </div>
                      <Users size={32} className="text-blue-500" />
                    </div>
                  </GlassCard>

                  <GlassCard className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Posts</p>
                        <p className="text-3xl font-bold mt-1">{selectedPage.posts}</p>
                      </div>
                      <BarChart3 size={32} className="text-purple-500" />
                    </div>
                  </GlassCard>

                  <GlassCard className="p-6 bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Category</p>
                        <p className="text-xl font-bold mt-1">{selectedPage.category}</p>
                      </div>
                      <Settings size={32} className="text-green-500" />
                    </div>
                  </GlassCard>
                </div>

                <GlassCard className="p-6">
                  <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
                  <p className="text-gray-600 dark:text-gray-400">Activity feed coming soon...</p>
                </GlassCard>
              </div>
            )}

            {activeTab === 'members' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">Team Members</h3>
                  <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all font-medium">
                    <UserPlus size={18} />
                    Add Member
                  </button>
                </div>

                {mockMembers.map(member => (
                  <GlassCard key={member.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar src={member.avatar} alt={member.name} size="md" />
                        <div>
                          <p className="font-semibold">{member.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Joined {member.joined}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <select className="px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-blue-500 outline-none">
                          <option value="admin">Admin</option>
                          <option value="moderator">Moderator</option>
                          <option value="member">Member</option>
                        </select>
                        <button className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                {/* Cover Image */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Cover Image</label>
                  <div className="relative h-40 rounded-xl overflow-hidden bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
                    {selectedPage.coverImage && (
                      <img src={selectedPage.coverImage} alt="Cover preview" className="w-full h-full object-cover" />
                    )}
                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 cursor-pointer transition-colors">
                      <div className="text-center text-white">
                        <Camera size={32} className="mx-auto mb-2" />
                        <span className="text-sm font-medium">Change Cover</span>
                      </div>
                      <input type="file" accept="image/*" className="hidden" />
                    </label>
                  </div>
                </div>

                {/* Avatar */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Page Avatar</label>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                      <img src={selectedPage.avatar} alt={selectedPage.name} className="w-full h-full object-cover" />
                    </div>
                    <label className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl font-medium cursor-pointer transition-colors flex items-center gap-2">
                      <Upload size={18} />
                      Upload Avatar
                      <input type="file" accept="image/*" className="hidden" />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Page Name</label>
                  <input
                    type="text"
                    defaultValue={selectedPage.name}
                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Description</label>
                  <textarea
                    defaultValue={selectedPage.description}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Category</label>
                  <select
                    defaultValue={selectedPage.category}
                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  >
                    <option>Development</option>
                    <option>DeFi</option>
                    <option>NFTs</option>
                    <option>DAOs</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl">
                    Save Changes
                  </button>
                  <button className="px-6 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-xl font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                    Cancel
                  </button>
                </div>

                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-red-500 mb-2">Danger Zone</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Once you delete a page, there is no going back. Please be certain.
                  </p>
                  <button className="px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all">
                    Delete Page
                  </button>
                </div>
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    );
  }

  return null;
}
