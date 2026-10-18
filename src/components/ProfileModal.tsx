import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Users,
  UserPlus,
  Flame,
  Star,
  Trophy,
  Check,
  Edit2,
  Trash2,
  Sparkles,
  Award,
  Calendar,
  ChevronRight,
  GraduationCap,
  ArrowRight,
} from 'lucide-react';
import { UserProfile } from '../types';
import { soundEngine } from '../utils/audio';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: UserProfile[];
  activeProfileId: string;
  onSelectProfile: (profileId: string) => void;
  onCreateProfile: (newProfile: Omit<UserProfile, 'id' | 'createdAt' | 'progress' | 'trailProgress' | 'dailyStats' | 'badges'>) => void;
  onUpdateProfile: (profileId: string, updates: Partial<UserProfile>) => void;
  onDeleteProfile: (profileId: string) => void;
  darkMode: boolean;
}

const AVAILABLE_AVATARS = [
  { emoji: '🦁', label: 'Leãozinho', defaultBg: 'from-amber-400 to-orange-500' },
  { emoji: '🦉', label: 'Corujinha', defaultBg: 'from-blue-400 to-indigo-500' },
  { emoji: '🦊', label: 'Raposinha', defaultBg: 'from-orange-400 to-rose-500' },
  { emoji: '🦄', label: 'Unicórnio', defaultBg: 'from-pink-400 to-purple-500' },
  { emoji: '🦖', label: 'Dinossauro', defaultBg: 'from-emerald-400 to-teal-500' },
  { emoji: '🐼', label: 'Pandinha', defaultBg: 'from-teal-400 to-emerald-600' },
  { emoji: '🐸', label: 'Sapinho', defaultBg: 'from-lime-400 to-emerald-500' },
  { emoji: '🚀', label: 'Astronauta', defaultBg: 'from-indigo-400 to-sky-600' },
  { emoji: '🐶', label: 'Cachorrinho', defaultBg: 'from-amber-500 to-yellow-600' },
  { emoji: '🐱', label: 'Gatinho', defaultBg: 'from-rose-400 to-pink-500' },
  { emoji: '🐵', label: 'Macaquinho', defaultBg: 'from-yellow-500 to-amber-600' },
  { emoji: '🌟', label: 'Estrelinha', defaultBg: 'from-yellow-400 to-amber-500' },
];

const AVAILABLE_COLORS = [
  { id: 'from-amber-400 to-orange-500', name: 'Sol Dourado', preview: 'bg-amber-400' },
  { id: 'from-sky-400 to-blue-500', name: 'Céu Azul', preview: 'bg-sky-400' },
  { id: 'from-emerald-400 to-teal-500', name: 'Floresta Verde', preview: 'bg-emerald-400' },
  { id: 'from-pink-400 to-rose-500', name: 'Rosa Doce', preview: 'bg-pink-400' },
  { id: 'from-purple-400 to-indigo-500', name: 'Magia Roxa', preview: 'bg-purple-400' },
  { id: 'from-orange-400 to-red-500', name: 'Fogo Laranja', preview: 'bg-orange-500' },
];

