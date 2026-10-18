import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, RotateCcw, ArrowRight, ArrowLeft, Sparkles, CheckCircle2, Lightbulb } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SyllableWord, LetterCase } from '../types';
import { soundEngine } from '../utils/audio';
import { formatCase, getSyllableColor } from '../utils/textFormat';

interface SyllablePuzzleGameProps {
  words: SyllableWord[];
  letterCase: LetterCase;
  speechRate: number;
  voiceEnabled: boolean;
  onSuccessWord: (word: SyllableWord) => void;
  onUpdateMascot: (mood: 'happy' | 'thinking' | 'celebrating' | 'encouraging', message: string, hint?: string) => void;
  targetWordId?: string;
}

export const SyllablePuzzleGame: React.FC<SyllablePuzzleGameProps> = ({
  words,
  letterCase,
  speechRate,
  voiceEnabled,
  onSuccessWord,
  onUpdateMascot,
  targetWordId,
}) => {
  const [wordIndex, setWordIndex] = useState(() => {
    if (targetWordId) {
      const found = words.findIndex(w => w.id === targetWordId);
      if (found !== -1) return found;
    }
    return 0;
  });

  useEffect(() => {
    if (targetWordId) {
      const found = words.findIndex(w => w.id === targetWordId);
      if (found !== -1 && found !== wordIndex) {
        setWordIndex(found);
      }
    }
  }, [targetWordId, words]);
  const [shuffledSyllables, setShuffledSyllables] = useState<{ id: string; text: string; originalIndex: number }[]>([]);
  const [selectedSyllables, setSelectedSyllables] = useState<{ id: string; text: string; originalIndex: number }[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [activeSpeakingSyllable, setActiveSpeakingSyllable] = useState<number | null>(null);

  const currentWord = words[wordIndex];

  // Initialize or change word
  useEffect(() => {
    if (!currentWord) return;
    setIsCompleted(false);
    setSelectedSyllables([]);
    setActiveSpeakingSyllable(null);

    // Shuffle syllables with random id
    const syllablesWithMeta = currentWord.syllables.map((syl, i) => ({
      id: `${syl}-${i}-${Math.random()}`,
      text: syl,
      originalIndex: i,
    }));

    // Shuffle ensuring it's not already in order if length > 1
    const shuffled = [...syllablesWithMeta].sort(() => Math.random() - 0.5);
    setShuffledSyllables(shuffled);

    onUpdateMascot(
      'happy',
      `Vamos montar a palavra ${formatCase(currentWord.word, letterCase)}! Clique nos pedacinhos na ordem certa.`,
      currentWord.hint
    );

    if (voiceEnabled) {
      soundEngine.speakText(currentWord.word, speechRate);
    }
  }, [wordIndex, currentWord]);

  // Handle clicking a syllable from available pool
  const handleSelectSyllable = (syllableObj: { id: string; text: string; originalIndex: number }) => {
    if (isCompleted) return;

    soundEngine.playPop();
    if (voiceEnabled) {
      soundEngine.speakText(syllableObj.text, speechRate);
    }

    const newSelected = [...selectedSyllables, syllableObj];
    const newShuffled = shuffledSyllables.filter(s => s.id !== syllableObj.id);

    setSelectedSyllables(newSelected);
    setShuffledSyllables(newShuffled);

    // Check if user filled all slots
    if (newSelected.length === currentWord.syllables.length) {
      const assembledWord = newSelected.map(s => s.text).join('');
      const targetWord = currentWord.syllables.join('');

      if (assembledWord === targetWord) {
        // Correct answer!
        setIsCompleted(true);
        soundEngine.playSuccessChime();
        soundEngine.playStarDing();

        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.65 },
            colors: ['#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6'],
          });
        } catch {
          // Confetti fallback
        }

        onSuccessWord(currentWord);
        onUpdateMascot(
          'celebrating',
          `Parabéns! Você formou ${formatCase(currentWord.word, letterCase)}! Você é incrível!`
        );

        // Read out syllable by syllable then full word
        if (voiceEnabled) {
          soundEngine.speakSyllablesSlowly(currentWord.syllables, currentWord.word, speechRate);
        }
      } else {
        // Wrong order
        setIsShaking(true);
        soundEngine.playGentleTryAgain();
        onUpdateMascot(
          'encouraging',
          'Quase lá! Ouça o som da palavra de novo e tente colocar os pedacinhos na ordem certa.',
          currentWord.hint
        );
        setTimeout(() => setIsShaking(false), 600);
      }
    }
  };

  // Handle removing a syllable from the assembled line
  const handleRemoveSyllable = (syllableObj: { id: string; text: string; originalIndex: number }) => {
    if (isCompleted) return;
    soundEngine.playPop();

    setSelectedSyllables(prev => prev.filter(s => s.id !== syllableObj.id));
    setShuffledSyllables(prev => [...prev, syllableObj]);
  };

  // Reset current attempt
  const handleReset = () => {
    soundEngine.playPop();
    setIsCompleted(false);
    setSelectedSyllables([]);
    const syllablesWithMeta = currentWord.syllables.map((syl, i) => ({
      id: `${syl}-${i}-${Math.random()}`,
      text: syl,
      originalIndex: i,
    }));
    setShuffledSyllables([...syllablesWithMeta].sort(() => Math.random() - 0.5));
    onUpdateMascot('happy', `Tudo limpo! Vamos tentar de novo formar ${formatCase(currentWord.word, letterCase)}!`);
  };

  // Pronounce word
  const handleHearFullWord = () => {
    soundEngine.playPop();
    soundEngine.speakText(currentWord.word, speechRate);
  };

  // Next word
  const handleNextWord = () => {
    soundEngine.playPop();
    if (wordIndex < words.length - 1) {
      setWordIndex(prev => prev + 1);
    } else {
      setWordIndex(0);
    }
  };

  const handlePrevWord = () => {
    soundEngine.playPop();
    if (wordIndex > 0) {
      setWordIndex(prev => prev - 1);
    } else {
      setWordIndex(words.length - 1);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
      {/* Word Header Card */}
      <div className="w-full bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-sm p-3.5 sm:p-7 mb-4 sm:mb-6 relative overflow-hidden">
        {/* Top bar with navigation & category */}
        <div className="flex items-center justify-between gap-1.5 sm:gap-2 mb-3 sm:mb-4">
          <button
            type="button"
            onClick={handlePrevWord}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer"
            title="Palavra anterior"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline sm:inline">Anterior</span>
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 rounded-full text-2xs sm:text-xs font-bold border border-amber-300 dark:border-amber-700">
              {currentWord.category}
            </span>
            <span className="text-2xs sm:text-xs text-slate-500 dark:text-slate-400 font-semibold">
              {wordIndex + 1}/{words.length}
            </span>
          </div>

          <button
            type="button"
            onClick={handleNextWord}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer"
            title="Próxima palavra"
          >
            <span className="hidden xs:inline sm:inline">Próxima</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Word Display & Picture */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-8 my-1 sm:my-2">
          {/* Large Kid-friendly visual illustration badge */}
          <div className="relative group shrink-0">
            <div className="w-22 h-22 sm:w-36 sm:h-36 rounded-2xl sm:rounded-3xl bg-amber-50 dark:bg-slate-800 border-2 sm:border-3 border-amber-300 dark:border-amber-500/40 flex items-center justify-center text-5xl sm:text-7xl shadow-inner select-none transition-transform group-hover:scale-105">
              {currentWord.emoji}
            </div>
            {isCompleted && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-emerald-500 text-white p-1.5 sm:p-2 rounded-full shadow-md"
              >
                <CheckCircle2 className="w-4 h-4 sm:w-6 sm:h-6" />
              </motion.div>
            )}
          </div>

          {/* Word Audio Button & Prompt */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-1.5 sm:gap-2 w-full sm:w-auto">
            <div className="text-2xs sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {isCompleted ? 'Você conseguiu!' : 'Ouça a palavra e junte as sílabas:'}
            </div>

            <button
              type="button"
              onClick={handleHearFullWord}
              className="w-full sm:w-auto justify-center px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm sm:text-lg flex items-center gap-2 shadow-md shadow-amber-200 dark:shadow-none border-b-3 sm:border-b-4 border-amber-700 active:border-b-0 active:translate-y-1 transition-all cursor-pointer"
            >
              <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" />
              <span>Ouvir &quot;{formatCase(currentWord.word, letterCase)}&quot;</span>
            </button>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xs italic mt-0.5 flex items-center justify-center sm:justify-start gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>{currentWord.hint}</span>
            </p>
          </div>
        </div>

        {/* Assembled Syllables Drop Zone (Target Line) */}
        <div className="mt-4 sm:mt-6 pt-3.5 sm:pt-5 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center">
          <div className="text-2xs sm:text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 sm:mb-3">
            Sua palavra montada ({selectedSyllables.length}/{currentWord.syllables.length} pedaços):
          </div>

          <motion.div
            animate={isShaking ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
            transition={{ duration: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-2 sm:gap-3.5 min-h-[60px] sm:min-h-[84px] p-2 sm:p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border-2 border-dashed border-slate-300 dark:border-slate-700 w-full max-w-md"
          >
            {currentWord.syllables.map((_, index) => {
              const selectedSyl = selectedSyllables[index];
              const color = getSyllableColor(index);

              if (selectedSyl) {
                return (
                  <motion.button
                    key={selectedSyl.id}
                    layoutId={selectedSyl.id}
                    type="button"
                    onClick={() => handleRemoveSyllable(selectedSyl)}
                    disabled={isCompleted}
                    className={`min-w-[50px] sm:min-w-[80px] h-12 sm:h-16 px-2 sm:px-3 rounded-xl sm:rounded-2xl ${
                      isCompleted
                        ? 'bg-emerald-500 text-white border-emerald-600'
                        : `${color.bg} ${color.text} border-2 ${color.border}`
                    } font-bold text-lg sm:text-2xl shadow-sm flex items-center justify-center border-b-3 sm:border-b-4 cursor-pointer active:scale-95 transition-all select-none`}
                    title="Clique para retirar"
                  >
                    {formatCase(selectedSyl.text, letterCase)}
                  </motion.button>
                );
              }

              // Empty slot placeholder
              return (
                <div
                  key={`empty-${index}`}
                  className="min-w-[50px] sm:min-w-[80px] h-12 sm:h-16 rounded-xl sm:rounded-2xl border-2 border-dashed border-slate-300 bg-white/70 flex items-center justify-center text-slate-400 dark:text-slate-500 text-xs sm:text-sm font-bold select-none"
                >
                  {index + 1}º
                </div>
              );
            })}
          </motion.div>

          {/* Reset button when partially filled and not completed */}
          {selectedSyllables.length > 0 && !isCompleted && (
            <button
              type="button"
              onClick={handleReset}
              className="mt-2.5 sm:mt-3 flex items-center gap-1.5 text-2xs sm:text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpar e tentar de novo</span>
            </button>
          )}
        </div>
      </div>

      {/* Available Syllables Bank */}
      <div className="w-full bg-amber-50/80 dark:bg-slate-900/90 rounded-2xl sm:rounded-3xl border-2 border-amber-200 dark:border-slate-800 p-3.5 sm:p-6 text-center">
        <div className="text-2xs sm:text-sm font-bold text-amber-900 dark:text-amber-200 mb-2.5 sm:mb-3 flex items-center justify-center gap-1.5">
          {isCompleted ? (
            <>
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Palavra completada com sucesso!</span>
            </>
          ) : (
            <span>Toque nos pedacinhos para montar a palavra:</span>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 min-h-[64px] sm:min-h-[76px]">
          <AnimatePresence>
            {shuffledSyllables.map((syl, idx) => {
              const color = getSyllableColor(syl.originalIndex);
              return (
                <motion.button
                  key={syl.id}
                  layoutId={syl.id}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => handleSelectSyllable(syl)}
                  className={`min-w-[62px] sm:min-w-[92px] h-14 sm:h-20 px-3 sm:px-4 rounded-xl sm:rounded-2xl ${color.bg} ${color.text} border-2 sm:border-3 ${color.border} border-b-4 sm:border-b-6 border-b-amber-700/40 active:border-b-0 active:translate-y-1 font-bold text-xl sm:text-3xl shadow-md flex items-center justify-center cursor-pointer transition-all select-none hover:shadow-lg`}
                >
                  {formatCase(syl.text, letterCase)}
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>

        {/* When completed, show big joyful button to proceed to next word */}
        {isCompleted && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <button
              type="button"
              onClick={() => soundEngine.speakSyllablesSlowly(currentWord.syllables, currentWord.word, speechRate)}
              className="px-5 py-3 rounded-2xl bg-white border-2 border-amber-300 text-amber-800 font-bold text-sm sm:text-base flex items-center gap-2 hover:bg-amber-50 transition-colors shadow-sm cursor-pointer"
            >
              <Volume2 className="w-5 h-5 text-amber-600" />
              <span>Ouvir novamente</span>
            </button>

            <button
              type="button"
              onClick={handleNextWord}
              className="px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-base sm:text-lg flex items-center gap-2 shadow-lg shadow-emerald-200 border-b-4 border-emerald-700 active:border-b-0 active:translate-y-1 transition-all cursor-pointer"
            >
              <Sparkles className="w-5 h-5" />
              <span>Próxima Palavra</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};
