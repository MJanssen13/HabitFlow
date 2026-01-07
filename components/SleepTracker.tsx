import React from 'react';
import { Moon } from 'lucide-react';
import { DailyLog } from '../types';

interface Props {
  data: DailyLog;
  onChange: (updates: Partial<DailyLog>) => void;
}

const SleepTracker: React.FC<Props> = ({ data, onChange }) => {
  const currentSleep = data.sleepHours || 0;

  // Converte decimal (ex: 7.5) para string de hora (ex: "07:30")
  const decimalToTimeString = (decimal: number | null): string => {
    if (decimal === null) return '';
    const hrs = Math.floor(decimal);
    const mins = Math.round((decimal - hrs) * 60);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  // Converte string de hora (ex: "07:30") para decimal (ex: 7.5)
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) {
        onChange({ sleepHours: null });
        return;
    }

    const [hoursStr, minsStr] = val.split(':');
    const hours = parseInt(hoursStr, 10);
    const mins = parseInt(minsStr, 10);
    
    // Converte minutos para fração de hora
    const decimalValue = hours + (mins / 60);
    
    onChange({ sleepHours: decimalValue });
  };

  const getSleepQualityColor = (hours: number | null) => {
    if (!hours || hours === 0) return 'text-slate-300';
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

      <div className="flex flex-col mt-2">
        <div className="flex items-end gap-1 mb-1">
            <input 
                type="time"
                value={decimalToTimeString(data.sleepHours)}
                onChange={handleTimeChange}
                className={`text-4xl font-bold bg-transparent border-b-2 border-transparent hover:border-slate-100 focus:border-indigo-500 focus:outline-none transition-colors ${getSleepQualityColor(data.sleepHours)} placeholder:text-slate-200 w-full cursor-pointer`}
                style={{ colorScheme: data.sleepHours && data.sleepHours > 0 ? 'light' : 'light' }} 
            />
        </div>
        <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">
            {getSleepMessage(currentSleep)}
        </span>
      </div>
    </div>
  );
};

export default SleepTracker;