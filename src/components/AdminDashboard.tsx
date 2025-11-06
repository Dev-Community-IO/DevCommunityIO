import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  FileText, 
  Building2, 
  Hash, 
  Settings, 
  Database,
  ShieldCheck,
  Award,
  AlertTriangle,
  Github,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { GlassCard } from './GlassCard';
import { AdminOverview } from './admin/AdminOverview';
import { AdminContents } from './admin/AdminContents';
import { AdminUsers } from './admin/AdminUsers';
import { AdminPages } from './admin/AdminPages';
import { AdminTags } from './admin/AdminTags';
import { AdminAchievements } from './admin/AdminAchievements';
import { AdminRequests } from './admin/AdminRequests';
import { AdminApp } from './admin/AdminApp';
import { AdminConfigs } from './admin/AdminConfigs';
import { AdminStaticPages } from './admin/AdminStaticPages';
import { AdminAutoModeration } from './admin/AdminAutoModeration';
import siteSettingsService from '../services/api/siteSettings.service';

type TabType = 'overview' | 'contents' | 'users' | 'pages' | 'tags' | 'achievements' | 'app' | 'configs' | 'requests' | 'static-pages' | 'auto-moderation';

export function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [githubIssuesUrl, setGithubIssuesUrl] = useState<string | null>(null);

  // Check if user is moderator (limited access)
  const isModerator = user?.role === 'moderator';
  const isFullAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  // If moderator tries to access admin-only tab, redirect to overview
  // This useEffect must be before any conditional returns to follow Rules of Hooks
  useEffect(() => {
    if (isModerator && ['app', 'configs', 'static-pages'].includes(activeTab)) {
      setActiveTab('overview');
    }
  }, [activeTab, isModerator]);

  // Fetch GitHub Issues URL for Report Issue button
  useEffect(() => {
    const fetchGithubIssues = async () => {
      try {
        const url = await siteSettingsService.getSetting('github_issues_url');
        setGithubIssuesUrl(url);
      } catch (err) {
        console.error('Error fetching GitHub issues URL:', err);
      }
    };

    fetchGithubIssues();
  }, []);

  if (!isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 px-4">
        <GlassCard className="p-8 text-center max-w-md">
          <ShieldCheck size={48} className="mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400">
            You don't have permission to access the admin dashboard.
          </p>
        </GlassCard>
      </div>
    );
  }

  // Define tabs based on permissions
  const allTabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: TrendingUp, adminOnly: false },
    { id: 'contents' as TabType, label: 'Contents', icon: FileText, adminOnly: false },
    { id: 'users' as TabType, label: 'Users', icon: Users, adminOnly: false },
    { id: 'pages' as TabType, label: 'Pages', icon: Building2, adminOnly: false },
    { id: 'tags' as TabType, label: 'Tags', icon: Hash, adminOnly: false },
    { id: 'achievements' as TabType, label: 'Achievements', icon: Award, adminOnly: false },
    { id: 'auto-moderation' as TabType, label: 'Auto Moderation', icon: ShieldCheck, adminOnly: true },
    { id: 'static-pages' as TabType, label: 'Static Pages', icon: FileText, adminOnly: true },
    { id: 'requests' as TabType, label: 'Requests', icon: MessageSquare, adminOnly: true },
    { id: 'app' as TabType, label: 'App', icon: Settings, adminOnly: true },
    { id: 'configs' as TabType, label: 'Configs', icon: Database, adminOnly: true },
  ];

  // Filter tabs based on permissions
  const availableTabs = allTabs.filter(tab => !tab.adminOnly || isFullAdmin);

  return (
    <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-12 xl:px-24 2xl:px-48 pb-12">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your platform and community
            </p>
          </div>
          <div className="flex items-center gap-2">
            {githubIssuesUrl && (
              <a
                href={githubIssuesUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30 hover:from-orange-600 hover:to-red-600 transition-all"
              >
                <AlertTriangle size={18} />
                <span className="font-semibold">Report Issue</span>
                <Github size={16} />
              </a>
            )}
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30">
              <ShieldCheck size={20} />
              <span className="font-semibold capitalize">{user?.role || 'Admin'}</span>
            </div>
          </div>
        </div>

        {/* Sticky Tabs Navigation */}
        <div className="sticky top-20 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 -mx-4 sm:-mx-6 lg:-mx-12 xl:-mx-24 2xl:-mx-48 px-4 sm:px-6 lg:px-12 xl:px-24 2xl:px-48">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-2">
            {availableTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg border-b-2 transition-all duration-300 whitespace-nowrap ${
                    isActive
                      ? 'border-purple-500 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 font-semibold'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  <Icon size={18} />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          {activeTab === 'overview' && <AdminOverview />}
          {activeTab === 'contents' && <AdminContents />}
          {activeTab === 'users' && <AdminUsers />}
          {activeTab === 'pages' && <AdminPages />}
          {activeTab === 'tags' && <AdminTags />}
          {activeTab === 'achievements' && <AdminAchievements />}
          {activeTab === 'auto-moderation' && isFullAdmin && <AdminAutoModeration />}
          {activeTab === 'static-pages' && isFullAdmin && <AdminStaticPages />}
          {activeTab === 'requests' && isFullAdmin && <AdminRequests />}
          {activeTab === 'app' && isFullAdmin && <AdminApp />}
          {activeTab === 'configs' && isFullAdmin && <AdminConfigs />}
        </div>
      </div>
    </div>
  );
}
