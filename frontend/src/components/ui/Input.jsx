// frontend/src/components/ui/Input.jsx
import React from 'react';
import { cn } from '../../utils/cn.js';

const Input = React.forwardRef(({ 
  className,
  variant = 'outline',
  size = 'md',
  isInvalid = false,
  isDisabled = false,
  isReadOnly = false,
  placeholder,
  ...props 
}, ref) => {
  // Size variants
  const sizeMap = {
    xs: 'px-2 py-1 text-xs h-6',
    sm: 'px-3 py-1.5 text-sm h-8',
    md: 'px-3 py-2 text-sm h-10',
    lg: 'px-4 py-3 text-base h-12',
  };

  // Variant styles
  const variantStyles = {
    outline: 'border-2 border-dota-bg-tertiary bg-dota-bg-secondary focus:border-dota-teal-500 focus:ring-2 focus:ring-dota-teal-500/20',
    filled: 'border-0 bg-dota-bg-hover focus:bg-dota-bg-tertiary focus:ring-2 focus:ring-dota-teal-500/20',
    flushed: 'border-0 border-b-2 border-dota-bg-tertiary rounded-none bg-transparent focus:border-dota-teal-500',
  };

  return (
    <input
      ref={ref}
      className={cn(
        'w-full rounded-md font-medium transition-all duration-200 ease-in-out',
        'text-dota-text-primary placeholder-dota-text-muted',
        'focus:outline-none',
        sizeMap[size],
        variantStyles[variant],
        isInvalid && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
        isDisabled && 'opacity-50 cursor-not-allowed',
        isReadOnly && 'bg-dota-bg-tertiary cursor-default',
        className
      )}
      placeholder={placeholder}
      disabled={isDisabled}
      readOnly={isReadOnly}
      {...props}
    />
  );
});

Input.displayName = 'Input';

export default Input;