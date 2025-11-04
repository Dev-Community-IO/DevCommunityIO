import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Twitter, Linkedin, Link as LinkIcon, Check, Hash } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
  type?: 'post' | 'hackathon' | 'event' | 'opportunity';
  hashtags?: (string | { name?: string; slug?: string; id?: string })[];
  description?: string;
}

export function ShareModal({ isOpen, onClose, url, title, type, hashtags = [] }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Generate hashtags string for sharing
  // Handle both string tags and object tags (with name/slug properties)
  const normalizeTag = (tag: string | { name?: string; slug?: string; id?: string }): string => {
    if (typeof tag === 'string') {
      return tag;
    }
    return tag.name || tag.slug || tag.id || '';
  };

  const hashtagsString = hashtags.length > 0 
    ? hashtags
        .map(tag => {
          const tagName = normalizeTag(tag);
          return tagName ? `#${tagName.replace(/\s+/g, '')}` : '';
        })
        .filter(Boolean)
        .join(' ') 
    : '';

  // Get normalized hashtags for display
  const normalizedHashtags = hashtags
    .map(tag => normalizeTag(tag))
    .filter(Boolean);

  // Share text with title and hashtags
  const shareText = `${title}${hashtagsString ? ` ${hashtagsString}` : ''}`;

  const handleCopyLink = async () => {
    try {
      // Include title and hashtags in the link text
      const linkText = hashtagsString 
        ? `${title}\n\n${hashtagsString}\n\n${url}`
        : `${title}\n\n${url}`;
      
      await navigator.clipboard.writeText(linkText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      // Fallback: try copying just the URL
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy URL:', err);
      }
    }
  };

  const handleShareX = () => {
    // X (Twitter) share URL
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400,noopener,noreferrer');
  };

  const handleShareLinkedIn = () => {
    // LinkedIn share URL
    // LinkedIn extracts metadata from the URL's Open Graph tags automatically
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(linkedInUrl, '_blank', 'width=600,height=400,noopener,noreferrer');
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-md animate-slide-up">
        <GlassCard className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">
                Share
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Share this content with your network
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all duration-200"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content Preview */}
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 space-y-3">
            {/* Title */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                {title}
              </h3>
            </div>

            {/* Type */}
            {type && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  {type === 'post' && '📝 Post'}
                  {type === 'hackathon' && '🏆 Hackathon'}
                  {type === 'event' && '📅 Event'}
                  {type === 'opportunity' && '💼 Opportunity'}
                </span>
              </div>
            )}

            {/* Link */}
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <LinkIcon size={14} className="flex-shrink-0" />
                <span className="truncate break-all">{url}</span>
              </div>
            </div>

            {/* Tags if exist */}
            {normalizedHashtags.length > 0 && (
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap gap-2">
                  {normalizedHashtags.slice(0, 5).map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                    >
                      <Hash size={12} />
                      {tag}
                    </span>
                  ))}
                  {normalizedHashtags.length > 5 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 self-center">
                      +{normalizedHashtags.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Share Options */}
          <div className="space-y-3">
            {/* X (Twitter) */}
            <button
              onClick={handleShareX}
              className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl bg-black hover:bg-gray-900 dark:bg-gray-800 dark:hover:bg-gray-700 text-white transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] group"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <Twitter size={20} />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold">Share on X</div>
                <div className="text-xs text-gray-300 dark:text-gray-400">
                  Share with your X followers
                </div>
              </div>
            </button>

            {/* LinkedIn */}
            <button
              onClick={handleShareLinkedIn}
              className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl bg-[#0077B5] hover:bg-[#006399] text-white transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] group"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <Linkedin size={20} />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold">Share on LinkedIn</div>
                <div className="text-xs text-gray-100 dark:text-gray-300">
                  Share with your professional network
                </div>
              </div>
            </button>

            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] group"
            >
              <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                copied 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                  : 'bg-gray-200 dark:bg-gray-700 group-hover:bg-gray-300 dark:group-hover:bg-gray-600 text-gray-700 dark:text-gray-300'
              }`}>
                {copied ? <Check size={20} /> : <LinkIcon size={20} />}
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold">
                  {copied ? 'Link Copied!' : 'Copy Link'}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {copied ? 'Link copied to clipboard' : 'Copy link with title and hashtags'}
                </div>
              </div>
            </button>
          </div>

          {/* Footer Note */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              The link includes the title and hashtags for easy sharing
            </p>
          </div>
        </GlassCard>
      </div>
    </div>,
    document.body
  );
}

