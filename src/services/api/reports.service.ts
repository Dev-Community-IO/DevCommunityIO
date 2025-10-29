import apiClient from './config'

interface ReportData {
    postId?: string
    commentId?: string
    reason: 'spam' | 'harassment' | 'hate_speech' | 'violence' | 'misinformation' | 'copyright' | 'other'
    description?: string
}

class ReportsService {
    /**
     * Report a post or comment
     */
    async reportContent(data: ReportData): Promise<{ message: string; report: any }> {
        const response = await apiClient.post('/reports', data)
        return response.data
    }

    /**
     * Get user's reports (if needed)
     */
    async getUserReports(): Promise<{ reports: any[] }> {
        const response = await apiClient.get('/reports')
        return response.data
    }
}

export default new ReportsService()

