import { useState } from 'react';
import CodeEditor from './components/CodeEditor';
import OutputPanel from './components/OutputPanel';
import { Code2 } from 'lucide-react';
import { executeCode } from './services/codeExecution';

export default function App() {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col font-sans">
      {/* Header */}
      <header className="backdrop-blur-sm bg-gray-800/60 border-b border-gray-700 shadow-sm px-6 py-4 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <Code2 className="w-7 h-7 text-green-400" />
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">NeoCompiler</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4">
        <div className="grid lg:grid-cols-2 gap-6 h-[calc(100vh-7.5rem)]">
          {/* Code Editor */}
          <div className="bg-gray-800/60 border border-gray-700 rounded-2xl shadow-lg backdrop-blur-md overflow-hidden transition-all duration-300 hover:shadow-xl">
            <CodeEditor 
              onExecute={handleExecute} 
              isExecuting={isExecuting}
              customInput={customInput}
            />
          </div>

          {/* Output Panel */}
          <div className="bg-gray-800/60 border border-gray-700 rounded-2xl shadow-lg backdrop-blur-md overflow-hidden transition-all duration-300 hover:shadow-xl">
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
 