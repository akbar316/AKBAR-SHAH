import React, { useState } from 'react';
import { Search, Code, FileText, Type, BarChart3, RefreshCw, Sparkles, BrainCircuit, Copy, LayoutGrid, FileX, ImagePlus } from 'lucide-react';
import { SubTool } from '../../types';
import { SitemapGenerator } from '../seo/SitemapGenerator';
import { RobotsTxtGenerator } from '../seo/RobotsTxtGenerator';
import { SchemaMarkupGenerator } from '../seo/SchemaMarkupGenerator';
import { ImageAltTextGenerator } from '../seo/ImageAltTextGenerator';

interface SeoToolsProps {
  toolId: string;
  toolData: SubTool;
  notify: (msg: string) => void;
}

export const SeoTools: React.FC<SeoToolsProps> = ({ toolId, toolData, notify }) => {
    const [inputText, setInputText] = useState('');
    const [seoResult, setSeoResult] = useState<string | null>(null);
    const [reasoning, setReasoning] = useState<any>(null);
    const [showReasoning, setShowReasoning] = useState(false);
    const [loading, setLoading] = useState(false);

    // Switch between new standalone tools and existing AI tools
    switch (toolId) {
        case 'seo-sitemap':
            return <SitemapGenerator />;
        case 'seo-robots':
            return <RobotsTxtGenerator />;
        case 'seo-schema':
            return <SchemaMarkupGenerator />;
        case 'seo-alt-text':
            return <ImageAltTextGenerator />;
    }

    const fetchSeoInsights = async (prompt: string) => {
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            notify("Configuration Error: API Key missing.");
            setSeoResult("Error: OPENROUTER_API_KEY not found in environment variables. Please add it to your Vercel project settings.");
            return;
        }

        setLoading(true); setSeoResult(null); setReasoning(null);

        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
                body: JSON.stringify({ "model": "amazon/nova-2-lite-v1:free", "messages": [{ "role": "user", "content": prompt }], "reasoning": {"enabled": true} })
            });

            const result = await response.json();
            if (result.error) throw new Error(result.error.message || 'API Error');

            const assistantMessage = result.choices[0].message;
            setSeoResult(assistantMessage.content);
            if (assistantMessage.reasoning_details) setReasoning(assistantMessage.reasoning_details);
        } catch (error) {
            setSeoResult(`Error: ${(error as Error).message}. Check your API Key and try again.`);
        } finally {
            setLoading(false);
        }
    };

    const handleSeoAction = () => {
        if (!inputText.trim()) { notify("Please provide input text."); return; }
        let prompt = "";
        switch (toolId) {
            case 'seo-keyword': prompt = `Act as a senior SEO Specialist. Analyze keyword: "${inputText}". Provide: 1. Search Intent. 2. Estimated Difficulty. 3. 5 long-tail variations. 4. 3 LSI keywords.`; break;
            case 'seo-meta': prompt = `Act as a Copywriter. Generate 3 SEO-optimized Meta Descriptions for content/title: "${inputText}". Under 160 chars.`; break;
            case 'seo-content': prompt = `Act as SEO Editor. Analyze: "${inputText}". Suggest improvements for Readability, Keyword placement, Tone.`; break;
            case 'seo-title': prompt = `Analyze headline: "${inputText}". Score 0-100 CTR potential. Check Power Words, Sentiment, Length.`; break;
            case 'seo-report': prompt = `Generate text-based SEO Audit Checklist for: "${inputText}". Break down into Technical, On-Page, Off-Page.`; break;
            default: prompt = inputText;
        }
        fetchSeoInsights(prompt);
    };

    // Default view for the AI-based SEO tools
    return (
        <div className="flex flex-col items-center max-w-4xl mx-auto w-full">
            <div className="w-full bg-gray-900 p-6 md:p-8 rounded-xl border border-gray-800 shadow-xl min-h-[400px]">
                <div className="flex items-center gap-3 mb-6">
                    {toolId === 'seo-keyword' && <Search className="text-cyan-400" size={24}/>}
                    {toolId === 'seo-meta' && <Code className="text-cyan-400" size={24}/>}
                    {toolId === 'seo-content' && <FileText className="text-cyan-400" size={24}/>}
                    {toolId === 'seo-title' && <Type className="text-cyan-400" size={24}/>}
                    {toolId === 'seo-report' && <BarChart3 className="text-cyan-400" size={24}/>}
                    <h3 className="text-xl font-bold text-white">{toolData.name}</h3>
                </div>

                <div className="mb-6">
                    <label className="block text-xs text-gray-500 uppercase mb-2">Input Content</label>
                    <textarea className="w-full bg-black/30 border border-gray-700 rounded-xl p-4 text-white outline-none focus:border-cyan-500 resize-none h-32 font-mono text-sm" placeholder="Enter input for analysis..." value={inputText} onChange={(e) => setInputText(e.target.value)} />
                </div>

                <button onClick={handleSeoAction} disabled={loading} className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 py-3 rounded-lg text-white font-bold transition-all flex items-center justify-center gap-2 mb-8">
                    {loading ? <RefreshCw className="animate-spin" /> : <Sparkles size={18} />}
                    {loading ? 'Analyzing with AI...' : 'Generate Analysis'}
                </button>

                {(seoResult || loading) && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="text-sm font-medium text-gray-400 uppercase">Analysis Report</h4>
                            {reasoning && (
                                <button onClick={() => setShowReasoning(!showReasoning)} className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors">
                                    <BrainCircuit size={14}/> {showReasoning ? 'Hide Logic' : 'Show Logic'}
                                </button>
                            )}
                        </div>
                        {showReasoning && reasoning && (
                            <div className="mb-4 bg-purple-900/10 border border-purple-500/20 rounded-lg p-4 text-xs font-mono text-purple-200 overflow-x-auto">
                                <strong className="block mb-2 text-purple-400">AI Reasoning Process:</strong>
                                <pre className="whitespace-pre-wrap">{JSON.stringify(reasoning, null, 2)}</pre>
                            </div>
                        )}
                        <div className="bg-[#0a0e14] rounded-xl border border-gray-800 p-6 relative overflow-hidden group">
                            {loading ? ( <div className="space-y-3 animate-pulse"><div className="h-4 bg-gray-800 rounded w-3/4"></div><div className="h-4 bg-gray-800 rounded w-1/2"></div></div> ) : (
                                <>
                                    <pre className="whitespace-pre-wrap font-sans text-sm text-gray-300 leading-relaxed">{seoResult}</pre>
                                    <button onClick={() => { navigator.clipboard.writeText(seoResult || ''); notify("Report Copied!"); }} className="absolute top-4 right-4 p-2 bg-gray-800 text-gray-400 rounded hover:bg-cyan-600 hover:text-white transition-all opacity-0 group-hover:opacity-100"><Copy size={16}/></button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};