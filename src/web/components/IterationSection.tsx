import React from 'react';
import { CollapsibleSection } from './CollapsibleSection.tsx';
import { InfoRow } from './InfoRow.tsx';
import { useCssTheme } from '../theme.ts';

export type IterationSectionProps = {
  currentMember?: string;
  accumulatedResults?: string;
};

const countNonNeverMembers = (results: string | undefined): number => {
  if (!results?.trim()) return 0;

  return results
    .split(/\s*\|\s*/)
    .filter(m => m.trim() && m.trim() !== 'never')
    .length;
};

const calculateCurrentIndex = (accumulatedResults: string | undefined): number => {
  const count = countNonNeverMembers(accumulatedResults);
  const hasContent = accumulatedResults?.trim();
  const hasOnlyNever = hasContent && count === 0;

  // First iteration (no content yet) shows index 1
  // If only "never" types accumulated, show count 0
  // Otherwise show count of non-never members
  return count === 0 && !hasOnlyNever ? 1 : count;
};

export const IterationSection: React.FC<IterationSectionProps> = ({
  currentMember,
  accumulatedResults,
}) => {
  const theme = useCssTheme();

  if (!currentMember) {
    return null;
  }

  const currentIndex = calculateCurrentIndex(accumulatedResults);
  const displayAccumulated = accumulatedResults?.trim() || 'none';

  return (
    <CollapsibleSection title="Iteration">
      <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
        <InfoRow label="Current Member" value={currentMember} monospace />
        <InfoRow label="Accumulated" value={displayAccumulated} monospace />
        <InfoRow label="Index" value={`${currentIndex} of ?`} />
      </div>
    </CollapsibleSection>
  );
};
