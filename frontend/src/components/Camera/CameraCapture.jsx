import { useRef } from 'react'
import { Camera, StopCircle, Aperture } from 'lucide-react'
import { useCamera } from '../../hooks/useCamera'
import { captureFrameFromVideo } from '../../utils/imageUtils'

export default function CameraCapture({ onCapture, loading }) {
  const { videoRef, streamActive, startCamera, stopCamera, cameraError } = useCamera()

  function handleCapture() {
    if (!videoRef.current) return
    const b64 = captureFrameFromVideo(videoRef.current)
    onCapture(b64)
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-purple-500/20 bg-black/40 backdrop-blur-md shadow-2xl relative">
      {/* Video preview / HUD container */}
      <div className="relative aspect-video bg-slate-950 flex items-center justify-center overflow-hidden">
        {/* Tech grid background when camera is active */}
        {streamActive && <div className="absolute inset-0 blueprint-grid opacity-60 pointer-events-none" />}

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${streamActive ? 'opacity-90 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        />

        {!streamActive && (
          <div className="flex flex-col items-center gap-3 text-slate-500 z-10 py-12">
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 animate-pulse">
              <Camera size={28} />
            </div>
            <div className="text-center">
              <span className="text-sm font-semibold text-slate-300 block">Camera Feed Offline</span>
              <span className="text-xs text-slate-500">Awaiting permission activation</span>
            </div>
          </div>
        )}

        {/* Biometric HUD Overlay */}
        {streamActive && (
          <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none select-none z-10 font-mono text-[9px] text-purple-400">
            {/* Top Telemetry Row */}
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-1.5 bg-black/60 px-2 py-0.5 rounded border border-purple-500/25">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping" />
                <span>SYS: SCANNING</span>
              </div>
              <div className="bg-black/60 px-2 py-0.5 rounded border border-purple-500/25">
                <span>FPS: 30 // HD_CAM</span>
              </div>
            </div>

            {/* Target Reticle / Face Guide */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-44 h-56 rounded-full border border-purple-400/35 flex items-center justify-center">
                {/* Crosshairs inside reticle */}
                <div className="absolute w-4 h-[1px] bg-purple-400/40 left-2" />
                <div className="absolute w-4 h-[1px] bg-purple-400/40 right-2" />
                <div className="absolute h-4 w-[1px] bg-purple-400/40 top-2" />
                <div className="absolute h-4 w-[1px] bg-purple-400/40 bottom-2" />

                {/* Laser Sweep Line */}
                <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-purple-400 to-transparent shadow-[0_0_12px_#a855f7] animate-laser pointer-events-none" />

                {/* Center marker */}
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500/50" />
              </div>

              {/* External HUD Corner Brackets */}
              <div className="absolute w-[80%] h-[85%] border border-purple-500/10 max-w-sm rounded">
                <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-purple-400" />
                <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-purple-400" />
                <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-purple-400" />
                <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-purple-400" />
              </div>
            </div>

            {/* Bottom Telemetry Row */}
            <div className="flex justify-between items-center w-full">
              <div className="bg-black/60 px-2 py-0.5 rounded border border-purple-500/25">
                <span>CONTOUR: TRACKING</span>
              </div>
              <div className="bg-black/60 px-2 py-0.5 rounded border border-purple-500/25">
                <span>RETICLE: LOCKED</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {cameraError && (
        <p className="text-red-400 text-xs px-4 py-2 border-t border-red-500/20 bg-red-950/20 font-mono">{cameraError}</p>
      )}

      {/* Controls panel */}
      <div className="flex gap-2 p-3 bg-slate-900/60 border-t border-white/5 relative z-10">
        {!streamActive ? (
          <button
            onClick={startCamera}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-sm font-semibold py-2.5 rounded-xl transition-all duration-300 shadow-lg shadow-violet-600/20 glow-ring"
          >
            <Camera size={16} /> Activate Live Scanner
          </button>
        ) : (
          <>
            <button
              onClick={handleCapture}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-xl transition-all duration-300 shadow-lg shadow-purple-600/25"
            >
              <Aperture size={16} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Analysing Biometrics…' : 'Capture & Analyse'}
            </button>
            <button
              onClick={stopCamera}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all duration-200 border border-white/5"
              title="Stop scanner feed"
            >
              <StopCircle size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  )
}

