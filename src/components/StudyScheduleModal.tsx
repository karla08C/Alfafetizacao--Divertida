import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Calendar,
  Clock,
  Target,
  Sparkles,
  Lightbulb,
  CheckCircle2,
  ArrowRight,
  Play,
  Award,
  BookOpen,
} from 'lucide-react';
import { DayRoutinePlan, GameMode, DailyStudyStats } from '../types';
import { WEEKLY_STUDY_ROUTINE, getTodayRoutinePlan } from '../data/routineData';
import { soundEngine } from '../utils/audio';
import { formatStudyTime } from '../utils/textFormat';

interface StudyScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMode: (mode: GameMode) => void;
  dailyStats: DailyStudyStats;
  totalStars: number;
  darkMode?: boolean;
}

export const StudyScheduleModal: React.FC<StudyScheduleModalProps> = ({
  isOpen,
  onClose,
  onSelectMode,
  dailyStats,
  totalStars,
  darkMode = false,
}) => {
  const todayPlan = getTodayRoutinePlan();
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<number>(todayPlan.dayOfWeek);

  if (!isOpen) return null;

  const currentPlan =
    WEEKLY_STUDY_ROUTINE.find(r => r.dayOfWeek === selectedDayOfWeek) || todayPlan;

  const isToday = currentPlan.dayOfWeek === todayPlan.dayOfWeek;
  const targetStudySeconds = currentPlan.recommendedMinutes * 60;
  const currentStudySeconds = dailyStats.totalStudySeconds || 0;
  const studyProgressPercent = Math.min(
    100,
    Math.round((currentStudySeconds / targetStudySeconds) * 100)
  );

  const handleStartActivity = () => {
    soundEngine.playPop();
    onClose();
    onSelectMode(currentPlan.recommendedMode);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className={`rounded-3xl border-2 shadow-2xl max-w-2xl w-full p-5 sm:p-7 relative max-h-[92vh] flex flex-col transition-colors overflow-hidden ${
          darkMode
            ? 'bg-[#111827] border-indigo-500/60 text-slate-100 shadow-indigo-950/50'
            : 'bg-white border-amber-300 text-slate-800'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between pb-3.5 border-b ${
            darkMode ? 'border-slate-800' : 'border-slate-100'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2.5 rounded-2xl ${
                darkMode
                  ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              <Calendar className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-lg font-black ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                  Cronograma de Rotina de Estudos
                </h3>
                <span className="px-2 py-0.5 rounded-full text-2xs font-extrabold bg-amber-500/20 text-amber-600 dark:text-amber-400">
                  15 min/dia
                </span>
              </div>
              <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Passo a passo pedagógico diário recomendado para a alfabetização
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              soundEngine.playPop();
              onClose();
            }}
            className={`p-2 rounded-xl cursor-pointer ${
              darkMode
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Days of the Week Navigation Tabs */}
        <div className="pt-3 pb-2">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {WEEKLY_STUDY_ROUTINE.map(item => {
              const isSelected = item.dayOfWeek === selectedDayOfWeek;
              const isActualToday = item.dayOfWeek === todayPlan.dayOfWeek;
              return (
                <button
                  key={item.dayOfWeek}
                  type="button"
                  onClick={() => {
                    soundEngine.playPop();
                    setSelectedDayOfWeek(item.dayOfWeek);
                  }}
                  className={`px-3 py-2 rounded-2xl text-xs font-bold transition-all flex flex-col items-center gap-0.5 min-w-[62px] cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500 text-white shadow-xs font-black'
                      : darkMode
                      ? 'bg-[#182234] text-slate-300 hover:bg-slate-800 border border-slate-700'
                      : 'bg-slate-100 text-slate-700 hover:bg-amber-50 border border-slate-200'
                  }`}
                >
                  <span className="text-[11px] uppercase tracking-wider">{item.shortName}</span>
                  {isActualToday && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-extrabold ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      Hoje
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Content */}
        <div className="overflow-y-auto pr-1 py-2 flex flex-col gap-3.5 flex-1">
          {/* Main Day Card */}
          <div
            className={`p-4 sm:p-5 rounded-2xl border transition-colors ${
              darkMode ? 'bg-[#182234] border-slate-700' : 'bg-amber-50/50 border-amber-200'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-200/50 dark:border-slate-700">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xs font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                    {currentPlan.dayName}
                  </span>
                  {isToday && (
                    <span className="px-2 py-0.5 rounded-full text-2xs font-bold bg-emerald-500 text-white">
                      Meta do Dia
                    </span>
                  )}
                </div>
                <h4 className={`text-base sm:text-lg font-black mt-0.5 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  {currentPlan.title}
                </h4>
              </div>

              <div
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 self-start sm:self-center ${
                  darkMode ? 'bg-[#111827] border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Meta: {currentPlan.recommendedMinutes} min</span>
              </div>
            </div>

            <p className={`text-xs sm:text-sm mt-3 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              {currentPlan.description}
            </p>

            {/* Today Study Progress Tracker */}
            {isToday && (
              <div className="mt-4 p-3 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>
                    Tempo praticado hoje: {formatStudyTime(currentStudySeconds)}
                  </span>
                  <span className="text-amber-500">{studyProgressPercent}% da meta diária</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${studyProgressPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Suggested Checklist Activities */}
          <div
            className={`p-4 rounded-2xl border ${
              darkMode ? 'bg-[#182234] border-slate-700' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-2.5 ${
              darkMode ? 'text-slate-300' : 'text-slate-700'
            }`}>
              <Target className="w-4 h-4 text-amber-500" />
              <span>Objetivos Pedagógicos do Dia:</span>
            </div>

            <div className="flex flex-col gap-2">
              {currentPlan.suggestedActivities.map((act, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 px-3 rounded-xl border flex items-center gap-2.5 text-xs ${
                    darkMode ? 'bg-[#111827] border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{act}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pedagogical Guidance for Parents/Educators */}
          <div
            className={`p-3.5 rounded-2xl border text-xs flex gap-2.5 ${
              darkMode
                ? 'bg-indigo-950/50 border-indigo-900/60 text-indigo-200'
                : 'bg-amber-50 border-amber-200 text-amber-950'
            }`}
          >
            <Lightbulb className={`w-4 h-4 shrink-0 mt-0.5 text-amber-500`} />
            <div>
              <strong className="block font-bold mb-0.5">Dica para a Família e Professores:</strong>
              {currentPlan.pedagogicalTip}
            </div>
          </div>
        </div>

        {/* Footer with Call to Action */}
        <div
          className={`pt-3.5 border-t flex flex-col sm:flex-row items-center justify-between gap-2.5 ${
            darkMode ? 'border-slate-800' : 'border-slate-100'
          }`}
        >
          <div className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
            Rotina baseada em 15 minutos diários de estímulo lúdico
          </div>

          <div className="w-full sm:w-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                soundEngine.playPop();
                onClose();
              }}
              className={`w-1/2 sm:w-auto px-4 py-2 rounded-xl border text-xs font-bold cursor-pointer ${
                darkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Fechar
            </button>

            <button
              type="button"
              onClick={handleStartActivity}
              className="w-1/2 sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Praticar Agora</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
