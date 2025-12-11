import React, { useEffect } from 'react';
import { SeoData, SubTool, ToolCategory } from '../types';
import { TOOLS_DATA } from '../constants';
import { ArrowRight, HelpCircle, BookOpen, Layers, Home, Grid } from 'lucide-react';

interface SeoContentProps {
  data?: SeoData;
  category: ToolCategory;
  onSelectTool: (id: string | null) => void;
}

export const SeoContent: React.FC<SeoContentProps> = ({ data, category, onSelectTool }) => {
  
  // SEO Engine: Updates Meta Tags, Canonical, and Schema
  useEffect(() => {
    // Helper to update or create meta tags
    const updateMeta = (name: string, content: string, attribute = 'name') => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Helper to update Canonical URL
    const updateCanonical = (url: string) => {
      let element = document.querySelector('link[rel="canonical"]');
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', 'canonical');
        document.head.appendChild(element);
      }
      element.setAttribute('href', url);
    };

    // Helper to update JSON-LD Schema
    const updateSchema = (schemaData: object, id: string) => {
      const existingScript = document.getElementById(id);
      if (existingScript) {
        existingScript.remove();
      }
      const script = document.createElement('script');
      script.id = id;
      script.type = 'application/ld+json';
      script.text = JSON.stringify(schemaData);
      document.head.appendChild(script);
    };

    if (data) {
      const toolId = window.location.search.split('=')[1] || '';
      const canonicalUrl = `https://dicetools.online/?tool=${toolId}`;
      const imageUrl = "https://dicetools.online/og-image.jpg"; // Placeholder, recommend creating a real dynamic image generator

      // 1. Basic Meta
      document.title = data.title;
      updateMeta('description', data.description);

      // 2. Open Graph (Facebook/LinkedIn)
      updateMeta('og:title', data.title, 'property');
      updateMeta('og:description', data.description, 'property');
      updateMeta('og:url', canonicalUrl, 'property');
      updateMeta('og:type', 'website', 'property');
      updateMeta('og:image', imageUrl, 'property');

      // 3. Twitter Card
      updateMeta('twitter:card', 'summary_large_image', 'property');
      updateMeta('twitter:title', data.title, 'property');
      updateMeta('twitter:description', data.description, 'property');
      updateMeta('twitter:image', imageUrl, 'property');

      // 4. Canonical Tag (CRITICAL for SEO to avoid duplicate content)
      updateCanonical(canonicalUrl);

      // 5. Breadcrumb Schema (Rich Snippet)
      const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [{
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://dicetools.online/"
        }, {
          "@type": "ListItem",
          "position": 2,
          "name": category.title,
          "item": `https://dicetools.online/?tool=${category.subTools[0].id}` // Points to category leader or first tool
        }, {
          "@type": "ListItem",
          "position": 3,
          "name": data.h1,
          "item": canonicalUrl
        }]
      };
      updateSchema(breadcrumbSchema, 'tool-breadcrumbs');

    } else {
      // Reset to Homepage Defaults
      document.title = "Dicetools - All Your Digital Tools. One Powerful Platform.";
      updateMeta('description', "A complete suite of free online tools: PDF Merge, Image Resizer, Code Formatter, AI Writer, and more. Secure, client-side, and free.");
      updateCanonical("https://dicetools.online/");
      
      // Remove tool specific schema
      const script = document.getElementById('tool-breadcrumbs');
      if (script) script.remove();
    }
  }, [data, category]);

  if (!data) return null;

  // Helper to get related tool info
  const getRelatedTools = () => {
    const related: SubTool[] = [];
    data.relatedTools.forEach(relId => {
      for (const cat of TOOLS_DATA) {
        const found = cat.subTools.find(t => t.id === relId);
        if (found) related.push(found);
      }
    });
    // Return max 3 related tools as per SEO requirement
    return related.slice(0, 3);
  };

  const relatedList = getRelatedTools();

  return (
    <div className="w-full max-w-7xl mx-auto mt-16 px-4 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-800 to-transparent mb-12"></div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-12">
          
          {/* What is - Using semantic Article tag for better indexing */}
          <article>
            <h1 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
               {/* H1 matches the SEO Data */}
               {data.h1}
            </h1>

            <div className="mb-8">
               <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <BookOpen className="text-cyan-500" size={24}/>
                What is this tool?
              </h2>
              <p className="text-gray-400 leading-relaxed text-lg">
                {data.content.what}
              </p>
            </div>

            {/* Why Use */}
            <section className="bg-gray-900/50 p-6 rounded-xl border border-gray-800 mb-8">
              <h2 className="text-xl font-bold text-white mb-4">Why use this tool?</h2>
              <p className="text-gray-400 leading-relaxed">
                {data.content.why}
              </p>
            </section>

            {/* How to Use */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">How to use</h2>
              <div className="space-y-4">
                  {data.content.how.map((step, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-900/30 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-sm">
                        {index + 1}
                      </div>
                      <p className="text-gray-300 pt-1">{step}</p>
                    </div>
                  ))}
              </div>
            </section>

            {/* Features */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">Key Features</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.content.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-black/20 rounded-lg border border-gray-800/50">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* FAQ */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <HelpCircle className="text-cyan-500" size={24}/> Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {data.content.faq.map((item, i) => (
                  <div key={i} className="border-b border-gray-800 pb-4 last:border-0">
                    <h3 className="font-medium text-white mb-2">{item.q}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>
            </section>
          </article>

        </div>

        {/* Sidebar Column */}
        <aside className="space-y-8">
           
           {/* Navigation Links for SEO */}
           <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                 <Grid className="text-cyan-500" size={20}/> Quick Navigation
              </h3>
              <nav className="space-y-2">
                  <a 
                    href="/"
                    onClick={(e) => { e.preventDefault(); onSelectTool(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-black/30 hover:bg-gray-800 border border-gray-800 hover:border-cyan-500/30 transition-all text-gray-300 hover:text-white group"
                  >
                      <Home size={18} className="text-gray-500 group-hover:text-cyan-400"/>
                      <span className="text-sm font-medium">Home</span>
                  </a>
                  
                  <button 
                    onClick={() => { onSelectTool(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="w-full flex items-center gap-3 p-3 rounded-lg bg-black/30 hover:bg-gray-800 border border-gray-800 hover:border-cyan-500/30 transition-all text-gray-300 hover:text-white group text-left"
                  >
                      <category.mainIcon size={18} className="text-gray-500 group-hover:text-cyan-400"/>
                      <span className="text-sm font-medium">All {category.title}</span>
                  </button>
              </nav>
           </div>

           {/* Related Tools */}
           <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 sticky top-24">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                 <Layers className="text-purple-500" size={20}/> Related Tools
              </h3>
              <nav className="space-y-3">
                 {relatedList.map(tool => (
                   <button 
                     key={tool.id}
                     onClick={() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        onSelectTool(tool.id);
                     }}
                     className="w-full flex items-center justify-between p-3 rounded-lg bg-black/30 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 transition-all group text-left"
                   >
                      <div className="flex items-center gap-3">
                         <tool.icon size={18} className="text-gray-500 group-hover:text-cyan-400 transition-colors"/>
                         <span className="text-sm text-gray-300 font-medium">{tool.name}</span>
                      </div>
                      <ArrowRight size={14} className="text-gray-600 group-hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0"/>
                   </button>
                 ))}
                 {relatedList.length === 0 && (
                    <p className="text-sm text-gray-500 italic">No related tools found.</p>
                 )}
              </nav>
           </div>
        </aside>
      </div>
    </div>
  );
};