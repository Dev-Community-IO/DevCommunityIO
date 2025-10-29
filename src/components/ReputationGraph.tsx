import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Calendar, BarChart3 } from 'lucide-react'
import { GlassCard } from './GlassCard'
import { reputationService, type ReputationGraphResponse } from '../services/api/reputation.service'

interface ReputationGraphProps {
  username: string
}

export function ReputationGraph({ username }: ReputationGraphProps) {
  const [graphData, setGraphData] = useState<ReputationGraphResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y' | 'all'>('30d')
  const [error, setError] = useState<string | null>(null)

  const periods = [
    { value: '7d' as const, label: '7 Days' },
    { value: '30d' as const, label: '30 Days' },
    { value: '90d' as const, label: '90 Days' },
    { value: '1y' as const, label: '1 Year' },
    { value: 'all' as const, label: 'All Time' },
  ]

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await reputationService.getGraph(username, selectedPeriod)
        setGraphData(data)
      } catch (err: any) {
        setError(err.message || 'Failed to load reputation graph')
        console.error('Error fetching reputation graph:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchGraphData()
  }, [username, selectedPeriod])

  if (loading) {
    return (
      <GlassCard className="p-6">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </GlassCard>
    )
  }

  if (error || !graphData) {
    return (
      <GlassCard className="p-6">
        <div className="text-center text-gray-500 dark:text-gray-400">
          {error || 'No reputation data available'}
        </div>
      </GlassCard>
    )
  }

  // Calculate chart dimensions and values
  const maxReputation = Math.max(...graphData.data.map(d => d.reputation), graphData.currentReputation)
  const minReputation = Math.min(...graphData.data.map(d => d.reputation), 0)
  const range = maxReputation - minReputation || 1
  const chartHeight = 200
  const chartWidth = Math.max(600, graphData.data.length * 10)

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    if (selectedPeriod === '7d' || selectedPeriod === '30d') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    } else if (selectedPeriod === '90d') {
      return date.toLocaleDateString('en-US', { month: 'short' })
    } else {
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
    }
  }

  return (
    <GlassCard className="p-4 sm:p-6">
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <BarChart3 size={24} className="text-blue-500" />
              Reputation Graph
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Track your reputation over time
            </p>
          </div>

          {/* Period Selector */}
          <div className="flex gap-2 flex-wrap">
            {periods.map((period) => (
              <button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  selectedPeriod === period.value
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-4 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="text-blue-500" size={20} />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Current</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold">{graphData.currentReputation.toLocaleString()}</p>
          </div>

          <div className={`bg-gradient-to-br rounded-xl p-4 border ${
            graphData.totalChange >= 0
              ? 'from-green-500/10 to-emerald-500/10 border-green-500/20'
              : 'from-red-500/10 to-pink-500/10 border-red-500/20'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {graphData.totalChange >= 0 ? (
                <TrendingUp className="text-green-500" size={20} />
              ) : (
                <TrendingDown className="text-red-500" size={20} />
              )}
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Change</span>
            </div>
            <p className={`text-2xl sm:text-3xl font-bold ${
              graphData.totalChange >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {graphData.totalChange >= 0 ? '+' : ''}{graphData.totalChange.toLocaleString()}
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="text-purple-500" size={20} />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Period</span>
            </div>
            <p className="text-sm font-semibold">
              {new Date(graphData.startDate).toLocaleDateString()} - {new Date(graphData.endDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Graph */}
        {graphData.data.length > 0 ? (
          <div className="relative">
            <div className="overflow-x-auto">
              <div className="relative" style={{ minWidth: chartWidth, height: chartHeight + 60 }}>
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-12 flex flex-col justify-between text-xs text-gray-500 dark:text-gray-400 pr-2">
                  <span>{Math.round(maxReputation)}</span>
                  <span>{Math.round((maxReputation + minReputation) / 2)}</span>
                  <span>{Math.round(minReputation)}</span>
                </div>

                {/* Chart area */}
                <div className="ml-12 mt-4" style={{ height: chartHeight, position: 'relative' }}>
                  {/* Grid lines */}
                  <svg
                    width="100%"
                    height={chartHeight}
                    className="absolute inset-0"
                    style={{ minWidth: chartWidth - 48 }}
                  >
                    {[0, 1, 2, 3, 4].map((i) => (
                      <line
                        key={i}
                        x1="0"
                        y1={(chartHeight / 4) * i}
                        x2="100%"
                        y2={(chartHeight / 4) * i}
                        stroke="currentColor"
                        strokeWidth="1"
                        opacity="0.1"
                        className="text-gray-400"
                      />
                    ))}
                  </svg>

                  {/* Line chart */}
                  <svg
                    width="100%"
                    height={chartHeight}
                    className="relative"
                    style={{ minWidth: chartWidth - 48 }}
                  >
                    {/* Gradient definition */}
                    <defs>
                      <linearGradient id="reputationGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    {/* Area fill */}
                    <path
                      d={`M 0 ${chartHeight} ${graphData.data
                        .map(
                          (point, index) =>
                            `L ${(index / (graphData.data.length - 1 || 1)) * 100}% ${
                              chartHeight - ((point.reputation - minReputation) / range) * chartHeight
                            }`
                        )
                        .join(' ')} L 100% ${chartHeight} Z`}
                      fill="url(#reputationGradient)"
                    />

                    {/* Line */}
                    <polyline
                      points={graphData.data
                        .map(
                          (point, index) =>
                            `${(index / (graphData.data.length - 1 || 1)) * 100}%,${
                              chartHeight - ((point.reputation - minReputation) / range) * chartHeight
                            }`
                        )
                        .join(' ')}
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Data points */}
                    {graphData.data.map((point, index) => (
                      <g key={index}>
                        <circle
                          cx={`${(index / (graphData.data.length - 1 || 1)) * 100}%`}
                          cy={chartHeight - ((point.reputation - minReputation) / range) * chartHeight}
                          r="4"
                          fill="#3b82f6"
                          className="hover:r-6 transition-all cursor-pointer"
                        />
                        <title>
                          {formatDate(point.date)}: {point.reputation} reputation ({point.change >= 0 ? '+' : ''}
                          {point.change})
                        </title>
                      </g>
                    ))}
                  </svg>
                </div>

                {/* X-axis labels */}
                <div className="ml-12 mt-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  {graphData.data.length > 0 && (
                    <>
                      <span>{formatDate(graphData.data[0].date)}</span>
                      {graphData.data.length > 1 && (
                        <span>{formatDate(graphData.data[graphData.data.length - 1].date)}</span>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
            <p>No reputation data available for this period</p>
          </div>
        )}
      </div>
    </GlassCard>
  )
}

