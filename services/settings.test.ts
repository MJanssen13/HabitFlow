import { describe, it, expect } from 'vitest';
import { classifyBMI } from './settings';

describe('classifyBMI', () => {
  it('classifica cada faixa', () => {
    expect(classifyBMI(17).tone).toBe('blue'); // abaixo do peso
    expect(classifyBMI(22).tone).toBe('emerald'); // normal
    expect(classifyBMI(27).tone).toBe('amber'); // sobrepeso
    expect(classifyBMI(32).tone).toBe('red'); // obesidade
  });

  it('respeita os limites de faixa', () => {
    expect(classifyBMI(18.5).tone).toBe('emerald');
    expect(classifyBMI(25).tone).toBe('amber');
    expect(classifyBMI(30).tone).toBe('red');
  });
});
