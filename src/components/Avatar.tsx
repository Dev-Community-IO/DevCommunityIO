import { useState } from 'react';

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
    xl: 'w-16 h-16'
  };

  const sizeClass = className.includes('w-') ? '' : sizes[size];
  
  // Fallback avatar based on username/alt with colorful backgrounds
  const getFallbackAvatar = () => {
    const seed = alt || 'default';
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
  };

  const handleError = () => {
    setImgError(true);
    setImgLoading(false);
  };

  const handleLoad = () => {
    setImgLoading(false);
  };

  const avatarSrc = imgError || !src ? getFallbackAvatar() : src;

  return (
    <div className={`${sizeClass} rounded-full overflow-hidden border-2 border-white/30 dark:border-white/20 shadow-sm ${className} relative bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800`}>
      {imgLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1/2 h-1/2 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
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
