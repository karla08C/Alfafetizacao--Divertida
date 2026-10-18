import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Volume2, Sparkles, CheckCircle2, ArrowRight, Music2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { RhymeQuestion, LetterCase } from '../types';
import { soundEngine } from '../utils/audio';
import { formatCase } from '../utils/textFormat';

interface RhymeGameProps {
  questions: RhymeQuestion[];
  letterCase: LetterCase;
  speechRate: number;
  voiceEnabled: boolean;
  onSuccessQuestion: () => void;
  onUpdateMascot: (mood: 'happy' | 'thinking' | 'celebrating' | 'encouraging', message: string, hint?: string) => void;
  targetQuestionId?: string;
}

export const RhymeGame: React.FC<RhymeGameProps> = ({
  questions,
  letterCase,
  speechRate,
  voiceEnabled,
  onSuccessQuestion,
  onUpdateMascot,
  targetQuestionId,
}) => {
  const [index, setIndex] = useState(() => {
    if (targetQuestionId) {
      const idx = questions.findIndex(q => q.id === targetQuestionId);
      if (idx !== -1) return idx;
    }
    return 0;
  });

  useEffect(() => {
    if (targetQuestionId) {
      const idx = questions.findIndex(q => q.id === targetQuestionId);
      if (idx !== -1 && idx !== index) {
        setIndex(idx);
      }
    }
  }, [targetQuestionId, questions]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const current = questions[index];

  useEffect(() => {
    if (!current) return;
    setSelectedIndex(null);
    setIsAnswered(false);

    onUpdateMascot(
      'thinking',
      `O que rima com ${formatCase(current.targetWord, letterCase)}? As rimas terminam com o mesmo sonzinho!`,
      `Preste atenção no finalzinho "-${current.rhymeEnding}".`
    );

    if (voiceEnabled) {
      soundEngine.speakText(`O que rima com ${current.targetWord}?`, speechRate);
    }
  }, [index, current]);

  const handleHearTarget = () => {
    soundEngine.playPop();
    soundEngine.speakText(current.targetWord, speechRate);
  };

  const handleHearOption = (word: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.playPop();
    soundEngine.speakText(word, speechRate);
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    soundEngine.playPop();
    setSelectedIndex(idx);
    const chosen = current.options[idx];

    if (chosen.isCorrect) {
      setIsAnswered(true);
      soundEngine.playSuccessChime();
      soundEngine.playStarDing();

      try {
        confetti({
          particleCount: 40,
          spread: 55,
          origin: { y: 0.65 },
          colors: ['#EC4899', '#F59E0B', '#10B981'],
        });
      } catch {
        // Confetti fallback
      }

      onSuccessQuestion();
      onUpdateMascot(
        'celebrating',
        `Sensacional! ${formatCase(current.targetWord, letterCase)} rima com ${formatCase(chosen.word, letterCase)}! Os dois terminam em ${current.rhymeEnding}!`
      );

      if (voiceEnabled) {
        soundEngine.speakText(`${current.targetWord} rima com ${chosen.word}!`, speechRate);
      }
    } else {
      soundEngine.playGentleTryAgain();
      onUpdateMascot(
        'encouraging',
        `"${formatCase(chosen.word, letterCase)}" não rima com "${formatCase(current.targetWord, letterCase)}". Ouça o finalzinho e tente outra vez!`
      );
      if (voiceEnabled) {
        soundEngine.speakText(chosen.word, speechRate);
      }
    }
  };

  const handleNext = () => {
    soundEngine.playPop();
    if (index < questions.length - 1) {
      setIndex(prev => prev + 1);
    } else {
      setIndex(0);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
      <div className="w-full bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-sm p-3.5 sm:p-8 text-center relative">
        <div className="flex items-center justify-between text-2xs sm:text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 sm:mb-4">
          <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 bg-pink-100 dark:bg-pink-950/60 text-pink-800 dark:text-pink-300 rounded-full flex items-center gap-1 border border-pink-200 dark:border-pink-800">
            <Music2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Caça-Rimas Musical
          </span>
          <span>Desafio {index + 1}/{questions.length}</span>
        </div>

        {/* Target Word Display */}
        <div className="flex flex-col items-center my-2 sm:my-3">
          <div className="text-2xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 sm:mb-2">
            Qual dessas palavras rima com:
          </div>

          <div className="flex items-center gap-2 sm:gap-3 bg-pink-50 dark:bg-pink-950/40 border-2 sm:border-3 border-pink-300 dark:border-pink-800 p-2.5 sm:px-6 sm:py-4 rounded-2xl sm:rounded-3xl shadow-sm">
            <span className="text-4xl sm:text-6xl">{current.targetEmoji}</span>
            <div className="text-left">
              <div className="text-lg sm:text-3xl font-black text-pink-900 dark:text-pink-200 tracking-wide">
                {formatCase(current.targetWord, letterCase)}
              </div>
              <div className="text-2xs sm:text-xs font-bold text-pink-600 dark:text-pink-400">
                Termina com <span className="underline decoration-wavy">-{formatCase(current.rhymeEnding, letterCase)}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleHearTarget}
              className="p-1.5 sm:p-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white shadow-xs cursor-pointer active:scale-95 transition-transform ml-1 sm:ml-2"
              title="Ouvir palavra alvo"
            >
              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Options */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-3 sm:mt-6">
          {current.options.map((opt, idx) => {
            const isSelected = selectedIndex === idx;
            const showSuccess = isAnswered && opt.isCorrect;
            const showFail = isSelected && !opt.isCorrect;

            let cardStyle = 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-pink-300 dark:hover:border-pink-500 hover:bg-pink-50/40 dark:hover:bg-slate-700/60';
            if (showSuccess) {
              cardStyle = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 ring-2 sm:ring-3 ring-emerald-300 dark:ring-emerald-700';
            } else if (showFail) {
              cardStyle = 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 opacity-70';
            }

            return (
              <motion.div
                key={opt.word}
                whileHover={!isAnswered ? { scale: 1.03 } : {}}
                whileTap={!isAnswered ? { scale: 0.97 } : {}}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (!isAnswered && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    handleSelectOption(idx);
                  }
                }}
                onClick={() => handleSelectOption(idx)}
                className={`p-2 sm:p-4 rounded-xl sm:rounded-2xl border-2 sm:border-3 ${cardStyle} flex flex-col items-center justify-center gap-1 sm:gap-2 cursor-pointer transition-all shadow-sm select-none relative group outline-none focus-visible:ring-4 focus-visible:ring-pink-400`}
              >
                <div className="text-3xl sm:text-6xl my-0.5 sm:my-1 group-hover:scale-110 transition-transform">
                  {opt.emoji}
                </div>

                <div className="text-xs sm:text-xl font-extrabold text-slate-800 dark:text-slate-100 truncate w-full text-center">
                  {formatCase(opt.word, letterCase)}
                </div>

                <button
                  type="button"
                  onClick={(e) => handleHearOption(opt.word, e)}
                  className="p-1 sm:p-1.5 rounded-lg bg-white/80 dark:bg-slate-700/80 hover:bg-white dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200 shadow-xs border border-slate-200 dark:border-slate-600 mt-0.5 sm:mt-1 cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                  title={`Ouvir ${opt.word}`}
                >
                  <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>

                {showSuccess && (
                  <div className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-emerald-500 text-white rounded-full p-0.5 sm:p-1 shadow-md">
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Success feedback */}
        {isAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <p className="text-sm font-bold text-pink-800 dark:text-pink-300 bg-pink-100 dark:bg-pink-950/60 px-4 py-2 rounded-xl flex items-center gap-1.5 border border-pink-200 dark:border-pink-800">
              <Music2 className="w-4 h-4 text-pink-600 dark:text-pink-400" />
              <span>Rimou perfeitamente!</span>
            </p>

            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-3 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-base flex items-center gap-2 shadow-md shadow-pink-200 border-b-4 border-pink-700 active:border-b-0 active:translate-y-1 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Próxima Rima</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};
