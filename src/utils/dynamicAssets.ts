import { useState, useEffect } from 'react';
import siteSettingsService from '../services/api/siteSettings.service';

/**
 * Update favicon dynamically
 */
function updateFavicon(url: string | null) {
    if (!url) return;

    // Remove existing favicon links
    const existingFavicons = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]');
    existingFavicons.forEach(link => link.remove());

    // Add new favicon
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = url.endsWith('.ico') ? 'image/x-icon' : 'image/png';
    link.href = url;
    document.head.appendChild(link);
}

/**
 * Update Apple Touch Icon dynamically
 */
function updateAppleTouchIcon(url: string | null) {
    if (!url) return;

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
 */
async function updatePWAManifest(logoUrl: string | null, faviconUrl: string | null, appleTouchIconUrl: string | null) {
    // Prefer icon over logo for PWA - icons should be square and optimized
    const iconUrl = appleTouchIconUrl || faviconUrl || logoUrl;
    if (!iconUrl) return;

    try {
        // Fetch current manifest
        const manifestResponse = await fetch('/manifest.json');
        const manifest = await manifestResponse.json();

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

        // Create blob URL for updated manifest
        const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
        const manifestUrl = URL.createObjectURL(blob);

        // Update manifest link
        const existingManifest = document.querySelector('link[rel="manifest"]');
        if (existingManifest) {
            // Clean up old blob URL if it exists
            const oldHref = existingManifest.getAttribute('href');
            if (oldHref && oldHref.startsWith('blob:')) {
                URL.revokeObjectURL(oldHref);
            }
            existingManifest.setAttribute('href', manifestUrl);
        } else {
            const link = document.createElement('link');
            link.rel = 'manifest';
            link.href = manifestUrl;
            document.head.appendChild(link);
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

    // Update all logo images in the navbar
    const logoImages = document.querySelectorAll('img[alt="Dev Community"], img[alt*="logo" i]');
    logoImages.forEach((img: Element) => {
        if (img instanceof HTMLImageElement) {
            img.src = logoUrl;
        }
    });
}

/**
 * Load and apply all dynamic assets from site settings
 */
export async function loadAndApplyDynamicAssets() {
    try {
        const settings = await siteSettingsService.getSettings([
            'seo_logo_url',
            'seo_favicon_url',
            'seo_apple_touch_icon',
            'seo_og_image'
        ]);

        const logoUrl = settings.seo_logo_url;
        const faviconUrl = settings.seo_favicon_url;
        const appleTouchIconUrl = settings.seo_apple_touch_icon;

        // Update favicon
        if (faviconUrl) {
            updateFavicon(faviconUrl);
        }

        // Update Apple Touch Icon
        if (appleTouchIconUrl) {
            updateAppleTouchIcon(appleTouchIconUrl);
        } else if (faviconUrl) {
            // Fallback to favicon if no apple touch icon
            updateAppleTouchIcon(faviconUrl);
        }

        // Update PWA manifest (prefer icon over logo)
        await updatePWAManifest(logoUrl, faviconUrl, appleTouchIconUrl);

        // Update navbar logo
        if (logoUrl) {
            updateNavbarLogo(logoUrl);
        }

        return { logoUrl, faviconUrl, appleTouchIconUrl };
    } catch (error) {
        console.error('Failed to load dynamic assets:', error);
        return null;
    }
}

/**
 * Hook to use dynamic assets in React components
 */
export function useDynamicAssets() {
    const [assets, setAssets] = useState<{
        logoUrl: string | null;
        faviconUrl: string | null;
        appleTouchIconUrl: string | null;
    } | null>(null);

    useEffect(() => {
        loadAndApplyDynamicAssets().then(result => {
            if (result) {
                setAssets(result);
            }
        });
    }, []);

    return assets;
}

