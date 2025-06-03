// frontend/src/components/ui/Spinner.jsx
import React from 'react';
import { cn } from '../../utils/cn.js';

const Spinner = React.forwardRef(({ 
  size = 'md',
  color = 'teal',
  thickness = '2px',
  speed = '0.65s',
  className,
  ...props 
}, ref) => {
  // Size variants
  const sizeMap = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  // Color variants
  const colorMap = {
    teal: 'border-dota-teal-500',
    purple: 'border-dota-purple-500',
    darkBlue: 'border-dota-darkBlue-500',
    white: 'border-white',
    current: 'border-current',
  };

  return (
    <div
      ref={ref}
      className={cn(
        'inline-block rounded-full border-2 border-solid border-transparent border-t-current animate-spin',
        sizeMap[size],
        colorMap[color],
        className
      )}
      style={{
        borderTopColor: 'currentColor',
        borderWidth: thickness,
        animationDuration: speed,
      }}
      {...props}
    />
  );
});

Spinner.displayName = 'Spinner';

export default Spinner;