/**
 * PRD §5.6 — Canva Integration Client
 * Handles OAuth flow initiation, PNG upload, and job polling.
 * Mocked by default — real Canva API activated when CANVA_CLIENT_ID is set.
 */

// Token is stored client-side for mock. In production, use httpOnly cookie or server session.
let canvaToken: string | null = null;

export function isCanvaConnected(): boolean {
  return canvaToken !== null;
}

export function setCanvaToken(token: string | null): void {
  canvaToken = token;
}

/**
 * Initiate Canva OAuth flow.
 * Opens the Canva authorization page in a popup window.
 */
export async function initiateCanvaOAuth(): Promise<void> {
  const res = await fetch('/api/auth/canva', { method: 'POST' });
  if (!res.ok) throw new Error('Failed to initiate Canva OAuth');
  const { authUrl } = await res.json();

  // Open in popup for OAuth flow
  const popup = window.open(authUrl, 'canva_auth', 'width=600,height=700');
  if (!popup) {
    // Fallback: redirect in same window
    window.location.href = authUrl;
  }
}

/**
 * Build the Canva asset name per PRD §5.6.
 * Format: "Chart Type — Effect — WxH"
 */
export function buildAssetName(
  chartType: string,
  effect: string | null,
  width: number,
  height: number,
): string {
  const parts = [chartType];
  if (effect && effect !== 'none') {
    parts.push(formatEffectName(effect));
  }
  parts.push(`${width}×${height}`);
  return parts.join(' — ');
}

function formatEffectName(effect: string): string {
  return effect
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * Upload a PNG blob to Canva (via our proxy endpoint).
 * Returns a jobId for polling.
 */
export async function uploadToCanva(
  blob: Blob,
  assetName: string,
): Promise<string> {
  if (!canvaToken) throw new Error('Not connected to Canva');

  const formData = new FormData();
  formData.append('file', blob, 'chart.png');
  formData.append('assetName', assetName);

  const res = await fetch('/api/canva/upload', {
    method: 'POST',
    headers: { 'x-canva-token': canvaToken },
    body: formData,
  });

  if (res.status === 401) {
    // Token expired — clear and re-auth
    canvaToken = null;
    throw new Error('Canva session expired. Please reconnect.');
  }

  if (res.status === 429) {
    throw new Error('Rate limited. Please try again in 60 seconds.');
  }

  if (!res.ok) throw new Error('Upload failed');

  const data = await res.json();
  return data.jobId;
}

/**
 * Poll a Canva upload job until it completes or fails.
 * Returns the final status.
 */
export async function pollUploadStatus(
  jobId: string,
  onStatusChange?: (status: string) => void,
): Promise<'completed' | 'failed'> {
  const maxAttempts = 30; // 30s max
  let attempts = 0;

  while (attempts < maxAttempts) {
    const res = await fetch(`/api/canva/upload/${jobId}`);
    if (!res.ok) throw new Error('Failed to check upload status');

    const data = await res.json();
    onStatusChange?.(data.status);

    if (data.status === 'completed') return 'completed';
    if (data.status === 'failed') return 'failed';

    // Wait 1s between polls
    await new Promise((resolve) => setTimeout(resolve, 1000));
    attempts++;
  }

  throw new Error('Upload timed out');
}
