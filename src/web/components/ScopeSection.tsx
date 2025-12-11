import React from 'react';
import { CollapsibleSection } from './CollapsibleSection';
import { THEME } from '../theme.ts';

export type ScopeSectionProps = {
  parameters: Record<string, string>;
};

export const ScopeSection: React.FC<ScopeSectionProps> = ({ parameters }) => {
  const entries = Object.entries(parameters);
  const count = entries.length;

  return (
    <CollapsibleSection title="Scope" badge={count}>
      {count === 0 ? (
        <div style={{ color: THEME.text.secondary }}>No parameters in scope</div>
      ) : (
        <div
          role="list"
          aria-label="Scope parameters"
          style={{ display: 'flex', flexDirection: 'column', gap: THEME.spacing.sm }}
        >
          {entries.map(([name, value]) => (
            <div
              key={name}
              role="listitem"
              style={{ color: THEME.text.primary, fontFamily: 'monospace' }}
            >
              {`${name} = ${value}`}
            </div>
          ))}
        </div>
      )}
    </CollapsibleSection>
  );
};
