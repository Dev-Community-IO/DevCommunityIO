import { useState, useEffect } from 'react';
import { Users, FileText, AlertTriangle, ShieldCheck, TrendingUp, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import adminService from '../services/api/admin.service';
import { UserManagement } from './UserManagement';
import { ContentModeration } from './ContentModeration';
import { ModeratorPanel } from './ModeratorPanel';
import { GlassCard } from './GlassCard';

interface DashboardStats {
  totalUsers: number;
  activeToday: number;
  totalPosts: number;
  postsToday: number;
  totalPages: number;
  pendingReports: number;
  activeModerators: number;
}

type TabType = 'overview' | 'users' | 'content' | 'moderators';

export function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeToday: 0,
    totalPosts: 0,
    postsToday: 0,
    totalPages: 0,
    pendingReports: 0,
    activeModerators: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const data = await adminService.getDashboard();
      setStats(data.stats || {
        totalUsers: 0,
        activeToday: 0,
        totalPosts: 0,
        postsToday: 0,
        totalPages: 0,
        pendingReports: 0,
        activeModerators: 0,
      });
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
      setStats({
        totalUsers: 0,
        activeToday: 0,
        totalPosts: 0,
        postsToday: 0,
        totalPages: 0,
        pendingReports: 0,
        activeModerators: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GlassCard className="p-8 text-center">
          <ShieldCheck size={48} className="mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400">
            You don't have permission to access the admin dashboard.
          </p>
        </GlassCard>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'content', label: 'Content', icon: AlertTriangle },
    { id: 'moderators', label: 'Moderators', icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-12 xl:px-24 2xl:px-48 pb-12">
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage users, content, and moderators
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <ShieldCheck size={20} />
            <span className="font-semibold capitalize">{user?.role}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <Icon size={18} />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-3 rounded-lg bg-blue-500/10">
                    <Users className="text-blue-600 dark:text-blue-400" size={24} />
                  </div>
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                    +{stats.activeToday} today
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-1">{stats.totalUsers.toLocaleString()}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
              </GlassCard>

              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-3 rounded-lg bg-green-500/10">
                    <FileText className="text-green-600 dark:text-green-400" size={24} />
                  </div>
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                    +{stats.postsToday} today
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-1">{stats.totalPosts.toLocaleString()}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Posts</p>
              </GlassCard>

              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-3 rounded-lg bg-orange-500/10">
                    <AlertTriangle className="text-orange-600 dark:text-orange-400" size={24} />
                  </div>
                  {stats.pendingReports > 0 && (
                    <span className="px-2 py-1 text-xs font-bold rounded-full bg-red-500 text-white">
                      {stats.pendingReports}
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-bold mb-1">{stats.pendingReports}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending Reports</p>
              </GlassCard>

              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-3 rounded-lg bg-purple-500/10">
                    <ShieldCheck className="text-purple-600 dark:text-purple-400" size={24} />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-1">{stats.activeModerators}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Moderators</p>
              </GlassCard>
            </div>

            {/* Recent Activity */}
            <GlassCard className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Calendar size={20} />
                Recent Activity
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New user registration</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">john_doe joined the platform</p>
                  </div>
                  <span className="text-xs text-gray-400">2m ago</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Content reported</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Post flagged for review</p>
                  </div>
                  <span className="text-xs text-gray-400">15m ago</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Moderator action</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">User suspended by @moderator</p>
                  </div>
                  <span className="text-xs text-gray-400">1h ago</span>
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'content' && <ContentModeration />}
        {activeTab === 'moderators' && <ModeratorPanel />}
      </div>
    </div>
  );
}

