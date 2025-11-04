import { apiClient } from './config';

export interface VerificationStatus {
  status: 'not_requested' | 'pending' | 'approved';
  isVerified: boolean;
  request?: {
    id: string;
    status: string;
    reason: string | null;
    adminComment: string | null;
    createdAt: string;
    reviewedAt: string | null;
    rejectedAt: string | null;
    daysUntilCanRequestAgain?: number;
  };
}

export const verificationService = {
  /**
   * Request verification
   */
  requestVerification: async (reason: string): Promise<any> => {
    const response = await apiClient.post('/verification/request', { reason });
    return response.data;
  },

  /**
   * Get verification status
   */
  getStatus: async (): Promise<VerificationStatus> => {
    const response = await apiClient.get('/verification/status');
    return response.data.data || response.data;
  },
};

export default verificationService;

