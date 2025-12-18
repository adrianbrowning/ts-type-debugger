import React from 'react';
import { useCssTheme, type Theme } from '../theme.ts';

type DebugToolbarProps = {
  currentStepIndex: number;
  totalSteps: number;
  onJumpToStart: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onStepInto: () => void;
  onStepOver: () => void;
  onStepOut: () => void;
  canStepOut: boolean;
};

type ToolbarButtonProps = {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  theme: Theme;
};

function ToolbarButton({ label, disabled = false, onClick, children, theme }: ToolbarButtonProps) {
  const buttonStyle: React.CSSProperties = {
    backgroundColor: theme.bg.secondary,
    border: `1px solid ${theme.border.subtle}`,
    borderRadius: theme.radius.sm,
    color: theme.text.primary,
    cursor: 'pointer',
    fontSize: theme.fontSize.sm,
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
  };

  const disabledButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    color: theme.text.disabled,
    cursor: 'not-allowed',
    opacity: 0.5,
  };

  return (
    <button
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      style={disabled ? disabledButtonStyle : buttonStyle}
      title={disabled ? `${label} (disabled)` : label}
    >
      {children}
    </button>
  );
}

function Separator({ theme }: { theme: Theme }) {
  return <span style={{ color: theme.text.tertiary }}>│</span>;
}

export function DebugToolbar({
  currentStepIndex,
  totalSteps,
  onJumpToStart,
  onPrevious,
  onNext,
  onStepInto,
  onStepOver,
  onStepOut,
  canStepOut,
}: DebugToolbarProps) {
  const theme = useCssTheme();

  const containerStyle: React.CSSProperties = {
    alignItems: 'center',
    backgroundColor: theme.bg.secondary,
    borderBottom: `1px solid ${theme.border.subtle}`,
    display: 'flex',
    gap: theme.spacing.sm,
    padding: theme.spacing.sm,
  };

  const stepCounterStyle: React.CSSProperties = {
    color: theme.text.secondary,
    fontSize: theme.fontSize.sm,
    marginLeft: 'auto',
  };

  const isAtFirstStep = currentStepIndex === 0;
  const isAtLastStep = currentStepIndex === totalSteps - 1;

  return (
    <div style={containerStyle}>
      <ToolbarButton label="Jump to Start" disabled={isAtFirstStep} onClick={onJumpToStart} theme={theme}>
        ⏮
      </ToolbarButton>
      <ToolbarButton label="Previous" disabled={isAtFirstStep} onClick={onPrevious} theme={theme}>
        ◀
      </ToolbarButton>
      <ToolbarButton label="Next" disabled={isAtLastStep} onClick={onNext} theme={theme}>
        ▶
      </ToolbarButton>
      <Separator theme={theme} />
      <ToolbarButton label="Step Into" onClick={onStepInto} theme={theme}>
        ⬇ Into
      </ToolbarButton>
      <Separator theme={theme} />
      <ToolbarButton label="Step Over" onClick={onStepOver} theme={theme}>
        ↷ Over
      </ToolbarButton>
      <Separator theme={theme} />
      <ToolbarButton label="Step Out" disabled={!canStepOut} onClick={onStepOut} theme={theme}>
        ⬆ Out
      </ToolbarButton>
      <span style={stepCounterStyle}>
        Step {currentStepIndex} / {totalSteps}
      </span>
    </div>
  );
}
