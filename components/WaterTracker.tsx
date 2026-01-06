import React, { useState, useEffect } from 'react';
import { Plus, Minus, Droplets, Settings } from 'lucide-react';
import { DailyLog } from '../types';

interface Props {
  data: DailyLog;
  onChange: (updates: Partial<DailyLog>) => void;
}

const WaterTracker: React.FC<Props> = ({ data, onChange }) => {
  // Estado local para o input de quantidade (padrão 250ml para facilitar)
  const [inputAmount, setInputAmount] = useState<string>('250');
  
  // Estado para a meta diária, persistido no localStorage
  const [goal, setGoal] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('habitflow_water_goal');
      return saved ? parseInt(saved, 10) : 3000;
    }
    return 3000;
  });
  
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState<string>(String(goal));

  useEffect(() => {
    localStorage.setItem('habitflow_water_goal', String(goal));
  }, [goal]);

  const handleUpdateWater = (multiplier: number) => {
    const amount = parseInt(inputAmount, 10);
    if (!amount || isNaN(amount)) return;
    
    onChange({ waterMl: Math.max(0, data.waterMl + (amount * multiplier)) });
  };

  const saveGoal = () => {
    const newGoal = parseInt(tempGoal, 10);
    if (newGoal && !isNaN(newGoal) && newGoal > 0) {
      setGoal(newGoal);
      setIsEditingGoal(false);
    }
  };

  const percentage = Math.min(100, (data.waterMl / goal) * 100);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full relative">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
            <Droplets size={20} />
            </div>
            <h3 className="font-semibold text-slate-800">Hidratação</h3>
        </div>
        <button 
            onClick={() => {
                setTempGoal(String(goal));
                setIsEditingGoal(!isEditingGoal);
            }}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-50 rounded-md"
            title="Definir meta diária"
        >
            <Settings size={18} />
        </button>
      </div>

      {isEditingGoal ? (
        <div className="mb-6 bg-slate-50 p-4 rounded-xl animate-in fade-in slide-in-from-top-2 border border-slate-200">
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Meta Diária (ml)</label>
            <div className="flex gap-2">
                <input 
                    type="number"
                    value={tempGoal}
                    onChange={(e) => setTempGoal(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
                    placeholder="Ex: 3000"
                />
                <button 
                    onClick={saveGoal}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                    OK
                </button>
            </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center mb-6">
            <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                    className="text-slate-100"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                />
                <path
                    className="text-blue-500 transition-all duration-500 ease-out"
                    strokeDasharray={`${percentage}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                />
                </svg>
                <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-bold text-slate-800">{data.waterMl}</span>
                    <span className="text-xs text-slate-500">de {goal}ml</span>
                </div>
            </div>
        </div>
      )}

      <div className="flex flex-col gap-3 mt-auto">
        <div className="relative">
            <input 
                type="number"
                value={inputAmount}
                onChange={(e) => setInputAmount(e.target.value)}
                placeholder="Qtd"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 pr-10 text-slate-700 font-medium text-center focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium pointer-events-none">ml</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
            <button 
            onClick={() => handleUpdateWater(-1)}
            className="flex items-center justify-center gap-1 py-2 px-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95"
            >
            <Minus size={16} /> Remover
            </button>
            <button 
            onClick={() => handleUpdateWater(1)}
            className="flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 hover:border-blue-200 transition-all active:scale-95"
            >
            <Plus size={16} /> Adicionar
            </button>
        </div>
      </div>
    </div>
  );
};

export default WaterTracker;