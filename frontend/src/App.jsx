import { useState, useRef } from 'react'
import { Sparkles, Camera, Upload } from 'lucide-react'
import CameraCapture from './components/Camera/CameraCapture'
import ImageUpload from './components/Camera/ImageUpload'
import OccasionPicker from './components/OccasionSelector/OccasionPicker'
import ResultsDashboard from './components/Dashboard/ResultsDashboard'
import { analyzeImage, getOutfits } from './services/api'

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
      {/* Aurora animated background */}
      <div className="aurora-bg">
        <div className="aurora-blob aurora-blob-1" />
        <div className="aurora-blob aurora-blob-2" />
        <div className="aurora-blob aurora-blob-3" />
      </div>

      {/* Content layer */}
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/10 backdrop-blur-xl sticky top-0 z-20">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight gradient-text leading-none">
                AI Personal Stylist
              </h1>
              <p className="text-[10px] text-slate-500 font-mono">powered by computer vision</p>
            </div>
            <span className="ml-auto px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/15 text-violet-300 border border-violet-500/25">
              Beta
            </span>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">

          {/* Hero intro */}
          {!result && !loading && (
            <div className="text-center space-y-2 animate-slide-up">
              <h2 className="text-4xl font-extrabold gradient-text">Your Style, Decoded</h2>
              <p className="text-slate-400 text-sm max-w-md mx-auto">
                Get personalised colour palettes, outfit suggestions, and shopping links — powered by AI analysis of your face.
              </p>
            </div>
          )}

          {/* Input mode tabs */}
          <div className="glass-card rounded-2xl p-1 flex gap-1 max-w-xs mx-auto animate-slide-up anim-delay-1">
            {[
              { id: 'camera', label: 'Live Camera', icon: Camera },
              { id: 'upload', label: 'Upload',      icon: Upload },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setInputMode(id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${inputMode === id
                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/20'
                    : 'text-slate-400 hover:text-white'}`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          {/* Main grid */}
          <div className="grid lg:grid-cols-5 gap-6">
            {/* Left: input */}
            <div className="lg:col-span-2 space-y-4 animate-slide-up anim-delay-2">
              <div className="glass-card rounded-2xl overflow-hidden">
                {inputMode === 'camera'
                  ? <CameraCapture onCapture={handleImage} loading={loading} />
                  : <ImageUpload onUpload={handleImage} loading={loading} onReset={handleReset} />
                }
              </div>
              <div className="glass-card rounded-2xl p-4">
                <OccasionPicker value={occasion} onChange={handleOccasionChange} />
              </div>
            </div>

            {/* Right: results */}
            <div className="lg:col-span-3 animate-slide-up anim-delay-3">
              {loading && (
                <div className="glass-card rounded-2xl flex flex-col items-center justify-center h-72 gap-4">
                  <div className="relative w-14 h-14">
                    <div className="absolute inset-0 rounded-full border-4 border-violet-500/30 border-t-violet-500 animate-spin" />
                    <div className="absolute inset-2 rounded-full border-4 border-pink-500/30 border-b-pink-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.7s' }} />
                  </div>
                  <p className="text-slate-400 text-sm">Analysing your features…</p>
                </div>
              )}
              {error && (
                <div className="glass-card rounded-2xl p-5 border border-red-500/30 text-red-300 text-sm">
                  {error}
                </div>
              )}
              {result && !loading && (
                <ResultsDashboard result={result} onGenderOverride={handleGenderOverride} outfitsLoading={outfitsLoading} />
              )}
              {!result && !loading && !error && (
                <div className="glass-card rounded-2xl flex flex-col items-center justify-center h-72 text-slate-600 gap-3">
                  <Sparkles size={40} className="text-slate-700" />
                  <p className="text-sm text-slate-500">Capture or upload a photo to begin</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

