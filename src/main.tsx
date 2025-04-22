import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { loader } from '@monaco-editor/react';
import App from './App.tsx';
import './index.css';
import { defineMonacoThemes } from './constants/editorThemes';

// Initialize Monaco themes when the editor is loaded
loader.init().then((monaco) => {
  defineMonacoThemes(monaco);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
