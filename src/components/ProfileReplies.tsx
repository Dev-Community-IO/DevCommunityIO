import { useState } from 'react';
import { Search, MessageSquare, ThumbsUp, Calendar } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Avatar } from './Avatar';

interface ProfileRepliesProps {
  userId: string;
}

export function ProfileReplies({ userId }: ProfileRepliesProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const mockReplies = [
    {
      id: '1',
      content: 'Great analysis! I completely agree with your points about liquid staking derivatives and their systemic risks.',
      postTitle: 'Understanding Liquid Staking Derivatives',
      upvotes: 45,
      timestamp: new Date(Date.now() - 3600000)
    },
    {
      id: '2',
      content: 'This is exactly what the community needs. Clear, concise explanations of complex DeFi concepts.',
      postTitle: 'DeFi Protocol Architecture',
      upvotes: 32,
      timestamp: new Date(Date.now() - 7200000)
    },
    {
      id: '3',
      content: 'Have you considered the impact of MEV on this? It could significantly affect the outcomes you described.',
      postTitle: 'Layer 2 Scaling Solutions',
      upvotes: 28,
      timestamp: new Date(Date.now() - 86400000)
    },
    {
      id: '4',
      content: 'I implemented this in production and saw a 40% improvement in gas efficiency. Great work!',
      postTitle: 'Smart Contract Optimization Tips',
      upvotes: 67,
      timestamp: new Date(Date.now() - 172800000)
    },
    {
      id: '5',
      content: 'Could you elaborate on the security considerations? This seems like it might introduce new attack vectors.',
      postTitle: 'Cross-Chain Bridge Design',
      upvotes: 19,
      timestamp: new Date(Date.now() - 259200000)
    }
  ];

  const filteredReplies = mockReplies.filter(reply =>
    reply.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reply.postTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      {filteredReplies.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">No replies found</p>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {filteredReplies.map(reply => (
            <GlassCard key={reply.id} className="p-5 hover:scale-[1.01] transition-transform duration-300 cursor-pointer">
              <div className="space-y-3">
                {/* Reply Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 mb-2">
                      <MessageSquare size={14} />
                      Replied to:
                      <span className="font-semibold text-blue-500 hover:text-blue-600">
                        {reply.postTitle}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {timeAgo(reply.timestamp)}
                    </span>
                  </div>
                </div>

                {/* Reply Content */}
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {reply.content}
                </p>

                {/* Reply Footer */}
                <div className="flex items-center gap-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 text-sm">
                    <ThumbsUp size={14} className="text-green-500" />
                    <span className="font-semibold">{reply.upvotes}</span>
                    <span className="text-gray-500 dark:text-gray-400">upvotes</span>
                  </button>
                  <button className="text-sm text-blue-500 hover:text-blue-600 font-medium">
                    View Thread
                  </button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
