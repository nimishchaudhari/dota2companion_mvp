// frontend/src/components/ui/Progress.jsx
import React from 'react';
import { cn } from '../../utils/cn.js';

const Progress = React.forwardRef(({ 
  value = 0,
  max = 100,
  size = 'md',
  colorScheme = 'teal',
  className,
  ...props 
}, ref) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  // Size variants
  const sizeMap = {
    xs: 'h-1',
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  // Color scheme variants
  const colorMap = {
    teal: 'bg-dota-teal-500',
    purple: 'bg-dota-purple-500',
    darkBlue: 'bg-dota-darkBlue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
  };

  return (
    <div
      ref={ref}
      className={cn(
        'w-full bg-dota-bg-tertiary rounded-full overflow-hidden',
        sizeMap[size],
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'h-full transition-all duration-300 ease-out rounded-full',
          colorMap[colorScheme]
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
});

Progress.displayName = 'Progress';

export default Progress;