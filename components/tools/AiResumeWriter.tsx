
import React, { useState } from 'react';
import { Upload, ImageIcon, CheckCircle, FileText, RefreshCw, Eye, Code, Maximize, Minimize, Download, Copy } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
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

interface AiResumeWriterProps {
  notify: (msg: string) => void;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const AiResumeWriter: React.FC<AiResumeWriterProps> = ({ notify }) => {
    const [loading, setLoading] = useState(false);
    const [resumeType, setResumeType] = useState('Resume');
    const [resumeJob, setResumeJob] = useState('');
    const [resumeLevel, setResumeLevel] = useState('Mid-Level');
    const [resumeSkills, setResumeSkills] = useState('');
    const [resumeBio, setResumeBio] = useState('');
    const [resumeOutput, setResumeOutput] = useState('');
    const [resumeStyle, setResumeStyle] = useState('ATS (Markdown)');
    const [resumePhoto, setResumePhoto] = useState<string | null>(null);
    const [resumeViewMode, setResumeViewMode] = useState<'preview' | 'code'>('preview');
    const [isFullScreen, setIsFullScreen] = useState(false);

    const extractTextFromPdf = async (file: File): Promise<string> => {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjs.getDocument(arrayBuffer).promise;
            let fullText = "";
            const maxPages = Math.min(pdf.numPages, 5); // Limit pages
            
            for (let i = 1; i <= maxPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                const strings = content.items.map((item: any) => item.str);
                fullText += strings.join(" ") + "\n";
            }
            
            return fullText;
        } catch (e) {
            console.error(e);
            throw new Error("PDF Extraction Failed");
        }
    };

    const callOpenRouter = async (messages: ChatMessage[]) => {
        const { apiKey, model } = getAiConfig();
        
        if (!apiKey) {
            notify("Error: API Key missing.");
            throw new Error("API Key Missing. Please add VITE_OPENROUTER_API_KEY env var.");
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

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || "API Request Failed");
        }

