import { useState, useRef } from 'react';
import { Language, EditorTheme } from '../types';
import { SUPPORTED_LANGUAGES, DEFAULT_CODE, EDITOR_THEMES } from '../constants/editorConfig';

export function useCodeEditor() {
    const editorRef = useRef<any>(null);
    const monacoRef = useRef<any>(null);

    const [selectedLanguage, setSelectedLanguage] = useState<Language>(() => {
        const savedLangId = localStorage.getItem('selected-language');
        const foundLang = SUPPORTED_LANGUAGES.find(lang => lang.id === savedLangId);
        return foundLang || SUPPORTED_LANGUAGES.find(lang => lang.id === 'java')!;
    });

    const [selectedTheme, setSelectedTheme] = useState<EditorTheme>(() => {
        const savedTheme = localStorage.getItem('editor-theme');
        return EDITOR_THEMES.find(t => t.id === savedTheme) || EDITOR_THEMES[0];
    });

    const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

    const handleEditorDidMount = (editor: any, monaco: any) => {
        editorRef.current = editor;
        monacoRef.current = monaco;

        const savedCode = localStorage.getItem(`code-${selectedLanguage.id}`);
        editor.setValue(savedCode || DEFAULT_CODE[selectedLanguage.id]);

        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
            handleExecute();
        });

        editor.addCommand(
            monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF,
            () => {
                editor.getAction("editor.action.formatDocument")?.run();
            }
        );
    };

    const handleLanguageChange = (langId: string) => {
        const newLang = SUPPORTED_LANGUAGES.find(lang => lang.id === langId) || SUPPORTED_LANGUAGES[0];
        setSelectedLanguage(newLang);
        localStorage.setItem('selected-language', newLang.id);

        const savedCode = localStorage.getItem(`code-${langId}`);
        if (editorRef.current && monacoRef.current) {
            const model = editorRef.current.getModel();
            if (model) {
                monacoRef.current.editor.setModelLanguage(model, newLang.id);
            }
            editorRef.current.setValue(savedCode || DEFAULT_CODE[langId]);
        }
    };

    const handleThemeChange = (theme: EditorTheme) => {
        setSelectedTheme(theme);
        localStorage.setItem('editor-theme', theme.id);
        setIsThemeMenuOpen(false);
    };

    const handleResetCode = () => {
        if (editorRef.current) {
            editorRef.current.setValue(DEFAULT_CODE[selectedLanguage.id]);
            localStorage.removeItem(`code-${selectedLanguage.id}`);
        }
    };

    const getCurrentCode = () => {
        return editorRef.current?.getValue() || '';
    };

    const handleExecute = () => {
        const currentCode = getCurrentCode();
        if (!currentCode.trim()) {
            alert('Cannot execute empty code.');
            return;
        }

        try {
            console.log(`Executing code in ${selectedLanguage.id}:\n`, currentCode);
            // Placeholder for actual execution logic, e.g., sending code to a backend service
        } catch (error) {
            console.error('Error executing code:', error);
        }
    };

    return {
        editorRef,
        selectedLanguage,
        selectedTheme,
        isThemeMenuOpen,
        setIsThemeMenuOpen,
        handleEditorDidMount,
        handleLanguageChange,
        handleThemeChange,
        handleResetCode,
        getCurrentCode,
    };
}

function handleExecute() {
    throw new Error('Function not implemented.');
}
