import { Award, MessageSquare, Users, Target } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface ProfileAchievementsProps {
  userId: string;
}

export function ProfileAchievements({ userId }: ProfileAchievementsProps) {
  const achievements = [
    { icon: Award, title: 'Top Contributor', description: 'Reached 1000 upvotes', color: 'from-yellow-400 to-orange-500' },
    { icon: MessageSquare, title: 'Active Commenter', description: '500+ helpful replies', color: 'from-blue-400 to-cyan-500' },
    { icon: Users, title: 'Community Builder', description: '1000+ followers', color: 'from-purple-400 to-pink-500' },
    { icon: Target, title: 'Consistent Creator', description: '30 day streak', color: 'from-green-400 to-teal-500' }
  ];

  return (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          <Award size={20} className="text-yellow-500" />
          Achievements
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {achievements.map((achievement, index) => {
            const Icon = achievement.icon;
            return (
              <div
                key={index}
                className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 hover:scale-105 transition-transform duration-300 cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${achievement.color} flex items-center justify-center mb-3`}>
                  <Icon size={24} className="text-white" />
                </div>
                <h4 className="font-bold text-sm mb-1">{achievement.title}</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">{achievement.description}</p>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
}
