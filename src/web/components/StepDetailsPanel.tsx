import React, { useMemo } from 'react';
import type { VideoTraceStep, TypeInfo } from '../../core/types.ts';
import { useCssTheme } from '../theme.ts';
import { DebugToolbar } from './DebugToolbar.tsx';
import { CallStackSection } from './CallStackSection.tsx';
import { IterationSection } from './IterationSection.tsx';
import { ScopeSection } from './ScopeSection.tsx';
import { GlobalsSection } from './GlobalsSection.tsx';
import { CollapsibleSection } from './CollapsibleSection.tsx';

type StepDetailsPanelProps = {
  currentStep: VideoTraceStep | null;
  steps: VideoTraceStep[];
  currentStepIndex: number;
  totalSteps: number;
  typeAliases: TypeInfo[];
  onPrevious: () => void;
  onNext: () => void;
  onStepInto: () => void;
  onStepOver: () => void;
  onStepOut: () => void;
  onSeekToStep: (index: number) => void;
};

/**
 * Calculate used type names by scanning traces for type references
 */
function calculateUsedTypeNames(steps: VideoTraceStep[]): Set<string> {
  const usedNames = new Set<string>();

  for (const step of steps) {
    const expr = step.original.expression || '';
    // Match type names (capitalized identifiers)
    const matches = expr.match(/[A-Z][a-zA-Z0-9]*/g);
    if (matches) {
      matches.forEach(name => usedNames.add(name));
    }
  }

  return usedNames;
}

/**
 * Displays details for the current step in Chrome DevTools style
 */
export const StepDetailsPanel: React.FC<StepDetailsPanelProps> = ({
  currentStep,
  steps,
  currentStepIndex,
  totalSteps,
  typeAliases,
  onPrevious,
  onNext,
  onStepInto,
  onStepOver,
  onStepOut,
  onSeekToStep,
}) => {
  const theme = useCssTheme();
  const usedTypeNames = useMemo(() => calculateUsedTypeNames(steps), [steps]);
  const canStepOut = currentStep !== null;

  // Empty state
  if (!currentStep) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          backgroundColor: theme.bg.secondary,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: `${theme.spacing.lg} ${theme.spacing.xl}`,
            borderBottom: `1px solid ${theme.border.subtle}`,
            backgroundColor: theme.bg.primary,
          }}
        >
          <h3
            style={{
              margin: 0,
              color: theme.text.primary,
              fontSize: theme.fontSize.xl,
              fontWeight: theme.fontWeight.semibold,
            }}
          >
            Step Details
          </h3>
        </div>

        {/* Empty state */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: theme.text.secondary,
            fontSize: theme.fontSize.md,
          }}
        >
          No step selected
        </div>
      </div>
    );
  }

  const step = currentStep.original;
  const parameters = step.parameters || {};
  const hasResult = step.result !== undefined && step.result !== null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: theme.bg.secondary,
        overflow: 'hidden',
      }}
    >
      {/* Debug Toolbar */}
      <DebugToolbar
        currentStepIndex={currentStepIndex}
        totalSteps={totalSteps}
        onPrevious={onPrevious}
        onNext={onNext}
        onStepInto={onStepInto}
        onStepOver={onStepOver}
        onStepOut={onStepOut}
        canStepOut={canStepOut}
      />

      {/* Scrollable sections */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Call Stack */}
        <CallStackSection
          steps={steps}
          currentStepIndex={currentStepIndex}
          onNavigateToStep={onSeekToStep}
        />

        {/* Iteration (only if currentUnionMember exists) */}
        {step.currentUnionMember && (
          <IterationSection
            currentMember={step.currentUnionMember}
            accumulatedResults={step.currentUnionResults}
          />
        )}

        {/* Scope */}
        <ScopeSection parameters={parameters} />

        {/* Globals */}
        <GlobalsSection
          typeAliases={typeAliases}
          usedTypeNames={usedTypeNames}
        />

        {/* Expression - collapsed by default to avoid text conflicts */}
        <CollapsibleSection title="Expression" defaultExpanded={false}>
          <pre
            style={{
              margin: 0,
              padding: theme.spacing.md,
              backgroundColor: theme.bg.editor,
              borderRadius: theme.radius.md,
              border: `1px solid ${theme.border.subtle}`,
              color: theme.text.primary,
              fontFamily: '"Fira Code", monospace',
              fontSize: theme.fontSize.sm,
              lineHeight: 1.6,
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {step.expression}
          </pre>
        </CollapsibleSection>
      </div>

      {/* Result bar (sticky at bottom) */}
      {hasResult && (
        <div
          style={{
            padding: theme.spacing.md,
            backgroundColor: theme.bg.primary,
            borderTop: `1px solid ${theme.border.subtle}`,
          }}
        >
          <span
            style={{
              color: theme.text.secondary,
              fontSize: theme.fontSize.sm,
              fontWeight: theme.fontWeight.semibold,
              marginRight: theme.spacing.sm,
            }}
          >
            Result:
          </span>
          <code
            style={{
              color: theme.accent.success,
              fontFamily: '"Fira Code", monospace',
              fontSize: theme.fontSize.sm,
            }}
          >
            {step.result}
          </code>
        </div>
      )}
    </div>
  );
};
