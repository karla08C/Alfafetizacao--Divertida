import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Volume2,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  ArrowRight,
  RotateCcw,
  Flame,
  Pause,
  Play,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DuelQuestion, LetterCase } from '../types';
import { soundEngine } from '../utils/audio';
import { formatCase } from '../utils/textFormat';

interface PhoneticDuelGameProps {
  questions: DuelQuestion[];
  letterCase: LetterCase;
  speechRate: number;
  voiceEnabled: boolean;
  onSuccessDuelRound: (bonusStars: number, initialSound?: string) => void;
  onUpdateMascot: (
    mood: 'happy' | 'thinking' | 'celebrating' | 'encouraging',
    message: string,
    hint?: string
  ) => void;
}

const ROUND_TIME_SECONDS = 15;

export const PhoneticDuelGame: React.FC<PhoneticDuelGameProps> = ({
  questions,
  letterCase,
  speechRate,
  voiceEnabled,
  onSuccessDuelRound,
  onUpdateMascot,
}) => {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME_SECONDS);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<'A' | 'B' | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isTimeOut, setIsTimeOut] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  const currentQ = questions[questionIndex];
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Setup round
  useEffect(() => {
    if (!currentQ) return;

    setSelectedChoice(null);
    setIsAnswered(false);
    setIsTimeOut(false);
    setTimeLeft(ROUND_TIME_SECONDS);
    setIsTimerPaused(false);

    onUpdateMascot(
      'thinking',
      `Duelo Fonético! Qual palavra começa com o som "${formatCase(currentQ.initialSound, letterCase)}"? Seja rápido!`,
      `Ouça o som: "${currentQ.initialSound}".`
    );

    if (voiceEnabled) {
      soundEngine.speakText(`Qual palavra começa com ${currentQ.initialSound}?`, speechRate);
    }
  }, [questionIndex, currentQ]);

  // Timer tick
  useEffect(() => {
    if (isAnswered || isTimeOut || isTimerPaused) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Time expired!
          clearInterval(timerRef.current!);
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAnswered, isTimeOut, isTimerPaused]);

  // Handle timeout gracefully
  const handleTimeExpired = () => {
    setIsTimeOut(true);
    setIsAnswered(true);
    setStreak(0);
    soundEngine.playGentleTryAgain();

    const correctWord = currentQ.optionA.isCorrect
      ? currentQ.optionA.word
      : currentQ.optionB.word;

    onUpdateMascot(
      'encouraging',
      `O tempo acabou! Mas não se preocupe: a palavra era "${formatCase(correctWord, letterCase)}". Vamos para a próxima!`,
      currentQ.explanation
    );

    if (voiceEnabled) {
      soundEngine.speakText(`Tempo! A resposta é ${correctWord}!`, speechRate);
    }
  };

  // Select Option A or B
  const handleSelect = (choice: 'A' | 'B') => {
    if (isAnswered || isTimeOut) return;

    soundEngine.playPop();
    setSelectedChoice(choice);
    setIsAnswered(true);

    const chosenOption = choice === 'A' ? currentQ.optionA : currentQ.optionB;

    if (chosenOption.isCorrect) {
      // Calculate speed bonus stars
      const bonus = timeLeft > 7 ? 3 : 2;
      const newScore = score + 10 + timeLeft * 2;
      const newStreak = streak + 1;

      setScore(newScore);
      setStreak(newStreak);
      soundEngine.playSuccessChime();
      soundEngine.playStarDing();

      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.65 },
          colors: ['#F59E0B', '#EF4444', '#10B981', '#3B82F6'],
        });
      } catch {
        // fallback
      }

      onSuccessDuelRound(bonus, currentQ.initialSound);

      onUpdateMascot(
        'celebrating',
        `Ponto para você no Duelo! ${currentQ.explanation} Respondeu em ${ROUND_TIME_SECONDS - timeLeft} segundos!`
      );

      if (voiceEnabled) {
        soundEngine.speakText(`Muito rápido! ${chosenOption.word}!`, speechRate);
      }
    } else {
      setStreak(0);
      soundEngine.playGentleTryAgain();

      const correctWord = currentQ.optionA.isCorrect
        ? currentQ.optionA.word
        : currentQ.optionB.word;

      onUpdateMascot(
        'encouraging',
        `Quase! "${formatCase(chosenOption.word, letterCase)}" não começa com "${formatCase(currentQ.initialSound, letterCase)}". A certa era "${formatCase(correctWord, letterCase)}".`
      );

      if (voiceEnabled) {
        soundEngine.speakText(chosenOption.word, speechRate);
      }
    }
  };

  const handleNextQuestion = () => {
    soundEngine.playPop();
    if (questionIndex < questions.length - 1) {
      setQuestionIndex(prev => prev + 1);
    } else {
      setQuestionIndex(0);
    }
  };

  const handleHearOption = (word: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.playPop();
    soundEngine.speakText(word, speechRate);
  };

  const handleHearTarget = () => {
    soundEngine.playPop();
    soundEngine.speakText(currentQ.initialSound, speechRate);
  };

  const togglePause = () => {
    soundEngine.playPop();
    setIsTimerPaused(prev => !prev);
  };

  // Timer percentage
  const timerPercent = (timeLeft / ROUND_TIME_SECONDS) * 100;
  const isUrgent = timeLeft <= 4 && !isAnswered;

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
      {/* Top Duel Arena Stats Card */}
      <div className="w-full bg-white rounded-3xl border-2 border-slate-200 shadow-sm p-5 sm:p-7 relative overflow-hidden">
        {/* Arena top badges */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-black rounded-full text-xs flex items-center gap-1 shadow-xs">
              <Zap className="w-3.5 h-3.5 fill-current" /> Duelo Fonético
            </span>
            <span className="text-xs text-slate-500 font-bold">
              Rodada {questionIndex + 1} de {questions.length}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Streak flame */}
            {streak > 1 && (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-orange-100 text-orange-700 text-xs font-black border border-orange-300"
              >
                <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
                <span>{streak}x Combo</span>
              </motion.div>
            )}

            {/* Duel Score */}
            <div className="px-3 py-1 rounded-xl bg-slate-100 text-slate-800 text-xs font-extrabold border border-slate-200">
              Pontos: {score}
            </div>

            {/* Pause timer button for accessibility */}
            <button
              type="button"
              onClick={togglePause}
              className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 border transition-colors cursor-pointer ${
                isTimerPaused
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
              }`}
              title={isTimerPaused ? 'Retomar tempo' : 'Pausar tempo'}
            >
              {isTimerPaused ? (
                <>
                  <Play className="w-3.5 h-3.5 text-emerald-600 fill-current" />
                  <span className="hidden sm:inline">Retomar</span>
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Pausar</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Countdown Timer Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span className="flex items-center gap-1 text-slate-600">
              <Clock className={`w-4 h-4 ${isUrgent ? 'text-rose-500 animate-pulse' : 'text-slate-500'}`} />
              Tempo Restante:
            </span>
            <span
              className={`font-mono text-sm font-black px-2 py-0.5 rounded-lg ${
                isUrgent ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {timeLeft}s
            </span>
          </div>

          <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-0.5">
            <motion.div
              className={`h-full rounded-full transition-all duration-300 ${
                timeLeft > 7
                  ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                  : timeLeft > 4
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                  : 'bg-gradient-to-r from-rose-500 to-rose-600 animate-pulse'
              }`}
              style={{ width: `${timerPercent}%` }}
            />
          </div>
        </div>

        {/* Central Duel Target Sound */}
        <div className="flex flex-col items-center justify-center my-2 text-center">
          <div className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Qual dessas 2 palavras completa o som inicial:
          </div>

          <div className="inline-flex items-center gap-3 bg-amber-50 border-3 border-amber-400 px-6 sm:px-8 py-3.5 rounded-3xl shadow-sm mb-2">
            <span className="text-4xl sm:text-6xl font-black text-amber-900 tracking-wider">
              {formatCase(currentQ.initialSound, letterCase)}
            </span>
            <button
              type="button"
              onClick={handleHearTarget}
              className="p-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white shadow-xs cursor-pointer active:scale-95 transition-transform"
              title="Ouvir som inicial"
            >
              <Volume2 className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* 2-Option Faceoff Duel Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-6">
          {/* OPTION A */}
          {(() => {
            const opt = currentQ.optionA;
            const isChosen = selectedChoice === 'A';
            const showSuccess = isAnswered && opt.isCorrect;
            const showFail = isChosen && !opt.isCorrect;

            let cardStyle =
              'bg-slate-50 border-slate-200 hover:border-amber-400 hover:bg-amber-50/40';
            if (showSuccess) {
              cardStyle = 'bg-emerald-50 border-emerald-500 ring-4 ring-emerald-300';
            } else if (showFail) {
              cardStyle = 'bg-rose-50 border-rose-300 opacity-75';
            }

            return (
              <motion.div
                whileHover={!isAnswered ? { scale: 1.02 } : {}}
                whileTap={!isAnswered ? { scale: 0.98 } : {}}
                role="button"
                tabIndex={isAnswered ? -1 : 0}
                onKeyDown={(e) => {
                  if (!isAnswered && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    handleSelect('A');
                  }
                }}
                onClick={() => !isAnswered && handleSelect('A')}
                className={`p-5 sm:p-6 rounded-3xl border-3 ${cardStyle} flex flex-col items-center justify-center gap-3 cursor-pointer transition-all shadow-sm select-none relative group outline-none focus-visible:ring-4 focus-visible:ring-amber-400`}
              >
                <div className="text-6xl sm:text-7xl group-hover:scale-110 transition-transform my-1">
                  {opt.emoji}
                </div>

                <div className="text-2xl sm:text-3xl font-black text-slate-800 tracking-wide">
                  {formatCase(opt.word, letterCase)}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={e => handleHearOption(opt.word, e)}
                    className="px-3 py-1.5 rounded-xl bg-white text-slate-700 border border-slate-200 shadow-xs flex items-center gap-1.5 text-xs font-bold hover:bg-slate-50 cursor-pointer active:scale-95 transition-transform"
                  >
                    <Volume2 className="w-4 h-4 text-amber-600" />
                    <span>Ouvir</span>
                  </button>
                </div>

                {showSuccess && (
                  <div className="absolute -top-3 -right-3 bg-emerald-500 text-white rounded-full p-1.5 shadow-md">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                )}
                {showFail && (
                  <div className="absolute -top-3 -right-3 bg-rose-500 text-white rounded-full p-1.5 shadow-md">
                    <XCircle className="w-6 h-6" />
                  </div>
                )}
              </motion.div>
            );
          })()}

          {/* OPTION B */}
          {(() => {
            const opt = currentQ.optionB;
            const isChosen = selectedChoice === 'B';
            const showSuccess = isAnswered && opt.isCorrect;
            const showFail = isChosen && !opt.isCorrect;

            let cardStyle =
              'bg-slate-50 border-slate-200 hover:border-amber-400 hover:bg-amber-50/40';
            if (showSuccess) {
              cardStyle = 'bg-emerald-50 border-emerald-500 ring-4 ring-emerald-300';
            } else if (showFail) {
              cardStyle = 'bg-rose-50 border-rose-300 opacity-75';
            }

            return (
              <motion.div
                whileHover={!isAnswered ? { scale: 1.02 } : {}}
                whileTap={!isAnswered ? { scale: 0.98 } : {}}
                role="button"
                tabIndex={isAnswered ? -1 : 0}
                onKeyDown={(e) => {
                  if (!isAnswered && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    handleSelect('B');
                  }
                }}
                onClick={() => !isAnswered && handleSelect('B')}
                className={`p-5 sm:p-6 rounded-3xl border-3 ${cardStyle} flex flex-col items-center justify-center gap-3 cursor-pointer transition-all shadow-sm select-none relative group outline-none focus-visible:ring-4 focus-visible:ring-amber-400`}
              >
                <div className="text-6xl sm:text-7xl group-hover:scale-110 transition-transform my-1">
                  {opt.emoji}
                </div>

                <div className="text-2xl sm:text-3xl font-black text-slate-800 tracking-wide">
                  {formatCase(opt.word, letterCase)}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={e => handleHearOption(opt.word, e)}
                    className="px-3 py-1.5 rounded-xl bg-white text-slate-700 border border-slate-200 shadow-xs flex items-center gap-1.5 text-xs font-bold hover:bg-slate-50 cursor-pointer active:scale-95 transition-transform"
                  >
                    <Volume2 className="w-4 h-4 text-amber-600" />
                    <span>Ouvir</span>
                  </button>
                </div>

                {showSuccess && (
                  <div className="absolute -top-3 -right-3 bg-emerald-500 text-white rounded-full p-1.5 shadow-md">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                )}
                {showFail && (
                  <div className="absolute -top-3 -right-3 bg-rose-500 text-white rounded-full p-1.5 shadow-md">
                    <XCircle className="w-6 h-6" />
                  </div>
                )}
              </motion.div>
            );
          })()}
        </div>

        {/* Post-answer feedback & Next round button */}
        <AnimatePresence>
          {isAnswered && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3"
            >
              <div className="text-sm font-bold text-slate-800 flex items-center gap-2">
                {isTimeOut ? (
                  <span className="text-amber-800 bg-amber-100 px-3.5 py-1.5 rounded-xl">
                    ⏳ O tempo acabou! {currentQ.explanation}
                  </span>
                ) : (
                  <span className="text-emerald-800 bg-emerald-100 px-3.5 py-1.5 rounded-xl">
                    ✨ {currentQ.explanation}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleNextQuestion}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-extrabold text-base flex items-center gap-2 shadow-lg shadow-amber-200 border-b-4 border-rose-700 active:border-b-0 active:translate-y-1 transition-all cursor-pointer"
              >
                <Sparkles className="w-5 h-5" />
                <span>Próximo Duelo</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
