
import React, { useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { TOOLS_DATA, SEO_DATA } from './constants';
import { ActiveTool } from './components/ActiveTool';
import { SeoContent } from './components/SeoContent';
import { ChevronLeft } from 'lucide-react';

function ToolPage() {
  const { slug } = useParams<{ slug: string }>();

  // Redirect if slug is missing
  if (!slug) {
    return <Navigate to="/" replace />;
  }

  // Find the tool data
  const getToolDetails = (toolSlug: string) => {
    for (const category of TOOLS_DATA) {
      const tool = category.subTools.find(t => t.id === toolSlug);
      if (tool) {
        return { category, tool, seo: SEO_DATA[toolSlug] };
      }
    }
    return null;
  };

  const toolDetails = getToolDetails(slug);

  // Handle tool not found
  if (!toolDetails) {
    return <Navigate to="/404" replace />;
  }

  const { category, tool, seo } = toolDetails;

  // SEO & Metadata
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
      
      // Canonical URL
      const canonicalLink = document.querySelector('link[rel="canonical"]');
      const canonicalUrl = `https://dicetools.online/tools/${slug}`;
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
      // Cleanup function to reset title and meta description
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
  }, [slug, seo]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <Link to="/" className="inline-flex items-center text-gray-400 hover:text-white transition-colors">
          <ChevronLeft size={20} className="mr-2" />
          Back to All Tools
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
              <p className="text-gray-400">{tool.description}</p>
            </div>
          </div>
        </div>
        
        <ActiveTool
          toolId={slug}
          toolData={tool}
          category={category}
        />
      </div>

      <SeoContent data={seo} category={category} currentToolId={slug} />
    </div>
  );
}

export default ToolPage;
