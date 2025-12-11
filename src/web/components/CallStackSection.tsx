import React from 'react';
import { THEME } from '../theme.ts';
import { CollapsibleSection } from './CollapsibleSection.tsx';
import { buildCallStack } from '../../core/callStack.ts';
import type { VideoTraceStep } from '../../core/types.ts';

export type CallStackSectionProps = {
  steps: VideoTraceStep[];
  currentStepIndex: number;
  onNavigateToStep: (stepIndex: number) => void;
};

const INDENT_BASE = 12;
const INDENT_PER_LEVEL = 16;

export const CallStackSection: React.FC<CallStackSectionProps> = ({
  steps,
  currentStepIndex,
  onNavigateToStep,
}) => {
  const frames = buildCallStack(steps, currentStepIndex);
  const topFrame = frames.length > 0 ? frames[frames.length - 1] : null;

  const handleFrameClick = (stepIndex: number) => {
    onNavigateToStep(stepIndex);
  };

  const handleFrameKeyDown = (e: React.KeyboardEvent, stepIndex: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onNavigateToStep(stepIndex);
    }
  };

  return (
    <CollapsibleSection title="Call Stack">
      <div role="list" aria-label="Call stack frames">
        {frames.map((frame, index) => {
          const isTopFrame = topFrame && frame.stepIndex === topFrame.stepIndex;
          const isRootFrame = frame.level === 0;
          const frameLabel = `${frame.name}${frame.line !== undefined ? `:${frame.line}` : ''}${isRootFrame ? ' (entry)' : ''}`;

          return (
            <div
              key={frame.stepIndex}
              role="button"
              tabIndex={0}
              aria-label={`${isTopFrame ? 'Current frame: ' : ''}${frameLabel}, level ${frame.level}`}
              onClick={() => handleFrameClick(frame.stepIndex)}
              onKeyDown={(e) => handleFrameKeyDown(e, frame.stepIndex)}
              style={{
                padding: THEME.spacing.sm,
                paddingLeft: `${INDENT_BASE + frame.level * INDENT_PER_LEVEL}px`,
                cursor: 'pointer',
                backgroundColor: isTopFrame ? THEME.bg.active : 'transparent',
                borderLeft: isTopFrame ? `2px solid ${THEME.accent.primary}` : 'none',
                color: isTopFrame ? THEME.text.primary : THEME.text.secondary,
              }}
            >
              <span>
                {frame.name}
                {frame.line !== undefined && `:${frame.line}`}
                {isRootFrame && ' (entry)'}
              </span>
            </div>
          );
        })}
      </div>
    </CollapsibleSection>
  );
};
