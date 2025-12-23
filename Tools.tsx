import React from 'react';
import { TOOLS_DATA } from './constants';
import { ToolCard } from './components/ToolCard';

const Tools: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-4 text-center text-blue-400">All Tools</h1>
      <p className="text-lg text-gray-400 text-center mb-12">A collection of powerful utilities to streamline your tasks.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {TOOLS_DATA.map((tool) => (
          <ToolCard tool={tool} key={tool.id} />
        ))}
      </div>
    </div>
  );
};

export default Tools;
