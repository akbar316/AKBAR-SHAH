import React, { useState, Suspense } from 'react';
import { SubTool, ToolCategory } from '../types';
import { ToolLayout } from './ToolLayout';
import { SeoContent } from './SeoContent';
import { SEO_DATA } from '../constants';
import { RefreshCw } from 'lucide-react';

// Lazy Load Tools for Performance Optimization
const PdfTools = React.lazy(() => import('./tools/PdfTools').then(m => ({ default: m.PdfTools })));
const TextTools = React.lazy(() => import('./tools/TextTools').then(m => ({ default: m.TextTools })));
const DevTools = React.lazy(() => import('./tools/DevTools').then(m => ({ default: m.DevTools })));
const ImageTools = React.lazy(() => import('./tools/ImageTools').then(m => ({ default: m.ImageTools })));
const StudentTools = React.lazy(() => import('./tools/StudentTools').then(m => ({ default: m.StudentTools })));
const UtilityTools = React.lazy(() => import('./tools/UtilityTools').then(m => ({ default: m.UtilityTools })));
const AiTools = React.lazy(() => import('./tools/AiTools').then(m => ({ default: m.AiTools })));
const SeoTools = React.lazy(() => import('./tools/SeoTools').then(m => ({ default: m.SeoTools })));

interface ActiveToolProps {
  toolId: string;
  toolData: SubTool;
  category: ToolCategory;
  onBack: () => void;
  onSelectTool?: (toolId: string) => void;
}

export const ActiveTool: React.FC<ActiveToolProps> = ({ toolId, toolData, category, onBack, onSelectTool }) => {
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleToolSelect = (id: string) => {
      if (onSelectTool) {
          onSelectTool(id);
      }
  };

  const renderToolContent = () => {
    switch (category.id) {
        case 'pdf':
            return <PdfTools toolId={toolId} toolData={toolData} notify={showNotification} />;
        case 'text':
            return <TextTools toolId={toolId} />;
        case 'dev':
            return <DevTools toolId={toolId} notify={showNotification} />;
        case 'image':
            return <ImageTools toolId={toolId} />;
        case 'student':
            return <StudentTools toolId={toolId} notify={showNotification} />;
        case 'utility':
            return <UtilityTools toolId={toolId} />;
        case 'ai':
            return <AiTools toolId={toolId} notify={showNotification} />;
        case 'seo':
            return <SeoTools toolId={toolId} toolData={toolData} notify={showNotification} />;
        default:
            return <div className="text-center text-gray-500">Tool not implemented yet.</div>;
    }
  };

  return (
    <ToolLayout 
        toolData={toolData} 
        category={category} 
        onBack={onBack} 
        notification={notification}
    >
        <Suspense fallback={
            <div className="flex h-64 items-center justify-center text-cyan-500">
                <RefreshCw className="animate-spin" size={32}/>
            </div>
        }>
            {renderToolContent()}
        </Suspense>
        
        {/* SEO Content Section */}
        <SeoContent 
            data={SEO_DATA[toolId]} 
            onSelectTool={handleToolSelect}
        />
    </ToolLayout>
  );
};