import { apiClient } from './config';

export interface GetOpportunitiesParams {
    type?: 'full-time' | 'part-time' | 'contract' | 'internship';
    category?: string;
    remote?: boolean;
    search?: string;
    page?: number;
    limit?: number;
}

export interface Opportunity {
    id: string;
    title: string;
    slug: string;
    description: string;
    companyId: string;
    companyName: string;
    company?: {
        id: string;
        username: string;
        avatarUrl?: string;
        avatar?: string;
        reputation?: number;
        isVerified?: boolean;
    };
    logoUrl?: string;
    location: string;
    type: 'full-time' | 'part-time' | 'contract' | 'internship';
    category: string;
    salary?: string;
    experience: string;
    remote: boolean;
    featured: boolean;
    postId?: string | null;
    applicationUrl?: string | null;
    ctaButtonText?: string | null;
    post?: {
        id: string;
        commentCount?: number;
        pageId?: string | null;
        postOrigin?: string | null;
        originSource?: string | null;
        originUrl?: string | null;
        coverImage?: string;
        coverImageUrl?: string;
        page?: {
            id: string;
            name: string;
            slug: string;
            logo?: string;
            logoUrl?: string;
            coverImage?: string;
            coverImageUrl?: string;
            description?: string;
            shortBio?: string;
            memberCount?: number;
            isVerified?: boolean;
        };
    };
    seoTitle?: string;
    seoDescription?: string;
    ogImageUrl?: string;
    postedAt: string;
    expiresAt?: string;
    deadline?: string;
    createdAt: string;
    updatedAt: string;
}

export const opportunitiesService = {
    getOpportunities: async (params?: GetOpportunitiesParams) => {
        const response = await apiClient.get('/opportunities', { params });
        return response.data;
    },

    getOpportunity: async (slug: string) => {
        const response = await apiClient.get(`/opportunities/${slug}`);
        return response.data;
    },

    createOpportunity: async (data: {
        title: string;
        description: string;
        companyName?: string;
        logoUrl?: string;
        location: string;
        type?: 'full-time' | 'part-time' | 'contract' | 'internship' | string;
        category: string;
        salary?: string;
        experience: string;
        remote: boolean;
        applicationUrl?: string;
        ctaButtonText?: string;
        postOrigin?: string | null;
        originSource?: string | null;
        originUrl?: string | null;
    }) => {
        const response = await apiClient.post('/opportunities', data);
        return response.data;
    },

    applyToOpportunity: async (id: string, data?: any) => {
        const response = await apiClient.post(`/opportunities/${id}/apply`, data);
        return response.data;
    },

    updateOpportunity: async (id: string, data: Partial<{
        title: string;
        description: string;
        companyName?: string;
        logoUrl?: string;
        location: string;
        type?: 'full-time' | 'part-time' | 'contract' | 'internship' | string;
        category: string;
        salary?: string;
        experience: string;
        remote: boolean;
        applicationUrl?: string;
        ctaButtonText?: string;
        postOrigin?: string | null;
        originSource?: string | null;
        originUrl?: string | null;
    }>) => {
        const response = await apiClient.patch(`/opportunities/${id}`, data);
        return response.data;
    },
};

export default opportunitiesService;

