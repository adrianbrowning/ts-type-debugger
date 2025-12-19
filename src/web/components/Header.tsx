import React, { useCallback } from "react";
import type { VideoData } from "../../core/types.ts";
import type { ThemeMode } from "../hooks/ThemeContext.ts";
import { useTheme } from "../hooks/useThemeHook.ts";
import { GLOBAL_THEME } from "../theme.ts";
import { exportJSON } from "../utils/exportData.ts";

type HeaderProps = {
  onToggleEditor: () => void;
  editorVisible: boolean;
  hasGenerated: boolean;
  videoData: VideoData | null;
};

type ThemeButtonProps = {
  mode: ThemeMode;
  currentMode: ThemeMode;
  onSelect: (mode: ThemeMode) => void;
  icon: string;
};

const ThemeButton: React.FC<ThemeButtonProps> = ({ mode, currentMode, onSelect, icon }) => {
  const theme = GLOBAL_THEME;
  const handleClick = useCallback(() => onSelect(mode), [ mode, onSelect ]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className={currentMode === mode ? "active" : ""}
      style={{
        padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
        backgroundColor: currentMode === mode ? undefined : theme.bg.secondary,
        border: `1px solid ${theme.border.subtle}`,
        borderRadius: theme.radius.sm,
        color: currentMode === mode ? undefined : theme.text.primary,
        cursor: "pointer",
        fontSize: theme.fontSize.xs,
      }}
    >
      {icon}
    </button>
  );
};

const ThemeToggle: React.FC = () => {
  const { mode, setMode } = useTheme();

  const modes: Array<ThemeMode> = [ "system", "light", "dark" ];
  const icons: Record<ThemeMode, string> = {
    system: "Auto",
    light: "Light",
    dark: "Dark",
  };

  return (
    <div className="theme-toggle">
      {modes.map(m => (
        <ThemeButton
          key={m}
          mode={m}
          currentMode={mode}
          onSelect={setMode}
          icon={icons[m]}
        />
      ))}
    </div>
  );
};

/**
 * Header with title and Hide/Show Editor button
 */
export const Header: React.FC<HeaderProps> = ({ onToggleEditor, editorVisible, hasGenerated, videoData }) => {
  const theme = GLOBAL_THEME;

  const handleExport = useCallback(() => {
    if (videoData) {
      exportJSON(videoData);
    }
  }, [ videoData ]);

  const handleExportMouseOver = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    (e.currentTarget as HTMLButtonElement).style.backgroundColor = theme.bg.hover;
  }, [ theme.bg.hover ]);

  const handleExportMouseOut = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    (e.currentTarget as HTMLButtonElement).style.backgroundColor = theme.bg.secondary;
  }, [ theme.bg.secondary ]);

  const handleToggleMouseOver = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    (e.currentTarget as HTMLButtonElement).style.backgroundColor = theme.accent.primaryAlt;
  }, [ theme.accent.primaryAlt ]);

  const handleToggleMouseOut = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    (e.currentTarget as HTMLButtonElement).style.backgroundColor = theme.accent.primary;
  }, [ theme.accent.primary ]);

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: `${theme.spacing.lg} ${theme.spacing.xxl}`,
        backgroundColor: theme.bg.primary,
        borderBottom: `1px solid ${theme.border.subtle}`,
        height: "64px",
        boxSizing: "border-box",
      }}
    >
      <h1
        style={{
          margin: 0,
          color: theme.text.primary,
          fontSize: theme.fontSize["3xl"],
          fontWeight: theme.fontWeight.bold,
          letterSpacing: "-0.5px",
        }}
      >
        {"TS Type Debugger"}
      </h1>

      <div style={{ display: "flex", gap: theme.spacing.md, alignItems: "center" }}>
        <ThemeToggle />

        {hasGenerated && (
          <>
            <button
              type="button"
              onClick={handleExport}
              style={{
                padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                backgroundColor: theme.bg.secondary,
                color: theme.text.primary,
                border: `1px solid ${theme.border.subtle}`,
                borderRadius: theme.radius.md,
                fontSize: theme.fontSize.md,
                fontWeight: theme.fontWeight.semibold,
                cursor: "pointer",
                transition: "background-color 0.2s ease",
              }}
              onMouseOver={handleExportMouseOver}
              onMouseOut={handleExportMouseOut}
            >
              {"Export JSON"}
            </button>
            <button
              type="button"
              onClick={onToggleEditor}
              style={{
                padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                backgroundColor: theme.accent.primary,
                color: theme.accent.btnText,
                border: "none",
                borderRadius: theme.radius.md,
                fontSize: theme.fontSize.md,
                fontWeight: theme.fontWeight.semibold,
                cursor: "pointer",
                transition: "background-color 0.2s ease",
              }}
              onMouseOver={handleToggleMouseOver}
              onMouseOut={handleToggleMouseOut}
            >
              {editorVisible ? "Hide Editor" : "Show Editor"}
            </button>
          </>
        )}
      </div>
    </header>
  );
};
