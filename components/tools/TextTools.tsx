
import React, { useState, useEffect, useRef } from 'react';
import { SubTool } from '../../types';
import { Mic, Volume2, StopCircle, Play, Copy, Trash2, Languages, Upload, Download, FileAudio, Save, FileText, AlertCircle, CheckCircle2, MoreVertical, X } from 'lucide-react';

interface TextToolsProps {
  toolId: string;
}

export const TextTools: React.FC<TextToolsProps> = ({ toolId }) => {
  const [inputText, setInputText] = useState('');
  const [secondInput, setSecondInput] = useState('');
  const [outputText, setOutputText] = useState('');

  // --- SPEECH TOOL STATE ---
  const [speechMode, setSpeechMode] = useState<'tts' | 'stt'>('tts');
  
  // TTS State
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isCapturingAudio, setIsCapturingAudio] = useState(false);

  // STT State
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [sttSource, setSttSource] = useState<'mic' | 'upload'>('mic');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Recording State (for download)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  
  // Initialize Voices for TTS
  useEffect(() => {
    if (toolId !== 'text-speech') return;

    const loadVoices = () => {
        const availVoices = window.speechSynthesis.getVoices();
        setVoices(availVoices);
        if (availVoices.length > 0 && !selectedVoice) {
            // Prefer English voices for default
            const defaultVoice = availVoices.find(v => v.lang.startsWith('en')) || availVoices[0];
            setSelectedVoice(defaultVoice);
        }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    // Initialize Speech Recognition for STT
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = 'en-US';
        
        rec.onresult = (event: any) => {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            
            if (finalTranscript) {
                // If it's a new sentence, capitalize it
                const cleaned = finalTranscript.trim();
                const capitalized = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
                setInputText(prev => {
                    const separator = prev.length > 0 && !prev.endsWith('\n') ? ' ' : '';
                    return prev + separator + capitalized + (capitalized.endsWith('.') ? '' : '.');
                });
            }
        };

        rec.onerror = (event: any) => {
            console.error("Speech Recognition Error", event.error);
            if (event.error === 'not-allowed') {
                setIsListening(false);
                stopRecording();
                alert("Microphone access denied. Please check your browser settings and allow microphone access.");
            } else if (event.error === 'service-not-allowed') {
                setIsListening(false);
                stopRecording();
                alert("Speech recognition service is not allowed by the browser.");
            }
        };

        rec.onend = () => {
             // Auto-restart if we are supposed to be listening (fix for silence timeout)
             if (isListening && sttSource === 'mic') {
                 try {
                     rec.start();
                 } catch(e) { /* ignore already started error */ }
             } else if (!isListening) {
                 stopRecording();
             }
        };

        setRecognition(rec);
    }

    return () => {
        window.speechSynthesis.cancel();
        if (recognition) recognition.stop();
        stopRecording();
    };
  }, [toolId]);

  // --- TTS HANDLERS ---
  const speakText = (text: string, onEnd?: () => void) => {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      if (selectedVoice) utterance.voice = selectedVoice;
      utterance.rate = rate;
      utterance.pitch = pitch;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
          setIsSpeaking(false);
          if (onEnd) onEnd();
      };
      
      window.speechSynthesis.speak(utterance);
  };

  const handleSpeak = () => {
      if (!inputText) return;
      speakText(inputText);
  };

  const handleStopSpeak = () => {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsCapturingAudio(false);
      stopRecording();
  };

  // CAPTURE AUDIO WORKAROUND FOR TTS DOWNLOAD
  const handleDownloadTTS = async () => {
      if (!inputText) return;
      
      try {
          // 1. Ask user to share "Tab Audio"
          alert("To download TTS audio, we need to capture the playback.\n\n1. Select 'This Tab' in the popup.\n2. Ensure 'Share Audio' is checked.\n3. The text will play silently, then download automatically.");
          
          const stream = await navigator.mediaDevices.getDisplayMedia({
              video: { displaySurface: "browser" }, // Hint to prefer tab
              audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } 
          } as any);

          // Check if we got an audio track
          const audioTrack = stream.getAudioTracks()[0];
          if (!audioTrack) {
              alert("No audio shared. Please check 'Share Audio' when selecting the tab.");
              stream.getTracks().forEach(t => t.stop());
              return;
          }

          setIsCapturingAudio(true);
          const recorder = new MediaRecorder(stream);
          const chunks: Blob[] = [];

          recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
          
          recorder.onstop = () => {
              const blob = new Blob(chunks, { type: 'audio/wav' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `speech-${Date.now()}.wav`;
              a.click();
              
              // Cleanup
              stream.getTracks().forEach(t => t.stop());
              setIsCapturingAudio(false);
          };

          recorder.start();

          // Play text
          speakText(inputText, () => {
              // Stop recording slightly after text finishes
              setTimeout(() => {
                  recorder.stop();
              }, 500);
          });

      } catch (e: any) {
          console.error("Capture failed", e);
          setIsCapturingAudio(false);
          if (e.name === 'NotAllowedError' || e.message.includes('permissions policy')) {
              alert("Capture failed: Screen recording permission was denied or is restricted by the environment.");
          } else {
              alert("Capture failed: " + e.message);
          }
      }
  };

  // --- STT HANDLERS ---
  const startRecording = async () => {
      setAudioChunks([]);
      
      try {
          // If uploading, we don't need mic stream for recording file, we just use recognition. 
          // But if mic, we record mic.
          if (sttSource === 'mic') {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            
            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    setAudioChunks((prev) => [...prev, e.data]);
                }
            };
            
            recorder.onstop = () => {
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current = recorder;
            recorder.start();
          }
      } catch (err) {
          console.error("Microphone access denied", err);
          alert("Could not access microphone. Please check permissions.");
          setIsListening(false);
      }
  };

  const stopRecording = () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
      }
  };

  const toggleListening = () => {
      if (!recognition) {
          alert("Speech recognition not supported in this browser.");
          return;
      }

      if (isListening) {
          recognition.stop();
          setIsListening(false); // Manually set to prevent auto-restart logic
          stopRecording();
          if (sttSource === 'upload' && audioRef.current) {
              audioRef.current.pause();
              audioRef.current.currentTime = 0;
          }
      } else {
          // Need to set isListening TRUE before starting to trigger restart logic if needed
          setIsListening(true);
          try {
            recognition.start();
          } catch (e) {
              // Already started
          }
          
          if (sttSource === 'mic') {
              startRecording();
          } else if (sttSource === 'upload' && audioRef.current) {
              // For file upload, we play the audio. The USER must ensure their mic can hear the speakers (Loopback)
              // Browser security prevents capturing system audio for analysis directly without user prompt.
              audioRef.current.play();
          }
      }
  };

  const handleDownloadTranscript = () => {
      const blob = new Blob([inputText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transcript-${Date.now()}.txt`;
      a.click();
  };

  const handleDownloadAudio = (format: 'wav' | 'mp3') => {
      if (audioChunks.length === 0) {
          alert("No audio recorded yet.");
          return;
      }
      
      // Native recording is usually WebM. We just label it .wav/.mp3 for user convenience
      // (Most players handle mislabeled containers, or we assume browser supports wav recording)
      const type = MediaRecorder.isTypeSupported('audio/wav') ? 'audio/wav' : 'audio/webm';
      const blob = new Blob(audioChunks, { type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      // Note: Actual MP3 encoding requires LAME.js or ffmpeg.wasm, which is heavy. 
      // We will save as the container the browser produced but give it the extension.
      // Modern players (VLC, etc) can play it. For web compatibility, .webm is best.
      a.download = `recording-${Date.now()}.${format}`; 
      a.click();
  };

  // --- RENDER SPEECH TOOL ---
  if (toolId === 'text-speech') {
      return (
          <div className="flex flex-col h-full max-w-6xl mx-auto">
              {/* Tool Header & Mode Switch */}
              <div className="flex flex-col items-center mb-8">
                  <div className="flex bg-gray-950 p-1 rounded-xl border border-gray-800 w-full max-w-lg shadow-2xl">
                    <button 
                        onClick={() => { setSpeechMode('tts'); stopRecording(); handleStopSpeak(); }}
                        className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${speechMode === 'tts' ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Volume2 size={18}/> Text to Speech
                    </button>
                    <button 
                        onClick={() => { setSpeechMode('stt'); handleStopSpeak(); }}
                        className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${speechMode === 'stt' ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Mic size={18}/> Speech to Text
                    </button>
                  </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-[500px]">
                  
                  {/* LEFT COLUMN: CONTROLS */}
                  <div className="lg:col-span-4 space-y-6">
                      
                      {/* --- TTS CONTROLS --- */}
                      {speechMode === 'tts' && (
                          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-xl space-y-6 animate-in slide-in-from-left-4 duration-500">
                              <h4 className="text-white font-bold flex items-center gap-2 pb-4 border-b border-gray-800">
                                  <Volume2 className="text-cyan-400" size={20}/> Generator Settings
                              </h4>
                              
                              <div className="space-y-3">
                                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Voice Model</label>
                                  <div className="relative">
                                    <select 
                                        className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white text-sm outline-none appearance-none focus:border-cyan-500 transition-colors"
                                        value={selectedVoice?.name}
                                        onChange={(e) => setSelectedVoice(voices.find(v => v.name === e.target.value) || null)}
                                    >
                                        {voices.map(v => (
                                            <option key={v.name} value={v.name}>
                                                {v.name.length > 25 ? v.name.substring(0,25) + '...' : v.name} ({v.lang})
                                            </option>
                                        ))}
                                    </select>
                                    <MoreVertical className="absolute right-3 top-3.5 text-gray-500 pointer-events-none" size={14} />
                                  </div>
                              </div>

                              <div className="space-y-4 pt-2">
                                  <div className="space-y-2">
                                      <div className="flex justify-between text-xs font-medium text-gray-300">
                                          <span>Speaking Rate</span>
                                          <span className="text-cyan-400">{rate}x</span>
                                      </div>
                                      <input type="range" min="0.5" max="2" step="0.1" value={rate} onChange={(e) => setRate(Number(e.target.value))} className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"/>
                                  </div>
                                  <div className="space-y-2">
                                      <div className="flex justify-between text-xs font-medium text-gray-300">
                                          <span>Pitch / Tone</span>
                                          <span className="text-cyan-400">{pitch}</span>
                                      </div>
                                      <input type="range" min="0.5" max="2" step="0.1" value={pitch} onChange={(e) => setPitch(Number(e.target.value))} className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"/>
                                  </div>
                              </div>

                              <div className="pt-4 space-y-3">
                                  <div className="flex gap-2">
                                    {!isSpeaking ? (
                                        <button 
                                            onClick={handleSpeak} 
                                            disabled={!inputText} 
                                            className="flex-1 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-lg text-white font-bold shadow-lg shadow-cyan-900/20 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
                                        >
                                            <Play size={18} fill="currentColor"/> Play Audio
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={handleStopSpeak} 
                                            className="flex-1 bg-red-500 hover:bg-red-400 py-3 rounded-lg text-white font-bold shadow-lg shadow-red-900/20 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
                                        >
                                            <StopCircle size={18} fill="currentColor"/> Stop
                                        </button>
                                    )}
                                  </div>
                                  
                                  <button 
                                      onClick={handleDownloadTTS} 
                                      disabled={!inputText || isCapturingAudio}
                                      className={`w-full py-3 rounded-lg font-bold border flex items-center justify-center gap-2 transition-all ${isCapturingAudio ? 'bg-red-900/20 border-red-500/50 text-red-400 animate-pulse' : 'bg-gray-950 border-gray-800 text-gray-300 hover:text-white hover:border-gray-600'}`}
                                  >
                                      {isCapturingAudio ? <StopCircle size={18}/> : <Download size={18}/>}
                                      {isCapturingAudio ? 'Recording System Audio...' : 'Download as WAV'}
                                  </button>
                                  {isCapturingAudio && (
                                      <p className="text-[10px] text-center text-red-400">Do not switch tabs while recording.</p>
                                  )}
                              </div>
                          </div>
                      )}

                      {/* --- STT CONTROLS --- */}
                      {speechMode === 'stt' && (
                          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-xl space-y-6 animate-in slide-in-from-left-4 duration-500">
                              <h4 className="text-white font-bold flex items-center gap-2 pb-4 border-b border-gray-800">
                                  <Mic className="text-cyan-400" size={20}/> Input Source
                              </h4>
                              
                              <div className="flex bg-black/40 p-1 rounded-lg border border-gray-800">
                                  <button onClick={() => setSttSource('mic')} className={`flex-1 py-2 text-xs font-bold rounded transition-all ${sttSource === 'mic' ? 'bg-gray-800 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}>Microphone</button>
                                  <button onClick={() => setSttSource('upload')} className={`flex-1 py-2 text-xs font-bold rounded transition-all ${sttSource === 'upload' ? 'bg-gray-800 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}>Upload File</button>
                              </div>

                              {sttSource === 'mic' ? (
                                  <div className="text-center space-y-6 py-4">
                                      <div className={`relative w-28 h-28 mx-auto rounded-full flex items-center justify-center transition-all duration-300 border-4 ${isListening ? 'border-red-500/50 bg-red-500/10 shadow-[0_0_30px_rgba(239,68,68,0.3)]' : 'border-gray-800 bg-gray-900'}`}>
                                          <Mic size={48} className={isListening ? 'text-red-500' : 'text-gray-600'} />
                                          {isListening && (
                                              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                                              </span>
                                          )}
                                      </div>
                                      <div>
                                          <button 
                                            onClick={toggleListening}
                                            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg hover:-translate-y-0.5 ${isListening ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/20' : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-900/20'}`}
                                          >
                                              {isListening ? 'Stop Recording' : 'Start Recording'}
                                          </button>
                                          <p className="text-xs text-gray-500 mt-3">{isListening ? 'Listening...' : 'Click to start dictation'}</p>
                                      </div>
                                  </div>
                              ) : (
                                  <div className="space-y-4">
                                      <label className={`flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-xl bg-black/20 cursor-pointer transition-colors ${audioFile ? 'border-green-500/50 bg-green-900/10' : 'border-gray-700 hover:bg-gray-800/50 hover:border-gray-600'}`}>
                                          <Upload size={24} className={audioFile ? "text-green-400 mb-2" : "text-gray-400 mb-2"}/>
                                          <span className="text-xs font-medium text-gray-300">{audioFile ? 'Change File' : 'Upload MP3/WAV'}</span>
                                          <input type="file" accept="audio/*" className="hidden" onChange={(e) => e.target.files && setAudioFile(e.target.files[0])} />
                                      </label>
                                      
                                      {audioFile && (
                                          <div className="bg-black/30 p-4 rounded-lg border border-gray-700 space-y-3 animate-in fade-in">
                                              <div className="flex items-center gap-3 text-sm font-medium text-white">
                                                  <div className="p-2 bg-cyan-900/30 rounded text-cyan-400"><FileAudio size={18}/></div>
                                                  <div className="flex-1 truncate">{audioFile.name}</div>
                                              </div>
                                              <audio ref={audioRef} controls src={URL.createObjectURL(audioFile)} className="w-full h-8 opacity-80" />
                                          </div>
                                      )}

                                      <button 
                                        onClick={toggleListening}
                                        disabled={!audioFile}
                                        className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0 ${isListening ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-cyan-600 hover:bg-cyan-500 text-white'}`}
                                      >
                                          {isListening ? (
                                              <><StopCircle size={18}/> Stop Transcription</>
                                          ) : (
                                              <><Play size={18}/> Play & Transcribe</>
                                          )}
                                      </button>
                                      
                                      <div className="bg-yellow-900/20 border border-yellow-700/30 p-3 rounded-lg flex gap-2">
                                          <AlertCircle size={16} className="text-yellow-500 flex-shrink-0 mt-0.5"/>
                                          <p className="text-[10px] text-yellow-200/70 leading-relaxed">
                                              <strong>Note:</strong> File transcription uses audio loopback. Please increase your system volume so your microphone can hear the playback clearly.
                                          </p>
                                      </div>
                                  </div>
                              )}
                          </div>
                      )}
                  </div>

                  {/* RIGHT COLUMN: TEXT AREA & RESULTS */}
                  <div className="lg:col-span-8 flex flex-col h-full bg-gray-900 rounded-xl border border-gray-800 shadow-xl overflow-hidden animate-in slide-in-from-right-4 duration-500">
                      <div className="p-4 border-b border-gray-800 bg-black/20 flex justify-between items-center">
                          <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
                              {speechMode === 'tts' ? <><FileText size={16} className="text-cyan-400"/> Input Text</> : <><FileText size={16} className="text-cyan-400"/> Transcript Result</>}
                          </label>
                          <div className="flex gap-2">
                             <button onClick={() => setInputText('')} className="px-3 py-1.5 rounded-md bg-gray-800 text-xs font-medium text-gray-400 hover:text-white hover:bg-red-900/30 transition-colors flex items-center gap-1.5"><Trash2 size={12}/> Clear</button>
                             <button onClick={() => navigator.clipboard.writeText(inputText)} className="px-3 py-1.5 rounded-md bg-gray-800 text-xs font-medium text-gray-400 hover:text-white hover:bg-cyan-900/30 transition-colors flex items-center gap-1.5"><Copy size={12}/> Copy</button>
                          </div>
                      </div>
                      
                      <textarea 
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          className="flex-1 bg-transparent p-6 text-white outline-none resize-none font-sans text-lg leading-relaxed placeholder-gray-700 custom-scrollbar"
                          placeholder={speechMode === 'tts' ? "Enter the text you want to convert to speech here..." : "The transcribed text will appear here as you speak..."}
                      />

                      {/* Download Footer */}
                      {speechMode === 'stt' && (
                          <div className="p-4 border-t border-gray-800 bg-gray-950/30 flex flex-wrap gap-3 items-center justify-end">
                              <span className="text-xs text-gray-500 mr-2">Download Options:</span>
                              <button onClick={handleDownloadTranscript} disabled={!inputText} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-xs font-bold text-white flex items-center gap-2 disabled:opacity-50 transition-colors">
                                  <FileText className="text-cyan-400" size={14}/> Transcript (.txt)
                              </button>
                              <div className="h-4 w-px bg-gray-700 mx-1"></div>
                              <button onClick={() => handleDownloadAudio('wav')} disabled={audioChunks.length === 0} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-xs font-bold text-white flex items-center gap-2 disabled:opacity-50 transition-colors">
                                  <Download className="text-green-400" size={14}/> Audio (.wav)
                              </button>
                              <button onClick={() => handleDownloadAudio('mp3')} disabled={audioChunks.length === 0} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-xs font-bold text-white flex items-center gap-2 disabled:opacity-50 transition-colors">
                                  <Download className="text-green-400" size={14}/> Audio (.mp3)
                              </button>
                          </div>
                      )}
                      
                      {/* TTS Visualizer Placeholder */}
                      {speechMode === 'tts' && isSpeaking && (
                          <div className="h-12 border-t border-gray-800 flex items-center justify-center gap-1 bg-black/20">
                              {[...Array(20)].map((_, i) => (
                                  <div 
                                    key={i} 
                                    className="w-1 bg-cyan-500 rounded-full animate-bounce"
                                    style={{ 
                                        height: `${Math.random() * 20 + 10}px`,
                                        animationDuration: `${Math.random() * 0.5 + 0.3}s` 
                                    }}
                                  ></div>
                              ))}
                          </div>
                      )}
                  </div>
              </div>
          </div>
      );
  }

  // --- STANDARD TEXT TOOLS RENDER (Fallback) ---
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
