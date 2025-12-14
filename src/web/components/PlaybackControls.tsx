import React from 'react';
import { useCssTheme } from '../theme.ts';
import type { VideoData } from '../../core/types.ts';

type PlaybackControlsProps = {
  videoData: VideoData | null;
  currentStepIndex: number;
  isPlaying: boolean;
  speed: number;
  onTogglePlayPause: () => void;
  onNextStep: () => void;
  onPreviousStep: () => void;
  onSetSpeed: (speed: number) => void;
  onSeekToStep: (stepIndex: number) => void;
};

/**
 * Playback controls for web app
 */
export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  videoData,
  currentStepIndex,
  isPlaying,
  speed,
  onTogglePlayPause,
  onNextStep,
  onPreviousStep,
  onSetSpeed,
  onSeekToStep,
}) => {
  const theme = useCssTheme();

  if (!videoData) {
    return (
      <div
        style={{
          padding: 16,
          backgroundColor: theme.bg.primary,
          border: `1px solid ${theme.border.subtle}`,
          borderRadius: theme.radius.lg,
          color: theme.text.secondary,
          textAlign: 'center',
        }}
      >
        Generate video data to see playback controls
      </div>
    );
  }

  const totalSteps = videoData.steps.length;
  const progress = totalSteps > 0 ? (currentStepIndex / (totalSteps - 1)) * 100 : 0;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        padding: 16,
        backgroundColor: theme.bg.primary,
        border: `1px solid ${theme.border.subtle}`,
        borderRadius: theme.radius.lg,
      }}
    >
      {/* Play controls row */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        {/* Previous button */}
        <button
          onClick={onPreviousStep}
          disabled={currentStepIndex === 0}
          style={{
            padding: '8px 12px',
            backgroundColor: currentStepIndex === 0 ? theme.border.subtle : theme.accent.highlight,
            color: currentStepIndex === 0 ? theme.text.primary : theme.accent.btnText,
            border: 'none',
            borderRadius: theme.radius.sm,
            cursor: currentStepIndex === 0 ? 'not-allowed' : 'pointer',
            opacity: currentStepIndex === 0 ? 0.5 : 1,
            fontSize: theme.fontSize.md,
            fontWeight: theme.fontWeight.semibold,
          }}
        >
          Prev
        </button>

        {/* Play/Pause button */}
        <button
          onClick={onTogglePlayPause}
          style={{
            padding: '8px 16px',
            backgroundColor: isPlaying ? theme.accent.warning : theme.accent.success,
            color: theme.accent.btnText,
            border: 'none',
            borderRadius: theme.radius.sm,
            cursor: 'pointer',
            fontSize: theme.fontSize.md,
            fontWeight: theme.fontWeight.semibold,
          }}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>

        {/* Next button */}
        <button
          onClick={onNextStep}
          disabled={currentStepIndex === totalSteps - 1}
          style={{
            padding: '8px 12px',
            backgroundColor: currentStepIndex === totalSteps - 1 ? theme.border.subtle : theme.accent.highlight,
            color: currentStepIndex === totalSteps - 1 ? theme.text.primary : theme.accent.btnText,
            border: 'none',
            borderRadius: theme.radius.sm,
            cursor: currentStepIndex === totalSteps - 1 ? 'not-allowed' : 'pointer',
            opacity: currentStepIndex === totalSteps - 1 ? 0.5 : 1,
            fontSize: theme.fontSize.md,
            fontWeight: theme.fontWeight.semibold,
          }}
        >
          Next
        </button>

        {/* Step indicator */}
        <div
          style={{
            marginLeft: 'auto',
            color: theme.text.secondary,
            fontSize: theme.fontSize.sm,
          }}
        >
          Step {currentStepIndex + 1} / {totalSteps}
        </div>
      </div>

      {/* Timeline scrubber */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <input
          type="range"
          min="0"
          max={totalSteps - 1}
          value={currentStepIndex}
          onChange={(e) => onSeekToStep(parseInt(e.target.value, 10))}
          style={{
            flex: 1,
            height: 6,
            borderRadius: 3,
            background: `linear-gradient(to right, ${theme.accent.highlight} 0%, ${theme.accent.highlight} ${progress}%, ${theme.border.subtle} ${progress}%, ${theme.border.subtle} 100%)`,
            outline: 'none',
            cursor: 'pointer',
            WebkitAppearance: 'none',
          } as React.CSSProperties & { WebkitAppearance: string }}
        />
        <div
          style={{
            color: theme.text.tertiary,
            fontSize: theme.fontSize.xs,
            minWidth: 45,
            textAlign: 'right',
          }}
        >
          {Math.round(progress)}%
        </div>
      </div>

      {/* Speed control */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ color: theme.text.secondary, fontSize: theme.fontSize.sm, minWidth: 60 }}>
          Speed: {speed.toFixed(1)}x
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          {[0.5, 1, 1.5, 2].map((s) => (
            <button
              key={s}
              onClick={() => onSetSpeed(s)}
              style={{
                padding: '6px 10px',
                backgroundColor: speed === s ? theme.accent.highlight : theme.bg.secondary,
                color: speed === s ? theme.accent.btnText : theme.text.primary,
                border: `1px solid ${theme.border.subtle}`,
                borderRadius: theme.radius.sm,
                cursor: 'pointer',
                fontSize: theme.fontSize.xs,
                fontWeight: speed === s ? theme.fontWeight.semibold : theme.fontWeight.normal,
              }}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
