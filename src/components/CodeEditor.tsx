import Editor from '@monaco-editor/react';
import { Play, RotateCcw, ChevronDown, Loader2 } from 'lucide-react';
import {
  SUPPORTED_LANGUAGES,
  EDITOR_THEMES,
  EDITOR_OPTIONS
} from '../constants/editorConfig';
import { useCodeEditor } from '../hooks/useCodeEditor';

interface CodeEditorProps {
  onExecute: (code: string, language: string, version: string, input: string) => Promise<void>;
  isExecuting: boolean;
  customInput: string;
}

export default function CodeEditor({ onExecute, isExecuting, customInput }: CodeEditorProps) {
  const {
    selectedLanguage,
    selectedTheme,
    isThemeMenuOpen,
    setIsThemeMenuOpen,
    handleEditorDidMount,
    handleLanguageChange,
    handleThemeChange,
    handleResetCode,
    getCurrentCode
  } = useCodeEditor(async (code: string) => {
    await onExecute(code, selectedLanguage.id, selectedLanguage.version, customInput);
  });

  const handleExecute = async () => {
    const code = getCurrentCode();
    if (code) {
      localStorage.setItem(`code-${selectedLanguage.id}`, code);
      await onExecute(code, selectedLanguage.id, selectedLanguage.version, customInput);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header bar */}
      <div className="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-700">
        {/* Language Selector */}
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
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 items-center">
          {/* Reset */}
          <button
            onClick={handleResetCode}
            className="p-2 rounded-full border border-gray-600 text-white hover:bg-gray-700 transition group"
            title="Reset to default code"
          >
            <RotateCcw className="w-5 h-5 transition-transform group-hover:-rotate-180" />
          </button>

          {/* Theme Menu */}
          <div className="relative">
            <button
              onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
              className="p-2 rounded-full border border-gray-600 text-white hover:bg-gray-700 transition"
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
                      className={`flex items-center gap-2 px-4 py-2 text-sm text-white text-left hover:bg-gray-700 transition-colors ${selectedTheme.id === theme.id ? 'bg-green-700 font-semibold' : ''
                        }`}
                    >
                      <span className="inline-block w-3 h-3 rounded-full bg-white opacity-50"></span>
                      {theme.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Run Button */}
          <button
            onClick={handleExecute}
            disabled={isExecuting}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${isExecuting
                ? 'bg-gray-600 text-white cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white shadow'
              }`}
          >
            {isExecuting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="hidden sm:inline">Running...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span className="hidden sm:inline">Run Code</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden rounded-b-xl">
        <Editor
          height="100%"
          defaultLanguage={selectedLanguage.id}
          theme={selectedTheme.theme}
          onMount={handleEditorDidMount}
          options={EDITOR_OPTIONS}
        />
      </div>
    </div>
  );
}
