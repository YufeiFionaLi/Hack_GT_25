'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { StickyFooter } from '@/components/StickyFooter';
import { ArrowLeft, Download, CheckCircle } from 'lucide-react';
import { downloadJson, generateFilename } from '@/lib/download';
import { getNextShortId } from '@/lib/shortId';
import { VisitData, PatientData, InsuranceData, AdditionalInfoData, VitalsData } from '@/lib/validation';

export default function ReviewPage() {
  const router = useRouter();
  const {
    patient,
    insurance,
    additional,
    vitals,
    getVitalsData,
  } = useAppStore();

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
    try {
      const shortId = getNextShortId();
      const vitalsData = getVitalsData();
      
      const visitData: VisitData = {
        shortId,
        patient: patient as PatientData,
        insurance: insurance as InsuranceData,
        additional: additional as AdditionalInfoData,
        vitals: vitalsData as VitalsData,
        capturedAt: new Date().toISOString(),
      };

      // Download JSON file
      const filename = generateFilename(`vitals-${shortId}`);
      downloadJson(filename, visitData);
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

  const formatVitalValue = (value: number | null, unit: string) => {
    if (value === null) return '--';
    return `${value.toFixed(value % 1 === 0 ? 0 : 1)} ${unit}`;
  };

  return (
    <div className="min-h-screen bg-[var(--surface-1)]">
      <div className="max-w-4xl mx-auto p-4">
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
                <p className="text-[var(--text-strong)]">{patient.firstName || '--'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--text-muted)]">Last Name</label>
                <p className="text-[var(--text-strong)]">{patient.lastName || '--'}</p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-[var(--text-muted)]">Date of Birth</label>
                <p className="text-[var(--text-strong)]">
                  {patient.dob ? formatDate(patient.dob) : '--'}
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
                <label className="text-sm font-medium text-[var(--text-muted)]">Provider</label>
                <p className="text-[var(--text-strong)]">{insurance.provider || '--'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--text-muted)]">Member ID</label>
                <p className="text-[var(--text-strong)]">{insurance.memberId || '--'}</p>
              </div>
            </div>
          </Card>

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
                  {formatVitalValue(vitals.bpSys.capturedValue, '')}/
                  {formatVitalValue(vitals.bpDia.capturedValue, 'mmHg')}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--text-muted)]">Heart Rate</label>
                <p className="text-[var(--text-strong)]">
                  {formatVitalValue(vitals.hr.capturedValue, 'bpm')}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--text-muted)]">SpO₂</label>
                <p className="text-[var(--text-strong)]">
                  {formatVitalValue(vitals.spo2.capturedValue, '%')}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--text-muted)]">Temperature</label>
                <p className="text-[var(--text-strong)]">
                  {formatVitalValue(vitals.tempC.capturedValue, '°C')}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--text-muted)]">Weight</label>
                <p className="text-[var(--text-strong)]">
                  {formatVitalValue(vitals.weightKg.capturedValue, 'kg')}
                </p>
              </div>
            </div>
          </Card>

          {/* Symptoms */}
          {(additional.symptoms || additional.durationValue) && (
            <Card>
              <h2 className="text-lg font-semibold text-[var(--text-strong)] mb-4">
                Symptoms
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-[var(--text-muted)]">Current Symptoms</label>
                  <p className="text-[var(--text-strong)]">{additional.symptoms || '—'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-[var(--text-muted)]">Duration</label>
                  <p className="text-[var(--text-strong)]">
                    {additional.durationValue && additional.durationUnit 
                      ? `${additional.durationValue} ${additional.durationUnit}`
                      : '—'
                    }
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Additional Information */}
          {(additional.meds?.length || additional.allergies?.length) && (
            <Card>
              <h2 className="text-lg font-semibold text-[var(--text-strong)] mb-4">
                Additional Information
              </h2>
              <div className="space-y-4">
                {additional.meds?.length && (
                  <div>
                    <label className="text-sm font-medium text-[var(--text-muted)]">Medications</label>
                    <p className="text-[var(--text-strong)]">
                      {Array.isArray(additional.meds) ? additional.meds.join(', ') : additional.meds}
                    </p>
                  </div>
                )}
                {additional.allergies?.length && (
                  <div>
                    <label className="text-sm font-medium text-[var(--text-muted)]">Allergies</label>
                    <p className="text-[var(--text-strong)]">
                      {Array.isArray(additional.allergies) ? additional.allergies.join(', ') : additional.allergies}
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
