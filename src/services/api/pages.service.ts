import { apiClient } from './config';

export interface GetPagesParams {
    category?: string;
    trending?: boolean;
    search?: string;
    page?: number;
    limit?: number;
}

export interface Page {
    id: string;
    name: string;
    slug: string;
    description?: string;
    category?: string;
    logoUrl?: string;
    coverImageUrl?: string;
    ownerId: string;
    memberCount: number;
    isTrending: boolean;
    createdAt: string;
    updatedAt: string;
}

export const pagesService = {
    getPages: async (params?: GetPagesParams) => {
        const response = await apiClient.get('/pages', { params });
        return response.data;
    },

    getPage: async (slug: string) => {
        const response = await apiClient.get(`/pages/${slug}`);
        return response.data;
    },

    getPagePosts: async (slug: string, params?: { page?: number; limit?: number }) => {
        const response = await apiClient.get(`/pages/${slug}/posts`, { params });
        return response.data;
    },

    joinPage: async (id: string) => {
        const response = await apiClient.post(`/pages/${id}/join`);
        return response.data;
    },

    leavePage: async (id: string) => {
        const response = await apiClient.delete(`/pages/${id}/leave`);
        return response.data;
    },

    getPageMembers: async (id: string, params?: { page?: number; limit?: number }) => {
        const response = await apiClient.get(`/pages/${id}/members`, { params });
        return response.data;
    },

    getMyPostablePages: async () => {
        const response = await apiClient.get('/pages/my/postable');
        return response.data;
    },
};

export default pagesService;

