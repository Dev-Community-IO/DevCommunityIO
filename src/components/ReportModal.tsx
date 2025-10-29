import { useState } from 'react'
import { X, AlertTriangle } from 'lucide-react'
import { GlassCard } from './GlassCard'
import { Button } from './Button'
import reportsService from '../services/api/reports.service'

interface ReportModalProps {
    isOpen: boolean
    onClose: () => void
    postId?: string
    commentId?: string
}

const reportReasons = [
    { value: 'spam', label: 'Spam or misleading' },
    { value: 'harassment', label: 'Harassment or bullying' },
    { value: 'hate_speech', label: 'Hate speech' },
    { value: 'violence', label: 'Violence or dangerous content' },
    { value: 'misinformation', label: 'False information' },
    { value: 'copyright', label: 'Copyright infringement' },
    { value: 'other', label: 'Other' }
] as const

export function ReportModal({ isOpen, onClose, postId, commentId }: ReportModalProps) {
    const [reason, setReason] = useState<string>('')
    const [description, setDescription] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!reason) return

        setSubmitting(true)
        try {
            await reportsService.reportContent({
                postId,
                commentId,
                reason: reason as any,
                description: description || undefined
            })

            setSuccess(true)
            setTimeout(() => {
                onClose()
                setSuccess(false)
                setReason('')
                setDescription('')
            }, 2000)
        } catch (error: any) {
            console.error('Failed to submit report:', error)
            alert(error.response?.data?.message || 'Failed to submit report')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <GlassCard className="w-full max-w-md p-6 relative animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    <X size={20} />
                </button>

                {success ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle size={32} className="text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Report Submitted</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Thank you for helping keep our community safe.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                                <AlertTriangle size={20} className="text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Report Content</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Help us understand the issue
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                    Reason for reporting *
                                </label>
                                <select
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    required
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                >
                                    <option value="">Select a reason...</option>
                                    {reportReasons.map((r) => (
                                        <option key={r.value} value={r.value}>
                                            {r.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                    Additional details (optional)
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={4}
                                    placeholder="Please provide any additional information..."
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={onClose}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={!reason || submitting}
                                    className="flex-1"
                                >
                                    {submitting ? 'Submitting...' : 'Submit Report'}
                                </Button>
                            </div>
                        </form>
                    </>
                )}
            </GlassCard>
        </div>
    )
}
