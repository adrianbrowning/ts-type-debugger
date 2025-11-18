/**
 * CLI entry point to generate video data from TypeScript AST
 * Usage: node generateVideo.ts
 */

import {
  generateTypeVideo,
  formatVideoDataForExport,
} from './core/typeDebugger.ts';
import * as process from 'node:process';
import {CustomTypes} from "./base.ts";

/**
 * Main execution
 */
export async function generateVideoData() {
  // const code = 'type _result = "a" extends string ?\n true :\n false;';
  const code = 'type _result = getter<"Post">;\n' + CustomTypes;

  console.log('Generating type evaluation video...\n');

  try {
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
    // const exportPath = './video-data.json';
    // Custom replacer to handle Map serialization
    // const replacer = (key: string, value: unknown) => {
    //   if (value instanceof Map) {
    //     return Object.fromEntries(value);
    //   }
    //   return value;
    // };
    // fs.writeFileSync(exportPath, JSON.stringify(videoData, replacer, 2));
    // console.log(`\n✓ Video data exported to: ${exportPath}`);
    // console.log(`\nNext steps:`);
    // console.log(`  1. pnpm remotion:preview  (opens browser)`);
    // console.log(`  2. pnpm remotion:render   (renders to MP4)`);
      return videoData;
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

