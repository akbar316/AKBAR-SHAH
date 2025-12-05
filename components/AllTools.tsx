import React from 'react';
import { ALL_TOOLS_DATA } from '../allToolsData';
import { ToolCard } from './ToolCard';

export const AllTools = () => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-4xl font-bold text-white mb-8">All Tools</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {ALL_TOOLS_DATA.map(category => (
          <div key={category.id}>
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">{category.title}</h2>
            <div className="grid gap-4">
              {category.subTools.map(tool => (
                <ToolCard key={tool.id} tool={category} onSelectTool={() => {}} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
