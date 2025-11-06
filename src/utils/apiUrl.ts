/**
 * Utility to detect API URL dynamically
 * - Uses VITE_API_BASE_URL if set (for /api endpoints)
 * - Uses VITE_API_URL if set (for base URL without /api)
 * - Checks window.__API_BASE_URL__ set by index.html script
 * - Otherwise detects based on current hostname
 * - For IP addresses (mobile/LAN), uses same IP with port from VITE_API_PORT (default: 3333)
 * - For localhost, uses localhost with port from VITE_API_PORT (default: 3333)
 */

/**
 * Get API base URL (with /api suffix)
 */
export function getApiBaseUrl(): string {
    if (import.meta.env.VITE_API_BASE_URL) {
        return import.meta.env.VITE_API_BASE_URL;
    }

    const baseUrl = getApiUrl();
    return `${baseUrl}/api`;
}

/**
 * Get API URL (without /api suffix)
 * Production-aware: Uses HTTPS for production domains
 */
export function getApiUrl(): string {
    // Use environment variable if set (highest priority)
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }

    // Get API port from environment or use default 3333
    const apiPort = import.meta.env.VITE_API_PORT || '3333';

    // Check if API URL was set by index.html script
    if (typeof window !== 'undefined' && (window as any).__API_BASE_URL__) {
        return (window as any).__API_BASE_URL__;
    }

    // Detect API URL based on current location
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
            // For IP addresses or other hostnames, use current protocol with dynamic port
            const protocol = window.location.protocol;
            return `${protocol}//${hostname}:${apiPort}`;
        }
    }

    // Fallback default
    return `http://localhost:${apiPort}`;
}

