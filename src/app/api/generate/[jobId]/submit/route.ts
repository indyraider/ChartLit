/**
 * PRD §7.3.2 — POST /api/generate/:jobId/submit
 * Submit a user-generated chart to the public gallery approval queue.
 * Now wired to the candidates persistence store.
 */

import { NextRequest, NextResponse } from 'next/server';
import { addCandidate } from '@/lib/candidates-store';
import { buildMockCandidate, parsePrompt } from '@/lib/ai-pipeline';
import type { CandidateTemplate, Framework, TemplateMetadata } from '@/types/template';

// Access the generation job store
function getGenJobStore() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const g = globalThis as any;
  if (!g.__genJobs) g.__genJobs = new Map();
  return g.__genJobs as Map<string, {
    status: string;
    prompt: string;
    templateId: string | null;
  }>;
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await params;
  const jobs = getGenJobStore();
  const job = jobs.get(jobId);

  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  if (job.status !== 'complete' || !job.templateId) {
    return NextResponse.json({ error: 'Job is not complete' }, { status: 400 });
  }

  // Fetch the base template
  let baseTemplate: TemplateMetadata | null = null;
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/templates/${job.templateId}`,
    );
    if (res.ok) {
      baseTemplate = await res.json();
    }
  } catch {
    // Fall through
  }

  if (!baseTemplate) {
    return NextResponse.json({ error: 'Base template not found' }, { status: 404 });
  }

  // Build a CandidateTemplate and persist it
  const spec = parsePrompt(job.prompt);
  const mock = buildMockCandidate(spec, baseTemplate);
  const candidate: CandidateTemplate = {
    ...mock,
    promptText: job.prompt,
    userId: 'anonymous', // Would come from auth in production
  };

  addCandidate(candidate);
  console.log(`[AI Pipeline] Submitted candidate ${candidate.id} to approval queue`);

  return NextResponse.json({
    jobId,
    candidateId: candidate.id,
    submitted: true,
    message: 'Your chart has been submitted for review. You\'ll be notified when it\'s approved.',
  });
}
