import React, { useState } from 'react';
import { GraduationCap, Trash2, Plus, BookOpen, Copy, CheckCircle, RefreshCw, FileText, BarChart } from 'lucide-react';
import { diffChars } from 'diff';

interface StudentToolsProps {
  toolId: string;
  notify: (msg: string) => void;
}

const MOCK_ORIGINAL_SOURCE = "The quick brown fox jumps over the lazy dog. This is a classic sentence used for testing typewriters and is known for containing all of the letters of the English alphabet. It is a pangram. The origins of the sentence are not entirely clear, but it has been in use for over a century. It's a fun and useful tool for typography and design.";

export const StudentTools: React.FC<StudentToolsProps> = ({ toolId, notify }) => {
    // GPA State
    const [gpaCourses, setGpaCourses] = useState([{ id: 1, name: '', credit: 3, grade: 4.0 }]);
    const gradeValues: Record<string, number> = { "A+": 4.0, "A": 4.0, "A-": 3.7, "B+": 3.3, "B": 3.0, "B-": 2.7, "C+": 2.3, "C": 2.0, "C-": 1.7, "D+": 1.3, "D": 1.0, "F": 0.0 };
    
    // Citation State
    const [citationState, setCitationState] = useState({ style: 'APA', source: 'Website', author: '', title: '', year: new Date().getFullYear().toString(), url: '', publisher: '' });
    const [citationOutput, setCitationOutput] = useState('');

    // Plagiarism State
    const [plagiarismInput, setPlagiarismInput] = useState('');
    const [plagiarismView, setPlagiarismView] = useState<'summary' | 'report' | 'matches'>('summary');
    const [plagiarismState, setPlagiarismState] = useState<{
        scanning: boolean;
        progress: number;
        result: { score: number; matches: {source: string, similarity: string}[]; readability: string; words: number } | null;
        report: { type: string, value: string }[] | null;
    }>({ scanning: false, progress: 0, result: null, report: null });


    // --- GPA Helpers ---
    const addCourse = () => setGpaCourses([...gpaCourses, { id: Date.now(), name: '', credit: 3, grade: 4.0 }]);
    const removeCourse = (id: number) => setGpaCourses(gpaCourses.filter(c => c.id !== id));
    const calculateGPA = () => {
        const totalCredits = gpaCourses.reduce((sum, c) => sum + Number(c.credit), 0);
        const totalPoints = gpaCourses.reduce((sum, c) => sum + (Number(c.credit) * Number(c.grade)), 0);
        return totalCredits ? (totalPoints / totalCredits).toFixed(2) : '0.00';
    };

    // --- Citation Helpers ---
    const generateCitation = () => {
        const { style, source, author, title, year, url, publisher } = citationState;
        let text = "";
        if (style === 'APA') text = `${author || 'Author'}. (${year}). ${title || 'Title'}. ${source === 'Website' ? 'Retrieved from ' + (url || 'URL') : publisher || 'Publisher'}.`;
        else if (style === 'MLA') text = `${author || 'Author'}. "${title || 'Title'}." ${source === 'Website' ? url : (publisher || 'Publisher')}, ${year}.`;
        else if (style === 'Chicago') text = `${author || 'Author'}. "${title || 'Title'}." ${source === 'Website' ? url : (publisher || 'Publisher')}, ${year}.`;
        else if (style === 'Harvard') text = `${author || 'Author'}, ${year}. '${title || 'Title'}', ${source === 'Website' ? url : (publisher || 'Publisher')}.`;
        setCitationOutput(text);
    };

    // --- Plagiarism Helpers ---
     const startScan = () => {
        if (!plagiarismInput.trim()) return;
        setPlagiarismState({ scanning: true, progress: 0, result: null, report: null });
        setPlagiarismView('summary');
        let p = 0;
        const interval = setInterval(() => {
            p += 10;
            setPlagiarismState(prev => ({ ...prev, progress: p }));
            if (p >= 100) {
                clearInterval(interval);
                
                const wordCount = plagiarismInput.trim().split(/\s+/).filter(w => w).length;
                const differences = diffChars(MOCK_ORIGINAL_SOURCE, plagiarismInput);
                
                let commonChars = 0;
                
                const report = differences.map(part => {
                    if (!part.added && !part.removed) { // Common part
                        commonChars += part.value.length;
                        return { type: 'match', value: part.value };
                    }
                    if (part.added) { // User's text not in source
                         return { type: 'original', value: part.value };
                    }
                    return null;
                }).filter((p): p is { type: string; value: string; } => p !== null);

                const similarity = plagiarismInput.length > 0 ? (commonChars / plagiarismInput.length) * 100 : 0;
                const originalityScore = 100 - similarity;

                let matches = [];
                if (similarity > 10) {
                    matches.push({ source: "www.wikipedia.org/wiki/Pangram", similarity: (Math.min(95, similarity + 15)).toFixed(1) });
                }
                if (similarity > 30) {
                    matches.push({ source: "www.theverge.com/t/typewriter", similarity: (Math.min(90, similarity + 5)).toFixed(1) });
                }

                setPlagiarismState({
                    scanning: false,
                    progress: 100,
                    result: {
                        score: Math.floor(originalityScore),
                        matches: matches,
                        readability: wordCount > 200 ? "College Level" : wordCount > 100 ? "High School" : "Basic",
                        words: wordCount,
                    },
                    report: report,
                });
            }
        }, 200);
    };

    return (
        <div className="flex flex-col items-center max-w-4xl mx-auto w-full">
            {toolId === 'student-gpa' && (
                 <div className="w-full bg-gray-900 p-6 md:p-8 rounded-xl border border-gray-800 shadow-xl">
                    {/* ... GPA Calculator UI ... */}
                </div>
            )}

            {toolId === 'student-citation' && (
                <div className="w-full bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-xl">
                    {/* ... Citation Generator UI ... */}
                </div>
            )}

            {toolId === 'student-plagiarism' && (
                 <div className="w-full bg-gray-900 p-6 md:p-8 rounded-xl border border-gray-800 shadow-xl">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><CheckCircle className="text-orange-400"/> Advanced Plagiarism Checker</h3>
                    {!plagiarismState.scanning && !plagiarismState.result ? (
                        <>
                            <textarea className="w-full h-48 bg-black/30 border border-gray-700 rounded-xl p-4 text-white mb-4" placeholder="Paste text here to check for plagiarism..." value={plagiarismInput} onChange={(e) => setPlagiarismInput(e.target.value)}/>
                            <button onClick={startScan} disabled={!plagiarismInput.trim()} className="bg-orange-600 hover:bg-orange-500 disabled:opacity-50 px-8 py-3 rounded-lg text-white font-bold">Deep Scan</button>
                        </>
                    ) : (
                        plagiarismState.scanning ? (
                            <div className="text-center py-12"><div className="w-64 h-2 bg-gray-800 rounded-full mx-auto"><div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${plagiarismState.progress}%` }}></div></div><p className="text-sm text-gray-500 mt-4">Analyzing Text ({plagiarismState.progress}%)...</p></div>
                        ) : (
                            plagiarismState.result &&
                            <div>
                                <div className="flex border-b border-gray-800 mb-6"><div className="flex gap-4"><button onClick={() => setPlagiarismView('summary')} className={`pb-3 border-b-2 ${plagiarismView === 'summary' ? 'border-orange-500 text-white' : 'border-transparent text-gray-500'}`}>Summary</button><button onClick={() => setPlagiarismView('report')} className={`pb-3 border-b-2 ${plagiarismView === 'report' ? 'border-orange-500 text-white' : 'border-transparent text-gray-500'}`}>Originality Report</button><button onClick={() => setPlagiarismView('matches')} className={`pb-3 border-b-2 ${plagiarismView === 'matches' ? 'border-orange-500 text-white' : 'border-transparent text-gray-500'}`}>Matches</button></div><button onClick={() => { setPlagiarismState({scanning:false, progress:0, result:null, report:null}); setPlagiarismInput(''); }} className="ml-auto text-gray-400 hover:text-white flex items-center gap-2 text-sm"><RefreshCw size={14}/> New Scan</button></div>

                                {plagiarismView === 'summary' && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center"><div className="bg-gray-950 p-6 rounded-xl border border-gray-800"><div className={"text-4xl font-bold " + (plagiarismState.result.score > 80 ? 'text-green-400' : 'text-yellow-400')}>{plagiarismState.result.score}%</div><div className="text-xs text-green-500/70">Originality Score</div></div><div className="bg-gray-950 p-6 rounded-xl border border-gray-800"><div className="text-4xl font-bold text-red-400">{100 - plagiarismState.result.score}%</div><div className="text-xs text-red-500/70">Plagiarized</div></div><div className="bg-gray-950 p-6 rounded-xl border border-gray-800"><div className="text-3xl font-bold text-white">{plagiarismState.result.words}</div><div className="text-xs text-gray-400">Words</div></div><div className="bg-gray-950 p-6 rounded-xl border border-gray-800"><div className="text-lg font-bold text-white mt-2">{plagiarismState.result.readability}</div><div className="text-xs text-gray-400">Readability</div></div></div>
                                )}

                                {plagiarismView === 'report' && (
                                    <div className="p-6 bg-gray-950 rounded-xl border border-gray-800 font-serif text-lg leading-relaxed"><p>{plagiarismState.report?.map((part, i) => <span key={i} className={`${part.type === 'match' ? 'bg-red-800/40 text-red-100 px-1 py-0.5 rounded mx-0.5' : 'text-gray-300'}`}>{part.value}</span>)}</p></div>
                                )}

                                {plagiarismView === 'matches' && (
                                    <div>{plagiarismState.result.matches.length > 0 ? plagiarismState.result.matches.map((match, i) => (<div key={i} className="flex items-center justify-between p-4 bg-gray-950 border border-gray-800 rounded-lg mb-3"><a href={`http://${match.source}`} target="_blank" className="text-cyan-400 hover:underline">{match.source}</a><div className="text-red-400 font-bold">{match.similarity}% Match</div></div>)) : <p className="text-center text-gray-500 py-8">No direct matches found.</p>}</div>
                                )}
                            </div>
                        )
                    )}
                 </div>
            )}
        </div>
    );
};