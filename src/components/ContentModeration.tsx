import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Eye, Trash2 } from 'lucide-react';
import adminService from '../services/api/admin.service';
import { Avatar } from './Avatar';
import { GlassCard } from './GlassCard';

interface Report {
  id: string;
  type: 'post' | 'comment' | 'user';
  contentId: string;
  reportedBy: {
    id: string;
    username: string;
    avatar: string;
  };
  reason: string;
  description: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
  content?: {
    title?: string;
    text: string;
    author: {
      username: string;
      avatar: string;
    };
  };
}

export function ContentModeration() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('pending');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  useEffect(() => {
    loadReports();
  }, [filter]);

  const loadReports = async () => {
    try {
      const data = await adminService.getReports({
        status: filter !== 'all' ? filter : undefined,
      });
      setReports(data.reports || []);
    } catch (error) {
      console.error('Failed to load reports:', error);
      setReports([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolveReport = async (reportId: string, action: 'remove' | 'dismiss') => {
    try {
      await adminService.resolveReport(reportId, action, `Content ${action}d by moderator`);
      loadReports();
      setSelectedReport(null);
    } catch (error) {
      console.error('Failed to resolve report:', error);
    }
  };

  const handleRemoveContent = async (type: string, contentId: string, reportId: string) => {
    try {
      await adminService.removeContent(type, contentId, 'Violates community guidelines');
      await handleResolveReport(reportId, 'remove');
    } catch (error) {
      console.error('Failed to remove content:', error);
    }
  };

  const getReasonBadge = (reason: string) => {
    const colors: Record<string, string> = {
      spam: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
      harassment: 'bg-red-500/10 text-red-600 dark:text-red-400',
      inappropriate: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
      misinformation: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
      other: 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[reason] || colors.other}`}>
        {reason}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'all'
                ? 'bg-blue-500 text-white'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            All Reports
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'pending'
                ? 'bg-orange-500 text-white'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('resolved')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'resolved'
                ? 'bg-green-500 text-white'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            Resolved
          </button>
        </div>
      </GlassCard>

      {/* Reports List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Loading reports...</p>
        </div>
      ) : reports.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <CheckCircle size={48} className="mx-auto mb-4 text-green-500" />
          <h3 className="text-xl font-bold mb-2">No Reports</h3>
          <p className="text-gray-600 dark:text-gray-400">
            All clear! No {filter !== 'all' && filter} reports at the moment.
          </p>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <GlassCard key={report.id} className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-orange-500/10 flex-shrink-0">
                  <AlertTriangle className="text-orange-600 dark:text-orange-400" size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">
                          {report.type === 'post' && 'Post Reported'}
                          {report.type === 'comment' && 'Comment Reported'}
                          {report.type === 'user' && 'User Reported'}
                        </h4>
                        {getReasonBadge(report.reason)}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {report.description}
                      </p>
                    </div>
                    {report.status === 'pending' && (
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleResolveReport(report.id, 'dismiss')}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="Dismiss"
                        >
                          <XCircle size={20} className="text-gray-600 dark:text-gray-400" />
                        </button>
                        <button
                          onClick={() => handleRemoveContent(report.type, report.contentId, report.id)}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Remove Content"
                        >
                          <Trash2 size={20} className="text-red-600 dark:text-red-400" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Reported Content */}
                  {report.content && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg mb-3">
                      {report.content.title && (
                        <h5 className="font-medium mb-2">{report.content.title}</h5>
                      )}
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                        {report.content.text}
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <Avatar
                          src={report.content.author.avatar}
                          alt={report.content.author.username}
                          size="sm"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          by {report.content.author.username}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Reporter Info */}
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <span>Reported by</span>
                      <Avatar
                        src={report.reportedBy.avatar}
                        alt={report.reportedBy.username}
                        size="xs"
                      />
                      <span className="font-medium">{report.reportedBy.username}</span>
                    </div>
                    <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}

