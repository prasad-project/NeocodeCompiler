import { useRef, useState } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { Play, RotateCcw } from 'lucide-react';
import { Language, EditorTheme } from '../types';

const DEFAULT_CODE: Record<string, string> = {
  typescript: `console.log("Welcome to NeoCompiler");`,
  javascript: `console.log("Welcome to NeoCompiler");`,
  python: `print("Welcome to NeoCompiler")`,
  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Welcome to NeoCompiler");
    }
}`,
  go: `package main

import "fmt"

func main() {
    fmt.Println("Welcome to NeoCompiler")
}`,
  rust: `fn main() {
    println!("Welcome to NeoCompiler");
}`,
  ruby: `puts "Welcome to NeoCompiler"`,
  cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Welcome to NeoCompiler";
    return 0;
}`,
  c: `#include <stdio.h>

int main() {
    printf("Welcome to NeoCompiler\\n");
    return 0;
}`
};

const SUPPORTED_LANGUAGES: Language[] = [
  { id: 'java', name: 'Java', extension: 'java', version: '15.0.2' },
  { id: 'cpp', name: 'C++', extension: 'cpp', version: '10.2.0' },
  { id: 'c', name: 'C', extension: 'c', version: '10.2.0' },
  { id: 'python', name: 'Python', extension: 'py', version: '3.10.0' },
  { id: 'javascript', name: 'JavaScript', extension: 'js', version: '18.15.0' },
  { id: 'typescript', name: 'TypeScript', extension: 'ts', version: '5.0.3' },
  { id: 'go', name: 'Go', extension: 'go', version: '1.16.2' },
  { id: 'rust', name: 'Rust', extension: 'rs', version: '1.68.2' },
  { id: 'ruby', name: 'Ruby', extension: 'rb', version: '3.0.1' }
];

const EDITOR_THEMES: EditorTheme[] = [
  { id: 'vs-dark', name: 'VS Code Dark', theme: 'vs-dark' },
  { id: 'vs-light', name: 'VS Code Light', theme: 'light' },
  { id: 'hc-black', name: 'High Contrast Dark', theme: 'hc-black' },
  { id: 'hc-light', name: 'High Contrast Light', theme: 'hc-light' },
];

interface CodeEditorProps {
  onExecute: (code: string, language: string, version: string, input: string) => Promise<void>;
  isExecuting: boolean;
}

export default function CodeEditor({ onExecute, isExecuting }: CodeEditorProps) {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null); // 💡 store monaco instance
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(() => {
    const savedLangId = localStorage.getItem('selected-language');
    const foundLang = SUPPORTED_LANGUAGES.find(lang => lang.id === savedLangId);
    return foundLang || SUPPORTED_LANGUAGES.find(lang => lang.id === 'java')!;
  });
  const [customInput, setCustomInput] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<EditorTheme>(EDITOR_THEMES[0]);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    const savedCode = localStorage.getItem(`code-${selectedLanguage.id}`);
    editor.setValue(savedCode || DEFAULT_CODE[selectedLanguage.id]);

    const savedTheme = localStorage.getItem('editor-theme');
    if (savedTheme) {
      const theme = EDITOR_THEMES.find(t => t.id === savedTheme);
      if (theme) setSelectedTheme(theme);
    }

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleExecute();
    });

    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF,
      () => {
        editor.getAction("editor.action.formatDocument")?.run();
      }
    );
  };

  const handleExecute = async () => {
    if (!editorRef.current) return;
    const code = editorRef.current.getValue();
    localStorage.setItem(`code-${selectedLanguage.id}`, code);
    await onExecute(code, selectedLanguage.id, selectedLanguage.version, customInput);
  };

  const handleThemeChange = (theme: EditorTheme) => {
    setSelectedTheme(theme);
    localStorage.setItem('editor-theme', theme.id);
    setIsThemeMenuOpen(false);
  };

  const handleLanguageChange = (langId: string) => {
    const newLang = SUPPORTED_LANGUAGES.find(lang => lang.id === langId) || SUPPORTED_LANGUAGES[0];
    setSelectedLanguage(newLang);
    localStorage.setItem('selected-language', newLang.id);

    const savedCode = localStorage.getItem(`code-${langId}`);
    if (editorRef.current && monacoRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        monacoRef.current.editor.setModelLanguage(model, newLang.id);
      }
      editorRef.current.setValue(savedCode || DEFAULT_CODE[langId]);
    }
  };

  const handleResetCode = () => {
    if (editorRef.current) {
      editorRef.current.setValue(DEFAULT_CODE[selectedLanguage.id]);
      localStorage.removeItem(`code-${selectedLanguage.id}`);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
        <div className="relative">
          <select
            value={selectedLanguage.id}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="appearance-none bg-gray-800 text-white pr-10 pl-4 py-2 rounded-md border border-gray-600 shadow-sm hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base cursor-pointer transition-all"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.name} ({lang.version})
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <div className="flex gap-2">
          {/* Reset Button */}
          <button
            onClick={handleResetCode}
            className="p-2 rounded-full hover:bg-gray-700 text-white border border-gray-600 transition group"
            title="Reset to default code"
          >
            <RotateCcw className="w-6 h-5 transition-transform duration-300 group-hover:rotate-[-180deg]" />
          </button>

          {/* Theme Button */}
          <div className="relative">
            <button
              onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
              className="p-2 rounded-full hover:bg-gray-700 text-white border border-gray-600 transition"
              title="Change Theme"
            >
              🎨
            </button>

            {isThemeMenuOpen && (
              <div className="absolute right-0 mt-2 min-w-[12rem] bg-gray-800 rounded-xl shadow-xl border border-gray-700 z-20 overflow-hidden">
                <div className="flex flex-col">
                  {EDITOR_THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => handleThemeChange(theme)}
                      className={`flex items-center gap-2 px-4 py-2 text-sm text-white text-left hover:bg-gray-700 transition-colors ${selectedTheme.id === theme.id ? 'bg-green-700 font-semibold' : ''}`}
                    >
                      <span className="inline-block w-3 h-3 rounded-full bg-white opacity-50"></span>
                      {theme.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Run Code Button */}
          <button
            onClick={handleExecute}
            disabled={isExecuting}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-3xl text-white transition-colors 
    ${isExecuting ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'} 
    px-4 py-2`}
          >
            <Play className="w-5 h-5" />
            {/* Show text only on small screens and up */}
            <span className="hidden sm:inline">
              {isExecuting ? 'Running...' : 'Run Code'}
            </span>
          </button>

        </div>
      </div>

      <div className="flex-1">
        <Editor
          height="100%"
          defaultLanguage={selectedLanguage.id}
          theme={selectedTheme.theme}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            wordWrap: 'on',
            formatOnPaste: true,
            formatOnType: true,
          }}
        />
      </div>
    </div>
  );
}
