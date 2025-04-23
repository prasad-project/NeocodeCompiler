import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Code2, LogIn, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ProfileMenu from './ProfileMenu';

type NavBarProps = {
    showCompilerButton?: boolean;
    showHomeButton?: boolean;
    showCommunityButton?: boolean;
    additionalButtons?: React.ReactNode;
};

export default function NavBar({
    showCompilerButton = true,
    showCommunityButton = true,
    additionalButtons
}: NavBarProps) {
    const { currentUser } = useAuth();
    const location = useLocation();

    // Determine current page based on location path
    const isHomePage = location.pathname === '/';
    const isCompilerPage = location.pathname === '/compiler';
    const isCommunityPage = location.pathname === '/community';

    return (
        <header className="backdrop-blur-sm bg-gray-900/80 border-b border-purple-900/40 shadow-sm px-6 py-4 sticky top-0 z-20">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Logo and Title */}
                <div className="flex items-center gap-3">
                    <Link to="/" className="flex items-center gap-3">
                        <Code2 className="w-7 h-7 text-purple-400" />
                        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight bg-gradient-to-r from-purple-400 to-violet-500 bg-clip-text text-transparent">
                            NeoCompiler
                        </h1>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex items-center gap-2 sm:gap-4">
                    {/* Community button */}
                    {showCommunityButton && !isCommunityPage && (
                        <Link
                            to="/community"
                            className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-200 transition-colors"
                        >
                            <Globe className="w-4 h-4" />
                            <span>Community</span>
                        </Link>
                    )}

                    {/* Additional buttons passed from parent component */}
                    {additionalButtons}

                    {/* User is logged in - show profile menu */}
                    {currentUser ? (
                        <>
                            {/* Compiler button */}
                            {showCompilerButton && !isCompilerPage && (
                                <Link
                                    to="/compiler"
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-all"
                                >
                                    {isHomePage ? "Launch Compiler" : "Launch Compiler"}
                                </Link>
                            )}

                            {/* Profile Menu */}
                            <ProfileMenu />
                        </>
                    ) : (
                        /* User is not logged in - show login button */
                        <>
                            {/* Login button */}
                            <Link
                                to="/auth"
                                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-all"
                            >
                                <LogIn className="w-4 h-4" />
                                <span>Login / Register</span>
                            </Link>

                            {/* Compiler button */}
                            {showCompilerButton && !isCompilerPage && (
                                <Link
                                    to="/compiler"
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-all"
                                >
                                    {isHomePage ? "Launch Compiler" : "Launch Compiler"}
                                </Link>
                            )}
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}