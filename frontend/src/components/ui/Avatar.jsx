// frontend/src/components/ui/Avatar.jsx
import React, { useState } from 'react';
import { cn } from '../../utils/cn.js';

const Avatar = React.forwardRef(({ 
  src,
  alt,
  name,
  size = 'md',
  className,
  fallback,
  ...props 
}, ref) => {
  const [imageError, setImageError] = useState(false);

  // Size mapping
  const sizeMap = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
  };

  // Generate initials from name
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const shouldShowImage = src && !imageError;
  const shouldShowFallback = fallback && !shouldShowImage;
  const shouldShowInitials = !shouldShowImage && !shouldShowFallback && name;

  return (
    <div
      ref={ref}
      className={cn(
        'relative inline-flex items-center justify-center rounded-full bg-dota-bg-tertiary text-dota-text-secondary font-medium border-2 border-dota-bg-hover overflow-hidden',
        sizeMap[size],
        className
      )}
      {...props}
    >
      {shouldShowImage && (
        <img
          src={src}
          alt={alt || name || 'Avatar'}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      )}
      
      {shouldShowFallback && fallback}
      
      {shouldShowInitials && (
        <span className="select-none">
          {getInitials(name)}
        </span>
      )}
      
      {!shouldShowImage && !shouldShowFallback && !shouldShowInitials && (
        <span className="select-none">?</span>
      )}
    </div>
  );
});

Avatar.displayName = 'Avatar';

export default Avatar;