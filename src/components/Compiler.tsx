import { useState } from 'react';
import { Code2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import CodeEditor from './CodeEditor';
import OutputPanel from './OutputPanel';
import { executeCode } from '../services/codeExecution';

export default function Compiler() {
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [customInput, setCustomInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

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
      <main className="flex-1 max-w-7xl mx-auto w-full p-4">
        <div className="grid lg:grid-cols-2 gap-6 h-[calc(100vh-7.5rem)]">
          {/* Code Editor */}
          <div className="bg-gray-900/80 border border-purple-900/50 rounded-2xl shadow-lg backdrop-blur-md overflow-hidden transition-all duration-300 hover:shadow-violet-900/20 hover:shadow-xl">
            <CodeEditor 
              onExecute={handleExecute} 
              isExecuting={isExecuting}
              customInput={customInput}
            />
          </div>

          {/* Output Panel */}
          <div className="bg-gray-900/80 border border-purple-900/50 rounded-2xl shadow-lg backdrop-blur-md overflow-hidden transition-all duration-300 hover:shadow-violet-900/20 hover:shadow-xl">
            <OutputPanel
              output={output}
              error={error}
              customInput={customInput}
              onInputChange={setCustomInput}
              isExecuting={isExecuting}
            />
          </div>
        </div>
      </main>
    </div>
  );
}