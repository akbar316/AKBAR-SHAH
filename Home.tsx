
import React from 'react';
import { Link } from 'react-router-dom';
import { ToolCard } from './components/ToolCard';
import { TOOLS_DATA } from './constants';
import { Shield, Zap, Cloud } from 'lucide-react';

function Home() {
  // Helper for specific 3D rotations based on column index (0-3)
  const getTransformStyles = (index: number) => {
    const colIndex = index % 4;
    let rotateY = 0;
    let translateZ = 0;
    let translateX = 0;

    if (colIndex === 0) {
       rotateY = 12;
       translateZ = -20;
       translateX = 10;
    } else if (colIndex === 1) {
       rotateY = 4;
       translateZ = 0;
    } else if (colIndex === 2) {
       rotateY = -4;
       translateZ = 0;
    } else if (colIndex === 3) {
       rotateY = -12;
       translateZ = -20;
       translateX = -10;
    }

    return {
        transform: `rotateY(${rotateY}deg) translateZ(${translateZ}px) translateX(${translateX}px)`,
    };
  };

  return (
    <>
      <header className="relative z-10 w-full max-w-4xl mx-auto text-center pt-16 pb-20 px-4 animate-in fade-in zoom-in duration-700">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400 drop-shadow-sm">
          All Your Digital Tools. <br /> One Powerful Platform
        </h1>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
          Streamline your workflow with our comprehensive suite of developer, designer, and productivity tools.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link to="/about" className="px-6 py-2 rounded-full border border-gray-700 text-sm text-gray-400 hover:text-white hover:border-gray-500 transition-all">Learn More</Link>
        </div>
      </header>

      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[60%] bg-blue-900/10 blur-[120px] rounded-full pointer-events-none" />
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
                />
              </div>
            ))}
            {TOOLS_DATA.map((tool) => (
              <div key={`mobile-${tool.id}`} className="block lg:hidden">
                <ToolCard 
                  tool={tool} 
                />
              </div>
            ))}
          </div>
          <div className="hidden lg:block absolute -bottom-20 left-0 right-0 h-40 bg-gradient-to-b from-blue-500/5 to-transparent blur-xl pointer-events-none opacity-50 transform rotateX(90deg)" />
        </div>

        <div className="mt-24 text-center">
          <Link 
            to={`/tools/${TOOLS_DATA.flatMap(t => t.subTools)[Math.floor(Math.random() * TOOLS_DATA.flatMap(t => t.subTools).length)].id}`}
            className="relative group px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-sm tracking-wide transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]"
          >
            EXPLORE ALL TOOLS
            <div className="absolute inset-0 bg-white/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </div>
      </main>

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
  );
}

export default Home;
