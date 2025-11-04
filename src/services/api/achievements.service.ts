import { apiClient } from './config';

export interface Achievement {
    id: number;
    slug: string;
    name: string;
    description: string;
    icon: string;
    image_url?: string;
    category: string;
    difficulty: 'easy' | 'medium' | 'hard' | 'expert' | 'legendary';
    reputation_required: number;
    criteria: {
        type: string;
        value: number | boolean;
    };
    is_hidden: boolean;
    order: number;
    isUnlocked?: boolean;
    unlocked_at?: string;
    is_showcased?: boolean;
}

export const achievementsService = {
    /**
     * Get all achievements with unlock status
     */
    getAll: async (): Promise<Achievement[]> => {
        const response = await apiClient.get('/achievements');
        // Handle both wrapped and direct responses
        let data = response.data;
        if (data && data.data && Array.isArray(data.data)) {
            data = data.data;
        } else if (!Array.isArray(data)) {
            console.warn('Unexpected response format:', data);
            return [];
        }
        return data;
    },

    /**
     * Get current user's achievements
     */
    getMyAchievements: async (): Promise<Achievement[]> => {
        const response = await apiClient.get('/achievements/me');
        return response.data.data || response.data;
    },

    /**
     * Get user's achievements by username
     */
    getUserAchievements: async (username: string): Promise<Achievement[]> => {
        const response = await apiClient.get(`/users/${username}/achievements`);
        // Handle both wrapped and direct responses
        let data = response.data;
        if (data && data.data && Array.isArray(data.data)) {
            data = data.data;
        } else if (!Array.isArray(data)) {
            console.warn('Unexpected response format:', data);
            return [];
        }
        
        return data;
    },

    /**
     * Toggle showcase status for an achievement
     */
    toggleShowcase: async (achievementId: number): Promise<void> => {
        await apiClient.patch(`/achievements/${achievementId}/showcase`);
    },
};

export default achievementsService;

