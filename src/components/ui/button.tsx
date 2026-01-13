import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg hover:shadow-xl hover:scale-105',
        destructive: 'bg-red-500 text-white shadow hover:bg-red-600',
        outline:
          'border-2 border-purple-600 bg-transparent text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-950',
        secondary:
          'bg-gray-200 text-gray-900 shadow-sm hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100',
        ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800',
        link: 'text-purple-600 underline-offset-4 hover:underline dark:text-purple-400',
      },
      size: {
        default: 'h-11 px-6 py-2',
        sm: 'h-9 px-4 text-xs',
        lg: 'h-12 px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
