import apiClient from './config';

class AdminService {
    // Get dashboard stats
    async getDashboard(): Promise<any> {
        const response = await apiClient.get('/admin/dashboard');
        return response.data;
    }

    // Get overview stats (enhanced)
    async getOverviewStats(): Promise<any> {
        const response = await apiClient.get('/admin/dashboard');
        return response.data;
    }

    // Get all contents (posts, comments, events, hackathons, opportunities)
    async getContents(params: {
        page?: number;
        limit?: number;
        type?: 'post' | 'comment' | 'event' | 'hackathon' | 'opportunity' | 'all';
        status?: 'published' | 'unpublished' | 'deleted' | 'all';
        authorId?: string;
        dateFrom?: string;
        dateTo?: string;
        tags?: string;
        search?: string;
    } = {}): Promise<any> {
        const response = await apiClient.get('/admin/contents', { params });
        return response.data;
    }

    // Unpublish content
    async unpublishContent(type: string, id: string, reason: string): Promise<void> {
        await apiClient.post(`/admin/content/${type}/${id}/unpublish`, { reason });
    }

    // Republish content
    async republishContent(type: string, id: string): Promise<void> {
        await apiClient.post(`/admin/content/${type}/${id}/republish`);
    }

    // Unpublish all user posts
    async unpublishUserPosts(userId: string, reason: string): Promise<void> {
        await apiClient.post(`/admin/users/${userId}/posts/unpublish`, { reason });
    }

    // Republish all user posts
    async republishUserPosts(userId: string): Promise<void> {
        await apiClient.post(`/admin/users/${userId}/posts/republish`);
    }

    // Unpublish all user content
    async unpublishUserContent(userId: string, reason: string): Promise<void> {
        await apiClient.post(`/admin/users/${userId}/unpublish-content`, { reason });
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

    // Delete user
    async deleteUser(userId: string, reason: string): Promise<void> {
        await apiClient.delete(`/admin/users/${userId}`, { data: { reason } });
    }

    // Activate user
    async activateUser(userId: string): Promise<void> {
        await apiClient.post(`/admin/users/${userId}/activate`);
    }

    // Deactivate user
    async deactivateUser(userId: string, comment: string): Promise<void> {
        await apiClient.post(`/admin/users/${userId}/deactivate`, { comment });
    }

    // Verify user
    async verifyUser(userId: string): Promise<void> {
        await apiClient.post(`/admin/verification/approve/${userId}`);
    }

    // Unverify user
    async unverifyUser(userId: string): Promise<void> {
        await apiClient.post(`/admin/users/${userId}/unverify`);
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

    // Mark user as spam
    async markSpam(userId: string, comment: string): Promise<void> {
        await apiClient.post(`/admin/users/${userId}/mark-spam`, { comment });
    }

    // Unmark user as spam
    async unmarkSpam(userId: string): Promise<void> {
        await apiClient.post(`/admin/users/${userId}/unmark-spam`);
    }

    // Mark user as trusted
    async markTrusted(userId: string): Promise<void> {
        await apiClient.post(`/admin/users/${userId}/mark-trusted`);
    }

    // Unmark user as trusted
    async unmarkTrusted(userId: string): Promise<void> {
        await apiClient.post(`/admin/users/${userId}/unmark-trusted`);
    }

    // Get pages
    async getPages(params: {
        page?: number;
        limit?: number;
        search?: string;
        verified?: boolean;
        category?: string;
    } = {}): Promise<any> {
        const response = await apiClient.get('/admin/pages', { params });
        return response.data;
    }

    // Verify page
    async verifyPage(pageId: string): Promise<void> {
        await apiClient.post(`/admin/pages/${pageId}/verification/approve`);
    }

    // Unverify page
    async unverifyPage(pageId: string): Promise<void> {
        await apiClient.post(`/admin/pages/${pageId}/unverify`);
    }

    // Update page settings
    async updatePageSettings(pageId: string, data: any): Promise<void> {
        await apiClient.put(`/admin/pages/${pageId}`, data);
    }

    // Delete page
    async deletePage(pageId: string): Promise<void> {
        await apiClient.delete(`/admin/pages/${pageId}`);
    }

    // Get app settings
    async getAppSettings(): Promise<any> {
        const response = await apiClient.get('/admin/app/settings');
        return response.data;
    }

    // Update app settings
    async updateAppSettings(data: any): Promise<void> {
        await apiClient.put('/admin/app/settings', data);
    }

    // Upload asset (logo, favicon, icon, ogImage, twitterImage)
    async uploadAsset(type: 'logo' | 'favicon' | 'icon' | 'ogImage' | 'twitterImage', file: File): Promise<any> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);
        const response = await apiClient.post(`/admin/app/upload-asset`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
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
        contentId?: string;
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

    // Achievements management
    async getAchievements(params: {
        page?: number;
        limit?: number;
        category?: string;
        difficulty?: string;
    } = {}): Promise<any> {
        const response = await apiClient.get('/admin/achievements', { params });
        return response.data;
    }

    async createAchievement(data: any): Promise<any> {
        const response = await apiClient.post('/admin/achievements', data);
        return response.data;
    }

    async updateAchievement(id: number, data: any): Promise<any> {
        const response = await apiClient.put(`/admin/achievements/${id}`, data);
        return response.data;
    }

    async deleteAchievement(id: number): Promise<void> {
        await apiClient.delete(`/admin/achievements/${id}`);
    }

    // Reputation requirements management
    async getReputationRequirements(): Promise<any> {
        const response = await apiClient.get('/admin/reputation-requirements');
        return response.data;
    }

    async updateReputationRequirement(contentType: string, requiredReputation: number, description?: string): Promise<any> {
        const response = await apiClient.put(`/admin/reputation-requirements/${contentType}`, {
            requiredReputation,
            description,
        });
        return response.data;
    }

    // Reputation rules management
    async getReputationRules(): Promise<any> {
        const response = await apiClient.get('/admin/reputation-rules');
        return response.data;
    }

    async updateReputationRule(action: string, data: {
        points: number;
        description?: string;
        isActive?: boolean;
        preventDuplicate?: boolean;
    }): Promise<any> {
        const response = await apiClient.put(`/admin/reputation-rules/${action}`, data);
        return response.data;
    }

    // Manual reputation adjustment
    async adjustUserReputation(userId: string, amount: number, reason?: string, comment?: string): Promise<any> {
        const response = await apiClient.post(`/admin/users/${userId}/reputation/adjust`, {
            amount,
            reason,
            comment,
        });
        return response.data;
    }

    // Site settings management
    async updateSiteSetting(key: string, value: string): Promise<void> {
        await apiClient.put(`/admin/site-settings/${key}`, { value });
    }

    // Verification requests management
    async getVerificationRequests(status?: 'pending' | 'approved' | 'rejected', page: number = 1, limit: number = 20): Promise<any> {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });
        if (status) {
            params.append('status', status);
        }
        const response = await apiClient.get(`/admin/verification/requests?${params.toString()}`);
        return response.data;
    }

