import { getSingletonHighlighter } from "shiki";
import ts from "typescript";
import type { TraceEntry } from "../astGenerator.ts";
import type {
  VideoData,
  VideoConfig,
  VideoTraceStep,
  TypeInfo
} from "./types.ts";
import { TRACE_TYPE_COLORS } from "./types.ts";

// // Re-export types for backward compatibility
// export type { VideoData, VideoConfig, VideoTraceStep, TypeInfo };
// export { TRACE_TYPE_COLORS };

const DEFAULT_CONFIG: VideoConfig = {
  fps: 30,
  secondsPerStep: 1,
};

type TagParseResult =
  | { type: "line_start"; advance: number; }
  | { type: "open_span"; advance: number; }
  | { type: "close_span"; advance: number; }
  | { type: "content"; advance: number; }
  | { type: "skip"; advance: number; };

/**
 * Parse HTML tag at current position and return type + advance amount
 */
function parseHtmlTag(html: string, pos: number, spanDepth: number): TagParseResult {
  const rest = html.substring(pos);

  if (rest.startsWith("<span class=\"line\">")) {
    return { type: "line_start", advance: "<span class=\"line\">".length };
  }

  if (spanDepth > 0 && rest.startsWith("<span")) {
    return { type: "open_span", advance: 1 };
  }

  if (spanDepth > 0 && rest.startsWith("</span>")) {
    return { type: "close_span", advance: 7 };
  }

  if (spanDepth > 0) {
    return { type: "content", advance: 1 };
  }

  return { type: "skip", advance: 1 };
}

type LineState = {
  lineHtml: string;
  spanDepth: number;
};

/**
 * Accumulate line content based on tag type
 */
function accumulateLineContent(
  state: LineState,
  tagResult: TagParseResult,
  html: string,
  pos: number,
  result: Array<string>
): LineState {
  if (tagResult.type === "line_start") {
    if (state.lineHtml) {
      result.push(state.lineHtml);
    }
    return { lineHtml: "", spanDepth: 1 };
  }

  if (tagResult.type === "open_span") {
    return {
      lineHtml: state.lineHtml + html[pos],
      spanDepth: state.spanDepth + 1,
    };
  }

  if (tagResult.type === "close_span") {
    const newDepth = state.spanDepth - 1;
    const newHtml = newDepth > 0 ? state.lineHtml + html.substring(pos, pos + 7) : state.lineHtml;
    return { lineHtml: newHtml, spanDepth: newDepth };
  }

  if (tagResult.type === "content") {
    return {
      lineHtml: state.lineHtml + html[pos],
      spanDepth: state.spanDepth,
    };
  }

  return state;
}

/**
 * Highlight code lines using Shiki with GitHub Dark theme
 */
async function highlightCodeLines(lines: Array<string>): Promise<Array<string>> {
  try {
    const highlighter = await getSingletonHighlighter({
      themes: [ "github-dark" ],
      langs: [ "typescript" ],
    });

    const code = lines.join("\n");
    const highlighted = highlighter.codeToHtml(code, {
      lang: "typescript",
      theme: "github-dark",
    });

    // Extract code content between <code> tags
    const codeStart = highlighted.indexOf("<code>");
    const codeEnd = highlighted.indexOf("</code>");
    if (codeStart === -1 || codeEnd === -1) {
      return lines;
    }

    const codeHtml = highlighted.substring(codeStart + 6, codeEnd);

    // Parse line spans with proper nesting support
    const result: Array<string> = [];
    let state: LineState = { lineHtml: "", spanDepth: 0 };
    let i = 0;

    while (i < codeHtml.length) {
      const tagResult = parseHtmlTag(codeHtml, i, state.spanDepth);
      state = accumulateLineContent(state, tagResult, codeHtml, i, result);
      i += tagResult.advance;
    }

    // Add final line if any
    if (state.lineHtml) {
      result.push(state.lineHtml);
    }

    return result.length > 0 ? result : lines;
  }
  catch (error) {
    // Fallback to plain text if highlighting fails
    console.warn("Syntax highlighting failed, using plain text:", error);
    return lines;
  }
}

/**
 * Extract type aliases and their source code from AST
 */
