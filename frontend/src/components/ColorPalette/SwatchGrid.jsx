export default function SwatchGrid({ palette }) {
  if (!palette || palette.length === 0) return null

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Dominant Palette
      </p>
      <div className="flex gap-2 flex-wrap">
        {palette.map(({ hex, percent }, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div
              className="w-10 h-10 rounded-lg shadow-md border border-white/10"
              style={{ backgroundColor: hex }}
              title={`${hex} — ${percent}%`}
            />
            <span className="text-[10px] text-gray-500 font-mono">{percent}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
