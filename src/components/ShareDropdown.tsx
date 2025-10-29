import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Twitter, Facebook, Linkedin, Mail, Link as LinkIcon, Check } from 'lucide-react'
import { GlassCard } from './GlassCard'

interface ShareDropdownProps {
    url: string
    title: string
    trigger: React.ReactNode
}

export function ShareDropdown({ url, title, trigger }: ShareDropdownProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [copied, setCopied] = useState(false)
    const triggerRef = useRef<HTMLDivElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const [position, setPosition] = useState({ top: 0, left: 0 })

    useEffect(() => {
        if (isOpen && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect()
            const dropdownHeight = 320 // Estimated
            const spaceBelow = window.innerHeight - rect.bottom
            const spaceAbove = rect.top

            if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
                // Open above
                setPosition({
                    top: rect.top - 8,
                    left: rect.left + rect.width / 2
                })
            } else {
                // Open below
                setPosition({
                    top: rect.bottom + 8,
                    left: rect.left + rect.width / 2
                })
            }
        }
    }, [isOpen])

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                triggerRef.current &&
                !triggerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
            return () => document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen])

    const shareLinks = [
        {
            name: 'Twitter',
            icon: Twitter,
            color: 'hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600',
            url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`
        },
        {
            name: 'Facebook',
            icon: Facebook,
            color: 'hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700',
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        },
        {
            name: 'LinkedIn',
            icon: Linkedin,
            color: 'hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-800',
            url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
        },
        {
            name: 'Email',
            icon: Mail,
            color: 'hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900',
            url: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`
        }
    ]

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(url)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (error) {
            console.error('Failed to copy link:', error)
        }
    }

    const handleShare = (shareUrl: string) => {
        window.open(shareUrl, '_blank', 'width=600,height=400')
        setIsOpen(false)
    }

    const dropdown = isOpen && createPortal(
        <div
            ref={dropdownRef}
            className="fixed z-[9999] w-64 animate-in fade-in duration-200"
            style={{
                top: `${position.top}px`,
                left: `${position.left}px`,
                transform: 'translateX(-50%)'
            }}
        >
            <GlassCard className="p-3">
                <h4 className="text-sm font-semibold mb-3 text-gray-900 dark:text-white">Share this post</h4>
                <div className="space-y-1">
                    {shareLinks.map((link) => {
                        const Icon = link.icon
                        return (
                            <button
                                key={link.name}
                                onClick={() => handleShare(link.url)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${link.color}`}
                            >
                                <Icon size={18} />
                                <span className="text-sm font-medium">{link.name}</span>
                            </button>
                        )
                    })}
                    <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                    <button
                        onClick={handleCopyLink}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                    >
                        {copied ? (
                            <>
                                <Check size={18} className="text-green-600" />
                                <span className="text-sm font-medium text-green-600">Link copied!</span>
                            </>
                        ) : (
                            <>
                                <LinkIcon size={18} />
                                <span className="text-sm font-medium">Copy link</span>
                            </>
                        )}
                    </button>
                </div>
            </GlassCard>
        </div>,
        document.body
    )

    return (
        <>
            <div
                ref={triggerRef}
                onClick={(e) => {
                    e.stopPropagation()
                    setIsOpen(!isOpen)
                }}
                className="inline-block cursor-pointer"
            >
                {trigger}
            </div>
            {dropdown}
        </>
    )
}

