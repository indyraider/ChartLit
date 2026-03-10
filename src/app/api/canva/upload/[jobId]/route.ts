/**
 * PRD §13.1 — Canva Upload Status (Mock)
 * GET /api/canva/upload/:jobId
 * Returns the current status of a Canva upload job.
 */

import { NextRequest, NextResponse } from 'next/server';

// Import shared job store from parent route
// Note: In production this would be Redis/DB. For mock, we use a shared module.
// Since Next.js route segments can't easily share module state across files,
// we use a simple global store.
const getJobStore = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const g = globalThis as any;
  if (!g.__canvaJobs) g.__canvaJobs = new Map();
  return g.__canvaJobs as Map<string, { status: string; assetName: string; createdAt: number }>;
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await params;
  const jobs = getJobStore();
  const job = jobs.get(jobId);

  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  return NextResponse.json({
    jobId,
    status: job.status,
    assetName: job.assetName,
  });
}
