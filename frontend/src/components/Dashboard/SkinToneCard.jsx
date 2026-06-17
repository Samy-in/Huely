import React from 'react'

export default function SkinToneCard({ tone, undertone, ita }) {
  // Map undertone to position percent
  const undertonePos = 
    undertone === 'Cool' ? '15%' :
    undertone === 'Warm' ? '85%' : '50%'

  // Calculate ITA pointer position: range is approx -50 to 70
  let itaPercent = 50
  let skinCategory = 'Unknown'
  
  if (ita != null) {
    const clamped = Math.max(-50, Math.min(70, ita))
    itaPercent = ((clamped + 50) / 120) * 100

    if (ita > 55) skinCategory = 'Very Light'
    else if (ita > 41) skinCategory = 'Light'
    else if (ita > 28) skinCategory = 'Intermediate'
    else if (ita > 10) skinCategory = 'Tanned'
    else if (ita > -30) skinCategory = 'Brown'
    else skinCategory = 'Dark'
  }

  const undertoneLabel = undertone ?? '—'
  const toneLabel = tone ?? '—'

  return (
    <div className="glass-card rounded-2xl p-5 border border-white/10 bento-card flex flex-col justify-between gap-4 shadow-sm">
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
          Skin & Undertones
        </p>

        {/* Primary Classification */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1">
            <span className="text-[10px] text-slate-400 font-mono block leading-none mb-1">tone category</span>
            <span className="text-lg font-black text-slate-800">{toneLabel}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-mono block leading-none mb-1">undertone</span>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-lg text-white shadow shadow-black/10 inline-block
              ${undertone === 'Warm' ? 'bg-gradient-to-r from-orange-500 to-amber-500 border border-orange-400/20' : 
                undertone === 'Cool' ? 'bg-gradient-to-r from-sky-500 to-indigo-500 border border-sky-400/20' : 
                'bg-gradient-to-r from-slate-500 to-zinc-500 border border-slate-400/20'}`}
            >
              {undertoneLabel}
            </span>
          </div>
        </div>

        {/* Undertone spectrum slider */}
        <div className="space-y-1.5 mb-4">
          <div className="flex justify-between text-[8px] font-mono text-slate-400 uppercase">
            <span>Cool</span>
            <span>Neutral</span>
            <span>Warm</span>
          </div>
          <div className="relative h-2 rounded-full bg-gradient-to-r from-sky-300 via-slate-300 to-orange-300 border border-slate-200/50">
            {undertone && (
              <div 
                className="absolute -top-1 w-4 h-4 rounded-full bg-white border-2 border-purple-600 shadow-md transform -translate-x-1/2 transition-all duration-1000"
                style={{ left: undertonePos }}
              />
            )}
          </div>
        </div>

        {/* ITA value bar */}
        {ita != null && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-[8px] font-mono text-slate-400 uppercase">
              <span>ITA Scale ({Math.round(ita)}°)</span>
              <span className="text-purple-600 font-bold">{skinCategory}</span>
            </div>
            <div className="relative h-2.5 rounded-full bg-gradient-to-r from-[#3e2723] via-[#d7ccc8] to-[#fffef0] border border-slate-200/50 overflow-visible">
              <div 
                className="absolute -top-0.5 w-3.5 h-3.5 rounded-full bg-white border border-black/30 shadow transform -translate-x-1/2 transition-all duration-1000"
                style={{ left: `${itaPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
