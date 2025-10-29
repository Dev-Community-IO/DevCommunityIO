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

    attendEvent: async (id: string) => {
        const response = await apiClient.post(`/events/${id}/attend`);
        return response.data;
    },

    unattendEvent: async (id: string) => {
        const response = await apiClient.delete(`/events/${id}/unattend`);
        return response.data;
    },
};

export default eventsService;

