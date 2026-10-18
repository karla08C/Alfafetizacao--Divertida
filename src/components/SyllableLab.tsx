import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Volume2, Sparkles, Plus, Trash2, Wand2 } from 'lucide-react';
import { LetterCase } from '../types';
import { soundEngine } from '../utils/audio';
import { formatCase } from '../utils/textFormat';

interface SyllableLabProps {
  letterCase: LetterCase;
  speechRate: number;
  voiceEnabled: boolean;
  onUpdateMascot: (mood: 'happy' | 'thinking' | 'celebrating' | 'encouraging', message: string, hint?: string) => void;
  onPracticeSyllables?: (syllables: string[]) => void;
}

const CONSONANTS = ['B', 'C', 'D', 'F', 'G', 'J', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'V', 'Z'];
const VOWELS = ['A', 'E', 'I', 'O', 'U'];

const COMMON_EXAMPLES: Record<string, { word: string; emoji: string }> = {
  // B
  BA: { word: 'BANANA', emoji: '🍌' },
  BE: { word: 'BEBÊ', emoji: '👶' },
  BI: { word: 'BICO', emoji: '🦆' },
  BO: { word: 'BOLA', emoji: '⚽' },
  BU: { word: 'BULE', emoji: '🫖' },
  // C
  CA: { word: 'CASA', emoji: '🏠' },
  CE: { word: 'CENOURA', emoji: '🥕' },
  CI: { word: 'CINEMA', emoji: '🎬' },
  CO: { word: 'COPO', emoji: '🥛' },
  CU: { word: 'CUBO', emoji: '🧊' },
  // D
  DA: { word: 'DADO', emoji: '🎲' },
  DE: { word: 'DEDO', emoji: '👆' },
  DI: { word: 'DINOSSAURO', emoji: '🦖' },
  DO: { word: 'DOCE', emoji: '🍬' },
  DU: { word: 'DUENDE', emoji: '🧝' },
  // F
  FA: { word: 'FADA', emoji: '🧚' },
  FE: { word: 'FEIJÃO', emoji: '🫘' },
  FI: { word: 'FITA', emoji: '🎀' },
  FO: { word: 'FOGO', emoji: '🔥' },
  FU: { word: 'FOGUETE', emoji: '🚀' },
  // G
  GA: { word: 'GATO', emoji: '🐱' },
  GE: { word: 'GELADO', emoji: '🍦' },
  GI: { word: 'GIRAFA', emoji: '🦒' },
  GO: { word: 'GOTA', emoji: '💧' },
  GU: { word: 'GULOSO', emoji: '😋' },
  // J
  JA: { word: 'JACARÉ', emoji: '🐊' },
  JE: { word: 'JEGUE', emoji: '🫏' },
  JI: { word: 'JIBÓIA', emoji: '🐍' },
  JO: { word: 'JOANINHA', emoji: '🐞' },
  JU: { word: 'JUJUBA', emoji: '🍬' },
  // L
  LA: { word: 'LÁPIS', emoji: '✏️' },
  LE: { word: 'LEÃO', emoji: '🦁' },
  LI: { word: 'LIMÃO', emoji: '🍋' },
  LO: { word: 'LOBO', emoji: '🐺' },
  LU: { word: 'LUA', emoji: '🌙' },
  // M
  MA: { word: 'MACACO', emoji: '🐵' },
  ME: { word: 'MEIA', emoji: '🧦' },
  MI: { word: 'MILHO', emoji: '🌽' },
  MO: { word: 'MOTO', emoji: '🏍️' },
  MU: { word: 'MÚSICA', emoji: '🎵' },
  // N
  NA: { word: 'NAVIO', emoji: '🚢' },
  NE: { word: 'NEVE', emoji: '❄️' },
  NI: { word: 'NINHO', emoji: '🪺' },
  NO: { word: 'NOITE', emoji: '🌙' },
  NU: { word: 'NUVEM', emoji: '☁️' },
  // P
  PA: { word: 'PATO', emoji: '🦆' },
  PE: { word: 'PEIXE', emoji: '🐟' },
  PI: { word: 'PIPOCA', emoji: '🍿' },
  PO: { word: 'PORTA', emoji: '🚪' },
  PU: { word: 'PUDIM', emoji: '🍮' },
  // R
  RA: { word: 'RATO', emoji: '🐭' },
  RE: { word: 'REI', emoji: '👑' },
  RI: { word: 'RIO', emoji: '🏞️' },
  RO: { word: 'ROBÔ', emoji: '🤖' },
  RU: { word: 'RUA', emoji: '🛣️' },
  // S
  SA: { word: 'SAPO', emoji: '🐸' },
  SE: { word: 'SELO', emoji: '✉️' },
  SI: { word: 'SINO', emoji: '🔔' },
  SO: { word: 'SOL', emoji: '☀️' },
  SU: { word: 'SUCO', emoji: '🧃' },
  // T
  TA: { word: 'TATU', emoji: '🦔' },
  TE: { word: 'TESOURA', emoji: '✂️' },
  TI: { word: 'TIGRE', emoji: '🐯' },
  TO: { word: 'TOMATE', emoji: '🍅' },
  TU: { word: 'TUCANO', emoji: '🦜' },
  // V
  VA: { word: 'VACA', emoji: '🐮' },
  VE: { word: 'VELA', emoji: '🕯️' },
  VI: { word: 'VIOLÃO', emoji: '🎸' },
  VO: { word: 'VOVÓ', emoji: '👵' },
  VU: { word: 'VULCÃO', emoji: '🌋' },
  // Z
  ZA: { word: 'ZANGÃO', emoji: '🐝' },
  ZE: { word: 'ZEBRA', emoji: '🦓' },
  ZI: { word: 'ZÍPER', emoji: '🤐' },
  ZO: { word: 'ZOOLÓGICO', emoji: '🦁' },
  ZU: { word: 'ZUMBIDO', emoji: '🐝' },
};

