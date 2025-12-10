/**
 * Core type debugging logic shared between CLI and web app
 */

import {
  generateAST,
  traceTypeResolution,
  getNodeByName,
} from '../astGenerator.ts';
import { generateVideoData } from '../videoGenerator.ts';
import type { VideoData, VideoConfig } from './types.ts';

/**
 * Generate video data for a specific type
 * This is the main entry point for both CLI and web app
 */
export async function generateTypeVideo(
  code: string,
  typeName: string,
  config?: Partial<VideoConfig>
): Promise<VideoData | null> {
  try {
    // Validate: reject inputs starting with 'type X ='
    const typeKeywordPattern = /^\s*type\s+\w+\s*=/i;
    if (typeKeywordPattern.test(typeName)) {
      return null;
    }

    // Always wrap the user input in a temporary type alias for evaluation
    const actualTypeName = '__EvalTarget__';
    const cleanTypeName = typeName.trim().replace(/;+$/, '').trim();
    const modifiedCode = `type ${actualTypeName} = ${cleanTypeName};\n${code}`;

    // Generate AST
    const ast = generateAST(modifiedCode);

    // Verify the wrapped type exists
    const resultNode = getNodeByName(ast, actualTypeName);
    if (!resultNode) {
      throw new Error(`Failed to evaluate type expression: "${typeName}"`);
    }

    // Trace type resolution
    const trace = traceTypeResolution(ast, actualTypeName);
    if (trace.length === 0) {
      throw new Error(`Failed to trace type expression: "${typeName}"`);
    }

    // Generate video data (use modified code for consistent source)
    const videoData = await generateVideoData(trace, ast, modifiedCode, config);
    return videoData;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to generate video data: ${message}`);
  }
}

/**
 * Format video data for display/export
 */
export function formatVideoDataForExport(videoData: VideoData): object {
  return {
    metadata: {
      fps: videoData.fps,
      totalFrames: videoData.totalFrames,
      durationSeconds: videoData.totalFrames / videoData.fps,
      totalSteps: videoData.steps.length,
    },
    typeAliases: videoData.typeAliases.map((t) => ({
      name: t.name,
      lines: { start: t.startLine + 1, end: t.endLine + 1 },
    })),
    stepsSummary: videoData.steps.map((step, idx) => ({
      index: idx,
      step: step.original.step,
      type: step.original.type,
      expression: step.original.expression.substring(0, 80),
      hasResult: !!step.original.result,
      color: step.color,
      frames: { start: step.startFrame, end: step.endFrame },
    })),
  };
}
