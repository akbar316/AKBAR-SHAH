import React, { useState } from 'react';
import { BarChart, Tag, FileSearch, Type, TrendingUp, Search } from 'lucide-react';

interface SEOToolsProps {
  toolId: string;
}

export const SEOTools: React.FC<SEOToolsProps> = ({ toolId }) => {
    const [keyword, setKeyword] = useState('');
    const [results, setResults] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleSearch = () => {
        if (!keyword) return;
        setLoading(true);
        setResults(null);
        setTimeout(() => {
            setLoading(false);
            if (toolId === 'seo-keyword') {
                setResults({ volume: '12,500', difficulty: '68', cpc: '$2.15' });
            } else if (toolId === 'seo-content') {
                setResults({ score: 88, suggestions: ['Add internal links', 'Improve keyword density', 'Optimize images'] });
            } else if (toolId === 'seo-report') {
                setResults({ rank: 12, backlinks: 450, domainAuthority: 45 });
            }
        }, 1200);
    };
    
    const getToolInfo = () => {
        switch(toolId) {
            case 'seo-keyword': return { icon: Tag, title: 'Keyword Research', placeholder: 'Enter a keyword...' };
            case 'seo-content': return { icon: FileSearch, title: 'Content Optimizer', placeholder: 'Enter a URL or paste content...' };
            case 'seo-report': return { icon: TrendingUp, title: 'Full SEO Report', placeholder: 'Enter a domain name...' };
            default: return { icon: BarChart, title: 'SEO Tool', placeholder: '' };
        }
    };

    const { icon: Icon, title, placeholder } = getToolInfo();

    return (
        <div className="max-w-4xl mx-auto"><div className="flex gap-4 mb-6"><input type="text" value={keyword} onChange={e => setKeyword(e.target.value)} placeholder={placeholder} className="flex-1 bg-gray-800 border border-gray-700 rounded-lg p-3 text-white"/><button onClick={handleSearch} disabled={loading || !keyword} className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 px-8 py-3 rounded-lg text-white font-bold flex items-center justify-center gap-2"><Search size={18}/> Analyze</button></div>{loading ? <div className="text-center text-gray-500"><p>Analyzing...</p></div> : results && <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center"><div className="bg-gray-900 p-6 rounded-xl border border-gray-800"><div className="text-3xl font-bold text-cyan-400">{results.volume || results.score || results.rank}</div><div className="text-sm text-gray-400 mt-2">{toolId === 'seo-keyword' ? 'Search Volume' : toolId === 'seo-content' ? 'Content Score' : 'Current Rank'}</div></div><div className="bg-gray-900 p-6 rounded-xl border border-gray-800"><div className="text-3xl font-bold text-cyan-400">{results.difficulty || results.suggestions?.length || results.backlinks}</div><div className="text-sm text-gray-400 mt-2">{toolId === 'seo-keyword' ? 'Difficulty' : toolId === 'seo-content' ? 'Suggestions' : 'Backlinks'}</div></div><div className="bg-gray-900 p-6 rounded-xl border border-gray-800"><div className="text-3xl font-bold text-cyan-400">{results.cpc || (results.suggestions && results.suggestions[0]) || results.domainAuthority}</div><div className="text-sm text-gray-400 mt-2">{toolId === 'seo-keyword' ? 'Avg. CPC' : toolId === 'seo-content' ? 'Top Suggestion' : 'Domain Authority'}</div></div></div>}</div>
    );
};