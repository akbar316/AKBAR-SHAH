import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, Download, RefreshCw, Scissors, Images, Minimize2, Check, FileText, Image as ImageIcon, Trash2, ArrowRight, Layers, Move, Plus
} from 'lucide-react';
import { SubTool } from '../../types';
import * as pdfjsLib from 'pdfjs-dist';
import { jsPDF } from 'jspdf';
import { PDFDocument } from 'pdf-lib';

// Fix for PDF.js import structure
const pdfjs = (pdfjsLib as any).default || pdfjsLib;
if (pdfjs.GlobalWorkerOptions) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
}

interface PdfToolsProps {
  toolId: string;
  toolData: SubTool;
  notify: (msg: string) => void;
}

export const PdfTools: React.FC<PdfToolsProps> = ({ toolId, toolData, notify }) => {
  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Specific Tool States
  const [imgToPdfFiles, setImgToPdfFiles] = useState<File[]>([]);
  const [compressLevel, setCompressLevel] = useState<'extreme' | 'recommended' | 'less'>('recommended');
  
  // Split & Merge States
  const [mergeSplitMode, setMergeSplitMode] = useState<'split' | 'merge'>('split');
  const [splitPages, setSplitPages] = useState<number[]>([]);
  const [previewPages, setPreviewPages] = useState<string[]>([]);
  const [mergeFiles, setMergeFiles] = useState<File[]>([]);

  const [convertFormat, setConvertFormat] = useState<'jpg' | 'png' | 'text'>('jpg');

  // New State for Dual Mode Image Tool
  const [imageToolMode, setImageToolMode] = useState<'img-to-pdf' | 'pdf-to-img'>('img-to-pdf');
  const [pdfToImgImages, setPdfToImgImages] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFile(null);
    setPdfDoc(null);
    setPreviewPages([]);
    setSplitPages([]);
    setImgToPdfFiles([]);
    setPdfToImgImages([]);
    setMergeFiles([]);
  }, [toolId]);

  const loadPdf = async (f: File) => {
    setIsProcessing(true);
    try {
      const arrayBuffer = await f.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      setPdfDoc(pdf);
      setFile(f);

      // If split tool, render previews
      if (toolId === 'pdf-merge-split' && mergeSplitMode === 'split') {
          const previews = [];
          for (let i = 1; i <= Math.min(pdf.numPages, 20); i++) {
              const page = await pdf.getPage(i);
              const viewport = page.getViewport({ scale: 0.5 });
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

  const handleCompress = async () => {
    if (!pdfDoc) return;
    setIsProcessing(true);
    notify("Compressing PDF...");
    
    try {
        const doc = new jsPDF();
        const quality = compressLevel === 'extreme' ? 0.3 : compressLevel === 'recommended' ? 0.6 : 0.8;
        
        for(let i=1; i <= pdfDoc.numPages; i++) {
            setProgress(Math.round((i / pdfDoc.numPages) * 100));
            const page = await pdfDoc.getPage(i);
            const viewport = page.getViewport({ scale: 1.0 }); // Render at 1.0 scale (72dpi approx)
            
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext('2d');
            
            if (ctx) {
                await page.render({ canvasContext: ctx, viewport }).promise;
                const imgData = canvas.toDataURL('image/jpeg', quality);
                
                if (i > 1) doc.addPage();
                const pdfWidth = doc.internal.pageSize.getWidth();
                const pdfHeight = (viewport.height * pdfWidth) / viewport.width;
                doc.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
            }
        }
        
        doc.save(`${file?.name.replace('.pdf', '')}_compressed.pdf`);
        notify("Download Started!");
    } catch(e) {
        console.error(e);
        notify("Compression Failed");
    } finally {
        setIsProcessing(false);
        setProgress(0);
    }
  };

  const handleSplit = async () => {
      if (!file || splitPages.length === 0) {
          notify("Select pages to extract");
          return;
      }
      setIsProcessing(true);
      notify("Extracting Pages...");

      try {
        const fileArrayBuffer = await file.arrayBuffer();
        const srcDoc = await PDFDocument.load(fileArrayBuffer);
        const newDoc = await PDFDocument.create();

        // Indices in pdf-lib are 0-based
        const indicesToCopy = splitPages.map(p => p - 1);
        const copiedPages = await newDoc.copyPages(srcDoc, indicesToCopy);

        copiedPages.forEach((page) => newDoc.addPage(page));

        const pdfBytes = await newDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${file.name.replace('.pdf', '')}_split.pdf`;
        link.click();
        
        notify("Split PDF Downloaded!");
      } catch (e) {
          console.error(e);
          notify("Split Failed");
      } finally {
          setIsProcessing(false);
      }
  };

  const handleMerge = async () => {
      if (mergeFiles.length < 2) {
          notify("Select at least 2 PDF files to merge");
          return;
      }
      setIsProcessing(true);
      notify("Merging PDFs...");

      try {
          const mergedPdf = await PDFDocument.create();
          
          for (const f of mergeFiles) {
              const arrayBuffer = await f.arrayBuffer();
              const doc = await PDFDocument.load(arrayBuffer);
              const copiedPages = await mergedPdf.copyPages(doc, doc.getPageIndices());
              copiedPages.forEach(page => mergedPdf.addPage(page));
          }

          const pdfBytes = await mergedPdf.save();
          const blob = new Blob([pdfBytes], { type: 'application/pdf' });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = `merged_documents_${Date.now()}.pdf`;
          link.click();

          notify("PDFs Merged Successfully!");
      } catch (e) {
          console.error(e);
          notify("Merge Failed. Ensure files are valid PDFs.");
      } finally {
          setIsProcessing(false);
      }
  };

  const handleImgToPdf = () => {
      if (imgToPdfFiles.length === 0) {
          notify("No images selected");
          return;
      }
      setIsProcessing(true);
      
      const doc = new jsPDF();
      let promises = imgToPdfFiles.map((f, index) => {
          return new Promise<void>((resolve) => {
              const reader = new FileReader();
              reader.onload = (e) => {
                  const img = new Image();
                  img.src = e.target?.result as string;
                  img.onload = () => {
                      if (index > 0) doc.addPage();
                      const pdfWidth = doc.internal.pageSize.getWidth();
                      const pdfHeight = doc.internal.pageSize.getHeight();
                      
                      // Fit image to page maintaining aspect ratio
                      const ratio = Math.min(pdfWidth / img.width, pdfHeight / img.height);
                      const w = img.width * ratio;
                      const h = img.height * ratio;
                      
                      doc.addImage(img, 'JPEG', (pdfWidth - w)/2, (pdfHeight - h)/2, w, h);
                      resolve();
                  };
              };
              reader.readAsDataURL(f);
          });
      });

      Promise.all(promises).then(() => {
          doc.save("images_merged.pdf");
          setIsProcessing(false);
          notify("PDF Generated");
      });
  };

  const handlePdfToImg = async () => {
    if (!pdfDoc) return;
    setIsProcessing(true);
    notify("Rendering Pages...");
    const images: string[] = [];

    try {
        for (let i = 1; i <= pdfDoc.numPages; i++) {
            const page = await pdfDoc.getPage(i);
            const viewport = page.getViewport({ scale: 2.0 }); // High quality
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                await page.render({ canvasContext: ctx, viewport }).promise;
                images.push(canvas.toDataURL('image/jpeg', 0.9));
            }
        }
        setPdfToImgImages(images);
        notify("Conversion Complete. Click images to download.");
    } catch (e) {
        console.error(e);
        notify("Conversion Failed");
    } finally {
        setIsProcessing(false);
    }
  };

  const handleConvert = async () => {
      if (!pdfDoc) return;
      setIsProcessing(true);
      notify("Converting...");

      try {
          if (convertFormat === 'text') {
              let fullText = "";
              for (let i = 1; i <= pdfDoc.numPages; i++) {
                  const page = await pdfDoc.getPage(i);
                  const textContent = await page.getTextContent();
                  const pageText = textContent.items.map((item: any) => item.str).join(' ');
                  fullText += `--- Page ${i} ---\n${pageText}\n\n`;
              }
              const blob = new Blob([fullText], { type: 'text/plain' });
              const link = document.createElement('a');
              link.href = URL.createObjectURL(blob);
              link.download = `${file?.name.replace('.pdf', '')}.txt`;
              link.click();
          } else {
              // Convert to Images (ZIP not supported without external lib, so just download first page or one by one. Here we download first page as example)
              const page = await pdfDoc.getPage(1);
              const viewport = page.getViewport({ scale: 2.0 });
              const canvas = document.createElement('canvas');
              canvas.width = viewport.width;
              canvas.height = viewport.height;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                  await page.render({ canvasContext: ctx, viewport }).promise;
                  const link = document.createElement('a');
                  link.href = canvas.toDataURL(`image/${convertFormat}`);
                  link.download = `${file?.name.replace('.pdf', '')}_page1.${convertFormat}`;
                  link.click();
                  if (pdfDoc.numPages > 1) notify("Downloaded Page 1 (Multi-page image download requires ZIP)");
              }
          }
      } catch (e) {
          console.error(e);
          notify("Conversion failed");
      } finally {
          setIsProcessing(false);
      }
  };

  // --- RENDER HELPERS ---

  if (toolId === 'pdf-image') {
      return (
          <div className="flex flex-col items-center max-w-4xl mx-auto w-full p-6 bg-gray-900 border border-gray-800 rounded-xl">
              <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                  <Images className="text-blue-400" /> Image Tools
              </h3>
              
              {/* Mode Toggle */}
              <div className="flex w-full max-w-md bg-gray-950 p-1 rounded-lg border border-gray-800 mb-8">
                  <button 
                    onClick={() => { setImageToolMode('img-to-pdf'); setFile(null); setPdfDoc(null); setPdfToImgImages([]); }}
                    className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${imageToolMode === 'img-to-pdf' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                  >
                      Images to PDF
                  </button>
                  <button 
                    onClick={() => { setImageToolMode('pdf-to-img'); setImgToPdfFiles([]); }}
                    className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${imageToolMode === 'pdf-to-img' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                  >
                      PDF to Images
                  </button>
              </div>

              {/* IMAGES TO PDF MODE */}
              {imageToolMode === 'img-to-pdf' && (
                  <>
                    <div className="w-full mb-8">
                        <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-700 rounded-xl bg-gray-950/50 cursor-pointer hover:bg-gray-800/50 transition-colors">
                            <Upload size={32} className="text-gray-400 mb-2"/>
                            <span className="text-gray-300">Click to upload images</span>
                            <span className="text-xs text-gray-500 mt-1">JPG, PNG supported</span>
                            <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => {
                                if (e.target.files) setImgToPdfFiles(Array.from(e.target.files));
                            }}/>
                        </label>
                    </div>

                    {imgToPdfFiles.length > 0 && (
                        <div className="w-full mb-8">
                            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                                {imgToPdfFiles.map((f, i) => (
                                    <div key={i} className="flex-shrink-0 relative w-32 h-32 bg-gray-800 rounded-lg overflow-hidden border border-gray-700 group">
                                        <img src={URL.createObjectURL(f)} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                                        <div className="absolute top-1 right-1 bg-black/60 rounded-full p-1 cursor-pointer hover:bg-red-500" onClick={() => {
                                            const newFiles = [...imgToPdfFiles];
                                            newFiles.splice(i, 1);
                                            setImgToPdfFiles(newFiles);
                                        }}>
                                            <Trash2 size={12} className="text-white"/>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <button 
                        onClick={handleImgToPdf}
                        disabled={isProcessing || imgToPdfFiles.length === 0}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2"
                    >
                        {isProcessing ? <RefreshCw className="animate-spin"/> : <Download size={20}/>}
                        Generate PDF
                    </button>
                  </>
              )}

              {/* PDF TO IMAGES MODE */}
              {imageToolMode === 'pdf-to-img' && (
                  <>
                     {!file ? (
                        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-700 rounded-xl bg-gray-950/50 cursor-pointer hover:bg-gray-800/50 transition-colors">
                            <FileText size={32} className="text-gray-400 mb-2" />
                            <span className="text-gray-300">Upload PDF File</span>
                            <input type="file" accept=".pdf" className="hidden" onChange={(e) => e.target.files && loadPdf(e.target.files[0])} />
                        </label>
                     ) : (
                         <div className="w-full">
                            <div className="flex items-center gap-4 bg-gray-950 p-4 rounded-lg border border-gray-800 mb-6">
                                <div className="p-3 bg-red-900/20 rounded text-red-400"><FileText size={24}/></div>
                                <div className="flex-1">
                                    <div className="font-medium text-white">{file.name}</div>
                                    <div className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB • {pdfDoc?.numPages} Pages</div>
                                </div>
                                <button onClick={() => { setFile(null); setPdfDoc(null); setPdfToImgImages([]); }} className="text-gray-500 hover:text-white"><Trash2 size={18}/></button>
                            </div>

                            {pdfToImgImages.length === 0 ? (
                                <button 
                                    onClick={handlePdfToImg}
                                    disabled={isProcessing}
                                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2"
                                >
                                    {isProcessing ? <RefreshCw className="animate-spin"/> : <Images size={20}/>}
                                    Convert to Images
                                </button>
                            ) : (
                                <div>
                                    <h4 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2"><Check size={14} className="text-green-400"/> Conversion Successful. Click to Download.</h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto custom-scrollbar p-2 bg-black/20 rounded-xl">
                                        {pdfToImgImages.map((src, i) => (
                                            <a 
                                                key={i} 
                                                href={src} 
                                                download={`${file.name.replace('.pdf', '')}_page${i+1}.jpg`}
                                                className="relative group aspect-[1/1.4] rounded-lg overflow-hidden border border-gray-800 hover:border-blue-500 transition-all block"
                                            >
                                                <img src={src} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                    <Download className="text-white" size={24}/>
                                                </div>
                                                <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 rounded">Page {i + 1}</div>
                                            </a>
                                        ))}
                                    </div>
                                    <button onClick={() => { setFile(null); setPdfDoc(null); setPdfToImgImages([]); }} className="w-full mt-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg">Convert Another</button>
                                </div>
                            )}
                         </div>
                     )}
                  </>
              )}
          </div>
      );
  }

  if (toolId === 'pdf-merge-split') {
    return (
        <div className="flex flex-col items-center max-w-4xl mx-auto w-full p-6 bg-gray-900 border border-gray-800 rounded-xl">
             <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                <Layers className="text-blue-400" /> Split & Merge
            </h3>

            {/* Mode Toggle */}
            <div className="flex w-full max-w-md bg-gray-950 p-1 rounded-lg border border-gray-800 mb-8">
                <button 
                onClick={() => { setMergeSplitMode('split'); setFile(null); setPdfDoc(null); setSplitPages([]); }}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${mergeSplitMode === 'split' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                    Split PDF
                </button>
                <button 
                onClick={() => { setMergeSplitMode('merge'); setMergeFiles([]); }}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${mergeSplitMode === 'merge' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                    Merge PDFs
                </button>
            </div>

            {/* --- SPLIT MODE --- */}
            {mergeSplitMode === 'split' && (
                <div className="w-full">
                     {!file ? (
                        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-700 rounded-xl bg-gray-950/50 cursor-pointer hover:bg-gray-800/50 transition-colors">
                            <Scissors size={32} className="text-gray-400 mb-2" />
                            <span className="text-gray-300">Upload PDF to Split</span>
                            <input type="file" accept=".pdf" className="hidden" onChange={(e) => e.target.files && loadPdf(e.target.files[0])} />
                        </label>
                     ) : (
                        <div className="w-full flex flex-col gap-6">
                             <div className="flex items-center gap-4 bg-gray-950 p-4 rounded-lg border border-gray-800">
                                <div className="p-3 bg-red-900/20 rounded text-red-400"><FileText size={24}/></div>
                                <div className="flex-1">
                                    <div className="font-medium text-white">{file.name}</div>
                                    <div className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB • {pdfDoc?.numPages} Pages</div>
                                </div>
                                <button onClick={() => setFile(null)} className="text-gray-500 hover:text-white"><Trash2 size={18}/></button>
                            </div>
                            
                            <div className="bg-black/20 rounded-xl p-4 border border-gray-800">
                                <h4 className="text-sm font-medium text-gray-400 mb-4">Select pages to extract:</h4>
                                <div className="grid grid-cols-4 md:grid-cols-6 gap-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                                    {previewPages.map((src, i) => (
                                        <div 
                                            key={i}
                                            onClick={() => {
                                                if (splitPages.includes(i + 1)) setSplitPages(splitPages.filter(p => p !== i + 1));
                                                else setSplitPages([...splitPages, i + 1]);
                                            }}
                                            className={`relative aspect-[1/1.4] cursor-pointer rounded-lg overflow-hidden border-2 transition-all group ${splitPages.includes(i + 1) ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-gray-800 hover:border-gray-600'}`}
                                        >
                                            <img src={src} className="w-full h-full object-cover" />
                                            <div className={`absolute inset-0 bg-blue-900/40 flex items-center justify-center transition-opacity ${splitPages.includes(i + 1) ? 'opacity-100' : 'opacity-0'}`}>
                                                <Check className="text-white drop-shadow-md" size={32}/>
                                            </div>
                                            <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 rounded">{i + 1}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between text-sm text-gray-400 px-2">
                                <span>Selected: {splitPages.length} pages</span>
                                <button onClick={() => setSplitPages([])} className="text-red-400 hover:text-red-300">Clear Selection</button>
                            </div>

                            <button 
                                onClick={handleSplit}
                                disabled={isProcessing || splitPages.length === 0}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2"
                            >
                                {isProcessing ? <RefreshCw className="animate-spin"/> : <Download size={20}/>}
                                Extract Selected Pages
                            </button>
                        </div>
                     )}
                </div>
            )}

            {/* --- MERGE MODE --- */}
            {mergeSplitMode === 'merge' && (
                <div className="w-full">
                     <div className="w-full mb-8">
                        <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-700 rounded-xl bg-gray-950/50 cursor-pointer hover:bg-gray-800/50 transition-colors">
                            <Plus size={32} className="text-gray-400 mb-2"/>
                            <span className="text-gray-300">Add PDF Files</span>
                            <span className="text-xs text-gray-500 mt-1">Select multiple files to combine</span>
                            <input type="file" multiple accept=".pdf" className="hidden" onChange={(e) => {
                                if (e.target.files) setMergeFiles(prev => [...prev, ...Array.from(e.target.files!)]);
                            }}/>
                        </label>
                    </div>

                    {mergeFiles.length > 0 && (
                        <div className="space-y-3 mb-8">
                            {mergeFiles.map((f, i) => (
                                <div key={i} className="flex items-center gap-4 bg-gray-950 p-4 rounded-lg border border-gray-800 animate-in slide-in-from-left-2 fade-in">
                                    <div className="text-gray-500 cursor-grab active:cursor-grabbing"><Move size={16}/></div>
                                    <div className="p-2 bg-red-900/20 rounded text-red-400"><FileText size={20}/></div>
                                    <div className="flex-1">
                                        <div className="font-medium text-white text-sm">{f.name}</div>
                                        <div className="text-xs text-gray-500">{(f.size / 1024 / 1024).toFixed(2)} MB</div>
                                    </div>
                                    <button 
                                        onClick={() => setMergeFiles(mergeFiles.filter((_, idx) => idx !== i))}
                                        className="text-gray-500 hover:text-red-400"
                                    >
                                        <Trash2 size={16}/>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <button 
                        onClick={handleMerge}
                        disabled={isProcessing || mergeFiles.length < 2}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2"
                    >
                        {isProcessing ? <RefreshCw className="animate-spin"/> : <Layers size={20}/>}
                        Merge {mergeFiles.length} PDFs
                    </button>
                </div>
            )}
        </div>
    );
  }

  // --- STANDARD PDF TOOL LAYOUT ---
  return (
    <div className="flex flex-col items-center max-w-4xl mx-auto w-full p-6 bg-gray-900 border border-gray-800 rounded-xl min-h-[500px]">
        {/* Header */}
        <div className="mb-8 text-center">
            {toolId === 'pdf-convert' && <h3 className="text-xl font-bold text-white flex items-center justify-center gap-2"><RefreshCw className="text-blue-400"/> PDF Converter</h3>}
            {toolId === 'pdf-compress' && <h3 className="text-xl font-bold text-white flex items-center justify-center gap-2"><Minimize2 className="text-blue-400"/> PDF Compressor</h3>}
            {toolId === 'pdf-merge-split' && <h3 className="text-xl font-bold text-white flex items-center justify-center gap-2"><Scissors className="text-blue-400"/> Split PDF</h3>}
        </div>

        {/* Upload State */}
        {!file && (
             <label className="flex flex-col items-center justify-center w-full flex-1 border-2 border-dashed border-gray-700 rounded-xl bg-gray-950/50 cursor-pointer hover:bg-gray-800/50 transition-colors animate-in zoom-in duration-300 p-12">
                <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-blue-500/10">
                    <FileText size={32} className="text-gray-400" />
                </div>
                <span className="text-2xl text-white font-semibold mb-2">Upload PDF File</span>
                <span className="text-sm text-gray-500">Max size 20MB</span>
                <input type="file" accept=".pdf" className="hidden" ref={fileInputRef} onChange={(e) => e.target.files && loadPdf(e.target.files[0])} />
            </label>
        )}

        {/* Processing/Options State */}
        {file && (
            <div className="w-full flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center gap-4 bg-gray-950 p-4 rounded-lg border border-gray-800">
                    <div className="p-3 bg-red-900/20 rounded text-red-400"><FileText size={24}/></div>
                    <div className="flex-1">
                        <div className="font-medium text-white">{file.name}</div>
                        <div className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                    </div>
                    <button onClick={() => setFile(null)} className="text-gray-500 hover:text-white"><Trash2 size={18}/></button>
                </div>

                {toolId === 'pdf-compress' && (
                    <div className="grid grid-cols-3 gap-4">
                        {['extreme', 'recommended', 'less'].map((level) => (
                            <button 
                                key={level}
                                onClick={() => setCompressLevel(level as any)}
                                className={`p-4 rounded-lg border text-center transition-all ${compressLevel === level ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-950 border-gray-800 text-gray-400 hover:bg-gray-800'}`}
                            >
                                <div className="text-sm font-bold uppercase mb-1">{level}</div>
                                <div className="text-xs opacity-70">{level === 'extreme' ? '-70% size' : level === 'recommended' ? '-40% size' : '-10% size'}</div>
                            </button>
                        ))}
                    </div>
                )}

                {toolId === 'pdf-merge-split' && (
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-4 max-h-[400px] overflow-y-auto p-2 bg-black/20 rounded-xl">
                        {previewPages.map((src, i) => (
                            <div 
                                key={i}
                                onClick={() => {
                                    if (splitPages.includes(i + 1)) setSplitPages(splitPages.filter(p => p !== i + 1));
                                    else setSplitPages([...splitPages, i + 1]);
                                }}
                                className={`relative aspect-[1/1.4] cursor-pointer rounded-lg overflow-hidden border-2 transition-all group ${splitPages.includes(i + 1) ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-gray-800 hover:border-gray-600'}`}
                            >
                                <img src={src} className="w-full h-full object-cover" />
                                <div className={`absolute inset-0 bg-blue-900/40 flex items-center justify-center transition-opacity ${splitPages.includes(i + 1) ? 'opacity-100' : 'opacity-0'}`}>
                                    <Check className="text-white drop-shadow-md" size={32}/>
                                </div>
                                <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 rounded">{i + 1}</div>
                            </div>
                        ))}
                    </div>
                )}

                {toolId === 'pdf-convert' && (
                    <div className="flex gap-4">
                        <button onClick={() => setConvertFormat('jpg')} className={`flex-1 p-4 rounded-lg border text-center transition-all ${convertFormat === 'jpg' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-950 border-gray-800 text-gray-400'}`}>
                            <ImageIcon className="mx-auto mb-2"/>
                            <div className="font-bold">To JPG</div>
                        </button>
                        <button onClick={() => setConvertFormat('png')} className={`flex-1 p-4 rounded-lg border text-center transition-all ${convertFormat === 'png' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-950 border-gray-800 text-gray-400'}`}>
                            <ImageIcon className="mx-auto mb-2"/>
                            <div className="font-bold">To PNG</div>
                        </button>
                        <button onClick={() => setConvertFormat('text')} className={`flex-1 p-4 rounded-lg border text-center transition-all ${convertFormat === 'text' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-950 border-gray-800 text-gray-400'}`}>
                            <FileText className="mx-auto mb-2"/>
                            <div className="font-bold">To Text</div>
                        </button>
                    </div>
                )}

                <button 
                    onClick={() => {
                        if (toolId === 'pdf-compress') handleCompress();
                        else if (toolId === 'pdf-merge-split') handleSplit();
                        else if (toolId === 'pdf-convert') handleConvert();
                    }}
                    disabled={isProcessing}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2"
                >
                    {isProcessing ? <RefreshCw className="animate-spin"/> : <Download size={20}/>}
                    {isProcessing ? `Processing ${progress > 0 ? progress + '%' : ''}` : 'Download Processed File'}
                </button>
            </div>
        )}
    </div>
  );
};