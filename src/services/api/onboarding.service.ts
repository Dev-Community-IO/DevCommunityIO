import apiClient from './config';

class OnboardingService {
    // Get onboarding status
    async getStatus(): Promise<any> {
        const response = await apiClient.get('/onboarding/status');
        return response.data;
    }

    // Get suggested tags
    async getSuggestedTags(): Promise<any[]> {
        const response = await apiClient.get('/onboarding/suggested-tags');
        return response.data.tags;
    }

    // Get suggested users
    async getSuggestedUsers(): Promise<any[]> {
        const response = await apiClient.get('/onboarding/suggested-users');
        return response.data.users;
    }

    // Get suggested pages
    async getSuggestedPages(): Promise<any[]> {
        const response = await apiClient.get('/onboarding/suggested-pages');
        return response.data.pages;
    }

    // Save interests
    async saveInterests(tagIds: string[]): Promise<void> {
        const token = localStorage.getItem('auth_token');
        console.log('🔍 [saveInterests] Sending with token:', token ? `${token.substring(0, 8)}...` : 'NO TOKEN');
        console.log('📝 [saveInterests] Tag IDs:', tagIds);
        try {
            await apiClient.post('/onboarding/interests', { tagIds });
            console.log('✅ [saveInterests] Interests saved successfully');
        } catch (error: any) {
            console.error('❌ [saveInterests] Failed:', error.response?.data || error.message);
            throw error;
        }
    }

    // Save follow suggestions
    async saveFollows(userIds: string[], pageIds: string[]): Promise<void> {
        await apiClient.post('/onboarding/follow-suggestions', { userIds, pageIds });
    }

    // Update profile during onboarding
    async updateProfile(data: { username: string; pseudo?: string; bio: string; skills: string[] }): Promise<void> {
        const token = localStorage.getItem('auth_token');
        console.log('🔍 Updating profile with token:', token ? `${token.substring(0, 8)}...` : 'NO TOKEN');
        console.log('📝 Profile data:', data);
        try {
            const response = await apiClient.patch('/auth/me', data);
            console.log('✅ Profile updated successfully:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ Profile update failed:', error.response?.data || error.message);
            throw error;
        }
    }

    // Complete onboarding
    async complete(): Promise<void> {
        await apiClient.post('/onboarding/complete');
    }

    // Skip onboarding
    async skip(): Promise<void> {
        await apiClient.post('/onboarding/skip');
    }

    // Get current onboarding data (interests, followed users, joined pages)
    async getCurrentData(): Promise<{
        interests: string[];
        followedUsers: string[];
        joinedPages: string[];
    }> {
        try {
            const response = await apiClient.get('/onboarding/current-data');
            return response.data;
        } catch (error: any) {
            console.error('Failed to get current onboarding data:', error);
            // Return empty arrays if endpoint doesn't exist or fails
            return {
                interests: [],
                followedUsers: [],
                joinedPages: []
            };
        }
    }
}

export default new OnboardingService();

