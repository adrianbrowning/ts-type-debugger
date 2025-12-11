import React from 'react';
import { THEME } from '../theme';

export type InfoRowProps = {
  label: string;
  value: string;
  monospace?: boolean;
  separator?: string;
};

export const InfoRow: React.FC<InfoRowProps> = ({
  label,
  value,
  monospace = false,
  separator = ': '
}) => (
  <div>
    <span style={{ color: THEME.text.secondary }}>{label}{separator}</span>
    <span style={{
      fontFamily: monospace ? 'monospace' : undefined,
      color: THEME.text.primary
    }}>
      {value}
    </span>
  </div>
);
