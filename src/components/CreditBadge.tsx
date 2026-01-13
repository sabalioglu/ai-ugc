import { Coins } from 'lucide-react';
import { Badge } from './ui/badge';

interface CreditBadgeProps {
  credits: number;
  size?: 'sm' | 'md' | 'lg';
}

export function CreditBadge({ credits, size = 'md' }: CreditBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2',
  };

  const iconSizes = {
    sm: 12,
    md: 16,
    lg: 20,
  };

  return (
    <Badge
      variant="default"
      className={`${sizeClasses[size]} flex items-center gap-1.5 font-semibold`}
    >
      <Coins size={iconSizes[size]} />
      <span>{credits} Credits</span>
    </Badge>
  );
}
