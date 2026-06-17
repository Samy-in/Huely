import React, { useState } from 'react';
import { ShoppingBag, ChevronDown } from 'lucide-react';
import { getShopLinks } from '../../utils/shopLinks';

// Emojis mapping for categories
const CATEGORIES_MAPPING = {
  Top: ['👕', '👔', '👚', '👗', '👚'],
  Bottom: ['👖', '🩳', '👖', '👖', '👖'],
  Accessory: ['🕶️', '⌚', '👜', '👟', '🧣'],
};

const SHOP_BUTTONS = [
  { key: 'amazon',   label: 'Amazon ↗',   bg: 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 border-amber-500/20' },
  { key: 'flipkart', label: 'Flipkart ↗', bg: 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 border-blue-500/20' },
  { key: 'meesho',   label: 'Meesho ↗',   bg: 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 border-purple-500/20' },
];

function AccordionItem({ item, index, gender, isExpanded, onToggle }) {
  const links = getShopLinks(item, gender);
  
  // Detect category icon
  let icon = '👔';
  const textLower = item.toLowerCase();
  if (textLower.includes('jean') || textLower.includes('trouser') || textLower.includes('pant') || textLower.includes('skirt') || textLower.includes('chino') || textLower.includes('short')) {
    icon = CATEGORIES_MAPPING.Bottom[index % CATEGORIES_MAPPING.Bottom.length];
  } else if (textLower.includes('dress') || textLower.includes('saree') || textLower.includes('suit') || textLower.includes('shirt') || textLower.includes('kurta') || textLower.includes('t-shirt') || textLower.includes('top') || textLower.includes('jacket') || textLower.includes('blazer')) {
    icon = CATEGORIES_MAPPING.Top[index % CATEGORIES_MAPPING.Top.length];
  } else {
    icon = CATEGORIES_MAPPING.Accessory[index % CATEGORIES_MAPPING.Accessory.length];
  }

  const tags = [
    'Tone Matched',
    'Contrast Approved',
    'Tailored Fit',
    'Proportion Balanced',
  ];
  const tag = tags[index % tags.length];

  return (
    <div className="glass-card rounded-2xl border border-white/60 bg-white/20 overflow-hidden shadow-sm transition-all duration-300 hover:border-slate-400/20 hover:bg-white/40">
      
      {/* Accordion Header Trigger */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left font-sans select-none"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <span className="text-2xl flex-shrink-0">{icon}</span>
          <div className="min-w-0">
            <span className="text-[9px] font-bold tracking-widest text-slate-400 bg-slate-900/5 px-2 py-0.5 rounded-full border border-slate-900/5 uppercase inline-block mb-1">
              {tag}
            </span>
            <p className="text-sm font-semibold text-slate-800 leading-snug">
              {item}
            </p>
          </div>
        </div>

        <ChevronDown 
          size={16} 
          className={`text-slate-500 transition-transform duration-300 flex-shrink-0 ml-3
            ${isExpanded ? 'transform rotate-180' : 'rotate-0'}`} 
        />
      </button>

      {/* Accordion Collapsible Panel */}
      <div 
        className={`transition-all duration-300 ease-in-out overflow-hidden
          ${isExpanded ? 'max-h-36 opacity-100 border-t border-slate-200/50' : 'max-h-0 opacity-0 border-t-0'}`}
      >
        <div className="p-4 flex flex-col gap-3 bg-white/45">
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShoppingBag size={10} className="text-slate-500" />
              AVAILABLE STORES
            </span>
            <span>MATCH LEVEL: OPTIMAL</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {SHOP_BUTTONS.map(({ key, label, bg }) => (
              <a
                key={key}
                href={links[key]}
                target="_blank"
                rel="noopener noreferrer"
                className={`py-2 px-1.5 rounded-xl text-[11px] font-bold border text-center transition-all duration-200 shadow-sm ${bg}`}
                onClick={e => e.stopPropagation()}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OutfitCard({ outfits, gender }) {
  const [expandedIndex, setExpandedIndex] = useState(0); // First item expanded by default

  if (!outfits || outfits.length === 0) return null;

  const genderLabel = gender === 'Male' ? 'Men\'s' : gender === 'Female' ? 'Women\'s' : '';
  const genderEmoji = gender === 'Male' ? '👨' : gender === 'Female' ? '👩' : '👤';

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="flex items-center gap-2 bg-slate-900/5 border border-slate-200/50 rounded-2xl px-5 py-3.5 shadow-sm">
        <span className="text-xl animate-pulse">{genderEmoji}</span>
        <div>
          <p className="text-[10px] text-slate-400 font-mono leading-none mb-1 uppercase tracking-wider">
            {genderLabel} Curated Closet
          </p>
          <h4 className="text-sm font-black text-slate-800 tracking-tight leading-none uppercase">
            Wardrobe Recommendations
          </h4>
        </div>
        <span className="ml-auto text-[10px] font-mono text-slate-500">
          TAP TO EXPAND ↓
        </span>
      </div>

      {/* Accordion list */}
      <div className="space-y-2.5">
        {outfits.map((item, i) => (
          <AccordionItem 
            key={i} 
            item={item} 
            index={i} 
            gender={gender} 
            isExpanded={expandedIndex === i}
            onToggle={() => setExpandedIndex(expandedIndex === i ? null : i)}
          />
        ))}
      </div>
    </div>
  );
}
