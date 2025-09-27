import React from 'react';
import { cn } from '@/lib/utils';

interface StickyFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function StickyFooter({ children, className }: StickyFooterProps) {
  return (
    <div className={cn(
      'fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--surface-2)] shadow-lg',
      'px-6 py-4 z-50',
      className
    )}>
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </div>
  );
}
