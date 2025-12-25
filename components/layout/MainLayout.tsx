
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { Box, Menu, Search, X } from 'lucide-react';
import { CircuitBackground } from '../CircuitBackground';
import { TOOLS_DATA } from '../../constants';

export function MainLayout() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchResults([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim().length > 1) {
      const results: any[] = [];
      TOOLS_DATA.forEach(cat => {
        cat.subTools.forEach(tool => {
          if (tool.name.toLowerCase().includes(query.toLowerCase()) || cat.title.toLowerCase().includes(query.toLowerCase())) {
            results.push({ ...tool, categoryName: cat.title });
          }
        });
      });
      setSearchResults(results.slice(0, 6));
    } else {
      setSearchResults([]);
    }
  };

  const handleToolSelect = (id: string) => {
    navigate(`/tools/${id}`);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div className="min-h-screen bg-transparent text-white font-sans selection:bg-cyan-500/30 overflow-x-hidden relative flex flex-col">
      <CircuitBackground />

      <nav className="relative z-50 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 cursor-pointer flex-shrink-0">
          <div className="text-cyan-400">
            <Box size={32} strokeWidth={2} />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white hidden sm:block">Dicetools</span>
        </Link>

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

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400 flex-shrink-0">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <Link to="/" className="hover:text-white transition-colors">Tools</Link>
          <Link to="/about" className="hover:text-white transition-colors">About</Link>
          <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
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
              <Link to="/about" className="hover:text-cyan-400 transition-colors">About Us</Link>
              <Link to="/contact" className="hover:text-cyan-400 transition-colors">Contact</Link>
              <Link to="/terms" className="hover:text-cyan-400 transition-colors">Terms of Service</Link>
              <Link to="/privacy" className="hover:text-cyan-400 transition-colors">Privacy Policy</Link>
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
