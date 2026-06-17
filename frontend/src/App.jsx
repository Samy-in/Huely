import { useState, useRef } from 'react'
import { Sparkles, Camera, Upload } from 'lucide-react'
import CameraCapture from './components/Camera/CameraCapture'
import ImageUpload from './components/Camera/ImageUpload'
import OccasionPicker from './components/OccasionSelector/OccasionPicker'
import ResultsDashboard from './components/Dashboard/ResultsDashboard'
import FaceShapeCard from './components/Dashboard/FaceShapeCard'
import SkinToneCard from './components/Dashboard/SkinToneCard'
import { analyzeImage, getOutfits } from './services/api'

function HuelyLogo() {
  return (
    <svg viewBox="0 0 100 100" className="w-8 h-8">
      <defs>
        <linearGradient id="lh" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id="lv" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
      </defs>
      {/* Abstract interlocking gradient shapes forming 'H' and spectrum blend */}
      <path d="M 28 15 C 28 15, 42 10, 42 35 L 42 65 C 42 90, 28 85, 28 85 Z" fill="url(#lh)" opacity="0.95" />
      <path d="M 72 15 C 72 15, 58 10, 58 35 L 58 65 C 58 90, 72 85, 72 85 Z" fill="url(#lv)" opacity="0.95" />
      <path d="M 42 50 L 58 50" stroke="url(#lh)" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

export default function App() {
  const [occasion, setOccasion] = useState('Casual')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [outfitsLoading, setOutfitsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [inputMode, setInputMode] = useState('camera')
  const [genderOverride, setGenderOverride] = useState(null)
  // Keep the last image so occasion changes don't re-run full analysis
  const lastImageRef = useRef(null)

  async function handleImage(base64) {
    setLoading(true)
    setError(null)
    setResult(null)
    lastImageRef.current = base64
    try {
      const data = await analyzeImage(base64, occasion, genderOverride)
      setResult(data)
    } catch (err) {
      setError(err.message || 'Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleOccasionChange(newOccasion) {
    setOccasion(newOccasion)
    // If we already have analysis results, only refresh outfit suggestions
    if (result && result.face_detected && result.gender) {
      setOutfitsLoading(true)
      try {
        const data = await getOutfits(result.gender, result.face_shape, newOccasion)
        setResult(prev => ({
          ...prev,
          outfit_suggestions: data.outfit_suggestions,
          occasion: data.occasion,
        }))
      } catch (err) {
        // silently ignore — keep old suggestions
      } finally {
        setOutfitsLoading(false)
      }
    }
  }

  function handleReset() {
    setResult(null)
    setError(null)
    setGenderOverride(null)
    lastImageRef.current = null
  }

  function handleGenderOverride(newGender) {
    setGenderOverride(newGender)
    if (lastImageRef.current) {
      handleImage(lastImageRef.current)
    }
  }

  return (
    <div className="relative min-h-screen">
      {/* Soft warm-neutral backgrounds */}
      <div className="aurora-bg">
        <div className="aurora-blob aurora-blob-1" />
        <div className="aurora-blob aurora-blob-2" />
        <div className="aurora-blob aurora-blob-3" />
      </div>

      {/* Content layer */}
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-slate-200/50 backdrop-blur-xl sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/50 flex items-center justify-center shadow shadow-slate-900/5">
              <HuelyLogo />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-widest gradient-text leading-none uppercase">
                Huely
              </h1>
              <p className="text-[9px] text-slate-400 font-mono tracking-widest uppercase">Facial Analysis & Wardrobe API</p>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Main conditional layouts */}
          {result && !loading ? (
            /* FaceTheory 3-Column Layout */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column (Inputs, Face Shape, Skin details) */}
              <div className="lg:col-span-3 space-y-4 animate-slide-up anim-delay-1 order-2 lg:order-1">
                <OccasionPicker value={occasion} onChange={handleOccasionChange} />
                <FaceShapeCard shape={result.face_shape} />
                <SkinToneCard tone={result.skin_tone} undertone={result.undertone} ita={result.ita} />
              </div>

              {/* Center Column (Portrait scanner anchor) */}
              <div className="lg:col-span-5 space-y-4 animate-slide-up anim-delay-2 order-1 lg:order-2">
                <div className="glass-card rounded-2xl overflow-hidden shadow-2xl border border-white/50">
                  {inputMode === 'camera'
                    ? <CameraCapture onCapture={handleImage} loading={loading} />
                    : <ImageUpload onUpload={handleImage} loading={loading} onReset={handleReset} />
                  }
                </div>
                <button
                  onClick={handleReset}
                  className="w-full py-3 rounded-xl border border-slate-300/60 bg-white/40 hover:bg-white/60 text-slate-800 text-xs font-black uppercase tracking-widest transition-all duration-200 shadow"
                >
                  ← Reset / Start New Scan
                </button>
              </div>

              {/* Right Column (Metrics, Palette, Wardrobe suggestions) */}
              <div className="lg:col-span-4 animate-slide-up anim-delay-3 order-3 lg:order-3">
                <ResultsDashboard 
                  result={result} 
                  onGenderOverride={handleGenderOverride} 
                  outfitsLoading={outfitsLoading} 
                />
              </div>
            </div>
          ) : (
            /* Onboarding Layout */
            <div className="max-w-4xl mx-auto space-y-8">
              
              {/* Intro Banner */}
              <div className="text-center space-y-3 animate-slide-up">
                <h2 className="text-4xl md:text-5xl font-black gradient-text tracking-tight uppercase leading-none">
                  Your Aesthetics, Decoded.
                </h2>
                <p className="text-slate-500 text-sm max-w-lg mx-auto font-medium">
                  Map your face shape, ITA skin tones, and undertones to extract custom seasonal palettes and matching outfit items instantly.
                </p>
              </div>

              {/* Mode switch */}
              <div className="glass-card rounded-2xl p-1 flex gap-1 max-w-xs mx-auto animate-slide-up anim-delay-1 border border-slate-300/40">
                {[
                  { id: 'camera', label: 'Live Camera Scanner', icon: Camera },
                  { id: 'upload', label: 'Upload Portrait',      icon: Upload },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setInputMode(id)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300
                      ${inputMode === id
                        ? 'bg-slate-800 text-white shadow-lg shadow-slate-900/25'
                        : 'text-slate-400 hover:text-slate-800'}`}
                  >
                    <Icon size={12} />
                    {label}
                  </button>
                ))}
              </div>

              {/* Main Input Grid */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
                
                {/* Left panel: Info & occasion */}
                <div className="md:col-span-2 space-y-4 animate-slide-up anim-delay-2 order-2 md:order-1">
                  <OccasionPicker value={occasion} onChange={handleOccasionChange} />
                  
                  {/* Interactive details */}
                  <div className="glass-card rounded-2xl p-5 border border-white/50 space-y-3">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                      SYSTEM CAPABILITIES
                    </p>
                    <ul className="text-xs text-slate-500 font-medium space-y-2">
                      <li className="flex items-center gap-2">
                        <span className="text-purple-500">•</span>
                        Individual Typology Angle (ITA) metrics
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-purple-500">•</span>
                        Symmetrical Face Contour Mapping
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-purple-500">•</span>
                        Automated Seasonal Color Harmonies
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Right panel: viewport */}
                <div className="md:col-span-3 animate-slide-up anim-delay-3 order-1 md:order-2">
                  {loading ? (
                    <div className="glass-card rounded-2xl flex flex-col items-center justify-center h-80 gap-4 border border-slate-300/40">
                      <div className="relative w-12 h-12">
                        <div className="absolute inset-0 rounded-full border-3 border-slate-300/40 border-t-slate-800 animate-spin" />
                      </div>
                      <p className="text-slate-500 text-sm font-bold font-mono text-center">
                        RUNNING COMPUTER VISION PIPELINE...
                      </p>
                    </div>
                  ) : error ? (
                    <div className="glass-card rounded-2xl p-6 border border-red-500/20 bg-red-50/10 text-red-700 text-sm space-y-4">
                      <p className="font-bold flex items-center gap-2">⚠️ TELEMETRY FAULT</p>
                      <p className="font-mono text-xs">{error}</p>
                      <button 
                        onClick={handleReset} 
                        className="w-full py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold uppercase tracking-wider shadow"
                      >
                        Reset / Retry Session
                      </button>
                    </div>
                  ) : (
                    <div className="glass-card rounded-2xl overflow-hidden shadow-2xl border border-white/50">
                      {inputMode === 'camera'
                        ? <CameraCapture onCapture={handleImage} loading={loading} />
                        : <ImageUpload onUpload={handleImage} loading={loading} onReset={handleReset} />
                      }
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