    async approveVerification(userId: string, comment?: string): Promise<any> {
        const response = await apiClient.post(`/admin/verification/approve/${userId}`, { comment });
        return response.data;
    }

    async rejectVerification(userId: string, comment: string): Promise<any> {
        const response = await apiClient.post(`/admin/verification/reject/${userId}`, { comment });
        return response.data;
    }

    // Email settings management
    async getEmailSettings(): Promise<any> {
        const response = await apiClient.get('/admin/settings/email');
        return response.data;
    }

    async updateEmailSettings(data: any): Promise<any> {
        const response = await apiClient.put('/admin/settings/email', data);
        return response.data;
    }

    // Page member management
    async getPageMembers(pageId: string): Promise<any> {
        const response = await apiClient.get(`/pages/${pageId}/members`);
        return response.data;
    }

    async addPageMember(pageId: string, userId: string, role: 'admin' | 'moderator' | 'member'): Promise<void> {
        await apiClient.post(`/pages/${pageId}/team`, { userId, role });
    }

    async updatePageMemberRole(pageId: string, userId: string, role: 'admin' | 'moderator' | 'member'): Promise<void> {
        await apiClient.patch(`/pages/${pageId}/team/${userId}`, { role });
    }

    async removePageMember(pageId: string, userId: string): Promise<void> {
        await apiClient.delete(`/pages/${pageId}/team/${userId}`);
    }

    // Static Pages management
    async getStaticPage(slug: string): Promise<any> {
        const response = await apiClient.get(`/static-pages/${slug}`);
        return response.data;
    }

    async updateStaticPage(slug: string, content: string): Promise<void> {
        await apiClient.put(`/admin/static-pages/${slug}`, { content });
    }
}

export default new AdminService();

