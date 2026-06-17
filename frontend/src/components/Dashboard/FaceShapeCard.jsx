import React from 'react'

function FaceShapeSVG({ shape }) {
  const commonClasses = "stroke-purple-600 fill-purple-600/10 stroke-[2] drop-shadow-[0_2px_8px_rgba(147,51,234,0.15)]";
  const guideClasses = "stroke-slate-400/60 stroke-[1.5]";
  
  switch (shape) {
    case 'Oval':
      return (
        <svg viewBox="0 0 100 100" className="w-14 h-14 animate-pulse" style={{ animationDuration: '4s' }}>
          <ellipse cx="50" cy="50" rx="26" ry="36" className={commonClasses} />
          <line x1="50" y1="8" x2="50" y2="92" className={guideClasses} strokeDasharray="3 3" />
          <line x1="20" y1="50" x2="80" y2="50" className={guideClasses} strokeDasharray="3 3" />
        </svg>
      )
    case 'Round':
      return (
        <svg viewBox="0 0 100 100" className="w-14 h-14 animate-pulse" style={{ animationDuration: '4s' }}>
          <circle cx="50" cy="50" r="32" className={commonClasses} />
          <line x1="50" y1="12" x2="50" y2="88" className={guideClasses} strokeDasharray="3 3" />
          <line x1="12" y1="50" x2="88" y2="50" className={guideClasses} strokeDasharray="3 3" />
        </svg>
      )
    case 'Square':
      return (
        <svg viewBox="0 0 100 100" className="w-14 h-14 animate-pulse" style={{ animationDuration: '4s' }}>
          <path d="M 28 20 C 28 20, 50 18, 72 20 C 72 40, 72 65, 70 76 C 65 82, 50 84, 50 84 C 50 84, 35 82, 30 76 C 28 65, 28 40, 28 20 Z" className={commonClasses} />
          <circle cx="28" cy="76" r="3.5" className="fill-fuchsia-600 stroke-none" />
          <circle cx="72" cy="76" r="3.5" className="fill-fuchsia-600 stroke-none" />
        </svg>
      )
    case 'Oblong':
      return (
        <svg viewBox="0 0 100 100" className="w-14 h-14 animate-pulse" style={{ animationDuration: '4s' }}>
          <rect x="28" y="14" width="44" height="72" rx="22" className={commonClasses} />
          <line x1="50" y1="6" x2="50" y2="94" className="stroke-fuchsia-600/50 stroke-[1.5]" />
          <polygon points="50,4 46,10 54,10" className="fill-fuchsia-600" />
          <polygon points="50,96 46,90 54,90" className="fill-fuchsia-600" />
        </svg>
      )
    case 'Heart':
      return (
        <svg viewBox="0 0 100 100" className="w-14 h-14 animate-pulse" style={{ animationDuration: '4s' }}>
          <path d="M 24 30 C 20 48, 24 66, 50 84 C 76 66, 80 48, 76 30 C 76 30, 62 23, 50 32 C 38 23, 24 30, 24 30 Z" className={commonClasses} />
          <line x1="20" y1="30" x2="80" y2="30" className={guideClasses} strokeDasharray="3 3" />
          <circle cx="50" cy="83" r="3.5" className="fill-fuchsia-600 stroke-none" />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 100 100" className="w-14 h-14">
          <circle cx="50" cy="50" r="32" className={`${guideClasses} stroke-dashed`} strokeDasharray="4 4" />
          <text x="50" y="58" textAnchor="middle" className="fill-slate-400 font-bold text-2xl font-mono">?</text>
        </svg>
      )
  }
}

export default function FaceShapeCard({ shape }) {
  const DESCRIPTIONS = {
    Oval:    'Balanced proportions — most hairstyles and necklines suit you.',
    Round:   'Soft, equal width and height — elongating styles work best.',
    Square:  'Strong jawline — softer, rounded elements balance your look.',
    Oblong:  'Long and narrow — width-adding styles and layering are ideal.',
    Heart:   'Wider forehead, narrow chin — balance with volume at the jaw.',
    Unknown: 'Shape could not be determined from the image.',
  }

  const resolvedShape = shape ?? 'Unknown'

  return (
    <div className="glass-card rounded-2xl p-5 border border-white/10 bento-card flex flex-col justify-between gap-3 shadow-sm">
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
          Face Shape
        </p>
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xl font-black text-slate-800 leading-none tracking-tight">
            {resolvedShape}
          </h3>
          <div className="flex-shrink-0 bg-slate-50 p-2 rounded-xl border border-slate-200/50 shadow-sm">
            <FaceShapeSVG shape={resolvedShape} />
          </div>
        </div>
      </div>
      <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
        {DESCRIPTIONS[resolvedShape]}
      </p>
    </div>
  )
}
