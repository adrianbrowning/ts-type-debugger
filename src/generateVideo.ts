/**
 * Main entry point to generate video data from TypeScript AST
 * Usage: node generateVideo.ts
 */

import { CustomTypes } from './base.ts';
import {
  generateAST,
  traceTypeResolution,
  getNodeByName,
} from './astGenerator.ts';
import type {
  VideoData,
  VideoConfig,
} from './videoGenerator.ts';
import {
    generateVideoData,
} from './videoGenerator.ts';
import * as process from 'node:process';
import * as fs from 'node:fs';

/**
 * Generate video data for a specific type
 */
async function generateTypeVideo(
  code: string,
  typeName: string,
  config?: Partial<VideoConfig>
): Promise<VideoData | null> {
  try {
    // Generate AST
    const ast = generateAST(code);

    // Verify the type exists
    const resultNode = getNodeByName(ast, typeName);
    if (!resultNode) {
      console.error(`Type "${typeName}" not found in code`);
      return null;
    }

    // Trace type resolution
    const trace = traceTypeResolution(ast, typeName);
    if (trace.length === 0) {
      console.error(`Failed to trace type "${typeName}"`);
      return null;
    }

    // Generate video data
    const videoData = await generateVideoData(trace, ast, code, config);
    return videoData;
  } catch (error) {
    console.error('Error generating video data:', error);
    return null;
  }
}

/**
 * Format video data for display/export
 */
function formatVideoDataForExport(videoData: VideoData): object {
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

/**
 * Main execution
 */
async function main() {
  const code = 'type _result = "a" extends string ?\n true :\n false;';
  // const code = 'type _result = getter<"Post">;\n' + CustomTypes;

  console.log('Generating type evaluation video...\n');

  // Generate video data
  const videoData = await generateTypeVideo(code, '_result', {
    fps: 30,
    secondsPerStep: 1,
  });

  if (!videoData) {
      console.error('Failed to generate video data');
    process.exit(1);
  }

  // Output summary
  console.log('=== Video Generation Summary ===\n');
  const summary = formatVideoDataForExport(videoData);
  console.dir(summary, { depth: null });

  console.log('\n=== Video Data Generated Successfully ===');
  console.log(`Total Frames: ${videoData.totalFrames}`);
  console.log(`Duration: ${videoData.totalFrames / videoData.fps}s`);
  console.log(`Steps: ${videoData.steps.length}`);
  console.log(`Type Aliases: ${videoData.typeAliases.length}`);

  // Export full data as JSON for use in Remotion
  const exportPath = './video-data.json';
  try {
    // Custom replacer to handle Map serialization
    const replacer = (key: string, value: unknown) => {
      if (value instanceof Map) {
        return Object.fromEntries(value);
      }
      return value;
    };
    fs.writeFileSync(exportPath, JSON.stringify(videoData, replacer, 2));
    console.log(`\n✓ Video data exported to: ${exportPath}`);
    console.log(`\nNext steps:`);
    console.log(`  1. pnpm remotion:preview  (opens browser)`);
    console.log(`  2. pnpm remotion:render   (renders to MP4)`);
  } catch (err) {
    console.error(`Failed to write ${exportPath}:`, err);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
