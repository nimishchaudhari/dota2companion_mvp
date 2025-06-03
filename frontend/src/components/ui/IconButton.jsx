// frontend/src/components/ui/IconButton.jsx
import React from 'react';
import { cn } from '../../utils/cn.js';

const IconButton = React.forwardRef(({ 
  children,
  className,
  variant = 'solid',
  size = 'md',
  colorScheme = 'teal',
  disabled = false,
  isLoading = false,
  icon,
  'aria-label': ariaLabel,
  ...props 
}, ref) => {
  // Base button styles
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dota-bg-primary disabled:opacity-50 disabled:cursor-not-allowed rounded-md';

  // Size variants - square buttons
  const sizeMap = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-14 h-14 text-xl',
  };

  // Color scheme variants
  const getVariantStyles = (variant, colorScheme) => {
    const schemes = {
      teal: {
        solid: 'bg-dota-teal-500 text-white hover:bg-dota-teal-600 hover:-translate-y-0.5 hover:shadow-dota-glow focus:ring-dota-teal-500',
        outline: 'border-2 border-dota-teal-500 text-dota-teal-500 hover:bg-dota-teal-500 hover:text-white focus:ring-dota-teal-500',
        ghost: 'text-dota-teal-500 hover:bg-dota-teal-500/10 focus:ring-dota-teal-500',
      },
      purple: {
        solid: 'bg-dota-purple-500 text-white hover:bg-dota-purple-600 hover:-translate-y-0.5 hover:shadow-hero-glow focus:ring-dota-purple-500',
        outline: 'border-2 border-dota-purple-500 text-dota-purple-500 hover:bg-dota-purple-500 hover:text-white focus:ring-dota-purple-500',
        ghost: 'text-dota-purple-500 hover:bg-dota-purple-500/10 focus:ring-dota-purple-500',
      },
      darkBlue: {
        solid: 'bg-dota-darkBlue-500 text-white hover:bg-dota-darkBlue-600 hover:-translate-y-0.5 hover:shadow-lg focus:ring-dota-darkBlue-500',
        outline: 'border-2 border-dota-darkBlue-500 text-dota-darkBlue-500 hover:bg-dota-darkBlue-500 hover:text-white focus:ring-dota-darkBlue-500',
        ghost: 'text-dota-darkBlue-500 hover:bg-dota-darkBlue-500/10 focus:ring-dota-darkBlue-500',
      },
      gray: {
        solid: 'bg-dota-bg-hover text-dota-text-primary hover:bg-dota-bg-tertiary focus:ring-dota-bg-tertiary',
        outline: 'border-2 border-dota-bg-tertiary text-dota-text-secondary hover:bg-dota-bg-tertiary hover:text-dota-text-primary focus:ring-dota-bg-tertiary',
        ghost: 'text-dota-text-secondary hover:bg-dota-bg-hover hover:text-dota-text-primary focus:ring-dota-bg-tertiary',
      },
    };

    return schemes[colorScheme]?.[variant] || schemes.teal.solid;
  };

  const iconElement = icon || children;

  return (
    <button
      ref={ref}
      className={cn(
        baseStyles,
        sizeMap[size],
        getVariantStyles(variant, colorScheme),
        className
      )}
      disabled={disabled || isLoading}
      aria-label={ariaLabel}
      {...props}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        iconElement
      )}
    </button>
  );
});

IconButton.displayName = 'IconButton';

export default IconButton;