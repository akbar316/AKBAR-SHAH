import React, { useState } from 'react';
import { Copy, Download, FileX } from 'lucide-react';

export const RobotsTxtGenerator: React.FC = () => {
    const [rules, setRules] = useState([
        { userAgent: '*', allow: '/', disallow: '' },
    ]);
    const [sitemapUrl, setSitemapUrl] = useState('');
    const [robotsTxt, setRobotsTxt] = useState('');

    const addRule = () => {
        setRules([...rules, { userAgent: '', allow: '', disallow: '' }]);
    };

    const updateRule = (index: number, field: string, value: string) => {
        const newRules = [...rules];
        newRules[index] = { ...newRules[index], [field]: value };
        setRules(newRules);
    };

    const generateRobotsTxt = () => {
        let content = rules.map(rule => 
            `User-agent: ${rule.userAgent}\n` +
            (rule.allow ? `Allow: ${rule.allow}\n` : '') +
            (rule.disallow ? `Disallow: ${rule.disallow}\n` : '')
        ).join('\n');
        if (sitemapUrl) {
            content += `\nSitemap: ${sitemapUrl}`;
        }
        setRobotsTxt(content);
    };

    return (
        <div className="w-full bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-xl">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><FileX className="text-cyan-400"/> Robots.txt Generator</h3>
            <div className="space-y-4">
                {rules.map((rule, index) => (
                    <div key={index} className="bg-black/30 p-4 rounded-lg border border-gray-700">
                        <input 
                            type="text" 
                            placeholder="User-agent"
                            value={rule.userAgent} 
                            onChange={e => updateRule(index, 'userAgent', e.target.value)} 
                            className="w-full bg-gray-800 p-2 rounded-lg mb-2 text-white"
                        />
                        <input 
                            type="text" 
                            placeholder="Allow"
                            value={rule.allow} 
                            onChange={e => updateRule(index, 'allow', e.target.value)} 
                            className="w-full bg-gray-800 p-2 rounded-lg mb-2 text-white"
                        />
                        <input 
                            type="text" 
                            placeholder="Disallow"
                            value={rule.disallow} 
                            onChange={e => updateRule(index, 'disallow', e.target.value)} 
                            className="w-full bg-gray-800 p-2 rounded-lg text-white"
                        />
                    </div>
                ))}
                <button onClick={addRule} className="text-cyan-400">Add Rule</button>
                <input 
                    type="text" 
                    placeholder="Sitemap URL (optional)"
                    value={sitemapUrl} 
                    onChange={e => setSitemapUrl(e.target.value)} 
                    className="w-full bg-black/30 p-3 rounded-lg border border-gray-700 text-white"
                />
                <button onClick={generateRobotsTxt} className="w-full bg-cyan-600 hover:bg-cyan-500 py-3 rounded-lg text-white font-bold">Generate robots.txt</button>
                {robotsTxt && (
                    <div className="relative bg-black/50 p-4 rounded-lg group">
                        <h4 className="text-lg font-bold mb-2">Generated robots.txt</h4>
                        <pre className="text-sm text-gray-300 overflow-auto max-h-60">{robotsTxt}</pre>
                        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => navigator.clipboard.writeText(robotsTxt)} className="text-gray-400 hover:text-white"><Copy size={18}/></button>
                            <button onClick={() => {
                                const blob = new Blob([robotsTxt], { type: 'text/plain' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = 'robots.txt';
                                a.click();
                                URL.revokeObjectURL(url);
                            }} className="text-gray-400 hover:text-white"><Download size={18}/></button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};