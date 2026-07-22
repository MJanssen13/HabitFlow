import React from 'react';
import { Droplets, Utensils, Flame, Scale } from 'lucide-react';
import { DailyLog } from '../types';
import { getWaterGoal } from '../services/settings';
import ProgressRing from './ProgressRing';

interface Props {
  data: DailyLog;
}

interface Metric {
  key: string;
  label: string;
  pct: number;
  icon: React.ReactNode;
  tint: string;
}

/**
 * Cabeçalho da aba Diário: mostra o progresso geral do dia num anel grande
 * e o detalhamento por área (água, dieta, exercício, peso).
 */
const DailySummary: React.FC<Props> = ({ data }) => {
  const goal = getWaterGoal();

  const waterPct = Math.min(100, (data.waterMl / goal) * 100);

  const mealValues = Object.values(data.meals);
  const onDiet = mealValues.filter((s) => s === 'on_diet').length;
  const dietPct = (onDiet / mealValues.length) * 100;

  const exercisePct = data.didRun || data.didGym ? 100 : 0;
  const weightPct = data.weight ? 100 : 0;

  const overall = Math.round((waterPct + dietPct + exercisePct + weightPct) / 4);

  const metrics: Metric[] = [
    { key: 'water', label: 'Água', pct: Math.round(waterPct), icon: <Droplets size={16} />, tint: 'text-blue-500' },
    { key: 'diet', label: 'Dieta', pct: Math.round(dietPct), icon: <Utensils size={16} />, tint: 'text-emerald-500' },
    { key: 'exercise', label: 'Exercício', pct: exercisePct, icon: <Flame size={16} />, tint: 'text-orange-500' },
    { key: 'weight', label: 'Peso', pct: weightPct, icon: <Scale size={16} />, tint: 'text-indigo-500' },
  ];

  const message =
    overall >= 100
      ? 'Dia completo! Excelente. 🎉'
      : overall >= 60
      ? 'Bom ritmo, continue assim.'
      : overall > 0
      ? 'Você começou — vamos em frente.'
      : 'Registre seu primeiro hábito de hoje.';

  return (
    <div className="bg-surface rounded-2xl shadow-card border border-line p-6 flex flex-col sm:flex-row items-center gap-6">
      <ProgressRing percentage={overall} size={128} strokeWidth={11}>
        <div className="flex flex-col items-center">
          <span className="text-3xl font-extrabold text-content leading-none">{overall}%</span>
          <span className="text-[11px] font-medium text-faint uppercase tracking-wide mt-1">do dia</span>
        </div>
      </ProgressRing>

      <div className="flex-1 w-full">
        <p className="text-sm text-muted mb-4">{message}</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {metrics.map((m) => (
            <div key={m.key} className="bg-elevated rounded-xl border border-line p-3 flex flex-col gap-1.5">
              <div className={`flex items-center gap-1.5 ${m.tint}`}>
                {m.icon}
                <span className="text-xs font-semibold text-muted">{m.label}</span>
              </div>
              <span className="text-lg font-bold text-content">{m.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DailySummary;
