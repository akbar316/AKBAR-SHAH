

import React, { useState } from 'react';
import { RefreshCw, Calculator, DollarSign, Activity, GraduationCap, Trash2, Plus, Percent, History, EyeOff, Lock, ArrowDownUp, Copy } from 'lucide-react';

interface UtilityToolsProps {
  toolId: string;
}

export const UtilityTools: React.FC<UtilityToolsProps> = ({ toolId }) => {
    // --- QR / Password / Unit / Obfuscator State ---
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');

    // --- Calculator State ---
    const [activeCalcMode, setActiveCalcMode] = useState<'scientific' | 'gpa' | 'bmi' | 'loan'>('scientific');

    // 1. Scientific Calculator State
    const [calcDisplay, setCalcDisplay] = useState('0');
    const [calcHistory, setCalcHistory] = useState<string[]>([]);
    const [isRadians, setIsRadians] = useState(false); // Default to Degrees
    const [lastAns, setLastAns] = useState('0');
    
    const handleScientificInput = (val: string) => {
        if (val === 'AC') {
            setCalcDisplay('0');
            return;
        }
        if (val === 'DEL') {
            setCalcDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
            return;
        }
        if (val === 'MODE') {
            setIsRadians(!isRadians);
            return;
        }
        if (val === 'ANS') {
            setCalcDisplay(prev => prev === '0' ? lastAns : prev + 'ANS');
            return;
        }
        
        if (val === '=') {
            try {
                // Pre-processing expression for JS evaluation
                let expr = calcDisplay
                    .replace(/×/g, '*')
                    .replace(/÷/g, '/')
                    .replace(/π/g, 'Math.PI')
                    .replace(/e/g, 'Math.E')
                    .replace(/\^/g, '**')
                    .replace(/ANS/g, lastAns)
                    .replace(/√\(/g, 'sqr(') // Temp replacement for specific sqrt function
                    .replace(/√/g, 'Math.sqrt'); // Fallback

                // Factorial Replacement: 5! -> fact(5)
                // regex finds number or parenthesized group before !
                expr = expr.replace(/(\d+(?:\.\d+)?|\([^)]+\))!/g, 'fact($1)');

                // Trig conversions
                // We inject a context where sin/cos/tan handle deg/rad
                const trigMult = isRadians ? 1 : Math.PI / 180;
                
                // Evaluation Scope
                const scope = {
                    sin: (x: number) => Math.sin(x * trigMult),
                    cos: (x: number) => Math.cos(x * trigMult),
                    tan: (x: number) => Math.tan(x * trigMult),
                    asin: (x: number) => Math.asin(x) / trigMult,
                    acos: (x: number) => Math.acos(x) / trigMult,
                    atan: (x: number) => Math.atan(x) / trigMult,
                    log: Math.log10,
                    ln: Math.log,
                    sqr: Math.sqrt,
                    fact: (n: number) => {
                        if (n < 0) return NaN;
                        if (n === 0 || n === 1) return 1;
                        let r = 1;
                        for(let i=2; i<=n; i++) r *= i;
                        return r;
                    },
                    Math: Math
                };

                // Create function with scope keys as args
                const keys = Object.keys(scope);
                const values = Object.values(scope);
                
                // Replace function calls in string to match scope keys if needed, 
                // but standard names like sin() match our scope keys directly.
                
                const func = new Function(...keys, `"use strict"; return (${expr})`);
                const res = func(...values);

                if (!isFinite(res) || isNaN(res)) {
                    setCalcDisplay('Error');
                } else {
                    // Precision handling
                    let final = String(res);
                    if (final.includes('.') && final.length > 10) {
                        final = res.toFixed(8).replace(/\.?0+$/, '');
                    }
                    setLastAns(final);
                    setCalcHistory(prev => [`${calcDisplay} = ${final}`, ...prev].slice(0, 5));
                    setCalcDisplay(final);
                }
            } catch (e) {
                setCalcDisplay('Error');
            }
        } else {
            // Appending logic
            const funcs = ['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'log', 'ln', '√'];
            if (funcs.includes(val)) {
                setCalcDisplay(prev => prev === '0' || prev === 'Error' ? `${val}(` : `${prev}${val}(`);
            } else if (val === 'x!') {
                 setCalcDisplay(prev => prev === '0' || prev === 'Error' ? prev : `${prev}!`);
            } else if (val === 'x²') {
                 setCalcDisplay(prev => prev === '0' || prev === 'Error' ? prev : `${prev}^2`);
            } else if (val === 'exp') {
                 setCalcDisplay(prev => prev === '0' || prev === 'Error' ? prev : `${prev}*10^`);
            } else {
                setCalcDisplay(prev => prev === '0' || prev === 'Error' ? val : prev + val);
            }
        }
    };

    const sciButtons = [
        { label: isRadians ? 'RAD' : 'DEG', val: 'MODE', style: 'text-xs font-bold text-gray-400 border border-gray-700' },
        { label: '(', val: '(', style: 'text-gray-300' },
        { label: ')', val: ')', style: 'text-gray-300' },
        { label: 'AC', val: 'AC', style: 'text-red-400 bg-red-900/20' },
        { label: 'DEL', val: 'DEL', style: 'text-red-400 bg-red-900/20' },

        { label: 'sin', val: 'sin', style: 'text-cyan-400' },
        { label: 'cos', val: 'cos', style: 'text-cyan-400' },
        { label: 'tan', val: 'tan', style: 'text-cyan-400' },
        { label: 'π', val: 'π', style: 'text-purple-400' },
        { label: '÷', val: '÷', style: 'text-white bg-gray-800' },

        { label: 'asin', val: 'asin', style: 'text-cyan-400/70 text-sm' },
        { label: 'acos', val: 'acos', style: 'text-cyan-400/70 text-sm' },
        { label: 'atan', val: 'atan', style: 'text-cyan-400/70 text-sm' },
        { label: 'log', val: 'log', style: 'text-cyan-400' },
        { label: '×', val: '×', style: 'text-white bg-gray-800' },
        
        { label: '√', val: '√', style: 'text-cyan-400' },
        { label: 'x²', val: 'x²', style: 'text-cyan-400' },
        { label: '^', val: '^', style: 'text-cyan-400' },
        { label: 'ln', val: 'ln', style: 'text-cyan-400' },
        { label: '-', val: '-', style: 'text-white bg-gray-800' },

        { label: 'x!', val: 'x!', style: 'text-cyan-400' },
        { label: '7', val: '7', style: 'text-white font-bold bg-gray-800/50' },
        { label: '8', val: '8', style: 'text-white font-bold bg-gray-800/50' },
        { label: '9', val: '9', style: 'text-white font-bold bg-gray-800/50' },
        { label: '+', val: '+', style: 'text-white bg-gray-800' },

        { label: 'e', val: 'e', style: 'text-purple-400' },
        { label: '4', val: '4', style: 'text-white font-bold bg-gray-800/50' },
        { label: '5', val: '5', style: 'text-white font-bold bg-gray-800/50' },
        { label: '6', val: '6', style: 'text-white font-bold bg-gray-800/50' },
        { label: '=', val: '=', style: 'bg-cyan-600 text-white row-span-2 shadow-lg shadow-cyan-900/40 text-xl' },

        { label: 'ANS', val: 'ANS', style: 'text-gray-400 text-xs' },
        { label: '1', val: '1', style: 'text-white font-bold bg-gray-800/50' },
        { label: '2', val: '2', style: 'text-white font-bold bg-gray-800/50' },
        { label: '3', val: '3', style: 'text-white font-bold bg-gray-800/50' },
        // = covers this slot

        { label: 'EXP', val: 'exp', style: 'text-gray-400 text-xs' },
        { label: '0', val: '0', style: 'text-white font-bold bg-gray-800/50 col-span-2' },
        // 0 covers slot
        { label: '.', val: '.', style: 'text-white font-bold bg-gray-800/50' },
         // = covers this slot
    ];

    // 2. GPA Calculator
    const [gpaCourses, setGpaCourses] = useState([{ id: 1, name: '', credit: 3, grade: 4.0 }]);
    const gradeValues: Record<string, number> = { "A+": 4.0, "A": 4.0, "A-": 3.7, "B+": 3.3, "B": 3.0, "B-": 2.7, "C+": 2.3, "C": 2.0, "C-": 1.7, "D+": 1.3, "D": 1.0, "F": 0.0 };
    
    const calculateGPA = () => {
        const totalCredits = gpaCourses.reduce((sum, c) => sum + Number(c.credit), 0);
        const totalPoints = gpaCourses.reduce((sum, c) => sum + (Number(c.credit) * Number(c.grade)), 0);
        return totalCredits ? (totalPoints / totalCredits).toFixed(2) : '0.00';
    };

    // 3. BMI Calculator
    const [bmiWeight, setBmiWeight] = useState('');
    const [bmiHeight, setBmiHeight] = useState('');
    const [bmiUnit, setBmiUnit] = useState<'metric' | 'imperial'>('metric');
    
    const calculateBMI = () => {
        const w = parseFloat(bmiWeight);
        const h = parseFloat(bmiHeight);
        if (!w || !h) return 0;
        let bmi = 0;
        if (bmiUnit === 'metric') {
            // kg / m^2 (height in cm)
            bmi = w / ((h/100) ** 2);
        } else {
            // lbs / in^2 * 703 (height in ft?) let's assume height input is inches for simplicity or ft.
            // Let's standardise input: Height in CM for metric, Inches for imperial.
            bmi = 703 * w / (h ** 2);
        }
        return bmi.toFixed(1);
    };

    // 4. Loan Calculator
    const [loanPrincipal, setLoanPrincipal] = useState('');
    const [loanRate, setLoanRate] = useState('');
    const [loanTerm, setLoanTerm] = useState(''); // Years

    const calculateLoan = () => {
        const p = parseFloat(loanPrincipal);
        const r = parseFloat(loanRate) / 100 / 12; // Monthly rate
        const n = parseFloat(loanTerm) * 12; // Total months
        if (!p || !r || !n) return { monthly: 0, total: 0, interest: 0 };
        
        // M = P [ i(1 + i)^n ] / [ (1 + i)^n – 1 ]
        const monthly = p * ( (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) );
        const total = monthly * n;
        return { 
            monthly: monthly.toFixed(2), 
            total: total.toFixed(2), 
            interest: (total - p).toFixed(2) 
        };
    };

    // 5. Text Obfuscator Helpers
    const handleObfuscate = () => {
        try {
            if (!inputText) return;
            // Simple reversible obfuscation: Reverse string then Base64 encode
            // Handling UTF-8 correctly
            const utf8Bytes = new TextEncoder().encode(inputText);
            const binaryString = Array.from(utf8Bytes, byte => String.fromCharCode(byte)).join('');
            const b64 = btoa(binaryString);
            const scrambled = b64.split('').reverse().join('');
            setOutputText(scrambled);
        } catch (e) {
            setOutputText("Error: Cannot scramble this text.");
        }
    };

    const handleDeobfuscate = () => {
        try {
            if (!inputText) return;
            const reversed = inputText.split('').reverse().join('');
            const binaryString = atob(reversed);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            const original = new TextDecoder().decode(bytes);
            setOutputText(original);
        } catch (e) {
            setOutputText("Error: Invalid scrambled text format. Make sure you copied the entire scrambled string.");
        }
    };

    // --- RENDER ---
    return (
        <div className="flex flex-col items-center max-w-4xl mx-auto w-full">
            
            {toolId === 'util-calc' && (
                <div className="w-full bg-gray-900 rounded-xl border border-gray-800 shadow-2xl overflow-hidden min-h-[500px] flex flex-col">
                    {/* Header Tabs */}
                    <div className="flex bg-gray-950 border-b border-gray-800 p-1">
                        {[
                            { id: 'scientific', label: 'Scientific', icon: Calculator },
                            { id: 'gpa', label: 'GPA Calc', icon: GraduationCap },
                            { id: 'bmi', label: 'Health (BMI)', icon: Activity },
                            { id: 'loan', label: 'Finance', icon: DollarSign }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveCalcMode(tab.id as any)}
                                className={`flex-1 py-3 flex flex-col items-center justify-center gap-1 text-xs font-bold uppercase tracking-wider transition-all ${activeCalcMode === tab.id ? 'bg-cyan-900/20 text-cyan-400 border-b-2 border-cyan-500' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-900'}`}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="p-6 md:p-8 flex-1 flex flex-col">
                        
                        {/* 1. SCIENTIFIC CALCULATOR UI */}
                        {activeCalcMode === 'scientific' && (
                            <div className="max-w-md mx-auto w-full flex flex-col gap-4">
                                <div className="bg-black/40 p-4 rounded-xl border border-gray-700 text-right relative overflow-hidden">
                                    <div className="absolute top-2 left-2 text-[10px] font-bold text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded border border-gray-700">
                                        {isRadians ? 'RAD' : 'DEG'}
                                    </div>
                                    <div className="text-gray-500 text-xs h-5 flex justify-end items-center gap-1 mb-1">
                                        {calcHistory.length > 0 && <History size={10} />}
                                        {calcHistory[0] || ''}
                                    </div>
                                    <div className="text-3xl font-mono text-white tracking-widest overflow-hidden break-all min-h-[40px]">{calcDisplay}</div>
                                </div>
                                
                                <div className="grid grid-cols-5 gap-2.5">
                                    {sciButtons.map((btn, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleScientificInput(btn.val)}
                                            className={`h-12 rounded-lg text-sm flex items-center justify-center transition-all shadow-md active:translate-y-0.5 active:shadow-none select-none ${btn.style}`}
                                        >
                                            {btn.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 2. GPA CALCULATOR UI */}
                        {activeCalcMode === 'gpa' && (
                            <div className="w-full">
                                <div className="flex justify-between items-center mb-6 bg-cyan-900/20 p-4 rounded-xl border border-cyan-500/30">
                                    <span className="text-gray-300 font-medium">Cumulative GPA</span>
                                    <span className="text-4xl font-bold text-white">{calculateGPA()}</span>
                                </div>
                                <div className="space-y-2 mb-6 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                                    {gpaCourses.map((c, idx) => (
                                        <div key={c.id} className="grid grid-cols-12 gap-2 p-3 items-center bg-gray-950/50 rounded border border-gray-800">
                                            <div className="col-span-4 md:col-span-5"><input type="text" placeholder={`Course ${idx + 1}`} className="w-full bg-transparent text-white placeholder-gray-600 outline-none text-sm" value={c.name} onChange={(e) => { const newC = [...gpaCourses]; newC[idx].name = e.target.value; setGpaCourses(newC); }} /></div>
                                            <div className="col-span-3"><select className="w-full bg-gray-800 text-white text-xs rounded py-1.5 px-2" value={Object.keys(gradeValues).find(key => gradeValues[key] === c.grade)} onChange={(e) => { const newC = [...gpaCourses]; newC[idx].grade = gradeValues[e.target.value]; setGpaCourses(newC); }}>{Object.keys(gradeValues).map(g => <option key={g} value={g}>{g} ({gradeValues[g]})</option>)}</select></div>
                                            <div className="col-span-3"><input type="number" className="w-full bg-gray-800 text-white text-xs rounded py-1.5 px-2 text-center" value={c.credit} onChange={(e) => { const newC = [...gpaCourses]; newC[idx].credit = Number(e.target.value); setGpaCourses(newC); }} /></div>
                                            <div className="col-span-2 md:col-span-1 flex justify-end"><button onClick={() => setGpaCourses(gpaCourses.filter(x => x.id !== c.id))} className="text-gray-500 hover:text-red-400"><Trash2 size={16}/></button></div>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={() => setGpaCourses([...gpaCourses, { id: Date.now(), name: '', credit: 3, grade: 4.0 }])} className="w-full py-3 border border-dashed border-gray-700 rounded-lg text-gray-400 hover:text-white hover:border-gray-500 transition-all flex items-center justify-center gap-2"><Plus size={16}/> Add Course</button>
                            </div>
                        )}

                        {/* 3. BMI CALCULATOR UI */}
                        {activeCalcMode === 'bmi' && (
                            <div className="max-w-md mx-auto w-full space-y-6">
                                <div className="flex bg-gray-950 rounded-lg p-1 border border-gray-800">
                                    <button onClick={() => setBmiUnit('metric')} className={`flex-1 py-1.5 text-xs font-bold rounded transition-all ${bmiUnit === 'metric' ? 'bg-cyan-900/40 text-cyan-400' : 'text-gray-500'}`}>Metric (kg/cm)</button>
                                    <button onClick={() => setBmiUnit('imperial')} className={`flex-1 py-1.5 text-xs font-bold rounded transition-all ${bmiUnit === 'imperial' ? 'bg-cyan-900/40 text-cyan-400' : 'text-gray-500'}`}>Imperial (lbs/in)</button>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase mb-2 block">Weight ({bmiUnit === 'metric' ? 'kg' : 'lbs'})</label>
                                        <input type="number" value={bmiWeight} onChange={(e) => setBmiWeight(e.target.value)} className="w-full bg-black/30 border border-gray-700 rounded-lg p-3 text-white text-lg focus:border-cyan-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase mb-2 block">Height ({bmiUnit === 'metric' ? 'cm' : 'inches'})</label>
                                        <input type="number" value={bmiHeight} onChange={(e) => setBmiHeight(e.target.value)} className="w-full bg-black/30 border border-gray-700 rounded-lg p-3 text-white text-lg focus:border-cyan-500 outline-none" />
                                    </div>
                                </div>
                                <div className="bg-black/40 rounded-xl p-6 border border-gray-800 text-center">
                                    <span className="block text-gray-500 text-sm mb-1">Your BMI</span>
                                    <span className={`block text-5xl font-bold mb-2 ${Number(calculateBMI()) > 25 ? 'text-yellow-400' : Number(calculateBMI()) < 18.5 ? 'text-blue-400' : 'text-green-400'}`}>{calculateBMI()}</span>
                                    <span className="text-xs text-gray-400">
                                        {Number(calculateBMI()) < 18.5 ? 'Underweight' : Number(calculateBMI()) > 25 ? 'Overweight' : Number(calculateBMI()) === 0 ? 'Enter Details' : 'Healthy Weight'}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* 4. LOAN CALCULATOR UI */}
                        {activeCalcMode === 'loan' && (
                            <div className="max-w-md mx-auto w-full space-y-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase mb-2 block">Loan Amount</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-3.5 text-gray-500">$</span>
                                            <input type="number" value={loanPrincipal} onChange={(e) => setLoanPrincipal(e.target.value)} className="w-full bg-black/30 border border-gray-700 rounded-lg p-3 pl-8 text-white focus:border-cyan-500 outline-none" placeholder="10000" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-gray-500 uppercase mb-2 block">Interest Rate (%)</label>
                                            <div className="relative">
                                                <input type="number" value={loanRate} onChange={(e) => setLoanRate(e.target.value)} className="w-full bg-black/30 border border-gray-700 rounded-lg p-3 pr-8 text-white focus:border-cyan-500 outline-none" placeholder="5.5" />
                                                <Percent className="absolute right-3 top-3.5 text-gray-500" size={14}/>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 uppercase mb-2 block">Term (Years)</label>
                                            <input type="number" value={loanTerm} onChange={(e) => setLoanTerm(e.target.value)} className="w-full bg-black/30 border border-gray-700 rounded-lg p-3 text-white focus:border-cyan-500 outline-none" placeholder="30" />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-950 p-6 rounded-xl border border-gray-800 space-y-4">
                                    <div className="flex justify-between items-center border-b border-gray-800 pb-4">
                                        <span className="text-gray-400">Monthly Payment</span>
                                        <span className="text-2xl font-bold text-cyan-400">${calculateLoan().monthly}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500">Total Interest</span>
                                        <span className="text-gray-300">${calculateLoan().interest}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500">Total Cost</span>
                                        <span className="text-gray-300">${calculateLoan().total}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {toolId === 'util-password' && (
                 <div className="w-full bg-gray-900 p-6 rounded-xl border border-gray-800 text-center shadow-xl">
                     <h3 className="text-xl mb-6 font-bold text-white flex items-center justify-center gap-2"><Lock className="text-cyan-400"/> Secure Password Generator</h3>
                     <div className="text-3xl font-mono text-cyan-400 bg-black/40 border border-cyan-500/20 p-6 rounded-xl mb-8 break-all shadow-[0_0_20px_rgba(6,182,212,0.1)]">{outputText || 'Click Generate'}</div>
                     <button onClick={() => {
                         const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
                         let pass = "";
                         for(let i=0; i<16; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
                         setOutputText(pass);
                     }} className="bg-cyan-600 hover:bg-cyan-500 px-8 py-3 rounded-lg text-white font-bold flex items-center justify-center gap-2 mx-auto transition-all shadow-lg hover:shadow-cyan-900/20"><RefreshCw size={18}/> Generate Secure Password</button>
                 </div>
             )}

             {toolId === 'util-unit' && (
                 <div className="w-full bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-xl">
                     <h3 className="text-xl mb-6 text-center font-bold text-white flex items-center justify-center gap-2"><RefreshCw className="text-cyan-400"/> Unit Converter</h3>
                     <div className="flex items-center gap-4 bg-black/40 p-6 rounded-xl border border-gray-700">
                        <div className="flex-1">
                            <label className="text-xs text-gray-500 uppercase mb-2 block">Kilograms (kg)</label>
                            <input type="number" className="w-full bg-gray-800 p-4 rounded-lg text-white border border-gray-700 text-lg outline-none focus:border-cyan-500" placeholder="0" onChange={(e) => setOutputText(e.target.value ? (Number(e.target.value) * 2.20462).toFixed(2) : '')} />
                        </div>
                        <span className="text-gray-500 font-bold text-xl pt-6">=</span>
                        <div className="flex-1">
                            <label className="text-xs text-gray-500 uppercase mb-2 block">Pounds (lbs)</label>
                            <div className="w-full bg-gray-900/50 p-4 rounded-lg text-cyan-400 border border-gray-800 text-lg font-mono min-h-[60px] flex items-center">{outputText || '0.00'}</div>
                        </div>
                     </div>
                 </div>
             )}

              {toolId === 'util-qrcode' && (
                 <div className="w-full bg-gray-900 p-6 rounded-xl border border-gray-800 text-center shadow-xl">
                     <h3 className="text-xl mb-6 font-bold text-white flex items-center justify-center gap-2"><Trash2 className="text-cyan-400"/> QR Code Generator</h3>
                     <input type="text" className="w-full bg-black/30 p-4 rounded-xl border border-gray-700 text-white mb-6 focus:border-cyan-500 outline-none" placeholder="Enter URL or Text..." onChange={(e) => setInputText(e.target.value)} />
                     <div className="h-48 flex items-center justify-center">
                        {inputText ? (
                            <div className="bg-white p-4 inline-block rounded-xl shadow-2xl animate-in zoom-in">
                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(inputText)}`} alt="QR" />
                            </div>
                        ) : (
                            <div className="text-gray-600 italic">QR Code will appear here...</div>
                        )}
                     </div>
                 </div>
             )}

             {toolId === 'util-obfuscator' && (
                <div className="w-full bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-xl">
                    <h3 className="text-xl mb-6 font-bold text-white flex items-center justify-center gap-2"><EyeOff className="text-cyan-400"/> Text Obfuscator & Scrambler</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Input Side */}
                        <div className="flex flex-col">
                            <label className="text-sm text-gray-400 mb-2">Input Text</label>
                            <textarea 
                                className="flex-1 bg-black/30 border border-gray-700 rounded-xl p-4 text-white resize-none focus:border-cyan-500 outline-none min-h-[300px] font-mono text-sm custom-scrollbar"
                                placeholder="Enter text to scramble or unscramble..."
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                            />
                        </div>

                        {/* Actions & Output Side */}
                        <div className="flex flex-col gap-6">
                             <div className="flex gap-4">
                                <button 
                                    onClick={handleObfuscate}
                                    disabled={!inputText}
                                    className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold rounded-lg shadow-lg hover:shadow-cyan-900/20 transition-all flex items-center justify-center gap-2"
                                >
                                    Scramble <ArrowDownUp size={16}/>
                                </button>
                                <button 
                                    onClick={handleDeobfuscate}
                                    disabled={!inputText}
                                    className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white font-bold rounded-lg border border-gray-700 hover:border-gray-500 transition-all flex items-center justify-center gap-2"
                                >
                                    Unscramble <ArrowDownUp size={16}/>
                                </button>
                             </div>
                             
                             <div className="flex-1 flex flex-col relative">
                                <label className="text-sm text-gray-400 mb-2">Result</label>
                                <div className="flex-1 bg-gray-950 border border-gray-800 rounded-xl p-4 relative overflow-hidden group">
                                    <textarea 
                                        readOnly
                                        className="w-full h-full bg-transparent text-cyan-400 resize-none outline-none font-mono text-sm custom-scrollbar"
                                        value={outputText}
                                        placeholder="Result will appear here..."
                                    />
                                    {outputText && (
                                        <button 
                                            onClick={() => {navigator.clipboard.writeText(outputText);}}
                                            className="absolute top-4 right-4 p-2 bg-gray-800 text-gray-400 rounded hover:bg-white hover:text-black transition-all opacity-0 group-hover:opacity-100 shadow-lg"
                                            title="Copy Result"
                                        >
                                            <Copy size={16}/>
                                        </button>
                                    )}
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};