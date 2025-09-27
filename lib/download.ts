/**
 * Downloads data as a JSON file
 */
export function downloadJson(filename: string, data: unknown): void {
  if (typeof window === 'undefined') {
    console.warn('downloadJson called on server side');
    return;
  }

  try {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download JSON:', error);
  }
}

/**
 * Generates a filename with timestamp
 */
export function generateFilename(prefix: string = 'vitals'): string {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
  return `${prefix}-${timestamp}.json`;
}
