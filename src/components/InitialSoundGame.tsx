import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Volume2, Sparkles, CheckCircle, ArrowRight, RefreshCw, Search } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SoundQuestion, LetterCase } from '../types';
import { soundEngine } from '../utils/audio';
import { formatCase } from '../utils/textFormat';

interface InitialSoundGameProps {
  questions: SoundQuestion[];
  letterCase: LetterCase;
  speechRate: number;
  voiceEnabled: boolean;
  onSuccessQuestion: (syllable?: string) => void;
  onUpdateMascot: (mood: 'happy' | 'thinking' | 'celebrating' | 'encouraging', message: string, hint?: string) => void;
  targetQuestionId?: string;
}

export const InitialSoundGame: React.FC<InitialSoundGameProps> = ({
  questions,
  letterCase,
  speechRate,
  voiceEnabled,
  onSuccessQuestion,
  onUpdateMascot,
  targetQuestionId,
}) => {
  const [questionIndex, setQuestionIndex] = useState(() => {
    if (targetQuestionId) {
      const idx = questions.findIndex(q => q.id === targetQuestionId);
      if (idx !== -1) return idx;
    }
    return 0;
  });

  useEffect(() => {
    if (targetQuestionId) {
      const idx = questions.findIndex(q => q.id === targetQuestionId);
      if (idx !== -1 && idx !== questionIndex) {
        setQuestionIndex(idx);
      }
    }
  }, [targetQuestionId, questions]);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const currentQ = questions[questionIndex];

  useEffect(() => {
    if (!currentQ) return;
    setSelectedOptionIndex(null);
    setIsAnswered(false);
    setIsCorrect(false);

    onUpdateMascot(
      'thinking',
      `Detetive dos Sons! ${currentQ.promptAudioText}`,
      `Procure a palavra que começa com o som "${currentQ.promptSyllableOrSound}".`
    );

    if (voiceEnabled) {
      soundEngine.speakText(currentQ.promptAudioText, speechRate);
    }
  }, [questionIndex, currentQ]);

  const handleHearPrompt = () => {
    soundEngine.playPop();
    soundEngine.speakText(currentQ.promptAudioText, speechRate);
  };

  const handleHearOption = (word: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.playPop();
    soundEngine.speakText(word, speechRate);
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;

    soundEngine.playPop();
    setSelectedOptionIndex(idx);
    const chosen = currentQ.options[idx];

    if (chosen.isCorrect) {
      setIsCorrect(true);
      setIsAnswered(true);
      soundEngine.playSuccessChime();
      soundEngine.playStarDing();

      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.65 },
          colors: ['#3B82F6', '#10B981', '#F59E0B'],
        });
      } catch {
        // Confetti fallback
      }

      onSuccessQuestion(currentQ.promptSyllableOrSound);
      onUpdateMascot(
        'celebrating',
        `Muito bem! ${currentQ.explanation} Você tem ouvidos atentos!`
      );

      if (voiceEnabled) {
        soundEngine.speakText(`${chosen.word}! ${currentQ.explanation}`, speechRate);
      }
    } else {
      soundEngine.playGentleTryAgain();
      onUpdateMascot(
        'encouraging',
        `Não é essa! "${chosen.word}" começa com outro som. Vamos tentar de novo?`,
        `Ouça o som: "${currentQ.promptSyllableOrSound}".`
      );
      if (voiceEnabled) {
        soundEngine.speakText(chosen.word, speechRate);
      }
    }
  };

  const handleNext = () => {
    soundEngine.playPop();
    if (questionIndex < questions.length - 1) {
      setQuestionIndex(prev => prev + 1);
    } else {
      setQuestionIndex(0);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
      {/* Question Card */}
      <div className="w-full bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-sm p-3.5 sm:p-8 text-center relative">
        <div className="flex items-center justify-between text-2xs sm:text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 sm:mb-4">
          <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 rounded-full flex items-center gap-1 border border-sky-200 dark:border-sky-800">
            <Search className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>Consciência Fonológica</span>
          </span>
          <span>Desafio {questionIndex + 1}/{questions.length}</span>
        </div>

        <div className="my-2 sm:my-3">
          <div className="text-xs sm:text-base text-slate-600 dark:text-slate-300 font-medium mb-1.5 sm:mb-2">
            Qual dessas palavras começa com o pedacinho:
          </div>

          {/* Syllable sound badge */}
          <div className="inline-flex items-center gap-2 sm:gap-3 bg-sky-50 dark:bg-sky-950/40 border-2 sm:border-3 border-sky-400 dark:border-sky-600 px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl shadow-inner mb-2 sm:mb-4">
            <span className="text-3xl sm:text-5xl font-black text-sky-700 dark:text-sky-300 tracking-wider">
              {formatCase(currentQ.promptSyllableOrSound, letterCase)}
            </span>
            <button
              type="button"
              onClick={handleHearPrompt}
              className="p-2 sm:p-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white shadow-xs cursor-pointer active:scale-95 transition-transform"
              title="Ouvir a pergunta"
            >
              <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Options grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-3 sm:mt-4">
          {currentQ.options.map((opt, idx) => {
            const isSelected = selectedOptionIndex === idx;
            const showSuccess = isAnswered && opt.isCorrect;
            const showFail = isSelected && !opt.isCorrect;

            let cardStyle = 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-500 hover:bg-sky-50/50 dark:hover:bg-slate-700/60';
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
                className={`p-2 sm:p-4 rounded-xl sm:rounded-2xl border-2 sm:border-3 ${cardStyle} flex flex-col items-center justify-center gap-1 sm:gap-2 cursor-pointer transition-all shadow-sm select-none relative group outline-none focus-visible:ring-4 focus-visible:ring-sky-400`}
              >
                <div className="text-3xl sm:text-6xl my-0.5 sm:my-1 group-hover:scale-110 transition-transform">
                  {opt.emoji}
                </div>

                <div className="text-xs sm:text-xl font-extrabold text-slate-800 dark:text-slate-100 truncate w-full text-center">
                  {formatCase(opt.word, letterCase)}
                </div>

                {/* Speaker button on each card for kids needing auditory aid */}
                <button
                  type="button"
                  onClick={(e) => handleHearOption(opt.word, e)}
                  className="p-1 sm:p-1.5 rounded-lg bg-white/80 dark:bg-slate-700/80 hover:bg-white dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200 shadow-xs border border-slate-200 dark:border-slate-600 mt-0.5 sm:mt-1 cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                  title={`Ouvir ${opt.word}`}
                >
                  <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>

                {showSuccess && (
                  <div className="absolute -top-2 -right-2 bg-emerald-500 text-white rounded-full p-1 shadow-md">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Feedback area */}
        {isAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <p className="text-sm font-bold text-emerald-800 bg-emerald-100 px-4 py-2 rounded-xl">
              ✨ {currentQ.explanation}
            </p>

            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-3 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-base flex items-center gap-2 shadow-md shadow-sky-200 border-b-4 border-sky-700 active:border-b-0 active:translate-y-1 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Próximo Som</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};
