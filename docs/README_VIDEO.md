# TypeScript Type Evaluation Video Generator

Convert your TypeScript type evaluation traces into beautiful, animated videos showing exactly how complex types are resolved step-by-step.

## Overview

This system uses your existing AST parser and trace generator to create videos that visualize type evaluation with:
- **Side-by-side layout**: Code on left, evaluation results on right
- **Animated highlighting**: Gold highlight box follows evaluation through code
- **Real-time parameters**: Shows current type variable bindings at each step
- **Trace visualization**: 93 steps, 93 seconds of animation
- **Production quality**: 1920×1080, 30fps MP4/GIF export

## Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Generate video data
pnpm generate-video

# 3. Preview (opens browser)
pnpm remotion:preview

# 4. Render to MP4
pnpm remotion:render
```

That's it! Video will be saved as `output.mp4`.

## What You Get

### The Video Shows

Watch the complete evaluation of `type _result = getter<"">`:

1. **Generic type call** to `getter` with empty string
2. **Conditional type checks** (extends clauses)
3. **Nested generics** with parameter substitution
4. **Mapped types** with key iteration
5. **Template literals** in type strings
6. **Final result** `"User" | "Post"`

### Visual Components

**Left Panel (Code)**
- Relevant type aliases extracted from source
- Current type highlighted in gold box
- Box animates to follow code being evaluated

**Right Panel (Results)**
- Step number and trace type (generic_call, condition, etc.)
- Full expression text
- **Parameters in Scope** (blue) - current type variable bindings
- **Result** (green) - intermediate evaluation result
- **Arguments** (amber) - generic type arguments

**Bottom**
- Progress bar and frame counter

## Files Created

### Implementation
- `videoGenerator.ts` - Data transformation (trace → video data)
- `remotion/Composition.tsx` - Main layout
- `remotion/CodePanel.tsx` - Code display with highlight
- `remotion/ResultsPanel.tsx` - Step information panel
- `remotion/config.ts` - Styling and configuration
- `Root.tsx` - Remotion entry point
- `remotion.config.ts` - FFmpeg settings

### Utilities
- `generateVideo.ts` - CLI to generate video data
- `validate-setup.ts` - Verify setup is complete

### Documentation
- `QUICK_START.md` - 1-minute setup
- `REMOTION_SETUP.md` - Detailed configuration
- `VIDEO_GENERATOR_SUMMARY.md` - Complete reference
- `README_VIDEO.md` - This file

## Customization

### Change Animation Speed

Edit `Root.tsx`:
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
  width: 2560,  // 4K
  height: 1440,
  // ...
};
```

### Change Colors

Edit `remotion/config.ts`:
```typescript
export const COLORS = {
  background: '#YOUR_COLOR',
  text: '#YOUR_COLOR',
  // ...
};
```

### Visualize a Different Type

Edit `Root.tsx`:
```typescript
const code = 'type MyType = SomeGeneric<Arg>;\n' + CustomTypes;
// ...
const trace = traceTypeResolution(ast, 'MyType');
```

## Commands

```bash
# Generate video data (required first)
pnpm generate-video

# Preview in browser (interactive, real-time)
pnpm remotion:preview

# Render to MP4
pnpm remotion:render

# Render to GIF
pnpm remotion render Root.tsx TypeEvalVideo output.gif --fps 30 --image-format jpeg

# Render with custom settings
pnpm remotion render Root.tsx TypeEvalVideo output.mp4 --fps 60 --codec h264 --concurrency 2
```

## Output Formats

| Format | Command | Notes |
|--------|---------|-------|
| MP4 | `npm run remotion:render` | Default, widely supported |
| GIF | `npx remotion render ... --image-format jpeg` | Good for web, larger file |
| WebM | `--codec vp9` | Modern browsers, smaller file |
| ProRes | `--codec prores` | Professional, larger file |

## How It Works

```
Type Evaluation Trace (93 steps)
    ↓
videoGenerator.ts
    ↓
VideoData {
  steps: VideoTraceStep[]
  typeAliases: TypeInfo[]
  totalFrames: 2790
  fps: 30
}
    ↓
React Components (Remotion)
    ↓
MP4/GIF/WebM Video
```

