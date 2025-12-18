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

  // Filter out internal types and separate used/unused
  const filteredAliases = typeAliases.filter(t => !t.name.startsWith('__'));
  const usedTypes = filteredAliases.filter(t => usedTypeNames.has(t.name));
  const unusedTypes = filteredAliases.filter(t => !usedTypeNames.has(t.name));

  const displayedTypes = showAll ? [...usedTypes, ...unusedTypes] : usedTypes;
  const badgeCount = showAll ? filteredAliases.length : usedTypes.length;
  const unusedCount = unusedTypes.length;

  // Extract type name (with generics) and value from full text
  // e.g., "type Foo<T> = T extends string" -> { name: "Foo<T>", value: "T extends string" }
  const parseTypeDecl = (text: string): { name: string; value: string } => {
    const match = text.match(/^type\s+(\w+(?:<[^>]+>)?)\s*=\s*(.+)$/s);
    if (match) {
      return { name: match[1], value: match[2].trim() };
    }
    return { name: text, value: text };
  };

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
          const parsed = parseTypeDecl(type.text);
          return (
            <div
              key={type.name}
              onClick={() => onTypeClick?.(type.name)}
              style={{
                fontFamily: 'monospace',
                fontSize: theme.fontSize.sm,
                cursor: onTypeClick ? 'pointer' : 'default',
                opacity,
                display: 'flex',
                gap: theme.spacing.sm,
              }}
            >
              <span style={{ color: theme.accent.primary, flexShrink: 0 }}>{parsed.name}</span>
              <span style={{ color: theme.text.secondary }}>=</span>
              <span style={{ color: theme.text.primary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {parsed.value}
              </span>
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
