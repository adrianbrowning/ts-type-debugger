import React, { useRef, useEffect } from 'react';
import type { VideoTraceStep, TypeInfo } from '../../core/types.ts';
import { THEME } from '../theme.ts';

interface CodePanelProps {
  currentStep: VideoTraceStep | null;
  activeType: TypeInfo | null;
  sourceCode: string;
}

/**
 * Renders code with animated highlight - web version with full syntax highlighting
 */
export const CodePanel: React.FC<CodePanelProps> = ({
  currentStep,
  activeType,
  sourceCode,
}) => {
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
        backgroundColor: THEME.bg.editor,
        border: `1px solid ${THEME.border.subtle}`,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: THEME.spacing.lg,
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
          {activeType?.name || 'Type Definition'}
        </h3>
        {activeType && (
          <p
            style={{
              margin: `${THEME.spacing.md} 0 0 0`,
              color: THEME.text.secondary,
              fontSize: THEME.fontSize.sm,
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
          padding: THEME.spacing.lg,
          backgroundColor: THEME.bg.editor,
        }}
      >
        {/* Code content - show only active type definition */}
        {activeType ? (
          <>
            <pre
              style={{
                margin: 0,
                fontFamily: '"Fira Code", "Monaco", monospace',
                fontSize: THEME.fontSize.md,
                lineHeight: 1.6,
                color: THEME.text.primary,
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                position: 'relative',
                zIndex: 1,
                display: 'inline-block',
                minWidth: '100%',
              }}
            >
              {/* Show line numbers with absolute positions + code for active type */}
              {activeType.lines.map((line, idx) => {
                const absoluteLineNum = activeType.startLine + idx + 1;
                const highlightedLine = activeType.highlightedLines?.[idx];
                return (
                  <div key={idx} style={{ display: 'flex' }}>
                    <span
                      style={{
                        color: THEME.text.tertiary,
                        marginRight: THEME.spacing.lg,
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
                          fontSize: THEME.fontSize.md,
                        }}
                      />
                    ) : (
                      <span>{line}</span>
                    )}
                  </div>
                );
              })}
            </pre>

            {/* Animated highlight box - adjusted for relative positioning */}
            {currentStep?.highlightLines && activeType && (
              <div
                ref={highlightRef}
                style={{
                  position: 'absolute',
                  top: `${
                    (currentStep.highlightLines.start - activeType.startLine) *
                      (1.6 * parseInt(THEME.fontSize.md)) +
                    parseInt(THEME.spacing.lg)
                  }px`,
                  left: THEME.spacing.lg,
                  right: THEME.spacing.lg,
                  height: `${
                    (currentStep.highlightLines.end - currentStep.highlightLines.start + 1) *
                    1.6 * parseInt(THEME.fontSize.md)
                  }px`,
                  border: `2px solid #FFD700`,
                  backgroundColor: 'rgba(255, 215, 0, 0.1)',
                  borderRadius: THEME.radius.md,
                  zIndex: 0,
                  transition: `all 0.3s ease-out`,
                  pointerEvents: 'none',
                }}
              />
            )}
          </>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: THEME.text.secondary,
              fontSize: THEME.fontSize.md,
            }}
          >
            No active type definition
          </div>
        )}
      </div>
    </div>
  );
};
