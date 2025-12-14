import React from 'react';
import Editor from '@monaco-editor/react';
import { useCssTheme } from '../theme.ts';
import { useTheme } from '../hooks/useTheme.tsx';

type MonacoCodeEditorProps = {
  code: string;
  onChange: (code: string) => void;
  isLoading?: boolean;
};

/**
 * Monaco Editor component for TypeScript code editing
 */
export const MonacoCodeEditor: React.FC<MonacoCodeEditorProps> = ({
  code,
  onChange,
  isLoading = false,
}) => {
  const theme = useCssTheme();
  const { isDark } = useTheme();

  // Use vs/vs-dark based on theme mode
  const monacoTheme = isDark ? 'vs-dark' : 'vs';

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      onChange(value);
    }
  };

  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.bg.editor,
        borderRight: `1px solid ${theme.border.subtle}`,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: `${theme.spacing.lg} ${theme.spacing.xl}`,
          borderBottom: `1px solid ${theme.border.subtle}`,
          backgroundColor: theme.bg.primary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <h3
          style={{
            margin: 0,
            color: theme.text.primary,
            fontSize: theme.fontSize['2xl'],
            fontWeight: theme.fontWeight.bold,
          }}
        >
          TypeScript Code
        </h3>
      </div>

      {/* Editor */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <Editor
          height="100%"
          defaultLanguage="typescript"
          value={code}
          onChange={handleEditorChange}
          theme={monacoTheme}
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            fontSize: 14,
            lineHeight: 1.6 * 14,
            fontFamily: '"Fira Code", "Monaco", "Menlo", monospace',
            tabSize: 2,
            insertSpaces: true,
            trimAutoWhitespace: true,
            padding: { top: 16, bottom: 16 },
            lineNumbersMinChars: 3,
            readOnly: isLoading,
          }}
          loading={<div style={{ color: theme.text.secondary }}>Loading editor...</div>}
        />
      </div>
    </div>
  );
};
