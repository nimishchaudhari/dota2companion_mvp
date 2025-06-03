// frontend/src/components/ui/Flex.jsx
import React from 'react';
import { cn } from '../../utils/cn.js';

const Flex = React.forwardRef(({ 
  children, 
  className,
  direction = 'row',
  align = 'stretch',
  justify = 'flex-start',
  wrap = 'nowrap',
  gap = '0',
  as: Component = 'div',
  ...props 
}, ref) => {
  // Map prop values to Tailwind classes
  const directionMap = {
    row: 'flex-row',
    'row-reverse': 'flex-row-reverse',
    col: 'flex-col',
    column: 'flex-col',
    'column-reverse': 'flex-col-reverse',
  };

  const alignMap = {
    stretch: 'items-stretch',
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    baseline: 'items-baseline',
    'flex-start': 'items-start',
    'flex-end': 'items-end',
  };

  const justifyMap = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    'space-between': 'justify-between',
    'space-around': 'justify-around',
    'space-evenly': 'justify-evenly',
    'flex-start': 'justify-start',
    'flex-end': 'justify-end',
  };

  const wrapMap = {
    nowrap: 'flex-nowrap',
    wrap: 'flex-wrap',
    'wrap-reverse': 'flex-wrap-reverse',
  };

  const gapMap = {
    '0': 'gap-0',
    '1': 'gap-1',
    '2': 'gap-2',
    '3': 'gap-3',
    '4': 'gap-4',
    '5': 'gap-5',
    '6': 'gap-6',
    '8': 'gap-8',
  };

  return (
    <Component
      ref={ref}
      className={cn(
        'flex',
        directionMap[direction],
        alignMap[align],
        justifyMap[justify],
        wrapMap[wrap],
        gapMap[gap] || `gap-${gap}`,
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
});

Flex.displayName = 'Flex';

export default Flex;