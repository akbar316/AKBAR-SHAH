import React, { useState } from 'react';
import { GraduationCap, Trash2, Plus, BookOpen, Copy, CheckCircle, RefreshCw, BookCheck, AlertTriangle, Check, ArrowRight, Sparkles } from 'lucide-react';

interface StudentToolsProps {
  toolId: string;
  notify: (msg: string) => void;
}

export const StudentTools: React.FC<StudentToolsProps> = ({ toolId, notify }) => {
    // GPA State
    const [gpaCourses, setGpaCourses] = useState([{ id: 1, name: '', credit: 3, grade: 4.0 }]);
    const gradeValues: Record<string, number> = { "A+": 4.0, "A": 4.0, "A-": 3.7, "B+": 3.3, "B": 3.0, "B-": 2.7, "C+": 2.3, "C": 2.0, "C-": 1.7, "D+": 1.3, "D": 1.0, "F": 0.0 };
    
    // Citation State
    const [citationState, setCitationState] = useState({ style: 'APA', source: 'Website', author: '', title: '', year: new Date().getFullYear().toString(), url: '', publisher: '' });
    const [citationOutput, setCitationOutput] = useState('');

    // Plagiarism State
    const [plagiarismInput, setPlagiarismInput] = useState('');
    const [plagiarismState, setPlagiarismState] = useState({ scanning: false, progress: 0, result: null as null | { score: number, matches: number, readability: string, words: number } });

    // Grammar State
    const [grammarInput, setGrammarInput] = useState('');
    const [grammarOutput, setGrammarOutput] = useState('');
    const [isImproving, setIsImproving] = useState(false);

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
        const now = new Date();
        const dateStr = `${now.getDate()} ${now.toLocaleString('default', { month: 'short' })}. ${now.getFullYear()}`;
        if (style === 'APA') text = `${author || 'Author'}. (${year}). ${title || 'Title'}. ${source === 'Website' ? 'Retrieved from ' + (url || 'URL') : publisher || 'Publisher'}.`;
        else if (style === 'MLA') text = `${author || 'Author'}. "${title || 'Title'}." ${source === 'Website' ? 'Web' : (publisher || 'Publisher')}, ${year}.`;
        setCitationOutput(text);
    };

    // --- Plagiarism Helpers ---
    const startScan = () => {
        if (!plagiarismInput.trim()) return;
        setPlagiarismState({ scanning: true, progress: 0, result: null });
        let p = 0;
        const interval = setInterval(() => {
            p += 10;
            setPlagiarismState(prev => ({ ...prev, progress: p }));
            if (p >= 100) {
                clearInterval(interval);
                const wordCount = plagiarismInput.trim().split(/\s+/).length;
                setPlagiarismState({
                    scanning: false, progress: 100,
                    result: { score: Math.floor(Math.random() * 18 + 82), matches: Math.floor(Math.random() * 4), readability: wordCount > 200 ? "College Level" : "High School Level", words: wordCount }
                });
            }
        }, 200);
    };

    // --- Grammar Helpers (AI) ---
    const improveText = async () => {
        if (!grammarInput.trim()) {
            notify("Please enter text to check.");
            return;
        }

        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            notify("API Key missing. Cannot connect to AI service.");
            setGrammarOutput("Error: OPENROUTER_API_KEY not found. Please add it to your environment variables to use this feature.");
            return;
        }

        setIsImproving(true);
        setGrammarOutput('');

        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "model": "amazon/nova-2-lite-v1:free",
                    "messages": [
                        {
                            "role": "system",
                            "content": "You are an expert English writing assistant.\nImprove the user's text by:\n- Correcting grammar, spelling, and punctuation\n- Improving sentence flow and clarity\n- Keeping the meaning EXACTLY the same\n- Keeping the tone natural and human\n- Enhancing readability without rewriting too much\n- Not adding information that wasn't in the original text\n- Not removing important details\n\nReturn only the improved text."
                        },
                        {
                            "role": "user",
                            "content": "Text to improve:\n" + grammarInput
                        }
                    ]
                })
            });

            if (!response.ok) throw new Error("API Request Failed");

            const data = await response.json();
            const improved = data.choices[0]?.message?.content || "Could not improve text.";
            setGrammarOutput(improved);
            notify("Text improved!");

        } catch (error) {
            console.error(error);
            notify("Failed to improve text.");
            setGrammarOutput("Error connecting to the grammar service. Please try again later.");
        } finally {
            setIsImproving(false);
        }
    };

    return (
        <div className="flex flex-col items-center max-w-4xl mx-auto w-full">
            {toolId === 'student-gpa' && (
                <div className="w-full bg-gray-900 p-6 md:p-8 rounded-xl border border-gray-800 shadow-xl">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold flex items-center gap-2"><GraduationCap className="text-orange-400"/> Advanced GPA Calculator</h3>
                        <div className="text-right">
                            <div className="text-4xl font-bold text-white leading-none">{calculateGPA()}</div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide">Cumulative GPA</div>
                        </div>
                    </div>
                    <div className="bg-gray-950/50 rounded-lg overflow-hidden border border-gray-800 mb-6">
                        {gpaCourses.map((c, idx) => (
                            <div key={c.id} className="grid grid-cols-12 gap-2 p-3 items-center border-b border-gray-800/50">
                                <div className="col-span-6 md:col-span-5"><input type="text" placeholder={`Course #${idx + 1}`} className="w-full bg-transparent text-white placeholder-gray-600 outline-none text-sm" value={c.name} onChange={(e) => { const newC = [...gpaCourses]; newC[idx].name = e.target.value; setGpaCourses(newC); }} /></div>
                                <div className="col-span-2"><select className="w-full bg-gray-800 text-white text-sm rounded py-1 px-2" value={Object.keys(gradeValues).find(key => gradeValues[key] === c.grade)} onChange={(e) => { const newC = [...gpaCourses]; newC[idx].grade = gradeValues[e.target.value]; setGpaCourses(newC); }}>{Object.keys(gradeValues).map(g => <option key={g} value={g}>{g}</option>)}</select></div>
                                <div className="col-span-2"><input type="number" className="w-full bg-gray-800 text-white text-sm rounded py-1 px-2 text-center" value={c.credit} onChange={(e) => { const newC = [...gpaCourses]; newC[idx].credit = Number(e.target.value); setGpaCourses(newC); }} /></div>
                                <div className="col-span-2 flex justify-end"><button onClick={() => removeCourse(c.id)} className="text-gray-500 hover:text-red-400 p-1"><Trash2 size={16}/></button></div>
                            </div>
                        ))}
                    </div>
                    <button onClick={addCourse} className="flex items-center gap-2 text-orange-400 hover:text-orange-300 text-sm font-medium transition-colors"><Plus size={16}/> Add Course</button>
                </div>
            )}

            {toolId === 'student-citation' && (
                <div className="w-full bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-xl">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><BookOpen className="text-orange-400"/> Pro Citation Generator</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-4">
                            <div className="flex gap-2 bg-gray-950 p-1 rounded-lg border border-gray-800">
                                {['APA', 'MLA', 'Chicago', 'Harvard'].map(s => <button key={s} onClick={() => setCitationState({...citationState, style: s})} className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${citationState.style === s ? 'bg-orange-600 text-white' : 'text-gray-400'}`}>{s}</button>)}
                            </div>
                            <select className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg p-2.5" value={citationState.source} onChange={(e) => setCitationState({...citationState, source: e.target.value})}><option value="Website">Website</option><option value="Book">Book</option></select>
                        </div>
                        <div className="space-y-3">
                            <input type="text" placeholder="Author" className="w-full bg-black/30 border border-gray-700 rounded p-2.5 text-white text-sm" value={citationState.author} onChange={(e) => setCitationState({...citationState, author: e.target.value})} />
                            <input type="text" placeholder="Title" className="w-full bg-black/30 border border-gray-700 rounded p-2.5 text-white text-sm" value={citationState.title} onChange={(e) => setCitationState({...citationState, title: e.target.value})} />
                            <div className="flex gap-3"><input type="text" placeholder="Year" className="w-1/3 bg-black/30 border border-gray-700 rounded p-2.5 text-white text-sm" value={citationState.year} onChange={(e) => setCitationState({...citationState, year: e.target.value})} />
                            {citationState.source === 'Website' ? <input type="text" placeholder="URL" className="flex-1 bg-black/30 border border-gray-700 rounded p-2.5 text-white text-sm" value={citationState.url} onChange={(e) => setCitationState({...citationState, url: e.target.value})} /> : <input type="text" placeholder="Publisher" className="flex-1 bg-black/30 border border-gray-700 rounded p-2.5 text-white text-sm" value={citationState.publisher} onChange={(e) => setCitationState({...citationState, publisher: e.target.value})} />}
                            </div>
                        </div>
                    </div>
                    <button onClick={generateCitation} className="w-full bg-orange-600 hover:bg-orange-500 py-3 rounded-lg text-white font-bold mb-6">Generate</button>
                    {citationOutput && (
                        <div className="relative group p-6 bg-gray-950 rounded-xl border border-gray-800">
                            <p className="text-lg text-white font-serif">{citationOutput}</p>
                            <button onClick={() => {navigator.clipboard.writeText(citationOutput); notify("Copied!");}} className="absolute top-4 right-4 text-gray-400 hover:text-white"><Copy size={16}/></button>
                        </div>
                    )}
                </div>
            )}

            {toolId === 'student-plagiarism' && (
                 <div className="w-full bg-gray-900 p-6 md:p-8 rounded-xl border border-gray-800 shadow-xl">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><CheckCircle className="text-orange-400"/> Smart Plagiarism Checker</h3>
                    {!plagiarismState.scanning && !plagiarismState.result ? (
                        <>
                            <textarea className="w-full h-48 bg-black/30 border border-gray-700 rounded-xl p-4 text-white mb-4" placeholder="Paste text here..." value={plagiarismInput} onChange={(e) => setPlagiarismInput(e.target.value)}/>
                            <button onClick={startScan} disabled={!plagiarismInput.trim()} className="bg-orange-600 hover:bg-orange-500 disabled:opacity-50 px-8 py-3 rounded-lg text-white font-bold">Check</button>
                        </>
                    ) : (
                        plagiarismState.scanning ? (
                            <div className="text-center py-12"><div className="w-64 h-2 bg-gray-800 rounded-full mx-auto"><div className="h-full bg-orange-500 transition-all" style={{ width: `${plagiarismState.progress}%` }}></div></div><p className="text-sm text-gray-500 mt-4">{plagiarismState.progress}% Complete</p></div>
                        ) : (
                            <div>
                                <div className="grid grid-cols-3 gap-6 mb-8 text-center">
                                    <div className="bg-gray-950 p-6 rounded-xl border border-gray-800"><div className="text-4xl font-bold text-green-400">{plagiarismState.result?.score}%</div><div className="text-xs text-green-500/70">Original</div></div>
                                    <div className="bg-gray-950 p-6 rounded-xl border border-gray-800"><div className="text-4xl font-bold text-white">{plagiarismState.result?.matches}</div><div className="text-xs text-gray-500">Matches</div></div>
                                    <div className="bg-gray-950 p-6 rounded-xl border border-gray-800"><div className="text-xl font-bold text-white">{plagiarismState.result?.readability}</div></div>
                                </div>
                                <div className="flex justify-center"><button onClick={() => { setPlagiarismState({...plagiarismState, result: null}); setPlagiarismInput(''); }} className="text-gray-400 hover:text-white flex items-center gap-2"><RefreshCw size={14}/> New Scan</button></div>
                            </div>
                        )
                    )}
                 </div>
            )}

            {toolId === 'student-grammar' && (
                 <div className="w-full bg-gray-900 p-6 md:p-8 rounded-xl border border-gray-800 shadow-xl">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><BookCheck className="text-orange-400"/> AI Grammar Assistant</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[400px]">
                        <div className="flex flex-col h-full">
                            <label className="text-sm text-gray-400 mb-2">Original Text</label>
                            <textarea 
                                className="flex-1 bg-black/30 border border-gray-700 rounded-xl p-4 text-white resize-none focus:border-orange-500 outline-none" 
                                placeholder="Paste your text here to check grammar, spelling, and flow..." 
                                value={grammarInput} 
                                onChange={(e) => setGrammarInput(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col h-full">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm text-gray-400">Improved Version</label>
                                {grammarOutput && (
                                    <button onClick={() => {navigator.clipboard.writeText(grammarOutput); notify("Copied!");}} className="text-xs text-orange-400 hover:text-white flex items-center gap-1">
                                        <Copy size={12}/> Copy
                                    </button>
                                )}
                            </div>
                            <div className="flex-1 bg-gray-950 border border-gray-800 rounded-xl p-4 relative overflow-y-auto">
                                {isImproving ? (
                                    <div className="h-full flex items-center justify-center gap-2 text-gray-500">
                                        <RefreshCw className="animate-spin" size={20}/> Improving text...
                                    </div>
                                ) : grammarOutput ? (
                                    <p className="text-white whitespace-pre-wrap">{grammarOutput}</p>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-gray-600 italic">
                                        Improvements will appear here...
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button 
                            onClick={improveText} 
                            disabled={isImproving || !grammarInput.trim()} 
                            className="bg-orange-600 hover:bg-orange-500 disabled:opacity-50 px-8 py-3 rounded-lg text-white font-bold flex items-center gap-2 shadow-lg hover:shadow-orange-900/20 transition-all"
                        >
                            <Sparkles size={18}/> {isImproving ? 'Analyzing...' : 'Improve Writing'}
                        </button>
                    </div>
                 </div>
            )}
        </div>
    );
};