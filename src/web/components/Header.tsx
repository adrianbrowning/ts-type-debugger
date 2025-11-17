import React from 'react';
import { THEME } from '../theme.ts';

interface HeaderProps {
  onToggleEditor: () => void;
  editorVisible: boolean;
}

/**
 * Header with title and Hide/Show Editor button
 */
export const Header: React.FC<HeaderProps> = ({ onToggleEditor, editorVisible }) => {
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
    </header>
  );
};
