import { describe, it, expect } from 'vitest';
import { DailyLog, MealStatus } from '../types';
import { addDays, dayDietAdherence, computeCurrentStreak, streakPredicates } from './stats';

const makeLog = (date: string, over: Partial<DailyLog> = {}): DailyLog => ({
  date,
  weight: null,
  waterMl: 0,
  didRun: false,
  runCalories: 0,
  didGym: false,
  gymCalories: 0,
  meals: {
    breakfast: 'skipped',
    morningSnack: 'skipped',
    lunch: 'skipped',
    afternoonSnack: 'skipped',
    dinner: 'skipped',
    supper: 'skipped',
  },
  medsTaken: [],
  ...over,
});

const meals = (...statuses: MealStatus[]): DailyLog['meals'] => {
  const keys = ['breakfast', 'morningSnack', 'lunch', 'afternoonSnack', 'dinner', 'supper'] as const;
  const base = makeLog('x').meals;
  keys.forEach((k, i) => { if (statuses[i]) base[k] = statuses[i]; });
  return base;
};

describe('addDays', () => {
  it('avança e retrocede dias corretamente', () => {
    expect(addDays('2026-07-22', -1)).toBe('2026-07-21');
    expect(addDays('2026-07-22', 1)).toBe('2026-07-23');
  });

  it('cruza fronteira de mês', () => {
    expect(addDays('2026-07-01', -1)).toBe('2026-06-30');
    expect(addDays('2026-02-28', 1)).toBe('2026-03-01'); // 2026 não é bissexto
  });
});

describe('dayDietAdherence', () => {
  it('retorna null quando nada foi registrado', () => {
    expect(dayDietAdherence(makeLog('2026-07-22'))).toBeNull();
  });

  it('calcula a proporção de refeições saudáveis', () => {
    const log = makeLog('2026-07-22', { meals: meals('on_diet', 'on_diet', 'off_diet') });
    expect(dayDietAdherence(log)).toBeCloseTo(2 / 3);
  });
});

describe('computeCurrentStreak', () => {
  const today = '2026-07-22';

  it('conta dias consecutivos terminando hoje', () => {
    const logs = [
      makeLog('2026-07-20', { didRun: true }),
      makeLog('2026-07-21', { didGym: true }),
      makeLog('2026-07-22', { didRun: true }),
    ];
    expect(computeCurrentStreak(logs, today, streakPredicates.exercise())).toBe(3);
  });

  it('quebra a sequência num dia faltante', () => {
    const logs = [
      makeLog('2026-07-19', { didRun: true }),
      // 20 faltando
      makeLog('2026-07-21', { didGym: true }),
      makeLog('2026-07-22', { didRun: true }),
    ];
    expect(computeCurrentStreak(logs, today, streakPredicates.exercise())).toBe(2);
  });

  it('dá "dia de graça" quando hoje ainda não satisfaz', () => {
    const logs = [
      makeLog('2026-07-20', { didRun: true }),
      makeLog('2026-07-21', { didGym: true }),
      // hoje sem registro de exercício ainda
      makeLog('2026-07-22'),
    ];
    expect(computeCurrentStreak(logs, today, streakPredicates.exercise())).toBe(2);
  });

  it('retorna 0 quando não há sequência', () => {
    const logs = [makeLog('2026-07-10', { didRun: true })];
    expect(computeCurrentStreak(logs, today, streakPredicates.exercise())).toBe(0);
  });

  it('usa a meta na streak de água', () => {
    const logs = [
      makeLog('2026-07-21', { waterMl: 3000 }),
      makeLog('2026-07-22', { waterMl: 3200 }),
    ];
    expect(computeCurrentStreak(logs, today, streakPredicates.water(3000))).toBe(2);
    expect(computeCurrentStreak(logs, today, streakPredicates.water(3500))).toBe(0);
  });
});
