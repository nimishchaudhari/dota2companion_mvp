// frontend/src/components/ui/Divider.jsx
import React from 'react';
import { cn } from '../../utils/cn.js';

const Divider = React.forwardRef(({ 
  className,
  orientation = 'horizontal',
  variant = 'solid',
  ...props 
}, ref) => {
  const orientationStyles = orientation === 'vertical' 
    ? 'h-full w-px' 
    : 'w-full h-px';

  const variantStyles = {
    solid: 'bg-dota-bg-tertiary',
    dashed: 'bg-dota-bg-tertiary border-dashed',
  };

  return (
    <div
      ref={ref}
      className={cn(
        orientationStyles,
        variantStyles[variant],
        className
      )}
      role="separator"
      aria-orientation={orientation}
      {...props}
    />
  );
});

Divider.displayName = 'Divider';

export default Divider;