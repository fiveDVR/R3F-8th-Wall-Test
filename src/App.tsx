import React, { useState, useEffect } from 'react';
import { EighthwallCanvas, EighthwallCamera, ImageTracker, permissionRequest, checkBrowserCompatibility } from '@j1ngzoue/8thwall-react-three-fiber';
import { Float, Icosahedron, MeshDistortMaterial } from '@react-three/drei';
import { AlertCircle, Camera, CheckCircle2 } from 'lucide-react';

function ARContent({ onTargetFound, onTargetLost }: { onTargetFound: () => void, onTargetLost: () => void }) {
  return (
    <>
      <EighthwallCamera />
      
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} />
      
      <ImageTracker 
        targetImage="/targets/isis-test.json"
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

export default function App() {
  const [permission, setPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [targetFound, setTargetFound] = useState(false);

  useEffect(() => {
    // 1. Check compatibility
    const compat = checkBrowserCompatibility();
    if (!compat.compatible) {
      setError(`Browser incompatible: ${(compat.issues || []).join(', ')}`);
      return;
    }

    // 2. Request permission (must be done before mounting canvas)
    permissionRequest().then((granted: boolean) => {
      setPermission(granted);
    }).catch((err: any) => {
      setError(`Permission error: ${err?.message || String(err)}`);
    });
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

  if (permission === null) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-slate-50">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 border-4 border-t-purple-500 border-purple-500/20 rounded-full animate-spin"></div>
            <Camera className="w-10 h-10 text-purple-400 m-4 animate-pulse" />
          </div>
          <p className="text-slate-300 font-medium tracking-wide">Requesting Camera Access...</p>
        </div>
      </div>
    );
  }

  if (!permission) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-slate-50 p-6 text-center">
        <div className="max-w-md space-y-4 p-8 bg-slate-900 border border-orange-500/30 rounded-2xl shadow-xl">
          <AlertCircle className="w-12 h-12 text-orange-400 mx-auto" />
          <h2 className="text-orange-400 font-bold text-xl">Camera Permission Denied</h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            We need camera access to display the AR experience. Please enable it in your browser settings and refresh the page.
          </p>
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
          style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
          onError={(err: any) => setError(err?.message || String(err))}
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

      {/* UI Overlay */}
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
                  : 'Point your camera at the Isis goddess image target.'}
              </p>
            </div>
          </div>
        </aside>

        <footer className="w-full px-8 py-10 flex items-end justify-between bg-gradient-to-t from-black/80 to-transparent pointer-events-auto mt-auto">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest">Active Model</span>
            <h2 className="text-2xl font-light text-white tracking-tight">Icosahedron Float</h2>
            <div className="flex gap-2 mt-2">
              <span className="px-2 py-1 bg-white/10 rounded text-[9px] font-bold text-white">MESH DISTORT</span>
            </div>
          </div>
        </footer>

        {/* Viewport Corners Indicators */}
        <div className="absolute top-8 left-8 w-6 h-6 border-t-2 border-l-2 border-white/30 z-20 pointer-events-none"></div>
        <div className="absolute top-8 right-8 w-6 h-6 border-t-2 border-r-2 border-white/30 z-20 pointer-events-none"></div>
        <div className="absolute bottom-8 left-8 w-6 h-6 border-b-2 border-l-2 border-white/30 z-20 pointer-events-none"></div>
        <div className="absolute bottom-8 right-8 w-6 h-6 border-b-2 border-r-2 border-white/30 z-20 pointer-events-none"></div>
      </div>
    </div>
  );
}
