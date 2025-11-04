import { useState, useEffect, useCallback, useRef } from 'react';
import notificationsService, { type Notification } from '../services/api/notifications.service';
import { useAuth } from '../contexts/AuthContext';
import { pushNotificationService } from '../services/pushNotification';
import { isNetworkError } from '../services/api/config';
import { faviconBadgeService } from '../services/faviconBadge';

interface UseRealtimeNotificationsOptions {
    pollInterval?: number;
    autoFetch?: boolean;
    limit?: number;
}

export function useRealtimeNotifications(options: UseRealtimeNotificationsOptions = {}) {
    const { pollInterval = 15000, autoFetch = true, limit = 20 } = options;
    const { isAuthenticated } = useAuth();

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastNotificationId, setLastNotificationId] = useState<string | null>(null);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const isMountedRef = useRef(true);

    // Fetch notifications
    const fetchNotifications = useCallback(async (showLoader = false) => {
        if (!isAuthenticated || !isMountedRef.current) return;

        try {
            if (showLoader) setLoading(true);
            setError(null);

            const response = await notificationsService.getNotifications({
                limit,
                page: 1
            });

            const notificationsList = response.data || response.notifications || response || [];

            if (isMountedRef.current) {
                setNotifications(notificationsList);

                // Track the newest notification ID for detecting new notifications
                if (notificationsList.length > 0) {
                    const newestId = notificationsList[0].id;
                    if (newestId !== lastNotificationId && lastNotificationId !== null) {
                        // New notification detected - trigger browser notification if enabled
                        if ('Notification' in window && Notification.permission === 'granted') {
                            const newNotif = notificationsList[0];
                            new Notification(newNotif.title, {
                                body: newNotif.message,
                                icon: '/devcommunity-new_LOG (1).png',
                                badge: '/devcommunity-new_LOG (1).png',
                                tag: newNotif.id,
                            });
                        }

                        // Show push notification
                        if (pushNotificationService.permission === 'granted') {
                            pushNotificationService.showNotification(notificationsList[0].title, {
                                body: notificationsList[0].message,
                                tag: notificationsList[0].id,
                                data: {
                                    actionUrl: notificationsList[0].actionUrl,
                                    id: notificationsList[0].id,
                                },
                            });
                        }
                    }
                    setLastNotificationId(newestId);
                }
            }
        } catch (err: any) {
            if (isMountedRef.current) {
                // Suppress network errors - they're handled gracefully
                if (!isNetworkError(err)) {
                    console.error('Failed to fetch notifications:', err);
                    setError(err?.message || 'Failed to load notifications');
                }
                // Network errors are silently ignored - no error state needed
                // The service already returns empty data for network errors, so this catch should rarely trigger
            }
        } finally {
            if (isMountedRef.current && showLoader) {
                setLoading(false);
            }
        }
    }, [isAuthenticated, limit, lastNotificationId]);

    // Fetch unread count
    const fetchUnreadCount = useCallback(async () => {
        if (!isAuthenticated || !isMountedRef.current) return;

        try {
            const count = await notificationsService.getUnreadCount();
            if (isMountedRef.current) {
                setUnreadCount(count);
                // Update favicon badge with unread count
                faviconBadgeService.updateBadge(count);
            }
        } catch (err: any) {
            // Suppress network errors - they're handled gracefully
            if (!isNetworkError(err)) {
                console.error('Failed to get unread count:', err);
            }
            // Network errors are silently ignored - unread count stays at 0
            if (isMountedRef.current) {
                faviconBadgeService.updateBadge(0);
            }
        }
    }, [isAuthenticated]);

    // Initial fetch and polling setup
    useEffect(() => {
        isMountedRef.current = true;

        // Initialize favicon badge service
        faviconBadgeService.init();

        if (isAuthenticated && autoFetch) {
            fetchNotifications(true);
            fetchUnreadCount();

            // Request push notification permission
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (pushNotificationService.supported && pushNotificationService.permission === 'default' && user.id) {
                pushNotificationService.requestPermission().then(() => {
                    if (pushNotificationService.permission === 'granted' && user.id) {
                        pushNotificationService.subscribe(user.id).catch(console.error);
                    }
                }).catch(console.error);
            }

            // Set up polling interval
            intervalRef.current = setInterval(() => {
                if (isMountedRef.current) {
                    fetchNotifications(false);
                    fetchUnreadCount();
                }
            }, pollInterval);
        } else {
            setNotifications([]);
            setUnreadCount(0);
            setLoading(false);
            // Remove badge when user logs out
            faviconBadgeService.updateBadge(0);
        }

        return () => {
            isMountedRef.current = false;
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            // Clean up badge when component unmounts
            faviconBadgeService.updateBadge(0);
        };
    }, [isAuthenticated, autoFetch, pollInterval, fetchNotifications, fetchUnreadCount]);

    // Mark as read
    const markAsRead = useCallback(async (id: string) => {
        try {
            await notificationsService.markAsRead(id);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, isRead: true } : n)
            );
            const newCount = Math.max(0, unreadCount - 1);
            setUnreadCount(newCount);
            // Update favicon badge
            faviconBadgeService.updateBadge(newCount);
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
            throw err;
        }
    }, [unreadCount]);

    // Mark all as read
    const markAllAsRead = useCallback(async () => {
        try {
            await notificationsService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
            // Update favicon badge
            faviconBadgeService.updateBadge(0);
        } catch (err) {
            console.error('Failed to mark all as read:', err);
            throw err;
        }
    }, []);

    // Delete notification
    const deleteNotification = useCallback(async (id: string) => {
        try {
            await notificationsService.deleteNotification(id);
            const notification = notifications.find(n => n.id === id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            // Decrement unread count if it was unread
            if (notification && !notification.isRead) {
                const newCount = Math.max(0, unreadCount - 1);
                setUnreadCount(newCount);
                // Update favicon badge
                faviconBadgeService.updateBadge(newCount);
            }
        } catch (err) {
            console.error('Failed to delete notification:', err);
            throw err;
        }
    }, [notifications, unreadCount]);

    // Refresh notifications
    const refresh = useCallback(() => {
        fetchNotifications(true);
        fetchUnreadCount();
    }, [fetchNotifications, fetchUnreadCount]);

    return {
        notifications,
        unreadCount,
        loading,
        error,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refresh,
    };
}
