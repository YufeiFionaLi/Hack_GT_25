import React from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { VitalStatus } from '@/lib/store';
import { cn } from '@/lib/utils';

interface VitalCardProps {
  title: string;
  unit: string;
  status: VitalStatus;
  currentValue: number | null;
  capturedValue: number | null;
  onRecapture: () => void;
  className?: string;
}

const statusConfig = {
  waiting: {
    label: 'Waiting',
    color: 'bg-gray-100 text-gray-600',
    icon: '⏳',
  },
  capturing: {
    label: 'Capturing…',
    color: 'bg-blue-100 text-blue-700',
    icon: '📊',
  },
  captured: {
    label: 'Captured ✓',
    color: 'bg-green-100 text-green-700',
    icon: '✅',
  },
};

export function VitalCard({
  title,
  unit,
  status,
  currentValue,
  capturedValue,
  onRecapture,
  className,
}: VitalCardProps) {
  const config = statusConfig[status];
  const displayValue = capturedValue ?? currentValue;

  return (
    <Card className={cn('relative overflow-hidden', className)}>
      {/* Status chip */}
      <div className="flex items-center justify-between mb-4">
        <div className={cn(
          'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
          config.color
        )}>
          <span className="mr-2">{config.icon}</span>
          {config.label}
        </div>
        {status === 'captured' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRecapture}
            className="text-xs"
          >
            Re-capture
          </Button>
        )}
      </div>

      {/* Progress bar for capturing state */}
      {status === 'capturing' && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-blue-200">
          <div className="h-full bg-blue-500 animate-pulse" />
        </div>
      )}

      {/* Value display */}
      <div className="text-center">
        <div className="text-3xl font-bold text-[var(--text-strong)] mb-1">
          {displayValue !== null ? displayValue.toFixed(displayValue % 1 === 0 ? 0 : 1) : '--'}
        </div>
        <div className="text-sm text-[var(--text-muted)]">
          {unit}
        </div>
      </div>

      {/* Title */}
      <div className="text-center mt-4">
        <h3 className="text-sm font-medium text-[var(--text-strong)]">
          {title}
        </h3>
      </div>
    </Card>
  );
}
