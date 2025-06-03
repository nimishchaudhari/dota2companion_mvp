// frontend/src/components/ui/HStack.jsx
import React from 'react';
import { cn } from '../../utils/cn.js';

const HStack = React.forwardRef(({ 
  children,
  className,
  spacing = '4',
  align = 'center',
  justify = 'flex-start',
  wrap = false,
  divider,
  as: Component = 'div',
  ...props 
}, ref) => {
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

  const spacingMap = {
    '0': 'space-x-0',
    '1': 'space-x-1',
    '2': 'space-x-2',
    '3': 'space-x-3',
    '4': 'space-x-4',
    '5': 'space-x-5',
    '6': 'space-x-6',
    '8': 'space-x-8',
  };

  const childrenWithDividers = divider 
    ? React.Children.toArray(children).reduce((acc, child, index) => {
        acc.push(child);
        if (index < React.Children.count(children) - 1) {
          acc.push(React.cloneElement(divider, { key: `divider-${index}` }));
        }
        return acc;
      }, [])
    : children;

  return (
    <Component
      ref={ref}
      className={cn(
        'flex',
        alignMap[align],
        justifyMap[justify],
        wrap ? 'flex-wrap' : 'flex-nowrap',
        !divider && (spacingMap[spacing] || `space-x-${spacing}`),
        className
      )}
      {...props}
    >
      {childrenWithDividers}
    </Component>
  );
});

HStack.displayName = 'HStack';

export default HStack;