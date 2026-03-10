'use client';

/**
 * PRD §5.6 — Canva OAuth Callback Handler
 * Detects canva_connected/canva_token query params after OAuth redirect
 * and updates app state accordingly.
 */

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppStore } from '@/store';
import { setCanvaToken } from '@/lib/canva';

export function useCanvaAuth() {
  const searchParams = useSearchParams();
  const { setCanvaConnected } = useAppStore();

  useEffect(() => {
    const connected = searchParams.get('canva_connected');
    const token = searchParams.get('canva_token');
    const error = searchParams.get('canva_error');

    if (connected === 'true' && token) {
      setCanvaToken(token);
      setCanvaConnected(true);

      // Clean up URL params without reload
      const url = new URL(window.location.href);
      url.searchParams.delete('canva_connected');
      url.searchParams.delete('canva_token');
      window.history.replaceState({}, '', url.toString());
    }

    if (error) {
      console.error('Canva OAuth error:', error);
      const url = new URL(window.location.href);
      url.searchParams.delete('canva_error');
      window.history.replaceState({}, '', url.toString());
    }
  }, [searchParams, setCanvaConnected]);
}
