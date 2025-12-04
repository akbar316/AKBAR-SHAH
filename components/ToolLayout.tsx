import React from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { SubTool, ToolCategory } from '../types';

interface ToolLayoutProps {
  toolData: SubTool;
  category: ToolCategory;
  onBack: () => void;
  notification: string | null;
  children: React.ReactNode;
}

export const ToolLayout: React.FC<ToolLayoutProps> = ({ 
  toolData, 
  category, 
  onBack, 
  notification, 
  children 
}) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[80vh] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Tool Header */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-800">
        <div className="flex items-center gap-4">
            <button 
                onClick={onBack}
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-300 hover:text-white transition-colors"
            >
                <ArrowLeft size={20} />
            </button>
            <div>
                <div className="flex items-center gap-2">
                    <toolData.icon className="text-cyan-400" size={24} />
                    <h2 className="text-2xl font-bold text-white">{toolData.name}</h2>
                </div>
                <p className="text-gray-500 text-sm mt-1">Part of {category.title}</p>
            </div>
        </div>
        <div className={`px-4 py-1.5 rounded-full text-xs font-medium border ${category.borderColor} bg-${category.gradientFrom.split('-')[1]}-900/20 text-gray-300`}>
            V2.1.0 (Pro)
        </div>
      </div>

      {/* Tool Workspace */}
      <div className="flex-1 relative">
        {children}
      </div>
      
      {/* Toast Notification */}
      {notification && (
          <div className="fixed bottom-8 right-8 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-2xl border border-cyan-500/30 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 z-50">
              <Check className="text-green-400" size={18} />
              {notification}
          </div>
      )}
    </div>
  );
};