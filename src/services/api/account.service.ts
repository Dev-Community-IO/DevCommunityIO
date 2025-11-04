import apiClient from './config';

interface DeletionResponse {
  message: string;
  deletionDate?: string;
  daysRemaining?: number;
}

class AccountService {
  async requestDeletion(userId: string, reason?: string): Promise<DeletionResponse> {
    const response = await apiClient.post(`/users/${userId}/request-deletion`, { reason });
    return response.data;
  }

  async cancelDeletion(userId: string): Promise<void> {
    await apiClient.delete(`/users/${userId}/cancel-deletion`);
  }
}

export default new AccountService();

