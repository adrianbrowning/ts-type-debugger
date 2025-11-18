import ts from 'typescript';
import type { TraceEntry } from './astGenerator.ts';
import { getSingletonHighlighter } from 'shiki';
import type {
  VideoData,
  VideoConfig,
  VideoTraceStep,
  TypeInfo,
} from './core/types.ts';
import { TRACE_TYPE_COLORS } from './core/types.ts';

// Re-export types for backward compatibility
export type { VideoData, VideoConfig, VideoTraceStep, TypeInfo };
export { TRACE_TYPE_COLORS };

const DEFAULT_CONFIG: VideoConfig = {
  fps: 30,
  secondsPerStep: 1,
};

/**
 * Highlight code lines using Shiki with GitHub Dark theme
 */
async function highlightCodeLines(lines: string[]): Promise<string[]> {
  try {
    const highlighter = await getSingletonHighlighter({
      themes: ['github-dark'],
      langs: ['typescript'],
    });

    const code = lines.join('\n');
    const highlighted = await highlighter.codeToHtml(code, {
      lang: 'typescript',
      theme: 'github-dark',
    });

    // Extract code content between <code> tags
    const codeStart = highlighted.indexOf('<code>');
    const codeEnd = highlighted.indexOf('</code>');
    if (codeStart === -1 || codeEnd === -1) {
      return lines;
    }

    const codeHtml = highlighted.substring(codeStart + 6, codeEnd);

    // Parse line spans with proper nesting support
    const result: string[] = [];
    let lineHtml = '';
    let spanDepth = 0;
    let i = 0;

    while (i < codeHtml.length) {
      const rest = codeHtml.substring(i);

      // Start of a new line
      if (rest.startsWith('<span class="line">')) {
        if (lineHtml) {
          result.push(lineHtml);
        }
        lineHtml = '';
        spanDepth = 1;
        i += '<span class="line">'.length;
      }
      // Opening span (nested)
      else if (spanDepth > 0 && rest.startsWith('<span')) {
        spanDepth++;
        lineHtml += codeHtml[i];
        i++;
      }
      // Closing span
      else if (spanDepth > 0 && rest.startsWith('</span>')) {
        spanDepth--;
        if (spanDepth > 0) {
          lineHtml += codeHtml.substring(i, i + 7);
        }
        i += 7;
      }
      // Regular content
      else if (spanDepth > 0) {
        lineHtml += codeHtml[i];
        i++;
      } else {
        i++;
      }
    }

    // Add final line if any
    if (lineHtml) {
      result.push(lineHtml);
    }

    return result.length > 0 ? result : lines;
  } catch (error) {
    // Fallback to plain text if highlighting fails
    console.warn('Syntax highlighting failed, using plain text:', error);
    return lines;
  }
}

/**
 * Extract type aliases and their source code from AST
 */
async function extractTypeAliases(ast: ts.SourceFile, sourceText: string): Promise<TypeInfo[]> {
  const aliases: TypeInfo[] = [];
  const lines = sourceText.split('\n');

  function visit(node: ts.Node) {
    if (ts.isTypeAliasDeclaration(node)) {
      const start = sourceText.substring(0, node.getStart(ast)).split('\n').length - 1;
      const end = sourceText.substring(0, node.getEnd()).split('\n').length - 1;
      const typeLines = lines.slice(start, end + 1);

      aliases.push({
        name: node.name.text,
        text: node.getText(ast),
        lines: typeLines,
        startLine: start,
        endLine: end,
      });
    }

    ts.forEachChild(node, visit);
  }

  visit(ast);

  // Add syntax highlighting to each type alias
  for (const alias of aliases) {
    alias.highlightedLines = await highlightCodeLines(alias.lines);
  }

  return aliases;
}

/**
 * Calculate the line distance between two steps for scroll detection
 */
function getScrollDistance(
  prevStep: VideoTraceStep | undefined,
  currStep: VideoTraceStep
): number {
  if (!prevStep?.highlightLines || !currStep.highlightLines) {
    return 0;
  }

  return Math.abs(currStep.highlightLines.start - prevStep.highlightLines.start);
}

/**
 * Convert trace entries to video steps with timing
 */
function traceToVideoSteps(
  trace: TraceEntry[],
  ast: ts.SourceFile,
  config: VideoConfig
): VideoTraceStep[] {
  const baseFramesPerStep = Math.round(config.fps * config.secondsPerStep);
  const largeScrollThreshold = 30; // lines
  const largeScrollFrames = Math.round(config.fps * 2); // 2 seconds for large scrolls
  const steps: VideoTraceStep[] = [];

  let currentFrame = 0;

  trace.forEach((entry, index) => {
    const prevStep = steps[index - 1];
    const color = TRACE_TYPE_COLORS[entry.type];
    const isHighlight = !!entry.position;

    // Calculate highlight lines first to determine scroll distance
    let highlightLines: VideoTraceStep['highlightLines'];
    if (entry.position) {
      highlightLines = {
        start: entry.position.start.line - 1, // Convert from 1-indexed to 0-indexed
        end: entry.position.end.line - 1,
        // Only include char-level positioning for single-line highlights
        // Multi-line highlights use full-width box
        ...(entry.position.start.line === entry.position.end.line && {
          chars: {
            start: entry.position.start.character,
            end: entry.position.end.character,
          },
        }),
      };
    }

    // Calculate scroll distance from previous step
    let scrollDistance = 0;
    if (prevStep?.highlightLines && highlightLines) {
      scrollDistance = Math.abs(highlightLines.start - prevStep.highlightLines.start);
    }

    // Determine frame duration based on scroll distance
    const isLargeScroll = scrollDistance > largeScrollThreshold && entry.position;
    const frameDuration = isLargeScroll ? largeScrollFrames : baseFramesPerStep;

    const startFrame = currentFrame;
    const endFrame = startFrame + frameDuration;

    const videoStep: VideoTraceStep = {
      original: entry,
      stepIndex: index,
      startFrame,
      duration: frameDuration,
      endFrame,
      color,
      isHighlight,
      highlightLines,
    };

    steps.push(videoStep);
    currentFrame = endFrame;
  });

  return steps;
}

