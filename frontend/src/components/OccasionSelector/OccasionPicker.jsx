export default function OccasionPicker({ value, onChange }) {
  const options = ['Casual', 'Formal', 'Party']

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Occasion
      </p>
      <div className="grid grid-cols-3 gap-2">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`py-2 rounded-lg text-sm font-medium transition-colors
              ${value === opt
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}