const LEVEL_OPTIONS = [
  { id: 'Explorador das Vogais', label: 'Iniciando nas Vogais (4 a 5 anos)', focus: 'A-E-I-O-U' },
  { id: 'Detetive de Sílabas', label: 'Juntando Sílabas (5 a 6 anos)', focus: 'BA, CA, DA...' },
  { id: 'Mestre da Leitura', label: 'Lendo Palavras e Textos (6 a 7 anos)', focus: 'Frases e Histórias' },
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profiles,
  activeProfileId,
  onSelectProfile,
  onCreateProfile,
  onUpdateProfile,
  onDeleteProfile,
  darkMode,
}) => {
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);

  // Form fields
  const [formName, setFormName] = useState('');
  const [formAvatar, setFormAvatar] = useState('🦁');
  const [formColor, setFormColor] = useState('from-amber-400 to-orange-500');
  const [formLevel, setFormLevel] = useState('Detetive de Sílabas');
  const [formAgeGroup, setFormAgeGroup] = useState('5 a 6 anos');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];

  // Ranked profiles for Duolingo leaderboard
  const rankedProfiles = [...profiles].sort((a, b) => b.progress.stars - a.progress.stars);

  const startCreate = () => {
    soundEngine.playPop();
    setFormName('');
    setFormAvatar('🦁');
    setFormColor('from-amber-400 to-orange-500');
    setFormLevel('Detetive de Sílabas');
    setFormAgeGroup('5 a 6 anos');
    setErrorMsg('');
    setView('create');
  };

  const startEdit = (profile: UserProfile, e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.playPop();
    setEditingProfileId(profile.id);
    setFormName(profile.name);
    setFormAvatar(profile.avatar);
    setFormColor(profile.avatarBg);
    setFormLevel(profile.levelTitle);
    setFormAgeGroup(profile.ageGroup || '5 a 6 anos');
    setErrorMsg('');
    setView('edit');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setErrorMsg('Por favor, digite o nome da criança.');
      return;
    }

    if (view === 'create') {
      soundEngine.playSuccessChime();
      onCreateProfile({
        name: formName.trim(),
        avatar: formAvatar,
        avatarBg: formColor,
        levelTitle: formLevel,
        ageGroup: formAgeGroup,
        streakDays: 1, // First day starter streak
        lastActiveDate: new Date().toISOString().slice(0, 10),
      });
    } else if (view === 'edit' && editingProfileId) {
      soundEngine.playSuccessChime();
      onUpdateProfile(editingProfileId, {
        name: formName.trim(),
        avatar: formAvatar,
        avatarBg: formColor,
        levelTitle: formLevel,
        ageGroup: formAgeGroup,
      });
    }

    setView('list');
  };

  const handleDelete = (profileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (profiles.length <= 1) {
      alert('Você precisa manter pelo menos 1 perfil ativo.');
      return;
    }
    if (window.confirm('Tem certeza que deseja excluir este perfil de aprendiz? O progresso salvo dele será removido.')) {
      soundEngine.playPop();
      onDeleteProfile(profileId);
      if (view !== 'list') setView('list');
    }
  };

  // Days of week for Duolingo Streak visualization
  const weekDays = [
    { day: 'D', name: 'Dom' },
    { day: 'S', name: 'Seg' },
    { day: 'T', name: 'Ter' },
    { day: 'Q', name: 'Qua' },
    { day: 'Q', name: 'Qui' },
    { day: 'S', name: 'Sex' },
    { day: 'S', name: 'Sáb' },
  ];
  const currentDayOfWeek = new Date().getDay(); // 0-6

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`w-full max-w-xl rounded-3xl border shadow-2xl relative overflow-hidden flex flex-col max-h-[92vh] ${
          darkMode
            ? 'bg-[#0f172a] border-slate-800 text-slate-100'
            : 'bg-white border-amber-200 text-slate-800'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`p-4 sm:p-5 border-b flex items-center justify-between shrink-0 ${
            darkMode
              ? 'bg-[#1e293b] border-slate-800'
              : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-600'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-xl shadow-xs">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black leading-tight text-white flex items-center gap-1.5">
                <span>Perfis de Aprendizes</span>
                <span className="text-2xs uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full font-bold">
                  Estilo Duolingo
                </span>
              </h2>
              <p className="text-xs text-white/80 leading-tight">
                {view === 'list' && 'Quem vai aprender e se divertir agora?'}
                {view === 'create' && 'Cadastrar nova criança ou aluno'}
                {view === 'edit' && 'Editar dados do perfil'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundEngine.playPop();
              onClose();
            }}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {view === 'list' ? (
            <>
              {/* Active Profile Duolingo Hero Card */}
              {activeProfile && (
                <div
                  className={`p-4 sm:p-5 rounded-2xl border-2 relative overflow-hidden shadow-sm ${
                    darkMode
                      ? 'bg-[#182234] border-amber-500/40 text-slate-100'
                      : 'bg-gradient-to-br from-amber-50/90 to-orange-50/90 border-amber-300 text-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3.5 sm:gap-4 text-center sm:text-left">
                    {/* Big Avatar */}
                    <div className="relative shrink-0">
                      <div
                        className={`w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr ${activeProfile.avatarBg} flex items-center justify-center text-4xl sm:text-5xl shadow-md border-3 border-white dark:border-slate-800 select-none animate-bounce`}
                      >
                        {activeProfile.avatar}
                      </div>
                      <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1 border-2 border-white dark:border-slate-900 shadow-xs" title="Perfil ativo agora">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-center sm:justify-start gap-2">
                        <h3 className="text-lg sm:text-xl font-black truncate">{activeProfile.name}</h3>
                        <span className="px-2 py-0.5 rounded-full text-2xs font-extrabold uppercase tracking-wider bg-emerald-500 text-white">
                          Ativo Agora
                        </span>
                      </div>
                      <p className="text-xs text-amber-700 dark:text-amber-400 font-bold mt-0.5">
                        {activeProfile.levelTitle} {activeProfile.ageGroup ? `• ${activeProfile.ageGroup}` : ''}
                      </p>

                      {/* Duolingo Streak & Stars summary */}
                      <div className="flex items-center justify-center sm:justify-start gap-3 mt-2.5">
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-600 dark:text-orange-400 font-black text-xs">
                          <Flame className="w-4 h-4 fill-orange-500 text-orange-500 animate-pulse" />
                          <span>{activeProfile.streakDays || 1} dias de ofensiva!</span>
                        </div>

                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-black text-xs">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                          <span>{activeProfile.progress.stars} estrelas</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Duolingo Week Flame Tracker */}
                  <div className="mt-4 pt-3.5 border-t border-amber-200/60 dark:border-slate-700/60">
                    <div className="flex items-center justify-between text-2xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      <span className="flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-orange-500" />
                        <span>Ofensiva da Semana</span>
                      </span>
                      <span className="text-orange-500 font-black">
                        Estude hoje para manter o fogo aceso! 🔥
                      </span>
                    </div>

                    <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center">
                      {weekDays.map((wd, i) => {
                        const isPastOrToday = i <= currentDayOfWeek;
                        const isToday = i === currentDayOfWeek;
                        return (
                          <div
                            key={wd.name}
                            className={`p-1.5 sm:p-2 rounded-xl border flex flex-col items-center gap-0.5 ${
                              isToday
                                ? 'bg-orange-500 text-white border-orange-600 shadow-xs font-black'
                                : isPastOrToday
                                ? 'bg-orange-100/70 dark:bg-orange-950/40 border-orange-300 dark:border-orange-800 text-orange-800 dark:text-orange-300 font-bold'
                                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-400'
                            }`}
                          >
                            <span className="text-2xs">{wd.name}</span>
                            <Flame
                              className={`w-3.5 h-3.5 ${
                                isToday
                                  ? 'fill-amber-300 text-amber-300 animate-pulse'
                                  : isPastOrToday
                                  ? 'fill-orange-500 text-orange-500'
                                  : 'text-slate-300 dark:text-slate-600'
                              }`}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Leaderboard / List of all children */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <span>Placar da Turma ({profiles.length} cadastrados)</span>
                  </h4>

                  <button
                    type="button"
                    onClick={startCreate}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-xs flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ Nova Criança</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {rankedProfiles.map((profile, rankIdx) => {
                    const isActive = profile.id === activeProfileId;
                    const rankMedal =
                      rankIdx === 0 ? '🥇' : rankIdx === 1 ? '🥈' : rankIdx === 2 ? '🥉' : `#${rankIdx + 1}`;

                    return (
                      <div
                        key={profile.id}
                        onClick={() => {
                          if (!isActive) {
                            soundEngine.playSuccessChime();
                            onSelectProfile(profile.id);
                          }
                        }}
                        className={`p-3 rounded-2xl border-2 flex items-center justify-between gap-2.5 transition-all cursor-pointer ${
                          isActive
                            ? 'bg-amber-500/10 border-amber-500 dark:border-amber-400 shadow-xs'
                            : darkMode
                            ? 'bg-[#182234] border-slate-800 hover:border-slate-700 hover:bg-slate-800'
                            : 'bg-white border-slate-200 hover:border-amber-300 hover:bg-amber-50/50 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {/* Rank badge */}
                          <span className="text-sm sm:text-base font-black w-6 text-center shrink-0">
                            {rankMedal}
                          </span>

                          {/* Avatar */}
                          <div
                            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr ${profile.avatarBg} flex items-center justify-center text-2xl sm:text-3xl shadow-xs shrink-0 select-none`}
                          >
                            {profile.avatar}
                          </div>

                          {/* Name & Details */}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h5 className="font-black text-xs sm:text-sm truncate">{profile.name}</h5>
                              {isActive && (
                                <span className="text-2xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded-md">
                                  Ativo
                                </span>
                              )}
                            </div>
                            <p className="text-2xs text-slate-500 dark:text-slate-400 truncate">
                              {profile.levelTitle}
                            </p>
                          </div>
                        </div>

                        {/* Right stats & actions */}
                        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                          <div className="text-right">
                            <div className="flex items-center justify-end gap-1 font-black text-xs sm:text-sm text-amber-500">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                              <span>{profile.progress.stars}</span>
                            </div>
                            <div className="flex items-center justify-end gap-1 text-2xs font-bold text-orange-500">
                              <Flame className="w-3 h-3 fill-orange-500 text-orange-500" />
                              <span>{profile.streakDays || 1}d</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 border-l pl-2 border-slate-200 dark:border-slate-700">
                            <button
                              type="button"
                              onClick={(e) => startEdit(profile, e)}
                              className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                              title="Editar este perfil"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {profiles.length > 1 && (
                              <button
                                type="button"
                                onClick={(e) => handleDelete(profile.id, e)}
                                className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950 text-slate-400 hover:text-rose-600 transition-colors"
                                title="Excluir este perfil"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            /* Create / Edit Form */
            <form onSubmit={handleSaveProfile} className="space-y-4">
              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs font-bold">
                  {errorMsg}
                </div>
              )}

              {/* Name Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                  Nome da Criança ou Aluno:
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ex: Sofia, Miguel, Alice..."
                  maxLength={24}
                  className={`w-full px-4 py-2.5 rounded-2xl border text-sm font-bold outline-none transition-all ${
                    darkMode
                      ? 'bg-slate-800 border-slate-700 text-white focus:border-amber-400'
                      : 'bg-slate-50 border-slate-300 text-slate-800 focus:border-amber-500'
                  }`}
                  autoFocus
                />
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                  Escolha o Mascote Favorito:
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {AVAILABLE_AVATARS.map((av) => {
                    const isSelected = formAvatar === av.emoji;
                    return (
                      <button
                        key={av.emoji}
                        type="button"
                        onClick={() => {
                          soundEngine.playPop();
                          setFormAvatar(av.emoji);
                        }}
                        className={`p-2 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-100 dark:bg-amber-950 border-amber-500 scale-105 shadow-md'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-amber-300'
                        }`}
                      >
                        <span className="text-3xl select-none">{av.emoji}</span>
                        <span className="text-[10px] font-bold truncate max-w-full">{av.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Theme Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                  Cor de Fundo Favorita:
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {AVAILABLE_COLORS.map((c) => {
                    const isSelected = formColor === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          soundEngine.playPop();
                          setFormColor(c.id);
                        }}
                        className={`p-2 rounded-xl border flex items-center gap-1.5 cursor-pointer transition-all ${
                          isSelected
                            ? 'ring-2 ring-amber-500 border-amber-500 bg-amber-50 dark:bg-slate-800'
                            : 'border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full ${c.preview} shrink-0`} />
                        <span className="text-2xs font-bold truncate">{c.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Reading Stage / Age */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                  Fase de Alfabetização:
                </label>
                <div className="space-y-1.5">
                  {LEVEL_OPTIONS.map((lvl) => {
                    const isSelected = formLevel === lvl.id;
                    return (
                      <div
                        key={lvl.id}
                        onClick={() => {
                          soundEngine.playPop();
                          setFormLevel(lvl.id);
                        }}
                        className={`p-2.5 rounded-xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500 dark:border-amber-400'
                            : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold">{lvl.label}</div>
                          <div className="text-2xs text-slate-500 dark:text-slate-400">Foco: {lvl.focus}</div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-amber-500 stroke-[3]" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playPop();
                    setView('list');
                  }}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Voltar
                </button>

                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{view === 'create' ? 'Cadastrar e Começar!' : 'Salvar Alterações'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
