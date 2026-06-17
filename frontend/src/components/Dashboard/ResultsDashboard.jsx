import { useState } from 'react'
import { LayoutDashboard, Shirt, Palette, Lightbulb } from 'lucide-react'
import FaceContrastMatrix from './FaceContrastMatrix'
import FacialThirdsTelemetry from './FacialThirdsTelemetry'
import GenderCard from './GenderCard'
import SwatchGrid from '../ColorPalette/SwatchGrid'
import OutfitCard from '../Recommendations/OutfitCard'
import ColorScoreBar from '../Recommendations/ColorScoreBar'

const TABS = [
  { id: 'overview',  label: 'Overview', icon: LayoutDashboard },
  { id: 'outfits',   label: 'Outfits',  icon: Shirt },
  { id: 'colors',    label: 'Colors',   icon: Palette },
  { id: 'tips',      label: 'Tips',     icon: Lightbulb },
]

// Icon + glow colour per tip index
const TIP_META = [
  { icon: '💡', glow: 'shadow-amber-500/10 border-amber-500/20', bg: 'from-amber-500/5 to-transparent' },
  { icon: '🎨', glow: 'shadow-pink-500/10 border-pink-500/20', bg: 'from-pink-500/5 to-transparent' },
  { icon: '✨', glow: 'shadow-violet-500/10 border-violet-500/20', bg: 'from-violet-500/5 to-transparent' },
  { icon: '👑', glow: 'shadow-cyan-500/10 border-cyan-500/20', bg: 'from-cyan-500/5 to-transparent' },
]

function StyleTipsCard({ tips }) {
  if (!tips?.length) return null
  return (
    <div className="grid grid-cols-1 gap-4">
      {tips.map((tip, i) => {
        const m = TIP_META[i % TIP_META.length]
        return (
          <div
            key={i}
            className={`rounded-2xl border ${m.glow} bg-gradient-to-br ${m.bg} p-5
                        shadow flex items-start gap-4 animate-slide-up bento-card`}
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <span className="text-2xl flex-shrink-0 mt-0.5">{m.icon}</span>
            <p className="text-sm text-slate-700 leading-relaxed">{tip}</p>
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
      <div className="glass-card rounded-2xl p-6 border border-yellow-500/20 text-yellow-300 text-sm flex items-center gap-3">
        <span className="text-xl">⚠️</span>
        <p>No face detected. Please try again with a clearer, well-lit photo.</p>
      </div>
    )
  }

  const topColors = Object.entries(result.color_scores || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)

  return (
    <div className="space-y-6">
      {/* Premium Tab bar */}
      <div className="glass-card rounded-2xl p-1.5 flex gap-1.5 relative overflow-hidden">
        {TABS.map(tab => {
          const IconComponent = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all duration-300 relative z-10
                ${isActive
                  ? 'bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-lg'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-black/5'}`}
            >
              <IconComponent size={14} className={isActive ? 'animate-pulse' : ''} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* ── OVERVIEW (Bento Grid) ── */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 gap-4 animate-slide-up">
          {/* Gender Card */}
          <GenderCard
            gender={result.gender}
            confidence={result.gender_confidence}
            onOverride={onGenderOverride}
          />
          
          {/* Face Contrast Matrix */}
          <FaceContrastMatrix
            gender={result.gender}
            confidence={result.gender_confidence}
            ita={result.ita}
          />

          {/* Facial Thirds Telemetry Card */}
          <FacialThirdsTelemetry shape={result.face_shape} />
        </div>
      )}

      {/* ── OUTFITS ── */}
      {activeTab === 'outfits' && (
        <div className="animate-slide-up">
          {outfitsLoading ? (
            <div className="glass-card rounded-2xl flex items-center justify-center h-48 gap-3 border border-purple-500/20">
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin" />
              </div>
              <span className="text-slate-400 text-sm font-semibold">Regenerating wardrobe matches…</span>
            </div>
          ) : (
            <OutfitCard outfits={result.outfit_suggestions} gender={result.gender} />
          )}
        </div>
      )}

      {/* ── COLORS ── */}
      {activeTab === 'colors' && (
        <div className="space-y-4 animate-slide-up">
          <SwatchGrid palette={result.palette} />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {topColors.length > 0 && (
              <div className="glass-card rounded-2xl p-5">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
                  Color Suitability Scores
                </p>
                <div className="space-y-3.5">
                  {topColors.map(([name, score]) => (
                    <ColorScoreBar key={name} colorName={name} score={score} />
                  ))}
                </div>
              </div>
            )}
            
            {result.recommended_colors?.length > 0 && (
              <div className="glass-card rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
                    Season Recommendations
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed mb-6">
                    Based on your Individual Typology Angle (ITA) and undertones, these complementary shades will make your facial features stand out.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {result.recommended_colors.map(c => (
                    <span key={c} className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-purple-100/50 border border-purple-200/60 text-purple-700 shadow-sm">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TIPS ── */}
      {activeTab === 'tips' && (
        <div className="animate-slide-up">
          {result.style_tips?.length > 0
            ? <StyleTipsCard tips={result.style_tips} />
            : <p className="text-slate-500 text-sm text-center py-12">No custom tips generated.</p>
          }
        </div>
      )}
    </div>
  )
}
