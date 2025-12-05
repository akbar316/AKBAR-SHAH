import React, { useState } from 'react';
import { Copy, Download } from 'lucide-react';

export const SitemapGenerator: React.FC = () => {
    const [baseUrl, setBaseUrl] = useState('https://example.com');
    const [urls, setUrls] = useState('');
    const [sitemap, setSitemap] = useState('');

    const generateSitemap = () => {
        const urlList = urls.split('\n').filter(u => u.trim() !== '');
        const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlList.map(url => `  <url>
    <loc>${new URL(url, baseUrl).href}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </url>`).join('\n')}
</urlset>`;
        setSitemap(sitemapContent);
    };

    return (
        <div className="w-full bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-xl">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><LayoutGrid className="text-cyan-400"/> Sitemap Generator</h3>
            <div className="space-y-4">
                <div>
                    <label className="text-gray-300 block mb-2">Base URL</label>
                    <input 
                        type="text" 
                        value={baseUrl} 
                        onChange={e => setBaseUrl(e.target.value)} 
                        className="w-full bg-black/30 p-3 rounded-lg border border-gray-700 text-white"
                    />
                </div>
                <div>
                    <label className="text-gray-300 block mb-2">URLs (one per line)</label>
                    <textarea 
                        value={urls} 
                        onChange={e => setUrls(e.target.value)} 
                        className="w-full bg-black/30 p-3 rounded-lg border border-gray-700 text-white h-32"
                    />
                </div>
                <button onClick={generateSitemap} className="w-full bg-cyan-600 hover:bg-cyan-500 py-3 rounded-lg text-white font-bold">Generate Sitemap</button>
                {sitemap && (
                    <div className="relative bg-black/50 p-4 rounded-lg group">
                        <h4 className="text-lg font-bold mb-2">Generated Sitemap</h4>
                        <pre className="text-sm text-gray-300 overflow-auto max-h-60">{sitemap}</pre>
                        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => navigator.clipboard.writeText(sitemap)} className="text-gray-400 hover:text-white"><Copy size={18}/></button>
                            <button onClick={() => {
                                const blob = new Blob([sitemap], { type: 'application/xml' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = 'sitemap.xml';
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