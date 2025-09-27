/**
 * Generates a short ID for patients in the format: patient####
 * Counter is stored in localStorage and zero-padded to 4 digits
 */
export function getNextShortId(): string {
  if (typeof window === 'undefined') {
    // Server-side rendering fallback
    return 'patient0001';
  }
  
  const currentCount = Number(localStorage.getItem('patientCounter') ?? '0');
  const nextCount = currentCount + 1;
  localStorage.setItem('patientCounter', String(nextCount));
  
  return `patient${String(nextCount).padStart(4, '0')}`;
}

/**
 * Resets the patient counter (useful for testing)
 */
export function resetPatientCounter(): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('patientCounter', '0');
  }
}
