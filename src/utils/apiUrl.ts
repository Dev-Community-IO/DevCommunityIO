/**
 * Utility to detect API URL dynamically
 * - Uses VITE_API_BASE_URL if set (for /api endpoints)
 * - Uses VITE_API_URL if set (for base URL without /api)
 * - Checks window.__API_BASE_URL__ set by index.html script
 * - Otherwise detects based on current hostname
 * - For IP addresses (mobile/LAN), uses same IP with port 3333
 * - For localhost, uses localhost:3333
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

    // Check if API URL was set by index.html script
    if (typeof window !== 'undefined' && (window as any).__API_BASE_URL__) {
        return (window as any).__API_BASE_URL__;
    }

    // Detect API URL based on current location
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
        
        // Production domains
        const productionDomains = [
            'devcommunity.io',
            'www.devcommunity.io',
            'www.devcommunity.com',
        ];
        
        const isProductionDomain = productionDomains.includes(hostname);
        
        if (isLocalhost) {
            return 'http://localhost:3333';
        } else if (isProductionDomain) {
            // Use API subdomain for production
            if (hostname.startsWith('www.')) {
                const baseDomain = hostname.replace('www.', '');
                return `${protocol}//api.${baseDomain}`;
            } else {
                return `${protocol}//api.${hostname}`;
            }
        } else {
            // For IP addresses or other hostnames, use same hostname with port 3333
            return `${protocol}//${hostname}:3333`;
        }
    }

    // Fallback default
    return 'http://localhost:3333';
}

