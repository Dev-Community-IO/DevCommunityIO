import { apiClient } from './config';

export interface GetHackathonsParams {
    status?: 'upcoming' | 'ongoing' | 'ended';
    category?: string;
    featured?: boolean;
    search?: string;
    page?: number;
    limit?: number;
}

export interface Hackathon {
    id: string;
    title: string;
    slug: string;
    description: string;
    organizerName: string;
    organizerId: string;
    imageUrl?: string;
    organizerLogoUrl?: string;
    startDate: string;
    endDate: string;
    prize?: string;
    maxParticipants?: number;
    participantCount: number;
    category: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    status: 'upcoming' | 'ongoing' | 'ended';
    featured: boolean;
    requirements?: string[];
    prizes?: any[];
    judges?: any[];
    tracks?: string[];
    seoTitle?: string;
    seoDescription?: string;
    createdAt: string;
    updatedAt: string;
}

export const hackathonsService = {
    getHackathons: async (params?: GetHackathonsParams) => {
        const response = await apiClient.get('/hackathons', { params });
        return response.data;
    },

    getHackathon: async (slug: string) => {
        const response = await apiClient.get(`/hackathons/${slug}`);
        return response.data;
    },

    registerForHackathon: async (id: string) => {
        const response = await apiClient.post(`/hackathons/${id}/register`);
        return response.data;
    },

    unregisterFromHackathon: async (id: string) => {
        const response = await apiClient.delete(`/hackathons/${id}/unregister`);
        return response.data;
    },
};

export default hackathonsService;

