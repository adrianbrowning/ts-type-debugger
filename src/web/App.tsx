import { useState, useMemo, useEffect, useCallback } from "react";
import SplitPane, { Pane } from "split-pane-react";
import "split-pane-react/esm/themes/default.css";
import { generateTypeVideo } from "../core/typeDebugger.ts";
import type { VideoData, TypeInfo } from "../core/types.ts";
import { CodePanel } from "./components/CodePanel.tsx";
import { Header } from "./components/Header.tsx";
import { InputSection } from "./components/InputSection.tsx";
import { MonacoCodeEditor } from "./components/MonacoCodeEditor.tsx";
import { StepDetailsPanel } from "./components/StepDetailsPanel.tsx";
import { usePlayback } from "./hooks/usePlayback.ts";
import { useToast } from "./hooks/useToastHook.ts";
import { GLOBAL_THEME } from "./theme.ts";
import { buildShareUrl, getShareStateFromUrl } from "./utils/urlSharing.ts";

/**
 * Main app component with 3-panel layout
 */
// Validation pattern: reject inputs starting with 'type X ='
const TYPE_KEYWORD_PATTERN = /^\s*type\s+\w+\s*=/i;

export const App: React.FC = () => {
  const theme = GLOBAL_THEME;
  const { showToast } = useToast();
  const [ code, setCode ] = useState<string>("");
  const [ typeName, setTypeName ] = useState<string>("");
  const [ videoData, setVideoData ] = useState<VideoData | null>(null);
  const [ isLoading, setIsLoading ] = useState(false);
  const [ error, setError ] = useState<string | null>(null);
  const [ editorVisible, setEditorVisible ] = useState(true);
  const [ typeNameError, setTypeNameError ] = useState<string | null>(null);
  const [ hasGenerated, setHasGenerated ] = useState(false);
  const [ paneSizes, setPaneSizes ] = useState<Array<string | number>>([ "50%", "auto" ]);

  const playback = usePlayback(videoData);

  // Load state from URL on mount
  useEffect(() => {
    const url = new URL(window.location.href);
    const hasCodeParam = url.searchParams.has("code");
    if (!hasCodeParam) return;

    const sharedState = getShareStateFromUrl();
    if (sharedState) {
      setCode(sharedState.code);
      setTypeName(sharedState.typeName);
    }
    else {
      showToast("Failed to load shared code", "error");
    }
    // Keep URL params for re-sharing
  }, [ showToast ]);

  // Keyboard shortcut: Cmd/Ctrl+S to share
  useEffect(() => {
    const handleKeyDownAsync = async (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        const shareUrl = buildShareUrl(typeName, code);
        window.history.replaceState({}, "", shareUrl);
        try {
          await navigator.clipboard.writeText(shareUrl);
          showToast("URL copied to clipboard", "success");
        }
        catch {
          showToast("Failed to copy URL", "error");
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      void handleKeyDownAsync(e);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [ typeName, code, showToast ]);

  // Get active type for current step
  const activeType = useMemo<TypeInfo | null>(() => {
    if (!videoData || !playback.currentStep) return null;

    const activeTypeMap = videoData.activeTypeMap;
    if (activeTypeMap instanceof Map) {
      return activeTypeMap.get(playback.currentStepIndex) || null;
    }
    return (activeTypeMap)[playback.currentStepIndex] || null;
  }, [ videoData, playback.currentStepIndex, playback.currentStep ]);

  // Compute editor margin for slide animation (always px string for consistency)
  const editorMarginLeft = useMemo((): string => {
    if (editorVisible) return "0px";
    return hasGenerated ? `-${theme.size.editorWidth}` : "0px";
  }, [ editorVisible, hasGenerated, theme.size.editorWidth ]);

  const handleToggleEditor = useCallback(() => {
    setEditorVisible(!editorVisible);
  }, [ editorVisible ]);

  const handleTypeNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTypeName(value);
    // Validate on input
    if (TYPE_KEYWORD_PATTERN.test(value)) {
      setTypeNameError("Cannot start with 'type X ='. Enter only the type expression.");
    }
    else {
      setTypeNameError(null);
    }
  }, []);

  const handleButtonMouseOver = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isLoading && typeName.trim() && !typeNameError) {
      (e.currentTarget as HTMLButtonElement).style.backgroundColor =
        theme.accent.primaryAlt;
    }
  }, [ isLoading, typeName, typeNameError, theme.accent.primaryAlt ]);

  const handleButtonMouseOut = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isLoading && typeName.trim() && !typeNameError) {
      (e.currentTarget as HTMLButtonElement).style.backgroundColor =
        theme.accent.primary;
    }
  }, [ isLoading, typeName, typeNameError, theme.accent.primary ]);

  const handleSashMouseEnter = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.backgroundColor = theme.accent.primary;
  }, [ theme.accent.primary ]);

  const handleSashMouseLeave = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.backgroundColor = theme.border.subtle;
  }, [ theme.border.subtle ]);

  const renderSash = useCallback(() => (
    <div
      role="separator"
      aria-orientation="vertical"
      style={{
        width: 4,
        height: "100%",
        backgroundColor: theme.border.subtle,
        cursor: "col-resize",
        transition: "background-color 0.15s",
      }}
      onMouseEnter={handleSashMouseEnter}
      onMouseLeave={handleSashMouseLeave}
    />
  ), [ theme.border.subtle, handleSashMouseEnter, handleSashMouseLeave ]);

  const handleGenerateAsync = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setVideoData(null);

    try {
      const data = await generateTypeVideo(code, typeName, {
        fps: 30,
        secondsPerStep: 1,
      });

      if (!data) {
        setError("Failed to generate video data");
        return;
      }

      setVideoData(data);
      setHasGenerated(true);
      setEditorVisible(false); // Auto-hide editor after successful debug
      setError(null);
    }
    catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      setVideoData(null);
    }
    finally {
      setIsLoading(false);
    }
  }, [ code, typeName ]);

  const handleGenerate = useCallback(() => {
    void handleGenerateAsync();
  }, [ handleGenerateAsync ]);

  // Precompute visibility states
  const shouldShowDebugPanels = hasGenerated && !editorVisible;
  const editorWidth = !editorVisible && hasGenerated ? theme.size.editorWidth : undefined;
  const editorFlex = editorVisible || !hasGenerated ? 1 : undefined;
  const editorMinWidth = !editorVisible && hasGenerated ? theme.size.editorWidth : undefined;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        backgroundColor: theme.bg.primary,
        color: theme.text.primary,
        overflow: "hidden",
        fontFamily: "-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif",
      }}
    >
      {/* Header */}
      <Header
        onToggleEditor={handleToggleEditor}
        editorVisible={editorVisible}
        hasGenerated={hasGenerated}
        videoData={videoData}
      />

      {/* Main Content Area */}
      <div
        style={{
          display: "flex",
          flex: 1,
          overflow: "hidden",
          minHeight: 0,
        }}
      >
        {/* Editor Panel (Hidden/Visible with CSS slide) */}
        <div
          style={{
            width: editorWidth,
            flex: editorFlex,
            display: "flex",
            flexDirection: "column",
            minWidth: editorMinWidth,
            marginLeft: editorMarginLeft,
            transition: "margin-left 0.3s ease-in-out",
            overflow: "hidden",
          }}
        >
          <InputSection
            typeName={typeName}
            onTypeNameChange={handleTypeNameChange}
            typeNameError={typeNameError}
            isLoading={isLoading}
            onGenerate={handleGenerate}
            error={error}
            onButtonMouseOver={handleButtonMouseOver}
            onButtonMouseOut={handleButtonMouseOut}
          />

          <MonacoCodeEditor
            code={code}
            onChange={setCode}
            isLoading={isLoading}
          />
        </div>

        {/* Resizable Debug Panels */}
        {shouldShowDebugPanels && (
          <SplitPane
            split="vertical"
            sizes={paneSizes}
            onChange={setPaneSizes}
            sashRender={renderSash}
          >
            {/* Type Definition Panel */}
            <Pane minSize={200}>
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
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
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
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
                        {"Type Definition"}
                      </h3>
                    </div>
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: theme.text.secondary,
                      }}
                    >
                      {"Generate video to see type definition"}
                    </div>
                  </div>
                )}
              </div>
            </Pane>

            {/* Step Details Panel */}
            <Pane minSize={200}>
              <div style={{ height: "100%", display: "flex", flexDirection: "column", minWidth: 0 }}>
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
