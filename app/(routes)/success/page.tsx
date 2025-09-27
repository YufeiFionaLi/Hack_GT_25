'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { CheckCircle, Copy, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetVisit } = useAppStore();
  const [shortId, setShortId] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const id = searchParams.get('shortId');
    if (id) {
      setShortId(id);
    } else {
      // Redirect to start if no shortId
      router.push('/start');
    }
  }, [searchParams, router]);

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(shortId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleNewCheckIn = () => {
    resetVisit();
    router.push('/start');
  };

      return (
        <div className="min-h-screen bg-[var(--surface-1)] flex items-center justify-center p-4 pb-32">
      <div className="max-w-2xl w-full">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[var(--success)] rounded-full mb-6">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-[var(--text-strong)] mb-2">
            Success — Checked In
          </h1>
          <p className="text-lg text-[var(--text-muted)]">
            Your visit has been successfully recorded.
          </p>
        </div>

        {/* Visit ID Card */}
        <Card className="mb-8">
          <h2 className="text-lg font-semibold text-[var(--text-strong)] mb-4 text-center">
            Your Visit ID
          </h2>
          
          <div className="text-center space-y-4">
            <div className="text-3xl font-mono font-bold text-[var(--brand-primary)] bg-[var(--surface-1)] px-4 py-3 rounded-lg">
              {shortId}
            </div>
            
            <Button
              variant="outline"
              onClick={handleCopyId}
              className={cn(
                'flex items-center mx-auto',
                copied && 'bg-green-50 border-green-200 text-green-700'
              )}
            >
              <Copy className="h-4 w-4 mr-2" />
              {copied ? 'Copied!' : 'Copy ID'}
            </Button>
          </div>
        </Card>

        {/* Instructions */}
        <Card className="mb-8">
          <h2 className="text-lg font-semibold text-[var(--text-strong)] mb-4">
            Next Steps
          </h2>
          
          <div className="space-y-3 text-sm text-[var(--text-muted)]">
            <div className="flex items-start">
              <div className="w-2 h-2 bg-[var(--brand-primary)] rounded-full mt-2 mr-3 flex-shrink-0" />
              <p>Show this Visit ID to the nurse or healthcare provider</p>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-[var(--brand-primary)] rounded-full mt-2 mr-3 flex-shrink-0" />
              <p>Your vitals and information have been saved locally</p>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-[var(--brand-primary)] rounded-full mt-2 mr-3 flex-shrink-0" />
              <p>No data has been transmitted over the network</p>
            </div>
          </div>
        </Card>

        {/* Action Button */}
        <div className="text-center">
          <Button
            variant="primary"
            size="lg"
            onClick={handleNewCheckIn}
            className="w-full md:w-auto flex items-center justify-center"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Start New Check-In
          </Button>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-[var(--surface-1)] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--brand-primary)] mx-auto mb-4"></div>
        <p className="text-[var(--text-muted)]">Loading...</p>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SuccessContent />
    </Suspense>
  );
}