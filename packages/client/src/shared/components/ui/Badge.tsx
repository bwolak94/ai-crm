import { type ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
  children?: ReactNode;
  variant?: BadgeVariant;
  /** Auto-maps contact/sentiment status to variant */
  status?: string;
  size?: 'sm' | 'md';
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-amber-100 text-amber-800',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
};

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-gray-500',
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  info: 'bg-blue-500',
};

const statusToVariant: Record<string, BadgeVariant> = {
  lead: 'info',
  prospect: 'warning',
  customer: 'success',
  churned: 'default',
  'at-risk': 'danger',
  positive: 'success',
  neutral: 'default',
};

const sizeStyles: Record<string, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

export function Badge({ children, variant, status, size = 'md', dot = false }: BadgeProps) {
  const resolvedVariant = variant ?? (status ? statusToVariant[status] ?? 'default' : 'default');
  const label = children ?? status;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium capitalize',
        sizeStyles[size],
        variantStyles[resolvedVariant],
      )}
    >
      {dot && (
        <span className={cn('inline-block h-1.5 w-1.5 rounded-full', dotColors[resolvedVariant])} />
      )}
      {label}
    </span>
  );
}
