import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaginationProps {
  currentPage: number;
  hasNextPage: boolean;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ currentPage, hasNextPage, onPageChange, className = '' }: PaginationProps) {
  return (
    <div className={`flex items-center justify-center gap-4 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="flex items-center gap-2"
      >
        <ChevronLeft className="w-4 h-4" />
        Previous
      </Button>

      <span className="px-4 py-2 rounded-lg bg-muted/50 text-sm font-medium">
        Page {currentPage}
      </span>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNextPage}
        className="flex items-center gap-2"
      >
        Next
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
