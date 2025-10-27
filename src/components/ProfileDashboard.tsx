import { TrendingUp, MessageSquare, ThumbsUp, Users, Award, Target, Clock, Activity } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface ProfileDashboardProps {
  user: {
    username: string;
    stats: {
      posts: number;
      replies: number;
      upvotes: number;
      followers: number;
      following: number;
    };
  };
}

export function ProfileDashboard({ user }: ProfileDashboardProps) {
  const activityData = [
    { month: 'Jan', posts: 12, replies: 45, upvotes: 230 },
    { month: 'Feb', posts: 18, replies: 52, upvotes: 310 },
    { month: 'Mar', posts: 15, replies: 68, upvotes: 420 },
    { month: 'Apr', posts: 22, replies: 71, upvotes: 510 },
    { month: 'May', posts: 28, replies: 89, upvotes: 680 },
    { month: 'Jun', posts: 47, replies: 95, upvotes: 890 }
  ];

  const recentActivity = [
    { type: 'post', title: 'Understanding DeFi Protocols', time: '2 hours ago', upvotes: 45 },
    { type: 'reply', title: 'Re: Smart Contract Security', time: '5 hours ago', upvotes: 12 },
    { type: 'post', title: 'Web3 Development Best Practices', time: '1 day ago', upvotes: 89 },
    { type: 'reply', title: 'Re: Layer 2 Solutions', time: '2 days ago', upvotes: 23 },
    { type: 'post', title: 'NFT Marketplace Architecture', time: '3 days ago', upvotes: 156 }
  ];

  const achievements = [
    { icon: Award, title: 'Top Contributor', description: 'Reached 1000 upvotes', color: 'from-yellow-400 to-orange-500' },
    { icon: MessageSquare, title: 'Active Commenter', description: '500+ helpful replies', color: 'from-blue-400 to-cyan-500' },
    { icon: Users, title: 'Community Builder', description: '1000+ followers', color: 'from-purple-400 to-pink-500' },
    { icon: Target, title: 'Consistent Creator', description: '30 day streak', color: 'from-green-400 to-teal-500' }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <GlassCard className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-3">
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">Total Posts</p>
              <p className="text-2xl sm:text-3xl font-bold mt-0.5 sm:mt-1">{user.stats.posts}</p>
              <p className="text-[10px] sm:text-xs text-green-500 mt-0.5 sm:mt-1 flex items-center gap-1">
                <TrendingUp size={10} className="sm:w-3 sm:h-3" />
                <span className="hidden sm:inline">+12% this month</span>
                <span className="sm:hidden">+12%</span>
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg sm:rounded-xl self-end sm:self-auto">
              <MessageSquare size={20} className="text-white sm:w-6 sm:h-6" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-3">
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">Total Replies</p>
              <p className="text-2xl sm:text-3xl font-bold mt-0.5 sm:mt-1">{user.stats.replies}</p>
              <p className="text-[10px] sm:text-xs text-green-500 mt-0.5 sm:mt-1 flex items-center gap-1">
                <TrendingUp size={10} className="sm:w-3 sm:h-3" />
                <span className="hidden sm:inline">+8% this month</span>
                <span className="sm:hidden">+8%</span>
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg sm:rounded-xl self-end sm:self-auto">
              <Activity size={20} className="text-white sm:w-6 sm:h-6" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-3">
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">Total Upvotes</p>
              <p className="text-2xl sm:text-3xl font-bold mt-0.5 sm:mt-1">{user.stats.upvotes}</p>
              <p className="text-[10px] sm:text-xs text-green-500 mt-0.5 sm:mt-1 flex items-center gap-1">
                <TrendingUp size={10} className="sm:w-3 sm:h-3" />
                <span className="hidden sm:inline">+15% this month</span>
                <span className="sm:hidden">+15%</span>
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg sm:rounded-xl self-end sm:self-auto">
              <ThumbsUp size={20} className="text-white sm:w-6 sm:h-6" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-3">
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">Followers</p>
              <p className="text-2xl sm:text-3xl font-bold mt-0.5 sm:mt-1">{user.stats.followers}</p>
              <p className="text-[10px] sm:text-xs text-green-500 mt-0.5 sm:mt-1 flex items-center gap-1">
                <TrendingUp size={10} className="sm:w-3 sm:h-3" />
                <span className="hidden sm:inline">+20% this month</span>
                <span className="sm:hidden">+20%</span>
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg sm:rounded-xl self-end sm:self-auto">
              <Users size={20} className="text-white sm:w-6 sm:h-6" />
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Activity Chart */}
        <GlassCard className="p-4 sm:p-6 lg:col-span-2">
          <h3 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 flex items-center gap-2">
            <TrendingUp size={18} className="text-blue-500 sm:w-5 sm:h-5" />
            Activity Overview
          </h3>
          <div className="space-y-3 sm:space-y-4">
            {activityData.map((data, index) => (
              <div key={index} className="space-y-1.5 sm:space-y-2">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{data.month}</span>
                  <div className="flex gap-2 sm:gap-4 text-[10px] sm:text-xs">
                    <span className="text-blue-500"><span className="hidden sm:inline">{data.posts} posts</span><span className="sm:hidden">{data.posts}p</span></span>
                    <span className="text-purple-500"><span className="hidden sm:inline">{data.replies} replies</span><span className="sm:hidden">{data.replies}r</span></span>
                    <span className="text-green-500"><span className="hidden sm:inline">{data.upvotes} upvotes</span><span className="sm:hidden">{data.upvotes}u</span></span>
                  </div>
                </div>
                <div className="flex gap-0.5 sm:gap-1 h-1.5 sm:h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                    style={{ width: `${(data.posts / 50) * 100}%` }}
                  />
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                    style={{ width: `${(data.replies / 100) * 100}%` }}
                  />
                  <div
                    className="bg-gradient-to-r from-green-500 to-teal-500 rounded-full"
                    style={{ width: `${(data.upvotes / 1000) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Recent Activity */}
        <GlassCard className="p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 flex items-center gap-2">
            <Clock size={18} className="text-purple-500 sm:w-5 sm:h-5" />
            Recent Activity
          </h3>
          <div className="space-y-3 sm:space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex gap-2 sm:gap-3 group cursor-pointer">
                <div className={`flex-shrink-0 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mt-1.5 sm:mt-2 ${
                  activity.type === 'post' ? 'bg-blue-500' : 'bg-purple-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium group-hover:text-blue-500 transition-colors line-clamp-1">
                    {activity.title}
                  </p>
                  <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1">
                    <span>{activity.time}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp size={10} />
                      {activity.upvotes}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Achievements */}
      <GlassCard className="p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 flex items-center gap-2">
          <Award size={18} className="text-yellow-500 sm:w-5 sm:h-5" />
          Achievements
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {achievements.map((achievement, index) => {
            const Icon = achievement.icon;
            return (
              <div
                key={index}
                className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 hover:scale-105 transition-transform duration-300 cursor-pointer"
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br ${achievement.color} flex items-center justify-center mb-2 sm:mb-3`}>
                  <Icon size={20} className="text-white sm:w-6 sm:h-6" />
                </div>
                <h4 className="font-bold text-xs sm:text-sm mb-0.5 sm:mb-1 line-clamp-1">{achievement.title}</h4>
                <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{achievement.description}</p>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
}