async function extractTypeAliases(ast: ts.SourceFile, sourceText: string): Promise<Array<TypeInfo>> {
  const aliases: Array<TypeInfo> = [];
  const lines = sourceText.split("\n");

  function visit(node: ts.Node) {
    if (ts.isTypeAliasDeclaration(node)) {
      const start = sourceText.substring(0, node.getStart(ast)).split("\n").length - 1;
      const end = sourceText.substring(0, node.getEnd()).split("\n").length - 1;
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
    // eslint-disable-next-line no-await-in-loop
    alias.highlightedLines = await highlightCodeLines(alias.lines);
  }

  return aliases;
}

/**
 * Convert trace entries to video steps with timing
 */
function traceToVideoSteps(
  trace: Array<TraceEntry>,
  _ast: ts.SourceFile,
  config: VideoConfig
): Array<VideoTraceStep> {
  const baseFramesPerStep = Math.round(config.fps * config.secondsPerStep);
  const largeScrollThreshold = 30; // lines
  const largeScrollFrames = Math.round(config.fps * 2); // 2 seconds for large scrolls
  const steps: Array<VideoTraceStep> = [];

  let currentFrame = 0;

  trace.forEach((entry, index) => {
    const prevStep = steps[index - 1];
    const color = TRACE_TYPE_COLORS[entry.type];
    const isHighlight = !!entry.position;

    // Calculate highlight lines first to determine scroll distance
    let highlightLines: VideoTraceStep["highlightLines"];
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
  const match = /^type\s+(\w+)\s*=/.exec(expression);
  return (match ? match[1] : null) ?? null;
}

/**
 * Extract type name from generic_def expression
 * Pattern: "type getter<path = ""> = ..." or "type validateLeafPath<...> = ..."
 */
function extractTypeNameFromDef(expression: string): string | null {
  const match = /^type\s+(\w+)</.exec(expression);
  return (match ? match[1] : null) ?? null;
}

/**
 * Extract type name from a step based on its type
 */
function extractTypeNameFromStep(step: VideoTraceStep): string | null {
  if (step.original.type === "type_alias_start") {
    return extractTypeNameFromAliasStart(step.original.expression);
  }
  if (step.original.type === "generic_def") {
    return extractTypeNameFromDef(step.original.expression);
  }
  return null;
}

/**
 * Check if highlight is outside the bounds of the active type
 */
function isHighlightOutOfBounds(
  step: VideoTraceStep,
  activeType: TypeInfo | null
): boolean {
  if (!step.highlightLines || !activeType) return false;
  return (
    step.highlightLines.start < activeType.startLine ||
    step.highlightLines.start > activeType.endLine
  );
}

/**
 * Build a map of step index -> active type definition
 * Uses a context stack to track which type we're currently evaluating
 */
export function buildActiveTypeMap(
  steps: Array<VideoTraceStep>,
  typeAliases: Array<TypeInfo>
): Map<number, TypeInfo | null> {
  const map = new Map<number, TypeInfo | null>();
  const contextStack: Array<TypeInfo> = [];

  // First, create a map of type names to TypeInfo for quick lookup
  const typesByName = new Map<string, TypeInfo>();
  typeAliases.forEach(t => typesByName.set(t.name, t));

  steps.forEach(step => {
    // Handle context push/pop based on step type
    const typeName = extractTypeNameFromStep(step);
    if (typeName && typesByName.has(typeName)) {
      const typeInfo = typesByName.get(typeName)!;
      contextStack.push(typeInfo);
    }
    else if (step.original.type === "generic_result") {
      // Pop context when returning from a generic type evaluation
      if (contextStack.length > 1) {
        contextStack.pop();
      }
    }

    // Determine active type for this step
    let activeType = contextStack.length > 0 ? (contextStack[contextStack.length - 1] ?? null) : null;

    // If highlight is outside the current active type, find the type containing it
    if (isHighlightOutOfBounds(step, activeType)) {
      // Search for a type that contains the highlight
      const typeContainingHighlight = typeAliases.find(t =>
        step.highlightLines!.start >= t.startLine && step.highlightLines!.start <= t.endLine
      );
      if (typeContainingHighlight) {
        activeType = typeContainingHighlight;
      }
    }

    map.set(step.stepIndex, activeType ?? null);
  });

  return map;
}

/**
 * Main entry point: convert trace and AST to video data
 */
export async function generateVideoData(
  trace: Array<TraceEntry>,
  ast: ts.SourceFile,
  sourceText: string,
  config: Partial<VideoConfig> = {}
): Promise<VideoData> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const steps = traceToVideoSteps(trace, ast, finalConfig);

  // Calculate total frames from actual step durations (which may vary based on scroll distance)
  const totalFrames = steps.length > 0 ? (steps[steps.length - 1]?.endFrame ?? 0) : 0;

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
export function getReferencedTypes(trace: Array<TraceEntry>): Set<string> {
  const types = new Set<string>();

  trace.forEach(entry => {
    // Extract type names from expressions like "getter<...>" or "validateLeafPath<...>"
    const typeMatch = entry.expression.match(/(\w+)<[^>]*>/g);
    if (typeMatch) {
      typeMatch.forEach(match => {
        const typeName = match.split("<")[0];
        if (typeName) {
          types.add(typeName);
        }
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
  typeAliases: Array<TypeInfo>
): TypeInfo | undefined {
  // Heuristic: look for type name in the step expression
  const typeMatch = /^(\w+)</.exec(step.original.expression);
  if (!typeMatch) return undefined;

  const typeName = typeMatch[1];
  return typeAliases.find(t => t.name === typeName);
}

/**
 * Format result for display
 */
export function formatResult(step: VideoTraceStep): string {
  return step.original.result || "";
}

/**
 * Format parameters for display
 */
export function formatParameters(step: VideoTraceStep): Record<string, string> {
  return step.original.parameters || {};
}
