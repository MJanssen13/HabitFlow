import { DailyLog } from '../types';

/**
 * Funções estatísticas puras (sem I/O) — fáceis de testar isoladamente.
 */

/** Adiciona/subtrai dias a uma data 'YYYY-MM-DD', retornando outra string 'YYYY-MM-DD'.
 *  Usa UTC para ser independente do fuso horário. */
export const addDays = (dateStr: string, days: number): string => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().split('T')[0];
};

/** Adesão à dieta de um dia: refeições saudáveis / refeições registradas (0..1). null se nada registrado. */
export const dayDietAdherence = (log: DailyLog): number | null => {
  let healthy = 0;
  let total = 0;
  Object.values(log.meals).forEach((s) => {
    if (s === 'on_diet') { healthy++; total++; }
    else if (s === 'off_diet') { total++; }
  });
  return total > 0 ? healthy / total : null;
};

export type StreakPredicate = (log: DailyLog) => boolean;

/**
 * Sequência atual: nº de dias de calendário consecutivos, terminando em `today`,
 * em que o predicado é verdadeiro. O dia de hoje ainda "em aberto" (sem registro
 * ou registro que ainda não satisfaz) não quebra a sequência — apenas não conta.
 */
export const computeCurrentStreak = (
  logs: DailyLog[],
  today: string,
  predicate: StreakPredicate,
): number => {
  const byDate = new Map(logs.map((l) => [l.date, l]));
  let streak = 0;
  let cursor = today;
  let first = true;

  // Se hoje ainda não satisfaz, começamos a contagem a partir de ontem (dia de graça).
  const todayLog = byDate.get(today);
  if (!todayLog || !predicate(todayLog)) {
    cursor = addDays(today, -1);
    first = false;
  }

  // Percorre para trás enquanto houver dias consecutivos satisfazendo o predicado.
  // Limite de segurança para evitar laços muito longos.
  for (let i = 0; i < 3660; i++) {
    const log = byDate.get(cursor);
    if (log && predicate(log)) {
      streak++;
      cursor = addDays(cursor, -1);
      first = false;
    } else {
      break;
    }
  }

  void first;
  return streak;
};

/** Predicados prontos para os hábitos de saúde. */
export const streakPredicates = {
  water: (goalMl: number): StreakPredicate => (log) => log.waterMl >= goalMl,
  exercise: (): StreakPredicate => (log) => log.didRun || log.didGym,
  diet:
    (threshold = 0.7): StreakPredicate =>
    (log) => {
      const a = dayDietAdherence(log);
      return a !== null && a >= threshold;
    },
};
