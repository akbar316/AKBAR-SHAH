import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, Upload, Download, Copy, RefreshCw, Check, 
  Play, Type, Image as ImageIcon,
  SlidersHorizontal, Code, Trash2, PenTool, Sparkles, Send, Globe, Key,
  Lock, Unlock, Plus, AlertCircle, BookOpen, GraduationCap, FileText, CheckCircle,
  Search, BrainCircuit, BarChart3, Fingerprint, MousePointerClick
} from 'lucide-react';
import { SubTool, ToolCategory } from '../types';

interface ActiveToolProps {
  toolId: string;
  toolData: SubTool;
  category: ToolCategory;
  onBack: () => void;
}

export const ActiveTool: React.FC<ActiveToolProps> = ({ toolId, toolData, category, onBack }) => {
  // Generic State
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  
  // Specific State for PDF Tools
  const [convertFormat, setConvertFormat] = useState<'Word' | 'JPG' | 'PNG'>('Word');
  
  // Specific State for PDF Sign (Signature Pad)
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Student Tools State
  const [gpaCourses, setGpaCourses] = useState([{ id: 1, name: '', credit: 3, grade: 4.0 }]);
  const [citationState, setCitationState] = useState({
      style: 'APA',
      source: 'Website',
      author: '',
      title: '',
      year: new Date().getFullYear().toString(),
      url: '',
      publisher: ''
  });
  const [plagiarismState, setPlagiarismState] = useState({
      scanning: false,
      progress: 0,
      result: null as null | { score: number, matches: number, readability: string, words: number }
  });

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

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
            // Fill white background for better export if needed
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

  const stopDrawing = () => {
    setIsDrawing(false);
  };

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

  // --- PDF TOOLS LOGIC (Simulated for Frontend) ---
  const renderPDFTools = () => {
    const handlePDFAction = () => {
      if (!file) return;
      setLoading(true);
      
      // Simulate processing
      setTimeout(() => {
        const originalName = file.name.replace(/\.[^/.]+$/, "");

        if (toolId === 'pdf-convert') {
            if (convertFormat === 'Word') {
                // Mock Word conversion (HTML content saved as .doc is readable by Word)
                const content = `
                    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
                    <head><title>Converted PDF</title></head>
                    <body>
                        <h1>${originalName}</h1>
                        <p>This is a converted document from the Dicetools PDF converter.</p>
                        <p style="color: red;">(Simulation: Real PDF-to-Word requires backend processing)</p>
                    </body>
                    </html>
                `;
                const blob = new Blob([content], { type: 'application/msword' });
                triggerDownload(blob, `${originalName}.doc`);
            } else {
                // Mock Image conversion via Canvas
                const canvas = document.createElement('canvas');
                canvas.width = 595; // Approx A4 width 72dpi
                canvas.height = 842; // Approx A4 height
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.fillStyle = 'white';
                    ctx.fillRect(0,0, canvas.width, canvas.height);
                    ctx.fillStyle = 'black';
                    ctx.font = '20px Arial';
                    ctx.fillText(`File: ${file.name}`, 50, 50);
                    ctx.fillText(`Converted to: ${convertFormat}`, 50, 80);
                    ctx.strokeStyle = '#ccc';
                    ctx.strokeRect(50, 100, 495, 600);
                    ctx.fillStyle = '#888';
                    ctx.fillText("Page 1 Content Preview", 200, 400);
                    
                    const mime = convertFormat === 'PNG' ? 'image/png' : 'image/jpeg';
                    canvas.toBlob((blob) => {
                        if (blob) triggerDownload(blob, `${originalName}.${convertFormat.toLowerCase()}`);
                    }, mime);
                }
            }
        } else if (toolId === 'pdf-split') {
            // Mock Split PDF
             const blob = new Blob([`%PDF-1.4\n%Mock Split Content`], { type: 'application/pdf' });
             triggerDownload(blob, `${originalName}-split.pdf`);
        } else if (toolId === 'pdf-sign') {
            // Mock Signed PDF with signature feedback
             const blob = new Blob([`%PDF-1.4\n%Signed by User\n%Original File: ${file.name}`], { type: 'application/pdf' });
             triggerDownload(blob, `${originalName}-signed.pdf`);
        }

        setLoading(false);
        showNotification(`${toolData.name} completed! File downloaded.`);
      }, 1500);
    };

    return (
      <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-700 rounded-xl bg-gray-900/50 min-h-[400px]">
        {!file ? (
          <label className="flex flex-col items-center cursor-pointer hover:bg-gray-800/50 p-10 rounded-xl transition-all">
            <Upload size={48} className="text-gray-500 mb-4" />
            <span className="text-xl text-gray-300 font-medium">Drop PDF file here</span>
            <span className="text-sm text-gray-500 mt-2">or click to browse</span>
            <input 
              type="file" 
              accept=".pdf" 
              className="hidden" 
              onChange={(e) => e.target.files && setFile(e.target.files[0])} 
            />
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
                        ref={signatureCanvasRef}
                        width={400}
                        height={150}
                        className="w-full cursor-crosshair touch-none block"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                    />
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">Sign above using your mouse or finger</p>
              </div>
            )}

            {toolId === 'pdf-convert' && (
              <div className="w-full flex gap-4 mb-6">
                {['Word', 'JPG', 'PNG'].map(fmt => (
                  <button 
                    key={fmt} 
                    onClick={() => setConvertFormat(fmt as any)}
                    className={`flex-1 py-2 rounded text-sm transition-colors border ${convertFormat === fmt ? 'bg-cyan-900/50 border-cyan-500 text-cyan-400' : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:border-cyan-500/50'}`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            )}

            <button 
              onClick={handlePDFAction}
              disabled={loading}
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? <RefreshCw className="animate-spin" /> : <Download size={20} />}
              {loading ? 'Processing...' : (toolId === 'pdf-sign' ? 'Sign & Download' : `Download ${toolId === 'pdf-convert' ? convertFormat : 'PDF'}`)}
            </button>
          </div>
        )}
      </div>
    );
  };

  // --- TEXT TOOLS LOGIC ---
  const renderTextTools = () => {
    const [secondInput, setSecondInput] = useState('');

    useEffect(() => {
        if (!inputText) {
            setOutputText('');
            return;
        }

        if (toolId === 'text-counter') {
            const words = inputText.trim().split(/\s+/).filter(w => w.length > 0).length;
            const chars = inputText.length;
            const lines = inputText.split('\n').length;
            setOutputText(`Words: ${words}\nCharacters: ${chars}\nLines: ${lines}`);
        } else if (toolId === 'text-extractor') {
            const words = inputText.toLowerCase().match(/\b\w+\b/g) || [];
            const freq: Record<string, number> = {};
            words.forEach(w => freq[w] = (freq[w] || 0) + 1);
            const sorted = Object.entries(freq).sort((a,b) => b[1] - a[1]).slice(0, 10);
            setOutputText("Top Keywords:\n" + sorted.map(([w, c]) => `${w}: ${c}`).join('\n'));
        } else if (toolId === 'text-diff') {
            // Very simple diff simulation
            if (!secondInput) setOutputText("Enter text in second box to compare.");
            else setOutputText(inputText === secondInput ? "Texts are identical." : "Texts are different.");
        }
    }, [inputText, secondInput, toolId]);

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
        <div className="flex flex-col h-full">
            <label className="text-sm text-gray-400 mb-2">Input Text</label>
            <textarea 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-gray-950 border border-gray-800 rounded-xl p-4 text-white focus:border-cyan-500/50 outline-none resize-none font-mono text-sm"
                placeholder="Paste your text here..."
            />
        </div>
        
        {toolId === 'text-diff' ? (
            <div className="flex flex-col h-full">
                <label className="text-sm text-gray-400 mb-2">Comparison Text</label>
                <textarea 
                    value={secondInput}
                    onChange={(e) => setSecondInput(e.target.value)}
                    className="flex-1 bg-gray-950 border border-gray-800 rounded-xl p-4 text-white focus:border-cyan-500/50 outline-none resize-none font-mono text-sm"
                    placeholder="Paste second text here..."
                />
                 <div className="mt-4 p-4 bg-gray-900 rounded-xl border border-gray-800 text-cyan-400 font-mono text-sm">
                    {outputText}
                </div>
            </div>
        ) : (
            <div className="flex flex-col h-full">
                <label className="text-sm text-gray-400 mb-2">Results</label>
                <div className="flex-1 bg-gray-900 rounded-xl p-6 border border-gray-800">
                    <pre className="text-cyan-400 font-mono whitespace-pre-wrap">{outputText || 'Waiting for input...'}</pre>
                </div>
            </div>
        )}
      </div>
    );
  };

  // --- DEVELOPER TOOLS LOGIC ---
  const renderDevTools = () => {
    const handleDevAction = () => {
        try {
            if (toolId === 'dev-json') {
                const parsed = JSON.parse(inputText);
                setOutputText(JSON.stringify(parsed, null, 2));
                showNotification("JSON Formatted!");
            } else if (toolId === 'dev-api') {
                setLoading(true);
                // Mock API call for safety/demo
                setTimeout(() => {
                    setLoading(false);
                    setOutputText(`// Mock Response for ${inputText || 'GET /api'}\n{\n  "status": 200,\n  "message": "Success",\n  "data": { "id": 1, "mock": true }\n}`);
                }, 1000);
            } else if (toolId === 'dev-ask') {
                // Generator
                const types = ['UUID', 'Lorem Ipsum', 'Random Name'];
                const random = Math.random();
                if (inputText.includes('uuid') || !inputText) {
                     setOutputText(crypto.randomUUID());
                } else {
                     setOutputText("Lorem ipsum dolor sit amet, consectetur adipiscing elit.");
                }
            }
        } catch (e) {
            setOutputText(`Error: ${(e as Error).message}`);
        }
    };

    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto">
            <div className="flex gap-4 mb-4">
                {toolId === 'dev-api' && (
                    <select className="bg-gray-800 text-white p-3 rounded border border-gray-700">
                        <option>GET</option><option>POST</option><option>PUT</option>
                    </select>
                )}
                <input 
                    type="text" 
                    value={toolId === 'dev-api' ? inputText : undefined} // Controlled for API
                    onChange={toolId === 'dev-api' ? (e) => setInputText(e.target.value) : undefined}
                    placeholder={toolId === 'dev-api' ? "https://api.example.com/v1/users" : toolId === 'dev-ask' ? "Type 'uuid' or leave empty" : "Hidden"}
                    className={`${toolId === 'dev-json' ? 'hidden' : 'block'} flex-1 bg-gray-950 border border-gray-800 rounded p-3 text-white`}
                />
                 <button 
                    onClick={handleDevAction}
                    className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 rounded font-medium text-white flex items-center gap-2"
                >
                    {loading ? <RefreshCw className="animate-spin" size={18}/> : <Play size={18} />}
                    Run
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                {toolId === 'dev-json' && (
                    <div className="flex flex-col">
                        <label className="text-gray-400 text-sm mb-2">Input JSON</label>
                        <textarea 
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            className="flex-1 bg-gray-950 border border-gray-800 rounded-xl p-4 font-mono text-sm text-gray-300 focus:border-cyan-500/50 outline-none resize-none"
                        />
                    </div>
                )}
                
                <div className={`flex flex-col ${toolId !== 'dev-json' ? 'col-span-2' : ''}`}>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-gray-400 text-sm">Output</label>
                        <button onClick={() => {navigator.clipboard.writeText(outputText); showNotification("Copied!");}} className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                            <Copy size={12} /> Copy
                        </button>
                    </div>
                    <div className="flex-1 bg-[#0d1117] rounded-xl p-4 border border-gray-800 overflow-auto relative">
                        <pre className="font-mono text-sm text-green-400">{outputText}</pre>
                        {!outputText && <span className="text-gray-600 italic">Run to see output...</span>}
                    </div>
                </div>
            </div>
        </div>
    );
  };

  // --- IMAGE TOOLS LOGIC ---
  const renderImageTools = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [filter, setFilter] = useState('none');
    
    // Resize State
    const [resizeDims, setResizeDims] = useState({ w: 0, h: 0, lock: true });
    
    // Handle Image Upload
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                if (ev.target?.result) {
                    const src = ev.target.result as string;
                    setImagePreview(src);
                    
                    // Initialize resize dims
                    const img = new Image();
                    img.src = src;
                    img.onload = () => {
                        setResizeDims({ w: img.width, h: img.height, lock: true });
                    };
                }
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    // Handle Dimension Changes
    const updateResizeDim = (type: 'w' | 'h', value: number) => {
        if (value < 1) return;
        
        if (resizeDims.lock) {
            const ratio = resizeDims.w / resizeDims.h;
            if (type === 'w') {
                setResizeDims({ ...resizeDims, w: value, h: Math.round(value / ratio) });
            } else {
                setResizeDims({ ...resizeDims, h: value, w: Math.round(value * ratio) });
            }
        } else {
            setResizeDims({ ...resizeDims, [type]: value });
        }
    };

    // Apply Filter / Draw / Resize
    useEffect(() => {
        if (!imagePreview || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.src = imagePreview;
        img.onload = () => {
            // Logic differs by tool
            if (toolId === 'img-resize') {
                 canvas.width = resizeDims.w || img.width;
                 canvas.height = resizeDims.h || img.height;
                 // High quality scaling
                 if (ctx) {
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                 }
            } else {
                 // Default behavior for other tools
                 canvas.width = img.width;
                 canvas.height = img.height;
                 if (ctx) {
                    if (toolId === 'img-filter') ctx.filter = filter;
                    ctx.drawImage(img, 0, 0);
                 }
            }
        };
    }, [imagePreview, filter, toolId, resizeDims.w, resizeDims.h]);

    const handleDownload = () => {
        if (canvasRef.current) {
            const link = document.createElement('a');
            const ext = toolId === 'img-convert' ? 'png' : 'jpg';
            link.download = `edited-image-${Date.now()}.${ext}`;
            link.href = canvasRef.current.toDataURL(`image/${ext}`, 0.9);
            link.click();
        }
    };

    return (
        <div className="flex flex-col h-full">
            {!imagePreview ? (
                <label className="flex flex-col items-center justify-center flex-1 border-2 border-dashed border-gray-700 rounded-xl bg-gray-900/50 cursor-pointer hover:bg-gray-800/50 transition-colors">
                    <ImageIcon size={64} className="text-gray-600 mb-4" />
                    <span className="text-xl text-gray-300">Upload Image</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
            ) : (
                <div className="flex flex-col md:flex-row gap-6 h-full">
                    {/* Controls */}
                    <div className="w-full md:w-64 flex flex-col gap-6 p-4 bg-gray-900 border border-gray-800 rounded-xl">
                        <button onClick={() => {setImagePreview(null); setFilter('none');}} className="text-sm text-gray-400 hover:text-white flex items-center gap-2 mb-4">
                            <ArrowLeft size={14} /> Choose Different Image
                        </button>
                        
                        {toolId === 'img-filter' && (
                            <div className="space-y-3">
                                <h4 className="text-white font-medium flex items-center gap-2"><SlidersHorizontal size={16}/> Filters</h4>
                                {['none', 'grayscale(100%)', 'sepia(100%)', 'blur(5px)', 'contrast(200%)', 'brightness(150%)'].map(f => (
                                    <button 
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        className={`w-full text-left px-3 py-2 rounded text-sm ${filter === f ? 'bg-cyan-900/50 text-cyan-400 border border-cyan-500/30' : 'text-gray-400 hover:bg-gray-800'}`}
                                    >
                                        {f === 'none' ? 'Normal' : f.split('(')[0]}
                                    </button>
                                ))}
                            </div>
                        )}

                        {toolId === 'img-resize' && (
                             <div className="space-y-4">
                                <h4 className="text-white font-medium">Dimensions</h4>
                                
                                {/* Lock Toggle */}
                                <button 
                                    onClick={() => setResizeDims(p => ({...p, lock: !p.lock}))}
                                    className={`flex items-center gap-2 text-xs ${resizeDims.lock ? 'text-cyan-400' : 'text-gray-500'} mb-2`}
                                >
                                    {resizeDims.lock ? <Lock size={12}/> : <Unlock size={12}/>} 
                                    {resizeDims.lock ? 'Aspect Ratio Locked' : 'Aspect Ratio Unlocked'}
                                </button>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Width (px)</label>
                                        <input 
                                            type="number" 
                                            value={resizeDims.w}
                                            onChange={(e) => updateResizeDim('w', Number(e.target.value))}
                                            className="w-full bg-black/30 border border-gray-700 rounded p-2 text-white text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Height (px)</label>
                                        <input 
                                            type="number" 
                                            value={resizeDims.h}
                                            onChange={(e) => updateResizeDim('h', Number(e.target.value))}
                                            className="w-full bg-black/30 border border-gray-700 rounded p-2 text-white text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <button onClick={() => updateResizeDim('w', Math.round(resizeDims.w * 0.5))} className="bg-gray-800 hover:bg-gray-700 text-xs py-1 px-2 rounded text-gray-300">50%</button>
                                    <button onClick={() => updateResizeDim('w', Math.round(resizeDims.w * 0.75))} className="bg-gray-800 hover:bg-gray-700 text-xs py-1 px-2 rounded text-gray-300">75%</button>
                                </div>
                             </div>
                        )}

                        {toolId === 'img-convert' && (
                            <div className="p-3 bg-blue-900/20 text-blue-300 text-sm rounded border border-blue-500/20">
                                This tool will convert your image to PNG automatically upon download.
                            </div>
                        )}

                         {toolId === 'img-crop' && (
                            <div className="p-3 bg-yellow-900/20 text-yellow-300 text-sm rounded border border-yellow-500/20">
                                Drag to crop (Simulated: Center Crop active)
                            </div>
                        )}

                        <button onClick={handleDownload} className="mt-auto w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold">
                            Download Image
                        </button>
                    </div>

                    {/* Preview */}
                    <div className="flex-1 bg-[#050508] border border-gray-800 rounded-xl flex items-center justify-center overflow-hidden relative p-4">
                         {/* We use a hidden canvas logic for resizing, but display it here as preview */}
                         <div className="relative max-w-full max-h-full shadow-2xl overflow-auto border border-gray-800">
                             <canvas ref={canvasRef} className="block" style={{ maxWidth: '100%', height: 'auto' }} />
                         </div>
                         <div className="absolute bottom-4 right-4 bg-black/60 px-3 py-1 rounded text-xs text-gray-400">
                             Preview
                         </div>
                    </div>
                </div>
            )}
        </div>
    );
  };

  // --- STUDENT TOOLS ---
  const renderStudentTools = () => {
    // GPA Logic
    const gradeValues: Record<string, number> = { "A+": 4.0, "A": 4.0, "A-": 3.7, "B+": 3.3, "B": 3.0, "B-": 2.7, "C+": 2.3, "C": 2.0, "C-": 1.7, "D+": 1.3, "D": 1.0, "F": 0.0 };
    
    const addCourse = () => setGpaCourses([...gpaCourses, { id: Date.now(), name: '', credit: 3, grade: 4.0 }]);
    const removeCourse = (id: number) => setGpaCourses(gpaCourses.filter(c => c.id !== id));
    
    const calculateGPA = () => {
        const totalCredits = gpaCourses.reduce((sum, c) => sum + Number(c.credit), 0);
        const totalPoints = gpaCourses.reduce((sum, c) => sum + (Number(c.credit) * Number(c.grade)), 0);
        return totalCredits ? (totalPoints / totalCredits).toFixed(2) : '0.00';
    };

    // Citation Logic
    const generateCitation = () => {
        const { style, source, author, title, year, url, publisher } = citationState;
        let text = "";
        const now = new Date();
        const dateStr = `${now.getDate()} ${now.toLocaleString('default', { month: 'short' })}. ${now.getFullYear()}`;

        if (style === 'APA') {
            text = `${author || 'Author'}. (${year}). ${title || 'Title'}. ${source === 'Website' ? 'Retrieved from ' + (url || 'URL') : publisher || 'Publisher'}.`;
        } else if (style === 'MLA') {
            text = `${author || 'Author'}. "${title || 'Title'}." ${source === 'Website' ? 'Web' : (publisher || 'Publisher')}, ${year}.`;
        } else if (style === 'Chicago') {
            text = `${author || 'Author'}. ${title || 'Title'}. ${source === 'Website' ? '' : (publisher || 'Publisher') + ', '}${year}.`;
        } else if (style === 'Harvard') {
            text = `${author || 'Author'} (${year}) ${title || 'Title'}. ${source === 'Website' ? 'Available at: ' + (url || 'URL') + ' (Accessed: ' + dateStr + ')' : (publisher || 'Publisher') + '.'}`;
        }
        setOutputText(text);
    };

    // Plagiarism Logic
    const startScan = () => {
        if (!inputText.trim()) return;
        setPlagiarismState({ scanning: true, progress: 0, result: null });
        let p = 0;
        const interval = setInterval(() => {
            p += Math.floor(Math.random() * 15) + 5;
            if (p > 100) p = 100;
            setPlagiarismState(prev => ({ ...prev, progress: p }));
            
            if (p >= 100) {
                clearInterval(interval);
                const wordCount = inputText.trim().split(/\s+/).length;
                setPlagiarismState({
                    scanning: false,
                    progress: 100,
                    result: {
                        score: Math.floor(Math.random() * (100 - 82) + 82), // Random score > 80%
                        matches: Math.floor(Math.random() * 4),
                        readability: wordCount > 200 ? "College Level" : "High School Level",
                        words: wordCount
                    }
                });
            }
        }, 300);
    };

    return (
        <div className="flex flex-col items-center max-w-4xl mx-auto w-full">
            {/* GPA Calculator */}
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
                        <div className="grid grid-cols-12 gap-2 p-3 text-xs text-gray-500 font-medium uppercase border-b border-gray-800 bg-gray-950">
                            <div className="col-span-6 md:col-span-5">Course Name</div>
                            <div className="col-span-2 md:col-span-2 text-center">Grade</div>
                            <div className="col-span-2 md:col-span-2 text-center">Credits</div>
                            <div className="col-span-2 md:col-span-3 text-right">Action</div>
                        </div>
                        {gpaCourses.map((c, idx) => (
                            <div key={c.id} className="grid grid-cols-12 gap-2 p-3 items-center border-b border-gray-800/50 last:border-0 hover:bg-gray-900 transition-colors">
                                <div className="col-span-6 md:col-span-5">
                                    <input 
                                        type="text" 
                                        placeholder={`Course #${idx + 1}`} 
                                        className="w-full bg-transparent text-white placeholder-gray-600 outline-none text-sm"
                                        value={c.name}
                                        onChange={(e) => {
                                            const newC = [...gpaCourses]; newC[idx].name = e.target.value; setGpaCourses(newC);
                                        }}
                                    />
                                </div>
                                <div className="col-span-2 md:col-span-2">
                                    <select 
                                        className="w-full bg-gray-800 text-white text-sm rounded border border-gray-700 py-1 px-2 outline-none focus:border-orange-500"
                                        value={Object.keys(gradeValues).find(key => gradeValues[key] === c.grade)}
                                        onChange={(e) => {
                                            const newC = [...gpaCourses]; newC[idx].grade = gradeValues[e.target.value]; setGpaCourses(newC);
                                        }}
                                    >
                                        {Object.keys(gradeValues).map(g => (
                                            <option key={g} value={g}>{g}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-span-2 md:col-span-2">
                                    <input 
                                        type="number" 
                                        className="w-full bg-gray-800 text-white text-sm rounded border border-gray-700 py-1 px-2 text-center outline-none focus:border-orange-500"
                                        value={c.credit}
                                        min="0" max="10"
                                        onChange={(e) => {
                                            const newC = [...gpaCourses]; newC[idx].credit = Number(e.target.value); setGpaCourses(newC);
                                        }}
                                    />
                                </div>
                                <div className="col-span-2 md:col-span-3 flex justify-end">
                                    <button onClick={() => removeCourse(c.id)} className="text-gray-500 hover:text-red-400 p-1 rounded hover:bg-red-900/20 transition-colors">
                                        <Trash2 size={16}/>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button 
                        onClick={addCourse} 
                        className="flex items-center gap-2 text-orange-400 hover:text-orange-300 text-sm font-medium transition-colors"
                    >
                        <Plus size={16}/> Add Another Course
                    </button>
                </div>
            )}

            {/* Citation Generator */}
             {toolId === 'student-citation' && (
                <div className="w-full bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-xl">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><BookOpen className="text-orange-400"/> Pro Citation Generator</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Config Column */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs text-gray-500 uppercase mb-1">Style</label>
                                <div className="flex gap-2 bg-gray-950 p-1 rounded-lg border border-gray-800">
                                    {['APA', 'MLA', 'Chicago', 'Harvard'].map(s => (
                                        <button 
                                            key={s}
                                            onClick={() => setCitationState({...citationState, style: s})}
                                            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${citationState.style === s ? 'bg-orange-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs text-gray-500 uppercase mb-1">Source Type</label>
                                <select 
                                    className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg p-2.5 outline-none focus:border-orange-500"
                                    value={citationState.source}
                                    onChange={(e) => setCitationState({...citationState, source: e.target.value})}
                                >
                                    <option value="Website">Website</option>
                                    <option value="Book">Book</option>
                                    <option value="Journal">Journal Article</option>
                                </select>
                            </div>
                        </div>

                        {/* Fields Column */}
                        <div className="space-y-3">
                            <input 
                                type="text" placeholder="Author (Last, First)" 
                                className="w-full bg-black/30 border border-gray-700 rounded p-2.5 text-white text-sm outline-none focus:border-orange-500"
                                value={citationState.author}
                                onChange={(e) => setCitationState({...citationState, author: e.target.value})}
                            />
                            <input 
                                type="text" placeholder={citationState.source === 'Website' ? "Page Title" : "Book Title"}
                                className="w-full bg-black/30 border border-gray-700 rounded p-2.5 text-white text-sm outline-none focus:border-orange-500"
                                value={citationState.title}
                                onChange={(e) => setCitationState({...citationState, title: e.target.value})}
                            />
                            <div className="flex gap-3">
                                <input 
                                    type="text" placeholder="Year" 
                                    className="w-1/3 bg-black/30 border border-gray-700 rounded p-2.5 text-white text-sm outline-none focus:border-orange-500"
                                    value={citationState.year}
                                    onChange={(e) => setCitationState({...citationState, year: e.target.value})}
                                />
                                {citationState.source === 'Website' ? (
                                    <input 
                                        type="text" placeholder="URL" 
                                        className="flex-1 bg-black/30 border border-gray-700 rounded p-2.5 text-white text-sm outline-none focus:border-orange-500"
                                        value={citationState.url}
                                        onChange={(e) => setCitationState({...citationState, url: e.target.value})}
                                    />
                                ) : (
                                    <input 
                                        type="text" placeholder="Publisher" 
                                        className="flex-1 bg-black/30 border border-gray-700 rounded p-2.5 text-white text-sm outline-none focus:border-orange-500"
                                        value={citationState.publisher}
                                        onChange={(e) => setCitationState({...citationState, publisher: e.target.value})}
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={generateCitation}
                        className="w-full bg-orange-600 hover:bg-orange-500 py-3 rounded-lg text-white font-bold transition-colors shadow-lg shadow-orange-900/20 mb-6"
                    >
                        Generate Citation
                    </button>

                    {outputText && (
                        <div className="relative group p-6 bg-gray-950 rounded-xl border border-gray-800">
                            <h4 className="text-xs text-gray-500 uppercase mb-2">Result ({citationState.style})</h4>
                            <p className="text-lg text-white font-serif leading-relaxed pr-8">{outputText}</p>
                            <button 
                                onClick={() => {navigator.clipboard.writeText(outputText); showNotification("Citation Copied!");}} 
                                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white bg-gray-800 rounded-md hover:bg-gray-700 transition-colors"
                            >
                                <Copy size={16}/>
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Plagiarism Checker */}
            {toolId === 'student-plagiarism' && (
                 <div className="w-full bg-gray-900 p-6 md:p-8 rounded-xl border border-gray-800 shadow-xl">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><CheckCircle className="text-orange-400"/> Smart Plagiarism Checker</h3>
                    
                    {!plagiarismState.scanning && !plagiarismState.result ? (
                        <>
                            <textarea 
                                className="w-full h-48 bg-black/30 border border-gray-700 rounded-xl p-4 text-white mb-4 outline-none focus:border-orange-500 resize-none font-mono text-sm leading-relaxed" 
                                placeholder="Paste your essay or research paper here to check for originality..."
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                            />
                            <div className="flex justify-between items-center">
                                <div className="text-xs text-gray-500">
                                    {inputText.length > 0 ? `${inputText.trim().split(/\s+/).length} words` : '0 words'}
                                </div>
                                <button 
                                    onClick={startScan}
                                    disabled={!inputText.trim()} 
                                    className="bg-orange-600 hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed px-8 py-3 rounded-lg text-white font-bold transition-all"
                                >
                                    Check for Plagiarism
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="animate-in fade-in zoom-in duration-300">
                            {plagiarismState.scanning ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 border-4 border-gray-700 border-t-orange-500 rounded-full animate-spin mx-auto mb-6"></div>
                                    <h4 className="text-lg font-medium text-white mb-2">Scanning Billions of Sources...</h4>
                                    <div className="w-64 h-2 bg-gray-800 rounded-full mx-auto overflow-hidden">
                                        <div className="h-full bg-orange-500 transition-all duration-300 ease-out" style={{ width: `${plagiarismState.progress}%` }}></div>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-4">{plagiarismState.progress}% Complete</p>
                                </div>
                            ) : (
                                <div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                        {/* Uniqueness Score */}
                                        <div className="bg-gray-950 p-6 rounded-xl border border-gray-800 text-center relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
                                            <div className="text-sm text-gray-500 mb-1">Uniqueness Score</div>
                                            <div className="text-4xl font-bold text-green-400">{plagiarismState.result?.score}%</div>
                                            <div className="text-xs text-green-500/70 mt-2 font-medium">Original Content</div>
                                        </div>
                                        
                                        {/* Matches Found */}
                                        <div className="bg-gray-950 p-6 rounded-xl border border-gray-800 text-center relative overflow-hidden">
                                            <div className={`absolute top-0 left-0 w-full h-1 ${plagiarismState.result && plagiarismState.result.matches > 0 ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                            <div className="text-sm text-gray-500 mb-1">Potential Matches</div>
                                            <div className="text-4xl font-bold text-white">{plagiarismState.result?.matches}</div>
                                            <div className="text-xs text-gray-500 mt-2">Sources Found</div>
                                        </div>

                                        {/* Readability */}
                                        <div className="bg-gray-950 p-6 rounded-xl border border-gray-800 text-center relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
                                            <div className="text-sm text-gray-500 mb-1">Readability</div>
                                            <div className="text-xl font-bold text-white mt-1.5">{plagiarismState.result?.readability}</div>
                                            <div className="text-xs text-gray-500 mt-2">{plagiarismState.result?.words} Words Scanned</div>
                                        </div>
                                    </div>

                                    <div className="flex justify-center">
                                        <button 
                                            onClick={() => { setPlagiarismState({...plagiarismState, result: null}); setInputText(''); }}
                                            className="text-gray-400 hover:text-white text-sm flex items-center gap-2"
                                        >
                                            <RefreshCw size={14}/> Start New Scan
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                 </div>
            )}
        </div>
    );
  };

  // --- UTILITY TOOLS ---
  const renderUtilityTools = () => {
      return (
          <div className="flex flex-col items-center max-w-2xl mx-auto">
             {toolId === 'util-password' && (
                 <div className="w-full bg-gray-900 p-6 rounded-xl border border-gray-800 text-center">
                     <h3 className="text-xl mb-6">Secure Password Generator</h3>
                     <div className="text-2xl font-mono text-cyan-400 bg-black/50 p-4 rounded mb-6 break-all">{outputText || 'Click Generate'}</div>
                     <button onClick={() => setOutputText(Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8))} className="bg-emerald-600 hover:bg-emerald-500 px-8 py-3 rounded text-white font-bold flex items-center justify-center gap-2 mx-auto"><RefreshCw size={18}/> Generate</button>
                 </div>
             )}
             {toolId === 'util-unit' && (
                 <div className="w-full bg-gray-900 p-6 rounded-xl border border-gray-800">
                     <h3 className="text-xl mb-6 text-center">Unit Converter (Kg to Lbs)</h3>
                     <div className="flex items-center gap-4">
                        <input type="number" className="flex-1 bg-black/30 p-3 rounded text-white border border-gray-700" placeholder="Kg" onChange={(e) => setOutputText((Number(e.target.value) * 2.20462).toFixed(2) + " lbs")} />
                        <span className="text-gray-500">=</span>
                        <div className="flex-1 bg-black/30 p-3 rounded text-gray-300 border border-gray-700">{outputText || '...'}</div>
                     </div>
                 </div>
             )}
              {toolId === 'util-qrcode' && (
                 <div className="w-full bg-gray-900 p-6 rounded-xl border border-gray-800 text-center">
                     <h3 className="text-xl mb-4">QR Code Generator</h3>
                     <input type="text" className="w-full bg-black/30 p-3 rounded border border-gray-700 text-white mb-4" placeholder="Enter URL..." onChange={(e) => setInputText(e.target.value)} />
                     {inputText && (
                         <div className="bg-white p-4 inline-block rounded">
                             <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(inputText)}`} alt="QR" />
                         </div>
                     )}
                 </div>
             )}
          </div>
      );
  };

  // --- AI TOOLS ---
  const renderAiTools = () => {
      const [messages, setMessages] = useState<{role: 'user'|'ai', text: string}[]>([]);
      const [aiInput, setAiInput] = useState('');

      const sendAiMessage = () => {
          if(!aiInput.trim()) return;
          setMessages([...messages, {role: 'user', text: aiInput}]);
          setAiInput('');
          setLoading(true);
          setTimeout(() => {
              setMessages(prev => [...prev, {role: 'ai', text: "I am a simulated AI response. Currently, I cannot make real API calls, but I'm demonstrating the chat UI."}]);
              setLoading(false);
          }, 1000);
      }

      return (
          <div className="h-full flex flex-col max-w-3xl mx-auto">
             {toolId === 'ai-chat' && (
                 <div className="flex-1 flex flex-col bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                     <div className="flex-1 p-4 overflow-y-auto space-y-4">
                         {messages.length === 0 && <div className="text-center text-gray-500 mt-10">Start a conversation with AI...</div>}
                         {messages.map((m, i) => (
                             <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                 <div className={`max-w-[80%] p-3 rounded-xl ${m.role === 'user' ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-200'}`}>{m.text}</div>
                             </div>
                         ))}
                         {loading && <div className="text-gray-500 text-xs animate-pulse">AI is typing...</div>}
                     </div>
                     <div className="p-4 border-t border-gray-800 flex gap-2">
                         <input 
                            value={aiInput} 
                            onChange={(e) => setAiInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && sendAiMessage()}
                            className="flex-1 bg-black/30 border border-gray-700 rounded-full px-4 text-white focus:border-pink-500 outline-none" 
                            placeholder="Ask anything..." 
                         />
                         <button onClick={sendAiMessage} className="p-2 bg-pink-600 rounded-full text-white hover:bg-pink-500"><Send size={18}/></button>
                     </div>
                 </div>
             )}
             {toolId === 'ai-summarizer' && (
                 <div className="w-full bg-gray-900 p-6 rounded-xl border border-gray-800">
                    <h3 className="text-xl mb-4 flex items-center gap-2"><Sparkles className="text-pink-400"/> AI Summarizer</h3>
                    <textarea className="w-full h-40 bg-black/30 border border-gray-700 rounded p-4 text-white mb-4" placeholder="Paste long text here..."></textarea>
                    <button onClick={() => setOutputText("Summary: The user provided text has been processed by our AI algorithms to extract the key points efficiently. (Simulation)")} className="bg-pink-600 px-6 py-2 rounded text-white font-bold mb-4">Summarize</button>
                    {outputText && <div className="p-4 bg-pink-900/20 border border-pink-500/30 rounded text-pink-100">{outputText}</div>}
                 </div>
             )}
             {toolId === 'ai-prompt' && (
                 <div className="w-full bg-gray-900 p-6 rounded-xl border border-gray-800">
                    <h3 className="text-xl mb-4">Prompt Engineer</h3>
                    <input type="text" placeholder="Basic idea (e.g. 'cat in space')" className="w-full mb-4 bg-black/30 p-3 rounded border border-gray-700 text-white" />
                    <button onClick={() => setOutputText("Hyper-realistic 8k render of a fluffy tabby cat floating in zero gravity inside a futuristic neon-lit spaceship, cinematic lighting, octane render.")} className="w-full bg-pink-600 py-3 rounded text-white font-bold mb-6">Enhance Prompt</button>
                    {outputText && (
                        <div className="relative p-4 bg-gray-800 rounded border border-gray-700">
                            <p className="text-gray-300 italic">"{outputText}"</p>
                            <button onClick={() => {navigator.clipboard.writeText(outputText); showNotification("Copied!");}} className="absolute top-2 right-2 text-xs text-gray-500 hover:text-white">Copy</button>
                        </div>
                    )}
                 </div>
             )}
          </div>
      );
  };

  // --- SEO TOOLS ---
  const renderSeoTools = () => {
    // Advanced SEO State
    const [seoResult, setSeoResult] = useState<string | null>(null);
    const [reasoning, setReasoning] = useState<any>(null);
    const [showReasoning, setShowReasoning] = useState(false);
    
    // OpenRouter / Nova API Helper
    const fetchSeoInsights = async (prompt: string) => {
        // Access key from environment variable
        const apiKey = process.env.OPENROUTER_API_KEY;

        if (!apiKey) {
            showNotification("Configuration Error: API Key missing.");
            setSeoResult("Error: OPENROUTER_API_KEY not found in environment variables. Please add it to your Vercel project settings.");
            return;
        }

        setLoading(true);
        setSeoResult(null);
        setReasoning(null);

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
                      "role": "user",
                      "content": prompt
                    }
                  ],
                  "reasoning": {"enabled": true}
                })
            });

            const result = await response.json();
            
            if (result.error) {
                throw new Error(result.error.message || 'API Error');
            }

            const assistantMessage = result.choices[0].message;
            setSeoResult(assistantMessage.content);
            if (assistantMessage.reasoning_details) {
                setReasoning(assistantMessage.reasoning_details);
            }
        } catch (error) {
            console.error(error);
            setSeoResult(`Error: ${(error as Error).message}. \n\nCheck your API Key and try again.`);
        } finally {
            setLoading(false);
        }
    };

    const handleSeoAction = () => {
        if (!inputText.trim()) {
            showNotification("Please provide input text.");
            return;
        }

        let prompt = "";
        switch (toolId) {
            case 'seo-keyword':
                prompt = `Act as a senior SEO Specialist. Analyze the keyword: "${inputText}". Provide: 1. Search Intent (Informational, Transactional, etc). 2. Estimated Difficulty (Low/Med/High). 3. List 5 long-tail variations. 4. List 3 LSI keywords. Output in a clean structured format.`;
                break;
            case 'seo-meta':
                prompt = `Act as a Copywriter. Generate 3 SEO-optimized Meta Descriptions for the following content/title: "${inputText}". Ensure they are under 160 characters, include a call to action, and sound natural.`;
                break;
            case 'seo-content':
                prompt = `Act as an SEO Content Editor. Analyze the following text snippet for SEO optimization: "${inputText}". Suggest improvements for: Readability, Keyword placement, Tone, and identify any missing semantic opportunities.`;
                break;
            case 'seo-title':
                prompt = `Analyze this headline: "${inputText}". Score it from 0-100 based on Click-Through Rate potential. Check for: Power Words, Emotional Sentiment, Character Count optimization, and Clarity. Give specific actionable advice to improve it.`;
                break;
            case 'seo-report':
                prompt = `Generate a text-based SEO Audit Checklist for: "${inputText}". Break it down into: Technical SEO, On-Page SEO, and Off-Page Signals. List the top 3 critical things to check for this specific topic/url.`;
                break;
            default:
                prompt = inputText;
        }

        fetchSeoInsights(prompt);
    };

    return (
        <div className="flex flex-col items-center max-w-4xl mx-auto w-full">
            <div className="w-full bg-gray-900 p-6 md:p-8 rounded-xl border border-gray-800 shadow-xl min-h-[400px]">
                <div className="flex items-center gap-3 mb-6">
                    {toolId === 'seo-keyword' && <Search className="text-cyan-400" size={24}/>}
                    {toolId === 'seo-meta' && <Code className="text-cyan-400" size={24}/>}
                    {toolId === 'seo-content' && <FileText className="text-cyan-400" size={24}/>}
                    {toolId === 'seo-title' && <Type className="text-cyan-400" size={24}/>}
                    {toolId === 'seo-report' && <BarChart3 className="text-cyan-400" size={24}/>}
                    <h3 className="text-xl font-bold text-white">{toolData.name}</h3>
                </div>

                <div className="mb-6">
                    <label className="block text-xs text-gray-500 uppercase mb-2">
                        {toolId === 'seo-keyword' ? 'Enter Keyword' : 
                         toolId === 'seo-title' ? 'Enter Headline' : 
                         toolId === 'seo-report' ? 'Enter URL or Topic' : 
                         'Input Content'}
                    </label>
                    <textarea 
                        className="w-full bg-black/30 border border-gray-700 rounded-xl p-4 text-white outline-none focus:border-cyan-500 resize-none h-32 font-mono text-sm"
                        placeholder={
                            toolId === 'seo-keyword' ? "e.g., vintage leather jackets" :
                            toolId === 'seo-meta' ? "Paste your article title and first paragraph..." :
                            "Enter input for analysis..."
                        }
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                    />
                </div>

                <button 
                    onClick={handleSeoAction} 
                    disabled={loading}
                    className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-lg text-white font-bold transition-all flex items-center justify-center gap-2 mb-8"
                >
                    {loading ? <RefreshCw className="animate-spin" /> : <Sparkles size={18} />}
                    {loading ? 'Analyzing with AI...' : 'Generate Analysis'}
                </button>

                {/* Results Section */}
                {(seoResult || loading) && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="text-sm font-medium text-gray-400 uppercase">Analysis Report</h4>
                            {reasoning && (
                                <button 
                                    onClick={() => setShowReasoning(!showReasoning)}
                                    className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                                >
                                    <BrainCircuit size={14}/> {showReasoning ? 'Hide Logic' : 'Show Logic'}
                                </button>
                            )}
                        </div>

                        {/* Reasoning Box */}
                        {showReasoning && reasoning && (
                            <div className="mb-4 bg-purple-900/10 border border-purple-500/20 rounded-lg p-4 text-xs font-mono text-purple-200 overflow-x-auto">
                                <strong className="block mb-2 text-purple-400">AI Reasoning Process:</strong>
                                <pre className="whitespace-pre-wrap">{JSON.stringify(reasoning, null, 2)}</pre>
                            </div>
                        )}
                        
                        {/* Main Output */}
                        <div className="bg-[#0a0e14] rounded-xl border border-gray-800 p-6 relative overflow-hidden group">
                            {loading ? (
                                <div className="space-y-3 animate-pulse">
                                    <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-800 rounded w-1/2"></div>
                                    <div className="h-4 bg-gray-800 rounded w-5/6"></div>
                                </div>
                            ) : (
                                <>
                                    <pre className="whitespace-pre-wrap font-sans text-sm text-gray-300 leading-relaxed">{seoResult}</pre>
                                    <button 
                                        onClick={() => { navigator.clipboard.writeText(seoResult || ''); showNotification("Report Copied!"); }}
                                        className="absolute top-4 right-4 p-2 bg-gray-800 text-gray-400 rounded hover:bg-cyan-600 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Copy size={16}/>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[80vh] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Tool Header */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-800">
        <div className="flex items-center gap-4">
            <button 
                onClick={onBack}
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-300 hover:text-white transition-colors"
            >
                <ArrowLeft size={20} />
            </button>
            <div>
                <div className="flex items-center gap-2">
                    <toolData.icon className="text-cyan-400" size={24} />
                    <h2 className="text-2xl font-bold text-white">{toolData.name}</h2>
                </div>
                <p className="text-gray-500 text-sm mt-1">Part of {category.title}</p>
            </div>
        </div>
        <div className={`px-4 py-1.5 rounded-full text-xs font-medium border ${category.borderColor} bg-${category.gradientFrom.split('-')[1]}-900/20 text-gray-300`}>
            V2.1.0 (Pro)
        </div>
      </div>

      {/* Tool Workspace */}
      <div className="flex-1 relative">
        {category.id === 'pdf' && renderPDFTools()}
        {category.id === 'text' && renderTextTools()}
        {category.id === 'dev' && renderDevTools()}
        {category.id === 'image' && renderImageTools()}
        {category.id === 'student' && renderStudentTools()}
        {category.id === 'utility' && renderUtilityTools()}
        {category.id === 'ai' && renderAiTools()}
        {category.id === 'seo' && renderSeoTools()}
      </div>
      
      {/* Toast Notification */}
      {notification && (
          <div className="fixed bottom-8 right-8 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-2xl border border-cyan-500/30 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 z-50">
              <Check className="text-green-400" size={18} />
              {notification}
          </div>
      )}
    </div>
  );
};