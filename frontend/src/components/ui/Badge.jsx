// frontend/src/components/ui/Badge.jsx
import React from 'react';
import { cn } from '../../utils/cn.js';

const Badge = React.forwardRef(({ 
  children,
  className,
  variant = 'solid',
  colorScheme = 'teal',
  size = 'md',
  ...props 
}, ref) => {
  // Size variants
  const sizeMap = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-xs',
    lg: 'px-3 py-1 text-sm',
  };

  // Color scheme variants
  const getVariantStyles = (variant, colorScheme) => {
    const schemes = {
      teal: {
        solid: 'bg-dota-teal-500 text-white',
        subtle: 'bg-dota-teal-500/10 text-dota-teal-400 border border-dota-teal-500/20',
        outline: 'border border-dota-teal-500 text-dota-teal-500 bg-transparent',
      },
      purple: {
        solid: 'bg-dota-purple-500 text-white',
        subtle: 'bg-dota-purple-500/10 text-dota-purple-400 border border-dota-purple-500/20',
        outline: 'border border-dota-purple-500 text-dota-purple-500 bg-transparent',
      },
      darkBlue: {
        solid: 'bg-dota-darkBlue-500 text-white',
        subtle: 'bg-dota-darkBlue-500/10 text-dota-darkBlue-400 border border-dota-darkBlue-500/20',
        outline: 'border border-dota-darkBlue-500 text-dota-darkBlue-500 bg-transparent',
      },
      red: {
        solid: 'bg-red-500 text-white',
        subtle: 'bg-red-500/10 text-red-400 border border-red-500/20',
        outline: 'border border-red-500 text-red-500 bg-transparent',
      },
      green: {
        solid: 'bg-green-500 text-white',
        subtle: 'bg-green-500/10 text-green-400 border border-green-500/20',
        outline: 'border border-green-500 text-green-500 bg-transparent',
      },
      yellow: {
        solid: 'bg-yellow-500 text-black',
        subtle: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
        outline: 'border border-yellow-500 text-yellow-500 bg-transparent',
      },
    };

    return schemes[colorScheme]?.[variant] || schemes.teal.solid;
  };

  return (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-md',
        sizeMap[size],
        getVariantStyles(variant, colorScheme),
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
});

Badge.displayName = 'Badge';

export default Badge;