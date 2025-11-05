import { useState, useEffect } from 'react';
import siteSettingsService from '../services/api/siteSettings.service';
import { localStorageCache, CacheKeys } from './cache';

// Track current favicon URL to prevent unnecessary updates
let currentFaviconUrl: string | null = null;

// Initialize from HTML if available
if (typeof document !== 'undefined') {
    const existingFavicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null;
    if (existingFavicon && existingFavicon.href && !existingFavicon.href.startsWith('blob:')) {
        currentFaviconUrl = existingFavicon.href;
    }
}

/**
 * Update favicon dynamically (only if URL changed)
 */
function updateFavicon(url: string | null) {
    if (!url) return;

    // Skip blob URLs (these are temporary badge URLs)
    if (url.startsWith('blob:')) {
        return;
    }

    // Don't update if already set to the same URL
    if (currentFaviconUrl === url) {
        return;
    }

    // Find existing favicon
    let existingFavicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null;

    // Update the favicon normally
    if (existingFavicon) {
        // Update existing favicon href
        existingFavicon.href = url;
    } else {
        // Create new favicon link
        const link = document.createElement('link');
        link.rel = 'icon';
        link.type = url.endsWith('.ico') ? 'image/x-icon' : 'image/png';
        link.href = url;
        document.head.appendChild(link);
    }

    currentFaviconUrl = url;
}

/**
 * Update Apple Touch Icon dynamically
 */
function updateAppleTouchIcon(url: string | null) {
    if (!url) return;

    // Skip blob URLs
    if (url.startsWith('blob:')) {
        console.warn('Skipping blob URL apple touch icon');
        return;
    }

    // Remove existing apple-touch-icon links
    const existingIcons = document.querySelectorAll('link[rel="apple-touch-icon"]');
    existingIcons.forEach(link => link.remove());

    // Add new apple-touch-icon
    const link = document.createElement('link');
    link.rel = 'apple-touch-icon';
    link.href = url;
    document.head.appendChild(link);

    // Update startup image as well
    const startupLink = document.createElement('link');
    startupLink.rel = 'apple-touch-startup-image';
    startupLink.href = url;
    document.head.appendChild(startupLink);
}

/**
 * Update PWA manifest icons dynamically
 * Prefers icon over logo for PWA
 * Note: We don't use blob URLs for manifest - browsers cache the manifest file
 * and using blob URLs causes ERR_FILE_NOT_FOUND errors. Instead, we update the
 * manifest.json file or use the icon URL directly in the manifest.
 */
async function updatePWAManifest(logoUrl: string | null, faviconUrl: string | null, appleTouchIconUrl: string | null) {
    // Prefer icon over logo for PWA - icons should be square and optimized
    const iconUrl = appleTouchIconUrl || faviconUrl || logoUrl;
    if (!iconUrl) return;

    // Skip blob URLs - we can't use blob URLs in manifest
    if (iconUrl.startsWith('blob:')) {
        console.warn('Skipping blob URL in manifest - blob URLs cannot be used in manifest');
        return;
    }

    try {
        // Fetch current manifest
        let manifest: any;
        try {
            const manifestResponse = await fetch('/manifest.json');
            manifest = await manifestResponse.json();
        } catch (error) {
            console.warn('Failed to fetch manifest.json, using default manifest');
            manifest = {
                name: 'DevCommunity',
                short_name: 'DevCommunity',
                description: 'DevCommunity Platform',
                start_url: '/',
                display: 'standalone',
                background_color: '#ffffff',
                theme_color: '#7c3aed',
                icons: []
            };
        }

        // Update icons with proper purposes for Android/iOS
        manifest.icons = [
            {
                src: iconUrl,
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any'
            },
            {
                src: iconUrl,
                sizes: '192x192',
                type: 'image/png',
                purpose: 'maskable'
            },
            {
                src: iconUrl,
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any'
            },
            {
                src: iconUrl,
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable'
            }
        ];

        // Update shortcut icons
        if (manifest.shortcuts) {
            manifest.shortcuts.forEach((shortcut: any) => {
                if (shortcut.icons) {
                    shortcut.icons[0].src = iconUrl;
                }
            });
        }

        // Note: We don't create blob URLs for manifest - browsers don't handle them well
        // The manifest.json file is cached by the browser, so we just ensure the icon URLs
        // in the manifest point to the correct URLs. The actual manifest file update
        // would need to be done server-side if needed.
        // For now, we just ensure the manifest link exists and points to the static file
        const existingManifest = document.querySelector('link[rel="manifest"]');
        if (!existingManifest) {
            const link = document.createElement('link');
            link.rel = 'manifest';
            link.href = '/manifest.json';
            document.head.appendChild(link);
        } else {
            // If there's a blob URL in the manifest, replace it with the static file
            const href = existingManifest.getAttribute('href');
            if (href && href.startsWith('blob:')) {
                existingManifest.setAttribute('href', '/manifest.json');
            }
        }
    } catch (error) {
        console.error('Failed to update PWA manifest:', error);
    }
}

/**
 * Update logo in navbar (if needed)
 */
function updateNavbarLogo(logoUrl: string | null) {
    if (!logoUrl) return;

    // Skip blob URLs
    if (logoUrl.startsWith('blob:')) {
        console.warn('Skipping blob URL logo');
        return;
    }

    // Update all logo images in the navbar
    const logoImages = document.querySelectorAll('img[alt="Dev Community"], img[alt*="logo" i]');
    logoImages.forEach((img: Element) => {
        if (img instanceof HTMLImageElement) {
            img.src = logoUrl;
        }
    });
}

/**
 * Update document title and meta description
 */
