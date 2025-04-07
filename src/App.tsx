import React, { useState } from 'react';
import CodeEditor from './components/CodeEditor';
import OutputPanel from './components/OutputPanel';
import { Code2 } from 'lucide-react';
import { PistonResponse } from './types';

function App() {
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [customInput, setCustomInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  const executeCode = async (code: string, language: string, version: string, input: string) => {
    setIsExecuting(true);
    setError(undefined);
    setOutput('');

    try {
      const response = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language,
          version,
          files: [
            {
              name: `main.${language}`,
              content: code,
            },
          ],
          stdin: input,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: PistonResponse = await response.json();

      if (result.run.stderr) {
        setError(result.run.stderr);
      } else {
        setOutput(result.run.output);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while executing the code');
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <header className="bg-gray-800 p-4 shadow-lg">
        <div className="container mx-auto flex items-center gap-2">
          <Code2 className="w-8 h-8 text-green-500" />
          <h1 className="text-2xl font-bold text-white">Neo Compiler</h1>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4">
        <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-8rem)]">
          <div className="flex-1 h-[50vh] lg:h-full bg-gray-800 rounded-lg overflow-hidden shadow-xl">
            <CodeEditor onExecute={executeCode} isExecuting={isExecuting} />
          </div>
          <div className="flex-1 h-[50vh] lg:h-full bg-gray-800 rounded-lg overflow-hidden shadow-xl">
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

export default App;