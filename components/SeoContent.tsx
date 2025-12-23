
import React from 'react';
import { Link } from 'react-router-dom';
import { ToolCategory } from '../types';

interface SeoData {
    title: string;
    description: string;
    content: string;
}

interface SeoContentProps {
  data: SeoData;
  category: ToolCategory;
  currentToolId: string;
}

export const SeoContent: React.FC<SeoContentProps> = ({ data, category, currentToolId }) => {
  if (!data) {
    return null;
  }

  const relatedTools = category.subTools.filter(t => t.id !== currentToolId).slice(0, 5);

  return (
    <div className="mt-20 prose prose-invert prose-lg max-w-none">
      <div dangerouslySetInnerHTML={{ __html: data.content }} />

      {relatedTools.length > 0 && (
        <div className="mt-12">
          <h3 className="text-xl font-bold text-cyan-400 mb-4">Related Tools</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {relatedTools.map(tool => (
              <Link to={`/tools/${tool.id}`} key={tool.id} className="no-underline text-white">
                <div className="p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all h-full flex flex-col items-center text-center">
                  <tool.icon size={24} className="mb-2 text-cyan-400" />
                  <span className="text-sm">{tool.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
