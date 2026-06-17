import React from 'react'

const RATIOS_BY_SHAPE = {
  Oval:    { upper: 33, middle: 33, lower: 34, description: 'Symmetrical vertical third balance.' },
  Round:   { upper: 32, middle: 34, lower: 34, description: 'Soft, evenly distributed vertical segments.' },
  Square:  { upper: 30, middle: 32, lower: 38, description: 'Slightly prominent lower third jawline block.' },
  Oblong:  { upper: 31, middle: 38, lower: 31, description: 'Elongated midface segment (nose/cheek line).' },
  Heart:   { upper: 37, middle: 33, lower: 30, description: 'Broad upper forehead tapering to narrow chin.' },
  Unknown: { upper: 33, middle: 33, lower: 33, description: 'Standard proportional balance.' },
}

export default function FacialThirdsTelemetry({ shape }) {
  const resolvedShape = shape ?? 'Unknown'
  const ratios = RATIOS_BY_SHAPE[resolvedShape] || RATIOS_BY_SHAPE.Unknown

  return (
    <div className="glass-card rounded-2xl p-5 border border-white/10 bento-card flex flex-col justify-between gap-4 h-full">
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
          Facial Proportions
        </p>
        <span className="text-[10px] text-slate-400 font-mono block leading-none mb-4">
          VERTICAL SEGMENT TELEMETRY
        </span>

        {/* Telemetry rows */}
        <div className="space-y-4">
          {/* Upper Third */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono">
              <span className="font-bold text-slate-600">UPPER (FOREHEAD)</span>
              <span className="text-purple-600 font-bold">{ratios.upper}%</span>
            </div>
            <div className="h-2 rounded-full bg-black/5 border border-slate-300/30 overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 bar-fill"
                style={{ width: `${ratios.upper}%` }}
              />
            </div>
          </div>

          {/* Middle Third */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono">
              <span className="font-bold text-slate-600">MID (EYES & NOSE)</span>
              <span className="text-purple-600 font-bold">{ratios.middle}%</span>
            </div>
            <div className="h-2 rounded-full bg-black/5 border border-slate-300/30 overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 bar-fill"
                style={{ width: `${ratios.middle}%` }}
              />
            </div>
          </div>

          {/* Lower Third */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono">
              <span className="font-bold text-slate-600">LOWER (CHIN & JAW)</span>
              <span className="text-purple-600 font-bold">{ratios.lower}%</span>
            </div>
            <div className="h-2 rounded-full bg-black/5 border border-slate-300/30 overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 bar-fill"
                style={{ width: `${ratios.lower}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <p className="text-[10px] text-slate-500 font-mono border-t border-slate-200/20 pt-2.5 leading-relaxed">
        INFO: {ratios.description}
      </p>
    </div>
  )
}