        const data = await response.json();
        return data.choices[0].message.content;
    };

    const handleImportResume = async (file: File) => {
        setLoading(true);
        try {
            const text = await extractTextFromPdf(file);
            setResumeBio(text);
            notify("Resume imported! Info filled.");
        } catch (e) {
            notify("Import failed. Try a different PDF.");
        } finally {
            setLoading(false);
        }
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => setResumePhoto(ev.target?.result as string);
            reader.readAsDataURL(file);
            notify("Photo uploaded!");
        }
    };

    const handleGenerateResume = async () => {
        if (!resumeJob.trim() || !resumeBio.trim() || loading) {
            notify("Please fill in Job Title and Background Info.");
            return;
        }
        setLoading(true);
        setResumeOutput('');

        const isHtmlMode = resumeStyle !== 'ATS (Markdown)';

        try {
            let systemPrompt = `You are an expert Professional Resume Writer and Career Coach. 
            Task: Write a high-quality ${resumeType} for a ${resumeJob} position.
            Candidate Level: ${resumeLevel}.
            Key Skills to Highlight: ${resumeSkills}.
            Base the content strictly on the provided background info.`;

            if (isHtmlMode) {
                systemPrompt += `
                OUTPUT FORMAT: Single-file HTML code using Tailwind CSS via CDN.
                STYLE: ${resumeStyle}.
                Layout Guidelines:
                - Use <script src="https://cdn.tailwindcss.com"></script>.
                - Make it responsive, modern, and professional.
                - If the user has a photo, I will inject it later. For now, use the exact placeholder text: "[[PROFILE_PHOTO]]" in the src attribute of the img tag.
                - Output ONLY the raw HTML code. Do NOT use markdown blocks (\`\`\`). Start with <!DOCTYPE html>.
                `;
            } else {
                systemPrompt += `
                OUTPUT FORMAT: Clean, ATS-friendly Markdown.
                Structure:
                - Summary
                - Experience (Action-oriented bullet points)
                - Skills
                - Education
                Tone: Professional, Confident.
                `;
            }

            const messages: ChatMessage[] = [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Here is my background info: ${resumeBio}` }
            ];

            let result = await callOpenRouter(messages);

            if (isHtmlMode) {
                result = result.replace(/```html/g, '').replace(/```/g, '').trim();
                const photoSrc = resumePhoto || "https://via.placeholder.com/150?text=Photo";
                result = result.replace('[[PROFILE_PHOTO]]', photoSrc);
            }

            setResumeOutput(result);
            setResumeViewMode('preview');
        } catch (e) {
            notify("Generation failed.");
            setResumeOutput(`Error: ${(e as Error).message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col max-w-6xl mx-auto w-full gap-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl">
                <div className="flex flex-col lg:flex-row justify-between items-start gap-4 mb-6 border-b border-gray-800 pb-6">
                     <div className="flex gap-4 w-full lg:w-auto">
                        <div className="flex-1">
                            <label className="text-xs text-gray-400 uppercase font-bold block mb-2">Document</label>
                            <select 
                                value={resumeType} 
                                onChange={(e) => setResumeType(e.target.value)}
                                className="w-full bg-black/30 text-white border border-gray-700 rounded-lg py-2.5 px-3 outline-none focus:border-pink-500 text-sm"
                            >
                                <option>Resume</option>
                                <option>Cover Letter</option>
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="text-xs text-gray-400 uppercase font-bold block mb-2">Style / Format</label>
                            <select 
                                value={resumeStyle} 
                                onChange={(e) => setResumeStyle(e.target.value)}
                                className="w-full bg-black/30 text-white border border-gray-700 rounded-lg py-2.5 px-3 outline-none focus:border-pink-500 text-sm"
                            >
                                <option>ATS (Markdown)</option>
                                <option>Modern (HTML)</option>
                                <option>Creative (HTML)</option>
                                <option>Professional (HTML)</option>
                            </select>
                        </div>
                     </div>
                     
                     <div className="flex gap-4 w-full lg:w-auto">
                        <label className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 text-gray-300 hover:text-white transition-all cursor-pointer text-sm font-medium">
                            <Upload size={16}/> Import PDF
                            <input type="file" accept=".pdf" className="hidden" onChange={(e) => e.target.files && handleImportResume(e.target.files[0])} />
                        </label>
                        <label className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 text-gray-300 hover:text-white transition-all cursor-pointer text-sm font-medium">
                            <ImageIcon size={16}/> Photo
                            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                        </label>
                     </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-4 mb-6">
                    <div className="flex-1">
                        <label className="text-xs text-gray-400 uppercase font-bold block mb-2">Target Role</label>
                        <input 
                            type="text"
                            value={resumeJob}
                            onChange={(e) => setResumeJob(e.target.value)}
                            placeholder="e.g. Senior Frontend Engineer"
                            className="w-full bg-black/30 text-white border border-gray-700 rounded-lg py-3 px-4 outline-none focus:border-pink-500"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="text-xs text-gray-400 uppercase font-bold block mb-2">Experience Level</label>
                        <select 
                            value={resumeLevel} 
                            onChange={(e) => setResumeLevel(e.target.value)}
                            className="w-full bg-black/30 text-white border border-gray-700 rounded-lg py-3 px-4 outline-none focus:border-pink-500"
                        >
                            <option>Entry-Level / Student</option>
                            <option>Mid-Level</option>
                            <option>Senior</option>
                            <option>Executive</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs text-gray-400 uppercase font-bold block mb-2">Key Skills (Comma Separated)</label>
                        <input 
                            type="text"
                            value={resumeSkills}
                            onChange={(e) => setResumeSkills(e.target.value)}
                            placeholder="e.g. React, Node.js, Project Management, Agile..."
                            className="w-full bg-black/30 text-white border border-gray-700 rounded-lg py-3 px-4 outline-none focus:border-pink-500"
                        />
                    </div>
                    <div className="relative">
                        <div className="flex justify-between items-center mb-2">
                             <label className="text-xs text-gray-400 uppercase font-bold">Background Info / Old Resume Text</label>
                             {resumePhoto && <span className="text-xs text-green-400 flex items-center gap-1"><CheckCircle size={10}/> Photo Attached</span>}
                        </div>
                        <textarea 
                            value={resumeBio}
                            onChange={(e) => setResumeBio(e.target.value)}
                            className="w-full bg-black/30 border border-gray-700 rounded-xl p-4 text-white outline-none focus:border-pink-500 resize-none h-40 font-sans text-sm custom-scrollbar"
                            placeholder={loading ? "Extracting text from PDF..." : "Paste your old resume content, LinkedIn summary, or just type out your work history and education here..."}
                            disabled={loading}
                        />
                    </div>
                    
                    <button 
                        onClick={handleGenerateResume} 
                        disabled={loading || !resumeJob || !resumeBio}
                        className="w-full bg-pink-600 hover:bg-pink-500 disabled:opacity-50 py-3 rounded-lg text-white font-bold shadow-lg hover:shadow-pink-900/20 transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? <RefreshCw className="animate-spin" size={18}/> : <FileText size={18}/>}
                        {loading ? 'Generating...' : `Generate ${resumeType}`}
                    </button>
                </div>
            </div>

            {(resumeOutput || loading) && (
                <div className={`${isFullScreen ? 'fixed inset-0 z-50 m-0 rounded-none w-screen h-screen' : 'flex-1 min-h-[1123px] rounded-xl border border-gray-800 shadow-2xl'} bg-gray-950 overflow-hidden relative group flex flex-col transition-all duration-300`}>
                    <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-gray-900/90 backdrop-blur-sm">
                         <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 uppercase font-bold">Generated Output</span>
                            {resumeStyle !== 'ATS (Markdown)' && (
                                <div className="flex bg-black/40 rounded-lg p-1 border border-gray-700 ml-4">
                                    <button 
                                        onClick={() => setResumeViewMode('preview')}
                                        className={`px-3 py-1 rounded text-xs font-medium flex items-center gap-2 transition-all ${resumeViewMode === 'preview' ? 'bg-pink-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                    >
                                        <Eye size={12}/> Preview
                                    </button>
                                    <button 
                                        onClick={() => setResumeViewMode('code')}
                                        className={`px-3 py-1 rounded text-xs font-medium flex items-center gap-2 transition-all ${resumeViewMode === 'code' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                    >
                                        <Code size={12}/> HTML
                                    </button>
                                </div>
                            )}
                            <button 
                                onClick={() => setIsFullScreen(!isFullScreen)}
                                className="ml-2 p-1.5 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors"
                                title={isFullScreen ? "Exit Full Screen" : "Full Screen Preview"}
                            >
                                {isFullScreen ? <Minimize size={16}/> : <Maximize size={16}/>}
                            </button>
                         </div>
                         
                         {resumeOutput && !loading && (
                            <div className="flex gap-2">
                                {resumeStyle !== 'ATS (Markdown)' && (
                                    <button 
                                        onClick={() => {
                                            const blob = new Blob([resumeOutput], {type: 'text/html'});
                                            const url = URL.createObjectURL(blob);
                                            const a = document.createElement('a');
                                            a.href = url;
                                            a.download = 'resume.html';
                                            a.click();
                                            notify("Downloaded HTML");
                                        }} 
                                        className="text-xs text-gray-400 hover:text-white flex items-center gap-1 px-3 py-1.5 rounded bg-gray-800 hover:bg-gray-700"
                                    >
                                        <Download size={12}/> Download HTML
                                    </button>
                                )}
                                <button onClick={() => {navigator.clipboard.writeText(resumeOutput); notify("Copied to clipboard!");}} className="text-xs text-pink-400 hover:text-white flex items-center gap-1 px-3 py-1.5 rounded bg-gray-800 hover:bg-gray-700">
                                    <Copy size={12}/> Copy Text
                                </button>
                            </div>
                         )}
                    </div>
                    
                    <div className="flex-1 relative bg-white overflow-auto">
                        {loading ? (
                            <div className="absolute inset-0 bg-gray-950 flex flex-col items-center justify-center gap-4">
                                <RefreshCw className="animate-spin text-pink-500" size={32}/>
                                <div className="space-y-2 text-center">
                                    <p className="text-gray-400 text-sm">Crafting your professional profile...</p>
                                    <div className="w-48 h-1 bg-gray-800 rounded-full overflow-hidden mx-auto">
                                        <div className="h-full bg-pink-500 animate-pulse w-2/3"></div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                {resumeStyle === 'ATS (Markdown)' || resumeViewMode === 'code' ? (
                                    <textarea 
                                        readOnly 
                                        value={resumeOutput}
                                        className="w-full h-full p-8 bg-gray-950 text-gray-300 font-mono text-sm resize-none outline-none custom-scrollbar"
                                    />
                                ) : (
                                    <iframe 
                                        srcDoc={resumeOutput}
                                        title="Resume Preview"
                                        className="w-full h-full border-none"
                                    />
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
