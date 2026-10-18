# Alfabetização Divertida

Plataforma educacional interativa de apoio pedagógico e incentivo à leitura, integrando gamificação estruturada, consciência fonológica, divisão silábica e inteligência artificial para engajamento no aprendizado infantil.

---

## Visão do Produto

O **Alfabetização Divertida** foi concebido para transformar a jornada de alfabetização e letramento em uma experiência dinâmica, acessível e estimulante. A plataforma combina diretrizes pedagógicas de consciência fonológica com mecânicas de jogos educativos e síntese de voz, permitindo que crianças em fase de alfabetização pratiquem o reconhecimento de fonemas, separação de sílabas e leitura guiada com feedback imediato.

A solução atende tanto o uso autônomo por estudantes quanto o acompanhamento pedagógico por pais e educadores, contando com recursos de trilha de evolução, cronograma de estudos e emissão de certificado/diploma ao concluir os módulos.

---

## Tecnologias Utilizadas

- **Frontend Core:** React 19, TypeScript, Vite
- **Estilização e UI:** Tailwind CSS v4, Motion (Framer Motion), Lucide React
- **Inteligência Artificial:** Google Gen AI SDK (`@google/genai`) com modelos Gemini
- **Gamificação e Efeitos:** Canvas Confetti, Web Audio API / Speech Synthesis
- **Build & Qualidade:** TypeScript Compiler (`tsc --noEmit`), ESLint
- **Deploy e Hospedagem:** GitHub Pages, GitHub Actions CI/CD

---

## Módulos e Funcionalidades

### 1. Trilha da Leitura (Literacy Trail)
Jornada de aprendizado estruturada em etapas sequenciais com desbloqueio gradual de níveis, garantindo progressão pedagógica do nível básico ao avançado.

### 2. Laboratório de Sílabas (Syllable Lab)
Módulo interativo para experimentação de fonemas, união de blocos silábicos e compreensão visual e auditiva da estrutura das palavras.

### 3. Jogos de Consciência Fonológica
- **Jogo do Som Inicial:** Identificação da letra e som de abertura de objetos e palavras.
- **Quebra-cabeça de Sílabas:** Associação de partes de palavras a figuras correspondentes.
- **Jogo de Rimas:** Exercícios para identificação de sons finais e padrões de rima.
- **Duelo Fonético:** Dinâmica rápida para fixação de padrões sonoros.

### 4. Livro com Leitura Guiada (Read Along Book)
Leitura de histórias com suporte a narração por voz (Text-to-Speech), permitindo que a criança acompanhe o texto em sincronia com o áudio, acelerando a assimilação da leitura fluida.

### 5. Gamificação e Gestão de Estudos
- **Quadro de Medalhas e Conquistas:** Incentivo contínuo através de insígnias conquistadas por dedicação e acertos.
- **Cronograma de Estudos:** Organização de metas diárias de prática.
- **Mascote Interativo:** Assistente virtual lúdico que fornece dicas e encoraja a criança durante os desafios.

---

## Arquitetura de Software

```
src/
├── components/          # Componentes modulares da interface
│   ├── LiteracyTrail.tsx       # Trilha de aprendizado gamificada
│   ├── SyllableLab.tsx         # Laboratório de divisão e formação silábica
│   ├── ReadAlongBook.tsx       # Livro interativo com suporte à narração
│   ├── InitialSoundGame.tsx    # Jogo pedagógico de som inicial
│   ├── SyllablePuzzleGame.tsx  # Quebra-cabeça interativo de sílabas
│   ├── RhymeGame.tsx           # Desafios de associação por rimas
│   ├── PhoneticDuelGame.tsx    # Dinâmica rápida de desafios fonéticos
│   ├── Mascot.tsx              # Assistente interativo da plataforma
│   ├── BadgesModal.tsx         # Sistema de medalhas e recompensas
│   ├── StudyScheduleModal.tsx  # Planejamento e rotina de estudos
│   └── Header.tsx              # Barra de navegação e status do estudante
├── data/                # Conteúdos estáticos e conjuntos de palavras
├── utils/               # Utilitários de áudio, voz e lógica auxiliar
├── types.ts             # Definições de tipos e interfaces TypeScript
├── App.tsx              # Orquestrador central e gerenciamento de estado
└── main.tsx             # Ponto de entrada da aplicação React
```

---

## Execução Local

### Pré-requisitos
- Node.js (versão 18 ou superior)
- Gerenciador de pacotes npm, yarn ou bun

### Passo a passo
1. Clone o repositório:
```bash
git clone https://github.com/karla08C/Alfafetizacao--Divertida.git
cd Alfafetizacao--Divertida
```

2. Instale as dependências:
```bash
npm install
```

3. (Opcional) Configure a chave do Google Gemini para recursos com IA:
```bash
cp .env.example .env
# Adicione sua chave GEMINI_API_KEY no arquivo .env
```

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

5. Para gerar a versão de produção:
```bash
npm run build
```

---

## Demonstração ao Vivo

A aplicação está disponível e hospedada via GitHub Pages:
- **URL da Aplicação:** [karla08c.github.io/Alfafetizacao--Divertida](https://karla08c.github.io/Alfafetizacao--Divertida/)
