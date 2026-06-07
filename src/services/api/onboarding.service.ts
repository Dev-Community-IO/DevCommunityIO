import apiClient from './config';

function asArray<T>(value: unknown, keys: string[] = []): T[] {
    if (Array.isArray(value)) return value;
    if (value && typeof value === 'object') {
        for (const key of keys) {
            const nested = (value as Record<string, unknown>)[key];
            if (Array.isArray(nested)) return nested as T[];
        }
    }
    return [];
}

export interface SuggestedPage {
    id: string;
    name: string;
    slug?: string;
    logo?: string | null;
    logoUrl?: string | null;
    description: string;
    category: string;
    members: number;
    postsCount: number;
    isVerified?: boolean;
    isTrending?: boolean;
    isRecommended?: boolean;
    matchingTags?: string[];
    reason?: string;
}

export interface SuggestedPageResult {
    pages: SuggestedPage[];
    recommendedIds: string[];
    basedOnInterests: boolean;
}

class OnboardingService {
    async getStatus(): Promise<any> {
        const response = await apiClient.get('/onboarding/status');
        const data = response.data;
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid onboarding status response');
        }
        return data;
    }

    async getSuggestedTags(): Promise<any[]> {
        const response = await apiClient.get('/onboarding/suggested-tags');
        return asArray(response.data, ['tags']);
    }

    async getSuggestedUsers(): Promise<any[]> {
        try {
            const response = await apiClient.get('/onboarding/suggested-users');
            return asArray(response.data, ['users']);
        } catch (error: any) {
            if (error.response?.status === 401 || error.response?.status === 403) {
                return [];
            }
            console.error('Failed to get suggested users:', error);
            return [];
        }
    }

    async getSuggestedPages(tagIds: string[] = []): Promise<SuggestedPageResult> {
        try {
            const params = tagIds.length > 0 ? { tagIds: tagIds.join(',') } : undefined;
            const response = await apiClient.get('/onboarding/suggested-pages', { params });
            const data = response.data ?? {};
            return {
                pages: asArray<SuggestedPage>(data.pages),
                recommendedIds: asArray<string>(data.recommendedIds),
                basedOnInterests: Boolean(data.basedOnInterests),
            };
        } catch (error: any) {
            if (error.response?.status === 401 || error.response?.status === 403) {
                return { pages: [], recommendedIds: [], basedOnInterests: false };
            }
            console.error('Failed to get suggested pages:', error);
            return { pages: [], recommendedIds: [], basedOnInterests: false };
        }
    }

    async saveInterests(tagIds: string[]): Promise<void> {
        await apiClient.post('/onboarding/interests', { tagIds });
    }

    async saveFollows(userIds: string[], pageIds: string[]): Promise<void> {
        await apiClient.post('/onboarding/follow-suggestions', { userIds, pageIds });
    }

    async updateProfile(data: { username: string; pseudo?: string; bio: string; skills: string[] }): Promise<void> {
        await apiClient.patch('/auth/me', data);
    }

    async complete(): Promise<void> {
        await apiClient.post('/onboarding/complete');
    }

    async skip(): Promise<void> {
        await apiClient.post('/onboarding/skip');
    }

    async getCurrentData(): Promise<{
        interests: string[];
        followedUsers: string[];
        joinedPages: string[];
    }> {
        try {
            const response = await apiClient.get('/onboarding/current-data');
            const data = response.data ?? {};
            return {
                interests: asArray<string>(data.interests),
                followedUsers: asArray<string>(data.followedUsers),
                joinedPages: asArray<string>(data.joinedPages),
            };
        } catch (error: any) {
            if (error.response?.status !== 401) {
                console.error('Failed to get current onboarding data:', error);
            }
            return {
                interests: [],
                followedUsers: [],
                joinedPages: [],
            };
        }
    }
}

export default new OnboardingService();
