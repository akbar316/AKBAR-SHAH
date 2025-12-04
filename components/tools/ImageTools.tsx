import React, { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon, ArrowLeft, SlidersHorizontal, Lock, Unlock } from 'lucide-react';

interface ImageToolsProps {
  toolId: string;
}

export const ImageTools: React.FC<ImageToolsProps> = ({ toolId }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [filter, setFilter] = useState('none');
    const [resizeDims, setResizeDims] = useState({ w: 0, h: 0, lock: true });
    
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                if (ev.target?.result) {
                    const src = ev.target.result as string;
                    setImagePreview(src);
                    const img = new Image();
                    img.src = src;
                    img.onload = () => { setResizeDims({ w: img.width, h: img.height, lock: true }); };
                }
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

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

    useEffect(() => {
        if (!imagePreview || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.src = imagePreview;
        img.onload = () => {
            if (toolId === 'img-resize') {
                 canvas.width = resizeDims.w || img.width;
                 canvas.height = resizeDims.h || img.height;
                 if (ctx) {
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                 }
            } else {
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
                    <div className="w-full md:w-64 flex flex-col gap-6 p-4 bg-gray-900 border border-gray-800 rounded-xl">
                        <button onClick={() => {setImagePreview(null); setFilter('none');}} className="text-sm text-gray-400 hover:text-white flex items-center gap-2 mb-4">
                            <ArrowLeft size={14} /> Choose Different Image
                        </button>
                        
                        {toolId === 'img-filter' && (
                            <div className="space-y-3">
                                <h4 className="text-white font-medium flex items-center gap-2"><SlidersHorizontal size={16}/> Filters</h4>
                                {['none', 'grayscale(100%)', 'sepia(100%)', 'blur(5px)', 'contrast(200%)', 'brightness(150%)'].map(f => (
                                    <button key={f} onClick={() => setFilter(f)} className={`w-full text-left px-3 py-2 rounded text-sm ${filter === f ? 'bg-cyan-900/50 text-cyan-400 border border-cyan-500/30' : 'text-gray-400 hover:bg-gray-800'}`}>
                                        {f === 'none' ? 'Normal' : f.split('(')[0]}
                                    </button>
                                ))}
                            </div>
                        )}

                        {toolId === 'img-resize' && (
                             <div className="space-y-4">
                                <h4 className="text-white font-medium">Dimensions</h4>
                                <button onClick={() => setResizeDims(p => ({...p, lock: !p.lock}))} className={`flex items-center gap-2 text-xs ${resizeDims.lock ? 'text-cyan-400' : 'text-gray-500'} mb-2`}>
                                    {resizeDims.lock ? <Lock size={12}/> : <Unlock size={12}/>} {resizeDims.lock ? 'Aspect Ratio Locked' : 'Aspect Ratio Unlocked'}
                                </button>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Width</label>
                                        <input type="number" value={resizeDims.w} onChange={(e) => updateResizeDim('w', Number(e.target.value))} className="w-full bg-black/30 border border-gray-700 rounded p-2 text-white text-sm"/>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Height</label>
                                        <input type="number" value={resizeDims.h} onChange={(e) => updateResizeDim('h', Number(e.target.value))} className="w-full bg-black/30 border border-gray-700 rounded p-2 text-white text-sm"/>
                                    </div>
                                </div>
                             </div>
                        )}

                        <button onClick={handleDownload} className="mt-auto w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold">Download Image</button>
                    </div>

                    <div className="flex-1 bg-[#050508] border border-gray-800 rounded-xl flex items-center justify-center overflow-hidden relative p-4">
                         <div className="relative max-w-full max-h-full shadow-2xl overflow-auto border border-gray-800">
                             <canvas ref={canvasRef} className="block" style={{ maxWidth: '100%', height: 'auto' }} />
                         </div>
                    </div>
                </div>
            )}
        </div>
    );
};