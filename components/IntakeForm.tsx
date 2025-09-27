import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { patientSchema, insuranceSchema, additionalInfoSchema } from '@/lib/validation';
import { useAppStore } from '@/lib/store';
import { Card } from './Card';

type PatientFormData = {
  firstName: string;
  lastName: string;
  dob: string;
};

type InsuranceFormData = {
  provider?: string;
  memberId?: string;
};

type AdditionalFormData = {
  meds?: string[];
  allergies?: string[];
  symptoms?: string;
  durationValue?: number;
  durationUnit?: "hours" | "days" | "weeks" | "months";
};

export function IntakeForm() {
  const { patient, insurance, additional, updatePatient, updateInsurance, updateAdditional } = useAppStore();

  const patientForm = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: patient,
  });

  const insuranceForm = useForm<InsuranceFormData>({
    resolver: zodResolver(insuranceSchema),
    defaultValues: insurance,
  });

  const additionalForm = useForm<AdditionalFormData>({
    resolver: zodResolver(additionalInfoSchema),
    defaultValues: {
      meds: additional.meds || [],
      allergies: additional.allergies || [],
      symptoms: additional.symptoms || '',
      durationValue: additional.durationValue,
      durationUnit: additional.durationUnit,
    },
  });

  const onPatientSubmit = (data: PatientFormData) => {
    updatePatient(data);
  };

  const onInsuranceSubmit = (data: InsuranceFormData) => {
    updateInsurance(data);
  };

  const onAdditionalSubmit = (data: AdditionalFormData) => {
    updateAdditional({
      meds: data.meds?.length ? data.meds : undefined,
      allergies: data.allergies?.length ? data.allergies : undefined,
      symptoms: data.symptoms || undefined,
      durationValue: data.durationValue,
      durationUnit: data.durationUnit,
    });
  };

  return (
    <div className="space-y-6">
      {/* Patient Information */}
      <Card>
        <h2 className="text-lg font-semibold text-[var(--text-strong)] mb-4">
          Patient Information
        </h2>
        <form onSubmit={patientForm.handleSubmit(onPatientSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-[var(--text-strong)] mb-1">
                First Name *
              </label>
              <input
                {...patientForm.register('firstName')}
                type="text"
                id="firstName"
                className="w-full px-3 py-2 border border-[var(--surface-2)] rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent"
                placeholder="Enter first name"
              />
              {patientForm.formState.errors.firstName && (
                <p className="text-sm text-[var(--danger)] mt-1">
                  {patientForm.formState.errors.firstName.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-[var(--text-strong)] mb-1">
                Last Name *
              </label>
              <input
                {...patientForm.register('lastName')}
                type="text"
                id="lastName"
                className="w-full px-3 py-2 border border-[var(--surface-2)] rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent"
                placeholder="Enter last name"
              />
              {patientForm.formState.errors.lastName && (
                <p className="text-sm text-[var(--danger)] mt-1">
                  {patientForm.formState.errors.lastName.message}
                </p>
              )}
            </div>
          </div>
          <div>
            <label htmlFor="dob" className="block text-sm font-medium text-[var(--text-strong)] mb-1">
              Date of Birth *
            </label>
            <input
              {...patientForm.register('dob')}
              type="date"
              id="dob"
              className="w-full px-3 py-2 border border-[var(--surface-2)] rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent"
            />
            {patientForm.formState.errors.dob && (
              <p className="text-sm text-[var(--danger)] mt-1">
                {patientForm.formState.errors.dob.message}
              </p>
            )}
          </div>
        </form>
      </Card>

      {/* Insurance Information */}
      <Card>
        <h2 className="text-lg font-semibold text-[var(--text-strong)] mb-4">
          Insurance Information
        </h2>
        <form onSubmit={insuranceForm.handleSubmit(onInsuranceSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="provider" className="block text-sm font-medium text-[var(--text-strong)] mb-1">
                Insurance Provider
              </label>
              <input
                {...insuranceForm.register('provider')}
                type="text"
                id="provider"
                className="w-full px-3 py-2 border border-[var(--surface-2)] rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent"
                placeholder="Enter insurance provider"
              />
            </div>
            <div>
              <label htmlFor="memberId" className="block text-sm font-medium text-[var(--text-strong)] mb-1">
                Member ID
              </label>
              <input
                {...insuranceForm.register('memberId')}
                type="text"
                id="memberId"
                className="w-full px-3 py-2 border border-[var(--surface-2)] rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent"
                placeholder="Enter member ID"
              />
            </div>
          </div>
        </form>
      </Card>

      {/* Additional Information */}
      <Card>
        <h2 className="text-lg font-semibold text-[var(--text-strong)] mb-4">
          Additional Information
        </h2>
        <form onSubmit={additionalForm.handleSubmit(onAdditionalSubmit)} className="space-y-4">
          <div>
            <label htmlFor="meds" className="block text-sm font-medium text-[var(--text-strong)] mb-1">
              Current Medications
            </label>
            <input
              {...additionalForm.register('meds')}
              type="text"
              id="meds"
              className="w-full px-3 py-2 border border-[var(--surface-2)] rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent"
              placeholder="Enter medications (comma-separated)"
            />
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Separate multiple medications with commas
            </p>
          </div>
          <div>
            <label htmlFor="allergies" className="block text-sm font-medium text-[var(--text-strong)] mb-1">
              Allergies
            </label>
            <input
              {...additionalForm.register('allergies')}
              type="text"
              id="allergies"
              className="w-full px-3 py-2 border border-[var(--surface-2)] rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent"
              placeholder="Enter allergies (comma-separated)"
            />
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Separate multiple allergies with commas
            </p>
          </div>
          <div>
            <label htmlFor="symptoms" className="block text-sm font-medium text-[var(--text-strong)] mb-1">
              Current Symptoms
            </label>
            <textarea
              {...additionalForm.register('symptoms')}
              id="symptoms"
              rows={3}
              className="w-full px-3 py-2 border border-[var(--surface-2)] rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent"
              placeholder="Describe current symptoms"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[var(--text-strong)] mb-1">
              How long have you had these symptoms?
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  {...additionalForm.register('durationValue', { valueAsNumber: true })}
                  type="number"
                  min="1"
                  max="3650"
                  className="w-full px-3 py-2 border border-[var(--surface-2)] rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent"
                  placeholder="Enter duration"
                />
                {additionalForm.formState.errors.durationValue && (
                  <p className="text-sm text-[var(--danger)] mt-1">
                    {additionalForm.formState.errors.durationValue.message}
                  </p>
                )}
              </div>
              <div>
                <select
                  {...additionalForm.register('durationUnit')}
                  className="w-full px-3 py-2 border border-[var(--surface-2)] rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent"
                >
                  <option value="">Select unit</option>
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                  <option value="months">Months</option>
                </select>
                {additionalForm.formState.errors.durationUnit && (
                  <p className="text-sm text-[var(--danger)] mt-1">
                    {additionalForm.formState.errors.durationUnit.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}
