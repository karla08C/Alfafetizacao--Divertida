import React from 'react';
import { motion } from 'motion/react';
import { Volume2, Sparkles, HelpCircle } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface MascotProps {
  mood: 'happy' | 'thinking' | 'celebrating' | 'encouraging';
  message: string;
  hintText?: string;
  onHintClick?: () => void;
  voiceEnabled: boolean;
  speechRate: number;
}

export const Mascot: React.FC<MascotProps> = ({
  mood,
  message,
  hintText,
  onHintClick,
  voiceEnabled,
  speechRate,
}) => {
  const speakMascot = () => {
    if (!voiceEnabled) return;
    soundEngine.playPop();
    soundEngine.speakText(message, speechRate);
  };

  const getMascotExpression = () => {
    switch (mood) {
      case 'celebrating':
        return {
          eyes: '🌟 🌟',
          mouth: '‿',
          cheeks: 'bg-rose-400',
          headTilt: [0, -8, 8, 0],
          bounce: [0, -12, 0, -8, 0],
        };
      case 'thinking':
        return {
          eyes: '• Ꙫ',
          mouth: '·',
          cheeks: 'bg-amber-300',
          headTilt: [0, 6, 0],
          bounce: [0, -3, 0],
        };
      case 'encouraging':
        return {
          eyes: '◠ ◠',
          mouth: '◡',
          cheeks: 'bg-emerald-300',
          headTilt: [0, -4, 4, 0],
          bounce: [0, -4, 0],
        };
      case 'happy':
      default:
        return {
          eyes: '◕ ◕',
          mouth: '‿',
          cheeks: 'bg-rose-300',
          headTilt: [0, 3, -3, 0],
          bounce: [0, -4, 0],
        };
    }
  };

  const expr = getMascotExpression();

  return (
    <div id="mascot-container" className="flex items-center gap-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs p-3.5 sm:p-4 rounded-3xl border-2 border-amber-200 dark:border-slate-800 shadow-sm max-w-2xl mx-auto transition-all">
      {/* Interactive Mascot Avatar */}
      <button
        type="button"
        onClick={speakMascot}
        className="group relative flex-shrink-0 cursor-pointer focus:outline-hidden"
        title="Clique para ouvir o Pipoca!"
      >
        <motion.div
          animate={{
            y: expr.bounce,
            rotate: expr.headTilt,
          }}
          transition={{
            duration: mood === 'celebrating' ? 0.8 : 2.5,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 shadow-md flex flex-col items-center justify-center border-3 border-amber-300 group-hover:scale-105 transition-transform"
        >
          {/* Owl/Pup cute ears */}
          <div className="absolute -top-1.5 -left-1 w-3 h-3 bg-amber-500 rounded-tl-full border-t border-l border-amber-300" />
          <div className="absolute -top-1.5 -right-1 w-3 h-3 bg-amber-500 rounded-tr-full border-t border-r border-amber-300" />

          {/* Eyes */}
          <div className="text-sm font-bold tracking-widest text-slate-800 select-none">
            {expr.eyes}
          </div>

          {/* Cute Beak/Nose */}
          <div className="w-2.5 h-2 bg-amber-700 rounded-b-full my-0.5" />

          {/* Cheeks */}
          <div className="flex gap-4">
            <div className={`w-2 h-1.5 rounded-full opacity-60 ${expr.cheeks}`} />
            <div className={`w-2 h-1.5 rounded-full opacity-60 ${expr.cheeks}`} />
          </div>

          {/* Little audio badge on hover */}
          <div className="absolute -bottom-1 -right-1 bg-amber-600 text-white p-1 rounded-full text-[10px] shadow-xs">
            <Volume2 className="w-2.5 h-2.5" />
          </div>
        </motion.div>
      </button>

      {/* Speech bubble */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-400 mb-0.5">
          <span>Pipoca, seu amigo leitor</span>
          {mood === 'celebrating' && (
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" />
          )}
        </div>
        <p className="text-sm sm:text-base font-medium text-slate-800 dark:text-slate-100 leading-snug">
          {message}
        </p>
      </div>

      {/* Action buttons on speech bubble */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          id="btn-mascot-speak"
          type="button"
          onClick={speakMascot}
          className="p-2 sm:p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 dark:hover:bg-amber-900/80 text-amber-800 dark:text-amber-300 transition-colors cursor-pointer border border-amber-300 dark:border-amber-700"
          title="Ouvir o Pipoca falar"
        >
          <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {hintText && onHintClick && (
          <button
            id="btn-mascot-hint"
            type="button"
            onClick={() => {
              soundEngine.playPop();
              onHintClick();
            }}
            className="p-2 sm:p-2.5 rounded-xl bg-sky-100 dark:bg-sky-950/60 hover:bg-sky-200 dark:hover:bg-sky-900/80 text-sky-800 dark:text-sky-300 transition-colors cursor-pointer border border-sky-300 dark:border-sky-700 flex items-center gap-1 text-xs font-bold"
            title="Dica mágica do Pipoca"
          >
            <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-sky-600 dark:text-sky-400" />
            <span className="hidden sm:inline">Dica</span>
          </button>
        )}
      </div>
    </div>
  );
};
