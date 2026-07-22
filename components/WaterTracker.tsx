import React, { useState } from 'react';
import { Plus, Minus, Droplets, Settings, Check } from 'lucide-react';
import { DailyLog } from '../types';
import { getWaterGoal, setWaterGoal as persistWaterGoal } from '../services/settings';

interface Props {
  data: DailyLog;
  onChange: (updates: Partial<DailyLog>) => void;
}

const QUICK_ADD = [250, 500, 750];

const WaterTracker: React.FC<Props> = ({ data, onChange }) => {
  const [goal, setGoal] = useState<number>(() => getWaterGoal());
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState<string>(String(goal));

  const addWater = (amount: number) => {
    onChange({ waterMl: Math.max(0, data.waterMl + amount) });
  };

  const saveGoal = () => {
    const newGoal = parseInt(tempGoal, 10);
    if (newGoal && newGoal > 0) {
      persistWaterGoal(newGoal);
      setGoal(newGoal);
      setIsEditingGoal(false);
    }
  };

  const percentage = Math.min(100, (data.waterMl / goal) * 100);
  const remaining = Math.max(0, goal - data.waterMl);

  return (
    <div className="bg-surface p-6 rounded-2xl shadow-card border border-line flex flex-col h-full relative">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
            <Droplets size={20} />
          </div>
          <h3 className="font-semibold text-content">Hidratação</h3>
        </div>
        <button
          onClick={() => {
            setTempGoal(String(goal));
            setIsEditingGoal((v) => !v);
          }}
          className="text-faint hover:text-muted transition-colors p-1 hover:bg-elevated rounded-md"
          title="Definir meta diária"
        >
          <Settings size={18} />
        </button>
      </div>

      {isEditingGoal ? (
        <div className="mb-6 bg-elevated p-4 rounded-xl animate-in fade-in slide-in-from-top-2 border border-line">
          <label className="block text-xs font-semibold text-muted uppercase mb-2">Meta Diária (ml)</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={tempGoal}
              onChange={(e) => setTempGoal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveGoal()}
              className="w-full bg-surface border border-line rounded-lg px-3 py-2 text-sm text-content focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              placeholder="Ex: 3000"
            />
            <button
              onClick={saveGoal}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-1"
            >
              <Check size={16} /> OK
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center mb-6">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="rgb(var(--c-line))"
                strokeWidth="3"
              />
              <path
                className="transition-all duration-500 ease-out"
                strokeDasharray={`${percentage}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-bold text-content">{data.waterMl}</span>
              <span className="text-xs text-faint">de {goal}ml</span>
            </div>
          </div>
          <span className="text-xs text-muted mt-3">
            {remaining > 0 ? `Faltam ${remaining}ml` : 'Meta atingida! 💧'}
          </span>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 mt-auto">
        {QUICK_ADD.map((amount) => (
          <button
            key={amount}
            onClick={() => addWater(amount)}
            className="flex items-center justify-center gap-1 py-2.5 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 hover:bg-blue-500/20 transition-all active:scale-95 text-sm font-semibold"
          >
            <Plus size={14} /> {amount}
          </button>
        ))}
      </div>
      <button
        onClick={() => addWater(-250)}
        className="mt-2 flex items-center justify-center gap-1 py-2 rounded-xl border border-line text-muted hover:bg-elevated transition-all active:scale-95 text-sm font-medium"
      >
        <Minus size={14} /> Remover 250ml
      </button>
    </div>
  );
};

export default WaterTracker;
