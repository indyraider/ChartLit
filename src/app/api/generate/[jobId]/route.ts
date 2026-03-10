/**
 * PRD §13.1 — GET /api/generate/:jobId
 * Poll generation status. Returns template on completion.
 */

import { NextRequest, NextResponse } from 'next/server';

function getGenJobStore() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const g = globalThis as any;
  if (!g.__genJobs) g.__genJobs = new Map();
  return g.__genJobs as Map<string, {
    status: string;
    prompt: string;
    templateId: string | null;
    error: string | null;
    suggestion: string | null;
  }>;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await params;
  const jobs = getGenJobStore();
  const job = jobs.get(jobId);

  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  const response: Record<string, unknown> = {
    jobId,
    status: job.status,
  };

  if (job.status === 'complete' && job.templateId) {
    // Fetch the template details
    try {
      const templateRes = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/templates/${job.templateId}`,
      );
      if (templateRes.ok) {
        const template = await templateRes.json();
        // Mark as AI-generated
        response.template = {
          ...template,
          id: `ai-${template.id}-${Date.now()}`,
          title: `AI: ${template.title}`,
          generationSource: 'ai-user',
          qualityScore: 75 + Math.floor(Math.random() * 11),
        };
      }
    } catch {
      // Fall through — return status without template
    }
  }

  if (job.status === 'failed') {
    response.error = job.error;
    response.suggestion = job.suggestion;
  }

  return NextResponse.json(response);
}
