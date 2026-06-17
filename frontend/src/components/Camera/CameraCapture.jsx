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
    <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5">
      {/* Video preview */}
      <div className="relative aspect-video bg-gray-900 flex items-center justify-center">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${streamActive ? 'block' : 'hidden'}`}
        />
        {!streamActive && (
          <div className="flex flex-col items-center gap-2 text-gray-600">
            <Camera size={40} />
            <span className="text-sm">Camera off</span>
          </div>
        )}
        {/* Face guide overlay */}
        {streamActive && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-40 h-52 rounded-full border-2 border-brand-500/60 border-dashed" />
          </div>
        )}
      </div>

      {cameraError && (
        <p className="text-red-400 text-xs px-4 py-2">{cameraError}</p>
      )}

      {/* Controls */}
      <div className="flex gap-2 p-3">
        {!streamActive ? (
          <button
            onClick={startCamera}
            className="flex-1 flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium py-2 rounded-lg transition-colors"
          >
            <Camera size={16} /> Start Camera
          </button>
        ) : (
          <>
            <button
              onClick={handleCapture}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg transition-colors"
            >
              <Aperture size={16} /> {loading ? 'Analysing…' : 'Capture & Analyse'}
            </button>
            <button
              onClick={stopCamera}
              className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 transition-colors"
              title="Stop camera"
            >
              <StopCircle size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
