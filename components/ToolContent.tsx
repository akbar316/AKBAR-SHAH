import { AITools } from './tools/AITools';
import { SEOTools } from './tools/SEOTools';
import { PDFTools } from './tools/PDFTools';
import { TextTools } from './tools/TextTools';
import { DevTools } from './tools/DevTools';
import { ImageTools } from './tools/ImageTools';
import { StudentTools } from './tools/StudentTools';
import { UtilityTools } from './tools/UtilityTools';
import { ToolCategory } from '../types';
import { TOOLS_DATA } from '../constants';

interface ToolContentProps {
    toolId: string;
    notify: (msg: string) => void;
}

const getCategoryByToolId = (toolId: string): ToolCategory | undefined => {
    for (const category of TOOLS_DATA) {
        if (category.subTools.some(tool => tool.id === toolId)) {
            return category;
        }
    }
    return undefined;
};

export const ToolContent: React.FC<ToolContentProps> = ({ toolId, notify }) => {
    const category = getCategoryByToolId(toolId);

    if (!category) {
        return <div className="text-center text-gray-500">Select a tool to get started</div>;
    }

    switch (category.id) {
        case 'pdf':
            return <PDFTools toolId={toolId} />;
        case 'text':
            return <TextTools toolId={toolId} notify={notify} />;
        case 'dev':
            return <DevTools toolId={toolId} notify={notify} />;
        case 'image':
            return <ImageTools toolId={toolId} />;
        case 'student':
            return <StudentTools toolId={toolId} notify={notify} />;
        case 'utility':
            return <UtilityTools toolId={toolId} notify={notify} />;
        case 'ai':
            return <AITools toolId={toolId} notify={notify} />;
        case 'seo':
            return <SEOTools toolId={toolId} />;
        default:
            return <div className="text-center text-gray-500">Tool not implemented yet</div>;
    }
};