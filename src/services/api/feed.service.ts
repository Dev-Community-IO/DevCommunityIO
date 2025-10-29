import apiClient from './config';

interface FeedParams {
    page?: number;
    limit?: number;
    tags?: string[];
    category?: string;
    feedType?: 'personalized' | 'following' | 'trending' | 'guest';
    userId?: string;
}

class FeedService {
    // Unified feed endpoint
    async getFeed(params: FeedParams = {}): Promise<any> {
        const { feedType = 'personalized', ...restParams } = params;
        const response = await apiClient.get('/feed', {
            params: {
                feedType,
                ...restParams,
            },
        });
        return response.data;
    }

    // Get personalized feed
    async getPersonalizedFeed(params: FeedParams = {}): Promise<any> {
        return this.getFeed({ ...params, feedType: 'personalized' });
    }

    // Get following feed
    async getFollowingFeed(params: FeedParams = {}): Promise<any> {
        return this.getFeed({ ...params, feedType: 'following' });
    }

    // Get trending feed
    async getTrendingFeed(params: FeedParams = {}): Promise<any> {
        return this.getFeed({ ...params, feedType: 'trending' });
    }

    // Get guest feed (no auth required)
    async getGuestFeed(params: FeedParams = {}): Promise<any> {
        return this.getFeed({ ...params, feedType: 'guest' });
    }

    // Get tag-based feed
    async getTagFeed(params: FeedParams = {}): Promise<any> {
        const response = await apiClient.get('/feed/tags', { params });
        return response.data;
    }

    // Track user interaction
    async trackInteraction(data: {
        postId: string;
        interactionType: 'view' | 'click' | 'share' | 'time_spent';
        metadata?: any;
    }): Promise<void> {
        await apiClient.post('/feed/interaction', data);
    }

    // Get feed preferences
    async getPreferences(): Promise<any> {
        const response = await apiClient.get('/feed/preferences');
        return response.data;
    }

    // Update feed preferences
    async updatePreferences(preferences: any): Promise<any> {
        const response = await apiClient.post('/feed/preferences', preferences);
        return response.data;
    }

    // Follow tag
    async followTag(tagSlug: string): Promise<void> {
        await apiClient.post(`/tags/${tagSlug}/follow`);
    }

    // Unfollow tag
    async unfollowTag(tagSlug: string): Promise<void> {
        await apiClient.delete(`/tags/${tagSlug}/follow`);
    }
}

export default new FeedService();

