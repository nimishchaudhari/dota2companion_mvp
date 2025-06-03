// frontend/src/components/ui/VStack.jsx
import React from 'react';
import { cn } from '../../utils/cn.js';

const VStack = React.forwardRef(({ 
  children,
  className,
  spacing = '4',
  align = 'stretch',
  justify = 'flex-start',
  divider,
  as: Component = 'div',
  ...props 
}, ref) => {
  const alignMap = {
    stretch: 'items-stretch',
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
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
    '0': 'space-y-0',
    '1': 'space-y-1',
    '2': 'space-y-2',
    '3': 'space-y-3',
    '4': 'space-y-4',
    '5': 'space-y-5',
    '6': 'space-y-6',
    '8': 'space-y-8',
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
        'flex flex-col',
        alignMap[align],
        justifyMap[justify],
        !divider && (spacingMap[spacing] || `space-y-${spacing}`),
        className
      )}
      {...props}
    >
      {childrenWithDividers}
    </Component>
  );
});

VStack.displayName = 'VStack';

export default VStack;