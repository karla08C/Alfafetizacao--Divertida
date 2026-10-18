export type LetterCase = 'uppercase' | 'lowercase';

export type GameMode = 'trail' | 'syllables' | 'sounds' | 'rhymes' | 'lab' | 'reading' | 'duel';

export interface SyllableWord {
  id: string;
  word: string; // e.g. "BOLA"
  syllables: string[]; // ["BO", "LA"]
  emoji: string;
  category: string;
  hint: string;
  difficulty: 1 | 2 | 3;
}

export interface SoundQuestion {
  id: string;
  promptSyllableOrSound: string; // e.g., "BA"
  promptAudioText: string;
  options: {
    word: string;
    syllables: string[];
    emoji: string;
    isCorrect: boolean;
  }[];
  explanation: string;
}

export interface DuelQuestion {
  id: string;
  initialSound: string; // e.g. "BO"
  audioPrompt: string; // e.g. "Qual palavra começa com BO?"
  optionA: {
    word: string;
    emoji: string;
    syllables: string[];
    isCorrect: boolean;
  };
  optionB: {
    word: string;
    emoji: string;
    syllables: string[];
    isCorrect: boolean;
  };
  explanation: string;
}

export interface RhymeQuestion {
  id: string;
  targetWord: string;
  targetEmoji: string;
  rhymeEnding: string; // e.g. "ÃO"
  options: {
    word: string;
    emoji: string;
    isCorrect: boolean;
  }[];
}

export interface ReadingSentence {
  id: string;
  title: string;
  coverEmoji: string;
  words: {
    text: string;
    syllables: string[];
  }[];
  illustration: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  targetCount: number;
  currentCount: number;
}

export interface DailyStudyStats {
  date: string; // YYYY-MM-DD
  totalStudySeconds: number;
  practicedSyllables: Record<string, number>;
  totalActivitiesDone: number;
}

export interface UserProgress {
  stars: number;
  completedWordsCount: number;
  consecutiveCorrect: number;
  bestStreak: number;
  unlockedStickers: string[];
  level: number;
}

export interface AppSettings {
  letterCase: LetterCase;
  speechRate: number; // 0.7 to 1.1
  dyslexiaFontMode: boolean;
  soundEffectsEnabled: boolean;
  voiceEnabled: boolean;
  darkMode: boolean;
  preferredVoiceURI?: string;
}

export interface DayRoutinePlan {
  dayOfWeek: number; // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
  dayName: string;
  shortName: string;
  focusArea: string;
  recommendedMinutes: number;
  recommendedMode: GameMode;
  title: string;
  description: string;
  pedagogicalTip: string;
  suggestedActivities: string[];
}

export type TrailMissionType =
  | 'vowels'
  | 'syllables_simple'
  | 'sounds'
  | 'rhymes'
  | 'words_build'
  | 'duel'
  | 'story_reading'
  | 'graduation';

export interface TrailMission {
  id: string;
  order: number;
  worldId: string;
  worldTitle: string;
  worldEmoji: string;
  title: string;
  subtitle: string;
  description: string;
  pedagogicalGoal: string;
  targetMode: GameMode;
  missionType: TrailMissionType;
  icon: string;
  starsReward: number;
  instructionVoiceText: string;
  targetFocus?: string; // e.g. "A-E-I-O-U" or "BA, BE, BI, BO, BU"
  targetId?: string;
  targetWordId?: string;
  targetQuestionId?: string;
  targetStoryId?: string;
}

export interface TrailProgress {
  completedMissionIds: string[];
  currentMissionId: string;
  unlockedAllForTesting: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string; // Emoji character e.g. '🦁', '🦉', '🦊', '🦄', '🦖', '🐼'
  avatarBg: string; // Tailwind gradient CSS class
  levelTitle: string; // e.g. "Explorador da Leitura", "Detetive de Sílabas"
  ageGroup?: string; // e.g. "4-5 anos", "6-7 anos", "8+ anos"
  streakDays: number; // Daily study streak flame 🔥
  lastActiveDate: string; // YYYY-MM-DD
  createdAt: string;
  progress: UserProgress;
  trailProgress: TrailProgress;
  dailyStats: DailyStudyStats;
  badges: Badge[];
}


