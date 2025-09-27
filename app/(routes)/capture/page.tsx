'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { VitalCard } from '@/components/VitalCard';
import { SerialConnect } from '@/components/SerialConnect';
import { IntakeForm } from '@/components/IntakeForm';
import { StickyFooter } from '@/components/StickyFooter';
import { Button } from '@/components/Button';
import { ArrowLeft, Play, Square } from 'lucide-react';

export default function CapturePage() {
  const router = useRouter();
  const {
    vitals,
    isCapturing,
    captureStartTime,
    canContinue,
    startCapture,
    stopCapture,
    captureVital,
    resetVital,
  } = useAppStore();

  const [captureProgress, setCaptureProgress] = useState(0);

  // Capture progress animation
  useEffect(() => {
    if (!isCapturing || !captureStartTime) {
      setCaptureProgress(0);
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Date.now() - captureStartTime;
      const progress = Math.min((elapsed / 10000) * 100, 100); // 10 seconds
      setCaptureProgress(progress);

      if (progress >= 100) {
        // Auto-stop capture and process vitals
        stopCapture();
        Object.keys(vitals).forEach((vital) => {
          captureVital(vital as keyof typeof vitals);
        });
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isCapturing, captureStartTime, stopCapture, captureVital, vitals]);

  const handleStartCapture = () => {
    startCapture();
  };

  const handleStopCapture = () => {
    stopCapture();
    // Process all vitals that have samples
    Object.entries(vitals).forEach(([key, vital]) => {
      if (vital.samples.length > 0) {
        captureVital(key as keyof typeof vitals);
      }
    });
  };

  const handleRecapture = (vital: keyof typeof vitals) => {
    resetVital(vital);
  };

  const handleReview = () => {
    if (canContinue()) {
      router.push('/review');
    }
  };

  const handleBack = () => {
    router.push('/start');
  };

  const vitalsConfig = [
    {
      key: 'bpSys' as const,
      title: 'Systolic BP',
      unit: 'mmHg',
    },
    {
      key: 'bpDia' as const,
      title: 'Diastolic BP',
      unit: 'mmHg',
    },
    {
      key: 'hr' as const,
      title: 'Heart Rate',
      unit: 'bpm',
    },
    {
      key: 'spo2' as const,
      title: 'SpO₂',
      unit: '%',
    },
    {
      key: 'tempC' as const,
      title: 'Temperature',
      unit: '°C',
    },
    {
      key: 'weightKg' as const,
      title: 'Weight',
      unit: 'kg',
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--surface-1)]">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={handleBack} className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-[var(--text-strong)]">
            Capture Vitals
          </h1>
          <div className="w-20" /> {/* Spacer for centering */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Vitals Capture */}
          <div className="space-y-6">
            {/* Serial Connection */}
            <SerialConnect />

            {/* Capture Controls */}
            <div className="bg-white border border-[var(--surface-2)] rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-[var(--text-strong)] mb-4">
                Capture Controls
              </h2>
              
              <div className="space-y-4">
                {/* Progress Bar */}
                {isCapturing && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[var(--brand-primary)] h-2 rounded-full transition-all duration-100"
                      style={{ width: `${captureProgress}%` }}
                    />
                  </div>
                )}

                {/* Control Buttons */}
                <div className="flex space-x-3">
                  {!isCapturing ? (
                    <Button
                      variant="primary"
                      onClick={handleStartCapture}
                      className="flex items-center"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Capture (10s)
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      onClick={handleStopCapture}
                      className="flex items-center"
                    >
                      <Square className="h-4 w-4 mr-2" />
                      Stop Capture
                    </Button>
                  )}
                </div>

                <p className="text-sm text-[var(--text-muted)]">
                  {isCapturing
                    ? 'Capturing vitals... Please remain still.'
                    : 'Click "Start Capture" to begin 10-second measurement.'}
                </p>
              </div>
            </div>

            {/* Vitals Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vitalsConfig.map((vital) => (
                <VitalCard
                  key={vital.key}
                  title={vital.title}
                  unit={vital.unit}
                  status={vitals[vital.key].status}
                  currentValue={vitals[vital.key].currentValue}
                  capturedValue={vitals[vital.key].capturedValue}
                  onRecapture={() => handleRecapture(vital.key)}
                />
              ))}
            </div>
          </div>

          {/* Right Column - Patient Details */}
          <div>
            <IntakeForm />
          </div>
        </div>
      </div>

      {/* Sticky Footer */}
      <StickyFooter>
        <div className="flex items-center justify-between">
          <div className="text-sm text-[var(--text-muted)]">
            {canContinue() ? 'Ready to continue' : 'Complete required fields to continue'}
          </div>
          <Button
            variant="primary"
            onClick={handleReview}
            disabled={!canContinue()}
            className="flex items-center"
          >
            Review
          </Button>
        </div>
      </StickyFooter>
    </div>
  );
}
