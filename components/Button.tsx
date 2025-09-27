import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const buttonVariants = {
  primary: 'inline-flex items-center justify-center rounded-full px-6 py-4 text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] active:bg-[var(--brand-primary-active)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--brand-primary)] transition-colors',
  secondary: 'inline-flex items-center justify-center rounded-full px-6 py-4 text-white bg-[var(--brand-accent)] hover:bg-[var(--brand-accent)]/90 active:bg-[var(--brand-accent)]/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--brand-accent)] transition-colors',
  outline: 'inline-flex items-center justify-center rounded-full px-6 py-4 text-[var(--brand-primary)] border-2 border-[var(--brand-primary)] hover:bg-[var(--brand-primary)] hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--brand-primary)] transition-colors',
  ghost: 'inline-flex items-center justify-center rounded-full px-6 py-4 text-[var(--text-muted)] hover:bg-[var(--surface-1)] hover:text-[var(--text-strong)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--brand-primary)] transition-colors',
};

const buttonSizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-4 text-base',
  lg: 'px-8 py-6 text-lg',
};

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  className, 
  children, 
  ...props 
}: ButtonProps) {
  return (
    <button
      className={cn(
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
