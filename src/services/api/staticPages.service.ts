import { apiClient } from '../api/config';

export interface StaticPage {
  slug: string;
  content: string;
  title: string;
}

class StaticPagesService {
  async getPage(slug: string): Promise<StaticPage> {
    const response = await apiClient.get(`/static-pages/${slug}`);
    return response.data;
  }
}

export default new StaticPagesService();

