import { Loader2 } from 'lucide-react';

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
  isExecuting
}: OutputPanelProps) {
  return (
    <div className="h-full flex flex-col bg-gray-900 text-white">

      {/* Output Section */}
      <div className="flex-1 px-4 pt-4 overflow-hidden">
        <h2 className="text-lg font-semibold mb-2">Output</h2>

        <div className="bg-gray-800 rounded-lg border border-gray-700 relative">

          {/* Loader Overlay */}
          {isExecuting && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-90 rounded-lg z-10">
              <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
            </div>
          )}

          {/* Output Area */}
          <div className="h-96 overflow-auto p-4 rounded-lg">
            {error ? (
              <pre className="text-red-400 whitespace-pre-wrap">{error}</pre>
            ) : output ? (
              <pre className="text-green-400 whitespace-pre-wrap">{output}</pre>
            ) : (
              <p className="text-gray-400 italic">Run the code and see the output here...</p>
            )}
          </div>
        </div>
      </div>

      {/* Custom Input Section */}
      <div className="px-4 pb-4 pt-2">
        <h2 className="text-base font-semibold mb-2">Custom Input</h2>
        <textarea
          value={customInput}
          onChange={(e) => onInputChange(e.target.value)}
          className="w-full h-20 p-2 bg-gray-800 text-white text-sm rounded-lg resize-none border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Enter your input here..."
        />
      </div>
    </div>
  );
}