/**
 * Extract type name from type_alias_start expression
 * Pattern: "type _result = ..." or "type SomeName = ..."
 */
function extractTypeNameFromAliasStart(expression: string): string | null {
  const match = expression.match(/^type\s+(\w+)\s*=/);
  return match ? match[1] : null;
}

/**
 * Extract type name from generic_def expression
 * Pattern: "type getter<path = ""> = ..." or "type validateLeafPath<...> = ..."
 */
function extractTypeNameFromDef(expression: string): string | null {
  const match = expression.match(/^type\s+(\w+)</);
  return match ? match[1] : null;
}

/**
 * Build a map of step index -> active type definition
 * Uses a context stack to track which type we're currently evaluating
 */
export function buildActiveTypeMap(
  steps: VideoTraceStep[],
  typeAliases: TypeInfo[]
): Map<number, TypeInfo | null> {
  const map = new Map<number, TypeInfo | null>();
  const contextStack: TypeInfo[] = [];

  // First, create a map of type names to TypeInfo for quick lookup
  const typesByName = new Map<string, TypeInfo>();
  typeAliases.forEach((t) => typesByName.set(t.name, t));

  steps.forEach((step) => {
    // Handle context push/pop based on step type
    if (step.original.type === 'type_alias_start') {
      // Extract type name from "type _result = ..." pattern
      const typeName = extractTypeNameFromAliasStart(step.original.expression);
      if (typeName && typesByName.has(typeName)) {
        const typeInfo = typesByName.get(typeName)!;
        contextStack.push(typeInfo);
      }
    } else if (step.original.type === 'generic_def') {
      // Extract type name from "type <name><...> = ..." pattern
      const typeName = extractTypeNameFromDef(step.original.expression);
      if (typeName && typesByName.has(typeName)) {
        const typeInfo = typesByName.get(typeName)!;
        contextStack.push(typeInfo);
      }
    } else if (step.original.type === 'generic_result') {
      // Pop context when returning from a generic type evaluation
      if (contextStack.length > 1) {
        contextStack.pop();
      }
    }

    // Determine active type for this step
    let activeType = contextStack.length > 0 ? contextStack[contextStack.length - 1] : null;

    // If highlight is outside the current active type, find the type containing it
    if (step.highlightLines && activeType && (
      step.highlightLines.start < activeType.startLine ||
      step.highlightLines.start > activeType.endLine
    )) {
      // Search for a type that contains the highlight
      const typeContainingHighlight = typeAliases.find((t) =>
        step.highlightLines!.start >= t.startLine && step.highlightLines!.start <= t.endLine
      );
      if (typeContainingHighlight) {
        activeType = typeContainingHighlight;
      }
    }

    map.set(step.stepIndex, activeType);
  });

  return map;
}

/**
 * Main entry point: convert trace and AST to video data
 */
export async function generateVideoData(
  trace: TraceEntry[],
  ast: ts.SourceFile,
  sourceText: string,
  config: Partial<VideoConfig> = {}
): Promise<VideoData> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const steps = traceToVideoSteps(trace, ast, finalConfig);

  // Calculate total frames from actual step durations (which may vary based on scroll distance)
  const totalFrames = steps.length > 0 ? steps[steps.length - 1].endFrame : 0;

  const typeAliases = await extractTypeAliases(ast, sourceText);
  const activeTypeMap = buildActiveTypeMap(steps, typeAliases);

  return {
    totalFrames,
    fps: finalConfig.fps,
    steps,
    typeAliases,
    sourceCode: sourceText,
    activeTypeMap,
  };
}

/**
 * Get all unique type names referenced in trace
 */
export function getReferencedTypes(trace: TraceEntry[]): Set<string> {
  const types = new Set<string>();

  trace.forEach((entry) => {
    // Extract type names from expressions like "getter<...>" or "validateLeafPath<...>"
    const typeMatch = entry.expression.match(/(\w+)<[^>]*>/g);
    if (typeMatch) {
      typeMatch.forEach((match) => {
        const typeName = match.split('<')[0];
        types.add(typeName);
      });
    }
  });

  return types;
}

/**
 * Find the active type alias for a given step
 */
export function findActiveTypeAlias(
  step: VideoTraceStep,
  typeAliases: TypeInfo[]
): TypeInfo | undefined {
  // Heuristic: look for type name in the step expression
  const typeMatch = step.original.expression.match(/^(\w+)</);
  if (!typeMatch) return undefined;

  const typeName = typeMatch[1];
  return typeAliases.find((t) => t.name === typeName);
}

/**
 * Format result for display
 */
export function formatResult(step: VideoTraceStep): string {
  if (!step.original.result) return '';

  // Truncate very long results
  const maxLen = 100;
  if (step.original.result.length > maxLen) {
    return step.original.result.substring(0, maxLen) + '...';
  }

  return step.original.result;
}

/**
 * Format parameters for display
 */
export function formatParameters(step: VideoTraceStep): Record<string, string> {
  return step.original.parameters || {};
}
