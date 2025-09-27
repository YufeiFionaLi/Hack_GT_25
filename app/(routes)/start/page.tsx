'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Heart, Shield, Zap } from 'lucide-react';

export default function StartPage() {
  const [consent, setConsent] = useState(false);
  const router = useRouter();
  const { resetVisit } = useAppStore();

  const handleStart = () => {
    if (!consent) return;
    
    // Reset any previous visit data
    resetVisit();
    router.push('/capture');
  };

  return (
    <div className="min-h-screen bg-[var(--surface-1)] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--brand-primary)] rounded-full mb-4">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-[var(--text-strong)] mb-2">
            AutoVitals Kiosk
          </h1>
          <p className="text-lg text-[var(--text-muted)]">
            Secure, fast, paperless vitals.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="text-center">
            <Shield className="h-8 w-8 text-[var(--brand-primary)] mx-auto mb-2" />
            <h3 className="font-semibold text-[var(--text-strong)] mb-1">Secure</h3>
            <p className="text-sm text-[var(--text-muted)]">
              Your data stays on this device
            </p>
          </Card>
          <Card className="text-center">
            <Zap className="h-8 w-8 text-[var(--brand-accent)] mx-auto mb-2" />
            <h3 className="font-semibold text-[var(--text-strong)] mb-1">Fast</h3>
            <p className="text-sm text-[var(--text-muted)]">
              Quick 10-second capture
            </p>
          </Card>
          <Card className="text-center">
            <Heart className="h-8 w-8 text-[var(--success)] mx-auto mb-2" />
            <h3 className="font-semibold text-[var(--text-strong)] mb-1">Paperless</h3>
            <p className="text-sm text-[var(--text-muted)]">
              Digital records only
            </p>
          </Card>
        </div>

        {/* Consent */}
        <Card className="mb-8">
          <h2 className="text-lg font-semibold text-[var(--text-strong)] mb-4">
            Consent & Privacy
          </h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="consent"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 h-4 w-4 text-[var(--brand-primary)] border-[var(--surface-2)] rounded focus:ring-[var(--brand-primary)]"
              />
              <label htmlFor="consent" className="text-sm text-[var(--text-strong)]">
                I consent to having my vital signs measured and stored locally on this device. 
                No data will be transmitted over the network. I understand that this information 
                will be used for medical purposes and may be shared with healthcare providers 
                as part of my medical record.
              </label>
            </div>
          </div>
        </Card>

        {/* Start Button */}
        <div className="text-center">
          <Button
            variant="primary"
            size="lg"
            onClick={handleStart}
            disabled={!consent}
            className="w-full md:w-auto"
          >
            Start Check-In
          </Button>
        </div>
      </div>
    </div>
  );
}
