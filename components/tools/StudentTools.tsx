

import React, { useState } from 'react';
import { GraduationCap, Trash2, Plus, BookOpen, Copy, CheckCircle, RefreshCw, BookCheck, AlertTriangle, Check, ArrowRight, Sparkles, SlidersHorizontal, PenTool, StickyNote, FileUp, FileText, FileQuestion, HelpCircle } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

// Fix for PDF.js worker
const pdfjs = (pdfjsLib as any).default || pdfjsLib;
try {
  if (pdfjs && !pdfjs.GlobalWorkerOptions.workerSrc) {
      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
  }
} catch (e) {
  console.warn("Failed to set PDF worker source", e);
}

interface StudentToolsProps {
  toolId: string;
  notify: (msg: string) => void;
}

export const StudentTools: React.FC<StudentToolsProps> = ({ toolId, notify }) => {
    
    // Question Generator State
    const [questionInput, setQuestionInput] = useState('');
    const [questionFile, setQuestionFile] = useState<File | null>(null);
    const [questionType, setQuestionType] = useState('Multiple Choice (MCQ)');
    const [questionCount, setQuestionCount] = useState(10);
    const [questionDifficulty, setQuestionDifficulty] = useState('Medium');
    const [questionOutput, setQuestionOutput] = useState('');
    const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);

    // Paraphrasing State (Replaces Plagiarism)
    const [paraphraseInput, setParaphraseInput] = useState('');
    const [paraphraseOutput, setParaphraseOutput] = useState('');
    const [paraphraseMode, setParaphraseMode] = useState('Standard');
    const [isParaphrasing, setIsParaphrasing] = useState(false);

    // Grammar State
    const [grammarInput, setGrammarInput] = useState('');
    const [grammarOutput, setGrammarOutput] = useState('');
    const [grammarTone, setGrammarTone] = useState('Standard');
    const [grammarFocus, setGrammarFocus] = useState('Fix Errors');
    const [isImproving, setIsImproving] = useState(false);

    // Writer State
    const [writerTopic, setWriterTopic] = useState('');
    const [writerType, setWriterType] = useState('Essay');
    const [writerTone, setWriterTone] = useState('Academic');
    const [writerLength, setWriterLength] = useState('Medium');
    const [writerOutput, setWriterOutput] = useState('');
    const [isWriting, setIsWriting] = useState(false);

    // Lecture Notes State
    const [notesInput, setNotesInput] = useState('');
    const [notesFile, setNotesFile] = useState<File | null>(null);
    const [notesMode, setNotesMode] = useState('Bullet Points');
    const [notesOutput, setNotesOutput] = useState('');
    const [isSummarizing, setIsSummarizing] = useState(false);

    // Helper to safely get API Key from various environment configurations
    const getApiKey = () => {
        // @ts-ignore - Handle Vite
        if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_OPENROUTER_API_KEY) {
            // @ts-ignore
            return import.meta.env.VITE_OPENROUTER_API_KEY;
        }
        // @ts-ignore - Handle CRA/Next/Standard
        if (typeof process !== 'undefined' && process.env) {
            // @ts-ignore
            if (process.env.REACT_APP_OPENROUTER_API_KEY) return process.env.REACT_APP_OPENROUTER_API_KEY;
            // @ts-ignore
            if (process.env.NEXT_PUBLIC_OPENROUTER_API_KEY) return process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
            // @ts-ignore
            if (process.env.OPENROUTER_API_KEY) return process.env.OPENROUTER_API_KEY;
        }
        return '';
    };

    // --- PDF Extraction Helper ---
    const extractTextFromPdf = async (file: File): Promise<string> => {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjs.getDocument(arrayBuffer).promise;
            let fullText = "";
            const maxPages = Math.min(pdf.numPages, 15); // Limit to 15 pages for API ease
            
            for (let i = 1; i <= maxPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                const strings = content.items.map((item: any) => item.str);
                fullText += strings.join(" ") + "\n";
            }
            
            if (pdf.numPages > 15) fullText += "\n[...Text truncated after 15 pages...]";
            return fullText;
        } catch (e) {
            console.error(e);
            throw new Error("PDF Extraction Failed");
        }
    };

    const handleNotesPdfUpload = async (file: File) => {
        try {
            const text = await extractTextFromPdf(file);
            setNotesInput(text);
            setNotesFile(file);
            notify("PDF Text Extracted!");
        } catch (e) {
            notify("Failed to extract text from PDF");
        }
    };

    const handleQuestionsPdfUpload = async (file: File) => {
        try {
            const text = await extractTextFromPdf(file);
            setQuestionInput(text);
            setQuestionFile(file);
            notify("PDF Text Extracted!");
        } catch (e) {
            notify("Failed to extract text from PDF");
        }
    };

    // --- Note Summarizer Helpers (AI) ---
    const handleGenerateNotes = async () => {
        if (!notesInput.trim()) {
            notify("Please enter text or upload a PDF.");
            return;
        }

        const apiKey = getApiKey();
        if (!apiKey) {
            notify("API Key missing.");
            setNotesOutput("Error: VITE_OPENROUTER_API_KEY missing.");
            return;
        }

        setIsSummarizing(true);
        setNotesOutput('');

        try {
            let promptInstruction = "";
            switch (notesMode) {
                case 'Bullet Points': promptInstruction = "Summarize the content into concise, easy-to-read bullet points. Highlight key takeaways."; break;
                case 'Study Guide': promptInstruction = "Create a structured study guide with Main Topics, Key Terminology definitions, and Important Concepts."; break;
                case 'Q&A': promptInstruction = "Generate a list of 10-15 practice questions and answers based on the text to help test understanding."; break;
                case 'Key Concepts': promptInstruction = "Extract the top 5 most important concepts and explain them simply."; break;
                default: promptInstruction = "Summarize the text.";
            }

            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "model": "amazon/nova-2-lite-v1:free",
                    "messages": [
                        { "role": "system", "content": `You are an expert Academic Study Assistant. Task: ${promptInstruction}. Format using Markdown.` },
                        { "role": "user", "content": notesInput }
                    ]
                })
            });

            if (!response.ok) throw new Error("API Request Failed");
            const data = await response.json();
            const result = data.choices[0]?.message?.content || "Could not generate notes.";
            setNotesOutput(result);
            notify("Notes generated successfully!");

        } catch (error) {
            console.error(error);
            notify("Failed to generate notes.");
            setNotesOutput("Error connecting to service. Please try again later.");
        } finally {
            setIsSummarizing(false);
        }
    };

    // --- Question Generator Helpers (AI) ---
    const handleGenerateQuestions = async () => {
        if (!questionInput.trim()) {
            notify("Please enter text or upload a PDF.");
            return;
        }

        const apiKey = getApiKey();
        if (!apiKey) {
            notify("API Key missing.");
            setQuestionOutput("Error: VITE_OPENROUTER_API_KEY missing.");
            return;
        }

        setIsGeneratingQuestions(true);
        setQuestionOutput('');

        try {
            const systemInstruction = `You are a strict Exam Generator.
            Task: Generate ${questionCount} ${questionType} questions based on the user's text.
            Difficulty: ${questionDifficulty}.
            
            Formatting Rules:
            1. Use Markdown.
            2. If 'Multiple Choice', provide options A, B, C, D for each question.
            3. Provide an ANSWER KEY section at the very end of the response.
            4. Ensure questions are directly relevant to the text provided.
            
            Example Output Format for MCQ:
            1. Question text?
            A) Option
            B) Option
            ...
            
            ### Answer Key
            1. A
            2. C
            ...`;

            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "model": "amazon/nova-2-lite-v1:free",
                    "messages": [
                        { "role": "system", "content": systemInstruction },
                        { "role": "user", "content": questionInput }
                    ]
                })
            });

            if (!response.ok) throw new Error("API Request Failed");
            const data = await response.json();
            const result = data.choices[0]?.message?.content || "Could not generate questions.";
            setQuestionOutput(result);
            notify("Questions generated!");

        } catch (error) {
            console.error(error);
            notify("Failed to generate questions.");
            setQuestionOutput("Error connecting to service. Please try again later.");
        } finally {
            setIsGeneratingQuestions(false);
        }
    };

    // --- Paraphrase Helpers (AI) ---
    const handleParaphrase = async () => {
        if (!paraphraseInput.trim()) {
            notify("Please enter text to paraphrase.");
            return;
        }

        const apiKey = getApiKey();
        if (!apiKey) {
            notify("API Key missing.");
            setParaphraseOutput("Error: VITE_OPENROUTER_API_KEY missing.");
            return;
        }

        setIsParaphrasing(true);
        setParaphraseOutput('');

        try {
            const systemInstruction = `You are an expert Content Rewriter and Paraphrasing Tool.
            Task: Rewrite the user's text to make it unique and plagiarism-free while maintaining the original meaning.
            Mode: ${paraphraseMode}
            
            Guidelines:
            - Change vocabulary and sentence structure significantly.
            - Improve clarity and flow.
            - Do not omit key information.
            - Output ONLY the rewritten text. No conversational filler.`;

            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "model": "amazon/nova-2-lite-v1:free",
                    "messages": [
                        { "role": "system", "content": systemInstruction },
                        { "role": "user", "content": paraphraseInput }
                    ]
                })
            });

            if (!response.ok) throw new Error("API Request Failed");
            const data = await response.json();
            const result = data.choices[0]?.message?.content || "Could not paraphrase content.";
            setParaphraseOutput(result);
            notify("Text paraphrased successfully!");

        } catch (error) {
            console.error(error);
            notify("Failed to paraphrase.");
            setParaphraseOutput("Error connecting to service. Please try again later.");
        } finally {
            setIsParaphrasing(false);
        }
    };

    // --- Writer Helpers (AI) ---
    const handleWrite = async () => {
        if (!writerTopic.trim()) {
            notify("Please enter a topic or prompt.");
            return;
        }

        const apiKey = getApiKey();
        if (!apiKey) {
            notify("API Key missing. Cannot connect to AI service.");
            setWriterOutput("Error: VITE_OPENROUTER_API_KEY not found. Please add it to your environment variables to use this feature.");
            return;
        }

        setIsWriting(true);
        setWriterOutput('');

        try {
            const systemInstruction = `You are an elite Academic AI Writer. 
            Task: Write a ${writerLength} ${writerType} about the user's topic.
            Settings:
            - Tone: ${writerTone}
            - Structure: Well-organized with clear introduction, body paragraphs, and conclusion (if applicable).
            - Style: Use transition words and vocabulary suitable for the selected tone.
            
            Format your response with proper Markdown (e.g. # Headings, **bold**, etc).
            Do not include conversational filler like "Here is your essay". Start directly with the content.`;

            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "model": "amazon/nova-2-lite-v1:free",
                    "messages": [
                        { "role": "system", "content": systemInstruction },
                        { "role": "user", "content": writerTopic }
                    ]
                })
            });

            if (!response.ok) throw new Error("API Request Failed");

            const data = await response.json();
            const result = data.choices[0]?.message?.content || "Could not generate content.";
            setWriterOutput(result);
            notify("Draft generated successfully!");

        } catch (error) {
            console.error(error);
            notify("Failed to generate content.");
            setWriterOutput("Error connecting to the service. Please try again later.");
        } finally {
            setIsWriting(false);
        }
    };

    // --- Grammar Helpers (AI) ---
    const improveText = async () => {
        if (!grammarInput.trim()) {
            notify("Please enter text to check.");
            return;
        }

        const apiKey = getApiKey();
        if (!apiKey) {
            notify("API Key missing. Cannot connect to AI service.");
            setGrammarOutput("Error: VITE_OPENROUTER_API_KEY not found. Please add it to your environment variables to use this feature.");
            return;
        }

        setIsImproving(true);
        setGrammarOutput('');

        try {
            const systemInstruction = `You are an elite AI Editor. Your task is to rewrite the user's text based on these settings:
            - Tone: ${grammarTone}
            - Goal: ${grammarFocus}
            
            Guidelines:
            1. If Goal is 'Fix Errors': Strictly correct grammar, spelling, and punctuation. Maintain original flow.
            2. If Goal is 'Improve Clarity': Fix errors and rephrase awkward sentences for better readability.
            3. If Goal is 'Make Concise': Fix errors and condense the text by removing fluff.
            4. Adjust vocabulary to match the requested Tone (${grammarTone}).
            5. Return ONLY the corrected text. Do NOT add conversational filler or explanations.`;

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
                            "content": systemInstruction
                        },
                        {
                            "role": "user",
                            "content": grammarInput
                        }
                    ]
                })
            });

            if (!response.ok) throw new Error("API Request Failed");

            const data = await response.json();
            const improved = data.choices[0]?.message?.content || "Could not improve text.";
            setGrammarOutput(improved);
            notify("Text processed successfully!");

        } catch (error) {
            console.error(error);
            notify("Failed to process text.");
            setGrammarOutput("Error connecting to the service. Please try again later.");
        } finally {
            setIsImproving(false);
        }
    };

    return (
        <div className="flex flex-col items-center max-w-4xl mx-auto w-full">
            
            {toolId === 'student-notes' && (
                <div className="w-full bg-gray-900 p-6 md:p-8 rounded-xl border border-gray-800 shadow-xl">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><StickyNote className="text-orange-400"/> Lecture Notes & PDF Summarizer</h3>
                    
                    {/* Controls */}
                    <div className="mb-6">
                        <label className="text-xs text-gray-500 uppercase mb-2 block">Generation Mode</label>
                        <div className="flex flex-wrap gap-2">
                            {['Bullet Points', 'Study Guide', 'Q&A', 'Key Concepts'].map(mode => (
                                <button 
                                    key={mode}
                                    onClick={() => setNotesMode(mode)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${notesMode === mode ? 'bg-orange-600 text-white' : 'bg-black/40 text-gray-400 border border-gray-700 hover:border-gray-500'}`}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[400px]">
                        <div className="flex flex-col h-full gap-4">
                            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-700 rounded-xl bg-black/30 hover:bg-black/50 hover:border-orange-500/50 cursor-pointer transition-all group">
                                <FileUp className="text-gray-500 group-hover:text-orange-400 mb-2" size={24}/>
                                <span className="text-sm text-gray-400 group-hover:text-white font-medium">Upload PDF Notes</span>
                                <input type="file" accept=".pdf" className="hidden" onChange={(e) => e.target.files && handleNotesPdfUpload(e.target.files[0])} />
                            </label>
                            
                            <div className="flex-1 flex flex-col">
                                <label className="text-sm text-gray-400 mb-2 flex justify-between">
                                    <span>Or Paste Text</span>
                                    {notesFile && <span className="text-orange-400 text-xs flex items-center gap-1"><CheckCircle size={10}/> {notesFile.name} loaded</span>}
                                </label>
                                <textarea 
                                    className="flex-1 bg-black/30 border border-gray-700 rounded-xl p-4 text-white resize-none focus:border-orange-500 outline-none font-sans leading-relaxed custom-scrollbar text-sm" 
                                    placeholder="Paste lecture notes, chapter text, or meeting minutes here..." 
                                    value={notesInput} 
                                    onChange={(e) => setNotesInput(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col h-full">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm text-gray-400">Study Material Output</label>
                                {notesOutput && (
                                    <button onClick={() => {navigator.clipboard.writeText(notesOutput); notify("Copied!");}} className="text-xs text-orange-400 hover:text-white flex items-center gap-1">
                                        <Copy size={12}/> Copy
                                    </button>
                                )}
                            </div>
                            <div className="flex-1 bg-gray-950 border border-gray-800 rounded-xl p-6 relative overflow-y-auto custom-scrollbar">
                                {isSummarizing ? (
                                    <div className="h-full flex flex-col items-center justify-center gap-3 text-gray-500">
                                        <RefreshCw className="animate-spin text-orange-400" size={24}/> 
                                        <span className="text-sm">Analyzing notes...</span>
                                    </div>
                                ) : notesOutput ? (
                                    <div className="prose prose-invert prose-sm max-w-none">
                                        <div className="whitespace-pre-wrap leading-relaxed text-gray-300">{notesOutput}</div>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-700">
                                        <FileText size={32} className="mb-3 opacity-20"/>
                                        <p className="text-sm italic">Generated notes will appear here...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleGenerateNotes} 
                        disabled={isSummarizing || !notesInput.trim()}
                        className="w-full mt-6 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 py-3 rounded-lg text-white font-bold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-orange-900/20"
                    >
                        {isSummarizing ? 'Processing...' : 'Generate Study Notes'}
                    </button>
                 </div>
            )}

            {toolId === 'student-questions' && (
                <div className="w-full bg-gray-900 p-6 md:p-8 rounded-xl border border-gray-800 shadow-xl">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><FileQuestion className="text-orange-400"/> AI Question & Quiz Generator</h3>
                    
                    {/* Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div>
                            <label className="block text-xs text-gray-500 uppercase mb-2">Question Type</label>
                            <select 
                                value={questionType} 
                                onChange={(e) => setQuestionType(e.target.value)}
                                className="w-full bg-black/40 border border-gray-700 text-gray-300 text-sm rounded-lg p-2.5 outline-none focus:border-orange-500"
                            >
                                <option>Multiple Choice (MCQ)</option>
                                <option>Short Answer</option>
                                <option>Long Essay</option>
                                <option>Mixed</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 uppercase mb-2">Difficulty</label>
                            <select 
                                value={questionDifficulty} 
                                onChange={(e) => setQuestionDifficulty(e.target.value)}
                                className="w-full bg-black/40 border border-gray-700 text-gray-300 text-sm rounded-lg p-2.5 outline-none focus:border-orange-500"
                            >
                                <option>Easy</option>
                                <option>Medium</option>
                                <option>Hard</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 uppercase mb-2">Count</label>
                            <input 
                                type="number" 
                                min="1" max="20"
                                value={questionCount} 
                                onChange={(e) => setQuestionCount(Number(e.target.value))}
                                className="w-full bg-black/40 border border-gray-700 text-gray-300 text-sm rounded-lg p-2.5 outline-none focus:border-orange-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[400px]">
                        <div className="flex flex-col h-full gap-4">
                            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-700 rounded-xl bg-black/30 hover:bg-black/50 hover:border-orange-500/50 cursor-pointer transition-all group">
                                <FileUp className="text-gray-500 group-hover:text-orange-400 mb-2" size={24}/>
                                <span className="text-sm text-gray-400 group-hover:text-white font-medium">Upload PDF Chapter/Notes</span>
                                <input type="file" accept=".pdf" className="hidden" onChange={(e) => e.target.files && handleQuestionsPdfUpload(e.target.files[0])} />
                            </label>
                            
                            <div className="flex-1 flex flex-col">
                                <label className="text-sm text-gray-400 mb-2 flex justify-between">
                                    <span>Or Paste Text</span>
                                    {questionFile && <span className="text-orange-400 text-xs flex items-center gap-1"><CheckCircle size={10}/> {questionFile.name} loaded</span>}
                                </label>
                                <textarea 
                                    className="flex-1 bg-black/30 border border-gray-700 rounded-xl p-4 text-white resize-none focus:border-orange-500 outline-none font-sans leading-relaxed custom-scrollbar text-sm" 
                                    placeholder="Paste the chapter text, article, or notes you want to generate questions from..." 
                                    value={questionInput} 
                                    onChange={(e) => setQuestionInput(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col h-full">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm text-gray-400">Generated Quiz</label>
                                {questionOutput && (
                                    <button onClick={() => {navigator.clipboard.writeText(questionOutput); notify("Copied!");}} className="text-xs text-orange-400 hover:text-white flex items-center gap-1">
                                        <Copy size={12}/> Copy
                                    </button>
                                )}
                            </div>
                            <div className="flex-1 bg-gray-950 border border-gray-800 rounded-xl p-6 relative overflow-y-auto custom-scrollbar">
                                {isGeneratingQuestions ? (
                                    <div className="h-full flex flex-col items-center justify-center gap-3 text-gray-500">
                                        <RefreshCw className="animate-spin text-orange-400" size={24}/> 
                                        <span className="text-sm">Creating questions...</span>
                                    </div>
                                ) : questionOutput ? (
                                    <div className="prose prose-invert prose-sm max-w-none">
                                        <div className="whitespace-pre-wrap leading-relaxed text-gray-300">{questionOutput}</div>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-700">
                                        <HelpCircle size={32} className="mb-3 opacity-20"/>
                                        <p className="text-sm italic">Questions & Answer Key will appear here...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleGenerateQuestions} 
                        disabled={isGeneratingQuestions || !questionInput.trim()}
                        className="w-full mt-6 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 py-3 rounded-lg text-white font-bold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-orange-900/20"
                    >
                        {isGeneratingQuestions ? 'Generating...' : 'Generate Questions'}
                    </button>
                </div>
            )}

            {toolId === 'student-paraphrase' && (
                 <div className="w-full bg-gray-900 p-6 md:p-8 rounded-xl border border-gray-800 shadow-xl">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><RefreshCw className="text-orange-400"/> AI Paraphrasing Tool</h3>
                    
                    {/* Controls */}
                    <div className="mb-4">
                        <label className="text-xs text-gray-500 uppercase mb-2 block">Rewriting Mode</label>
                        <div className="flex flex-wrap gap-2">
                            {['Standard', 'Formal', 'Academic', 'Simple', 'Creative'].map(mode => (
                                <button 
                                    key={mode}
                                    onClick={() => setParaphraseMode(mode)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${paraphraseMode === mode ? 'bg-orange-600 text-white' : 'bg-black/40 text-gray-400 border border-gray-700 hover:border-gray-500'}`}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[400px]">
                        <div className="flex flex-col h-full">
                            <label className="text-sm text-gray-400 mb-2">Original Text</label>
                            <textarea 
                                className="flex-1 bg-black/30 border border-gray-700 rounded-xl p-4 text-white resize-none focus:border-orange-500 outline-none font-sans leading-relaxed custom-scrollbar" 
                                placeholder="Paste text to rewrite..." 
                                value={paraphraseInput} 
                                onChange={(e) => setParaphraseInput(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col h-full">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm text-gray-400">Paraphrased Output</label>
                                {paraphraseOutput && (
                                    <button onClick={() => {navigator.clipboard.writeText(paraphraseOutput); notify("Copied!");}} className="text-xs text-orange-400 hover:text-white flex items-center gap-1">
                                        <Copy size={12}/> Copy
                                    </button>
                                )}
                            </div>
                            <div className="flex-1 bg-gray-950 border border-gray-800 rounded-xl p-4 relative overflow-y-auto custom-scrollbar">
                                {isParaphrasing ? (
                                    <div className="h-full flex flex-col items-center justify-center gap-3 text-gray-500">
                                        <RefreshCw className="animate-spin text-orange-400" size={24}/> 
                                        <span className="text-sm">Rewriting content...</span>
                                    </div>
                                ) : paraphraseOutput ? (
                                    <p className="text-white whitespace-pre-wrap leading-relaxed">{paraphraseOutput}</p>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-700">
                                        <RefreshCw size={32} className="mb-3 opacity-20"/>
                                        <p className="text-sm italic">Rewritten text will appear here...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleParaphrase} 
                        disabled={isParaphrasing || !paraphraseInput.trim()}
                        className="w-full mt-6 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 py-3 rounded-lg text-white font-bold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-orange-900/20"
                    >
                        {isParaphrasing ? 'Paraphrasing...' : 'Paraphrase Now'}
                    </button>
                 </div>
            )}

            {toolId === 'student-writer' && (
                <div className="w-full bg-gray-900 p-6 md:p-8 rounded-xl border border-gray-800 shadow-xl">
                    <h3 className="text-xl font-bold flex items-center gap-2 mb-6"><PenTool className="text-orange-400"/> AI Essay & Assignment Writer</h3>

                    {/* Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div>
                            <label className="block text-xs text-gray-500 uppercase mb-2">Content Type</label>
                            <select 
                                value={writerType} 
                                onChange={(e) => setWriterType(e.target.value)}
                                className="w-full bg-black/40 border border-gray-700 text-gray-300 text-sm rounded-lg p-2.5 outline-none focus:border-orange-500"
                            >
                                <option>Essay</option>
                                <option>Assignment</option>
                                <option>Report</option>
                                <option>Paragraph</option>
                                <option>Summary</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 uppercase mb-2">Tone</label>
                            <select 
                                value={writerTone} 
                                onChange={(e) => setWriterTone(e.target.value)}
                                className="w-full bg-black/40 border border-gray-700 text-gray-300 text-sm rounded-lg p-2.5 outline-none focus:border-orange-500"
                            >
                                <option>Academic</option>
                                <option>Professional</option>
                                <option>Persuasive</option>
                                <option>Creative</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 uppercase mb-2">Length</label>
                            <select 
                                value={writerLength} 
                                onChange={(e) => setWriterLength(e.target.value)}
                                className="w-full bg-black/40 border border-gray-700 text-gray-300 text-sm rounded-lg p-2.5 outline-none focus:border-orange-500"
                            >
                                <option value="Short">Short (~250 words)</option>
                                <option value="Medium">Medium (~500 words)</option>
                                <option value="Long">Long (~1000 words)</option>
                            </select>
                        </div>
                    </div>

                    {/* Input */}
                    <div className="mb-6">
                        <label className="block text-xs text-gray-500 uppercase mb-2">Topic or Prompt</label>
                        <textarea
                            value={writerTopic}
                            onChange={(e) => setWriterTopic(e.target.value)}
                            placeholder="e.g. The impact of artificial intelligence on modern education..."
                            className="w-full bg-black/30 border border-gray-700 rounded-xl p-4 text-white resize-none focus:border-orange-500 outline-none h-32"
                        />
                    </div>

                    {/* Button */}
                    <button 
                        onClick={handleWrite} 
                        disabled={isWriting || !writerTopic.trim()}
                        className="w-full bg-orange-600 hover:bg-orange-500 disabled:opacity-50 py-3 rounded-lg text-white font-bold transition-all flex items-center justify-center gap-2 mb-8 shadow-lg shadow-orange-900/20"
                    >
                        {isWriting ? <RefreshCw className="animate-spin" size={18}/> : <Sparkles size={18}/>}
                        {isWriting ? 'Generating Draft...' : 'Generate Content'}
                    </button>

                    {/* Output */}
                    {(writerOutput) && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="text-sm font-medium text-gray-400 uppercase">Generated Draft</h4>
                                <button onClick={() => {navigator.clipboard.writeText(writerOutput); notify("Draft Copied!");}} className="text-xs text-orange-400 hover:text-white flex items-center gap-1">
                                    <Copy size={12}/> Copy Text
                                </button>
                            </div>
                            <div className="bg-[#0a0e14] rounded-xl border border-gray-800 p-6 relative overflow-hidden">
                                <div className="whitespace-pre-wrap font-serif text-gray-300 leading-relaxed text-lg">
                                    {writerOutput}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {toolId === 'student-grammar' && (
                 <div className="w-full bg-gray-900 p-6 md:p-8 rounded-xl border border-gray-800 shadow-xl">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <h3 className="text-xl font-bold flex items-center gap-2"><BookCheck className="text-orange-400"/> AI Grammar Assistant</h3>
                        
                        {/* Configuration Controls */}
                        <div className="flex flex-wrap gap-3">
                            <div className="relative">
                                <select 
                                    value={grammarTone} 
                                    onChange={(e) => setGrammarTone(e.target.value)}
                                    className="bg-black/40 border border-gray-700 text-gray-300 text-xs rounded-lg py-2 pl-3 pr-8 appearance-none cursor-pointer hover:border-orange-500/50 focus:border-orange-500 outline-none"
                                >
                                    <option value="Standard">Standard Tone</option>
                                    <option value="Professional">Professional</option>
                                    <option value="Academic">Academic</option>
                                    <option value="Casual">Casual</option>
                                </select>
                                <SlidersHorizontal size={12} className="absolute right-3 top-2.5 text-gray-500 pointer-events-none"/>
                            </div>
                            <div className="relative">
                                <select 
                                    value={grammarFocus} 
                                    onChange={(e) => setGrammarFocus(e.target.value)}
                                    className="bg-black/40 border border-gray-700 text-gray-300 text-xs rounded-lg py-2 pl-3 pr-8 appearance-none cursor-pointer hover:border-orange-500/50 focus:border-orange-500 outline-none"
                                >
                                    <option value="Fix Errors">Fix Grammar Only</option>
                                    <option value="Improve Clarity">Improve Clarity</option>
                                    <option value="Make Concise">Make Concise</option>
                                </select>
                                <Sparkles size={12} className="absolute right-3 top-2.5 text-gray-500 pointer-events-none"/>
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[500px]">
                        <div className="flex flex-col h-full">
                            <label className="text-sm text-gray-400 mb-2">Original Text</label>
                            <textarea 
                                className="flex-1 bg-black/30 border border-gray-700 rounded-xl p-4 text-white resize-none focus:border-orange-500 outline-none font-sans leading-relaxed" 
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
                            <div className="flex-1 bg-gray-950 border border-gray-800 rounded-xl p-4 relative overflow-y-auto custom-scrollbar">
                                {isImproving ? (
                                    <div className="h-full flex flex-col items-center justify-center gap-3 text-gray-500">
                                        <RefreshCw className="animate-spin text-orange-400" size={24}/> 
                                        <span className="text-sm">Polishing your writing...</span>
                                    </div>
                                ) : grammarOutput ? (
                                    <p className="text-white whitespace-pre-wrap leading-relaxed">{grammarOutput}</p>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-700">
                                        <Sparkles size={32} className="mb-3 opacity-20"/>
                                        <p className="text-sm italic">Improvements will appear here...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-between items-center">
                        <div className="text-xs text-gray-500 hidden md:block">
                            Uses advanced AI to maintain your meaning while fixing errors.
                        </div>
                        <div className="flex gap-3 w-full md:w-auto">
                            <button 
                                onClick={() => {setGrammarInput(''); setGrammarOutput('');}}
                                disabled={isImproving || !grammarInput}
                                className="px-4 py-3 rounded-lg text-gray-400 hover:text-white font-medium text-sm transition-colors"
                            >
                                Clear
                            </button>
                            <button 
                                onClick={improveText} 
                                disabled={isImproving || !grammarInput.trim()} 
                                className="flex-1 md:flex-none bg-orange-600 hover:bg-orange-500 disabled:opacity-50 px-8 py-3 rounded-lg text-white font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-orange-900/20 transition-all"
                            >
                                <Check size={18}/> {isImproving ? 'Processing...' : 'Fix & Improve'}
                            </button>
                        </div>
                    </div>
                 </div>
            )}
        </div>
    );
};
