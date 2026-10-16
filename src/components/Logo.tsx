import { Link } from 'react-router-dom';
import { Bird } from 'lucide-react';
import { cn } from '../lib/utils';

export const Logo = ({ className, size = 'default' }: { className?: string, size?: 'sm' | 'default' | 'lg' }) => {
  const iconSize = size === 'sm' ? 20 : size === 'lg' ? 32 : 24;
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-3xl' : 'text-xl';

  return (
    <div className={cn("flex items-center gap-2 font-display font-bold text-brand-dark tracking-tight", className)}>
      <div className="bg-brand-dark text-brand-accent p-1.5 rounded-lg">
        <Bird size={iconSize} strokeWidth={2.5} />
      </div>
      <span className={cn(textSize, "mt-0.5")}>PriceHawk</span>
    </div>
  );
};
