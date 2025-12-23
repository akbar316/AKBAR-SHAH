
import React from 'react';
import { Outlet } from 'react-router-dom';
import { CircuitBackground } from './components/CircuitBackground';
import { Box, Menu } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-transparent text-white font-sans selection:bg-cyan-500/30 overflow-x-hidden relative flex flex-col">
      <CircuitBackground />
      <nav className="relative z-50 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 cursor-pointer flex-shrink-0">
          <a href="/" className="flex items-center gap-2">
            <div className="text-cyan-400">
              <Box size={32} strokeWidth={2} />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white hidden sm:block">Dicetools</span>
          </a>
        </div>
        <div className="hidden md:flex flex-1 max-w-lg mx-auto relative">
          {/* Search will be re-implemented later */}
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400 flex-shrink-0">
          <a href="/" className="hover:text-white transition-colors">Home</a>
          <a href="/" className="hover:text-white transition-colors">Tools</a>
          <a href="/about" className="hover:text-white transition-colors">About</a>
          <a href="/contact" className="hover:text-white transition-colors">Contact</a>
        </div>
        <button className="md:hidden text-white ml-auto">
          <Menu size={24} />
        </button>
      </nav>
      <Outlet />
      <footer className="relative z-10 bg-gradient-to-b from-[#0a0e17] to-black border-t border-white/5 pt-16 pb-8 mt-auto">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <div className="flex items-center gap-4 text-sm text-gray-400 mb-6 md:mb-0">
              <a href="/about" className="hover:text-cyan-400 transition-colors">About Us</a>
              <a href="/contact" className="hover:text-cyan-400 transition-colors">Contact</a>
              <a href="/terms" className="hover:text-cyan-400 transition-colors">Terms of Service</a>
              <a href="/privacy" className="hover:text-cyan-400 transition-colors">Privacy Policy</a>
            </div>
          </div>
          <div className="flex justify-end opacity-20">
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
