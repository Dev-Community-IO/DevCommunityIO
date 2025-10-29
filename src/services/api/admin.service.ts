import apiClient from './config';

class AdminService {
    // Get dashboard stats
    async getDashboard(): Promise<any> {
        const response = await apiClient.get('/admin/dashboard');
        return response.data;
    }

    // Get users list
    async getUsers(params: {
        page?: number;
        limit?: number;
        search?: string;
        role?: string;
        status?: string;
    } = {}): Promise<any> {
        const response = await apiClient.get('/admin/users', { params });
        return response.data;
    }

    // Update user role
    async updateUserRole(userId: string, role: string): Promise<void> {
        await apiClient.patch(`/admin/users/${userId}/role`, { role });
    }

    // Suspend user
    async suspendUser(userId: string, reason: string, duration?: number): Promise<void> {
        await apiClient.post(`/admin/users/${userId}/suspend`, { reason, duration });
    }

    // Unsuspend user
    async unsuspendUser(userId: string): Promise<void> {
        await apiClient.post(`/admin/users/${userId}/unsuspend`);
    }

    // Ban user
    async banUser(userId: string, reason: string): Promise<void> {
        await apiClient.post(`/admin/users/${userId}/ban`, { reason });
    }

    // Get moderation log
    async getModerationLog(params: {
        page?: number;
        limit?: number;
        moderatorId?: string;
        action?: string;
    } = {}): Promise<any> {
        const response = await apiClient.get('/admin/moderation-log', { params });
        return response.data;
    }

    // Get reports
    async getReports(params: {
        page?: number;
        limit?: number;
        status?: string;
        type?: string;
    } = {}): Promise<any> {
        const response = await apiClient.get('/admin/reports', { params });
        return response.data;
    }

    // Resolve report
    async resolveReport(reportId: string, action: string, note?: string): Promise<void> {
        await apiClient.patch(`/admin/reports/${reportId}/resolve`, { action, note });
    }

    // Remove content
    async removeContent(type: string, contentId: string, reason: string): Promise<void> {
        await apiClient.post(`/admin/content/${type}/${contentId}/remove`, { reason });
    }

    // Get moderators list
    async getModerators(): Promise<any[]> {
        const response = await apiClient.get('/admin/moderators');
        return response.data.moderators;
    }
}

export default new AdminService();

