import React, { useState } from 'react';

interface StoreLogoProps {
  logo?: string;
  name?: string;
  category?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

// Preset vector logos and color palettes for diverse stores
const BRAND_PRESETS: Record<string, {
  bg: string;
  text: string;
  border: string;
  iconSvg: React.ReactNode;
}> = {
  'atlas-botanicals': {
    bg: 'bg-gradient-to-br from-emerald-500 to-teal-700',
    text: 'text-white',
    border: 'border-emerald-200',
    iconSvg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <path d="M12 2a9.7 9.7 0 0 0-7 3c-4 4-2 11 3 15 2.5 2 6 2 8 0 5-4 7-11 3-15a9.7 9.7 0 0 0-7-3z" />
        <path d="M12 2v20" />
        <path d="M12 12c-2.5-1.5-4-3-4-5" />
        <path d="M12 17c2.5-1.5 4-3 4-5" />
      </svg>
    ),
  },
  'caftan-royal': {
    bg: 'bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600',
    text: 'text-white',
    border: 'border-amber-200',
    iconSvg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" fill="currentColor" fillOpacity="0.25" />
        <circle cx="12" cy="4" r="1.5" fill="currentColor" />
        <circle cx="5" cy="5" r="1.5" fill="currentColor" />
        <circle cx="19" cy="5" r="1.5" fill="currentColor" />
        <path d="M5 19h14v2H5z" fill="currentColor" />
      </svg>
    ),
  },
  'zubtitle-mena': {
    bg: 'bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700',
    text: 'text-white',
    border: 'border-purple-200',
    iconSvg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" fillOpacity="0.2" />
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
  },
  'electromaroc': {
    bg: 'bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-600',
    text: 'text-white',
    border: 'border-blue-200',
    iconSvg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
      </svg>
    ),
  },
  'saffron-taliouine': {
    bg: 'bg-gradient-to-br from-rose-600 via-red-600 to-amber-600',
    text: 'text-white',
    border: 'border-rose-200',
    iconSvg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <path d="M12 2C9 7 4 9 4 14a8 8 0 0 0 16 0c0-5-5-7-8-12z" fill="currentColor" fillOpacity="0.25" />
        <path d="M12 8c0 4-2 6-4 8" />
        <path d="M12 8c0 4 2 6 4 8" />
        <path d="M12 8v10" />
      </svg>
    ),
  },
  'marrakech-leather': {
    bg: 'bg-gradient-to-br from-amber-700 via-orange-800 to-stone-800',
    text: 'text-white',
    border: 'border-amber-300',
    iconSvg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <path d="M6 9V6a3 3 0 0 1 6 0v3" />
        <path d="M18 9V6a3 3 0 0 0-6 0v3" />
        <rect x="3" y="9" width="18" height="13" rx="3" fill="currentColor" fillOpacity="0.2" />
        <circle cx="12" cy="15" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  'kech-sneakers': {
    bg: 'bg-gradient-to-br from-fuchsia-600 via-rose-600 to-orange-500',
    text: 'text-white',
    border: 'border-fuchsia-200',
    iconSvg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <path d="M3 14h18l-2-6H5z" />
        <path d="M3 14v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4" />
        <path d="M7 11l2 3" />
        <path d="M12 11l2 3" />
      </svg>
    ),
  },
  'dar-zellige': {
    bg: 'bg-gradient-to-br from-cyan-600 via-blue-700 to-indigo-900',
    text: 'text-white',
    border: 'border-cyan-200',
    iconSvg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <rect x="3" y="3" width="8" height="8" rx="1" fill="currentColor" fillOpacity="0.3" />
        <rect x="13" y="3" width="8" height="8" rx="1" fill="currentColor" fillOpacity="0.3" />
        <rect x="3" y="13" width="8" height="8" rx="1" fill="currentColor" fillOpacity="0.3" />
        <rect x="13" y="13" width="8" height="8" rx="1" fill="currentColor" fillOpacity="0.3" />
      </svg>
    ),
  }
};

const RANDOM_PALETTES = [
  { bg: 'bg-gradient-to-br from-blue-600 to-indigo-700', text: 'text-white', border: 'border-blue-200' },
  { bg: 'bg-gradient-to-br from-emerald-500 to-teal-700', text: 'text-white', border: 'border-emerald-200' },
  { bg: 'bg-gradient-to-br from-purple-600 to-pink-600', text: 'text-white', border: 'border-purple-200' },
  { bg: 'bg-gradient-to-br from-amber-500 to-orange-600', text: 'text-white', border: 'border-amber-200' },
  { bg: 'bg-gradient-to-br from-rose-500 to-red-700', text: 'text-white', border: 'border-rose-200' },
  { bg: 'bg-gradient-to-br from-cyan-500 to-blue-600', text: 'text-white', border: 'border-cyan-200' },
  { bg: 'bg-gradient-to-br from-violet-600 to-purple-800', text: 'text-white', border: 'border-violet-200' },
  { bg: 'bg-gradient-to-br from-teal-500 to-emerald-700', text: 'text-white', border: 'border-teal-200' },
];

const SIZE_MAP = {
  xs: 'w-6 h-6 rounded-lg text-[10px]',
  sm: 'w-8 h-8 rounded-xl text-xs',
  md: 'w-10 h-10 rounded-xl text-sm',
  lg: 'w-12 h-12 rounded-2xl text-base',
  xl: 'w-14 h-14 rounded-2xl text-lg',
};

const ICON_SIZE_MAP = {
  xs: 'w-3.5 h-3.5',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-7 h-7',
};

export const StoreLogo: React.FC<StoreLogoProps> = ({
  logo = '',
  name = '',
  category = '',
  size = 'lg',
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);

  // Check if logo is an image URL
  const isImageUrl = logo.startsWith('http://') || logo.startsWith('https://') || logo.startsWith('/') || logo.startsWith('data:');

  // Check if logo or slug matches a preset
  const cleanKey = (name || logo || '').toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  const matchedPresetKey = Object.keys(BRAND_PRESETS).find(k => cleanKey.includes(k) || (logo && logo.toLowerCase().includes(k)));

  // If valid image URL and no error, render the image
  if (isImageUrl && !imgError) {
    return (
      <div className={`${SIZE_MAP[size]} overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shadow-2xs shrink-0 ${className}`}>
        <img 
          src={logo} 
          alt={name || 'Store Logo'} 
          onError={() => setImgError(true)}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // If matched preset vector brand logo
  if (matchedPresetKey && BRAND_PRESETS[matchedPresetKey]) {
    const preset = BRAND_PRESETS[matchedPresetKey];
    return (
      <div className={`${SIZE_MAP[size]} ${preset.bg} ${preset.text} border ${preset.border} flex items-center justify-center shadow-xs shrink-0 relative p-2 ${className}`}>
        <div className={ICON_SIZE_MAP[size]}>
          {preset.iconSvg}
        </div>
      </div>
    );
  }

  // Otherwise generate deterministic dynamic brand avatar
  const hash = (name + category).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const palette = RANDOM_PALETTES[hash % RANDOM_PALETTES.length];
  
  // Extract initials (e.g. "Atlas Botanicals" -> "AB", "Caftan Royal" -> "CR")
  const initials = (name || 'Store')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');

  return (
    <div className={`${SIZE_MAP[size]} ${palette.bg} ${palette.text} border ${palette.border} flex items-center justify-center font-black tracking-tight shadow-xs shrink-0 select-none ${className}`}>
      <span>{initials || 'RL'}</span>
    </div>
  );
};
