
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Eraser } from 'lucide-react';
import { getAiConfig } from '../../utils/ai';

interface AiChatProps {
  notify: (msg: string) => void;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const AiChat: React.FC<AiChatProps> = ({ notify }) => {
    const [loading, setLoading] = useState(false);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

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

    const handleChatSend = async () => {
        if (!chatInput.trim() || loading) return;
        
        const newUserMsg: ChatMessage = { role: 'user', content: chatInput };
        const updatedHistory = [...chatHistory, newUserMsg];
        
        setChatHistory(updatedHistory);
        setChatInput('');
        setLoading(true);

        try {
            const apiMessages = [
                { role: 'system', content: "You are a helpful, intelligent AI assistant inside a web tool suite." },
                ...updatedHistory.slice(-10) 
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

    return (
        <div className="flex-1 flex flex-col bg-gray-900 rounded-xl border border-gray-800 overflow-hidden shadow-2xl h-[600px]">
            <div className="p-4 border-b border-gray-800 bg-gray-950/50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
                    <span className="text-sm font-medium text-gray-300">Nova-2 Lite (Online)</span>
                </div>
                <button onClick={() => setChatHistory([])} className="text-xs text-gray-500 hover:text-red-400 flex items-center gap-1">
                    <Eraser size={12}/> Clear Chat
                </button>
            </div>

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
    );
};
