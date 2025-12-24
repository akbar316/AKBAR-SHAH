
import React, { useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { TOOLS_DATA, SEO_DATA } from './constants';
import { ActiveTool } from './components/ActiveTool';
import { SeoContent } from './components/SeoContent';
import { ChevronLeft } from 'lucide-react';

function ToolPage() {
  const { categoryId, toolId } = useParams<{ categoryId: string, toolId?: string }>();

  // Find category data
  const category = TOOLS_DATA.find(c => c.id === categoryId);

  // Handle category not found
  if (!categoryId || !category) {
    return <Navigate to="/404" replace />;
  }

  // If it's a category page (no toolId)
  if (!toolId) {
    useEffect(() => {
      document.title = `${category.name} Tools - Dicetools`;
      const descriptionMeta = document.querySelector('meta[name="description"]');
      const description = `Explore all ${category.name} tools available on Dicetools. ${category.description}`;
      if (descriptionMeta) {
        descriptionMeta.setAttribute('content', description);
      } else {
        const newMeta = document.createElement('meta');
        newMeta.name = 'description';
        newMeta.content = description;
        document.head.appendChild(newMeta);
      }
    }, [category]);

    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-white mb-2">{category.name} Tools</h1>
          <p className="text-lg text-gray-400 mb-8">{category.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.subTools.map(tool => (
                  <Link to={`/${category.id}/${tool.id}`} key={tool.id} className="bg-white/5 p-6 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 flex-shrink-0">
                          <tool.icon size={20} className="text-cyan-400" />
                      </div>
                      <div>
                        <h2 className="font-bold text-white">{tool.name}</h2>
                        <p className="text-sm text-gray-400">{tool.description}</p>
                      </div>
                  </Link>
              ))}
          </div>
      </div>
    );
  }

  // If it's a specific tool page
  const getToolDetails = (catId: string, toolSlug: string) => {
    const tool = category.subTools.find(t => t.id === toolSlug);
    if (!tool) return null;
    return { category, tool, seo: SEO_DATA[toolSlug] };
  };

  const toolDetails = getToolDetails(categoryId, toolId);

  // Handle tool not found
  if (!toolDetails) {
    return <Navigate to="/404" replace />;
  }

  const { tool, seo } = toolDetails;

  // SEO & Metadata for Tool Page
  useEffect(() => {
    if (seo) {
      document.title = seo.title;
      const descriptionMeta = document.querySelector('meta[name="description"]');
      if (descriptionMeta) {
        descriptionMeta.setAttribute('content', seo.description);
      } else {
        const newMeta = document.createElement('meta');
        newMeta.name = 'description';
        newMeta.content = seo.description;
        document.head.appendChild(newMeta);
      }
      
      const canonicalLink = document.querySelector('link[rel="canonical"]');
      const canonicalUrl = `https://dicetools.online/${categoryId}/${toolId}`;
      if (canonicalLink) {
        canonicalLink.setAttribute('href', canonicalUrl);
      } else {
        const newCanonical = document.createElement('link');
        newCanonical.rel = 'canonical';
        newCanonical.href = canonicalUrl;
        document.head.appendChild(newCanonical);
      }
    }

    return () => {
      document.title = 'Dicetools - All Your Digital Tools. One Powerful Platform';
      const descriptionMeta = document.querySelector('meta[name="description"]');
      if (descriptionMeta) {
        descriptionMeta.setAttribute('content', 'Streamline your workflow with our comprehensive suite of developer, designer, and productivity tools.');
      }
      const canonicalLink = document.querySelector('link[rel="canonical"]');
       if (canonicalLink) {
         canonicalLink.setAttribute('href', 'https://dicetools.online');
       }
    };
  }, [categoryId, toolId, seo]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <Link to={`/${categoryId}`} className="inline-flex items-center text-gray-400 hover:text-white transition-colors">
          <ChevronLeft size={20} className="mr-2" />
          Back to {category.name} Tools
        </Link>
      </div>

      <div className="bg-white/5 rounded-2xl shadow-lg backdrop-blur-sm border border-white/10">
        <div className="p-6 sm:p-8 border-b border-white/10">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 mr-4">
              <tool.icon size={24} className="text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{tool.name}</h1>
              <p className="text-gray-400">{category.description}</p>
            </div>
          </div>
        </div>
        
        <ActiveTool
          toolId={toolId}
          toolData={tool}
          category={category}
        />
      </div>

      <SeoContent data={seo} category={category} currentToolId={toolId} />
    </div>
  );
}

export default ToolPage;
