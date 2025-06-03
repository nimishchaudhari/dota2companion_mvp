// frontend/src/components/ui/Heading.jsx
import React from 'react';
import { cn } from '../../utils/cn.js';

const Heading = React.forwardRef(({ 
  children,
  className,
  as: Component = 'h2',
  size = 'lg',
  weight = 'bold',
  color = 'primary',
  ...props 
}, ref) => {
  // Size mapping
  const sizeMap = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl',
    '2xl': 'text-3xl',
    '3xl': 'text-4xl',
    '4xl': 'text-5xl',
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
    white: 'text-white',
    inherit: 'text-inherit',
  };

  return (
    <Component
      ref={ref}
      className={cn(
        sizeMap[size],
        weightMap[weight],
        colorMap[color] || color,
        'leading-tight',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
});

Heading.displayName = 'Heading';

export default Heading;