import React from 'react';
import { THEME } from '../theme';

type DebugToolbarProps = {
  currentStepIndex: number;
  totalSteps: number;
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
};

function ToolbarButton({ label, disabled = false, onClick, children }: ToolbarButtonProps) {
  const buttonStyle: React.CSSProperties = {
    backgroundColor: THEME.bg.secondary,
    border: `1px solid ${THEME.border.subtle}`,
    borderRadius: THEME.radius.sm,
    color: THEME.text.primary,
    cursor: 'pointer',
    fontSize: THEME.fontSize.sm,
    padding: `${THEME.spacing.xs} ${THEME.spacing.sm}`,
  };

  const disabledButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    color: THEME.text.disabled,
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

function Separator() {
  return <span style={{ color: THEME.text.tertiary }}>│</span>;
}

export function DebugToolbar({
  currentStepIndex,
  totalSteps,
  onPrevious,
  onNext,
  onStepInto,
  onStepOver,
  onStepOut,
  canStepOut,
}: DebugToolbarProps) {
  const containerStyle: React.CSSProperties = {
    alignItems: 'center',
    backgroundColor: THEME.bg.secondary,
    borderBottom: `1px solid ${THEME.border.subtle}`,
    display: 'flex',
    gap: THEME.spacing.sm,
    padding: THEME.spacing.sm,
  };

  const stepCounterStyle: React.CSSProperties = {
    color: THEME.text.secondary,
    fontSize: THEME.fontSize.sm,
    marginLeft: 'auto',
  };

  const isAtFirstStep = currentStepIndex === 0;
  const isAtLastStep = currentStepIndex === totalSteps - 1;

  return (
    <div style={containerStyle}>
      <ToolbarButton label="Previous" disabled={isAtFirstStep} onClick={onPrevious}>
        ◀
      </ToolbarButton>
      <ToolbarButton label="Next" disabled={isAtLastStep} onClick={onNext}>
        ▶
      </ToolbarButton>
      <Separator />
      <ToolbarButton label="Step Into" onClick={onStepInto}>
        ⬇ Into
      </ToolbarButton>
      <Separator />
      <ToolbarButton label="Step Over" onClick={onStepOver}>
        ⏭ Over
      </ToolbarButton>
      <Separator />
      <ToolbarButton label="Step Out" disabled={!canStepOut} onClick={onStepOut}>
        ⬆ Out
      </ToolbarButton>
      <span style={stepCounterStyle}>
        Step {currentStepIndex} / {totalSteps}
      </span>
    </div>
  );
}
