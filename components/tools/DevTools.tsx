

import React, { useState } from 'react';
import { RefreshCw, Play, Copy, LayoutTemplate, Code, Eye, ExternalLink, Download, Wand2, Calculator, FormInput, Layout, FileCode, Check } from 'lucide-react';

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

    // Code Formatter State
    const [formatLanguage, setFormatLanguage] = useState('javascript');

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
            } else if (toolId === 'dev-format') {
                if (!inputText.trim()) { notify("Please paste code to format."); return; }
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
                                { 
                                    "role": "system", 
                                    "content": `You are an expert Code Formatter and Linter.
Task: Format the user's ${formatLanguage} code to be clean, readable, and follow standard style guides (indentation, spacing).
If there are SYNTAX ERRORS, list them as comments at the very top of the output.
Output ONLY the formatted code (no markdown blocks, no conversational text).`
                                },
                                { "role": "user", "content": inputText }
                            ]
                        })
                    });
                    const data = await response.json();
                    const code = data.choices[0]?.message?.content || "Formatting failed.";
                    setOutputText(code);
                    notify("Code Formatted!");
                } catch (e) {
                    setOutputText(`Error: ${(e as Error).message}`);
                } finally {
                    setLoading(false);
                }
            } else if (toolId === 'dev-web-builder') {
                if (!inputText.trim()) { notify("Please describe your website."); return; }
                const apiKey = getApiKey();
                if (!apiKey) { notify("API Key Missing"); setOutputText("Error: VITE_OPENROUTER_API_KEY missing. Please add it to Vercel env vars."); return; }
                
                setLoading(true);
                try {
                    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                        method: "POST",
                        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
                        body: JSON.stringify({
                            "model": "amazon/nova-2-lite-v1:free",
                            "messages": [
                                { 
                                    "role": "system", 
                                    "content": `You are an expert Full-Stack AI Web Developer.
Your goal is to generate high-quality, fully functional, single-file HTML applications.

RULES:
1. Use Tailwind CSS (via CDN) for modern, responsive styling.
2. If the user asks for a TOOL (calculator, converter, game, app), you MUST write the necessary JavaScript logic inside <script> tags to make it fully functional and interactive immediately.
3. If the user asks for a FORM, create a beautiful layout with validation scripts if needed.
4. Ensure the design is modern, clean, and mobile-friendly.
5. Output ONLY raw HTML code. Do NOT wrap in markdown code blocks (no \`\`\`html). Just the raw code starting with <!DOCTYPE html>.
6. Include FontAwesome or Lucide icons via CDN if needed.` 
                                },
                                { "role": "user", "content": `Build this: ${inputText}` }
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

    const downloadHtml = () => {
        const blob = new Blob([outputText], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'generated-website.html';
        a.click();
        notify("HTML File Downloaded!");
    };

    const openInNewTab = () => {
        const newWindow = window.open();
        if (newWindow) {
            newWindow.document.write(outputText);
            newWindow.document.close();
        }
    };

    const quickTemplates = [
        { name: 'SaaS Landing', icon: Layout, prompt: 'A modern dark-themed SaaS landing page for an AI startup. Include a sticky navbar, a hero section with a gradient headline, a features grid with icons, a pricing table with 3 tiers, and a newsletter footer.' },
        { name: 'Dashboard', icon: LayoutTemplate, prompt: 'A professional admin dashboard layout. Sidebar navigation on the left, top header with user profile. Main content area showing stats cards (Total Users, Revenue) and a placeholder data table.' },
        { name: 'Calculator Tool', icon: Calculator, prompt: 'A fully functional BMI Calculator tool. Modern card design centered on screen. Inputs for Height (cm) and Weight (kg). A "Calculate" button that runs JavaScript to show the BMI result and category (Normal, Overweight, etc) dynamically without reloading.' },
        { name: 'Login Form', icon: FormInput, prompt: 'A split-screen login page. Left side is a high-quality abstract image or gradient. Right side is a clean login form with Email, Password, "Remember Me" checkbox, and a Sign In button. Include hover effects.' }
    ];

    return (
        <div className="flex flex-col h-full max-w-6xl mx-auto">
            {/* Header / Input Area */}
            <div className="flex flex-col gap-4 mb-6">
                {toolId === 'dev-web-builder' && (
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-4">
                        <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                    <Wand2 className="text-emerald-400"/> AI Website & Tool Builder
                                </h3>
                                <p className="text-gray-400 text-sm">
                                    Describe any website, tool, or form. The AI will generate the code and make it functional.
                                </p>
                            </div>
                            
                            {/* Quick Template Buttons */}
                            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                                {quickTemplates.map((t, i) => (
                                    <button 
                                        key={i}
                                        onClick={() => setInputText(t.prompt)}
                                        className="flex items-center gap-2 px-3 py-2 bg-gray-950 border border-gray-800 hover:border-emerald-500/50 rounded-lg text-xs font-medium text-gray-300 hover:text-white hover:bg-emerald-900/10 transition-all whitespace-nowrap"
                                        title={t.prompt}
                                    >
                                        <t.icon size={14} className="text-emerald-500"/> {t.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <textarea 
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Describe your website or tool (e.g., 'A To-Do List app where I can add and delete tasks')..."
                                className="flex-1 bg-black/30 border border-gray-700 rounded-xl p-4 text-white focus:border-emerald-500 outline-none resize-none h-32"
                            />
                        </div>
                        <div className="flex justify-end mt-4">
                            <button 
                                onClick={handleDevAction} 
                                disabled={loading}
                                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-lg font-bold text-white flex items-center gap-2 transition-all shadow-lg hover:shadow-emerald-900/20"
                            >
                                {loading ? <RefreshCw className="animate-spin" size={20}/> : <Wand2 size={20} />}
                                {loading ? 'Generating Code...' : 'Generate Code'}
                            </button>
                        </div>
                    </div>
                )}

                {/* --- Code Formatter Header --- */}
                {toolId === 'dev-format' && (
                    <div className="flex items-center gap-4 bg-gray-900 border border-gray-800 p-4 rounded-xl shadow-lg">
                        <FileCode className="text-cyan-400" size={24}/>
                        <div className="flex-1">
                            <label className="text-xs text-gray-400 uppercase font-bold block mb-1">Language</label>
                            <select 
                                value={formatLanguage} 
                                onChange={(e) => setFormatLanguage(e.target.value)}
                                className="bg-black/30 text-white border border-gray-700 rounded-lg py-2 px-3 text-sm focus:border-cyan-500 outline-none w-full md:w-48"
                            >
                                <option value="html">HTML</option>
                                <option value="css">CSS</option>
                                <option value="javascript">JavaScript</option>
                                <option value="json">JSON</option>
                                <option value="python">Python</option>
                                <option value="php">PHP</option>
                            </select>
                        </div>
                        <button 
                            onClick={handleDevAction} 
                            disabled={loading || !inputText}
                            className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg"
                        >
                            {loading ? <RefreshCw className="animate-spin" size={18}/> : <Check size={18} />}
                            {loading ? 'Formatting...' : 'Format Code'}
                        </button>
                    </div>
                )}

                {!['dev-web-builder', 'dev-format'].includes(toolId) && (
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
                {(toolId === 'dev-json' || toolId === 'dev-format') && (
                    <div className="flex flex-col h-full">
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-gray-400 text-sm">{toolId === 'dev-format' ? 'Messy Code' : 'Input JSON'}</label>
                            <button onClick={() => setInputText('')} className="text-xs text-red-400 hover:text-red-300">Clear</button>
                        </div>
                        <textarea 
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            className="flex-1 bg-gray-950 border border-gray-800 rounded-xl p-4 font-mono text-sm text-gray-300 focus:border-cyan-500/50 outline-none resize-none custom-scrollbar"
                            placeholder={toolId === 'dev-format' ? "Paste your messy code here..." : "Paste JSON..."}
                        />
                    </div>
                )}
                
                {/* Web Builder Output Area (Full Width) */}
                {toolId === 'dev-web-builder' ? (
                    <div className="col-span-2 flex flex-col h-full bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
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
                            
                            <div className="flex gap-2">
                                <button 
                                    onClick={downloadHtml}
                                    disabled={!outputText}
                                    className="text-gray-400 hover:text-emerald-400 flex items-center gap-2 text-sm px-3 py-1.5 rounded hover:bg-gray-800 transition-colors disabled:opacity-50"
                                    title="Download HTML"
                                >
                                    <Download size={16}/>
                                </button>
                                <button 
                                    onClick={openInNewTab}
                                    disabled={!outputText}
                                    className="text-gray-400 hover:text-blue-400 flex items-center gap-2 text-sm px-3 py-1.5 rounded hover:bg-gray-800 transition-colors disabled:opacity-50"
                                    title="Open in New Tab"
                                >
                                    <ExternalLink size={16}/>
                                </button>
                                <div className="w-px h-6 bg-gray-800 mx-1"></div>
                                <button 
                                    onClick={() => {navigator.clipboard.writeText(outputText); notify("Code Copied!");}} 
                                    disabled={!outputText}
                                    className="text-gray-400 hover:text-white flex items-center gap-2 text-sm px-3 py-1.5 rounded hover:bg-gray-800 transition-colors"
                                >
                                    <Copy size={14}/> Copy
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 relative bg-[#0d1117] min-h-[500px]">
                             {viewMode === 'code' ? (
                                <textarea 
                                    value={outputText}
                                    readOnly
                                    className="w-full h-full bg-transparent p-4 font-mono text-sm text-emerald-400 outline-none resize-none custom-scrollbar leading-relaxed"
                                    placeholder="// Generated HTML code will appear here..."
                                />
                             ) : (
                                <div className="w-full h-full bg-white relative">
                                    {outputText ? (
                                        <iframe 
                                            srcDoc={outputText}
                                            className="w-full h-full border-none"
                                            title="Website Preview"
                                            sandbox="allow-scripts allow-modals allow-forms allow-popups allow-same-origin"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                                            <LayoutTemplate size={48} className="mb-4 opacity-20"/>
                                            <p>Preview will appear here after generation...</p>
                                        </div>
                                    )}
                                </div>
                             )}
                        </div>
                    </div>
                ) : (
                    /* Standard Output Area for other tools */
                    <div className={`flex flex-col ${toolId !== 'dev-json' && toolId !== 'dev-format' ? 'col-span-2' : ''}`}>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-gray-400 text-sm">Output</label>
                            <button onClick={() => {navigator.clipboard.writeText(outputText); notify("Copied!");}} className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                                <Copy size={12} /> Copy
                            </button>
                        </div>
                        <div className="flex-1 bg-[#0d1117] rounded-xl p-4 border border-gray-800 overflow-auto relative custom-scrollbar">
                            <pre className="font-mono text-sm text-green-400 whitespace-pre-wrap">{outputText}</pre>
                            {!outputText && <span className="text-gray-600 italic">Run to see output...</span>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};