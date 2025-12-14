import React, { useRef, useEffect } from 'react';
import type { VideoTraceStep, TypeInfo } from '../../core/types.ts';
import { useCssTheme } from '../theme.ts';

type CodePanelProps = {
  currentStep: VideoTraceStep | null;
  activeType: TypeInfo | null;
  sourceCode: string;
};

/**
 * Renders code with animated highlight - web version with full syntax highlighting
 */
export const CodePanel: React.FC<CodePanelProps> = ({
  currentStep,
  activeType,
}) => {
  const theme = useCssTheme();
  const highlightRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to keep highlight visible
  useEffect(() => {
    if (highlightRef.current && currentStep?.highlightLines) {
      // Calculate scroll distance
      let scrollDistance = 0;
      // Could track previous step if needed for smart scrolling
      // For now, use smooth scrolling
      const behavior = scrollDistance > 30 ? 'auto' : 'smooth';

      highlightRef.current.scrollIntoView({
        behavior: behavior as ScrollBehavior,
        block: 'center',
      });
    }
  }, [currentStep?.stepIndex]);

  return (
    <div
      style={{
        height: '100%',
        backgroundColor: theme.bg.editor,
        border: `1px solid ${theme.border.subtle}`,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: theme.spacing.lg,
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
          {activeType?.name || 'Type Definition'}
        </h3>
        {activeType && (
          <p
            style={{
              margin: `${theme.spacing.md} 0 0 0`,
              color: theme.text.secondary,
              fontSize: theme.fontSize.sm,
            }}
          >
            Lines {activeType.startLine + 1}-{activeType.endLine + 1}
          </p>
        )}
      </div>

      {/* Code area with highlight */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          position: 'relative',
          padding: theme.spacing.lg,
          backgroundColor: theme.bg.editor,
        }}
      >
        {/* Code content - show only active type definition */}
        {activeType ? (
          <>
            <pre
              style={{
                margin: 0,
                fontFamily: '"Fira Code", "Monaco", monospace',
                fontSize: theme.fontSize.md,
                lineHeight: 1.6,
                color: theme.text.primary,
                whiteSpace: 'pre',
                position: 'relative',
                zIndex: 1,
                display: 'inline-block',
                minWidth: '100%',
              }}
            >
              {/* Animated highlight box - positioned inside pre */}
              {currentStep?.highlightLines && activeType && (
                <div
                  ref={highlightRef}
                  style={{
                    position: 'absolute',
                    top: `${
                      (currentStep.highlightLines.start - activeType.startLine) *
                        (theme.raw.lineHeight * theme.raw.fontSizeMd)
                    }px`,
                    left: currentStep.highlightLines.chars
                      ? `${40 + 12 + currentStep.highlightLines.chars.start * (theme.raw.fontSizeMd * 0.6)}px`
                      : `${40 + 12}px`,
                    ...(currentStep.highlightLines.chars
                      ? {
                          // width: `${(currentStep.highlightLines.chars.end - currentStep.highlightLines.chars.start) * (parseInt(theme.fontSize.md) * 0.6)}px`,
                          width: `${(currentStep.highlightLines.chars.end - currentStep.highlightLines.chars.start) + 1}ch`,
                        }
                      : {
                          right: '0px',
                        }),
                    height: `${
                      (currentStep.highlightLines.end - currentStep.highlightLines.start + 1) *
                      theme.raw.lineHeight * theme.raw.fontSizeMd
                    }px`,
                    border: `2px solid #FFD700`,
                    backgroundColor: 'rgba(255, 215, 0, 0.1)',
                    borderRadius: theme.radius.md,
                    zIndex: 0,
                    transition: `all 0.3s ease-out`,
                    pointerEvents: 'none',
                  }}
                />
              )}

              {/* Show line numbers with absolute positions + code for active type */}
              {activeType.lines.map((line, idx) => {
                const absoluteLineNum = activeType.startLine + idx + 1;
                const highlightedLine = activeType.highlightedLines?.[idx];
                return (
                  <div key={idx} style={{ display: 'flex' }}>
                    <span
                      style={{
                        color: theme.text.tertiary,
                        marginRight: theme.spacing.lg,
                        minWidth: '40px',
                        textAlign: 'right',
                        userSelect: 'none',
                      }}
                    >
                      {absoluteLineNum}
                    </span>
                    {highlightedLine ? (
                      <span
                        dangerouslySetInnerHTML={{ __html: highlightedLine }}
                        style={{
                          fontFamily: '"Fira Code", "Monaco", monospace',
                          fontSize: theme.fontSize.md,
                        }}
                      />
                    ) : (
                      <span>{line}</span>
                    )}
                  </div>
                );
              })}
            </pre>
          </>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: theme.text.secondary,
              fontSize: theme.fontSize.md,
            }}
          >
            No active type definition
          </div>
        )}
      </div>
    </div>
  );
};
