import { useState, useEffect, useCallback } from 'react';
import notificationsService, { Notification } from '../services/api/notifications.service';
import { useAuth } from '../contexts/AuthContext';

export function useNotifications(pollInterval: number = 30000) {
    const { isAuthenticated } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchNotifications = useCallback(async () => {
        if (!isAuthenticated) return;

        try {
            const recent = await notificationsService.getRecent(10);
            setNotifications(recent);
            setError(null);
        } catch (err: any) {
            console.error('Failed to fetch notifications:', err);
            setError(err?.message || 'Failed to load notifications');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    const fetchUnreadCount = useCallback(async () => {
        if (!isAuthenticated) return;

        try {
            const count = await notificationsService.getUnreadCount();
            setUnreadCount(count);
        } catch (err) {
            console.error('Failed to fetch unread count:', err);
        }
    }, [isAuthenticated]);

    // Initial fetch
    useEffect(() => {
        if (isAuthenticated) {
            fetchNotifications();
            fetchUnreadCount();
        } else {
            setNotifications([]);
            setUnreadCount(0);
            setLoading(false);
        }
    }, [isAuthenticated, fetchNotifications, fetchUnreadCount]);

    // Polling
    useEffect(() => {
        if (!isAuthenticated) return;

        const interval = setInterval(() => {
            fetchNotifications();
            fetchUnreadCount();
        }, pollInterval);

        return () => clearInterval(interval);
    }, [isAuthenticated, pollInterval, fetchNotifications, fetchUnreadCount]);

    const markAsRead = useCallback(async (id: string) => {
        try {
            await notificationsService.markAsRead(id);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, isRead: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        try {
            await notificationsService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    }, []);

    return {
        notifications,
        unreadCount,
        loading,
        error,
        markAsRead,
        markAllAsRead,
        refresh: fetchNotifications,
    };
}
