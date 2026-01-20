import { Coins } from 'lucide-react';
import { Badge } from './ui/badge';

interface CreditBadgeProps {
  credits: number;
  size?: 'sm' | 'md' | 'lg';
}

export function CreditBadge({ credits, size = 'md' }: CreditBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-4 py-1.5',
    lg: 'text-base px-6 py-2.5',
  };

  const iconSizes = {
    sm: 12,
    md: 16,
    lg: 20,
  };

  return (
    <Badge
      variant="default"
      className={`${sizeClasses[size]} flex items-center gap-2 font-bold bg-studio-neon-lime text-black border-none h-fit shadow-[0_0_15px_rgba(204,255,0,0.2)]`}
    >
      <div className="bg-black/10 rounded-full p-0.5 flex items-center justify-center">
        <Coins size={iconSizes[size]} className="text-black" />
      </div>
      <span>{credits} Credits</span>
    </Badge>
  );
}
