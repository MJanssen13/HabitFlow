import React from 'react';
import { Utensils, Check } from 'lucide-react';
import { DailyLog, MealLog, MEAL_LABELS } from '../types';

interface Props {
  data: DailyLog;
  onChange: (updates: Partial<DailyLog>) => void;
}

const DietTracker: React.FC<Props> = ({ data, onChange }) => {
  const toggleMeal = (key: keyof MealLog) => {
    const newMeals = { ...data.meals, [key]: !data.meals[key] };
    onChange({ meals: newMeals });
  };

  const completedCount = Object.values(data.meals).filter(Boolean).length;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
            <Utensils size={20} />
            </div>
            <h3 className="font-semibold text-slate-800">Dieta</h3>
        </div>
        <span className="text-sm font-medium bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md">
            {completedCount} / 6
        </span>
      </div>

      <div className="space-y-3">
        {(Object.keys(MEAL_LABELS) as Array<keyof MealLog>).map((key) => (
          <button
            key={key}
            onClick={() => toggleMeal(key)}
            className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${
              data.meals[key]
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-white border-slate-100 hover:border-slate-200'
            }`}
          >
            <span className={`text-sm font-medium ${data.meals[key] ? 'text-emerald-900' : 'text-slate-600'}`}>
              {MEAL_LABELS[key]}
            </span>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                data.meals[key] ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'
            }`}>
                {data.meals[key] && <Check size={12} className="text-white" />}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DietTracker;