/**
 * PRD §13.1 — Canva Upload (Mock)
 * POST /api/canva/upload
 * Accepts a PNG blob + metadata, returns a jobId for polling.
 * Mock mode: simulates upload with 2s delay.
 */

import { NextRequest, NextResponse } from 'next/server';

// Shared global job store (mock only — would be Redis/DB in production)
function getJobStore() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const g = globalThis as any;
  if (!g.__canvaJobs) g.__canvaJobs = new Map();
  return g.__canvaJobs as Map<string, { status: string; assetName: string; createdAt: number }>;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const assetName = formData.get('assetName') as string || 'Untitled Chart';
    const token = request.headers.get('x-canva-token');

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated with Canva' }, { status: 401 });
    }

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const jobId = `canva_job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const jobs = getJobStore();

    // Store job as uploading
    jobs.set(jobId, {
      status: 'uploading',
      assetName,
      createdAt: Date.now(),
    });

    // Simulate async upload: mark as complete after 2s
    setTimeout(() => {
      const job = jobs.get(jobId);
      if (job) {
        job.status = 'completed';
      }
    }, 2000);

    return NextResponse.json({ jobId, status: 'uploading' });
  } catch {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
