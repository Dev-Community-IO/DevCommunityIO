import { Award, Lock, Target } from 'lucide-react';

interface AchievementBadgeProps {
    achievement: {
        id: number;
        name: string;
        description: string;
        icon: string;
        image_url?: string;
        difficulty: 'easy' | 'medium' | 'hard' | 'expert' | 'legendary';
        points?: number; // Legacy field
        reputation_required?: number; // New field
        isUnlocked?: boolean;
        unlocked_at?: string;
        is_showcased?: boolean;
        criteria?: {
            type: string;
            value: number | boolean;
        };
    };
    size?: 'sm' | 'md' | 'lg';
    showDetails?: boolean;
    onClick?: () => void;
}

const difficultyColors = {
    easy: 'from-green-400 to-emerald-500',
    medium: 'from-blue-400 to-cyan-500',
    hard: 'from-purple-400 to-pink-500',
    expert: 'from-amber-400 to-orange-500',
    legendary: 'from-red-400 to-rose-500',
};

const difficultyLabels = {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    expert: 'Expert',
    legendary: 'Legendary',
};

const criteriaLabels: Record<string, string> = {
    posts_count: 'Create Posts',
    comments_count: 'Write Comments',
    upvotes_given: 'Give Upvotes',
    upvotes_received: 'Receive Upvotes',
    followers_count: 'Gain Followers',
    following_count: 'Follow Users',
    pages_created: 'Create Pages',
    reputation: 'Earn Reputation Points',
    reactions_received: 'Receive Reactions',
    bookmarks_received: 'Get Bookmarks',
    profile_complete: 'Complete Profile',
    is_verified: 'Verify Account',
    verified: 'Verify Account',
    first_post: 'Create First Post',
    first_comment: 'Write First Comment',
    first_page: 'Create First Page',
    streak_days: 'Maintain Streak',
    daily_streak: 'Daily Streak',
    daily_active: 'Daily Activity',
};

const getCriteriaDisplay = (criteria?: { type: string; value: number | boolean }): string => {
    if (!criteria || !criteria.type) return '';
    
    const label = criteriaLabels[criteria.type] || criteria.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    if (typeof criteria.value === 'boolean') {
        return criteria.value ? label : `Not ${label}`;
    }
    
    // Handle special cases
    if (criteria.type === 'daily_streak' || criteria.type === 'streak_days') {
        return `${label} for ${criteria.value} day${criteria.value !== 1 ? 's' : ''}`;
    }
    
    return `${label}: ${criteria.value}`;
};

const sizeClasses = {
    sm: 'w-16 h-16 text-2xl',
    md: 'w-24 h-24 text-4xl',
    lg: 'w-32 h-32 text-5xl',
};

export function AchievementBadge({
    achievement,
    size = 'md',
    showDetails = false,
    onClick,
}: AchievementBadgeProps) {
    // Handle both isUnlocked being undefined/null/true/false correctly
    const isUnlocked = achievement.isUnlocked === true; // Explicitly check for true
    const isLocked = !isUnlocked; // Explicitly set to false if not true
    const sizeClass = sizeClasses[size];
    const gradientClass = difficultyColors[achievement.difficulty];

    return (
        <div
            className={`relative group ${onClick ? 'cursor-pointer' : ''}`}
            onClick={onClick}
            title={showDetails ? undefined : achievement.name}
        >
            {/* Badge Container */}
            <div
                className={`
                    ${sizeClass}
                    rounded-full
                    ${isLocked 
                        ? 'bg-gray-200 dark:bg-gray-800' 
                        : `bg-gradient-to-br ${gradientClass} shadow-lg`
                    }
                    flex items-center justify-center
                    border-4
                    ${isLocked 
                        ? 'border-gray-300 dark:border-gray-700' 
                        : 'border-white dark:border-gray-200'
                    }
                    transition-all duration-300
                    ${onClick ? 'hover:scale-110 hover:shadow-xl' : ''}
                    ${isLocked ? '' : 'hover:rotate-3'}
                    overflow-hidden
                `}
            >
                {/* Image - Show for both locked and unlocked, but with grayscale filter for locked */}
                {achievement.image_url ? (
                    <img
                        src={achievement.image_url}
                        alt={achievement.name}
                        className={`w-full h-full rounded-full object-cover ${
                            isLocked ? 'grayscale opacity-60' : ''
                        }`}
                        onError={(e) => {
                            // If image fails to load, hide it and show fallback
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const fallback = target.nextElementSibling as HTMLElement;
                            if (fallback) {
                                fallback.style.display = 'flex';
                            }
                        }}
                    />
                ) : null}
                
                {/* Fallback icon - shown when no image or image fails to load */}
                <div
                    className={`absolute inset-0 flex items-center justify-center ${
                        achievement.image_url ? 'hidden' : ''
                    }`}
                >
                    {isLocked ? (
                        <Lock size={size === 'sm' ? 20 : size === 'md' ? 32 : 40} className="text-gray-400" />
                    ) : (
                        <span className="text-4xl">🏆</span>
                    )}
                </div>

                {/* Locked overlay - only show if image exists and is locked */}
                {isLocked && achievement.image_url && (
                    <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center">
                        <Lock size={size === 'sm' ? 16 : size === 'md' ? 24 : 32} className="text-white drop-shadow-lg" />
                    </div>
                )}

                {/* Showcased indicator */}
                {achievement.is_showcased && !isLocked && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-white">
                        <Award size={12} className="text-yellow-900" />
                    </div>
                )}

                {/* Difficulty badge */}
                <div
                    className={`
                        absolute -bottom-2 left-1/2 -translate-x-1/2
                        px-2 py-0.5 rounded-full text-xs font-bold
                        bg-white dark:bg-gray-900
                        text-gray-700 dark:text-gray-300
                        border border-gray-200 dark:border-gray-700
                        shadow-md
                    `}
                >
                    {difficultyLabels[achievement.difficulty]}
                </div>
            </div>

            {/* Details Tooltip/Info */}
            {showDetails && (
                <div
                    className={`
                        absolute left-1/2 -translate-x-1/2 top-full mt-3
                        w-64 p-4 rounded-xl
                        bg-white dark:bg-gray-800
                        shadow-2xl border border-gray-200 dark:border-gray-700
                        z-50
                        ${isLocked ? 'opacity-75' : ''}
                    `}
                >
                    <div className="text-center space-y-2">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                            {achievement.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {achievement.description}
                        </p>
                        
                        {/* Unlock Requirements */}
                        {isLocked && achievement.criteria && (
                            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                    <Target size={14} className="text-gray-500 dark:text-gray-400" />
                                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                        Unlock Requirement:
                                    </span>
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                    {getCriteriaDisplay(achievement.criteria)}
                                </p>
                            </div>
                        )}
                        
                        <div className="flex items-center justify-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                {achievement.reputation_required} rep
                            </span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className={`text-xs font-semibold capitalize ${gradientClass.replace('from-', 'text-').split(' ')[0]}`}>
                                {achievement.difficulty}
                            </span>
                        </div>
                        {achievement.unlocked_at && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 pt-1">
                                Unlocked {new Date(achievement.unlocked_at).toLocaleDateString()}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
