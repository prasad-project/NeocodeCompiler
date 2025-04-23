import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Code2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Login from './Login';
import Register from './Register';

export default function AuthPage() {
  const [isLoginView, setIsLoginView] = useState(true);
  const { currentUser } = useAuth();

  // If user is already logged in, redirect to compiler
  if (currentUser) {
    return <Navigate to="/compiler" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white flex flex-col">
      {/* Header */}
      <header className="backdrop-blur-sm bg-gray-900/80 border-b border-purple-900/40 shadow-sm px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center">
          <div className="flex items-center gap-3">
            <Code2 className="w-7 h-7 text-purple-400" />
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight bg-gradient-to-r from-purple-400 to-violet-500 bg-clip-text text-transparent">
              NeoCompiler
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          {isLoginView ? (
            <Login onToggleForm={() => setIsLoginView(false)} />
          ) : (
            <Register onToggleForm={() => setIsLoginView(true)} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} NeoCompiler. All rights reserved.</p>
      </footer>
    </div>
  );
}