
import React from 'react';
import { ToolCard } from './ToolCard';
import { TOOLS_DATA } from '../constants';

interface AllToolsProps {
  onToolSelect: (category: any, tool: any) => void;
}

export const AllTools: React.FC<AllToolsProps> = ({ onToolSelect }) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {TOOLS_DATA.map((category) => (
        <div key={category.id} className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 border-l-4 border-cyan-400 pl-4">{category.title}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {category.subTools.map((tool) => (
              <ToolCard 
                key={tool.id} 
                tool={tool} 
                category={category} 
                onClick={() => onToolSelect(category, tool)} 
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};