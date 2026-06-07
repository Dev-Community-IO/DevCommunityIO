import { useState, useEffect } from 'react';
import { apiClient } from '../services/api/config';

/**
 * Normalize image URL to absolute HTTPS URL
 */
function normalizeImageUrl(imageUrl: string | undefined): string | undefined {
  if (!imageUrl) return undefined;
  
  // If already absolute URL, ensure HTTPS
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl.replace('http://', 'https://');
  }
  
  // If relative URL, make it absolute
  if (imageUrl.startsWith('/')) {
    return `${window.location.origin}${imageUrl}`;
  }
  
  // If it's a CloudFront or S3 URL without protocol, add HTTPS
  if (imageUrl.includes('.cloudfront.net') || imageUrl.includes('.s3.') || imageUrl.includes('amazonaws.com')) {
    if (!imageUrl.startsWith('http')) {
      return `https://${imageUrl}`;
    }
    return imageUrl.replace('http://', 'https://');
  }
  
  // Default: assume it needs to be made absolute
  return `${window.location.origin}/${imageUrl.replace(/^\//, '')}`;
}

interface SeoMetadata {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  // Nested structure from API
  meta?: {
    title?: string;
    description?: string;
    keywords?: string;
  };
  openGraph?: {
    'og:title'?: string;
    'og:description'?: string;
    'og:image'?: string;
    'og:url'?: string;
    'og:type'?: string;
    'og:site_name'?: string;
  };
  twitter?: {
    'twitter:card'?: string;
    'twitter:title'?: string;
    'twitter:description'?: string;
    'twitter:image'?: string;
    'twitter:url'?: string;
  };
}

export function useSeoMetadata(pathname: string) {
  const [metadata, setMetadata] = useState<SeoMetadata | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Skip API call if pathname is empty (fast path optimization)
    if (!pathname) {
      setLoading(false);
      return;
    }

    let controller: AbortController | null = null;
    let timeoutId: NodeJS.Timeout | null = null;

    const fetchMetadata = async () => {
      // Extract slug/ID from pathname
      const pathSegments = pathname.split('/').filter(Boolean);
      
      // Determine content type and identifier
      let endpoint: string | null = null;
      
      if (pathSegments[0] === 'post' && pathSegments[1]) {
        endpoint = `/seo/posts/${pathSegments[1]}`;
      } else if (pathSegments[0] === 'hackathons' && pathSegments[1]) {
        endpoint = `/seo/hackathons/${pathSegments[1]}`;
      } else if (pathSegments[0] === 'events' && pathSegments[1]) {
        endpoint = `/seo/events/${pathSegments[1]}`;
      } else if (pathSegments[0] === 'opportunities' && pathSegments[1]) {
        endpoint = `/seo/opportunities/${pathSegments[1]}`;
      } else if (pathSegments[0] === 'pages' && pathSegments[1]) {
        endpoint = `/seo/pages/${pathSegments[1]}`;
      } else if (pathSegments[0] === 'profile' && pathSegments[1] && pathSegments[1] !== 'me') {
        endpoint = `/seo/profiles/${pathSegments[1]}`;
      }

      if (!endpoint) {
        setLoading(false);
        return;
      }

      try {
        // Use fetch with AbortController for timeout protection (increased to 5s for reliability)
        controller = new AbortController();
        timeoutId = setTimeout(() => controller?.abort(), 5000); // 5 second timeout
        
        const response = await apiClient.get(endpoint, {
          signal: controller.signal,
          timeout: 5000, // Additional timeout for axios
          headers: {
            'Cache-Control': 'max-age=300', // Cache for 5 minutes
          },
        } as any);
        
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        
        if (response.data) {
          // Normalize image URLs to ensure they're absolute HTTPS URLs
          const normalizedData = { ...response.data };
          if (normalizedData.image) {
            normalizedData.image = normalizeImageUrl(normalizedData.image);
          }
          if (normalizedData.openGraph?.['og:image']) {
            normalizedData.openGraph['og:image'] = normalizeImageUrl(normalizedData.openGraph['og:image']);
          }
          if (normalizedData.twitter?.['twitter:image']) {
            normalizedData.twitter['twitter:image'] = normalizeImageUrl(normalizedData.twitter['twitter:image']);
          }
          
          setMetadata(normalizedData);
        }
      } catch (error: any) {
        // Silently fail - don't block rendering if API is slow
        // Only log non-abort errors (abort is expected for timeout or component unmount)
        if (error.name !== 'AbortError' && error.code !== 'ECONNABORTED' && !error.message?.includes('canceled')) {
          console.error('Failed to fetch SEO metadata:', error);
        }
        // Don't set error state, just use defaults
      } finally {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        setLoading(false);
      }
    };

    fetchMetadata();

    // Cleanup function to abort request if component unmounts or pathname changes
    return () => {
      if (controller) {
        controller.abort();
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [pathname]);

  return { metadata, loading };
}

