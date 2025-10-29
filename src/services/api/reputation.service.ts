import apiClient from './config'

export interface ReputationHistoryEntry {
    id: string
    userId: string
    change: number
    reputationBefore: number
    reputationAfter: number
    sourceType: 'post' | 'comment' | 'vote' | 'achievement' | 'manual' | 'moderation' | 'other'
    sourceId: string | null
    reason: string | null
    metadata: Record<string, any> | null
    createdAt: string
}

export interface ReputationGraphDataPoint {
    date: string
    reputation: number
    change: number
}

export interface ReputationGraphResponse {
    period: '7d' | '30d' | '90d' | '1y' | 'all'
    startDate: string
    endDate: string
    data: ReputationGraphDataPoint[]
    currentReputation: number
    totalChange: number
}

export interface ReputationStats {
    currentReputation: number
    totalChanges: number
    totalGained: number
    totalLost: number
    bySourceType: Array<{
        source_type: string
        count: string
        total_change: string
    }>
}

export const reputationService = {
    /**
     * Get reputation history for a user
     */
    async getHistory(
        username: string,
        options?: {
            limit?: number
            offset?: number
            sourceType?: string
        }
    ): Promise<{ history: ReputationHistoryEntry[] }> {
        const params = new URLSearchParams()
        if (options?.limit) params.append('limit', options.limit.toString())
        if (options?.offset) params.append('offset', options.offset.toString())
        if (options?.sourceType) params.append('sourceType', options.sourceType)

        const response = await apiClient.get(
            `/users/${username}/reputation/history?${params.toString()}`
        )
        return response.data
    },

    /**
     * Get reputation graph data
     */
    async getGraph(
        username: string,
        period: '7d' | '30d' | '90d' | '1y' | 'all' = '30d'
    ): Promise<ReputationGraphResponse> {
        const response = await apiClient.get(
            `/users/${username}/reputation/graph?period=${period}`
        )
        return response.data
    },

    /**
     * Get reputation statistics
     */
    async getStats(username: string): Promise<ReputationStats> {
        const response = await apiClient.get(`/users/${username}/reputation/stats`)
        return response.data
    },
}

