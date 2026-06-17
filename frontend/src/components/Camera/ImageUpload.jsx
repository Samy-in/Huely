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
    <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5">
      {/* Preview or drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !preview && inputRef.current?.click()}
        className={`relative aspect-video flex items-center justify-center transition-colors
          ${!preview ? 'cursor-pointer' : ''}
          ${dragOver ? 'bg-violet-600/20' : 'bg-gray-900 hover:bg-gray-800'}`}
      >
        {preview
          ? <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          : (
            <div className="flex flex-col items-center gap-2 text-gray-600 select-none">
              <Upload size={40} />
              <span className="text-sm">Drag & drop or click to upload</span>
              <span className="text-xs text-gray-700">JPEG, PNG, WebP — max 10 MB</span>
            </div>
          )
        }
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFiles}
        />
      </div>

      <div className="p-3 flex gap-2">
        <button
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-xl transition-colors"
        >
          <ImageIcon size={15} /> {loading ? 'Analysing…' : 'Choose Image'}
        </button>
        {preview && (
          <button
            onClick={handleReset}
            disabled={loading}
            title="Clear and start over"
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-white/15 text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-40 transition-colors text-sm font-medium"
          >
            <RefreshCw size={14} /> Reupload
          </button>
        )}
      </div>
    </div>
  )
}

