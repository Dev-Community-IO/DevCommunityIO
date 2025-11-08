import apiClient from './config';

export interface ReputationSystemStats {
  stats: {
    totalUsers: number;
    reputationDistribution: {
      total_users?: number;
      avg_reputation?: number;
      min_reputation?: number;
      max_reputation?: number;
      median_reputation?: number;
      q1_reputation?: number;
      q3_reputation?: number;
    };
    topUsers: Array<{
      id: string;
      username: string;
      pseudo: string | null;
      avatarUrl: string | null;
      reputation: number;
      isVerified: boolean;
    }>;
  };
  rules: {
    database: Array<{
      action: string;
      points: number;
      description: string | null;
      enabled: boolean;
    }>;
    defaults: Array<{
      action: string;
      points: number;
    }>;
  };
  activity: {
    last30Days: {
      bySourceType: Array<{
        source_type: string;
        count: number;
        total_gained: number;
        total_lost: number;
      }>;
      dailyChanges: Array<{
        date: string;
        transactions: number;
        gained: number;
        lost: number;
        net_change: number;
      }>;
      byAction: Array<{
        action: string;
        count: number;
        total_gained: number;
        total_lost: number;
        avg_change: number;
      }>;
    };
  };
}

class ReputationSystemService {
  async getStats(): Promise<ReputationSystemStats> {
    const response = await apiClient.get<ReputationSystemStats>('/reputation-system');
    return response.data;
  }
}

export default new ReputationSystemService();

