import React from 'react';

const CONFIDENCE_COLORS = {
  high:   'from-emerald-400 to-green-500',
  medium: 'from-amber-400 to-yellow-500',
  low:    'from-red-400 to-rose-500',
};

export default function GenderCard({ gender, confidence, onOverride }) {
  if (!gender) return null;

  const pct = Math.round((confidence ?? 0) * 100);
  const tier = pct >= 75 ? 'high' : pct >= 50 ? 'medium' : 'low';
  const isMale = gender === 'Male';
  const altGender = isMale ? 'Female' : 'Male';

  return (
    <div className="glass-card rounded-2xl p-5 border border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{isMale ? '👨' : '👩'}</span>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-medium">
              Detected Gender
            </p>
            <p className="text-2xl font-bold text-white leading-tight">{gender}</p>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${CONFIDENCE_COLORS[tier]} text-white shadow`}
        >
          {pct}% sure
        </span>
      </div>

      {/* Confidence bar */}
      <div className="mb-4">
        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${CONFIDENCE_COLORS[tier]} transition-all duration-700`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Override button */}
      <button
        onClick={() => onOverride && onOverride(altGender)}
        className="w-full py-2 rounded-xl text-sm font-medium border border-white/20 text-slate-300
                   hover:bg-white/10 hover:text-white transition-all duration-200"
      >
        Correct to {altGender} →
      </button>
    </div>
  );
}
