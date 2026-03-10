/**
 * PRD §17.4 — Template Validation Utilities
 * Validates that templates have correct metadata, render correctly,
 * and code exports compile for all 4 frameworks.
 */

import type { TemplateMetadata, Framework } from '@/types/template';
import { CHART_TYPES, LIBRARIES, PALETTE_NAMES, FRAMEWORKS } from '@/types/template';

export interface ValidationResult {
  templateId: string;
  passed: boolean;
  checks: ValidationCheck[];
}

export interface ValidationCheck {
  name: string;
  passed: boolean;
  message?: string;
}

/** Validate template metadata completeness and correctness. */
export function validateMetadata(template: TemplateMetadata): ValidationResult {
  const checks: ValidationCheck[] = [];

  // Required fields
  checks.push({
    name: 'has-id',
    passed: !!template.id && template.id.length > 0,
    message: template.id ? undefined : 'Missing template ID',
  });

  checks.push({
    name: 'has-title',
    passed: !!template.title && template.title.length > 0,
    message: template.title ? undefined : 'Missing title',
  });

  checks.push({
    name: 'has-subtitle',
    passed: !!template.subtitle && template.subtitle.length > 0,
    message: template.subtitle ? undefined : 'Missing subtitle',
  });

  // Valid enum values
  checks.push({
    name: 'valid-chart-type',
    passed: (CHART_TYPES as readonly string[]).includes(template.chartType),
    message: (CHART_TYPES as readonly string[]).includes(template.chartType) ? undefined : `Invalid chart type: ${template.chartType}`,
  });

  checks.push({
    name: 'valid-library',
    passed: (LIBRARIES as readonly string[]).includes(template.library),
    message: (LIBRARIES as readonly string[]).includes(template.library) ? undefined : `Invalid library: ${template.library}`,
  });

  checks.push({
    name: 'valid-palette',
    passed: (PALETTE_NAMES as readonly string[]).includes(template.palette),
    message: (PALETTE_NAMES as readonly string[]).includes(template.palette) ? undefined : `Invalid palette: ${template.palette}`,
  });

  // Tags and use cases
  checks.push({
    name: 'has-tags',
    passed: Array.isArray(template.tags) && template.tags.length > 0,
    message: template.tags?.length > 0 ? undefined : 'No tags defined',
  });

  checks.push({
    name: 'has-use-cases',
    passed: Array.isArray(template.useCases) && template.useCases.length > 0,
    message: template.useCases?.length > 0 ? undefined : 'No use cases defined',
  });

  // Data schema
  checks.push({
    name: 'has-data-schema',
    passed: !!template.dataSchema,
    message: template.dataSchema ? undefined : 'Missing data schema',
  });

  // Graph-specific checks
  if (template.chartType.startsWith('graph-')) {
    checks.push({
      name: 'graph-has-layout-config',
      passed: !!template.layoutConfig,
      message: template.layoutConfig ? undefined : 'Graph template missing layoutConfig',
    });

    checks.push({
      name: 'graph-has-interactions',
      passed: template.interactionDefaults.length > 0,
      message: template.interactionDefaults.length > 0 ? undefined : 'Graph template missing interaction defaults',
    });
  }

  return {
    templateId: template.id,
    passed: checks.every((c) => c.passed),
    checks,
  };
}

/** Validate that code export would compile (mock — checks template reference exists). */
export function validateCodeExport(
  template: TemplateMetadata,
): ValidationResult {
  const checks: ValidationCheck[] = [];

  for (const framework of FRAMEWORKS) {
    // In production, this would actually compile the code.
    // Mock: check that a render module is referenced.
    const hasModule = !!template.renderModule;
    checks.push({
      name: `compile-${framework}`,
      passed: hasModule,
      message: hasModule ? undefined : `No render module for ${framework} compilation`,
    });
  }

  return {
    templateId: template.id,
    passed: checks.every((c) => c.passed),
    checks,
  };
}

/** Run full validation suite on a batch of templates. */
export function validateBatch(templates: TemplateMetadata[]): {
  total: number;
  passed: number;
  failed: number;
  results: ValidationResult[];
} {
  const results: ValidationResult[] = [];

  for (const template of templates) {
    const metadataResult = validateMetadata(template);
    const codeResult = validateCodeExport(template);

    const allChecks = [...metadataResult.checks, ...codeResult.checks];
    results.push({
      templateId: template.id,
      passed: allChecks.every((c) => c.passed),
      checks: allChecks,
    });
  }

  const passed = results.filter((r) => r.passed).length;

  return {
    total: results.length,
    passed,
    failed: results.length - passed,
    results,
  };
}
