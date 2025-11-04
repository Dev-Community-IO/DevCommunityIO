import { useState, cloneElement, isValidElement } from 'react'
import { ShareModal } from './ShareModal'

interface ShareDropdownProps {
    url: string
    title: string
    trigger: React.ReactNode
    type?: 'post' | 'hackathon' | 'event' | 'opportunity'
    hashtags?: (string | { name?: string; slug?: string; id?: string })[]
    description?: string
}

export function ShareDropdown({ url, title, trigger, type, hashtags = [], description }: ShareDropdownProps) {
    const [isOpen, setIsOpen] = useState(false)

    // Clone the trigger element and add onClick handler
    const handleTriggerClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        setIsOpen(true)
            }

    const triggerWithHandler = isValidElement(trigger)
        ? cloneElement(trigger as React.ReactElement, {
            onClick: (e: React.MouseEvent) => {
                e.stopPropagation()
                setIsOpen(true)
                // Call original onClick if it exists (for stopPropagation)
                const originalOnClick = (trigger as React.ReactElement).props?.onClick
                if (originalOnClick) {
                    originalOnClick(e)
                }
            }
        })
        : trigger

    return (
        <>
            <div className="inline-block">
                {triggerWithHandler}
            </div>
            <ShareModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                url={url}
                title={title}
                type={type}
                hashtags={hashtags}
                description={description}
            />
        </>
    )
}

