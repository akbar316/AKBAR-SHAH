

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, User, Copy, RefreshCw, Cpu, Eraser, Aperture, Download, Code, Briefcase, FileText, Upload, Image as ImageIcon, Eye, CheckCircle, Maximize, Minimize } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

// Fix for PDF.js worker
const pdfjs = (pdfjsLib as any).default || pdfjsLib;
try {
  if (pdfjs && !pdfjs.GlobalWorkerOptions.workerSrc) {
      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
  }
} catch (e) {
  console.warn("Failed to set PDF worker source", e);
}

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

    // Resume Writer State
    const [resumeType, setResumeType] = useState('Resume');
    const [resumeJob, setResumeJob] = useState('');
    const [resumeLevel, setResumeLevel] = useState('Mid-Level');
    const [resumeSkills, setResumeSkills] = useState('');
    const [resumeBio, setResumeBio] = useState('');
    const [resumeOutput, setResumeOutput] = useState('');
    const [resumeStyle, setResumeStyle] = useState('ATS (Markdown)');
    const [resumePhoto, setResumePhoto] = useState<string | null>(null);
    const [resumeViewMode, setResumeViewMode] = useState<'preview' | 'code'>('preview');
    const [isFullScreen, setIsFullScreen] = useState(false);

    // Code Gen State
    const [codeInput, setCodeInput] = useState('');
    const [codeOutput, setCodeOutput] = useState('');
    const [codeLanguage, setCodeLanguage] = useState('javascript');
    const [codeAction, setCodeAction] = useState('generate');

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

    // --- PDF Extraction Helper ---
    const extractTextFromPdf = async (file: File): Promise<string> => {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjs.getDocument(arrayBuffer).promise;
            let fullText = "";
            const maxPages = Math.min(pdf.numPages, 5); // Limit pages
            
            for (let i = 1; i <= maxPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                const strings = content.items.map((item: any) => item.str);
                fullText += strings.join(" ") + "\n";
            }
            
            return fullText;
        } catch (e) {
            console.error(e);
            throw new Error("PDF Extraction Failed");
        }
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

    const handleGenerateCode = async () => {
        if (!codeInput.trim() || loading) return;
        setLoading(true);
        setCodeOutput('');

        try {
            const instruction = codeAction === 'generate' 
                ? `Generate ${codeLanguage} code for the following request. Provide only the code snippet, no markdown blocks unless necessary for structure.`
                : codeAction === 'explain'
                ? `Explain the following ${codeLanguage} code concisely.`
                : `Find bugs and refactor the following ${codeLanguage} code. Explain the changes briefly.`;

            const messages: ChatMessage[] = [
                { role: 'system', content: `You are an expert AI Coding Assistant. Task: ${instruction}` },
                { role: 'user', content: codeInput }
            ];
            
            const result = await callOpenRouter(messages);
            setCodeOutput(result);
        } catch (error) {
            notify("Code generation failed.");
            setCodeOutput(`Error: ${(error as Error).message}`);
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

    // --- RESUME HANDLERS ---
    const handleImportResume = async (file: File) => {
        setLoading(true);
        try {
            const text = await extractTextFromPdf(file);
            setResumeBio(text);
            notify("Resume imported! Info filled.");
        } catch (e) {
            notify("Import failed. Try a different PDF.");
        } finally {
            setLoading(false);
        }
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => setResumePhoto(ev.target?.result as string);
            reader.readAsDataURL(file);
            notify("Photo uploaded!");
        }
    };

    const handleGenerateResume = async () => {
        if (!resumeJob.trim() || !resumeBio.trim() || loading) {
            notify("Please fill in Job Title and Background Info.");
            return;
        }
        setLoading(true);
        setResumeOutput('');

        const isHtmlMode = resumeStyle !== 'ATS (Markdown)';

        try {
            let systemPrompt = `You are an expert Professional Resume Writer and Career Coach. 
            Task: Write a high-quality ${resumeType} for a ${resumeJob} position.
            Candidate Level: ${resumeLevel}.
            Key Skills to Highlight: ${resumeSkills}.
            Base the content strictly on the provided background info.`;

            if (isHtmlMode) {
                systemPrompt += `
                OUTPUT FORMAT: Single-file HTML code using Tailwind CSS via CDN.
                STYLE: ${resumeStyle}.
                Layout Guidelines:
                - Use <script src="https://cdn.tailwindcss.com"></script>.
                - Make it responsive, modern, and professional.
                - If the user has a photo, I will inject it later. For now, use the exact placeholder text: "[[PROFILE_PHOTO]]" in the src attribute of the img tag.
                - Output ONLY the raw HTML code. Do NOT use markdown blocks (\`\`\`). Start with <!DOCTYPE html>.
                `;
            } else {
                systemPrompt += `
                OUTPUT FORMAT: Clean, ATS-friendly Markdown.
                Structure:
                - Summary
                - Experience (Action-oriented bullet points)
                - Skills
                - Education
                Tone: Professional, Confident.
                `;
            }

            const messages: ChatMessage[] = [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Here is my background info: ${resumeBio}` }
            ];

            let result = await callOpenRouter(messages);

            // Clean up if AI adds markdown code blocks to HTML
            if (isHtmlMode) {
                result = result.replace(/```html/g, '').replace(/```/g, '').trim();
                // Inject Photo
                const photoSrc = resumePhoto || "https://via.placeholder.com/150?text=Photo";
                result = result.replace('[[PROFILE_PHOTO]]', photoSrc);
            }

            setResumeOutput(result);
            setResumeViewMode('preview'); // Auto show preview for HTML
        } catch (e) {
            notify("Generation failed.");
            setResumeOutput(`Error: ${(e as Error).message}`);
        } finally {
            setLoading(false);
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

            {/* --- CODE GENERATOR TOOL --- */}
            {toolId === 'ai-code' && (
                <div className="flex flex-col h-full min-h-[500px] gap-6">
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl">
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <div className="flex-1">
                                <label className="text-xs text-gray-400 uppercase font-bold block mb-2">Language</label>
                                <select 
                                    value={codeLanguage} 
                                    onChange={(e) => setCodeLanguage(e.target.value)}
                                    className="w-full bg-black/30 text-white border border-gray-700 rounded-lg py-3 px-4 outline-none focus:border-pink-500"
                                >
                                    <option value="python">Python</option>
                                    <option value="javascript">JavaScript</option>
                                    <option value="html">HTML</option>
                                    <option value="css">CSS</option>
                                    <option value="php">PHP</option>
                                    <option value="sql">SQL</option>
                                    <option value="java">Java</option>
                                    <option value="cpp">C++</option>
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="text-xs text-gray-400 uppercase font-bold block mb-2">Action</label>
                                <select 
                                    value={codeAction} 
                                    onChange={(e) => setCodeAction(e.target.value)}
                                    className="w-full bg-black/30 text-white border border-gray-700 rounded-lg py-3 px-4 outline-none focus:border-pink-500"
                                >
                                    <option value="generate">Generate Code</option>
                                    <option value="explain">Explain Code</option>
                                    <option value="debug">Debug / Fix Code</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-400 uppercase font-bold block mb-2">
                                    {codeAction === 'generate' ? 'Describe functionality' : 'Paste Code here'}
                                </label>
                                <textarea 
                                    value={codeInput}
                                    onChange={(e) => setCodeInput(e.target.value)}
                                    className="w-full bg-black/30 border border-gray-700 rounded-xl p-4 text-white outline-none focus:border-pink-500 resize-none h-32 font-mono text-sm"
                                    placeholder={codeAction === 'generate' ? "e.g., Create a function to check if a number is prime..." : "Paste your code snippet..."}
                                />
                            </div>
                            
                            <button 
                                onClick={handleGenerateCode} 
                                disabled={loading || !codeInput}
                                className="w-full bg-pink-600 hover:bg-pink-500 disabled:opacity-50 py-3 rounded-lg text-white font-bold shadow-lg hover:shadow-pink-900/20 transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? <RefreshCw className="animate-spin" size={18}/> : <Code size={18}/>}
                                {loading ? 'Processing...' : 'Run Assistant'}
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 bg-gray-950 border border-gray-800 rounded-xl p-6 overflow-hidden relative group">
                        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-800">
                             <span className="text-xs text-gray-400 uppercase font-bold">Output</span>
                             {codeOutput && (
                                <button onClick={() => {navigator.clipboard.writeText(codeOutput); notify("Code copied!");}} className="text-xs text-pink-400 hover:text-white flex items-center gap-1">
                                    <Copy size={12}/> Copy
                                </button>
                             )}
                        </div>
                        <div className="h-full overflow-auto custom-scrollbar pb-10">
                            {codeOutput ? (
                                <pre className="font-mono text-sm text-green-400 whitespace-pre-wrap">{codeOutput}</pre>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-2">
                                    <Code size={32} className="opacity-20"/>
                                    <span className="text-sm italic">Generated code will appear here...</span>
                                </div>
                            )}
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

            {/* --- RESUME WRITER TOOL --- */}
            {toolId === 'ai-resume' && (
                <div className="flex flex-col max-w-6xl mx-auto w-full gap-6">
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl">
                        
                        {/* Top Row: Type & Import */}
                        <div className="flex flex-col lg:flex-row justify-between items-start gap-4 mb-6 border-b border-gray-800 pb-6">
                             <div className="flex gap-4 w-full lg:w-auto">
                                <div className="flex-1">
                                    <label className="text-xs text-gray-400 uppercase font-bold block mb-2">Document</label>
                                    <select 
                                        value={resumeType} 
                                        onChange={(e) => setResumeType(e.target.value)}
                                        className="w-full bg-black/30 text-white border border-gray-700 rounded-lg py-2.5 px-3 outline-none focus:border-pink-500 text-sm"
                                    >
                                        <option>Resume</option>
                                        <option>Cover Letter</option>
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs text-gray-400 uppercase font-bold block mb-2">Style / Format</label>
                                    <select 
                                        value={resumeStyle} 
                                        onChange={(e) => setResumeStyle(e.target.value)}
                                        className="w-full bg-black/30 text-white border border-gray-700 rounded-lg py-2.5 px-3 outline-none focus:border-pink-500 text-sm"
                                    >
                                        <option>ATS (Markdown)</option>
                                        <option>Modern (HTML)</option>
                                        <option>Creative (HTML)</option>
                                        <option>Professional (HTML)</option>
                                    </select>
                                </div>
                             </div>
                             
                             <div className="flex gap-4 w-full lg:w-auto">
                                <label className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 text-gray-300 hover:text-white transition-all cursor-pointer text-sm font-medium">
                                    <Upload size={16}/> Import PDF
                                    <input type="file" accept=".pdf" className="hidden" onChange={(e) => e.target.files && handleImportResume(e.target.files[0])} />
                                </label>
                                <label className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 text-gray-300 hover:text-white transition-all cursor-pointer text-sm font-medium">
                                    <ImageIcon size={16}/> Photo
                                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                                </label>
                             </div>
                        </div>

                        {/* Middle Row: Inputs */}
                        <div className="flex flex-col lg:flex-row gap-4 mb-6">
                            <div className="flex-1">
                                <label className="text-xs text-gray-400 uppercase font-bold block mb-2">Target Role</label>
                                <input 
                                    type="text"
                                    value={resumeJob}
                                    onChange={(e) => setResumeJob(e.target.value)}
                                    placeholder="e.g. Senior Frontend Engineer"
                                    className="w-full bg-black/30 text-white border border-gray-700 rounded-lg py-3 px-4 outline-none focus:border-pink-500"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs text-gray-400 uppercase font-bold block mb-2">Experience Level</label>
                                <select 
                                    value={resumeLevel} 
                                    onChange={(e) => setResumeLevel(e.target.value)}
                                    className="w-full bg-black/30 text-white border border-gray-700 rounded-lg py-3 px-4 outline-none focus:border-pink-500"
                                >
                                    <option>Entry-Level / Student</option>
                                    <option>Mid-Level</option>
                                    <option>Senior</option>
                                    <option>Executive</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-400 uppercase font-bold block mb-2">Key Skills (Comma Separated)</label>
                                <input 
                                    type="text"
                                    value={resumeSkills}
                                    onChange={(e) => setResumeSkills(e.target.value)}
                                    placeholder="e.g. React, Node.js, Project Management, Agile..."
                                    className="w-full bg-black/30 text-white border border-gray-700 rounded-lg py-3 px-4 outline-none focus:border-pink-500"
                                />
                            </div>
                            <div className="relative">
                                <div className="flex justify-between items-center mb-2">
                                     <label className="text-xs text-gray-400 uppercase font-bold">Background Info / Old Resume Text</label>
                                     {resumePhoto && <span className="text-xs text-green-400 flex items-center gap-1"><CheckCircle size={10}/> Photo Attached</span>}
                                </div>
                                <textarea 
                                    value={resumeBio}
                                    onChange={(e) => setResumeBio(e.target.value)}
                                    className="w-full bg-black/30 border border-gray-700 rounded-xl p-4 text-white outline-none focus:border-pink-500 resize-none h-40 font-sans text-sm custom-scrollbar"
                                    placeholder={loading ? "Extracting text from PDF..." : "Paste your old resume content, LinkedIn summary, or just type out your work history and education here..."}
                                    disabled={loading}
                                />
                            </div>
                            
                            <button 
                                onClick={handleGenerateResume} 
                                disabled={loading || !resumeJob || !resumeBio}
                                className="w-full bg-pink-600 hover:bg-pink-500 disabled:opacity-50 py-3 rounded-lg text-white font-bold shadow-lg hover:shadow-pink-900/20 transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? <RefreshCw className="animate-spin" size={18}/> : <FileText size={18}/>}
                                {loading ? 'Generating...' : `Generate ${resumeType}`}
                            </button>
                        </div>
                    </div>

                    {/* Output */}
                    {(resumeOutput || loading) && (
                        <div className={`${isFullScreen ? 'fixed inset-0 z-50 m-0 rounded-none w-screen h-screen' : 'flex-1 min-h-[800px] rounded-xl border border-gray-800 shadow-2xl'} bg-gray-950 overflow-hidden relative group flex flex-col transition-all duration-300`}>
                            {/* Output Header */}
                            <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-gray-900/90 backdrop-blur-sm">
                                 <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-400 uppercase font-bold">Generated Output</span>
                                    {resumeStyle !== 'ATS (Markdown)' && (
                                        <div className="flex bg-black/40 rounded-lg p-1 border border-gray-700 ml-4">
                                            <button 
                                                onClick={() => setResumeViewMode('preview')}
                                                className={`px-3 py-1 rounded text-xs font-medium flex items-center gap-2 transition-all ${resumeViewMode === 'preview' ? 'bg-pink-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                            >
                                                <Eye size={12}/> Preview
                                            </button>
                                            <button 
                                                onClick={() => setResumeViewMode('code')}
                                                className={`px-3 py-1 rounded text-xs font-medium flex items-center gap-2 transition-all ${resumeViewMode === 'code' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                            >
                                                <Code size={12}/> HTML
                                            </button>
                                        </div>
                                    )}
                                    <button 
                                        onClick={() => setIsFullScreen(!isFullScreen)}
                                        className="ml-2 p-1.5 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors"
                                        title={isFullScreen ? "Exit Full Screen" : "Full Screen Preview"}
                                    >
                                        {isFullScreen ? <Minimize size={16}/> : <Maximize size={16}/>}
                                    </button>
                                 </div>
                                 
                                 {resumeOutput && !loading && (
                                    <div className="flex gap-2">
                                        {resumeStyle !== 'ATS (Markdown)' && (
                                            <button 
                                                onClick={() => {
                                                    const blob = new Blob([resumeOutput], {type: 'text/html'});
                                                    const url = URL.createObjectURL(blob);
                                                    const a = document.createElement('a');
                                                    a.href = url;
                                                    a.download = 'resume.html';
                                                    a.click();
                                                    notify("Downloaded HTML");
                                                }} 
                                                className="text-xs text-gray-400 hover:text-white flex items-center gap-1 px-3 py-1.5 rounded bg-gray-800 hover:bg-gray-700"
                                            >
                                                <Download size={12}/> Download HTML
                                            </button>
                                        )}
                                        <button onClick={() => {navigator.clipboard.writeText(resumeOutput); notify("Copied to clipboard!");}} className="text-xs text-pink-400 hover:text-white flex items-center gap-1 px-3 py-1.5 rounded bg-gray-800 hover:bg-gray-700">
                                            <Copy size={12}/> Copy Text
                                        </button>
                                    </div>
                                 )}
                            </div>
                            
                            <div className="flex-1 relative bg-white overflow-auto">
                                {loading ? (
                                    <div className="absolute inset-0 bg-gray-950 flex flex-col items-center justify-center gap-4">
                                        <RefreshCw className="animate-spin text-pink-500" size={32}/>
                                        <div className="space-y-2 text-center">
                                            <p className="text-gray-400 text-sm">Crafting your professional profile...</p>
                                            <div className="w-48 h-1 bg-gray-800 rounded-full overflow-hidden mx-auto">
                                                <div className="h-full bg-pink-500 animate-pulse w-2/3"></div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {resumeStyle === 'ATS (Markdown)' || resumeViewMode === 'code' ? (
                                            <textarea 
                                                readOnly 
                                                value={resumeOutput}
                                                className="w-full h-full p-8 bg-gray-950 text-gray-300 font-mono text-sm resize-none outline-none custom-scrollbar"
                                            />
                                        ) : (
                                            <iframe 
                                                srcDoc={resumeOutput}
                                                title="Resume Preview"
                                                className="w-full h-full border-none"
                                            />
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
