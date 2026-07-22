import { describe, it, expect } from 'vitest';
import { DailyLog } from '../types';
import { logsToCsv } from './exportCsv';

const base: DailyLog = {
  date: '2026-07-22',
  weight: 82.5,
  waterMl: 3000,
  didRun: true,
  runCalories: 300,
  didGym: false,
  gymCalories: 0,
  meals: {
    breakfast: 'on_diet',
    morningSnack: 'on_diet',
    lunch: 'off_diet',
    afternoonSnack: 'skipped',
    dinner: 'skipped',
    supper: 'skipped',
  },
  medsTaken: [],
  notes: 'dia bom',
};

describe('logsToCsv', () => {
  it('inclui o cabeçalho', () => {
    const csv = logsToCsv([]);
    expect(csv.split('\n')[0]).toContain('data,peso_kg,agua_ml');
  });

  it('serializa uma linha com contagens de refeição corretas', () => {
    const csv = logsToCsv([base]);
    const row = csv.split('\n')[1];
    // 2 saudáveis, 1 inadequada, 0 medicamentos
    expect(row).toBe('2026-07-22,82.5,3000,sim,300,nao,0,2,1,0,dia bom');
  });

  it('escapa campos com vírgula/aspas', () => {
    const csv = logsToCsv([{ ...base, notes: 'comi "pizza", tarde' }]);
    const row = csv.split('\n')[1];
    expect(row).toContain('"comi ""pizza"", tarde"');
  });

  it('deixa peso vazio quando null', () => {
    const csv = logsToCsv([{ ...base, weight: null }]);
    const row = csv.split('\n')[1];
    expect(row).toBe('2026-07-22,,3000,sim,300,nao,0,2,1,0,dia bom');
  });
});
