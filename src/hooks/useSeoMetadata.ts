import { useState, useEffect } from 'react';
import { apiClient } from '../services/api/config';

interface SeoMetadata {
  title: string;
  description: string;
  image?: string;
  url: string;
  type: 'website' | 'article';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

export function useSeoMetadata(pathname: string) {
  const [metadata, setMetadata] = useState<SeoMetadata | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetadata = async () => {
      // Extract slug/ID from pathname
      const pathSegments = pathname.split('/').filter(Boolean);
      
      // Determine content type and identifier
      let endpoint: string | null = null;
      
      if (pathSegments[0] === 'post' && pathSegments[1]) {
        endpoint = `/api/seo/posts/${pathSegments[1]}`;
      } else if (pathSegments[0] === 'hackathons' && pathSegments[1]) {
        endpoint = `/api/seo/hackathons/${pathSegments[1]}`;
      } else if (pathSegments[0] === 'events' && pathSegments[1]) {
        endpoint = `/api/seo/events/${pathSegments[1]}`;
      } else if (pathSegments[0] === 'opportunities' && pathSegments[1]) {
        endpoint = `/api/seo/opportunities/${pathSegments[1]}`;
      } else if (pathSegments[0] === 'pages' && pathSegments[1]) {
        endpoint = `/api/seo/pages/${pathSegments[1]}`;
      }

      if (!endpoint) {
        setLoading(false);
        return;
      }

      try {
        const response = await apiClient.get(endpoint);
        if (response.data) {
          setMetadata(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch SEO metadata:', error);
        // Don't set error state, just use defaults
      } finally {
        setLoading(false);
      }
    };

    fetchMetadata();
  }, [pathname]);

  return { metadata, loading };
}

