import React, { useState, useEffect } from 'react';
import { EighthwallCanvas, EighthwallCamera, ImageTracker, checkBrowserCompatibility, useXRContext } from '@j1ngzoue/8thwall-react-three-fiber';
import { Canvas } from '@react-three/fiber';
import { useGLTF, useAnimations, OrbitControls } from '@react-three/drei';
import { AlertCircle, Camera, CheckCircle2, Mic, Square, Play, Pause, Trash2, Volume2 } from 'lucide-react';
import { useRef } from 'react';

function Model({ url, position = [0, 0, 0] }: { url: string; position?: [number, number, number] }) {
  const { scene, animations } = useGLTF(url);
  const { ref, actions } = useAnimations(animations);

  useEffect(() => {
    const names = Object.keys(actions);
    if (names.length > 0) {
      console.log('Available animations:', names);
      const firstAction = actions[names[0]];
      firstAction?.reset().fadeIn(0.5).play();
      return () => {
        firstAction?.fadeOut(0.5);
      };
    }
  }, [actions]);

  return <primitive ref={ref} object={scene} scale={0.0075} position={position} />;
}

function ARContent({ onTargetFound, onTargetLost }: { onTargetFound: () => void, onTargetLost: () => void }) {
  return (
    <>
      <EighthwallCamera />
      
      <ambientLight intensity={1.5} />
      <directionalLight position={[5, 10, 5]} intensity={2.0} />
      <directionalLight position={[-5, 5, -5]} intensity={1.0} />
      <pointLight position={[0, 4, 2]} intensity={1.5} />
      
      <ImageTracker 
        targetImage="/targets/isis.json"
        onFound={onTargetFound}
        onLost={onTargetLost}
      >
        <React.Suspense fallback={null}>
          <Model url="/resources/Hip-Hop.glb" />
        </React.Suspense>
      </ImageTracker>
    </>
  );
}

function ARUIOverlay({
  arStarted,
  setArStarted,
  targetFound,
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
      <div className="absolute inset-0 z-50 bg-[#bae6fd] text-slate-800 overflow-hidden select-none flex flex-col justify-between">
        {/* 3D Model Preview Canvas */}
        <div className="absolute inset-0 z-0">
          <Canvas camera={{ position: [0, 0, 2.2], fov: 45 }}>
            <color attach="background" args={['#bae6fd']} />
            <ambientLight intensity={1.5} />
            <directionalLight position={[5, 10, 5]} intensity={2.0} />
            <directionalLight position={[-5, 5, -5]} intensity={1.0} />
            <pointLight position={[0, 4, 2]} intensity={1.5} />
            <React.Suspense fallback={null}>
              <Model url="/resources/Hip-Hop.glb" position={[0, -0.5, 0]} />
            </React.Suspense>
            <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1.5} minPolarAngle={Math.PI / 3} maxPolarAngle={Math.PI / 2} />
          </Canvas>
        </div>

        {/* Diagonal viewport corners */}
        <div className="absolute top-8 left-8 w-6 h-6 border-t-2 border-l-2 border-slate-400/40 pointer-events-none z-10"></div>
        <div className="absolute top-8 right-8 w-6 h-6 border-t-2 border-r-2 border-slate-400/40 pointer-events-none z-10"></div>
        <div className="absolute bottom-8 left-8 w-6 h-6 border-b-2 border-l-2 border-slate-400/40 pointer-events-none z-10"></div>
        <div className="absolute bottom-8 right-8 w-6 h-6 border-b-2 border-r-2 border-slate-400/40 pointer-events-none z-10"></div>

        {/* Start Experience Button Overlay */}
        <div className="relative w-full h-full flex flex-col items-center justify-end pb-24 px-8 z-10 pointer-events-none">
          <div className="max-w-md w-full p-4 bg-zinc-950/40 border border-white/10 rounded-3xl backdrop-blur-md shadow-2xl pointer-events-auto">
            <button
              onClick={handleStart}
              disabled={isStarting}
              className="w-full py-4 px-6 bg-white text-black font-semibold text-xs tracking-widest uppercase rounded-2xl hover:bg-zinc-200 active:scale-95 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.15)] flex items-center justify-center gap-2 pointer-events-auto font-bold"
            >
              <span>{isStarting ? 'Starting...' : 'Start Experience'}</span>
            </button>
          </div>
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
        </div>
      </header>

      {/* Center Image Target Overlay */}
      <div 
        className={`absolute inset-0 z-0 flex items-center justify-center pointer-events-none transition-all duration-700 ease-in-out ${
          targetFound ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
      >
        <div className="relative w-48 h-80 border-2 border-dashed border-white/20 rounded-3xl p-4 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
          {/* Scanning frame corners */}
          <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-white/50"></div>
          <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-white/50"></div>
          <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-white/50"></div>
          <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-white/50"></div>
          
          <img 
            src="/targets/isis.jpg" 
            alt="Align target" 
            className="w-full h-full object-contain opacity-35 animate-pulse pointer-events-none" 
            style={{ animationDuration: '2.5s' }}
          />
        </div>
      </div>

      <footer className="w-full px-8 pb-20 pt-10 flex items-end justify-between bg-gradient-to-t from-black/80 to-transparent pointer-events-auto mt-auto mb-6">
        <div></div>

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
    </div>
  );
}

export default function App() {
  const [arStarted, setArStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [targetFound, setTargetFound] = useState(false);

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
