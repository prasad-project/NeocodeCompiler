import { PistonResponse } from '../types';
import { SUPPORTED_LANGUAGES } from '../constants/editorConfig';

export async function executeCode(
    code: string,
    language: string,
    version: string,
    input: string
): Promise<{ output: string; error?: string }> {
    try {
        // Get the correct file extension for the language
        const languageInfo = SUPPORTED_LANGUAGES.find(lang => lang.id === language);
        
        // Ensure we have the right language extension
        if (!languageInfo) {
            throw new Error(`Unsupported language: ${language}`);
        }
        
        // Use the proper file extension for the current language
        const fileExtension = languageInfo.extension;

        const response = await fetch('https://emkc.org/api/v2/piston/execute', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                language,
                version,
                files: [
                    {
                        name: `main.${fileExtension}`,
                        content: code,
                    },
                ],
                stdin: input,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: PistonResponse = await response.json();
        return {
            output: result.run.output,
            error: result.run.stderr,
        };
    } catch (err) {
        return {
            output: '',
            error: err instanceof Error ? err.message : 'An error occurred while executing the code',
        };
    }
}