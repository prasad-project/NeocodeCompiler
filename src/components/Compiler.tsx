import { useState, useEffect, useCallback, useRef } from 'react';
import { Save } from 'lucide-react';
import { Link, useSearchParams, useNavigate, useParams } from 'react-router-dom';
import CodeEditor from './CodeEditor';
import OutputPanel from './OutputPanel';
import AIFloatingButton from './AIFloatingButton';
import SaveCodeDialog from './SaveCodeDialog';
import NavBar from './NavBar';
import { executeCode } from '../services/codeExecution';
import { SUPPORTED_LANGUAGES } from '../constants/editorConfig';
import { useAuth } from '../context/AuthContext';
import { getCodeSnippet, getCodeSnippetByShareableLink } from '../services/codeSnippets';

// Import specific icons directly - this avoids the module loading issues
import { FaJava, FaPython, FaRust } from "react-icons/fa";
import { SiJavascript, SiTypescript } from "react-icons/si";
import { FaGolang } from "react-icons/fa6";
import { TbBrandCpp, TbLetterC } from "react-icons/tb";
import { DiRuby } from "react-icons/di";

export default function Compiler() {
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const { linkId } = useParams<{ linkId?: string }>();
  const navigate = useNavigate();

  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [customInput, setCustomInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [selectedLanguageId, setSelectedLanguageId] = useState(() => {
    const savedLangId = localStorage.getItem('selected-language');
    return savedLangId || SUPPORTED_LANGUAGES[0].id;
  });
  const [editorInstance, setEditorInstance] = useState<any>(null);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [loadingSnippet, setLoadingSnippet] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  
  // Keep track of the actual current language ID
  const currentLanguageRef = useRef(selectedLanguageId);
  
  // Update ref when selected language changes
  useEffect(() => {
    currentLanguageRef.current = selectedLanguageId;
  }, [selectedLanguageId]);

  // Effect to check if we need to load a snippet from query params or shared link
  useEffect(() => {
    const loadSnippet = async () => {
      setLoadingSnippet(true);
      setLoadingError(null);
      
      try {
        let snippetData;
        const snippetId = searchParams.get('snippet');
        
        // Case 1: We have a snippetId in query params
        if (snippetId) {
          snippetData = await getCodeSnippet(snippetId);
        } 
        // Case 2: We have a linkId from shared URL
        else if (linkId) {
          snippetData = await getCodeSnippetByShareableLink(linkId);
        }
        
        // If we have snippet data, update the editor
        if (snippetData) {
          // Set language
          setSelectedLanguageId(snippetData.language);
          
          // Wait for editor to be initialized
          if (editorInstance) {
            editorInstance.setValue(snippetData.code);
          } else {
            // If editor not yet initialized, wait for it and then set code
            const checkInterval = setInterval(() => {
              if (editorInstance) {
                editorInstance.setValue(snippetData.code);
                clearInterval(checkInterval);
              }
            }, 100);
            
            // Clear interval after 5 seconds to prevent memory leak
            setTimeout(() => clearInterval(checkInterval), 5000);
          }
        }
      } catch (err: any) {
        console.error("Error loading snippet:", err);
        setLoadingError(err.message || "Failed to load the requested snippet");
      } finally {
        setLoadingSnippet(false);
      }
    };
    
    if (searchParams.get('snippet') || linkId) {
      loadSnippet();
    }
  }, [searchParams, linkId, editorInstance]);

  const handleExecute = useCallback(async (code: string, language: string, version: string, input: string) => {
    setIsExecuting(true);
    setError(undefined);
    setOutput('');

    try {
      // Always use the most recent language ID from state
      const currentLangId = currentLanguageRef.current;
      
      // Get the currently selected language info to ensure consistency
      const currentLang = SUPPORTED_LANGUAGES.find(lang => lang.id === currentLangId);
      
      if (!currentLang) {
        throw new Error(`Invalid language selected: ${currentLangId}`);
      }
      
      console.log(`Executing code in ${currentLang.name} (${currentLang.id})`);
      
      // Use the current language info from state, not the one passed from CodeEditor
      const result = await executeCode(code, currentLang.id, currentLang.version, input);
      
      if (result.error) {
        setError(result.error);
      } else {
        setOutput(result.output);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while executing the code');
    } finally {
      setIsExecuting(false);
    }
  }, []);

  const handleLanguageChange = useCallback((langId: string) => {
    // Find the language info to ensure we're setting a valid language
    const newLang = SUPPORTED_LANGUAGES.find(lang => lang.id === langId);
    if (!newLang) {
      console.error(`Invalid language ID: ${langId}`);
      return;
    }
    
    console.log(`Switching language to: ${newLang.name} (${newLang.id})`);
    setSelectedLanguageId(newLang.id);
    // Also update the reference for immediate access
    currentLanguageRef.current = newLang.id;
    localStorage.setItem('selected-language', newLang.id);
  }, []);

  const languageIcons: Record<string, { icon: JSX.Element }> = {
    java: { icon: <FaJava size={30} /> },
    cpp: { icon: <TbBrandCpp size={30} /> },
    c: { icon: <TbLetterC size={30} /> },
    python: { icon: <FaPython size={30} /> },
    javascript: { icon: <SiJavascript size={30} /> },
    typescript: { icon: <SiTypescript size={30} /> },
    go: { icon: <FaGolang size={30} /> },
    rust: { icon: <FaRust size={30} /> },
    ruby: { icon: <DiRuby size={30} /> }
  };

  const getCurrentCode = () => {
    if (editorInstance) {
      return editorInstance.getValue();
    }
    return '';
  };

  const handleInsertAICode = (code: string) => {
    if (!editorInstance) return;

    const selection = editorInstance.getSelection();
    if (selection) {
      editorInstance.executeEdits('ai-assistant', [{
        range: selection,
        text: code,
        forceMoveMarkers: true
      }]);
    } else {
      const model = editorInstance.getModel();
      if (model) {
        const lastLineNumber = model.getLineCount();
        const lastLineLength = model.getLineLength(lastLineNumber);
        const position = { lineNumber: lastLineNumber, column: lastLineLength + 1 };
        editorInstance.setPosition(position);
        editorInstance.trigger('ai-assistant', 'type', { text: '\n\n' + code });
      }
    }
  };

  const getCurrentLanguage = () => {
    const lang = SUPPORTED_LANGUAGES.find(lang => lang.id === selectedLanguageId);
    return {
      id: lang?.id || 'typescript',
      name: lang?.name || 'TypeScript'
    };
  };

  const handleSaveSuccess = (snippetId: string) => {
    // Optionally navigate to the snippet page or just show a success toast
    navigate(`/snippets/${snippetId}`);
  };

  // Additional Save button for navbar
  const SaveButton = (
    <button
      onClick={() => setIsSaveDialogOpen(true)}
      className="hidden sm:flex items-center gap-2 px-3 py-1.5 border border-purple-600/70 rounded-lg hover:bg-purple-600/20 transition-colors"
    >
      <Save className="w-4 h-4" />
      <span>Save Code</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white flex flex-col font-sans">
      {/* Header */}
      <NavBar 
        showCompilerButton={false}
        showHomeButton={true}
        additionalButtons={currentUser ? SaveButton : undefined}
      />

      {/* Loading overlay */}
      {loadingSnippet && (
        <div className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center">
          <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full shadow-lg border border-purple-900/40">
            <div className="flex items-center justify-center space-x-3">
              <svg className="animate-spin h-8 w-8 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <p className="text-lg font-medium text-white">Loading snippet...</p>
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {loadingError && (
        <div className="max-w-3xl mx-auto mt-4">
          <div className="bg-red-900/30 border border-red-800 rounded-lg p-4">
            <p className="text-red-400">{loadingError}</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 mx-auto w-full p-2 sm:p-8">
        {/* Mobile Language Selector - Horizontal Scrollable */}
        <div className="block md:hidden overflow-x-auto pb-4 mb-2 whitespace-nowrap scrollbar-hide">
          <div className="flex space-x-3 px-2 py-2">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const langIcon = languageIcons[lang.id];
              return (
                <button
                  key={lang.id}
                  onClick={() => handleLanguageChange(lang.id)}
                  className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg text-gray-500 font-medium transition-all ${selectedLanguageId === lang.id
                      ? `bg-purple-600/50 text-white shadow-lg ring-2 ring-purple-400`
                      : 'bg-gray-800/80 backdrop-blur-sm hover:bg-purple-800/40'
                    }`}
                  title={`${lang.name} (${lang.version})`}
                >
                  {langIcon.icon}
                  {selectedLanguageId === lang.id && (
                    <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Save button for mobile - visible below sm breakpoint */}
        {currentUser && (
          <div className="sm:hidden mb-2 px-2">
            <button
              onClick={() => setIsSaveDialogOpen(true)}
              className="w-full py-2 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center justify-center gap-2 text-white"
            >
              <Save className="w-4 h-4" />
              <span>Save Code</span>
            </button>
          </div>
        )}

        <div className="flex h-[calc(100vh-8.5rem)] md:h-[calc(100vh-7.5rem)] gap-4">
          {/* Desktop Language Sidebar - Only visible on md screens and above */}
          <div className="hidden md:flex w-16 bg-gray-900/80 border border-purple-900/50 rounded-2xl flex-col items-center py-6 space-y-5 shadow-lg">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const langIcon = languageIcons[lang.id];
              return (
                <button
                  key={lang.id}
                  onClick={() => handleLanguageChange(lang.id)}
                  className={`relative w-11 h-11 flex items-center justify-center rounded-lg text-gray-500 font-medium transition-all ${selectedLanguageId === lang.id
                      ? `bg-purple-600/50 text-white shadow-lg ring-2 ring-purple-400 scale-110`
                      : 'bg-gray-800/80 backdrop-blur-sm hover:bg-purple-800/40 hover:scale-105'
                    }`}
                  title={`${lang.name} (${lang.version})`}
                >
                  {langIcon.icon}

                  {/* Selection indicator */}
                  {selectedLanguageId === lang.id && (
                    <span className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-1.5 h-6 bg-purple-400 rounded-full shadow-md"></span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Main Content Area */}
          <div className="flex-1 grid lg:grid-cols-5 gap-3 md:gap-4 lg:gap-6">
            {/* Code Editor */}
            <div className="lg:col-span-3 bg-gray-900/80 border border-purple-900/50 rounded-2xl shadow-lg backdrop-blur-md overflow-hidden transition-all duration-300 hover:shadow-violet-900/20 hover:shadow-xl">
              <CodeEditor
                onExecute={handleExecute}
                isExecuting={isExecuting}
                customInput={customInput}
                selectedLanguageId={selectedLanguageId}
                onEditorMount={(editor) => setEditorInstance(editor)}
              />
            </div>

            {/* Output Panel */}
            <div className="lg:col-span-2 bg-gray-900/80 border border-purple-900/50 rounded-2xl shadow-lg backdrop-blur-md overflow-hidden transition-all duration-300 hover:shadow-violet-900/20 hover:shadow-xl">
              <OutputPanel
                output={output}
                error={error}
                customInput={customInput}
                onInputChange={setCustomInput}
                isExecuting={isExecuting}
              />
            </div>
          </div>
        </div>
      </main>

      {/* AI Floating Button */}
      <AIFloatingButton
        getCurrentCode={getCurrentCode}
        currentLanguage={getCurrentLanguage()}
        onInsertCode={handleInsertAICode}
      />

      {/* Save Code Dialog */}
      <SaveCodeDialog
        isOpen={isSaveDialogOpen}
        onClose={() => setIsSaveDialogOpen(false)}
        code={getCurrentCode()}
        language={selectedLanguageId}
        onSuccess={handleSaveSuccess}
      />
    </div>
  );
}