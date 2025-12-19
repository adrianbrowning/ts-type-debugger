import React, { useCallback } from "react";
import { buildCallStack } from "../../core/callStack.ts";
import type { VideoTraceStep } from "../../core/types.ts";
import { GLOBAL_THEME } from "../theme.ts";
import { CollapsibleSection } from "./CollapsibleSection.tsx";

export type CallStackSectionProps = {
  steps: Array<VideoTraceStep>;
  currentStepIndex: number;
  onNavigateToStep: (stepIndex: number) => void;
};

const INDENT_BASE = 12;
const INDENT_PER_LEVEL = 16;

type CallStackFrameProps = {
  frame: ReturnType<typeof buildCallStack>[number];
  isTopFrame: boolean;
  onNavigateToStep: (stepIndex: number) => void;
  theme: typeof GLOBAL_THEME;
};

const CallStackFrame: React.FC<CallStackFrameProps> = ({
  frame,
  isTopFrame,
  onNavigateToStep,
  theme,
}) => {
  const handleClick = useCallback(() => {
    onNavigateToStep(frame.stepIndex);
  }, [ onNavigateToStep, frame.stepIndex ]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onNavigateToStep(frame.stepIndex);
    }
  }, [ onNavigateToStep, frame.stepIndex ]);

  const isRootFrame = frame.level === 0;
  const frameLabel = `${frame.name}${frame.line !== undefined ? `:${frame.line}` : ""}${isRootFrame ? " (entry)" : ""}`;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${isTopFrame ? "Current frame: " : ""}${frameLabel}, level ${frame.level}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      style={{
        padding: theme.spacing.sm,
        paddingLeft: `${INDENT_BASE + frame.level * INDENT_PER_LEVEL}px`,
        cursor: "pointer",
        backgroundColor: isTopFrame ? theme.bg.active : "transparent",
        borderLeft: isTopFrame ? `2px solid ${theme.accent.primary}` : "none",
        color: isTopFrame ? theme.text.primary : theme.text.secondary,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: theme.spacing.md }}>
        <span>{frame.name}</span>
        <span style={{ color: theme.text.tertiary }}>
          {frame.line !== undefined && `: ${frame.line}`}
          {isRootFrame && " (entry)"}
        </span>
      </div>
    </div>
  );
};

export const CallStackSection: React.FC<CallStackSectionProps> = ({
  steps,
  currentStepIndex,
  onNavigateToStep,
}) => {
  const theme = GLOBAL_THEME;
  const frames = buildCallStack(steps, currentStepIndex);
  const topFrame = frames.length > 0 ? frames[frames.length - 1] : null;

  return (
    <CollapsibleSection title="Call Stack">
      <div role="list" aria-label="Call stack frames">
        {frames.map(frame => {
          const isTopFrame = (topFrame && frame.stepIndex === topFrame.stepIndex) || false;

          return (
            <CallStackFrame
              key={frame.stepIndex}
              frame={frame}
              isTopFrame={isTopFrame}
              onNavigateToStep={onNavigateToStep}
              theme={theme}
            />
          );
        })}
      </div>
    </CollapsibleSection>
  );
};
