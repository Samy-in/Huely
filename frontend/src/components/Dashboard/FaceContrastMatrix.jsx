import React from 'react'

export default function FaceContrastMatrix({ gender, confidence, ita }) {
  // Calculate X-axis (Feminine ↔ Masculine)
  let xPercent = 50
  if (gender === 'Male') {
    xPercent = 50 + ((confidence ?? 0.8) * 38)
  } else if (gender === 'Female') {
    xPercent = 50 - ((confidence ?? 0.8) * 38)
  }

  // Calculate Y-axis (Low ↔ High Contrast based on skin value/ITA)
  let yPercent = 50
  if (ita != null) {
    // Standardize ITA range [-50, 70] to percentage pos [15%, 85%]
    const clampedIta = Math.max(-50, Math.min(70, ita))
    yPercent = 15 + ((clampedIta + 50) / 120) * 70
  }

  return (
    <div className="glass-card rounded-2xl p-5 border border-white/10 bento-card flex flex-col justify-between gap-4 h-full">
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
          Contrast Matrix
        </p>
        <span className="text-[10px] text-slate-400 font-mono block leading-none mb-3">
          BIOMETRIC GENDER & CONTRAST RELATION
        </span>

        {/* Matrix Grid Canvas */}
        <div className="relative aspect-square w-full rounded-xl bg-black/5 border border-slate-300/30 overflow-hidden shadow-inner blueprint-grid">
          {/* Axis Guide Lines */}
          <div className="absolute inset-x-0 top-1/2 h-[1px] border-t border-slate-300/40 border-dashed" />
          <div className="absolute inset-y-0 left-1/2 w-[1px] border-l border-slate-300/40 border-dashed" />

          {/* Quadrant Text Labels */}
          <span className="absolute top-2 left-2 text-[8px] font-mono text-slate-400 uppercase">High / Fem</span>
          <span className="absolute top-2 right-2 text-[8px] font-mono text-slate-400 uppercase">High / Masc</span>
          <span className="absolute bottom-2 left-2 text-[8px] font-mono text-slate-400 uppercase">Low / Fem</span>
          <span className="absolute bottom-2 right-2 text-[8px] font-mono text-slate-400 uppercase">Low / Masc</span>

          {/* Dynamic Active Pointer */}
          <div
            className="absolute w-5 h-5 -ml-2.5 -mt-2.5 flex items-center justify-center transition-all duration-1000 ease-out"
            style={{ left: `${xPercent}%`, bottom: `${yPercent}%` }}
          >
            {/* Pulsing outer ring */}
            <span className="absolute inset-0 rounded-full bg-purple-500/25 animate-ping" />
            {/* Outer border */}
            <span className="absolute inset-0.5 rounded-full border border-purple-500 bg-purple-500/10 shadow shadow-purple-500/40" />
            {/* Central core dot */}
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600 shadow" />
          </div>
        </div>
      </div>

      {/* Axis Headings */}
      <div className="flex flex-col gap-1 text-[9px] font-mono text-slate-500 border-t border-slate-200/20 pt-2.5">
        <div className="flex justify-between">
          <span className="font-bold text-slate-400">X-AXIS:</span>
          <span>FEMININE ◄──► MASCULINE</span>
        </div>
        <div className="flex justify-between">
          <span className="font-bold text-slate-400">Y-AXIS:</span>
          <span>LOW CONTRAST ◄──► HIGH CONTRAST</span>
        </div>
      </div>
    </div>
  )
}
