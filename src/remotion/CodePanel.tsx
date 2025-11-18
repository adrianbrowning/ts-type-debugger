import React, { useRef, useEffect } from 'react';
import { useCurrentFrame, interpolate, Easing } from 'remotion';
import { LAYOUT, COLORS } from './config';
import { VideoTraceStep, TypeInfo } from '../videoGenerator';

interface CodePanelProps {
  steps: VideoTraceStep[];
  typeAliases: TypeInfo[];
  currentStep: VideoTraceStep | null;
  activeType: TypeInfo | null;
  sourceCode: string;
}

/**
 * Renders code with animated highlight
 */
export const CodePanel: React.FC<CodePanelProps> = ({
  steps,
  typeAliases,
  currentStep,
  activeType,
  sourceCode,
}) => {
  const frame = useCurrentFrame();
  const highlightRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to keep highlight visible
  useEffect(() => {
    if (highlightRef.current && currentStep?.highlightLines && steps.length > 0) {
      // Calculate scroll distance to determine scroll behavior
      const currentStepIndex = currentStep.stepIndex;
      const prevStep = currentStepIndex > 0 ? steps[currentStepIndex - 1] : null;

      let scrollDistance = 0;
      if (prevStep?.highlightLines) {
        scrollDistance = Math.abs(
          currentStep.highlightLines.start - prevStep.highlightLines.start
        );
      }

      // Use instant scroll for large jumps (>30 lines), smooth for small moves
      const behavior = scrollDistance > 30 ? 'auto' : 'smooth';

      highlightRef.current.scrollIntoView({
        behavior: behavior as ScrollBehavior,
        block: 'center',
      });
    }
  }, [currentStep?.stepIndex, steps]);

  /*// Calculate highlight position with smooth animation
  const highlightTop = currentStep?.highlightLines
    ? interpolate(
        frame % (currentStep.duration || 30),
        [0, currentStep.duration || 30],
        [0, 100],
        {
          easing: Easing.linear(),
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        }
      )
    : 0;*/

  return (
    <div
      style={{
        width: LAYOUT.leftPanel.width,
        height: '100%',
        backgroundColor: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 8,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: LAYOUT.code.padding,
          borderBottom: `1px solid ${COLORS.border}`,
          backgroundColor: COLORS.background,
        }}
      >
        <h3
          style={{
            margin: 0,
            color: COLORS.text,
            fontSize: 16,
            fontWeight: 600,
          }}
        >
          {activeType?.name || 'Type Evaluation'}
        </h3>
        {activeType && (
          <p
            style={{
              margin: '8px 0 0 0',
              color: COLORS.textSecondary,
              fontSize: 12,
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
          padding: LAYOUT.code.padding,
          backgroundColor: COLORS.surface,
        }}
      >
        {/* Code content - show only active type definition */}
        {activeType ? (
          <>
            <pre
              style={{
                margin: 0,
                fontFamily: LAYOUT.code.fontFamily,
                fontSize: LAYOUT.code.fontSize,
                lineHeight: LAYOUT.code.lineHeight,
                color: COLORS.text,
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
                        (LAYOUT.code.lineHeight * LAYOUT.code.fontSize)
                    }px`,
                    left: currentStep.highlightLines.chars
                      ? `${40 + 12 + currentStep.highlightLines.chars.start * (LAYOUT.code.fontSize * 0.6)}px`
                      : `${40 + 12}px`,
                    ...(currentStep.highlightLines.chars
                      ? {
                          // width: `${(currentStep.highlightLines.chars.end - currentStep.highlightLines.chars.start) * (LAYOUT.code.fontSize * 0.6)}px`,
                            width: `${(currentStep.highlightLines.chars.end - currentStep.highlightLines.chars.start) + 1}ch`,
                        }
                      : {
                          right: '0px',
                        }),
                    height: `${
                      (currentStep.highlightLines.end - currentStep.highlightLines.start + 1) *
                      LAYOUT.code.lineHeight * LAYOUT.code.fontSize
                    }px`,
                    border: `${LAYOUT.highlight.borderWidth}px solid ${LAYOUT.highlight.borderColor}`,
                    backgroundColor: LAYOUT.highlight.backgroundColor,
                    borderRadius: LAYOUT.highlight.borderRadius,
                    zIndex: 0,
                    transition: `all 0.1s ease-out`,
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
                        color: COLORS.textTertiary,
                        marginRight: '12px',
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
                          fontFamily: LAYOUT.code.fontFamily,
                          fontSize: LAYOUT.code.fontSize,
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
              color: COLORS.textSecondary,
              fontSize: 14,
            }}
          >
            No active type definition
          </div>
        )}
      </div>
    </div>
  );
};
