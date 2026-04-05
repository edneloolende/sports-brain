/**
 * SAMPLE BATCH — 50 global football questions for review.
 * These follow the QUESTION_GUIDELINES.md rules.
 * Review for factual accuracy before integrating into puzzles.
 *
 * IMPORTANT: I am an LLM. Stats, dates, and goal tallies below may contain
 * errors. Please verify any fact you're unsure about before approving.
 */

import type { Question } from '../lib/types'

// ─── WORLD CUP (10) ──────────────────────────────────────────────────────────

export const WORLD_CUP_SAMPLE: Question[] = [
  {
    clue: 'Won three World Cups as a player — 1958, 1962, and 1970',
    answer: 'PELE',
    category: 'player',
    difficulty: 1,
    isProperNoun: true,
  },
  {
    clue: "Scored the 'Goal of the Century' against England at the 1986 World Cup",
    answer: 'MARADONA',
    category: 'player',
    difficulty: 1,
    isProperNoun: true,
  },
  {
    clue: "All-time men's World Cup top scorer with 16 goals",
    answer: 'KLOSE',
    category: 'player',
    difficulty: 3,
    isProperNoun: true,
  },
  {
    clue: 'Scored the winning goal in extra time of the 2010 World Cup final',
    answer: 'INIESTA',
    category: 'player',
    difficulty: 2,
    isProperNoun: true,
  },
  {
    clue: 'Headed two goals in the 1998 World Cup final',
    answer: 'ZIDANE',
    category: 'player',
    difficulty: 2,
    isProperNoun: true,
  },
  {
    clue: 'Led Brazil to World Cup glory in 2002',
    answer: 'SCOLARI',
    category: 'manager',
    difficulty: 4,
    isProperNoun: true,
  },
  {
    clue: 'Scored 13 goals at the 1958 World Cup — a single-tournament record that still stands',
    answer: 'FONTAINE',
    category: 'player',
    difficulty: 4,
    isProperNoun: true,
  },
  {
    clue: 'Won the World Cup as both captain (1974) and manager (1990)',
    answer: 'BECKENBAUER',
    category: 'player',
    difficulty: 3,
    isProperNoun: true,
  },
  {
    clue: "Italy's goalkeeper in the 2006 World Cup-winning squad, named best goalkeeper of the tournament",
    answer: 'BUFFON',
    category: 'player',
    difficulty: 2,
    isProperNoun: true,
  },
  {
    clue: 'Golden Boot winner at the 2022 World Cup with 8 goals, including a hat-trick in the final',
    answer: 'MBAPPE',
    category: 'player',
    difficulty: 2,
    isProperNoun: true,
  },
]

// ─── CHAMPIONS LEAGUE (8) ────────────────────────────────────────────────────

export const CHAMPIONS_LEAGUE_SAMPLE: Question[] = [
  {
    clue: 'Six European Cup wins as a player, all with Real Madrid',
    answer: 'GENTO',
    category: 'player',
    difficulty: 5,
    isProperNoun: true,
  },
  {
    clue: 'Guided Liverpool to three European Cup titles in five seasons',
    answer: 'PAISLEY',
    category: 'manager',
    difficulty: 4,
    isProperNoun: true,
  },
  {
    clue: 'Scored twice for AC Milan before half-time in the 2005 Champions League final',
    answer: 'CRESPO',
    category: 'player',
    difficulty: 4,
    isProperNoun: true,
  },
  {
    clue: 'Led Nottingham Forest to back-to-back European Cup triumphs',
    answer: 'CLOUGH',
    category: 'manager',
    difficulty: 3,
    isProperNoun: true,
  },
  {
    clue: 'Opened the scoring in the 2009 Champions League final for Barcelona',
    answer: 'ETOO',
    category: 'player',
    difficulty: 3,
    isProperNoun: true,
  },
  {
    clue: 'Scored the winning goal in the 2006 Champions League final for Barcelona against Arsenal',
    answer: 'BELLETTI',
    category: 'player',
    difficulty: 5,
    isProperNoun: true,
  },
  {
    clue: "Scored both goals in Inter Milan's 2010 Champions League final victory",
    answer: 'MILITO',
    category: 'player',
    difficulty: 4,
    isProperNoun: true,
  },
  {
    clue: "Barcelona's home — the largest football stadium in Europe",
    answer: 'CAMPNOU',
    category: 'stadium',
    difficulty: 2,
    isProperNoun: true,
  },
]

