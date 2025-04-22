// Custom theme definitions for Monaco Editor
export const defineMonacoThemes = (monaco: any) => {
  // GitHub Dark theme
  monaco.editor.defineTheme('github-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6a737d' },
      { token: 'keyword', foreground: 'ff7b72' },
      { token: 'string', foreground: 'a5d6ff' },
      { token: 'number', foreground: '79c0ff' },
      { token: 'operator', foreground: 'f8f8f2' },
      { token: 'function', foreground: 'd2a8ff' },
      { token: 'variable', foreground: 'ffa657' },
      { token: 'type', foreground: '79c0ff' },
    ],
    colors: {
      'editor.background': '#0d1117',
      'editor.foreground': '#c9d1d9',
      'editor.lineHighlightBackground': '#161b22',
      'editorCursor.foreground': '#c9d1d9',
      'editor.selectionBackground': '#3b5070',
      'editorLineNumber.foreground': '#6e7681',
      'editorLineNumber.activeForeground': '#c9d1d9',
      'editorIndentGuide.background': '#21262d',
    }
  });
  
  // Monokai Dark theme
  monaco.editor.defineTheme('monokai', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '88846f' },
      { token: 'keyword', foreground: 'f92672' },
      { token: 'string', foreground: 'e6db74' },
      { token: 'number', foreground: 'ae81ff' },
      { token: 'operator', foreground: 'f8f8f2' },
      { token: 'function', foreground: '66d9ef', fontStyle: 'italic' },
      { token: 'variable', foreground: 'fd971f' },
      { token: 'type', foreground: 'a6e22e' },
    ],
    colors: {
      'editor.background': '#272822',
      'editor.foreground': '#f8f8f2',
      'editor.lineHighlightBackground': '#3e3d32',
      'editorCursor.foreground': '#f8f8f2',
      'editor.selectionBackground': '#49483e',
      'editorLineNumber.foreground': '#90908a',
      'editorLineNumber.activeForeground': '#f8f8f2',
      'editorIndentGuide.background': '#3b3a32',
    }
  });

  // Dracula Dark theme
  monaco.editor.defineTheme('dracula', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6272a4' },
      { token: 'keyword', foreground: 'ff79c6' },
      { token: 'string', foreground: 'f1fa8c' },
      { token: 'number', foreground: 'bd93f9' },
      { token: 'operator', foreground: 'f8f8f2' },
      { token: 'function', foreground: '50fa7b' },
      { token: 'variable', foreground: 'ffb86c' },
      { token: 'type', foreground: '8be9fd', fontStyle: 'italic' },
    ],
    colors: {
      'editor.background': '#282a36',
      'editor.foreground': '#f8f8f2',
      'editor.lineHighlightBackground': '#44475a',
      'editorCursor.foreground': '#f8f8f2',
      'editor.selectionBackground': '#44475a',
      'editorLineNumber.foreground': '#6272a4',
      'editorLineNumber.activeForeground': '#f8f8f2',
      'editorIndentGuide.background': '#424450',
    }
  });

  // Nord Dark theme
  monaco.editor.defineTheme('nord', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '616e88' },
      { token: 'keyword', foreground: '81a1c1' },
      { token: 'string', foreground: 'a3be8c' },
      { token: 'number', foreground: 'b48ead' },
      { token: 'operator', foreground: 'eceff4' },
      { token: 'function', foreground: '88c0d0' },
      { token: 'variable', foreground: 'd8dee9' },
      { token: 'type', foreground: '8fbcbb' },
    ],
    colors: {
      'editor.background': '#2e3440',
      'editor.foreground': '#d8dee9',
      'editor.lineHighlightBackground': '#3b4252',
      'editorCursor.foreground': '#d8dee9',
      'editor.selectionBackground': '#434c5e',
      'editorLineNumber.foreground': '#4c566a',
      'editorLineNumber.activeForeground': '#d8dee9',
      'editorIndentGuide.background': '#434c5e',
    }
  });

  // One Dark Pro theme
  monaco.editor.defineTheme('one-dark-pro', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '5c6370' },
      { token: 'keyword', foreground: 'c678dd' },
      { token: 'string', foreground: '98c379' },
      { token: 'number', foreground: 'd19a66' },
      { token: 'operator', foreground: 'abb2bf' },
      { token: 'function', foreground: '61afef' },
      { token: 'variable', foreground: 'e06c75' },
      { token: 'type', foreground: '56b6c2' },
    ],
    colors: {
      'editor.background': '#282c34',
      'editor.foreground': '#abb2bf',
      'editor.lineHighlightBackground': '#2c313c',
      'editorCursor.foreground': '#abb2bf',
      'editor.selectionBackground': '#3e4451',
      'editorLineNumber.foreground': '636d83',
      'editorLineNumber.activeForeground': '#abb2bf',
      'editorIndentGuide.background': '#3b4048',
    }
  });

  // Night Owl theme
  monaco.editor.defineTheme('night-owl', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '637777' },
      { token: 'keyword', foreground: 'c792ea' },
      { token: 'string', foreground: 'ecc48d' },
      { token: 'number', foreground: 'f78c6c' },
      { token: 'operator', foreground: '7fdbca' },
      { token: 'function', foreground: '82aaff' },
      { token: 'variable', foreground: 'd7dbe0' },
      { token: 'type', foreground: 'ffcb8b' },
    ],
    colors: {
      'editor.background': '#011627',
      'editor.foreground': '#d6deeb',
      'editor.lineHighlightBackground': '#0e2c45',
      'editorCursor.foreground': '#80a4c2',
      'editor.selectionBackground': '#1d3b53',
      'editorLineNumber.foreground': '4b6479',
      'editorLineNumber.activeForeground': '#c5e4fd',
      'editorIndentGuide.background': '#0e2c45',
    }
  });

  // GitHub Light theme
  monaco.editor.defineTheme('github-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6a737d' },
      { token: 'keyword', foreground: 'd73a49' },
      { token: 'string', foreground: '032f62' },
      { token: 'number', foreground: '005cc5' },
      { token: 'operator', foreground: '005cc5' },
      { token: 'function', foreground: '6f42c1' },
      { token: 'variable', foreground: 'e36209' },
      { token: 'type', foreground: '005cc5' },
    ],
    colors: {
      'editor.background': '#ffffff',
      'editor.foreground': '#24292e',
      'editor.lineHighlightBackground': '#f1f8ff',
      'editorCursor.foreground': '#24292e',
      'editor.selectionBackground': '#c8c8fa',
      'editorLineNumber.foreground': '#1b1f234d',
      'editorLineNumber.activeForeground': '#24292e',
      'editorIndentGuide.background': '#eeeeee',
    }
  });
};