import { useRef, useState } from 'react'
import { Upload, ImageIcon, RefreshCw } from 'lucide-react'
import { fileToResizedBase64 } from '../../utils/imageUtils'

export default function ImageUpload({ onUpload, loading, onReset }) {
  const inputRef = useRef(null)
  const [preview, setPreview] = useState(null)
  const [dragOver, setDragOver] = useState(false)

  async function processFile(file) {
    if (!file || !file.type.startsWith('image/')) return
    const b64 = await fileToResizedBase64(file)
    setPreview(b64)
    onUpload(b64)
  }

  function handleFiles(e) {
    processFile(e.target.files[0])
    // Reset input value so same file can be re-selected
    e.target.value = ''
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    processFile(e.dataTransfer.files[0])
  }

  function handleReset() {
    setPreview(null)
    if (inputRef.current) inputRef.current.value = ''
    onReset?.()
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-purple-500/20 bg-black/40 backdrop-blur-md shadow-2xl relative">
      {/* Preview or drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !preview && inputRef.current?.click()}
        className={`relative aspect-video flex items-center justify-center transition-all duration-300 overflow-hidden group
          ${!preview ? 'cursor-pointer' : ''}
          ${dragOver ? 'bg-purple-600/10' : 'bg-slate-950'}`}
      >
        {/* Tech grid background */}
        <div className="absolute inset-0 blueprint-grid opacity-55 pointer-events-none" />

        {preview ? (
          <div className="relative w-full h-full">
            <img src={preview} alt="Preview" className="w-full h-full object-cover opacity-80" />
            
            {/* Tech scanning HUD overlay on loaded image */}
            <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none select-none z-10 font-mono text-[9px] text-purple-400 bg-gradient-to-t from-black/50 via-transparent to-black/30">
              <div className="flex justify-between items-center w-full">
                <div className="bg-black/60 px-2 py-0.5 rounded border border-purple-500/25 flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-emerald-500" />
                  <span>SRC: ANALYZED_IMG</span>
                </div>
                <div className="bg-black/60 px-2 py-0.5 rounded border border-purple-500/25">
                  <span>RESOLVED: OK</span>
                </div>
              </div>
              
              {/* Corner brackets */}
              <div className="absolute inset-4 border border-purple-500/10 rounded">
                <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-purple-400/60" />
                <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-purple-400/60" />
                <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-purple-400/60" />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-purple-400/60" />
              </div>

              <div className="flex justify-between items-center w-full">
                <div className="bg-black/60 px-2 py-0.5 rounded border border-purple-500/25">
                  <span>FORMAT: RASTER_RGB</span>
                </div>
                <div className="bg-black/60 px-2 py-0.5 rounded border border-purple-500/25">
                  <span>CONTOURS: ENGAGED</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-slate-500 select-none z-10 py-10 transition-transform group-hover:scale-105 duration-300">
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
              <Upload size={24} />
            </div>
            <div className="text-center">
              <span className="text-sm font-semibold text-slate-300 block">Upload Visual Profile</span>
              <span className="text-xs text-slate-500">Drag & drop or click to browse files</span>
            </div>
            <span className="text-[10px] text-slate-600 font-mono">JPG, PNG, WEBP // MAX 10MB</span>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFiles}
        />
      </div>

      <div className="p-3 flex gap-2 bg-slate-900/60 border-t border-white/5 relative z-10">
        <button
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-xl transition-all duration-300 shadow-lg shadow-violet-600/25"
        >
          <Upload size={14} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Analyzing Biometrics…' : 'Choose Local File'}
        </button>
        {preview && (
          <button
            onClick={handleReset}
            disabled={loading}
            title="Clear and start over"
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-40 transition-colors text-sm font-semibold"
          >
            <RefreshCw size={13} /> Re-Upload
          </button>
        )}
      </div>
    </div>
  )
}

