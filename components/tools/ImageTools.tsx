
import React, { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon, ArrowLeft, SlidersHorizontal, Lock, Unlock, Download, FileType, Layers, Wand2, RotateCcw, Droplet, Sun, Contrast, Palette, Crop, Monitor, Smartphone, LayoutTemplate, Move, RotateCw, FlipHorizontal, FlipVertical, Grid3X3, Check, BarChart3, Eye, EyeOff, Aperture, Activity, Gauge, Stamp, Upload } from 'lucide-react';

interface ImageToolsProps {
  toolId: string;
}

export const ImageTools: React.FC<ImageToolsProps> = ({ toolId }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const histogramRef = useRef<HTMLCanvasElement>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [originalSize, setOriginalSize] = useState<number>(0);
    const [originalDims, setOriginalDims] = useState({ w: 0, h: 0 });
    
    // --- RESIZE STATE ---
    const [resizeDims, setResizeDims] = useState({ w: 0, h: 0, lock: true });
    const [resizeSettings, setResizeSettings] = useState<{ unit: 'px' | '%', quality: 'high' | 'medium' | 'low' }>({ unit: 'px', quality: 'high' });
    
    // --- CROP STATE ---
    const [cropRect, setCropRect] = useState<{ x: number, y: number, w: number, h: number } | null>(null);
    const [cropTransform, setCropTransform] = useState({ rotate: 0, flipH: false, flipV: false, zoom: 1 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragHandle, setDragHandle] = useState<string | null>(null); 
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [cropAspect, setCropAspect] = useState<number | null>(null); 
    const [showGrid, setShowGrid] = useState(true);

    // --- WATERMARK STATE ---
    const [watermarkType, setWatermarkType] = useState<'text' | 'image'>('text');
    const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
    const [watermarkImgSrc, setWatermarkImgSrc] = useState<string | null>(null);
    const [wmSettings, setWmSettings] = useState({
        opacity: 50,
        size: 50, // % scale relative to canvas
        rotation: 0,
        color: '#ffffff',
        position: 'center' as 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
    });

    // --- ADVANCED FILTER STATE ---
    const defaultFilters = {
        // Light
        brightness: 100,
        contrast: 100,
        exposure: 0, // New
        // Color
        saturate: 100,
        hueRotate: 0,
        sepia: 0,
        grayscale: 0,
        invert: 0,
        tintColor: '#000000', // New
        tintOpacity: 0, // New
        // Detail & Effects
        blur: 0,
        noise: 0, // New
        pixelate: 0, // New
        vignette: 0, // New
        sharpen: 0 // Placeholder for future
    };
    const [filterValues, setFilterValues] = useState(defaultFilters);
    const [activeFilterTab, setActiveFilterTab] = useState<'light' | 'color' | 'detail'>('light');
    const [isComparing, setIsComparing] = useState(false); // Press to compare
    
    // --- CONVERT STATE ---
    const [targetFormat, setTargetFormat] = useState<string>('image/png');
    const [quality, setQuality] = useState<number>(0.9);
    const [estimatedSize, setEstimatedSize] = useState<number | null>(null);

    const socialPresets = [
        { label: 'IG Post', w: 1080, h: 1080 },
        { label: 'IG Story', w: 1080, h: 1920 },
        { label: 'Twitter Header', w: 1500, h: 500 },
        { label: 'YouTube Thumb', w: 1280, h: 720 },
        { label: 'Full HD', w: 1920, h: 1080 },
        { label: '4K UHD', w: 3840, h: 2160 },
    ];

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setOriginalSize(file.size);
            const reader = new FileReader();
            reader.onload = (ev) => {
                if (ev.target?.result) {
                    const src = ev.target.result as string;
                    setImagePreview(src);
                    const img = new Image();
                    img.src = src;
                    img.onload = () => { 
                        setOriginalDims({ w: img.width, h: img.height });
                        setResizeDims({ w: img.width, h: img.height, lock: true });
                        // Init Crop
                        const padding = 50;
                        setCropRect({ x: padding, y: padding, w: img.width - (padding*2), h: img.height - (padding*2) });
                        setCropTransform({ rotate: 0, flipH: false, flipV: false, zoom: 1 });
                    };
                    setFilterValues(defaultFilters);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    // --- FILTER & RENDER ENGINE ---

    const updateHistogram = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        if (!histogramRef.current) return;
        const hCtx = histogramRef.current.getContext('2d');
        if (!hCtx) return;

        // Sampling for performance
        const sampleRate = Math.max(1, Math.floor((width * height) / 50000)); 
        const imgData = ctx.getImageData(0, 0, width, height).data;
        const r = new Array(256).fill(0);
        const g = new Array(256).fill(0);
        const b = new Array(256).fill(0);

        for (let i = 0; i < imgData.length; i += 4 * sampleRate) {
            r[imgData[i]]++;
            g[imgData[i + 1]]++;
            b[imgData[i + 2]]++;
        }

        const max = Math.max(...r, ...g, ...b);
        hCtx.clearRect(0, 0, histogramRef.current.width, histogramRef.current.height);
        hCtx.globalCompositeOperation = 'screen';

        const drawChannel = (data: number[], color: string) => {
            hCtx.fillStyle = color;
            hCtx.beginPath();
            hCtx.moveTo(0, histogramRef.current!.height);
            data.forEach((val, i) => {
                const h = (val / max) * histogramRef.current!.height;
                hCtx.lineTo((i / 255) * histogramRef.current!.width, histogramRef.current!.height - h);
            });
            hCtx.lineTo(histogramRef.current!.width, histogramRef.current!.height);
            hCtx.fill();
        };

        drawChannel(r, 'rgba(255, 0, 0, 0.5)');
        drawChannel(g, 'rgba(0, 255, 0, 0.5)');
        drawChannel(b, 'rgba(0, 0, 255, 0.5)');
    };

    const applyAdvancedFilters = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        if (filterValues.noise > 0) {
            const imageData = ctx.getImageData(0, 0, width, height);
            const data = imageData.data;
            const amount = filterValues.noise * 2.55; 
            for (let i = 0; i < data.length; i += 4) {
                const noise = (Math.random() - 0.5) * amount;
                data[i] = data[i] + noise;
                data[i+1] = data[i+1] + noise;
                data[i+2] = data[i+2] + noise;
            }
            ctx.putImageData(imageData, 0, 0);
        }

        if (filterValues.vignette > 0) {
            const gradient = ctx.createRadialGradient(width/2, height/2, width/4, width/2, height/2, Math.max(width, height)/1.2);
            gradient.addColorStop(0, 'rgba(0,0,0,0)');
            gradient.addColorStop(1, `rgba(0,0,0,${filterValues.vignette / 100})`);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
        }

        if (filterValues.tintOpacity > 0) {
            ctx.globalCompositeOperation = 'overlay';
            ctx.fillStyle = filterValues.tintColor;
            ctx.globalAlpha = filterValues.tintOpacity / 100;
            ctx.fillRect(0, 0, width, height);
            ctx.globalAlpha = 1.0;
            ctx.globalCompositeOperation = 'source-over';
        }
    };

    const getCSSFilterString = () => {
        // Pixelate is handled via imageSmoothingEnabled = false during draw
        return `
            brightness(${filterValues.brightness + filterValues.exposure}%) 
            contrast(${filterValues.contrast}%) 
            saturate(${filterValues.saturate}%) 
            grayscale(${filterValues.grayscale}%) 
            sepia(${filterValues.sepia}%) 
            hue-rotate(${filterValues.hueRotate}deg) 
            blur(${filterValues.blur}px) 
            invert(${filterValues.invert}%)
        `;
    };

    const drawWatermark = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        ctx.save();
        ctx.globalAlpha = wmSettings.opacity / 100;

        let x = width / 2;
        let y = height / 2;
        const padding = Math.min(width, height) * 0.05;

        switch (wmSettings.position) {
            case 'top-left': x = padding; y = padding; break;
            case 'top-right': x = width - padding; y = padding; break;
            case 'bottom-left': x = padding; y = height - padding; break;
            case 'bottom-right': x = width - padding; y = height - padding; break;
            case 'center': default: x = width / 2; y = height / 2; break;
        }

        ctx.translate(x, y);
        ctx.rotate((wmSettings.rotation * Math.PI) / 180);

        const baseScale = Math.min(width, height) * (wmSettings.size / 100);

        if (watermarkType === 'text') {
            ctx.font = `bold ${baseScale * 0.3}px sans-serif`;
            ctx.fillStyle = wmSettings.color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Drop shadow for better visibility
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 5;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            
            ctx.fillText(watermarkText, 0, 0);
        } else if (watermarkImgSrc) {
            const wmImg = new Image();
            wmImg.src = watermarkImgSrc;
            // Draw immediately if cached, otherwise handle async
            // Note: In real app, might need to preload. For local dataURL it's usually fast enough for next frame.
            if (wmImg.complete) {
                 const aspect = wmImg.width / wmImg.height;
                 const w = baseScale;
                 const h = w / aspect;
                 ctx.drawImage(wmImg, -w/2, -h/2, w, h);
            } else {
                wmImg.onload = () => {
                     const aspect = wmImg.width / wmImg.height;
                     const w = baseScale;
                     const h = w / aspect;
                     ctx.drawImage(wmImg, -w/2, -h/2, w, h);
                }
            }
        }

        ctx.restore();
    };

    useEffect(() => {
        if (!imagePreview || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        const img = new Image();
        img.src = imagePreview;
        img.onload = () => {
            // Setup Dimensions
            if (toolId === 'img-crop') {
                 canvas.width = img.width;
                 canvas.height = img.height;
            } else if (toolId === 'img-resize') {
                 canvas.width = resizeDims.w || img.width;
                 canvas.height = resizeDims.h || img.height;
            } else {
                 canvas.width = img.width;
                 canvas.height = img.height;
            }

            // --- FILTER PIPELINE ---
            ctx.save();
            ctx.clearRect(0,0, canvas.width, canvas.height);

            if (toolId === 'img-filter' && !isComparing) {
                // ... (Filter logic unchanged)
                // 1. Pixelate Logic (Must draw small then scale up)
                if (filterValues.pixelate > 0) {
                    const pixelFactor = Math.max(0.01, 1 - (filterValues.pixelate / 100));
                    const w = canvas.width * pixelFactor;
                    const h = canvas.height * pixelFactor;
                    
                    const offCanvas = document.createElement('canvas');
                    offCanvas.width = w; offCanvas.height = h;
                    const offCtx = offCanvas.getContext('2d');
                    if (offCtx) {
                        offCtx.drawImage(img, 0, 0, w, h);
                        ctx.imageSmoothingEnabled = false;
                        ctx.filter = getCSSFilterString();
                        ctx.drawImage(offCanvas, 0, 0, w, h, 0, 0, canvas.width, canvas.height);
                    }
                } else {
                    ctx.imageSmoothingEnabled = true;
                    ctx.filter = getCSSFilterString();
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                }
                
                ctx.filter = 'none';
                applyAdvancedFilters(ctx, canvas.width, canvas.height);
                updateHistogram(ctx, canvas.width, canvas.height);
            } 
            else if (toolId === 'img-crop') {
                // ... (Crop logic unchanged)
                // Apply Transforms (Rotate/Flip)
                ctx.translate(canvas.width/2, canvas.height/2);
                ctx.rotate((cropTransform.rotate * Math.PI) / 180);
                ctx.scale(
                    (cropTransform.flipH ? -1 : 1) * cropTransform.zoom, 
                    (cropTransform.flipV ? -1 : 1) * cropTransform.zoom
                );
                ctx.drawImage(img, -img.width/2, -img.height/2);
                ctx.restore();

                // Draw Overlay Logic
                if (cropRect) {
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.clearRect(cropRect.x, cropRect.y, cropRect.w, cropRect.h);
                    ctx.save();
                    ctx.beginPath();
                    ctx.rect(cropRect.x, cropRect.y, cropRect.w, cropRect.h);
                    ctx.clip();
                    ctx.translate(canvas.width/2, canvas.height/2);
                    ctx.rotate((cropTransform.rotate * Math.PI) / 180);
                    ctx.scale((cropTransform.flipH ? -1 : 1) * cropTransform.zoom, (cropTransform.flipV ? -1 : 1) * cropTransform.zoom);
                    ctx.drawImage(img, -img.width/2, -img.height/2);
                    ctx.restore();
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(cropRect.x, cropRect.y, cropRect.w, cropRect.h);
                    if (showGrid) {
                        ctx.beginPath();
                        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                        ctx.lineWidth = 1;
                        ctx.moveTo(cropRect.x + cropRect.w / 3, cropRect.y); ctx.lineTo(cropRect.x + cropRect.w / 3, cropRect.y + cropRect.h);
                        ctx.moveTo(cropRect.x + (cropRect.w / 3) * 2, cropRect.y); ctx.lineTo(cropRect.x + (cropRect.w / 3) * 2, cropRect.y + cropRect.h);
                        ctx.moveTo(cropRect.x, cropRect.y + cropRect.h / 3); ctx.lineTo(cropRect.x + cropRect.w, cropRect.y + cropRect.h / 3);
                        ctx.moveTo(cropRect.x, cropRect.y + (cropRect.h / 3) * 2); ctx.lineTo(cropRect.x + cropRect.w, cropRect.y + (cropRect.h / 3) * 2);
                        ctx.stroke();
                    }
                }
            } else {
                // Resize / Convert / Watermark / Compare Base
                if (toolId === 'img-resize') {
                    ctx.imageSmoothingQuality = resizeSettings.quality;
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                } else {
                     if (toolId === 'img-convert') ctx.filter = getCSSFilterString();
                     ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                     ctx.filter = 'none';
                }

                // --- APPLY WATERMARK ---
                if (toolId === 'img-watermark') {
                    if (watermarkType === 'image' && watermarkImgSrc) {
                         const wmImg = new Image();
                         wmImg.src = watermarkImgSrc;
                         wmImg.onload = () => {
                             drawWatermark(ctx, canvas.width, canvas.height);
                         };
                         // Handle cached image case
                         if (wmImg.complete) drawWatermark(ctx, canvas.width, canvas.height);
                    } else {
                        drawWatermark(ctx, canvas.width, canvas.height);
                    }
                }
            }
            ctx.restore();

            // Estimate Size
            if (toolId === 'img-convert') {
                canvas.toBlob((blob) => { if (blob) setEstimatedSize(blob.size); }, targetFormat, quality);
            }
        };
    }, [imagePreview, toolId, resizeDims, resizeSettings, targetFormat, quality, filterValues, cropRect, cropTransform, showGrid, isComparing, watermarkText, wmSettings, watermarkType, watermarkImgSrc]);


    // ... (Mouse Handlers for Crop - omitted to save space, logic remains same as previous version but ensures they are present in final file)
    const getMousePos = (e: React.MouseEvent | React.TouchEvent) => {
        if (!canvasRef.current) return { x: 0, y: 0 };
        const rect = canvasRef.current.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        const scaleX = canvasRef.current.width / rect.width;
        const scaleY = canvasRef.current.height / rect.height;
        return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
    };
    const handleCropStart = (e: React.MouseEvent | React.TouchEvent) => {
        if (toolId !== 'img-crop' || !cropRect) return;
        const pos = getMousePos(e);
        const handleSize = 20 * (canvasRef.current!.width / 600); 
        if (Math.abs(pos.x - cropRect.x) < handleSize && Math.abs(pos.y - cropRect.y) < handleSize) setDragHandle('nw');
        else if (Math.abs(pos.x - (cropRect.x + cropRect.w)) < handleSize && Math.abs(pos.y - cropRect.y) < handleSize) setDragHandle('ne');
        else if (Math.abs(pos.x - cropRect.x) < handleSize && Math.abs(pos.y - (cropRect.y + cropRect.h)) < handleSize) setDragHandle('sw');
        else if (Math.abs(pos.x - (cropRect.x + cropRect.w)) < handleSize && Math.abs(pos.y - (cropRect.y + cropRect.h)) < handleSize) setDragHandle('se');
        else if (pos.x > cropRect.x && pos.x < cropRect.x + cropRect.w && pos.y > cropRect.y && pos.y < cropRect.y + cropRect.h) setDragHandle('move');
        else return;
        setIsDragging(true); setDragStart(pos);
    };
    const handleCropMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDragging || !cropRect || !dragHandle || !canvasRef.current) return;
        const pos = getMousePos(e);
        const dx = pos.x - dragStart.x; const dy = pos.y - dragStart.y;
        const newRect = { ...cropRect };
        const minSize = 50;
        if (dragHandle === 'move') {
            newRect.x += dx; newRect.y += dy;
            if (newRect.x < 0) newRect.x = 0; if (newRect.y < 0) newRect.y = 0;
            if (newRect.x + newRect.w > canvasRef.current.width) newRect.x = canvasRef.current.width - newRect.w;
            if (newRect.y + newRect.h > canvasRef.current.height) newRect.y = canvasRef.current.height - newRect.h;
        } else {
            if (dragHandle.includes('n')) { newRect.y += dy; newRect.h -= dy; }
            if (dragHandle.includes('s')) { newRect.h += dy; }
            if (dragHandle.includes('w')) { newRect.x += dx; newRect.w -= dx; }
            if (dragHandle.includes('e')) { newRect.w += dx; }
            if (cropAspect) {
                if (dragHandle === 'se' || dragHandle === 'nw') newRect.h = newRect.w / cropAspect;
                else newRect.w = newRect.h * cropAspect;
            }
            if (newRect.w < minSize) newRect.w = minSize; if (newRect.h < minSize) newRect.h = minSize;
        }
        setCropRect(newRect); setDragStart(pos);
    };
    const handleCropEnd = () => { setIsDragging(false); setDragHandle(null); };


    // --- DOWNLOAD ---
    const handleDownload = () => {
        if (!canvasRef.current) return;
        const link = document.createElement('a');
        let ext = 'png'; let mime = 'image/png';
        if (toolId === 'img-convert') { mime = targetFormat; ext = targetFormat.split('/')[1]; } 
        else { ext = 'jpg'; mime = 'image/jpeg'; }
        
        // Use temp canvas for crop to save specific region
        if (toolId === 'img-crop' && cropRect && imagePreview) {
             const tempCanvas = document.createElement('canvas');
             tempCanvas.width = cropRect.w; tempCanvas.height = cropRect.h;
             const tCtx = tempCanvas.getContext('2d');
             const img = new Image(); img.src = imagePreview;
             img.onload = () => {
                 if (!tCtx) return;
                 tCtx.save();
                 tCtx.translate(-cropRect.x, -cropRect.y);
                 tCtx.translate(canvasRef.current!.width/2, canvasRef.current!.height/2);
                 tCtx.rotate((cropTransform.rotate * Math.PI) / 180);
                 tCtx.scale((cropTransform.flipH ? -1 : 1) * cropTransform.zoom, (cropTransform.flipV ? -1 : 1) * cropTransform.zoom);
                 tCtx.drawImage(img, -img.width/2, -img.height/2);
                 tCtx.restore();
                 link.download = `cropped-${Date.now()}.png`; link.href = tempCanvas.toDataURL('image/png'); link.click();
             }
             return;
        }

        link.download = `edited-${Date.now()}.${ext}`;
        link.href = canvasRef.current.toDataURL(mime, quality);
        link.click();
    };

    const updateResizeDim = (type: 'w' | 'h', value: number) => {
        let newW = resizeDims.w; let newH = resizeDims.h;
        if (type === 'w') { newW = value; if (resizeDims.lock) newH = Math.round(value * (originalDims.h / originalDims.w)); } 
        else { newH = value; if (resizeDims.lock) newW = Math.round(value * (originalDims.w / originalDims.h)); }
        setResizeDims({ ...resizeDims, w: newW, h: newH });
    };
    const formatBytes = (bytes: number) => { if (bytes === 0) return '0 Bytes'; const k = 1024; const sizes = ['Bytes', 'KB', 'MB', 'GB']; const i = Math.floor(Math.log(bytes) / Math.log(k)); return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]; };
    
    // --- PRESETS ---
    const applyPreset = (preset: string) => {
        switch (preset) {
            case 'noir': setFilterValues({ ...defaultFilters, grayscale: 100, contrast: 120, brightness: 90, noise: 20 }); break;
            case 'vintage': setFilterValues({ ...defaultFilters, sepia: 50, contrast: 90, brightness: 110, saturate: 80, vignette: 40 }); break;
            case 'vivid': setFilterValues({ ...defaultFilters, saturate: 150, contrast: 110, exposure: 10 }); break;
            case 'matte': setFilterValues({ ...defaultFilters, contrast: 80, brightness: 110, saturate: 90 }); break;
            case 'cyber': setFilterValues({ ...defaultFilters, hueRotate: 180, contrast: 130, saturate: 150 }); break;
            case 'reset': default: setFilterValues(defaultFilters); break;
        }
    };
    const aspectRatios = [{ label: 'Free', val: null }, { label: '1:1', val: 1 }, { label: '16:9', val: 16/9 }, { label: '4:3', val: 4/3 }, { label: '9:16', val: 9/16 }];
    const formats = [{ mime: 'image/png', label: 'PNG', ext: 'png', lossless: true }, { mime: 'image/jpeg', label: 'JPG', ext: 'jpg', lossless: false }, { mime: 'image/webp', label: 'WEBP', ext: 'webp', lossless: false }];

    // --- RENDER COMPONENT ---
    return (
        <div className="flex flex-col h-full">
            {!imagePreview ? (
                <label className="flex flex-col items-center justify-center flex-1 border-2 border-dashed border-gray-700 rounded-xl bg-gray-900/50 cursor-pointer hover:bg-gray-800/50 transition-colors animate-in fade-in zoom-in duration-300">
                    <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-purple-500/10">
                        <ImageIcon size={32} className="text-gray-400" />
                    </div>
                    <span className="text-2xl text-white font-semibold mb-2">Upload Image</span>
                    <span className="text-sm text-gray-500">JPG, PNG, WEBP supported</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
            ) : (
                <div className="flex flex-col md:flex-row gap-6 h-full">
                    
                    {/* Sidebar Controls */}
                    <div className="w-full md:w-80 flex flex-col gap-6 p-6 bg-gray-900 border border-gray-800 rounded-xl shadow-xl h-fit max-h-[80vh] overflow-y-auto custom-scrollbar">
                        <button onClick={() => {setImagePreview(null); setEstimatedSize(null); setFilterValues(defaultFilters); setWatermarkImgSrc(null);}} className="text-sm text-gray-400 hover:text-white flex items-center gap-2 mb-2 transition-colors">
                            <ArrowLeft size={14} /> Choose Different Image
                        </button>
                        <div className="h-px bg-gray-800 w-full mb-2"></div>

                        {/* --- FILTER CONTROLS (ADVANCED) --- */}
                        {toolId === 'img-filter' && (
                            <div className="space-y-6">
                                {/* Histogram Visualization */}
                                <div className="bg-black/40 p-2 rounded-lg border border-gray-800">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[10px] text-gray-500 uppercase tracking-wider flex items-center gap-1"><BarChart3 size={10}/> Histogram</span>
                                    </div>
                                    <canvas ref={histogramRef} width={280} height={60} className="w-full h-16 opacity-80" />
                                </div>

                                {/* Tabs */}
                                <div className="flex bg-gray-950 p-1 rounded-lg border border-gray-800">
                                    {['light', 'color', 'detail'].map(tab => (
                                        <button 
                                            key={tab}
                                            onClick={() => setActiveFilterTab(tab as any)}
                                            className={`flex-1 py-1.5 text-xs font-medium rounded capitalize transition-all ${activeFilterTab === tab ? 'bg-purple-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>

                                {/* Sliders based on Tab */}
                                <div className="space-y-4">
                                    {activeFilterTab === 'light' && (
                                        <>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs text-gray-300"><span>Brightness</span><span>{filterValues.brightness}%</span></div>
                                                <input type="range" min="0" max="200" value={filterValues.brightness} onChange={(e) => setFilterValues({...filterValues, brightness: Number(e.target.value)})} className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-500"/>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs text-gray-300"><span>Contrast</span><span>{filterValues.contrast}%</span></div>
                                                <input type="range" min="0" max="200" value={filterValues.contrast} onChange={(e) => setFilterValues({...filterValues, contrast: Number(e.target.value)})} className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-500"/>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs text-gray-300"><span>Exposure</span><span>{filterValues.exposure}</span></div>
                                                <input type="range" min="-100" max="100" value={filterValues.exposure} onChange={(e) => setFilterValues({...filterValues, exposure: Number(e.target.value)})} className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-500"/>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs text-gray-300"><span>Vignette</span><span>{filterValues.vignette}</span></div>
                                                <input type="range" min="0" max="100" value={filterValues.vignette} onChange={(e) => setFilterValues({...filterValues, vignette: Number(e.target.value)})} className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-500"/>
                                            </div>
                                        </>
                                    )}

                                    {activeFilterTab === 'color' && (
                                        <>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs text-gray-300"><span>Saturation</span><span>{filterValues.saturate}%</span></div>
                                                <input type="range" min="0" max="200" value={filterValues.saturate} onChange={(e) => setFilterValues({...filterValues, saturate: Number(e.target.value)})} className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-500"/>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs text-gray-300"><span>Temperature (Sepia)</span><span>{filterValues.sepia}%</span></div>
                                                <input type="range" min="0" max="100" value={filterValues.sepia} onChange={(e) => setFilterValues({...filterValues, sepia: Number(e.target.value)})} className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-500"/>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs text-gray-300"><span>Tint (Hue)</span><span>{filterValues.hueRotate}°</span></div>
                                                <input type="range" min="0" max="360" value={filterValues.hueRotate} onChange={(e) => setFilterValues({...filterValues, hueRotate: Number(e.target.value)})} className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-500"/>
                                            </div>
                                            <div className="bg-gray-950 p-2 rounded border border-gray-800 space-y-2">
                                                <label className="text-xs text-gray-400">Color Overlay</label>
                                                <div className="flex gap-2">
                                                    <input type="color" value={filterValues.tintColor} onChange={(e) => setFilterValues({...filterValues, tintColor: e.target.value})} className="h-6 w-8 rounded bg-transparent cursor-pointer border-none"/>
                                                    <input type="range" min="0" max="100" value={filterValues.tintOpacity} onChange={(e) => setFilterValues({...filterValues, tintOpacity: Number(e.target.value)})} className="flex-1 h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-500 self-center"/>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {activeFilterTab === 'detail' && (
                                        <>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs text-gray-300"><span>Blur</span><span>{filterValues.blur}px</span></div>
                                                <input type="range" min="0" max="20" value={filterValues.blur} onChange={(e) => setFilterValues({...filterValues, blur: Number(e.target.value)})} className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-500"/>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs text-gray-300"><span>Noise / Grain</span><span>{filterValues.noise}</span></div>
                                                <input type="range" min="0" max="100" value={filterValues.noise} onChange={(e) => setFilterValues({...filterValues, noise: Number(e.target.value)})} className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-500"/>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs text-gray-300"><span>Pixelate</span><span>{filterValues.pixelate}</span></div>
                                                <input type="range" min="0" max="100" value={filterValues.pixelate} onChange={(e) => setFilterValues({...filterValues, pixelate: Number(e.target.value)})} className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-500"/>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs text-gray-300"><span>Invert</span><span>{filterValues.invert}%</span></div>
                                                <input type="range" min="0" max="100" value={filterValues.invert} onChange={(e) => setFilterValues({...filterValues, invert: Number(e.target.value)})} className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-500"/>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="h-px bg-gray-800 w-full"></div>

                                {/* Presets Grid */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="text-xs text-gray-400 uppercase">Quick Presets</h4>
                                        <button onClick={() => applyPreset('reset')} className="text-[10px] text-red-400 hover:text-red-300">Reset All</button>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['noir', 'vintage', 'vivid', 'matte', 'cyber'].map(p => (
                                            <button key={p} onClick={() => applyPreset(p)} className="px-2 py-1.5 bg-gray-950 border border-gray-800 rounded text-xs text-gray-400 hover:bg-purple-900/20 hover:text-white hover:border-purple-500/50 transition-all capitalize">
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- WATERMARK CONTROLS --- */}
                        {toolId === 'img-watermark' && (
                            <div className="space-y-6">
                                <h4 className="text-white font-medium flex items-center gap-2"><Stamp size={18} className="text-purple-400"/> Watermark Settings</h4>
                                
                                <div className="flex bg-gray-950 p-1 rounded-lg border border-gray-800">
                                    <button onClick={() => setWatermarkType('text')} className={`flex-1 py-1.5 text-xs font-medium rounded transition-all ${watermarkType === 'text' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}>Text</button>
                                    <button onClick={() => setWatermarkType('image')} className={`flex-1 py-1.5 text-xs font-medium rounded transition-all ${watermarkType === 'image' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}>Image</button>
                                </div>

                                {watermarkType === 'text' ? (
                                    <div className="space-y-2">
                                        <label className="text-xs text-gray-400">Text</label>
                                        <input type="text" value={watermarkText} onChange={(e) => setWatermarkText(e.target.value)} className="w-full bg-black/30 border border-gray-700 rounded p-2 text-white text-sm outline-none focus:border-purple-500"/>
                                        <div className="flex items-center gap-2 mt-2">
                                            <input type="color" value={wmSettings.color} onChange={(e) => setWmSettings({...wmSettings, color: e.target.value})} className="h-8 w-10 bg-transparent cursor-pointer border border-gray-700 rounded"/>
                                            <span className="text-xs text-gray-500">Color</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <label className="text-xs text-gray-400">Image Source</label>
                                        <label className="flex items-center justify-center w-full h-16 border border-dashed border-gray-700 rounded bg-gray-950/50 cursor-pointer hover:bg-gray-800/50">
                                            <Upload size={16} className="text-gray-400 mr-2"/>
                                            <span className="text-xs text-gray-400">Upload Logo</span>
                                            <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                                                if(e.target.files?.[0]) {
                                                    const r = new FileReader();
                                                    r.onload = (ev) => setWatermarkImgSrc(ev.target?.result as string);
                                                    r.readAsDataURL(e.target.files[0]);
                                                }
                                            }}/>
                                        </label>
                                        {watermarkImgSrc && <div className="text-xs text-green-400 flex items-center gap-1"><Check size={10}/> Image Loaded</div>}
                                    </div>
                                )}

                                <div className="space-y-4 pt-2">
                                     <div className="space-y-1">
                                        <div className="flex justify-between text-xs text-gray-300"><span>Opacity</span><span>{wmSettings.opacity}%</span></div>
                                        <input type="range" min="10" max="100" value={wmSettings.opacity} onChange={(e) => setWmSettings({...wmSettings, opacity: Number(e.target.value)})} className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-500"/>
                                     </div>
                                     <div className="space-y-1">
                                        <div className="flex justify-between text-xs text-gray-300"><span>Size / Scale</span><span>{wmSettings.size}%</span></div>
                                        <input type="range" min="10" max="200" value={wmSettings.size} onChange={(e) => setWmSettings({...wmSettings, size: Number(e.target.value)})} className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-500"/>
                                     </div>
                                     <div className="space-y-1">
                                        <div className="flex justify-between text-xs text-gray-300"><span>Rotation</span><span>{wmSettings.rotation}°</span></div>
                                        <input type="range" min="0" max="360" value={wmSettings.rotation} onChange={(e) => setWmSettings({...wmSettings, rotation: Number(e.target.value)})} className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-500"/>
                                     </div>
                                </div>

                                <div>
                                    <label className="text-xs text-gray-400 mb-2 block">Position</label>
                                    <div className="grid grid-cols-3 gap-2 w-24 mx-auto">
                                        {['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'].map(pos => {
                                            const isCorner = pos !== 'center';
                                            const active = wmSettings.position === pos;
                                            // Mapping grid layout manually for simplicity
                                            let gridClass = "";
                                            if (pos === 'top-left') gridClass = "col-start-1 row-start-1";
                                            if (pos === 'top-right') gridClass = "col-start-3 row-start-1";
                                            if (pos === 'center') gridClass = "col-start-2 row-start-2";
                                            if (pos === 'bottom-left') gridClass = "col-start-1 row-start-3";
                                            if (pos === 'bottom-right') gridClass = "col-start-3 row-start-3";
                                            
                                            return (
                                                <button 
                                                    key={pos}
                                                    onClick={() => setWmSettings({...wmSettings, position: pos as any})}
                                                    className={`w-6 h-6 border rounded ${gridClass} ${active ? 'bg-purple-600 border-purple-500' : 'bg-gray-950 border-gray-700 hover:bg-gray-800'}`}
                                                />
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- CROP CONTROLS --- */}
                        {toolId === 'img-crop' && (
                            <div className="space-y-6">
                                <h4 className="text-white font-medium flex items-center gap-2"><Crop size={18} className="text-purple-400"/> Crop Tools</h4>
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-400 uppercase">Aspect Ratio</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {aspectRatios.map((ratio) => (
                                            <button key={ratio.label} onClick={() => { setCropAspect(ratio.val); if (cropRect) { const newH = ratio.val ? cropRect.w / ratio.val : cropRect.h; setCropRect({...cropRect, h: newH}); }}} className={`p-2 rounded border text-xs transition-all ${cropAspect === ratio.val ? 'bg-purple-600 border-purple-500 text-white' : 'bg-gray-950 border-gray-800 text-gray-400'}`}> {ratio.label} </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="h-px bg-gray-800 w-full"></div>
                                <div className="space-y-4">
                                    <label className="text-xs text-gray-400 uppercase">Transform</label>
                                    <div className="flex gap-2">
                                        <button onClick={() => setCropTransform(p => ({...p, rotate: p.rotate - 90}))} className="flex-1 p-2 bg-gray-950 border border-gray-800 rounded text-gray-300 hover:text-white"><RotateCw className="-scale-x-100" size={16}/></button>
                                        <button onClick={() => setCropTransform(p => ({...p, rotate: p.rotate + 90}))} className="flex-1 p-2 bg-gray-950 border border-gray-800 rounded text-gray-300 hover:text-white"><RotateCw size={16}/></button>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => setCropTransform(p => ({...p, flipH: !p.flipH}))} className={`flex-1 p-2 border rounded text-gray-300 transition-all ${cropTransform.flipH ? 'bg-purple-900/30 border-purple-500' : 'bg-gray-950 border-gray-800'}`}><FlipHorizontal size={16}/></button>
                                        <button onClick={() => setCropTransform(p => ({...p, flipV: !p.flipV}))} className={`flex-1 p-2 border rounded text-gray-300 transition-all ${cropTransform.flipV ? 'bg-purple-900/30 border-purple-500' : 'bg-gray-950 border-gray-800'}`}><FlipVertical size={16}/></button>
                                    </div>
                                    <input type="range" min="-45" max="45" value={cropTransform.rotate % 90} onChange={(e) => setCropTransform(p => ({...p, rotate: Math.round(p.rotate/90)*90 + Number(e.target.value)}))} className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-500"/>
                                </div>
                                <button onClick={() => setShowGrid(!showGrid)} className="flex items-center gap-2 text-xs text-gray-400 hover:text-white">{showGrid ? <Check size={14} className="text-purple-400"/> : <Grid3X3 size={14}/>} Show Grid Overlay</button>
                            </div>
                        )}

                        {/* --- RESIZE CONTROLS --- */}
                        {toolId === 'img-resize' && (
                             <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-white font-medium flex items-center gap-2"><SlidersHorizontal size={18} className="text-purple-400"/> Dimensions</h4>
                                    <button onClick={() => setResizeDims({ ...originalDims, lock: true })} className="text-xs text-gray-500 hover:text-white flex items-center gap-1"><RotateCcw size={12}/> Reset</button>
                                </div>
                                <div className="flex bg-gray-950 rounded-lg p-1 border border-gray-800">
                                    <button onClick={() => setResizeSettings({...resizeSettings, unit: 'px'})} className={`flex-1 py-1 text-xs rounded-md transition-all ${resizeSettings.unit === 'px' ? 'bg-purple-900/40 text-purple-300' : 'text-gray-500'}`}>Pixels (px)</button>
                                    <button onClick={() => setResizeSettings({...resizeSettings, unit: '%'})} className={`flex-1 py-1 text-xs rounded-md transition-all ${resizeSettings.unit === '%' ? 'bg-purple-900/40 text-purple-300' : 'text-gray-500'}`}>Percent (%)</button>
                                </div>
                                <button onClick={() => setResizeDims(p => ({...p, lock: !p.lock}))} className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-all ${resizeDims.lock ? 'bg-purple-900/20 border-purple-500/30 text-purple-300' : 'bg-gray-950 border-gray-800 text-gray-400'}`}>
                                    <span className="text-sm font-medium">Maintain Aspect Ratio</span>
                                    {resizeDims.lock ? <Lock size={16}/> : <Unlock size={16}/>}
                                </button>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="text-xs text-gray-500 mb-1.5 block uppercase tracking-wider">Width</label><input type="number" value={resizeSettings.unit === 'px' ? resizeDims.w : Math.round((resizeDims.w / originalDims.w) * 100)} onChange={(e) => updateResizeDim('w', resizeSettings.unit === 'px' ? Number(e.target.value) : Math.round(originalDims.w * (Number(e.target.value) / 100)))} className="w-full bg-black/30 border border-gray-700 rounded-lg p-3 text-white text-sm focus:border-purple-500 outline-none"/></div>
                                    <div><label className="text-xs text-gray-500 mb-1.5 block uppercase tracking-wider">Height</label><input type="number" value={resizeSettings.unit === 'px' ? resizeDims.h : Math.round((resizeDims.h / originalDims.h) * 100)} onChange={(e) => updateResizeDim('h', resizeSettings.unit === 'px' ? Number(e.target.value) : Math.round(originalDims.h * (Number(e.target.value) / 100)))} className="w-full bg-black/30 border border-gray-700 rounded-lg p-3 text-white text-sm focus:border-purple-500 outline-none"/></div>
                                </div>
                                <div><h4 className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Quick Presets</h4><div className="grid grid-cols-2 gap-2">{socialPresets.map(p => (<button key={p.label} onClick={() => {setResizeDims({ w: p.w, h: p.h, lock: false })}} className="p-2 bg-gray-950 hover:bg-gray-800 border border-gray-800 rounded-lg text-xs text-gray-300 transition-all text-left flex flex-col"><span className="font-medium text-white">{p.label}</span><span className="opacity-60 text-[10px]">{p.w} x {p.h}</span></button>))}</div></div>
                             </div>
                        )}

                        {/* --- CONVERT CONTROLS --- */}
                        {toolId === 'img-convert' && (
                            <div className="space-y-6">
                                <h4 className="text-white font-medium flex items-center gap-2"><Layers size={18} className="text-purple-400"/> Output Format</h4>
                                <div className="grid grid-cols-3 gap-2">
                                    {formats.map(fmt => (
                                        <button key={fmt.mime} onClick={() => { setTargetFormat(fmt.mime); if(fmt.lossless) setQuality(1); else setQuality(0.9); }} className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${targetFormat === fmt.mime ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-900/20' : 'bg-gray-950 text-gray-400 border-gray-800 hover:bg-gray-900'}`}>
                                            <span className="font-bold text-sm">{fmt.label}</span>
                                            <span className="text-[10px] opacity-70 mt-1">{fmt.ext.toUpperCase()}</span>
                                        </button>
                                    ))}
                                </div>
                                <div className={`transition-all duration-300 ${targetFormat === 'image/png' ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'}`}>
                                    <div className="flex justify-between items-center mb-2"><label className="text-sm text-gray-300">Quality</label><span className="text-xs text-purple-400 font-mono">{(quality * 100).toFixed(0)}%</span></div>
                                    <input type="range" min="0.1" max="1.0" step="0.05" value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-500"/>
                                </div>
                                <div className="bg-black/40 rounded-lg p-4 border border-gray-800">
                                    <div className="flex justify-between items-center mb-2"><span className="text-xs text-gray-500">Original</span><span className="text-xs text-gray-300 font-mono">{formatBytes(originalSize)}</span></div>
                                    <div className="w-full h-px bg-gray-800 my-2"></div>
                                    <div className="flex justify-between items-center"><span className="text-xs text-gray-500">Estimated</span><span className={`text-sm font-bold font-mono ${estimatedSize && estimatedSize < originalSize ? 'text-green-400' : 'text-yellow-400'}`}>{estimatedSize ? formatBytes(estimatedSize) : '...'}</span></div>
                                </div>
                            </div>
                        )}

                        <button onClick={handleDownload} className="mt-auto w-full py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold shadow-lg shadow-purple-900/20 transition-all flex items-center justify-center gap-2">
                            <Download size={18}/> 
                            {toolId === 'img-convert' ? 'Convert & Save' : 'Download Image'}
                        </button>
                    </div>

                    {/* Preview Area */}
                    <div className="flex-1 bg-[#050508] border border-gray-800 rounded-xl flex items-center justify-center overflow-hidden relative p-8 group select-none">
                         <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                         
                         <div className="relative max-w-full max-h-full shadow-2xl transition-transform duration-300">
                             <canvas 
                                ref={canvasRef} 
                                className={`block rounded shadow-lg ${toolId === 'img-crop' ? 'cursor-crosshair' : ''}`}
                                style={{ maxWidth: '100%', maxHeight: '600px', objectFit: 'contain' }}
                                onMouseDown={toolId === 'img-crop' ? handleCropStart : () => setIsComparing(true)}
                                onMouseMove={toolId === 'img-crop' ? handleCropMove : undefined}
                                onMouseUp={toolId === 'img-crop' ? handleCropEnd : () => setIsComparing(false)}
                                onMouseLeave={() => setIsComparing(false)}
                                onTouchStart={toolId === 'img-crop' ? handleCropStart : () => setIsComparing(true)}
                                onTouchMove={toolId === 'img-crop' ? handleCropMove : undefined}
                                onTouchEnd={toolId === 'img-crop' ? handleCropEnd : () => setIsComparing(false)}
                             />
                             {toolId === 'img-filter' && isComparing && (
                                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse pointer-events-none shadow-lg z-10">
                                    SHOWING ORIGINAL
                                </div>
                             )}
                         </div>

                         {/* Info Overlay */}
                         <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm border border-white/10 px-3 py-1.5 rounded-full text-xs text-gray-300 flex items-center gap-2 pointer-events-none">
                            <FileType size={12} className="text-purple-400" />
                            {toolId === 'img-crop' && cropRect ? `Crop: ${Math.round(cropRect.w)} x ${Math.round(cropRect.h)}` : `${originalDims.w} x ${originalDims.h} px`}
                         </div>

                         {/* Compare Tooltip */}
                         {toolId === 'img-filter' && (
                             <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-gray-500 text-xs pointer-events-none">
                                 Press and hold image to compare
                             </div>
                         )}
                    </div>
                </div>
            )}
        </div>
    );
};
