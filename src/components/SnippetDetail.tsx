import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Code2, ArrowLeft, Share2, Edit, Trash2, Copy, Check, ExternalLink, Globe, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getCodeSnippet, deleteCodeSnippet, updateCodeSnippetVisibility, incrementSnippetViews } from '../services/codeSnippets';
import { CodeSnippet } from '../types';

export default function SnippetDetail() {
  const { snippetId } = useParams<{ snippetId: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [snippet, setSnippet] = useState<CodeSnippet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState(false);

  // Fetch snippet data
  useEffect(() => {
    async function fetchSnippet() {
      if (!snippetId || !currentUser) return;

      setIsLoading(true);
      setError(null);

      try {
        const snippetData = await getCodeSnippet(snippetId);
        
        // Check if user has permission to view this snippet
        if (snippetData.userId !== currentUser.uid) {
          setError("You don't have permission to view this snippet");
          return;
        }
        
        setSnippet(snippetData);
        setIsPublic(snippetData.isPublic || false);
        
        // Generate share URL if available
        if (snippetData.shareableLink) {
          const baseUrl = window.location.origin;
          setShareUrl(`${baseUrl}/shared/${snippetData.shareableLink}`);
        }
        
        // Increment view count
        await incrementSnippetViews(snippetId);
      } catch (err: any) {
        console.error("Error loading snippet:", err);
        setError(err.message || "Failed to load the snippet");
      } finally {
        setIsLoading(false);
      }
    }

    fetchSnippet();
  }, [snippetId, currentUser]);

  // Handle deleting a snippet
  const handleDelete = async () => {
    if (!snippet || !confirm("Are you sure you want to delete this snippet? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    
    try {
      await deleteCodeSnippet(snippet.id);
      navigate('/dashboard');
    } catch (err: any) {
      console.error("Failed to delete snippet:", err);
      alert("Failed to delete snippet. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle copying share link to clipboard
  const handleCopyShareLink = async () => {
    if (!shareUrl) return;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Handle toggling snippet visibility (public/private)
  const handleToggleVisibility = async () => {
    if (!snippet) return;
    
    setIsUpdatingVisibility(true);
    
    try {
      // Toggle visibility
      const newVisibility = !isPublic;
      const updatedSnippet = await updateCodeSnippetVisibility(snippet.id, newVisibility);
      
      // Update state
      setSnippet(updatedSnippet);
      setIsPublic(newVisibility);
      
      // Update share URL if visibility is changed to public
      if (newVisibility && updatedSnippet.shareableLink) {
        const baseUrl = window.location.origin;
        setShareUrl(`${baseUrl}/shared/${updatedSnippet.shareableLink}`);
      }
    } catch (err) {
      console.error("Failed to update visibility:", err);
      alert("Failed to update snippet visibility. Please try again.");
    } finally {
      setIsUpdatingVisibility(false);
    }
  };

  // Navigate to the compiler with this snippet loaded
  const handleEdit = () => {
    navigate(`/compiler?snippet=${snippet?.id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-purple-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="mt-4 text-gray-300">Loading snippet...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-6 flex flex-col items-center justify-center">
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 max-w-md w-full">
          <h2 className="text-xl font-semibold text-white mb-2">Error</h2>
          <p className="text-red-400 mb-4">{error}</p>
          <Link 
            to="/dashboard"
            className="text-purple-400 hover:text-purple-300 inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!snippet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-6 flex flex-col items-center justify-center">
        <div className="bg-gray-800/80 border border-gray-700 rounded-lg p-6 max-w-md w-full">
          <h2 className="text-xl font-semibold text-white mb-2">Snippet Not Found</h2>
          <p className="text-gray-400 mb-4">The snippet you're looking for could not be found.</p>
          <Link 
            to="/dashboard"
            className="text-purple-400 hover:text-purple-300 inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white flex flex-col">
      {/* Header */}
      <header className="backdrop-blur-sm bg-gray-900/80 border-b border-purple-900/40 shadow-sm px-6 py-4 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3">
              <Code2 className="w-7 h-7 text-purple-400" />
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight bg-gradient-to-r from-purple-400 to-violet-500 bg-clip-text text-transparent">NeoCompiler</h1>
            </Link>
          </div>
          <nav className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-3 py-1.5 border border-purple-600/70 rounded-lg hover:bg-purple-600/20 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <Link
              to="/compiler"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-all"
            >
              New Snippet
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full p-6">
        {/* Snippet Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{snippet.title}</h1>
            {snippet.description && (
              <p className="text-gray-300">{snippet.description}</p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Visibility Toggle */}
            <button
              onClick={handleToggleVisibility}
              disabled={isUpdatingVisibility}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                isPublic
                  ? 'bg-green-600/30 text-green-300 border border-green-600/50 hover:bg-green-600/40'
                  : 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700'
              } transition-colors`}
              title={isPublic ? "Make snippet private" : "Make snippet public"}
            >
              {isPublic ? (
                <>
                  <Globe className="w-4 h-4" />
                  <span>Public</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Private</span>
                </>
              )}
            </button>

            {/* Share Button */}
            {isPublic && shareUrl && (
              <button
                onClick={handleCopyShareLink}
                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600/30 text-indigo-300 border border-indigo-600/50 rounded-lg hover:bg-indigo-600/40 transition-colors"
                title="Copy shareable link"
              >
                {copySuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </>
                )}
              </button>
            )}

            {/* Edit Button */}
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-3 py-1.5 bg-purple-600/30 text-purple-300 border border-purple-600/50 rounded-lg hover:bg-purple-600/40 transition-colors"
              title="Edit this snippet"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </button>

            {/* Delete Button */}
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-600/30 text-red-300 border border-red-600/50 rounded-lg hover:bg-red-600/40 transition-colors"
              title="Delete this snippet"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isDeleting ? "Deleting..." : "Delete"}</span>
            </button>
          </div>
        </div>

        {/* Snippet Info */}
        <div className="bg-gray-800/80 border border-gray-700 rounded-lg p-4 mb-6 flex flex-wrap gap-4 text-sm">
          <div>
            <span className="text-gray-400">Language:</span>{' '}
            <span className="font-medium">{snippet.language}</span>
          </div>
          <div>
            <span className="text-gray-400">Created:</span>{' '}
            <span>{new Date(snippet.createdAt).toLocaleDateString()}</span>
          </div>
          <div>
            <span className="text-gray-400">Updated:</span>{' '}
            <span>{new Date(snippet.updatedAt).toLocaleDateString()}</span>
          </div>
          <div>
            <span className="text-gray-400">Views:</span>{' '}
            <span>{snippet.views || 0}</span>
          </div>
          <div>
            <span className="text-gray-400">Likes:</span>{' '}
            <span>{snippet.likes || 0}</span>
          </div>
        </div>

        {/* Tags */}
        {snippet.tags && snippet.tags.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-2">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {snippet.tags.map(tag => (
                <span 
                  key={tag}
                  className="px-3 py-1 bg-purple-900/30 border border-purple-800/50 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Code Display */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-medium">Code</h2>
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(snippet.code);
                  alert('Code copied to clipboard!');
                } catch (err) {
                  console.error("Failed to copy code:", err);
                }
              }}
              className="flex items-center gap-1 text-xs text-gray-300 hover:text-white"
            >
              <Copy className="w-3.5 h-3.5" />
              Copy code
            </button>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
            <div className="bg-gray-800/90 px-4 py-2 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
              </div>
              <div className="text-xs text-gray-400">
                {snippet.language}
              </div>
            </div>
            <pre className="p-4 overflow-x-auto font-mono text-sm whitespace-pre-wrap">
              <code>{snippet.code}</code>
            </pre>
          </div>
        </div>

        {/* Shareable Link Section (if public) */}
        {isPublic && shareUrl && (
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-2">Shareable Link</h2>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-grow bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                onClick={handleCopyShareLink}
                className={`px-3 py-2 rounded-lg ${
                  copySuccess 
                    ? 'bg-green-600/30 border border-green-500' 
                    : 'bg-purple-600/30 border border-purple-500 hover:bg-purple-600/40'
                }`}
              >
                {copySuccess ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
              <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
            <p className="mt-2 text-sm text-gray-400">
              Share this link with anyone. They will be able to view and run your code.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}