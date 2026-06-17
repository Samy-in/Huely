import React from 'react'

export default function SwatchGrid({ palette }) {
  if (!palette || palette.length === 0) return null

  return (
    <div className="glass-card rounded-2xl border border-white/15 p-5 bento-card shadow-sm">
      <div className="mb-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
          Color Palette
        </p>
        <span className="text-[10px] text-slate-400 font-mono block leading-none">
          EXTRACTED BIOMETRIC HUES
        </span>
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-3.5 items-center">
        {palette.map(({ hex, percent }, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5 group">
            <div
              className="w-12 h-12 rounded-full border border-white/80 swatch-glow cursor-pointer relative shadow-sm"
              style={{ 
                backgroundColor: hex,
                boxShadow: `0 4px 12px -3px ${hex}55, 0 4px 6px -2px rgba(50, 45, 40, 0.15)`
              }}
              title={`${hex} — ${percent}%`}
            >
              {/* Internal glow dot */}
              <div className="absolute inset-3.5 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
            <div className="text-center font-mono leading-none">
              <span className="text-[10px] font-bold text-slate-700 block">{percent}%</span>
              <span className="text-[8px] text-slate-400 tracking-tighter uppercase">{hex}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
