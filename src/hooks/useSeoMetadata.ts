import { useState, useEffect } from 'react';
import { apiClient } from '../services/api/config';

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
      }

      if (!endpoint) {
        setLoading(false);
        return;
      }

      try {
        // Use fetch with AbortController for timeout protection
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
        
        const response = await apiClient.get(endpoint, {
          signal: controller.signal,
          timeout: 3000 // Additional timeout for axios
        } as any);
        
        clearTimeout(timeoutId);
        
        if (response.data) {
          setMetadata(response.data);
        }
      } catch (error: any) {
        // Silently fail - don't block rendering if API is slow
        if (error.name !== 'AbortError') {
          console.error('Failed to fetch SEO metadata:', error);
        }
        // Don't set error state, just use defaults
      } finally {
        setLoading(false);
      }
    };

    fetchMetadata();
  }, [pathname]);

  return { metadata, loading };
}

