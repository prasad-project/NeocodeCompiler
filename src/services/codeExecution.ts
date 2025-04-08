import { PistonResponse } from '../types';

export async function executeCode(
  code: string,
  language: string,
  version: string,
  input: string
): Promise<{ output: string; error?: string }> {
  try {
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
            name: `main.${language}`,
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