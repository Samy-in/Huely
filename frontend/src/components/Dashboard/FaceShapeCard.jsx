export default function FaceShapeCard({ shape }) {
  const DESCRIPTIONS = {
    Oval:    'Balanced proportions — most hairstyles and necklines suit you.',
    Round:   'Soft, equal width and height — elongating styles work best.',
    Square:  'Strong jawline — softer, rounded elements balance your look.',
    Oblong:  'Long and narrow — width-adding styles and layering are ideal.',
    Heart:   'Wider forehead, narrow chin — balance with volume at the jaw.',
    Unknown: 'Shape could not be determined from the image.',
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
        Face Shape
      </p>
      <p className="text-2xl font-bold text-white mb-1">{shape ?? '—'}</p>
      <p className="text-sm text-gray-400">{DESCRIPTIONS[shape] ?? ''}</p>
    </div>
  )
}
