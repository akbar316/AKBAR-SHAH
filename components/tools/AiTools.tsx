import React, { useState } from 'react';
import { Sparkles, Send } from 'lucide-react';

interface AiToolsProps {
  toolId: string;
  notify: (msg: string) => void;
}

export const AiTools: React.FC<AiToolsProps> = ({ toolId, notify }) => {
    const [messages, setMessages] = useState<{role: 'user'|'ai', text: string}[]>([]);
    const [aiInput, setAiInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [outputText, setOutputText] = useState('');

    const sendAiMessage = () => {
        if(!aiInput.trim()) return;
        setMessages([...messages, {role: 'user', text: aiInput}]);
        setAiInput('');
        setLoading(true);
        setTimeout(() => {
            setMessages(prev => [...prev, {role: 'ai', text: "I am a simulated AI response. Currently, I cannot make real API calls, but I'm demonstrating the chat UI."}]);
            setLoading(false);
        }, 1000);
    }

    return (
        <div className="h-full flex flex-col max-w-3xl mx-auto">
             {toolId === 'ai-chat' && (
                 <div className="flex-1 flex flex-col bg-gray-900 rounded-xl border border-gray-800 overflow-hidden min-h-[500px]">
                     <div className="flex-1 p-4 overflow-y-auto space-y-4">
                         {messages.length === 0 && <div className="text-center text-gray-500 mt-10">Start a conversation with AI...</div>}
                         {messages.map((m, i) => (
                             <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                 <div className={`max-w-[80%] p-3 rounded-xl ${m.role === 'user' ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-200'}`}>{m.text}</div>
                             </div>
                         ))}
                         {loading && <div className="text-gray-500 text-xs animate-pulse">AI is typing...</div>}
                     </div>
                     <div className="p-4 border-t border-gray-800 flex gap-2">
                         <input value={aiInput} onChange={(e) => setAiInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendAiMessage()} className="flex-1 bg-black/30 border border-gray-700 rounded-full px-4 text-white focus:border-pink-500 outline-none" placeholder="Ask anything..." />
                         <button onClick={sendAiMessage} className="p-2 bg-pink-600 rounded-full text-white hover:bg-pink-500"><Send size={18}/></button>
                     </div>
                 </div>
             )}
             {toolId === 'ai-summarizer' && (
                 <div className="w-full bg-gray-900 p-6 rounded-xl border border-gray-800">
                    <h3 className="text-xl mb-4 flex items-center gap-2"><Sparkles className="text-pink-400"/> AI Summarizer</h3>
                    <textarea className="w-full h-40 bg-black/30 border border-gray-700 rounded p-4 text-white mb-4" placeholder="Paste long text here..."></textarea>
                    <button onClick={() => setOutputText("Summary: The user provided text has been processed by our AI algorithms to extract the key points efficiently. (Simulation)")} className="bg-pink-600 px-6 py-2 rounded text-white font-bold mb-4">Summarize</button>
                    {outputText && <div className="p-4 bg-pink-900/20 border border-pink-500/30 rounded text-pink-100">{outputText}</div>}
                 </div>
             )}
             {toolId === 'ai-prompt' && (
                 <div className="w-full bg-gray-900 p-6 rounded-xl border border-gray-800">
                    <h3 className="text-xl mb-4">Prompt Engineer</h3>
                    <input type="text" placeholder="Basic idea (e.g. 'cat in space')" className="w-full mb-4 bg-black/30 p-3 rounded border border-gray-700 text-white" />
                    <button onClick={() => setOutputText("Hyper-realistic 8k render of a fluffy tabby cat floating in zero gravity inside a futuristic neon-lit spaceship, cinematic lighting, octane render.")} className="w-full bg-pink-600 py-3 rounded text-white font-bold mb-6">Enhance Prompt</button>
                    {outputText && (
                        <div className="relative p-4 bg-gray-800 rounded border border-gray-700">
                            <p className="text-gray-300 italic">"{outputText}"</p>
                            <button onClick={() => {navigator.clipboard.writeText(outputText); notify("Copied!");}} className="absolute top-2 right-2 text-xs text-gray-500 hover:text-white">Copy</button>
                        </div>
                    )}
                 </div>
             )}
        </div>
    );
};