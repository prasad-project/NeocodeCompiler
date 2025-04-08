import { useState, useEffect, useRef } from 'react';
import { SUPPORTED_LANGUAGES, EDITOR_THEMES, DEFAULT_CODE } from '../constants/editorConfig';

export function useCodeEditor(onExecute?: (code: string) => void) {
    const editorRef = useRef<any>(null);
    const monacoRef = useRef<any>(null);

    // 🔁 Load selected language from localStorage or default to Java
    const [selectedLanguage, setSelectedLanguage] = useState(() => {
        const savedLangId = localStorage.getItem('selected-language');
        const lang = SUPPORTED_LANGUAGES.find((lang) => lang.id === savedLangId);
        return lang || SUPPORTED_LANGUAGES[0];
    });

    const [selectedTheme, setSelectedTheme] = useState(() => {
        const savedThemeId = localStorage.getItem('editor-theme');
        return EDITOR_THEMES.find((t) => t.id === savedThemeId) || EDITOR_THEMES[0];
    });

    const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

    const handleLanguageChange = (langId: string) => {
        const newLang = SUPPORTED_LANGUAGES.find((lang) => lang.id === langId);
        if (!newLang) return;

        setSelectedLanguage(newLang);
        localStorage.setItem('selected-language', newLang.id); // Save to localStorage

        const savedCode = localStorage.getItem(`code-${newLang.id}`) || DEFAULT_CODE[newLang.id];
        editorRef.current?.setValue(savedCode);
        editorRef.current?.getModel()?.setLanguage(newLang.id);
    };

    const handleThemeChange = (theme: (typeof EDITOR_THEMES)[number]) => {
        setSelectedTheme(theme);
        localStorage.setItem('editor-theme', theme.id); // Save theme
        monacoRef.current?.editor.setTheme(theme.theme);
        setIsThemeMenuOpen(false);
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
      
        const savedCode = localStorage.getItem(`code-${selectedLanguage.id}`);
        editorInstance.setValue(savedCode || DEFAULT_CODE[selectedLanguage.id]);
      
        monaco.editor.setTheme(selectedTheme.theme);
      
        // Autosave functionality (debounced)
        let saveTimeout: ReturnType<typeof setTimeout>;
        editorInstance.onDidChangeModelContent(() => {
          clearTimeout(saveTimeout);
          saveTimeout = setTimeout(() => {
            const code = editorInstance.getValue();
            localStorage.setItem(`code-${selectedLanguage.id}`, code);
          }, 200); // save 200ms after user stops typing
        });
      
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
      
        // Format on Ctrl+Shift+F
        editorInstance.addCommand(
          monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF,
          () => {
            editorInstance.getAction('editor.action.formatDocument')?.run();
          }
        );
      };      

    return {
        selectedLanguage,
        selectedTheme,
        isThemeMenuOpen,
        setIsThemeMenuOpen,
        handleEditorDidMount,
        handleLanguageChange,
        handleThemeChange,
        handleResetCode,
        getCurrentCode
    };
}
