import React from 'react';
import { Dumbbell, Footprints, Flame } from 'lucide-react';
import { DailyLog } from '../types';

interface Props {
  data: DailyLog;
  onChange: (updates: Partial<DailyLog>) => void;
}

interface ActivityRowProps {
  active: boolean;
  label: string;
  icon: React.ReactNode;
  calories: number;
  accent: 'orange' | 'purple';
  onToggle: (value: boolean) => void;
  onCalories: (value: number) => void;
}

const ACCENTS = {
  orange: {
    wrap: 'bg-orange-500/10 border-orange-500/25',
    icon: 'text-orange-500',
    toggle: 'peer-checked:bg-orange-500',
    input: 'focus:ring-orange-500/40',
  },
  purple: {
    wrap: 'bg-purple-500/10 border-purple-500/25',
    icon: 'text-purple-500',
    toggle: 'peer-checked:bg-purple-500',
    input: 'focus:ring-purple-500/40',
  },
};

const ActivityRow: React.FC<ActivityRowProps> = ({ active, label, icon, calories, accent, onToggle, onCalories }) => {
  const a = ACCENTS[accent];
  return (
    <div className={`p-4 rounded-xl border transition-all ${active ? a.wrap : 'bg-elevated border-line'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={active ? a.icon : 'text-faint'}>{icon}</span>
          <span className="font-medium text-content">{label}</span>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={active}
            onChange={(e) => onToggle(e.target.checked)}
          />
          <div
            className={`w-11 h-6 bg-line rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full ${a.toggle}`}
          />
        </label>
      </div>

      {active && (
        <div className="flex items-center gap-2 mt-3 animate-in fade-in slide-in-from-top-2">
          <span className="text-xs text-muted uppercase tracking-wide font-semibold">Calorias:</span>
          <input
            type="number"
            value={calories || ''}
            onChange={(e) => onCalories(parseInt(e.target.value) || 0)}
            placeholder="0"
            className={`w-full bg-surface border border-line rounded-md py-1 px-2 text-sm text-content focus:outline-none focus:ring-2 ${a.input}`}
          />
        </div>
      )}
    </div>
  );
};

const ExerciseTracker: React.FC<Props> = ({ data, onChange }) => {
  return (
    <div className="bg-surface p-6 rounded-2xl shadow-card border border-line h-full flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-orange-500/10 text-orange-500 rounded-lg">
          <Flame size={20} />
        </div>
        <h3 className="font-semibold text-content">Exercícios</h3>
      </div>

      <ActivityRow
        active={data.didRun}
        label="Corrida"
        icon={<Footprints size={18} />}
        calories={data.runCalories}
        accent="orange"
        onToggle={(checked) => onChange({ didRun: checked, runCalories: checked ? data.runCalories : 0 })}
        onCalories={(value) => onChange({ runCalories: value })}
      />

      <ActivityRow
        active={data.didGym}
        label="Academia"
        icon={<Dumbbell size={18} />}
        calories={data.gymCalories}
        accent="purple"
        onToggle={(checked) => onChange({ didGym: checked, gymCalories: checked ? data.gymCalories : 0 })}
        onCalories={(value) => onChange({ gymCalories: value })}
      />
    </div>
  );
};

export default ExerciseTracker;
