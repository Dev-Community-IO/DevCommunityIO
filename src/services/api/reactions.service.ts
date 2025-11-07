import { apiClient } from './config';

export interface EmojiReaction {
    emoji: string;
    count: number;
    users: Array<{
        id: string;
        username: string;
        pseudo?: string;
        avatarUrl: string;
    }>;
}

export interface EmojiReactionResponse {
    message: string;
    reaction?: any;
    reacted: boolean;
    authorReputation?: number | null;
    reactorReputation?: number | null;
}

export const reactionsService = {
    addEmoji: async (data: { postId?: string; commentId?: string; emoji: string }): Promise<EmojiReactionResponse> => {
        const response = await apiClient.post('/reactions/emoji', data);
        return response.data;
    },

    getEmojis: async (data: { postId?: string; commentId?: string }) => {
        const params = new URLSearchParams();
        if (data.postId) params.append('postId', data.postId);
        if (data.commentId) params.append('commentId', data.commentId);

        const response = await apiClient.get(`/reactions/emoji?${params.toString()}`);
        return response.data;
    },

    getUserEmojis: async (data: { postId?: string; commentId?: string }) => {
        const params = new URLSearchParams();
        if (data.postId) params.append('postId', data.postId);
        if (data.commentId) params.append('commentId', data.commentId);

        const response = await apiClient.get(`/reactions/emoji/user?${params.toString()}`);
        return response.data;
    },
};

export default reactionsService;
