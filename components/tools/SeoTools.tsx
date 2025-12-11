
import React, { useState } from 'react';
import { Search, Code, FileText, Type, BarChart3, RefreshCw, Sparkles, BrainCircuit, Copy, Tag, Target } from 'lucide-react';
import { SubTool } from '../../types';

interface SeoToolsProps {
  toolId: string;
  toolData: SubTool;
  notify: (msg: string) => void;
}

export const SeoTools: React.FC<SeoToolsProps> = ({ toolId, toolData, notify }) => {
    // Generic State for other tools
    const [inputText, setInputText] = useState('');
    
    // specialized State for Meta Generator
    const [metaTopic, setMetaTopic] = useState('');
    const [metaKeywords, setMetaKeywords] = useState('');
    const [metaIntent, setMetaIntent] = useState('Informational');

    // Specialized State for Keyword Tool
    const [keywordSeed, setKeywordSeed] = useState('');
    const [keywordFocus, setKeywordFocus] = useState('General Analysis');

    const [seoResult, setSeoResult] = useState<string | null>(null);
    const [reasoning, setReasoning] = useState<any>(null);
    const [showReasoning, setShowReasoning] = useState(false);
    const [loading, setLoading] = useState(false);

    // Helper to safely get API Key from various environment configurations
    const getApiKey = () => {
        // @ts-ignore - Handle Vite
        if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_OPENROUTER_API_KEY) {
            // @ts-ignore
            return import.meta.env.VITE_OPENROUTER_API_KEY;
        }
        // @ts-ignore - Handle CRA/Next/Standard
        if (typeof process !== 'undefined' && process.env) {
            // @ts-ignore
            if (process.env.REACT_APP_OPENROUTER_API_KEY) return process.env.REACT_APP_OPENROUTER_API_KEY;
            // @ts-ignore
            if (process.env.NEXT_PUBLIC_OPENROUTER_API_KEY) return process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
            // @ts-ignore
            if (process.env.OPENROUTER_API_KEY) return process.env.OPENROUTER_API_KEY;
        }
        return '';
    };

    const fetchSeoInsights = async (prompt: string) => {
        const apiKey = getApiKey();
        
        if (!apiKey) {
            notify("Configuration Error: API Key missing.");
            setSeoResult("Error: VITE_OPENROUTER_API_KEY not found in environment variables. Please add it to your Vercel project settings.");
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
        let prompt = "";
        
        if (toolId === 'seo-meta') {
             if (!metaTopic.trim()) { notify("Please enter a topic or summary."); return; }
             prompt = `Act as a senior SEO Copywriter. Generate 5 sets of optimized Title Tags and Meta Descriptions for a web page.
Page Topic/Summary: "${metaTopic}"
Target Keywords: "${metaKeywords}"
Search Intent: "${metaIntent}"

Requirements:
1. Title Tags: Max 60 characters, include keywords near the front, compelling and click-worthy.
2. Meta Descriptions: Max 155 characters, include keywords naturally, strong call-to-action.
3. Provide a variety of tones (e.g., direct, question-based, benefit-driven).
4. Strictly follow character limits.
5. Output format:
Option 1:
Title: [Title]
Description: [Description]
...`;
        } else if (toolId === 'seo-keyword') {
             if (!keywordSeed.trim()) { notify("Please enter a seed keyword."); return; }
             prompt = `Act as an SEO Keyword Strategist.
Seed Keyword: "${keywordSeed}"
Analysis Focus: "${keywordFocus}"

Task: Generate a list of 12-15 high-value keyword suggestions based on the seed.
Format as a structured Markdown Table with these columns:
1. Keyword/Phrase
2. Search Intent (Informational, Transactional, etc.)
3. Estimated Competition (Low, Medium, High)
4. Potential Content Title Idea

Requirements:
- If focus is 'Long-tail', prioritize 4+ word phrases.
- If focus is 'Questions', provide "People Also Ask" style queries.
- If focus is 'Commercial', look for "best", "vs", "review" terms.
- Be specific and relevant to the seed topic.`;
        } else {
             if (!inputText.trim()) { notify("Please provide input text."); return; }
             switch (toolId) {
                case 'seo-content': prompt = `Act as SEO Editor. Analyze: "${inputText}". Suggest improvements for Readability, Keyword placement, Tone.`; break;
                case 'seo-title': prompt = `Analyze headline: "${inputText}". Score 0-100 CTR potential. Check Power Words, Sentiment, Length.`; break;
                case 'seo-report': prompt = `Generate text-based SEO Audit Checklist for: "${inputText}". Break down into Technical, On-Page, Off-Page.`; break;
                default: prompt = inputText;
            }
        }
        fetchSeoInsights(prompt);
    };

    return (
        <div className="flex flex-col items-center max-w-4xl mx-auto w-full">
            <div className="w-full bg-gray-900 p-6 md:p-8 rounded-xl border border-gray-800 shadow-xl min-h-[400px]">
                <div className="flex items-center gap-3 mb-6">
                    {toolId === 'seo-keyword' && <Tag className="text-cyan-400" size={24}/>}
                    {toolId === 'seo-meta' && <Code className="text-cyan-400" size={24}/>}
                    {toolId === 'seo-content' && <FileText className="text-cyan-400" size={24}/>}
                    {toolId === 'seo-title' && <Type className="text-cyan-400" size={24}/>}
                    {toolId === 'seo-report' && <BarChart3 className="text-cyan-400" size={24}/>}
                    <h3 className="text-xl font-bold text-white">{toolData.name}</h3>
                </div>

                {toolId === 'seo-meta' ? (
                    <div className="space-y-4 mb-8">
                        <div>
                            <label className="block text-xs text-gray-500 uppercase mb-2">Page Topic / Summary</label>
                            <textarea 
                                className="w-full bg-black/30 border border-gray-700 rounded-xl p-4 text-white outline-none focus:border-cyan-500 resize-none h-32 font-mono text-sm placeholder-gray-600"
                                placeholder="What is this page about? E.g., 'A guide on how to bake sourdough bread for beginners with no equipment.'"
                                value={metaTopic}
                                onChange={(e) => setMetaTopic(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-gray-500 uppercase mb-2">Target Keywords</label>
                                <input 
                                    type="text"
                                    className="w-full bg-black/30 border border-gray-700 rounded-xl p-4 text-white outline-none focus:border-cyan-500 font-mono text-sm placeholder-gray-600"
                                    placeholder="e.g. sourdough recipe, easy bread"
                                    value={metaKeywords}
                                    onChange={(e) => setMetaKeywords(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 uppercase mb-2">Search Intent</label>
                                <select 
                                    className="w-full bg-black/30 border border-gray-700 rounded-xl p-4 text-white outline-none focus:border-cyan-500 font-mono text-sm appearance-none cursor-pointer"
                                    value={metaIntent}
                                    onChange={(e) => setMetaIntent(e.target.value)}
                                >
                                    <option value="Informational">Informational (Guides, Tutorials)</option>
                                    <option value="Transactional">Transactional (Buy, Download)</option>
                                    <option value="Navigational">Navigational (Brand Search)</option>
                                    <option value="Commercial">Commercial (Comparison, Reviews)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                ) : toolId === 'seo-keyword' ? (
                    <div className="space-y-4 mb-8">
                        <div>
                            <label className="block text-xs text-gray-500 uppercase mb-2">Seed Keyword / Topic</label>
                            <div className="relative">
                                <input 
                                    type="text"
                                    className="w-full bg-black/30 border border-gray-700 rounded-xl p-4 pl-12 text-white outline-none focus:border-cyan-500 font-mono text-sm placeholder-gray-600"
                                    placeholder="e.g. digital marketing, keto diet, python programming"
                                    value={keywordSeed}
                                    onChange={(e) => setKeywordSeed(e.target.value)}
                                />
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 uppercase mb-2">Analysis Focus</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {['General Analysis', 'Long-tail Variations', 'Questions & FAQ', 'Commercial Intent'].map(focus => (
                                    <button
                                        key={focus}
                                        onClick={() => setKeywordFocus(focus)}
                                        className={`p-3 rounded-lg border text-xs font-medium transition-all ${
                                            keywordFocus === focus 
                                            ? 'bg-cyan-900/30 border-cyan-500 text-cyan-400' 
                                            : 'bg-black/30 border-gray-700 text-gray-400 hover:border-gray-600'
                                        }`}
                                    >
                                        {focus}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="mb-6">
                        <label className="block text-xs text-gray-500 uppercase mb-2">Input Content</label>
                        <textarea 
                            className="w-full bg-black/30 border border-gray-700 rounded-xl p-4 text-white outline-none focus:border-cyan-500 resize-none h-32 font-mono text-sm placeholder-gray-600" 
                            placeholder={toolId === 'seo-title' ? "Enter a headline..." : "Enter text for analysis..."}
                            value={inputText} 
                            onChange={(e) => setInputText(e.target.value)} 
                        />
                    </div>
                )}

                <button onClick={handleSeoAction} disabled={loading} className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 py-3 rounded-lg text-white font-bold transition-all flex items-center justify-center gap-2 mb-8 shadow-lg shadow-cyan-900/20">
                    {loading ? <RefreshCw className="animate-spin" /> : <Sparkles size={18} />}
                    {loading ? 'Generating with AI...' : (toolId === 'seo-meta' ? 'Generate Tags' : toolId === 'seo-keyword' ? 'Generate Keywords' : 'Generate Analysis')}
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
