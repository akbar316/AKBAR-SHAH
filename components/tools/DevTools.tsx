import React, { useState } from 'react';
import { RefreshCw, Play, Copy } from 'lucide-react';

interface DevToolsProps {
  toolId: string;
  notify: (msg: string) => void;
}

export const DevTools: React.FC<DevToolsProps> = ({ toolId, notify }) => {
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [loading, setLoading] = useState(false);

    const handleDevAction = () => {
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
            }
        } catch (e) {
            setOutputText(`Error: ${(e as Error).message}`);
        }
    };

    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto">
            <div className="flex gap-4 mb-4">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
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
            </div>
        </div>
    );
};