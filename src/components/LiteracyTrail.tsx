import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  CheckCircle2,
  Lock,
  Play,
  Volume2,
  Sparkles,
  Trophy,
  Award,
  Unlock,
  GraduationCap,
  ArrowRight,
  BookOpen,
  RotateCcw,
  Printer,
  Calendar,
  Compass,
  Layers,
  Music2,
  Zap,
  Puzzle,
  Star,
  Clock,
  Target,
} from 'lucide-react';
import { TrailMission, LetterCase, TrailProgress, GameMode } from '../types';
import { TRAIL_MISSIONS } from '../data/trailData';
import { getTodayRoutinePlan } from '../data/routineData';
import { soundEngine } from '../utils/audio';

interface LiteracyTrailProps {
  trailProgress: TrailProgress;
  onSelectMission: (mission: TrailMission) => void;
  onToggleUnlockAll: () => void;
  onResetTrail: () => void;
  onOpenRoutine?: () => void;
  onSelectMode?: (mode: GameMode) => void;
  letterCase: LetterCase;
  speechRate: number;
  voiceEnabled: boolean;
  darkMode: boolean;
  totalStars: number;
  activeProfileName?: string;
}

export const LiteracyTrail: React.FC<LiteracyTrailProps> = ({
  trailProgress,
  onSelectMission,
  onToggleUnlockAll,
  onResetTrail,
  onOpenRoutine,
  onSelectMode,
  letterCase,
  speechRate,
  voiceEnabled,
  darkMode,
  totalStars,
  activeProfileName,
}) => {
  const [selectedMissionForModal, setSelectedMissionForModal] = useState<TrailMission | null>(null);
  const [isGraduationModalOpen, setIsGraduationModalOpen] = useState(false);
  const [studentName, setStudentName] = useState(activeProfileName || 'Pequeno Campeão');

  React.useEffect(() => {
    if (activeProfileName) {
      setStudentName(activeProfileName);
    }
  }, [activeProfileName]);

  const todayRoutine = getTodayRoutinePlan();

  const completedCount = trailProgress.completedMissionIds.length;
  const totalMissions = TRAIL_MISSIONS.length;
  const progressPercent = Math.min(100, Math.round((completedCount / totalMissions) * 100));

  // Find the current active mission
  const currentMission =
    TRAIL_MISSIONS.find(m => m.id === trailProgress.currentMissionId) ||
    TRAIL_MISSIONS.find(m => !trailProgress.completedMissionIds.includes(m.id)) ||
    TRAIL_MISSIONS[0];

  const handleNodeClick = (mission: TrailMission) => {
    soundEngine.playPop();
    const isCompleted = trailProgress.completedMissionIds.includes(mission.id);
    const isCurrent = mission.id === currentMission.id;
    const isUnlocked = trailProgress.unlockedAllForTesting || isCompleted || isCurrent;

    if (!isUnlocked) {
      if (voiceEnabled) {
        soundEngine.speakText('Complete as etapas anteriores para destravar essa fase!', speechRate);
      }
      return;
    }

    if (mission.missionType === 'graduation') {
      setIsGraduationModalOpen(true);
      soundEngine.playCelebrationFanfare();
      return;
    }

    setSelectedMissionForModal(mission);
    if (voiceEnabled) {
      soundEngine.speakText(mission.instructionVoiceText, speechRate);
    }
  };

  const handleStartMission = (mission: TrailMission) => {
    setSelectedMissionForModal(null);
    onSelectMission(mission);
  };

  const formatText = (text: string) => {
    return letterCase === 'uppercase' ? text.toUpperCase() : text;
  };

  // Sleek SVG icon for each world
  const getWorldIcon = (worldId: string) => {
    switch (worldId) {
      case 'world_1':
        return <Compass className="w-5 h-5 text-sky-500" />;
      case 'world_2':
        return <Layers className="w-5 h-5 text-purple-500" />;
      case 'world_3':
        return <Music2 className="w-5 h-5 text-pink-500" />;
      case 'world_4':
        return <Puzzle className="w-5 h-5 text-orange-500" />;
      case 'world_5':
        return <Zap className="w-5 h-5 text-amber-500" />;
      case 'world_6':
        return <BookOpen className="w-5 h-5 text-emerald-500" />;
      case 'world_graduation':
        return <GraduationCap className="w-5 h-5 text-amber-500" />;
      default:
        return <Sparkles className="w-5 h-5 text-amber-500" />;
    }
  };

  // Sleek SVG icon for mission type
  const getMissionIcon = (mission: TrailMission, isCompleted: boolean) => {
    if (isCompleted) {
      return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    }
    switch (mission.missionType) {
      case 'vowels':
        return <Compass className="w-5 h-5 text-sky-500" />;
      case 'syllables_simple':
        return <Layers className="w-5 h-5 text-purple-500" />;
      case 'sounds':
        return <Volume2 className="w-5 h-5 text-sky-500" />;
      case 'rhymes':
        return <Music2 className="w-5 h-5 text-pink-500" />;
      case 'words_build':
        return <Puzzle className="w-5 h-5 text-orange-500" />;
      case 'duel':
        return <Zap className="w-5 h-5 text-amber-500" />;
      case 'story_reading':
        return <BookOpen className="w-5 h-5 text-emerald-500" />;
      case 'graduation':
        return <Trophy className="w-5 h-5 text-amber-500" />;
      default:
        return <Sparkles className="w-5 h-5 text-amber-500" />;
    }
  };

  // Group missions by world for visual trail checkpoints
  const worldGroups = TRAIL_MISSIONS.reduce((acc, mission) => {
    if (!acc[mission.worldId]) {
      acc[mission.worldId] = {
        worldId: mission.worldId,
        worldTitle: mission.worldTitle,
        worldEmoji: mission.worldEmoji,
        missions: [],
      };
    }
    acc[mission.worldId].missions.push(mission);
    return acc;
  }, {} as Record<string, { worldId: string; worldTitle: string; worldEmoji: string; missions: TrailMission[] }>);

  return (
    <div className="w-full flex flex-col items-center gap-6 pb-12">
      {/* 1. CRONOGRAMA DE ROTINA PEDAGÓGICA (Destaque do Dia) */}
      <div
        className={`w-full p-4 sm:p-5 rounded-3xl border transition-all ${
          darkMode
            ? 'bg-[#182234] border-slate-700 shadow-lg text-slate-100'
            : 'bg-gradient-to-r from-amber-50 via-orange-50/40 to-amber-50 border-amber-200 shadow-2xs text-slate-800'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                darkMode
                  ? 'bg-indigo-950 text-indigo-300 border-indigo-800'
                  : 'bg-amber-100 text-amber-800 border-amber-300'
              }`}
            >
              <Calendar className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Rotina de Hoje ({todayRoutine.dayName})
                </span>
                <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-300">
                  Meta: {todayRoutine.recommendedMinutes} min
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-black leading-tight mt-0.5">
                {todayRoutine.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 hidden sm:block">
                {todayRoutine.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {onOpenRoutine && (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playPop();
                  onOpenRoutine();
                }}
                className={`flex-1 sm:flex-none justify-center px-3 py-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                  darkMode
                    ? 'bg-[#111827] border-slate-700 text-slate-300 hover:bg-slate-800'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Ver Cronograma
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                soundEngine.playPop();
                if (onSelectMode) {
                  onSelectMode(todayRoutine.recommendedMode);
                }
              }}
              className="flex-1 sm:flex-none justify-center px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Praticar Agora</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Banner: Trail Dashboard & Overview */}
      <div
        className={`w-full p-5 sm:p-6 rounded-3xl border transition-all ${
          darkMode
            ? 'bg-[#182234] border-slate-700 shadow-xl'
            : 'bg-white border-amber-200/90 shadow-2xs'
        }`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xs border ${
                darkMode ? 'bg-indigo-950 text-indigo-300 border-indigo-800' : 'bg-amber-100 text-amber-800 border-amber-300'
              }`}
            >
              <Compass className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1
                  className={`text-lg sm:text-xl font-black ${
                    darkMode ? 'text-white' : 'text-slate-800'
                  }`}
                >
                  {formatText('Trilha da Leitura')}
                </h1>
                <span
                  className={`px-2 py-0.5 rounded-full text-2xs font-extrabold uppercase tracking-wider ${
                    darkMode ? 'bg-indigo-950 text-indigo-300 border border-indigo-800' : 'bg-amber-100 text-amber-900 border border-amber-200'
                  }`}
                >
                  Passo a Passo
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {formatText('Aprenda a ler desde os primeiros sons até histórias inteiras!')}
              </p>
            </div>
          </div>

          {/* Quick Actions & Teacher Switch */}
          <div className="flex flex-wrap items-center gap-2 self-end md:self-center">
            <button
              type="button"
              onClick={onToggleUnlockAll}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                trailProgress.unlockedAllForTesting
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                  : darkMode
                  ? 'bg-[#111827] hover:bg-slate-800 text-indigo-200 border-slate-700'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
              title="Permite que pais e professores liberem todas as fases para praticar fora da ordem"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>{trailProgress.unlockedAllForTesting ? 'Modo Livre Ativo' : 'Modo Educador (Liberar Tudo)'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundEngine.playPop();
                if (voiceEnabled) {
                  soundEngine.speakText(
                    'Essa é a sua Trilha da Leitura! Clique na próxima missão para avançar rumo ao seu diploma de leitor.',
                    speechRate
                  );
                }
              }}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                darkMode
                  ? 'bg-[#111827] text-indigo-300 border-slate-700 hover:bg-slate-800'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
              title="Ouvir orientações da trilha"
            >
              <Volume2 className="w-4 h-4 text-amber-500" />
            </button>
          </div>
        </div>

        {/* Trail Progress Bar & Current Next Step Callout */}
        <div className="mt-4 pt-3.5 border-t border-slate-200/60 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-2/3 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>
                Progresso: {completedCount} de {totalMissions} etapas concluídas
              </span>
              <span className="text-amber-500 font-extrabold">{progressPercent}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-emerald-500"
              />
            </div>
          </div>

          {/* Big Quick-Launch "Próxima Missão" button */}
          <button
            type="button"
            onClick={() => handleNodeClick(currentMission)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white shadow-2xs active:scale-95 transition-all cursor-pointer select-none"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Continuar: {currentMission.title}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. The Winding Learning Trail Worlds */}
      <div className="w-full flex flex-col gap-6 relative">
        {Object.values(worldGroups).map((world, worldIndex) => (
          <div
            key={world.worldId}
            className={`w-full p-4 sm:p-6 rounded-3xl border relative transition-all ${
              darkMode
                ? 'bg-[#182234] border-slate-700'
                : 'bg-white border-slate-200 shadow-2xs'
            }`}
          >
            {/* World Header */}
            <div className="flex items-center justify-between gap-3 mb-5 pb-3 border-b border-slate-200/60 dark:border-slate-700">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                    darkMode ? 'bg-[#111827] border-slate-700' : 'bg-slate-100 border-slate-200'
                  }`}
                >
                  {getWorldIcon(world.worldId)}
                </div>
                <div>
                  <span className="text-2xs font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                    MUNDO {worldIndex + 1}
                  </span>
                  <h2 className={`text-sm sm:text-base font-black ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                    {formatText(world.worldTitle)}
                  </h2>
                </div>
              </div>

              <div className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {world.missions.filter(m => trailProgress.completedMissionIds.includes(m.id)).length}/
                {world.missions.length} Concluídas
              </div>
            </div>

            {/* Mission Nodes Grid along this world */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
              {world.missions.map(mission => {
                const isCompleted = trailProgress.completedMissionIds.includes(mission.id);
                const isCurrent = mission.id === currentMission.id;
                const isUnlocked = trailProgress.unlockedAllForTesting || isCompleted || isCurrent;

                return (
                  <motion.div
                    key={mission.id}
                    whileHover={isUnlocked ? { scale: 1.01 } : {}}
                    whileTap={isUnlocked ? { scale: 0.99 } : {}}
                    onClick={() => handleNodeClick(mission)}
                    className={`relative p-4 rounded-2xl border flex flex-col justify-between gap-2.5 transition-all cursor-pointer ${
                      isCompleted
                        ? darkMode
                          ? 'bg-emerald-950/20 border-emerald-800/60 text-emerald-200'
                          : 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                        : isCurrent
                        ? darkMode
                          ? 'bg-[#111827] border-amber-500 shadow-md text-white ring-2 ring-amber-500/30'
                          : 'bg-amber-50/90 border-amber-500 shadow-xs text-slate-900 ring-2 ring-amber-400/20'
                        : !isUnlocked
                        ? darkMode
                          ? 'bg-[#111827]/50 border-slate-800 text-slate-500 opacity-60'
                          : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                        : darkMode
                        ? 'bg-[#111827] border-slate-700 text-slate-200 hover:border-slate-500'
                        : 'bg-white border-slate-200 text-slate-800 hover:border-amber-300'
                    }`}
                  >
                    {/* Node Header: Number, Icon, Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shadow-2xs ${
                            isCompleted
                              ? 'bg-emerald-500 text-white'
                              : isCurrent
                              ? 'bg-amber-500 text-white'
                              : !isUnlocked
                              ? 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                              : 'bg-indigo-600 text-white'
                          }`}
                        >
                          {getMissionIcon(mission, isCompleted)}
                        </div>
                        <div>
                          <span className="text-2xs font-bold text-slate-400 block leading-tight">
                            Etapa {mission.order}
                          </span>
                          <h3 className="font-bold text-xs sm:text-sm leading-tight">
                            {formatText(mission.title)}
                          </h3>
                        </div>
                      </div>

                      {/* Status badge */}
                      <div>
                        {isCompleted ? (
                          <div className="flex items-center gap-0.5 text-amber-500">
                            {Array.from({ length: mission.starsReward }).map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-500" />
                            ))}
                          </div>
                        ) : isCurrent ? (
                          <span className="px-2 py-0.5 rounded-full text-2xs font-extrabold bg-amber-500 text-white">
                            Sua Vez
                          </span>
                        ) : !isUnlocked ? (
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                        ) : (
                          <span className="text-xs text-amber-500 font-bold flex items-center gap-0.5">
                            +{mission.starsReward} <Star className="w-3 h-3 fill-amber-400 text-amber-500 inline" />
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Subtitle / Focus */}
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {formatText(mission.subtitle)}
                    </p>

                    {/* Pedagogical Tag & Play button */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-2xs">
                      <span className="px-2 py-0.5 rounded-md font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {mission.missionType === 'vowels' && 'Vogais'}
                        {mission.missionType === 'syllables_simple' && 'Sílabas'}
                        {mission.missionType === 'rhymes' && 'Rimas'}
                        {mission.missionType === 'words_build' && 'Palavras'}
                        {mission.missionType === 'duel' && 'Duelo'}
                        {mission.missionType === 'story_reading' && 'História'}
                        {mission.missionType === 'graduation' && 'Formatura'}
                      </span>

                      <span
                        className={`font-bold flex items-center gap-1 ${
                          isCompleted
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : isCurrent
                            ? 'text-amber-600 dark:text-amber-400 font-black'
                            : !isUnlocked
                            ? 'text-slate-400'
                            : 'text-indigo-600 dark:text-indigo-400'
                        }`}
                      >
                        <span>{isCompleted ? 'Revisar' : isCurrent ? 'Começar!' : 'Abrir'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Reset Trail Helper (Pedagogical utility) */}
      <div className="w-full flex justify-end">
        <button
          type="button"
          onClick={onResetTrail}
          className="text-xs text-slate-400 hover:text-rose-500 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reiniciar Progresso da Trilha</span>
        </button>
      </div>

      {/* MISSION LAUNCH MODAL */}
      {selectedMissionForModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={`w-full max-w-md p-6 sm:p-7 rounded-3xl border shadow-2xl relative ${
              darkMode ? 'bg-[#111827] border-slate-700 text-white' : 'bg-white border-amber-200 text-slate-800'
            }`}
          >
            <div className="text-center flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-2xl shadow-sm">
                {getMissionIcon(selectedMissionForModal, false)}
              </div>

              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                <span>{selectedMissionForModal.worldTitle}</span>
                <span>•</span>
                <span>Etapa {selectedMissionForModal.order}</span>
              </div>

              <h2 className="text-lg sm:text-xl font-black">{formatText(selectedMissionForModal.title)}</h2>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {formatText(selectedMissionForModal.description)}
              </p>

              {/* Pedagogical Goal callout */}
              <div
                className={`w-full p-3 rounded-2xl text-xs flex items-start gap-2.5 text-left ${
                  darkMode ? 'bg-[#182234] border border-slate-700 text-slate-200' : 'bg-amber-50 border border-amber-200 text-amber-900'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Objetivo Pedagógico:</span>
                  <span>{selectedMissionForModal.pedagogicalGoal}</span>
                </div>
              </div>

              {/* Recompensa */}
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500">
                <span>Recompensa:</span>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: selectedMissionForModal.starsReward }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="w-full flex flex-col sm:flex-row items-center gap-2.5 mt-3">
                <button
                  type="button"
                  onClick={() => setSelectedMissionForModal(null)}
                  className="w-full sm:w-1/3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Voltar
                </button>

                <button
                  type="button"
                  onClick={() => handleStartMission(selectedMissionForModal)}
                  className="w-full sm:w-2/3 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-95 transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Iniciar Missão</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* GRADUATION DIPLOMA MODAL */}
      {isGraduationModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:fixed print:inset-0 print:p-0 print:bg-white print:z-[99999]">
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`w-full max-w-xl p-6 sm:p-8 rounded-3xl border-2 text-slate-800 shadow-2xl relative my-8 print:my-0 print:p-4 print:border-none print:shadow-none print:w-full print:max-w-none ${
              darkMode ? 'bg-[#111827] border-amber-500 text-slate-100 print:bg-white print:text-slate-900' : 'bg-white border-amber-400 text-slate-800'
            }`}
          >
            {/* Certificate Frame */}
            <div className={`border-2 border-dashed p-6 rounded-2xl text-center flex flex-col items-center gap-4 ${
              darkMode ? 'border-amber-500/50 bg-[#182234] print:border-amber-600 print:bg-amber-50/20' : 'border-amber-300 bg-amber-50/40'
            }`}>
              <div className="w-16 h-16 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-md">
                <GraduationCap className="w-8 h-8" />
              </div>

              <div>
                <span className="text-2xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                  PLATAFORMA DE ALFABETIZAÇÃO DIVERTIDA
                </span>
                <h2 className={`text-xl sm:text-2xl font-black mt-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  CERTIFICADO DO PEQUENO LEITOR
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Concluiu com louvor todas as etapas da Trilha de Alfabetização!
                </p>
              </div>

              <div className="w-full py-3.5 border-y border-amber-300/40 flex flex-col items-center gap-1.5">
                <span className="text-xs text-slate-500 dark:text-slate-400">Este diploma oficial pertence a:</span>
                <input
                  type="text"
                  value={studentName}
                  onChange={e => setStudentName(e.target.value)}
                  className={`w-full max-w-xs text-center font-black text-xl sm:text-2xl border-b-2 border-amber-400 bg-transparent focus:outline-hidden pb-1 ${
                    darkMode ? 'text-amber-300 print:text-amber-900' : 'text-amber-900'
                  }`}
                  placeholder="Nome da Criança"
                />
                <span className="text-2xs text-slate-400 print:hidden">(Clique no nome para editar)</span>
              </div>

              <div className="grid grid-cols-3 gap-2.5 w-full max-w-sm text-center">
                <div className={`p-2 rounded-xl border ${darkMode ? 'bg-[#111827] border-slate-700 print:bg-white print:border-amber-300' : 'bg-white border-amber-200'}`}>
                  <span className="block text-2xs text-slate-400 font-bold">VOGAIS & SONS</span>
                  <span className="text-xs font-black text-emerald-500">Concluído</span>
                </div>
                <div className={`p-2 rounded-xl border ${darkMode ? 'bg-[#111827] border-slate-700 print:bg-white print:border-amber-300' : 'bg-white border-amber-200'}`}>
                  <span className="block text-2xs text-slate-400 font-bold">SÍLABAS</span>
                  <span className="text-xs font-black text-emerald-500">Concluído</span>
                </div>
                <div className={`p-2 rounded-xl border ${darkMode ? 'bg-[#111827] border-slate-700 print:bg-white print:border-amber-300' : 'bg-white border-amber-200'}`}>
                  <span className="block text-2xs text-slate-400 font-bold">LEITURA</span>
                  <span className="text-xs font-black text-emerald-500">Autônoma</span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-500" />
                ))}
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 italic max-w-md print:text-slate-800">
                &quot;Parabéns por cada pedacinho lido, cada som descoberto e cada história compartilhada. O mundo da leitura está aberto para você!&quot;
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 mt-2 w-full print:hidden">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir Diploma</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsGraduationModalOpen(false)}
                  className="px-5 py-2 rounded-xl bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
