import { apiClient } from './config';

export interface GetTagsParams {
    category?: string;
    trending?: boolean;
    search?: string;
    page?: number;
    limit?: number;
}

export interface Tag {
    id: string;
    name: string;
    slug: string;
    description?: string;
    category?: string;
    usageCount: number;
    followersCount?: number;
    trending?: boolean;
    color?: string;
    createdAt: string;
    updatedAt: string;
}

export const tagsService = {
    getTags: async (params?: GetTagsParams) => {
        const response = await apiClient.get('/tags', { params });
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

    followTag: async (slug: string) => {
        const response = await apiClient.post(`/tags/${slug}/follow`);
        return response.data;
    },

    unfollowTag: async (slug: string) => {
        const response = await apiClient.delete(`/tags/${slug}/follow`);
        return response.data;
    },
};

export default tagsService;

