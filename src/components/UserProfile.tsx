import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Calendar, Code, Eye, ThumbsUp, Clock, ExternalLink, Github, Twitter } from 'lucide-react';
import NavBar from './NavBar';
import { CodeSnippet } from '../types';
import { getPublicSnippetsByUserId } from '../services/codeSnippets';

// Language color map (same as in Community)
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

interface UserProfileData {
    id: string;
    username: string;
    displayName: string | null;
    photoURL: string | null;
    bio: string;
    createdAt: string;
    email?: string;
    socialLinks?: {
        github?: string;
        twitter?: string;
        website?: string;
    };
}

export default function UserProfile() {
    const { username } = useParams<{ username: string }>();
    const [user, setUser] = useState<UserProfileData | null>(null);
    const [snippets, setSnippets] = useState<CodeSnippet[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [imageError, setImageError] = useState(false);

    // Reset image error state when user changes
    useEffect(() => {
        setImageError(false);
    }, [user?.photoURL]);

    // Handle image load error
    const handleImageError = () => {
        setImageError(true);
    };

    // Fetch user profile and snippets
    useEffect(() => {
        async function fetchUserProfileAndSnippets() {
            if (!username) return;

            setLoading(true);
            setError(null);

            // Check if the username is actually a reserved route name
            const reservedRoutes = ['compiler', 'auth', 'community', 'dashboard', 'snippets', 'shared', 'username-setup'];
            if (reservedRoutes.includes(username.toLowerCase())) {
                setError('User not found');
                setLoading(false);
                return;
            }

            try {
                // Get user by username
                const userData = await getUserByUsername(username);

                if (!userData) {
                    setError('User not found');
                    return;
                }

                setUser(userData as UserProfileData);

                // Get public snippets for this user
                const userSnippets = await getPublicSnippetsByUserId(userData.id);
                setSnippets(userSnippets);
            } catch (err: any) {
                console.error('Error loading user profile:', err);
                setError(err.message || 'Failed to load profile');
            } finally {
                setLoading(false);
            }
        }

        fetchUserProfileAndSnippets();
    }, [username]);

    // Format date to readable format
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Format relative time
    const getRelativeTime = (dateString: string | Date) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
        return formatDate(dateString.toString());
    };

    // Loading state
    if (loading) {
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
                    <p className="mt-4 text-gray-300">Loading profile...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
                <NavBar />
                <div className="max-w-4xl mx-auto px-4 py-12">
                    <div className="bg-red-900/20 border border-red-800 rounded-xl p-6 text-center">
                        <h2 className="text-2xl font-semibold mb-2">Error</h2>
                        <p className="text-red-400">{error}</p>
                        <Link to="/community" className="mt-4 inline-block px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors">
                            Back to Community
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // User not found
    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
                <NavBar />
                <div className="max-w-4xl mx-auto px-4 py-12">
                    <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6 text-center">
                        <h2 className="text-2xl font-semibold mb-2">User Not Found</h2>
                        <p className="text-gray-400">The user you're looking for doesn't exist or the username is incorrect.</p>
                        <Link to="/community" className="mt-4 inline-block px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors">
                            Explore Community
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
            <NavBar />

            <main className="max-w-6xl mx-auto px-4 py-8">
                {/* Profile Header */}
                <div className="bg-gray-800/30 border border-gray-700 rounded-xl overflow-hidden mb-8">
                    {/* Cover Image - Optional design element */}
                    <div className="h-40 bg-gradient-to-r from-purple-900/40 to-indigo-900/40 relative overflow-hidden">
                    </div>

                    {/* Profile Info */}
                    <div className="p-6 md:p-8 relative">
                        {/* Avatar */}
                        <div className="absolute -top-12 left-8 border-4 border-gray-800 rounded-full overflow-hidden">
                            {user.photoURL && !imageError ? (
                                <img
                                    src={user.photoURL}
                                    alt={user.displayName || user.username}
                                    className="w-24 h-24 object-cover"
                                    onError={handleImageError}
                                />
                            ) : (
                                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white text-2xl font-bold">
                                    {(user.displayName || user.username).charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>

                        <div className="mt-14">
                            {/* Name and Username */}
                            <div className="mb-4">
                                <h1 className="text-3xl font-bold mb-1">
                                    {user.displayName || user.username}
                                </h1>
                                <p className="text-gray-400 flex items-center">
                                    <span className="text-purple-400">@{user.username}</span>
                                    <span className="mx-2">•</span>
                                    <span className="flex items-center text-sm">
                                        <Calendar className="w-4 h-4 mr-1" />
                                        Joined {formatDate(user.createdAt)}
                                    </span>
                                </p>
                            </div>

                            {/* Bio */}
                            {user.bio && (
                                <div className="mb-4">
                                    <p className="text-gray-300">{user.bio}</p>
                                </div>
                            )}

                            {/* Social Links */}
                            <div className="flex flex-wrap gap-3">
                                {user.socialLinks?.github && (
                                    <a
                                        href={user.socialLinks.github}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center text-sm text-gray-300 hover:text-purple-400"
                                    >
                                        <Github className="w-4 h-4 mr-1" />
                                        GitHub
                                    </a>
                                )}

                                {user.socialLinks?.twitter && (
                                    <a
                                        href={user.socialLinks.twitter}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center text-sm text-gray-300 hover:text-purple-400"
                                    >
                                        <Twitter className="w-4 h-4 mr-1" />
                                        Twitter
                                    </a>
                                )}

                                {user.socialLinks?.website && (
                                    <a
                                        href={user.socialLinks.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center text-sm text-gray-300 hover:text-purple-400"
                                    >
                                        <ExternalLink className="w-4 h-4 mr-1" />
                                        Website
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* User Snippets */}
                <div>
                    <h2 className="text-2xl font-semibold mb-6 flex items-center">
                        <Code className="w-5 h-5 mr-2 text-purple-400" />
                        Public Snippets
                        <span className="ml-2 text-sm bg-purple-900/50 px-2 py-0.5 rounded-full text-purple-300">
                            {snippets.length}
                        </span>
                    </h2>

                    {/* No Snippets State */}
                    {snippets.length === 0 && (
                        <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-8 text-center">
                            <p className="text-gray-400 text-lg mb-2">No public snippets yet</p>
                            <p className="text-gray-500">
                                {user.displayName || `@${user.username}`} hasn't shared any code snippets yet.
                            </p>
                        </div>
                    )}

                    {/* Snippets Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {snippets.map(snippet => (
                            <Link
                                to={`/shared/${snippet.shareableLink}`}
                                key={snippet.id}
                                className="bg-gray-800/90 border border-gray-700 hover:border-purple-500/50 rounded-lg overflow-hidden cursor-pointer shadow-md hover:shadow-purple-900/10 transition-all flex flex-col"
                            >
                                <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
                                    {/* Language Info */}
                                    <div className="flex items-center gap-2">
                                        <span className={`w-3 h-3 rounded-full ${languageColors[snippet.language] || 'bg-gray-500'}`}></span>
                                        <span className="font-medium text-sm">{snippet.language}</span>
                                    </div>

                                    {/* Created Time */}
                                    <div className="text-xs text-gray-400 flex items-center">
                                        <Clock className="w-3.5 h-3.5 mr-1" />
                                        {getRelativeTime(snippet.updatedAt)}
                                    </div>
                                </div>

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

                                {/* Snippet Stats */}
                                <div className="px-4 py-3 bg-gray-800/70 border-t border-gray-700 flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center">
                                            <ThumbsUp className="w-3.5 h-3.5 mr-1" />
                                            {snippet.likes || 0}
                                        </span>
                                        <span className="flex items-center">
                                            <Eye className="w-3.5 h-3.5 mr-1" />
                                            {snippet.views || 0}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}

// Function to get user by username
async function getUserByUsername(username: string) {
    try {
        // First try to get user by username field
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('username', '==', username));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            return {
                id: userDoc.id,
                ...userDoc.data(),
                createdAt: userDoc.data().createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString()
            };
        }

        // If not found, try if the param is a user ID directly
        const userDocRef = doc(db, 'users', username);
        const userSnapshot = await getDoc(userDocRef);

        if (userSnapshot.exists()) {
            return {
                id: userSnapshot.id,
                ...userSnapshot.data(),
                createdAt: userSnapshot.data().createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString()
            };
        }

        // Not found
        return null;
    } catch (error) {
        console.error('Error fetching user by username:', error);
        return null;
    }
}