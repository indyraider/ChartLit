'use client';

/**
 * PRD §5.2.3 — Developer Tab
 * Framework selector, syntax-highlighted code preview, dependency manifest, copy actions.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/store';
import { FRAMEWORKS } from '@/types/template';
import type { TemplateMetadata, Framework, CodeGenerationResponse } from '@/types/template';
import { isGraphType } from '@/lib/chart-loader';

interface Props {
  template: TemplateMetadata;
}

export function DeveloperTab({ template }: Props) {
  const {
    modal, setModalFramework, setModalIncludeEffects, setModalIncludeTypes,
    setModalNeo4jBoilerplate,
  } = useAppStore();

  const [codeResponse, setCodeResponse] = useState<CodeGenerationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isGraph = isGraphType(template.chartType);

  // Fetch generated code
  const fetchCode = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        framework: modal.framework,
        includeEffects: String(modal.includeEffects),
        includeTypes: String(modal.includeTypes),
        neo4jBoilerplate: String(modal.neo4jBoilerplate),
        palette: modal.palette,
        effect: modal.effect ?? 'none',
        effectIntensity: String(modal.effectIntensity),
      });
      const res = await fetch(`/api/templates/${template.id}/code?${params}`);
      if (!res.ok) throw new Error('Code generation failed');
      const data: CodeGenerationResponse = await res.json();
      setCodeResponse(data);
    } catch (err) {
      console.error('Failed to fetch code:', err);
      setCodeResponse(null);
      setError('Code generation failed. Try a different configuration.');
    } finally {
      setLoading(false);
    }
  }, [template.id, modal.framework, modal.includeEffects, modal.includeTypes, modal.neo4jBoilerplate, modal.palette, modal.effect, modal.effectIntensity]);

  useEffect(() => {
    fetchCode();
  }, [fetchCode]);

  // Copy helpers
  const copyToClipboard = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Framework Selector */}
      <section>
        <h3 className="text-sm font-semibold text-text-primary">Framework</h3>
        <div className="mt-2 flex gap-1.5">
          {FRAMEWORKS.map((fw) => (
            <button
              key={fw}
              onClick={() => setModalFramework(fw)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                modal.framework === fw
                  ? 'bg-accent-dev text-white'
                  : 'border border-border-subtle bg-bg-input text-text-muted hover:text-text-body'
              }`}
            >
              {fw === 'react' ? 'React' : fw === 'vanilla' ? 'Vanilla JS' : fw === 'vue' ? 'Vue 3' : 'Svelte'}
            </button>
          ))}
        </div>
      </section>

      {/* Toggles */}
      <section className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-xs text-text-muted">
          <input
            type="checkbox"
            checked={modal.includeEffects}
            onChange={(e) => setModalIncludeEffects(e.target.checked)}
            className="accent-accent-dev"
          />
          Include effect code
        </label>
        <label className="flex items-center gap-2 text-xs text-text-muted">
          <input
            type="checkbox"
            checked={modal.includeTypes}
            onChange={(e) => setModalIncludeTypes(e.target.checked)}
            className="accent-accent-dev"
          />
          Include TypeScript types
        </label>
        {isGraph && (
          <label className="flex items-center gap-2 text-xs text-text-muted">
            <input
              type="checkbox"
              checked={modal.neo4jBoilerplate}
              onChange={(e) => setModalNeo4jBoilerplate(e.target.checked)}
              className="accent-accent-dev"
            />
            Neo4j connection boilerplate
          </label>
        )}
      </section>

      {/* Code Preview */}
      <section>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text-primary">Code</h3>
          <div className="flex gap-1.5">
            <CopyButton
              label="Copy Code"
              copied={copied === 'code'}
              onClick={() => codeResponse && copyToClipboard(codeResponse.code, 'code')}
            />
            <CopyButton
              label="Copy Install"
              copied={copied === 'install'}
              onClick={() => codeResponse && copyToClipboard(codeResponse.dependencies.installCommand, 'install')}
            />
          </div>
        </div>
        <div className="mt-2 max-h-[400px] overflow-auto rounded-lg border border-border-subtle bg-bg-inset">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-border-subtle border-t-accent-dev" />
            </div>
          ) : (
            <pre className="p-4 font-mono text-xs leading-relaxed text-text-body">
              <code>{error ? `// ${error}` : codeResponse?.code ?? '// Loading...'}</code>
            </pre>
          )}
        </div>
      </section>

      {/* Dependency Manifest */}
      {codeResponse && (
        <section>
          <h3 className="text-sm font-semibold text-text-primary">Dependencies</h3>
          <div className="mt-2 rounded-lg border border-border-subtle bg-bg-inset p-3">
            <div className="flex items-center justify-between">
              <code className="font-mono text-xs text-text-muted">
                {codeResponse.dependencies.installCommand}
              </code>
              <CopyButton
                label="Copy"
                copied={copied === 'deps'}
                onClick={() => copyToClipboard(codeResponse.dependencies.installCommand, 'deps')}
              />
            </div>
            <div className="mt-3 space-y-1">
              {codeResponse.dependencies.packages.map((pkg) => (
                <div key={pkg.name} className="flex items-center justify-between text-[11px]">
                  <span className="font-mono text-text-body">{pkg.name}@{pkg.version}</span>
                  <span className="text-text-dim">{pkg.purpose}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Data Shape Guide */}
      <section>
        <details className="group">
          <summary className="cursor-pointer text-sm font-semibold text-text-primary">
            Data Shape Guide
            <span className="ml-1 text-xs text-text-dim group-open:hidden">▸</span>
            <span className="ml-1 text-xs text-text-dim hidden group-open:inline">▾</span>
          </summary>
          <div className="mt-2 rounded-lg border border-border-subtle bg-bg-inset p-3">
            <pre className="font-mono text-xs text-text-muted">
{`// Expected data format for ${template.chartType}
interface DataPoint {
  ${getDataShapeFields(template.chartType)}
}`}
            </pre>
          </div>
        </details>
      </section>
    </div>
  );
}

// --- Copy Button ---

function CopyButton({ label, copied, onClick }: { label: string; copied: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-md border border-border-subtle bg-bg-input px-2 py-1 text-[10px] font-medium text-text-muted transition-colors hover:border-border-active hover:text-text-body"
    >
      {copied ? '✓ Copied' : label}
    </button>
  );
}

// --- Data shape helper ---

function getDataShapeFields(chartType: string): string {
  const shapes: Record<string, string> = {
    'bar': 'name: string;\n  value: number;',
    'line': 'month: string;\n  value: number;',
    'area': 'month: string;\n  value: number;',
    'pie': 'name: string;\n  value: number;',
    'donut': 'name: string;\n  value: number;',
    'scatter': 'x: number;\n  y: number;\n  label?: string;',
    'radar': 'metric: string;\n  value: number;',
    'heatmap': 'row: string;\n  col: string;\n  value: number;',
    'funnel': 'stage: string;\n  value: number;',
    'waterfall': 'label: string;\n  value: number;\n  type?: "positive" | "negative" | "total";',
    'gauge': 'value: number;\n  max?: number;\n  label?: string;',
    'candlestick': 'date: string;\n  open: number;\n  high: number;\n  low: number;\n  close: number;',
    'treemap': 'name: string;\n  value: number;\n  children?: DataPoint[];',
    'radial': 'name: string;\n  value: number;',
  };

  if (chartType.startsWith('graph-')) {
    return 'nodes: Array<{ id: string; label?: string; group?: string }>;\n  edges: Array<{ source: string; target: string; weight?: number }>;';
  }

  return shapes[chartType] ?? 'name: string;\n  value: number;';
}
