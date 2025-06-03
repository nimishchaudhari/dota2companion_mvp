// frontend/src/components/ui/Text.jsx
import React from 'react';
import { cn } from '../../utils/cn.js';

const Text = React.forwardRef(({ 
  children,
  className,
  as: Component = 'p',
  size = 'md',
  weight = 'normal',
  color = 'primary',
  isTruncated = false,
  noOfLines,
  ...props 
}, ref) => {
  // Size mapping
  const sizeMap = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
  };

  // Weight mapping
  const weightMap = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };

  // Color mapping
  const colorMap = {
    primary: 'text-dota-text-primary',
    secondary: 'text-dota-text-secondary',
    muted: 'text-dota-text-muted',
    accent: 'text-dota-text-accent',
    success: 'text-dota-status-success',
    warning: 'text-dota-status-warning',
    error: 'text-dota-status-error',
    info: 'text-dota-status-info',
    white: 'text-white',
    inherit: 'text-inherit',
  };

  const truncateStyles = isTruncated ? 'truncate' : '';
  const lineClampStyles = noOfLines ? `line-clamp-${noOfLines}` : '';

  return (
    <Component
      ref={ref}
      className={cn(
        sizeMap[size],
        weightMap[weight],
        colorMap[color] || color,
        truncateStyles,
        lineClampStyles,
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
});

Text.displayName = 'Text';

export default Text;