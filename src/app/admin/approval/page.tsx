/**
 * PRD §7.4.1 — Admin Approval Queue Dashboard
 * Sortable list of candidates with approve/reject/revision actions.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { CandidateTemplate, PaletteName } from '@/types/template';
import { CHART_TYPES, LIBRARIES, EFFECT_PRESETS, PALETTE_NAMES } from '@/types/template';

type ReviewStatus = CandidateTemplate['reviewStatus'];
type SortField = 'score' | 'date' | 'title' | 'type';
type SortDir = 'asc' | 'desc';

interface QueueStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  revision: number;
  borderline: number;
}

// --- Review Criteria Guidance ---
const REVIEW_CRITERIA = [
  { label: 'Visual Quality', desc: 'Chart renders cleanly with proper colors, spacing, and typography' },
  { label: 'Code Quality', desc: 'Generated code is clean, follows framework conventions' },
  { label: 'Effect Integrity', desc: 'Visual effects render correctly without obscuring data' },
  { label: 'Data Correctness', desc: 'Chart accurately represents sample data' },
  { label: 'Uniqueness', desc: 'Not too similar to existing gallery templates' },
  { label: 'Metadata', desc: 'Title, tags, and use cases are appropriate and complete' },
  { label: 'Appropriateness', desc: 'Content is suitable for a public gallery' },
];

export default function ApprovalQueuePage() {
  const [candidates, setCandidates] = useState<CandidateTemplate[]>([]);
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showCriteria, setShowCriteria] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | ''>('pending');
  const [typeFilter, setTypeFilter] = useState('');
  const [libraryFilter, setLibraryFilter] = useState('');
  const [effectFilter, setEffectFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [scoreRange, setScoreRange] = useState<[number, number]>([0, 100]);

  // Sort
  const [sortField, setSortField] = useState<SortField>('score');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  // Action modal
  const [actionTarget, setActionTarget] = useState<CandidateTemplate | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'revision' | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editSubtitle, setEditSubtitle] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editPalette, setEditPalette] = useState<PaletteName | ''>('');

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    if (typeFilter) params.set('chartType', typeFilter);
    if (libraryFilter) params.set('library', libraryFilter);
    if (effectFilter) params.set('effect', effectFilter);
    if (sourceFilter) params.set('source', sourceFilter);
    if (scoreRange[0] > 0) params.set('scoreMin', String(scoreRange[0]));
    if (scoreRange[1] < 100) params.set('scoreMax', String(scoreRange[1]));

    const [queueRes, statsRes] = await Promise.all([
      fetch(`/api/admin/approval/queue?${params}`),
      fetch('/api/admin/approval/stats'),
    ]);

    const queueData = await queueRes.json();
    const statsData = await statsRes.json();

    let filtered = queueData.candidates || [];
    // Client-side date range filter
    if (dateFrom) {
      const from = new Date(dateFrom).getTime();
      filtered = filtered.filter((c: CandidateTemplate) => c.createdAt && new Date(c.createdAt).getTime() >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo).getTime() + 86400000; // end of day
      filtered = filtered.filter((c: CandidateTemplate) => c.createdAt && new Date(c.createdAt).getTime() <= to);
    }
    setCandidates(filtered);
    setStats(statsData);
    setLoading(false);
  }, [statusFilter, typeFilter, libraryFilter, effectFilter, sourceFilter, dateFrom, dateTo, scoreRange]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  // Sort locally
  const sorted = [...candidates].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    switch (sortField) {
      case 'score': return dir * ((a.qualityScore ?? 0) - (b.qualityScore ?? 0));
      case 'date': return dir * ((a.createdAt ?? '').localeCompare(b.createdAt ?? ''));
      case 'title': return dir * a.title.localeCompare(b.title);
      case 'type': return dir * a.chartType.localeCompare(b.chartType);
      default: return 0;
    }
  });

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === sorted.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sorted.map((c) => c.id)));
    }
  };

  const openAction = (candidate: CandidateTemplate, type: 'approve' | 'reject' | 'revision') => {
    setActionTarget(candidate);
    setActionType(type);
    setActionNotes('');
    setRejectReason('');
    setEditTitle(candidate.title);
    setEditSubtitle(candidate.subtitle);
    setEditTags(candidate.tags.join(', '));
    setEditPalette(candidate.palette);
  };

  const closeAction = () => {
    setActionTarget(null);
    setActionType(null);
  };

  const executeAction = async () => {
    if (!actionTarget || !actionType) return;

    const url = `/api/admin/approval/${actionTarget.id}/${actionType}`;
    let body: Record<string, unknown> = {};

    if (actionType === 'approve') {
      body = {
        reviewerNotes: actionNotes,
        title: editTitle,
        subtitle: editSubtitle,
        tags: editTags.split(',').map((t) => t.trim()).filter(Boolean),
        ...(editPalette ? { palette: editPalette } : {}),
      };
    } else if (actionType === 'reject') {
      body = { reason: rejectReason, notes: actionNotes };
    } else if (actionType === 'revision') {
      body = { notes: actionNotes };
    }

    await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    closeAction();
    fetchQueue();
    setSelectedIds(new Set());
  };

  const executeBatchAction = async (type: 'approve' | 'reject') => {
    for (const id of selectedIds) {
      const url = `/api/admin/approval/${id}/${type}`;
      const body = type === 'reject' ? { reason: 'batch-rejected', notes: 'Batch rejection' } : {};
      await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    }
    setSelectedIds(new Set());
    fetchQueue();
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('desc'); }
  };

  const sortIcon = (field: SortField) =>
    sortField === field ? (sortDir === 'asc' ? ' ▲' : ' ▼') : '';

  const isBorderline = (score?: number) => score !== undefined && score >= 65 && score <= 75;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Approval Queue</h1>
            <p className="text-sm text-slate-400 mt-1">Review and approve AI-generated templates</p>
          </div>
          <a href="/" className="text-sm text-slate-400 hover:text-white transition">← Back to Gallery</a>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6 space-y-6">
        {/* Stats Bar */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { label: 'Total', value: stats.total, color: 'text-slate-300' },
              { label: 'Pending', value: stats.pending, color: 'text-amber-400' },
              { label: 'Approved', value: stats.approved, color: 'text-emerald-400' },
              { label: 'Rejected', value: stats.rejected, color: 'text-red-400' },
              { label: 'Revision', value: stats.revision, color: 'text-blue-400' },
              { label: 'Borderline', value: stats.borderline, color: 'text-orange-400' },
            ].map((s) => (
              <div key={s.label} className="bg-slate-900 rounded-lg border border-slate-800 p-3 text-center">
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-slate-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-xs text-slate-500 block mb-1">Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as ReviewStatus | '')}
              className="bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm">
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="revision-requested">Revision</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Chart Type</label>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm">
              <option value="">All</option>
              {CHART_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Library</label>
            <select value={libraryFilter} onChange={(e) => setLibraryFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm">
              <option value="">All</option>
              {LIBRARIES.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Effect</label>
            <select value={effectFilter} onChange={(e) => setEffectFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm">
              <option value="">All</option>
              {EFFECT_PRESETS.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Source</label>
            <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm">
              <option value="">All</option>
              <option value="ai-user">User</option>
              <option value="ai-background">Background</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Date From</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm" />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Date To</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm" />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Min Score</label>
            <input type="number" min={0} max={100} value={scoreRange[0]}
              onChange={(e) => setScoreRange([Number(e.target.value), scoreRange[1]])}
              className="bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm w-20" />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Max Score</label>
            <input type="number" min={0} max={100} value={scoreRange[1]}
              onChange={(e) => setScoreRange([scoreRange[0], Number(e.target.value)])}
              className="bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm w-20" />
          </div>

          <button onClick={() => setShowCriteria(!showCriteria)}
            className="ml-auto text-xs text-slate-400 hover:text-white border border-slate-700 rounded px-3 py-1.5 transition">
            {showCriteria ? 'Hide' : 'Show'} Review Criteria
          </button>
        </div>

        {/* Review Criteria Guidance */}
        {showCriteria && (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-slate-300 mb-2">Review Criteria</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {REVIEW_CRITERIA.map((c) => (
                <div key={c.label} className="text-xs">
                  <span className="text-emerald-400 font-medium">{c.label}:</span>{' '}
                  <span className="text-slate-400">{c.desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Batch Actions */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-3 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3">
            <span className="text-sm text-slate-300">{selectedIds.size} selected</span>
            <button onClick={() => executeBatchAction('approve')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium px-3 py-1.5 rounded transition">
              Batch Approve
            </button>
            <button onClick={() => executeBatchAction('reject')}
              className="bg-red-600 hover:bg-red-500 text-white text-xs font-medium px-3 py-1.5 rounded transition">
              Batch Reject
            </button>
            <button onClick={() => setSelectedIds(new Set())}
              className="text-xs text-slate-400 hover:text-white transition">
              Clear Selection
            </button>
          </div>
        )}

        {/* Queue Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500">Loading queue...</div>
          ) : sorted.length === 0 ? (
            <div className="p-12 text-center text-slate-500">No candidates match the current filters.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase">
                  <th className="p-3 w-10">
                    <input type="checkbox" checked={selectedIds.size === sorted.length && sorted.length > 0}
                      onChange={toggleSelectAll} className="rounded bg-slate-700 border-slate-600" />
                  </th>
                  <th className="p-3 text-left">Thumbnail</th>
                  <th className="p-3 text-left cursor-pointer hover:text-white" onClick={() => handleSort('title')}>
                    Title{sortIcon('title')}
                  </th>
                  <th className="p-3 text-left cursor-pointer hover:text-white" onClick={() => handleSort('type')}>
                    Type{sortIcon('type')}
                  </th>
                  <th className="p-3 text-left">Library</th>
                  <th className="p-3 text-left">Effect</th>
                  <th className="p-3 text-center cursor-pointer hover:text-white" onClick={() => handleSort('score')}>
                    Score{sortIcon('score')}
                  </th>
                  <th className="p-3 text-left">Source</th>
                  <th className="p-3 text-left cursor-pointer hover:text-white" onClick={() => handleSort('date')}>
                    Date{sortIcon('date')}
                  </th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((c) => (
                  <tr key={c.id} className={`border-b border-slate-800/50 hover:bg-slate-800/30 transition ${
                    isBorderline(c.qualityScore) ? 'bg-orange-950/20' : ''
                  }`}>
                    <td className="p-3">
                      <input type="checkbox" checked={selectedIds.has(c.id)}
                        onChange={() => toggleSelect(c.id)} className="rounded bg-slate-700 border-slate-600" />
                    </td>
                    <td className="p-3">
                      <div className="w-12 h-12 bg-slate-800 rounded border border-slate-700 flex items-center justify-center text-xs text-slate-500">
                        {c.chartType.slice(0, 3)}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-white">{c.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{c.subtitle}</div>
                      {c.promptText && (
                        <div className="text-xs text-slate-600 mt-0.5 italic truncate max-w-xs">
                          &quot;{c.promptText}&quot;
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-slate-300">{c.chartType}</td>
                    <td className="p-3 text-slate-300">{c.library}</td>
                    <td className="p-3 text-slate-300">{c.effect || '—'}</td>
                    <td className="p-3 text-center">
                      <span className={`font-mono font-bold ${
                        (c.qualityScore ?? 0) >= 80 ? 'text-emerald-400' :
                        (c.qualityScore ?? 0) >= 65 ? 'text-amber-400' :
                        'text-red-400'
                      }`}>
                        {c.qualityScore ?? '—'}
                      </span>
                      {isBorderline(c.qualityScore) && (
                        <div className="text-[10px] text-orange-400 mt-0.5">BORDERLINE</div>
                      )}
                    </td>
                    <td className="p-3">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        c.generationSource === 'ai-user'
                          ? 'bg-purple-900/50 text-purple-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {c.generationSource === 'ai-user' ? 'User' : 'Background'}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-slate-400">
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="p-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        c.reviewStatus === 'pending' ? 'bg-amber-900/50 text-amber-300' :
                        c.reviewStatus === 'approved' ? 'bg-emerald-900/50 text-emerald-300' :
                        c.reviewStatus === 'rejected' ? 'bg-red-900/50 text-red-300' :
                        'bg-blue-900/50 text-blue-300'
                      }`}>
                        {c.reviewStatus}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-1">
                        {(c.reviewStatus === 'pending' || c.reviewStatus === 'revision-requested') && (
                          <>
                            <button onClick={() => openAction(c, 'approve')}
                              className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs px-2 py-1 rounded transition"
                              title="Approve">
                              ✓
                            </button>
                            <button onClick={() => openAction(c, 'revision')}
                              className="bg-blue-700 hover:bg-blue-600 text-white text-xs px-2 py-1 rounded transition"
                              title="Request Revision">
                              ↻
                            </button>
                            <button onClick={() => openAction(c, 'reject')}
                              className="bg-red-700 hover:bg-red-600 text-white text-xs px-2 py-1 rounded transition"
                              title="Reject">
                              ✕
                            </button>
                          </>
                        )}
                        {c.reviewStatus === 'approved' && (
                          <button onClick={async () => {
                            await fetch(`/api/admin/approval/${c.id}/unpublish`, { method: 'POST' });
                            fetchQueue();
                          }}
                            className="bg-orange-700 hover:bg-orange-600 text-white text-xs px-2 py-1 rounded transition"
                            title="Emergency Unpublish">
                            ⚠
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Queue Overflow Warning */}
        {stats && stats.pending > 200 && (
          <div className="bg-red-950 border border-red-800 rounded-lg p-4 text-sm text-red-300">
            Queue overflow: {stats.pending} pending candidates. Background pipeline should be paused (resumes at &lt;100).
          </div>
        )}
      </main>

      {/* Action Modal */}
      {actionTarget && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={closeAction}>
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold capitalize mb-1">
              {actionType === 'approve' ? 'Approve Template' :
               actionType === 'reject' ? 'Reject Template' :
               'Request Revision'}
            </h2>
            <p className="text-sm text-slate-400 mb-4">{actionTarget.title}</p>

            {/* Approve: edit title/subtitle/tags/palette */}
            {actionType === 'approve' && (
              <div className="space-y-3 mb-4">
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Title (editable)</label>
                  <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Subtitle (editable)</label>
                  <input value={editSubtitle} onChange={(e) => setEditSubtitle(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Tags (comma-separated)</label>
                  <input value={editTags} onChange={(e) => setEditTags(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Palette</label>
                  <select value={editPalette} onChange={(e) => setEditPalette(e.target.value as PaletteName)}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm">
                    {PALETTE_NAMES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* Reject: reason code */}
            {actionType === 'reject' && (
              <div className="mb-4">
                <label className="text-xs text-slate-500 block mb-1">Rejection Reason</label>
                <select value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm">
                  <option value="">Select a reason...</option>
                  <option value="low-quality">Low Visual Quality</option>
                  <option value="code-error">Code Error</option>
                  <option value="duplicate">Duplicate of Existing</option>
                  <option value="effect-broken">Effect Integrity Issue</option>
                  <option value="inappropriate">Inappropriate Content</option>
                  <option value="incomplete-metadata">Incomplete Metadata</option>
                  <option value="other">Other</option>
                </select>
              </div>
            )}

            {/* Notes (all actions) */}
            <div className="mb-4">
              <label className="text-xs text-slate-500 block mb-1">
                {actionType === 'revision' ? 'Revision Notes (sent to generator)' : 'Reviewer Notes'}
              </label>
              <textarea value={actionNotes} onChange={(e) => setActionNotes(e.target.value)}
                rows={3} placeholder={actionType === 'revision' ? 'Describe what needs to change...' : 'Optional notes...'}
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm resize-none" />
            </div>

            <div className="flex gap-3 justify-end">
              <button onClick={closeAction}
                className="text-sm text-slate-400 hover:text-white px-4 py-2 transition">
                Cancel
              </button>
              <button onClick={executeAction}
                disabled={actionType === 'reject' && !rejectReason}
                className={`text-sm font-medium px-4 py-2 rounded transition disabled:opacity-50 ${
                  actionType === 'approve' ? 'bg-emerald-600 hover:bg-emerald-500 text-white' :
                  actionType === 'reject' ? 'bg-red-600 hover:bg-red-500 text-white' :
                  'bg-blue-600 hover:bg-blue-500 text-white'
                }`}>
                {actionType === 'approve' ? 'Approve & Publish' :
                 actionType === 'reject' ? 'Reject' :
                 'Request Revision'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
