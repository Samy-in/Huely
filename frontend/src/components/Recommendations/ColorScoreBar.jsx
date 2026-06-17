// Score thresholds → gradient class + label
function scoreStyle(pct) {
  if (pct >= 85) return { gradient: 'from-emerald-400 to-green-500',  glow: 'shadow-emerald-500/30', label: 'Excellent',  dot: 'bg-emerald-400' };
  if (pct >= 70) return { gradient: 'from-teal-400 to-cyan-500',      glow: 'shadow-cyan-500/25',    label: 'Great',      dot: 'bg-teal-400'    };
  if (pct >= 55) return { gradient: 'from-sky-400 to-blue-500',       glow: 'shadow-blue-500/25',    label: 'Good',       dot: 'bg-sky-400'     };
  if (pct >= 40) return { gradient: 'from-amber-400 to-yellow-500',   glow: 'shadow-yellow-500/25',  label: 'Moderate',   dot: 'bg-amber-400'   };
  if (pct >= 25) return { gradient: 'from-orange-400 to-amber-500',   glow: 'shadow-orange-500/20',  label: 'Weak',       dot: 'bg-orange-400'  };
  return           { gradient: 'from-red-500 to-rose-600',             glow: 'shadow-rose-500/20',    label: 'Poor',       dot: 'bg-red-500'     };
}

export default function ColorScoreBar({ colorName, score }) {
  const pct   = Math.min(100, Math.max(0, Math.round(score)));
  const style = scoreStyle(pct);

  return (
    <div className="group flex items-center gap-2.5">
      {/* Colour dot */}
      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${style.dot}`} />

      {/* Name */}
      <span className="text-sm text-slate-700 font-semibold w-20 sm:w-24 truncate flex-shrink-0">{colorName}</span>

      {/* Bar */}
      <div className="flex-1 bg-slate-900/10 rounded-full h-2.5 overflow-hidden relative min-w-[30px]">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${style.gradient} shadow ${style.glow} bar-fill`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Numeric + label */}
      <div className="flex items-center gap-1.5 justify-end w-14 sm:w-24 flex-shrink-0 text-right">
        <span className={`text-xs font-bold bg-gradient-to-r ${style.gradient} bg-clip-text text-transparent`}>
          {pct}%
        </span>
        <span className="text-[10px] text-slate-500 hidden sm:inline">{style.label}</span>
      </div>
    </div>
  );
}

