import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Code2, Search, Plus, Filter, X, Tag, Globe, Lock, ThumbsUp, Eye, Clock, Grid2X2, List } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserCodeSnippets } from '../services/codeSnippets';
import { CodeSnippet } from '../types';
import NavBar from './NavBar';

// Language color map for snippet tags
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

export default function Dashboard() {
    const { currentUser, isLoading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [snippets, setSnippets] = useState<CodeSnippet[]>([]);
    const [filteredSnippets, setFilteredSnippets] = useState<CodeSnippet[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | 'public' | 'private'>('all');
    const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>(
        () => (localStorage.getItem('dashboard-view-mode') as 'grid' | 'list') || 'grid'
    );

    // Load user snippets
    useEffect(() => {
        async function fetchSnippets() {
            if (!currentUser) return;

            setIsLoading(true);
            setError(null);

            try {
                const userSnippets = await getUserCodeSnippets(currentUser.uid);
                setSnippets(userSnippets);
                setFilteredSnippets(userSnippets);
            } catch (err: any) {
                console.error("Failed to load snippets:", err);
                setError(err.message || "Failed to load your code snippets");
            } finally {
                setIsLoading(false);
            }
        }

        if (currentUser && !authLoading) {
            fetchSnippets();
        }
    }, [currentUser, authLoading]);

    // Filter snippets based on search, tags, visibility
    useEffect(() => {
        if (snippets.length === 0) return;

        let filtered = [...snippets];

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                snippet =>
                    snippet.title.toLowerCase().includes(query) ||
                    snippet.description?.toLowerCase().includes(query) ||
                    snippet.tags?.some(tag => tag.toLowerCase().includes(query))
            );
        }

        // Filter by visibility
        if (activeFilter !== 'all') {
            filtered = filtered.filter(snippet =>
                activeFilter === 'public' ? snippet.isPublic : !snippet.isPublic
            );
        }

        // Filter by language
        if (selectedLanguage) {
            filtered = filtered.filter(snippet => snippet.language === selectedLanguage);
        }

        // Filter by tag
        if (selectedTag) {
            filtered = filtered.filter(snippet =>
                snippet.tags?.includes(selectedTag)
            );
        }

        // Sort by latest first
        filtered.sort((a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );

        setFilteredSnippets(filtered);
    }, [snippets, searchQuery, activeFilter, selectedLanguage, selectedTag]);

    // Save view mode preference
    const handleViewModeChange = (mode: 'grid' | 'list') => {
        setViewMode(mode);
        localStorage.setItem('dashboard-view-mode', mode);
    };

    // Get all unique languages from snippets
    const availableLanguages = [...new Set(snippets.map(snippet => snippet.language))];

    // Get all unique tags from snippets
    const availableTags = [...new Set(
        snippets.flatMap(snippet => snippet.tags || [])
    )];

    // Clear all filters
    const clearFilters = () => {
        setSearchQuery('');
        setActiveFilter('all');
        setSelectedLanguage(null);
        setSelectedTag(null);
    };

    if (authLoading) {
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
                    <p className="mt-4 text-gray-300">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white flex flex-col">
            {/* Replace custom header with NavBar */}
            <NavBar />

            <main className="flex-1 max-w-7xl mx-auto w-full p-6">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold">My Code Snippets</h2>
                    <Link
                        to="/compiler"
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        <span>New Snippet</span>
                    </Link>
                </div>

                {/* Filtering and search bar */}
                <div className="mb-8 space-y-4">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                        {/* Search bar */}
                        <div className="relative flex-grow">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search for snippets by title, description, or tags"
                                className="pl-10 pr-4 py-2.5 w-full bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        {/* View mode toggle */}
                        <div className="flex items-center bg-gray-800 border border-gray-700 rounded-lg p-1">
                            <button
                                onClick={() => handleViewModeChange('grid')}
                                className={`px-3 py-1.5 rounded flex items-center gap-2 ${viewMode === 'grid' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                <Grid2X2 className="w-5 h-5" />
                                <span className="hidden sm:inline">Grid</span>
                            </button>
                            <button
                                onClick={() => handleViewModeChange('list')}
                                className={`px-3 py-1.5 rounded flex items-center gap-2 ${viewMode === 'list' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                <List className="w-5 h-5" />
                                <span className="hidden sm:inline">List</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Filter Pills */}
                        <div className="flex items-center gap-2">
                            <Filter className="text-gray-400 w-5 h-5" />
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setActiveFilter('all')}
                                    className={`px-3 py-1.5 rounded-full text-sm ${activeFilter === 'all'
                                        ? 'bg-purple-700 text-white'
                                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                        }`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setActiveFilter('public')}
                                    className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5 ${activeFilter === 'public'
                                        ? 'bg-green-700/70 text-white'
                                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                        }`}
                                >
                                    <Globe className="w-3.5 h-3.5" />
                                    Public
                                </button>
                                <button
                                    onClick={() => setActiveFilter('private')}
                                    className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5 ${activeFilter === 'private'
                                        ? 'bg-gray-700 text-white'
                                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                        }`}
                                >
                                    <Lock className="w-3.5 h-3.5" />
                                    Private
                                </button>
                            </div>
                        </div>

                        {/* Language Filter Dropdown */}
                        {availableLanguages.length > 0 && (
                            <div className="relative group">
                                <button
                                    className={`px-3 py-1.5 rounded-full text-sm ${selectedLanguage ? 'bg-blue-700 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                        }`}
                                >
                                    {selectedLanguage ? `Language: ${selectedLanguage}` : 'Language'}
                                </button>
                                <div className="absolute left-0 top-full mt-2 w-40 bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden z-10 hidden group-hover:block hover:block">
                                    <button
                                        onClick={() => setSelectedLanguage(null)}
                                        className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700"
                                    >
                                        All Languages
                                    </button>
                                    {availableLanguages.map(lang => (
                                        <button
                                            key={lang}
                                            onClick={() => setSelectedLanguage(lang)}
                                            className={`w-full px-4 py-2 text-left text-sm ${selectedLanguage === lang ? 'bg-blue-900/50 text-white' : 'text-gray-300 hover:bg-gray-700'
                                                }`}
                                        >
                                            {lang}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tag Filter Dropdown */}
                        {availableTags.length > 0 && (
                            <div className="relative group">
                                <button
                                    className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5 ${selectedTag ? 'bg-purple-700 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                        }`}
                                >
                                    <Tag className="w-3.5 h-3.5" />
                                    {selectedTag ? `Tag: ${selectedTag}` : 'Tags'}
                                </button>
                                <div className="absolute left-0 top-full mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden z-10 hidden group-hover:block hover:block max-h-64 overflow-y-auto">
                                    <button
                                        onClick={() => setSelectedTag(null)}
                                        className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700"
                                    >
                                        All Tags
                                    </button>
                                    {availableTags.map(tag => (
                                        <button
                                            key={tag}
                                            onClick={() => setSelectedTag(tag)}
                                            className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 ${selectedTag === tag ? 'bg-purple-900/50 text-white' : 'text-gray-300 hover:bg-gray-700'
                                                }`}
                                        >
                                            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Clear filters button */}
                        {(searchQuery || activeFilter !== 'all' || selectedLanguage || selectedTag) && (
                            <button
                                onClick={clearFilters}
                                className="px-3 py-1.5 rounded-full text-sm bg-red-800/50 text-white hover:bg-red-700/60 flex items-center gap-1.5"
                            >
                                <X className="w-3.5 h-3.5" />
                                Clear Filters
                            </button>
                        )}
                    </div>
                </div>

                {/* Loading State */}
                {isLoading ? (
                    <div className="flex items-center justify-center p-12">
                        <svg className="animate-spin h-10 w-10 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                        </svg>
                        <span className="ml-3 text-lg text-gray-300">Loading your snippets...</span>
                    </div>
                ) : error ? (
                    <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
                        <p className="text-red-400">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-2 text-purple-400 hover:text-purple-300"
                        >
                            Try again
                        </button>
                    </div>
                ) : filteredSnippets.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center text-center border border-gray-800 rounded-lg bg-gray-900/50">
                        {snippets.length === 0 ? (
                            <>
                                <div className="w-20 h-20 flex items-center justify-center bg-gray-800 rounded-full mb-4">
                                    <Code2 className="w-10 h-10 text-gray-500" />
                                </div>
                                <h3 className="text-2xl font-medium text-gray-300 mb-3">No Code Snippets Yet</h3>
                                <p className="text-gray-500 max-w-md mb-6">
                                    You haven't created any code snippets yet. Start by creating a new snippet in the compiler.
                                </p>
                                <Link
                                    to="/compiler"
                                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
                                >
                                    <Plus className="w-5 h-5" />
                                    <span>Create Your First Snippet</span>
                                </Link>
                            </>
                        ) : (
                            <>
                                <div className="w-20 h-20 flex items-center justify-center bg-gray-800 rounded-full mb-4">
                                    <Search className="w-10 h-10 text-gray-500" />
                                </div>
                                <h3 className="text-2xl font-medium text-gray-300 mb-3">No Matching Snippets</h3>
                                <p className="text-gray-500 max-w-md mb-6">
                                    No code snippets match your current filters. Try adjusting your search or clearing filters.
                                </p>
                                <button
                                    onClick={clearFilters}
                                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                    <span>Clear All Filters</span>
                                </button>
                            </>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Snippet Count */}
                        <p className="text-gray-400 mb-4">
                            {filteredSnippets.length} {filteredSnippets.length === 1 ? 'snippet' : 'snippets'} found
                        </p>

                        {/* Grid View */}
                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredSnippets.map(snippet => (
                                    <div
                                        key={snippet.id}
                                        onClick={() => navigate(`/snippets/${snippet.id}`)}
                                        className="bg-gray-800/90 border border-gray-700 hover:border-purple-500/50 rounded-lg overflow-hidden cursor-pointer shadow-md hover:shadow-purple-900/10 transition-all flex flex-col"
                                    >
                                        {/* Snippet Header */}
                                        <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-3 h-3 rounded-full ${languageColors[snippet.language] || 'bg-gray-500'}`}></span>
                                                <span className="font-medium text-sm">{snippet.language}</span>
                                            </div>
                                            {snippet.isPublic ? (
                                                <div className="flex items-center gap-1 text-xs text-green-400 bg-green-900/30 px-2 py-0.5 rounded">
                                                    <Globe className="w-3 h-3" />
                                                    Public
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1 text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded">
                                                    <Lock className="w-3 h-3" />
                                                    Private
                                                </div>
                                            )}
                                        </div>

                                        {/* Snippet Content */}
                                        <div className="p-4 flex-1 flex flex-col">
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
                                                {new Date(snippet.updatedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            /* List View */
                            <div className="divide-y divide-gray-800 border border-gray-800 rounded-lg overflow-hidden">
                                {filteredSnippets.map(snippet => (
                                    <div
                                        key={snippet.id}
                                        onClick={() => navigate(`/snippets/${snippet.id}`)}
                                        className="bg-gray-800/80 hover:bg-gray-800 p-4 cursor-pointer transition-colors"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                            <div className="flex-grow">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="font-medium">{snippet.title}</h3>
                                                    <div className="flex items-center">
                                                        <span className={`w-2.5 h-2.5 rounded-full ${languageColors[snippet.language] || 'bg-gray-500'} mr-1.5`}></span>
                                                        <span className="text-sm text-gray-400">{snippet.language}</span>
                                                    </div>
                                                    {snippet.isPublic ? (
                                                        <div className="flex items-center gap-1 text-xs text-green-400 bg-green-900/30 px-2 py-0.5 rounded">
                                                            <Globe className="w-3 h-3" />
                                                            Public
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1 text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded">
                                                            <Lock className="w-3 h-3" />
                                                            Private
                                                        </div>
                                                    )}
                                                </div>
                                                {snippet.description && (
                                                    <p className="text-gray-300 text-sm mb-2 line-clamp-1">{snippet.description}</p>
                                                )}

                                                {/* Tags */}
                                                {snippet.tags && snippet.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-2">
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

                                            <div className="flex items-center gap-4 text-xs text-gray-400">
                                                <span className="flex items-center gap-1">
                                                    <ThumbsUp className="w-3.5 h-3.5" />
                                                    {snippet.likes}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Eye className="w-3.5 h-3.5" />
                                                    {snippet.views}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {new Date(snippet.updatedAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}