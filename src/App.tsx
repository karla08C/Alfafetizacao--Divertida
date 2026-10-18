import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Map, CheckCircle2, Sparkles, ArrowRight, Play, Star, Calendar, GraduationCap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { Mascot } from './components/Mascot';
import { LiteracyTrail } from './components/LiteracyTrail';
import { SyllablePuzzleGame } from './components/SyllablePuzzleGame';
import { InitialSoundGame } from './components/InitialSoundGame';
import { RhymeGame } from './components/RhymeGame';
import { SyllableLab } from './components/SyllableLab';
import { ReadAlongBook } from './components/ReadAlongBook';
import { PhoneticDuelGame } from './components/PhoneticDuelGame';
import { BadgesModal } from './components/BadgesModal';
import { SettingsModal } from './components/SettingsModal';
import { StudyScheduleModal } from './components/StudyScheduleModal';
import {
  SYLLABLE_WORDS,
  SOUND_QUESTIONS,
  RHYME_QUESTIONS,
  READING_STORIES,
  INITIAL_BADGES,
  DUEL_QUESTIONS,
} from './data/literacyData';
import { TRAIL_MISSIONS } from './data/trailData';
import {
  GameMode,
  UserProgress,
  AppSettings,
  Badge,
  SyllableWord,
  DailyStudyStats,
  TrailMission,
  TrailProgress,
} from './types';
import { soundEngine } from './utils/audio';

const STORAGE_KEY_PROGRESS = 'alfabetizacao_progress_v1';
const STORAGE_KEY_SETTINGS = 'alfabetizacao_settings_v1';
const STORAGE_KEY_BADGES = 'alfabetizacao_badges_v1';
const STORAGE_KEY_DAILY_STATS = 'alfabetizacao_daily_stats_v1';
const STORAGE_KEY_TRAIL = 'alfabetizacao_trail_v1';

const getTodayDateKey = () => new Date().toISOString().slice(0, 10);

