
import React, { useState } from 'react';
import { Cpu, Sparkles, RefreshCw, Copy } from 'lucide-react';
import { getAiConfig } from '../../utils/ai';

interface AiPrompterProps {
  notify: (msg: string) => void;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const AiPrompter: React.FC<AiPrompterProps> = ({ notify }) => {
    const [loading, setLoading] = useState(false);
    const [promptInput, setPromptInput] = useState('');
    const [promptOutput, setPromptOutput] = useState('');

    const callOpenRouter = async (messages: ChatMessage[]) => {
        const { apiKey, model } = getAiConfig();
        
        if (!apiKey) {
            notify("Error: API Key missing.");
            throw new Error("API Key Missing. Please add VITE_OPENROUTER_API_KEY env var.");
        }

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": model,
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

    const handlePromptEnhance = async () => {
        if (!promptInput.trim() || loading) return;
        setLoading(true);
        setPromptOutput('');

        try {
            const messages: ChatMessage[] = [
                { role: 'system', content: "You are an expert Prompt Engineer for image generation AI (like Midjourney, Stable Diffusion, DALL-E). Your goal is to take a basic idea and expand it into a highly detailed, descriptive prompt including lighting, style, camera angles, and texture details. Do not output conversational text, only the prompt." },
                { role: 'user', content: `Enhance this idea into a professional image generation prompt: \"${promptInput}\"` }
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

    return (
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
    );
};
