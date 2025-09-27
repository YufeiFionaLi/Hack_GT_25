'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { StickyFooter } from '@/components/StickyFooter';
import { ArrowLeft, Download, CheckCircle } from 'lucide-react';
import { downloadJson, generateFilename } from '@/lib/download';
import { getNextShortId } from '@/lib/shortId';

export default function ReviewPage() {
  const router = useRouter();
  const { visitData } = useAppStore();

  // Redirect if no visit data
  useEffect(() => {
    if (!visitData) {
      router.push('/capture');
    }
  }, [visitData, router]);

  const handleBack = () => {
    router.push('/capture');
  };

  const handleSubmit = () => {
    try {
      const shortId = getNextShortId();
      
      // Navigate to success page with shortId
      router.push(`/success?shortId=${shortId}`);
    } catch (error) {
      console.error('Failed to submit visit data:', error);
    }
  };

  const handleDownload = () => {
    if (!visitData) return;
    
    try {
      const shortId = getNextShortId();
      
      const visitPayload = {
        shortId,
        patient: visitData.patient,
        insurance: visitData.insurance,
        additional: visitData.additional,
        vitals: visitData.vitals,
        capturedAt: new Date().toISOString(),
      };

      // Download JSON file
      const filename = generateFilename(`vitals-${shortId}`);
      downloadJson(filename, visitPayload);
    } catch (error) {
      console.error('Failed to download visit data:', error);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const formatVitalValue = (value: number | null | undefined, unit: string) => {
    if (value === null || value === undefined) return '—';
    return `${value.toFixed(value % 1 === 0 ? 0 : 1)} ${unit}`;
  };

  if (!visitData) {
    return (
      <div className="min-h-screen bg-[var(--surface-1)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--brand-primary)] mx-auto mb-4"></div>
          <p className="text-[var(--text-muted)]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--surface-1)]">
      <div className="max-w-4xl mx-auto p-4 pb-32">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={handleBack} className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-[var(--text-strong)]">
            Review Information
          </h1>
          <div className="w-20" /> {/* Spacer for centering */}
        </div>

        <div className="space-y-6">
          {/* Patient Information */}
          <Card>
            <h2 className="text-lg font-semibold text-[var(--text-strong)] mb-4 flex items-center">
              <CheckCircle className="h-5 w-5 text-[var(--success)] mr-2" />
              Patient Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-[var(--text-muted)]">First Name</label>
                <p className="text-[var(--text-strong)]">{visitData.patient.firstName || '—'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--text-muted)]">Last Name</label>
                <p className="text-[var(--text-strong)]">{visitData.patient.lastName || '—'}</p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-[var(--text-muted)]">Date of Birth</label>
                <p className="text-[var(--text-strong)]">
                  {visitData.patient.dob ? formatDate(visitData.patient.dob) : '—'}
                </p>
              </div>
            </div>
          </Card>

          {/* Insurance Information */}
          <Card>
            <h2 className="text-lg font-semibold text-[var(--text-strong)] mb-4">
              Insurance Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-[var(--text-muted)]">Insurance Provider</label>
                <p className="text-[var(--text-strong)]">{visitData.insurance.provider || '—'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--text-muted)]">Member ID</label>
                <p className="text-[var(--text-strong)]">{visitData.insurance.memberId || '—'}</p>
              </div>
            </div>
          </Card>

          {/* Symptoms */}
          {(visitData.additional.symptoms || visitData.additional.durationValue) && (
            <Card>
              <h2 className="text-lg font-semibold text-[var(--text-strong)] mb-4">
                Symptoms
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-[var(--text-muted)]">Current Symptoms</label>
                  <p className="text-[var(--text-strong)]">{visitData.additional.symptoms || '—'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-[var(--text-muted)]">Duration</label>
                  <p className="text-[var(--text-strong)]">
                    {visitData.additional.durationValue && visitData.additional.durationUnit 
                      ? `${visitData.additional.durationValue} ${visitData.additional.durationUnit}`
                      : '—'
                    }
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Vitals */}
          <Card>
            <h2 className="text-lg font-semibold text-[var(--text-strong)] mb-4 flex items-center">
              <CheckCircle className="h-5 w-5 text-[var(--success)] mr-2" />
              Vitals
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-[var(--text-muted)]">Blood Pressure</label>
                <p className="text-[var(--text-strong)]">
                  {formatVitalValue(visitData.vitals.bpSys?.capturedValue, '')}/
                  {formatVitalValue(visitData.vitals.bpDia?.capturedValue, 'mmHg')}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--text-muted)]">Heart Rate</label>
                <p className="text-[var(--text-strong)]">
                  {formatVitalValue(visitData.vitals.hr?.capturedValue, 'bpm')}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--text-muted)]">SpO₂</label>
                <p className="text-[var(--text-strong)]">
                  {formatVitalValue(visitData.vitals.spo2?.capturedValue, '%')}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--text-muted)]">Temperature</label>
                <p className="text-[var(--text-strong)]">
                  {formatVitalValue(visitData.vitals.tempC?.capturedValue, '°C')}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--text-muted)]">Weight</label>
                <p className="text-[var(--text-strong)]">
                  {formatVitalValue(visitData.vitals.weightKg?.capturedValue, 'kg')}
                </p>
              </div>
            </div>
          </Card>

          {/* Additional Information */}
          {(visitData.additional.meds?.length || visitData.additional.allergies?.length) && (
            <Card>
              <h2 className="text-lg font-semibold text-[var(--text-strong)] mb-4">
                Additional Information
              </h2>
              <div className="space-y-4">
                {visitData.additional.meds?.length && (
                  <div>
                    <label className="text-sm font-medium text-[var(--text-muted)]">Medications</label>
                    <p className="text-[var(--text-strong)]">
                      {Array.isArray(visitData.additional.meds) ? visitData.additional.meds.join(', ') : visitData.additional.meds}
                    </p>
                  </div>
                )}
                {visitData.additional.allergies?.length && (
                  <div>
                    <label className="text-sm font-medium text-[var(--text-muted)]">Allergies</label>
                    <p className="text-[var(--text-strong)]">
                      {Array.isArray(visitData.additional.allergies) ? visitData.additional.allergies.join(', ') : visitData.additional.allergies}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Sticky Footer */}
      <StickyFooter>
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={handleBack}>
            Back to Edit
          </Button>
          <div className="flex space-x-3">
            <Button
              variant="secondary"
              onClick={handleDownload}
              className="flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Download JSON
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              className="flex items-center"
            >
              Submit
            </Button>
          </div>
        </div>
      </StickyFooter>
    </div>
  );
}