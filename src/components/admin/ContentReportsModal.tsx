import { useState, useEffect } from 'react';
import { 
  X, 
  AlertTriangle, 
  User, 
  Calendar, 
  MessageSquare,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  FileText
} from 'lucide-react';
import { GlassCard } from '../GlassCard';
import { Avatar } from '../Avatar';
import { Badge } from '../Badge';
import { useToast } from '../Toast';
import adminService from '../../services/api/admin.service';

interface Report {
  id: string;
  reason: 'spam' | 'harassment' | 'hate_speech' | 'violence' | 'misinformation' | 'copyright' | 'other';
  description: string | null;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt: string;
  reviewedAt: string | null;
  moderatorNote: string | null;
  reporter: {
    id: string;
    username: string;
    avatar?: string;
  };
  reviewer: {
    id: string;
    username: string;
    avatar?: string;
  } | null;
  post?: {
    id: string;
    title: string;
    slug: string;
    author: {
      id: string;
      username: string;
      avatar?: string;
    };
  };
  comment?: {
    id: string;
    content: string;
    author: {
      id: string;
      username: string;
      avatar?: string;
    };
    post: {
      id: string;
      title: string;
      slug: string;
    };
  };
}

interface ContentReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: 'post' | 'comment';
  contentId: string;
  contentTitle?: string;
}

export function ContentReportsModal({ isOpen, onClose, contentType, contentId, contentTitle }: ContentReportsModalProps) {
  const toast = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadReports();
    } else {
      setReports([]);
      setPage(1);
    }
  }, [isOpen, contentType, contentId]);

  const loadReports = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getReports({
        type: contentType,
        contentId,
        page,
        limit: 20,
      });
      
      if (page === 1) {
        setReports(data.reports || []);
      } else {
        setReports(prev => [...prev, ...(data.reports || [])]);
      }
      
      setHasMore(data.meta?.currentPage < data.meta?.lastPage);
    } catch (error: any) {
      console.error('Failed to load reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setIsLoading(false);
    }
  };

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      spam: 'Spam',
      harassment: 'Harassment',
      hate_speech: 'Hate Speech',
      violence: 'Violence',
      misinformation: 'Misinformation',
      copyright: 'Copyright',
      other: 'Other',
    };
    return labels[reason] || reason;
  };

  const getReasonColor = (reason: string) => {
    const colors: Record<string, string> = {
      spam: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
      harassment: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
      hate_speech: 'bg-red-500/10 text-red-600 dark:text-red-400',
      violence: 'bg-red-500/10 text-red-600 dark:text-red-400',
      misinformation: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
      copyright: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      other: 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
    };
    return colors[reason] || colors.other;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">Pending</Badge>;
      case 'reviewed':
        return <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400">Reviewed</Badge>;
      case 'resolved':
        return <Badge className="bg-green-500/10 text-green-600 dark:text-green-400">Resolved</Badge>;
      case 'dismissed':
        return <Badge className="bg-gray-500/10 text-gray-600 dark:text-gray-400">Dismissed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <GlassCard className="p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <AlertTriangle size={24} className="text-red-500" />
              Reports for {contentType === 'post' ? 'Post' : 'Comment'}
            </h3>
            {contentTitle && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate max-w-md">
                {contentTitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {isLoading && reports.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12">
            <AlertTriangle size={48} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
            <h4 className="text-lg font-bold mb-2">No Reports</h4>
            <p className="text-gray-500 dark:text-gray-400">
              This {contentType} has no reports.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <GlassCard key={report.id} className="p-4">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusBadge(report.status)}
                      <Badge className={getReasonColor(report.reason)}>
                        {getReasonLabel(report.reason)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <div className="flex items-center gap-1.5">
                        <Avatar
                          src={report.reporter.avatar || ''}
                          alt={report.reporter.username}
                          size="sm"
                        />
                        <span className="font-medium">{report.reporter.username}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        {formatDate(report.createdAt)}
                      </div>
                      {report.reviewer && (
                        <>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <User size={14} />
                            Reviewed by {report.reviewer.username}
                          </div>
                        </>
                      )}
                    </div>

                    {report.description && (
                      <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {report.description}
                        </p>
                      </div>
                    )}

                    {report.moderatorNote && (
                      <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">
                          Moderator Note:
                        </p>
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          {report.moderatorNote}
                        </p>
                        {report.reviewedAt && (
                          <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">
                            Reviewed on {formatDate(report.reviewedAt)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </GlassCard>
            ))}

            {hasMore && (
              <div className="text-center pt-4">
                <button
                  onClick={() => {
                    setPage(prev => prev + 1);
                    loadReports();
                  }}
                  disabled={isLoading}
                  className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </GlassCard>
    </div>
  );
}

