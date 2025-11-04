import { apiClient } from './config';

export interface SEOMetadata {
    title: string;
    description: string;
    keywords?: string;
    image?: string;
    url: string;
    type: 'website' | 'article';
    author?: string;
    publishedTime?: string;
    modifiedTime?: string;
    metaTags?: Record<string, string>;
    openGraphTags?: Record<string, string>;
    twitterTags?: Record<string, string>;
}

export const seoService = {
    getPostSEO: async (slug: string): Promise<SEOMetadata> => {
        const response = await apiClient.get(`/seo/posts/${slug}`);
        return response.data;
    },

    getPageSEO: async (slug: string): Promise<SEOMetadata> => {
        const response = await apiClient.get(`/seo/pages/${slug}`);
        return response.data;
    },

    getHackathonSEO: async (slug: string): Promise<SEOMetadata> => {
        const response = await apiClient.get(`/seo/hackathons/${slug}`);
        return response.data;
    },

    getEventSEO: async (slug: string): Promise<SEOMetadata> => {
        const response = await apiClient.get(`/seo/events/${slug}`);
        return response.data;
    },

    getOpportunitySEO: async (slug: string): Promise<SEOMetadata> => {
        const response = await apiClient.get(`/seo/opportunities/${slug}`);
        return response.data;
    },
};

export default seoService;

