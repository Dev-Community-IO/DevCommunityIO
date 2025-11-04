import apiClient, { isNetworkError } from './config';

class SiteSettingsService {
    /**
     * Get a single site setting by key
     */
    async getSetting(key: string): Promise<string | null> {
        try {
            const response = await apiClient.get(`/site-settings/${key}`);
            return response.data.value;
        } catch (error: any) {
            // Don't log network errors (server offline) - already handled by interceptor
            if (!isNetworkError(error)) {
            console.error(`Failed to fetch site setting ${key}:`, error);
            }
            return null;
        }
    }

    /**
     * Get multiple site settings by keys
     */
    async getSettings(keys: string[]): Promise<Record<string, string | null>> {
        try {
            const response = await apiClient.get('/site-settings', {
                params: { keys: keys.join(',') }
            });
            return response.data.settings || {};
        } catch (error: any) {
            // Don't log network errors (server offline) - already handled by interceptor
            if (!isNetworkError(error)) {
            console.error('Failed to fetch site settings:', error);
            }
            return {};
        }
    }

    /**
     * Get all public site settings
     */
    async getPublicSettings(): Promise<Record<string, string | null>> {
        try {
            const response = await apiClient.get('/site-settings/public');
            return response.data.settings || {};
        } catch (error: any) {
            // Don't log network errors (server offline) - already handled by interceptor
            if (!isNetworkError(error)) {
            console.error('Failed to fetch public site settings:', error);
            }
            return {};
        }
    }

    /**
     * Update a site setting (admin only)
     */
    async updateSetting(key: string, value: string): Promise<void> {
        await apiClient.put(`/site-settings/${key}`, { value });
    }
}

export default new SiteSettingsService();