// ─── LA LIGA (7) ──────────────────────────────────────────────────────────────

export const LA_LIGA_SAMPLE: Question[] = [
  {
    clue: 'All-time La Liga top scorer',
    answer: 'MESSI',
    category: 'player',
    difficulty: 1,
    isProperNoun: true,
  },
  {
    clue: 'Led Real Madrid to five consecutive European Cups from 1956 to 1960',
    answer: 'DISTEFANO',
    category: 'player',
    difficulty: 3,
    isProperNoun: true,
  },
  {
    clue: "Guided Atletico Madrid to the 2013/14 La Liga title, ending Barcelona and Real Madrid's duopoly",
    answer: 'SIMEONE',
    category: 'manager',
    difficulty: 3,
    isProperNoun: true,
  },
  {
    clue: 'Won the World Cup, two European Championships, and three Champions League titles with Barcelona and Spain',
    answer: 'XAVI',
    category: 'player',
    difficulty: 2,
    isProperNoun: true,
  },
  {
    clue: "Managed Real Madrid to two Champions League titles before guiding Spain to the 2010 World Cup",
    answer: 'DELBOSQUE',
    category: 'manager',
    difficulty: 4,
    isProperNoun: true,
  },
  {
    clue: 'Scored 323 goals across all competitions for Real Madrid',
    answer: 'RAUL',
    category: 'player',
    difficulty: 3,
    isProperNoun: true,
  },
  {
    clue: 'Captain and goalkeeper who won three Champions League titles with Real Madrid',
    answer: 'CASILLAS',
    category: 'player',
    difficulty: 2,
    isProperNoun: true,
  },
]

// ─── SERIE A (6) ──────────────────────────────────────────────────────────────

export const SERIE_A_SAMPLE: Question[] = [
  {
    clue: 'Won the Ballon d\'Or three times while at AC Milan — 1988, 1989, and 1992',
    answer: 'VANBASTEN',
    category: 'player',
    difficulty: 3,
    isProperNoun: true,
  },
  {
    clue: "Juventus's all-time top scorer",
    answer: 'DELPIERO',
    category: 'player',
    difficulty: 3,
    isProperNoun: true,
  },
  {
    clue: 'Won the 1994 World Cup and the Golden Ball as best player of the tournament',
    answer: 'ROMARIO',
    category: 'player',
    difficulty: 3,
    isProperNoun: true,
  },
  {
    clue: 'Guided Italy to the 2006 World Cup title',
    answer: 'LIPPI',
    category: 'manager',
    difficulty: 4,
    isProperNoun: true,
  },
  {
    clue: 'Broke the Serie A single-season goals record with 36 in 2015/16',
    answer: 'HIGUAIN',
    category: 'player',
    difficulty: 3,
    isProperNoun: true,
  },
  {
    clue: 'Made over 900 appearances for AC Milan across 25 seasons',
    answer: 'MALDINI',
    category: 'player',
    difficulty: 2,
    isProperNoun: true,
  },
]

// ─── BUNDESLIGA (5) ──────────────────────────────────────────────────────────

export const BUNDESLIGA_SAMPLE: Question[] = [
  {
    clue: "Bundesliga's all-time top scorer with 365 goals",
    answer: 'MULLER',
    category: 'player',
    difficulty: 2,
    isProperNoun: true,
  },
  {
    clue: "Broke Gerd Muller's 49-year-old Bundesliga single-season goals record in 2020/21",
    answer: 'LEWANDOWSKI',
    category: 'player',
    difficulty: 2,
    isProperNoun: true,
  },
  {
    clue: "Won back-to-back Bundesliga titles in 2010/11 and 2011/12 before Bayern Munich's decade of dominance began",
    answer: 'DORTMUND',
    category: 'club',
    difficulty: 2,
    isProperNoun: true,
  },
  {
    clue: 'Guided Borussia Dortmund to the 1997 Champions League title',
    answer: 'HITZFELD',
    category: 'manager',
    difficulty: 5,
    isProperNoun: true,
  },
  {
    clue: "Bayern Munich's home stadium, opened in 2005",
    answer: 'ALLIANZ',
    category: 'stadium',
    difficulty: 1,
    isProperNoun: true,
  },
]

