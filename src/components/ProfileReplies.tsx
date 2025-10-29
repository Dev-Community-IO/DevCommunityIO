import { useState, useEffect } from 'react';
import { Search, MessageSquare, Calendar, Edit2, Trash2, MoreVertical } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Avatar } from './Avatar';
import usersService from '../services/api/users.service';
import commentsService from '../services/api/comments.service';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MarkdownRenderer } from '../utils/markdownRenderer';

const ReplySkeleton = () => (
  <div className="animate-pulse">
    <GlassCard className="p-6">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full" />
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2" />
          <div className="flex gap-4 mt-4">
            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-16" />
            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-16" />
          </div>
        </div>
      </div>
    </GlassCard>
  </div>
);

const ReplySkeletonList = ({ count = 3 }: { count?: number }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <ReplySkeleton key={i} />
    ))}
  </div>
);

interface ProfileRepliesProps {
  username: string;
}

export function ProfileReplies({ username }: ProfileRepliesProps) {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [replies, setReplies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [deletingReplyId, setDeletingReplyId] = useState<string | null>(null);
  const [showMenuId, setShowMenuId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState({
    currentPage: 1,
    lastPage: 1,
    perPage: 20,
    total: 0,
  });

  const isOwnProfile = authUser?.username === username;

  useEffect(() => {
    const fetchReplies = async () => {
      try {
        setLoading(true);
        const response = await usersService.getUserReplies(username, {
          page: currentPage,
          limit: 20,
        });
        
        if (response && response.data) {
          setReplies(response.data);
          setPaginationMeta(response.meta || paginationMeta);
        } else {
          // Handle legacy response format
          setReplies(Array.isArray(response) ? response : []);
        }
      } catch (err) {
        console.error('Error fetching user replies:', err);
        setReplies([]);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchReplies();
    }
  }, [username, currentPage]);

  const handleEditReply = async (replyId: string) => {
    try {
      await commentsService.updateComment(replyId, { content: editingContent });
      setReplies(prev => prev.map(r => 
        r.id === replyId ? { ...r, content: editingContent } : r
      ));
      setEditingReplyId(null);
      setEditingContent('');
    } catch (error: any) {
      console.error('Failed to update reply:', error);
      alert('Failed to update reply: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    if (!confirm('Are you sure you want to delete this reply? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingReplyId(replyId);
      await commentsService.deleteComment(replyId);
      setReplies(prev => prev.filter(r => r.id !== replyId));
    } catch (error: any) {
      console.error('Failed to delete reply:', error);
      alert('Failed to delete reply: ' + (error.response?.data?.message || error.message));
    } finally {
      setDeletingReplyId(null);
      setShowMenuId(null);
    }
  };

  const startEdit = (reply: any) => {
    setEditingReplyId(reply.id);
    setEditingContent(reply.content || '');
    setShowMenuId(null);
  };

  const filteredReplies = replies.filter(reply =>
    (reply.content && reply.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (reply.postTitle && reply.postTitle.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const timeAgo = (date: Date | string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <GlassCard className="p-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search your replies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
          />
        </div>
      </GlassCard>

      {/* Replies List */}
      {loading ? (
        <ReplySkeletonList count={3} />
      ) : filteredReplies.length === 0 ? (
        <GlassCard className="p-12 text-center space-y-4">
          <div className="text-6xl">💬</div>
          <div>
            <h3 className="text-xl font-bold mb-2">No Replies Yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {isOwnProfile ? "You haven't replied to any posts yet." : "This user hasn't replied to any posts yet."}
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl"
            >
              Join Discussions
            </button>
          </div>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {filteredReplies.map(reply => (
            <GlassCard key={reply.id} className="p-5 hover:scale-[1.01] transition-transform duration-300">
              <div className="space-y-3">
                {/* Reply Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 mb-2">
                      <MessageSquare size={14} />
                      Replied to:
                      <button
                        onClick={() => navigate(`/post/${reply.postSlug || reply.postId}`)}
                        className="font-semibold text-blue-500 hover:text-blue-600 hover:underline"
                      >
                        {reply.postTitle || 'Post'}
                      </button>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Calendar size={12} />
                      {timeAgo(reply.createdAt || reply.timestamp)}
                    </span>
                    {isOwnProfile && (
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowMenuId(showMenuId === reply.id ? null : reply.id);
                          }}
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <MoreVertical size={16} className="text-gray-500" />
                        </button>
                        {showMenuId === reply.id && (
                          <div className="absolute top-full right-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-10">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                startEdit(reply);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <Edit2 size={14} />
                              Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteReply(reply.id);
                              }}
                              disabled={deletingReplyId === reply.id}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                            >
                              <Trash2 size={14} />
                              {deletingReplyId === reply.id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Reply Content */}
                {editingReplyId === reply.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 text-sm rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="Edit your reply..."
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditReply(reply.id)}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingReplyId(null);
                          setEditingContent('');
                        }}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    <MarkdownRenderer content={reply.content || ''} compact />
                  </div>
                )}

                {/* Reply Footer */}
                {!editingReplyId && (
                  <div className="flex items-center gap-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => navigate(`/post/${reply.postSlug || reply.postId}`)}
                      className="text-sm text-blue-500 hover:text-blue-600 font-medium"
                    >
                      View Thread
                    </button>
                  </div>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && filteredReplies.length > 0 && paginationMeta.lastPage > 1 && (
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {((currentPage - 1) * paginationMeta.perPage) + 1} to{' '}
              {Math.min(currentPage * paginationMeta.perPage, paginationMeta.total)} of{' '}
              {paginationMeta.total} replies
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, paginationMeta.lastPage) }, (_, i) => {
                  let pageNum;
                  if (paginationMeta.lastPage <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= paginationMeta.lastPage - 2) {
                    pageNum = paginationMeta.lastPage - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 rounded-lg transition-colors ${
                        currentPage === pageNum
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(paginationMeta.lastPage, prev + 1))}
                disabled={currentPage === paginationMeta.lastPage}
                className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
