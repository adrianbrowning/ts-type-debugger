import React, { useMemo } from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import { LAYOUT, COLORS } from './config';
import { CodePanel } from './CodePanel';
import { ResultsPanel } from './ResultsPanel';
import type { VideoData } from '../videoGenerator';

interface CompositionProps {
  videoData: VideoData;
}

/**
 * Main composition: layout with code and results panels
 */

export const TypeEvalVideo: React.FC<VideoData> = ({steps, activeTypeMap, typeAliases, sourceCode,totalFrames} ) => {
  const frame = useCurrentFrame();

  // Find current step based on frame
  const currentStep = useMemo(() => {
    return steps.find(
      (step) => frame >= step.startFrame && frame < step.endFrame
    );
  }, [frame, steps]);

  // Get active type from precomputed map (handles both Map and plain object)
  const activeType = useMemo(() => {
    if (!currentStep) return null;
    const mapOrObj = activeTypeMap;
    if (mapOrObj instanceof Map) {
      return mapOrObj.get(currentStep.stepIndex) ?? null;
    }
    // Handle JSON deserialized object
    return (mapOrObj as Record<number, any>)[currentStep.stepIndex] ?? null;
  }, [currentStep, activeTypeMap]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.background,
        fontFamily: '"Inter", sans-serif',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Main content area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          gap: 20,
          padding: LAYOUT.padding,
          overflow: 'hidden',
        }}
      >
        {/* Code Panel */}
        <CodePanel
          steps={steps}
          typeAliases={typeAliases}
          currentStep={currentStep ?? null}
          activeType={activeType ?? null}
          sourceCode={sourceCode}
        />

        {/* Results Panel */}
        <ResultsPanel currentStep={currentStep ?? null} />
      </div>

      {/* Footer with progress */}
      <div
        style={{
          padding: '0 ' + LAYOUT.padding,
          paddingBottom: LAYOUT.padding,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: `1px solid ${COLORS.border}`,
          backgroundColor: COLORS.background,
        }}
      >
        <div
          style={{
            fontSize: 12,
            color: COLORS.textSecondary,
          }}
        >
          {currentStep ? `Step ${currentStep.original.step} of ${steps.length}` : 'Ready'}
        </div>

        {/* Progress bar */}
        <div
          style={{
            flex: 1,
            height: 3,
            backgroundColor: COLORS.surface,
            borderRadius: 2,
            overflow: 'hidden',
            margin: '0 20px',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${(frame / totalFrames) * 100}%`,
              backgroundColor: COLORS.info,
              transition: 'width 0.1s linear',
            }}
          />
        </div>

        <div
          style={{
            fontSize: 12,
            color: COLORS.textSecondary,
            minWidth: 60,
            textAlign: 'right',
          }}
        >
          Frame {frame} / {totalFrames}
        </div>
      </div>
    </AbsoluteFill>
  );
};
