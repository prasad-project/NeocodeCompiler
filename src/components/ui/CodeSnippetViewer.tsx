import { useState, useEffect, useRef } from 'react';
import { Check, Copy, ExternalLink } from 'lucide-react';
import Prism from 'prismjs';
import { useNavigate } from 'react-router-dom';

// Import Prism languages to ensure syntax highlighting works for all supported languages
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-ruby';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-yaml';

interface CodeSnippetViewerProps {
    code: string;
    language: string;
    title?: string;
    showHeader?: boolean;
    showCopyButton?: boolean;
    showLanguageTag?: boolean;
    showOpenInCompiler?: boolean;
    maxHeight?: string;
}

export default function CodeSnippetViewer({
    code,
    language,
    title,
    showHeader = true,
    showCopyButton = true,
    showLanguageTag = true,
    showOpenInCompiler = true,
}: CodeSnippetViewerProps) {
    const [isCopied, setIsCopied] = useState(false);
    const [highlightedCode, setHighlightedCode] = useState<string>('');
    const codeElementRef = useRef<HTMLElement>(null);
    const navigate = useNavigate();

    // Normalize language identifier for Prism
    const normalizeLanguage = (lang: string): string => {
        const langLower = lang.toLowerCase();

        // Map some common language aliases
        const langMap: Record<string, string> = {
            'js': 'javascript',
            'ts': 'typescript',
            'py': 'python',
            'sh': 'bash',
            'shell': 'bash',
            'jsx': 'javascript',
            'tsx': 'typescript',
            'yml': 'yaml',
            'cpp': 'cpp',
            'c++': 'cpp',
        };

        return langMap[langLower] || langLower;
    };

    // Perform syntax highlighting once when the component mounts or code/language changes
    useEffect(() => {
        const normalizedLanguage = normalizeLanguage(language);
        
        // Handle the syntax highlighting in a way that prevents layout shifts
        const performHighlighting = () => {
            // Apply highlighting directly to the code without DOM manipulation
            if (Prism.languages[normalizedLanguage]) {
                const highlighted = Prism.highlight(
                    code, 
                    Prism.languages[normalizedLanguage], 
                    normalizedLanguage
                );
                setHighlightedCode(highlighted);
            } else {
                // Fallback if language grammar is not found
                setHighlightedCode(code);
            }
        };
        
        performHighlighting();
    }, [code, language]);

    // Handle copy code to clipboard
    const handleCopyCode = async () => {
        if (!code) return;

        try {
            await navigator.clipboard.writeText(code);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy code:", err);
        }
    };

    // Handle opening code in compiler
    const handleOpenInCompiler = () => {
        // Create a temporary object to pass through state navigation
        // This allows passing the code to the compiler without URL encoding issues
        const compilerData = {
            code,
            language: normalizeLanguage(language)
        };
        
        // Navigate to the compiler with the code and language as state
        navigate('/compiler', { state: { codeData: compilerData } });
    };

    const normalizedLanguage = normalizeLanguage(language);

    return (
        <div className="bg-gray-900 rounded-xl border border-purple-900/40 shadow-lg overflow-hidden backdrop-blur-md transition-all duration-300 hover:border-purple-700/50">
            {/* Terminal-style header */}
            {showHeader && (
                <div className="bg-gray-800/50 px-3 py-2 border-b border-purple-900/30 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="flex space-x-2">
                            <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors cursor-pointer"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-400 transition-colors cursor-pointer"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-400 transition-colors cursor-pointer"></div>
                        </div>
                        {title && <span className="text-sm text-gray-300">{title}</span>}
                    </div>
                    <div className="flex items-center space-x-2">
                        {showLanguageTag && (
                            <div className="flex items-center text-xs text-gray-400 bg-gray-700/50 px-2 py-0.5 rounded-md">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                                <span className="lowercase">{language}</span>
                            </div>
                        )}
                        {showCopyButton && (
                            <button
                                onClick={handleCopyCode}
                                className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700/50 transition-colors"
                                aria-label="Copy code"
                            >
                                {isCopied ? (
                                    <Check className="w-4 h-4 text-green-500" />
                                ) : (
                                    <Copy className="w-4 h-4" />
                                )}
                            </button>
                        )}
                        {showOpenInCompiler && (
                            <button
                                onClick={handleOpenInCompiler}
                                className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700/50 transition-colors"
                                aria-label="Open in compiler"
                            >
                                <ExternalLink className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Code content - using Tailwind classes instead of custom CSS */}
            <div className="overflow-auto relative">                
                {/* Pre-rendered code with highlighting already applied */}
                <pre className="bg-gray-900 font-mono min-h-[50px]">
                    <code 
                        ref={codeElementRef}
                        className={`language-${normalizedLanguage} block p-4 text-sm leading-relaxed whitespace-pre tab-2`}
                        dangerouslySetInnerHTML={{ __html: highlightedCode }}
                    />
                </pre>
            </div>
        </div>
    );
}