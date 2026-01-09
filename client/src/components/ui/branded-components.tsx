import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-sage-500 text-white hover:bg-sage-600 active:bg-sage-700 shadow-sm hover:shadow-primary',
        secondary: 'bg-cream-200 text-forest-700 border border-cream-400 hover:bg-cream-300 hover:border-cream-500',
        outline: 'border border-sage-300 text-sage-600 hover:bg-sage-50 hover:border-sage-400',
        ghost: 'text-sage-600 hover:bg-sage-50 hover:text-sage-700',
        danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700',
        link: 'text-sage-600 underline-offset-4 hover:underline hover:text-sage-700 p-0 h-auto',
      },
      size: {
        sm: 'h-8 px-3 text-sm gap-1.5',
        md: 'h-10 px-4 text-base gap-2',
        lg: 'h-12 px-6 text-lg gap-2.5',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
        'icon-lg': 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export const BrandedButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, disabled, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
BrandedButton.displayName = 'BrandedButton';

const cardVariants = cva(
  'rounded-xl border transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'bg-white border-cream-300 shadow-sm',
        elevated: 'bg-white border-cream-200 shadow-md hover:shadow-lg',
        outlined: 'bg-transparent border-cream-400',
        filled: 'bg-cream-100 border-transparent',
        interactive: 'bg-white border-cream-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 cursor-pointer',
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
    },
  }
);

interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export const BrandedCard = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, padding }), className)}
        {...props}
      />
    );
  }
);
BrandedCard.displayName = 'BrandedCard';

export const BrandedCardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5', className)} {...props} />
  )
);
BrandedCardHeader.displayName = 'BrandedCardHeader';

export const BrandedCardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('font-display text-xl font-semibold text-forest-800', className)} {...props} />
  )
);
BrandedCardTitle.displayName = 'BrandedCardTitle';

export const BrandedCardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-forest-500', className)} {...props} />
  )
);
BrandedCardDescription.displayName = 'BrandedCardDescription';

export const BrandedCardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('pt-0', className)} {...props} />
  )
);
BrandedCardContent.displayName = 'BrandedCardContent';

export const BrandedCardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center pt-4', className)} {...props} />
  )
);
BrandedCardFooter.displayName = 'BrandedCardFooter';

const badgeVariants = cva(
  'inline-flex items-center rounded-full font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-sage-100 text-sage-700',
        sage: 'bg-sage-100 text-sage-700',
        teal: 'bg-teal-100 text-teal-700',
        beige: 'bg-beige-100 text-beige-700',
        navy: 'bg-navy-100 text-navy-700',
        success: 'bg-green-100 text-green-700',
        warning: 'bg-amber-100 text-amber-700',
        error: 'bg-red-100 text-red-700',
        outline: 'border border-sage-300 text-sage-600 bg-transparent',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const BrandedBadge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <span ref={ref} className={cn(badgeVariants({ variant, size }), className)} {...props} />
    );
  }
);
BrandedBadge.displayName = 'BrandedBadge';

const inputVariants = cva(
  'flex w-full rounded-lg border bg-white px-3 py-2 text-base transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-forest-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-cream-400 focus:border-sage-400',
        error: 'border-red-400 focus:border-red-500 focus-visible:ring-red-400',
        success: 'border-green-400 focus:border-green-500',
      },
      inputSize: {
        sm: 'h-8 text-sm',
        md: 'h-10',
        lg: 'h-12 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'md',
    },
  }
);

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  error?: string;
}

export const BrandedInput = forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, inputSize, error, ...props }, ref) => {
    return (
      <input
        className={cn(inputVariants({ variant: error ? 'error' : variant, inputSize }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
BrandedInput.displayName = 'BrandedInput';

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const BrandedTextarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-lg border bg-white px-3 py-2 text-base transition-colors placeholder:text-forest-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y',
          error ? 'border-red-400 focus:border-red-500' : 'border-cream-400 focus:border-sage-400',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
BrandedTextarea.displayName = 'BrandedTextarea';

export const BrandedLabel = forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }
>(({ className, required, children, ...props }, ref) => (
  <label
    ref={ref}
    className={cn('text-sm font-medium text-forest-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70', className)}
    {...props}
  >
    {children}
    {required && <span className="text-red-500 ml-1">*</span>}
  </label>
));
BrandedLabel.displayName = 'BrandedLabel';

interface FormFieldProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function BrandedFormField({ label, error, hint, required, children, className }: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {label && <BrandedLabel required={required}>{label}</BrandedLabel>}
      {children}
      {hint && !error && <p className="text-sm text-forest-500">{hint}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

const avatarSizes = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-base',
  lg: 'h-12 w-12 text-lg',
  xl: 'h-16 w-16 text-xl',
  '2xl': 'h-24 w-24 text-3xl',
};

interface AvatarProps {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: keyof typeof avatarSizes;
  className?: string;
}

export function BrandedAvatar({ src, alt, fallback, size = 'md', className }: AvatarProps) {
  const initials = fallback || alt?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <div
      className={cn(
        'relative flex shrink-0 overflow-hidden rounded-full bg-sage-100',
        avatarSizes[size],
        className
      )}
    >
      {src ? (
        <img src={src} alt={alt || ''} className="aspect-square h-full w-full object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center font-medium text-sage-700">
          {initials}
        </span>
      )}
    </div>
  );
}

interface ProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'sage' | 'teal' | 'success' | 'warning';
  showLabel?: boolean;
  className?: string;
}

const progressColors = {
  sage: 'bg-sage-500',
  teal: 'bg-teal-500',
  success: 'bg-green-500',
  warning: 'bg-amber-500',
};

const progressSizes = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

export function BrandedProgress({ 
  value, 
  max = 100, 
  size = 'md', 
  variant = 'sage',
  showLabel = false,
  className 
}: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn('w-full', className)}>
      <div className={cn('w-full bg-cream-200 rounded-full overflow-hidden', progressSizes[size])}>
        <div 
          className={cn('h-full transition-all duration-300 rounded-full', progressColors[variant])}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-sm text-forest-600 mt-1">{Math.round(percentage)}%</span>
      )}
    </div>
  );
}

export function BrandedSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse bg-cream-200 rounded', className)} />
  );
}

export function BrandedDivider({ className }: { className?: string }) {
  return <hr className={cn('border-cream-300', className)} />;
}

export {
  buttonVariants,
  cardVariants,
  badgeVariants,
  inputVariants,
};
