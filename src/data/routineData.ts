import { DayRoutinePlan } from '../types';

export const WEEKLY_STUDY_ROUTINE: DayRoutinePlan[] = [
  {
    dayOfWeek: 1, // Segunda-feira
    dayName: 'Segunda-feira',
    shortName: 'Seg',
    title: 'Consciência Fonológica & Sons Iniciais',
    focusArea: 'Sons das Letras e Vogais',
    recommendedMinutes: 15,
    recommendedMode: 'sounds',
    description: 'Identificar auditivamente o som inicial das palavras e fixar as cinco vogais (A, E, I, O, U).',
    pedagogicalTip: 'Brinque de detetive de sons em casa: "Qual objeto da cozinha começa com o som da letra A?"',
    suggestedActivities: [
      'Escutar o som limpinho das 5 vogais',
      'Acertar 3 desafios no Detetive dos Sons',
      'Ganhar 3 estrelas na Trilha',
    ],
  },
  {
    dayOfWeek: 2, // Terça-feira
    dayName: 'Terça-feira',
    shortName: 'Ter',
    title: 'Fábrica de Sílabas & Famílias Simples',
    focusArea: 'Junção Silábica (B, P, M, D, T)',
    recommendedMinutes: 15,
    recommendedMode: 'lab',
    description: 'Juntar consoantes com vogais para compreender que a escrita representa pedaços sonoros da fala.',
    pedagogicalTip: 'Bata palminhas cadenciadas a cada sílaba formada: B + A = BA (1 palma)!',
    suggestedActivities: [
      'Experimentar 4 combinações na Fábrica de Sílabas',
      'Ouvir a pronúncia lenta e a junção da palavra',
      'Completar uma missão no Vale das Sílabas',
    ],
  },
  {
    dayOfWeek: 3, // Quarta-feira
    dayName: 'Quarta-feira',
    shortName: 'Qua',
    title: 'Caça-Rimas & Musicalidade',
    focusArea: 'Percepção de Sons Finais (Rimas)',
    recommendedMinutes: 15,
    recommendedMode: 'rhymes',
    description: 'Descobrir palavras que terminam com o mesmo som, desenvolvendo a sensibilidade fonológica poética.',
    pedagogicalTip: 'Cante pequenas parlendas ou cantigas de roda infantis destacando as rimas no final dos versos.',
    suggestedActivities: [
      'Descobrir quem rima com GATO, BOLA e JANELA',
      'Manter uma sequência de 3 acertos seguidos',
      'Ouvir os sons das terminações das palavras',
    ],
  },
  {
    dayOfWeek: 4, // Quinta-feira
    dayName: 'Quinta-feira',
    shortName: 'Qui',
    title: 'Montagem Ativa de Palavras',
    focusArea: 'Construção Silábica (CV-CV)',
    recommendedMinutes: 15,
    recommendedMode: 'syllables',
    description: 'Organizar as sílabas móveis na ordem correta para decodificar e ler palavras completas.',
    pedagogicalTip: 'Incentive a leitura da esquerda para a direita, deslizando o dedo por baixo de cada sílaba.',
    suggestedActivities: [
      'Montar com sucesso 3 palavras no Quebra-Cabeça',
      'Escutar a leitura sintetizada de cada palavra',
      'Desbloquear uma nova figurinha para o painel',
    ],
  },
  {
    dayOfWeek: 5, // Sexta-feira
    dayName: 'Sexta-feira',
    shortName: 'Sex',
    title: 'Duelo Fonético & Discriminação Auditiva',
    focusArea: 'Pares Mínimos & Agilidade',
    recommendedMinutes: 15,
    recommendedMode: 'duel',
    description: 'Diferenciar sons semelhantes e pares mínimos com tomada de decisão rápida e divertida.',
    pedagogicalTip: 'Não apresse a criança. O objetivo é a escuta atenta dos detalhes de cada som pronunciado.',
    suggestedActivities: [
      'Completar uma rodada de 5 duelos sonoros',
      'Identificar a diferença entre sons parecidos',
      'Avançar para a próxima etapa na Trilha da Leitura',
    ],
  },
  {
    dayOfWeek: 6, // Sábado
    dayName: 'Sábado',
    shortName: 'Sáb',
    title: 'Leitura Guiada de Frases & Histórias',
    focusArea: 'Fluência & Compreensão Leitora',
    recommendedMinutes: 20,
    recommendedMode: 'reading',
    description: 'Acompanhar histórias ilustradas com destaque palavra por palavra e narração de apoio.',
    pedagogicalTip: 'Após ouvir a história, peça para a criança recontar com suas próprias palavras o que aconteceu.',
    suggestedActivities: [
      'Acompanhar a história "O Gato Pula"',
      'Ler junto com a voz do narrador no seu ritmo',
      'Concluir uma historinha inteira',
    ],
  },
  {
    dayOfWeek: 0, // Domingo
    dayName: 'Domingo',
    shortName: 'Dom',
    title: 'Celebração Semanal & Trilha Livre',
    focusArea: 'Revisão Lúdica & Painel de Medalhas',
    recommendedMinutes: 10,
    recommendedMode: 'trail',
    description: 'Momento de orgulho e celebração das conquistas semanais com a família e prática livre na Trilha.',
    pedagogicalTip: 'Abra o Resumo dos Pais com a criança e elogiem juntos quantas sílabas e minutos foram estudados!',
    suggestedActivities: [
      'Visitar o Painel de Medalhas para ver troféus',
      'Praticar uma fase favorita da Trilha da Leitura',
      'Comemorar as estrelas ganhas na semana',
    ],
  },
];

export const getTodayRoutinePlan = (): DayRoutinePlan => {
  const currentDayOfWeek = new Date().getDay(); // 0 a 6
  return (
    WEEKLY_STUDY_ROUTINE.find(r => r.dayOfWeek === currentDayOfWeek) ||
    WEEKLY_STUDY_ROUTINE[0]
  );
};
