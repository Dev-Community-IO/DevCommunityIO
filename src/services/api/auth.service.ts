import apiClient from './config';

export interface LoginResponse {
    user: any;
    token?: string;
}

export interface WalletNonceResponse {
    nonce: string;
    message: string;
}

class AuthService {
    // Get nonce for Ethereum wallet authentication
    async getWalletNonce(walletAddress: string): Promise<WalletNonceResponse> {
        const response = await apiClient.post('/auth/wallet/nonce', { walletAddress });
        return response.data;
    }

    // Verify Ethereum wallet signature
    async verifyWallet(walletAddress: string, signature: string, nonce: string): Promise<LoginResponse> {
        const response = await apiClient.post('/auth/wallet/verify', {
            walletAddress,
            signature,
            nonce,
        });
        return response.data;
    }

    // Get nonce for Cardano wallet authentication
    async getCardanoNonce(walletAddress: string, stakeAddress?: string): Promise<WalletNonceResponse> {
        const response = await apiClient.post('/auth/cardano/nonce', {
            walletAddress,
            stakeAddress,
        });
        return response.data;
    }

    // Verify Cardano wallet signature
    async verifyCardano(
        walletAddress: string,
        signature: string,
        nonce: string,
        signedMessage: string,
        stakeAddress?: string
    ): Promise<LoginResponse> {
        const response = await apiClient.post('/auth/cardano/verify', {
            walletAddress,
            signature,
            nonce,
            signedMessage,
            stakeAddress,
        });
        return response.data;
    }

    // OAuth - Google login
    getGoogleAuthUrl(): string {
        return `${apiClient.defaults.baseURL}/auth/google`;
    }

    // OAuth - GitHub login
    getGithubAuthUrl(): string {
        return `${apiClient.defaults.baseURL}/auth/github`;
    }

    // Get current user session
    async getCurrentUser(): Promise<any> {
        const response = await apiClient.get('/auth/me');
        return response.data.user;
    }

    // Logout
    async logout(): Promise<void> {
        await apiClient.post('/auth/logout');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
    }

    // Update profile
    async updateProfile(data: any): Promise<any> {
        const response = await apiClient.patch('/auth/profile', data);
        return response.data.user;
    }

    // Get user's wallets
    async getWallets(): Promise<any[]> {
        const response = await apiClient.get('/auth/wallets');
        return response.data.wallets;
    }

    // Link additional wallet
    async linkWallet(walletAddress: string, stakeAddress?: string, isPrimary?: boolean): Promise<any> {
        const response = await apiClient.post('/auth/wallets', {
            walletAddress,
            stakeAddress,
            isPrimary,
        });
        return response.data;
    }

    // Unlink wallet
    async unlinkWallet(walletId: string): Promise<void> {
        await apiClient.delete(`/auth/wallets/${walletId}`);
    }

    // Set primary wallet
    async setPrimaryWallet(walletId: string): Promise<void> {
        await apiClient.patch(`/auth/wallets/${walletId}/primary`);
    }

    // Check username availability
    async checkUsername(username: string): Promise<{ available: boolean; message: string }> {
        const response = await apiClient.get(`/auth/check-username/${encodeURIComponent(username)}`);
        return response.data;
    }
}

export default new AuthService();

