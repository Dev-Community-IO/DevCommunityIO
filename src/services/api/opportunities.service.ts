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
    logoUrl?: string;
    location: string;
    type: 'full-time' | 'part-time' | 'contract' | 'internship';
    category: string;
    salary?: string;
    experience: string;
    remote: boolean;
    featured: boolean;
    seoTitle?: string;
    seoDescription?: string;
    postedAt: string;
    expiresAt?: string;
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

    applyToOpportunity: async (id: string, data?: any) => {
        const response = await apiClient.post(`/opportunities/${id}/apply`, data);
        return response.data;
    },
};

export default opportunitiesService;

