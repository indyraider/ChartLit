/**
 * PRD §9.1 — Code Generation Orchestrator
 * Composable code generation: chart base code + effect wrapper injection + framework transformation.
 */

import type {
  Framework, TemplateMetadata, EffectPreset,
  CodeGenerationResponse, PaletteName,
} from '@/types/template';
import { SAMPLE_DATA, GRAPH_SAMPLE_DATA } from '@/lib/sample-data';
import { isGraphType } from '@/lib/chart-loader';
import { generateReactChartCode } from './chart-templates';
import { generateEffectCode } from './effect-templates';
import { adaptToFramework } from './framework-adapters';
import { buildDependencyManifest } from './dependency-registry';

export interface CodeGenOptions {
  template: TemplateMetadata;
  framework: Framework;
  includeEffects: boolean;
  includeTypes: boolean;
  palette?: PaletteName;
  effect?: EffectPreset | null;
  effectIntensity?: number;
  neo4jBoilerplate?: boolean;
}

/**
 * Generate a complete code response for a template.
 * Steps:
 *   1. Resolve sample data inline string
 *   2. Generate React chart code
 *   3. Inject effect wrapper (if includeEffects)
 *   4. Inject Neo4j boilerplate (if graph type + neo4jBoilerplate)
 *   5. Transform to target framework
 *   6. Build dependency manifest
 */
