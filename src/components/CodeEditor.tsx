import Editor from '@monaco-editor/react';
import { Play, RotateCcw, Loader2, Settings, Download, Share2, Palette, Type } from 'lucide-react';
import {
  EDITOR_THEMES,
  EDITOR_OPTIONS
} from '../constants/editorConfig';
import { useCodeEditor } from '../hooks/useCodeEditor';
import { useState } from 'react';

interface CodeEditorProps {
  onExecute: (code: string, language: string, version: string, input: string) => Promise<void>;
  isExecuting: boolean;
  customInput: string;
  selectedLanguageId: string; // New prop for external language selection
  onEditorMount?: (editor: any) => void; // Add new prop to expose editor instance
}

export default function CodeEditor({ 
  onExecute, 
  isExecuting, 
  customInput, 
  selectedLanguageId,
  onEditorMount 
}: CodeEditorProps) {
  const {
    selectedLanguage,
    selectedTheme,
    fontSize,
    isThemeMenuOpen,
    setIsThemeMenuOpen,
    handleEditorDidMount,
    handleThemeChange,
    handleFontSizeChange,
    handleResetCode,
    getCurrentCode
  } = useCodeEditor(
    async (code: string) => {
      await onExecute(code, selectedLanguage.id, selectedLanguage.version, customInput);
    }, 
    selectedLanguageId,
    // Pass the editor instance to parent via onEditorMount
    onEditorMount
  );

  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
  const [isFontSizeMenuOpen, setIsFontSizeMenuOpen] = useState(false);

  const handleExecute = async () => {
    const code = getCurrentCode();
    if (code) {
      localStorage.setItem(`code-${selectedLanguage.id}`, code);
      await onExecute(code, selectedLanguage.id, selectedLanguage.version, customInput);
    }
  };

  // Handle file download
  const handleDownload = () => {
    const code = getCurrentCode();
    if (!code) return;

    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${selectedLanguage.extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsActionsMenuOpen(false); // Close the popup
  };

  // Handle code sharing (copy shareable link)
  const handleShare = () => {
    const code = getCurrentCode();
    if (!code) return;

    navigator.clipboard.writeText(code)
      .then(() => alert('Code copied to clipboard!'))
      .catch(err => console.error('Failed to copy code:', err));

    setIsActionsMenuOpen(false); // Close the popup
  };

  // Handle reset code with popup closing
  const handleResetCodeWithClose = () => {
    handleResetCode();
    setIsActionsMenuOpen(false); // Close the popup
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header bar */}
      <div className="flex items-center justify-between p-4 bg-gray-900 border-b border-purple-900/30">
        {/* Display current language name */}
        <div className="text-white font-semibold">
          {selectedLanguage.name} <span className="text-xs text-gray-400">({selectedLanguage.version})</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 items-center">
          {/* Actions Menu Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsActionsMenuOpen(!isActionsMenuOpen)}
              className="p-2 rounded-full border border-purple-800/50 text-white hover:bg-purple-900/30 transition"
              title="More Actions"
            >
              <Settings className="w-5 h-5" />
            </button>

            {isActionsMenuOpen && (
              <div className="absolute right-0 mt-2 min-w-[12rem] bg-gray-800 rounded-xl shadow-xl border border-purple-800/50 z-20 overflow-hidden">
                <div className="flex flex-col">
                  <button
                    onClick={handleResetCodeWithClose}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-white text-left hover:bg-gray-700 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4 text-purple-400" />
                    Reset Code
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-white text-left hover:bg-gray-700 transition-colors"
                  >
                    <Download className="w-4 h-4 text-purple-400" />
                    Download Code
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-white text-left hover:bg-gray-700 transition-colors"
                  >
                    <Share2 className="w-4 h-4 text-purple-400" />
                    Share Code
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Theme Menu */}
          <div className="relative">
            <button
              onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
              className="p-2 rounded-full border border-purple-800/50 text-white hover:bg-purple-900/30 transition"
              title="Change Theme"
            >
              <Palette className="w-5 h-5" />
            </button>

            {isThemeMenuOpen && (
              <div className="absolute right-0 mt-2 min-w-[12rem] bg-gray-800 rounded-xl shadow-xl border border-purple-800/50 z-20 overflow-hidden">
                <div className="flex flex-col">
                  {EDITOR_THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => handleThemeChange(theme)}
                      className={`flex items-center gap-2 px-4 py-2 text-sm text-white text-left hover:bg-gray-700 transition-colors ${selectedTheme.id === theme.id ? 'bg-purple-700 font-semibold' : ''
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

          {/* Font Size Menu */}
          <div className="relative">
            <button
              onClick={() => setIsFontSizeMenuOpen(!isFontSizeMenuOpen)}
              className="p-2 rounded-full border border-purple-800/50 text-white hover:bg-purple-900/30 transition"
              title="Change Font Size"
            >
              <Type className="w-5 h-5" />
            </button>

            {isFontSizeMenuOpen && (
              <div className="absolute right-0 mt-2 min-w-[12rem] bg-gray-800 rounded-xl shadow-xl border border-purple-800/50 z-20 overflow-hidden">
                <div className="flex flex-col">
                  {[12, 14, 16, 18, 20].map((size) => (
                    <button
                      key={size}
                      onClick={() => {
                        handleFontSizeChange(size);
                        setIsFontSizeMenuOpen(false); // Close the menu after selection
                      }}
                      className={`flex items-center gap-2 px-4 py-2 text-sm text-white text-left hover:bg-gray-700 transition-colors ${fontSize === size ? 'bg-purple-700 font-semibold' : ''
                        }`}
                    >
                      {size}px
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
              ? 'bg-gray-700 text-gray-300 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-700 text-white shadow'
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
          options={{ ...EDITOR_OPTIONS, fontSize }}
          language={selectedLanguage.id}
        />
      </div>
    </div>
  );
}
