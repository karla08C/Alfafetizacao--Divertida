import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Award,
  CheckCircle2,
  Lock,
  Clock,
  BookOpen,
  Volume2,
  GraduationCap,
  Sparkles,
  TrendingUp,
  HeartHandshake,
  Star,
  Puzzle,
  Search,
  Music2,
  Zap,
} from 'lucide-react';
import { Badge, DailyStudyStats, LetterCase } from '../types';
import { soundEngine } from '../utils/audio';
import { formatCase, formatStudyTime, getSyllableColor } from '../utils/textFormat';

interface BadgesModalProps {
  isOpen: boolean;
  onClose: () => void;
  badges: Badge[];
  totalStars: number;
  dailyStats: DailyStudyStats;
  letterCase: LetterCase;
  speechRate: number;
  darkMode?: boolean;
}

export const BadgesModal: React.FC<BadgesModalProps> = ({
  isOpen,
  onClose,
  badges,
  totalStars,
  dailyStats,
  letterCase,
  speechRate,
  darkMode = false,
}) => {
  const [activeTabMobile, setActiveTabMobile] = useState<'badges' | 'parents'>('badges');

  if (!isOpen) return null;

  // Calculate top practiced syllables
  const sortedSyllables = Object.entries(dailyStats.practicedSyllables || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  // Recommended daily study target: 15 minutes (900 seconds)
  const targetStudySeconds = 15 * 60;
  const studyProgressPercent = Math.min(
    100,
    Math.round((dailyStats.totalStudySeconds / targetStudySeconds) * 100)
  );

  const handleHearSyllable = (syl: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.playPop();
    soundEngine.speakText(syl, speechRate);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className={`rounded-3xl border-3 shadow-2xl max-w-4xl w-full p-5 sm:p-7 relative max-h-[92vh] flex flex-col transition-colors overflow-hidden ${
          darkMode
            ? 'bg-[#131B2E] border-indigo-500/70 text-slate-100'
            : 'bg-white border-amber-300 text-slate-800'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between pb-3.5 border-b ${
            darkMode ? 'border-indigo-900/60' : 'border-slate-100'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2.5 rounded-2xl ${
                darkMode ? 'bg-indigo-900/60 text-amber-300' : 'bg-amber-100 text-amber-800'
              }`}
            >
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className={`text-xl font-black ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                Conquistas & Relatório Pedagógico
              </h3>
              <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Acompanhe as medalhas da criança e o desenvolvimento do estudo hoje
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

        {/* Mobile Tab Switcher */}
        <div className="flex md:hidden items-center gap-2 mt-3 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-indigo-900">
          <button
            type="button"
            onClick={() => setActiveTabMobile('badges')}
            className={`flex-1 py-1.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
              activeTabMobile === 'badges'
                ? 'bg-white dark:bg-[#1A233A] text-amber-600 dark:text-amber-300 shadow-xs'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Medalhas ({badges.filter(b => b.unlocked).length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTabMobile('parents')}
            className={`flex-1 py-1.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
              activeTabMobile === 'parents'
                ? 'bg-white dark:bg-[#1A233A] text-indigo-600 dark:text-indigo-300 shadow-xs'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Resumo dos Pais</span>
          </button>
        </div>

        {/* Responsive Grid Body: Side-by-side on desktop */}
        <div className="flex-1 overflow-y-auto pr-1 py-3.5 grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* LEFT COLUMN: Badges & Stars */}
          <div
            className={`md:col-span-7 flex flex-col gap-3 ${
              activeTabMobile !== 'badges' ? 'hidden md:flex' : 'flex'
            }`}
          >
            {/* Stars summary banner */}
            <div
              className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                darkMode
                  ? 'bg-[#182234] border-slate-700 text-slate-100'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold">
                <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
                <span>Total de Estrelas Conquistadas:</span>
              </div>
              <span className="text-xl font-black text-amber-400">{totalStars}</span>
            </div>

            {/* Badges Grid */}
            <div className="grid grid-cols-2 gap-2.5 max-h-[50vh] md:max-h-[52vh] overflow-y-auto pr-1">
              {badges.map(b => {
                const renderBadgeIcon = () => {
                  switch (b.id) {
                    case 'first_word':
                      return <Sparkles className="w-6 h-6 text-amber-500" />;
                    case 'syllable_master':
                      return <Puzzle className="w-6 h-6 text-purple-500" />;
                    case 'sound_detective':
                      return <Search className="w-6 h-6 text-sky-500" />;
                    case 'rhyme_king':
                      return <Music2 className="w-6 h-6 text-pink-500" />;
                    case 'star_collector':
                      return <Star className="w-6 h-6 fill-amber-400 text-amber-500" />;
                    case 'story_reader':
                      return <BookOpen className="w-6 h-6 text-emerald-500" />;
                    case 'duel_champion':
                      return <Zap className="w-6 h-6 text-amber-500" />;
                    default:
                      return <Award className="w-6 h-6 text-amber-500" />;
                  }
                };

                return (
                  <div
                    key={b.id}
                    className={`p-3 rounded-2xl border-2 flex flex-col items-center text-center transition-all ${
                      b.unlocked
                        ? darkMode
                          ? 'bg-[#182234] border-indigo-500/70 shadow-xs'
                          : 'bg-amber-50/50 border-amber-300 shadow-xs'
                        : darkMode
                        ? 'bg-[#10172A] border-slate-800 opacity-60'
                        : 'bg-slate-50 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="relative my-1">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${
                        b.unlocked
                          ? darkMode ? 'bg-indigo-950/80 border-indigo-700' : 'bg-amber-100 border-amber-200'
                          : darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
                      }`}>
                        {renderBadgeIcon()}
                      </div>
                      {b.unlocked ? (
                        <CheckCircle2
                          className={`w-4 h-4 text-emerald-500 absolute -top-1 -right-2 rounded-full ${
                            darkMode ? 'bg-slate-900' : 'bg-white'
                          }`}
                        />
                      ) : (
                        <Lock
                          className={`w-4 h-4 text-slate-400 absolute -top-1 -right-2 rounded-full ${
                            darkMode ? 'bg-slate-900' : 'bg-white'
                          }`}
                        />
                      )}
                    </div>
                    <div
                      className={`text-xs sm:text-sm font-black mt-1 ${
                        darkMode ? 'text-slate-100' : 'text-slate-800'
                      }`}
                    >
                      {b.title}
                    </div>
                    <p
                      className={`text-[10px] sm:text-[11px] mt-0.5 leading-tight ${
                        darkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      {b.description}
                    </p>
                    <div
                      className={`mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        darkMode
                          ? 'bg-[#131B2E] border-slate-700 text-indigo-300'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      {b.unlocked ? 'Conquistada' : `${b.currentCount} / ${b.targetCount}`}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT COLUMN: Resumo Pedagógico do Dia (Para os Pais) */}
          <div
            className={`md:col-span-5 flex flex-col gap-3 ${
              activeTabMobile !== 'parents' ? 'hidden md:flex' : 'flex'
            }`}
          >
            <div
              className={`p-4 sm:p-5 rounded-2xl border-2 flex flex-col gap-4 shadow-sm ${
                darkMode
                  ? 'bg-[#172036] border-indigo-900/80 text-slate-100'
                  : 'bg-gradient-to-b from-sky-50/70 to-indigo-50/50 border-sky-200 text-slate-800'
              }`}
            >
              {/* Header do Card dos Pais */}
              <div className="flex items-center justify-between border-b pb-2.5 border-sky-100 dark:border-indigo-900/60">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-indigo-500 text-white shadow-xs">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black tracking-tight text-slate-900 dark:text-slate-100">
                      Resumo Pedagógico do Dia
                    </h4>
                    <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                      Painel para Pais e Educadores
                    </span>
                  </div>
                </div>
              </div>

              {/* 1. Tempo Total de Estudo Hoje */}
              <div className="p-3 rounded-xl bg-white dark:bg-[#12192C] border border-sky-100 dark:border-indigo-950 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-sky-500" />
                    Tempo Total de Estudo Hoje:
                  </span>
                  <span className="font-mono text-sm font-black text-indigo-600 dark:text-indigo-400">
                    {formatStudyTime(dailyStats.totalStudySeconds)}
                  </span>
                </div>

                {/* Meta diária recomendada (10 a 15 minutos) */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${studyProgressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                  <span>Recomendado: 10 a 15 min/dia</span>
                  <span>{studyProgressPercent}% da meta</span>
                </div>
              </div>

              {/* 2. Sílabas Mais Praticadas */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
                    Sílabas Mais Praticadas Hoje:
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">Toque p/ ouvir</span>
                </div>

                {sortedSyllables.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {sortedSyllables.map(([syl, count], idx) => {
                      const color = getSyllableColor(idx);
                      return (
                        <button
                          key={syl}
                          type="button"
                          onClick={e => handleHearSyllable(syl, e)}
                          className={`px-2.5 py-1.5 rounded-xl border-2 ${color.bg} ${color.border} ${color.text} flex items-center gap-1.5 text-xs font-black shadow-2xs hover:scale-105 active:scale-95 transition-transform cursor-pointer`}
                          title={`Praticada ${count} vezes. Clique para ouvir!`}
                        >
                          <Volume2 className="w-3 h-3 opacity-70" />
                          <span>{formatCase(syl, letterCase)}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-white/70 dark:bg-black/20 font-extrabold">
                            {count}x
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-white/60 dark:bg-[#12192C]/60 border border-dashed border-slate-300 dark:border-indigo-900/50 text-center text-xs text-slate-500 dark:text-slate-400">
                    A criança ainda não concluiu atividades hoje. Assim que ela jogar, as sílabas trabalhadas aparecerão aqui!
                  </div>
                )}
              </div>

              {/* 3. Atividades Realizadas */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#12192C] border border-sky-100 dark:border-indigo-950 text-xs">
                <span className="font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                  Atividades Concluídas Hoje:
                </span>
                <span className="font-black text-sm text-slate-800 dark:text-slate-100">
                  {dailyStats.totalActivitiesDone || 0}
                </span>
              </div>

              {/* 4. Dica Pedagógica para os Pais */}
              <div className="p-3 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-200/80 dark:border-indigo-800/50 text-[11px] leading-relaxed text-indigo-950 dark:text-indigo-200 flex gap-2">
                <HeartHandshake className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold mb-0.5">Dica para os Pais:</strong>
                  Brinque de reconhecer as sílabas mais praticadas acima em objetos da casa ou embalagens. Essa ponte entre a tela e o mundo real fortalece a rota fonológica!
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`pt-3.5 border-t mt-1 ${
            darkMode ? 'border-indigo-900/60' : 'border-slate-100'
          }`}
        >
          <button
            type="button"
            onClick={() => {
              soundEngine.playPop();
              onClose();
            }}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-base shadow-sm cursor-pointer"
          >
            Continuar Brincando
          </button>
        </div>
      </motion.div>
    </div>
  );
};
