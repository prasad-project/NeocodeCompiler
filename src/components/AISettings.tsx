import { useState, useEffect } from 'react';
import { X, Save, Key } from 'lucide-react';

interface AISettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AISettings({ isOpen, onClose }: AISettingsProps) {
  const [apiKey, setApiKey] = useState<string>('');
  const [isSaved, setIsSaved] = useState(false);
  const [isUsingDefault, setIsUsingDefault] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Load saved API key when dialog opens
      const savedApiKey = localStorage.getItem('gemini-api-key') || '';
      setApiKey(savedApiKey);
      
      // Check if using default key from .env
      setIsUsingDefault(!savedApiKey && !!import.meta.env.VITE_GEMINI_API_KEY);
    }
  }, [isOpen]);

  const handleSave = () => {
    // Save API key
    if (apiKey.trim()) {
      localStorage.setItem('gemini-api-key', apiKey.trim());
      setIsUsingDefault(false);
    } else {
      // If the user clears the API key, remove it from localStorage
      // which will make the system fall back to the .env key
      localStorage.removeItem('gemini-api-key');
      setIsUsingDefault(!!import.meta.env.VITE_GEMINI_API_KEY);
    }
    
    // Show saved confirmation
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 2000);
  };

  // Handle using default API key
  const handleUseDefault = () => {
    setApiKey('');
    localStorage.removeItem('gemini-api-key');
    setIsUsingDefault(true);
    
    // Show saved confirmation
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl shadow-xl border border-purple-700/50 w-full max-w-md flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-purple-800/30">
          <div className="flex items-center gap-2">
            <Key className="text-purple-400 w-5 h-5" />
            <h3 className="text-white font-medium">Google Gemini API Settings</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-5">
          <div className="mb-6">
            <label className="block text-gray-300 mb-2 text-sm font-medium">Gemini API Key</label>
            <input 
              type="password"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setIsUsingDefault(false);
              }}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              placeholder="Enter your Gemini API key"
            />
            
            {import.meta.env.VITE_GEMINI_API_KEY && (
              <div className="mt-3 flex items-center">
                <input 
                  type="checkbox" 
                  id="useDefault" 
                  checked={isUsingDefault}
                  onChange={() => handleUseDefault()}
                  className="mr-2 accent-purple-500"
                />
                <label htmlFor="useDefault" className="text-sm text-gray-300">
                  Use project's default API key
                </label>
              </div>
            )}
            
            <p className="text-xs text-gray-400 mt-2">
              Get your key at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">Google AI Studio</a>. 
              Your API key is stored locally in your browser.
            </p>
          </div>
          
          <div className="flex justify-end">
            {isSaved && (
              <div className="flex items-center text-green-400 mr-3 text-sm">
                <span>✓ Settings saved</span>
              </div>
            )}
            <button 
              onClick={handleSave}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}