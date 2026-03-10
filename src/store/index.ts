/**
 * PRD §12.1 — Client State
 * Zustand store for ChartLit application state.
 */

import { create } from 'zustand';
import type {
  TemplateMetadata,
  GalleryFilters,
  PaletteName,
  EffectPreset,
  Framework,
} from '@/types/template';

// --- Workspace Chart ---

export interface WorkspaceChart {
  id: string;
  template: TemplateMetadata;
  data: Record<string, unknown>[] | null;
  palette: PaletteName;
  effect: EffectPreset | null;
  effectIntensity: number;
  title: string;
  framework: Framework;
  includeEffects: boolean;
  includeTypes: boolean;
  neo4jBoilerplate: boolean;
}

export type SizePreset =
  | 'auto' | '1:1' | '16:9' | '4:3' | '3:2' | '21:9'
  | '9:16' | 'a4' | 'letter' | '4k' | 'custom';

export interface CustomSize {
  width: number;
  height: number;
}

// --- Upload Status ---

export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

// --- Store State ---

interface GalleryState {
  templates: TemplateMetadata[];
  filters: GalleryFilters;
  visibleCount: number;
  page: number;
  hasMore: boolean;
  loading: boolean;
}

interface ModalState {
  template: TemplateMetadata | null;
  activeTab: 'designer' | 'developer';
  data: Record<string, unknown>[] | null;
  palette: PaletteName;
  effect: EffectPreset | null;
  effectIntensity: number;
  framework: Framework;
  includeEffects: boolean;
  includeTypes: boolean;
  neo4jBoilerplate: boolean;
}

interface WorkspaceState {
  charts: WorkspaceChart[];
  sizes: Record<string, SizePreset>;
  customSizes: Record<string, CustomSize>;
}

// --- Generation State ---

export type GenerationStatus = 'idle' | 'generating' | 'complete' | 'failed';

interface GenerationState {
  prompt: string;
  status: GenerationStatus;
  jobId: string | null;
  result: TemplateMetadata | null;
  error: string | null;
  suggestion: string | null;
}

interface CanvaState {
  connected: boolean;
  uploadStatus: Record<string, UploadStatus>;
}

interface AppState {
  gallery: GalleryState;
  modal: ModalState;
  workspace: WorkspaceState;
  canva: CanvaState;
  generation: GenerationState;

  // Gallery actions
  setTemplates: (templates: TemplateMetadata[], hasMore: boolean) => void;
  appendTemplates: (templates: TemplateMetadata[], hasMore: boolean) => void;
  setFilters: (filters: Partial<GalleryFilters>) => void;
  resetFilters: () => void;
  setLoading: (loading: boolean) => void;
  incrementPage: () => void;

  // Modal actions
  openModal: (template: TemplateMetadata) => void;
  closeModal: () => void;
  setActiveTab: (tab: 'designer' | 'developer') => void;
  setModalData: (data: Record<string, unknown>[] | null) => void;
  setModalPalette: (palette: PaletteName) => void;
  setModalEffect: (effect: EffectPreset | null) => void;
  setModalEffectIntensity: (intensity: number) => void;
  setModalFramework: (framework: Framework) => void;
  setModalIncludeEffects: (include: boolean) => void;
  setModalIncludeTypes: (include: boolean) => void;
  setModalNeo4jBoilerplate: (include: boolean) => void;

  // Workspace actions
  addToWorkspace: (chart: WorkspaceChart) => void;
  removeFromWorkspace: (id: string) => void;
  setChartSize: (chartId: string, size: SizePreset) => void;
  setChartCustomSize: (chartId: string, size: CustomSize) => void;

  // Canva actions
  setCanvaConnected: (connected: boolean) => void;
  setUploadStatus: (chartId: string, status: UploadStatus) => void;

  // Generation actions
  setGenerationPrompt: (prompt: string) => void;
  setGenerationStatus: (status: GenerationStatus) => void;
  setGenerationJobId: (jobId: string | null) => void;
  setGenerationResult: (result: TemplateMetadata | null) => void;
  setGenerationError: (error: string | null, suggestion?: string | null) => void;
  resetGeneration: () => void;
}

const DEFAULT_FILTERS: GalleryFilters = {
  type: null,
  library: null,
  effect: null,
  palette: null,
  useCase: null,
  search: '',
};

