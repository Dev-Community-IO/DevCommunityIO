import axios from 'axios';

/**
 * Detect API URL dynamically (without /api suffix)
 */
function getApiUrl(): string {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }

    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

        if (isLocalhost) {
            return 'http://localhost:3333';
        } else {
            return `http://${hostname}:3333`;
        }
    }

    return 'http://localhost:3333';
}

const API_URL = getApiUrl();

export interface EnvSetting {
    key: string;
    value: string;
    category: string;
    description: string;
    type: 'string' | 'number' | 'boolean' | 'password' | 'url' | 'email';
    isSensitive: boolean;
}

export interface EnvSettingsResponse {
    settings: EnvSetting[];
    grouped: Record<string, EnvSetting[]>;
    categories: string[];
}

class EnvSettingsService {
    async getSettings(): Promise<EnvSettingsResponse> {
        const response = await axios.get(`${API_URL}/api/admin/env-settings`, {
            withCredentials: true,
        });
        return response.data;
    }

    async getSetting(key: string): Promise<EnvSetting> {
        const response = await axios.get(`${API_URL}/api/admin/env-settings/${key}`, {
            withCredentials: true,
        });
        return response.data;
    }

    async updateSettings(settings: Record<string, string | number | boolean>): Promise<void> {
        await axios.put(
            `${API_URL}/api/admin/env-settings`,
            { settings },
            { withCredentials: true }
        );
    }
}

export default new EnvSettingsService();

