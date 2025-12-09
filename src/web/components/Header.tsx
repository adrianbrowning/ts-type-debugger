import React from 'react';
import { THEME } from '../theme.ts';
import type { VideoData } from '../../core/types.ts';
import { exportJSON } from '../utils/exportData.ts';

type HeaderProps = {
  onToggleEditor: () => void;
  editorVisible: boolean;
  hasGenerated: boolean;
  videoData: VideoData | null;
};

/**
 * Header with title and Hide/Show Editor button
 */
export const Header: React.FC<HeaderProps> = ({ onToggleEditor, editorVisible, hasGenerated, videoData }) => {
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
        padding: `${THEME.spacing.lg} ${THEME.spacing.xxl}`,
        backgroundColor: THEME.bg.primary,
        borderBottom: `1px solid ${THEME.border.subtle}`,
        height: '64px',
        boxSizing: 'border-box',
      }}
    >
      <h1
        style={{
          margin: 0,
          color: THEME.text.primary,
          fontSize: THEME.fontSize['3xl'],
          fontWeight: THEME.fontWeight.bold,
          letterSpacing: '-0.5px',
        }}
      >
        TypeScript Type Visualizer
      </h1>

      {hasGenerated && (
        <div style={{ display: 'flex', gap: THEME.spacing.md }}>
          <button
            onClick={handleExport}
            style={{
              padding: `${THEME.spacing.md} ${THEME.spacing.lg}`,
              backgroundColor: THEME.bg.secondary,
              color: THEME.text.primary,
              border: `1px solid ${THEME.border.subtle}`,
              borderRadius: THEME.radius.md,
              fontSize: THEME.fontSize.md,
              fontWeight: THEME.fontWeight.semibold,
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = THEME.bg.hover;
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = THEME.bg.secondary;
            }}
          >
            Export JSON
          </button>
          <button
            onClick={onToggleEditor}
            style={{
              padding: `${THEME.spacing.md} ${THEME.spacing.lg}`,
              backgroundColor: THEME.accent.primary,
              color: THEME.text.primary,
              border: 'none',
              borderRadius: THEME.radius.md,
              fontSize: THEME.fontSize.md,
              fontWeight: THEME.fontWeight.semibold,
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = THEME.accent.primaryAlt;
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = THEME.accent.primary;
            }}
          >
            {editorVisible ? 'Hide Editor' : 'Show Editor'}
          </button>
        </div>
      )}
    </header>
  );
};
