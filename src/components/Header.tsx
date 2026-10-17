import React from 'react';
import { motion } from 'motion/react';
import {
  Award,
  Settings,
  Sparkles,
  Puzzle,
  Search,
  Music2,
  Wand2,
  BookOpen,
  Type,
  Zap,
  Moon,
  Sun,
  Map,
} from 'lucide-react';
import { GameMode, LetterCase, UserProgress } from '../types';
import { soundEngine } from '../utils/audio';

interface HeaderProps {
  currentMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  progress: UserProgress;
  letterCase: LetterCase;
  onToggleCase: () => void;
  onOpenBadges: () => void;
  onOpenSettings: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSelectMode,
  progress,
  letterCase,
  onToggleCase,
  onOpenBadges,
  onOpenSettings,
  darkMode,
  onToggleDarkMode,
}) => {
  const modes: { id: GameMode; label: string; icon: React.ReactNode; color: string }[] = [
    {
      id: 'trail',
      label: 'Trilha da Leitura',
      icon: <Map className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-amber-500 fill-amber-400/20" />,
      color: 'amber',
    },
    {
      id: 'syllables',
      label: 'Monte a Palavra',
      icon: <Puzzle className="w-4 h-4 sm:w-4.5 sm:h-4.5" />,
      color: 'amber',
    },
    {
      id: 'sounds',
      label: 'Detetive dos Sons',
      icon: <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5" />,
      color: 'sky',
    },
    {
      id: 'rhymes',
      label: 'Caça-Rimas',
      icon: <Music2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />,
      color: 'pink',
    },
    {
      id: 'lab',
      label: 'Fábrica de Sílabas',
      icon: <Wand2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />,
      color: 'purple',
    },
    {
      id: 'reading',
      label: 'Leitura Guiada',
      icon: <BookOpen className="w-4 h-4 sm:w-4.5 sm:h-4.5" />,
      color: 'emerald',
    },
    {
      id: 'duel',
      label: 'Duelo Fonético',
      icon: <Zap className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-amber-500 fill-amber-500" />,
      color: 'rose',
    },
  ];

  return (
    <header
      className={`w-full sticky top-0 z-40 px-3 sm:px-6 py-2.5 backdrop-blur-md transition-colors shadow-xs ${
        darkMode
          ? 'bg-[#10172A]/95 border-b-2 border-indigo-900/70 text-slate-100'
          : 'bg-white/95 border-b-2 border-amber-200 text-slate-800'
      }`}
    >
      <div className="max-w-5xl mx-auto flex flex-col gap-2.5">
        {/* Top bar: Brand + Stats + Quick actions */}
        <div className="flex items-center justify-between gap-2">
          {/* Logo / Title */}
          <div className="flex items-center gap-2">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-xs border-2 ${
                darkMode
                  ? 'bg-gradient-to-br from-indigo-500 to-purple-600 border-indigo-400/50'
                  : 'bg-gradient-to-br from-amber-400 to-amber-500 border-amber-300'
              }`}
            >
              🦉
            </div>
            <div>
              <h1
                className={`text-base sm:text-lg font-black leading-tight ${
                  darkMode ? 'text-slate-100' : 'text-slate-800'
                }`}
              >
                Aprender a Ler
              </h1>
              <div
                className={`text-[11px] font-semibold ${
                  darkMode ? 'text-indigo-300' : 'text-amber-700'
                }`}
              >
                Alfabetização Divertida
              </div>
            </div>
          </div>

          {/* Gamification stats & quick toggles */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Stars counter */}
            <motion.div
              key={progress.stars}
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ duration: 0.3 }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl font-extrabold text-sm shadow-xs border-2 ${
                darkMode
                  ? 'bg-indigo-950/80 border-indigo-500/50 text-amber-300'
                  : 'bg-amber-50 border-amber-300 text-amber-800'
              }`}
              title="Suas estrelas"
            >
              <span className="text-base">⭐</span>
              <span>{progress.stars}</span>
            </motion.div>

            {/* Quick Letter Case switch (BASTÃO vs minúsculas) */}
            <button
              type="button"
              onClick={() => {
                soundEngine.playPop();
                onToggleCase();
              }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-2xl border text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer ${
                darkMode
                  ? 'bg-[#18223B] hover:bg-indigo-900/60 text-slate-200 border-indigo-900/80'
                  : 'bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 border-slate-200'
              }`}
              title="Alternar entre LETRA BASTÃO (MAIÚSCULA) e minúscula"
            >
              <Type className={`w-3.5 h-3.5 ${darkMode ? 'text-indigo-400' : 'text-amber-600'}`} />
              <span>{letterCase === 'uppercase' ? 'BASTÃO' : 'abc'}</span>
            </button>

            {/* Quick Night Mode Toggle Button */}
            <button
              type="button"
              onClick={() => {
                soundEngine.playPop();
                onToggleDarkMode();
              }}
              className={`p-2 rounded-2xl border transition-colors cursor-pointer ${
                darkMode
                  ? 'bg-indigo-950/90 text-indigo-300 border-indigo-700 hover:bg-indigo-900'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
              title={darkMode ? 'Desativar Modo Noturno' : 'Ativar Modo Noturno (Tons suaves)'}
            >
              {darkMode ? (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5 fill-indigo-400 text-indigo-400" />
              ) : (
                <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
              )}
            </button>

            {/* Badges Button */}
            <button
              type="button"
              onClick={() => {
                soundEngine.playPop();
                onOpenBadges();
              }}
              className={`p-2 rounded-2xl border cursor-pointer transition-colors ${
                darkMode
                  ? 'bg-indigo-950/80 hover:bg-indigo-900/80 text-amber-300 border-indigo-800'
                  : 'bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-300'
              }`}
              title="Medalhas e Resumo Pedagógico para os Pais"
            >
              <Award className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Settings Button */}
            <button
              type="button"
              onClick={() => {
                soundEngine.playPop();
                onOpenSettings();
              }}
              className={`p-2 rounded-2xl border cursor-pointer transition-colors ${
                darkMode
                  ? 'bg-[#18223B] hover:bg-slate-800 text-slate-300 border-indigo-900/80'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
              title="Ajustes e Acessibilidade"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Playful Pill selector) */}
        <nav className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-1 scrollbar-none">
          {modes.map(mode => {
            const isActive = currentMode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => {
                  soundEngine.playPop();
                  onSelectMode(mode.id);
                }}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer select-none ${
                  isActive
                    ? darkMode
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-950 border-b-3 border-indigo-800'
                      : 'bg-amber-500 text-white shadow-md shadow-amber-200 border-b-3 border-amber-700'
                    : darkMode
                    ? 'bg-[#18223B] hover:bg-indigo-950/60 text-slate-300 border border-indigo-900/70'
                    : 'bg-slate-100 hover:bg-amber-50 text-slate-700 border border-slate-200'
                }`}
              >
                {mode.icon}
                <span>{mode.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
