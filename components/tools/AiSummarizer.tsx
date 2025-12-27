
import React, { useState } from 'react';
import { RefreshCw, Sparkles, Copy } from 'lucide-react';
import { getAiConfig } from '../../utils/ai';

interface AiSummarizerProps {
  notify: (msg: string) => void;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const AiSummarizer: React.FC<AiSummarizerProps> = ({ notify }) => {
    const [loading, setLoading] = useState(false);
    const [summaryInput, setSummaryInput] = useState('');
    const [summaryOutput, setSummaryOutput] = useState('');

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

    return (
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
    );
};
