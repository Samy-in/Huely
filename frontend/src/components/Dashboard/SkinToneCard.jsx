export default function SkinToneCard({ tone, undertone, ita }) {
  const UNDERTONE_COLORS = {
    Warm:    'bg-orange-400',
    Cool:    'bg-blue-400',
    Neutral: 'bg-gray-400',
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
        Skin Tone & Undertone
      </p>
      <div className="flex items-center gap-3 mb-2">
        <p className="text-xl font-bold text-white">{tone ?? '—'}</p>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full text-white
            ${UNDERTONE_COLORS[undertone] ?? 'bg-gray-600'}`}
        >
          {undertone ?? '—'}
        </span>
      </div>
      {ita != null && (
        <p className="text-xs text-gray-500">
          ITA angle: <span className="font-mono">{ita}°</span>
        </p>
      )}
    </div>
  )
}
