import React, { useState } from 'react';
import { CollapsibleSection } from './CollapsibleSection.tsx';
import { useCssTheme } from '../theme.ts';
import type { TypeInfo } from '../../core/types.ts';

export type GlobalsSectionProps = {
  typeAliases: TypeInfo[];
  usedTypeNames: Set<string>;
  onTypeClick?: (typeName: string) => void;
};

export const GlobalsSection: React.FC<GlobalsSectionProps> = ({
  typeAliases,
  usedTypeNames,
  onTypeClick,
}) => {
  const theme = useCssTheme();
  const [showAll, setShowAll] = useState(false);

  // Separate used and unused types
  const usedTypes = typeAliases.filter(t => usedTypeNames.has(t.name));
  const unusedTypes = typeAliases.filter(t => !usedTypeNames.has(t.name));

  const displayedTypes = showAll ? [...usedTypes, ...unusedTypes] : usedTypes;
  const badgeCount = showAll ? typeAliases.length : usedTypes.length;
  const unusedCount = unusedTypes.length;

  const toggleButton = (
    <button
      onClick={() => setShowAll(!showAll)}
      style={{
        padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
        backgroundColor: theme.bg.hover,
        color: theme.text.secondary,
        border: `1px solid ${theme.border.subtle}`,
        borderRadius: theme.radius.sm,
        fontSize: theme.fontSize.xs,
        cursor: 'pointer',
      }}
    >
      {showAll ? 'Show Used' : 'Show All'}
    </button>
  );

  return (
    <CollapsibleSection
      title="Globals"
      badge={badgeCount}
      headerRight={toggleButton}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
        {displayedTypes.map(type => {
          const isUsed = usedTypeNames.has(type.name);
          const opacity = showAll && !isUsed ? 0.5 : 1;
          return (
            <div
              key={type.name}
              onClick={() => onTypeClick?.(type.name)}
              style={{
                fontFamily: 'monospace',
                fontSize: theme.fontSize.sm,
                color: theme.text.primary,
                cursor: onTypeClick ? 'pointer' : 'default',
                opacity,
              }}
            >
              {type.name}
            </div>
          );
        })}
        {!showAll && unusedCount > 0 && (
          <>
            <hr
              style={{
                border: 'none',
                borderTop: `1px solid ${theme.border.subtle}`,
                margin: `${theme.spacing.sm} 0`,
              }}
            />
            <div
              style={{
                fontSize: theme.fontSize.xs,
                color: theme.text.secondary,
              }}
            >
              {unusedCount} unused {unusedCount === 1 ? 'type' : 'types'} hidden
            </div>
          </>
        )}
      </div>
    </CollapsibleSection>
  );
};
