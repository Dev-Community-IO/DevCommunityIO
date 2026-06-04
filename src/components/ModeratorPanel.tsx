import { useState, useEffect } from 'react';
import { Shield, UserPlus, Activity, Clock } from 'lucide-react';
import adminService from '../services/api/admin.service';
import { Avatar } from './Avatar';
import { GlassCard } from './GlassCard';
import { TabPills } from './TabPills';

interface Moderator {
  id: string;
  username: string;
  avatar: string;
  email?: string;
  role: 'moderator' | 'admin';
  actionsCount: number;
  lastActive: string;
  joinedDate: string;
}

interface ModerationLog {
  id: string;
  moderator: {
    username: string;
    avatar: string;
  };
  action: string;
  target: string;
  reason?: string;
  timestamp: string;
}

export function ModeratorPanel() {
  const [moderators, setModerators] = useState<Moderator[]>([]);
  const [logs, setLogs] = useState<ModerationLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<'moderators' | 'logs'>('moderators');

  useEffect(() => {
    loadModerators();
    loadLogs();
  }, []);

  const loadModerators = async () => {
    try {
      const data = await adminService.getModerators();
      setModerators(data || []);
    } catch (error) {
      console.error('Failed to load moderators:', error);
      setModerators([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadLogs = async () => {
    try {
      const data = await adminService.getModerationLog();
      setLogs(data.logs || []);
    } catch (error) {
      console.error('Failed to load logs:', error);
      setLogs([]);
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes('suspend') || action.includes('ban')) return 'text-red-600 dark:text-red-400';
    if (action.includes('unsuspend') || action.includes('approve')) return 'text-green-600 dark:text-green-400';
    if (action.includes('remove')) return 'text-orange-600 dark:text-orange-400';
    return 'text-blue-600 dark:text-blue-400';
  };

  return (
    <div className="space-y-6">
      <TabPills
        ariaLabel="Moderator views"
        activeTab={activeView}
        onChange={setActiveView}
        scrollable={false}
        tabs={[
          { id: 'moderators', label: 'Moderators', icon: Shield },
          { id: 'logs', label: 'Activity Log', icon: Activity },
        ]}
      />

      {activeView === 'moderators' ? (
        <div className="space-y-4">
          {/* Add Moderator Button */}
          <GlassCard className="p-6">
            <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg hover:shadow-xl">
              <UserPlus size={20} />
              Assign New Moderator
            </button>
          </GlassCard>

          {/* Moderators List */}
          {moderators.map((moderator) => (
            <GlassCard key={moderator.id} className="p-6">
              <div className="flex items-start gap-4">
                <Avatar src={moderator.avatar} alt={moderator.username} size="lg" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-lg">{moderator.username}</h4>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                      {moderator.role}
                    </span>
                  </div>
                  {moderator.email && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {moderator.email}
                    </p>
                  )}
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 mb-1">Actions</p>
                      <p className="font-semibold">{moderator.actionsCount}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 mb-1">Last Active</p>
                      <p className="font-semibold">{moderator.lastActive}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 mb-1">Joined</p>
                      <p className="font-semibold">{moderator.joinedDate}</p>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <GlassCard className="p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Activity size={20} />
            Recent Moderation Actions
          </h3>
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <Avatar src={log.moderator.avatar} alt={log.moderator.username} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{log.moderator.username}</span>
                    <span className={`mx-1 font-semibold ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">{log.target}</span>
                  </p>
                  {log.reason && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Reason: {log.reason}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
                  <Clock size={12} />
                  {new Date(log.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}

