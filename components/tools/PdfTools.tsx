


import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Upload, Download, RefreshCw, Scissors, Images, Minimize2, Check, FileText, 
  Image as ImageIcon, Trash2, ArrowRight, Layers, Move, Plus, Type, 
  X, ZoomIn, ZoomOut, Maximize, FileSpreadsheet, File, Sparkles, Copy, FileUp
} from 'lucide-react';
import { SubTool } from '../../types';
import * as pdfjsLib from 'pdfjs-dist';
import { jsPDF } from 'jspdf';
import { PDFDocument, rgb } from 'pdf-lib';

// Fix for PDF.js worker
const pdfjs = (pdfjsLib as any).default || pdfjsLib;
try {
  if (pdfjs && !pdfjs.GlobalWorkerOptions.workerSrc) {
      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
  }
} catch (e) {
  console.warn("Failed to set PDF worker source", e);
}

interface PdfToolsProps {
  toolId: string;
  toolData: SubTool;
  notify: (msg: string) => void;
}

export const PdfTools: React.FC<PdfToolsProps> = ({ toolId, toolData, notify }) => {
  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null); // PDFPageProxy from pdfjs
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- MERGE/SPLIT STATE ---
  const [mergeSplitMode, setMergeSplitMode] = useState<'split' | 'merge'>('split');
  const [splitPages, setSplitPages] = useState<number[]>([]);
  const [previewPages, setPreviewPages] = useState<string[]>([]);
  const [mergeFiles, setMergeFiles] = useState<File[]>([]);
  
  // --- EDITABLE CONVERTER STATE ---
  const [editableFormat, setEditableFormat] = useState<'word' | 'excel' | 'text'>('word');
  
  // --- SUMMARIZER STATE ---
  const [summaryOutput, setSummaryOutput] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);

  // Helper to safely get API Key
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

  useEffect(() => {
    // Reset state on tool switch
    setFile(null);
    setPdfDoc(null);
    setSplitPages([]);
    setMergeFiles([]);
    setPreviewPages([]);
    setSummaryOutput('');
    setIsSummarizing(false);
  }, [toolId]);

  const loadPdf = async (f: File) => {
    setIsProcessing(true);
    try {
      const arrayBuffer = await f.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      setPdfDoc(pdf);
      setFile(f);

      // If Split Mode, generate previews
      if (toolId === 'pdf-merge-split' && mergeSplitMode === 'split') {
          const previews = [];
          for (let i = 1; i <= Math.min(pdf.numPages, 20); i++) {
              const page = await pdf.getPage(i);
              const viewport = page.getViewport({ scale: 0.3 });
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              canvas.width = viewport.width;
              canvas.height = viewport.height;
              if (ctx) {
                  await page.render({ canvasContext: ctx, viewport }).promise;
                  previews.push(canvas.toDataURL());
              }
          }
          setPreviewPages(previews);
      }

    } catch (e) {
      console.error(e);
      notify("Error loading PDF");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- EXTRACT TEXT FROM PDF HELPER ---
  const extractTextFromPdf = async (file: File): Promise<string> => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument(arrayBuffer).promise;
        let fullText = "";
        const maxPages = Math.min(pdf.numPages, 10); // Limit pages for prompt context
        
        for (let i = 1; i <= maxPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const strings = content.items.map((item: any) => item.str);
            fullText += strings.join(" ") + "\n";
        }
        
        if (pdf.numPages > 10) fullText += "\n[...Text truncated...]";
        return fullText;
    } catch (e) {
        console.error(e);
        throw new Error("PDF Extraction Failed");
    }
  };

  // --- SUMMARIZER LOGIC ---
  const handleSummarizePdf = async () => {
    if (!file) return;
    
    const apiKey = getApiKey();
    if (!apiKey) {
        notify("API Key missing. Add VITE_OPENROUTER_API_KEY.");
        setSummaryOutput("Error: API Key missing in environment variables.");
        return;
    }

    setIsSummarizing(true);
    notify("Reading PDF...");

    try {
        const text = await extractTextFromPdf(file);
        
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                "model": "amazon/nova-2-lite-v1:free",
                "messages": [
                    { "role": "system", "content": "You are a professional Document Summarizer. Summarize the provided text into: 1. A short abstract. 2. Key Bullet Points. 3. Important Takeaways. Format using Markdown." },
                    { "role": "user", "content": text }
                ]
            })
        });

        if (!response.ok) throw new Error("API Request Failed");
        const data = await response.json();
        const result = data.choices[0]?.message?.content || "Could not generate summary.";
        setSummaryOutput(result);
        notify("Summary Generated!");

    } catch (e) {
        console.error(e);
        notify("Summarization Failed");
        setSummaryOutput("Error: Could not summarize document. Please try a text-based PDF.");
    } finally {
        setIsSummarizing(false);
    }
  };


  const handleMerge = async () => { /* ... existing logic ... */ 
      if (mergeFiles.length < 2) return notify("Select 2+ files");
      setIsProcessing(true);
      const mergedPdf = await PDFDocument.create();
      for (const f of mergeFiles) {
          const doc = await PDFDocument.load(await f.arrayBuffer());
          const copied = await mergedPdf.copyPages(doc, doc.getPageIndices());
          copied.forEach(p => mergedPdf.addPage(p));
      }
      const b = await mergedPdf.save();
      const l = document.createElement('a'); l.href=URL.createObjectURL(new Blob([b],{type:'application/pdf'})); l.download=`merged.pdf`; l.click();
      setIsProcessing(false);
  };

  const handleSplit = async () => { /* ... existing logic ... */ 
       if (!file || !splitPages.length) return notify("Select pages");
       setIsProcessing(true);
       const src = await PDFDocument.load(await file.arrayBuffer());
       const newDoc = await PDFDocument.create();
       const copied = await newDoc.copyPages(src, splitPages.map(p=>p-1));
       copied.forEach(p=>newDoc.addPage(p));
       const b = await newDoc.save();
       const l = document.createElement('a'); l.href=URL.createObjectURL(new Blob([b],{type:'application/pdf'})); l.download=`split.pdf`; l.click();
       setIsProcessing(false);
  };
  
  // --- EDITABLE CONVERTER LOGIC ---
  const handleConvertToEditable = async () => {
    if (!file || !pdfDoc) return;
    setIsProcessing(true);
    notify("Converting...");

    try {
        let content = "";
        for (let i = 1; i <= pdfDoc.numPages; i++) {
            const page = await pdfDoc.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item:any) => item.str).join(' ');
            content += pageText + "\n\n";
        }

        let mimeType = 'text/plain';
        let extension = 'txt';
        let finalData = content;

        if (editableFormat === 'word') {
             mimeType = 'application/msword';
             extension = 'doc';
             finalData = `
                <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
                <head><meta charset='utf-8'><title>Export HTML To Doc</title></head>
                <body>
                    ${content.split('\n').map(para => para.trim() ? `<p>${para}</p>` : '<br/>').join('')}
                </body>
                </html>
             `;
        } else if (editableFormat === 'excel') {
             mimeType = 'text/csv';
             extension = 'csv';
             finalData = content.split('\n').filter(line => line.trim()).map(line => `"${line.replace(/"/g, '""')}"`).join('\n');
        }

        const blob = new Blob([finalData], { type: mimeType });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `converted-${file.name.replace('.pdf', '')}.${extension}`;
        link.click();
        notify(`Converted to .${extension} successfully!`);

    } catch(e) {
        console.error(e);
        notify("Conversion Failed");
    } finally {
        setIsProcessing(false);
    }
  };

  const handleCompress = async () => { notify("Feature available in Pro"); };
  const handleImgToPdf = async () => { notify("Feature available in Pro"); };

  // --- RENDER ---

  if (!file && toolId !== 'pdf-image' && toolId !== 'pdf-merge-split') {
      return (
          <div className="flex flex-col items-center justify-center h-96 border-2 border-dashed border-gray-700 rounded-xl bg-gray-900/50 hover:bg-gray-800/50 transition-colors cursor-pointer"
               onClick={() => fileInputRef.current?.click()}>
              <Upload size={48} className="text-gray-500 mb-4" />
              <h3 className="text-xl font-medium text-white">Upload PDF File</h3>
              <p className="text-gray-500 mt-2">Click to select a document</p>
              <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={(e) => e.target.files && loadPdf(e.target.files[0])} />
          </div>
      );
  }

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto">
        
        {/* --- PDF SUMMARIZER UI --- */}
        {toolId === 'pdf-summary' && file && (
            <div className="flex flex-col md:flex-row gap-6 h-[600px]">
                {/* Left: Info & Action */}
                <div className="w-full md:w-80 bg-gray-900 rounded-xl border border-gray-800 p-6 flex flex-col shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-red-900/20 rounded-lg text-red-400">
                             <FileText size={24}/>
                        </div>
                        <div className="overflow-hidden">
                            <h3 className="font-bold text-white truncate" title={file.name}>{file.name}</h3>
                            <span className="text-xs text-gray-500">{(file.size/1024/1024).toFixed(2)} MB • {pdfDoc?.numPages || '?'} Pages</span>
                        </div>
                    </div>
                    
                    <div className="flex-1">
                        <p className="text-sm text-gray-400 leading-relaxed mb-4">
                            Our AI will read the document and provide:
                        </p>
                        <ul className="text-sm text-gray-400 space-y-2 mb-6 list-disc list-inside">
                            <li>Short Summary</li>
                            <li>Key Bullet Points</li>
                            <li>Critical Takeaways</li>
                        </ul>
                    </div>

                    <button 
                        onClick={handleSummarizePdf}
                        disabled={isSummarizing}
                        className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-cyan-900/20 transition-all flex items-center justify-center gap-2"
                    >
                        {isSummarizing ? <RefreshCw className="animate-spin" size={20}/> : <Sparkles size={20}/>}
                        {isSummarizing ? 'Summarizing...' : 'Generate Summary'}
                    </button>
                    <button onClick={() => setFile(null)} className="mt-4 text-center text-xs text-gray-500 hover:text-white underline">Upload different file</button>
                </div>

                {/* Right: Output */}
                <div className="flex-1 bg-gray-950 rounded-xl border border-gray-800 p-6 relative overflow-hidden flex flex-col">
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-800">
                        <span className="text-xs text-gray-400 uppercase font-bold">AI Summary Result</span>
                        {summaryOutput && (
                             <button onClick={() => {navigator.clipboard.writeText(summaryOutput); notify("Copied!");}} className="text-xs text-cyan-400 hover:text-white flex items-center gap-1">
                                 <Copy size={12}/> Copy
                             </button>
                        )}
                    </div>
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {isSummarizing ? (
                             <div className="h-full flex flex-col items-center justify-center gap-4">
                                 <div className="relative w-16 h-16">
                                     <div className="absolute inset-0 border-4 border-gray-800 rounded-full"></div>
                                     <div className="absolute inset-0 border-4 border-cyan-500 rounded-full border-t-transparent animate-spin"></div>
                                 </div>
                                 <p className="text-gray-500 animate-pulse">Analyzing document structure...</p>
                             </div>
                        ) : summaryOutput ? (
                             <div className="prose prose-invert prose-sm max-w-none text-gray-300 leading-relaxed whitespace-pre-wrap">
                                 {summaryOutput}
                             </div>
                        ) : (
                             <div className="h-full flex flex-col items-center justify-center text-gray-700">
                                 <FileText size={48} className="mb-4 opacity-20"/>
                                 <p>Summary will appear here.</p>
                             </div>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* --- EDITABLE CONVERTER UI --- */}
        {toolId === 'pdf-editable' && file && (
            <div className="flex flex-col items-center justify-center max-w-2xl mx-auto py-12">
                <div className="bg-gray-900 p-8 rounded-xl border border-gray-800 shadow-2xl w-full text-center">
                    <div className="w-16 h-16 bg-cyan-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-cyan-400">
                        <FileText size={32}/>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Convert to Editable Format</h3>
                    <p className="text-gray-400 mb-8">Select your target format. We will extract text and layout to create an editable file.</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                        <button 
                            onClick={() => setEditableFormat('word')}
                            className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${editableFormat === 'word' ? 'bg-blue-900/30 border-blue-500 text-blue-400' : 'bg-black/30 border-gray-700 text-gray-400 hover:bg-gray-800'}`}
                        >
                            <FileText size={24}/>
                            <span className="font-bold text-sm">Word (.doc)</span>
                        </button>
                        <button 
                            onClick={() => setEditableFormat('excel')}
                            className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${editableFormat === 'excel' ? 'bg-green-900/30 border-green-500 text-green-400' : 'bg-black/30 border-gray-700 text-gray-400 hover:bg-gray-800'}`}
                        >
                            <FileSpreadsheet size={24}/>
                            <span className="font-bold text-sm">Excel (.csv)</span>
                        </button>
                        <button 
                            onClick={() => setEditableFormat('text')}
                            className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${editableFormat === 'text' ? 'bg-gray-700/30 border-gray-500 text-gray-200' : 'bg-black/30 border-gray-700 text-gray-400 hover:bg-gray-800'}`}
                        >
                            <File size={24}/>
                            <span className="font-bold text-sm">Text (.txt)</span>
                        </button>
                    </div>

                    <button 
                        onClick={handleConvertToEditable}
                        disabled={isProcessing}
                        className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-cyan-900/20 transition-all flex items-center justify-center gap-2"
                    >
                        {isProcessing ? <RefreshCw className="animate-spin" size={20}/> : <RefreshCw size={20}/>}
                        {isProcessing ? 'Converting...' : 'Convert & Download'}
                    </button>
                    
                    <button onClick={() => setFile(null)} className="mt-4 text-sm text-gray-500 hover:text-white underline">Convert another file</button>
                </div>
            </div>
        )}

        {/* --- MERGE / SPLIT UI (Simplified) --- */}
        {toolId === 'pdf-merge-split' && (
             <div className="flex flex-col gap-6">
                 {/* ... existing merge/split UI ... */}
                 <div className="flex justify-center bg-gray-900 p-1 rounded-xl w-fit mx-auto border border-gray-800">
                     <button onClick={() => setMergeSplitMode('split')} className={`px-6 py-2 rounded-lg font-medium transition-all ${mergeSplitMode === 'split' ? 'bg-cyan-600 text-white' : 'text-gray-400'}`}>Split PDF</button>
                     <button onClick={() => setMergeSplitMode('merge')} className={`px-6 py-2 rounded-lg font-medium transition-all ${mergeSplitMode === 'merge' ? 'bg-cyan-600 text-white' : 'text-gray-400'}`}>Merge PDFs</button>
                 </div>

                 {mergeSplitMode === 'split' && (
                     <>
                        {!file ? (
                             <div className="h-64 border-2 border-dashed border-gray-700 rounded-xl flex flex-col items-center justify-center bg-gray-900/50 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                 <Upload size={32} className="text-gray-400 mb-2"/>
                                 <span className="text-gray-300">Upload PDF to Split</span>
                                 <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={(e) => e.target.files && loadPdf(e.target.files[0])}/>
                             </div>
                        ) : (
                            <div>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-h-[500px] overflow-y-auto p-4 bg-gray-900 rounded-xl border border-gray-800">
                                    {previewPages.map((src, i) => (
                                        <div 
                                            key={i} 
                                            onClick={() => setSplitPages(prev => prev.includes(i+1) ? prev.filter(p => p !== i+1) : [...prev, i+1])}
                                            className={`relative cursor-pointer group rounded-lg overflow-hidden border-2 transition-all ${splitPages.includes(i+1) ? 'border-cyan-500 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                        >
                                            <img src={src} className="w-full h-auto" />
                                            <div className="absolute bottom-2 right-2 bg-black/70 px-2 rounded text-xs text-white">Pg {i+1}</div>
                                            {splitPages.includes(i+1) && <div className="absolute inset-0 bg-cyan-500/20 flex items-center justify-center"><Check className="text-cyan-400 bg-black/50 rounded-full p-1" size={32}/></div>}
                                        </div>
                                    ))}
                                </div>
                                <button onClick={handleSplit} className="w-full mt-4 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-white font-bold flex items-center justify-center gap-2">
                                    <Scissors size={20}/> Extract {splitPages.length} Pages
                                </button>
                            </div>
                        )}
                     </>
                 )}

                 {mergeSplitMode === 'merge' && (
                     <div className="space-y-4">
                         {/* Merge UI Logic... reusing existing snippets for brevity in this output, but ensuring valid React code */}
                         <div className="space-y-2">
                            {mergeFiles.map((f, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-gray-900 border border-gray-800 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <FileText className="text-cyan-500" size={20}/>
                                        <span className="text-gray-300">{f.name}</span>
                                        <span className="text-xs text-gray-500">{(f.size/1024/1024).toFixed(2)} MB</span>
                                    </div>
                                    <button onClick={() => setMergeFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-red-400 hover:bg-red-900/20 p-1 rounded"><X size={16}/></button>
                                </div>
                            ))}
                         </div>
                         <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-700 rounded-xl bg-gray-900/50 cursor-pointer hover:bg-gray-800/50">
                             <Plus size={24} className="text-gray-400 mb-2"/>
                             <span className="text-sm text-gray-300">Add PDF File</span>
                             <input type="file" accept=".pdf" multiple className="hidden" onChange={(e) => e.target.files && setMergeFiles(prev => [...prev, ...Array.from(e.target.files || [])])}/>
                         </label>
                         <button onClick={handleMerge} disabled={mergeFiles.length < 2} className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-bold flex items-center justify-center gap-2">
                             <Layers size={20}/> Merge {mergeFiles.length} Files
                         </button>
                     </div>
                 )}
             </div>
        )}

        {/* --- DEFAULT PLACEHOLDER FOR OTHER TOOLS --- */}
        {!['pdf-summary', 'pdf-merge-split', 'pdf-editable'].includes(toolId) && (
            <div className="text-center py-20 text-gray-500">
                <p>Select a tool mode to begin.</p>
                {!file && (
                    <button onClick={() => fileInputRef.current?.click()} className="mt-4 px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white">Upload PDF</button>
                )}
            </div>
        )}
    </div>
  );
};
