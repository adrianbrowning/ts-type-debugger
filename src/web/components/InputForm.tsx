import React, { useState } from 'react';
import { useCssTheme } from '../theme.ts';
import { CustomTypes } from '../../base.ts';

type InputFormProps = {
  onGenerate: (code: string, typeName: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
};

/**
 * Input form for type evaluation - web version
 */
export const InputForm: React.FC<InputFormProps> = ({ onGenerate, isLoading, error }) => {
  const theme = useCssTheme();
  const [code, setCode] = useState<string>(`type _result = getter<"">;
` + CustomTypes);
  const [typeName, setTypeName] = useState<string>('_result');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onGenerate(code, typeName);
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        padding: 20,
        backgroundColor: theme.bg.primary,
        border: `1px solid ${theme.border.subtle}`,
        borderRadius: theme.radius.lg,
      }}
    >
      {/* Title */}
      <h2
        style={{
          margin: 0,
          color: theme.text.primary,
          fontSize: theme.fontSize['2xl'],
          fontWeight: theme.fontWeight.semibold,
        }}
      >
        Type Evaluation Debugger
      </h2>

      {/* Code editor */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label
          style={{
            color: theme.text.secondary,
            fontSize: theme.fontSize.sm,
            fontWeight: theme.fontWeight.semibold,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          TypeScript Code
        </label>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={isLoading}
          style={{
            padding: 12,
            backgroundColor: theme.bg.secondary,
            color: theme.text.primary,
            border: `1px solid ${theme.border.subtle}`,
            borderRadius: theme.radius.sm,
            fontFamily: '"Fira Code", monospace',
            fontSize: theme.fontSize.sm,
            lineHeight: 1.5,
            minHeight: 200,
            resize: 'vertical',
            opacity: isLoading ? 0.6 : 1,
            cursor: isLoading ? 'not-allowed' : 'text',
          }}
        />
      </div>

      {/* Type name input */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label
          style={{
            color: theme.text.secondary,
            fontSize: theme.fontSize.sm,
            fontWeight: theme.fontWeight.semibold,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          Type to Evaluate
        </label>
        <input
          type="text"
          value={typeName}
          onChange={(e) => setTypeName(e.target.value)}
          disabled={isLoading}
          placeholder="e.g., _result"
          style={{
            padding: 12,
            backgroundColor: theme.bg.secondary,
            color: theme.text.primary,
            border: `1px solid ${theme.border.subtle}`,
            borderRadius: theme.radius.sm,
            fontFamily: '"Fira Code", monospace',
            fontSize: theme.fontSize.sm,
            opacity: isLoading ? 0.6 : 1,
            cursor: isLoading ? 'not-allowed' : 'text',
          }}
        />
      </div>

      {/* Error message */}
      {error && (
        <div
          style={{
            padding: 12,
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${theme.accent.error}`,
            borderRadius: theme.radius.sm,
            color: theme.accent.error,
            fontSize: theme.fontSize.sm,
          }}
        >
          {error}
        </div>
      )}

      {/* Generate button */}
      <button
        type="submit"
        disabled={isLoading || !code.trim() || !typeName.trim()}
        style={{
          padding: '12px 24px',
          backgroundColor:
            isLoading || !code.trim() || !typeName.trim() ? theme.border.subtle : theme.accent.highlight,
          color: isLoading || !code.trim() || !typeName.trim() ? theme.text.primary : theme.accent.btnText,
          border: 'none',
          borderRadius: theme.radius.sm,
          fontSize: theme.fontSize.md,
          fontWeight: theme.fontWeight.semibold,
          cursor:
            isLoading || !code.trim() || !typeName.trim() ? 'not-allowed' : 'pointer',
          opacity: isLoading || !code.trim() || !typeName.trim() ? 0.6 : 1,
        }}
      >
        {isLoading ? 'Generating...' : 'Generate'}
      </button>
    </form>
  );
};
