import { describe, it, expect } from 'vitest';
import { Medication, nowHHMM, duePendingMeds, allMedsTaken, medsProgress } from './medications';

const med = (id: string, time: string, enabled = true): Medication => ({ id, name: id, time, enabled });

describe('nowHHMM', () => {
  it('formata com zero à esquerda', () => {
    expect(nowHHMM(new Date(2026, 6, 22, 8, 5))).toBe('08:05');
    expect(nowHHMM(new Date(2026, 6, 22, 21, 30))).toBe('21:30');
  });
});

describe('duePendingMeds', () => {
  const meds = [med('a', '08:00'), med('b', '12:00'), med('c', '20:00'), med('d', '09:00', false)];

  it('retorna só os vencidos, não tomados e habilitados', () => {
    const due = duePendingMeds(meds, [], '12:30');
    expect(due.map((m) => m.id)).toEqual(['a', 'b']);
  });

  it('ignora os já tomados', () => {
    const due = duePendingMeds(meds, ['a'], '12:30');
    expect(due.map((m) => m.id)).toEqual(['b']);
  });

  it('ignora desabilitados mesmo vencidos', () => {
    const due = duePendingMeds(meds, [], '23:59');
    expect(due.map((m) => m.id)).toEqual(['a', 'b', 'c']); // 'd' está desabilitado
  });

  it('nada vencido antes do primeiro horário', () => {
    expect(duePendingMeds(meds, [], '07:00')).toEqual([]);
  });
});

describe('allMedsTaken', () => {
  const meds = [med('a', '08:00'), med('b', '12:00'), med('c', '20:00', false)];

  it('true quando todos os habilitados foram tomados', () => {
    expect(allMedsTaken(meds, ['a', 'b'])).toBe(true); // c é desabilitado
  });

  it('false quando falta algum habilitado', () => {
    expect(allMedsTaken(meds, ['a'])).toBe(false);
  });

  it('false quando não há medicamentos habilitados', () => {
    expect(allMedsTaken([med('x', '08:00', false)], [])).toBe(false);
  });
});

describe('medsProgress', () => {
  const meds = [med('a', '08:00'), med('b', '12:00')];

  it('calcula a fração tomada', () => {
    expect(medsProgress(meds, ['a'])).toBe(0.5);
    expect(medsProgress(meds, ['a', 'b'])).toBe(1);
  });

  it('null sem medicamentos habilitados', () => {
    expect(medsProgress([], [])).toBeNull();
  });
});
