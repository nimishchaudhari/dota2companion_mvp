// frontend/src/components/ui/Button.jsx
import React from 'react';
import { cn } from '../../utils/cn.js';

const Button = React.forwardRef(({ 
  children,
  className,
  variant = 'solid',
  size = 'md',
  colorScheme = 'teal',
  disabled = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  as: Component = 'button',
  ...props 
}, ref) => {
  // Base button styles
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dota-bg-primary disabled:opacity-50 disabled:cursor-not-allowed';

  // Size variants
  const sizeMap = {
    xs: 'px-2 py-1 text-xs h-6',
    sm: 'px-3 py-1.5 text-sm h-8',
    md: 'px-4 py-2 text-sm h-10',
    lg: 'px-6 py-3 text-base h-12',
    xl: 'px-8 py-4 text-lg h-14',
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
      red: {
        solid: 'bg-red-500 text-white hover:bg-red-600 hover:-translate-y-0.5 hover:shadow-lg focus:ring-red-500',
        outline: 'border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white focus:ring-red-500',
        ghost: 'text-red-400 hover:bg-red-500 hover:text-white focus:ring-red-500',
      },
    };

    return schemes[colorScheme]?.[variant] || schemes.teal.solid;
  };

  return (
    <Component
      ref={ref}
      className={cn(
        baseStyles,
        sizeMap[size],
        getVariantStyles(variant, colorScheme),
        'rounded-md',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : leftIcon ? (
        <span className="mr-2">{leftIcon}</span>
      ) : null}
      {children}
      {rightIcon && <span className="ml-2">{rightIcon}</span>}
    </Component>
  );
});

Button.displayName = 'Button';

export default Button;