### Data Flow

1. **AST Generation** (`astGenerator.ts`) - Parse TypeScript code
2. **Trace Collection** (`traceTypeResolution`) - Record evaluation steps
3. **Data Enhancement** (`videoGenerator.ts`) - Add timing, positions, colors
4. **Component Rendering** (`Composition.tsx`) - React components using Remotion
5. **Video Export** - FFmpeg renders to file

## Key Features

✅ **Exact source positions** - Highlight shows exactly where in code
✅ **Parameter tracking** - See type variable bindings at each step
✅ **Nested generics** - Shows all levels of recursion
✅ **Mapped types** - Visualizes key iteration and construction
✅ **Conditional branches** - Highlights which branch is taken
✅ **Template literals** - Shows type string construction
✅ **Configurable timing** - 1-2 seconds per step
✅ **Production quality** - 1080p, 30fps
✅ **Fully typed** - TypeScript throughout

## Performance

### Rendering Time
- **First render**: 2-3 minutes (includes FFmpeg setup)
- **Subsequent renders**: 30-60 seconds
- **Preview**: Real-time in browser

### System Requirements
- Node 18+
- 2GB+ RAM
- Modern browser for preview
- FFmpeg (auto-installed)

## Trace Type Colors

| Type | Color | Meaning |
|------|-------|---------|
| generic_call | 🔵 Blue | Calling a generic |
| condition | 🟡 Amber | Conditional test |
| branch_true | 🟢 Green | True branch |
| branch_false | 🔴 Red | False branch |
| mapped_type_start | 🟣 Purple | Mapped type start |
| mapped_type_result | 🟢 Green | Mapped result |

## Example Output

When you run the video, you'll see the evaluation flow:

```
Frame 0:    Step 1 [generic_call] getter<"">
Frame 30:   Step 2 [generic_def] Showing getter definition
Frame 90:   Step 3 [condition] Conditional type check
Frame 150:  Step 4 [conditional_evaluate_left] Check side
Frame 210:  Step 5 [conditional_evaluate_right] Extends side
...
Frame 2760: Step 93 [generic_result] getter => "User" | "Post"
```

Each step is animated with:
- Highlight moving in code
- Results panel updating
- Parameters changing

## Troubleshooting

### Video renders but is blank
- Check browser console for errors
- Verify `VideoData` props passed to Composition
- Run `npm run generate-video` again

### Remotion not found
- Run `npm install`
- Ensure Node 18+

### Preview shows nothing
- Check that `Root.tsx` is in project root
- Verify Remotion is installed: `npm install remotion`

### Render is very slow
- Reduce concurrency: `--concurrency 1`
- Lower quality: `--crf 30` (higher = lower quality, faster)
- Reduce resolution in config

### Highlight not moving correctly
- Line numbers might be off (0-indexed vs 1-indexed)
- Check trace data: `npm run generate-video` logs positions

## Next Ideas

- Add audio narration describing each step
- Create gallery of different types
- Interactive player with jump-to-step
- Export frame-by-frame images
- Side-by-side comparison of two types
- Custom themes/templates

## Documentation

- **`QUICK_START.md`** - Get running in 1 minute
- **`REMOTION_SETUP.md`** - Detailed configuration guide
- **`VIDEO_GENERATOR_SUMMARY.md`** - Complete technical reference
- **Remotion docs** - https://www.remotion.dev

## Validation

Run to verify setup is complete:
```bash
node validate-setup.ts
```

All 18 checks should pass before rendering.

## Technical Stack

- **TypeScript** - Type-safe implementation
- **React** - Component rendering
- **Remotion** - Video composition and export
- **FFmpeg** - Video encoding
- **TypeScript Compiler API** - AST parsing

## Support

1. Check `QUICK_START.md` for common issues
2. Review `REMOTION_SETUP.md` for configuration
3. See `VIDEO_GENERATOR_SUMMARY.md` for technical details
4. Visit https://www.remotion.dev for Remotion help

## License

Same as parent project

---

**Ready to visualize your types?** Start with:
```bash
npm run generate-video
npm run remotion:preview
```
