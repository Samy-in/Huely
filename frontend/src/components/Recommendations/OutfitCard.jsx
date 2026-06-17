import { useState } from 'react';
import { ChevronDown, ChevronUp, ShoppingBag } from 'lucide-react';
import { getShopLinks } from '../../utils/shopLinks';

// Gender-specific outfit category icons
const MALE_ICONS   = ['👔', '🧥', '👕', '🩳'];
const FEMALE_ICONS = ['👗', '👚', '🥻', '👙'];

const SHOP_BUTTONS = [
  { key: 'amazon',   label: 'Amazon',   color: '#FF9900', border: 'border-[#FF9900]/40', text: 'text-[#FF9900]', bg: 'hover:bg-[#FF9900]/15' },
  { key: 'flipkart', label: 'Flipkart', color: '#2874F0', border: 'border-[#2874F0]/40', text: 'text-[#2874F0]', bg: 'hover:bg-[#2874F0]/15' },
  { key: 'meesho',   label: 'Meesho',   color: '#9B1FE8', border: 'border-[#9B1FE8]/40', text: 'text-[#9B1FE8]', bg: 'hover:bg-[#9B1FE8]/15' },
];

function OutfitItem({ item, index, gender }) {
  const [open, setOpen] = useState(false);
  const icons = gender === 'Male' ? MALE_ICONS : FEMALE_ICONS;
  const icon  = icons[index % icons.length];
  const links = getShopLinks(item, gender);

  return (
    <li className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden transition-all duration-200">
      {/* Header row — clickable to expand shop links */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 p-3.5 text-left group"
      >
        <span className="text-xl w-8 flex-shrink-0 text-center">{icon}</span>
        <div className="flex-1 min-w-0">
          <span className="text-sm text-slate-200 leading-snug">{item}</span>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
          <ShoppingBag size={13} className="text-slate-500 group-hover:text-violet-400 transition-colors" />
          {open
            ? <ChevronUp  size={14} className="text-slate-500" />
            : <ChevronDown size={14} className="text-slate-500" />
          }
        </div>
      </button>

      {/* Shop links — revealed on click */}
      {open && (
        <div className="flex gap-2 px-4 pb-3 flex-wrap border-t border-white/5 pt-2.5">
          {SHOP_BUTTONS.map(({ key, label, border, text, bg }) => (
            <a
              key={key}
              href={links[key]}
              target="_blank"
              rel="noopener noreferrer"
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 ${border} ${text} ${bg}`}
              onClick={e => e.stopPropagation()}
            >
              {label} ↗
            </a>
          ))}
        </div>
      )}
    </li>
  );
}

export default function OutfitCard({ outfits, gender }) {
  if (!outfits || outfits.length === 0) return null;

  const genderLabel = gender === 'Male' ? 'Men\'s' : gender === 'Female' ? 'Women\'s' : '';
  const genderEmoji = gender === 'Male' ? '👨' : gender === 'Female' ? '👩' : '👤';

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">{genderEmoji}</span>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
          {genderLabel} Outfit Suggestions
        </p>
        <span className="ml-auto text-xs text-slate-600">tap to shop ↓</span>
      </div>
      <ul className="space-y-2">
        {outfits.map((item, i) => (
          <OutfitItem key={i} item={item} index={i} gender={gender} />
        ))}
      </ul>
    </div>
  );
}


