import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './components/LandingPage';
import Compiler from './components/Compiler';
import AuthPage from './components/auth/AuthPage';
import Dashboard from './components/Dashboard';
import SnippetDetail from './components/SnippetDetail';
import SharedSnippet from './components/SharedSnippet';
import ProtectedRoute from './components/auth/ProtectedRoute';
import UserProfile from './components/UserProfile';
import UsernameSetup from './components/auth/UsernameSetup';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/compiler" element={<Compiler />} />
          <Route path="/compiler/:linkId" element={<Compiler />} />
          <Route path="/auth" element={<AuthPage />} />
          
          {/* User profile page with cleaner route (just /:username) */}
          <Route path="/:username" element={<UserProfile />} />
          
          {/* Username setup for new users */}
          <Route path="/username-setup" element={
            <ProtectedRoute>
              <UsernameSetup />
            </ProtectedRoute>
          } />
          
          {/* Protected routes (require authentication) */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/snippets/:snippetId" element={
            <ProtectedRoute>
              <SnippetDetail />
            </ProtectedRoute>
          } />
          
          {/* Shared snippets (no auth required) */}
          <Route path="/shared/:linkId" element={<SharedSnippet />} />
          
          {/* Redirect any unknown paths to the landing page */}
          <Route path="*" element={<Navigate to="/" replace />} />
          
          <Route path="/codesuggestion" element={<Compiler />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
