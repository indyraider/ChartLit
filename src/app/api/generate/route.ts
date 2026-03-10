/**
 * PRD §13.1 — POST /api/generate
 * Submit NL prompt for AI chart generation. Returns job ID.
 * Mock: picks a matching template from catalog and returns it after simulated delay.
 */

import { NextRequest, NextResponse } from 'next/server';
import { parsePrompt } from '@/lib/ai-pipeline';

// Global job store (mock — would be Redis/BullMQ in production)
function getGenJobStore() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const g = globalThis as any;
  if (!g.__genJobs) g.__genJobs = new Map();
  return g.__genJobs as Map<string, GenJob>;
}

interface GenJob {
  status: 'pending' | 'generating' | 'complete' | 'failed';
  prompt: string;
  spec: ReturnType<typeof parsePrompt>;
  templateId: string | null;
  error: string | null;
  suggestion: string | null;
  createdAt: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt } = body as { prompt: string };

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Rate limiting stub: 10/day per user (would use Redis in production)
    // For now, always allow

    const spec = parsePrompt(prompt);
    const jobId = `gen-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const jobs = getGenJobStore();

    jobs.set(jobId, {
      status: 'pending',
      prompt,
      spec,
      templateId: null,
      error: null,
      suggestion: null,
      createdAt: Date.now(),
    });

    // Simulate pipeline stages with delays
    // Stage 1: Prompt parsing (immediate — already done above)
    setTimeout(() => {
      const job = jobs.get(jobId);
      if (job) job.status = 'generating';
    }, 500);

    // Stage 2-4: Code gen + render + scoring (2-4s simulated)
    const genDelay = 2000 + Math.random() * 2000;
    setTimeout(async () => {
      const job = jobs.get(jobId);
      if (!job) return;

      try {
        // Find a matching template from the catalog
        const matchRes = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/templates?` +
          new URLSearchParams({
            ...(spec.chartType ? { type: spec.chartType } : {}),
            ...(spec.library ? { library: spec.library } : {}),
            ...(spec.effect ? { effect: spec.effect } : {}),
            ...(spec.palette ? { palette: spec.palette } : {}),
            limit: '5',
          }).toString(),
        );
        const matchData = await matchRes.json();

        if (matchData.templates && matchData.templates.length > 0) {
          // Pick a random match
          const idx = Math.floor(Math.random() * matchData.templates.length);
          const template = matchData.templates[idx];

          job.status = 'complete';
          job.templateId = template.id;
        } else {
          // No match — simulate failure with suggestion
          job.status = 'failed';
          job.error = 'No matching template found for your description.';
          job.suggestion = 'Try a simpler description like "a bar chart with neon glow" or "d3 line chart".';
        }
      } catch {
        job.status = 'failed';
        job.error = 'Generation pipeline encountered an error.';
        job.suggestion = 'Please try again.';
      }
    }, genDelay);

    return NextResponse.json({ jobId });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
