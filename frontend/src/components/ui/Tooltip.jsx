// frontend/src/components/ui/Tooltip.jsx
import React, { useState } from 'react';
import { cn } from '../../utils/cn.js';

const Tooltip = ({ 
  children,
  label,
  placement = 'top',
  className,
  isDisabled = false,
  hasArrow = true,
  ...props 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  if (isDisabled || !label) {
    return children;
  }

  const placementStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowStyles = {
    top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-dota-bg-tertiary',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-dota-bg-tertiary',
    left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-dota-bg-tertiary',
    right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-dota-bg-tertiary',
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      {...props}
    >
      {children}
      {isVisible && (
        <div
          className={cn(
            'absolute z-50 px-2 py-1 text-xs text-white bg-dota-bg-tertiary rounded-md shadow-lg whitespace-nowrap',
            placementStyles[placement],
            className
          )}
        >
          {label}
          {hasArrow && (
            <div
              className={cn(
                'absolute w-0 h-0 border-4',
                arrowStyles[placement]
              )}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Tooltip;