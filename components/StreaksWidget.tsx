import React, { useEffect, useState } from 'react';
import { Flame, Droplets, Utensils, Dumbbell, Pill } from 'lucide-react';
import { fetchAllHistory, getTodayString } from '../services/dataService';
import { getWaterGoal } from '../services/settings';
import { computeCurrentStreak, streakPredicates } from '../services/stats';
import { Medication, allMedsTaken } from '../services/medications';
import { DailyLog } from '../types';

interface Props {
  refreshTrigger: number;
  medications?: Medication[];
}

interface StreakItem {
  key: string;
  label: string;
  days: number;
  icon: React.ReactNode;
  tint: string;
}

const StreaksWidget: React.FC<Props> = ({ refreshTrigger, medications = [] }) => {
  const [logs, setLogs] = useState<DailyLog[]>([]);

  useEffect(() => {
    fetchAllHistory().then(setLogs);
  }, [refreshTrigger]);

  const today = getTodayString();
  const goal = getWaterGoal();

  const hasMeds = medications.some((m) => m.enabled);

  const items: StreakItem[] = [
    { key: 'diet', label: 'Dieta', days: computeCurrentStreak(logs, today, streakPredicates.diet()), icon: <Utensils size={16} />, tint: 'text-emerald-500' },
    { key: 'water', label: 'Água', days: computeCurrentStreak(logs, today, streakPredicates.water(goal)), icon: <Droplets size={16} />, tint: 'text-blue-500' },
    { key: 'exercise', label: 'Exercício', days: computeCurrentStreak(logs, today, streakPredicates.exercise()), icon: <Dumbbell size={16} />, tint: 'text-purple-500' },
  ];

  if (hasMeds) {
    items.push({
      key: 'meds',
      label: 'Remédios',
      days: computeCurrentStreak(logs, today, (log) => allMedsTaken(medications, log.medsTaken ?? [])),
      icon: <Pill size={16} />,
      tint: 'text-rose-500',
    });
  }

  const best = Math.max(...items.map((i) => i.days), 0);

  return (
    <div className="bg-surface rounded-2xl shadow-card border border-line p-4 flex items-center gap-4 overflow-x-auto">
      <div className="flex items-center gap-2 shrink-0 pr-4 border-r border-line">
        <div className={`p-2 rounded-lg ${best > 0 ? 'bg-orange-500/10 text-orange-500' : 'bg-elevated text-faint'}`}>
          <Flame size={20} className={best > 0 ? 'fill-current' : ''} />
        </div>
        <div className="leading-tight">
          <div className="text-xs text-muted font-medium">Sequência</div>
          <div className="text-sm font-bold text-content">{best > 0 ? `${best} ${best === 1 ? 'dia' : 'dias'}` : 'Comece hoje'}</div>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        {items.map((it) => (
          <div key={it.key} className="flex items-center gap-2 shrink-0">
            <span className={it.days > 0 ? it.tint : 'text-faint'}>{it.icon}</span>
            <div className="leading-tight">
              <div className="text-sm font-bold text-content">
                {it.days}
                <span className="text-xs font-normal text-faint"> {it.days === 1 ? 'dia' : 'dias'}</span>
              </div>
              <div className="text-[11px] text-muted">{it.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StreaksWidget;
