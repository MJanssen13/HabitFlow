import { DailyLog } from '../types';

const CSV_HEADERS = [
  'data',
  'peso_kg',
  'agua_ml',
  'correu',
  'calorias_corrida',
  'academia',
  'calorias_academia',
  'refeicoes_saudaveis',
  'refeicoes_inadequadas',
  'medicamentos_tomados',
  'notas',
];

const escapeCell = (value: unknown): string => {
  const s = value === null || value === undefined ? '' : String(value);
  // Envolve em aspas se contiver caractere especial de CSV
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** Converte a lista de registros diários numa string CSV (função pura, testável). */
export const logsToCsv = (logs: DailyLog[]): string => {
  const rows = logs.map((log) => {
    const meals = Object.values(log.meals);
    const healthy = meals.filter((m) => m === 'on_diet').length;
    const off = meals.filter((m) => m === 'off_diet').length;
    return [
      log.date,
      log.weight ?? '',
      log.waterMl,
      log.didRun ? 'sim' : 'nao',
      log.runCalories || 0,
      log.didGym ? 'sim' : 'nao',
      log.gymCalories || 0,
      healthy,
      off,
      (log.medsTaken ?? []).length,
      log.notes ?? '',
    ]
      .map(escapeCell)
      .join(',');
  });

  return [CSV_HEADERS.join(','), ...rows].join('\n');
};

/** Dispara o download do CSV no navegador. */
export const downloadCsv = (logs: DailyLog[], filename = 'habitflow.csv'): void => {
  const csv = logsToCsv(logs);
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