export default function App() {
  // Game Mode: Defaults to the guided pedagogical trail!
  const [currentMode, setCurrentMode] = useState<GameMode>('trail');

  // Active mission when playing directly from the trail
  const [activeTrailMission, setActiveTrailMission] = useState<TrailMission | null>(null);

  // Mission Completed celebration modal state
  const [completedMissionModal, setCompletedMissionModal] = useState<{
    mission: TrailMission;
    nextMission?: TrailMission;
  } | null>(null);

  // Trail Progress state
  const [trailProgress, setTrailProgress] = useState<TrailProgress>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TRAIL);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      completedMissionIds: [],
      currentMissionId: TRAIL_MISSIONS[0].id,
      unlockedAllForTesting: false,
    };
  });

  // User Progress state with LocalStorage recovery
  const [progress, setProgress] = useState<UserProgress>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROGRESS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      stars: 5, // initial friendly gift
      completedWordsCount: 0,
      consecutiveCorrect: 0,
      bestStreak: 0,
      unlockedStickers: [],
      level: 1,
    };
  });

  // Daily Study Stats for parents tracking
  const [dailyStats, setDailyStats] = useState<DailyStudyStats>(() => {
    const today = getTodayDateKey();
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DAILY_STATS);
      if (saved) {
        const parsed: DailyStudyStats = JSON.parse(saved);
        if (parsed.date === today) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return {
      date: today,
      totalStudySeconds: 180, // 3 minutes baseline for positive initial display
      practicedSyllables: {
        BO: 4,
        LA: 4,
        CA: 3,
        SA: 3,
        PA: 2,
      },
      totalActivitiesDone: 3,
    };
  });

  // Badges state
  const [badges, setBadges] = useState<Badge[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BADGES);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_BADGES;
  });

  // Accessibility and pedagogical settings
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      letterCase: 'uppercase', // Uppercase is pedagogically proven best for early reading & dyslexia
      speechRate: 0.85, // Slower, clearer cadence
      dyslexiaFontMode: false,
      soundEffectsEnabled: true,
      voiceEnabled: true,
      darkMode: false,
    };
  });

  // Mascot dialogue & mood state
  const [mascotMood, setMascotMood] = useState<'happy' | 'thinking' | 'celebrating' | 'encouraging'>('happy');
  const [mascotMessage, setMascotMessage] = useState<string>(
    'Olá! Eu sou o Pipoca. Vamos brincar de ler juntos? Escolha um jogo acima!'
  );
  const [mascotHint, setMascotHint] = useState<string | undefined>(undefined);

  // Modals
  const [isBadgesOpen, setIsBadgesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRoutineOpen, setIsRoutineOpen] = useState(false);

  // Sync dark class on document.documentElement for global Tailwind dark mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', Boolean(settings.darkMode));
  }, [settings.darkMode]);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(progress));
    } catch {
      // ignore
    }
  }, [progress]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_BADGES, JSON.stringify(badges));
    } catch {
      // ignore
    }
  }, [badges]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  // Active daily study time tracking (increments when tab is active)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!document.hidden) {
        setDailyStats(prev => {
          const today = getTodayDateKey();
          const isSameDay = prev.date === today;
          const nextSec = (isSameDay ? prev.totalStudySeconds : 0) + 1;
          const updated: DailyStudyStats = {
            date: today,
            totalStudySeconds: nextSec,
            practicedSyllables: isSameDay ? prev.practicedSyllables : {},
            totalActivitiesDone: isSameDay ? prev.totalActivitiesDone : 0,
          };
          if (nextSec % 10 === 0) {
            try {
              localStorage.setItem(STORAGE_KEY_DAILY_STATS, JSON.stringify(updated));
            } catch {
              // ignore
            }
          }
          return updated;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const recordPracticedSyllables = (syllables: string[]) => {
    if (!syllables || syllables.length === 0) return;
    setDailyStats(prev => {
      const updatedSyllables = { ...prev.practicedSyllables };
      syllables.forEach(s => {
        const upper = s.toUpperCase().trim();
        if (upper) {
          updatedSyllables[upper] = (updatedSyllables[upper] || 0) + 1;
        }
      });
      const updated: DailyStudyStats = {
        ...prev,
        practicedSyllables: updatedSyllables,
        totalActivitiesDone: prev.totalActivitiesDone + 1,
      };
      try {
        localStorage.setItem(STORAGE_KEY_DAILY_STATS, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  // Check and unlock badges helper
  const checkBadges = (updatedProgress: UserProgress) => {
    setBadges(prev =>
      prev.map(b => {
        let newCount = b.currentCount;
        if (b.id === 'first_word' || b.id === 'syllable_master') {
          newCount = updatedProgress.completedWordsCount;
        } else if (b.id === 'star_collector') {
          newCount = updatedProgress.stars;
        }

        const isNowUnlocked = b.unlocked || newCount >= b.targetCount;
        return {
          ...b,
          currentCount: Math.min(newCount, b.targetCount),
          unlocked: isNowUnlocked,
        };
      })
    );
  };

  // Helper to mark a mission completed and trigger celebration
  const handleCompleteMission = (missionToComplete?: TrailMission) => {
    const target = missionToComplete || activeTrailMission;
    if (!target) return;

    soundEngine.playCelebrationFanfare();
    try {
      confetti({
        particleCount: 80,
        spread: 75,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    const currentIndex = TRAIL_MISSIONS.findIndex(m => m.id === target.id);
    const nextMission = TRAIL_MISSIONS[currentIndex + 1];

    setTrailProgress(prev => {
      const isAlready = prev.completedMissionIds.includes(target.id);
      const newCompleted = isAlready ? prev.completedMissionIds : [...prev.completedMissionIds, target.id];
      const updated: TrailProgress = {
        ...prev,
        completedMissionIds: newCompleted,
        currentMissionId: nextMission ? nextMission.id : target.id,
      };
      try {
        localStorage.setItem(STORAGE_KEY_TRAIL, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    setProgress(prev => {
      const nextStars = prev.stars + target.starsReward;
      const updated = { ...prev, stars: nextStars };
      checkBadges(updated);
      return updated;
    });

    setCompletedMissionModal({
      mission: target,
      nextMission,
    });
  };

  const handleToggleUnlockAllTrail = () => {
    soundEngine.playPop();
    setTrailProgress(prev => {
      const updated: TrailProgress = {
        ...prev,
        unlockedAllForTesting: !prev.unlockedAllForTesting,
      };
      try {
        localStorage.setItem(STORAGE_KEY_TRAIL, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleResetTrail = () => {
    soundEngine.playPop();
    const initial: TrailProgress = {
      completedMissionIds: [],
      currentMissionId: TRAIL_MISSIONS[0].id,
      unlockedAllForTesting: false,
    };
    setTrailProgress(initial);
    try {
      localStorage.setItem(STORAGE_KEY_TRAIL, JSON.stringify(initial));
    } catch {
      // ignore
    }
  };

  const handleLaunchTrailMission = (mission: TrailMission) => {
    soundEngine.playPop();
    setActiveTrailMission(mission);
    setCurrentMode(mission.targetMode);
    handleUpdateMascot(
      'happy',
      `Missão da Trilha: ${mission.title}! ${mission.description}`,
      mission.pedagogicalGoal
    );
  };

  // Gamification rewards for Syllables game
  const handleSuccessWord = (word: SyllableWord) => {
    recordPracticedSyllables(word.syllables);
    setProgress(prev => {
      const nextCount = prev.completedWordsCount + 1;
      const nextStars = prev.stars + 3;
      const nextStreak = prev.consecutiveCorrect + 1;
      const updated: UserProgress = {
        ...prev,
        completedWordsCount: nextCount,
        stars: nextStars,
        consecutiveCorrect: nextStreak,
        bestStreak: Math.max(prev.bestStreak, nextStreak),
      };
      checkBadges(updated);
      return updated;
    });

    if (activeTrailMission && activeTrailMission.targetMode === 'syllables') {
      handleCompleteMission(activeTrailMission);
    }
  };

  // Rewards for Sounds game
  const handleSuccessSoundQuestion = (syllable?: string) => {
    if (syllable) {
      recordPracticedSyllables([syllable]);
    } else {
      setDailyStats(prev => ({
        ...prev,
        totalActivitiesDone: prev.totalActivitiesDone + 1,
      }));
    }
    setProgress(prev => {
      const nextStars = prev.stars + 2;
      const updated = { ...prev, stars: nextStars };
      setBadges(curr =>
        curr.map(b => (b.id === 'sound_detective' ? { ...b, currentCount: b.currentCount + 1, unlocked: b.currentCount + 1 >= b.targetCount } : b))
      );
      checkBadges(updated);
      return updated;
    });

    if (activeTrailMission && activeTrailMission.targetMode === 'sounds') {
      handleCompleteMission(activeTrailMission);
    }
  };

  // Rewards for Rhymes game
  const handleSuccessRhymeQuestion = () => {
    setDailyStats(prev => ({
      ...prev,
      totalActivitiesDone: prev.totalActivitiesDone + 1,
    }));
    setProgress(prev => {
      const nextStars = prev.stars + 2;
      const updated = { ...prev, stars: nextStars };
      setBadges(curr =>
        curr.map(b => (b.id === 'rhyme_king' ? { ...b, currentCount: b.currentCount + 1, unlocked: b.currentCount + 1 >= b.targetCount } : b))
      );
      checkBadges(updated);
      return updated;
    });

    if (activeTrailMission && activeTrailMission.targetMode === 'rhymes') {
      handleCompleteMission(activeTrailMission);
    }
  };

  // Rewards for Story reading
  const handleStoryCompleted = () => {
    setDailyStats(prev => ({
      ...prev,
      totalActivitiesDone: prev.totalActivitiesDone + 1,
    }));
    setProgress(prev => {
      const nextStars = prev.stars + 5;
      const updated = { ...prev, stars: nextStars };
      setBadges(curr =>
        curr.map(b => (b.id === 'story_reader' ? { ...b, currentCount: 1, unlocked: true } : b))
      );
      checkBadges(updated);
      return updated;
    });

    if (activeTrailMission && activeTrailMission.targetMode === 'reading') {
      handleCompleteMission(activeTrailMission);
    }
  };

  // Rewards for Duel round
  const handleSuccessDuelRound = (bonusStars: number, initialSound?: string) => {
    if (initialSound) {
      recordPracticedSyllables([initialSound]);
    } else {
      setDailyStats(prev => ({
        ...prev,
        totalActivitiesDone: prev.totalActivitiesDone + 1,
      }));
    }
    setProgress(prev => {
      const nextStars = prev.stars + bonusStars;
      const updated = { ...prev, stars: nextStars };
      setBadges(curr =>
        curr.map(b =>
          b.id === 'duel_champion'
            ? { ...b, currentCount: b.currentCount + 1, unlocked: b.currentCount + 1 >= b.targetCount }
            : b
        )
      );
      checkBadges(updated);
      return updated;
    });

    if (activeTrailMission && activeTrailMission.targetMode === 'duel') {
      handleCompleteMission(activeTrailMission);
    }
  };

  // Mascot update handler
  const handleUpdateMascot = (
    mood: 'happy' | 'thinking' | 'celebrating' | 'encouraging',
    message: string,
    hint?: string
  ) => {
    setMascotMood(mood);
    setMascotMessage(message);
    setMascotHint(hint);
  };

  const handleToggleCase = () => {
    setSettings(prev => ({
      ...prev,
      letterCase: prev.letterCase === 'uppercase' ? 'lowercase' : 'uppercase',
    }));
  };

  const handleToggleDarkMode = () => {
    setSettings(prev => ({
      ...prev,
      darkMode: !prev.darkMode,
    }));
  };

  const handleUpdateSettings = (partial: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...partial }));
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 ${
        settings.darkMode
          ? 'app-night-mode bg-[#0A0F1D] text-slate-100'
          : 'bg-[#FDFBF7] text-slate-800'
      } ${settings.dyslexiaFontMode ? 'tracking-wider font-reader' : ''}`}
    >
      {/* Top App Header & Game Switcher */}
      <Header
        currentMode={currentMode}
        onSelectMode={(mode) => {
          setCurrentMode(mode);
          setMascotHint(undefined);
          if (mode === 'trail') {
            handleUpdateMascot('happy', 'Essa é a Trilha da Leitura! Vamos avançar etapa por etapa até o diploma de leitor.');
          } else if (mode === 'syllables') {
            handleUpdateMascot('happy', 'Monte a palavra juntando os pedacinhos na ordem certa!');
          } else if (mode === 'sounds') {
            handleUpdateMascot('thinking', 'Detetive dos Sons! Vamos descobrir qual palavra começa com o som.');
          } else if (mode === 'rhymes') {
            handleUpdateMascot('thinking', 'Caça-Rimas! As rimas terminam com o mesmo sonzinho musical.');
          } else if (mode === 'lab') {
            handleUpdateMascot('happy', 'Fábrica de Sílabas! Escolha uma consoante e uma vogal para ouvir a mágica.');
          } else if (mode === 'reading') {
            handleUpdateMascot('happy', 'Leitura Guiada! Vamos ler uma historinha juntos, palavra por palavra.');
          } else if (mode === 'duel') {
            handleUpdateMascot('thinking', 'Duelo Fonético! Escolha entre as duas palavras antes do tempo acabar!');
          }
        }}
        progress={progress}
        letterCase={settings.letterCase}
        onToggleCase={handleToggleCase}
        onOpenBadges={() => setIsBadgesOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenRoutine={() => setIsRoutineOpen(true)}
        darkMode={settings.darkMode}
        onToggleDarkMode={handleToggleDarkMode}
      />

      {/* Main Educational Workspace */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-2.5 sm:px-6 py-2.5 sm:py-6 flex flex-col gap-3 sm:gap-5">
        {/* Animated Friendly Mascot Companion */}
        <Mascot
          mood={mascotMood}
          message={mascotMessage}
          hintText={mascotHint}
          onHintClick={() => {
            if (mascotHint) {
              soundEngine.speakText(`Dica do Pipoca: ${mascotHint}`, settings.speechRate);
            }
          }}
          voiceEnabled={settings.voiceEnabled}
          speechRate={settings.speechRate}
        />

        {/* Active Trail Mission Header (when playing an activity from the trail) */}
        {activeTrailMission && currentMode !== 'trail' && (
          <div
            className={`w-full p-3.5 px-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 shadow-xs ${
              settings.darkMode
                ? 'bg-amber-950/30 border-amber-800 text-amber-200'
                : 'bg-amber-50 border-amber-300 text-amber-950'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-900 flex items-center justify-center text-lg font-black shrink-0">
                {activeTrailMission.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xs font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                    Missão da Trilha • Etapa {activeTrailMission.order}
                  </span>
                  <span className="text-2xs font-bold text-amber-500 flex items-center gap-0.5">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    +{activeTrailMission.starsReward}
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-black leading-tight">
                  {settings.letterCase === 'uppercase'
                    ? activeTrailMission.title.toUpperCase()
                    : activeTrailMission.title}
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-auto sm:ml-0">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playPop();
                  setCurrentMode('trail');
                }}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  settings.darkMode
                    ? 'bg-indigo-950/80 border-indigo-800 text-indigo-200 hover:bg-indigo-900'
                    : 'bg-white border-amber-200 text-amber-900 hover:bg-amber-100'
                }`}
              >
                <Map className="w-3.5 h-3.5 text-amber-500" />
                <span>Ver Trilha</span>
              </button>

              <button
                type="button"
                onClick={() => handleCompleteMission(activeTrailMission)}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-black text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                title="Concluir esta etapa da trilha e avançar"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Concluir Etapa!</span>
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Activity Area */}
        <div className="w-full flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {currentMode === 'trail' && (
              <motion.div
                key="trail"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="w-full"
              >
                <LiteracyTrail
                  trailProgress={trailProgress}
                  onSelectMission={handleLaunchTrailMission}
                  onToggleUnlockAll={handleToggleUnlockAllTrail}
                  onResetTrail={handleResetTrail}
                  letterCase={settings.letterCase}
                  speechRate={settings.speechRate}
                  voiceEnabled={settings.voiceEnabled}
                  darkMode={settings.darkMode}
                  totalStars={progress.stars}
                  onOpenRoutine={() => setIsRoutineOpen(true)}
                  onSelectMode={setCurrentMode}
                />
              </motion.div>
            )}

            {currentMode === 'syllables' && (
              <motion.div
                key="syllables"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="w-full"
              >
                <SyllablePuzzleGame
                  words={SYLLABLE_WORDS}
                  letterCase={settings.letterCase}
                  speechRate={settings.speechRate}
                  voiceEnabled={settings.voiceEnabled}
                  onSuccessWord={handleSuccessWord}
                  onUpdateMascot={handleUpdateMascot}
                  targetWordId={activeTrailMission?.targetMode === 'syllables' ? activeTrailMission.targetId : undefined}
                />
              </motion.div>
            )}

            {currentMode === 'sounds' && (
              <motion.div
                key="sounds"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="w-full"
              >
                <InitialSoundGame
                  questions={SOUND_QUESTIONS}
                  letterCase={settings.letterCase}
                  speechRate={settings.speechRate}
                  voiceEnabled={settings.voiceEnabled}
                  onSuccessQuestion={handleSuccessSoundQuestion}
                  onUpdateMascot={handleUpdateMascot}
                  targetQuestionId={activeTrailMission?.targetMode === 'sounds' ? activeTrailMission.targetId : undefined}
                />
              </motion.div>
            )}

            {currentMode === 'rhymes' && (
              <motion.div
                key="rhymes"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="w-full"
              >
                <RhymeGame
                  questions={RHYME_QUESTIONS}
                  letterCase={settings.letterCase}
                  speechRate={settings.speechRate}
                  voiceEnabled={settings.voiceEnabled}
                  onSuccessQuestion={handleSuccessRhymeQuestion}
                  onUpdateMascot={handleUpdateMascot}
                  targetQuestionId={activeTrailMission?.targetMode === 'rhymes' ? activeTrailMission.targetId : undefined}
                />
              </motion.div>
            )}

            {currentMode === 'lab' && (
              <motion.div
                key="lab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="w-full"
              >
                <SyllableLab
                  letterCase={settings.letterCase}
                  speechRate={settings.speechRate}
                  voiceEnabled={settings.voiceEnabled}
                  onUpdateMascot={handleUpdateMascot}
                  onPracticeSyllables={recordPracticedSyllables}
                />
              </motion.div>
            )}

            {currentMode === 'reading' && (
              <motion.div
                key="reading"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="w-full"
              >
                <ReadAlongBook
                  stories={READING_STORIES}
                  letterCase={settings.letterCase}
                  speechRate={settings.speechRate}
                  voiceEnabled={settings.voiceEnabled}
                  onStoryCompleted={handleStoryCompleted}
                  onUpdateMascot={handleUpdateMascot}
                  targetStoryId={activeTrailMission?.targetMode === 'reading' ? activeTrailMission.targetId : undefined}
                />
              </motion.div>
            )}

            {currentMode === 'duel' && (
              <motion.div
                key="duel"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="w-full"
              >
                <PhoneticDuelGame
                  questions={DUEL_QUESTIONS}
                  letterCase={settings.letterCase}
                  speechRate={settings.speechRate}
                  voiceEnabled={settings.voiceEnabled}
                  onSuccessDuelRound={handleSuccessDuelRound}
                  onUpdateMascot={handleUpdateMascot}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Mission Celebration Modal */}
      {completedMissionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className={`w-full max-w-md p-6 sm:p-7 rounded-3xl border shadow-2xl relative text-center flex flex-col items-center gap-3.5 ${
              settings.darkMode
                ? 'bg-[#121A30] border-amber-500/50 text-white'
                : 'bg-white border-amber-300 text-slate-800'
            }`}
          >
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-orange-400 flex items-center justify-center text-3xl shadow-lg shadow-amber-400/30 animate-bounce">
              <Sparkles className="w-8 h-8 text-white" />
            </div>

            <div className="flex items-center gap-1.5 text-xs font-black text-amber-500 uppercase tracking-wider">
              <span>Etapa {completedMissionModal.mission.order} Concluída!</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black">
              {settings.letterCase === 'uppercase'
                ? completedMissionModal.mission.title.toUpperCase()
                : completedMissionModal.mission.title}
            </h3>

            <p className="text-sm text-slate-600 dark:text-slate-300">
              Parabéns! Você avançou na Trilha da Leitura e ganhou +
              {completedMissionModal.mission.starsReward} Estrelas douradas!
            </p>

            <div className="flex items-center justify-center gap-1.5 py-1">
              {Array.from({ length: completedMissionModal.mission.starsReward }).map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-amber-400 text-amber-400" />
              ))}
            </div>

            <div className="w-full flex flex-col sm:flex-row items-center gap-2.5 mt-2">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playPop();
                  setCompletedMissionModal(null);
                  setCurrentMode('trail');
                }}
                className="w-full sm:w-1/2 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 font-bold text-xs cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Voltar à Trilha
              </button>

              {completedMissionModal.nextMission ? (
                <button
                  type="button"
                  onClick={() => {
                    const next = completedMissionModal.nextMission!;
                    setCompletedMissionModal(null);
                    handleLaunchTrailMission(next);
                  }}
                  className="w-full sm:w-1/2 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  <span>Próxima Etapa!</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setCompletedMissionModal(null);
                    setCurrentMode('trail');
                  }}
                  className="w-full sm:w-1/2 py-2.5 rounded-2xl bg-emerald-500 text-white font-black text-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Concluir Trilha!</span>
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Pedagogical Footer */}
      <footer className="w-full py-4 border-t border-amber-100/80 dark:border-slate-800 bg-white/50 dark:bg-slate-900/60 text-center text-xs text-slate-400 dark:text-slate-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Alfabetização Divertida • Consciência Fonológica e Apoio à Leitura</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsRoutineOpen(true)}
              className="text-amber-800 dark:text-amber-400 hover:underline cursor-pointer font-medium flex items-center gap-1"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Rotina de Estudos</span>
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="text-amber-800 dark:text-amber-400 hover:underline cursor-pointer font-medium"
            >
              Acessibilidade & Voz
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setIsBadgesOpen(true)}
              className="text-amber-800 dark:text-amber-400 hover:underline cursor-pointer font-medium"
            >
              Medalhas & Resumo dos Pais ({badges.filter(b => b.unlocked).length}/{badges.length})
            </button>
          </div>
        </div>
      </footer>

      {/* Badges Modal & Parents Pedagogical Summary */}
      <BadgesModal
        isOpen={isBadgesOpen}
        onClose={() => setIsBadgesOpen(false)}
        badges={badges}
        totalStars={progress.stars}
        dailyStats={dailyStats}
        letterCase={settings.letterCase}
        speechRate={settings.speechRate}
        darkMode={settings.darkMode}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />

      {/* Study Schedule Modal */}
      <StudyScheduleModal
        isOpen={isRoutineOpen}
        onClose={() => setIsRoutineOpen(false)}
        onSelectMode={setCurrentMode}
        dailyStats={dailyStats}
        totalStars={progress.stars}
        darkMode={settings.darkMode}
      />
    </div>
  );
}
