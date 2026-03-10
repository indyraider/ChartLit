/**
 * PRD §12.2 — Client-side analytics tracking.
 * Fires POST /api/analytics/event for template interactions.
 */

type EventType = 'view' | 'export' | 'code_copy' | 'canva_push';

export function trackEvent(
  type: EventType,
  templateId: string,
  metadata?: Record<string, unknown>,
): void {
  // Fire and forget — don't block UI
  fetch('/api/analytics/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, templateId, metadata }),
  }).catch(() => {
    // Silently ignore tracking failures
  });
}
