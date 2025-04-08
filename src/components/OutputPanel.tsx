import React from 'react';
import { Loader2 } from 'lucide-react';
import CustomInput from './CustomInput';

interface OutputPanelProps {
  output: string;
  error?: string;
  customInput: string;
  onInputChange: (input: string) => void;
  isExecuting: boolean;
}

export default function OutputPanel({
  output,
  error,
  customInput,
  onInputChange,
  isExecuting,
}: OutputPanelProps) {
  const showPlaceholder = !isExecuting && !output && !error;

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white rounded-xl overflow-hidden">
      {/* Output Header */}
      <div className="px-4 pt-4">
        <h2 className="text-lg font-semibold mb-2">Output</h2>
      </div>

      {/* Output Box */}
      <div className="flex-1 px-4 pb-4">
        <div className="relative h-full bg-gray-800/60 rounded-xl border border-gray-700 backdrop-blur-sm shadow-inner">
          {isExecuting && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10 rounded-xl">
              <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
            </div>
          )}

          <div className="h-full max-h-[300px] overflow-auto p-4 rounded-xl scroll-smooth">
            {showPlaceholder ? (
              <p className="text-gray-400 italic">Run code to see output here...</p>
            ) : error ? (
              <pre className="text-red-400 whitespace-pre-wrap">{error}</pre>
            ) : (
              <pre className="text-green-400 whitespace-pre-wrap">{output}</pre>
            )}
          </div>
        </div>
      </div>

      {/* Custom Input */}
      <CustomInput value={customInput} onChange={onInputChange} />
    </div>
  );
}
