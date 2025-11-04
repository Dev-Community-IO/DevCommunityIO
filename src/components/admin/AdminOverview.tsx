import { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  Building2, 
  MessageCircle, 
  AlertTriangle, 
  ShieldCheck,
  TrendingUp,
  Calendar,
  Activity,
  Clock
} from 'lucide-react';
import { GlassCard } from '../GlassCard';
import adminService from '../../services/api/admin.service';

interface OverviewStats {
  totalUsers: number;
  activeToday: number;
  totalPosts: number;
  postsToday: number;
  totalPages: number;
  totalComments: number;
  pendingReports: number;
  activeModerators: number;
  suspendedUsers: number;
  bannedUsers: number;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  user?: {
    username: string;
    avatar?: string;
  };
}

export function AdminOverview() {
  const [stats, setStats] = useState<OverviewStats>({
    totalUsers: 0,
    activeToday: 0,
    totalPosts: 0,
    postsToday: 0,
    totalPages: 0,
    totalComments: 0,
    pendingReports: 0,
    activeModerators: 0,
    suspendedUsers: 0,
    bannedUsers: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOverviewData();
  }, []);

  const loadOverviewData = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getDashboard();
      
      if (data.statistics) {
        setStats({
          totalUsers: data.statistics.totalUsers || 0,
          activeToday: data.statistics.activeToday || 0,
          totalPosts: data.statistics.totalPosts || 0,
          postsToday: data.statistics.postsToday || 0,
          totalPages: data.statistics.totalPages || 0,
          totalComments: data.statistics.totalComments || 0,
          pendingReports: data.statistics.pendingReports || 0,
          activeModerators: data.statistics.activeModerators || 0,
          suspendedUsers: data.statistics.suspendedUsers || 0,
          bannedUsers: data.statistics.bannedUsers || 0,
        });
      }

      // Load recent activities from moderation log
      const logData = await adminService.getModerationLog({ limit: 10 });
      if (logData.log) {
        const activities = logData.log.map((log: any) => ({
          id: log.id,
          type: log.action,
          description: `${log.action} by ${log.moderator_username}`,
          timestamp: log.created_at,
        }));
        setRecentActivities(activities);
      }
    } catch (error) {
      console.error('Failed to load overview data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getActivityColor = (type: string) => {
    const colors: Record<string, string> = {
      suspend: 'bg-red-500',
      unsuspend: 'bg-green-500',
      ban: 'bg-red-600',
      'assign_role': 'bg-purple-500',
      delete: 'bg-orange-500',
      verify: 'bg-blue-500',
      default: 'bg-gray-500',
    };
    return colors[type] || colors.default;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <GlassCard key={i} className="p-6 animate-pulse">
              <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </GlassCard>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/30">
              <Users className="text-white" size={24} />
            </div>
            <span className="text-xs text-green-600 dark:text-green-400 font-semibold bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
              +{stats.activeToday} today
            </span>
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats.totalUsers.toLocaleString()}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
        </GlassCard>

        <GlassCard className="p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg shadow-green-500/30">
              <FileText className="text-white" size={24} />
            </div>
            <span className="text-xs text-green-600 dark:text-green-400 font-semibold bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
              +{stats.postsToday} today
            </span>
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats.totalPosts.toLocaleString()}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Posts</p>
        </GlassCard>

        <GlassCard className="p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30">
              <Building2 className="text-white" size={24} />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats.totalPages.toLocaleString()}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Pages</p>
        </GlassCard>

        <GlassCard className="p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-500/30">
              <MessageCircle className="text-white" size={24} />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats.totalComments.toLocaleString()}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Comments</p>
        </GlassCard>

        <GlassCard className="p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 shadow-lg shadow-red-500/30">
              <AlertTriangle className="text-white" size={24} />
            </div>
            {stats.pendingReports > 0 && (
              <span className="px-2 py-1 text-xs font-bold rounded-full bg-red-500 text-white animate-pulse">
                {stats.pendingReports}
              </span>
            )}
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats.pendingReports}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Pending Reports</p>
        </GlassCard>

        <GlassCard className="p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/30">
              <ShieldCheck className="text-white" size={24} />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats.activeModerators}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Active Moderators</p>
        </GlassCard>

        <GlassCard className="p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 shadow-lg shadow-yellow-500/30">
              <Clock className="text-white" size={24} />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats.suspendedUsers}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Suspended Users</p>
        </GlassCard>

        <GlassCard className="p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-red-600 to-red-800 shadow-lg shadow-red-600/30">
              <Activity className="text-white" size={24} />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats.bannedUsers}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Banned Users</p>
        </GlassCard>
      </div>

      {/* Recent Activity */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Calendar size={22} className="text-purple-500" />
            Recent Activity
          </h3>
          <button 
            onClick={loadOverviewData}
            className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
          >
            Refresh
          </button>
        </div>
        {recentActivities.length > 0 ? (
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div 
                key={activity.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
              >
                <div className={`w-2 h-2 rounded-full ${getActivityColor(activity.type)} flex-shrink-0`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {activity.type.replace(/_/g, ' ')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {activity.description}
                  </p>
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                  {formatTimeAgo(activity.timestamp)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Activity size={48} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
          </div>
        )}
      </GlassCard>
    </div>
  );
}

