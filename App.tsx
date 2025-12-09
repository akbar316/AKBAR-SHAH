
import React, { useState, useEffect, useRef } from 'react';
import { Box, Shield, Zap, Cloud, Menu, Search, X } from 'lucide-react';
import { ToolCard } from './components/ToolCard';
import { CircuitBackground } from './components/CircuitBackground';
import { ActiveTool } from './components/ActiveTool';
import { LegalPageContainer } from './components/LegalPages';
import { TOOLS_DATA } from './constants';
import { SubTool, ToolCategory } from './types';

function App() {
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  // SEO: Sync State with URL Query Parameters
  useEffect(() => {
    // Function to handle URL changes (Back button or initial load)
    const handlePopState = () => {
       const params = new URLSearchParams(window.location.search);
       const toolParam = params.get('tool');
       setActiveToolId(toolParam);
    };
    
    // Listen for back/forward navigation
    window.addEventListener('popstate', handlePopState);
    
    // Check URL on initial mount
    handlePopState();
    
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
            setSearchResults([]);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update URL when tool is selected (Push State)
  const handleToolSelect = (id: string | null) => {
      setActiveToolId(id);
      if (id) {
          const newUrl = `${window.location.pathname}?tool=${id}`;
          window.history.pushState({ tool: id }, '', newUrl);
          // Scroll to top when opening a tool
          window.scrollTo(0, 0);
      } else {
          const newUrl = window.location.pathname;
          window.history.pushState({}, '', newUrl);
          window.scrollTo(0, 0);
      }
      // Clear search on selection
      setSearchQuery('');
      setSearchResults([]);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value;
      setSearchQuery(query);

      if (query.trim().length > 0) {
          const results: any[] = [];
          TOOLS_DATA.forEach(cat => {
              cat.subTools.forEach(tool => {
                  if (tool.name.toLowerCase().includes(query.toLowerCase()) || 
                      cat.title.toLowerCase().includes(query.toLowerCase())) {
                      results.push({...tool, categoryName: cat.title});
                  }
              });
          });
          setSearchResults(results.slice(0, 6)); // Limit results
      } else {
          setSearchResults([]);
      }
  };

  // Helper to find tool data based on ID
  const getActiveToolData = () => {
    if (!activeToolId) return null;
    for (const cat of TOOLS_DATA) {
        const sub = cat.subTools.find(t => t.id === activeToolId);
        if (sub) return { category: cat, subTool: sub };
    }
    return null;
  };

  const activeData = getActiveToolData();
  const isLegalPage = ['about', 'contact', 'terms', 'privacy'].includes(activeToolId || '');

  // Helper for specific 3D rotations based on column index (0-3)
  const getTransformStyles = (index: number) => {
    // Map index 0-7 to columns 0-3
    const colIndex = index % 4;
    
    // Default values
    let rotateY = 0;
    let translateZ = 0;
    let translateX = 0;

    // Concave Curve Logic
    if (colIndex === 0) {
       rotateY = 12; // Rotate inwards from left
       translateZ = -20;
       translateX = 10;
    } else if (colIndex === 1) {
       rotateY = 4;
       translateZ = 0;
    } else if (colIndex === 2) {
       rotateY = -4;
       translateZ = 0;
    } else if (colIndex === 3) {
       rotateY = -12; // Rotate inwards from right
       translateZ = -20;
       translateX = -10;
    }

    return {
        transform: `rotateY(${rotateY}deg) translateZ(${translateZ}px) translateX(${translateX}px)`,
    };
  };

  return (
    <div className="min-h-screen bg-transparent text-white font-sans selection:bg-cyan-500/30 overflow-x-hidden relative flex flex-col">
      <CircuitBackground />
      
      {/* Navigation */}
      <nav className="relative z-50 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between gap-4">
        {/* Logo */}
        <div 
            className="flex items-center gap-2 cursor-pointer flex-shrink-0" 
            onClick={() => handleToolSelect(null)}
        >
          <div className="text-cyan-400">
            <Box size={32} strokeWidth={2} />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white hidden sm:block">Dicetools</span>
        </div>

        {/* Search Bar (Centered) */}
        <div className="hidden md:flex flex-1 max-w-lg mx-auto relative" ref={searchRef}>
            <div className="relative w-full group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={16} className="text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                </div>
                <input 
                    type="text"
                    value={searchQuery}
                    onChange={handleSearch}
                    className="block w-full pl-10 pr-10 py-2.5 border border-gray-800 rounded-full leading-5 bg-gray-900/80 backdrop-blur-md text-gray-300 placeholder-gray-500 focus:outline-none focus:bg-gray-900 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 sm:text-sm transition-all shadow-lg shadow-black/20"
                    placeholder="Search tools (e.g., PDF Merge, Resize)..."
                />
                {searchQuery && (
                    <button 
                        onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white transition-colors"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="py-2">
                        {searchResults.map((result) => (
                            <button
                                key={result.id}
                                onClick={() => handleToolSelect(result.id)}
                                className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center gap-3 transition-colors border-b border-gray-800 last:border-0 group"
                            >
                                <div className="p-2 bg-gray-800 rounded-lg text-cyan-400 group-hover:bg-cyan-900/30 group-hover:text-cyan-300 transition-colors">
                                    <result.icon size={18} />
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-200 group-hover:text-white">{result.name}</div>
                                    <div className="text-xs text-gray-500">{result.categoryName}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
        
        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400 flex-shrink-0">
          <button onClick={() => handleToolSelect(null)} className="hover:text-white transition-colors">Home</button>
          <button onClick={() => handleToolSelect(null)} className="hover:text-white transition-colors">Tools</button>
          <button onClick={() => handleToolSelect('about')} className="hover:text-white transition-colors">About</button>
          <button onClick={() => handleToolSelect('contact')} className="hover:text-white transition-colors">Contact</button>
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden text-white ml-auto" onClick={() => handleToolSelect(null)}>
          <Menu size={24} />
        </button>
      </nav>

      {/* Main Content Area */}
      {isLegalPage && activeToolId ? (
          <LegalPageContainer pageId={activeToolId} onBack={() => handleToolSelect(null)} />
      ) : activeToolId && activeData ? (
          <ActiveTool 
            toolId={activeToolId} 
            toolData={activeData.subTool} 
            category={activeData.category} 
            onBack={() => handleToolSelect(null)}
            onSelectTool={(id) => handleToolSelect(id)}
          />
      ) : (
          <>
            {/* Hero Section */}
            <header className="relative z-10 w-full max-w-4xl mx-auto text-center pt-16 pb-20 px-4 animate-in fade-in zoom-in duration-700">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400 drop-shadow-sm">
                All Your Digital Tools. <br /> One Powerful Platform
                </h1>
                <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                Streamline your workflow with our comprehensive suite of developer, designer, and productivity tools.
                </p>
                <div className="mt-8 flex justify-center gap-4">
                   <button onClick={() => handleToolSelect('about')} className="px-6 py-2 rounded-full border border-gray-700 text-sm text-gray-400 hover:text-white hover:border-gray-500 transition-all">Learn More</button>
                </div>
            </header>

            {/* Tools Grid Section */}
            <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
                {/* Background glow behind cards */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[60%] bg-blue-900/10 blur-[120px] rounded-full pointer-events-none" />

                {/* Perspective Container */}
                <div className="perspective-[2000px]">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-y-12 lg:gap-x-6 transform-style-3d">
                        {TOOLS_DATA.map((tool, index) => (
                            <div 
                                key={tool.id} 
                                className="hidden lg:block transition-transform duration-500"
                                style={getTransformStyles(index)}
                            >
                                <ToolCard 
                                    tool={tool} 
                                    onSelectTool={(id) => handleToolSelect(id)}
                                />
                            </div>
                        ))}
                         {/* Mobile/Tablet Fallback (No 3D) */}
                         {TOOLS_DATA.map((tool) => (
                            <div key={`mobile-${tool.id}`} className="block lg:hidden">
                                <ToolCard 
                                    tool={tool} 
                                    onSelectTool={(id) => handleToolSelect(id)}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Reflection/Ground Effect for Desktop */}
                    <div className="hidden lg:block absolute -bottom-20 left-0 right-0 h-40 bg-gradient-to-b from-blue-500/5 to-transparent blur-xl pointer-events-none opacity-50 transform rotateX(90deg)" />
                </div>

                <div className="mt-24 text-center">
                <button 
                    onClick={() => {
                        const allTools = TOOLS_DATA.flatMap(t => t.subTools);
                        const random = allTools[Math.floor(Math.random() * allTools.length)];
                        handleToolSelect(random.id);
                    }}
                    className="relative group px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-sm tracking-wide transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]"
                >
                    EXPLORE ALL TOOLS
                    <div className="absolute inset-0 bg-white/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                </div>
            </main>

            {/* Features Section */}
            <section className="relative z-10 w-full bg-[#0a0e17]/50 backdrop-blur-sm border-t border-white/5 py-24">
                <div className="max-w-7xl mx-auto px-6 text-center">
                <h2 className="text-2xl font-semibold mb-16">Why Choose Dicetools?</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="flex flex-col items-center group">
                    <div className="w-16 h-16 rounded-full border-2 border-cyan-500/50 flex items-center justify-center mb-6 group-hover:border-cyan-400 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all">
                        <Shield className="text-cyan-400" size={32} />
                    </div>
                    <h3 className="text-lg font-medium text-cyan-400 mb-2">Secure</h3>
                    <p className="text-gray-500 text-sm max-w-xs">Enterprise-grade encryption for all your data processing needs.</p>
                    </div>
                    
                    <div className="flex flex-col items-center group">
                    <div className="w-16 h-16 rounded-full border-2 border-cyan-500/50 flex items-center justify-center mb-6 group-hover:border-cyan-400 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all">
                        <Zap className="text-cyan-400" size={32} />
                    </div>
                    <h3 className="text-lg font-medium text-cyan-400 mb-2">Fast</h3>
                    <p className="text-gray-500 text-sm max-w-xs">Optimized algorithms ensuring lightning-fast results every time.</p>
                    </div>
                    
                    <div className="flex flex-col items-center group">
                    <div className="w-16 h-16 rounded-full border-2 border-cyan-500/50 flex items-center justify-center mb-6 group-hover:border-cyan-400 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all">
                        <Cloud className="text-cyan-400" size={32} />
                    </div>
                    <h3 className="text-lg font-medium text-cyan-400 mb-2">Cloud-Based</h3>
                    <p className="text-gray-500 text-sm max-w-xs">Access your tools from anywhere, on any device, instantly.</p>
                    </div>
                </div>
                </div>
            </section>
          </>
      )}

      {/* Footer */}
      <footer className="relative z-10 bg-gradient-to-b from-[#0a0e17] to-black border-t border-white/5 pt-16 pb-8 mt-auto">
        {/* Glow Line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <div className="flex items-center gap-4 text-sm text-gray-400 mb-6 md:mb-0">
              <button onClick={() => handleToolSelect('about')} className="hover:text-cyan-400 transition-colors">About Us</button>
              <button onClick={() => handleToolSelect('contact')} className="hover:text-cyan-400 transition-colors">Contact</button>
              <button onClick={() => handleToolSelect('terms')} className="hover:text-cyan-400 transition-colors">Terms of Service</button>
              <button onClick={() => handleToolSelect('privacy')} className="hover:text-cyan-400 transition-colors">Privacy Policy</button>
            </div>
          </div>
          
          <div className="flex justify-end opacity-20">
             {/* Decorative star */}
             <div className="text-white transform rotate-45">
                <svg width="60" height="60" viewBox="0 0 100 100" fill="currentColor">
                   <path d="M50 0 L60 40 L100 50 L60 60 L50 100 L40 60 L0 50 L40 40 Z" />
                </svg>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
