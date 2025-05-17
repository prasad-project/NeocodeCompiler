import { useState, useEffect, useCallback, useRef } from 'react';
import { Save } from 'lucide-react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import CodeEditor from './CodeEditor';
import OutputPanel from './OutputPanel';
import AIFloatingButton from './AIFloatingButton';
import SaveCodeDialog from './SaveCodeDialog';
import NavBar from './NavBar';
import LanguageSelector from './LanguageSelector'; // Import the new component
import { executeCode } from '../services/codeExecution';
import { SUPPORTED_LANGUAGES } from '../constants/editorConfig';
import { useAuth } from '../context/AuthContext';
import { getCodeSnippet, getCodeSnippetByShareableLink } from '../services/codeSnippets';
import CodeSuggestionPanel from './ui/CodeSuggestionPanel';

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
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [suggestionData, setSuggestionData] = useState<{
    suggestion: string;
    strengths: string[];
    improvements: string[];
    score?: number;
  } | null>(null);
  
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

  // Handler for code suggestion
  const handleCodeSuggestion = async () => {
    setShowSuggestion(true);
    setSuggestionLoading(true);
    // Use mock data for now to avoid Gemini API errors
    setTimeout(() => {
      setSuggestionData({
        suggestion: `def calculate_monkey_collisions(vertices: int) -> int:\n    MOD = 10**9 + 7\n    # ...rest of the code...`,
        strengths: [
          'The logic to compute the number of collision configurations is correct and utilizes modular arithmetic effectively.',
          'The use of Python\'s built-in pow function for exponentiation is efficient and optimal for the problem constraints.'
        ],
        improvements: [
          'Improve function and variable naming for clarity.',
          'Handle input and output in a more organized way.',
          'Add type hints for better readability and code maintainability.',
          'Consider edge cases and provide documentation for the function.'
        ],
        score: 8
      });
      setSuggestionLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white flex flex-col font-sans">
      {/* Header */}
      <NavBar 
        showCompilerButton={false}
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
      <main className="flex-1 mx-auto w-full p-2 sm:p-6">
        {/* Mobile Language Selector - Horizontal scrollable */}
        <div className="block md:hidden mb-4">
          <LanguageSelector
            selectedLanguageId={selectedLanguageId}
            onSelectLanguage={handleLanguageChange}
            orientation="horizontal"
            className="mb-2"
          />
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
          {/* Desktop Language Sidebar - Vertical scrollable */}
          <div className="hidden md:block w-20">
            <LanguageSelector
              selectedLanguageId={selectedLanguageId}
              onSelectLanguage={handleLanguageChange}
              orientation="vertical"
              maxHeight="calc(100vh - 10rem)"
              className="h-full"
            />
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
              {/* Code Suggestion Button */}
              <div className="p-4 border-t border-purple-900/30 bg-gray-900/70 flex justify-end">
                <button
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold shadow-md transition-all"
                  onClick={handleCodeSuggestion}
                  disabled={suggestionLoading}
                >
                  {suggestionLoading ? 'Loading Suggestion...' : 'Code Suggestion'}
                </button>
              </div>
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

      {/* Code Suggestion Panel */}
      {showSuggestion && suggestionData && (
        <CodeSuggestionPanel
          userCode={getCurrentCode()}
          suggestionCode={suggestionData.suggestion}
          language={getCurrentLanguage().id}
          strengths={suggestionData.strengths}
          improvements={suggestionData.improvements}
          score={suggestionData.score}
        />
      )}
    </div>
  );
}