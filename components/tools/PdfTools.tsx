import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, RefreshCw, PenTool, Trash2 } from 'lucide-react';
import { SubTool } from '../../types';

interface PdfToolsProps {
  toolId: string;
  toolData: SubTool;
  notify: (msg: string) => void;
}

export const PdfTools: React.FC<PdfToolsProps> = ({ toolId, toolData, notify }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [convertFormat, setConvertFormat] = useState<'Word' | 'JPG' | 'PNG'>('Word');
  
  // Signature State
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Helper for downloads
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

  // --- Signature Pad Logic ---
  useEffect(() => {
    if (toolId === 'pdf-sign' && file && signatureCanvasRef.current) {
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
  }, [toolId, file]);

  const getCoordinates = (event: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    if ('touches' in event) {
      const rect = canvas.getBoundingClientRect();
      return {
        offsetX: event.touches[0].clientX - rect.left,
        offsetY: event.touches[0].clientY - rect.top
      };
    } else {
      return {
        offsetX: (event as React.MouseEvent).nativeEvent.offsetX,
        offsetY: (event as React.MouseEvent).nativeEvent.offsetY
      };
    }
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
    if(canvas) {
        const ctx = canvas.getContext('2d');
        if(ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.beginPath();
        }
    }
  };

  const handlePDFAction = () => {
      if (!file) return;
      setLoading(true);
      
      setTimeout(() => {
        const originalName = file.name.replace(/\.[^/.]+$/, "");

        if (toolId === 'pdf-convert') {
            if (convertFormat === 'Word') {
                const content = `<html><body><h1>${originalName}</h1><p>Converted PDF.</p></body></html>`;
                const blob = new Blob([content], { type: 'application/msword' });
                triggerDownload(blob, `${originalName}.doc`);
            } else {
                const canvas = document.createElement('canvas');
                canvas.width = 595; canvas.height = 842;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.fillStyle = 'white'; ctx.fillRect(0,0, canvas.width, canvas.height);
                    ctx.fillStyle = 'black'; ctx.font = '20px Arial';
                    ctx.fillText(`File: ${file.name}`, 50, 50);
                    const mime = convertFormat === 'PNG' ? 'image/png' : 'image/jpeg';
                    canvas.toBlob((blob) => {
                        if (blob) triggerDownload(blob, `${originalName}.${convertFormat.toLowerCase()}`);
                    }, mime);
                }
            }
        } else if (toolId === 'pdf-split') {
             const blob = new Blob([`%PDF-1.4\n%Mock Split Content`], { type: 'application/pdf' });
             triggerDownload(blob, `${originalName}-split.pdf`);
        } else if (toolId === 'pdf-sign') {
             const blob = new Blob([`%PDF-1.4\n%Signed by User`], { type: 'application/pdf' });
             triggerDownload(blob, `${originalName}-signed.pdf`);
        }

        setLoading(false);
        notify(`${toolData.name} completed! File downloaded.`);
      }, 1500);
  };

  return (
      <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-700 rounded-xl bg-gray-900/50 min-h-[400px]">
        {!file ? (
          <label className="flex flex-col items-center cursor-pointer hover:bg-gray-800/50 p-10 rounded-xl transition-all">
            <Upload size={48} className="text-gray-500 mb-4" />
            <span className="text-xl text-gray-300 font-medium">Drop PDF file here</span>
            <input type="file" accept=".pdf" className="hidden" onChange={(e) => e.target.files && setFile(e.target.files[0])} />
          </label>
        ) : (
          <div className="flex flex-col items-center w-full max-w-md">
            <div className="flex items-center gap-4 bg-gray-800 p-4 rounded-lg w-full mb-6">
              <div className="w-10 h-10 bg-red-500/20 text-red-400 rounded flex items-center justify-center">PDF</div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-white font-medium">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button onClick={() => setFile(null)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            {toolId === 'pdf-split' && (
              <div className="w-full mb-6">
                <label className="text-sm text-gray-400 mb-2 block">Split Range (e.g., 1-5, 8)</label>
                <input type="text" placeholder="1-5" className="w-full bg-gray-950 border border-gray-800 rounded p-3 text-white focus:border-cyan-500 outline-none" />
              </div>
            )}

            {toolId === 'pdf-sign' && (
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

            {toolId === 'pdf-convert' && (
              <div className="w-full flex gap-4 mb-6">
                {['Word', 'JPG', 'PNG'].map(fmt => (
                  <button key={fmt} onClick={() => setConvertFormat(fmt as any)}
                    className={`flex-1 py-2 rounded text-sm transition-colors border ${convertFormat === fmt ? 'bg-cyan-900/50 border-cyan-500 text-cyan-400' : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'}`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            )}

            <button onClick={handlePDFAction} disabled={loading} className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded flex items-center justify-center gap-2">
              {loading ? <RefreshCw className="animate-spin" /> : <Download size={20} />}
              {loading ? 'Processing...' : 'Download'}
            </button>
          </div>
        )}
      </div>
  );
};