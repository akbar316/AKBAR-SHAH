import React, { useState } from 'react';
import { Box, Shield, Zap, Cloud, Menu, Twitter, Github, Linkedin, ChevronDown } from 'lucide-react';
import { ToolCard } from './components/ToolCard';
import { CircuitBackground } from './components/CircuitBackground';
import { ActiveTool } from './components/ActiveTool';
import { TOOLS_DATA } from './constants';
import { SubTool, ToolCategory } from './types';

function App() {
  const [activeToolId, setActiveToolId] = useState<string | null>(null);

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
    <div className="min-h-screen bg-[#050508] text-white font-sans selection:bg-cyan-500/30 overflow-x-hidden relative flex flex-col">
      <CircuitBackground />
      
      {/* Navigation */}
      <nav className="relative z-50 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => setActiveToolId(null)}
        >
          <div className="text-cyan-400">
            <Box size={32} strokeWidth={2} />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">Dicetools</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
          <button onClick={() => setActiveToolId(null)} className="hover:text-white transition-colors">Home</button>
          <button onClick={() => setActiveToolId(null)} className="hover:text-white transition-colors">Tools</button>
          <a href="#" className="hover:text-white transition-colors">Blog</a>
        </div>

        <button className="md:hidden text-white">
          <Menu size={24} />
        </button>
      </nav>

      {/* Main Content Area */}
      {activeToolId && activeData ? (
          <ActiveTool 
            toolId={activeToolId} 
            toolData={activeData.subTool} 
            category={activeData.category} 
            onBack={() => setActiveToolId(null)}
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
                                    onSelectTool={(id) => setActiveToolId(id)}
                                />
                            </div>
                        ))}
                         {/* Mobile/Tablet Fallback (No 3D) */}
                         {TOOLS_DATA.map((tool) => (
                            <div key={`mobile-${tool.id}`} className="block lg:hidden">
                                <ToolCard 
                                    tool={tool} 
                                    onSelectTool={(id) => setActiveToolId(id)}
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
                        setActiveToolId(random.id);
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
              <a href="#" className="hover:text-cyan-400 transition-colors">About Us</a>
              <a href="#" className="hover:text-cyan-400 transition-colors">Blog</a>
              <a href="#" className="hover:text-cyan-400 transition-colors">Contact</a>
              <a href="#" className="hover:text-cyan-400 transition-colors">Terms of Service</a>
            </div>
            
            {/* Social Icons Removed */}
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