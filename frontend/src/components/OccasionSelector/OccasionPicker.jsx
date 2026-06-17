const OPTIONS_META = {
  Casual: { icon: '☕', ledColor: 'bg-emerald-400 shadow-emerald-400/50',   activeBg: 'from-emerald-500/10 to-transparent border-emerald-500/30 text-emerald-300' },
  Formal: { icon: '💼', ledColor: 'bg-sky-400 shadow-sky-400/50',       activeBg: 'from-sky-500/10 to-transparent border-sky-500/30 text-sky-300' },
  Party:  { icon: '🥂', ledColor: 'bg-fuchsia-400 shadow-fuchsia-400/50', activeBg: 'from-fuchsia-500/10 to-transparent border-fuchsia-500/30 text-fuchsia-300' },
}

export default function OccasionPicker({ value, onChange }) {
  return (
    <div className="glass-card rounded-2xl p-5 border border-white/10 relative">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3.5">
        Occasion Mode
      </p>
      <div className="grid grid-cols-3 gap-2">
        {Object.entries(OPTIONS_META).map(([opt, m]) => {
          const isActive = value === opt
          return (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              className={`py-3 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1.5 transition-all duration-300 border relative overflow-hidden group
                ${isActive
                  ? `bg-gradient-to-b ${m.activeBg} shadow-lg shadow-black/20`
                  : 'bg-black/20 border-white/5 text-slate-500 hover:text-slate-300 hover:bg-white/5 hover:border-white/10'}`}
            >
              {/* LED Status Light */}
              <span className={`w-1.5 h-1.5 rounded-full transition-all duration-300 absolute top-2 right-2
                ${isActive ? `${m.ledColor} animate-pulse` : 'bg-slate-800'}`} 
              />
              
              <span className="text-xl group-hover:scale-110 transition-transform duration-300">{m.icon}</span>
              <span className="leading-none">{opt}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
