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
} from 'lucide-react';
import { TrailMission, LetterCase, TrailProgress } from '../types';
import { TRAIL_MISSIONS } from '../data/trailData';
import { soundEngine } from '../utils/audio';

interface LiteracyTrailProps {
  trailProgress: TrailProgress;
  onSelectMission: (mission: TrailMission) => void;
  onToggleUnlockAll: () => void;
  onResetTrail: () => void;
  letterCase: LetterCase;
  speechRate: number;
  voiceEnabled: boolean;
  darkMode: boolean;
  totalStars: number;
}

export const LiteracyTrail: React.FC<LiteracyTrailProps> = ({
  trailProgress,
  onSelectMission,
  onToggleUnlockAll,
  onResetTrail,
  letterCase,
  speechRate,
  voiceEnabled,
  darkMode,
  totalStars,
}) => {
  const [selectedMissionForModal, setSelectedMissionForModal] = useState<TrailMission | null>(null);
  const [isGraduationModalOpen, setIsGraduationModalOpen] = useState(false);
  const [studentName, setStudentName] = useState('Pequeno Campeão');

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
      {/* Top Banner: Trail Dashboard & Overview */}
      <div
        className={`w-full p-5 sm:p-6 rounded-3xl border transition-all ${
          darkMode
            ? 'bg-gradient-to-br from-[#121A30] to-[#1B2544] border-indigo-900/80 shadow-xl'
            : 'bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-emerald-500/10 border-amber-200/90 shadow-md'
        }`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-md ${
                darkMode ? 'bg-indigo-900/60 border border-indigo-700' : 'bg-amber-400 border-2 border-amber-500'
              }`}
            >
              🗺️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1
                  className={`text-xl sm:text-2xl font-black ${
                    darkMode ? 'text-white' : 'text-slate-800'
                  }`}
                >
                  {formatText('Trilha da Leitura')}
                </h1>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    darkMode ? 'bg-indigo-900 text-indigo-300' : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  Passo a Passo
                </span>
              </div>
              <p className={`text-xs sm:text-sm mt-0.5 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                {formatText('Aprenda a ler desde os sons das vogais até as primeiras historinhas completas!')}
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
                  ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                  : darkMode
                  ? 'bg-indigo-950/70 hover:bg-indigo-900 text-indigo-200 border-indigo-800'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
              title="Permite que pais e professores liberem todas as fases para praticar fora da ordem sequencial"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>{trailProgress.unlockedAllForTesting ? 'Modo Livre Ativo' : 'Modo Professor (Liberar Tudo)'}</span>
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
                  ? 'bg-indigo-950/70 text-indigo-300 border-indigo-800 hover:bg-indigo-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
              title="Ouvir orientações da trilha"
            >
              <Volume2 className="w-4 h-4 text-amber-500" />
            </button>
          </div>
        </div>

        {/* Trail Progress Bar & Current Next Step Callout */}
        <div className="mt-5 pt-4 border-t border-amber-200/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-2/3 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className={darkMode ? 'text-indigo-300' : 'text-amber-950'}>
                Progresso: {completedCount} de {totalMissions} missões concluídas
              </span>
              <span className={darkMode ? 'text-indigo-400' : 'text-amber-700'}>{progressPercent}%</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-200/70 dark:bg-slate-800 overflow-hidden p-0.5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-emerald-400"
              />
            </div>
          </div>

          {/* Big Quick-Launch "Próxima Missão" button */}
          <button
            type="button"
            onClick={() => handleNodeClick(currentMission)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer select-none"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Continuar: {currentMission.title}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* The Winding Learning Trail (Caminho da Alfabetização) */}
      <div className="w-full flex flex-col gap-10 relative">
        {Object.values(worldGroups).map((world, worldIndex) => (
          <div
            key={world.worldId}
            className={`w-full p-5 sm:p-7 rounded-3xl border relative transition-all ${
              darkMode
                ? 'bg-[#0E1528] border-indigo-900/60'
                : 'bg-white border-amber-100 shadow-xs'
            }`}
          >
            {/* World Header */}
            <div className="flex items-center justify-between gap-3 mb-6 pb-3 border-b border-slate-100 dark:border-indigo-950">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl sm:text-3xl">{world.worldEmoji}</span>
                <div>
                  <span className="text-2xs font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                    MUNDO {worldIndex + 1}
                  </span>
                  <h2 className={`text-base sm:text-lg font-black ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                    {formatText(world.worldTitle)}
                  </h2>
                </div>
              </div>

              <div className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 dark:bg-indigo-950 text-slate-600 dark:text-indigo-300">
                {world.missions.filter(m => trailProgress.completedMissionIds.includes(m.id)).length}/
                {world.missions.length} Concluídas
              </div>
            </div>

            {/* Mission Nodes Grid along this world */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {world.missions.map(mission => {
                const isCompleted = trailProgress.completedMissionIds.includes(mission.id);
                const isCurrent = mission.id === currentMission.id;
                const isUnlocked = trailProgress.unlockedAllForTesting || isCompleted || isCurrent;

                return (
                  <motion.div
                    key={mission.id}
                    whileHover={isUnlocked ? { scale: 1.02 } : {}}
                    whileTap={isUnlocked ? { scale: 0.98 } : {}}
                    onClick={() => handleNodeClick(mission)}
                    className={`relative p-4 sm:p-5 rounded-2xl border-2 flex flex-col justify-between gap-3 transition-all cursor-pointer ${
                      isCompleted
                        ? darkMode
                          ? 'bg-emerald-950/20 border-emerald-700/60 text-emerald-200'
                          : 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                        : isCurrent
                        ? darkMode
                          ? 'bg-amber-950/30 border-amber-400 shadow-lg shadow-amber-500/10 text-white ring-2 ring-amber-400/40'
                          : 'bg-amber-50 border-amber-500 shadow-md shadow-amber-200 text-slate-900 ring-4 ring-amber-400/20'
                        : !isUnlocked
                        ? darkMode
                          ? 'bg-slate-900/40 border-slate-800 text-slate-500 opacity-60'
                          : 'bg-slate-100/60 border-slate-200 text-slate-400 opacity-65'
                        : darkMode
                        ? 'bg-indigo-950/30 border-indigo-800 text-slate-200 hover:border-indigo-600'
                        : 'bg-white border-slate-200 text-slate-800 hover:border-amber-300'
                    }`}
                  >
                    {/* Node Header: Number, Icon, Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl font-black shadow-sm ${
                            isCompleted
                              ? 'bg-emerald-500 text-white'
                              : isCurrent
                              ? 'bg-amber-500 text-white animate-pulse'
                              : !isUnlocked
                              ? 'bg-slate-300 dark:bg-slate-800 text-slate-500'
                              : 'bg-indigo-500 text-white'
                          }`}
                        >
                          {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : mission.icon}
                        </div>
                        <div>
                          <span className="text-2xs font-bold text-slate-400">Etapa {mission.order}</span>
                          <h3 className="font-bold text-sm leading-tight">{formatText(mission.title)}</h3>
                        </div>
                      </div>

                      {/* Lock / Completed / Current Pin */}
                      <div>
                        {isCompleted ? (
                          <div className="flex items-center text-amber-500 text-xs font-bold">
                            {'⭐'.repeat(mission.starsReward)}
                          </div>
                        ) : isCurrent ? (
                          <span className="px-2 py-0.5 rounded-full text-2xs font-extrabold bg-amber-500 text-white animate-bounce">
                            Sua Vez!
                          </span>
                        ) : !isUnlocked ? (
                          <Lock className="w-4 h-4 text-slate-400" />
                        ) : (
                          <span className="text-xs text-amber-500 font-bold">+{mission.starsReward}★</span>
                        )}
                      </div>
                    </div>

                    {/* Subtitle / Focus */}
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {formatText(mission.subtitle)}
                    </p>

                    {/* Pedagogical Tag & Play button */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-2xs">
                      <span className="px-2 py-0.5 rounded-md font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {mission.missionType === 'vowels' && 'Vogais'}
                        {mission.missionType === 'syllables_simple' && 'Sílabas'}
                        {mission.missionType === 'rhymes' && 'Rimas'}
                        {mission.missionType === 'words_build' && 'Palavras'}
                        {mission.missionType === 'duel' && 'Duelo Rápido'}
                        {mission.missionType === 'story_reading' && 'Leitura'}
                        {mission.missionType === 'graduation' && 'Formatura'}
                      </span>

                      <span
                        className={`font-bold flex items-center gap-1 ${
                          isCompleted
                            ? 'text-emerald-600 dark:text-emerald-400 group-hover:underline'
                            : isCurrent
                            ? 'text-amber-600 dark:text-amber-400 underline font-black'
                            : !isUnlocked
                            ? 'text-slate-400'
                            : 'text-indigo-600 dark:text-indigo-400 group-hover:underline'
                        }`}
                      >
                        <span>{isCompleted ? 'Jogar de novo' : isCurrent ? 'Começar!' : 'Abrir'}</span>
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={`w-full max-w-md p-6 sm:p-7 rounded-3xl border shadow-2xl relative ${
              darkMode ? 'bg-[#121A30] border-indigo-800 text-white' : 'bg-white border-amber-200 text-slate-800'
            }`}
          >
            <div className="text-center flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-orange-400 flex items-center justify-center text-3xl shadow-lg shadow-amber-400/30">
                {selectedMissionForModal.icon}
              </div>

              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                <span>{selectedMissionForModal.worldTitle}</span>
                <span>•</span>
                <span>Etapa {selectedMissionForModal.order}</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black">{formatText(selectedMissionForModal.title)}</h2>

              <p className="text-sm text-slate-600 dark:text-slate-300">{formatText(selectedMissionForModal.description)}</p>

              {/* Pedagogical Goal callout */}
              <div
                className={`w-full p-3 rounded-2xl text-xs flex items-start gap-2.5 text-left ${
                  darkMode ? 'bg-indigo-950/70 border border-indigo-900 text-indigo-200' : 'bg-amber-50 border border-amber-200 text-amber-900'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Objetivo Pedagógico:</span>
                  <span>{selectedMissionForModal.pedagogicalGoal}</span>
                </div>
              </div>

              {/* Recompensa */}
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-500">
                <span>Recompensa ao concluir:</span>
                <span>{'⭐'.repeat(selectedMissionForModal.starsReward)}</span>
              </div>

              {/* Action Buttons */}
              <div className="w-full flex flex-col sm:flex-row items-center gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setSelectedMissionForModal(null)}
                  className="w-full sm:w-1/3 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Voltar
                </button>

                <button
                  type="button"
                  onClick={() => handleStartMission(selectedMissionForModal)}
                  className="w-full sm:w-2/3 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 cursor-pointer active:scale-95 transition-all"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>JOGAR ESSA MISSÃO!</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* GRADUATION DIPLOMA MODAL */}
      {isGraduationModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-xl p-6 sm:p-8 rounded-3xl bg-white border-4 border-amber-400 text-slate-800 shadow-2xl relative my-8"
          >
            {/* Certificate Frame */}
            <div className="border-2 border-dashed border-amber-300 p-6 rounded-2xl text-center flex flex-col items-center gap-4 bg-amber-50/40">
              <div className="w-20 h-20 rounded-full bg-amber-400 flex items-center justify-center text-4xl shadow-md">
                🎓
              </div>

              <div>
                <span className="text-xs font-black uppercase tracking-widest text-amber-700">
                  PLATAFORMA DE ALFABETIZAÇÃO DIVERTIDA
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                  CERTIFICADO DO PEQUENO LEITOR
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Concluiu com louvor todas as etapas da Trilha de Alfabetização!
                </p>
              </div>

              <div className="w-full py-4 border-y border-amber-200 flex flex-col items-center gap-1.5">
                <span className="text-xs text-slate-500">Este diploma oficial pertence a:</span>
                <input
                  type="text"
                  value={studentName}
                  onChange={e => setStudentName(e.target.value)}
                  className="w-full max-w-xs text-center font-black text-xl sm:text-2xl text-amber-900 border-b-2 border-amber-400 bg-transparent focus:outline-none pb-1"
                  placeholder="Nome da Criança"
                />
                <span className="text-2xs text-slate-400">(Clique no nome para editar)</span>
              </div>

              <div className="grid grid-cols-3 gap-3 w-full max-w-sm text-center">
                <div className="p-2 rounded-xl bg-white border border-amber-200">
                  <span className="block text-2xs text-slate-400 font-bold">VOGAIS & SONS</span>
                  <span className="text-sm font-black text-emerald-600">Dominado ✓</span>
                </div>
                <div className="p-2 rounded-xl bg-white border border-amber-200">
                  <span className="block text-2xs text-slate-400 font-bold">SÍLABAS</span>
                  <span className="text-sm font-black text-emerald-600">Dominado ✓</span>
                </div>
                <div className="p-2 rounded-xl bg-white border border-amber-200">
                  <span className="block text-2xs text-slate-400 font-bold">LEITURA</span>
                  <span className="text-sm font-black text-emerald-600">Autônoma ✓</span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-amber-500 text-lg">
                ⭐⭐⭐⭐⭐
              </div>

              <p className="text-xs text-slate-600 italic max-w-md">
                "Parabéns por cada pedacinho lido, cada som descoberto e cada história compartilhada. O mundo da leitura está aberto para você!"
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 mt-2 w-full">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir Diploma</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsGraduationModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs cursor-pointer"
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
