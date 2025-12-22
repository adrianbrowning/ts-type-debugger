import { useState, useMemo, useEffect, useCallback } from "react";
import SplitPane, { Pane } from "split-pane-react";
import "split-pane-react/esm/themes/default.css";
import { generateTypeVideo } from "../core/typeDebugger.ts";
import type { VideoData, TypeInfo } from "../core/types.ts";
import { CodePanel } from "./components/CodePanel.tsx";
import { Header } from "./components/Header.tsx";
import { InputSection } from "./components/InputSection.tsx";
import { LandingPage } from "./components/LandingPage.tsx";
import { MonacoCodeEditor } from "./components/MonacoCodeEditor.tsx";
import { StepDetailsPanel } from "./components/StepDetailsPanel.tsx";
import { usePlayback } from "./hooks/usePlayback.ts";
import { useToast } from "./hooks/useToastHook.ts";
import { GLOBAL_THEME } from "./theme.ts";
import { buildShareUrl, getShareStateFromUrl } from "./utils/urlSharing.ts";

// Collapsed editor width for chevron button
const COLLAPSED_EDITOR_WIDTH = 32;

/**
 * Main app component with 3-panel layout
 */
// Validation pattern: reject inputs starting with 'type X ='
const TYPE_KEYWORD_PATTERN = /^\s*type\s+\w+\s*=/i;

type AppView = "landing" | "debugger";

// Get initial view from URL path
const getInitialView = (): AppView => {
  const path = window.location.pathname;
  // Check for /debugger path (with or without trailing slash)
  if (path === "/debugger" || path === "/debugger/") {
    return "debugger";
  }
  return "landing";
};

