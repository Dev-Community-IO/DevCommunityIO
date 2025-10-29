import { useState, useEffect } from 'react';
import { Trophy, Award, Lock, Sparkles } from 'lucide-react';
import { AchievementBadge } from './AchievementBadge';
import { GlassCard } from './GlassCard';

interface Achievement {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert' | 'legendary';
  points: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  isShowcased?: boolean;
}

interface AchievementsPanelProps {
  userId: string;
}

export function AchievementsPanel({ userId }: AchievementsPanelProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
  }, [userId]);

  const loadAchievements = async () => {
    try {
      // TODO: Replace with real API call
      // const data = await achievementsService.getUserAchievements(userId);
      
      // Mock data for now
      setAchievements([
        {
          id: '1',
          slug: 'first-post',
          name: 'First Post',
          description: 'Published your very first post',
          icon: '📝',
          category: 'content',
          difficulty: 'easy',
          points: 10,
          isUnlocked: true,
          unlockedAt: '2024-01-15',
          isShowcased: true,
        },
        {
          id: '2',
          slug: 'first-comment',
          name: 'Conversation Starter',
          description: 'Left your first comment',
          icon: '💬',
          category: 'engagement',
          difficulty: 'easy',
          points: 5,
          isUnlocked: true,
          unlockedAt: '2024-01-16',
        },
        {
          id: '3',
          slug: '10-posts',
          name: 'Content Creator',
          description: 'Published 10 posts',
          icon: '📚',
          category: 'content',
          difficulty: 'medium',
          points: 50,
          isUnlocked: false,
        },
        // Add more...
      ]);
    } catch (error) {
      console.error('Failed to load achievements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleShowcase = (id: string) => {
    setAchievements((prev) =>
      prev.map((achievement) =>
        achievement.id === id
          ? { ...achievement, isShowcased: !achievement.isShowcased }
          : achievement
      )
    );
    // TODO: Call API to update showcase status
  };

  const filteredAchievements = achievements.filter((achievement) => {
    if (filter === 'all') return true;
    if (filter === 'unlocked') return achievement.isUnlocked;
    if (filter === 'locked') return !achievement.isUnlocked;
    return achievement.category === filter;
  });

  const stats = {
    total: achievements.length,
    unlocked: achievements.filter((a) => a.isUnlocked).length,
    totalPoints: achievements
      .filter((a) => a.isUnlocked)
      .reduce((sum, a) => sum + a.points, 0),
  };

  const categories = [
    { value: 'all', label: 'All', icon: Trophy },
    { value: 'unlocked', label: 'Unlocked', icon: Award },
    { value: 'locked', label: 'Locked', icon: Lock },
    { value: 'content', label: 'Content', icon: Sparkles },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <GlassCard className="p-4 text-center">
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {stats.unlocked}/{stats.total}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Achievements</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
            {stats.totalPoints}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Points</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {Math.round((stats.unlocked / stats.total) * 100)}%
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Completion</p>
        </GlassCard>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <button
              key={category.value}
              onClick={() => setFilter(category.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                filter === category.value
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <Icon size={16} />
              {category.label}
            </button>
          );
        })}
      </div>

      {/* Achievements Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Loading achievements...</p>
        </div>
      ) : (
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
          {filteredAchievements.map((achievement) => (
            <AchievementBadge
              key={achievement.id}
              achievement={achievement}
              size="md"
              showDetails
              onToggleShowcase={achievement.isUnlocked ? handleToggleShowcase : undefined}
            />
          ))}
        </div>
      )}

      {filteredAchievements.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No achievements found</p>
        </div>
      )}
    </div>
  );
}

