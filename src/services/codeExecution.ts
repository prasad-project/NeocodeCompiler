import { PistonResponse } from '../types';
import { SUPPORTED_LANGUAGES } from '../constants/editorConfig';

// Map our language IDs to what Piston API expects
// Reference: https://github.com/engineer-man/piston
const PISTON_LANGUAGE_MAP: Record<string, string> = {
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'python': 'python',
    'javascript': 'javascript',
    'typescript': 'typescript',
    'go': 'go',
    'rust': 'rust',
    'ruby': 'ruby'
};

export async function executeCode(
    code: string,
    language: string,
    version: string,
    input: string
): Promise<{ output: string; error?: string }> {
    try {
        // Get the correct language info for the language ID
        const languageInfo = SUPPORTED_LANGUAGES.find(lang => lang.id === language);
        
        // Ensure we have the right language extension
        if (!languageInfo) {
            console.error(`Language not found: ${language}`);
            throw new Error(`Unsupported language: ${language}`);
        }
        
        // Use the proper file extension for the current language
        const fileExtension = languageInfo.extension;
        
        // Map our language ID to what Piston expects
        const pistonLanguage = PISTON_LANGUAGE_MAP[language] || language;
        
        console.log(`Executing ${language} code as ${pistonLanguage} with extension .${fileExtension}`);
        
        // Create a clean, fresh request for each execution
        const payload = {
            language: pistonLanguage, // Use the mapped language ID
            version: version,
            files: [
                {
                    name: `main.${fileExtension}`,
                    content: code,
                },
            ],
            stdin: input,
        };

        console.log('Sending payload to Piston API:', JSON.stringify(payload));

        const response = await fetch('https://emkc.org/api/v2/piston/execute', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: PistonResponse = await response.json();
        console.log('Received response from Piston API:', result);
        
        return {
            output: result.run.output,
            error: result.run.stderr,
        };
    } catch (err) {
        console.error('Error executing code:', err);
        return {
            output: '',
            error: err instanceof Error ? err.message : 'An error occurred while executing the code',
        };
    }
}