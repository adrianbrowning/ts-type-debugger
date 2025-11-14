# Quick Start: TypeScript Type Evaluation Video

Generate beautiful animated videos showing how TypeScript evaluates complex type aliases step-by-step.

## 1 Minute Setup

### Step 1: Install Dependencies

```bash
pnpm install
```

### Step 2: Generate Video Data

```bash
npm run generate-video
```

This outputs:
- 93 evaluation steps
- 2790 frames at 30fps
- ~93 seconds total duration
- Shows type name, parameters, expressions, and results

### Step 3: Preview Video

```bash
npm run remotion:preview
```

Opens browser at `http://localhost:3000` with interactive player.

### Step 4: Render to File

```bash
npm run remotion:render
# Creates: output.mp4
```

Or as GIF:
```bash
pnpm remotion render Root.tsx TypeEvalVideo output.gif --fps 30 --image-format jpeg
```

## What You're Visualizing

The video shows the evaluation of this type:

```typescript
type _result = getter<"">;
```

Which expands through:
- **getter** generic type
- **validateLeafPath** with conditional branching
- **getSuggestions** with mapped types
- **keyOf** helper to extract keys
- ... and more nested generics

Final result: `"User" | "Post"`

## 2-Column Layout

### Left: Code Panel
- Shows relevant type aliases (extracted automatically)
- Gold highlight box moves over current evaluation location
- Type name in header

### Right: Results Panel
- Step number and trace type (condition, generic_call, etc.)
- Current expression being evaluated
- **Parameters in Scope** (blue): current type variable bindings
- **Result** (green): intermediate evaluation result
- **Arguments** (amber): generic type arguments

## Customization Examples

### Faster/Slower Playback

Edit `generateVideo.ts`:

```typescript
const videoData = generateVideoData(trace, ast, code, {
  fps: 30,
  secondsPerStep: 0.5,  // 2x speed
});
```

Then regenerate: `npm run generate-video`

### Different Type to Visualize

Edit `Root.tsx`:

```typescript
const code = 'type MyType = someGeneric<SomeArg>;\n' + CustomTypes;
// ...
const trace = traceTypeResolution(ast, 'MyType');
```

### Change Colors

Edit `remotion/config.ts`:

```typescript
export const COLORS = {
  background: '#1E293B',
  text: '#F8FAFC',
  // ... modify colors
};

export const TRACE_TYPE_COLORS = {
  generic_call: '#YOURCOLOR',
  // ... etc
};
```

## File Structure

```
├── generateVideo.ts         ← Generate video data
├── Root.tsx                 ← Remotion entry point
├── remotion.config.ts       ← Remotion settings
├── remotion/
│   ├── Composition.tsx      ← Main layout
│   ├── CodePanel.tsx        ← Left side (code)
│   ├── ResultsPanel.tsx     ← Right side (results)
│   ├── config.ts            ← Styling & layout
│   └── index.ts             ← Exports
├── videoGenerator.ts        ← Data transformation
├── astGenerator.ts          ← (existing) AST tracing
└── REMOTION_SETUP.md        ← Detailed guide
```

## Tips

- **First render is slowest** - installs ffmpeg, builds video
- **Use `--concurrency 1`** for slower systems: `pnpm remotion render ... --concurrency 1`
- **Frames with no highlight** - steps without source position info
- **Parameters update live** - watch the right panel for each step's bindings

## Troubleshooting

**"Module not found: remotion"**
- Run `pnpm install` again
- Check you're using Node 18+

**Preview shows blank**
- Check browser console for errors
- Verify `Root.tsx` is in project root

**Video renders but is all black**
- Verify `VideoData` props are passed correctly
- Check `videoGenerator.ts` generated valid data

**Render is very slow**
- Reduce concurrency: `--concurrency 1`
- Lower fps: `--fps 15`
- Use smaller resolution in `remotion/config.ts`

## Next Steps

- **Add transitions** between steps in `Composition.tsx`
- **Add audio narration** with step descriptions
- **Export different formats** (WebM, ProRes)
- **Create variations** for different type examples
- **Customize fonts** - edit font-family in `config.ts`

## See Also

- Full documentation: `REMOTION_SETUP.md`
- Remotion docs: https://www.remotion.dev
- Video component API: Check `Composition.tsx` props
