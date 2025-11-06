import axios from 'axios';

/**
 * Detect API URL dynamically (without /api suffix)
 * Uses VITE_API_PORT from environment (default: 3333)
 */
function getApiUrl(): string {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }

    // Get API port from environment or use default 3333
    const apiPort = import.meta.env.VITE_API_PORT || '3333';

    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

        // Production domains
        const productionDomains = [
            'devcommunity.io',
            'www.devcommunity.io',
            'www.devcommunity.com',
        ];

        const isProductionDomain = productionDomains.includes(hostname);

        if (isLocalhost) {
            return `http://localhost:${apiPort}`;
        } else if (isProductionDomain) {
            // Use HTTPS and API subdomain for production (no port needed)
            if (hostname.startsWith('www.')) {
                const baseDomain = hostname.replace('www.', '');
                return `https://api.${baseDomain}`;
            } else {
                return `https://api.${hostname}`;
            }
        } else {
            // For other environments, use the current protocol
            const protocol = window.location.protocol;
            return `${protocol}//${hostname}:${apiPort}`;
        }
    }

    return `http://localhost:${apiPort}`;
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

