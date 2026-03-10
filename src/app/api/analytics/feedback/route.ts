/**
 * PRD §7.6 — GET /api/analytics/feedback
 * Approval feedback loop analysis:
 * - Rejection categories for prompt improvements
 * - Approval patterns for style evolution
 * - Quality gate failure analysis
 */

import { NextResponse } from 'next/server';
import { getCandidates } from '@/lib/candidates-store';
import { analyzeRejections, analyzeApprovalPatterns } from '@/lib/analytics-store';

export async function GET() {
  const allCandidates = getCandidates();

  // Rejection analysis: categorize rejection reasons → prompt improvements
  const rejectionAnalysis = analyzeRejections(allCandidates);

  // Approval patterns: track what gets approved → style evolution weights
  const approvalPatterns = analyzeApprovalPatterns(allCandidates);

  // Quality gate failure analysis: candidates that scored below threshold
  const qualityFailures = allCandidates
    .filter((c) => c.reviewStatus === 'rejected' && (c.qualityScore ?? 100) < 65)
    .map((c) => ({
      id: c.id,
      chartType: c.chartType,
      library: c.library,
      effect: c.effect,
      score: c.qualityScore,
      reason: c.rejectionReason,
    }));

  // Prompt improvement suggestions based on rejection patterns
  const promptImprovements = rejectionAnalysis.map((r) => {
    const suggestions: Record<string, string> = {
      'low-quality': 'Increase visual quality constraints in generation prompts',
      'code-error': 'Add stricter code validation to generation pipeline',
      'duplicate': 'Add similarity check against existing templates before generation',
      'effect-broken': 'Reduce effect intensity defaults or add effect-specific validation',
      'inappropriate': 'Add content policy checks to generation pipeline',
      'incomplete-metadata': 'Ensure generation pipeline produces complete metadata',
    };
    return {
      reason: r.reason,
      count: r.count,
      percentage: r.percentage,
      suggestion: suggestions[r.reason] || 'Review and adjust generation parameters',
    };
  });

  return NextResponse.json({
    rejectionAnalysis,
    approvalPatterns,
    qualityFailures,
    promptImprovements,
    summary: {
      totalReviewed: allCandidates.filter((c) => c.reviewStatus !== 'pending').length,
      approvalRate: (() => {
        const reviewed = allCandidates.filter((c) => c.reviewStatus === 'approved' || c.reviewStatus === 'rejected');
        if (reviewed.length === 0) return 0;
        const approved = reviewed.filter((c) => c.reviewStatus === 'approved').length;
        return Math.round((approved / reviewed.length) * 100);
      })(),
    },
  });
}