export const SyllableLab: React.FC<SyllableLabProps> = ({
  letterCase,
  speechRate,
  voiceEnabled,
  onUpdateMascot,
  onPracticeSyllables,
}) => {
  const [consonant, setConsonant] = useState('B');
  const [vowel, setVowel] = useState('A');
  const [wordChain, setWordChain] = useState<string[]>(['BO', 'LA']);

  const currentSyllable = `${consonant}${vowel}`;
  const example = COMMON_EXAMPLES[currentSyllable];

  const handleSelectConsonant = (c: string) => {
    soundEngine.playPop();
    setConsonant(c);
    const newSyl = `${c}${vowel}`;
    if (voiceEnabled) {
      soundEngine.speakText(newSyl, speechRate);
    }
    onUpdateMascot('happy', `Você escolheu a letra ${c}! Veja como soa com a vogal.`);
  };

  const handleSelectVowel = (v: string) => {
    soundEngine.playPop();
    setVowel(v);
    const newSyl = `${consonant}${v}`;
    if (voiceEnabled) {
      soundEngine.speakText(newSyl, speechRate);
    }
    onUpdateMascot('happy', `Olha só: ${consonant} + ${v} fica ${newSyl}!`);
  };

  const handleSpeakSyllable = () => {
    soundEngine.playPop();
    soundEngine.speakText(currentSyllable, speechRate);
  };

  const handleAddSyllableToChain = () => {
    soundEngine.playPop();
    if (wordChain.length < 5) {
      const nextChain = [...wordChain, currentSyllable];
      setWordChain(nextChain);
      soundEngine.playStarDing();
      onPracticeSyllables?.([currentSyllable]);
      if (voiceEnabled) {
        soundEngine.speakText(nextChain.join(''), speechRate);
      }
    }
  };

  const handleClearChain = () => {
    soundEngine.playPop();
    setWordChain([]);
  };

  const handleSpeakChain = () => {
    if (wordChain.length === 0) return;
    soundEngine.playPop();
    soundEngine.speakSyllablesSlowly(wordChain, wordChain.join(''), speechRate);
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
      {/* Interactive Fusion Station */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 transition-colors">
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 rounded-full text-xs font-bold mb-2 border border-purple-200 dark:border-purple-800">
            <Wand2 className="w-3.5 h-3.5" /> Fábrica Mágica de Sílabas
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100">
            Junte a Consoante com a Vogal
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Escolha uma letra azul e uma amarela para ouvir a mágica do som!
          </p>
        </div>

        {/* Big Fusion Display */}
        <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 my-2 sm:my-4">
          <div className="flex items-center justify-center gap-1.5 sm:gap-4 flex-wrap">
            {/* Consonant pill */}
            <motion.div
              key={consonant}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="w-13 h-16 sm:w-20 sm:h-24 rounded-xl sm:rounded-2xl bg-blue-500 text-white font-black text-3xl sm:text-5xl flex items-center justify-center shadow-md border-b-3 sm:border-b-4 border-blue-700"
            >
              {formatCase(consonant, letterCase)}
            </motion.div>

            <span className="text-xl sm:text-3xl font-bold text-slate-400 dark:text-slate-600">+</span>

            {/* Vowel pill */}
            <motion.div
              key={vowel}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="w-13 h-16 sm:w-20 sm:h-24 rounded-xl sm:rounded-2xl bg-amber-500 text-white font-black text-3xl sm:text-5xl flex items-center justify-center shadow-md border-b-3 sm:border-b-4 border-amber-700"
            >
              {formatCase(vowel, letterCase)}
            </motion.div>

            <span className="text-xl sm:text-3xl font-bold text-slate-400 dark:text-slate-600">=</span>

            {/* Combined Syllable result */}
            <motion.button
              key={currentSyllable}
              initial={{ scale: 0.7 }}
              animate={{ scale: 1 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={handleSpeakSyllable}
              className="min-w-[76px] sm:min-w-[110px] h-16 sm:h-24 px-3 sm:px-4 rounded-2xl sm:rounded-3xl bg-purple-600 hover:bg-purple-700 text-white font-black text-3xl sm:text-5xl flex items-center justify-center gap-1.5 sm:gap-2 shadow-lg shadow-purple-200 dark:shadow-none border-b-3 sm:border-b-4 border-purple-900 cursor-pointer transition-transform"
              title="Clique para ouvir"
            >
              <span>{formatCase(currentSyllable, letterCase)}</span>
              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 opacity-80" />
            </motion.button>
          </div>

          {/* Example word if available */}
          {example && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200 text-xs sm:text-sm font-bold mt-1 sm:mt-2"
            >
              <span className="text-xl sm:text-2xl">{example.emoji}</span>
              <span>Como em: {formatCase(example.word, letterCase)}</span>
              <button
                type="button"
                onClick={() => soundEngine.speakText(example.word, speechRate)}
                className="p-1 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900 text-purple-700 dark:text-purple-300 cursor-pointer"
                title={`Ouvir ${example.word}`}
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}

          {/* Add to word belt button */}
          <button
            type="button"
            onClick={handleAddSyllableToChain}
            className="mt-1 sm:mt-2 px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 shadow-sm border-b-3 border-emerald-700 active:border-b-0 active:translate-y-0.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span className="hidden xs:inline">Guardar &quot;{formatCase(currentSyllable, letterCase)}&quot; para formar palavra</span>
            <span className="xs:hidden">Guardar &quot;{formatCase(currentSyllable, letterCase)}&quot;</span>
          </button>
        </div>

        {/* Consonant Selector Grid */}
        <div className="mt-4 sm:mt-6">
          <div className="text-2xs sm:text-xs font-bold text-blue-800 dark:text-blue-400 uppercase tracking-wider mb-2">
            1. Escolha a Consoante:
          </div>
          <div className="flex flex-wrap gap-1 xs:gap-1.5 sm:gap-2 justify-center">
            {CONSONANTS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => handleSelectConsonant(c)}
                className={`w-8 h-9 xs:w-9 xs:h-10 sm:w-12 sm:h-13 rounded-lg sm:rounded-xl font-black text-sm xs:text-base sm:text-xl flex items-center justify-center transition-all cursor-pointer select-none ${
                  consonant === c
                    ? 'bg-blue-600 text-white shadow-md scale-105 border-b-2 sm:border-b-3 border-blue-900'
                    : 'bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-slate-700'
                }`}
              >
                {formatCase(c, letterCase)}
              </button>
            ))}
          </div>
        </div>

        {/* Vowel Selector Grid */}
        <div className="mt-5">
          <div className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider mb-2">
            2. Escolha a Vogal:
          </div>
          <div className="flex flex-wrap gap-1.5 xs:gap-2.5 justify-center">
            {VOWELS.map(v => (
              <button
                key={v}
                type="button"
                onClick={() => handleSelectVowel(v)}
                className={`w-10 h-11 xs:w-12 xs:h-13 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl font-black text-xl sm:text-2xl flex items-center justify-center transition-all cursor-pointer select-none ${
                  vowel === v
                    ? 'bg-amber-500 text-white shadow-md scale-105 border-b-3 border-amber-800'
                    : 'bg-amber-50 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-slate-700 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-slate-700'
                }`}
              >
                {formatCase(v, letterCase)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Free Word Builder Belt */}
      <div className="bg-slate-50 dark:bg-slate-900/90 rounded-3xl border-2 border-slate-200 dark:border-slate-800 p-5 sm:p-6 text-center transition-colors">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
            Crie suas palavras com as sílabas guardadas:
          </span>
          {wordChain.length > 0 && (
            <button
              type="button"
              onClick={handleClearChain}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar</span>
            </button>
          )}
        </div>

        <div className="flex items-center justify-center gap-2 min-h-[64px] bg-white dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
          {wordChain.length === 0 ? (
            <span className="text-sm text-slate-400 dark:text-slate-500 font-medium italic">
              Nenhuma sílaba guardada. Clique no botão verde acima para adicionar!
            </span>
          ) : (
            wordChain.map((syl, i) => (
              <div
                key={`${syl}-${i}`}
                className="px-4 py-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-900 dark:text-purple-200 font-extrabold text-xl sm:text-2xl border-2 border-purple-300 dark:border-purple-800"
              >
                {formatCase(syl, letterCase)}
              </div>
            ))
          )}
        </div>

        {wordChain.length > 0 && (
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleSpeakChain}
              className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-base flex items-center gap-2 shadow-md border-b-4 border-purple-900 active:border-b-0 active:translate-y-1 transition-all cursor-pointer"
            >
              <Volume2 className="w-5 h-5" />
              <span>Ler palavra inteira: &quot;{formatCase(wordChain.join(''), letterCase)}&quot;</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
