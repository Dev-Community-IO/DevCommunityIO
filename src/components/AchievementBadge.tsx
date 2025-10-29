import { useState } from 'react';
import { Lock, Check } from 'lucide-react';

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

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  onToggleShowcase?: (id: string) => void;
}

export function AchievementBadge({
  achievement,
  size = 'md',
  showDetails = false,
  onToggleShowcase,
}: AchievementBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const difficultyColors = {
    easy: 'from-green-500 to-emerald-500',
    medium: 'from-blue-500 to-cyan-500',
    hard: 'from-purple-500 to-pink-500',
    expert: 'from-orange-500 to-red-500',
    legendary: 'from-yellow-500 via-amber-500 to-orange-500',
  };

  const sizeClasses = {
    sm: 'w-12 h-12 text-2xl',
    md: 'w-16 h-16 text-3xl',
    lg: 'w-24 h-24 text-5xl',
  };

  return (
    <div
      className="relative group"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Badge */}
      <div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer ${
          achievement.isUnlocked
            ? `bg-gradient-to-br ${difficultyColors[achievement.difficulty]} shadow-lg hover:shadow-xl hover:scale-110`
            : 'bg-gray-300 dark:bg-gray-700 opacity-50 grayscale'
        }`}
        onClick={() => {
          if (achievement.isUnlocked && onToggleShowcase) {
            onToggleShowcase(achievement.id);
          }
        }}
      >
        {achievement.isUnlocked ? (
          <span className="filter drop-shadow-lg">{achievement.icon}</span>
        ) : (
          <Lock size={size === 'sm' ? 16 : size === 'md' ? 20 : 28} className="text-gray-500" />
        )}
      </div>

      {/* Showcase Indicator */}
      {achievement.isUnlocked && achievement.isShowcased && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900">
          <Check size={12} className="text-white" />
        </div>
      )}

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-4 py-3 bg-gray-900 dark:bg-gray-800 text-white rounded-lg shadow-xl z-50 w-64 animate-fade-in">
          <div className="flex items-start gap-3 mb-2">
            <span className="text-3xl">{achievement.icon}</span>
            <div className="flex-1">
              <h4 className="font-bold text-sm mb-1">{achievement.name}</h4>
              <p className="text-xs text-gray-300 mb-2">{achievement.description}</p>
              <div className="flex items-center gap-2 text-xs">
                <span
                  className={`px-2 py-0.5 rounded-full bg-gradient-to-r ${
                    difficultyColors[achievement.difficulty]
                  } font-medium`}
                >
                  {achievement.difficulty}
                </span>
                <span className="text-yellow-400">⭐ {achievement.points} points</span>
              </div>
            </div>
          </div>
          {achievement.isUnlocked && achievement.unlockedAt && (
            <p className="text-xs text-gray-400 border-t border-gray-700 pt-2 mt-2">
              Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
            </p>
          )}
          {!achievement.isUnlocked && (
            <p className="text-xs text-gray-400 border-t border-gray-700 pt-2 mt-2">
              🔒 Locked - Keep progressing to unlock!
            </p>
          )}
          {/* Tooltip Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-8 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
        </div>
      )}

      {/* Details Card (for expanded view) */}
      {showDetails && (
        <div className="mt-2 text-center">
          <p className="text-xs font-medium truncate">{achievement.name}</p>
          {achievement.isUnlocked && (
            <p className="text-xs text-green-600 dark:text-green-400">✓ Unlocked</p>
          )}
        </div>
      )}
    </div>
  );
}

