import apiClient from './config';

interface PrivacyPreferences {
    show_email: boolean;
    show_activity_status: boolean;
    profile_visible: boolean;
    show_wallet_address: boolean;
    allow_direct_messages: boolean;
    show_reputation: boolean;
    show_followers: boolean;
    show_following: boolean;
}

class PrivacyService {
    async getPreferences(userId: string): Promise<PrivacyPreferences> {
        const response = await apiClient.get(`/users/${userId}/privacy-preferences`);
        return response.data.preferences;
    }

    async updatePreferences(userId: string, preferences: Partial<PrivacyPreferences>): Promise<PrivacyPreferences> {
        const response = await apiClient.patch(`/users/${userId}/privacy-preferences`, preferences);
        return response.data.preferences;
    }
}

export default new PrivacyService();

