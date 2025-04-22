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
        <h2 className="text-lg font-semibold mb-2 text-purple-300">Output</h2>
      </div>

      {/* Output Box */}
      <div className="flex-1 px-4 pb-4 overflow-hidden">
        <div className="relative bg-gray-800/60 rounded-xl border border-purple-900/40 backdrop-blur-sm shadow-inner h-full">
          {isExecuting && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800/80 z-10 rounded-xl">
              <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
          )}

          <div className="overflow-y-auto p-4 rounded-xl scroll-smooth min-h-[120px] max-h-[250px] sm:max-h-[300px] md:max-h-[350px]">
            {showPlaceholder ? (
              <p className="text-gray-400 italic">Run code to see output here...</p>
            ) : error ? (
              <pre className="text-red-400 whitespace-pre-wrap break-words">{error}</pre>
            ) : (
              <pre className="text-purple-400 whitespace-pre-wrap break-words">{output}</pre>
            )}
          </div>
        </div>
      </div>

      {/* Custom Input - Always visible */}
      <div className="mt-2 min-h-[160px] flex-shrink-0">
        <CustomInput value={customInput} onChange={onInputChange} />
      </div>
    </div>
  );
}
