
import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, User, Copy, RefreshCw, Cpu, Eraser, Aperture, Download } from 'lucide-react';

interface AiToolsProps {
  toolId: string;
  notify: (msg: string) => void;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const AiTools: React.FC<AiToolsProps> = ({ toolId, notify }) => {
    // Shared State
    const [loading, setLoading] = useState(false);
    
    // Chat State
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Summarizer State
    const [summaryInput, setSummaryInput] = useState('');
    const [summaryOutput, setSummaryOutput] = useState('');

    // Prompter State
    const [promptInput, setPromptInput] = useState('');
    const [promptOutput, setPromptOutput] = useState('');

    // Logo Gen State
    const [logoPrompt, setLogoPrompt] = useState('');
    const [logoResults, setLogoResults] = useState<string[]>([]);

    // Auto-scroll chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

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

    // --- Core API Logic ---
    const callOpenRouter = async (messages: ChatMessage[]) => {
        const apiKey = getApiKey();
        
        if (!apiKey) {
            notify("Error: VITE_OPENROUTER_API_KEY missing.");
            throw new Error("API Key Missing. Please add VITE_OPENROUTER_API_KEY to Vercel.");
        }

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "amazon/nova-2-lite-v1:free",
                "messages": messages
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || "API Request Failed");
        }

