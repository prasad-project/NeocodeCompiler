import { useState, useRef, useEffect, useCallback } from 'react';
import { SUPPORTED_LANGUAGES, EDITOR_THEMES, DEFAULT_CODE } from '../constants/editorConfig';

// Add type declaration for window
declare global {
    interface Window {
        __MONACO_EDITOR__: any;
    }
}

export function useCodeEditor(
    onExecute?: (code: string) => void, 
    externalLanguageId?: string,
    onEditorMount?: (editor: any) => void // Add new parameter to pass editor instance to parent
) {
    const editorRef = useRef<any>(null);
    const monacoRef = useRef<any>(null);
    const previousLanguageRef = useRef<string | null>(null);

    // 🔁 Load selected language from localStorage or default to Java
    const [selectedLanguage, setSelectedLanguage] = useState(() => {
        // If an external language ID is provided, use it
        if (externalLanguageId) {
            const lang = SUPPORTED_LANGUAGES.find((lang) => lang.id === externalLanguageId);
            if (lang) {
                previousLanguageRef.current = lang.id;
                return lang;
            }
        }
        
        // Otherwise use localStorage
        const savedLangId = localStorage.getItem('selected-language');
        const lang = SUPPORTED_LANGUAGES.find((lang) => lang.id === savedLangId);
        if (lang) {
            previousLanguageRef.current = lang.id;
            return lang;
        }
        
        // Default to first language in the list
        previousLanguageRef.current = SUPPORTED_LANGUAGES[0].id;
        return SUPPORTED_LANGUAGES[0];
    });

    // Listen for changes to externalLanguageId prop - critical for syncing language state
    useEffect(() => {
        if (externalLanguageId && externalLanguageId !== selectedLanguage.id) {
            console.log(`Language change detected in useCodeEditor: ${externalLanguageId} (previous: ${selectedLanguage.id})`);
            
            const newLang = SUPPORTED_LANGUAGES.find((lang) => lang.id === externalLanguageId);
            if (!newLang) {
                console.error(`Invalid language ID received: ${externalLanguageId}`);
                return;
            }
            
            setSelectedLanguage(newLang);
            previousLanguageRef.current = newLang.id;
            
            // Update editor's language when it's mounted
            if (editorRef.current && monacoRef.current) {
                // Set default code for the language if there's no saved code
                const savedCode = localStorage.getItem(`code-${newLang.id}`);
                const defaultCode = DEFAULT_CODE[newLang.id] || '';
                const codeToSet = savedCode || defaultCode;
                
                editorRef.current.setValue(codeToSet);
                
                // Update the editor language model
                if (editorRef.current.getModel()) {
                    monacoRef.current.editor.setModelLanguage(
                        editorRef.current.getModel(),
                        newLang.id
                    );
                }
            }
        }
    }, [externalLanguageId]);

    const [selectedTheme, setSelectedTheme] = useState(() => {
        const savedThemeId = localStorage.getItem('editor-theme');
        return EDITOR_THEMES.find((t) => t.id === savedThemeId) || EDITOR_THEMES[0];
    });

    // Add font size state with localStorage persistence
    const [fontSize, setFontSize] = useState(() => {
        const savedFontSize = localStorage.getItem('editor-font-size');
        return savedFontSize ? parseInt(savedFontSize, 10) : 14;
    });

    const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

    const handleLanguageChange = useCallback((langId: string) => {
        console.log(`Changing language in useCodeEditor to: ${langId}`);
        
        if (langId === selectedLanguage.id) {
            console.log('Language already selected, no change needed');
            return; // Already selected
        }
        
        const newLang = SUPPORTED_LANGUAGES.find((lang) => lang.id === langId);
        if (!newLang) {
            console.error(`Invalid language ID in handleLanguageChange: ${langId}`);
            return;
        }

        // Update previous language ref
        previousLanguageRef.current = newLang.id;

        setSelectedLanguage(newLang);
        localStorage.setItem('selected-language', newLang.id); // Save to localStorage

        if (editorRef.current) {
            // Get saved code for this language or use default
            const savedCode = localStorage.getItem(`code-${newLang.id}`);
            const defaultCode = DEFAULT_CODE[newLang.id] || '';
            const codeToSet = savedCode || defaultCode;
            
            editorRef.current.setValue(codeToSet);
            
            // Update model language
            if (monacoRef.current && editorRef.current.getModel()) {
                monacoRef.current.editor.setModelLanguage(
                    editorRef.current.getModel(),
                    newLang.id
                );
            }
        }
    }, [selectedLanguage.id]);

    const handleThemeChange = (theme: (typeof EDITOR_THEMES)[number]) => {
        setSelectedTheme(theme);
        localStorage.setItem('editor-theme', theme.id); // Save theme
        // Use the theme ID directly which now matches our custom theme definitions
        monacoRef.current?.editor.setTheme(theme.id);
        setIsThemeMenuOpen(false);
    };

    const handleFontSizeChange = (size: number) => {
        setFontSize(size);
        localStorage.setItem('editor-font-size', size.toString());
        
        if (editorRef.current) {
            editorRef.current.updateOptions({ fontSize: size });
        }
    };

    const handleResetCode = () => {
        const defaultCode = DEFAULT_CODE[selectedLanguage.id] || '';
        editorRef.current?.setValue(defaultCode);
        localStorage.setItem(`code-${selectedLanguage.id}`, defaultCode);
    };

    const getCurrentCode = (): string => {
        return editorRef.current?.getValue() || '';
    };

    const handleEditorDidMount = (editorInstance: any, monaco: any) => {
        editorRef.current = editorInstance;
        monacoRef.current = monaco;

        // Expose editor instance globally for AI assistant to access
        window.__MONACO_EDITOR__ = editorInstance;
        
        // Pass editor instance to parent component if callback is provided
        if (onEditorMount) {
            onEditorMount(editorInstance);
        }
      
        // Try to load saved code for the current language
        const savedCode = localStorage.getItem(`code-${selectedLanguage.id}`);
        const defaultCode = DEFAULT_CODE[selectedLanguage.id] || '';
        
        // Use saved code if available, otherwise use default code
        editorInstance.setValue(savedCode || defaultCode);
      
        // Use the theme ID instead of theme.theme to apply our custom themes
        monaco.editor.setTheme(selectedTheme.id);

        // Set font size based on saved value
        editorInstance.updateOptions({ fontSize });
      
        // Run on Ctrl+Enter
        editorInstance.addCommand(
          monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
          () => {
            const code = editorInstance.getValue();
            if (code && onExecute) {
              onExecute(code);
            }
          }
        );
        
        // Format code on Shift+Alt+F
        editorInstance.addCommand(
          monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF,
          () => {
            editorInstance.getAction('editor.action.formatDocument')?.run();
          }
        );
      };      

    return {
        selectedLanguage,
        selectedTheme,
        fontSize,
        isThemeMenuOpen,
        setIsThemeMenuOpen,
        handleEditorDidMount,
        handleLanguageChange,
        handleThemeChange,
        handleFontSizeChange,
        handleResetCode,
        getCurrentCode
    };
}
