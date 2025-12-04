import React from 'react';

export const CircuitBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Top Left Circuit */}
      <svg className="absolute top-0 left-0 w-[400px] h-[300px] opacity-20 text-cyan-500" viewBox="0 0 400 300">
        <path d="M0 50 H50 L80 80 H200" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="200" cy="80" r="3" fill="currentColor" />
        <path d="M20 0 V30 L50 60 H150" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="150" cy="60" r="3" fill="currentColor" />
        <path d="M0 150 H30 L60 180 H120 V250" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="120" cy="250" r="3" fill="currentColor" />
      </svg>

      {/* Top Right Circuit */}
      <svg className="absolute top-0 right-0 w-[400px] h-[300px] opacity-20 text-cyan-500" viewBox="0 0 400 300">
        <path d="M400 60 H350 L320 90 H200" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="200" cy="90" r="3" fill="currentColor" />
        <path d="M380 0 V40 L340 80 H250" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="250" cy="80" r="3" fill="currentColor" />
      </svg>
      
      {/* Bottom Right Circuit */}
      <svg className="absolute bottom-0 right-0 w-[500px] h-[300px] opacity-20 text-cyan-500" viewBox="0 0 500 300">
         <path d="M500 250 H450 L420 220 H300 V150" fill="none" stroke="currentColor" strokeWidth="1" />
         <circle cx="300" cy="150" r="3" fill="currentColor" />
         <path d="M480 300 V270 L450 240 H350" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
    </div>
  );
};