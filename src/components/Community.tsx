import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye, Clock, ThumbsUp } from 'lucide-react';
import { getAllPublicSnippets } from '../services/codeSnippets';
import { CodeSnippet } from '../types';
import { useAuth } from '../context/AuthContext';
import NavBar from './NavBar';

// Language color map for snippet tags (similar to Dashboard)
const languageColors: Record<string, string> = {
    python: 'bg-blue-600',
    javascript: 'bg-yellow-600',
    typescript: 'bg-blue-500',
    java: 'bg-orange-600',
    c: 'bg-blue-800',
    cpp: 'bg-purple-700',
    go: 'bg-blue-400',
    rust: 'bg-orange-700',
    ruby: 'bg-red-600',
};

export default function Community() {
    const { currentUser } = useAuth();
    const [snippets, setSnippets] = useState<CodeSnippet[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
    const [selectedSort, setSelectedSort] = useState<'recent' | 'popular'>('recent');

    // Languages extracted from snippets for filtering
    const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);

    // Track image load errors for each snippet
    const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

    // Handle image load error
    const handleImageError = (snippetId: string) => {
        setImageErrors(prev => ({ ...prev, [snippetId]: true }));
    };

    useEffect(() => {
        async function fetchPublicSnippets() {
            try {
                setLoading(true);
                const publicSnippets = await getAllPublicSnippets();
                setSnippets(publicSnippets);

                // Extract unique languages for the filter
                const languages = [...new Set(publicSnippets.map(snippet => snippet.language))];
                setAvailableLanguages(languages);
            } catch (err: any) {
                setError(err.message || 'Failed to load public snippets');
                console.error('Error fetching public snippets:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchPublicSnippets();
    }, []);

    // Filter and sort snippets based on user selections
    const filteredSnippets = snippets
        .filter(snippet => {
            // Filter by search term
            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                return (
                    snippet.title.toLowerCase().includes(searchLower) ||
                    (snippet.description?.toLowerCase().includes(searchLower)) ||
                    snippet.tags?.some(tag => tag.toLowerCase().includes(searchLower))
                );
            }
            return true;
        })
        .filter(snippet => {
            // Filter by selected language
            if (selectedLanguage) {
                return snippet.language === selectedLanguage;
            }
            return true;
        })
        .sort((a, b) => {
            // Sort by selected sort option
            if (selectedSort === 'recent') {
                return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
            } else {
                return (b.views || 0) - (a.views || 0);
            }
        });

    // Format relative time
    const getRelativeTime = (dateString: string | Date) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
            {/* Replace the header with the NavBar component */}
            <NavBar showCommunityButton={false} />

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6">
                <div className="text-center mb-8">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                    Community Code <span className="text-purple-500">Snippets</span>
                    </h2>
                    <div className="w-24 h-1 bg-purple-500 mx-auto rounded-full"></div>
                    <p className="text-xl text-gray-300 mt-4 max-w-2xl mx-auto">
                    Explore code snippets shared by the NeoCompiler community
                    </p>
                </div>

                {/* Filters and Search */}
                <div className="mb-8 bg-gray-800/50 rounded-xl border border-purple-900/30 p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search snippets..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full py-2 pl-10 pr-4 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Language Filter */}
                        <div className="w-full sm:w-48">
                            <select
                                value={selectedLanguage || ''}
                                onChange={(e) => setSelectedLanguage(e.target.value || null)}
                                className="w-full py-2 px-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
                            >
                                <option value="">All Languages</option>
                                {availableLanguages.map(lang => (
                                    <option key={lang} value={lang}>{lang}</option>
                                ))}
                            </select>
                        </div>

                        {/* Sort Options */}
                        <div className="w-full sm:w-48">
                            <select
                                value={selectedSort}
                                onChange={(e) => setSelectedSort(e.target.value as 'recent' | 'popular')}
                                className="w-full py-2 px-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
                            >
                                <option value="recent">Most Recent</option>
                                <option value="popular">Most Popular</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 mb-6">
                        <p className="text-red-400">{error}</p>
                    </div>
                )}

                {/* No Results */}
                {!loading && !error && filteredSnippets.length === 0 && (
                    <div className="text-center py-12 bg-gray-800/30 border border-gray-700 rounded-xl">
                        <h3 className="text-xl font-medium mb-2">No snippets found</h3>
                        <p className="text-gray-400">
                            {searchTerm || selectedLanguage
                                ? "Try adjusting your filters"
                                : "Be the first to share a code snippet!"}
                        </p>
                    </div>
                )}

                {/* Snippets Grid - Updated Design */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSnippets.map(snippet => (
                        <Link
                            to={`/shared/${snippet.shareableLink}`}
                            key={snippet.id}
                            className="bg-gray-800/90 border border-gray-700 hover:border-purple-500/50 rounded-lg overflow-hidden cursor-pointer shadow-md hover:shadow-purple-900/10 transition-all flex flex-col"
                        >
                            {/* Snippet Header with Language Indicator and Creator Info */}
                            <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
                                {/* Creator Info - Moved to header */}
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                    {snippet.creatorPhotoURL && !imageErrors[snippet.id] ? (
                                        <img
                                            src={snippet.creatorPhotoURL}
                                            alt={snippet.creatorName || 'User'}
                                            className="w-5 h-5 rounded-full border border-purple-500/50"
                                            onError={() => handleImageError(snippet.id)}
                                        />
                                    ) : (
                                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white font-medium text-xs">
                                            {snippet.creatorName ? snippet.creatorName.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                    )}
                                    <span className="hidden sm:inline">{snippet.creatorName || 'User'}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className={`w-3 h-3 rounded-full ${languageColors[snippet.language] || 'bg-gray-500'}`}></span>
                                    <span className="font-medium text-sm">{snippet.language}</span>
                                </div>
                            </div>

                            {/* Snippet Content */}
                            <div className="p-4 flex-1">
                                {/* Title and Description */}
                                <h3 className="font-semibold text-lg mb-2 line-clamp-1">{snippet.title}</h3>
                                {snippet.description && (
                                    <p className="text-gray-300 text-sm mb-3 line-clamp-2">{snippet.description}</p>
                                )}

                                {/* Code Preview */}
                                <div className="bg-gray-900 rounded p-3 mb-3 font-mono text-xs line-clamp-3 overflow-x-auto">
                                    {snippet.code}
                                </div>

                                {/* Tags */}
                                {snippet.tags && snippet.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {snippet.tags.slice(0, 3).map(tag => (
                                            <span
                                                key={tag}
                                                className="px-2 py-0.5 bg-purple-900/30 border border-purple-800/50 rounded-full text-xs"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                        {snippet.tags.length > 3 && (
                                            <span className="px-2 py-0.5 bg-gray-800 border border-gray-700 rounded-full text-xs">
                                                +{snippet.tags.length - 3}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Snippet Footer - Stats */}
                            <div className="flex items-center justify-between text-xs text-gray-400 px-4 py-3 bg-gray-800/70 border-t border-gray-700">
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1">
                                        <ThumbsUp className="w-3.5 h-3.5" />
                                        {snippet.likes || 0}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Eye className="w-3.5 h-3.5" />
                                        {snippet.views || 0}
                                    </span>
                                </div>
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    {getRelativeTime(snippet.updatedAt)}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Create Snippet CTA */}
                <div className="mt-12 text-center">
                    <div className="bg-gray-800/40 border border-purple-900/30 rounded-xl p-6 max-w-2xl mx-auto">
                        <h3 className="text-xl font-semibold mb-2">Create Your Own Snippets</h3>
                        <p className="text-gray-300 mb-4">
                            Sign up to create, save, and share your own code snippets with the community
                        </p>
                        <div className="flex justify-center gap-3">
                            <Link
                                to="/auth"
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
                            >
                                Sign up for free
                            </Link>
                            <Link
                                to="/compiler"
                                className="px-4 py-2 border border-purple-600/70 hover:bg-purple-600/20 rounded-lg text-white transition-colors"
                            >
                                Try the compiler
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}