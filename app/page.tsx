'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to start page
    router.push('/start');
  }, [router]);

  return (
    <div className="min-h-screen bg-[var(--surface-1)] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--brand-primary)] mx-auto mb-4"></div>
        <p className="text-[var(--text-muted)]">Loading AutoVitals Kiosk...</p>
      </div>
    </div>
  );
}