export const App: React.FC = () => {
  const theme = GLOBAL_THEME;
  const { showToast } = useToast();
  const [ view, setView ] = useState<AppView>(getInitialView);
  const [ code, setCode ] = useState<string>("");
  const [ typeName, setTypeName ] = useState<string>("");
  const [ videoData, setVideoData ] = useState<VideoData | null>(null);
  const [ isLoading, setIsLoading ] = useState(false);
  const [ error, setError ] = useState<string | null>(null);
  const [ editorCollapsed, setEditorCollapsed ] = useState(false);
  const [ typeNameError, setTypeNameError ] = useState<string | null>(null);
  const [ hasGenerated, setHasGenerated ] = useState(false);
  const [ debugPanesEnabled, setDebugPanesEnabled ] = useState(false);
  const [ paneSizes, setPaneSizes ] = useState<Array<string | number>>([ "50%", "50%" ]);

  const playback = usePlayback(videoData);

  // Load shared state from URL on mount (for /debugger?code=... links)
  useEffect(() => {
    const url = new URL(window.location.href);
    const hasCodeParam = url.searchParams.has("code");
    if (!hasCodeParam) return;

    const sharedState = getShareStateFromUrl();
    if (sharedState) {
      setCode(sharedState.code);
      setTypeName(sharedState.typeName);
      // Ensure we're on debugger view when loading shared code
      if (view !== "debugger") {
        setView("debugger");
        window.history.replaceState({}, "", `/debugger${window.location.search}`);
      }
    }
    else {
      showToast("Failed to load shared code", "error");
    }
  }, [ showToast, view ]);

  // Sync URL with view changes
  useEffect(() => {
    const currentPath = window.location.pathname;
    const targetPath = view === "debugger" ? "/debugger" : "/";

    // Only update if path doesn't match (avoid unnecessary history entries)
    const isOnDebugger = currentPath === "/debugger" || currentPath === "/debugger/";
    const shouldBeOnDebugger = view === "debugger";

    if (isOnDebugger !== shouldBeOnDebugger) {
      // Preserve query params when switching views
      const search = window.location.search;
      window.history.pushState({}, "", `${targetPath}${search}`);
    }
  }, [ view ]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      setView(getInitialView());
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Handler for landing page "Try It" button
  const handleTryIt = useCallback((newCode: string, newTypeName: string) => {
    setCode(newCode);
    setTypeName(newTypeName);
    setView("debugger");
  }, []);

  // Handler to go back to landing page
  const handleBackToLanding = useCallback(() => {
    setView("landing");
  }, []);

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

  // Toggle editor collapse
  const handleToggleEditor = useCallback(() => {
    const newCollapsed = !editorCollapsed;
    setEditorCollapsed(newCollapsed);
    // When collapsing, enable debug panes if we have generated data
    if (newCollapsed && hasGenerated) {
      setDebugPanesEnabled(true);
    }
    // When expanding, disable debug panes (stale until re-debug)
    if (!newCollapsed) {
      setDebugPanesEnabled(false);
    }
  }, [ editorCollapsed, hasGenerated ]);

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
      setEditorCollapsed(true); // Collapse editor after successful debug
      setDebugPanesEnabled(true); // Enable debug panes
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

  // Render landing page if in landing view
  if (view === "landing") {
    return <LandingPage onTryIt={handleTryIt} />;
  }

  // Disabled overlay style for debug panes
  const disabledOverlayStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: theme.text.secondary,
    fontSize: theme.fontSize.md,
    zIndex: 10,
    pointerEvents: "none",
  };

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
        editorVisible={!editorCollapsed}
        hasGenerated={hasGenerated}
        videoData={videoData}
        onBackToLanding={handleBackToLanding}
      />

      {/* Main Content Area - 3 Panel Layout */}
      <div
        style={{
          display: "flex",
          flex: 1,
          overflow: "hidden",
          minHeight: 0,
        }}
      >
        {/* Editor Panel - Collapsible */}
        <div
          style={{
            width: editorCollapsed ? COLLAPSED_EDITOR_WIDTH : "33%",
            minWidth: editorCollapsed ? COLLAPSED_EDITOR_WIDTH : 300,
            maxWidth: editorCollapsed ? COLLAPSED_EDITOR_WIDTH : "50%",
            display: "flex",
            flexDirection: "column",
            borderRight: `1px solid ${theme.border.subtle}`,
            transition: "width 0.3s ease-in-out, min-width 0.3s ease-in-out, max-width 0.3s ease-in-out",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {editorCollapsed ? (
            /* Collapsed state - show expand chevron */
            <button
              type="button"
              onClick={handleToggleEditor}
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: theme.bg.secondary,
                border: "none",
                cursor: "pointer",
                color: theme.text.secondary,
                fontSize: "20px",
                transition: "background-color 0.15s, color 0.15s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = theme.bg.hover;
                e.currentTarget.style.color = theme.text.primary;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = theme.bg.secondary;
                e.currentTarget.style.color = theme.text.secondary;
              }}
              title="Expand Editor"
            >
              {"›"}
            </button>
          ) : (
            /* Expanded state - show editor */
            <>
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
            </>
          )}
        </div>

        {/* Debug Panels - Always visible, faded when disabled */}
        <SplitPane
          split="vertical"
          sizes={paneSizes}
          onChange={setPaneSizes}
          sashRender={renderSash}
        >
          {/* Eval Target Panel (Type Definition) */}
          <Pane minSize={200}>
            <div
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                minWidth: 0,
                borderRight: `1px solid ${theme.border.subtle}`,
                position: "relative",
              }}
            >
              {videoData && debugPanesEnabled ? (
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
                      {"Eval Target"}
                    </h3>
                  </div>
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: theme.text.tertiary,
                    }}
                  >
                    {"Click Debug to evaluate"}
                  </div>
                </div>
              )}
              {/* Disabled overlay */}
              {!debugPanesEnabled && (
                <div style={disabledOverlayStyle}>
                  <span>{"Click Debug to enable"}</span>
                </div>
              )}
            </div>
          </Pane>

          {/* Call Stack Panel */}
          <Pane minSize={200}>
            <div
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                minWidth: 0,
                position: "relative",
              }}
            >
              {videoData && debugPanesEnabled ? (
                <StepDetailsPanel
                  currentStep={playback.currentStep}
                  steps={videoData.steps}
                  currentStepIndex={playback.currentStepIndex}
                  totalSteps={videoData.steps.length}
                  typeAliases={videoData.typeAliases}
                  onJumpToStart={playback.jumpToStart}
                  onPrevious={playback.previousStep}
                  onNext={playback.nextStep}
                  onStepInto={playback.stepInto}
                  onStepOver={playback.stepOver}
                  onStepOut={playback.stepOut}
                  onSeekToStep={playback.seekToStep}
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
                      {"Call Stack"}
                    </h3>
                  </div>
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: theme.text.tertiary,
                    }}
                  >
                    {"Click Debug to evaluate"}
                  </div>
                </div>
              )}
              {/* Disabled overlay */}
              {!debugPanesEnabled && (
                <div style={disabledOverlayStyle}>
                  <span>{"Click Debug to enable"}</span>
                </div>
              )}
            </div>
          </Pane>
        </SplitPane>
      </div>
    </div>
  );
};
