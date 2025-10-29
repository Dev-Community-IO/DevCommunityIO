import { useState, useRef, useEffect } from 'react'
import { Avatar } from './Avatar'
import apiClient from '../services/api/config'

interface User {
    id: string
    username: string
    pseudo?: string
    avatarUrl: string
}

interface MentionTextareaProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    rows?: number
    className?: string
}

export function MentionTextarea({ value, onChange, placeholder, rows = 4, className = '' }: MentionTextareaProps) {
    const [suggestions, setSuggestions] = useState<User[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [mentionSearch, setMentionSearch] = useState('')
    const [mentionStartPos, setMentionStartPos] = useState(-1)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const suggestionsRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (mentionSearch.length >= 2) {
            fetchUsers(mentionSearch)
        } else {
            setSuggestions([])
            setShowSuggestions(false)
        }
    }, [mentionSearch])

    const fetchUsers = async (query: string) => {
        try {
            const response = await apiClient.get('/users/search', { params: { q: query } })
            setSuggestions(response.data.users || [])
            setShowSuggestions(true)
        } catch (error) {
            console.error('Failed to fetch users:', error)
            setSuggestions([])
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value
        const cursorPos = e.target.selectionStart

        onChange(newValue)

        // Detect @ mention
        const textBeforeCursor = newValue.substring(0, cursorPos)
        const lastAtIndex = textBeforeCursor.lastIndexOf('@')

        if (lastAtIndex !== -1) {
            const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1)
            const hasSpaceAfterAt = textAfterAt.includes(' ')

            if (!hasSpaceAfterAt && textAfterAt.length >= 0) {
                setMentionStartPos(lastAtIndex)
                setMentionSearch(textAfterAt)
                setSelectedIndex(0)
            } else {
                setShowSuggestions(false)
                setMentionStartPos(-1)
            }
        } else {
            setShowSuggestions(false)
            setMentionStartPos(-1)
        }
    }

    const insertMention = (user: User) => {
        if (mentionStartPos === -1 || !textareaRef.current) return

        const username = user.username
        const beforeMention = value.substring(0, mentionStartPos)
        const afterMention = value.substring(mentionStartPos + mentionSearch.length + 1)
        const newValue = `${beforeMention}@${username} ${afterMention}`

        onChange(newValue)
        setShowSuggestions(false)
        setMentionStartPos(-1)

        // Set cursor position after the mention
        setTimeout(() => {
            if (textareaRef.current) {
                const newCursorPos = mentionStartPos + username.length + 2
                textareaRef.current.focus()
                textareaRef.current.setSelectionRange(newCursorPos, newCursorPos)
            }
        }, 0)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (!showSuggestions || suggestions.length === 0) return

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault()
                setSelectedIndex((prev) => (prev + 1) % suggestions.length)
                break
            case 'ArrowUp':
                e.preventDefault()
                setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length)
                break
            case 'Enter':
                if (showSuggestions) {
                    e.preventDefault()
                    insertMention(suggestions[selectedIndex])
                }
                break
            case 'Escape':
                setShowSuggestions(false)
                break
        }
    }

    return (
        <div className="relative">
            <textarea
                ref={textareaRef}
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                rows={rows}
                className={`w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${className}`}
            />

            {showSuggestions && suggestions.length > 0 && (
                <div
                    ref={suggestionsRef}
                    className="absolute z-50 w-full max-w-sm mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-64 overflow-y-auto"
                >
                    {suggestions.map((user, index) => (
                        <button
                            key={user.id}
                            onClick={() => insertMention(user)}
                            onMouseEnter={() => setSelectedIndex(index)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                                index === selectedIndex ? 'bg-gray-100 dark:bg-gray-700' : ''
                            }`}
                        >
                            <Avatar src={user.avatarUrl} alt={user.username} size="sm" className="w-8 h-8" />
                            <div className="flex-1 text-left">
                                <div className="font-medium text-sm text-gray-900 dark:text-white">
                                    {user.pseudo || user.username}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    @{user.username}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

