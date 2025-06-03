// frontend/src/components/ui/Stack.jsx
import React from 'react';
import { cn } from '../../utils/cn.js';

const Stack = React.forwardRef(({ 
  children,
  className,
  direction = 'column',
  spacing = '4',
  align = 'stretch',
  justify = 'flex-start',
  divider,
  as: Component = 'div',
  ...props 
}, ref) => {
  const isRow = direction === 'row';
  
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
    '0': isRow ? 'space-x-0' : 'space-y-0',
    '1': isRow ? 'space-x-1' : 'space-y-1',
    '2': isRow ? 'space-x-2' : 'space-y-2',
    '3': isRow ? 'space-x-3' : 'space-y-3',
    '4': isRow ? 'space-x-4' : 'space-y-4',
    '5': isRow ? 'space-x-5' : 'space-y-5',
    '6': isRow ? 'space-x-6' : 'space-y-6',
    '8': isRow ? 'space-x-8' : 'space-y-8',
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
        direction === 'row' ? 'flex-row' : 'flex-col',
        alignMap[align],
        justifyMap[justify],
        !divider && (spacingMap[spacing] || (isRow ? `space-x-${spacing}` : `space-y-${spacing}`)),
        className
      )}
      {...props}
    >
      {childrenWithDividers}
    </Component>
  );
});

Stack.displayName = 'Stack';

export default Stack;