export interface Language {
  id: string;
  name: string;
  extension: string;
  version: string;
}

export interface ExecutionResult {
  output: string;
  error?: string;
  language: string;
  version: string;
}

export interface PistonResponse {
  language: string;
  version: string;
  run: {
    output: string;
    stderr: string;
    code: number;
    signal: string | null;
  };
}

export interface EditorTheme {
  id: string;
  name: string;
  theme: string;
}