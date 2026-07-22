/**
 * Configurações do usuário persistidas localmente.
 * Centraliza valores que antes estavam "hardcoded" espalhados pelo código
 * (altura para IMC, meta de água), permitindo edição pela UI.
 */

const HEIGHT_KEY = 'habitflow_height_m';
const WATER_GOAL_KEY = 'habitflow_water_goal';

export const DEFAULT_HEIGHT_M = 1.79;
export const DEFAULT_WATER_GOAL_ML = 3000;

export const getHeight = (): number => {
  if (typeof window === 'undefined') return DEFAULT_HEIGHT_M;
  const saved = parseFloat(localStorage.getItem(HEIGHT_KEY) || '');
  return saved && saved > 0 ? saved : DEFAULT_HEIGHT_M;
};

export const setHeight = (meters: number): void => {
  if (meters > 0) localStorage.setItem(HEIGHT_KEY, String(meters));
};

export const getWaterGoal = (): number => {
  if (typeof window === 'undefined') return DEFAULT_WATER_GOAL_ML;
  const saved = parseInt(localStorage.getItem(WATER_GOAL_KEY) || '', 10);
  return saved && saved > 0 ? saved : DEFAULT_WATER_GOAL_ML;
};

export const setWaterGoal = (ml: number): void => {
  if (ml > 0) localStorage.setItem(WATER_GOAL_KEY, String(ml));
};

/** Classifica o IMC em faixa + rótulo + cor semântica (usada na UI). */
export const classifyBMI = (bmi: number) => {
  if (bmi < 18.5) return { label: 'Abaixo do peso', tone: 'blue' as const };
  if (bmi < 25) return { label: 'Peso normal', tone: 'emerald' as const };
  if (bmi < 30) return { label: 'Sobrepeso', tone: 'amber' as const };
  return { label: 'Obesidade', tone: 'red' as const };
};
