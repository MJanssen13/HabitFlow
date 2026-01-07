import React from 'react';
import { Moon, Minus, Plus } from 'lucide-react';
import { DailyLog } from '../types';

interface Props {
  data: DailyLog;
  onChange: (updates: Partial<DailyLog>) => void;
}

const SleepTracker: React.FC<Props> = ({ data, onChange }) => {
  const currentSleep = data.sleepHours || 0;

  const updateSleep = (increment: number) => {
    let newValue = currentSleep + increment;
    if (newValue < 0) newValue = 0;
    if (newValue > 24) newValue = 24;
    onChange({ sleepHours: newValue === 0 ? null : newValue });
  };

  const getSleepQualityColor = (hours: number) => {
    if (hours === 0) return 'text-slate-300';
    if (hours < 5) return 'text-red-500';
    if (hours < 7) return 'text-orange-500';
    if (hours <= 9) return 'text-indigo-500';
    return 'text-blue-500'; // > 9
  };

  const getSleepMessage = (hours: number) => {
    if (hours === 0) return 'Horas';
    if (hours < 5) return 'Pouco sono';
    if (hours < 7) return 'Razoável';
    if (hours <= 9) return 'Ideal';
    return 'Hibernando';
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-full">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
          <Moon size={20} />
        </div>
        <h3 className="font-semibold text-slate-800">Sono</h3>
      </div>

      <div className="flex items-center justify-between mt-2">
        <div className="flex flex-col">
            <div className="flex items-end gap-1">
                <span className={`text-4xl font-bold transition-colors ${getSleepQualityColor(currentSleep)}`}>
                    {currentSleep > 0 ? currentSleep : '--'}
                </span>
                <span className="text-slate-400 font-medium mb-2 text-sm">h</span>
            </div>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">
                {getSleepMessage(currentSleep)}
            </span>
        </div>

        <div className="flex gap-2">
            <button 
                onClick={() => updateSleep(-0.5)}
                className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95"
                title="Reduzir 30min"
            >
                <Minus size={18} />
            </button>
            <button 
                onClick={() => updateSleep(0.5)}
                className="p-2 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 hover:bg-indigo-100 hover:border-indigo-200 transition-all active:scale-95"
                title="Adicionar 30min"
            >
                <Plus size={18} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default SleepTracker;