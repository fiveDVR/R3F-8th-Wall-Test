import React, { useState, useEffect } from 'react';
import { EighthwallCanvas, EighthwallCamera, ImageTracker, checkBrowserCompatibility, useXRContext } from '@j1ngzoue/8thwall-react-three-fiber';
import { Float, Icosahedron, MeshDistortMaterial } from '@react-three/drei';
import { AlertCircle, Camera, CheckCircle2, Mic, Square, Play, Pause, Trash2, Volume2 } from 'lucide-react';
import { useRef } from 'react';

function ARContent({ onTargetFound, onTargetLost }: { onTargetFound: () => void, onTargetLost: () => void }) {
  return (
    <>
      <EighthwallCamera />
      
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} />
      
      <ImageTracker 
        targetImage="/targets/input2.json"
        onFound={onTargetFound}
        onLost={onTargetLost}
      >
        <Float speed={2} rotationIntensity={1.5} floatIntensity={2} position={[0, 0.2, 0]}>
          <Icosahedron args={[0.2, 4]}>
            <MeshDistortMaterial color="#8b5cf6" distort={0.4} speed={2} roughness={0.1} metalness={0.8} />
          </Icosahedron>
        </Float>
      </ImageTracker>
    </>
  );
}

function ARUIOverlay({
  arStarted,
  setArStarted,
  targetFound,
  showTargetModal,
  setShowTargetModal,
  isRecording,
  recordingSeconds,
  audioUrl,
  isPlaying,
  togglePlayback,
  deleteRecording,
  startRecording,
  stopRecording,
  formatTime,
  setError
}: any) {
  const { startCamera } = useXRContext();
  const [isStarting, setIsStarting] = useState(false);

  const handleStart = async () => {
    setIsStarting(true);
    try {
      const success = await startCamera();
      if (success) {
        setArStarted(true);
      } else {
        setError('Camera permission was denied or camera failed to start.');
      }
    } catch (err: any) {
      setError(`Failed to start camera: ${err?.message || String(err)}`);
    } finally {
      setIsStarting(false);
    }
  };

  if (!arStarted) {
    return (
      <div className="absolute inset-0 z-50 flex h-full w-full items-center justify-center bg-[#050505] text-slate-200 overflow-hidden select-none">
        {/* Glowing background shapes */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-purple-600/10 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-cyan-600/10 blur-[120px] pointer-events-none"></div>

        {/* Diagonal viewport corners */}
        <div className="absolute top-8 left-8 w-6 h-6 border-t-2 border-l-2 border-white/20 pointer-events-none"></div>
        <div className="absolute top-8 right-8 w-6 h-6 border-t-2 border-r-2 border-white/20 pointer-events-none"></div>
        <div className="absolute bottom-8 left-8 w-6 h-6 border-b-2 border-l-2 border-white/20 pointer-events-none"></div>
        <div className="absolute bottom-8 right-8 w-6 h-6 border-b-2 border-r-2 border-white/20 pointer-events-none"></div>

        <div className="max-w-md w-full p-8 mx-4 bg-zinc-950/40 border border-white/10 rounded-3xl backdrop-blur-2xl text-center shadow-2xl flex flex-col items-center gap-6">
          <div className="relative w-20 h-20 bg-white/5 border border-white/15 rounded-2xl flex items-center justify-center shadow-inner">
            <Camera className="w-10 h-10 text-purple-400 animate-pulse" />
            <div className="absolute -inset-0.5 border border-purple-500/30 rounded-2xl pointer-events-none"></div>
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold tracking-[0.2em] uppercase text-white">
              AR WORKSPACE
            </h1>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-[280px] mx-auto">
              Place interactive 3D assets in your space. Works with image targets.
            </p>
          </div>

          <button
            onClick={handleStart}
            disabled={isStarting}
            className="w-full py-4 px-6 bg-white text-black font-semibold text-xs tracking-widest uppercase rounded-2xl hover:bg-zinc-200 active:scale-95 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.15)] flex items-center justify-center gap-2 pointer-events-auto font-bold"
          >
            <span>{isStarting ? 'Starting...' : 'Start Experience'}</span>
          </button>

          <p className="text-[10px] text-zinc-500 max-w-[240px] leading-relaxed font-mono">
            Note: On iOS, this requires camera access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between z-10">
      <header className="w-full px-8 py-6 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white flex items-center justify-center rounded-lg pointer-events-auto">
            <div className="w-5 h-5 bg-black rotate-45"></div>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-[0.2em] uppercase text-white drop-shadow-lg">
              AR Workspace
            </h1>
            <p className="text-[10px] font-mono text-zinc-500 drop-shadow-md">
              React Three Fiber + 8th Wall
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowTargetModal(true)}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[11px] font-medium backdrop-blur-md flex items-center gap-2 pointer-events-auto transition-all active:scale-95 text-white"
          >
            <Camera className="w-3.5 h-3.5 text-purple-400" />
            VIEW TARGET IMAGE
          </button>
          <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[11px] font-medium backdrop-blur-md flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${targetFound ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'}`}></span>
            {targetFound ? 'TARGET DETECTED' : 'SEARCHING FOR TARGET'}
          </div>
        </div>
      </header>

      {/* HUD Sidebar - Left (Info) */}
      <aside className="w-64 mt-8 ml-8 flex flex-col gap-6 pointer-events-auto">
        <div className="p-5 bg-black/40 border border-white/10 rounded-2xl backdrop-blur-xl">
          <h3 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-4">Tracking Status</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-3">
              {targetFound ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 animate-bounce" />
              ) : (
                <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
              )}
              <p className={`text-xs font-semibold ${targetFound ? 'text-emerald-400' : 'text-amber-400'}`}>
                {targetFound ? 'Target Detected' : 'Searching for target...'}
              </p>
            </div>
            <p className="text-[10px] text-zinc-400 leading-relaxed">
              {targetFound 
                ? '3D Icosahedron is anchored and rendering relative to the center of the image.'
                : 'Point your camera at the input2 image target.'}
            </p>
          </div>
        </div>
      </aside>

      <footer className="w-full px-8 pb-20 pt-10 flex items-end justify-between bg-gradient-to-t from-black/80 to-transparent pointer-events-auto mt-auto mb-6">
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest">Active Model</span>
          <h2 className="text-2xl font-light text-white tracking-tight">Icosahedron Float</h2>
          <div className="flex gap-2 mt-2">
            <span className="px-2 py-1 bg-white/10 rounded text-[9px] font-bold text-white">MESH DISTORT</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Recording State HUD */}
          {isRecording && (
            <div className="flex items-center gap-3 px-4 py-2.5 bg-red-950/40 border border-red-500/30 rounded-2xl backdrop-blur-xl">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
              <span className="text-xs font-mono font-bold text-red-400">{formatTime(recordingSeconds)}</span>
              <span className="text-[10px] uppercase tracking-wider text-red-300 font-medium">Recording...</span>
            </div>
          )}

          {/* Audio Playback Controls */}
          {audioUrl && (
            <div className="flex items-center gap-2.5 p-2.5 bg-zinc-900/60 border border-white/10 rounded-2xl backdrop-blur-xl">
              <button
                onClick={togglePlayback}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-purple-500 hover:bg-purple-600 active:scale-95 text-white transition-all shadow-[0_0_12px_rgba(139,92,246,0.3)] pointer-events-auto"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
              </button>
              <div className="flex flex-col pr-2">
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">Voice Note</span>
                <span className="text-[11px] text-white font-medium flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-purple-400" /> Recorded Audio
                </span>
              </div>
              <button
                onClick={deleteRecording}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-zinc-400 transition-all active:scale-95 border border-white/5 pointer-events-auto"
                title="Delete recording"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Microphone Trigger Button */}
          {!audioUrl && (
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-14 h-14 flex items-center justify-center rounded-full transition-all duration-300 active:scale-90 border pointer-events-auto ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)] animate-pulse' 
                  : 'bg-white/5 hover:bg-white/10 border-white/15 text-white backdrop-blur-md shadow-[0_0_15px_rgba(255,255,255,0.05)]'
              }`}
            >
              {isRecording ? (
                <Square className="w-5 h-5 fill-white text-white" />
              ) : (
                <Mic className="w-6 h-6 text-white" />
              )}
            </button>
          )}
        </div>
      </footer>

      {/* Viewport Corners Indicators */}
      <div className="absolute top-8 left-8 w-6 h-6 border-t-2 border-l-2 border-white/30 z-20 pointer-events-none"></div>
      <div className="absolute top-8 right-8 w-6 h-6 border-t-2 border-r-2 border-white/30 z-20 pointer-events-none"></div>
      <div className="absolute bottom-8 left-8 w-6 h-6 border-b-2 border-l-2 border-white/30 z-20 pointer-events-none"></div>
      <div className="absolute bottom-8 right-8 w-6 h-6 border-b-2 border-r-2 border-white/30 z-20 pointer-events-none"></div>

      {/* Target Image Modal Overlay */}
      {showTargetModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-6 pointer-events-auto">
          <div className="max-w-sm w-full p-6 bg-zinc-950/90 border border-white/10 rounded-3xl shadow-2xl flex flex-col items-center gap-4">
            <div className="w-full flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="text-xs font-bold text-white tracking-widest uppercase">Target Image</h3>
              <button 
                onClick={() => setShowTargetModal(false)}
                className="text-zinc-400 hover:text-white transition-colors text-[10px] font-mono uppercase px-2.5 py-1 bg-white/5 rounded-lg border border-white/5 active:scale-95"
              >
                Close
              </button>
            </div>
            <p className="text-[10px] text-zinc-400 text-center leading-relaxed">
              Point your camera at this image to activate the AR experience.
            </p>
            <div className="w-full aspect-[3/4] bg-black/40 rounded-2xl overflow-hidden border border-white/5 flex items-center justify-center">
              <img src="/targets/input2.png" alt="input2 Target" className="w-full h-full object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [arStarted, setArStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [targetFound, setTargetFound] = useState(false);
  const [showTargetModal, setShowTargetModal] = useState(false);

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mimeTypeRef = useRef<string>('');

  // Clean up audio and timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const getSupportedMimeType = () => {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/aac',
      'audio/mpeg',
      'audio/wav'
    ];
    for (const type of types) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return '';
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      
      const chosenMimeType = getSupportedMimeType();
      mimeTypeRef.current = chosenMimeType;
      
      const options = chosenMimeType ? { mimeType: chosenMimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeTypeRef.current || 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      // Start duration timer
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);

    } catch (err) {
      console.error('Failed to start recording:', err);
      alert('Could not access microphone. Please allow access.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      // Stop all tracks on the stream to release the mic
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current || !audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (audioRef.current.src !== audioUrl) {
        audioRef.current.src = audioUrl;
      }
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(err => {
          console.error('Audio playback failed:', err);
        });
    }
  };

  const deleteRecording = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setIsPlaying(false);
    setRecordingSeconds(0);
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    // Check compatibility on load
    const compat = checkBrowserCompatibility();
    if (!compat.compatible) {
      setError(`Browser incompatible: ${(compat.issues || []).join(', ')}`);
    }
  }, []);

  if (error) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-slate-50 p-6 text-center">
        <div className="max-w-md space-y-4 p-8 bg-slate-900 border border-red-500/30 rounded-2xl shadow-xl">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <h2 className="text-red-400 font-bold text-xl">AR Setup Error</h2>
          <p className="text-slate-300 text-sm leading-relaxed">{error}</p>
          <div className="mt-4 text-xs text-slate-500 text-left bg-black/40 p-3 rounded">
            <strong>Note:</strong> Ensure you are running this over HTTPS and your device supports WebXR/Camera access.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen bg-[#050505] text-zinc-300 font-sans overflow-hidden">
      {/* AR Canvas */}
      <div className="absolute inset-0 z-0">
        <EighthwallCanvas 
          xrSrc="/xr.js" 
          autoStart={false}
          style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
          onError={(err: any) => setError(err?.message || String(err))}
          overlayChildren={
            <ARUIOverlay 
              arStarted={arStarted}
              setArStarted={setArStarted}
              targetFound={targetFound}
              showTargetModal={showTargetModal}
              setShowTargetModal={setShowTargetModal}
              isRecording={isRecording}
              recordingSeconds={recordingSeconds}
              audioUrl={audioUrl}
              isPlaying={isPlaying}
              togglePlayback={togglePlayback}
              deleteRecording={deleteRecording}
              startRecording={startRecording}
              stopRecording={stopRecording}
              formatTime={formatTime}
              setError={setError}
            />
          }
        >
          <ARContent 
            onTargetFound={() => {
              console.log('Image target found!');
              setTargetFound(true);
            }} 
            onTargetLost={() => {
              console.log('Image target lost!');
              setTargetFound(false);
            }} 
          />
        </EighthwallCanvas>
      </div>

      {/* Hidden audio element for safe iOS Safari playback */}
      <audio 
        ref={audioRef} 
        style={{ display: 'none' }} 
        onEnded={() => setIsPlaying(false)} 
        preload="auto"
      />
    </div>
  );
}
