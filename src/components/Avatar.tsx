import { useState } from 'react';
import { getDefaultUserAvatar, resolveUserAvatarUrl } from '../utils/defaultAvatar';

interface AvatarProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Avatar({ src, alt, size = 'md', className = '' }: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const [imgLoading, setImgLoading] = useState(true);

  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const sizeClass = className.includes('w-') ? '' : sizes[size];

  const getFallbackAvatar = () => getDefaultUserAvatar(alt);
  const normalizedSrc = resolveUserAvatarUrl(src, alt);

  const handleError = () => {
    setImgError(true);
    setImgLoading(false);
  };

  const handleLoad = () => {
    setImgLoading(false);
  };

  const avatarSrc = imgError ? getFallbackAvatar() : normalizedSrc;

  return (
    <div
      className={`${sizeClass} rounded-full overflow-hidden ring-1 ring-zinc-200/80 dark:ring-white/10 shadow-sm ${className} relative bg-zinc-100 dark:bg-zinc-800`}
    >
      {imgLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1/2 h-1/2 bg-zinc-300 dark:bg-zinc-600 rounded-full animate-pulse" />
        </div>
      )}
      <img
        src={avatarSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-200 ${imgLoading ? 'opacity-0' : 'opacity-100'}`}
        onError={handleError}
        onLoad={handleLoad}
        loading="lazy"
      />
    </div>
  );
}
