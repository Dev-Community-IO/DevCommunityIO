import { MessageCircle, MoreHorizontal, Bold, Italic, Code, Link as LinkIcon, Eye, Trash2, AlertTriangle, Smile } from 'lucide-react';
import { Comment as CommentType } from '../types';
import { GlassCard } from './GlassCard';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { VerifiedBadge } from './VerifiedBadge';
import { Tooltip } from './Tooltip';
import { useState, useRef, useEffect } from 'react';
import { MarkdownRenderer } from '../utils/markdownRenderer';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import commentsService from '../services/api/comments.service';
import reactionsService from '../services/api/reactions.service';

interface CommentProps {
  comment: CommentType;
  postId?: string;
  isReply?: boolean;
  onReplySuccess?: () => void;
  onDelete?: () => void;
}

export function Comment({ comment, postId, isReply = false, onReplySuccess, onDelete }: CommentProps) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojis, setEmojis] = useState<{ emoji: string; count: number }[]>([]);
  const [userEmojis, setUserEmojis] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  
  const isOwnComment = user && comment.author.id === user.id;

  // Load emoji reactions on mount
  useEffect(() => {
    const loadReactions = async () => {
      try {
        const { reactions } = await reactionsService.getEmojis({ commentId: comment.id });
        setEmojis(reactions || []);
        
        if (user) {
          const { emojis: userEmojisList } = await reactionsService.getUserEmojis({ commentId: comment.id });
          setUserEmojis(userEmojisList || []);
        }
      } catch (error) {
        console.error('Failed to load reactions:', error);
      }
    };
    loadReactions();
  }, [comment.id, user]);

  const handleEmojiReaction = async (emoji: string) => {
    if (!isAuthenticated || !user) {
      // Redirect to login or show login modal
      navigate('/');
      return;
    }

    try {
      await reactionsService.addEmoji({ commentId: comment.id, emoji });
      
      // Reload reactions to get accurate counts
      const { reactions } = await reactionsService.getEmojis({ commentId: comment.id });
      setEmojis(reactions || []);
      
      if (user) {
        const { emojis: userEmojisList } = await reactionsService.getUserEmojis({ commentId: comment.id });
        setUserEmojis(userEmojisList || []);
      }
    } catch (error) {
      console.error('Failed to add emoji:', error);
    }
  };

  const timeAgo = (date: Date | string | undefined | null) => {
    if (!date) return 'just now';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if date is valid
    if (!dateObj || isNaN(dateObj.getTime())) return 'just now';
    
    const seconds = Math.floor((new Date().getTime() - dateObj.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const insertMarkdown = (before: string, after: string = '', placeholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = replyText.substring(start, end);
    const textToInsert = selectedText || placeholder;

    const newText = replyText.substring(0, start) + before + textToInsert + after + replyText.substring(end);
    setReplyText(newText);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + textToInsert.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    if (showMenu || showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu, showEmojiPicker]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await commentsService.deleteComment(comment.id);
      setShowConfirmDelete(false);
      onDelete?.();
    } catch (error) {
      console.error('Failed to delete comment:', error);
      alert('Failed to delete comment');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReplySubmit = async () => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    
    if (!replyText.trim() || !postId) return;

    setIsSubmitting(true);
    try {
      await commentsService.createComment(postId, {
        content: replyText,
        parentId: comment.id
      });
      setReplyText('');
      setShowReply(false);
      setShowPreview(false);
      onReplySuccess?.();
    } catch (error) {
      console.error('Failed to submit reply:', error);
      alert('Failed to submit reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={isReply ? 'ml-8 sm:ml-12' : ''}>
      <GlassCard className="p-3 sm:p-4 hover:shadow-lg transition-shadow duration-300">
        <div className="flex gap-3 sm:gap-4">
          <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <Tooltip content={`@${comment.author.username}`}>
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/profile/${comment.author.username}`);
                }}
              >
                <Avatar 
                  src={(comment.author.avatar || comment.author.avatarUrl) || ''} 
                  alt={comment.author.username} 
                  size="sm" 
                  className="cursor-pointer ring-2 ring-transparent hover:ring-blue-500 transition-all"
                  isTrusted={comment.author.isTrusted}
                />
              </div>
            </Tooltip>
          </div>

          <div className="flex-1 space-y-2 sm:space-y-3 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/profile/${comment.author.username}`);
                    }}
                    className="font-bold text-sm sm:text-base cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {comment.author.username}
                  </span>
                  {comment.author.isVerified && (
                    <VerifiedBadge size={14} />
                  )}
                </div>
                <Badge variant="gradient" className="text-xs">{comment.author.reputation} rep</Badge>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                  <span className="hidden sm:inline">•</span>
                  <span className="font-mono text-xs">
                    {comment.author.walletAddress}
                  </span>
                  <span>•</span>
                  <span>
                    {timeAgo(comment.createdAt || comment.timestamp)}
                  </span>
                </div>
              </div>
              {isOwnComment && (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 flex-shrink-0"
                  >
                    <MoreHorizontal size={16} />
                  </button>

                  {showMenu && (
                    <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-[9999] animate-fade-in">
                      <button
                        onClick={() => {
                          setShowConfirmDelete(true);
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors rounded-lg"
                      >
                        <Trash2 size={16} />
                        Delete Comment
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="prose prose-sm dark:prose-invert max-w-none">
              <MarkdownRenderer content={comment.content} compact />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Emoji Reactions */}
              {emojis.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                  {emojis.map(({ emoji, count }) => (
                    <button
                      key={emoji}
                      onClick={() => handleEmojiReaction(emoji)}
                      className={`px-1.5 py-0.5 rounded text-xs transition-all duration-200 flex items-center gap-0.5 ${
                        userEmojis.includes(emoji)
                          ? 'bg-blue-500/20 text-blue-400 ring-1 ring-blue-400/50'
                          : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span className="text-sm">{emoji}</span>
                      <span className="font-semibold text-[10px]">{count}</span>
                    </button>
                  ))}
                </div>
              )}
              
              {/* Add Emoji Button - Only show for authenticated users */}
              {isAuthenticated && (
              <div className="relative" ref={emojiPickerRef}>
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
                >
                  <Smile size={14} />
                  <span>React</span>
                </button>

                {showEmojiPicker && (
                  <div className="absolute bottom-full mb-3 left-0 z-[9999] animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-2 border-gray-200 dark:border-gray-700 p-3 min-w-[240px]">
                      <div className="grid grid-cols-4 gap-2">
                        {['👍', '❤️', '🔥', '👏', '😂', '😮', '😢', '🎉'].map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => {
                              handleEmojiReaction(emoji);
                              setShowEmojiPicker(false);
                            }}
                            className={`p-3 text-2xl rounded-xl hover:scale-110 transition-all duration-200 ${
                              userEmojis.includes(emoji) 
                                ? 'bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 ring-2 ring-blue-400 dark:ring-blue-500 shadow-lg' 
                                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                      {/* Arrow pointer */}
                      <div className="absolute -bottom-2 left-4 w-4 h-4 bg-white dark:bg-gray-800 border-b-2 border-r-2 border-gray-200 dark:border-gray-700 rotate-45"></div>
                    </div>
                  </div>
                )}
              </div>
              )}
              
              {/* Reply Button - Only show for authenticated users */}
              {isAuthenticated && (
              <button
                onClick={() => setShowReply(!showReply)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
              >
                <MessageCircle size={14} />
                <span>Reply</span>
              </button>
              )}
            </div>

            {showReply && (
              <div className="mt-3 space-y-2">
                <div className="rounded-lg overflow-hidden backdrop-blur-xl bg-white/5 dark:bg-black/10 border border-white/20 dark:border-white/10">
                  <div className="flex items-center justify-between gap-2 p-2 bg-gray-50 dark:bg-gray-900 border-b border-white/20 dark:border-white/10">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => insertMarkdown('**', '**', 'bold')}
                        title="Bold (Ctrl+B)"
                        className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition-all duration-300"
                        type="button"
                      >
                        <Bold size={16} />
                      </button>
                      <button
                        onClick={() => insertMarkdown('*', '*', 'italic')}
                        title="Italic (Ctrl+I)"
                        className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition-all duration-300"
                        type="button"
                      >
                        <Italic size={16} />
                      </button>
                      <button
                        onClick={() => insertMarkdown('`', '`', 'code')}
                        title="Code"
                        className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition-all duration-300"
                        type="button"
                      >
                        <Code size={16} />
                      </button>
                      <button
                        onClick={() => insertMarkdown('[', '](url)', 'link')}
                        title="Link"
                        className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition-all duration-300"
                        type="button"
                      >
                        <LinkIcon size={16} />
                      </button>
                    </div>
                    <button
                      onClick={() => setShowPreview(!showPreview)}
                      className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition-all duration-300"
                      type="button"
                    >
                      <Eye size={14} />
                      {showPreview ? 'Edit' : 'Preview'}
                    </button>
                  </div>

                  {showPreview ? (
                    <div className="p-3 min-h-[100px] max-h-[200px] overflow-y-auto prose prose-sm dark:prose-invert">
                      {replyText ? (
                        <MarkdownRenderer content={replyText} />
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Nothing to preview...</p>
                      )}
                    </div>
                  ) : (
                    <textarea
                      ref={textareaRef}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write a reply with markdown support..."
                      rows={4}
                      className="w-full px-3 py-2 text-sm bg-transparent border-0 focus:outline-none resize-none"
                      onKeyDown={(e) => {
                        if (e.ctrlKey || e.metaKey) {
                          if (e.key === 'b') {
                            e.preventDefault();
                            insertMarkdown('**', '**', 'bold');
                          } else if (e.key === 'i') {
                            e.preventDefault();
                            insertMarkdown('*', '*', 'italic');
                          }
                        }
                      }}
                    />
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Markdown supported
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setShowReply(false);
                        setReplyText('');
                        setShowPreview(false);
                      }}
                      className="px-3 py-1.5 text-sm rounded-lg hover:bg-white/10 dark:hover:bg-white/5 transition-all duration-300"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleReplySubmit}
                      disabled={isSubmitting || !replyText.trim()}
                      className="px-3 py-1.5 text-sm rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Submitting...' : 'Reply'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </GlassCard>

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-4 border-l-2 border-gray-200 dark:border-gray-700 pl-0">
          {comment.replies.map(reply => (
            <Comment 
              key={reply.id} 
              comment={reply} 
              postId={postId}
              isReply 
              onReplySuccess={onReplySuccess}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setShowConfirmDelete(false)} style={{ zIndex: 99999 }}>
          <div 
            className="p-6 max-w-md w-full mx-4 animate-fade-in rounded-2xl backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 border border-gray-200 dark:border-gray-700 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20">
              <AlertTriangle className="text-red-600 dark:text-red-400" size={24} />
            </div>
            
            <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
              Delete Comment?
            </h3>
            
            <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
              This action cannot be undone. Are you sure you want to delete this comment?
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="flex-1 px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 text-white font-medium hover:from-red-600 hover:to-orange-600 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
