import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, RefreshCw, PenTool, Trash2, FileWord, FileImage, Merge, Shrink, Image as ImageIcon } from 'lucide-react';
import { SubTool } from '../../types';
import { PDFDocument, rgb, degrees } from 'pdf-lib';

interface PdfToolsProps {
  toolId: string;
  toolData: SubTool;
  notify: (msg: string) => void;
}

export const PdfTools: React.FC<PdfToolsProps> = ({ toolId, toolData, notify }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [convertFormat, setConvertFormat] = useState<'Word' | 'JPG' | 'PNG'>('Word');
  const [splitRange, setSplitRange] = useState('');

  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (toolId === 'pdf-editor' && files.length > 0 && signatureCanvasRef.current) {
      const canvas = signatureCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [toolId, files]);

  const getCoordinates = (event: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    if ('touches' in event) {
      return {
        offsetX: event.touches[0].clientX - rect.left,
        offsetY: event.touches[0].clientY - rect.top
      };
    }
    return {
      offsetX: (event as React.MouseEvent).nativeEvent.offsetX,
      offsetY: (event as React.MouseEvent).nativeEvent.offsetY
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    const { offsetX, offsetY } = getCoordinates(e, canvas);
    ctx.moveTo(offsetX, offsetY);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { offsetX, offsetY } = getCoordinates(e, canvas);
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
  };

  const stopDrawing = () => { setIsDrawing(false); };

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
      }
    }
  };

  const handlePDFAction = async () => {
    if (files.length === 0) return;
    setLoading(true);

    try {
      const file = files[0];
      const originalName = file.name.replace(/\.[^/.]+$/, "");
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      if (toolId === 'pdf-to-word') {
        // Placeholder for PDF to Word logic
        notify('PDF to Word conversion is a complex feature and will be implemented soon.');
      } else if (toolId === 'pdf-to-image') {
        // Placeholder for PDF to Image logic
        notify('PDF to Image conversion is a complex feature and will be implemented soon.');
      } else if (toolId === 'image-to-pdf') {
          const newDoc = await PDFDocument.create();
          for (const file of files) {
              const imageBytes = await file.arrayBuffer();
              const image = await newDoc.embedPng(imageBytes);
              const page = newDoc.addPage();
              page.drawImage(image, {
                  x: 0,
                  y: 0,
                  width: page.getWidth(),
                  height: page.getHeight(),
              });
          }
          const pdfBytes = await newDoc.save();
          triggerDownload(new Blob([pdfBytes], { type: 'application/pdf' }), `converted.pdf`);

      } else if (toolId === 'pdf-merge') {
          const mergedDoc = await PDFDocument.create();
          for (const file of files) {
              const pdfBytes = await file.arrayBuffer();
              const pdf = await PDFDocument.load(pdfBytes);
              const copiedPages = await mergedDoc.copyPages(pdf, pdf.getPageIndices());
              copiedPages.forEach(page => mergedDoc.addPage(page));
          }
          const pdfBytes = await mergedDoc.save();
          triggerDownload(new Blob([pdfBytes], { type: 'application/pdf' }), `merged.pdf`);

      } else if (toolId === 'pdf-compress') {
        // Placeholder for PDF Compression
        notify('PDF compression is a complex feature and will be implemented soon.');
      } else if (toolId === 'pdf-split') {
        const newDoc = await PDFDocument.create();
        const ranges = splitRange.split(',').map(r => r.trim());
        const pagesToCopy: number[] = [];

        for (const range of ranges) {
            if (range.includes('-')) {
                const [start, end] = range.split('-').map(Number);
                for (let i = start; i <= end; i++) {
                    pagesToCopy.push(i - 1);
                }
            } else {
                pagesToCopy.push(Number(range) - 1);
            }
        }
        
        const copiedPages = await newDoc.copyPages(pdfDoc, pagesToCopy);
        copiedPages.forEach(page => newDoc.addPage(page));

        const pdfBytes = await newDoc.save();
        triggerDownload(new Blob([pdfBytes], { type: 'application/pdf' }), `${originalName}-split.pdf`);

      } else if (toolId === 'pdf-editor') {
        const signatureCanvas = signatureCanvasRef.current;
        if (signatureCanvas) {
            const signatureImageBytes = await new Promise<string>((resolve) => {
                signatureCanvas.toBlob(blob => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(blob!);
                });
            });

            const signatureImage = await pdfDoc.embedPng(signatureImageBytes);
            const firstPage = pdfDoc.getPage(0);
            
            firstPage.drawImage(signatureImage, {
                x: firstPage.getWidth() / 2 - 100,
                y: 100,
                width: 200,
                height: 75,
            });

            const pdfBytes = await pdfDoc.save();
            triggerDownload(new Blob([pdfBytes], { type: 'application/pdf' }), `${originalName}-edited.pdf`);
        }
      }

      notify(`${toolData.name} completed! File downloaded.`);

    } catch (error) {
      console.error(error);
      notify(`An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (files.length === 0) {
      return (
        <label className="flex flex-col items-center cursor-pointer hover:bg-gray-800/50 p-10 rounded-xl transition-all">
          <Upload size={48} className="text-gray-500 mb-4" />
          <span className="text-xl text-gray-300 font-medium">Drop files here</span>
          <input type="file" multiple className="hidden" onChange={(e) => e.target.files && setFiles(Array.from(e.target.files))} />
        </label>
      );
    }

    return (
      <div className="flex flex-col items-center w-full max-w-md">
        <div className="flex flex-col gap-4 bg-gray-800 p-4 rounded-lg w-full mb-6">
        {files.map((file, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="w-10 h-10 bg-red-500/20 text-red-400 rounded flex items-center justify-center">{file.type.split('/')[1].toUpperCase()}</div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-white font-medium">{file.name}</p>
              <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
        ))}
          <button onClick={() => setFiles([])} className="text-gray-400 hover:text-white self-end">Remove all</button>
        </div>

        {toolId === 'pdf-split' && (
          <div className="w-full mb-6">
            <label className="text-sm text-gray-400 mb-2 block">Split Range (e.g., 1-5, 8)</label>
            <input 
              type="text" 
              placeholder="1-5,8" 
              className="w-full bg-gray-950 border border-gray-800 rounded p-3 text-white focus:border-cyan-500 outline-none"
              value={splitRange}
              onChange={(e) => setSplitRange(e.target.value)}
            />
          </div>
        )}

        {toolId === 'pdf-editor' && (
          <div className="w-full mb-6 bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-inner">
            <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-gray-300 flex items-center gap-2"><PenTool size={14}/> Draw Signature</label>
                <button onClick={clearSignature} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors">
                    <Trash2 size={12}/> Clear
                </button>
            </div>
            <div className="bg-white rounded overflow-hidden">
                <canvas 
                    ref={signatureCanvasRef} width={400} height={150}
                    className="w-full cursor-crosshair touch-none block"
                    onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing}
                />
            </div>
          </div>
        )}

        <button onClick={handlePDFAction} disabled={loading} className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded flex items-center justify-center gap-2">
          {loading ? <RefreshCw className="animate-spin" /> : <Download size={20} />}
          {loading ? 'Processing...' : 'Download'}
        </button>
      </div>
    );
  };

  return (
      <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-700 rounded-xl bg-gray-900/50 min-h-[400px]">
        {renderContent()}
      </div>
  );
};
