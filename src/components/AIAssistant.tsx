import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, ChevronsUp, Sparkles, Code, CheckCircle2, Copy, Loader2, Settings } from 'lucide-react';
import { getAICodeAssistance, explainCode, getCodeCompletions } from '../services/aiAssistance';
import { AIAssistantProps, AIAssistanceMode } from '../types';
import AISettings from './AISettings';
import CodeSnippetViewer from './ui/CodeSnippetViewer';

// Define a message structure for our chat
interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  formattedContent?: string;
  highlightedContent?: string; 
  extractedCodeBlocks?: Array<{code: string, language: string}>; // Array of code blocks for CodeSnippetViewer
}

export default function AIAssistant({
  isOpen,
  onClose,
  code,
  language,
  onInsertCode
}: AIAssistantProps) {
  const [prompt, setPrompt] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<AIAssistanceMode>('chat');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const promptInputRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const latestMessageRef = useRef<HTMLDivElement | null>(null);
  const lastMessageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Focus the input when the assistant opens
    if (isOpen && promptInputRef.current) {
      setTimeout(() => promptInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    // Reset error when closed
    if (!isOpen) {
      setError(null);
      setIsLoading(false);
      // We don't reset chat history to maintain conversation
    }
  }, [isOpen]);

  // Modified scroll behavior to scroll to the latest message rather than bottom
  useEffect(() => {
    if (latestMessageRef.current) {
      latestMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [chatHistory]);

  // Helper function to handle setting multiple refs
  const setMultipleRefs = (isLast: boolean, isAssistant: boolean, element: HTMLDivElement | null) => {
    if (isLast) {
      // Set the last message ref always for the last message
      lastMessageRef.current = element;

      // Set the latest assistant message ref only for assistant messages
      if (isAssistant) {
        latestMessageRef.current = element;
      }
    }
  };

  // Helper function to extract code blocks from content
  const extractCodeBlocks = (content: string): Array<{code: string, language: string}> => {
    const codeBlocks: Array<{code: string, language: string}> = [];
    const regex = /```([\w]*)\n([\s\S]*?)```/g;
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      const language = match[1].trim() || 'plaintext';
      const code = match[2].trim();
      
      // Map language aliases
      let normalizedLang = language;
      if (language === 'js') normalizedLang = 'javascript';
      if (language === 'ts') normalizedLang = 'typescript';
      if (language === 'py') normalizedLang = 'python';
      if (language === 'sh' || language === 'shell') normalizedLang = 'bash';
      if (language === 'jsx') normalizedLang = 'javascript';
      if (language === 'tsx') normalizedLang = 'typescript';
      if (language === 'yml') normalizedLang = 'yaml';
      
      codeBlocks.push({
        code,
        language: normalizedLang
      });
    }
    
    return codeBlocks;
  };

  const formatResponse = (text: string): string => {
    const original = text;

    try {
      let formatted = text
        .replace(/^(#+)\s+(.+)$/gm, (_, hashes, title) => `${hashes} ${title}`)
        .replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/(?<!^)\*([^*\n]+)\*/gm, '<em>$1</em>')
        .replace(/^(\s*)\* /gm, '$1• ')
        .replace(/```([a-z]*)\n([\s\S]*?)```/g, (_, lang, codeContent) => {
          return `\`\`\`${lang}\n${codeContent.trim()}\n\`\`\``;
        });

      if (formatted.includes('<strong>') && !formatted.includes('</strong>')) {
        return original;
      }

      return formatted;
    } catch (e) {
      console.error("Error formatting AI response:", e);
      return original;
    }
  };

  const handleModeChange = (newMode: AIAssistanceMode) => {
    setMode(newMode);
    setError(null);

    if (newMode === 'explain' && code) {
      handleExplainMode();
    } else if (newMode === 'complete' && code) {
      handleCompleteMode();
    }
  };

  const handlePromptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt.trim() && mode === 'chat') {
      return;
    }

    // Add user message to chat history immediately
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      content: prompt,
      role: 'user',
      timestamp: new Date()
    };

    setChatHistory(history => [...history, userMessage]);

    // Clear input field
    setPrompt('');

    setIsLoading(true);
    setError(null);

    try {
      // Get context from recent messages to provide to the AI
      const recentMessages = chatHistory.slice(-5).map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n\n');
      const contextPrompt = recentMessages ? `${recentMessages}\n\nUser: ${prompt}` : prompt;

      const result = await getAICodeAssistance({
        prompt: contextPrompt,
        code: code,
        language
      });

      if (!result.success) {
        setError(result.error || 'Failed to get assistance');
      } else {
        // Add AI response to chat history
        const formattedContent = formatResponse(result.suggestion || '');
        const highlightedContent = createMarkupAsString(formattedContent);
        const extractedBlocks = extractCodeBlocks(result.suggestion || '');
        
        const aiMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          content: result.suggestion || '',
          formattedContent: formattedContent,
          highlightedContent: highlightedContent,
          extractedCodeBlocks: extractedBlocks,
          role: 'assistant',
          timestamp: new Date()
        };

        setChatHistory(history => [...history, aiMessage]);
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExplainMode = async () => {
    if (!code.trim()) {
      setError('No code to explain');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await explainCode({
        code: code,
        language
      });

      if (!result.success) {
        setError(result.error || 'Failed to explain code');
      } else {
        // Add AI response to chat history
        const formattedContent = formatResponse(result.suggestion || '');
        const highlightedContent = createMarkupAsString(formattedContent);
        const extractedBlocks = extractCodeBlocks(result.suggestion || '');
        
        const aiMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          content: result.suggestion || '',
          formattedContent: formattedContent,
          highlightedContent: highlightedContent,
          extractedCodeBlocks: extractedBlocks,
          role: 'assistant',
          timestamp: new Date()
        };

        setChatHistory(history => [...history, aiMessage]);
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteMode = async () => {
    if (!code.trim()) {
      setError('No code to complete');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await getCodeCompletions({
        code: code,
        language
      });

      if (!result.success) {
        setError(result.error || 'Failed to complete code');
      } else {
        // Add AI response to chat history
        const formattedContent = formatResponse(result.suggestion || '');
        const highlightedContent = createMarkupAsString(formattedContent);
        const extractedBlocks = extractCodeBlocks(result.suggestion || '');
        
        const aiMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          content: result.suggestion || '',
          formattedContent: formattedContent,
          highlightedContent: highlightedContent,
          extractedCodeBlocks: extractedBlocks,
          role: 'assistant',
          timestamp: new Date()
        };

        setChatHistory(history => [...history, aiMessage]);
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const extractCodeFromResponse = (text: string) => {
    const codeBlockRegex = /```(?:\w+)?\s*([\s\S]*?)```/g;
    const matches = [...text.matchAll(codeBlockRegex)];

    if (matches.length > 0) {
      return matches[0][1].trim();
    }

    return text;
  };

  const handleInsertSuggestion = (messageContent: string) => {
    if (!messageContent) return;

    const codeToInsert = extractCodeFromResponse(messageContent);
    onInsertCode(codeToInsert);
    onClose();
  };

  const handleCopyResponse = (messageContent: string) => {
    if (!messageContent) return;

    navigator.clipboard.writeText(messageContent)
      .then(() => {
        const tempMessage = document.createElement('div');
        tempMessage.className = 'fixed bottom-4 right-4 bg-purple-700 text-white px-4 py-2 rounded shadow-lg';
        tempMessage.textContent = 'Copied to clipboard!';
        document.body.appendChild(tempMessage);

        setTimeout(() => {
          document.body.removeChild(tempMessage);
        }, 2000);
      })
      .catch(err => console.error('Failed to copy: ', err));
  };

  // Function to create a clean format without code blocks (for text content)
  const createTextContent = (content: string): string => {
    if (!content) return '';

    // Instead of removing code blocks, replace them with placeholders we can target
    let textContent = content.replace(/```([\w]*)\n([\s\S]*?)```/g, (_match, _lang, _code, offset) => {
      // Create a unique ID for this code block based on position
      return `<div class="code-block-placeholder" data-position="${offset}"></div>`;
    });
    
    // Format remaining markdown
    textContent = textContent
      .replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(?<!^)\*([^*\n]+)\*/gm, '<em>$1</em>')
      .replace(/^(\s*)\* /gm, '$1• ')
      .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
      .replace(/\n/g, '<br />');
    
    return textContent;
  };

  // Function to create markup as a string (without direct Prism usage)
  const createMarkupAsString = (content: string): string => {
    if (!content) return '';

    let htmlContent = content
      // Format code blocks - we don't do syntax highlighting here anymore since we use CodeSnippetViewer
      .replace(/```([\w]*)\n([\s\S]*?)```/g, (_, lang) => {
        // We're not going to highlight this directly - we extract these with extractCodeBlocks
        // Just return a placeholder that will get replaced later
        return `<div class="code-placeholder" data-language="${lang || 'plaintext'}"></div>`;
      })
      // Format inline code
      .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
      // Convert newlines to <br> (only for text outside of code blocks)
      .replace(/\n/g, '<br />');

    return htmlContent;
  };

  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
  };

  const hasApiKey = () => {
    return !!localStorage.getItem('gemini-api-key') || !!import.meta.env.VITE_GEMINI_API_KEY;
  };

  // Function to clear chat history
  const handleClearChat = () => {
    setChatHistory([]);
  };

  if (!isOpen) return null;

  // Custom component to render a mix of text and code snippets in proper order
  const RichMessageContent = ({ message }: { message: ChatMessage }) => {
    // Ensure extractedCodeBlocks exists and has content
    const hasCodeBlocks = message.extractedCodeBlocks && message.extractedCodeBlocks.length > 0;
    
    if (!message.formattedContent || !hasCodeBlocks) {
      // If no code blocks, just return the formatted content
      return (
        <div 
          className="ai-response formatted-content"
          dangerouslySetInnerHTML={{ __html: createTextContent(message.formattedContent || message.content) }} 
        />
      );
    }

    // Get the text with placeholders
    const textWithPlaceholders = createTextContent(message.formattedContent);
    
    // Split the text by placeholders
    const parts = textWithPlaceholders.split('<div class="code-block-placeholder" data-position="');
    
    return (
      <>
        {parts.map((part, index) => {
          if (index === 0) {
            // First part is always text
            return (
              <div 
                key={`text-${index}`}
                className="ai-response formatted-content" 
                dangerouslySetInnerHTML={{ __html: part }} 
              />
            );
          }
          
          // For other parts, we have a code block followed by text
          const [, textContent] = part.split('"></div>');
          // We capture position but don't need to use it directly
          // const position = parseInt(positionEnd, 10);
          
          // Find the matching code block by index
          const codeBlockIndex = Math.min(index - 1, message.extractedCodeBlocks!.length - 1);
          const codeBlock = message.extractedCodeBlocks![codeBlockIndex];
          
          return (
            <React.Fragment key={`part-${index}`}>
              {/* Render the code block using CodeSnippetViewer */}
              <div className="">
                <CodeSnippetViewer
                  code={codeBlock.code}
                  language={codeBlock.language}
                  maxHeight="300px"
                  showHeader={true}
                />
              </div>
              
              {/* Render the text content that follows */}
              {textContent && (
                <div 
                  className="ai-response formatted-content"
                  dangerouslySetInnerHTML={{ __html: textContent }} 
                />
              )}
            </React.Fragment>
          );
        })}
      </>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl shadow-xl border border-purple-700/50 w-full max-w-3xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-purple-800/30">
          <div className="flex items-center gap-2">
            <Bot className="text-purple-400 w-5 h-5" />
            <h3 className="text-white font-medium">Gemini AI Code Assistant</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClearChat}
              className="text-gray-400 hover:text-white px-2 py-1 text-xs rounded hover:bg-gray-800 transition-colors"
              aria-label="Clear chat"
            >
              Clear Chat
            </button>
            <button
              onClick={handleOpenSettings}
              className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-800 transition-colors"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-800 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex border-b border-purple-800/30">
          <button
            onClick={() => handleModeChange('chat')}
            className={`px-4 py-2 flex items-center gap-2 text-sm font-medium transition-colors ${mode === 'chat'
                ? 'text-purple-400 border-b-2 border-purple-500'
                : 'text-gray-400 hover:text-white'
              }`}
          >
            <Sparkles className="w-4 h-4" />
            Chat
          </button>
          <button
            onClick={() => handleModeChange('complete')}
            className={`px-4 py-2 flex items-center gap-2 text-sm font-medium transition-colors ${mode === 'complete'
                ? 'text-purple-400 border-b-2 border-purple-500'
                : 'text-gray-400 hover:text-white'
              }`}
          >
            <Code className="w-4 h-4" />
            Complete
          </button>
          <button
            onClick={() => handleModeChange('explain')}
            className={`px-4 py-2 flex items-center gap-2 text-sm font-medium transition-colors ${mode === 'explain'
                ? 'text-purple-400 border-b-2 border-purple-500'
                : 'text-gray-400 hover:text-white'
              }`}
          >
            <Bot className="w-4 h-4" />
            Explain
          </button>
        </div>

        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 bg-gray-950/50">
          {/* Chat messages */}
          {chatHistory.length > 0 && (
            <div className="space-y-6 mb-6">
              {chatHistory.map((message, index) => (
                <div
                  key={message.id}
                  ref={(element) => setMultipleRefs(
                    index === chatHistory.length - 1,
                    message.role === 'assistant',
                    element
                  )}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`${message.role === 'user'
                        ? 'max-w-[80%] bg-purple-600 text-white rounded-tr-none rounded-lg p-3'
                        : 'w-full bg-gray-800 text-white rounded-tl-none rounded-lg p-3'
                      }`}
                  >
                    {message.role === 'assistant' ? (
                      <>
                        <div className="prose prose-invert max-w-none">
                          <RichMessageContent message={message} />
                        </div>
                        <div className="flex justify-end gap-2 mt-3 pt-2 border-t border-gray-700/30">
                          <button
                            onClick={() => handleCopyResponse(message.content)}
                            className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors text-white"
                          >
                            <Copy className="w-3 h-3" /> Copy
                          </button>
                          <button
                            onClick={() => handleInsertSuggestion(message.content)}
                            className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors text-white"
                          >
                            <CheckCircle2 className="w-3 h-3" /> Insert
                          </button>
                        </div>
                      </>
                    ) : (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    )}
                  </div>
                </div>
              ))}
              {/* Invisible element to ensure we can always scroll to the bottom */}
              <div className="h-1 w-full" ref={lastMessageRef}></div>
            </div>
          )}

          {isLoading && (
            <div className="flex items-start">
              <div className="w-full bg-gray-800 text-white rounded-lg rounded-tl-none p-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                <p className="text-gray-300">Typing...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4 mt-2">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {chatHistory.length === 0 && !error && !isLoading && mode === 'chat' && (
            <div className="text-center text-gray-400 py-8">
              <Bot className="w-12 h-12 mx-auto text-gray-600 mb-4" />
              <h4 className="text-lg font-medium text-gray-300 mb-1">Gemini AI Code Assistant</h4>
              <p className="max-w-md mx-auto">
                Ask for code examples, help with debugging, or explanations of concepts related to your code.
              </p>
            </div>
          )}
        </div>

        {/* Input area fixed at bottom */}
        {mode === 'chat' && (
          <div className="p-3 border-t border-purple-800/30 bg-gray-900">
            <form onSubmit={handlePromptSubmit} className="relative">
              <textarea
                ref={promptInputRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 rounded-lg border border-gray-700 text-white focus:outline-none focus:border-purple-500 resize-none"
                placeholder="Type your message..."
                rows={2}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handlePromptSubmit(e);
                  }
                }}
              />
              <button
                type="submit"
                className="absolute bottom-3 right-3 p-2 text-white bg-purple-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700 transition-colors"
                disabled={isLoading || !prompt.trim()}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronsUp className="w-4 h-4" />}
              </button>
            </form>
            <p className="text-gray-500 text-xs mt-1 text-center">Press Enter to send, Shift+Enter for new line</p>
          </div>
        )}

        {!hasApiKey() && (
          <div className="bg-yellow-900/20 border-t border-yellow-700/50 px-4 py-3">
            <p className="text-yellow-300 text-sm">
              AI features require a Google Gemini API key. <button className="underline font-medium" onClick={handleOpenSettings}>Configure API key</button>
            </p>
          </div>
        )}

        {mode !== 'chat' && (
          <div className="flex justify-between items-center px-4 py-3 border-t border-purple-800/30">
            {(mode === 'explain' || mode === 'complete') && chatHistory.length === 0 && !isLoading && (
              <button
                onClick={mode === 'explain' ? handleExplainMode : handleCompleteMode}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                {mode === 'explain' ? 'Explain This Code' : 'Complete This Code'}
              </button>
            )}
          </div>
        )}
      </div>

      <AISettings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}