function updateMetadata(title: string | null, description: string | null) {
    if (title) {
        document.title = title;
    }

    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
    }
    if (description) {
        metaDescription.setAttribute('content', description);
    }
}

/**
 * Load and apply all dynamic assets from site settings (with caching)
 */
export async function loadAndApplyDynamicAssets() {
    try {
        // Try cache first
        const cachedAssets = localStorageCache.get<{
            logoUrl: string | null;
            faviconUrl: string | null;
            appleTouchIconUrl: string | null;
            title: string | null;
            description: string | null;
        }>(CacheKeys.DYNAMIC_ASSETS);

        if (cachedAssets) {
            // Apply cached assets immediately (only if not already set)
            const cachedFavicon = cachedAssets.faviconUrl || '/icon.png';
            if (currentFaviconUrl !== cachedFavicon) {
                updateFavicon(cachedFavicon);
            }
            if (cachedAssets.appleTouchIconUrl) {
                updateAppleTouchIcon(cachedAssets.appleTouchIconUrl);
            } else if (cachedAssets.faviconUrl) {
                updateAppleTouchIcon(cachedAssets.faviconUrl);
            }
            if (cachedAssets.logoUrl) {
                updateNavbarLogo(cachedAssets.logoUrl);
            }
            if (cachedAssets.title || cachedAssets.description) {
                updateMetadata(cachedAssets.title, cachedAssets.description);
            }
            // Update manifest with cached data
            await updatePWAManifest(
                cachedAssets.logoUrl,
                cachedAssets.faviconUrl,
                cachedAssets.appleTouchIconUrl
            );
        }

        // Fetch fresh settings from API (with cache)
        const settings = await siteSettingsService.getSettings([
            'seo_logo_url',
            'seo_favicon_url',
            'seo_apple_touch_icon',
            'seo_og_image',
            'seo_default_title',
            'seo_default_description',
            'site_name'
        ], true); // Use cache

        const logoUrl = settings.seo_logo_url;
        const faviconUrl = settings.seo_favicon_url;
        const appleTouchIconUrl = settings.seo_apple_touch_icon;
        const title = settings.seo_default_title || settings.site_name || 'DevCommunity';
        const description = settings.seo_default_description || 'Where Developers Build the Future';

        // Only update if settings changed
        if (!cachedAssets ||
            cachedAssets.logoUrl !== logoUrl ||
            cachedAssets.faviconUrl !== faviconUrl ||
            cachedAssets.appleTouchIconUrl !== appleTouchIconUrl ||
            cachedAssets.title !== title ||
            cachedAssets.description !== description) {

            // Update favicon (only if changed)
            const targetFaviconUrl = faviconUrl || '/icon.png';
            if (currentFaviconUrl !== targetFaviconUrl) {
                updateFavicon(targetFaviconUrl);
            }

            // Update Apple Touch Icon
            if (appleTouchIconUrl) {
                updateAppleTouchIcon(appleTouchIconUrl);
            } else if (faviconUrl) {
                // Fallback to favicon if no apple touch icon
                updateAppleTouchIcon(faviconUrl);
            } else {
                // Fallback to default
                const defaultIcon = '/icon.png';
                const existingAppleIcon = document.querySelector('link[rel="apple-touch-icon"]');
                if (!existingAppleIcon || existingAppleIcon.getAttribute('href') !== defaultIcon) {
                    updateAppleTouchIcon(defaultIcon);
                }
            }

            // Update PWA manifest (prefer icon over logo)
            await updatePWAManifest(logoUrl, faviconUrl, appleTouchIconUrl);

            // Update navbar logo
            if (logoUrl) {
                updateNavbarLogo(logoUrl);
            }

            // Update metadata
            updateMetadata(title, description);

            // Cache the assets (24 hours expiry for assets)
            localStorageCache.set(CacheKeys.DYNAMIC_ASSETS, {
                logoUrl,
                faviconUrl,
                appleTouchIconUrl,
                title,
                description,
            }, 24 * 60 * 60 * 1000);
        }

        return { logoUrl, faviconUrl, appleTouchIconUrl, title, description };
    } catch (error) {
        console.error('Failed to load dynamic assets:', error);
        // Ensure default favicon exists even on error
        const existingFavicon = document.querySelector('link[rel="icon"]');
        if (!existingFavicon) {
            updateFavicon('/icon.png');
        }
        return null;
    }
}

/**
 * Cleanup function to revoke blob URLs on page unload
 */
export function cleanupDynamicAssets() {
    // Clean up any remaining blob URLs in manifest links
    const manifestLinks = document.querySelectorAll('link[rel="manifest"]');
    manifestLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('blob:')) {
            try {
                URL.revokeObjectURL(href);
                link.setAttribute('href', '/manifest.json');
            } catch (e) {
                // Ignore errors
            }
        }
    });
}

// Register cleanup on page unload
if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', cleanupDynamicAssets);
}

/**
 * Hook to use dynamic assets in React components
 */
export function useDynamicAssets() {
    const [assets, setAssets] = useState<{
        logoUrl: string | null;
        faviconUrl: string | null;
        appleTouchIconUrl: string | null;
        title: string | null;
        description: string | null;
    } | null>(null);

    useEffect(() => {
        // Load from cache first
        const cached = localStorageCache.get<{
            logoUrl: string | null;
            faviconUrl: string | null;
            appleTouchIconUrl: string | null;
            title: string | null;
            description: string | null;
        }>(CacheKeys.DYNAMIC_ASSETS);

        if (cached) {
            setAssets(cached);
        }

        // Then load fresh data
        loadAndApplyDynamicAssets().then(result => {
            if (result) {
                setAssets(result);
            }
        });
    }, []);

    return assets;
}
