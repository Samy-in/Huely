import { useState } from 'react'
import FaceShapeCard from './FaceShapeCard'
import SkinToneCard from './SkinToneCard'
import GenderCard from './GenderCard'
import SwatchGrid from '../ColorPalette/SwatchGrid'
import OutfitCard from '../Recommendations/OutfitCard'
import ColorScoreBar from '../Recommendations/ColorScoreBar'

const TABS = [
  { id: 'overview',  label: 'Overview' },
  { id: 'outfits',   label: 'Outfits'  },
  { id: 'colors',    label: 'Colors'   },
  { id: 'tips',      label: 'Tips'     },
]

// Icon + glow colour per tip index
const TIP_META = [
  { icon: '💡', glow: 'shadow-amber-500/30',   border: 'border-amber-500/25',   bg: 'from-amber-500/10 to-transparent'   },
  { icon: '🎨', glow: 'shadow-pink-500/30',    border: 'border-pink-500/25',    bg: 'from-pink-500/10 to-transparent'    },
  { icon: '✨', glow: 'shadow-violet-500/30',  border: 'border-violet-500/25',  bg: 'from-violet-500/10 to-transparent'  },
  { icon: '👑', glow: 'shadow-cyan-500/30',    border: 'border-cyan-500/25',    bg: 'from-cyan-500/10 to-transparent'    },
]

function StyleTipsCard({ tips }) {
  if (!tips?.length) return null
  return (
    <div className="space-y-3">
      {tips.map((tip, i) => {
        const m = TIP_META[i % TIP_META.length]
        return (
          <div
            key={i}
            className={`rounded-xl border ${m.border} bg-gradient-to-r ${m.bg} p-4
                        shadow ${m.glow} flex items-start gap-3 animate-slide-up`}
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <span className="text-xl flex-shrink-0 mt-0.5">{m.icon}</span>
            <p className="text-sm text-slate-200 leading-relaxed">{tip}</p>
          </div>
        )
      })}
    </div>
  )
}

export default function ResultsDashboard({ result, onGenderOverride, outfitsLoading = false }) {
  const [activeTab, setActiveTab] = useState('overview')
  if (!result) return null

  if (!result.face_detected) {
    return (
      <div className="glass-card rounded-2xl p-5 border border-yellow-500/30 text-yellow-300 text-sm">
        No face detected. Please try again with a clearer, well-lit photo.
      </div>
    )
  }

  const topColors = Object.entries(result.color_scores || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="glass-card rounded-2xl p-1 flex gap-1">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all duration-200
              ${activeTab === tab.id
                ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/20'
                : 'text-slate-400 hover:text-white'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {activeTab === 'overview' && (
        <div className="space-y-3 animate-slide-up">
          <GenderCard
            gender={result.gender}
            confidence={result.gender_confidence}
            onOverride={onGenderOverride}
          />
          <div className="grid grid-cols-2 gap-3">
            <FaceShapeCard shape={result.face_shape} />
            <SkinToneCard tone={result.skin_tone} undertone={result.undertone} ita={result.ita} />
          </div>
          <SwatchGrid palette={result.palette} />
        </div>
      )}

      {/* ── OUTFITS ── */}
      {activeTab === 'outfits' && (
        <div className="animate-slide-up">
          {outfitsLoading ? (
            <div className="glass-card rounded-2xl flex items-center justify-center h-40 gap-3">
              <div className="w-6 h-6 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
              <span className="text-slate-400 text-sm">Updating suggestions…</span>
            </div>
          ) : (
            <OutfitCard outfits={result.outfit_suggestions} gender={result.gender} />
          )}
        </div>
      )}

      {/* ── COLORS ── */}
      {activeTab === 'colors' && (
        <div className="space-y-3 animate-slide-up">
          <SwatchGrid palette={result.palette} />
          {topColors.length > 0 && (
            <div className="glass-card rounded-2xl p-5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
                Color Suitability Scores
              </p>
              <div className="space-y-3">
                {topColors.map(([name, score]) => (
                  <ColorScoreBar key={name} colorName={name} score={score} />
                ))}
              </div>
            </div>
          )}
          {result.recommended_colors?.length > 0 && (
            <div className="glass-card rounded-2xl p-5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
                Recommended Colors
              </p>
              <div className="flex flex-wrap gap-2">
                {result.recommended_colors.map(c => (
                  <span key={c} className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 border border-white/15 text-slate-200">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TIPS ── */}
      {activeTab === 'tips' && (
        <div className="animate-slide-up">
          {result.style_tips?.length > 0
            ? <StyleTipsCard tips={result.style_tips} />
            : <p className="text-slate-500 text-sm text-center py-8">No tips available.</p>
          }
        </div>
      )}
    </div>
  )
}


