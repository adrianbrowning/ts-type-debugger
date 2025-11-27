import React from 'react';
import type { VideoTraceStep } from '../../core/types.ts';
import { formatResult, formatParameters } from '../../videoGenerator.ts';
import { THEME } from '../theme.ts';

interface StepDetailsPanelProps {
  currentStep: VideoTraceStep | null;
}

/**
 * Displays details for the current step
 */
export const StepDetailsPanel: React.FC<StepDetailsPanelProps> = ({ currentStep }) => {
  if (!currentStep) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          backgroundColor: THEME.bg.secondary,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: `${THEME.spacing.lg} ${THEME.spacing.xl}`,
            borderBottom: `1px solid ${THEME.border.subtle}`,
            backgroundColor: THEME.bg.primary,
          }}
        >
          <h3
            style={{
              margin: 0,
              color: THEME.text.primary,
              fontSize: THEME.fontSize.xl,
              fontWeight: THEME.fontWeight.semibold,
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
            color: THEME.text.secondary,
            fontSize: THEME.fontSize.md,
          }}
        >
          No step selected
        </div>
      </div>
    );
  }

  const step = currentStep.original;
  const result = formatResult(currentStep);
  const params = formatParameters(currentStep);
  const typeColor = THEME.accent.highlight;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: THEME.bg.secondary,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: `${THEME.spacing.lg} ${THEME.spacing.xl}`,
          borderBottom: `1px solid ${THEME.border.subtle}`,
          backgroundColor: THEME.bg.primary,
        }}
      >
        <h3
          style={{
            margin: 0,
            color: THEME.text.primary,
            fontSize: THEME.fontSize.xl,
            fontWeight: THEME.fontWeight.semibold,
          }}
        >
          Step Details
        </h3>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: THEME.spacing.xl,
          display: 'flex',
          flexDirection: 'column',
          gap: THEME.spacing.lg,
        }}
      >
        {/* Step Indicator */}
        <div
          style={{
            padding: `${THEME.spacing.md} ${THEME.spacing.lg}`,
            backgroundColor: THEME.bg.active,
            borderLeft: `4px solid ${THEME.accent.highlight}`,
            borderRadius: THEME.radius.md,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: THEME.spacing.md,
            }}
          >
            <span
              style={{
                color: THEME.text.primary,
                fontSize: THEME.fontSize.lg,
                fontWeight: THEME.fontWeight.semibold,
              }}
            >
              Step {step.step}
            </span>
            <span
              style={{
                color: THEME.accent.highlight,
                fontSize: THEME.fontSize.sm,
                fontWeight: THEME.fontWeight.medium,
              }}
            >
              {step.type}
            </span>
          </div>
        </div>

        {/* Expression */}
        <div>
          <h4
            style={{
              margin: `0 0 ${THEME.spacing.md} 0`,
              color: THEME.text.secondary,
              fontSize: THEME.fontSize.xs,
              fontWeight: THEME.fontWeight.semibold,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Expression
          </h4>
          <pre
            style={{
              margin: 0,
              padding: THEME.spacing.md,
              backgroundColor: THEME.bg.editor,
              borderRadius: THEME.radius.md,
              border: `1px solid ${THEME.border.subtle}`,
              color: THEME.text.primary,
              fontFamily: '"Fira Code", monospace',
              fontSize: THEME.fontSize.sm,
              lineHeight: 1.6,
              overflow: 'auto',
              maxHeight: '120px',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {step.expression}
          </pre>
        </div>

        {/* Running Results (Union Stepping) */}
        {step.currentUnionMember && (
          <div>
            <h4
              style={{
                margin: `0 0 ${THEME.spacing.md} 0`,
                color: THEME.text.secondary,
                fontSize: THEME.fontSize.xs,
                fontWeight: THEME.fontWeight.semibold,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Running Results
            </h4>
            <div
              style={{
                padding: THEME.spacing.md,
                backgroundColor: THEME.bg.editor,
                borderRadius: THEME.radius.md,
                border: `1px solid ${THEME.border.subtle}`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: THEME.spacing.md,
                  marginBottom: THEME.spacing.sm,
                  fontSize: THEME.fontSize.sm,
                }}
              >
                <span
                  style={{
                    color: THEME.accent.highlight,
                    fontWeight: THEME.fontWeight.semibold,
                  }}
                >
                  Current Member:
                </span>
                <span
                  style={{
                    color: THEME.text.primary,
                    fontFamily: '"Fira Code", monospace',
                    flex: 1,
                    wordBreak: 'break-word',
                  }}
                >
                  {step.currentUnionMember}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: THEME.spacing.md,
                  fontSize: THEME.fontSize.sm,
                }}
              >
                <span
                  style={{
                    color: THEME.accent.highlight,
                    fontWeight: THEME.fontWeight.semibold,
                  }}
                >
                  Accumulated:
                </span>
                <span
                  style={{
                    color: THEME.text.primary,
                    fontFamily: '"Fira Code", monospace',
                    flex: 1,
                    wordBreak: 'break-word',
                  }}
                >
                  {step.currentUnionResults}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Parameters */}
        {Object.keys(params).length > 0 && (
          <div>
            <h4
              style={{
                margin: `0 0 ${THEME.spacing.md} 0`,
                color: THEME.text.secondary,
                fontSize: THEME.fontSize.xs,
                fontWeight: THEME.fontWeight.semibold,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Parameters in Scope
            </h4>
            <div
              style={{
                padding: THEME.spacing.md,
                backgroundColor: THEME.bg.editor,
                borderRadius: THEME.radius.md,
                border: `1px solid ${THEME.border.subtle}`,
              }}
            >
              {Object.entries(params).map(([key, value]) => (
                <div
                  key={key}
                  style={{
                    display: 'flex',
                    gap: THEME.spacing.md,
                    marginBottom: THEME.spacing.sm,
                    fontSize: THEME.fontSize.sm,
                  }}
                >
                  <span
                    style={{
                      color: THEME.accent.highlight,
                      fontWeight: THEME.fontWeight.semibold,
                    }}
                  >
                    {key}:
                  </span>
                  <span
                    style={{
                      color: THEME.text.primary,
                      fontFamily: '"Fira Code", monospace',
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
          <div>
            <h4
              style={{
                margin: `0 0 ${THEME.spacing.md} 0`,
                color: THEME.text.secondary,
                fontSize: THEME.fontSize.xs,
                fontWeight: THEME.fontWeight.semibold,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Result
            </h4>
            <pre
              style={{
                margin: 0,
                padding: THEME.spacing.md,
                backgroundColor: THEME.bg.editor,
                borderRadius: THEME.radius.md,
                border: `1px solid ${THEME.border.subtle}`,
                color: THEME.accent.success,
                fontFamily: '"Fira Code", monospace',
                fontSize: THEME.fontSize.sm,
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {result}
            </pre>
          </div>
        )}

        {/* Arguments */}
        {step.args && Object.keys(step.args).length > 0 && (
          <div>
            <h4
              style={{
                margin: `0 0 ${THEME.spacing.md} 0`,
                color: THEME.text.secondary,
                fontSize: THEME.fontSize.xs,
                fontWeight: THEME.fontWeight.semibold,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Arguments
            </h4>
            <div
              style={{
                padding: THEME.spacing.md,
                backgroundColor: THEME.bg.editor,
                borderRadius: THEME.radius.md,
                border: `1px solid ${THEME.border.subtle}`,
              }}
            >
              {Object.entries(step.args).map(([key, value]) => (
                <div
                  key={key}
                  style={{
                    display: 'flex',
                    gap: THEME.spacing.md,
                    marginBottom: THEME.spacing.sm,
                    fontSize: THEME.fontSize.sm,
                  }}
                >
                  <span
                    style={{
                      color: THEME.accent.warning,
                      fontWeight: THEME.fontWeight.semibold,
                    }}
                  >
                    {key}:
                  </span>
                  <span
                    style={{
                      color: THEME.text.primary,
                      fontFamily: '"Fira Code", monospace',
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
