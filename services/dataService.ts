import { DailyLog } from '../types';
import { supabase } from './supabaseClient';

const STORAGE_KEY = 'habitflow_data';

// Helper to get today in YYYY-MM-DD format
export const getTodayString = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const getEmptyLog = (date: string): DailyLog => ({
  date,
  weight: null,
  waterMl: 0,
  didRun: false,
  runCalories: 0,
  didGym: false,
  gymCalories: 0,
  meals: {
    breakfast: false,
    morningSnack: false,
    lunch: false,
    afternoonSnack: false,
    dinner: false,
    supper: false,
  },
});

// Detecta automaticamente se o Supabase está configurado
const isSupabaseConfigured = !!supabase;

export const fetchDailyLog = async (date: string): Promise<DailyLog> => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('date', date)
        .maybeSingle(); // maybeSingle evita erro se não existir registro

      if (error) throw error;
      
      if (data) {
        // Mapeia do banco (snake_case) para a aplicação (camelCase)
        return {
          date: data.date,
          weight: data.weight,
          waterMl: data.water_ml,
          didRun: data.did_run,
          runCalories: data.run_calories,
          didGym: data.did_gym,
          gymCalories: data.gym_calories,
          meals: data.meals || getEmptyLog(date).meals,
          notes: data.notes
        };
      }
    } catch (err) {
      console.error("Erro ao buscar no Supabase (usando fallback local):", err);
    }
  }

  // LocalStorage Fallback (funciona se Supabase falhar ou não estiver configurado)
  const stored = localStorage.getItem(STORAGE_KEY);
  const allLogs: Record<string, DailyLog> = stored ? JSON.parse(stored) : {};
  return allLogs[date] || getEmptyLog(date);
};

export const saveDailyLog = async (log: DailyLog): Promise<void> => {
  // 1. Salva no LocalStorage (sempre faz backup local)
  const stored = localStorage.getItem(STORAGE_KEY);
  const allLogs: Record<string, DailyLog> = stored ? JSON.parse(stored) : {};
  allLogs[log.date] = log;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allLogs));

  // 2. Salva no Supabase se configurado
  if (isSupabaseConfigured && supabase) {
    try {
      const dbPayload = {
        date: log.date,
        weight: log.weight,
        water_ml: log.waterMl,
        did_run: log.didRun,
        run_calories: log.runCalories,
        did_gym: log.didGym,
        gym_calories: log.gymCalories,
        meals: log.meals,
        notes: log.notes
      };

      const { error } = await supabase
        .from('daily_logs')
        .upsert(dbPayload, { onConflict: 'date' });

      if (error) throw error;
    } catch (err) {
      console.error("Erro ao salvar no Supabase:", err);
      // Não lançamos erro aqui para não travar a UI, já que salvou localmente
    }
  }
};

export const fetchAllHistory = async (): Promise<DailyLog[]> => {
    let logs: DailyLog[] = [];

    // Tenta buscar do Supabase
    if (isSupabaseConfigured && supabase) {
        try {
            const { data, error } = await supabase
                .from('daily_logs')
                .select('*')
                .order('date', { ascending: true });
            
            if (!error && data) {
                logs = data.map(d => ({
                    date: d.date,
                    weight: d.weight,
                    waterMl: d.water_ml,
                    didRun: d.did_run,
                    runCalories: d.run_calories,
                    didGym: d.did_gym,
                    gymCalories: d.gym_calories,
                    meals: d.meals || {},
                    notes: d.notes
                }));
            }
        } catch (e) {
            console.error("Erro ao carregar histórico do Supabase", e);
        }
    }

    // Se não tiver dados do Supabase (ou erro), tenta misturar ou usar LocalStorage
    if (logs.length === 0) {
        const stored = localStorage.getItem(STORAGE_KEY);
        const allLogs: Record<string, DailyLog> = stored ? JSON.parse(stored) : {};
        logs = Object.values(allLogs);
    }

    return logs.sort((a, b) => a.date.localeCompare(b.date));
}
