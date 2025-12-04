import React, { useState, useEffect } from 'react';
import { SubTool } from '../../types';

interface TextToolsProps {
  toolId: string;
}

export const TextTools: React.FC<TextToolsProps> = ({ toolId }) => {
  const [inputText, setInputText] = useState('');
  const [secondInput, setSecondInput] = useState('');
  const [outputText, setOutputText] = useState('');

  useEffect(() => {
    if (!inputText) {
        setOutputText('');
        return;
    }

    if (toolId === 'text-counter') {
        const words = inputText.trim().split(/\s+/).filter(w => w.length > 0).length;
        const chars = inputText.length;
        const lines = inputText.split('\n').length;
        setOutputText(`Words: ${words}\nCharacters: ${chars}\nLines: ${lines}`);
    } else if (toolId === 'text-extractor') {
        const words = inputText.toLowerCase().match(/\b\w+\b/g) || [];
        const freq: Record<string, number> = {};
        words.forEach(w => freq[w] = (freq[w] || 0) + 1);
        const sorted = Object.entries(freq).sort((a,b) => b[1] - a[1]).slice(0, 10);
        setOutputText("Top Keywords:\n" + sorted.map(([w, c]) => `${w}: ${c}`).join('\n'));
    } else if (toolId === 'text-diff') {
        if (!secondInput) setOutputText("Enter text in second box to compare.");
        else setOutputText(inputText === secondInput ? "Texts are identical." : "Texts are different.");
    }
  }, [inputText, secondInput, toolId]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
        <div className="flex flex-col h-full">
            <label className="text-sm text-gray-400 mb-2">Input Text</label>
            <textarea 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-gray-950 border border-gray-800 rounded-xl p-4 text-white focus:border-cyan-500/50 outline-none resize-none font-mono text-sm"
                placeholder="Paste your text here..."
            />
        </div>
        
        {toolId === 'text-diff' ? (
            <div className="flex flex-col h-full">
                <label className="text-sm text-gray-400 mb-2">Comparison Text</label>
                <textarea 
                    value={secondInput}
                    onChange={(e) => setSecondInput(e.target.value)}
                    className="flex-1 bg-gray-950 border border-gray-800 rounded-xl p-4 text-white focus:border-cyan-500/50 outline-none resize-none font-mono text-sm"
                    placeholder="Paste second text here..."
                />
                 <div className="mt-4 p-4 bg-gray-900 rounded-xl border border-gray-800 text-cyan-400 font-mono text-sm">
                    {outputText}
                </div>
            </div>
        ) : (
            <div className="flex flex-col h-full">
                <label className="text-sm text-gray-400 mb-2">Results</label>
                <div className="flex-1 bg-gray-900 rounded-xl p-6 border border-gray-800">
                    <pre className="text-cyan-400 font-mono whitespace-pre-wrap">{outputText || 'Waiting for input...'}</pre>
                </div>
            </div>
        )}
      </div>
  );
};