        const data = await response.json();
        return data.choices[0].message.content;
    };

    // --- Handlers ---

    const handleChatSend = async () => {
        if (!chatInput.trim() || loading) return;
        
        const newUserMsg: ChatMessage = { role: 'user', content: chatInput };
        const updatedHistory = [...chatHistory, newUserMsg];
        
        setChatHistory(updatedHistory);
        setChatInput('');
        setLoading(true);

        try {
            // Prepare context (Limit history to last 10 messages to save context window if needed)
            const apiMessages = [
                { role: 'system', content: "You are a helpful, intelligent AI assistant inside a web tool suite." },
                ...updatedHistory.slice(-10) // Keep last 10 turns
            ];

            const reply = await callOpenRouter(apiMessages as ChatMessage[]);
            setChatHistory([...updatedHistory, { role: 'assistant', content: reply }]);
        } catch (error) {
            notify("Failed to get response.");
            setChatHistory([...updatedHistory, { role: 'assistant', content: `Error: ${(error as Error).message}` }]);
        } finally {
            setLoading(false);
        }
    };

    const handleSummarize = async () => {
        if (!summaryInput.trim() || loading) return;
        setLoading(true);
        setSummaryOutput('');

        try {
            const messages: ChatMessage[] = [
                { role: 'system', content: "You are an expert summarizer. Extract the key points and provide a concise summary of the following text." },
                { role: 'user', content: summaryInput }
            ];
            const result = await callOpenRouter(messages);
            setSummaryOutput(result);
        } catch (error) {
            notify("Summarization failed.");
            setSummaryOutput(`Error: ${(error as Error).message}`);
        } finally {
            setLoading(false);
        }
    };

    const handlePromptEnhance = async () => {
        if (!promptInput.trim() || loading) return;
        setLoading(true);
        setPromptOutput('');

        try {
            const messages: ChatMessage[] = [
                { role: 'system', content: "You are an expert Prompt Engineer for image generation AI (like Midjourney, Stable Diffusion, DALL-E). Your goal is to take a basic idea and expand it into a highly detailed, descriptive prompt including lighting, style, camera angles, and texture details. Do not output conversational text, only the prompt." },
                { role: 'user', content: `Enhance this idea into a professional image generation prompt: "${promptInput}"` }
            ];
            const result = await callOpenRouter(messages);
            setPromptOutput(result);
        } catch (error) {
            notify("Prompt generation failed.");
            setPromptOutput(`Error: ${(error as Error).message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateLogo = async () => {
        if (!logoPrompt.trim() || loading) return;
        setLoading(true);
        setLogoResults([]);

        // Using Pollinations AI for image generation (free, no key required for basic use)
        // We generate 4 variants by using different random seeds
        try {
            const encoded = encodeURIComponent(logoPrompt + " logo design, vector style, white background, high quality, minimalist");
            const newImages = [];
            for (let i = 0; i < 4; i++) {
                const seed = Math.floor(Math.random() * 100000);
                newImages.push(`https://image.pollinations.ai/prompt/${encoded}?width=512&height=512&seed=${seed}&nologo=true`);
            }
            // Simulate delay for UX
            setTimeout(() => {
                setLogoResults(newImages);
                setLoading(false);
            }, 1500);
        } catch (e) {
            notify("Generation failed");
            setLoading(false);
        }
    };

    const downloadImage = async (url: string, index: number) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `logo-${index + 1}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (e) {
            notify("Download failed. Try right-click > Save Image.");
        }
    };

    return (
        <div className="h-full flex flex-col max-w-5xl mx-auto w-full">
            
            {/* --- AI CHAT TOOL --- */}
            {toolId === 'ai-chat' && (
                <div className="flex-1 flex flex-col bg-gray-900 rounded-xl border border-gray-800 overflow-hidden shadow-2xl h-[600px]">
                    {/* Chat Header */}
                    <div className="p-4 border-b border-gray-800 bg-gray-950/50 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
                            <span className="text-sm font-medium text-gray-300">Nova-2 Lite (Online)</span>
                        </div>
                        <button onClick={() => setChatHistory([])} className="text-xs text-gray-500 hover:text-red-400 flex items-center gap-1">
                            <Eraser size={12}/> Clear Chat
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gradient-to-b from-gray-900 to-black/80">
                        {chatHistory.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-4">
                                <Bot size={48} className="opacity-20" />
                                <p>Start a conversation. I'm ready to help.</p>
                            </div>
                        )}
                        {chatHistory.map((m, i) => (
                            <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {m.role === 'assistant' && (
                                    <div className="w-8 h-8 rounded-full bg-pink-900/30 border border-pink-500/30 flex items-center justify-center mt-1 flex-shrink-0">
                                        <Bot size={16} className="text-pink-400" />
                                    </div>
                                )}
                                <div 
                                    className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-md ${
                                        m.role === 'user' 
                                        ? 'bg-cyan-700 text-white rounded-br-none' 
                                        : 'bg-gray-800 text-gray-200 border border-gray-700 rounded-bl-none'
                                    }`}
                                >
                                    <p className="whitespace-pre-wrap">{m.content}</p>
                                </div>
                                {m.role === 'user' && (
                                    <div className="w-8 h-8 rounded-full bg-cyan-900/30 border border-cyan-500/30 flex items-center justify-center mt-1 flex-shrink-0">
                                        <User size={16} className="text-cyan-400" />
                                    </div>
                                )}
                            </div>
                        ))}
                        {loading && (
                            <div className="flex gap-4 justify-start">
                                <div className="w-8 h-8 rounded-full bg-pink-900/30 border border-pink-500/30 flex items-center justify-center">
                                    <Bot size={16} className="text-pink-400" />
                                </div>
                                <div className="bg-gray-800 p-4 rounded-2xl rounded-bl-none flex gap-1 items-center border border-gray-700">
                                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-gray-900 border-t border-gray-800">
                        <div className="relative flex items-center">
                            <input 
                                value={chatInput} 
                                onChange={(e) => setChatInput(e.target.value)} 
                                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleChatSend()}
                                className="w-full bg-black/40 border border-gray-700 rounded-full py-4 pl-6 pr-14 text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none placeholder-gray-500 transition-all"
                                placeholder="Type a message..."
                                disabled={loading}
                            />
                            <button 
                                onClick={handleChatSend} 
                                disabled={loading || !chatInput.trim()}
                                className="absolute right-2 p-2 bg-pink-600 rounded-full text-white hover:bg-pink-500 disabled:opacity-50 disabled:hover:bg-pink-600 transition-colors"
                            >
                                <Send size={18}/>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- SUMMARIZER TOOL --- */}
            {toolId === 'ai-summarizer' && (
                <div className="flex flex-col md:flex-row gap-6 h-full min-h-[500px]">
                    <div className="flex-1 flex flex-col">
                        <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                            <RefreshCw size={14}/> Input Text
                        </label>
                        <textarea 
                            value={summaryInput}
                            onChange={(e) => setSummaryInput(e.target.value)}
                            className="flex-1 bg-gray-900/80 border border-gray-700 rounded-xl p-6 text-white outline-none focus:border-pink-500 resize-none font-sans text-sm leading-relaxed"
                            placeholder="Paste the content you want to summarize here (articles, emails, essays)..."
                        />
                    </div>
                    
                    <div className="flex items-center justify-center md:flex-col">
                        <button 
                            onClick={handleSummarize} 
                            disabled={loading || !summaryInput}
                            className="bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white rounded-full p-4 shadow-lg hover:shadow-pink-500/20 transition-all"
                        >
                            {loading ? <RefreshCw className="animate-spin" /> : <Sparkles size={24} />}
                        </button>
                    </div>

                    <div className="flex-1 flex flex-col">
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-medium text-gray-400">AI Summary</label>
                            {summaryOutput && (
                                <button onClick={() => {navigator.clipboard.writeText(summaryOutput); notify("Summary copied!");}} className="text-xs text-pink-400 hover:text-white flex items-center gap-1">
                                    <Copy size={12}/> Copy
                                </button>
                            )}
                        </div>
                        <div className={`flex-1 rounded-xl p-6 border ${summaryOutput ? 'bg-gray-900 border-pink-500/30' : 'bg-gray-950 border-gray-800 border-dashed'} overflow-y-auto relative`}>
                             {loading ? (
                                <div className="space-y-3 animate-pulse mt-4">
                                    <div className="h-4 bg-gray-800 rounded w-full"></div>
                                    <div className="h-4 bg-gray-800 rounded w-5/6"></div>
                                    <div className="h-4 bg-gray-800 rounded w-4/6"></div>
                                </div>
                             ) : summaryOutput ? (
                                <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">{summaryOutput}</p>
                             ) : (
                                <div className="h-full flex items-center justify-center text-gray-600 text-sm italic">
                                    Summary will appear here...
                                </div>
                             )}
                        </div>
                    </div>
                </div>
            )}

            {/* --- PROMPTER TOOL --- */}
            {toolId === 'ai-prompt' && (
                <div className="w-full max-w-3xl mx-auto bg-gray-900 rounded-xl border border-gray-800 overflow-hidden shadow-2xl">
                    <div className="p-8 border-b border-gray-800 bg-gradient-to-r from-pink-900/10 to-transparent">
                        <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                            <Cpu className="text-pink-400" />
                            Prompt Engineer
                        </h3>
                        <p className="text-gray-400 text-sm">
                            Turn basic ideas into professional, high-fidelity image generation prompts for Midjourney, DALL-E 3, and Stable Diffusion.
                        </p>
                    </div>

                    <div className="p-8 space-y-8">
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Your Idea</label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    value={promptInput}
                                    onChange={(e) => setPromptInput(e.target.value)}
                                    placeholder="e.g., A cyberpunk cat in the rain" 
                                    className="w-full bg-black/30 border border-gray-700 rounded-lg p-4 text-white focus:border-pink-500 outline-none pr-32"
                                    onKeyDown={(e) => e.key === 'Enter' && handlePromptEnhance()}
                                />
                                <button 
                                    onClick={handlePromptEnhance}
                                    disabled={loading || !promptInput}
                                    className="absolute right-2 top-2 bottom-2 bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white px-4 rounded font-medium transition-colors flex items-center gap-2"
                                >
                                    {loading ? <RefreshCw size={16} className="animate-spin"/> : <Sparkles size={16}/>}
                                    Enhance
                                </button>
                            </div>
                        </div>

                        {(promptOutput || loading) && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <label className="block text-sm text-gray-400 mb-2">Engineered Prompt</label>
                                <div className="relative bg-[#0a0e14] border border-gray-800 rounded-xl p-6 group">
                                    {loading ? (
                                         <div className="space-y-3 animate-pulse">
                                            <div className="h-4 bg-gray-800 rounded w-full"></div>
                                            <div className="h-4 bg-gray-800 rounded w-full"></div>
                                            <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-pink-100 font-mono text-sm leading-relaxed">{promptOutput}</p>
                                            <button 
                                                onClick={() => {navigator.clipboard.writeText(promptOutput); notify("Prompt copied to clipboard!");}}
                                                className="absolute top-4 right-4 p-2 bg-gray-800 text-gray-400 rounded hover:bg-white hover:text-black transition-all opacity-0 group-hover:opacity-100"
                                                title="Copy to Clipboard"
                                            >
                                                <Copy size={16} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* --- LOGO GENERATOR TOOL --- */}
            {toolId === 'ai-logo' && (
                <div className="w-full max-w-4xl mx-auto bg-gray-900 rounded-xl border border-gray-800 overflow-hidden shadow-2xl">
                     <div className="p-8 border-b border-gray-800 bg-gradient-to-r from-pink-900/10 to-transparent">
                        <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                            <Aperture className="text-pink-400" />
                            AI Logo Generator
                        </h3>
                        <p className="text-gray-400 text-sm">
                            Generate unique, professional logo concepts instantly.
                        </p>
                    </div>

                    <div className="p-8 space-y-8">
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Describe your Logo</label>
                            <div className="flex gap-4">
                                <input 
                                    type="text" 
                                    value={logoPrompt}
                                    onChange={(e) => setLogoPrompt(e.target.value)}
                                    placeholder="e.g. Minimalist fox head, orange geometry" 
                                    className="flex-1 bg-black/30 border border-gray-700 rounded-lg p-4 text-white focus:border-pink-500 outline-none"
                                    onKeyDown={(e) => e.key === 'Enter' && handleGenerateLogo()}
                                />
                                <button 
                                    onClick={handleGenerateLogo}
                                    disabled={loading || !logoPrompt}
                                    className="bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white px-8 rounded-lg font-bold transition-colors flex items-center gap-2"
                                >
                                    {loading ? <RefreshCw size={20} className="animate-spin"/> : <Sparkles size={20}/>}
                                    Generate
                                </button>
                            </div>
                        </div>

                        {logoResults.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4">
                                {logoResults.map((url, idx) => (
                                    <div key={idx} className="group relative aspect-square bg-black rounded-xl overflow-hidden border border-gray-800 hover:border-pink-500 transition-all">
                                        <img src={url} alt={`Logo Variation ${idx+1}`} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-3 transition-opacity">
                                            <button 
                                                onClick={() => downloadImage(url, idx)}
                                                className="bg-pink-600 text-white p-2 rounded-full hover:bg-pink-500 transition-colors shadow-lg"
                                                title="Download"
                                            >
                                                <Download size={20} />
                                            </button>
                                            <span className="text-xs font-bold text-white">Variation {idx + 1}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {loading && logoResults.length === 0 && (
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="aspect-square bg-gray-800 rounded-xl animate-pulse flex items-center justify-center">
                                        <Aperture className="text-gray-700 opacity-50" size={32}/>
                                    </div>
                                ))}
                             </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
