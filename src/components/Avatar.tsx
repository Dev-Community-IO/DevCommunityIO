import { useState } from 'react';

interface AvatarProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Avatar({ src, alt, size = 'md', className = '' }: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const sizeClass = className.includes('w-') ? '' : sizes[size];
  
  // Fallback avatar based on username/alt
  const getFallbackAvatar = () => {
    const seed = alt || 'default';
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
  };

  const handleError = () => {
    setImgError(true);
  };

  const avatarSrc = imgError || !src ? getFallbackAvatar() : src;

  return (
    <div className={`${sizeClass} rounded-full overflow-hidden border-2 border-white/30 dark:border-white/20 shadow-sm ${className}`}>
      <img 
        src={avatarSrc} 
        alt={alt} 
        className="w-full h-full object-cover"
        onError={handleError}
      />
    </div>
  );
}
