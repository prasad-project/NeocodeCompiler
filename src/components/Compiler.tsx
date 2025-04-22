import { useState } from 'react';
import { Code2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import CodeEditor from './CodeEditor';
import OutputPanel from './OutputPanel';
import { executeCode } from '../services/codeExecution';
import { SUPPORTED_LANGUAGES } from '../constants/editorConfig';

// Import specific icons directly - this avoids the module loading issues
import { FaJava, FaPython, FaRust } from "react-icons/fa";
import { SiJavascript, SiTypescript } from "react-icons/si";
import { FaGolang } from "react-icons/fa6";
import { TbBrandCpp, TbLetterC } from "react-icons/tb";
import { DiRuby } from "react-icons/di";

export default function Compiler() {
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [customInput, setCustomInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [selectedLanguageId, setSelectedLanguageId] = useState(() => {
    const savedLangId = localStorage.getItem('selected-language');
    return savedLangId || SUPPORTED_LANGUAGES[0].id;
  });

  const handleExecute = async (code: string, language: string, version: string, input: string) => {
    setIsExecuting(true);
    setError(undefined);
    setOutput('');

    try {
      const result = await executeCode(code, language, version, input);
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
  };

  const handleLanguageChange = (langId: string) => {
    setSelectedLanguageId(langId);
    localStorage.setItem('selected-language', langId);
  };

  // Language icon map with react-icons
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white flex flex-col font-sans">
      {/* Header */}
      <header className="backdrop-blur-sm bg-gray-900/80 border-b border-purple-900/40 shadow-sm px-6 py-4 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Code2 className="w-7 h-7 text-purple-400" />
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight bg-gradient-to-r from-purple-400 to-violet-500 bg-clip-text text-transparent">NeoCompiler</h1>
          </div>
          <nav>
            <Link
              to="/"
              className="px-4 py-2 text-gray-300 hover:text-white transition-all"
            >
              Back to Home
            </Link>
          </nav>
        </div>
      </header>

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
    </div>
  );
}