export function generateCode(opts: CodeGenOptions): CodeGenerationResponse {
  const {
    template, framework, includeEffects, includeTypes,
    palette = template.palette,
    effect = template.effect,
    effectIntensity = template.effectConfig?.intensity ?? 75,
    neo4jBoilerplate = template.neo4jBoilerplate,
  } = opts;

  // 1. Resolve sample data
  const isGraph = isGraphType(template.chartType);
  const rawData = isGraph
    ? GRAPH_SAMPLE_DATA[template.dataKey]
    : SAMPLE_DATA[template.dataKey];
  const sampleDataInline = JSON.stringify(rawData ?? [], null, 2);

  // 2. Generate component name from template title
  const componentName = template.title.replace(/[^a-zA-Z0-9]/g, '') || 'Chart';

  // 3. Generate React chart code
  let reactCode = generateReactChartCode({
    library: template.library,
    chartType: template.chartType,
    palette,
    config: template.config,
    componentName,
    dataKey: template.dataKey,
    sampleDataInline,
  });

  // 4. Inject effect wrapper if requested
  if (includeEffects && effect && effect !== 'none') {
    const effectCode = generateEffectCode(effect, effectIntensity);
    if (effectCode) {
      // Add effect import if any
      if (effectCode.wrapperImport) {
        const importEnd = reactCode.lastIndexOf('\nimport');
        if (importEnd >= 0) {
          const nextNewline = reactCode.indexOf('\n', importEnd + 1);
          reactCode = reactCode.slice(0, nextNewline + 1)
            + effectCode.wrapperImport + '\n'
            + reactCode.slice(nextNewline + 1);
        } else {
          reactCode = effectCode.wrapperImport + '\n' + reactCode;
        }
      }

      // Add helper code (e.g., starfield canvas ref + useEffect)
      if (effectCode.helperCode) {
        // Insert before the return statement
        const returnIdx = reactCode.lastIndexOf('  return (');
        if (returnIdx >= 0) {
          reactCode = reactCode.slice(0, returnIdx)
            + effectCode.helperCode + '\n\n'
            + reactCode.slice(returnIdx);
        }
      }

      // Wrap the chart render output
      const innerStart = reactCode.indexOf('    <div style=');
      if (innerStart >= 0) {
        // Find matching closing tag
        reactCode = reactCode.replace(
          /(\s+return \(\n)/,
          `$1${effectCode.wrapperOpen}\n`
        );
        // Add wrapper close before the last closing paren
        const lastClose = reactCode.lastIndexOf('  );');
        if (lastClose >= 0) {
          reactCode = reactCode.slice(0, lastClose)
            + effectCode.wrapperClose + '\n'
            + reactCode.slice(lastClose);
        }
      }
    }
  }

  // 5. Inject Neo4j boilerplate for graph templates
  if (isGraph && neo4jBoilerplate) {
    const neo4jCode = generateNeo4jBoilerplate(componentName);
    // Append after the component
    reactCode += '\n' + neo4jCode;
  }

  // 6. Add TypeScript types if requested
  if (includeTypes && framework === 'react') {
    reactCode = addTypeAnnotations(reactCode, template);
  }

  // 7. Transform to target framework
  const { code, language } = adaptToFramework(framework, {
    componentName,
    library: template.library,
    chartType: template.chartType,
    palette,
    sampleDataInline,
    reactCode,
  });

  // 8. Build dependency manifest
  const dependencies = buildDependencyManifest(
    template.library,
    framework,
    includeEffects && !!effect && effect !== 'none',
    includeTypes,
    effect ?? null,
    template.chartType,
  );

  return {
    code,
    language: (includeTypes && framework === 'react' ? 'tsx' : language) as CodeGenerationResponse['language'],
    dependencies,
  };
}

// ---- Neo4j Boilerplate ----

function generateNeo4jBoilerplate(componentName: string): string {
  return `// --- Neo4j Connection Boilerplate ---
// npm install neo4j-driver

import neo4j from 'neo4j-driver';

/**
 * Fetch graph data from a Neo4j database.
 * Replace the connection URI, credentials, and Cypher query.
 */
export async function fetchGraphData() {
  const driver = neo4j.driver(
    'neo4j://localhost:7687',
    neo4j.auth.basic('neo4j', 'password')
  );

  const session = driver.session();
  try {
    const result = await session.run(
      'MATCH (n)-[r]->(m) RETURN n, r, m LIMIT 100'
    );

    const nodes = new Map();
    const edges = [];

    result.records.forEach((record) => {
      const n = record.get('n');
      const m = record.get('m');
      const r = record.get('r');

      if (!nodes.has(n.identity.toString())) {
        nodes.set(n.identity.toString(), {
          id: n.identity.toString(),
          label: n.properties.name ?? n.identity.toString(),
          group: n.labels[0] ?? 'default',
        });
      }
      if (!nodes.has(m.identity.toString())) {
        nodes.set(m.identity.toString(), {
          id: m.identity.toString(),
          label: m.properties.name ?? m.identity.toString(),
          group: m.labels[0] ?? 'default',
        });
      }

      edges.push({
        source: n.identity.toString(),
        target: m.identity.toString(),
        label: r.type,
      });
    });

    return { nodes: Array.from(nodes.values()), edges };
  } finally {
    await session.close();
    await driver.close();
  }
}

// Usage with ${componentName}:
// const data = await fetchGraphData();
// Pass data.nodes and data.edges to your graph component.
`;
}

// ---- TypeScript Annotations ----

function addTypeAnnotations(code: string, template: TemplateMetadata): string {
  const isGraph = isGraphType(template.chartType);

  const typeBlock = isGraph
    ? `
interface GraphNode {
  id: string;
  label?: string;
  group?: string;
  [key: string]: unknown;
}

interface GraphEdge {
  source: string;
  target: string;
  label?: string;
  weight?: number;
  [key: string]: unknown;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}
`
    : `
interface DataPoint {
  [key: string]: string | number;
}
`;

  // Insert type block after the last import
  const lastImportIdx = code.lastIndexOf('import ');
  if (lastImportIdx >= 0) {
    const endOfImportLine = code.indexOf('\n', lastImportIdx);
    // Find end of import block (next blank line after imports)
    let insertPos = endOfImportLine + 1;
    while (insertPos < code.length && code[insertPos] !== '\n') {
      const nextNewline = code.indexOf('\n', insertPos);
      if (nextNewline < 0) break;
      if (code.slice(insertPos, nextNewline).startsWith('import ')) {
        insertPos = nextNewline + 1;
      } else {
        break;
      }
    }
    code = code.slice(0, insertPos) + typeBlock + code.slice(insertPos);
  }

  return code;
}
