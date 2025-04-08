import type * as monaco from 'monaco-editor'; // optional, for stronger typings
import { Language, EditorTheme } from '../types';

export const DEFAULT_CODE: Record<string, string> = {
    typescript: `console.log("Welcome to NeoCompiler");`,
    javascript: `console.log("Welcome to NeoCompiler");`,
    python: `print("Welcome to NeoCompiler")`,
    java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Welcome to NeoCompiler");
    }
}`,
    go: `package main

import "fmt"

func main() {
    fmt.Println("Welcome to NeoCompiler")
}`,
    rust: `fn main() {
    println!("Welcome to NeoCompiler");
}`,
    ruby: `puts "Welcome to NeoCompiler"`,
    cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Welcome to NeoCompiler";
    return 0;
}`,
    c: `#include <stdio.h>

int main() {
    printf("Welcome to NeoCompiler\\n");
    return 0;
}`
};

export const SUPPORTED_LANGUAGES: Language[] = [
    { id: 'java', name: 'Java', extension: 'java', version: '15.0.2' },
    { id: 'cpp', name: 'C++', extension: 'cpp', version: '10.2.0' },
    { id: 'c', name: 'C', extension: 'c', version: '10.2.0' },
    { id: 'python', name: 'Python', extension: 'py', version: '3.10.0' },
    { id: 'javascript', name: 'JavaScript', extension: 'js', version: '18.15.0' },
    { id: 'typescript', name: 'TypeScript', extension: 'ts', version: '5.0.3' },
    { id: 'go', name: 'Go', extension: 'go', version: '1.16.2' },
    { id: 'rust', name: 'Rust', extension: 'rs', version: '1.68.2' },
    { id: 'ruby', name: 'Ruby', extension: 'rb', version: '3.0.1' }
];

export const EDITOR_THEMES: EditorTheme[] = [
    { id: 'vs-dark', name: 'VS Code Dark', theme: 'vs-dark' },
    { id: 'vs-light', name: 'VS Code Light', theme: 'light' },
    { id: 'hc-black', name: 'High Contrast Dark', theme: 'hc-black' },
    { id: 'hc-light', name: 'High Contrast Light', theme: 'hc-light' },
];


export const EDITOR_OPTIONS: monaco.editor.IStandaloneEditorConstructionOptions = {
    minimap: { enabled: false },
    fontSize: 14,
    lineNumbers: 'on', // ✅ This is acceptable now because it's a valid union
    roundedSelection: false,
    scrollBeyondLastLine: false,
    automaticLayout: true,
    wordWrap: 'on', // ✅ must match: "on" | "off" | "wordWrapColumn" | "bounded"
    formatOnPaste: true,
    formatOnType: true,
};