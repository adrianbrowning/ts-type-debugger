import React from 'react';
import { LAYOUT, COLORS, TRACE_TYPE_COLORS } from '../config.ts';
import type { VideoTraceStep } from '../../core/types.ts';
import { formatResult, formatParameters } from '../../videoGenerator.ts';

interface ResultsPanelProps {
  currentStep: VideoTraceStep | null;
}

/**
 * Renders current evaluation step information - web version
 */
export const ResultsPanel: React.FC<ResultsPanelProps> = ({ currentStep }) => {
  if (!currentStep) {
    return (
      <div
        style={{
          width: LAYOUT.rightPanel.width,
          height: '100%',
          backgroundColor: COLORS.surface,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 8,
          padding: LAYOUT.results.padding,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p style={{ color: COLORS.textTertiary }}>No step selected</p>
      </div>
    );
  }

  const step = currentStep.original;
  const result = formatResult(currentStep);
  const params = formatParameters(currentStep);
  const typeColor = TRACE_TYPE_COLORS[step.type] || COLORS.info;

  return (
    <div
      style={{
        width: LAYOUT.rightPanel.width,
        height: '100%',
        backgroundColor: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 8,
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header with step info */}
      <div
        style={{
          padding: LAYOUT.results.padding,
          borderBottom: `1px solid ${COLORS.border}`,
          backgroundColor: COLORS.background,
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
          <span style={{ color: COLORS.text, fontSize: 14, fontWeight: 600 }}>
            Step {step.step}
          </span>
        </div>
        <p
          style={{
            margin: 0,
            color: COLORS.text,
            fontSize: 12,
            backgroundColor: COLORS.surface,
            padding: 6,
            borderRadius: 4,
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
          padding: LAYOUT.results.padding,
          overflow: 'auto',
          fontSize: LAYOUT.results.fontSize,
        }}
      >
        {/* Expression */}
        <div style={{ marginBottom: 16 }}>
          <h4
            style={{
              margin: '0 0 8px 0',
              color: COLORS.textSecondary,
              fontSize: 11,
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
              backgroundColor: COLORS.background,
              borderRadius: 4,
              color: COLORS.text,
              fontFamily: 'monospace',
              fontSize: 12,
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
                color: COLORS.textSecondary,
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              Parameters in Scope
            </h4>
            <div
              style={{
                backgroundColor: COLORS.background,
                borderRadius: 4,
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
                    fontSize: 12,
                  }}
                >
                  <span style={{ color: COLORS.info, fontWeight: 600 }}>
                    {key}:
                  </span>
                  <span
                    style={{
                      color: COLORS.text,
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
                color: COLORS.textSecondary,
                fontSize: 11,
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
                backgroundColor: COLORS.background,
                borderRadius: 4,
                color: COLORS.success,
                fontFamily: 'monospace',
                fontSize: 12,
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
                color: COLORS.textSecondary,
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              Arguments
            </h4>
            <div
              style={{
                backgroundColor: COLORS.background,
                borderRadius: 4,
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
                    fontSize: 12,
                  }}
                >
                  <span style={{ color: COLORS.warning, fontWeight: 600 }}>
                    {key}:
                  </span>
                  <span
                    style={{
                      color: COLORS.text,
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
