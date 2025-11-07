import { apiClient } from './config';

export interface Comment {
    id: string;
    postId: string;
    userId: string;
    parentId?: string;
    content: string;
    contentHtml: string;
    upvotes: number;
    downvotes: number;
    hasUpvoted?: boolean;
    hasDownvoted?: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
    author?: {
        id: string;
        username: string;
        avatar: string;
        reputation: number;
        isVerified: boolean;
    };
    replies?: Comment[];
}

export interface CreateCommentData {
    content: string;
    parentId?: string;
}

export const commentsService = {
    getPostComments: async (postId: string) => {
        const response = await apiClient.get(`/posts/${postId}/comments`);
        return response.data;
    },

    // Alias for getPostComments
    getComments: async (postId: string) => {
        const response = await apiClient.get(`/posts/${postId}/comments`);
        return response.data;
    },

    getRequirement: async () => {
        const response = await apiClient.get('/comments/requirement');
        return response.data;
    },

    createComment: async (postId: string, data: CreateCommentData) => {
        const response = await apiClient.post(`/posts/${postId}/comments`, data);
        return response.data;
    },

    updateComment: async (id: string, data: { content: string }) => {
        const response = await apiClient.patch(`/comments/${id}`, data);
        return response.data;
    },

    deleteComment: async (id: string) => {
        const response = await apiClient.delete(`/comments/${id}`);
        return response.data;
    },

    upvoteComment: async (id: string) => {
        const response = await apiClient.post(`/comments/v2/${id}/upvote`);
        return response.data;
    },

    downvoteComment: async (id: string) => {
        const response = await apiClient.post(`/comments/v2/${id}/downvote`);
        return response.data;
    },

    replyToComment: async (id: string, data: { content: string }) => {
        const response = await apiClient.post(`/comments/${id}/reply`, data);
        return response.data;
    },
};

export default commentsService;

