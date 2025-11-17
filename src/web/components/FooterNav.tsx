import React from 'react';
import { THEME } from '../theme.ts';
import type { VideoData } from '../../core/types.ts';

interface FooterNavProps {
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
 * Footer navigation with playback controls
 */
export const FooterNav: React.FC<FooterNavProps> = ({
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
    return null;
  }

  const totalSteps = videoData.steps.length;
  const progress = totalSteps > 0 ? (currentStepIndex / (totalSteps - 1)) * 100 : 0;

  const ButtonStyle = (disabled: boolean, isActive: boolean = false) => ({
    padding: `${THEME.spacing.md} ${THEME.spacing.lg}`,
    backgroundColor: disabled ? THEME.text.disabled : isActive ? THEME.accent.primary : THEME.bg.active,
    color: THEME.text.primary,
    border: 'none',
    borderRadius: THEME.radius.md,
    fontSize: THEME.fontSize.sm,
    fontWeight: THEME.fontWeight.semibold,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'background-color 0.2s ease',
  });

  return (
    <footer
      style={{
        backgroundColor: THEME.bg.primary,
        borderTop: `1px solid ${THEME.border.subtle}`,
        padding: `${THEME.spacing.lg} ${THEME.spacing.xxl}`,
        display: 'flex',
        flexDirection: 'column',
        gap: THEME.spacing.lg,
      }}
    >
      {/* Timeline */}
      <div style={{ display: 'flex', alignItems: 'center', gap: THEME.spacing.lg }}>
        <input
          type="range"
          min="0"
          max={totalSteps - 1}
          value={currentStepIndex}
          onChange={(e) => onSeekToStep(parseInt(e.target.value, 10))}
          style={{
            flex: 1,
            height: '6px',
            borderRadius: THEME.radius.sm,
            background: `linear-gradient(to right, ${THEME.accent.highlight} 0%, ${THEME.accent.highlight} ${progress}%, ${THEME.border.subtle} ${progress}%, ${THEME.border.subtle} 100%)`,
            outline: 'none',
            cursor: 'pointer',
            WebkitAppearance: 'none',
          } as React.CSSProperties & { WebkitAppearance: string }}
        />
        <div
          style={{
            color: THEME.text.secondary,
            fontSize: THEME.fontSize.sm,
            minWidth: '45px',
            textAlign: 'right',
          }}
        >
          {Math.round(progress)}%
        </div>
      </div>

      {/* Controls Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: THEME.spacing.lg }}>
        {/* Previous Button */}
        <button
          onClick={onPreviousStep}
          disabled={currentStepIndex === 0}
          style={ButtonStyle(currentStepIndex === 0) as React.CSSProperties}
          onMouseOver={(e) => {
            if (currentStepIndex > 0) {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = THEME.bg.hover;
            }
          }}
          onMouseOut={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = THEME.bg.active;
          }}
        >
          ← Previous
        </button>

        {/* Play/Pause Button */}
        <button
          onClick={onTogglePlayPause}
          style={ButtonStyle(false, true) as React.CSSProperties}
          onMouseOver={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = THEME.accent.primaryAlt;
          }}
          onMouseOut={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = THEME.accent.primary;
          }}
        >
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>

        {/* Step Info */}
        <div
          style={{
            color: THEME.text.secondary,
            fontSize: THEME.fontSize.md,
            fontWeight: THEME.fontWeight.medium,
            minWidth: '120px',
            textAlign: 'center',
          }}
        >
          Step {currentStepIndex + 1} / {totalSteps}
        </div>

        {/* Speed Control */}
        <div style={{ display: 'flex', gap: THEME.spacing.md, alignItems: 'center' }}>
          <span style={{ color: THEME.text.secondary, fontSize: THEME.fontSize.sm }}>
            {speed.toFixed(1)}x
          </span>
          <div style={{ display: 'flex', gap: THEME.spacing.sm }}>
            {[0.5, 1, 1.5, 2].map((s) => (
              <button
                key={s}
                onClick={() => onSetSpeed(s)}
                style={
                  {
                    padding: `${THEME.spacing.sm} ${THEME.spacing.md}`,
                    backgroundColor: speed === s ? THEME.accent.highlight : THEME.bg.active,
                    color: THEME.text.primary,
                    border: `1px solid ${THEME.border.subtle}`,
                    borderRadius: THEME.radius.sm,
                    cursor: 'pointer',
                    fontSize: THEME.fontSize.xs,
                    fontWeight: speed === s ? THEME.fontWeight.semibold : THEME.fontWeight.normal,
                    transition: 'background-color 0.2s ease',
                  } as React.CSSProperties
                }
                onMouseOver={(e) => {
                  if (speed !== s) {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = THEME.bg.hover;
                  }
                }}
                onMouseOut={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    speed === s ? THEME.accent.highlight : THEME.bg.active;
                }}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Next Button */}
        <button
          onClick={onNextStep}
          disabled={currentStepIndex === totalSteps - 1}
          style={ButtonStyle(currentStepIndex === totalSteps - 1, true) as React.CSSProperties}
          onMouseOver={(e) => {
            if (currentStepIndex < totalSteps - 1) {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = THEME.accent.primaryAlt;
            }
          }}
          onMouseOut={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = THEME.accent.primary;
          }}
        >
          Next →
        </button>
      </div>
    </footer>
  );
};
