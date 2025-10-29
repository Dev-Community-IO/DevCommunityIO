import apiClient from './config';

export interface UserProfile {
    id: string;
    username: string;
    pseudo?: string | null;
    email?: string;
    avatarUrl: string | null;
    coverImageUrl: string | null;
    bio: string | null;
    role: string;
    location: string | null;
    occupation?: string | null;
    website: string | null;
    reputation: number;
    isVerified: boolean;
    socialLinks: Record<string, string> | null;
    skills: string[] | null;
    status: string;
    createdAt: string;
}

export interface UserStats {
    posts: number;
    replies: number;
    upvotes: number;
    followers: number;
    following: number;
}

class UsersService {
    // Get user by username
    async getUserByUsername(username: string): Promise<UserProfile> {
        const response = await apiClient.get(`/users/${username}`);
        return response.data.user;
    }

    // Get user stats
    async getUserStats(username: string): Promise<UserStats> {
        const response = await apiClient.get(`/users/${username}/stats`);
        return response.data.stats;
    }

    // Follow user
    async followUser(userId: string): Promise<void> {
        await apiClient.post(`/users/${userId}/follow`);
    }

    // Unfollow user
    async unfollowUser(userId: string): Promise<void> {
        await apiClient.delete(`/users/${userId}/follow`);
    }

    // Check if following user
    async isFollowing(userId: string): Promise<boolean> {
        try {
            const response = await apiClient.get(`/users/${userId}/is-following`);
            return response.data.isFollowing;
        } catch {
            return false;
        }
    }

    // Get followers of a user
    async getFollowers(userId: string, params?: { page?: number; limit?: number }): Promise<any> {
        const response = await apiClient.get(`/users/${userId}/followers`, { params });
        return response.data;
    }

    // Get users that a user is following
    async getFollowing(userId: string, params?: { page?: number; limit?: number }): Promise<any> {
        const response = await apiClient.get(`/users/${userId}/following`, { params });
        return response.data;
    }

    // Upload avatar
    async uploadAvatar(file: File): Promise<{ url: string }> {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('type', 'avatar');

        const response = await apiClient.post('/upload/image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }

    // Upload cover image
    async uploadCoverImage(file: File): Promise<{ url: string }> {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('type', 'cover');

        const response = await apiClient.post('/upload/image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }

    // Search for mentions (users)
    async searchForMentions(query: string): Promise<Array<{ id: string; username: string; avatar?: string; avatarUrl?: string; pseudo?: string }>> {
        const response = await apiClient.get(`/users/search?q=${encodeURIComponent(query)}`);
        return response.data.users || [];
    }

    // Get user posts
    async getUserPosts(username: string, params?: { category?: string; page?: number; limit?: number }): Promise<any> {
        try {
            const response = await apiClient.get(`/users/${username}/posts`, { params });
            // Handle paginated response
            if (response.data.data && Array.isArray(response.data.data)) {
                return {
                    data: response.data.data,
                    meta: response.data.meta || {
                        currentPage: response.data.currentPage || params?.page || 1,
                        lastPage: response.data.lastPage || 1,
                        perPage: response.data.perPage || params?.limit || 20,
                        total: response.data.total || response.data.data.length,
                    }
                };
            }
            // Fallback for non-paginated response
            return {
                data: response.data.posts || response.data.data || [],
                meta: {
                    currentPage: params?.page || 1,
                    lastPage: 1,
                    perPage: params?.limit || 20,
                    total: (response.data.posts || response.data.data || []).length,
                }
            };
        } catch (error: any) {
            // Fallback: use posts API with userId filter
            try {
                const userResponse = await this.getUserByUsername(username);
                const postsResponse = await apiClient.get('/posts', {
                    params: { userId: userResponse.id, ...params }
                });
                const posts = postsResponse.data.posts || postsResponse.data.data || [];
                return {
                    data: posts,
                    meta: {
                        currentPage: params?.page || 1,
                        lastPage: 1,
                        perPage: params?.limit || 20,
                        total: posts.length,
                    }
                };
            } catch {
                return {
                    data: [],
                    meta: {
                        currentPage: 1,
                        lastPage: 1,
                        perPage: 20,
                        total: 0,
                    }
                };
            }
        }
    }

    // Get user replies/comments
    async getUserReplies(username: string, params?: { page?: number; limit?: number }): Promise<any> {
        try {
            const response = await apiClient.get(`/users/${username}/replies`, { params });
            // Handle paginated response
            if (response.data.data && Array.isArray(response.data.data)) {
                return {
                    data: response.data.data,
                    meta: response.data.meta || {
                        currentPage: response.data.currentPage || params?.page || 1,
                        lastPage: response.data.lastPage || 1,
                        perPage: response.data.perPage || params?.limit || 20,
                        total: response.data.total || response.data.data.length,
                    }
                };
            }
            // Fallback for non-paginated response
            const replies = response.data.replies || response.data.comments || response.data || [];
            return {
                data: replies,
                meta: {
                    currentPage: params?.page || 1,
                    lastPage: 1,
                    perPage: params?.limit || 20,
                    total: replies.length,
                }
            };
        } catch (error: any) {
            console.error('Failed to fetch user replies:', error);
            return {
                data: [],
                meta: {
                    currentPage: 1,
                    lastPage: 1,
                    perPage: 20,
                    total: 0,
                }
            };
        }
    }

    // Get user pages (where user is owner, admin, moderator, or member)
    async getUserPages(username: string): Promise<any[]> {
        try {
            const response = await apiClient.get(`/users/${username}/pages`);
            return response.data.pages || response.data || [];
        } catch (error: any) {
            // Fallback: try to get postable pages if viewing own profile
            try {
                const response = await apiClient.get('/pages/my/postable');
                return response.data.pages || [];
            } catch {
                return [];
            }
        }
    }

    // Get email preferences
    async getEmailPreferences(userId: string): Promise<any> {
        const response = await apiClient.get(`/users/${userId}/email-preferences`);
        return response.data.preferences;
    }

    // Update email preferences
    async updateEmailPreferences(userId: string, preferences: any): Promise<any> {
        const response = await apiClient.patch(`/users/${userId}/email-preferences`, preferences);
        return response.data.preferences;
    }
}

export default new UsersService();
