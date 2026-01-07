import React from 'react';
import { Utensils, Check, Ban, X } from 'lucide-react';
import { DailyLog, MealLog, MEAL_LABELS, MealStatus } from '../types';

interface Props {
  data: DailyLog;
  onChange: (updates: Partial<DailyLog>) => void;
}

const DietTracker: React.FC<Props> = ({ data, onChange }) => {
  const setMealStatus = (key: keyof MealLog, status: MealStatus) => {
    const currentStatus = data.meals[key];
    // Se clicar no mesmo botão, volta para 'skipped'
    const newStatus = currentStatus === status ? 'skipped' : status;
    
    const newMeals = { ...data.meals, [key]: newStatus };
    onChange({ meals: newMeals });
  };

  const healthyCount = Object.values(data.meals).filter(s => s === 'on_diet').length;
  const offDietCount = Object.values(data.meals).filter(s => s === 'off_diet').length;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
            <Utensils size={20} />
            </div>
            <h3 className="font-semibold text-slate-800">Dieta</h3>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium">
            <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                {healthyCount} Saudáveis
            </span>
            {offDietCount > 0 && (
                <span className="text-red-600 bg-red-50 px-2 py-1 rounded-md border border-red-100">
                    {offDietCount} Inadequadas
                </span>
            )}
        </div>
      </div>

      <div className="space-y-3">
        {(Object.keys(MEAL_LABELS) as Array<keyof MealLog>).map((key) => {
           const status = data.meals[key];
           return (
            <div key={key} className="flex items-center justify-between p-2 rounded-xl border border-slate-100 bg-slate-50/50">
                <span className="text-sm font-medium text-slate-700 pl-2">
                    {MEAL_LABELS[key]}
                </span>
                
                <div className="flex gap-1">
                    {/* Botão Refeição Inadequada */}
                    <button
                        onClick={() => setMealStatus(key, 'off_diet')}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border ${
                            status === 'off_diet'
                            ? 'bg-red-100 text-red-700 border-red-200 shadow-sm'
                            : 'bg-white text-slate-400 border-slate-200 hover:border-red-200 hover:text-red-400'
                        }`}
                        title="Refeição Inadequada"
                    >
                        <Utensils size={14} className={status === 'off_diet' ? 'fill-current' : ''} />
                        Inadequada
                    </button>

                    {/* Botão Refeição Adequada */}
                    <button
                        onClick={() => setMealStatus(key, 'on_diet')}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border ${
                            status === 'on_diet'
                            ? 'bg-emerald-100 text-emerald-700 border-emerald-200 shadow-sm'
                            : 'bg-white text-slate-400 border-slate-200 hover:border-emerald-200 hover:text-emerald-400'
                        }`}
                        title="Refeição Adequada"
                    >
                        <Check size={14} strokeWidth={3} />
                        Adequada
                    </button>
                </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DietTracker;