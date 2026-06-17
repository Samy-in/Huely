import React from 'react';

const CONFIDENCE_COLORS = {
  high:   'from-emerald-500 to-green-500 shadow-emerald-500/20 border-emerald-500/20',
  medium: 'from-amber-500 to-yellow-500 shadow-amber-500/20 border-amber-500/20',
  low:    'from-rose-500 to-red-500 shadow-rose-500/20 border-rose-500/20',
};

export default function GenderCard({ gender, confidence, onOverride }) {
  if (!gender) return null;

  const pct = Math.round((confidence ?? 0) * 100);
  const tier = pct >= 75 ? 'high' : pct >= 50 ? 'medium' : 'low';
  const isMale = gender === 'Male';

  return (
    <div className="glass-card rounded-2xl p-5 border border-white/10 bento-card flex flex-col h-full justify-between gap-4">
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
          Gender Detection
        </p>

        {/* Dynamic Display Indicator */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-bounce" style={{ animationDuration: '3s' }}>
              {isMale ? '👨' : '👩'}
            </span>
            <div>
              <span className="text-xs text-slate-500 font-mono block leading-none mb-1">active profile</span>
              <span className="text-xl font-black text-slate-800 leading-none tracking-tight">{gender}</span>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-xl text-[10px] font-mono border bg-gradient-to-r ${CONFIDENCE_COLORS[tier]} text-white shadow-lg`}
          >
            CONF: {pct}%
          </span>
        </div>

        {/* Confidence progress indicator */}
        <div className="space-y-1 mb-5">
          <div className="h-1.5 rounded-full bg-slate-200/50 overflow-hidden border border-slate-300/20">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${CONFIDENCE_COLORS[tier]} bar-fill`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Interactive Toggle Switch */}
        <div className="space-y-1">
          <span className="text-[10px] text-slate-500 font-mono block mb-1.5 uppercase">Switch Model Profile</span>
          <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-300/30 shadow-inner">
            <button
              onClick={() => onOverride && onOverride('Male')}
              className={`py-2 rounded-lg text-xs font-bold transition-all duration-300
                ${isMale 
                  ? 'bg-slate-800 text-white shadow' 
                  : 'text-slate-500 hover:text-slate-800'}`}
            >
              Male
            </button>
            <button
              onClick={() => onOverride && onOverride('Female')}
              className={`py-2 rounded-lg text-xs font-bold transition-all duration-300
                ${!isMale 
                  ? 'bg-slate-800 text-white shadow' 
                  : 'text-slate-500 hover:text-slate-800'}`}
            >
              Female
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
