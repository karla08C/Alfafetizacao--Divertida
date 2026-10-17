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
      <div className="w-full bg-white rounded-3xl border-2 border-slate-200 shadow-sm p-6 sm:p-8 text-center relative">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-4">
          <span className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full flex items-center gap-1">
            <Music2 className="w-3.5 h-3.5" /> Caça-Rimas Musical
          </span>
          <span>Desafio {index + 1} de {questions.length}</span>
        </div>

        {/* Target Word Display */}
        <div className="flex flex-col items-center my-3">
          <div className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Qual dessas palavras rima com:
          </div>

          <div className="flex items-center gap-3 bg-pink-50 border-3 border-pink-300 p-4 sm:px-6 sm:py-4 rounded-3xl shadow-sm">
            <span className="text-5xl sm:text-6xl">{current.targetEmoji}</span>
            <div className="text-left">
              <div className="text-2xl sm:text-3xl font-black text-pink-900 tracking-wide">
                {formatCase(current.targetWord, letterCase)}
              </div>
              <div className="text-xs font-bold text-pink-600">
                Termina com <span className="underline decoration-wavy">-{formatCase(current.rhymeEnding, letterCase)}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleHearTarget}
              className="p-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white shadow-xs cursor-pointer active:scale-95 transition-transform ml-2"
              title="Ouvir palavra alvo"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 mt-6">
          {current.options.map((opt, idx) => {
            const isSelected = selectedIndex === idx;
            const showSuccess = isAnswered && opt.isCorrect;
            const showFail = isSelected && !opt.isCorrect;

            let cardStyle = 'bg-slate-50 border-slate-200 hover:border-pink-300 hover:bg-pink-50/40';
            if (showSuccess) {
              cardStyle = 'bg-emerald-50 border-emerald-500 ring-3 ring-emerald-300';
            } else if (showFail) {
              cardStyle = 'bg-rose-50 border-rose-300 opacity-70';
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
                className={`p-4 rounded-2xl border-3 ${cardStyle} flex flex-col items-center justify-center gap-2 cursor-pointer transition-all shadow-sm select-none relative group outline-none focus-visible:ring-4 focus-visible:ring-pink-400`}
              >
                <div className="text-5xl sm:text-6xl my-1 group-hover:scale-110 transition-transform">
                  {opt.emoji}
                </div>

                <div className="text-lg sm:text-xl font-extrabold text-slate-800">
                  {formatCase(opt.word, letterCase)}
                </div>

                <button
                  type="button"
                  onClick={(e) => handleHearOption(opt.word, e)}
                  className="p-1.5 rounded-lg bg-white/80 hover:bg-white text-slate-600 shadow-xs border border-slate-200 mt-1 cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                  title={`Ouvir ${opt.word}`}
                >
                  <Volume2 className="w-4 h-4" />
                </button>

                {showSuccess && (
                  <div className="absolute -top-2 -right-2 bg-emerald-500 text-white rounded-full p-1 shadow-md">
                    <CheckCircle2 className="w-5 h-5" />
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
            className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <p className="text-sm font-bold text-pink-800 bg-pink-100 px-4 py-2 rounded-xl">
              🎵 Rimou perfeitamente!
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
