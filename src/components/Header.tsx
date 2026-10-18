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
  Calendar,
  Star,
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
  onOpenRoutine: () => void;
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
  onOpenRoutine,
  darkMode,
  onToggleDarkMode,
}) => {
  const modes: { id: GameMode; label: string; icon: React.ReactNode; color: string }[] = [
    {
      id: 'trail',
      label: 'Trilha da Leitura',
      icon: <Map className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-amber-500" />,
      color: 'amber',
    },
    {
      id: 'syllables',
      label: 'Monte a Palavra',
      icon: <Puzzle className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-orange-500" />,
      color: 'orange',
    },
    {
      id: 'sounds',
      label: 'Detetive dos Sons',
      icon: <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-sky-500" />,
      color: 'sky',
    },
    {
      id: 'rhymes',
      label: 'Caça-Rimas',
      icon: <Music2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-pink-500" />,
      color: 'pink',
    },
    {
      id: 'lab',
      label: 'Fábrica de Sílabas',
      icon: <Wand2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-purple-500" />,
      color: 'purple',
    },
    {
      id: 'reading',
      label: 'Leitura Guiada',
      icon: <BookOpen className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-emerald-500" />,
      color: 'emerald',
    },
    {
      id: 'duel',
      label: 'Duelo Fonético',
      icon: <Zap className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-amber-500 fill-amber-500" />,
      color: 'amber',
    },
  ];

  return (
    <header
      className={`w-full sticky top-0 z-40 px-3 sm:px-6 py-2.5 backdrop-blur-md transition-colors shadow-2xs ${
        darkMode
          ? 'bg-[#0f172a]/95 border-b border-slate-800 text-slate-100'
          : 'bg-white/95 border-b border-amber-200/80 text-slate-800'
      }`}
    >
      <div className="max-w-5xl mx-auto flex flex-col gap-2.5">
        {/* Top bar: Brand + Stats + Quick actions */}
        <div className="flex items-center justify-between gap-2">
          {/* Logo / Title */}
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center shadow-xs border transition-transform ${
                darkMode
                  ? 'bg-gradient-to-br from-indigo-600 to-purple-600 border-indigo-400/40 text-white'
                  : 'bg-gradient-to-br from-amber-400 to-orange-400 border-amber-300 text-amber-950'
              }`}
            >
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1
                  className={`text-base sm:text-lg font-black leading-tight ${
                    darkMode ? 'text-slate-100' : 'text-slate-800'
                  }`}
                >
                  Alfabetização Divertida
                </h1>
                <span className="hidden sm:inline-block px-1.5 py-0.2 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400">
                  Leitura Ativa
                </span>
              </div>
              <div
                className={`text-[11px] font-semibold leading-none mt-0.5 ${
                  darkMode ? 'text-indigo-300' : 'text-amber-700'
                }`}
              >
                Consciência Fonológica e Apoio Pedagógico
              </div>
            </div>
          </div>

          {/* Gamification stats & quick toggles */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Stars counter */}
            <motion.div
              key={progress.stars}
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.25 }}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-2xl font-black text-xs sm:text-sm border shadow-2xs ${
                darkMode
                  ? 'bg-[#1e293b] border-slate-700 text-amber-300'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}
              title="Suas estrelas douradas"
            >
              <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400 text-amber-500" />
              <span>{progress.stars}</span>
            </motion.div>

            {/* Cronograma de Rotina Button */}
            <button
              type="button"
              onClick={() => {
                soundEngine.playPop();
                onOpenRoutine();
              }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                darkMode
                  ? 'bg-[#1e293b] hover:bg-slate-700 text-indigo-300 border-slate-700'
                  : 'bg-white hover:bg-amber-50 text-amber-900 border-amber-200'
              }`}
              title="Ver Cronograma de Rotina Semanal de Estudos"
            >
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Rotina</span>
            </button>

            {/* Quick Letter Case switch (BASTÃO vs minúsculas) */}
            <button
              type="button"
              onClick={() => {
                soundEngine.playPop();
                onToggleCase();
              }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                darkMode
                  ? 'bg-[#1e293b] hover:bg-slate-700 text-slate-200 border-slate-700'
                  : 'bg-white hover:bg-amber-50 text-slate-700 border-slate-200'
              }`}
              title="Alternar entre Letra BASTÃO (MAIÚSCULA) e minúscula"
            >
              <Type className={`w-3.5 h-3.5 ${darkMode ? 'text-indigo-400' : 'text-amber-600'}`} />
              <span>{letterCase === 'uppercase' ? 'BASTÃO' : 'abc'}</span>
            </button>

            {/* Quick Dark Mode Toggle Button */}
            <button
              type="button"
              onClick={() => {
                soundEngine.playPop();
                onToggleDarkMode();
              }}
              className={`p-2 rounded-2xl border transition-colors cursor-pointer ${
                darkMode
                  ? 'bg-[#1e293b] text-indigo-300 border-slate-700 hover:bg-slate-700'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-amber-50'
              }`}
              title={darkMode ? 'Desativar Modo Escuro' : 'Ativar Modo Escuro'}
            >
              {darkMode ? (
                <Moon className="w-4 h-4 fill-indigo-400 text-indigo-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-600" />
              )}
            </button>

            {/* Badges / Relatório dos Pais */}
            <button
              type="button"
              onClick={() => {
                soundEngine.playPop();
                onOpenBadges();
              }}
              className={`p-2 rounded-2xl border cursor-pointer transition-colors ${
                darkMode
                  ? 'bg-[#1e293b] hover:bg-slate-700 text-amber-300 border-slate-700'
                  : 'bg-white hover:bg-amber-50 text-amber-700 border-amber-200'
              }`}
              title="Medalhas e Relatório dos Pais"
            >
              <Award className="w-4 h-4" />
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
                  ? 'bg-[#1e293b] hover:bg-slate-700 text-slate-300 border-slate-700'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
              title="Ajustes de Voz e Acessibilidade"
            >
              <Settings className="w-4 h-4" />
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
                      ? 'bg-indigo-600 text-white shadow-xs font-black'
                      : 'bg-amber-500 text-white shadow-xs font-black'
                    : darkMode
                    ? 'bg-[#182234] hover:bg-slate-800 text-slate-300 border border-slate-700/80'
                    : 'bg-white hover:bg-amber-50/80 text-slate-700 border border-slate-200'
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
