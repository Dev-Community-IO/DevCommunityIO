import apiClient from './config';

interface FeedParams {
    page?: number;
    limit?: number;
    tags?: string[];
}

class FeedService {
    // Get personalized feed
    async getPersonalizedFeed(params: FeedParams = {}): Promise<any> {
        const response = await apiClient.get('/feed/personalized', { params });
        return response.data;
    }

    // Get following feed
    async getFollowingFeed(params: FeedParams = {}): Promise<any> {
        const response = await apiClient.get('/feed/following', { params });
        return response.data;
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

