import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

/**
 * Detect API base URL dynamically
 * - Uses VITE_API_BASE_URL if set in environment
 * - Checks window.__API_BASE_URL__ set by index.html script
 * - Otherwise, detects based on current hostname
 * - For IP addresses (mobile/LAN), uses same IP with port from VITE_API_PORT (default: 3333)
 * - For localhost, uses localhost with port from VITE_API_PORT (default: 3333)
 */
function getApiBaseUrl(): string {
    // Use environment variable if set (highest priority)
    if (import.meta.env.VITE_API_BASE_URL) {
        return import.meta.env.VITE_API_BASE_URL;
    }

    // Get API port from environment or use default 3333
    const apiPort = import.meta.env.VITE_API_PORT || '3333';

    // Check if API URL was set by index.html script
    if (typeof window !== 'undefined' && (window as any).__API_BASE_URL__) {
        return `${(window as any).__API_BASE_URL__}/api`;
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
            return `http://localhost:${apiPort}/api`;
        } else if (isProductionDomain) {
            // Use HTTPS and API subdomain for production (no port needed)
            if (hostname.startsWith('www.')) {
                const baseDomain = hostname.replace('www.', '');
                return `https://api.${baseDomain}/api`;
            } else {
                return `https://api.${hostname}/api`;
            }
        } else {
            // For IP addresses or other hostnames, use current protocol with dynamic port
            const protocol = window.location.protocol;
            return `${protocol}//${hostname}:${apiPort}/api`;
        }
    }

    // Fallback default
    return `http://localhost:${apiPort}/api`;
}

const API_BASE_URL = getApiBaseUrl();

// Track if we've already logged a network error to prevent spam
let networkErrorLogged = false;

// Helper function to check if an error is a network error (server not available)
export function isNetworkError(error: any): boolean {
    if (!error) return false;

    // Check if error is marked as network error (from our interceptor)
    if (error.isNetworkError === true) {
        return true;
    }

    // Check for various network error indicators
    const isNetworkError =
        !error.response && // No response means network error
        (error.message === 'Network Error' ||
            error.message?.includes('ERR_CONNECTION_REFUSED') ||
            error.message?.includes('ECONNREFUSED') ||
            error.code === 'ECONNREFUSED' ||
            error.code === 'ERR_NETWORK');

    return !!isNetworkError;
}

// Log API URL for debugging (always log for mobile debugging)
console.log('🔌 API Base URL:', API_BASE_URL);
console.log('📍 Current Location:', typeof window !== 'undefined' ? window.location.href : 'N/A');
console.log('🌐 Hostname:', typeof window !== 'undefined' ? window.location.hostname : 'N/A');

// Create axios instance
export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // For session cookies
    // Suppress axios internal error logging for network errors
    validateStatus: (status) => {
        // Don't throw errors for network-level issues (status 0 or no response)
        return status >= 200 && status < 500;
    },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('auth_token');

        // Handle FormData requests - must remove Content-Type so browser sets it with boundary
        if (config.data instanceof FormData) {
            // Remove default Content-Type header to let browser set it with multipart boundary
            if (config.headers) {
                delete config.headers['Content-Type'];
                // For FormData, axios should not set Content-Type at all
                // The browser will set it automatically with the correct boundary
            }
        }

        if (token && config.headers) {
            // Ensure Authorization header is set even for FormData requests
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        // validateStatus treats 4xx as success — reject them here so callers can catch properly
        if (response.status < 200 || response.status >= 300) {
            const error = new AxiosError(
                `Request failed with status code ${response.status}`,
                AxiosError.ERR_BAD_REQUEST,
                response.config,
                response.request,
                response
            );
            return Promise.reject(error);
        }

        networkErrorLogged = false;
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
        const status = error.response?.status;
        const url = originalRequest?.url || '';

        // Handle canceled/aborted requests - suppress logging (expected behavior)
        const isCanceled = error.code === 'ECONNABORTED' ||
            error.message === 'canceled' ||
            error.message?.includes('canceled') ||
            error.name === 'AbortError' ||
            (error.message === 'Request aborted' && !status);

        if (isCanceled) {
            // Silently reject canceled requests - they're expected when navigating away or timeout
            return Promise.reject({
                message: 'canceled',
                status: undefined,
                data: undefined,
                isCanceled: true,
            });
        }

        // Handle network errors (server not available) - suppress logging to prevent spam
        const isNetworkErr = isNetworkError(error);
        if (isNetworkErr) {
            // Only log network error once per session to avoid spam
            if (!networkErrorLogged) {
                networkErrorLogged = true;
                // Don't log to console - silently handle network errors
            }
            // Reject silently for network errors - components should handle gracefully
            return Promise.reject({
                message: error.message || 'Network Error',
                status: undefined,
                data: undefined,
                isNetworkError: true,
            });
        }

        // Handle 401 Unauthorized
        if (status === 401) {
            const isExpected401Endpoint =
                url.includes('/auth/me') ||
                url.includes('/bookmarks') ||
                url.includes('/onboarding/');

            if (!isExpected401Endpoint) {
                console.error('❌ API Error:', {
                    url,
                    method: originalRequest?.method,
                    status,
                    message: error.message,
                    baseURL: apiClient.defaults.baseURL,
                });
            }

            // Only clear auth once per session — avoid logout storms from parallel 401s
            const alreadyLoggedOut = !localStorage.getItem('auth_token');
            if (!alreadyLoggedOut && !originalRequest._retry) {
                originalRequest._retry = true;
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user');
                window.dispatchEvent(new CustomEvent('auth:logout'));
            }

            return Promise.reject(error);
        }

        // Suppress console errors for 404s on user pages endpoint (expected for users without pages)
        const isExpected404 = url?.includes('/users/') && url?.includes('/pages');

        // Log error details for debugging (non-401, non-expected-404 errors)
        if (!isExpected404) {
            console.error('❌ API Error:', {
                url,
                method: originalRequest?.method,
                status,
                message: error.message,
                baseURL: apiClient.defaults.baseURL,
            });
        }

        // Handle other errors - safely access message property
        // AxiosError extends Error, so we can safely access message after checking
        const responseMessage = error.response?.data && typeof error.response.data === 'object' && 'message' in error.response.data
            ? (error.response.data as any).message
            : undefined;
        const errorMsg = 'message' in error && typeof (error as any).message === 'string'
            ? (error as any).message
            : '';
        const errorMessage: string = responseMessage || errorMsg || 'An error occurred';

        return Promise.reject({
            message: errorMessage,
            status: error.response?.status,
            data: error.response?.data,
        });
    }
);

export default apiClient;

