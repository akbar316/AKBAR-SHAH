import React, { useState } from 'react';
import { Bot, Sparkles, Cpu, Send } from 'lucide-react';

interface AIToolsProps {
  toolId: string;
  notify: (msg: string) => void;
}

export const AITools: React.FC<AIToolsProps> = ({ toolId, notify }) => {
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAIAction = () => {
        if (!inputText) return;
        setLoading(true);
        setOutputText('');
        setTimeout(() => {
            setLoading(false);
            if (toolId === 'ai-chat') {
                setOutputText(`As an AI, I can provide information, generate text, and engage in conversation. You asked: "${inputText}". Here is a sample response.`);
            } else if (toolId === 'ai-summarizer') {
                setOutputText(`Summary of the provided text: The key points are extracted and presented in a concise manner. The original text discusses several topics, and this summary captures the essence of the arguments.`);
            } else if (toolId === 'ai-prompt') {
                setOutputText(`Generated prompt based on your input "${inputText}": Create a short story about a futuristic detective solving a case in a neon-lit city.`);
            }
        }, 1500);
    };

    const getToolInfo = () => {
        switch(toolId) {
            case 'ai-chat': return { icon: Bot, title: 'AI Chat', placeholder: 'Ask me anything...' };
            case 'ai-summarizer': return { icon: Sparkles, title: 'Text Summarizer', placeholder: 'Paste a long text to summarize...' };
            case 'ai-prompt': return { icon: Cpu, title: 'Prompt Generator', placeholder: 'Enter a topic to generate a prompt...' };
            default: return { icon: Bot, title: 'AI Tool', placeholder: '' };
        }
    };

    const { icon: Icon, title, placeholder } = getToolInfo();

    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col h-full bg-gray-900 border border-gray-800 rounded-xl shadow-xl">
            <div className="p-6 border-b border-gray-800"><h3 className="text-xl font-bold flex items-center gap-2"><Icon className="text-rose-400"/> {title}</h3></div>
            <div className="flex-1 p-6 overflow-y-auto"><div className="bg-black/30 p-4 rounded-lg min-h-[200px] text-gray-300 whitespace-pre-wrap">{loading ? <div className="flex items-center gap-2"><div className="w-2 h-2 bg-rose-400 rounded-full animate-pulse"></div><span className="text-sm text-gray-500">AI is thinking...</span></div> : outputText}</div></div>
            <div className="p-6 border-t border-gray-800"><div className="flex gap-4"><input type="text" value={inputText} onChange={e => setInputText(e.target.value)} placeholder={placeholder} className="flex-1 bg-gray-800 border border-gray-700 rounded-lg p-3 text-white"/><button onClick={handleAIAction} disabled={loading || !inputText} className="bg-rose-600 hover:bg-rose-500 disabled:opacity-50 px-6 py-3 rounded-lg text-white font-bold flex items-center justify-center gap-2"><Send size={18}/> Send</button></div></div>
        </div>
    );
};