import apiClient from './config';

export type AdPlacement = 'sidebar' | 'feed';

export interface PublicAd {
  id: string;
  title: string;
  placement: AdPlacement;
  htmlContent: string;
  maxHeight: number | null;
  linkUrl: string | null;
}

export interface AdminAd {
  id: string;
  title: string;
  placement: AdPlacement;
  htmlContent: string;
  isActive: boolean;
  priority: number;
  maxHeight: number | null;
  linkUrl: string | null;
  startsAt: string | null;
  endsAt: string | null;
  impressions: number;
  clicks: number;
  liveNow?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdInput {
  title: string;
  placement: AdPlacement;
  htmlContent: string;
  isActive?: boolean;
  priority?: number;
  maxHeight?: number | null;
  linkUrl?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
}

class AdsService {
  // ===== Public =====
  async getAds(placement: AdPlacement): Promise<PublicAd[]> {
    try {
      const res = await apiClient.get('/ads', { params: { placement } });
      return res.data?.ads || [];
    } catch {
      return [];
    }
  }

  async trackImpression(id: string): Promise<void> {
    try {
      await apiClient.post(`/ads/${id}/impression`);
    } catch {
      /* best-effort */
    }
  }

  async trackClick(id: string): Promise<string | null> {
    try {
      const res = await apiClient.post(`/ads/${id}/click`);
      return res.data?.linkUrl ?? null;
    } catch {
      return null;
    }
  }

  // ===== Admin =====
  async adminList(): Promise<{ ads: AdminAd[]; caps: Record<string, number>; activeCounts: Record<string, number> }> {
    const res = await apiClient.get('/admin/ads');
    return {
      ads: res.data?.ads || [],
      caps: res.data?.caps || { sidebar: 2, feed: 12 },
      activeCounts: res.data?.activeCounts || {},
    };
  }

  async create(data: AdInput): Promise<AdminAd> {
    const res = await apiClient.post('/admin/ads', data);
    return res.data?.ad;
  }

  async update(id: string, data: Partial<AdInput>): Promise<AdminAd> {
    const res = await apiClient.put(`/admin/ads/${id}`, data);
    return res.data?.ad;
  }

  async toggle(id: string): Promise<AdminAd> {
    const res = await apiClient.post(`/admin/ads/${id}/toggle`);
    return res.data?.ad;
  }

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/admin/ads/${id}`);
  }
}

export default new AdsService();
