Collecting workspace information```markdown
# Neo Compiler

Neo Compiler is a web-based code editor and execution platform that supports multiple programming languages. It allows users to write, execute, and debug code directly in the browser.

## Features

- **Multi-language Support**: Write and execute code in languages like JavaScript, Python, Java, C++, and more.
- **Custom Input**: Provide custom input for your programs.
- **Real-time Output**: View the output or errors of your code execution in real-time.
- **Theme Selection**: Choose from multiple editor themes (e.g., VS Code Dark, Light).
- **Code Formatting**: Format your code with a keyboard shortcut.
- **Code Persistence**: Automatically saves your code and preferences in local storage.

## Project Structure

```
neo-compiler/
├── src/
│   ├── App.tsx               # Main application component
│   ├── main.tsx              # Entry point of the application
│   ├── index.css             # Global styles
│   ├── vite-env.d.ts         # Vite environment types
│   ├── types.ts              # Type definitions
│   ├── components/
│   │   ├── CodeEditor.tsx    # Code editor component
│   │   ├── OutputPanel.tsx   # Output panel component
├── index.html                # HTML template
├── package.json              # Project dependencies and scripts
├── vite.config.ts            # Vite configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── postcss.config.js         # PostCSS configuration
├── tsconfig.json             # TypeScript configuration
├── tsconfig.app.json         # TypeScript app-specific configuration
├── tsconfig.node.json        # TypeScript node-specific configuration
├── eslint.config.js          # ESLint configuration
└── .gitignore                # Git ignore rules
```

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/decodewithdeepak/neo-compiler.git
   cd neo-compiler
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open the app in your browser at `http://localhost:5173`.

## Deployment

To deploy the project on [Vercel](https://vercel.com):

1. Push your code to a GitHub repository.
2. Log in to Vercel and import your repository.
3. Configure the build settings:
   - **Framework Preset**: Vite
   - **Build Command**: `vite build`
   - **Output Directory**: `dist`
4. Deploy the project. Vercel will provide a live URL for your app.

## Usage

1. Select a programming language from the dropdown menu.
2. Write your code in the editor.
3. Provide custom input (if needed) in the "Custom Input" section.
4. Click the "Run Code" button to execute your code.
5. View the output or errors in the "Output" section.

## Supported Languages

The following languages are supported:

- Java
- C++
- C
- Python
- JavaScript
- TypeScript
- Go
- Rust
- Ruby

## Keyboard Shortcuts

- **Run Code**: `Ctrl + Enter` (or `Cmd + Enter` on macOS)
- **Format Code**: `Ctrl + Shift + F` (or `Cmd + Shift + F` on macOS)

## Technologies Used

- **React**: Frontend framework
- **Monaco Editor**: Code editor
- **Tailwind CSS**: Styling
- **Vite**: Build tool
- **Piston API**: Code execution backend

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Piston API](https://github.com/engineer-man/piston) for providing the code execution backend.
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) for the code editor.
- [React](https://reactjs.org/) for the frontend framework.
- [TypeScript](https://www.typescriptlang.org/) for type safety.
- [Vite](https://vitejs.dev/) for the build tool.
- [Tailwind CSS](https://tailwindcss.com/) for styling.

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

## Contact

For any inquiries, please contact [deepakmodi8676@gmail.com].
```