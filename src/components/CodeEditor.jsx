import React from 'react'
import { Editor } from '@monaco-editor/react'

export default function CodeEditor({ value, onChange, language = 'java', onSubmit }) {
  const handleBeforeMount = (monaco) => {
    monaco.editor.defineTheme('cool-midnight', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: '818CF8', fontStyle: 'bold' },
        { token: 'keyword.control', foreground: '818CF8' },
        { token: 'storage', foreground: '818CF8' },
        { token: 'storage.type', foreground: '38BDF8' },
        { token: 'type', foreground: '38BDF8' },
        { token: 'type.identifier', foreground: '38BDF8' },
        { token: 'entity.name.type', foreground: '38BDF8' },
        { token: 'entity.name.function', foreground: '60A5FA' },
        { token: 'number', foreground: '60A5FA' },
        { token: 'number.hex', foreground: '60A5FA' },
        { token: 'string', foreground: '34D399' },
        { token: 'comment', foreground: '718096', fontStyle: 'italic' },
        { token: 'delimiter', foreground: '9AA8B8' },
        { token: 'identifier', foreground: 'E8EDF5' },
      ],
      colors: {
        'editor.background': '#0A0E14',
        'editor.foreground': '#E8EDF5',
        'editorLineNumber.foreground': '#4B5563',
        'editorLineNumber.activeForeground': '#38BDF8',
        'editor.lineHighlightBackground': '#151D27',
        'editor.lineHighlightBorder': '#1E2733',
        'editor.selectionBackground': '#1E293B',
        'editor.inactiveSelectionBackground': '#16202E',
        'editorCursor.foreground': '#38BDF8',
        'editorIndentGuide.background': '#151D27',
        'editorIndentGuide.activeBackground': '#26313D',
      }
    })
  }

  return (
    <div style={{ height: '100%', width: '100%', overflow: 'hidden', background: '#0A0E14' }}>
      <Editor
        height="100%"
        theme="cool-midnight"
        beforeMount={handleBeforeMount}
        language={language}
        value={value}
        onChange={(v) => onChange(v || '')}
        onMount={(editor, monaco) => {
          try {
            monaco.editor.setTheme('cool-midnight')
            editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
              if (typeof onSubmit === 'function') {
                onSubmit()
              }
            })
          } catch {}
        }}
        options={{
          minimap: { enabled: false },
          fontSize: 13.5,
          wordWrap: 'on',
          scrollBeyondLastLine: false,
          padding: { top: 12, bottom: 12 },
          fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, Monaco, Consolas, monospace",
          lineNumbers: 'on',
          renderLineHighlight: 'all',
          cursorBlinking: 'smooth'
        }}
      />
    </div>
  )
}
