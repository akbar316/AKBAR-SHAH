
import React, { useState } from 'react';
import { RefreshCw, Play, Copy, LayoutTemplate, Code, Eye, ExternalLink } from 'lucide-react';

interface DevToolsProps {
  toolId: string;
  notify: (msg: string) => void;
}

export const DevTools: React.FC<DevToolsProps> = ({ toolId, notify }) => {
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Web Builder State
    const [viewMode, setViewMode] = useState<'code' | 'preview'>('code');

    // Helper to safely get API Key
    const getApiKey = () => {
        // @ts-ignore
        if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_OPENROUTER_API_KEY) return import.meta.env.VITE_OPENROUTER_API_KEY;
        // @ts-ignore
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

    const handleDevAction = async () => {
        try {
            if (toolId === 'dev-json') {
                const parsed = JSON.parse(inputText);
                setOutputText(JSON.stringify(parsed, null, 2));
                notify("JSON Formatted!");
            } else if (toolId === 'dev-api') {
                setLoading(true);
                setTimeout(() => {
                    setLoading(false);
                    setOutputText(`// Mock Response for ${inputText || 'GET /api'}\n{\n  "status": 200,\n  "message": "Success",\n  "data": { "id": 1, "mock": true }\n}`);
                }, 1000);
            } else if (toolId === 'dev-ask') {
                if (inputText.toLowerCase().includes('uuid') || !inputText) {
                     setOutputText(crypto.randomUUID());
                } else {
                     setOutputText("Lorem ipsum dolor sit amet, consectetur adipiscing elit.");
                }
            } else if (toolId === 'dev-web-builder') {
                if (!inputText.trim()) { notify("Please describe your website."); return; }
                const apiKey = getApiKey();
                if (!apiKey) { notify("API Key Missing"); setOutputText("Error: VITE_OPENROUTER_API_KEY missing."); return; }
                
                setLoading(true);
                try {
                    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                        method: "POST",
                        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
                        body: JSON.stringify({
                            "model": "amazon/nova-2-lite-v1:free",
                            "messages": [
                                { "role": "system", "content": "You are an advanced AI Website Builder Assistant.\nCapabilities:\n- Build multi-page websites\n- Generate HTML, CSS, JS, Tailwind, or Bootstrap on request\n- Create animations, transitions, and modern UI components\n- Auto-generate SEO tags, schema, OpenGraph tags\n- Provide responsive design\n- Include sections like Navbar, Hero, Features, Pricing, Footer\n\nOutput ONLY the raw HTML code (including <style> or CDN links for Tailwind) in your response. No markdown ticks like ```html. Just the code." },
                                { "role": "user", "content": `Create a website based on this description: ${inputText}` }
                            ]
                        })
                    });
                    const data = await response.json();
                    let code = data.choices[0]?.message?.content || "Generation failed.";
                    // Clean up markdown if AI ignores instructions
                    code = code.replace(/```html/g, '').replace(/```/g, '').trim();
                    setOutputText(code);
                    setViewMode('preview'); // Auto-switch to preview
                    notify("Website Generated!");
                } catch (e) {
                    setOutputText(`Error: ${(e as Error).message}`);
                } finally {
                    setLoading(false);
                }
            }
        } catch (e) {
            setOutputText(`Error: ${(e as Error).message}`);
        }
    };

    return (
        <div className="flex flex-col h-full max-w-6xl mx-auto">
            {/* Header / Input Area */}
            <div className="flex flex-col gap-4 mb-6">
                {toolId === 'dev-web-builder' && (
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-4">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <LayoutTemplate className="text-emerald-400"/> AI Website Builder
                        </h3>
                        <p className="text-gray-400 text-sm mb-4">
                            Describe the website you want to build (e.g., "A modern portfolio for a graphic designer with a dark theme, image gallery, and contact form").
                        </p>
                        <div className="flex gap-4">
                            <textarea 
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Describe your website..."
                                className="flex-1 bg-black/30 border border-gray-700 rounded-xl p-4 text-white focus:border-emerald-500 outline-none resize-none h-32"
                            />
                        </div>
                        <div className="flex justify-end mt-4">
                            <button 
                                onClick={handleDevAction} 
                                disabled={loading}
                                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-lg font-bold text-white flex items-center gap-2 transition-all shadow-lg hover:shadow-emerald-900/20"
                            >
                                {loading ? <RefreshCw className="animate-spin" size={20}/> : <LayoutTemplate size={20} />}
                                {loading ? 'Building Website...' : 'Generate Website'}
                            </button>
                        </div>
                    </div>
                )}

                {toolId !== 'dev-web-builder' && (
                    <div className="flex gap-4">
                        {toolId === 'dev-api' && (
                            <select className="bg-gray-800 text-white p-3 rounded border border-gray-700">
                                <option>GET</option><option>POST</option><option>PUT</option>
                            </select>
                        )}
                        <input 
                            type="text" 
                            value={toolId === 'dev-api' ? inputText : undefined} 
                            onChange={toolId === 'dev-api' ? (e) => setInputText(e.target.value) : undefined}
                            placeholder={toolId === 'dev-api' ? "https://api.example.com/v1/users" : toolId === 'dev-ask' ? "Type 'uuid' or leave empty" : "Hidden"}
                            className={`${toolId === 'dev-json' ? 'hidden' : 'block'} flex-1 bg-gray-950 border border-gray-800 rounded p-3 text-white`}
                        />
                         <button onClick={handleDevAction} className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 rounded font-medium text-white flex items-center gap-2">
                            {loading ? <RefreshCw className="animate-spin" size={18}/> : <Play size={18} />}
                            Run
                        </button>
                    </div>
                )}
            </div>

            {/* Main Workspace */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-[500px]">
                {/* Standard Dev Tools Input */}
                {toolId === 'dev-json' && (
                    <div className="flex flex-col">
                        <label className="text-gray-400 text-sm mb-2">Input JSON</label>
                        <textarea 
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            className="flex-1 bg-gray-950 border border-gray-800 rounded-xl p-4 font-mono text-sm text-gray-300 focus:border-cyan-500/50 outline-none resize-none"
                        />
                    </div>
                )}
                
                {/* Web Builder Output Area (Full Width) */}
                {toolId === 'dev-web-builder' ? (
                    <div className="col-span-2 flex flex-col h-full bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                        {/* Toolbar */}
                        <div className="bg-gray-950 p-2 border-b border-gray-800 flex justify-between items-center">
                            <div className="flex bg-black/40 rounded-lg p-1 border border-gray-800">
                                <button 
                                    onClick={() => setViewMode('code')}
                                    className={`px-4 py-1.5 rounded text-sm font-medium flex items-center gap-2 transition-all ${viewMode === 'code' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    <Code size={16}/> Code
                                </button>
                                <button 
                                    onClick={() => setViewMode('preview')}
                                    className={`px-4 py-1.5 rounded text-sm font-medium flex items-center gap-2 transition-all ${viewMode === 'preview' ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    <Eye size={16}/> Preview
                                </button>
                            </div>
                            <button 
                                onClick={() => {navigator.clipboard.writeText(outputText); notify("Code Copied!");}} 
                                disabled={!outputText}
                                className="text-gray-400 hover:text-white flex items-center gap-2 text-sm px-3 py-1.5 rounded hover:bg-gray-800 transition-colors"
                            >
                                <Copy size={14}/> Copy Code
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 relative bg-[#0d1117]">
                             {viewMode === 'code' ? (
                                <textarea 
                                    value={outputText}
                                    readOnly
                                    className="w-full h-full bg-transparent p-4 font-mono text-sm text-emerald-400 outline-none resize-none"
                                    placeholder="// Generated HTML code will appear here..."
                                />
                             ) : (
                                <div className="w-full h-full bg-white relative">
                                    {outputText ? (
                                        <iframe 
                                            srcDoc={outputText}
                                            className="w-full h-full border-none"
                                            title="Website Preview"
                                            sandbox="allow-scripts"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                            Preview will appear here after generation...
                                        </div>
                                    )}
                                </div>
                             )}
                        </div>
                    </div>
                ) : (
                    /* Standard Output Area for other tools */
                    <div className={`flex flex-col ${toolId !== 'dev-json' ? 'col-span-2' : ''}`}>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-gray-400 text-sm">Output</label>
                            <button onClick={() => {navigator.clipboard.writeText(outputText); notify("Copied!");}} className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                                <Copy size={12} /> Copy
                            </button>
                        </div>
                        <div className="flex-1 bg-[#0d1117] rounded-xl p-4 border border-gray-800 overflow-auto relative">
                            <pre className="font-mono text-sm text-green-400">{outputText}</pre>
                            {!outputText && <span className="text-gray-600 italic">Run to see output...</span>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
