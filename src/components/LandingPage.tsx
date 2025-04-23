import { Link } from 'react-router-dom';
import { Terminal, Zap, Sparkles, Bot, Code, Code2, Braces, ArrowRight, Globe, Server, Save, Share, User, Lock, LogIn } from 'lucide-react';
import NavBar from './NavBar';

const features = [
    {
        icon: <Terminal className="w-10 h-10 text-purple-400 mb-4" />,
        title: "Multiple Languages",
        desc: "Support for popular programming languages including Python, JavaScript, Java, and more.",
    },
    {
        icon: <Zap className="w-10 h-10 text-purple-400 mb-4" />,
        title: "Real-time Execution",
        desc: "Instantly compile and run your code with real-time feedback and error reporting.",
    },
    {
        icon: <Save className="w-10 h-10 text-purple-400 mb-4" />,
        title: "Save & Share Code",
        desc: "Save your code snippets to your profile and easily share them with others via a unique link.",
    },
    {
        icon: <Bot className="w-10 h-10 text-purple-400 mb-4" />,
        title: "AI Assistant",
        desc: "Get help from our AI assistant to optimize, debug, or explain your code.",
    },
];

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white flex flex-col font-sans">
            <NavBar showHomeButton={false} />
            <Hero />
            <Features />
            <UserFeatures />
            <Footer />
        </div>
    );
}

