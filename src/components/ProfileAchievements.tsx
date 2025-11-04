import { useEffect, useState } from 'react';
import { Award, Trophy, Sparkles, Lock, Target, Calendar, Star, Info } from 'lucide-react';
import { GlassCard } from './GlassCard';
import achievementsService, { Achievement } from '../services/api/achievements.service';
import { AchievementBadge } from './AchievementBadge';

interface ProfileAchievementsProps {
    username: string;
    isOwnProfile?: boolean;
}

const difficultyColors = {
    easy: 'text-green-500 bg-green-100 dark:bg-green-900/30',
    medium: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
    hard: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30',
    expert: 'text-amber-500 bg-amber-100 dark:bg-amber-900/30',
    legendary: 'text-red-500 bg-red-100 dark:bg-red-900/30',
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
    
    if (criteria.type === 'daily_streak' || criteria.type === 'streak_days') {
        return `${label} for ${criteria.value} day${criteria.value !== 1 ? 's' : ''}`;
    }
    
    return `${label}: ${criteria.value}`;
};

export function ProfileAchievements({ username, isOwnProfile = false }: ProfileAchievementsProps) {
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    useEffect(() => {
        const fetchAchievements = async () => {
            if (!username) {
                setLoading(false);
                setError('Username is required');
                return;
            }

            try {
                setLoading(true);
                setError(null);

                // Always use username-based endpoint for consistency
                // This works even if authentication fails or session expires
                let data: Achievement[];
                data = await achievementsService.getUserAchievements(username);

                if (!Array.isArray(data)) {
                    console.warn('Achievements data is not an array:', data);
                    data = [];
                }

                // Normalize isUnlocked - ensure it's a boolean and handle various formats
                data = data.map(ach => {
                    // Check multiple possible formats for isUnlocked
                    let isUnlocked = false;
                    
                    // First check the isUnlocked field directly
                    if (ach.isUnlocked === true || ach.isUnlocked === 'true' || ach.isUnlocked === 1) {
                        isUnlocked = true;
                    } else if (ach.isUnlocked === false || ach.isUnlocked === 'false' || ach.isUnlocked === 0) {
                        isUnlocked = false;
                    } else if (ach.unlocked_at) {
                        // If unlocked_at exists, consider it unlocked
                        isUnlocked = true;
                    }
                    
                    return {
                        ...ach,
                        isUnlocked: isUnlocked
                    };
                });

                setAchievements(data);
            } catch (err: any) {
                console.error('Failed to fetch achievements:', err);
                setError(err?.response?.data?.message || err?.message || 'Failed to load achievements');
            } finally {
                setLoading(false);
            }
        };

        fetchAchievements();
    }, [username, isOwnProfile]);

    // Explicitly check for true to handle undefined/null values
    const unlockedAchievements = achievements.filter((a) => a.isUnlocked === true);
    const lockedAchievements = achievements.filter((a) => a.isUnlocked !== true);

    const getProgressPercentage = () => {
        if (achievements.length === 0) return 0;
        return Math.round((unlockedAchievements.length / achievements.length) * 100);
    };

    if (loading) {
        return (
            <GlassCard className="p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </GlassCard>
        );
    }

    if (error) {
        return (
            <GlassCard className="p-6">
                <div className="text-center py-8">
                    <p className="text-red-500 mb-2">Error loading achievements</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
                </div>
            </GlassCard>
        );
    }

    if (achievements.length === 0 && !loading && !error) {
        return (
            <GlassCard className="p-6">
                <div className="text-center py-8">
                    <Sparkles size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                    <h3 className="text-lg font-bold mb-2">No Achievements Found</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        {isOwnProfile 
                            ? "No achievements are available yet. Check back later!" 
                            : "This user hasn't unlocked any achievements yet."}
                    </p>
                </div>
            </GlassCard>
        );
    }

    const AchievementCard = ({ achievement }: { achievement: Achievement }) => {
        // Explicitly check for true to handle undefined/null values
        const isUnlocked = achievement.isUnlocked === true;
        const isLocked = !isUnlocked;
        const criteria = achievement.criteria as { type: string; value: number | boolean } | undefined;

        return (
            <GlassCard className={`p-4 transition-all duration-300 ${isLocked ? 'opacity-60' : ''}`}>
                <div className="flex gap-4">
                    {/* Badge */}
                    <div className="flex-shrink-0">
                        <AchievementBadge
                            achievement={achievement}
                            size="md"
                            showDetails={false}
                        />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1">
                                <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                                    {achievement.name}
                                    {achievement.is_showcased && !isLocked && (
                                        <Star size={16} className="text-yellow-500 fill-yellow-500" />
                                    )}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                    {achievement.description}
                                </p>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            {/* Reputation Required */}
                            <div className="flex items-center gap-2">
                                <Award size={14} className="text-yellow-500" />
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    {achievement.reputation_required} rep required
                                </span>
                            </div>

                            {/* Difficulty */}
                            <div className="flex items-center gap-2">
                                <Target size={14} className="text-gray-500 dark:text-gray-400" />
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${difficultyColors[achievement.difficulty]}`}>
                                    {difficultyLabels[achievement.difficulty]}
                                </span>
                            </div>

                            {/* Category */}
                            {achievement.category && (
                                <div className="flex items-center gap-2">
                                    <Info size={14} className="text-gray-500 dark:text-gray-400" />
                                    <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                                        {achievement.category}
                                    </span>
                                </div>
                            )}

                            {/* Unlock Date */}
                            {achievement.unlocked_at && (
                                <div className="flex items-center gap-2">
                                    <Calendar size={14} className="text-gray-500 dark:text-gray-400" />
                                    <span className="text-xs text-gray-600 dark:text-gray-400">
                                        {new Date(achievement.unlocked_at).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Unlock Requirement */}
                        {isLocked && criteria && (
                            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-2">
                                    <Lock size={14} className="text-gray-500 dark:text-gray-400" />
                                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                        Unlock Requirement:
                                    </span>
                                    <span className="text-xs text-gray-600 dark:text-gray-400">
                                        {getCriteriaDisplay(criteria)}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </GlassCard>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
                            <Award size={20} className="text-yellow-500" />
                            Achievements
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {unlockedAchievements.length} of {achievements.length} unlocked
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {getProgressPercentage()}%
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Complete</div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500"
                            style={{ width: `${getProgressPercentage()}%` }}
                        />
                    </div>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                            viewMode === 'list'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                        }`}
                    >
                        List View
                    </button>
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                            viewMode === 'grid'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                        }`}
                    >
                        Grid View
                    </button>
                </div>
            </GlassCard>

            {/* Unlocked Achievements */}
            {unlockedAchievements.length > 0 && (
                <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                        <Trophy size={16} className="text-yellow-500" />
                        Unlocked ({unlockedAchievements.length})
                    </h4>
                    {viewMode === 'list' ? (
                        <div className="space-y-3">
                            {unlockedAchievements
                                .sort((a, b) => (b.unlocked_at || '').localeCompare(a.unlocked_at || ''))
                                .map((achievement) => (
                                    <AchievementCard key={achievement.id} achievement={achievement} />
                                ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {unlockedAchievements
                                .sort((a, b) => (b.unlocked_at || '').localeCompare(a.unlocked_at || ''))
                                .map((achievement) => (
                                    <AchievementCard key={achievement.id} achievement={achievement} />
                                ))}
                        </div>
                    )}
                </div>
            )}

            {/* Locked Achievements */}
            {isOwnProfile && lockedAchievements.length > 0 && (
                <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                        <Lock size={16} className="text-gray-400" />
                        Locked ({lockedAchievements.length})
                    </h4>
                    {viewMode === 'list' ? (
                        <div className="space-y-3">
                            {lockedAchievements
                                .sort((a, b) => a.order - b.order)
                                .map((achievement) => (
                                    <AchievementCard key={achievement.id} achievement={achievement} />
                                ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {lockedAchievements
                                .sort((a, b) => a.order - b.order)
                                .map((achievement) => (
                                    <AchievementCard key={achievement.id} achievement={achievement} />
                                ))}
                        </div>
                    )}
                </div>
            )}

            {/* Stats Cards */}
            {unlockedAchievements.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <GlassCard className="p-4 text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {unlockedAchievements.length}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Unlocked</div>
                    </GlassCard>
                    <GlassCard className="p-4 text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {unlockedAchievements.reduce((sum, a) => sum + (a.reputation_required || 0), 0)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total Rep Required</div>
                    </GlassCard>
                    <GlassCard className="p-4 text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {unlockedAchievements.filter((a) => a.difficulty === 'legendary').length}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Legendary</div>
                    </GlassCard>
                    <GlassCard className="p-4 text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {unlockedAchievements.filter((a) => a.is_showcased).length}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Showcased</div>
                    </GlassCard>
                </div>
            )}
        </div>
    );
}
