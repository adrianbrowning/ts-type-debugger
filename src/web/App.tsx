import React, { useState, useMemo } from 'react';
import type { VideoData, TypeInfo } from '../core/types.ts';
import { generateTypeVideo } from '../core/typeDebugger.ts';
import { usePlayback } from './hooks/usePlayback.ts';
import { Header } from './components/Header.tsx';
import { MonacoCodeEditor } from './components/MonacoCodeEditor.tsx';
import { CodePanel } from './components/CodePanel.tsx';
import { StepDetailsPanel } from './components/StepDetailsPanel.tsx';
import { FooterNav } from './components/FooterNav.tsx';
import { THEME } from './theme.ts';
import { CustomTypes } from '../base.ts';

/**
 * Main app component with 3-panel layout
 */
// Validation pattern: reject inputs starting with 'type X ='
const TYPE_KEYWORD_PATTERN = /^\s*type\s+\w+\s*=/i;

export const App: React.FC = () => {
  const [code, setCode] = useState<string>(`type _result = getter<"">;
` + CustomTypes);
  const [typeName, setTypeName] = useState<string>('_result');
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editorVisible, setEditorVisible] = useState(true);
  const [typeNameError, setTypeNameError] = useState<string | null>(null);

  const playback = usePlayback(videoData);

  // Get active type for current step
  const activeType = useMemo<TypeInfo | null>(() => {
    if (!videoData || !playback.currentStep) return null;

    const activeTypeMap = videoData.activeTypeMap;
    if (activeTypeMap instanceof Map) {
      return activeTypeMap.get(playback.currentStepIndex) || null;
    }
    return (activeTypeMap as Record<number, TypeInfo | null>)[playback.currentStepIndex] || null;
  }, [videoData, playback.currentStepIndex]);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await generateTypeVideo(code, typeName, {
        fps: 30,
        secondsPerStep: 1,
      });

      if (!data) {
        setError('Failed to generate video data');
        return;
      }

      setVideoData(data);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      setVideoData(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: THEME.bg.primary,
        color: THEME.text.primary,
        overflow: 'hidden',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Header */}
      <Header
        onToggleEditor={() => setEditorVisible(!editorVisible)}
        editorVisible={editorVisible}
      />

      {/* Main Content Area */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden',
          minHeight: 0,
        }}
      >
        {/* Editor Panel (Hidden/Visible) */}
        {editorVisible && (
          <div
            style={{
              width: THEME.size.editorWidth,
              display: 'flex',
              flexDirection: 'column',
              minWidth: 0,
            }}
          >
            <MonacoCodeEditor
              code={code}
              onChange={setCode}
              isLoading={isLoading}
            />

            {/* Type Input Section */}
            <div
              style={{
                padding: THEME.spacing.lg,
                backgroundColor: THEME.bg.primary,
                borderTop: `1px solid ${THEME.border.subtle}`,
                display: 'flex',
                flexDirection: 'column',
                gap: THEME.spacing.md,
              }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    color: THEME.text.secondary,
                    fontSize: THEME.fontSize.xs,
                    fontWeight: THEME.fontWeight.semibold,
                    marginBottom: THEME.spacing.sm,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Type to Evaluate
                </label>
                <input
                  type="text"
                  value={typeName}
                  onChange={(e) => {
                    const value = e.target.value;
                    setTypeName(value);
                    // Validate on input
                    if (TYPE_KEYWORD_PATTERN.test(value)) {
                      setTypeNameError("Cannot start with 'type X ='. Enter only the type expression.");
                    } else {
                      setTypeNameError(null);
                    }
                  }}
                  disabled={isLoading}
                  placeholder='e.g., _result or "a" extends string ? true : false'
                  style={{
                    width: '100%',
                    padding: THEME.spacing.md,
                    backgroundColor: THEME.bg.editor,
                    color: THEME.text.primary,
                    border: `1px solid ${typeNameError ? THEME.accent.error : THEME.border.subtle}`,
                    borderRadius: THEME.radius.md,
                    fontFamily: '"Fira Code", monospace',
                    fontSize: THEME.fontSize.md,
                    boxSizing: 'border-box',
                    opacity: isLoading ? 0.6 : 1,
                    cursor: isLoading ? 'not-allowed' : 'text',
                  }}
                />
              </div>

              {typeNameError && (
                <div
                  style={{
                    padding: THEME.spacing.md,
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: `1px solid ${THEME.accent.error}`,
                    borderRadius: THEME.radius.md,
                    color: THEME.accent.error,
                    fontSize: THEME.fontSize.sm,
                  }}
                >
                  {typeNameError}
                </div>
              )}

              {error && (
                <div
                  style={{
                    padding: THEME.spacing.md,
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: `1px solid ${THEME.accent.error}`,
                    borderRadius: THEME.radius.md,
                    color: THEME.accent.error,
                    fontSize: THEME.fontSize.sm,
                  }}
                >
                  {error}
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={isLoading || !code.trim() || !typeName.trim() || !!typeNameError}
                style={{
                  padding: THEME.spacing.md,
                  backgroundColor:
                    isLoading || !code.trim() || !typeName.trim() || typeNameError
                      ? THEME.text.disabled
                      : THEME.accent.primary,
                  color: THEME.text.primary,
                  border: 'none',
                  borderRadius: THEME.radius.md,
                  fontSize: THEME.fontSize.md,
                  fontWeight: THEME.fontWeight.semibold,
                  cursor:
                    isLoading || !code.trim() || !typeName.trim() || typeNameError
                      ? 'not-allowed'
                      : 'pointer',
                  opacity: isLoading || !code.trim() || !typeName.trim() || typeNameError ? 0.6 : 1,
                  transition: 'background-color 0.2s ease',
                }}
                onMouseOver={(e) => {
                  if (!isLoading && code.trim() && typeName.trim() && !typeNameError) {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                      THEME.accent.primaryAlt;
                  }
                }}
                onMouseOut={(e) => {
                  if (!isLoading && code.trim() && typeName.trim() && !typeNameError) {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                      THEME.accent.primary;
                  }
                }}
              >
                {isLoading ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </div>
        )}

        {/* Type Definition Panel */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            borderRight: `1px solid ${THEME.border.subtle}`,
          }}
        >
          {videoData ? (
            <CodePanel
              currentStep={playback.currentStep}
              activeType={activeType}
              sourceCode={videoData.sourceCode}
            />
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                backgroundColor: THEME.bg.secondary,
              }}
            >
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
                  Type Definition
                </h3>
              </div>
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: THEME.text.secondary,
                }}
              >
                Generate video to see type definition
              </div>
            </div>
          )}
        </div>

        {/* Step Details Panel */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <StepDetailsPanel currentStep={playback.currentStep} />
        </div>
      </div>

      {/* Footer Navigation */}
      {videoData && (
        <FooterNav
          videoData={videoData}
          currentStepIndex={playback.currentStepIndex}
          isPlaying={playback.isPlaying}
          speed={playback.speed}
          onTogglePlayPause={playback.togglePlayPause}
          onNextStep={playback.nextStep}
          onPreviousStep={playback.previousStep}
          onSetSpeed={playback.setSpeed}
          onSeekToStep={playback.seekToStep}
        />
      )}
    </div>
  );
};
