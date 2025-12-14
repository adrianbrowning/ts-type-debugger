import React from 'react';
import { useCssTheme } from '../theme.ts';
import type { VideoTraceStep } from '../../core/types.ts';
import { formatResult, formatParameters } from '../../videoGenerator.ts';

type ResultsPanelProps = {
  currentStep: VideoTraceStep | null;
};

/**
 * Renders current evaluation step information - web version
 */
export const ResultsPanel: React.FC<ResultsPanelProps> = ({ currentStep }) => {
  const theme = useCssTheme();

  if (!currentStep) {
    return (
      <div
        style={{
          height: '100%',
          backgroundColor: theme.bg.secondary,
          border: `1px solid ${theme.border.subtle}`,
          borderRadius: theme.radius.lg,
          padding: theme.spacing.lg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p style={{ color: theme.text.tertiary }}>No step selected</p>
      </div>
    );
  }

  const step = currentStep.original;
  const result = formatResult(currentStep);
  const params = formatParameters(currentStep);
  const typeColor = theme.stepType[step.type as keyof typeof theme.stepType] || theme.accent.highlight;

  return (
    <div
      style={{
        height: '100%',
        backgroundColor: theme.bg.secondary,
        border: `1px solid ${theme.border.subtle}`,
        borderRadius: theme.radius.lg,
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header with step info */}
      <div
        style={{
          padding: theme.spacing.lg,
          borderBottom: `1px solid ${theme.border.subtle}`,
          backgroundColor: theme.bg.primary,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 8,
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              backgroundColor: typeColor,
              borderRadius: 2,
            }}
          />
          <span style={{ color: theme.text.primary, fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.semibold }}>
            Step {step.step}
          </span>
        </div>
        <p
          style={{
            margin: 0,
            color: theme.text.primary,
            fontSize: theme.fontSize.xs,
            backgroundColor: theme.bg.secondary,
            padding: 6,
            borderRadius: theme.radius.sm,
            fontFamily: 'monospace',
            wordBreak: 'break-word',
          }}
        >
          [{step.type}]
        </p>
      </div>

      {/* Content scrollable area */}
      <div
        style={{
          flex: 1,
          padding: theme.spacing.lg,
          overflow: 'auto',
          fontSize: theme.fontSize.sm,
        }}
      >
        {/* Expression */}
        <div style={{ marginBottom: 16 }}>
          <h4
            style={{
              margin: '0 0 8px 0',
              color: theme.text.secondary,
              fontSize: theme.fontSize.xs,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            Expression
          </h4>
          <pre
            style={{
              margin: 0,
              padding: 8,
              backgroundColor: theme.bg.primary,
              borderRadius: theme.radius.sm,
              color: theme.text.primary,
              fontFamily: 'monospace',
              fontSize: theme.fontSize.xs,
              overflow: 'auto',
              maxHeight: 120,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {step.expression}
          </pre>
        </div>

        {/* Parameters */}
        {Object.keys(params).length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <h4
              style={{
                margin: '0 0 8px 0',
                color: theme.text.secondary,
                fontSize: theme.fontSize.xs,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              Parameters in Scope
            </h4>
            <div
              style={{
                backgroundColor: theme.bg.primary,
                borderRadius: theme.radius.sm,
                padding: 8,
              }}
            >
              {Object.entries(params).map(([key, value]) => (
                <div
                  key={key}
                  style={{
                    display: 'flex',
                    gap: 8,
                    marginBottom: 6,
                    fontSize: theme.fontSize.xs,
                  }}
                >
                  <span style={{ color: theme.accent.highlight, fontWeight: theme.fontWeight.semibold }}>
                    {key}:
                  </span>
                  <span
                    style={{
                      color: theme.text.primary,
                      fontFamily: 'monospace',
                      flex: 1,
                      wordBreak: 'break-word',
                    }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div style={{ marginBottom: 16 }}>
            <h4
              style={{
                margin: '0 0 8px 0',
                color: theme.text.secondary,
                fontSize: theme.fontSize.xs,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              Result
            </h4>
            <pre
              style={{
                margin: 0,
                padding: 8,
                backgroundColor: theme.bg.primary,
                borderRadius: theme.radius.sm,
                color: theme.accent.success,
                fontFamily: 'monospace',
                fontSize: theme.fontSize.xs,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {result}
            </pre>
          </div>
        )}

        {/* Args if present */}
        {step.args && Object.keys(step.args).length > 0 && (
          <div>
            <h4
              style={{
                margin: '0 0 8px 0',
                color: theme.text.secondary,
                fontSize: theme.fontSize.xs,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              Arguments
            </h4>
            <div
              style={{
                backgroundColor: theme.bg.primary,
                borderRadius: theme.radius.sm,
                padding: 8,
              }}
            >
              {Object.entries(step.args).map(([key, value]) => (
                <div
                  key={key}
                  style={{
                    display: 'flex',
                    gap: 8,
                    marginBottom: 6,
                    fontSize: theme.fontSize.xs,
                  }}
                >
                  <span style={{ color: theme.accent.warning, fontWeight: theme.fontWeight.semibold }}>
                    {key}:
                  </span>
                  <span
                    style={{
                      color: theme.text.primary,
                      fontFamily: 'monospace',
                      flex: 1,
                      wordBreak: 'break-word',
                    }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
