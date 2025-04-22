import { Link } from 'react-router-dom';
import { Code2, Terminal, Zap, GitBranch } from 'lucide-react';

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
        icon: <GitBranch className="w-10 h-10 text-purple-400 mb-4" />,
        title: "Advanced Editor",
        desc: "Feature-rich code editor with syntax highlighting, auto-complete, and code formatting.",
    },
];

function Header() {
    return (
        <header className="border-b border-purple-900/40 shadow-sm px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Code2 className="w-7 h-7 text-purple-400" />
                    <h1 className="text-xl sm:text-2xl font-semibold tracking-tight bg-gradient-to-r from-purple-400 to-violet-500 bg-clip-text text-transparent">
                        NeoCompiler
                    </h1>
                </div>
                <nav>
                    <Link
                        to="/compiler"
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-all"
                    >
                        Launch Compiler
                    </Link>
                </nav>
            </div>
        </header>
    );
}

function Hero() {
    return (
        <section className="flex-1 flex flex-col md:flex-row items-center justify-between px-4 py-20 mx-auto max-w-7xl gap-16">
            <div className="flex-1 md:max-w-xl text-center">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                    Modern <span className="bg-gradient-to-r from-purple-400 to-violet-500 bg-clip-text text-transparent">Code Compilation</span> in the Cloud
                </h1>
                <p className="mt-6 text-xl text-gray-300">
                    Write, compile, and execute code in multiple languages directly in your browser.
                    No setup required. Perfect for learning, testing, and sharing code snippets.
                </p>
                <div className="mt-10">
                    <Link
                        to="/compiler"
                        className="px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-xl text-lg font-medium transition-all shadow-lg hover:shadow-purple-600/20"
                    >
                        Start Coding Now
                    </Link>
                </div>
            </div>
            <div className="flex-1 w-full max-w-2xl">
                <CodeSnippet />
            </div>
        </section>
    );
}

function CodeSnippet() {
    return (
        <div className="w-full md:flex-1 max-w-2xl">
            <div className="bg-gray-800/70 rounded-xl border border-purple-900/50 shadow-lg overflow-hidden backdrop-blur-md">
                <div className="bg-gray-800/80 px-3 py-1.5 sm:px-4 sm:py-2 border-b border-purple-900/30 flex items-center">
                    <div className="flex space-x-1.5 sm:space-x-2">
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500"></div>
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="mx-auto text-xs text-gray-400">main.js</div>
                </div>
                <div className="p-2 sm:p-4 overflow-x-auto font-mono text-xs sm:text-sm leading-relaxed">
                    <pre className="text-gray-300 font-mono whitespace-pre-wrap break-words">
                        <code>
                            <span className="text-purple-400">function</span> <span className="text-blue-400">greet</span>(<span className="text-yellow-300">name</span>) {'{'}<br />
                            {'  '}<span className="text-purple-400">return</span> <span className="text-green-400">{"`Hello, ${name}! Welcome to NeoCompiler`"}</span>;<br />
                            {'}'}<br />
                            <br />
                            <span className="text-purple-400">const</span> <span className="text-blue-300">result</span> = greet(<span className="text-green-400">"Developer"</span>);<br />
                            console.<span className="text-blue-400">log</span>(result);<br />
                        </code>
                    </pre>
                </div>
                <div className="bg-gray-900/80 border-t border-purple-900/30 p-3 sm:p-4">
                    <p className="text-xs uppercase text-gray-500 mb-1">Output:</p>
                    <pre className="text-xs sm:text-sm text-purple-500 font-mono whitespace-pre-wrap break-words">
                        Output: Hello, Developer! Welcome to NeoCompiler
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
                <div className="grid md:grid-cols-3 gap-8">
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

function Footer() {
    return (
        <footer className="py-8 border-t border-purple-900/30 bg-gray-900/80">
            <div className="max-w-6xl mx-auto px-4 text-center text-gray-400">
                <p>© {new Date().getFullYear()} NeoCompiler. All rights reserved.</p>
            </div>
        </footer>
    );
}

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white flex flex-col font-sans">
            <Header />
            <Hero />
            <Features />
            <Footer />
        </div>
    );
}