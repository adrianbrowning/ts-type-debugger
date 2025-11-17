import React from 'react';
import type { TypeInfo } from '../../core/types.ts';
import { THEME } from '../theme.ts';

interface TypeDefinitionPanelProps {
  activeType: TypeInfo | null;
}

/**
 * Displays the currently active type definition
 */
export const TypeDefinitionPanel: React.FC<TypeDefinitionPanelProps> = ({ activeType }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: THEME.bg.secondary,
        borderRight: `1px solid ${THEME.border.subtle}`,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
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

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: THEME.spacing.xl,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: activeType ? 'flex-start' : 'center',
        }}
      >
        {activeType ? (
          <>
            <div
              style={{
                alignSelf: 'flex-start',
                width: '100%',
              }}
            >
              <h4
                style={{
                  margin: `0 0 ${THEME.spacing.md} 0`,
                  color: THEME.text.secondary,
                  fontSize: THEME.fontSize.xs,
                  fontWeight: THEME.fontWeight.semibold,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                {activeType.name}
              </h4>
              <pre
                style={{
                  margin: 0,
                  padding: THEME.spacing.md,
                  backgroundColor: THEME.bg.editor,
                  borderRadius: THEME.radius.md,
                  border: `1px solid ${THEME.border.subtle}`,
                  color: THEME.text.primary,
                  fontFamily: '"Fira Code", monospace',
                  fontSize: THEME.fontSize.sm,
                  lineHeight: 1.6,
                  overflow: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {activeType.text}
              </pre>
            </div>
          </>
        ) : (
          <p
            style={{
              color: THEME.text.secondary,
              fontSize: THEME.fontSize.md,
              margin: 0,
              textAlign: 'center',
            }}
          >
            No type selected
          </p>
        )}
      </div>
    </div>
  );
};
