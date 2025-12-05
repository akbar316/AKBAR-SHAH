import React, { useState, useMemo } from 'react';
import { RefreshCw, Settings, Hash, Ruler, Weight, Thermometer, Copy, Download } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

interface UtilityToolsProps {
  toolId: string;
  notify: (msg: string) => void;
}

const CONVERSION_RATES = {
  length: {
    meter: 1,
    kilometer: 0.001,
    mile: 0.000621371,
    foot: 3.28084,
    inch: 39.3701,
  },
  weight: {
    kilogram: 1,
    gram: 1000,
    pound: 2.20462,
    ounce: 35.274,
  },
  temperature: {
    celsius: (c: number) => ({ f: (c * 9/5) + 32, k: c + 273.15 }),
    fahrenheit: (f: number) => ({ c: (f - 32) * 5/9, k: (f - 32) * 5/9 + 273.15 }),
    kelvin: (k: number) => ({ c: k - 273.15, f: (k - 273.15) * 9/5 + 32 }),
  },
};

export const UtilityTools: React.FC<UtilityToolsProps> = ({ toolId, notify }) => {
    // Password State
    const [passLength, setPassLength] = useState(16);
    const [passSettings, setPassSettings] = useState({ upper: true, nums: true, syms: true });
    const [password, setPassword] = useState('');

    // QR Code State
    const [qrValue, setQrValue] = useState('https://tech-tools.io');
    
    // Unit Converter State
    const [unitCategory, setUnitCategory] = useState<'length' | 'weight' | 'temperature'>('length');
    const [unitValues, setUnitValues] = useState({ from: 'meter', to: 'foot', input: 1 });

    const generatePassword = () => {
        const lowerChars = 'abcdefghijklmnopqrstuvwxyz';
        const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numChars = '0123456789';
        const symChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        let charSet = lowerChars;
        if (passSettings.upper) charSet += upperChars;
        if (passSettings.nums) charSet += numChars;
        if (passSettings.syms) charSet += symChars;
        
        let newPass = '';
        for (let i = 0; i < passLength; i++) {
            newPass += charSet.charAt(Math.floor(Math.random() * charSet.length));
        }
        setPassword(newPass);
    };

    const convertedValue = useMemo(() => {
        const { from, to, input } = unitValues;
        if (!input) return '...';

        const value = Number(input);

        if (unitCategory === 'temperature') {
            if (from === to) return value.toFixed(2);
            // @ts-ignore
            return CONVERSION_RATES.temperature[from](value)[to.slice(0, 1)].toFixed(2);
        } else {
             // @ts-ignore
            const baseValue = value / CONVERSION_RATES[unitCategory][from];
             // @ts-ignore
            return (baseValue * CONVERSION_RATES[unitCategory][to]).toFixed(4);
        }
    }, [unitCategory, unitValues]);
    
    const downloadQR = () => {
        const canvas = document.querySelector('.qr-code-canvas') as HTMLCanvasElement;
        if (canvas) {
            const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
            let downloadLink = document.createElement("a");
            downloadLink.href = pngUrl;
            downloadLink.download = `qrcode-${qrValue}.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            notify("QR Code downloaded!");
        }
    };

    return (
        <div className="flex flex-col items-center max-w-2xl mx-auto w-full">
             {toolId === 'util-password' && (
                 <div className="w-full bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-xl">
                     <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Settings className="text-emerald-400"/> Advanced Password Generator</h3>
                     <div className="relative bg-black/50 p-4 rounded-lg mb-6 group">
                         <span className="text-2xl font-mono text-cyan-400 break-all">{password || 'Click Generate'}</span>
                         <button onClick={() => {navigator.clipboard.writeText(password); notify("Password Copied!");}} className="absolute top-3 right-3 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"><Copy size={18}/></button>
                     </div>
                     <div className="space-y-4 mb-6">
                        <div className="flex items-center gap-4">
                            <label className="text-gray-300 w-24">Length: <span className="font-bold text-white">{passLength}</span></label>
                            <input type="range" min="8" max="32" value={passLength} onChange={e => setPassLength(Number(e.target.value))} className="flex-1 accent-emerald-500"/>
                        </div>
                        <div className="flex justify-around">
                            <label className="flex items-center gap-2 text-gray-300"><input type="checkbox" checked={passSettings.upper} onChange={e => setPassSettings({...passSettings, upper: e.target.checked})} className="accent-emerald-500 w-4 h-4"/> Uppercase</label>
                            <label className="flex items-center gap-2 text-gray-300"><input type="checkbox" checked={passSettings.nums} onChange={e => setPassSettings({...passSettings, nums: e.target.checked})} className="accent-emerald-500 w-4 h-4"/> Numbers</label>
                            <label className="flex items-center gap-2 text-gray-300"><input type="checkbox" checked={passSettings.syms} onChange={e => setPassSettings({...passSettings, syms: e.target.checked})} className="accent-emerald-500 w-4 h-4"/> Symbols</label>
                        </div>
                     </div>
                     <button onClick={generatePassword} className="w-full bg-emerald-600 hover:bg-emerald-500 py-3 rounded-lg text-white font-bold flex items-center justify-center gap-2"><RefreshCw size={18}/> Generate New</button>
                 </div>
             )}
             {toolId === 'util-unit' && (
                 <div className="w-full bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-xl">
                     <h3 className="text-xl font-bold mb-6 text-center">Universal Unit Converter</h3>
                     <div className="flex gap-2 bg-gray-950 p-1 rounded-lg border border-gray-800 mb-6">
                        <button onClick={() => { setUnitCategory('length'); setUnitValues({ from: 'meter', to: 'foot', input: 1 }); }} className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1 ${unitCategory === 'length' ? 'bg-emerald-600 text-white' : 'text-gray-400'}`}><Ruler size={14}/> Length</button>
                        <button onClick={() => { setUnitCategory('weight'); setUnitValues({ from: 'kilogram', to: 'pound', input: 1 }); }} className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1 ${unitCategory === 'weight' ? 'bg-emerald-600 text-white' : 'text-gray-400'}`}><Weight size={14}/> Weight</button>
                        <button onClick={() => { setUnitCategory('temperature'); setUnitValues({ from: 'celsius', to: 'fahrenheit', input: 10 }); }} className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1 ${unitCategory === 'temperature' ? 'bg-emerald-600 text-white' : 'text-gray-400'}`}><Thermometer size={14}/> Temperature</button>
                     </div>
                     <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <input type="number" value={unitValues.input} onChange={e => setUnitValues({...unitValues, input: Number(e.target.value)})} className="w-full bg-black/30 p-3 rounded-lg text-white border border-gray-700 text-2xl"/>
                            <select value={unitValues.from} onChange={e => setUnitValues({...unitValues, from: e.target.value})} className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-b-lg p-2 -mt-1">
                                {Object.keys(CONVERSION_RATES[unitCategory]).map(unit => <option key={unit} value={unit}>{unit}</option>)}
                            </select>
                        </div>
                        <span className="text-gray-500 font-bold text-2xl">=</span>
                        <div className="flex-1">
                            <div className="w-full bg-black/30 p-3 rounded-lg text-gray-300 border border-gray-700 text-2xl font-bold">{convertedValue}</div>
                            <select value={unitValues.to} onChange={e => setUnitValues({...unitValues, to: e.target.value})} className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-b-lg p-2 -mt-1">
                                {Object.keys(CONVERSION_RATES[unitCategory]).map(unit => <option key={unit} value={unit}>{unit}</option>)}
                            </select>
                        </div>
                     </div>
                 </div>
             )}
              {toolId === 'util-qrcode' && (
                 <div className="w-full bg-gray-900 p-6 rounded-xl border border-gray-800 text-center shadow-xl">
                     <h3 className="text-xl font-bold mb-4">Offline QR Code Generator</h3>
                     <input type="text" className="w-full bg-black/30 p-3 rounded-lg border border-gray-700 text-white mb-4 text-center" placeholder="Enter URL or Text" value={qrValue} onChange={(e) => setQrValue(e.target.value)} />
                     {qrValue && (
                         <div className="bg-white p-4 inline-block rounded-lg mx-auto mb-4">
                             <QRCodeCanvas value={qrValue} size={192} level="H" className="qr-code-canvas"/>
                         </div>
                     )}
                     <button onClick={downloadQR} className="w-full bg-emerald-600 hover:bg-emerald-500 py-3 rounded-lg text-white font-bold flex items-center justify-center gap-2"><Download size={18}/> Download PNG</button>
                 </div>
             )}
        </div>
    );
};