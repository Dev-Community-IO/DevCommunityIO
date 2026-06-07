import { apiClient } from './config';

export interface GetTagsParams {
    category?: string;
    trending?: boolean;
    featured?: boolean;
    search?: string;
    page?: number;
    limit?: number;
    /** Include role-restricted tags (for /tags browse page) */
    includeRestricted?: boolean;
}

export interface Tag {
    id: string;
    name: string;
    slug: string;
    description?: string;
    category?: string;
    usageCount: number;
    followersCount?: number;
    followers_count?: number;
    trending?: boolean;
    featured?: boolean;
    logoUrl?: string;
    restrictedToRoles?: string[];
    color?: string;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateTagParams {
    name?: string;
    category?: string;
    logoUrl?: string;
    featured?: boolean;
    restrictedToRoles?: string[];
}

export const tagsService = {
    getTags: async (params?: GetTagsParams) => {
        const response = await apiClient.get('/tags', { params });
        return response.data;
    },

    getFeaturedTags: async (limit?: number) => {
        const response = await apiClient.get('/tags/featured', { params: { limit } });
        return response.data;
    },

    getTag: async (slug: string) => {
        const response = await apiClient.get(`/tags/${slug}`);
        return response.data;
    },

    getTagPosts: async (slug: string, params?: { page?: number; limit?: number }) => {
        const response = await apiClient.get(`/tags/${slug}/posts`, { params });
        return response.data;
    },

    updateTag: async (slug: string, data: UpdateTagParams) => {
        const response = await apiClient.put(`/tags/${slug}`, data);
        return response.data;
    },

    followTag: async (slug: string) => {
        const response = await apiClient.post(`/tags/${slug}/follow`);
        return response.data;
    },

    unfollowTag: async (slug: string) => {
        const response = await apiClient.delete(`/tags/${slug}/follow`);
        return response.data;
    },

    getTrendingTags: async (period: '7d' | '30d' = '7d', limit = 10) => {
        const response = await apiClient.get('/tags/trending', {
            params: { period, limit },
        });
        return response.data;
    },
};

export default tagsService;

