
import React, { useState, useRef } from 'react';
import { GraduationCap, Trash2, Plus, BookOpen, Copy, CheckCircle, RefreshCw, BookCheck, AlertTriangle, Check, ArrowRight, Sparkles, SlidersHorizontal, StickyNote, FileUp, FileText, FileQuestion, HelpCircle, Image as ImageIcon, X, FileSpreadsheet, Download, File as FileIcon } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import katex from 'katex';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { getAiConfig } from '../../utils/ai';

// Fix for PDF.js worker
const pdfjs = (pdfjsLib as any).default || pdfjsLib;
try {
  if (pdfjs && !pdfjs.GlobalWorkerOptions.workerSrc) {
      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
  }
} catch (e) {
  console.warn("Failed to set PDF worker source", e);
}

// --- Markdown Renderer Component ---
// Updated to use KaTeX for math rendering
const MarkdownRenderer = ({ content }: { content: string }) => {
    const processContent = (text: string) => {
        if (!text) return '';
        
        // 1. Extract and render Block Math $$...$$
        const blockMath: string[] = [];
        let processedText = text.replace(/\$\$([\s\S]*?)\$\$/g, (match, equation) => {
            try {
                // Use KaTeX to render
                const rendered = katex.renderToString(equation, { 
                    displayMode: true, 
                    throwOnError: false,
                    output: 'html'
                });
                blockMath.push(`<div class="my-6 flex justify-center overflow-x-auto p-2">${rendered}</div>`);
                return `__BLOCK_MATH_${blockMath.length - 1}__`;
            } catch (e) {
                return match;
            }
        });

        // 2. Extract and render Inline Math $...$
        const inlineMath: string[] = [];
        processedText = processedText.replace(/\$([^$\n]+?)\$/g, (match, equation) => {
            try {
                const rendered = katex.renderToString(equation, { 
                    displayMode: false, 
                    throwOnError: false,
                    output: 'html'
                });
                inlineMath.push(rendered);
                return `__INLINE_MATH_${inlineMath.length - 1}__`;
            } catch (e) {
                return match;
            }
        });

        // 3. Process Markdown Lines
        const lines = processedText.split('\n');
        let html = '';
        let inCodeBlock = false;

        lines.forEach((line, index) => {
            let cleanLine = line.trim();

            // Handle Code Blocks
            if (cleanLine.startsWith('```')) {
                inCodeBlock = !inCodeBlock;
                html += inCodeBlock 
                    ? '<div class="bg-black/30 p-4 rounded-lg my-4 overflow-x-auto font-mono text-sm text-gray-300 border border-gray-700">' 
                    : '</div>';
                return;
            }
            if (inCodeBlock) {
                const safeLine = cleanLine.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
                html += `<div class="whitespace-pre">${safeLine}</div>`;
                return;
            }

            // Skip completely empty lines but allow spacing
            if (!cleanLine) {
                html += '<div class="h-4"></div>';
                return;
            }

            // --- Formatting ---
            let formattedLine = cleanLine
                // Bold
                .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
                // Italic
                .replace(/\*(.*?)\*/g, '<em class="text-gray-400">$1</em>')
                // Inline Code
                .replace(/`([^`]+)`/g, '<code class="bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono text-cyan-400">$1</code>');

            // Restore Math
            formattedLine = formattedLine.replace(/__BLOCK_MATH_(\d+)__/g, (match, id) => blockMath[parseInt(id)]);
            formattedLine = formattedLine.replace(/__INLINE_MATH_(\d+)__/g, (match, id) => inlineMath[parseInt(id)]);

            // --- Elements ---
            // Headers
            if (cleanLine.startsWith('### ')) {
                html += `<h3 class="text-lg font-bold text-white mt-8 mb-4 pb-2 border-b border-gray-700 flex items-center gap-2"><span class="w-2 h-2 bg-cyan-500 rounded-full"></span> ${formattedLine.slice(4)}</h3>`;
            } else if (cleanLine.startsWith('## ')) {
                html += `<h2 class="text-xl font-bold text-white mt-8 mb-4">${formattedLine.slice(3)}</h2>`;
            } else if (cleanLine.startsWith('# ')) {
                html += `<h1 class="text-2xl font-bold text-white mt-8 mb-4">${formattedLine.slice(2)}</h1>`;
            }
            // Horizontal Rule
            else if (cleanLine === '---' || cleanLine === '***') {
                html += `<hr class="my-8 border-gray-700" />`;
            }
            // Lists
            else if (cleanLine.startsWith('- ') || cleanLine.startsWith('* ')) {
                html += `<div class="flex items-start gap-3 mb-2 ml-2">
                            <span class="text-cyan-500 mt-2 text-[6px]">●</span>
                            <span class="text-gray-300 flex-1 leading-relaxed">${formattedLine.slice(2)}</span>
                         </div>`;
            } else if (/^\d+\./.test(cleanLine)) {
                const number = cleanLine.match(/^\d+\./)?.[0];
                const content = formattedLine.replace(/^\d+\.\s*/, '');
                html += `<div class="flex items-start gap-3 mb-2 ml-2">
                            <span class="text-cyan-500 font-bold min-w-[20px] text-right">${number}</span>
                            <span class="text-gray-300 flex-1 leading-relaxed">${content}</span>
                         </div>`;
            } 
            // Standard Paragraph
            else {
                html += `<p class="mb-2 leading-relaxed text-gray-300">${formattedLine}</p>`;
            }
        });

        return html;
    };

    return <div dangerouslySetInnerHTML={{ __html: processContent(content) }} className="markdown-content font-sans text-base" />;
};

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

    // Paraphrasing State
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

    // Homework Solver State
    const [solverInput, setSolverInput] = useState('');
    const [solverSubject, setSolverSubject] = useState('Mathematics');
    const [solverOutput, setSolverOutput] = useState('');
    const [isSolving, setIsSolving] = useState(false);
    const [solverFile, setSolverFile] = useState<File | null>(null);
    const [solverFileContent, setSolverFileContent] = useState<string | null>(null); // Base64 or Text
    const [isImageUpload, setIsImageUpload] = useState(false);
    
    // Solver Download State
    const solutionRef = useRef<HTMLDivElement>(null);
    const [showDownloadMenu, setShowDownloadMenu] = useState(false);

    // Lecture Notes State
    const [notesInput, setNotesInput] = useState('');
    const [notesFile, setNotesFile] = useState<File | null>(null);
    const [notesMode, setNotesMode] = useState('Bullet Points');
    const [notesOutput, setNotesOutput] = useState('');
    const [isSummarizing, setIsSummarizing] = useState(false);

    // --- PDF Extraction Helper ---
    const extractTextFromPdf = async (file: File): Promise<string> => {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjs.getDocument(arrayBuffer).promise;
            let fullText = "";
            const maxPages = Math.min(pdf.numPages, 15); 
            
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

    // --- Homework Solver File Handler ---
    const handleSolverFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSolverFile(file);
        setSolverFileContent(null);
        setIsImageUpload(false);

        // 1. Handle Images (Vision)
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                if (ev.target?.result) {
                    setSolverFileContent(ev.target.result as string);
                    setIsImageUpload(true);
                    notify("Image uploaded!");
                }
            };
            reader.readAsDataURL(file);
        }
        // 2. Handle PDF
        else if (file.type === 'application/pdf') {
            try {
                const text = await extractTextFromPdf(file);
                setSolverFileContent(text);
                notify("PDF Content Extracted!");
            } catch (err) {
                notify("Failed to read PDF.");
            }
        }
        // 3. Handle Text Files
        else if (file.type === 'text/plain' || file.name.endsWith('.md') || file.name.endsWith('.js') || file.name.endsWith('.py')) {
            const text = await file.text();
            setSolverFileContent(text);
            notify("Text file loaded!");
        }
        // 4. Word/Excel (Basic Fallback)
        else {
            // For complex binary formats without a library, we notify the user
            // In a real production app, we would use mammoth.js or XLSX here.
            notify("Doc uploaded. Note: Complex formatting may be lost.");
            setSolverFileContent(`[Attached File: ${file.name}]`);
        }
    };

    // Helper: Clean Copy from Rendered View
    const handleCopyRendered = () => {
        if (solutionRef.current) {
            // Use innerText to get the human-readable visual text
            const text = solutionRef.current.innerText;
            navigator.clipboard.writeText(text);
            notify("Copied answer!");
        } else if (solverOutput) {
            navigator.clipboard.writeText(solverOutput);
            notify("Copied source text.");
        }
    };

    // Helper: Generate Word HTML with MathML
    const generateWordHtml = (text: string) => {
        // Replace Block Math $$...$$ with MathML
        let html = text.replace(/\$\$([\s\S]*?)\$\$/g, (match, equation) => {
            try {
                return `<div style="text-align:center; margin: 10px 0;">${katex.renderToString(equation, { output: 'mathml', displayMode: true })}</div>`;
            } catch { return match; }
        });

        // Replace Inline Math $...$ with MathML
        html = html.replace(/\$([^$\n]+?)\$/g, (match, equation) => {
            try {
                return katex.renderToString(equation, { output: 'mathml', displayMode: false });
            } catch { return match; }
        });

        // Basic Formatting
        html = html
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
            .replace(/\*(.*?)\*/g, '<i>$1</i>')
            .replace(/\n/g, '<br>');

        return `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head><meta charset="utf-8"><title>Solution</title></head>
            <body style="font-family: Arial, sans-serif; line-height: 1.5;">
                <h1>Homework Solution</h1>
                <p><strong>Field:</strong> ${solverSubject}</p>
                <hr/>
                ${html}
            </body>
            </html>
        `;
    };

    const handleDownloadSolution = async (format: 'pdf' | 'word' | 'excel') => {
        if (!solverOutput) return;
        setShowDownloadMenu(false);
        const filename = `homework-solution-${Date.now()}`;
    
        if (format === 'pdf') {
            if (!solutionRef.current) return;
            notify("Generating PDF...");
            try {
                // Use html2canvas to capture visual representation including math
                const canvas = await html2canvas(solutionRef.current, {
                    scale: 2,
                    backgroundColor: '#1e1e1e',
                    logging: false,
                    useCORS: true
                });
                
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'px',
                    format: [canvas.width, canvas.height] 
                });
                
                pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
                pdf.save(`${filename}.pdf`);
                notify("PDF Saved!");
            } catch (e) {
                console.error(e);
                notify("PDF Error.");
            }
        } else if (format === 'word') {
            // Render HTML with MathML for Word
            const content = generateWordHtml(solverOutput);
            const blob = new Blob(['\ufeff', content], { type: 'application/msword' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${filename}.doc`;
            link.click();
            notify("Doc Saved!");
        } else if (format === 'excel') {
            // CSV Export - Clean Text Only
            const cleanText = solutionRef.current?.innerText || solverOutput;
            const csvContent = "data:text/csv;charset=utf-8," + 
                `"Field","${solverSubject}"\n` +
                `"Solution",\n` +
                cleanText.split('\n').map(line => `"${line.replace(/"/g, '""')}"`).join('\n');
                
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement('a');
            link.href = encodedUri;
            link.download = `${filename}.csv`;
            link.click();
            notify("Excel/CSV Saved!");
        }
    };

    // --- Note Summarizer Helpers (AI) ---
    const handleGenerateNotes = async () => {
        if (!notesInput.trim()) { notify("Please enter text."); return; }
        const { apiKey, model } = getAiConfig();
        if (!apiKey) { notify("API Key missing."); return; }

        setIsSummarizing(true);
        setNotesOutput('');

        try {
            const systemInstruction = `You are a professional educator. Generate structured content.
            Requirements:
            1. Clear sections: Key Concepts, Detailed Breakdown, Summary.
            2. Use LaTeX for math ($...$).
            3. Clean structure.`;

            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                    "model": model,
                    "messages": [
                        { "role": "system", "content": systemInstruction },
                        { "role": "user", "content": `${notesMode}: ${notesInput}` }
                    ]
                })
            });

            const data = await response.json();
            setNotesOutput(data.choices[0]?.message?.content || "Error.");
            notify("Notes generated!");
        } catch (error) {
            notify("Failed to generate notes.");
        } finally {
            setIsSummarizing(false);
        }
    };

    // --- Question Generator Helpers (AI) ---
    const handleGenerateQuestions = async () => {
        if (!questionInput.trim()) { notify("Please enter text."); return; }
        const { apiKey, model } = getAiConfig();
        if (!apiKey) { notify("API Key missing."); return; }

        setIsGeneratingQuestions(true);
        setQuestionOutput('');

        try {
            const systemInstruction = `Generate ${questionCount} ${questionType} questions (${questionDifficulty}).
            Include Answer Key at the bottom. Use Markdown headers.`;

            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                    "model": model,
                    "messages": [
                        { "role": "system", "content": systemInstruction },
                        { "role": "user", "content": questionInput }
                    ]
                })
            });

            const data = await response.json();
            setQuestionOutput(data.choices[0]?.message?.content || "Error.");
            notify("Questions generated!");
        } catch (error) {
            notify("Failed.");
        } finally {
            setIsGeneratingQuestions(false);
        }
    };

    // --- Paraphrase Helpers (AI) ---
    const handleParaphrase = async () => {
        if (!paraphraseInput.trim()) { notify("Please enter text."); return; }
        const { apiKey, model } = getAiConfig();
        if (!apiKey) { notify("API Key missing."); return; }

        setIsParaphrasing(true);
        setParaphraseOutput('');

        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                    "model": model,
                    "messages": [
                        { "role": "system", "content": `Rewrite text. Mode: ${paraphraseMode}. Keep meaning, change words.` },
                        { "role": "user", "content": paraphraseInput }
                    ]
                })
            });

            const data = await response.json();
            setParaphraseOutput(data.choices[0]?.message?.content || "Error.");
            notify("Done!");
        } catch (error) {
            notify("Failed.");
        } finally {
            setIsParaphrasing(false);
        }
    };

    // --- Homework Solver Helpers (AI) ---
    const handleSolveHomework = async () => {
        if (!solverInput.trim() && !solverFileContent) {
            notify("Please enter a question or upload a file.");
            return;
        }

        const { apiKey, model } = getAiConfig();
        if (!apiKey) {
            notify("API Key missing. Cannot connect to AI service.");
            setSolverOutput("Error: VITE_OPENROUTER_API_KEY not found.");
            return;
        }

        setIsSolving(true);
        setSolverOutput('');

        try {
            const systemInstruction = `You are a Professional Textbook Content Generator.
            Subject/Field: ${solverSubject}
            
            Your goal is to provide an answer that looks EXACTLY like a high-quality textbook example for this specific field.
            
            STRICT FORMATTING RULES:
            1. Start with a Title Header (Markdown ###) describing the concept.
            2. Use "**Problem:**" followed by the question.
            3. Use "**Solution:**" followed by a structured, step-by-step derivation/explanation.
            4. Use LaTeX for ALL math equations. Enclose centered block equations in $$ ... $$ and inline equations in $ ... $.
            5. Use "**Answer:**" for the final result.
            6. Use a horizontal rule (---) at the end if there are multiple parts.
            7. Keep the tone academic, neutral, and clear.
            
            If an image is provided, analyze it carefully to solve the problem shown.
            `;

            // Prepare Payload based on input type (Text only vs Vision)
            let messages;
            
            if (isImageUpload && solverFileContent) {
                // Multimodal Request
                messages = [
                    { "role": "system", "content": systemInstruction },
                    { 
                        "role": "user", 
                        "content": [
                            { "type": "text", "text": solverInput || "Solve the problem in this image." },
                            { "type": "image_url", "image_url": { "url": solverFileContent } }
                        ]
                    }
                ];
            } else {
                // Text/File Content Request
                const combinedContent = `${solverInput}\n\n${solverFileContent ? `[Attached File Content]:\n${solverFileContent}` : ''}`;
                messages = [
                    { "role": "system", "content": systemInstruction },
                    { "role": "user", "content": combinedContent }
                ];
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

            if (!response.ok) throw new Error("API Request Failed");

            const data = await response.json();
            const result = data.choices[0]?.message?.content || "Could not generate answer.";
            setSolverOutput(result);
            notify("Answer generated!");

        } catch (error) {
            console.error(error);
            notify("Failed to generate answer.");
            setSolverOutput("Error connecting to the service. Please try again later.");
        } finally {
            setIsSolving(false);
        }
    };

    // --- Grammar Helpers (AI) ---
    const improveText = async () => {
        if (!grammarInput.trim()) { notify("Please enter text."); return; }
        const { apiKey, model } = getAiConfig();
        if (!apiKey) { notify("API Key missing."); return; }

        setIsImproving(true);
        setGrammarOutput('');

        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                    "model": model,
                    "messages": [
                        { "role": "system", "content": `Fix grammar. Tone: ${grammarTone}. Goal: ${grammarFocus}.` },
                        { "role": "user", "content": grammarInput }
                    ]
                })
            });

            const data = await response.json();
            setGrammarOutput(data.choices[0]?.message?.content || "Error.");
            notify("Done!");
        } catch (error) {
            notify("Failed.");
        } finally {
            setIsImproving(false);
        }
    };

    const fieldGroups = {
        'Engineering': [
            'General Engineering', 'Mechanical Engineering', 'Civil Engineering', 
            'Electrical Engineering', 'Chemical Engineering', 'Aerospace Engineering', 
            'Biomedical Engineering', 'Robotics', 'Mechatronics'
        ],
        'Computer Science & IT': [
            'Computer Science', 'Software Engineering', 'Data Science', 
            'Cybersecurity', 'Artificial Intelligence', 'Web Development', 
            'Information Systems', 'Networking'
        ],
        'Medical & Health': [
            'Medicine (MBBS/MD)', 'Nursing', 'Pharmacy', 'Dentistry', 
            'Public Health', 'Veterinary Science', 'Psychiatry', 
            'Physiotherapy', 'Nutrition'
        ],
        'Natural Sciences': [
            'Physics', 'Chemistry', 'Biology', 'Environmental Science', 
            'Astronomy', 'Geology', 'Biochemistry', 'Microbiology'
        ],
        'Mathematics & Statistics': [
            'Mathematics', 'Statistics', 'Calculus', 'Algebra', 
            'Geometry', 'Trigonometry'
        ],
        'Business & Economics': [
            'Business Administration', 'Economics', 'Finance', 'Accounting', 
            'Marketing', 'Management', 'Entrepreneurship', 'Supply Chain'
        ],
        'Humanities & Social Sciences': [
            'Psychology', 'Sociology', 'Philosophy', 'History', 
            'Political Science', 'Law', 'Anthropology', 'Geography', 'Education'
        ],
        'Arts & Literature': [
            'Literature', 'Linguistics', 'Architecture', 
            'Visual Arts', 'Music Theory', 'Performing Arts', 'Graphic Design'
        ]
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
                            {['Bullet Points', 'Study Guide', 'Q&A', 'Key Concepts', 'Lecture Notes'].map(mode => (
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
                                    <span>Or Paste Text / Topic</span>
                                    {notesFile && <span className="text-orange-400 text-xs flex items-center gap-1"><CheckCircle size={10}/> {notesFile.name} loaded</span>}
                                </label>
                                <textarea 
                                    className="flex-1 bg-black/30 border border-gray-700 rounded-xl p-4 text-white resize-none focus:border-orange-500 outline-none font-sans leading-relaxed custom-scrollbar text-sm" 
                                    placeholder="Paste lecture notes OR type a specific topic (e.g. 'Thermodynamics Laws')..." 
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
                                        <span className="text-sm">Generating study content...</span>
                                    </div>
                                ) : notesOutput ? (
                                    <MarkdownRenderer content={notesOutput} />
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
                        {isSummarizing ? 'Processing...' : `Generate ${notesMode}`}
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
                                    <MarkdownRenderer content={questionOutput} />
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
                                    <MarkdownRenderer content={paraphraseOutput} />
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

            {toolId === 'student-solver' && (
                <div className="w-full bg-gray-900 p-6 md:p-8 rounded-xl border border-gray-800 shadow-xl">
                    <h3 className="text-xl font-bold flex items-center gap-2 mb-6"><BookOpen className="text-orange-400"/> AI Homework Solver</h3>

                    {/* Controls */}
                    <div className="mb-6">
                        <label className="block text-xs text-gray-500 uppercase mb-2">Field of Study</label>
                        <select 
                            value={solverSubject} 
                            onChange={(e) => setSolverSubject(e.target.value)}
                            className="w-full bg-black/40 border border-gray-700 text-gray-300 text-sm rounded-lg p-3 outline-none focus:border-orange-500"
                        >
                            {Object.entries(fieldGroups).map(([category, fields]) => (
                                <optgroup key={category} label={category} className="bg-gray-900 text-gray-400">
                                    {fields.map(field => (
                                        <option key={field} value={field} className="text-white bg-gray-900">{field}</option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                    </div>

                    {/* Input Area (Text & File) */}
                    <div className="mb-6 space-y-4">
                        <div>
                            <label className="block text-xs text-gray-500 uppercase mb-2">Your Question</label>
                            <textarea
                                value={solverInput}
                                onChange={(e) => setSolverInput(e.target.value)}
                                placeholder="Type your question or problem here. e.g., 'Solve for x: 2x + 5 = 15'..."
                                className="w-full bg-black/30 border border-gray-700 rounded-xl p-4 text-white resize-none focus:border-orange-500 outline-none h-32 custom-scrollbar"
                            />
                        </div>

                        {/* File Upload Zone */}
                        <div>
                            <label className="block text-xs text-gray-500 uppercase mb-2">Upload Document / Image</label>
                            {solverFile ? (
                                <div className="flex items-center justify-between p-4 bg-gray-950 border border-cyan-500/30 rounded-xl animate-in fade-in">
                                    <div className="flex items-center gap-3">
                                        {isImageUpload ? <ImageIcon className="text-cyan-400" size={24}/> : <FileText className="text-cyan-400" size={24}/>}
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-white truncate max-w-[200px]">{solverFile.name}</span>
                                            <span className="text-xs text-gray-500">{(solverFile.size/1024).toFixed(1)} KB</span>
                                        </div>
                                    </div>
                                    <button onClick={() => { setSolverFile(null); setSolverFileContent(null); }} className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-red-400 transition-colors">
                                        <X size={18}/>
                                    </button>
                                </div>
                            ) : (
                                <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-700 rounded-xl bg-black/20 hover:bg-black/40 hover:border-orange-500/50 cursor-pointer transition-all group">
                                    <div className="flex flex-col items-center gap-2">
                                        <FileUp className="text-gray-500 group-hover:text-orange-400 transition-colors" size={24}/>
                                        <span className="text-xs text-gray-400 group-hover:text-gray-300">
                                            Upload Image, PDF, Word, Excel, or Text
                                        </span>
                                    </div>
                                    <input 
                                        type="file" 
                                        accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,.xls,.xlsx,.txt,.md,.py,.js" 
                                        className="hidden" 
                                        onChange={handleSolverFileUpload}
                                    />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Button */}
                    <button 
                        onClick={handleSolveHomework} 
                        disabled={isSolving || (!solverInput.trim() && !solverFile)}
                        className="w-full bg-orange-600 hover:bg-orange-500 disabled:opacity-50 py-3 rounded-lg text-white font-bold transition-all flex items-center justify-center gap-2 mb-8 shadow-lg shadow-orange-900/20"
                    >
                        {isSolving ? <RefreshCw className="animate-spin" size={18}/> : <Sparkles size={18}/>}
                        {isSolving ? 'Solving...' : 'Get Answer'}
                    </button>

                    {/* Textbook Style Output */}
                    {(solverOutput || isSolving) && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="text-sm font-medium text-gray-400 uppercase">Textbook Solution</h4>
                                <div className="flex gap-2">
                                    {solverOutput && (
                                        <div className="relative">
                                            <button 
                                                onClick={() => setShowDownloadMenu(!showDownloadMenu)} 
                                                className="text-xs text-orange-400 hover:text-white flex items-center gap-1 px-3 py-1.5 rounded bg-gray-800 hover:bg-gray-700 transition-colors"
                                            >
                                                <Download size={12}/> Download
                                            </button>
                                            {showDownloadMenu && (
                                                <div 
                                                    className="absolute right-0 mt-2 w-40 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                                                    onMouseLeave={() => setShowDownloadMenu(false)}
                                                >
                                                    <button onClick={() => handleDownloadSolution('pdf')} className="w-full text-left px-4 py-3 text-xs text-gray-300 hover:bg-gray-800 hover:text-white flex items-center gap-2">
                                                        <FileText size={14} className="text-red-400"/> PDF Document
                                                    </button>
                                                    <button onClick={() => handleDownloadSolution('word')} className="w-full text-left px-4 py-3 text-xs text-gray-300 hover:bg-gray-800 hover:text-white flex items-center gap-2 border-t border-gray-800">
                                                        <FileIcon size={14} className="text-blue-400"/> Word (.doc)
                                                    </button>
                                                    <button onClick={() => handleDownloadSolution('excel')} className="w-full text-left px-4 py-3 text-xs text-gray-300 hover:bg-gray-800 hover:text-white flex items-center gap-2 border-t border-gray-800">
                                                        <FileSpreadsheet size={14} className="text-green-400"/> Excel (.csv)
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {solverOutput && (
                                        <button onClick={handleCopyRendered} className="text-xs text-orange-400 hover:text-white flex items-center gap-1 px-3 py-1.5 rounded bg-gray-800 hover:bg-gray-700 transition-colors">
                                            <Copy size={12}/> Copy
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            {/* Textbook Page Styling - Dark Mode Clean */}
                            <div 
                                ref={solutionRef}
                                className="relative rounded-xl overflow-hidden shadow-2xl bg-[#1e1e1e] border border-gray-700"
                            >
                                <div className="p-8 leading-[32px]">
                                    {isSolving ? (
                                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                                            <RefreshCw className="animate-spin text-gray-400" size={32}/>
                                            <p className="text-gray-500 font-sans">Calculating solution...</p>
                                        </div>
                                    ) : (
                                        <MarkdownRenderer content={solverOutput} />
                                    )}
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
                                    <div className="text-white whitespace-pre-wrap leading-relaxed">
                                        <MarkdownRenderer content={grammarOutput} />
                                    </div>
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
