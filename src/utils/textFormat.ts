import { LetterCase } from '../types';

export function formatCase(text: string, letterCase: LetterCase): string {
  if (letterCase === 'uppercase') {
    return text.toUpperCase();
  }
  return text.toLowerCase();
}

// Visual color palette for distinct syllables (avoiding visual crowding)
export const SYLLABLE_COLORS = [
  {
    bg: 'bg-blue-100',
    border: 'border-blue-400',
    text: 'text-blue-900',
    activeBg: 'bg-blue-500 text-white border-blue-600',
    ring: 'focus:ring-blue-400',
  },
  {
    bg: 'bg-amber-100',
    border: 'border-amber-400',
    text: 'text-amber-900',
    activeBg: 'bg-amber-500 text-white border-amber-600',
    ring: 'focus:ring-amber-400',
  },
  {
    bg: 'bg-emerald-100',
    border: 'border-emerald-400',
    text: 'text-emerald-900',
    activeBg: 'bg-emerald-500 text-white border-emerald-600',
    ring: 'focus:ring-emerald-400',
  },
  {
    bg: 'bg-purple-100',
    border: 'border-purple-400',
    text: 'text-purple-900',
    activeBg: 'bg-purple-500 text-white border-purple-600',
    ring: 'focus:ring-purple-400',
  },
  {
    bg: 'bg-rose-100',
    border: 'border-rose-400',
    text: 'text-rose-900',
    activeBg: 'bg-rose-500 text-white border-rose-600',
    ring: 'focus:ring-rose-400',
  },
];

export function getSyllableColor(index: number) {
  return SYLLABLE_COLORS[index % SYLLABLE_COLORS.length];
}

export function formatStudyTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) {
    return `${seconds}s`;
  }
  if (seconds === 0) {
    return `${minutes} min`;
  }
  return `${minutes}m ${seconds}s`;
}
