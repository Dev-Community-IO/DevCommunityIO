import { apiClient } from './config';

export interface GetHackathonsParams {
    status?: 'upcoming' | 'ongoing' | 'ended';
    category?: string;
    featured?: boolean;
    search?: string;
    page?: number;
    limit?: number;
}

export interface ImportantDate {
    label: string;
    date: string;
}

export interface Hackathon {
    id: string;
    title: string;
    slug: string;
    description: string;
    organizerName: string;
    organizerId: string;
    organizer?: {
        id: string;
        username: string;
        avatarUrl?: string;
        avatar?: string;
        reputation?: number;
        isVerified?: boolean;
    };
    imageUrl?: string;
    organizerLogoUrl?: string;
    startDate: string;
    endDate: string;
    importantDates?: ImportantDate[];
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
    postId?: string | null;
    registrationUrl?: string | null;
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

    createHackathon: async (data: {
        title: string;
        description: string;
        imageUrl?: string;
        organizerName?: string;
        organizerLogoUrl?: string;
        startDate: string;
        endDate: string;
        importantDates?: ImportantDate[];
        prize?: string;
        maxParticipants?: number;
        category: string;
        difficulty: 'beginner' | 'intermediate' | 'advanced';
        requirements?: string[];
        prizes?: any[];
        judges?: any[];
        tracks?: string[];
    }) => {
        const response = await apiClient.post('/hackathons', data);
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

    updateHackathon: async (id: string, data: Partial<{
        title: string;
        description: string;
        imageUrl?: string;
        organizerName?: string;
        organizerLogoUrl?: string;
        startDate: string;
        endDate: string;
        importantDates?: ImportantDate[];
        prize?: string;
        maxParticipants?: number;
        category: string;
        difficulty: 'beginner' | 'intermediate' | 'advanced';
        requirements?: string[];
        prizes?: any[];
        judges?: any[];
        tracks?: string[];
        registrationUrl?: string;
        ctaButtonText?: string;
    }>) => {
        const response = await apiClient.patch(`/hackathons/${id}`, data);
        return response.data;
    },
};

export default hackathonsService;

