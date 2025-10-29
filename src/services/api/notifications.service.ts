import { apiClient } from './config';

export interface GetNotificationsParams {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
}

export interface Notification {
    id: string;
    userId: string;
    type: 'comment' | 'reply' | 'upvote' | 'mention' | 'follow' | 'post' | 'achievement' | 'system';
    title: string;
    message: string;
    isRead: boolean;
    actionUrl?: string;
    relatedUserId?: string;
    relatedPostId?: string;
    createdAt: string;
    updatedAt: string;
}

export const notificationsService = {
    getNotifications: async (params?: GetNotificationsParams) => {
        const response = await apiClient.get('/notifications', { params });
        return response.data;
    },

    markAsRead: async (id: string) => {
        const response = await apiClient.patch(`/notifications/${id}/read`);
        return response.data;
    },

    markAllAsRead: async () => {
        const response = await apiClient.patch('/notifications/read-all');
        return response.data;
    },

    deleteNotification: async (id: string) => {
        const response = await apiClient.delete(`/notifications/${id}`);
        return response.data;
    },
};

export default notificationsService;

