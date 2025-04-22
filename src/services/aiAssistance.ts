import { AIResponse } from '../types';

interface AIRequestParams {
    prompt: string;
    code?: string;
    language?: string;
}

// Gemini API endpoint
const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Get API key from localStorage or fallback to env variable
const getGeminiApiKey = (): string => {
    const localStorageKey = localStorage.getItem('gemini-api-key');
    // Use localStorage key if available, otherwise use the one from .env
    return localStorageKey || import.meta.env.VITE_GEMINI_API_KEY || '';
};

// Function to get AI code assistance
export async function getAICodeAssistance({
    prompt,
    code = '',
    language = 'typescript'
}: AIRequestParams): Promise<AIResponse> {
    const apiKey = getGeminiApiKey();

    if (!apiKey) {
        return {
            success: false,
            error: 'Gemini API key not found. Please set your API key in settings.',
            suggestion: null
        };
    }

    try {
        const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        role: 'user',
                        parts: [
                            {
                                text: `You are NeoCompiler AI, a helpful coding assistant specialized in ${language}. 
                                Provide concise, working code examples and explanations.
                                
                                ${prompt}
                                
                                Here's my current code:
                                \`\`\`${language}
                                ${code}
                                \`\`\``
                            }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1000
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        return {
            success: true,
            suggestion: result.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated",
            error: null
        };
    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : 'An error occurred while fetching AI suggestions',
            suggestion: null
        };
    }
}

// Function to generate code completions
export async function getCodeCompletions({
    code,
    language = 'typescript'
}: {
    code: string;
    language?: string;
}): Promise<AIResponse> {
    const apiKey = getGeminiApiKey();

    if (!apiKey) {
        return {
            success: false,
            error: 'Gemini API key not found. Please set your API key in settings.',
            suggestion: null
        };
    }

    try {
        const prompt = `Complete the following ${language} code:\n\n${code}`;

        const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        role: 'user',
                        parts: [
                            {
                                text: `You are NeoCompiler AI, a helpful ${language} coding assistant. Complete the code below in a concise way. 
                                Only respond with the completed code that would naturally continue from what I provided, with no explanations.
                                
                                ${prompt}`
                            }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: 500
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const result = await response.json();
        return {
            success: true,
            suggestion: result.candidates?.[0]?.content?.parts?.[0]?.text || "No completion generated",
            error: null
        };
    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : 'An error occurred while generating completions',
            suggestion: null
        };
    }
}

// Function for explaining code
export async function explainCode({
    code,
    language = 'typescript'
}: {
    code: string;
    language?: string;
}): Promise<AIResponse> {
    const apiKey = getGeminiApiKey();

    if (!apiKey) {
        return {
            success: false,
            error: 'Gemini API key not found. Please set your API key in settings.',
            suggestion: null
        };
    }

    try {
        const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        role: 'user',
                        parts: [
                            {
                                text: `You are NeoCompiler AI, a helpful coding tutor. Explain the following code in a clear, concise way.
                                
                                Please explain this ${language} code:
                                
                                \`\`\`${language}
                                ${code}
                                \`\`\``
                            }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 500
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const result = await response.json();
        return {
            success: true,
            suggestion: result.candidates?.[0]?.content?.parts?.[0]?.text || "No explanation generated",
            error: null
        };
    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : 'An error occurred while generating the explanation',
            suggestion: null
        };
    }
}