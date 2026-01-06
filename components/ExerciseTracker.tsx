import React from 'react';
import { Dumbbell, Footprints, Flame } from 'lucide-react';
import { DailyLog } from '../types';

interface Props {
  data: DailyLog;
  onChange: (updates: Partial<DailyLog>) => void;
}

const ExerciseTracker: React.FC<Props> = ({ data, onChange }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
          <Flame size={20} />
        </div>
        <h3 className="font-semibold text-slate-800">Exercícios</h3>
      </div>

      {/* Running Section */}
      <div className={`p-4 rounded-xl border transition-all ${data.didRun ? 'bg-orange-50 border-orange-200' : 'bg-slate-50 border-slate-100'}`}>
        <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
                <Footprints size={18} className={data.didRun ? 'text-orange-500' : 'text-slate-400'} />
                <span className="font-medium text-slate-700">Corrida</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
                <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={data.didRun}
                    onChange={(e) => onChange({ didRun: e.target.checked, runCalories: e.target.checked ? data.runCalories : 0 })}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
        </div>
        
        {data.didRun && (
             <div className="flex items-center gap-2 mt-2 animate-in fade-in slide-in-from-top-2">
                <span className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Calorias:</span>
                <input 
                    type="number"
                    value={data.runCalories || ''}
                    onChange={(e) => onChange({ runCalories: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    className="w-full bg-white border border-orange-200 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                />
            </div>
        )}
      </div>

      {/* Gym Section */}
      <div className={`p-4 rounded-xl border transition-all ${data.didGym ? 'bg-purple-50 border-purple-200' : 'bg-slate-50 border-slate-100'}`}>
        <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
                <Dumbbell size={18} className={data.didGym ? 'text-purple-500' : 'text-slate-400'} />
                <span className="font-medium text-slate-700">Academia</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
                <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={data.didGym}
                    onChange={(e) => onChange({ didGym: e.target.checked, gymCalories: e.target.checked ? data.gymCalories : 0 })}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
        </div>

        {data.didGym && (
             <div className="flex items-center gap-2 mt-2 animate-in fade-in slide-in-from-top-2">
                <span className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Calorias:</span>
                <input 
                    type="number"
                    value={data.gymCalories || ''}
                    onChange={(e) => onChange({ gymCalories: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    className="w-full bg-white border border-purple-200 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                />
            </div>
        )}
      </div>

    </div>
  );
};

export default ExerciseTracker;