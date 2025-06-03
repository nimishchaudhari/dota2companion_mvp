// frontend/src/components/ui/Container.jsx
import React from 'react';
import { cn } from '../../utils/cn.js';

const Container = React.forwardRef(({ 
  children,
  className,
  maxW = '7xl',
  centerContent = false,
  ...props 
}, ref) => {
  const maxWidthMap = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <div
      ref={ref}
      className={cn(
        'w-full mx-auto px-4 sm:px-6 lg:px-8',
        maxWidthMap[maxW],
        centerContent && 'flex items-center justify-center',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Container.displayName = 'Container';

export default Container;