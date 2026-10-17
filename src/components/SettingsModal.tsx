import React from 'react';
import { motion } from 'motion/react';
import { X, Settings, Volume2, Type, Sliders, Info, Sparkles, Moon, Sun } from 'lucide-react';
import { AppSettings, LetterCase } from '../types';
import { soundEngine } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  const isDark = settings.darkMode;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`rounded-3xl border-3 shadow-2xl max-w-lg w-full p-6 sm:p-7 relative max-h-[90vh] flex flex-col transition-colors ${
          isDark
            ? 'bg-[#131B2E] border-indigo-500/70 text-slate-100'
            : 'bg-white border-amber-300 text-slate-800'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between pb-4 border-b ${isDark ? 'border-indigo-900/60' : 'border-slate-100'}`}>
          <div className="flex items-center gap-2.5">
            <div className={`p-2.5 rounded-2xl ${isDark ? 'bg-indigo-900/60 text-indigo-300' : 'bg-amber-100 text-amber-800'}`}>
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h3 className={`text-xl font-black ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>Ajustes Pedagógicos</h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Personalize a experiência de leitura e acessibilidade
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              soundEngine.playPop();
              onClose();
            }}
            className={`p-2 rounded-xl cursor-pointer ${isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="overflow-y-auto pr-1 py-4 flex flex-col gap-4">
          {/* Modo Noturno (Tons Suaves Azul Escuro & Roxo) */}
          <div className={`p-4 rounded-2xl border transition-colors ${isDark ? 'bg-[#1A233A] border-indigo-900/60' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-2.5">
                <div className={`p-2 rounded-xl mt-0.5 ${isDark ? 'bg-indigo-950/80 text-indigo-300' : 'bg-amber-100 text-amber-700'}`}>
                  {isDark ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-600" />}
                </div>
                <div>
                  <div className={`text-sm font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                    Modo Noturno (Estudo Noturno)
                  </div>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Paleta suave em tons de azul escuro e roxo para reduzir o cansaço visual.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playPop();
                  onUpdateSettings({ darkMode: !settings.darkMode });
                }}
                className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                  settings.darkMode ? 'bg-indigo-500 justify-end' : 'bg-slate-300 justify-start'
                }`}
              >
                <div className="bg-white w-4 h-4 rounded-full shadow-md" />
              </button>
            </div>
          </div>

          {/* 1. Letter Case (Caixa Alta / Minúscula) */}
          <div className={`p-4 rounded-2xl border transition-colors ${isDark ? 'bg-[#1A233A] border-indigo-900/60' : 'bg-slate-50 border-slate-200'}`}>
            <div className={`flex items-center gap-2 text-sm font-bold mb-1 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
              <Type className="w-4 h-4 text-amber-500" />
              <span>Formato das Letras</span>
            </div>
            <p className={`text-xs mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Crianças no início da alfabetização ou com dislexia costumam preferir <strong>Letra Bastão (Caixa Alta)</strong> pois evita confusões espelhadas (b, d, p, q).
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playPop();
                  onUpdateSettings({ letterCase: 'uppercase' });
                }}
                className={`py-2.5 px-3 rounded-xl font-bold text-sm border-2 cursor-pointer transition-all ${
                  settings.letterCase === 'uppercase'
                    ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                    : isDark
                    ? 'bg-[#131B2E] text-slate-200 border-indigo-950 hover:bg-[#202c48]'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50'
                }`}
              >
                LETRAS BASTÃO (MAIÚSCULAS)
              </button>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playPop();
                  onUpdateSettings({ letterCase: 'lowercase' });
                }}
                className={`py-2.5 px-3 rounded-xl font-bold text-sm border-2 cursor-pointer transition-all ${
                  settings.letterCase === 'lowercase'
                    ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                    : isDark
                    ? 'bg-[#131B2E] text-slate-200 border-indigo-950 hover:bg-[#202c48]'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50'
                }`}
              >
                letras minúsculas
              </button>
            </div>
          </div>

          {/* 2. Dyslexia Spacing */}
          <div className={`p-4 rounded-2xl border transition-colors ${isDark ? 'bg-[#1A233A] border-indigo-900/60' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-sm font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                  Espaçamento Amplo (Apoio à Dislexia)
                </div>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Aumenta o espaço entre letras e palavras para evitar aglomeração visual.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playPop();
                  onUpdateSettings({ dyslexiaFontMode: !settings.dyslexiaFontMode });
                }}
                className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                  settings.dyslexiaFontMode ? 'bg-emerald-500 justify-end' : 'bg-slate-300 justify-start'
                }`}
              >
                <div className="bg-white w-4 h-4 rounded-full shadow-md" />
              </button>
            </div>
          </div>

          {/* 3. Speech Rate (Velocidade da Voz) */}
          <div className={`p-4 rounded-2xl border transition-colors ${isDark ? 'bg-[#1A233A] border-indigo-900/60' : 'bg-slate-50 border-slate-200'}`}>
            <div className={`flex items-center gap-2 text-sm font-bold mb-1 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
              <Volume2 className="w-4 h-4 text-amber-500" />
              <span>Velocidade da Voz e Narração</span>
            </div>
            <p className={`text-xs mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Falas mais lentas ajudam a criança a discriminar cada fonema com clareza.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Muito Calma', rate: 0.7 },
                { label: 'Calma (Ideal)', rate: 0.85 },
                { label: 'Normal', rate: 1.0 },
              ].map(item => (
                <button
                  key={item.rate}
                  type="button"
                  onClick={() => {
                    soundEngine.playPop();
                    onUpdateSettings({ speechRate: item.rate });
                    soundEngine.speakText('Olá! Essa é a minha velocidade de leitura.', item.rate);
                  }}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border-2 cursor-pointer transition-all ${
                    settings.speechRate === item.rate
                      ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                      : isDark
                      ? 'bg-[#131B2E] text-slate-200 border-indigo-950 hover:bg-[#202c48]'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Tips for Parents and Teachers */}
          <div className={`p-4 rounded-2xl border text-xs flex gap-2.5 ${
            isDark
              ? 'bg-[#182035] border-indigo-900/70 text-indigo-200'
              : 'bg-amber-50/70 border-amber-200 text-amber-950'
          }`}>
            <Info className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDark ? 'text-indigo-400' : 'text-amber-700'}`} />
            <div>
              <strong className="block font-bold mb-1">Dica Pedagógica:</strong>
              Celebre cada acerto e nunca apresse a criança. Ler requer conexão neural entre o som ouvido e a letra vista. Brinque 10 a 15 minutos por dia!
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`pt-4 border-t ${isDark ? 'border-indigo-900/60' : 'border-slate-100'}`}>
          <button
            type="button"
            onClick={() => {
              soundEngine.playPop();
              onClose();
            }}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-base shadow-sm cursor-pointer"
          >
            Salvar e Voltar
          </button>
        </div>
      </motion.div>
    </div>
  );
};
