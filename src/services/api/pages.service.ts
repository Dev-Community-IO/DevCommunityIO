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
    memberCount?: number;
    followerCount?: number;
    follower_count?: number;
    isFollowing?: boolean;
    isTrending: boolean;
    createdAt: string;
    updatedAt: string;
    url?: string;
    socialLinks?: Record<string, string> | null;
    shortBio?: string | null;
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

    checkUsername: async (username: string, pageId?: string) => {
        const params = pageId ? { pageId } : {};
        const response = await apiClient.get(`/pages/check-username/${username}`, { params });
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

    getMembers: async (id: string, params?: { page?: number; limit?: number; type?: 'team' | 'followers' }) => {
        const response = await apiClient.get(`/pages/${id}/members`, { params });
        return response.data;
    },

    addTeamMember: async (id: string, username: string, role: 'admin' | 'moderator') => {
        const response = await apiClient.post(`/pages/${id}/team`, { username, role });
        return response.data;
    },

    updateTeamMemberRole: async (id: string, userId: string, role: 'admin' | 'moderator') => {
        const response = await apiClient.patch(`/pages/${id}/team/${userId}`, { role });
        return response.data;
    },

    removeTeamMember: async (id: string, userId: string) => {
        const response = await apiClient.delete(`/pages/${id}/team/${userId}`);
        return response.data;
    },

    searchUsers: async (query: string) => {
        const response = await apiClient.get('/users/search', { params: { q: query, limit: 10 } });
        return response.data.users || response.data || [];
    },

    getMyPostablePages: async () => {
        const response = await apiClient.get('/pages/my/postable');
        return response.data;
    },

    createPage: async (pageData: {
        name: string;
        description?: string;
        shortBio?: string;
        category?: string;
        logoUrl?: string;
        coverImageUrl?: string;
        url?: string;
        socialLinks?: Record<string, string>;
        username?: string;
    }) => {
        const response = await apiClient.post('/pages', pageData);
        return response.data;
    },

    requestVerification: async (pageId: string, reason: string) => {
        const response = await apiClient.post(`/pages/${pageId}/verification/request`, {
            reason,
        });
        return response.data;
    },

    getVerificationStatus: async (pageId: string) => {
        const response = await apiClient.get(`/pages/${pageId}/verification/status`);
        return response.data;
    },

    listVerificationRequests: async (params?: { page?: number; limit?: number }) => {
        const response = await apiClient.get('/admin/pages/verification/requests', {
            params,
        });
        return response.data;
    },

    approveVerification: async (pageId: string) => {
        const response = await apiClient.post(`/admin/pages/${pageId}/verification/approve`);
        return response.data;
    },

    rejectVerification: async (pageId: string, reason?: string) => {
        const response = await apiClient.post(`/admin/pages/${pageId}/verification/reject`, {
            reason,
        });
        return response.data;
    },

    updatePage: async (pageId: string, pageData: {
        name?: string;
        description?: string;
        shortBio?: string;
        category?: string;
        username?: string;
        logoUrl?: string;
        coverImageUrl?: string;
        url?: string;
        socialLinks?: Record<string, string>;
    }) => {
        const response = await apiClient.patch(`/pages/${pageId}`, pageData);
        return response.data;
    },

    deletePage: async (pageId: string) => {
        const response = await apiClient.delete(`/pages/${pageId}`);
        return response.data;
    },
};

export default pagesService;

