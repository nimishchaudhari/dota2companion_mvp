// frontend/src/components/ui/Card.jsx
import React from 'react';
import { cn } from '../../utils/cn.js';

const Card = React.forwardRef(({ 
  children,
  className,
  variant = 'elevated',
  ...props 
}, ref) => {
  const variants = {
    elevated: 'bg-dota-bg-card border-2 border-dota-bg-tertiary shadow-elevated',
    outline: 'bg-transparent border-2 border-dota-bg-tertiary',
    filled: 'bg-dota-bg-secondary border-2 border-dota-bg-tertiary',
    unstyled: '',
  };

  return (
    <div
      ref={ref}
      className={cn(
        'rounded-lg overflow-hidden transition-all duration-300',
        variants[variant],
        'hover:border-dota-teal-500 hover:shadow-card-hover hover:-translate-y-0.5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

const CardHeader = React.forwardRef(({ children, className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('px-6 py-4 border-b border-dota-bg-tertiary', className)}
    {...props}
  >
    {children}
  </div>
));

CardHeader.displayName = 'CardHeader';

const CardBody = React.forwardRef(({ children, className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('px-6 py-4', className)}
    {...props}
  >
    {children}
  </div>
));

CardBody.displayName = 'CardBody';

const CardFooter = React.forwardRef(({ children, className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('px-6 py-4 border-t border-dota-bg-tertiary', className)}
    {...props}
  >
    {children}
  </div>
));

CardFooter.displayName = 'CardFooter';

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;