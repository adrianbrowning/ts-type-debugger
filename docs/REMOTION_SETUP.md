# TypeScript Type Evaluation Video Generator

Convert TypeScript type evaluation traces into animated Remotion videos showing step-by-step type resolution.

## What Was Created

### Core Components

1. **`videoGenerator.ts`** - Data transformation layer
   - Converts trace entries into video-ready data with timing/visual metadata
   - Extracts relevant type aliases and source locations
   - Maps source positions to video frames
   - 1 second per step (configurable)

2. **`remotion/Composition.tsx`** - Main video composition
   - 2-column layout: code panel (left) + results panel (right)
   - Progress bar and frame counter at bottom
   - Real-time step tracking

3. **`remotion/CodePanel.tsx`** - Left panel
   - Shows extracted type alias source code
   - Animated gold highlight box that moves over current evaluation location
   - Displays type name and line numbers

4. **`remotion/ResultsPanel.tsx`** - Right panel
   - Current step number and type badge
   - Expression being evaluated
   - Parameters in scope (color-coded)
   - Intermediate results (green)
   - Arguments passed to generics (amber)

5. **`remotion/config.ts`** - Configuration
   - Layout dimensions (1920x1080)
   - Color scheme for trace types
   - Animation frame counts

6. **`generateVideo.ts`** - Entry point
   - Generates video data from AST and trace
   - Outputs summary statistics
   - Ready for Remotion composition

## Setup Instructions

### 1. Install Remotion

```bash
pnpm install remotion @remotion/cli @remotion/player
```

### 2. Create Remotion Project Structure

If not already done, create these directories:

```bash
mkdir -p remotion
# Files already created:
# - remotion/Composition.tsx
# - remotion/CodePanel.tsx
# - remotion/ResultsPanel.tsx
# - remotion/config.ts
# - remotion/index.ts
```

### 3. Generate Video Data

```bash
node generateVideo.ts
```

Output: Video metadata showing 93 steps, 1920x1080 resolution, ~93 seconds duration.

### 4. Create Remotion Root

Create `remotion.config.ts` in project root:

```typescript
import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('png');
Config.setX264Preset('slow'); // H.264 encoding preset
Config.setNumberOfGifLoops(null);
Config.setConcurrency(4);
Config.setPixelFormat('yuv420p');
```

### 5. Create Main Entry (`Root.tsx`)

```typescript
import React from 'react';
import { Composition } from './remotion/index';
import { generateVideoData } from './videoGenerator';
import { generateAST, traceTypeResolution } from './astGenerator';
import { CustomTypes } from './base';
import { LAYOUT, VIDEO_CONFIG } from './remotion/config';

export const RemotionRoot: React.FC = () => {
  const code = 'type _result = getter<"">;\n' + CustomTypes;
  const ast = generateAST(code);
  const trace = traceTypeResolution(ast, '_result');
  const videoData = generateVideoData(trace, ast, code, VIDEO_CONFIG);

  return (
    <Composition
      key="type-evaluation-video"
      component={Composition}
      id="TypeEvalVideo"
      from={0}
      durationInFrames={videoData.totalFrames}
      fps={videoData.fps}
      width={LAYOUT.width}
      height={LAYOUT.height}
      defaultProps={{ videoData }}
    />
  );
};
```

### 6. Render Video

**Preview in player:**
```bash
pnpm remotion preview Root.tsx --fps 30
```

**Render to MP4:**
```bash
pnpm remotion render Root.tsx TypeEvalVideo output.mp4 --fps 30
```

**Render to GIF:**
```bash
pnpm remotion render Root.tsx TypeEvalVideo output.gif --fps 30 --image-format jpeg
```

## Architecture

### Data Flow

```
astGenerator.ts (trace data)
         ↓
generateVideoData() (add timing/visual metadata)
         ↓
VideoData {
  steps: VideoTraceStep[]
  typeAliases: TypeInfo[]
  totalFrames: number
}
         ↓
Composition (main layout)
         ├─→ CodePanel (left)
         └─→ ResultsPanel (right)
```

### Key Types

```typescript
interface VideoTraceStep {
  original: TraceEntry;           // Original trace entry
  stepIndex: number;              // 0-indexed step
  startFrame: number;             // Start frame for this step
  duration: number;               // Duration in frames
  endFrame: number;               // End frame
  color: string;                  // Hex color for trace type
  isHighlight: boolean;           // Has source location
  highlightLines?: {
    start: number;                // Line to highlight
    end: number;
    chars?: { start: number; end: number };
  };
}

interface VideoData {
  totalFrames: number;            // Total video frames
  fps: number;                    // Frames per second
  steps: VideoTraceStep[];        // All evaluation steps
  typeAliases: TypeInfo[];        // Extracted types
  sourceCode: string;             // Full source
}
```

## Customization

### Change Seconds Per Step

Modify in `generateVideo.ts`:
```typescript
const videoData = generateVideoData(trace, ast, code, {
  fps: 30,
  secondsPerStep: 2,  // 2 seconds per step instead of 1
});
```

### Change Video Resolution

Edit `remotion/config.ts`:
```typescript
export const LAYOUT = {
  width: 2560,  // 2.5K
  height: 1440,
  // ...
};
```

### Change Color Scheme

Edit `remotion/config.ts` `TRACE_TYPE_COLORS`:
```typescript
export const TRACE_TYPE_COLORS = {
  generic_call: '#YOUR_COLOR',
  // ...
};
```

## Output

- **93 steps** of type evaluation
- **2790 frames** at 30fps
- **93 seconds** total duration
- Shows type name, parameters in scope, intermediate results
- Animated highlight following code evaluation

## What It Visualizes

Each step shows:
1. **Code location** - Animated highlight in left panel
2. **Active type** - Current type alias being evaluated
3. **Step metadata** - Trace type (condition, generic_call, etc.)
4. **Parameters** - Current type parameter bindings
5. **Expression** - Full expression text
6. **Result** - Intermediate evaluation result

Example flow visible in video:
```
Step 1: Generic call getter<"">
  ↓ (evaluates body of getter)
Step 2-3: Conditional type evaluation (extends check)
  ↓ (follows false branch)
Step 8-9: Nested generic call validateLeafPath<tables, "">
  ↓ (more nested conditionals)
Step 20-21: Another nested generic getSuggestions
  ↓ (mapped type iteration)
...eventually...
Step 93: Final result "User" | "Post"
```

## Files Reference

```
/remotion/
├── Composition.tsx          # Main layout, 2-column view
├── CodePanel.tsx            # Left: code with highlight
├── ResultsPanel.tsx         # Right: step info
├── config.ts                # Layout & colors
└── index.ts                 # Exports

videoGenerator.ts            # Data transformation
generateVideo.ts             # CLI entry point
astGenerator.ts              # (existing) AST generation
```

## Troubleshooting

**TypeScript errors on import?**
- Ensure tsconfig has `allowImportingTsExtensions: true`
- Run with Node v18+

**Remotion player shows blank?**
- Verify `VideoData` is properly passed as props
- Check browser console for errors

**Video too fast/slow?**
- Adjust `secondsPerStep` in `generateVideo.ts`
- Adjust `fps` in config

**Highlight not moving correctly?**
- Verify `highlightLines` values in trace data
- Check line number calculations (0-indexed vs 1-indexed)
