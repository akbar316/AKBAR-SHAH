import React from 'react';
import { ToolCategory } from '../types';

interface ToolCardProps {
  tool: ToolCategory;
  onSelectTool: (toolId: string) => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, onSelectTool }) => {
  const MainIcon = tool.mainIcon;

  return (
    <div 
      className={`
        relative group cursor-pointer transition-all duration-500 ease-out
        hover:-translate-y-2 hover:shadow-2xl
        w-full max-w-[300px] h-[480px] mx-auto
        perspective-1000
      `}
    >
      {/* Card Container - Imitating the skewed 3D look with gradient and borders */}
      <div 
        className={`
          relative w-full h-full flex flex-col items-center
          bg-gradient-to-b ${tool.gradientFrom} ${tool.gradientTo}
          border-t border-l border-white/10 border-b border-r border-black/50
          ${tool.borderColor} border
          rounded-xl overflow-hidden
          shadow-lg ${tool.shadowColor}
          backdrop-blur-sm
        `}
      >
        {/* Shine Effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />

        {/* Header Section of Card */}
        <div className="pt-10 pb-6 text-center w-full z-10">
          <h3 className="text-xl font-medium text-white mb-6 tracking-wide drop-shadow-md">{tool.title}</h3>
          
          {/* Main Large Icon */}
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)] mb-3 group-hover:scale-110 transition-transform duration-300">
               <MainIcon size={48} className="text-white opacity-90" strokeWidth={1.5} />
            </div>
            <span className="text-sm text-gray-400 font-light tracking-wider uppercase">{tool.description}</span>
          </div>
        </div>

        {/* Sub Tools Grid */}
        <div className="w-full px-6 pb-8 mt-auto z-10">
          <div className="grid grid-cols-3 gap-3">
            {/* The main icon acts as the 'default' tool or main category entry */}
            <div className="flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-1 group-hover:bg-white/10 transition-colors">
                  <span className="text-2xl font-bold text-gray-400 opacity-50">{tool.title.charAt(0)}</span>
                </div>
                <span className="text-[10px] text-gray-500 text-center leading-tight">{tool.title.split(' ')[0]}</span>
            </div>
            
            {tool.subTools.map((sub) => (
              <div 
                key={sub.id} 
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTool(sub.id);
                }}
                className="flex flex-col items-center justify-center group/item"
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-1 hover:bg-white/20 hover:border-cyan-500/50 hover:shadow-[0_0_10px_rgba(6,182,212,0.2)] transition-all cursor-pointer">
                  <sub.icon size={20} className="text-gray-300 group-hover/item:text-cyan-400" strokeWidth={1.5} />
                </div>
                <span className="text-[10px] text-gray-500 text-center leading-tight px-1 break-words w-full group-hover/item:text-cyan-400/80 transition-colors">
                  {sub.name}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Bottom Glow */}
        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50`} />
      </div>
    </div>
  );
};