import { cn } from '@/shared/lib/utils';
import type { ContactStatus } from '@ai-crm/shared';

interface BadgeProps {
  status: ContactStatus | string;
  size?: 'sm' | 'md';
}

const colorMap: Record<string, string> = {
  lead: 'bg-blue-100 text-blue-800',
  prospect: 'bg-amber-100 text-amber-800',
  customer: 'bg-green-100 text-green-800',
  churned: 'bg-gray-100 text-gray-800',
};

const sizeMap = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

export function Badge({ status, size = 'md' }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium capitalize',
        sizeMap[size],
        colorMap[status] ?? 'bg-gray-100 text-gray-800',
      )}
    >
      {status}
    </span>
  );
}
