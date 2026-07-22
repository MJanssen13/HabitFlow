import { useEffect, useRef } from 'react';
import { Medication, duePendingMeds, nowHHMM } from '../services/medications';
import { getPermission, showNotification } from '../services/notifications';
import { getTodayString } from '../services/dataService';

const notifiedKey = (date: string) => `habitflow_notified_${date}`;

const getNotified = (date: string): string[] => {
  try {
    const raw = localStorage.getItem(notifiedKey(date));
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
};

const markNotified = (date: string, id: string) => {
  const current = getNotified(date);
  if (!current.includes(id)) {
    localStorage.setItem(notifiedKey(date), JSON.stringify([...current, id]));
  }
};

/**
 * Enquanto o app estiver aberto, verifica a cada minuto se algum medicamento
 * de hoje já passou do horário e ainda não foi tomado; se sim, dispara uma
 * notificação (uma vez por medicamento por dia).
 *
 * Observação: lembretes com o app totalmente fechado exigem Web Push + backend
 * (ver PROPOSTA.md). Este hook cobre app aberto/em segundo plano.
 */
export const useMedicationReminders = (medications: Medication[], takenIds: string[], dateStr: string) => {
  const medsRef = useRef(medications);
  const takenRef = useRef(takenIds);
  medsRef.current = medications;
  takenRef.current = takenIds;

  useEffect(() => {
    // Só faz sentido lembrar sobre o dia de hoje.
    if (dateStr !== getTodayString()) return;
    if (getPermission() !== 'granted') return;

    const check = () => {
      const today = getTodayString();
      if (dateStr !== today) return;
      const now = nowHHMM(new Date());
      const alreadyNotified = getNotified(today);
      const due = duePendingMeds(medsRef.current, takenRef.current, now).filter(
        (m) => !alreadyNotified.includes(m.id),
      );

      due.forEach((m) => {
        markNotified(today, m.id);
        showNotification(`Hora do medicamento: ${m.name}`, {
          body: 'Toque para abrir o HabitFlow e marcar como tomado.',
          tag: `med-${m.id}`,
        });
      });
    };

    check(); // checagem imediata ao montar
    const interval = setInterval(check, 60_000);
    return () => clearInterval(interval);
    // Reavalia quando muda o dia ou a lista de medicamentos (horários).
  }, [dateStr, medications]);
};