function Hero() {
    return (
        <section className="relative py-16 sm:py-20 px-4 overflow-hidden">
            <div className="relative max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6">

                {/* Left Content */}
                <div className="flex-1 flex flex-col items-center text-center">
                    {/* Badge */}
                    <div className="flex items-center px-3 py-1 mb-6 bg-purple-900/30 border border-purple-500/30 rounded-full text-sm text-purple-300 backdrop-blur-sm">
                        <Sparkles className="w-4 h-4 mr-2 text-purple-400" />
                        <span>AI-powered code intelligence</span>
                    </div>

                    {/* Heading */}
                    <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
                        <span>Modern</span>{" "}
                        <span className="bg-gradient-to-r from-purple-400 via-violet-500 to-indigo-400 bg-clip-text text-transparent">Code Compilation</span>{" "}
                        <span>in the Cloud</span>
                    </h1>

                    {/* Subtext */}
                    <p className="mt-6 text-xl text-gray-300/90 max-w-xl">
                        Write, compile, and execute code in multiple languages directly in your browser.
                        Save your snippets and share them with friends. No setup required.
                    </p>

                    {/* CTA Buttons */}
                    <div className="mt-8 flex flex-wrap gap-4 justify-center">
                        <Link
                            to="/compiler"
                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 rounded-xl text-lg font-medium transition-all shadow-lg hover:shadow-purple-600/20 flex items-center gap-2 group"
                        >
                            <span>Start Coding Now</span>
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Link>

                        <Link
                            to="/auth"
                            className="px-6 py-3 border border-purple-500/30 hover:border-purple-500 bg-gray-900/50 hover:bg-gray-800/50 rounded-xl text-lg font-medium transition-all flex items-center gap-2"
                        >
                            <span>Create Account</span>
                            <User className="w-4 h-4" />
                        </Link>
                    </div>
                </div>

                {/* Right Content */}
                <div className="flex-1 flex flex-col items-center w-full">
                    <div className="relative w-full max-w-md float-animation">
                        {/* Glow */}
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-violet-600 rounded-2xl blur-xl opacity-10"></div>

                        {/* Code Snippet */}
                        <div className="relative">
                            <CodeSnippet />
                        </div>
                        {/* Decorative code blocks */}
                        <div className="absolute -right-12 -bottom-12 w-24 h-24 bg-gray-800/70 rounded-lg border border-purple-500/20 backdrop-blur-sm rotate-6 hidden lg:block hover:rotate-3 transition-transform">
                            <Code className="w-12 h-12 text-purple-400/50 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                        </div>
                    </div>

                    {/* Features */}
                    <div className="mt-20 grid grid-cols-4 gap-4 max-w-lg w-full">
                        {[
                            { icon: <Globe className="w-6 h-6 text-purple-400" />, label: "9+ Languages" },
                            { icon: <Save className="w-6 h-6 text-purple-400" />, label: "Save Snippets" },
                            { icon: <Bot className="w-6 h-6 text-purple-400" />, label: "AI Assistant" },
                            { icon: <Share className="w-6 h-6 text-purple-400" />, label: "Share Code" },
                        ].map((item, idx) => (
                            <div key={idx} className="flex flex-col items-center">
                                <div className="w-12 h-12 flex items-center justify-center bg-purple-900/30 border border-purple-500/30 rounded-full mb-2 hover:scale-110 transition-transform">
                                    {item.icon}
                                </div>
                                <span className="text-sm text-gray-300">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function CodeSnippet() {
    return (
        <div className="w-full md:flex-1 max-w-2xl">
            <div className="bg-gray-800/70 rounded-xl border border-purple-900/50 shadow-lg overflow-hidden backdrop-blur-md hover:shadow-purple-600/10 hover:border-purple-700/60 transition-all duration-300">
                {/* Terminal header */}
                <div className="bg-gray-800/90 px-3 py-1.5 sm:px-4 sm:py-2 border-b border-purple-900/30 flex items-center justify-between">
                    <div className="flex space-x-1.5 sm:space-x-2">
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors cursor-pointer"></div>
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500 hover:bg-yellow-400 transition-colors cursor-pointer"></div>
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500 hover:bg-green-400 transition-colors cursor-pointer"></div>
                    </div>
                    <div className="flex items-center text-xs text-gray-400 bg-gray-700/50 px-2 py-0.5 rounded-md">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                        main.js
                    </div>
                </div>

                {/* Code content */}
                <div className="relative">
                    {/* Code content*/}
                    <div className="p-2 sm:p-4 pl-8 overflow-x-auto font-mono text-xs sm:text-sm leading-relaxed">
                        <pre className="text-gray-300 font-mono whitespace-pre-wrap break-words">
                            <div className="relative">
                                <code className="block">
                                    <span className="text-purple-400">function</span> <span className="text-blue-400">greet</span>(<span className="text-yellow-300">name</span>) {'{'}
                                </code>
                                <code className="block pl-4 relative">
                                    <span className="relative text-purple-400">return</span> <span className="relative text-green-400">{"`Hello, ${name}! Welcome to NeoCompiler`"}</span>;
                                </code>
                                <code className="block">{'}'}</code>
                                <code className="block"></code>
                                <code className="block"><span className="text-purple-400">const</span> <span className="text-blue-300">result</span> = greet(<span className="text-green-400">"Developer"</span>);</code>
                                <code className="block">console.<span className="text-blue-400">log</span>(result);</code>
                            </div>
                        </pre>
                    </div>
                </div>

                {/* Terminal output with typing animation effect */}
                <div className="bg-gray-900/80 border-t border-purple-900/30 p-3 sm:p-4">
                    <div className="flex items-center text-xs uppercase text-gray-500 mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></div>
                        <span>Output</span>
                        <span className="ml-auto text-[10px] text-gray-500">terminal</span>
                    </div>
                    <pre className="text-xs sm:text-sm text-purple-500 font-mono whitespace-pre-wrap break-words relative">
                        <span className="typing-animation">Hello, Developer! Welcome to NeoCompiler</span>
                    </pre>
                </div>
            </div>
        </div>
    );
}

function Features() {
    return (
        <section className="py-16">
            <div className="max-w-6xl mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map(({ icon, title, desc }) => (
                        <div key={title} className="p-6 bg-gray-800/50 rounded-xl border border-purple-900/30 hover:border-purple-500/50 transition-all">
                            {icon}
                            <h3 className="text-xl font-semibold mb-2">{title}</h3>
                            <p className="text-gray-300">{desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function UserFeatures() {
    return (
        <section className="py-16 bg-gray-900/50">
            <div className="max-w-6xl mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-6">Start Building Your Code Library</h2>
                <p className="text-center text-lg text-gray-300 mb-12 max-w-2xl mx-auto">
                    Create an account to save your code snippets, share them with others, and build a personal library of your coding journey.
                </p>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-6 bg-gray-800/50 rounded-xl border border-purple-900/30 hover:border-purple-500/50 transition-all flex flex-col items-center text-center">
                        <div className="w-16 h-16 flex items-center justify-center bg-purple-900/30 rounded-full mb-4">
                            <Save className="w-8 h-8 text-purple-400" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Save Your Code</h3>
                        <p className="text-gray-300">
                            Never lose your code snippets again. Save them to your account with custom titles and descriptions.
                        </p>
                    </div>
                    
                    <div className="p-6 bg-gray-800/50 rounded-xl border border-purple-900/30 hover:border-purple-500/50 transition-all flex flex-col items-center text-center">
                        <div className="w-16 h-16 flex items-center justify-center bg-purple-900/30 rounded-full mb-4">
                            <Share className="w-8 h-8 text-purple-400" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Share with Others</h3>
                        <p className="text-gray-300">
                            Generate shareable links to send to friends, colleagues, or post online. Control who can see your code.
                        </p>
                    </div>
                    
                    <div className="p-6 bg-gray-800/50 rounded-xl border border-purple-900/30 hover:border-purple-500/50 transition-all flex flex-col items-center text-center">
                        <div className="w-16 h-16 flex items-center justify-center bg-purple-900/30 rounded-full mb-4">
                            <Lock className="w-8 h-8 text-purple-400" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Private & Secure</h3>
                        <p className="text-gray-300">
                            Your private snippets stay private. Choose which snippets to make public and which to keep just for you.
                        </p>
                    </div>
                </div>
                
                <div className="mt-12 flex justify-center">
                    <Link
                        to="/auth"
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 rounded-xl text-lg font-medium transition-all shadow-lg hover:shadow-purple-600/20 flex items-center gap-2"
                    >
                        <span>Create Free Account</span>
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        </section>
    );
}

function Footer() {
    return (
        <footer className="py-5 border-t border-purple-900/40 bg-gray-900/90 backdrop-blur-sm">
            <div className="max-w-6xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-gray-400">
                        <div className="flex items-center gap-2 mb-2">
                            <Code2 className="w-5 h-5 text-purple-500" />
                            <span className="font-medium text-gray-300">NeoCompiler</span>
                        </div>
                        <p className="text-sm text-gray-500">© {new Date().getFullYear()} NeoCompiler. All rights reserved.</p>
                        <p className="text-sm text-gray-500">Developed by <a href="https://deepakmodi.vercel.app" className="text-purple-400 hover:text-purple-300 transition-colors">Deepak Modi</a></p>
                    </div>
                    <div>
                        <a
                            href="https://github.com/deepakmodi/neo-compiler"
                            className="flex items-center gap-2 px-5 py-2.5 bg-gray-800/80 hover:bg-gray-700 border border-purple-900/30 hover:border-purple-500/50 rounded-lg transition-all shadow-sm hover:shadow-purple-900/20"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                            </svg>
                            <span>Star on GitHub</span>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}