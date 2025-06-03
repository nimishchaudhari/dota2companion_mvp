// frontend/src/components/ui/Box.jsx
import React from 'react';
import { cn } from '../../utils/cn.js';

const Box = React.forwardRef(({ 
  children, 
  className, 
  as: Component = 'div',
  ...props 
}, ref) => {
  return (
    <Component
      ref={ref}
      className={cn(className)}
      {...props}
    >
      {children}
    </Component>
  );
});

Box.displayName = 'Box';

export default Box;