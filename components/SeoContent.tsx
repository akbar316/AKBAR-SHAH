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
  // Update Meta Tags
  useEffect(() => {
    if (data) {
      document.title = data.title;
      
      // Update Meta Description
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', data.description);
    } else {
      document.title = "Dicetools - Free Online PDF, Image, and Developer Tools";
    }
  }, [data]);

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
          
          {/* What is */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <BookOpen className="text-cyan-500" size={24}/>
              What is the {data.h1}?
            </h2>
            <p className="text-gray-400 leading-relaxed text-lg">
              {data.content.what}
            </p>
          </section>

          {/* Why Use */}
          <section className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
            <h2 className="text-xl font-bold text-white mb-4">Why use this tool?</h2>
            <p className="text-gray-400 leading-relaxed">
              {data.content.why}
            </p>
          </section>

          {/* How to Use */}
          <section>
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
          <section>
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

        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
           
           {/* Navigation Links for SEO */}
           <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                 <Grid className="text-cyan-500" size={20}/> Quick Navigation
              </h3>
              <div className="space-y-2">
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
              </div>
           </div>

           {/* Related Tools */}
           <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 sticky top-24">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                 <Layers className="text-purple-500" size={20}/> Related Tools
              </h3>
              <div className="space-y-3">
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
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};