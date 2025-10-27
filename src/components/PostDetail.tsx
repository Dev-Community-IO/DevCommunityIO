import { ArrowLeft, ArrowUp, ArrowDown, MessageCircle, Share2, Bookmark, MoreHorizontal } from 'lucide-react';
import { Post, Comment as CommentType } from '../types';
import { GlassCard } from './GlassCard';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { Comment } from './Comment';
import { VerifiedBadge } from './VerifiedBadge';
import { Tooltip } from './Tooltip';
import { EmojiReactions } from './EmojiReactions';
import { MarkdownEditor } from './MarkdownEditor';
import { MarkdownRenderer } from '../utils/markdownRenderer';
import { useState } from 'react';

interface PostDetailProps {
  post: Post;
  onBack: () => void;
}

const mockComments: CommentType[] = [
  {
    id: '1',
    author: {
      id: '5',
      username: 'SmartContractAuditor',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SmartContractAuditor',
      walletAddress: '0x321f...88a2',
      reputation: 4200,
      isVerified: true
    },
    content: 'Great analysis! I\'d also add that liquid staking derivatives introduce systemic risks that need careful consideration. The recursive staking problem is particularly concerning.',
    upvotes: 89,
    downvotes: 3,
    timestamp: new Date(Date.now() - 3600000),
    hasUpvoted: true,
    replies: [
      {
        id: '2',
        author: {
          id: '6',
          username: 'DeFiResearcher',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DeFiResearcher',
          walletAddress: '0x789d...23c4',
          reputation: 3100,
          isVerified: false
        },
        content: 'Absolutely! The concentration of LSDs in DeFi protocols could create cascading liquidation events. We saw this play out with stETH during the Terra collapse.',
        upvotes: 45,
        downvotes: 2,
        timestamp: new Date(Date.now() - 3000000),
        hasUpvoted: false
      }
    ]
  },
  {
    id: '3',
    author: {
      id: '7',
      username: 'ValidatorNode',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ValidatorNode',
      walletAddress: '0x456b...91d3',
      reputation: 2800,
      isVerified: true
    },
    content: 'As someone running validator nodes, I think LSDs are a net positive for network security. They lower the barrier to entry for staking and increase participation rates.',
    upvotes: 67,
    downvotes: 8,
    timestamp: new Date(Date.now() - 7200000),
    hasUpvoted: false
  }
];

export function PostDetail({ post, onBack }: PostDetailProps) {
  const [upvoted, setUpvoted] = useState(post.hasUpvoted);
  const [downvoted, setDownvoted] = useState(post.hasDownvoted);
  const [upvotes, setUpvotes] = useState(post.upvotes);
  const [downvotes, setDownvotes] = useState(post.downvotes);
  const [bookmarked, setBookmarked] = useState(false);
  const [comment, setComment] = useState('');

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

  return (
    <div className="space-y-4 sm:space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors group mb-4 sm:mb-6"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm sm:text-base font-medium">Back to Feed</span>
      </button>

      <GlassCard className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-4">
          <div className="hidden sm:flex flex-col items-center gap-2 pt-1">
            <button
              onClick={handleUpvote}
              className={`p-2.5 rounded-xl transition-all duration-300 hover:scale-110 ${
                upvoted
                  ? 'bg-green-500/20 text-green-500 shadow-lg shadow-green-500/20'
                  : 'hover:bg-gray-100 dark:hover:bg-white/5'
              }`}
            >
              <ArrowUp size={20} strokeWidth={upvoted ? 2.5 : 2} />
            </button>
            <span className="font-bold text-lg px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 min-w-[44px] text-center">
              {upvotes - downvotes}
            </span>
            <button
              onClick={handleDownvote}
              className={`p-2.5 rounded-xl transition-all duration-300 hover:scale-110 ${
                downvoted
                  ? 'bg-red-500/20 text-red-500 shadow-lg shadow-red-500/20'
                  : 'hover:bg-gray-100 dark:hover:bg-white/5'
              }`}
            >
              <ArrowDown size={20} strokeWidth={downvoted ? 2.5 : 2} />
            </button>
          </div>

          <div className="flex-1 space-y-4 sm:space-y-5 min-w-0">
            <div>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <Tooltip content={`@${post.author.username}`}>
                    <Avatar src={post.author.avatar} alt={post.author.username} size="md" className="cursor-pointer ring-2 ring-gray-200 dark:ring-gray-700" />
                  </Tooltip>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm sm:text-base">
                        {post.author.username}
                      </span>
                      {post.author.isVerified && (
                        <VerifiedBadge size={16} />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      <span>{timeAgo(post.timestamp)}</span>
                      <span>•</span>
                      <span className="text-xs">{Math.ceil(post.content.length / 200)} min read</span>
                    </div>
                  </div>
                </div>
                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-300 flex-shrink-0">
                  <MoreHorizontal size={20} />
                </button>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold mb-4 leading-tight">{post.title}</h1>

              <div className="flex flex-wrap gap-2 mb-5">
                {post.tags.map(tag => (
                  <span key={tag} className="px-3 py-1.5 text-xs sm:text-sm font-medium bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-700 transition-colors cursor-pointer">
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="prose prose-gray dark:prose-invert max-w-none">
                <MarkdownRenderer content={post.content} />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 pt-4 sm:pt-5 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center flex-wrap gap-2">
                <div className="sm:hidden flex items-center gap-2 mr-2">
                  <button
                    onClick={handleUpvote}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-300 ${
                      upvoted
                        ? 'bg-green-500/20 text-green-500'
                        : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    <ArrowUp size={16} strokeWidth={upvoted ? 2.5 : 2} />
                    <span className="text-sm font-semibold">{upvotes - downvotes}</span>
                  </button>
                  <button
                    onClick={handleDownvote}
                    className={`p-2 rounded-lg transition-all duration-300 ${
                      downvoted
                        ? 'bg-red-500/20 text-red-500'
                        : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    <ArrowDown size={16} strokeWidth={downvoted ? 2.5 : 2} />
                  </button>
                </div>

                <EmojiReactions />

                <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300">
                  <MessageCircle size={16} />
                  <span className="text-xs sm:text-sm font-medium">{mockComments.length + mockComments.filter(c => c.replies).length}</span>
                </button>
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300">
                  <Share2 size={16} />
                  <span className="text-xs sm:text-sm font-medium hidden sm:inline">Share</span>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setBookmarked(!bookmarked)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                    bookmarked
                      ? 'bg-yellow-500/20 text-yellow-500 shadow-lg shadow-yellow-500/20'
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <Bookmark size={16} fill={bookmarked ? 'currentColor' : 'none'} />
                  <span className="text-xs sm:text-sm font-medium">{bookmarked ? 'Saved' : 'Save'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
          <MessageCircle size={20} className="text-blue-500" />
          Add a Comment
        </h3>
        <div className="space-y-3 sm:space-y-4">
          <MarkdownEditor
            value={comment}
            onChange={setComment}
            placeholder="Share your thoughts..."
            minHeight="150px"
          />
          <div className="flex justify-end">
            <Button variant="primary" size="sm">Post Comment</Button>
          </div>
        </div>
      </GlassCard>

      <div className="space-y-4">
        <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2">
          <MessageCircle size={20} className="text-gray-500 dark:text-gray-400" />
          Comments ({mockComments.length})
        </h3>
        {mockComments.map(comment => (
          <Comment key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
}
