
import React from 'react';
import { Link } from 'react-router-dom';
import { tools } from './constants';
import ToolCard from './components/ToolCard';

const Tools: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-4 text-blue-400">All Tools</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <Link to={`/tools/${tool.id}`} key={tool.id}>
            <ToolCard tool={tool} />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Tools;
