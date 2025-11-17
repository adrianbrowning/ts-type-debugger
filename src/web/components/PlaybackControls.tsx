import React from 'react';
import { COLORS } from '../config.ts';
import type { VideoData } from '../../core/types.ts';

interface PlaybackControlsProps {
  videoData: VideoData | null;
  currentStepIndex: number;
  isPlaying: boolean;
  speed: number;
  onTogglePlayPause: () => void;
  onNextStep: () => void;
  onPreviousStep: () => void;
  onSetSpeed: (speed: number) => void;
  onSeekToStep: (stepIndex: number) => void;
}

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
  if (!videoData) {
    return (
      <div
        style={{
          padding: 16,
          backgroundColor: COLORS.background,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 8,
          color: COLORS.textSecondary,
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
        backgroundColor: COLORS.background,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 8,
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
            backgroundColor: currentStepIndex === 0 ? COLORS.border : COLORS.info,
            color: COLORS.text,
            border: 'none',
            borderRadius: 4,
            cursor: currentStepIndex === 0 ? 'not-allowed' : 'pointer',
            opacity: currentStepIndex === 0 ? 0.5 : 1,
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          ⏮ Prev
        </button>

        {/* Play/Pause button */}
        <button
          onClick={onTogglePlayPause}
          style={{
            padding: '8px 16px',
            backgroundColor: isPlaying ? COLORS.warning : COLORS.success,
            color: COLORS.text,
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>

        {/* Next button */}
        <button
          onClick={onNextStep}
          disabled={currentStepIndex === totalSteps - 1}
          style={{
            padding: '8px 12px',
            backgroundColor: currentStepIndex === totalSteps - 1 ? COLORS.border : COLORS.info,
            color: COLORS.text,
            border: 'none',
            borderRadius: 4,
            cursor: currentStepIndex === totalSteps - 1 ? 'not-allowed' : 'pointer',
            opacity: currentStepIndex === totalSteps - 1 ? 0.5 : 1,
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          Next ⏭
        </button>

        {/* Step indicator */}
        <div
          style={{
            marginLeft: 'auto',
            color: COLORS.textSecondary,
            fontSize: 13,
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
            background: `linear-gradient(to right, ${COLORS.info} 0%, ${COLORS.info} ${progress}%, ${COLORS.border} ${progress}%, ${COLORS.border} 100%)`,
            outline: 'none',
            cursor: 'pointer',
            WebkitAppearance: 'none',
          } as React.CSSProperties & { WebkitAppearance: string }}
        />
        <div
          style={{
            color: COLORS.textTertiary,
            fontSize: 12,
            minWidth: 45,
            textAlign: 'right',
          }}
        >
          {Math.round(progress)}%
        </div>
      </div>

      {/* Speed control */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ color: COLORS.textSecondary, fontSize: 13, minWidth: 60 }}>
          Speed: {speed.toFixed(1)}x
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          {[0.5, 1, 1.5, 2].map((s) => (
            <button
              key={s}
              onClick={() => onSetSpeed(s)}
              style={{
                padding: '6px 10px',
                backgroundColor: speed === s ? COLORS.info : COLORS.surface,
                color: COLORS.text,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: speed === s ? 600 : 400,
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
