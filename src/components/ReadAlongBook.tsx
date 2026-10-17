import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (targetStoryId) {
      const idx = stories.findIndex(s => s.id === targetStoryId);
      if (idx !== -1 && idx !== currentStoryIndex) {
        setCurrentStoryIndex(idx);
      }
    }
  }, [targetStoryId, stories]);
  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [expandedWordIdx, setExpandedWordIdx] = useState<number | null>(null);

  const story = stories[currentStoryIndex];

  const handleSelectStory = (idx: number) => {
    soundEngine.playPop();
    window.speechSynthesis?.cancel();
    setIsPlaying(false);
    setActiveWordIndex(null);
    setExpandedWordIdx(null);
    setCurrentStoryIndex(idx);
    onUpdateMascot('happy', `História: ${formatCase(stories[idx].title, letterCase)}! Clique no botão verde para ler comigo.`);
  };

  const handleReadFullStory = () => {
    if (isPlaying) {
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
      if (idx < story.words.length) {
        setActiveWordIndex(idx);
        const w = story.words[idx].text;
        idx++;

        soundEngine.speakText(w, speechRate, () => {
          setTimeout(readNextWord, 250); // Pedagogical pacing between words
        });
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
    soundEngine.speakText(wordObj.text, speechRate);
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
      {/* Story Selector tabs */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-1">
        {stories.map((s, idx) => (
          <button
            key={s.id}
            type="button"
            onClick={() => handleSelectStory(idx)}
            className={`px-3.5 py-2 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              currentStoryIndex === idx
                ? 'bg-amber-500 text-white shadow-md border-b-3 border-amber-700'
                : 'bg-white text-slate-700 hover:bg-amber-50 border border-slate-200'
            }`}
          >
            <span>{s.coverEmoji}</span>
            <span>{formatCase(s.title, letterCase)}</span>
          </button>
        ))}
      </div>

      {/* Main Book Card */}
      <div className="bg-white rounded-3xl border-3 border-amber-200 shadow-md p-6 sm:p-10 relative overflow-hidden">
        {/* Story Illustration Header */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="text-7xl sm:text-8xl my-2 select-none animate-bounce">
            {story.illustration}
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-amber-900 tracking-wide mt-2">
            {formatCase(story.title, letterCase)}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Toque em qualquer palavra para ver e ouvir as sílabas
          </p>
        </div>

        {/* Story Text with Word Highlighting */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3.5 my-6 p-4 sm:p-6 bg-amber-50/60 rounded-2xl border-2 border-amber-100 min-h-[100px]">
          {story.words.map((w, index) => {
            const isActive = activeWordIndex === index;
            const isExpanded = expandedWordIdx === index;

            return (
              <div key={`${w.text}-${index}`} className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => handleClickWord(index)}
                  className={`px-3 sm:px-4 py-2 sm:py-3 rounded-2xl font-black text-2xl sm:text-3xl transition-all cursor-pointer select-none ${
                    isActive
                      ? 'bg-amber-400 text-amber-950 scale-110 shadow-md ring-4 ring-amber-300'
                      : 'bg-white hover:bg-amber-100 text-slate-800 border-2 border-slate-200 hover:border-amber-300 shadow-xs'
                  }`}
                >
                  {formatCase(w.text, letterCase)}
                </button>

                {/* Expanded Syllable breakdown below word if clicked */}
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex gap-1 mt-2 p-1 bg-white rounded-xl border border-amber-300 shadow-xs"
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
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-6 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleReadFullStory}
            className={`px-6 sm:px-8 py-3.5 rounded-2xl font-black text-base sm:text-lg flex items-center gap-2.5 shadow-md border-b-4 active:border-b-0 active:translate-y-1 transition-all cursor-pointer ${
              isPlaying
                ? 'bg-rose-500 hover:bg-rose-600 text-white border-rose-700'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-700 shadow-emerald-200'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-6 h-6" />
                <span>Pausar Leitura</span>
              </>
            ) : (
              <>
                <Play className="w-6 h-6" />
                <span>Ler Comigo (Voz e Destaque)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
