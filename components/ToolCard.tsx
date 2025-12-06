import React from 'react';
import { SubTool, ToolCategory } from '../types';

interface ToolCardProps {
  tool: SubTool;
  category: ToolCategory;
  onClick: () => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, category, onClick }) => {
  const Icon = tool.icon;

  return (
    <div 
      onClick={onClick}
      className="group cursor-pointer bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 hover:border-cyan-500/50 rounded-lg p-6 flex flex-col items-center text-center transition-all duration-300 h-full"
    >
      <div className="w-16 h-16 rounded-lg bg-gray-700/50 flex items-center justify-center mb-4 group-hover:bg-cyan-500/10 transition-colors duration-300">
        <Icon size={32} className="text-gray-300 group-hover:text-cyan-400 transition-colors duration-300" />
      </div>
      <h3 className="text-white font-semibold mb-2">{tool.name}</h3>
      <p className="text-gray-400 text-sm">{tool.description}</p>
    </div>
  );
};