export const useAppStore = create<AppState>((set) => ({
  // --- Initial State ---
  gallery: {
    templates: [],
    filters: { ...DEFAULT_FILTERS },
    visibleCount: 0,
    page: 1,
    hasMore: true,
    loading: false,
  },
  modal: {
    template: null,
    activeTab: 'designer',
    data: null,
    palette: 'midnight',
    effect: null,
    effectIntensity: 75,
    framework: 'react',
    includeEffects: true,
    includeTypes: false,
    neo4jBoilerplate: false,
  },
  workspace: {
    charts: [],
    sizes: {},
    customSizes: {},
  },
  canva: {
    connected: false,
    uploadStatus: {},
  },
  generation: {
    prompt: '',
    status: 'idle',
    jobId: null,
    result: null,
    error: null,
    suggestion: null,
  },

  // --- Gallery Actions ---
  setTemplates: (templates, hasMore) =>
    set((s) => ({
      gallery: { ...s.gallery, templates, hasMore, page: 1 },
    })),
  appendTemplates: (templates, hasMore) =>
    set((s) => ({
      gallery: {
        ...s.gallery,
        templates: [...s.gallery.templates, ...templates],
        hasMore,
      },
    })),
  setFilters: (filters) =>
    set((s) => ({
      gallery: {
        ...s.gallery,
        filters: { ...s.gallery.filters, ...filters },
        page: 1,
      },
    })),
  resetFilters: () =>
    set((s) => ({
      gallery: { ...s.gallery, filters: { ...DEFAULT_FILTERS }, page: 1 },
    })),
  setLoading: (loading) =>
    set((s) => ({ gallery: { ...s.gallery, loading } })),
  incrementPage: () =>
    set((s) => ({ gallery: { ...s.gallery, page: s.gallery.page + 1 } })),

  // --- Modal Actions ---
  openModal: (template) =>
    set((s) => ({
      modal: {
        ...s.modal,
        template,
        data: null,
        palette: template.palette,
        effect: template.effect,
        effectIntensity: template.effectConfig?.intensity ?? 75,
        activeTab: 'designer',
      },
    })),
  closeModal: () =>
    set((s) => ({ modal: { ...s.modal, template: null } })),
  setActiveTab: (activeTab) =>
    set((s) => ({ modal: { ...s.modal, activeTab } })),
  setModalData: (data) =>
    set((s) => ({ modal: { ...s.modal, data } })),
  setModalPalette: (palette) =>
    set((s) => ({ modal: { ...s.modal, palette } })),
  setModalEffect: (effect) =>
    set((s) => ({ modal: { ...s.modal, effect } })),
  setModalEffectIntensity: (effectIntensity) =>
    set((s) => ({ modal: { ...s.modal, effectIntensity } })),
  setModalFramework: (framework) =>
    set((s) => ({ modal: { ...s.modal, framework } })),
  setModalIncludeEffects: (includeEffects) =>
    set((s) => ({ modal: { ...s.modal, includeEffects } })),
  setModalIncludeTypes: (includeTypes) =>
    set((s) => ({ modal: { ...s.modal, includeTypes } })),
  setModalNeo4jBoilerplate: (neo4jBoilerplate) =>
    set((s) => ({ modal: { ...s.modal, neo4jBoilerplate } })),

  // --- Workspace Actions ---
  addToWorkspace: (chart) =>
    set((s) => ({
      workspace: {
        ...s.workspace,
        charts: [...s.workspace.charts, chart],
        sizes: { ...s.workspace.sizes, [chart.id]: 'auto' },
      },
    })),
  removeFromWorkspace: (id) =>
    set((s) => {
      const { [id]: _size, ...sizes } = s.workspace.sizes;
      const { [id]: _custom, ...customSizes } = s.workspace.customSizes;
      return {
        workspace: {
          ...s.workspace,
          charts: s.workspace.charts.filter((c) => c.id !== id),
          sizes,
          customSizes,
        },
      };
    }),
  setChartSize: (chartId, size) =>
    set((s) => ({
      workspace: {
        ...s.workspace,
        sizes: { ...s.workspace.sizes, [chartId]: size },
      },
    })),
  setChartCustomSize: (chartId, size) =>
    set((s) => ({
      workspace: {
        ...s.workspace,
        customSizes: { ...s.workspace.customSizes, [chartId]: size },
      },
    })),

  // --- Canva Actions ---
  setCanvaConnected: (connected) =>
    set((s) => ({ canva: { ...s.canva, connected } })),
  setUploadStatus: (chartId, status) =>
    set((s) => ({
      canva: {
        ...s.canva,
        uploadStatus: { ...s.canva.uploadStatus, [chartId]: status },
      },
    })),

  // --- Generation Actions ---
  setGenerationPrompt: (prompt) =>
    set((s) => ({ generation: { ...s.generation, prompt } })),
  setGenerationStatus: (status) =>
    set((s) => ({ generation: { ...s.generation, status } })),
  setGenerationJobId: (jobId) =>
    set((s) => ({ generation: { ...s.generation, jobId } })),
  setGenerationResult: (result) =>
    set((s) => ({ generation: { ...s.generation, result, status: 'complete' as const } })),
  setGenerationError: (error, suggestion = null) =>
    set((s) => ({ generation: { ...s.generation, error, suggestion, status: 'failed' as const } })),
  resetGeneration: () =>
    set((s) => ({
      generation: { prompt: '', status: 'idle', jobId: null, result: null, error: null, suggestion: null },
    })),
}));
