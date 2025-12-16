import React from 'react';
import { useCssTheme } from '../theme.ts';
import { useTheme, type ThemeMode } from '../hooks/useTheme.tsx';
import type { VideoData } from '../../core/types.ts';
import { exportJSON } from '../utils/exportData.ts';

type HeaderProps = {
  onToggleEditor: () => void;
  editorVisible: boolean;
  hasGenerated: boolean;
  videoData: VideoData | null;
};

const ThemeToggle: React.FC = () => {
  const { mode, setMode } = useTheme();
  const theme = useCssTheme();

  const modes: ThemeMode[] = ['system', 'light', 'dark'];
  const icons: Record<ThemeMode, string> = {
    system: 'Auto',
    light: 'Light',
    dark: 'Dark',
  };

  return (
    <div className="theme-toggle">
      {modes.map((m) => (
        <button
          key={m}
          onClick={() => setMode(m)}
          className={mode === m ? 'active' : ''}
          style={{
            padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
            backgroundColor: mode === m ? undefined : theme.bg.secondary,
            border: `1px solid ${theme.border.subtle}`,
            borderRadius: theme.radius.sm,
            color: mode === m ? undefined : theme.text.primary,
            cursor: 'pointer',
            fontSize: theme.fontSize.xs,
          }}
        >
          {icons[m]}
        </button>
      ))}
    </div>
  );
};

/**
 * Header with title and Hide/Show Editor button
 */
export const Header: React.FC<HeaderProps> = ({ onToggleEditor, editorVisible, hasGenerated, videoData }) => {
  const theme = useCssTheme();

  const handleExport = () => {
    if (videoData) {
      exportJSON(videoData);
    }
  };

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `${theme.spacing.lg} ${theme.spacing.xxl}`,
        backgroundColor: theme.bg.primary,
        borderBottom: `1px solid ${theme.border.subtle}`,
        height: '64px',
        boxSizing: 'border-box',
      }}
    >
      <h1
        style={{
          margin: 0,
          color: theme.text.primary,
          fontSize: theme.fontSize['3xl'],
          fontWeight: theme.fontWeight.bold,
          letterSpacing: '-0.5px',
        }}
      >
        TS Type Debugger
      </h1>

      <div style={{ display: 'flex', gap: theme.spacing.md, alignItems: 'center' }}>
        <ThemeToggle />

        {hasGenerated && (
          <>
            <button
              onClick={handleExport}
              style={{
                padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                backgroundColor: theme.bg.secondary,
                color: theme.text.primary,
                border: `1px solid ${theme.border.subtle}`,
                borderRadius: theme.radius.md,
                fontSize: theme.fontSize.md,
                fontWeight: theme.fontWeight.semibold,
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
              }}
              onMouseOver={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = theme.bg.hover;
              }}
              onMouseOut={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = theme.bg.secondary;
              }}
            >
              Export JSON
            </button>
            <button
              onClick={onToggleEditor}
              style={{
                padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                backgroundColor: theme.accent.primary,
                color: theme.accent.btnText,
                border: 'none',
                borderRadius: theme.radius.md,
                fontSize: theme.fontSize.md,
                fontWeight: theme.fontWeight.semibold,
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
              }}
              onMouseOver={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = theme.accent.primaryAlt;
              }}
              onMouseOut={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = theme.accent.primary;
              }}
            >
              {editorVisible ? 'Hide Editor' : 'Show Editor'}
            </button>
          </>
        )}
      </div>
    </header>
  );
};
