import { apiClient } from './config';

export interface GetEventsParams {
    type?: 'online' | 'in-person' | 'hybrid';
    category?: string;
    featured?: boolean;
    search?: string;
    page?: number;
    limit?: number;
}

export interface Event {
    id: string;
    title: string;
    slug: string;
    description: string;
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
    date: string;
    time: string;
    location: string;
    type: 'online' | 'in-person' | 'hybrid';
    category: string;
    attendeeCount: number;
    maxAttendees?: number;
    price: string;
    featured: boolean;
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

export const eventsService = {
    getEvents: async (params?: GetEventsParams) => {
        const response = await apiClient.get('/events', { params });
        return response.data;
    },

    getEvent: async (slug: string) => {
        const response = await apiClient.get(`/events/${slug}`);
        return response.data;
    },

    createEvent: async (data: {
        title: string;
        description: string;
        imageUrl?: string;
        date: string;
        time: string;
        location: string;
        type: 'online' | 'in-person' | 'hybrid';
        category: string;
        maxAttendees?: number;
        price: string;
    }) => {
        const response = await apiClient.post('/events', data);
        return response.data;
    },

    attendEvent: async (id: string) => {
        const response = await apiClient.post(`/events/${id}/attend`);
        return response.data;
    },

    unattendEvent: async (id: string) => {
        const response = await apiClient.delete(`/events/${id}/unattend`);
        return response.data;
    },

    updateEvent: async (id: string, data: Partial<{
        title: string;
        description: string;
        imageUrl?: string;
        date: string;
        time: string;
        location: string;
        type: 'online' | 'in-person' | 'hybrid';
        category: string;
        maxAttendees?: number;
        price: string;
        registrationUrl?: string;
        ctaButtonText?: string;
    }>) => {
        const response = await apiClient.patch(`/events/${id}`, data);
        return response.data;
    },
};

export default eventsService;

