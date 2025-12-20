import { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SectionHeaderProps {
  title: string;
  icon?: ReactNode;
  viewAllLink?: string;
  viewAllText?: string;
  className?: string;
}

export function SectionHeader({ 
  title, 
  icon, 
  viewAllLink, 
  viewAllText = 'View All',
  className = '' 
}: SectionHeaderProps) {
  return (
    <div className={`flex items-center justify-between mb-6 ${className}`}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="p-2 rounded-lg bg-primary/20 text-primary">
            {icon}
          </div>
        )}
        <h2 className="font-display text-xl md:text-2xl font-bold glow-text">
          {title}
        </h2>
      </div>
      
      {viewAllLink && (
        <Link 
          to={viewAllLink}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors group"
        >
          {viewAllText}
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}
