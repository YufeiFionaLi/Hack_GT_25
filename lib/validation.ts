import { z } from 'zod';

/**
 * Validation schemas for vitals data
 */
export const vitalsSchema = z.object({
  bpSys: z.number().min(60, 'Systolic BP must be at least 60').max(220, 'Systolic BP must be at most 220'),
  bpDia: z.number().min(30, 'Diastolic BP must be at least 30').max(140, 'Diastolic BP must be at most 140'),
  hr: z.number().min(30, 'Heart rate must be at least 30').max(220, 'Heart rate must be at most 220'),
  spo2: z.number().min(70, 'SpO₂ must be at least 70%').max(100, 'SpO₂ must be at most 100%'),
  tempC: z.number().min(30, 'Temperature must be at least 30°C').max(45, 'Temperature must be at most 45°C'),
  weightKg: z.number().min(1, 'Weight must be at least 1kg').max(500, 'Weight must be at most 500kg').optional(),
});

/**
 * Validation schema for patient information
 */
export const patientSchema = z.object({
  firstName: z.string().min(1, 'First name is required').trim(),
  lastName: z.string().min(1, 'Last name is required').trim(),
  dob: z.string().min(1, 'Date of birth is required'),
});

/**
 * Validation schema for insurance information
 */
export const insuranceSchema = z.object({
  provider: z.string().trim().optional(),
  memberId: z.string().trim().optional(),
});

/**
 * Validation schema for additional information
 */
export const additionalInfoSchema = z.object({
  meds: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  symptoms: z.string().optional(),
  durationValue: z.number().positive().max(3650).optional(),
  durationUnit: z.enum(["hours", "days", "weeks", "months"]).optional(),
});

/**
 * Complete visit data schema
 */
export const visitSchema = z.object({
  patient: patientSchema,
  insurance: insuranceSchema,
  additional: additionalInfoSchema,
  vitals: vitalsSchema,
  capturedAt: z.string(),
  shortId: z.string(),
});

export type VitalsData = z.infer<typeof vitalsSchema>;
export type PatientData = z.infer<typeof patientSchema>;
export type InsuranceData = z.infer<typeof insuranceSchema>;
export type AdditionalInfoData = z.infer<typeof additionalInfoSchema>;
export type VisitData = z.infer<typeof visitSchema>;