// ─── LIGUE 1 (4) ─────────────────────────────────────────────────────────────

export const LIGUE_1_SAMPLE: Question[] = [
  {
    clue: "Scored 200 goals across all competitions for PSG before leaving in 2020",
    answer: 'CAVANI',
    category: 'player',
    difficulty: 3,
    isProperNoun: true,
  },
  {
    clue: "Marseille's home — the largest club stadium in France",
    answer: 'VELODROME',
    category: 'stadium',
    difficulty: 3,
    isProperNoun: false,
  },
  {
    clue: 'First French club to win the Champions League, in 1993',
    answer: 'MARSEILLE',
    category: 'club',
    difficulty: 2,
    isProperNoun: true,
  },
  {
    clue: 'Guided Monaco to the 2004 Champions League final',
    answer: 'DESCHAMPS',
    category: 'manager',
    difficulty: 4,
    isProperNoun: true,
  },
]

// ─── INTERNATIONAL / EUROS / COPA AMERICA (6) ────────────────────────────────

export const INTERNATIONAL_SAMPLE: Question[] = [
  {
    clue: "All-time men's international top scorer for Portugal",
    answer: 'RONALDO',
    category: 'player',
    difficulty: 1,
    isProperNoun: true,
  },
  {
    clue: 'Scored the winning goal in the Euro 2016 final for Portugal',
    answer: 'EDER',
    category: 'player',
    difficulty: 4,
    isProperNoun: true,
  },
  {
    clue: "Scored the original 'Panenka' penalty — a chipped finish in the 1976 European Championship final",
    answer: 'PANENKA',
    category: 'player',
    difficulty: 5,
    isProperNoun: true,
  },
  {
    clue: 'Guided Greece to a shock European Championship triumph in 2004',
    answer: 'REHHAGEL',
    category: 'manager',
    difficulty: 5,
    isProperNoun: true,
  },
  {
    clue: 'Scored the golden goal in the Euro 2000 final for France',
    answer: 'TREZEGUET',
    category: 'player',
    difficulty: 4,
    isProperNoun: true,
  },
  {
    clue: "Real Madrid's stadium, reopened after a major renovation",
    answer: 'BERNABEU',
    category: 'stadium',
    difficulty: 1,
    isProperNoun: true,
  },
]

// ─── OTHER (4) ────────────────────────────────────────────────────────────────

export const OTHER_SAMPLE: Question[] = [
  {
    clue: 'Dutch club that won three consecutive European Cups from 1971 to 1973',
    answer: 'AJAX',
    category: 'club',
    difficulty: 2,
    isProperNoun: true,
  },
  {
    clue: 'Stadium that hosted the 2014 World Cup final in Rio de Janeiro',
    answer: 'MARACANA',
    category: 'stadium',
    difficulty: 2,
    isProperNoun: true,
  },
  {
    clue: "Won the 2018 Ballon d'Or, ending Messi and Ronaldo's decade of dominance",
    answer: 'MODRIC',
    category: 'player',
    difficulty: 3,
    isProperNoun: true,
  },
  {
    clue: 'Managed Bayern Munich to the treble in 2012/13',
    answer: 'HEYNCKES',
    category: 'manager',
    difficulty: 4,
    isProperNoun: true,
  },
]

// ─── ALL SAMPLE QUESTIONS ────────────────────────────────────────────────────

export const ALL_SAMPLE_QUESTIONS: Question[] = [
  ...WORLD_CUP_SAMPLE,
  ...CHAMPIONS_LEAGUE_SAMPLE,
  ...LA_LIGA_SAMPLE,
  ...SERIE_A_SAMPLE,
  ...BUNDESLIGA_SAMPLE,
  ...LIGUE_1_SAMPLE,
  ...INTERNATIONAL_SAMPLE,
  ...OTHER_SAMPLE,
]
