
import React, { useState } from 'react';
import { Code, RefreshCw, Copy } from 'lucide-react';
import { getAiConfig } from '../../utils/ai';

interface AiCodeGeneratorProps {
  notify: (msg: string) => void;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const AiCodeGenerator: React.FC<AiCodeGeneratorProps> = ({ notify }) => {
    const [loading, setLoading] = useState(false);
    const [codeInput, setCodeInput] = useState('');
    const [codeOutput, setCodeOutput] = useState('');
    const [codeLanguage, setCodeLanguage] = useState('javascript');
    const [codeAction, setCodeAction] = useState('generate');

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

    return (
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
    );
};
