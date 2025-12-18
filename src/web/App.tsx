import { useState, useMemo, useEffect } from 'react';
import SplitPane, { Pane } from 'split-pane-react';
import 'split-pane-react/esm/themes/default.css';
import type { VideoData, TypeInfo } from '../core/types.ts';
import { generateTypeVideo } from '../core/typeDebugger.ts';
import { usePlayback } from './hooks/usePlayback.ts';
import { Header } from './components/Header.tsx';
import { MonacoCodeEditor } from './components/MonacoCodeEditor.tsx';
import { CodePanel } from './components/CodePanel.tsx';
import { StepDetailsPanel } from './components/StepDetailsPanel.tsx';
import { useCssTheme } from './theme.ts';
import { useToast } from './hooks/useToast.tsx';
import { buildShareUrl, getShareStateFromUrl } from './utils/urlSharing.ts';

/**
 * Main app component with 3-panel layout
 */
// Validation pattern: reject inputs starting with 'type X ='
const TYPE_KEYWORD_PATTERN = /^\s*type\s+\w+\s*=/i;

export const App: React.FC = () => {
  const theme = useCssTheme();
  const { showToast } = useToast();
  const [code, setCode] = useState<string>('');
  const [typeName, setTypeName] = useState<string>('');
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editorVisible, setEditorVisible] = useState(true);
  const [typeNameError, setTypeNameError] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [paneSizes, setPaneSizes] = useState<(string | number)[]>(['50%', 'auto']);

  const playback = usePlayback(videoData);

  // Load state from URL on mount
  useEffect(() => {
    const url = new URL(window.location.href);
    const hasCodeParam = url.searchParams.has('code');
    if (!hasCodeParam) return;

    const sharedState = getShareStateFromUrl();
    if (sharedState) {
      setCode(sharedState.code);
      setTypeName(sharedState.typeName);
    } else {
      showToast('Failed to load shared code', 'error');
    }
    // Keep URL params for re-sharing
  }, [showToast]);

  // Keyboard shortcut: Cmd/Ctrl+S to share
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        const shareUrl = buildShareUrl(typeName, code);
        window.history.replaceState({}, '', shareUrl);
        try {
          await navigator.clipboard.writeText(shareUrl);
          showToast('URL copied to clipboard', 'success');
        } catch {
          showToast('Failed to copy URL', 'error');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [typeName, code, showToast]);

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
    setVideoData(null);

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
      setHasGenerated(true);
      setEditorVisible(false); // Auto-hide editor after successful debug
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
        backgroundColor: theme.bg.primary,
        color: theme.text.primary,
        overflow: 'hidden',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Header */}
      <Header
        onToggleEditor={() => setEditorVisible(!editorVisible)}
        editorVisible={editorVisible}
        hasGenerated={hasGenerated}
        videoData={videoData}
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
        {/* Editor Panel (Hidden/Visible with CSS slide) */}
        <div
          style={{
            width: !editorVisible && hasGenerated ? theme.size.editorWidth : undefined,
            flex: editorVisible || !hasGenerated ? 1 : undefined,
            display: 'flex',
            flexDirection: 'column',
            minWidth: !editorVisible && hasGenerated ? theme.size.editorWidth : undefined,
            marginLeft: editorVisible ? 0 : hasGenerated ? `-${theme.size.editorWidth}` : 0,
            transition: 'margin-left 0.3s ease-in-out',
            overflow: 'hidden',
          }}
        >
            {/* Type Input Section - Top with horizontal layout */}
            <div
              style={{
                padding: theme.spacing.lg,
                backgroundColor: theme.bg.primary,
                borderBottom: `1px solid ${theme.border.subtle}`,
                display: 'flex',
                flexDirection: 'column',
                gap: theme.spacing.md,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: theme.spacing.md,
                  alignItems: 'flex-start',
                }}
              >
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
                  placeholder='Enter type expression (e.g., _result or "a" extends string ? true : false)'
                  style={{
                    flex: 1,
                    padding: theme.spacing.md,
                    backgroundColor: theme.bg.editor,
                    color: theme.text.primary,
                    border: `1px solid ${typeNameError ? theme.accent.error : theme.border.subtle}`,
                    borderRadius: theme.radius.md,
                    fontFamily: '"Fira Code", monospace',
                    fontSize: theme.fontSize.md,
                    boxSizing: 'border-box',
                    opacity: isLoading ? 0.6 : 1,
                    cursor: isLoading ? 'not-allowed' : 'text',
                  }}
                />
                <button
                  onClick={handleGenerate}
                  disabled={isLoading || !typeName.trim() || !!typeNameError}
                  style={{
                    padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                    backgroundColor:
                      isLoading || !typeName.trim() || typeNameError
                        ? theme.text.disabled
                        : theme.accent.primary,
                    color:
                      isLoading || !typeName.trim() || typeNameError
                        ? theme.text.primary
                        : theme.accent.btnText,
                    border: 'none',
                    borderRadius: theme.radius.md,
                    fontSize: theme.fontSize.md,
                    fontWeight: theme.fontWeight.semibold,
                    cursor:
                      isLoading || !typeName.trim() || typeNameError
                        ? 'not-allowed'
                        : 'pointer',
                    opacity: isLoading || !typeName.trim() || typeNameError ? 0.6 : 1,
                    transition: 'background-color 0.2s ease',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                  onMouseOver={(e) => {
                    if (!isLoading && typeName.trim() && !typeNameError) {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                        theme.accent.primaryAlt;
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isLoading && typeName.trim() && !typeNameError) {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                        theme.accent.primary;
                    }
                  }}
                >
                  {isLoading ? 'Debugging...' : 'Debug'}
                </button>
              </div>

              {typeNameError && (
                <div
                  style={{
                    padding: theme.spacing.md,
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: `1px solid ${theme.accent.error}`,
                    borderRadius: theme.radius.md,
                    color: theme.accent.error,
                    fontSize: theme.fontSize.sm,
                  }}
                >
                  {typeNameError}
                </div>
              )}

              {error && (
                <div
                  style={{
                    padding: theme.spacing.md,
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: `1px solid ${theme.accent.error}`,
                    borderRadius: theme.radius.md,
                    color: theme.accent.error,
                    fontSize: theme.fontSize.sm,
                  }}
                >
                  {error}
                </div>
              )}
            </div>

            <MonacoCodeEditor
              code={code}
              onChange={setCode}
              isLoading={isLoading}
            />
        </div>

        {/* Resizable Debug Panels */}
        {hasGenerated && !editorVisible && (
          <SplitPane
            split="vertical"
            sizes={paneSizes}
            onChange={setPaneSizes}
            sashRender={() => (
              <div
                style={{
                  width: 4,
                  height: '100%',
                  backgroundColor: theme.border.subtle,
                  cursor: 'col-resize',
                  transition: 'background-color 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.accent.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme.border.subtle;
                }}
              />
            )}
          >
            {/* Type Definition Panel */}
            <Pane minSize={200}>
              <div
                style={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  minWidth: 0,
                  borderRight: `1px solid ${theme.border.subtle}`,
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
                      backgroundColor: theme.bg.secondary,
                    }}
                  >
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
                        Type Definition
                      </h3>
                    </div>
                    <div
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: theme.text.secondary,
                      }}
                    >
                      Generate video to see type definition
                    </div>
                  </div>
                )}
              </div>
            </Pane>

            {/* Step Details Panel */}
            <Pane minSize={200}>
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <StepDetailsPanel
                  currentStep={playback.currentStep}
                  steps={videoData?.steps ?? []}
                  currentStepIndex={playback.currentStepIndex}
                  totalSteps={videoData?.steps.length ?? 0}
                  typeAliases={videoData?.typeAliases ?? []}
                  onJumpToStart={playback.jumpToStart}
                  onPrevious={playback.previousStep}
                  onNext={playback.nextStep}
                  onStepInto={playback.stepInto}
                  onStepOver={playback.stepOver}
                  onStepOut={playback.stepOut}
                  onSeekToStep={playback.seekToStep}
                />
              </div>
            </Pane>
          </SplitPane>
        )}
      </div>
    </div>
  );
};
