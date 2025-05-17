import React from 'react';
import CodeSnippetViewer from './CodeSnippetViewer';

interface CodeSuggestionPanelProps {
  userCode: string;
  suggestionCode: string;
  language: string;
  strengths: string[];
  improvements: string[];
  score?: number;
}

const CodeSuggestionPanel: React.FC<CodeSuggestionPanelProps> = ({
  userCode,
  suggestionCode,
  language,
  strengths,
  improvements,
  score,
}) => {
  return (
    <div className="bg-gray-950 border border-purple-900/40 rounded-2xl p-6 shadow-lg max-w-4xl mx-auto my-6">
      <h2 className="text-2xl font-bold text-center text-blue-400 mb-4">Code Genie <span role="img" aria-label="genie">🧞‍♂️</span></h2>
      {typeof score === 'number' && (
        <div className="text-center mb-4 text-lg text-purple-300">Score (0-10): <span className="font-bold">{score}</span></div>
      )}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-green-400 mb-2">Strengths:</h3>
        <ul className="list-disc ml-6 text-gray-200">
          {strengths.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
      </div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-yellow-400 mb-2">Areas for Improvement:</h3>
        <ul className="list-disc ml-6 text-gray-200">
          {improvements.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-center text-red-400 font-semibold mb-2">Your Code</h4>
          <CodeSnippetViewer code={userCode} language={language} title="Your Code" showHeader={true} />
        </div>
        <div>
          <h4 className="text-center text-green-400 font-semibold mb-2">Genie Suggestion</h4>
          <CodeSnippetViewer code={suggestionCode} language={language} title="Genie Suggestion" showHeader={true} />
        </div>
      </div>
    </div>
  );
};

export default CodeSuggestionPanel; 