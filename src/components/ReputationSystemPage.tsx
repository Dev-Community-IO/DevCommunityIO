import { useState, useEffect } from 'react';
import { ArrowLeft, Award, Zap, Shield, Unlock, MessageSquare, FileText, Users, Calendar, Briefcase, Trophy, CheckCircle, Loader2 } from 'lucide-react';
import { GlassCard } from './GlassCard';
import reputationSystemService, { ReputationSystemStats } from '../services/api/reputationSystem.service';
import { isNetworkError } from '../services/api/config';

interface ReputationSystemPageProps {
  onBack: () => void;
}

export function ReputationSystemPage({ onBack }: ReputationSystemPageProps) {
  const [stats, setStats] = useState<ReputationSystemStats | null>(null);
  const [reputationRequirements, setReputationRequirements] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [statsData, requirementsData] = await Promise.all([
          reputationSystemService.getStats(),
          reputationSystemService.getRequirements().catch(() => ({ requirements: {} })),
        ]);
        setStats(statsData);
        setReputationRequirements(requirementsData.requirements || {});
      } catch (err: any) {
        if (!isNetworkError(err)) {
          console.error('Error fetching reputation system data:', err);
          setError(err.response?.data?.message || 'Failed to load reputation system data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getActionLabel = (action: string): string => {
    const labels: Record<string, string> = {
      'post_created': 'Post Created',
      'post_upvoted': 'Post Upvoted',
      'post_downvoted': 'Post Downvoted',
      'comment_created': 'Comment Created',
      'comment_upvoted': 'Comment Upvoted',
      'emoji_received': 'Emoji Reaction Received',
      'follow_received': 'Follow Received',
      'share_received': 'Share Received',
      'bookmark_received': 'Bookmark Received',
      'achievement_unlocked': 'Achievement Unlocked',
      'content_removed': 'Content Removed',
      'post_reported': 'Post Reported',
    };
    return labels[action] || action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-200 group"
        >
          <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Reputation System
          </h1>
        </div>
      </div>

      {loading ? (
        <GlassCard className="p-6 md:p-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 size={32} className="animate-spin text-blue-500" />
          </div>
        </GlassCard>
      ) : error ? (
        <GlassCard className="p-6 md:p-8">
          <div className="text-center py-12">
            <p className="text-red-500 mb-2">{error}</p>
          </div>
        </GlassCard>
      ) : stats ? (
        <div className="space-y-4">
          {/* How It Works */}
          <GlassCard className="p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Zap size={24} className="text-gray-700 dark:text-gray-300" />
              How Reputation Works
            </h2>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Reputation is a measure of your contribution and engagement within the DevCommunity platform. 
                It reflects the quality and value of your content, interactions, and community participation.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Earn Reputation</h3>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <li>• Create quality posts and comments</li>
                    <li>• Receive upvotes and reactions</li>
                    <li>• Get followed by other users</li>
                    <li>• Unlock achievements</li>
                    <li>• Share valuable content</li>
                  </ul>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Lose Reputation</h3>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <li>• Receive downvotes</li>
                    <li>• Have content removed</li>
                    <li>• Get reported for violations</li>
                    <li>• Delete your own content</li>
                  </ul>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* What Reputation Allows You To Do */}
          <GlassCard className="p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Unlock size={24} className="text-gray-700 dark:text-gray-300" />
              What Reputation Allows You To Do
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-3">
                  <FileText size={20} className="text-gray-700 dark:text-gray-300" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Create Posts</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {reputationRequirements.post > 0 ? (
                    <>Requires <strong className="text-blue-600 dark:text-blue-400">{reputationRequirements.post}+</strong> reputation</>
                  ) : (
                    <>Available to all users</>
                  )}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Share your knowledge, ideas, and projects with the community
                </p>
              </div>

              <div className="p-5 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-3">
                  <MessageSquare size={20} className="text-gray-700 dark:text-gray-300" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Comment on Posts</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {reputationRequirements.comment > 0 ? (
                    <>Requires <strong className="text-blue-600 dark:text-blue-400">{reputationRequirements.comment}+</strong> reputation</>
                  ) : (
                    <>Available to all users</>
                  )}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Engage in discussions and provide feedback on posts
                </p>
              </div>

              <div className="p-5 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-3">
                  <Users size={20} className="text-gray-700 dark:text-gray-300" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Create Pages</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {reputationRequirements.page > 0 ? (
                    <>Requires <strong className="text-blue-600 dark:text-blue-400">{reputationRequirements.page}+</strong> reputation</>
                  ) : (
                    <>Available to all users</>
                  )}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Build your own community page and gather followers
                </p>
              </div>

              <div className="p-5 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-3">
                  <Trophy size={20} className="text-gray-700 dark:text-gray-300" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Create Hackathons</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {reputationRequirements.hackathon > 0 ? (
                    <>Requires <strong className="text-blue-600 dark:text-blue-400">{reputationRequirements.hackathon}+</strong> reputation</>
                  ) : (
                    <>Available to all users</>
                  )}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Organize coding competitions and challenges
                </p>
              </div>

              <div className="p-5 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-3">
                  <Calendar size={20} className="text-gray-700 dark:text-gray-300" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Create Events</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {reputationRequirements.event > 0 ? (
                    <>Requires <strong className="text-blue-600 dark:text-blue-400">{reputationRequirements.event}+</strong> reputation</>
                  ) : (
                    <>Available to all users</>
                  )}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Announce and organize community events and meetups
                </p>
              </div>

              <div className="p-5 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-3">
                  <Briefcase size={20} className="text-gray-700 dark:text-gray-300" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Post Opportunities</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {reputationRequirements.opportunity > 0 ? (
                    <>Requires <strong className="text-blue-600 dark:text-blue-400">{reputationRequirements.opportunity}+</strong> reputation</>
                  ) : (
                    <>Available to all users</>
                  )}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Share job openings, freelance gigs, and career opportunities
                </p>
              </div>

              <div className="p-5 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle size={20} className="text-gray-700 dark:text-gray-300" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Request Verification</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {reputationRequirements.verification > 0 ? (
                    <>Requires <strong className="text-blue-600 dark:text-blue-400">{reputationRequirements.verification}+</strong> reputation</>
                  ) : (
                    <>Requires <strong className="text-blue-600 dark:text-blue-400">200+</strong> reputation</>
                  )}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Get verified badge to show your trusted status in the community
                </p>
              </div>

              <div className="p-5 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-3">
                  <Award size={20} className="text-gray-700 dark:text-gray-300" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Unlock Achievements</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Various reputation thresholds
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Earn badges and achievements as you reach different reputation milestones
                </p>
              </div>

              <div className="p-5 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-3">
                  <Shield size={20} className="text-gray-700 dark:text-gray-300" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Build Trust</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Higher reputation = More credibility
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Your reputation score reflects your standing and trustworthiness in the community
                </p>
              </div>
            </div>
          </GlassCard>

          {/* Reputation Rules */}
          <GlassCard className="p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Shield size={24} className="text-gray-700 dark:text-gray-300" />
              Reputation Rules
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Action</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Points</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.rules.database.length > 0 ? (
                    stats.rules.database.map((rule, index) => (
                      <tr key={index} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                          {getActionLabel(rule.action)}
                        </td>
                        <td className={`py-3 px-4 text-right font-semibold ${
                          rule.points > 0 ? 'text-green-600 dark:text-green-400' : 
                          rule.points < 0 ? 'text-red-600 dark:text-red-400' : 
                          'text-gray-600 dark:text-gray-400'
                        }`}>
                          {rule.points > 0 ? '+' : ''}{rule.points}
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                          {rule.description || '-'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    stats.rules.defaults.map((rule, index) => (
                      <tr key={index} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                          {getActionLabel(rule.action)}
                        </td>
                        <td className={`py-3 px-4 text-right font-semibold ${
                          rule.points > 0 ? 'text-green-600 dark:text-green-400' : 
                          rule.points < 0 ? 'text-red-600 dark:text-red-400' : 
                          'text-gray-600 dark:text-gray-400'
                        }`}>
                          {rule.points > 0 ? '+' : ''}{rule.points}
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">-</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      ) : null}
    </div>
  );
}

