import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Settings, Volume2, Type, Info, Moon, Sun, Play, Check } from 'lucide-react';
import { AppSettings } from '../types';
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
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isPlayingTest, setIsPlayingTest] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const updateVoices = () => {
      setAvailableVoices(soundEngine.getAvailablePtVoices());
    };
    updateVoices();
    const unsub = soundEngine.onVoicesChanged(updateVoices);
    return unsub;
  }, [isOpen]);

  if (!isOpen) return null;

  const isDark = settings.darkMode;
  const currentVoice = soundEngine.getSelectedVoice();

  const handleTestVoice = () => {
    soundEngine.playPop();
    setIsPlayingTest(true);
    soundEngine.speakText('Olá! Estou pronto para ler com você! A, E, I, O, U!', settings.speechRate, () => {
      setIsPlayingTest(false);
    });
  };

  const handleSelectVoice = (uri: string) => {
    soundEngine.setPreferredVoice(uri);
    onUpdateSettings({ preferredVoiceURI: uri });
    soundEngine.speakText('Voz selecionada com sucesso!', settings.speechRate);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className={`rounded-3xl border-2 shadow-2xl max-w-lg w-full p-4 sm:p-7 relative max-h-[90vh] flex flex-col transition-colors ${
          isDark
            ? 'bg-[#111827] border-indigo-500/60 text-slate-100 shadow-indigo-950/50'
            : 'bg-white border-amber-300 text-slate-800'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between pb-3.5 border-b ${
            isDark ? 'border-slate-800' : 'border-slate-100'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`p-2.5 rounded-2xl shrink-0 ${
                isDark ? 'bg-indigo-950 text-indigo-300 border border-indigo-800' : 'bg-amber-100 text-amber-800'
              }`}
            >
              <Settings className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className={`text-base sm:text-lg font-black leading-tight truncate ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                Ajustes e Acessibilidade
              </h3>
              <p className={`text-2xs sm:text-xs mt-0.5 truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Personalize áudio, modo noturno e tipografia
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              soundEngine.playPop();
              onClose();
            }}
            className={`p-2 rounded-xl cursor-pointer ${
              isDark
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="overflow-y-auto pr-1 py-4 flex flex-col gap-4">
          {/* 1. Modo Noturno / Dark Mode */}
          <div
            className={`p-4 rounded-2xl border transition-colors ${
              isDark ? 'bg-[#182234] border-slate-700' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-2.5">
                <div
                  className={`p-2 rounded-xl mt-0.5 ${
                    isDark ? 'bg-indigo-950 text-indigo-300 border border-indigo-800' : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {isDark ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-600" />}
                </div>
                <div>
                  <div className={`text-sm font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                    Modo Escuro (Descanso Ocular)
                  </div>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Cores em tons suaves de azul e grafite para reduzir a fadiga da visão.
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
                  settings.darkMode ? 'bg-indigo-600 justify-end' : 'bg-slate-300 justify-start'
                }`}
                title="Alternar Modo Escuro"
              >
                <div className="bg-white w-4 h-4 rounded-full shadow-md" />
              </button>
            </div>
          </div>

          {/* 2. Seleção e Ajuste de Voz Natural */}
          <div
            className={`p-4 rounded-2xl border transition-colors ${
              isDark ? 'bg-[#182234] border-slate-700' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className={`flex items-center justify-between mb-1.5`}>
              <div className={`flex items-center gap-2 text-sm font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                <Volume2 className="w-4 h-4 text-amber-500" />
                <span>Voz em Português Brasileiro</span>
              </div>
              <button
                type="button"
                onClick={handleTestVoice}
                disabled={isPlayingTest}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                  isPlayingTest
                    ? 'bg-amber-500 text-white animate-pulse'
                    : isDark
                    ? 'bg-indigo-950 text-indigo-300 border border-indigo-700 hover:bg-indigo-900'
                    : 'bg-white text-amber-900 border border-amber-300 hover:bg-amber-100 shadow-2xs'
                }`}
              >
                <Play className="w-3 h-3 fill-current" />
                <span>{isPlayingTest ? 'Falando...' : 'Ouvir Teste'}</span>
              </button>
            </div>

            <p className={`text-xs mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Voz selecionada: <span className="font-bold text-amber-500">{currentVoice?.name || 'Padrão do Sistema'}</span>
            </p>

            {availableVoices.length > 0 && (
              <div className="flex flex-col gap-1.5 mb-3">
                <label className={`text-2xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Vozes Detectadas no seu Navegador:
                </label>
                <select
                  value={currentVoice?.voiceURI || ''}
                  onChange={e => handleSelectVoice(e.target.value)}
                  className={`w-full p-2.5 rounded-xl text-xs font-semibold border cursor-pointer ${
                    isDark
                      ? 'bg-[#111827] border-slate-600 text-slate-100 focus:border-indigo-500'
                      : 'bg-white border-slate-300 text-slate-800 focus:border-amber-500'
                  }`}
                >
                  {availableVoices.map(voice => (
                    <option key={voice.voiceURI} value={voice.voiceURI}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Velocidade da fala */}
            <div className="flex flex-col gap-1.5">
              <span className={`text-2xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Velocidade da Narração:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Muito Calma', rate: 0.7 },
                  { label: 'Ideal (Recomendada)', rate: 0.85 },
                  { label: 'Normal', rate: 1.0 },
                ].map(item => (
                  <button
                    key={item.rate}
                    type="button"
                    onClick={() => {
                      soundEngine.playPop();
                      onUpdateSettings({ speechRate: item.rate });
                      soundEngine.speakText('Velocidade de leitura ajustada.', item.rate);
                    }}
                    className={`py-2 px-1 rounded-xl text-xs font-bold border cursor-pointer transition-all text-center ${
                      settings.speechRate === item.rate
                        ? 'bg-amber-500 text-white border-amber-600 shadow-2xs font-black'
                        : isDark
                        ? 'bg-[#111827] text-slate-300 border-slate-700 hover:bg-slate-800'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Formato das Letras (Bastão vs minúsculas) */}
          <div
            className={`p-4 rounded-2xl border transition-colors ${
              isDark ? 'bg-[#182234] border-slate-700' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className={`flex items-center gap-2 text-sm font-bold mb-1 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
              <Type className="w-4 h-4 text-amber-500" />
              <span>Formato das Letras</span>
            </div>
            <p className={`text-xs mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <strong>Letras Bastão (Caixa Alta)</strong> são pedagogicamente comprovadas como ideais para o início da alfabetização e apoio a crianças com dislexia.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playPop();
                  onUpdateSettings({ letterCase: 'uppercase' });
                }}
                className={`py-2 px-3 rounded-xl font-bold text-xs sm:text-sm border-2 cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                  settings.letterCase === 'uppercase'
                    ? 'bg-amber-500 text-white border-amber-600 shadow-2xs font-black'
                    : isDark
                    ? 'bg-[#111827] text-slate-200 border-slate-700 hover:bg-slate-800'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50'
                }`}
              >
                {settings.letterCase === 'uppercase' && <Check className="w-3.5 h-3.5" />}
                <span>BASTÃO (MAIÚSCULA)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playPop();
                  onUpdateSettings({ letterCase: 'lowercase' });
                }}
                className={`py-2 px-3 rounded-xl font-bold text-xs sm:text-sm border-2 cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                  settings.letterCase === 'lowercase'
                    ? 'bg-amber-500 text-white border-amber-600 shadow-2xs font-black'
                    : isDark
                    ? 'bg-[#111827] text-slate-200 border-slate-700 hover:bg-slate-800'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50'
                }`}
              >
                {settings.letterCase === 'lowercase' && <Check className="w-3.5 h-3.5" />}
                <span>minúsculas</span>
              </button>
            </div>
          </div>

          {/* 4. Espaçamento Amplo (Dislexia) */}
          <div
            className={`p-4 rounded-2xl border transition-colors ${
              isDark ? 'bg-[#182234] border-slate-700' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-sm font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                  Espaçamento Amplo (Apoio à Dislexia)
                </div>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Aumenta o espaço entre letras e palavras para evitar aglomeração e facilitar a leitura.
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

          {/* 5. Dica Pedagógica */}
          <div
            className={`p-3.5 rounded-2xl border text-xs flex gap-2.5 ${
              isDark
                ? 'bg-indigo-950/60 border-indigo-900/60 text-indigo-200'
                : 'bg-amber-50/70 border-amber-200 text-amber-950'
            }`}
          >
            <Info className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isDark ? 'text-indigo-400' : 'text-amber-700'}`} />
            <div>
              <strong className="block font-bold mb-0.5">Orientações para Pais e Educadores:</strong>
              Reserve de 10 a 15 minutos diários de estudo com a criança. O reforço positivo e a escuta paciente dos sons formam a base mais sólida da alfabetização.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`pt-4 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <button
            type="button"
            onClick={() => {
              soundEngine.playPop();
              onClose();
            }}
            className="w-full py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-sm cursor-pointer transition-colors"
          >
            Concluir e Salvar
          </button>
        </div>
      </motion.div>
    </div>
  );
};
