import { ArrowUp, ArrowDown, MessageCircle, MoreHorizontal, Bold, Italic, Code, Link as LinkIcon, Eye } from 'lucide-react';
import { Comment as CommentType } from '../types';
import { GlassCard } from './GlassCard';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { VerifiedBadge } from './VerifiedBadge';
import { Tooltip } from './Tooltip';
import { useState, useRef } from 'react';
import { MarkdownRenderer } from '../utils/markdownRenderer';

interface CommentProps {
  comment: CommentType;
  isReply?: boolean;
}

export function Comment({ comment, isReply = false }: CommentProps) {
  const [upvoted, setUpvoted] = useState(comment.hasUpvoted);
  const [downvoted, setDownvoted] = useState(comment.hasDownvoted);
  const [upvotes, setUpvotes] = useState(comment.upvotes);
  const [downvotes, setDownvotes] = useState(comment.downvotes);
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleUpvote = () => {
    if (upvoted) {
      setUpvoted(false);
      setUpvotes(upvotes - 1);
    } else {
      setUpvoted(true);
      setUpvotes(upvotes + 1);
      if (downvoted) {
        setDownvoted(false);
        setDownvotes(downvotes - 1);
      }
    }
  };

  const handleDownvote = () => {
    if (downvoted) {
      setDownvoted(false);
      setDownvotes(downvotes - 1);
    } else {
      setDownvoted(true);
      setDownvotes(downvotes + 1);
      if (upvoted) {
        setUpvoted(false);
        setUpvotes(upvotes - 1);
      }
    }
  };

  const timeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
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

  return (
    <div className={isReply ? 'ml-8 sm:ml-12' : ''}>
      <GlassCard className="p-3 sm:p-4 hover:shadow-lg transition-shadow duration-300">
        <div className="flex gap-3 sm:gap-4">
          <div className="flex flex-col items-center gap-1.5">
            <Tooltip content={`@${comment.author.username}`}>
              <Avatar src={comment.author.avatar} alt={comment.author.username} size="sm" className="cursor-pointer ring-2 ring-transparent hover:ring-blue-500 transition-all" />
            </Tooltip>
            <div className="flex flex-col items-center gap-1 mt-1">
              <button
                onClick={handleUpvote}
                className={`p-1.5 rounded-lg transition-all duration-300 hover:scale-110 ${
                  upvoted ? 'bg-green-500/20 text-green-500' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <ArrowUp size={14} strokeWidth={upvoted ? 2.5 : 2} />
              </button>
              <span className="text-xs sm:text-sm font-bold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800">{upvotes - downvotes}</span>
              <button
                onClick={handleDownvote}
                className={`p-1.5 rounded-lg transition-all duration-300 hover:scale-110 ${
                  downvoted ? 'bg-red-500/20 text-red-500' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <ArrowDown size={14} strokeWidth={downvoted ? 2.5 : 2} />
              </button>
            </div>
          </div>

          <div className="flex-1 space-y-2 sm:space-y-3 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm sm:text-base">
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
                    {timeAgo(comment.timestamp)}
                  </span>
                </div>
              </div>
              <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 flex-shrink-0">
                <MoreHorizontal size={16} />
              </button>
            </div>

            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">{comment.content}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowReply(!showReply)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
              >
                <MessageCircle size={14} />
                <span>Reply</span>
              </button>
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
                    <button className="px-3 py-1.5 text-sm rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 shadow-sm hover:shadow-md">
                      Reply
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
            <Comment key={reply.id} comment={reply} isReply />
          ))}
        </div>
      )}
    </div>
  );
}
