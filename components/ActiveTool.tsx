import React, { useState } from 'react';
import { SubTool, ToolCategory } from '../types';
import { ToolLayout } from './ToolLayout';
import { PdfTools } from './tools/PdfTools';
import { TextTools } from './tools/TextTools';
import { DevTools } from './tools/DevTools';
import { ImageTools } from './tools/ImageTools';
import { StudentTools } from './tools/StudentTools';
import { UtilityTools } from './tools/UtilityTools';
import { AiTools } from './tools/AiTools';
import { SeoTools } from './tools/SeoTools';

interface ActiveToolProps {
  toolId: string;
  toolData: SubTool;
  category: ToolCategory;
  onBack: () => void;
}

export const ActiveTool: React.FC<ActiveToolProps> = ({ toolId, toolData, category, onBack }) => {
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
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
        {renderToolContent()}
    </ToolLayout>
  );
};