
import React, { useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { TOOLS_DATA, SEO_DATA } from './constants';
import { ActiveTool } from './components/ActiveTool';

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
    <ActiveTool
      toolId={slug}
      toolData={tool}
      category={category}
      onBack={() => window.history.back() } // Or link to home
      onSelectTool={(id) => {}}
    />
  );
}

export default ToolPage;
