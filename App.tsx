import React, { useState } from 'react';
import { AllTools } from './components/AllTools';
import { ActiveTool } from './components/ActiveTool';
import { CircuitBackground } from './components/CircuitBackground';
import { ToolCategory, SubTool } from './types';

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<{ tool: SubTool; category: ToolCategory } | null>(null);

  const handleToolSelect = (category: ToolCategory, tool: SubTool) => {
    setActiveTool({ category, tool });
  };

  const handleBack = () => {
    setActiveTool(null);
  };

  return (
    <div className="min-h-screen bg-gray-800 text-white relative isolate">
      <CircuitBackground />
      <main className="container mx-auto px-4 py-8 relative z-10">
        {activeTool ? (
          <ActiveTool 
            toolId={activeTool.tool.id} 
            toolData={activeTool.tool} 
            category={activeTool.category} 
            onBack={handleBack} 
          />
        ) : (
          <AllTools onToolSelect={handleToolSelect} />
        )}
      </main>
    </div>
  );
};

export default App;