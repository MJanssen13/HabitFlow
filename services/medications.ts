/**
 * Medicamentos do usuário: a *lista* (nome + horário) fica no localStorage,
 * e o que foi *tomado* em cada dia vai em `DailyLog.medsTaken`.
 */

export interface Medication {
  id: string;
  name: string;
  time: string; // 'HH:MM' — horário do lembrete
  enabled: boolean;
}

const STORAGE_KEY = 'habitflow_medications';

const genId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return 'med_' + Math.floor(performance.now()).toString(36) + Math.floor(performance.now() % 1000).toString(36);
};

export const getMedications = (): Medication[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list = raw ? (JSON.parse(raw) as Medication[]) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
};

export const saveMedications = (meds: Medication[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(meds));
};

export const createMedication = (name: string, time: string): Medication => ({
  id: genId(),
  name: name.trim(),
  time,
  enabled: true,
});

// ---- Helpers puros (testáveis) ----

/** Horário atual como 'HH:MM'. */
export const nowHHMM = (date: Date): string => {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
};

/**
 * Medicamentos "vencidos" ainda não tomados: habilitados, com horário <= agora
 * e cujo id não está em `takenIds`.
 */
export const duePendingMeds = (meds: Medication[], takenIds: string[], now: string): Medication[] =>
  meds.filter((m) => m.enabled && m.time <= now && !takenIds.includes(m.id));

/** Todos os medicamentos habilitados foram tomados? (false se não houver nenhum habilitado) */
export const allMedsTaken = (meds: Medication[], takenIds: string[]): boolean => {
  const enabled = meds.filter((m) => m.enabled);
  return enabled.length > 0 && enabled.every((m) => takenIds.includes(m.id));
};

/** Progresso do dia em medicamentos (0..1), ou null se não houver medicamentos habilitados. */
export const medsProgress = (meds: Medication[], takenIds: string[]): number | null => {
  const enabled = meds.filter((m) => m.enabled);
  if (enabled.length === 0) return null;
  const taken = enabled.filter((m) => takenIds.includes(m.id)).length;
  return taken / enabled.length;
};
