import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';

interface UtilityToolsProps {
  toolId: string;
}

export const UtilityTools: React.FC<UtilityToolsProps> = ({ toolId }) => {
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');

    return (
        <div className="flex flex-col items-center max-w-2xl mx-auto">
             {toolId === 'util-password' && (
                 <div className="w-full bg-gray-900 p-6 rounded-xl border border-gray-800 text-center">
                     <h3 className="text-xl mb-6">Secure Password Generator</h3>
                     <div className="text-2xl font-mono text-cyan-400 bg-black/50 p-4 rounded mb-6 break-all">{outputText || 'Click Generate'}</div>
                     <button onClick={() => setOutputText(Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8))} className="bg-emerald-600 hover:bg-emerald-500 px-8 py-3 rounded text-white font-bold flex items-center justify-center gap-2 mx-auto"><RefreshCw size={18}/> Generate</button>
                 </div>
             )}
             {toolId === 'util-unit' && (
                 <div className="w-full bg-gray-900 p-6 rounded-xl border border-gray-800">
                     <h3 className="text-xl mb-6 text-center">Unit Converter (Kg to Lbs)</h3>
                     <div className="flex items-center gap-4">
                        <input type="number" className="flex-1 bg-black/30 p-3 rounded text-white border border-gray-700" placeholder="Kg" onChange={(e) => setOutputText((Number(e.target.value) * 2.20462).toFixed(2) + " lbs")} />
                        <span className="text-gray-500">=</span>
                        <div className="flex-1 bg-black/30 p-3 rounded text-gray-300 border border-gray-700">{outputText || '...'}</div>
                     </div>
                 </div>
             )}
              {toolId === 'util-qrcode' && (
                 <div className="w-full bg-gray-900 p-6 rounded-xl border border-gray-800 text-center">
                     <h3 className="text-xl mb-4">QR Code Generator</h3>
                     <input type="text" className="w-full bg-black/30 p-3 rounded border border-gray-700 text-white mb-4" placeholder="Enter URL..." onChange={(e) => setInputText(e.target.value)} />
                     {inputText && (
                         <div className="bg-white p-4 inline-block rounded">
                             <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(inputText)}`} alt="QR" />
                         </div>
                     )}
                 </div>
             )}
        </div>
    );
};