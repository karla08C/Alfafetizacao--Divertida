import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Volume2, Play, Pause, BookOpen, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ReadingSentence, LetterCase } from '../types';
import { soundEngine } from '../utils/audio';
import { formatCase, getSyllableColor } from '../utils/textFormat';

interface ReadAlongBookProps {
  stories: ReadingSentence[];
  letterCase: LetterCase;
  speechRate: number;
  voiceEnabled: boolean;
  onStoryCompleted: () => void;
  onUpdateMascot: (mood: 'happy' | 'thinking' | 'celebrating' | 'encouraging', message: string, hint?: string) => void;
  targetStoryId?: string;
}

export const ReadAlongBook: React.FC<ReadAlongBookProps> = ({
  stories,
  letterCase,
  speechRate,
  voiceEnabled,
  onStoryCompleted,
  onUpdateMascot,
  targetStoryId,
}) => {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(() => {
    if (targetStoryId) {
      const idx = stories.findIndex(s => s.id === targetStoryId);
      if (idx !== -1) return idx;
    }
    return 0;
  });

  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [expandedWordIdx, setExpandedWordIdx] = useState<number | null>(null);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      window.speechSynthesis?.cancel();
    };
  }, []);

  useEffect(() => {
    if (targetStoryId) {
      const idx = stories.findIndex(s => s.id === targetStoryId);
      if (idx !== -1 && idx !== currentStoryIndex) {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        window.speechSynthesis?.cancel();
        setIsPlaying(false);
        setActiveWordIndex(null);
        setCurrentStoryIndex(idx);
      }
    }
  }, [targetStoryId, stories, currentStoryIndex]);

  const story = stories[currentStoryIndex];

  const handleSelectStory = (idx: number) => {
    soundEngine.playPop();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    window.speechSynthesis?.cancel();
    setIsPlaying(false);
    setActiveWordIndex(null);
    setExpandedWordIdx(null);
    setCurrentStoryIndex(idx);
    onUpdateMascot('happy', `História: ${formatCase(stories[idx].title, letterCase)}! Clique no botão verde para ler comigo.`);
  };

  const handleReadFullStory = () => {
    if (isPlaying) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      window.speechSynthesis?.cancel();
      setIsPlaying(false);
      setActiveWordIndex(null);
      return;
    }

    soundEngine.playPop();
    setIsPlaying(true);
    onUpdateMascot('happy', 'Acompanhe a leitura! Cada palavrinha vai acender.');

    let idx = 0;

    const readNextWord = () => {
      if (!isMountedRef.current) return;

      if (idx < story.words.length) {
        setActiveWordIndex(idx);
        const w = story.words[idx].text;
        idx++;

        if (voiceEnabled) {
          soundEngine.speakText(w, speechRate, () => {
            if (!isMountedRef.current) return;
            timeoutRef.current = setTimeout(readNextWord, 250); // Pedagogical pacing between words
          });
        } else {
          // Visual read-along pacing when voice is muted
          timeoutRef.current = setTimeout(readNextWord, 700);
        }
      } else {
        // Story finished!
        setIsPlaying(false);
        setActiveWordIndex(null);
        soundEngine.playSuccessChime();
        soundEngine.playStarDing();

        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.65 },
          });
        } catch {
          // Confetti fallback
        }

        onStoryCompleted();
        onUpdateMascot(
          'celebrating',
          'Parabéns! Você leu a historinha toda! Você é um verdadeiro leitor!'
        );
      }
    };

    readNextWord();
  };

  const handleClickWord = (index: number) => {
    soundEngine.playPop();
    setActiveWordIndex(index);
    setExpandedWordIdx(expandedWordIdx === index ? null : index);
    const wordObj = story.words[index];
    if (voiceEnabled) {
      soundEngine.speakText(wordObj.text, speechRate);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
      {/* Story Selector tabs */}
      <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-1 scrollbar-none px-1">
        {stories.map((s, idx) => (
          <button
            key={s.id}
            type="button"
            onClick={() => handleSelectStory(idx)}
            className={`px-3.5 py-2 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer shrink-0 ${
              currentStoryIndex === idx
                ? 'bg-amber-500 text-white shadow-md border-b-3 border-amber-700'
                : 'bg-white dark:bg-[#182234] text-slate-700 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <span>{s.coverEmoji}</span>
            <span>{formatCase(s.title, letterCase)}</span>
          </button>
        ))}
      </div>

      {/* Main Book Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-amber-200 dark:border-slate-800 shadow-md p-4 sm:p-10 relative overflow-hidden">
        {/* Story Illustration Header */}
        <div className="flex flex-col items-center justify-center mb-4 sm:mb-6">
          <div className="text-5xl sm:text-8xl my-1 sm:my-2 select-none animate-bounce">
            {story.illustration}
          </div>
          <h3 className="text-lg sm:text-2xl font-black text-amber-900 dark:text-amber-300 tracking-wide mt-1 sm:mt-2 text-center">
            {formatCase(story.title, letterCase)}
          </h3>
          <p className="text-2xs sm:text-xs text-slate-400 dark:text-slate-500 mt-0.5 sm:mt-1 text-center">
            Toque em qualquer palavra para ver e ouvir as sílabas
          </p>
        </div>

        {/* Story Text with Word Highlighting */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-3.5 my-4 sm:my-6 p-3 sm:p-6 bg-amber-50/60 dark:bg-slate-800/80 rounded-xl sm:rounded-2xl border-2 border-amber-100 dark:border-slate-700 min-h-[80px] sm:min-h-[100px]">
          {story.words.map((w, index) => {
            const isActive = activeWordIndex === index;
            const isExpanded = expandedWordIdx === index;

            return (
              <div key={`${w.text}-${index}`} className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => handleClickWord(index)}
                  className={`px-2.5 sm:px-4 py-1.5 sm:py-3 rounded-xl sm:rounded-2xl font-black text-xl sm:text-3xl transition-all cursor-pointer select-none ${
                    isActive
                      ? 'bg-amber-400 text-amber-950 scale-105 sm:scale-110 shadow-md ring-3 sm:ring-4 ring-amber-300'
                      : 'bg-white dark:bg-[#182234] hover:bg-amber-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 border-2 border-slate-200 dark:border-slate-700 hover:border-amber-300 shadow-xs'
                  }`}
                >
                  {formatCase(w.text, letterCase)}
                </button>

                {/* Expanded Syllable breakdown below word if clicked */}
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex gap-1 mt-1 sm:mt-2 p-1 bg-white dark:bg-slate-900 rounded-xl border border-amber-300 dark:border-slate-700 shadow-xs"
                  >
                    {w.syllables.map((syl, sIdx) => {
                      const col = getSyllableColor(sIdx);
                      return (
                        <span
                          key={`${syl}-${sIdx}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            soundEngine.playPop();
                            soundEngine.speakText(syl, speechRate);
                          }}
                          className={`px-2 py-0.5 rounded-lg text-xs font-black ${col.bg} ${col.text} border ${col.border} cursor-pointer hover:scale-105`}
                          title="Ouvir sílaba"
                        >
                          {formatCase(syl, letterCase)}
                        </span>
                      );
                    })}
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>

        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleReadFullStory}
            className={`w-full sm:w-auto px-5 sm:px-8 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl font-black text-sm sm:text-lg flex items-center justify-center gap-2 sm:gap-2.5 shadow-md border-b-3 sm:border-b-4 active:border-b-0 active:translate-y-1 transition-all cursor-pointer ${
              isPlaying
                ? 'bg-rose-500 hover:bg-rose-600 text-white border-rose-700'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-700 shadow-emerald-200'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-5 h-5 sm:w-6 sm:h-6" />
                <span>Pausar Leitura</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 sm:w-6 sm:h-6" />
                <span>Ler Comigo (Voz e Destaque)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
