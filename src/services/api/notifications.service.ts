import { apiClient } from './config';

export interface GetNotificationsParams {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
}

export interface Notification {
    id: string;
    userId: string;
    type: 'comment' | 'reply' | 'upvote' | 'mention' | 'follow' | 'post' | 'achievement' | 'system' | 'bookmark' | 'reaction' | 'share' | 'page_invite' | 'verification';
    title: string;
    message: string;
    isRead: boolean;
    actionUrl?: string;
    relatedUserId?: string;
    relatedPostId?: string;
    relatedUser?: {
        id: string;
        username: string;
        avatar_url?: string;
        pseudo?: string;
    };
    relatedPost?: {
        id: string;
        title: string;
        slug?: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface NotificationPreferences {
    inApp: {
        comment: boolean;
        reply: boolean;
        upvote: boolean;
        mention: boolean;
        follow: boolean;
        post: boolean;
        achievement: boolean;
        bookmark: boolean;
        reaction: boolean;
        share: boolean;
        page_invite: boolean;
        verification: boolean;
        system: boolean;
    };
    email: null | Record<string, any>;
}

export const notificationsService = {
    getNotifications: async (params?: GetNotificationsParams) => {
        const response = await apiClient.get('/notifications', { params });
        return response.data;
    },

    getRecent: async (limit: number = 10) => {
        const response = await apiClient.get('/notifications/recent', { params: { limit } });
        return response.data.notifications || [];
    },

    getUnreadCount: async () => {
        try {
            const response = await apiClient.get('/notifications/unread-count');
            return response.data.count || 0;
        } catch (error) {
            console.error('Failed to get unread count:', error);
            return 0;
        }
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

    getPreferences: async (): Promise<NotificationPreferences> => {
        const response = await apiClient.get('/notifications/preferences');
        return response.data.preferences;
    },

    updatePreferences: async (preferences: Partial<NotificationPreferences>) => {
        const response = await apiClient.patch('/notifications/preferences', preferences);
        return response.data;
    },
};

export default notificationsService;

