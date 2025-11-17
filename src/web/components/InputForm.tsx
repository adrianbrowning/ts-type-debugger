import React, { useState } from 'react';
import { COLORS } from '../config.ts';
import { CustomTypes } from '../../base.ts';

interface InputFormProps {
  onGenerate: (code: string, typeName: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Input form for type evaluation - web version
 */
export const InputForm: React.FC<InputFormProps> = ({ onGenerate, isLoading, error }) => {
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
        backgroundColor: COLORS.background,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 8,
      }}
    >
      {/* Title */}
      <h2
        style={{
          margin: 0,
          color: COLORS.text,
          fontSize: 18,
          fontWeight: 600,
        }}
      >
        Type Evaluation Debugger
      </h2>

      {/* Code editor */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label
          style={{
            color: COLORS.textSecondary,
            fontSize: 13,
            fontWeight: 600,
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
            backgroundColor: COLORS.surface,
            color: COLORS.text,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 4,
            fontFamily: '"Fira Code", monospace',
            fontSize: 13,
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
            color: COLORS.textSecondary,
            fontSize: 13,
            fontWeight: 600,
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
            backgroundColor: COLORS.surface,
            color: COLORS.text,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 4,
            fontFamily: '"Fira Code", monospace',
            fontSize: 13,
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
            border: `1px solid ${COLORS.error}`,
            borderRadius: 4,
            color: COLORS.error,
            fontSize: 13,
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
            isLoading || !code.trim() || !typeName.trim() ? COLORS.border : COLORS.info,
          color: COLORS.text,
          border: 'none',
          borderRadius: 4,
          fontSize: 14,
          fontWeight: 600,
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
