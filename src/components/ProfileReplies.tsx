import { useState, useEffect } from 'react';
import { Search, MessageSquare, Edit2, Trash2, MoreVertical, ArrowRight } from 'lucide-react';
import usersService from '../services/api/users.service';
import commentsService from '../services/api/comments.service';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MarkdownRenderer } from '../utils/markdownRenderer';

const ReplySkeleton = () => (
  <div className="animate-pulse rounded-xl border border-gray-200/80 bg-white p-3 dark:border-white/10 dark:bg-black/20">
    <div className="mb-2 flex items-center justify-between gap-2">
      <div className="h-3 flex-1 rounded bg-gray-200 dark:bg-gray-700" />
      <div className="h-3 w-10 shrink-0 rounded bg-gray-200 dark:bg-gray-700" />
    </div>
    <div className="space-y-1.5">
      <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-700" />
      <div className="h-3 w-4/5 rounded bg-gray-200 dark:bg-gray-700" />
    </div>
  </div>
);

const ReplySkeletonList = ({ count = 4 }: { count?: number }) => (
  <div className="space-y-2">
    {Array.from({ length: count }).map((_, i) => (
      <ReplySkeleton key={i} />
    ))}
  </div>
);

interface ProfileRepliesProps {
  username: string;
}

function getReplyPost(reply: Record<string, unknown>) {
  const post = reply.post as { title?: string; slug?: string; id?: string } | undefined;
  return {
    title: (reply.postTitle as string) || post?.title || 'Post',
    slug: (reply.postSlug as string) || post?.slug || (reply.postId as string) || post?.id,
  };
}

function getReplyCreatedAt(reply: Record<string, unknown>) {
  return (reply.createdAt || reply.created_at || reply.timestamp) as string | Date | undefined;
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
      setReplies((prev) =>
        prev.map((r) => (r.id === replyId ? { ...r, content: editingContent } : r))
      );
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
      setReplies((prev) => prev.filter((r) => r.id !== replyId));
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

  const filteredReplies = replies.filter((reply) => {
    const { title } = getReplyPost(reply);
    const q = searchQuery.toLowerCase();
    return (
      (reply.content && reply.content.toLowerCase().includes(q)) ||
      title.toLowerCase().includes(q)
    );
  });

  const timeAgo = (date: Date | string | undefined) => {
    if (!date) return '';
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo`;
    return `${Math.floor(months / 12)}y`;
  };

  const openThread = (reply: Record<string, unknown>) => {
    const { slug } = getReplyPost(reply);
    if (slug) navigate(`/post/${slug}`);
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="shrink-0">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">Replies</h2>
          {!loading && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {filteredReplies.length === 0
                ? 'No replies found'
                : `${filteredReplies.length} ${filteredReplies.length === 1 ? 'reply' : 'replies'}${searchQuery ? ` matching "${searchQuery}"` : ''}`}
            </p>
          )}
        </div>
      </div>

      <div className="relative">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder={isOwnProfile ? 'Search your replies...' : 'Search replies...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm outline-none transition-all focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400/30 dark:border-gray-700 dark:bg-gray-800 dark:focus:border-zinc-500"
        />
      </div>

      {loading ? (
        <ReplySkeletonList count={4} />
      ) : filteredReplies.length === 0 ? (
        <div className="py-10 text-center sm:py-12">
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <MessageSquare size={22} className="text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="mb-1 text-base font-semibold text-gray-900 dark:text-white">
            {searchQuery ? 'No matching replies' : 'No replies yet'}
          </h3>
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            {searchQuery
              ? 'Try a different search term.'
              : isOwnProfile
                ? "You haven't joined any discussions yet."
                : "This user hasn't replied to any posts yet."}
          </p>
          {!searchQuery && isOwnProfile && (
            <button
              type="button"
              onClick={() => navigate('/')}
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              Browse feed
            </button>
          )}
        </div>
      ) : (
        <ul className="space-y-2">
          {filteredReplies.map((reply) => {
            const post = getReplyPost(reply);
            const createdAt = getReplyCreatedAt(reply);
            const isEditing = editingReplyId === reply.id;

            return (
              <li
                key={reply.id}
                className="group rounded-xl border border-gray-200/80 bg-white p-3 transition-colors hover:border-gray-300 dark:border-white/10 dark:bg-black/20 dark:hover:border-white/20"
              >
                <div className="mb-1.5 flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-gray-500 dark:text-gray-400">
                      <MessageSquare size={12} className="shrink-0 text-gray-400" />
                      <span className="shrink-0">on</span>
                      <button
                        type="button"
                        onClick={() => openThread(reply)}
                        className="max-w-[min(100%,14rem)] truncate font-medium text-gray-900 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400 sm:max-w-xs"
                      >
                        {post.title}
                      </button>
                      {createdAt && (
                        <>
                          <span className="text-gray-300 dark:text-gray-600">·</span>
                          <time dateTime={new Date(createdAt).toISOString()} className="shrink-0 tabular-nums">
                            {timeAgo(createdAt)}
                          </time>
                        </>
                      )}
                    </div>
                  </div>

                  {isOwnProfile && (
                    <div className="relative shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMenuId(showMenuId === reply.id ? null : reply.id);
                        }}
                        className="rounded-md p-1 text-gray-400 opacity-0 transition-opacity hover:bg-gray-100 hover:text-gray-600 group-hover:opacity-100 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                        aria-label="Reply options"
                      >
                        <MoreVertical size={14} />
                      </button>
                      {showMenuId === reply.id && (
                        <div className="absolute right-0 top-full z-10 mt-1 w-36 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              startEdit(reply);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                          >
                            <Edit2 size={13} />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteReply(reply.id);
                            }}
                            disabled={deletingReplyId === reply.id}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/40"
                          >
                            <Trash2 size={13} />
                            {deletingReplyId === reply.id ? 'Deleting…' : 'Delete'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-2">
                    <textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      rows={3}
                      className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800"
                      placeholder="Edit your reply..."
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditReply(reply.id)}
                        className="rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingReplyId(null);
                          setEditingContent('');
                        }}
                        className="rounded-md px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div
                      className="line-clamp-3 text-sm leading-snug text-gray-700 dark:text-gray-300 [&_*]:!my-0"
                      onClick={() => openThread(reply)}
                      onKeyDown={(e) => e.key === 'Enter' && openThread(reply)}
                      role="button"
                      tabIndex={0}
                    >
                      <MarkdownRenderer content={reply.content || ''} compact />
                    </div>
                    <button
                      type="button"
                      onClick={() => openThread(reply)}
                      className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-gray-500 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                    >
                      View thread
                      <ArrowRight size={12} />
                    </button>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {!loading && filteredReplies.length > 0 && paginationMeta.lastPage > 1 && (
        <div className="flex flex-col gap-3 border-t border-gray-200 pt-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {(currentPage - 1) * paginationMeta.perPage + 1}–
            {Math.min(currentPage * paginationMeta.perPage, paginationMeta.total)} of{' '}
            {paginationMeta.total}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Previous
            </button>
            <span className="min-w-[4rem] text-center text-xs tabular-nums text-gray-500 dark:text-gray-400">
              {currentPage} / {paginationMeta.lastPage}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.min(paginationMeta.lastPage, prev + 1))}
              disabled={currentPage === paginationMeta.lastPage}
              className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
