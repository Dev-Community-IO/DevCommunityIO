import { useState, useEffect } from 'react';

interface ResponsivePostImageProps {
  coverImageUrl?: string | null;
  coverImageSizes?: { thumb?: string; feed?: string; mobile?: string; full?: string } | null;
  alt: string;
  className?: string;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  size?: 'thumb' | 'feed' | 'mobile' | 'full'; // Force a specific size
}

/**
 * ResponsivePostImage component
 * Automatically selects the best image size based on viewport or forced size
 * - thumb: 400px (for cards, thumbnails)
 * - feed: 800px (for feed display)
 * - mobile: 1200px (for mobile view)
 * - full: 1920px (for full view)
 */
export function ResponsivePostImage({
  coverImageUrl,
  coverImageSizes,
  alt,
  className = '',
  onError,
  size,
}: ResponsivePostImageProps) {
  const [imageSize, setImageSize] = useState<'thumb' | 'feed' | 'mobile' | 'full'>('feed');
  const [currentSrc, setCurrentSrc] = useState<string | null>(null);

  // Determine which size to use
  useEffect(() => {
    if (size) {
      // Use forced size
      setImageSize(size);
      return;
    }

    // Auto-detect based on viewport
    const updateSize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        // Mobile
        setImageSize('thumb');
      } else if (width < 1024) {
        // Tablet
        setImageSize('feed');
      } else if (width < 1280) {
        // Desktop
        setImageSize('mobile');
      } else {
        // Large desktop
        setImageSize('full');
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [size]);

  // Get the image URL based on size
  useEffect(() => {
    if (coverImageSizes) {
      // Use the appropriate size from coverImageSizes
      const url = coverImageSizes[imageSize] || coverImageSizes.full || coverImageSizes.mobile || coverImageSizes.feed || coverImageSizes.thumb;
      setCurrentSrc(url || null);
    } else if (coverImageUrl) {
      // Fallback to legacy coverImageUrl
      setCurrentSrc(coverImageUrl);
    } else {
      setCurrentSrc(null);
    }
  }, [coverImageSizes, coverImageUrl, imageSize]);

  if (!currentSrc) {
    return null;
  }

  // Generate srcset for better performance
  const generateSrcSet = () => {
    if (!coverImageSizes) return undefined;
    
    const sizes = [
      { size: 'thumb', url: coverImageSizes.thumb },
      { size: 'feed', url: coverImageSizes.feed },
      { size: 'mobile', url: coverImageSizes.mobile },
      { size: 'full', url: coverImageSizes.full },
    ].filter(s => s.url);

    if (sizes.length === 0) return undefined;

    return sizes.map(s => {
      const width = s.size === 'thumb' ? '400w' : s.size === 'feed' ? '800w' : s.size === 'mobile' ? '1200w' : '1920w';
      return `${s.url} ${width}`;
    }).join(', ');
  };

  const srcSet = generateSrcSet();
  const sizes = size 
    ? undefined 
    : '(max-width: 640px) 400px, (max-width: 1024px) 800px, (max-width: 1280px) 1200px, 1920px';

  return (
    <img
      src={currentSrc}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      className={className}
      onError={onError}
      loading="lazy"
      decoding="async"
    />
  );
}

