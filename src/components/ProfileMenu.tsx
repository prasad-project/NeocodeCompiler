import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, Save, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { logoutUser } from '../services/firebase';

export default function ProfileMenu() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Reset image error state when user changes
  useEffect(() => {
    setImageError(false);
  }, [currentUser?.photoURL]);

  // Handle outside click to close menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      setIsOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Generate initial from display name or email
  const getInitial = () => {
    if (currentUser?.displayName) {
      return currentUser.displayName.charAt(0).toUpperCase();
    } else if (currentUser?.email) {
      return currentUser.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  // Handle image load error
  const handleImageError = () => {
    setImageError(true);
  };

  if (!currentUser) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="flex items-center gap-1.5 focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="User menu"
      >
        <div className="flex items-center">
          {currentUser.photoURL && !imageError ? (
            <img 
              src={currentUser.photoURL} 
              alt={currentUser.displayName || 'User'} 
              className="w-8 h-8 rounded-full border-2 border-purple-500"
              onError={handleImageError}
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white font-medium">
              {getInitial()}
            </div>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-300 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
          {/* User info */}
          <div className="px-4 py-2 border-b border-gray-700">
            <p className="text-sm font-medium text-white truncate">
              {currentUser.displayName || currentUser.email}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {currentUser.email}
            </p>
          </div>

          {/* Menu items */}
          <Link 
            to="/dashboard" 
            className="flex px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 items-center gap-2"
            onClick={() => setIsOpen(false)}
          >
            <User className="w-4 h-4 text-purple-400" />
            My Snippets
          </Link>
          
          <Link 
            to="/compiler" 
            className="flex px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 items-center gap-2"
            onClick={() => setIsOpen(false)}
          >
            <Save className="w-4 h-4 text-purple-400" />
            New Snippet
          </Link>
          
          <button 
            className="flex w-full px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 items-center gap-2"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 text-purple-400" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}